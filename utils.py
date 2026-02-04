import re
import uuid
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash, check_password_hash

def normalize_phone(phone: str) -> str:
    """
    Expect India numbers mostly. Convert to E.164 +91XXXXXXXXXX if needed.
    """
    p = (phone or "").strip()
    p = re.sub(r"\s+", "", p)
    p = p.replace("-", "")
    if p.startswith("+"):
        return p
    if p.startswith("91") and len(p) == 12:
        return "+" + p
    if len(p) == 10:
        return "+91" + p
    return p  # fallback

def gen_otp() -> str:
    # 6 digit otp
    import random
    return f"{random.randint(100000, 999999)}"

def hash_text(text: str) -> str:
    return generate_password_hash(text)

def verify_hash(hashval: str, text: str) -> bool:
    return check_password_hash(hashval, text)

def new_token() -> str:
    return str(uuid.uuid4())

def expires_in_minutes(mins: int) -> datetime:
    return datetime.utcnow() + timedelta(minutes=mins)
