# Chaqmoq — Do'kon avtomatlashtirish SaaS

Offline-first, ko'p-ijarali (multi-tenant) savdo tizimi. Har bir do'kon o'z paneliga
ega, platforma esa **superadmin** orqali barcha do'konlar va obunalarni boshqaradi.

- **Backend** — Node.js + Express, JWT auth, ma'lumot diskka JSON-faylda saqlanadi
- **Frontend** — React + Vite (11 bo'limli sotuvchi paneli + superadmin + landing)
- **Skaner** — telefon/noutbuk kamerasi orqali shtrix-kod (html5-qrcode)
- **Baza** — tashqi baza va C++ build-tool shart emas; faqat **Node.js 18+**

---

## 1. Tez ishga tushirish (bitta terminal)

Backend tayyor `frontend/dist` ni o'zi tarqatadi.

```bash
cd backend
npm install
npm start
```

Brauzerda: **http://localhost:4000**

> **Muhim:** ochiq ro'yxatdan o'tish yo'q. Do'kon loginlari **faqat superadmin**
> tomonidan yaratiladi. Foydalanuvchi login olish uchun Telegram (**@abubakrmirzaev**)
> orqali yozadi — siz unga superadmin paneldan hisob ochib berasiz.

### Superadmin (platforma egasi)

Server birinchi ishga tushganda avtomatik yaratiladi:

```
login:  superadmin
parol:  admin123
```

Kirgach **/superadmin** paneli ochiladi. **"Yangi do'kon"** tugmasi orqali:
do'kon nomi, egasi ismi, **login (telefon)**, **parol** va **necha kun**
kiritasiz → hisob yaratiladi va login/parol ekranda ko'rsatiladi (egasiga berasiz).
Do'kon egasi shu login/parol bilan **http://localhost:4000** dan kiradi.

Superadmin shu yerda barcha do'konlar, tushum va muddat holatini boshqaradi
hamda istalgan do'konga **"Muddat berish"** yoki uni to'xtatishi mumkin.

---

## 2. Dasturlash rejimi (ikki terminal)

```bash
# 1-terminal
cd backend && npm install && npm start        # :4000

# 2-terminal
cd frontend && npm install && npm run dev      # :5173
```

Frontend'ni o'zgartirgach qayta build: `cd frontend && npm run build`.

---

## 3. Sotuvchi panelidagi bo'limlar

| Bo'lim | Vazifa |
|--------|--------|
| **Boshqaruv paneli** | Bugungi tushum/foyda, 7 kunlik grafik, oxirgi sotuvlar, tez havolalar |
| **Sotish** | Kassa: qidiruv, kategoriya, **kamera skaner**, savat, 6 to'lov turi, **Nasiya** (mijozga bog'lab). Yuqoridagi **filial almashtirgich** orqali istalgan filialga o'tib sotasiz — sotuv o'sha filialga yoziladi |
| **Bugungi sotuvlar** | Kunlik cheklar ro'yxati, foyda va qarz bilan |
| **Mahsulotlar** | Ombor: qo'shish/tahrirlash/o'chirish, kam qoldiq holati, ombor qiymati |
| **Qaytarish** | Tovar qaytarish — ombor avtomatik to'ldiriladi |
| **Mijozlar** | Mijozlar bazasi, har birining joriy qarzi |
| **Qarzlar** | Nasiya (kredit) sotuvlar, qisman/to'liq to'lovni qabul qilish |
| **Foyda** | Tushum, sof foyda, marja %, eng ko'p sotilganlar, to'lov turlari |
| **Arenda** | Ijara va boshqa xarajatlar (Kommunal, Ish haqi…), to'landi belgisi |
| **Filiallar** | Filiallar bo'yicha tushum/foyda taqqoslash, yetakchi filial |
| **Kassa smenasi** | Xodim kun boshida naqdни yozib ochadi, kun oxirida naqdни sanaydi — tizim kutilayotgan qiymatни hisoblab, farqni ko'rsatadi |
| **Faktura (kirim)** | Yetkazib beruvchidan kelgan tovarni qabul qilish — ombor va tannarx avtomatik (moving-avg) yangilanadi |
| **Yetkazib beruvchilar** | Postavshiklar bazasi |
| **Xodimlar** | Menejer va sotuvchi (kassir) hisoblarini qo'shish; sotuvchi faqat kassa bo'limlariga kiradi |
| **Telegram bot** | chat_id bog'lash → har kuni ertalab 9:00 da avtomatik hisobot |
| **Sozlamalar** | Do'kon nomi + foydalanish muddati holati va "Vaqt sotib olish" |
| **AI tahlilchi** | *(o'rnatilgan, kalitsiz)* Do'kon ma'lumotlari asosida savol-javob, foyda/qoldiq/qarz tahlili va tavsiyalar |

---

## 4. Foydalanish modeli — muddat (vaqt) asosida

Tariflar yo'q. Do'kon **faollik muddati** (necha kun) asosida ishlaydi — superadmin
kerakli kunga faollashtiradi.

- Do'kon egasi muddatni uzaytirish uchun **Telegram (@abubakrmirzaev)** orqali bog'lanadi
  (Sozlamalar → "Vaqt sotib olish", yoki landing sahifasidan).
- To'lov kelishilgach **superadmin** panelidan do'kon topiladi → **"Muddat berish"** →
  **necha kun** (7 / 30 / 90 / 180 / 365 yoki qo'lda) → tasdiqlanadi.
- Faollashtirilgach do'kon paneli **darhol ochiladi** — panel har 15 soniyada va oynaga
  qaytilganda holatni avtomatik tekshiradi (qayta yuklash shart emas).
- Muddat tugasa yoki superadmin to'xtatsa, do'konda **qulflangan ekran** chiqadi
  (Telegram tugmasi bilan). Bu faqat ko'rinish emas — server ham barcha savdo/ombor
  amallarini bloklaydi (HTTP 402), ya'ni muddatsiz do'kon ishlata olmaydi.

> Superadmin: `superadmin` / `admin123` → `/superadmin`. To'lov integratsiyasi (Click/Payme/
> Uzum) ulanmagan; hozircha faollashtirish qo'lda — kelishuvdan so'ng superadmin bajaradi.

---

## 5. Kamera bilan skanerlash

Sotish → **"Skanerlash"** → kamera ochiladi → shtrix-kodni ko'rsating → tovar
savatga tushadi (ketma-ket skanerlash mumkin).

⚠️ Brauzer kameraga faqat **`localhost`** yoki **`https://`** da ruxsat beradi.
Kamera bo'lmasa skaner oynasida shtrix-kodni qo'lda kiritish mumkin.

---

## 6. API qisqacha

Barcha `/api/*` (auth'dan tashqari) `Authorization: Bearer <token>` talab qiladi va
faqat o'z do'koningiz ma'lumotini qaytaradi (multi-tenant).

| Guruh | Asosiy endpointlar |
|-------|--------------------|
| auth | `POST /login`, `GET /me`, `PUT /shop`, `POST /subscription` (faqat bepul) |
| products | `GET /`, `GET /barcode/:code`, `POST /`, `PUT/DELETE /:id`, `POST /seed` |
| sales | `POST /` (nasiya, filial), `GET /today`, `GET /stats`, `GET /summary` |
| customers | `GET /` (qarz bilan), `POST /`, `PUT/DELETE /:id` |
| debts | `GET /`, `POST /pay` |
| returns | `GET /`, `POST /` (ombor to'ldiradi) |
| expenses | `GET /?category=`, `POST /`, `PUT/DELETE /:id` |
| branches | `GET /` (30 kunlik ko'rsatkich), `POST /`, `PUT/DELETE /:id` |
| superadmin | `GET /shops`, `POST /shops` (yangi login yaratish), `POST /shops/:id/subscription` |

---

## 7. Sozlash (ixtiyoriy)

`backend/.env.example` → `.env`:

```
PORT=4000
JWT_SECRET=uzun-tasodifiy-maxfiy-satr
```

---

## 8. Keyingi bosqich (yo'l xaritasi)

Quyidagilar ulanishga tayyor, ammo merchant akkaunt / davlat API kalitlari
talab qilgani uchun real ulanmagan:

- **To'lov:** Click, Payme, Uzum (muddatni avtomatik uzaytirish uchun ham)
- **Fiskal chek (OFD):** soliq provayderiga chek yuborish
- **Markirovka (TURON / Data Matrix)**
- **Telegram bot:** kunlik hisobot + kam qoldiq xabarlari
- **AI tahlil:** sotuv tarixidan bashorat

---

## 9. JSON-ombordan MongoDB'ga o'tish

Barcha o'qish/yozish bitta joyda — `backend/db.js`. Kattalashganda:
`npm install mongoose` → `db.js` ichini Mongoose bilan almashtirasiz →
`routes/*.js` deyarli o'zgarmaydi (ular faqat `shopId` bo'yicha filtrlaydi).

---

Savdolaringiz baroridan kelsin! ⚡

---

## 10. Railway'ga joylash (deploy)

Kod GitHub'ga yuboriladi va Railway uni o'zi quradi. `frontend/dist` git'ga
kirmaydi (`.gitignore`da) — Railway build paytida o'zi yasaydi.

**1) Kodni yuboring** (faqat manba, `node_modules` va `dist` kerak emas).

**2) Railway → New Project → Deploy from GitHub repo.**
Ildizdagi `package.json` tufayli Railway avtomatik:
`npm run build` (frontend'ni yasaydi) → `npm start` (backendni ishga tushiradi).
Agar qo'lda sozlash kerak bo'lsa:
- Build Command: `npm run build`
- Start Command: `npm start`

**3) O'zgaruvchilar** (Settings → Variables):
| O'zgaruvchi | Qiymat |
|-------------|--------|
| `JWT_SECRET` | uzun tasodifiy maxfiy satr (tokenlar shunga bog'liq) |
| `DATA_DIR` | `/data` |
| `ANTHROPIC_API_KEY` | *(ixtiyoriy)* qo'yilsa AI yordamchi haqiqiy Claude'ga ulanadi; qo'yilmasa mahalliy o'rnatilgan AI ishlaydi |
| `AI_MODEL` | *(ixtiyoriy)* model nomi, standart `claude-haiku-4-5-20251001` |

> `PORT` ni **qo'ymang** — Railway o'zi beradi, kod uni o'qiydi.

**4) Volume qo'shing** (Settings → Volumes → Add Volume):
- Mount path: `/data` (yuqoridagi `DATA_DIR` bilan bir xil)

⚠️ **Eng muhimi shu.** Volume bo'lmasa, Railway'da har deployda fayl tizimi
o'chadi → `db.json` (barcha hisoblar, loginlar, sotuvlar) yo'qoladi va qaytadan
login qilishga to'g'ri keladi. Volume bilan hammasi saqlanadi.

**5) Redeploy.** Birinchi ishga tushishda superadmin urug'i yaratiladi
(`superadmin` / `admin123`). Kirib, do'kon loginlarini yaratasiz.

