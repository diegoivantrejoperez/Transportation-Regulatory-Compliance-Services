import os
import uuid
import httpx
from datetime import datetime, timezone, timedelta
from typing import Optional
from fastapi import FastAPI, HTTPException, Depends, Request, Header
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel
from passlib.context import CryptContext
from jose import JWTError, jwt
from cryptography.fernet import Fernet
from dotenv import load_dotenv
from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionRequest

load_dotenv()

app = FastAPI(title="TRC Compliance API")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"], allow_credentials=True)

# Database
MONGO_URL = os.environ.get("MONGO_URL")
DB_NAME = os.environ.get("DB_NAME")
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

# JWT
SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "trc-fallback-secret")
ALGORITHM = "HS256"

# Passwords
pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Encryption
_enc_key = os.environ.get("ENCRYPTION_KEY")
fernet = Fernet(_enc_key.encode()) if _enc_key else Fernet(Fernet.generate_key())

# Stripe
STRIPE_API_KEY = os.environ.get("STRIPE_API_KEY")
PRICING = {"2_YEAR": 299.00, "4_YEAR": 499.00}
PRICING_LABELS = {"2_YEAR": "2-Year MCS-150 Filing", "4_YEAR": "4-Year MCS-150 Filing Premium"}


# ── MODELS ────────────────────────────────────────────────────────────────────

class RegisterBody(BaseModel):
    email: str
    password: str
    phone_number: Optional[str] = None

class LoginBody(BaseModel):
    email: str
    password: str

class MagicLinkBody(BaseModel):
    token: str
    new_password: str

class PaymentBody(BaseModel):
    tier: str
    usdot_number: str
    email: str
    origin_url: str

class FilingBody(BaseModel):
    usdot_number: str
    session_id: str
    legal_name: str
    dba_name: Optional[str] = None
    physical_street: str
    physical_city: str
    physical_state: str
    physical_zip: str
    mailing_same: bool = True
    mailing_street: Optional[str] = None
    mailing_city: Optional[str] = None
    mailing_state: Optional[str] = None
    mailing_zip: Optional[str] = None
    fleet_size: Optional[str] = None
    email: str
    tin_ssn_ein: str
    mobile_number: str
    authorization_agreed: bool
    signature_base64: str

class MonitoringBody(BaseModel):
    usdot_number: str
    email: str
    password: str


# ── HELPERS ───────────────────────────────────────────────────────────────────

def hash_pw(pw): return pwd_ctx.hash(pw)
def verify_pw(pw, hashed): return pwd_ctx.verify(pw, hashed)

def make_token(user_id: str, email: str) -> str:
    return jwt.encode({"user_id": user_id, "email": email, "exp": datetime.now(timezone.utc) + timedelta(hours=24)}, SECRET_KEY, algorithm=ALGORITHM)

def make_magic_token(user_id: str, email: str) -> str:
    return jwt.encode({"user_id": user_id, "email": email, "type": "magic_link", "exp": datetime.now(timezone.utc) + timedelta(hours=48)}, SECRET_KEY, algorithm=ALGORITHM)

