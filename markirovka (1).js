# --- Core ---
PORT=4000
JWT_SECRET=uzun-tasodifiy-maxfiy-satr
DATA_DIR=./data

# --- AI (optional) — falls back to built-in local AI ---
ANTHROPIC_API_KEY=
AI_MODEL=claude-haiku-4-5-20251001

# --- OFD (fiskal chek) — optional ---
# Provayder tanlang: sofd | mplus | myofd | solkassa
OFD_PROVIDER=
OFD_API_URL=
OFD_API_KEY=
OFD_TIN=

# --- Payme merchant ---
PAYME_MERCHANT_ID=
PAYME_MERCHANT_KEY=
PAYME_ENDPOINT=https://checkout.paycom.uz

# --- Click merchant ---
CLICK_MERCHANT_ID=
CLICK_SERVICE_ID=
CLICK_SECRET_KEY=

# --- Markirovka (Asl Belgi / TURON) ---
MARKIROVKA_API_URL=
MARKIROVKA_API_KEY=

# --- Telegram bot (daily reports) ---
TELEGRAM_BOT_TOKEN=