Railway HTTPS beradi — shuning uchun **kamera skaner telefonda ham ishlaydi**.

### Nega qayta login so'ralayotgan edi?
Token brauzerda 30 kun saqlanadi, lekin Railway'da baza (`db.json`) har deployda
o'chib ketsa, hisob yo'qoladi va token bekor bo'ladi. Yechim — yuqoridagi
`DATA_DIR` + Volume. Bundan tashqari, endi vaqtinchalik xatolikda sessiya
tushib qolmaydi (faqat token haqiqatan yaroqsiz bo'lsagina chiqadi).

---

## 11. Integratsiyalar (OFD / Payme / Click / Markirovka / Telegram)

Bularning **hammasi** kodda tayyor. Kalit qo'yilmasa har biri **sinov (test) rejim**ida ishlaydi — hech narsa buzilmaydi. Kalit qo'yilishi bilan avtomatik real ulanadi.

Kerakli `.env` maydonlari (mana `backend/.env.example` da to'liq bor):

```
# OFD (fiskal chek) — sofd, mplus, myofd, solkassa
OFD_PROVIDER=
OFD_API_URL=
OFD_API_KEY=
OFD_TIN=

# Payme
PAYME_MERCHANT_ID=
PAYME_MERCHANT_KEY=

# Click
CLICK_MERCHANT_ID=
CLICK_SERVICE_ID=
CLICK_SECRET_KEY=

# Markirovka (Data Matrix)
MARKIROVKA_API_URL=
MARKIROVKA_API_KEY=

# Telegram
TELEGRAM_BOT_TOKEN=
```

Railway'да bularni **Variables**ga qo'yasiz. Sinov rejimda ishlash yaxshi tomoni: OFD chek ID, Payme link, Click link, marka tekshirilishi — barchasi avtomatik ishlaydi, siz do'konni yo'lга qo'ymay turib mijozларni ko'rsatib berish uchun ham qulay.

### Chek chop etish

Sotuv yakunlanganida chek matni tayyor bo'ladi (58mm). "Chop etish" — brauzerdan termalli printerга chiqadi. Termal printer OSga o'rnatilган bo'lsa (CUPS/Windows), oddiy printer sifatida ishlaydi.

---

## 12. Onboarding, live dashboard va samaradorlik

### Sessiyani eslab qolish
Foydalanuvchi bir marta kirsa, brauzer tokenni 30 kun saqlaydi va qayta kirgan har safar avtomatik do'kon paneliga tushadi. Landing sahifasi ham kirgan foydalanuvchini darrov paneliga yo'naltiradi. Login sahifasida oxirgi kirgan telefon oldindan to'ldirilgan bo'ladi.

### Onboarding (1-marta so'raladi)
Yangi do'kon birinchi marta panelga kirganda 5 qadamli sozlash paydo bo'ladi: egasi ismi, do'kon turi (gastronom, aptek, kiyim, ...), xodimlar soni, taxminiy oylik tushum + ish soati, fiskal kassa bor-yo'qligi. Javoblar do'kon profilida saqlanadi va **qayta so'ralmaydi**. AI ham shulardan foydalanadi.

### Live dashboard (jonli faoliyat)
Direktor va menejer Boshqaruv panelida **jonli faoliyat oynasi** ko'radi. Har bir sotuv, qaytarish, smena ochilishi/yopilishi, faktura qabul qilinishi, qarz to'lovi — real vaqtda (SSE orqali) tushib turadi. Yashil nuqta ulanish holatini bildiradi. Sotuvchi (kassir) bu ma'lumotni ko'ra olmaydi.

### Samaradorlik va taxminiy oylik
Boshqaruv → **Samaradorlik**: har xodim uchun tushum, foyda, ishlagan soatlar/kunlar, sotuv soni va **ulush foizi**. Tizim 30 kunlik tushumning 15% asosida oylik byudjetni hisoblaydi (minimum 3 mln so'm) va har xodimning ulushiga qarab **taxminiy oylik** taklif qiladi. AI xulosasi eng yaхshi va eng past sotuvchini taqqoslaydi. Yakuniy qarorni siz qabul qilasiz.