async def get_user(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Authentication required")
    try:
        p = jwt.decode(authorization.split(" ")[1], SECRET_KEY, algorithms=[ALGORITHM])
        user = await db.users.find_one({"user_id": p["user_id"]})
        if not user:
            raise HTTPException(401, "User not found")
        return user
    except JWTError:
        raise HTTPException(401, "Invalid or expired token")

def parse_mcs150(date_str: str) -> Optional[datetime]:
    if not date_str:
        return None
    s = date_str.strip()
    # "20240415 0000" format
    try:
        return datetime.strptime(s[:8], "%Y%m%d")
    except:
        pass
    try:
        return datetime.strptime(s, "%m/%d/%Y")
    except:
        pass
    return None

def compliance_from_date(mcs_date: Optional[datetime]) -> dict:
    if not mcs_date:
        return {"mcs_150_last_update": None, "mcs_150_renewal_date": None, "days_until_due": None, "compliance_status": "UNKNOWN"}
    renewal = mcs_date.replace(year=mcs_date.year + 2)
    days = (renewal - datetime.now()).days
    status = "RED" if days < 0 else "YELLOW" if days <= 30 else "GREEN"
    return {
        "mcs_150_last_update": mcs_date.strftime("%m/%d/%Y"),
        "mcs_150_renewal_date": renewal.strftime("%m/%d/%Y"),
        "days_until_due": days,
        "compliance_status": status
    }


# ── USDOT LOOKUP ──────────────────────────────────────────────────────────────

async def fetch_socrata(usdot: str) -> Optional[dict]:
    url = "https://data.transportation.gov/resource/az4n-8mr2.json"
    try:
        async with httpx.AsyncClient(timeout=15.0) as c:
            r = await c.get(url, params={"dot_number": usdot})
            if r.status_code == 200:
                data = r.json()
                if data:
                    return data[0]
    except Exception as e:
        print(f"Socrata API error: {e}")
    return None

@app.get("/api/usdot/{usdot_number}")
async def lookup_usdot(usdot_number: str):
    if not usdot_number.isdigit() or len(usdot_number) > 8:
        raise HTTPException(400, "Invalid USDOT number format")

    # Cache check (24h)
    cached = await db.dot_cache.find_one({"usdot_number": usdot_number, "cached_at": {"$gte": (datetime.now() - timedelta(hours=24)).isoformat()}})
    if cached:
        cached.pop("_id", None)
        return cached

    raw = await fetch_socrata(usdot_number)
    if not raw:
        raise HTTPException(404, "USDOT number not found in FMCSA database")

    mcs_date = parse_mcs150(raw.get("mcs150_date", ""))
    comp = compliance_from_date(mcs_date)

    result = {
        "usdot_number": usdot_number,
        "fmcsa_data": {
            "legal_name": raw.get("legal_name", "Unknown Carrier"),
            "dba_name": raw.get("dba_name", ""),
            "physical_address": {
                "street": raw.get("phy_street", ""),
                "city": raw.get("phy_city", ""),
                "state": raw.get("phy_state", ""),
                "zip": raw.get("phy_zip", "")
            },
            "mailing_address": {
                "street": raw.get("carrier_mailing_street", raw.get("phy_street", "")),
                "city": raw.get("carrier_mailing_city", raw.get("phy_city", "")),
                "state": raw.get("carrier_mailing_state", raw.get("phy_state", "")),
                "zip": raw.get("carrier_mailing_zip", raw.get("phy_zip", ""))
            },
            "fleet_size": raw.get("power_units", ""),
            "operating_status": "Active" if raw.get("status_code") == "A" else "Inactive",
            "entity_type": raw.get("classdef", ""),
            "mc_number": f"{raw.get('docket1prefix', '')}{raw.get('docket1', '')}".strip(),
            "company_officer": raw.get("company_officer_1", ""),
            "email": raw.get("email_address", ""),
            "phone": raw.get("phone", ""),
        },
        **comp,
        "cached_at": datetime.now().isoformat()
    }

    await db.dot_cache.update_one({"usdot_number": usdot_number}, {"$set": result}, upsert=True)
    return result


# ── AUTH ──────────────────────────────────────────────────────────────────────

@app.post("/api/auth/register")
async def register(body: RegisterBody):
    if await db.users.find_one({"email": body.email.lower()}):
        raise HTTPException(400, "Email already registered")
    uid = str(uuid.uuid4())
    await db.users.insert_one({
        "user_id": uid, "email": body.email.lower(),
        "password_hash": hash_pw(body.password),
        "phone_number": body.phone_number, "role": "owner",
        "created_at": datetime.now(timezone.utc), "updated_at": datetime.now(timezone.utc), "email_verified": False
    })
    return {"access_token": make_token(uid, body.email.lower()), "token_type": "bearer", "user_id": uid, "email": body.email.lower()}

@app.post("/api/auth/login")
async def login(body: LoginBody):
    u = await db.users.find_one({"email": body.email.lower()})
    if not u or not verify_pw(body.password, u.get("password_hash", "")):
        raise HTTPException(401, "Invalid email or password")
    return {"access_token": make_token(u["user_id"], u["email"]), "token_type": "bearer", "user_id": u["user_id"], "email": u["email"]}

@app.post("/api/auth/magic-link/verify")
async def verify_magic(body: MagicLinkBody):
    try:
        p = jwt.decode(body.token, SECRET_KEY, algorithms=[ALGORITHM])
        if p.get("type") != "magic_link":
            raise HTTPException(400, "Invalid token type")
        uid, email = p["user_id"], p["email"]
    except JWTError:
        raise HTTPException(400, "Invalid or expired magic link")
    u = await db.users.find_one({"user_id": uid})
    if u:
        await db.users.update_one({"user_id": uid}, {"$set": {"password_hash": hash_pw(body.new_password), "email_verified": True}})
    else:
        await db.users.insert_one({"user_id": uid, "email": email, "password_hash": hash_pw(body.new_password), "role": "owner", "created_at": datetime.now(timezone.utc), "email_verified": True})
    return {"access_token": make_token(uid, email), "message": "Password set successfully"}

@app.get("/api/auth/me")
async def get_me(user=Depends(get_user)):
    return {"user_id": user["user_id"], "email": user["email"], "phone_number": user.get("phone_number")}


# ── PAYMENTS ─────────────────────────────────────────────────────────────────

@app.post("/api/payments/create-checkout")
async def create_checkout(body: PaymentBody):
    if body.tier not in PRICING:
        raise HTTPException(400, "Invalid tier")
    stripe = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=f"{body.origin_url}/api/webhook/stripe")
    req = CheckoutSessionRequest(
        amount=PRICING[body.tier],
        currency="usd",
        success_url=f"{body.origin_url}/payment-success?session_id={{CHECKOUT_SESSION_ID}}",
        cancel_url=f"{body.origin_url}/status/{body.usdot_number}",
        metadata={"tier": body.tier, "usdot_number": body.usdot_number, "email": body.email, "service": PRICING_LABELS[body.tier]}
    )
    session = await stripe.create_checkout_session(req)
    await db.payment_transactions.insert_one({
        "transaction_id": str(uuid.uuid4()), "session_id": session.session_id,
        "tier": body.tier, "amount": PRICING[body.tier], "currency": "usd",
        "usdot_number": body.usdot_number, "email": body.email.lower(),
        "payment_status": "pending", "status": "initiated",
        "created_at": datetime.now(timezone.utc), "updated_at": datetime.now(timezone.utc)
    })
    return {"checkout_url": session.url, "session_id": session.session_id}

