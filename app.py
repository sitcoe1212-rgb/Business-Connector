import json
import os
from datetime import datetime, timedelta

import boto3
import jwt
from flask import Flask, jsonify, request
from flask_cors import CORS
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from werkzeug.security import check_password_hash, generate_password_hash

from models import Base, OtpSession, User
from utils import expires_in_minutes, gen_otp, hash_text, normalize_phone, new_token, verify_hash

MYSQL_URL = os.getenv("MYSQL_URL", "mysql+pymysql://root:password@localhost:3306/farmconnect")
JWT_SECRET = os.getenv("JWT_SECRET", "change_this_secret")
JWT_EXPIRES_MIN = int(os.getenv("JWT_EXPIRES_MIN", "120"))

AWS_REGION = os.getenv("AWS_REGION", "ap-south-1")
SNS_SENDER_ID = os.getenv("SNS_SENDER_ID", "FARMAPP")
SNS_SMS_TYPE = os.getenv("SNS_SMS_TYPE", "Transactional")

OTP_EXP_MIN = int(os.getenv("OTP_EXP_MIN", "5"))
OTP_MAX_ATTEMPTS = int(os.getenv("OTP_MAX_ATTEMPTS", "5"))

ALLOWED_ROLES = {"farmer", "dealer", "admin", "government"}

app = Flask(__name__)
CORS(app, supports_credentials=True)

