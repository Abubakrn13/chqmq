# Chaqmoq — Railway'da ma'lumot xavfsizligi

Bu hujjat: **Railway'да deploy qilганда ma'lumot yo'qolmasligi uchun** qanday sozlash kerakligi.

## Muammо

Railway'да har deploy qilганда konteyner qayta yaratiladi. Konteyner ichидаги fayllar ham yangi bo'lib ketaди — ya'ni `db.json` **yo'qoladi**.

Yechim: **persistent volume** ulash. Bu Railway'ning maxsus disk — konteyner qayta yaratilса ham fayllar shu diskда qoladi.

## Sozlash (bir marta)

### 1. Volume yaratish

1. Railway loyihasi ichida servicегa kir
2. Yuqorida **Settings** tabini bos
3. **Volumes** bo'limини topib **New Volume** bos
4. Kiritilsin:
   - **Mount Path:** `/data`
   - **Size:** 1 GB (kichik do'kon uchun 100 yiл yetadi)
5. **Add Volume** bos

### 2. Environment variable qo'shish

1. Xuddi shu servicеда **Variables** tabini och
2. **New Variable** bos:
   - **Name:** `DATA_DIR`
   - **Value:** `/data`
3. Saqla

### 3. Redeploy

Railway avtomatik qayta deploy qiladi. Yangi konteynerда endi:
- `/data/db.json` yoziladi
- `/data/db.json.backup` yoziladi
- `/data/backups/db-YYYY-MM-DD.json` yoziladi

Kunlар va deploy'лar oralig'ида ma'lumot xavfsiz qoladi.

## Tekshirish

Deploy tugagach:

1. Chaqmoq'га kir, biror mahsulot qo'sh
2. Railway servicеда **Redeploy** bos
3. Qayta kir → mahsulot **saqlanган bo'lishi kerak**

Agar mahsulot yo'qolса, `DATA_DIR` env noto'g'ri qo'yilgan yoki volume ulanmaган.

## Qo'shimcha himoya

### Telegram bot bilan

Har kuni ertalab 9:05 da tizim to'liq JSON zaxirani sizga Telegram orqali jo'natadi. Buni sozlash:

1. `TELEGRAM_BOT_TOKEN` env qo'shing (chaqmoq panel ichида "Qanday ulanadi?" yo'l-yo'riq bor)
2. Chaqmoq → Telegram bo'limда o'z chat_id ni bog'lang
3. Har kuni Telegram'га avtomatik fayl keladi. Fayllar saqlanадi.

Agar Railway'даги volume ham yo'qоlса (masalan, hisob yopilса), Telegram'даги oxirgi zaxira orqali ma'lumot tiklab olish mumkin.

## Ma'lumot tiklash

Agar fayl kерак bo'lsa, biz bilan bog'laning:
- Chaqmoq JSON faylини yuborsangiz, sizнинг do'koningizni qayta tiklab beramiz
- 1 kun ichида qayta ishlaymиз

## Xotira strategiyasi

- **Har yozuvдa:** atomic write (`db.json.tmp` → rename → `db.json`)
- **Har 20-yozuvдa:** `db.json.backup` yangilanadi
- **Har 10 daqiqаda:** `db.json.backup` yangilanadi
- **Har kuni:** `backups/db-2026-01-15.json` snapshot
- **30 kun** saqlanadi — undан eskилари o'chiriladi

Server ishga tushганда:
1. Avval `db.json` o'qiladi (o'zgacha)
2. Agar buzilgan bo'lsa `db.json.backup` (10 daqiqаga eski)
3. Agar u ham buzилsа eng yangi snapshot (bir kun eski)
4. Hech qaysi topilmasa yangi boshlanaди

Ya'ni yomonda-yomоn holатда ham **1 kunlik eski ma'lumot** tiklanadi.