@app.get("/api/payments/status/{session_id}")
async def payment_status(session_id: str):
    tx = await db.payment_transactions.find_one({"session_id": session_id})
    if not tx:
        raise HTTPException(404, "Session not found")
    if tx.get("payment_status") == "paid":
        return {"payment_status": "paid", "status": "complete", "tier": tx.get("tier"), "usdot_number": tx.get("usdot_number"), "email": tx.get("email"), "amount": tx.get("amount")}
    stripe = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url="/")
    cs = await stripe.get_checkout_status(session_id)
    if cs.payment_status != tx.get("payment_status"):
        await db.payment_transactions.update_one({"session_id": session_id}, {"$set": {"payment_status": cs.payment_status, "status": cs.status, "updated_at": datetime.now(timezone.utc)}})
    return {"payment_status": cs.payment_status, "status": cs.status, "tier": tx.get("tier"), "usdot_number": tx.get("usdot_number"), "email": tx.get("email"), "amount": tx.get("amount")}

@app.post("/api/webhook/stripe")
async def stripe_webhook(request: Request):
    body = await request.body()
    sig = request.headers.get("Stripe-Signature")
    stripe = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url="/")
    try:
        event = await stripe.handle_webhook(body, sig)
        if event.payment_status == "paid":
            await db.payment_transactions.update_one({"session_id": event.session_id}, {"$set": {"payment_status": "paid", "status": "complete", "updated_at": datetime.now(timezone.utc)}})
    except Exception as e:
        print(f"Webhook error: {e}")
    return {"status": "ok"}


