# backend/app.py
import os
import random
from datetime import datetime, timedelta

import jwt
import boto3
from flask import Flask, request, jsonify
from flask_cors import CORS
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from werkzeug.security import generate_password_hash, check_password_hash

from models import Base, User, OtpCode

# =========================
# CONFIG (env variables)
# =========================
MYSQL_URL = os.getenv("MYSQL_URL", "mysql+pymysql://root:password@localhost:3306/farmconnect")

JWT_SECRET = os.getenv("JWT_SECRET", "change_this_secret")
JWT_EXPIRES_MIN = int(os.getenv("JWT_EXPIRES_MIN", "120"))

AWS_REGION = os.getenv("AWS_REGION", "ap-south-1")
SNS_SENDER_ID = os.getenv("SNS_SENDER_ID", "FARMAPP")  # optional
SNS_SMS_TYPE = os.getenv("SNS_SMS_TYPE", "Transactional")  # Transactional / Promotional

OTP_EXP_MIN = int(os.getenv("OTP_EXP_MIN", "5"))
OTP_MAX_ATTEMPTS = int(os.getenv("OTP_MAX_ATTEMPTS", "5"))

# Only these roles must use SMS verification
OTP_REQUIRED_ROLES = {"farmer", "dealer"}

ALLOWED_ROLES = {"farmer", "dealer", "admin", "government"}

# =========================
# APP + DB
# =========================
app = Flask(__name__)
CORS(app, supports_credentials=True)