engine = create_engine(MYSQL_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


def init_db():
    Base.metadata.create_all(engine)


def sns_client():
    return boto3.client("sns", region_name=AWS_REGION)


def send_sms(phone: str, message: str):
    attrs = {
        "AWS.SNS.SMS.SMSType": {"DataType": "String", "StringValue": SNS_SMS_TYPE},
    }
    if SNS_SENDER_ID:
        attrs["AWS.SNS.SMS.SenderID"] = {"DataType": "String", "StringValue": SNS_SENDER_ID}

    sns_client().publish(
        PhoneNumber=phone,
        Message=message,
        MessageAttributes=attrs,
    )


def now_utc():
    return datetime.utcnow()


def jwt_token(user: User):
    payload = {
        "sub": str(user.id),
        "role": user.role,
        "username": user.username,
        "exp": now_utc() + timedelta(minutes=JWT_EXPIRES_MIN),
        "iat": now_utc(),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")


def json_error(msg, code=400):
    return jsonify({"ok": False, "error": msg}), code


def validate_role(role):
    return role in ALLOWED_ROLES


def password_ok(password: str) -> bool:
    return len(password) >= 8 and any(char.isdigit() for char in password) and any(
        char.isalpha() for char in password
    )


def load_payload(session: OtpSession):
    if not session.payload_json:
        return {}
    return json.loads(session.payload_json)


@app.post("/api/auth/register/initiate")
def register_initiate():
    data = request.get_json() or {}
    role = (data.get("role") or "").strip().lower()
    full_name = (data.get("full_name") or "").strip()
    username = (data.get("username") or "").strip()
    email = (data.get("email") or "").strip().lower()
    phone = normalize_phone(data.get("phone"))
    password = (data.get("password") or "").strip()

    if not validate_role(role):
        return json_error("Invalid role.")
    if not full_name or not username or not email or not phone or not password:
        return json_error("All fields are required.")
    if not password_ok(password):
        return json_error("Password must be at least 8 characters and include a letter and number.")

    db = SessionLocal()
    try:
        if db.query(User).filter(User.username == username).first():
            return json_error("Username already exists.", 409)
        if db.query(User).filter(User.email == email).first():
            return json_error("Email already exists.", 409)

        token = new_token()
        otp_code = gen_otp()
        payload = {
            "role": role,
            "full_name": full_name,
            "username": username,
            "email": email,
            "phone": phone,
            "password_hash": generate_password_hash(password),
        }
        otp_session = OtpSession(
            token=token,
            purpose="register",
            role=role,
            username=username,
            phone=phone,
            otp_hash=hash_text(otp_code),
            payload_json=json.dumps(payload),
            expires_at=expires_in_minutes(OTP_EXP_MIN),
        )
        db.add(otp_session)
        db.commit()

        send_sms(phone, f"Your Business Connector OTP is {otp_code}. Valid for {OTP_EXP_MIN} minutes.")
        return jsonify({"ok": True, "message": "OTP sent", "token": token}), 200
    except Exception as exc:
        db.rollback()
        return json_error(f"Registration initiation failed: {str(exc)}", 500)
    finally:
        db.close()


@app.post("/api/auth/register/verify")
def register_verify():
    data = request.get_json() or {}
    token = (data.get("token") or "").strip()
    otp_code = (data.get("otp") or "").strip()

    if not token or not otp_code:
        return json_error("token and otp are required.")

    db = SessionLocal()
    try:
        session = (
            db.query(OtpSession)
            .filter(OtpSession.token == token, OtpSession.purpose == "register")
            .first()
        )
        if not session:
            return json_error("OTP session not found.", 404)
        if session.consumed:
            return json_error("OTP already used.", 410)
        if session.expires_at < now_utc():
            return json_error("OTP expired. Request a new code.", 410)
        if session.attempts >= OTP_MAX_ATTEMPTS:
            return json_error("Too many attempts. Request a new OTP.", 429)

        session.attempts += 1
        if not verify_hash(session.otp_hash, otp_code):
            db.commit()
            return json_error("Invalid OTP.", 401)

        payload = load_payload(session)
        user = User(
            role=payload.get("role"),
            full_name=payload.get("full_name"),
            username=payload.get("username"),
            email=payload.get("email"),
            phone=payload.get("phone"),
            password_hash=payload.get("password_hash"),
            is_phone_verified=True,
        )
        db.add(user)
        session.consumed = True
        session.consumed_at = now_utc()
        db.commit()

        return (
            jsonify(
                {
                    "ok": True,
                    "message": "Registered successfully",
                    "user": {
                        "id": user.id,
                        "role": user.role,
                        "username": user.username,
                        "full_name": user.full_name,
                    },
                }
            ),
            201,
        )
    except Exception as exc:
        db.rollback()
        return json_error(f"Registration verify failed: {str(exc)}", 500)
    finally:
        db.close()


@app.post("/api/auth/login")
def login():
    data = request.get_json() or {}
    identifier = (data.get("identifier") or "").strip()
    password = (data.get("password") or "").strip()
    role = (data.get("role") or "").strip().lower()

    if not identifier or not password:
        return json_error("identifier and password are required.")
    if role and not validate_role(role):
        return json_error("Invalid role.")

    db = SessionLocal()
    try:
        query = db.query(User)
        if "@" in identifier:
            query = query.filter(User.email == identifier.lower())
        else:
            query = query.filter(User.username == identifier)
        if role:
            query = query.filter(User.role == role)

        user = query.first()
        if not user:
            return json_error("Invalid credentials.", 401)
        if not check_password_hash(user.password_hash, password):
            return json_error("Invalid credentials.", 401)
        if user.status != "active":
            return json_error("Account is inactive.", 403)

        user.last_login_at = now_utc()
        token = jwt_token(user)
        db.commit()

        return (
            jsonify(
                {
                    "ok": True,
                    "token": token,
                    "user": {
                        "id": user.id,
                        "role": user.role,
                        "username": user.username,
                        "full_name": user.full_name,
                        "email": user.email,
                    },
                }
            ),
            200,
        )
    finally:
        db.close()


@app.post("/api/auth/forgot/initiate")
def forgot_initiate():
    data = request.get_json() or {}
    identifier = (data.get("identifier") or "").strip()
    role = (data.get("role") or "").strip().lower()

    if not identifier:
        return json_error("identifier is required.")
    if role and not validate_role(role):
        return json_error("Invalid role.")

    db = SessionLocal()
    try:
        query = db.query(User)
        if "@" in identifier:
            query = query.filter(User.email == identifier.lower())
        else:
            query = query.filter(User.username == identifier)
        if role:
            query = query.filter(User.role == role)

        user = query.first()
        if not user:
            return json_error("User not found.", 404)

        token = new_token()
        otp_code = gen_otp()
        session = OtpSession(
            token=token,
            purpose="forgot",
            role=user.role,
            username=user.username,
            user_id=user.id,
            phone=user.phone or "",
            otp_hash=hash_text(otp_code),
            payload_json=json.dumps({"user_id": user.id}),
            expires_at=expires_in_minutes(OTP_EXP_MIN),
        )
        db.add(session)
        db.commit()

        if user.phone:
            send_sms(user.phone, f"Your Business Connector reset OTP is {otp_code}.")
        return jsonify({"ok": True, "message": "OTP sent", "token": token}), 200
    except Exception as exc:
        db.rollback()
        return json_error(f"OTP send failed: {str(exc)}", 500)
    finally:
        db.close()


@app.post("/api/auth/forgot/verify")
def forgot_verify():
    data = request.get_json() or {}
    token = (data.get("token") or "").strip()
    otp_code = (data.get("otp") or "").strip()

    if not token or not otp_code:
        return json_error("token and otp are required.")

    db = SessionLocal()
    try:
        session = (
            db.query(OtpSession)
            .filter(OtpSession.token == token, OtpSession.purpose == "forgot")
            .first()
        )
        if not session:
            return json_error("OTP session not found.", 404)
        if session.consumed:
            return json_error("OTP already used.", 410)
        if session.expires_at < now_utc():
            return json_error("OTP expired. Request a new code.", 410)
        if session.attempts >= OTP_MAX_ATTEMPTS:
            return json_error("Too many attempts. Request a new OTP.", 429)

        session.attempts += 1
        if not verify_hash(session.otp_hash, otp_code):
            db.commit()
            return json_error("Invalid OTP.", 401)

        session.consumed = True
        session.consumed_at = now_utc()
        db.commit()

        payload = load_payload(session)
        reset_payload = {
            "sub": str(payload.get("user_id")),
            "purpose": "reset_password",
            "exp": now_utc() + timedelta(minutes=10),
            "iat": now_utc(),
        }
        reset_token = jwt.encode(reset_payload, JWT_SECRET, algorithm="HS256")

        return jsonify({"ok": True, "message": "OTP verified", "reset_token": reset_token}), 200
    finally:
        db.close()


@app.post("/api/auth/forgot/reset")
def forgot_reset():
    data = request.get_json() or {}
    reset_token = (data.get("reset_token") or "").strip()
    new_password = (data.get("new_password") or "").strip()

    if not reset_token or not new_password:
        return json_error("reset_token and new_password are required.")
    if not password_ok(new_password):
        return json_error("Password must be at least 8 characters and include a letter and number.")

    try:
        payload = jwt.decode(reset_token, JWT_SECRET, algorithms=["HS256"])
        if payload.get("purpose") != "reset_password":
            return json_error("Invalid reset token.", 401)
        user_id = int(payload["sub"])
    except Exception:
        return json_error("Invalid/expired reset token.", 401)

    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return json_error("User not found.", 404)

        user.password_hash = generate_password_hash(new_password)
        db.commit()
        return jsonify({"ok": True, "message": "Password updated successfully"}), 200
    except Exception as exc:
        db.rollback()
        return json_error(f"Reset password failed: {str(exc)}", 500)
    finally:
        db.close()


if __name__ == "__main__":
    init_db()
    app.run(host="0.0.0.0", port=5000, debug=True)