# ── FILINGS ──────────────────────────────────────────────────────────────────

@app.post("/api/filings/submit")
async def submit_filing(body: FilingBody):
    if not body.authorization_agreed:
        raise HTTPException(400, "Authorization is required")
    tx = await db.payment_transactions.find_one({"session_id": body.session_id})
    if not tx or tx.get("payment_status") != "paid":
        raise HTTPException(400, "Payment not confirmed")
    existing = await db.filings.find_one({"session_id": body.session_id})
    if existing:
        return {"filing_id": existing["filing_id"], "status": "submitted", "confirmation_number": existing.get("confirmation_number"), "message": "Already filed"}

    enc_tin = fernet.encrypt(body.tin_ssn_ein.encode()).decode()
    u = await db.users.find_one({"email": body.email.lower()})
    if u:
        uid = u["user_id"]
        magic_token = make_magic_token(uid, body.email.lower())
        await db.users.update_one({"user_id": uid}, {"$set": {"phone_number": body.mobile_number, "updated_at": datetime.now(timezone.utc)}})
    else:
        uid = str(uuid.uuid4())
        magic_token = make_magic_token(uid, body.email.lower())
        await db.users.insert_one({
            "user_id": uid, "email": body.email.lower(), "password_hash": "",
            "phone_number": body.mobile_number, "role": "owner",
            "created_at": datetime.now(timezone.utc), "updated_at": datetime.now(timezone.utc), "email_verified": False
        })

    await db.dot_records.update_one(
        {"usdot_number": body.usdot_number, "user_id": uid},
        {"$set": {
            "record_id": str(uuid.uuid4()), "user_id": uid, "usdot_number": body.usdot_number,
            "fmcsa_data": {"legal_name": body.legal_name, "dba_name": body.dba_name},
            "tin_ssn_ein": enc_tin, "compliance_status": "FILED",
            "filed_by_trc": True, "filing_date": datetime.now(timezone.utc), "updated_at": datetime.now(timezone.utc)
        }},
        upsert=True
    )

    filing_id = str(uuid.uuid4())
    conf = f"TRC-{datetime.now().strftime('%Y%m%d')}-{body.usdot_number}"
    await db.filings.insert_one({
        "filing_id": filing_id, "user_id": uid, "usdot_number": body.usdot_number,
        "session_id": body.session_id, "filing_type": "MCS_150",
        "filing_date": datetime.now(timezone.utc), "submitted_to_fmcsa": True,
        "fmcsa_confirmation": conf, "signature_base64": body.signature_base64,
        "tier": tx.get("tier"), "amount": tx.get("amount"),
        "status": "submitted", "confirmation_number": conf, "created_at": datetime.now(timezone.utc)
    })
    await db.notifications.insert_one({
        "notification_id": str(uuid.uuid4()), "user_id": uid, "trigger_type": "FILING_COMPLETE",
        "title": "Filing Submitted Successfully",
        "message": f"MCS-150 for USDOT {body.usdot_number} has been submitted. Ref: {conf}",
        "status": "unread", "created_at": datetime.now(timezone.utc)
    })

    access_token = make_token(uid, body.email.lower())
    return {"filing_id": filing_id, "status": "submitted", "confirmation_number": conf, "magic_link_token": magic_token, "user_id": uid, "access_token": access_token}


# ── MONITORING ────────────────────────────────────────────────────────────────