engine = create_engine(MYSQL_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

def init_db():
    Base.metadata.create_all(engine)

# =========================
# AWS SNS
# =========================
def sns_client():
    # Uses AWS credentials from env/CLI/profile/EC2 role
    return boto3.client("sns", region_name=AWS_REGION)

def send_sms(phone: str, message: str):
    # NOTE: Phone must be E.164 format like +91XXXXXXXXXX
    attrs = {
        "AWS.SNS.SMS.SMSType": {"DataType": "String", "StringValue": SNS_SMS_TYPE},
    }
    # SenderID works in some regions; harmless if ignored
    if SNS_SENDER_ID:
        attrs["AWS.SNS.SMS.SenderID"] = {"DataType": "String", "StringValue": SNS_SENDER_ID}

    sns_client().publish(
        PhoneNumber=phone,
        Message=message,
        MessageAttributes=attrs,
    )

# =========================
# HELPERS
# =========================
def make_otp():
    return f"{random.randint(100000, 999999)}"

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

def get_db():
    db = SessionLocal()
    try:
        return db
    except Exception:
        db.close()
        raise

def json_error(msg, code=400):
    return jsonify({"ok": False, "error": msg}), code

def validate_role(role):
    return role in ALLOWED_ROLES

def normalize_phone(phone: str):
    return (phone or "").strip()

def otp_required(role: str):
    return role in OTP_REQUIRED_ROLES

# =========================
# OTP ENDPOINTS
# =========================
@app.post("/api/auth/request-otp")
def request_otp_register():
    """
    Used on Register page (same page OTP section).
    Only farmer/dealer require OTP.
    """
    data = request.get_json() or {}
    role = (data.get("role") or "").strip().lower()
    phone = normalize_phone(data.get("phone"))
    username = (data.get("username") or "").strip()

    if not validate_role(role):
        return json_error("Invalid role.")
    if not otp_required(role):
        return json_error("OTP not required for this role.", 400)

    if not phone or not username:
        return json_error("phone and username are required.")

    db = SessionLocal()
    try:
        if db.query(User).filter(User.username == username).first():
            return json_error("Username already exists.", 409)

        # create OTP
        code = make_otp()
        otp = OtpCode(
            role=role,
            phone=phone,
            purpose="register",
            code_hash=generate_password_hash(code),
            expires_at=now_utc() + timedelta(minutes=OTP_EXP_MIN),
        )
        db.add(otp)
        db.commit()

        send_sms(phone, f"Your FarmConnect OTP is {code}. Valid for {OTP_EXP_MIN} minutes.")
        return jsonify({"ok": True, "message": "OTP sent"}), 200
    except Exception as e:
        db.rollback()
        return json_error(f"OTP send failed: {str(e)}", 500)
    finally:
        db.close()


@app.post("/api/auth/verify-otp")
def verify_otp_register():
    """
    Verify OTP on the same Register page.
    """
    data = request.get_json() or {}
    role = (data.get("role") or "").strip().lower()
    phone = normalize_phone(data.get("phone"))
    otp_code = (data.get("otp") or "").strip()

    if not otp_required(role):
        return json_error("OTP not required for this role.", 400)

    if not phone or not otp_code:
        return json_error("phone and otp are required.")

    db = SessionLocal()
    try:
        otp = (
            db.query(OtpCode)
              .filter(OtpCode.phone == phone, OtpCode.role == role, OtpCode.purpose == "register")
              .order_by(OtpCode.created_at.desc())
              .first()
        )
        if not otp:
            return json_error("OTP not found. Please request again.", 404)
        if otp.verified:
            return jsonify({"ok": True, "message": "OTP already verified"}), 200
        if otp.attempts >= OTP_MAX_ATTEMPTS:
            return json_error("Too many attempts. Request new OTP.", 429)
        if otp.expires_at < now_utc():
            return json_error("OTP expired. Request new OTP.", 410)

        otp.attempts += 1
        if not check_password_hash(otp.code_hash, otp_code):
            db.commit()
            return json_error("Invalid OTP.", 401)

        otp.verified = True
        otp.verified_at = now_utc()
        db.commit()
        return jsonify({"ok": True, "message": "OTP verified"}), 200
    finally:
        db.close()

# =========================
# REGISTER (creates user after OTP verified)
# =========================
@app.post("/api/auth/register")
def register_user():
    """
    Register farmer/dealer requires OTP verified before creating user.
    Admin/Government can register without OTP (if you allow).
    """
    data = request.get_json() or {}
    role = (data.get("role") or "").strip().lower()
    username = (data.get("username") or "").strip()
    password = (data.get("password") or "").strip()
    phone = normalize_phone(data.get("phone"))

    if not validate_role(role):
        return json_error("Invalid role.")
    if not username or not password or not phone:
        return json_error("role, username, password, phone are required.")

    db = SessionLocal()
    try:
        if db.query(User).filter(User.username == username).first():
            return json_error("Username already exists.", 409)

        verified_phone = False

        if otp_required(role):
            otp = (
                db.query(OtpCode)
                  .filter(OtpCode.phone == phone, OtpCode.role == role, OtpCode.purpose == "register", OtpCode.verified == True)
                  .order_by(OtpCode.created_at.desc())
                  .first()
            )
            if not otp:
                return json_error("Please verify OTP before registering.", 403)
            verified_phone = True

        user = User(
            role=role,
            username=username,
            password_hash=generate_password_hash(password),
            phone=phone,
            is_phone_verified=verified_phone,
        )
        db.add(user)
        db.commit()

        return jsonify({"ok": True, "message": "Registered successfully"}), 201
    except Exception as e:
        db.rollback()
        return json_error(f"Register failed: {str(e)}", 500)
    finally:
        db.close()

# =========================
# LOGIN
# =========================
@app.post("/api/auth/login")
def login():
    data = request.get_json() or {}
    role = (data.get("role") or "").strip().lower()
    username = (data.get("username") or "").strip()
    password = (data.get("password") or "").strip()

    if not validate_role(role):
        return json_error("Invalid role.")
    if not username or not password:
        return json_error("role, username, password are required.")

    db = SessionLocal()
    try:
        user = db.query(User).filter(User.username == username, User.role == role).first()
        if not user:
            return json_error("Invalid credentials.", 401)
        if not check_password_hash(user.password_hash, password):
            return json_error("Invalid credentials.", 401)

        token = jwt_token(user)
        return jsonify({
            "ok": True,
            "token": token,
            "user": {"id": user.id, "role": user.role, "username": user.username, "phone": user.phone}
        }), 200
    finally:
        db.close()

# =========================
# FORGOT PASSWORD (OTP)
# =========================
@app.post("/api/auth/forgot/request-otp")
def forgot_request_otp():
    """
    Farmer/dealer: send OTP to phone.
    """
    data = request.get_json() or {}
    role = (data.get("role") or "").strip().lower()
    username = (data.get("username") or "").strip()
    phone = normalize_phone(data.get("phone"))

    if not otp_required(role):
        return json_error("Forgot password OTP is only for farmer/dealer.", 400)
    if not username or not phone:
        return json_error("username and phone are required.")

    db = SessionLocal()
    try:
        user = db.query(User).filter(User.username == username, User.role == role, User.phone == phone).first()
        if not user:
            return json_error("User not found with given role/username/phone.", 404)

        code = make_otp()
        otp = OtpCode(
            user_id=user.id,
            role=role,
            phone=phone,
            purpose="forgot",
            code_hash=generate_password_hash(code),
            expires_at=now_utc() + timedelta(minutes=OTP_EXP_MIN),
        )
        db.add(otp)
        db.commit()

        send_sms(phone, f"Your FarmConnect password reset OTP is {code}. Valid for {OTP_EXP_MIN} minutes.")
        return jsonify({"ok": True, "message": "OTP sent"}), 200
    except Exception as e:
        db.rollback()
        return json_error(f"OTP send failed: {str(e)}", 500)
    finally:
        db.close()


@app.post("/api/auth/forgot/verify-otp")
def forgot_verify_otp():
    """
    Frontend calls this, and if ok, open SetPassword page.
    """
    data = request.get_json() or {}
    role = (data.get("role") or "").strip().lower()
    username = (data.get("username") or "").strip()
    phone = normalize_phone(data.get("phone"))
    otp_code = (data.get("otp") or "").strip()

    if not otp_required(role):
        return json_error("Forgot password OTP is only for farmer/dealer.", 400)
    if not username or not phone or not otp_code:
        return json_error("role, username, phone, otp are required.")

    db = SessionLocal()
    try:
        user = db.query(User).filter(User.username == username, User.role == role, User.phone == phone).first()
        if not user:
            return json_error("User not found.", 404)

        otp = (
            db.query(OtpCode)
              .filter(OtpCode.user_id == user.id, OtpCode.phone == phone, OtpCode.purpose == "forgot")
              .order_by(OtpCode.created_at.desc())
              .first()
        )
        if not otp:
            return json_error("OTP not found. Request again.", 404)
        if otp.verified:
            return jsonify({"ok": True, "message": "OTP already verified"}), 200
        if otp.attempts >= OTP_MAX_ATTEMPTS:
            return json_error("Too many attempts. Request new OTP.", 429)
        if otp.expires_at < now_utc():
            return json_error("OTP expired. Request new OTP.", 410)

        otp.attempts += 1
        if not check_password_hash(otp.code_hash, otp_code):
            db.commit()
            return json_error("Invalid OTP.", 401)

        otp.verified = True
        otp.verified_at = now_utc()
        db.commit()

        # return a short-lived reset token (so only verified otp can reset)
        reset_payload = {
            "sub": str(user.id),
            "role": user.role,
            "purpose": "reset_password",
            "exp": now_utc() + timedelta(minutes=10),
            "iat": now_utc(),
        }
        reset_token = jwt.encode(reset_payload, JWT_SECRET, algorithm="HS256")

        return jsonify({"ok": True, "message": "OTP verified", "resetToken": reset_token}), 200
    finally:
        db.close()


@app.post("/api/auth/reset-password")
def reset_password():
    """
    Called from Set Password page.
    """
    data = request.get_json() or {}
    reset_token = (data.get("resetToken") or "").strip()
    new_password = (data.get("newPassword") or "").strip()

    if not reset_token or not new_password:
        return json_error("resetToken and newPassword are required.")

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
    except Exception as e:
        db.rollback()
        return json_error(f"Reset password failed: {str(e)}", 500)
    finally:
        db.close()


if __name__ == "__main__":
    init_db()
    app.run(host="0.0.0.0", port=5000, debug=True)