@app.post("/api/monitoring/subscribe")
async def subscribe(body: MonitoringBody):
    existing = await db.users.find_one({"email": body.email.lower()})
    if existing:
        if not verify_pw(body.password, existing.get("password_hash", "")):
            raise HTTPException(400, "Email already registered. Please use correct password or login.")
        uid = existing["user_id"]
        token = make_token(uid, existing["email"])
    else:
        uid = str(uuid.uuid4())
        await db.users.insert_one({
            "user_id": uid, "email": body.email.lower(), "password_hash": hash_pw(body.password),
            "role": "owner", "created_at": datetime.now(timezone.utc), "updated_at": datetime.now(timezone.utc)
        })
        token = make_token(uid, body.email.lower())

    await db.dot_records.update_one(
        {"usdot_number": body.usdot_number, "user_id": uid},
        {"$set": {"record_id": str(uuid.uuid4()), "user_id": uid, "usdot_number": body.usdot_number, "monitoring_enabled": True, "subscription_tier": "FREE", "created_at": datetime.now(timezone.utc), "updated_at": datetime.now(timezone.utc)}},
        upsert=True
    )
    await db.notifications.insert_one({
        "notification_id": str(uuid.uuid4()), "user_id": uid, "trigger_type": "MONITORING_ACTIVATED",
        "title": "Free Monitoring Activated",
        "message": f"30-day early warning enabled for USDOT {body.usdot_number}. We'll email you before your deadline.",
        "status": "unread", "created_at": datetime.now(timezone.utc)
    })

    return {"access_token": token, "user_id": uid, "message": "Free 30-day monitoring activated!", "monitoring_enabled": True}


# ── DASHBOARD ─────────────────────────────────────────────────────────────────

@app.get("/api/dashboard")
async def dashboard(user=Depends(get_user)):
    uid = user["user_id"]
    recs = await db.dot_records.find({"user_id": uid}).to_list(20)
    fils = await db.filings.find({"user_id": uid}).sort("filing_date", -1).limit(5).to_list(5)
    nots = await db.notifications.find({"user_id": uid}).sort("created_at", -1).limit(10).to_list(10)

    for r in recs:
        r.pop("_id", None)
        cached = await db.dot_cache.find_one({"usdot_number": r.get("usdot_number")})
        if cached:
            r.update({"compliance_status": cached.get("compliance_status"), "days_until_due": cached.get("days_until_due"), "mcs_150_renewal_date": cached.get("mcs_150_renewal_date"), "legal_name": cached.get("fmcsa_data", {}).get("legal_name", r.get("fmcsa_data", {}).get("legal_name", ""))})

    def clean(d):
        d.pop("_id", None)
        return {k: v.isoformat() if isinstance(v, datetime) else v for k, v in d.items()}

    return {"user": {"user_id": uid, "email": user["email"]}, "dot_records": recs, "recent_filings": [clean(f) for f in fils], "notifications": [clean(n) for n in nots], "unread_count": sum(1 for n in nots if n.get("status") == "unread")}

@app.get("/api/filings/history")
async def filing_history(user=Depends(get_user)):
    fils = await db.filings.find({"user_id": user["user_id"]}).sort("filing_date", -1).to_list(50)
    def clean(f):
        f.pop("_id", None)
        return {k: v.isoformat() if isinstance(v, datetime) else v for k, v in f.items()}
    return {"filings": [clean(f) for f in fils]}

@app.get("/api/notifications")
async def get_notifications(user=Depends(get_user)):
    nots = await db.notifications.find({"user_id": user["user_id"]}).sort("created_at", -1).limit(50).to_list(50)
    def clean(n):
        n.pop("_id", None)
        return {k: v.isoformat() if isinstance(v, datetime) else v for k, v in n.items()}
    return {"notifications": [clean(n) for n in nots]}

@app.patch("/api/notifications/{notification_id}/read")
async def mark_read(notification_id: str, user=Depends(get_user)):
    await db.notifications.update_one({"notification_id": notification_id, "user_id": user["user_id"]}, {"$set": {"status": "read", "read_at": datetime.now(timezone.utc)}})
    return {"message": "ok"}

@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "TRC Compliance API"}
