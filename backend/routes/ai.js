/* ============================================================
   routes/ai.js — built-in AI assistant (fully local, no API).
   Three modes, chosen from the user's question:
     1) "biznes"  — analytics on the shop's real data (revenue,
                    profit, margin, top items, low stock, debts,
                    trends), with concrete recommendations.
     2) "yordam"  — help/how-to answers about using the app
                    (how to sell, how to add products, what is
                    Nasiya, etc.), based on an in-code knowledge
                    base of the panel.
     3) "aralash" — for open questions, blends both.
   Detects intent by keyword scoring; falls back to a helpful
   overview + suggestions. Available to any active shop.
   ============================================================ */
const express = require("express");
const db = require("../db");
const { protect, requireActiveSub, branchScope } = require("../auth");

const router = express.Router();
router.use(protect);
router.use(requireActiveSub);

// Attach the shop name so downstream handlers can personalize the prompt.
router.use((req, _res, next) => {
  const d = db.read();
  const shop = d.shops.find((s) => s.id === req.user.shopId);
  req._shopName = shop ? shop.name : "Do'kon";
  next();
});

const DAY = 86400000;
const money = (n) =>
  Math.round(n || 0).toLocaleString("ru-RU").replace(/\u00a0/g, " ").replace(/,/g, " ");
const sum = (arr, k) => arr.reduce((a, x) => a + (x[k] || 0), 0);
const norm = (s) => (s || "").toLowerCase().replace(/[?.!,;:]/g, " ").replace(/\s+/g, " ").trim();
const hasAny = (q, ws) => ws.some((w) => q.includes(w));

/* ---------- In-code knowledge base of the app ---------- */
const HELP = {
  sotish: {
    keys: ["sotish", "sot", "kassa", "chek", "sotuv qilish", "sotuv qanday", "savdo qilish", "sotuvni yakunlash", "sotuvni bajarish"],
    text:
      "Sotish (kassa) qanday ishlaydi:\n" +
      "1. Chapdagi menyudan 'Sotish' bo'limini oching.\n" +
      "2. Mahsulotni topish uchun uch xil yo'l bor: nom/shtrix-kod bo'yicha qidiruv, kategoriya tugmasi, yoki 'Skanerlash' — kamera orqali shtrix-kod.\n" +
      "3. Mahsulot ustiga bosing — savatga tushadi. Sonini +/− bilan o'zgartirasiz.\n" +
      "4. Pastdan to'lov turini tanlang (Naqd, Karta, Click, Payme, Uzum yoki Nasiya).\n" +
      "5. Nasiya bo'lsa — mijozni tanlang (oldindan 'Mijozlar' bo'limida qo'shgan bo'lasiz), istasangiz oldindan to'lov summasi.\n" +
      "6. 'Sotish' tugmasini bosing — chek chiqadi, ombor avtomatik kamayadi.\n" +
      "Yuqoridagi filial almashtirgichdan boshqa filialga ham o'tib sotishingiz mumkin — sotuv o'sha filialga yoziladi.",
  },
  mahsulot: {
    keys: ["mahsulot qo", "mahsulot qanday", "ombor", "tovar qo", "kategoriya", "shtrix", "barcode", "yangi mahsulot", "mahsulot kirit"],
    text:
      "Mahsulot qo'shish:\n" +
      "1. 'Mahsulotlar' bo'limini oching → 'Mahsulot qo'shish'.\n" +
      "2. Nomi, shtrix-kod, sotuv narxi, tannarx, qoldiq va kam qoldiq chegarasini kiriting.\n" +
      "3. Kategoriyani o'zingiz yozasiz (masalan 'Ichimlik'). Keyingi safar avval yozganlaringiz avtomatik taklif qilinadi.\n" +
      "4. 'Saqlash' — mahsulot omborga qo'shiladi va Sotish sahifasida ko'rinadi.\n" +
      "Tannarxni to'g'ri kiriting — sof foyda shunga qarab hisoblanadi.",
  },
  nasiya: {
    keys: ["nasiya", "qarz", "kredit", "qarzga", "qarzdor", "qarz olib"],
    text:
      "Nasiya (qarzga sotish):\n" +
      "1. Sotishda savatga tovar solingach, to'lov turlaridan 'Nasiya' ni tanlang.\n" +
      "2. Mijoz tanlang. Agar hali mijoz qo'shmagan bo'lsangiz, avval 'Mijozlar' bo'limidan qo'shing.\n" +
      "3. Kerak bo'lsa oldindan to'lov summasini kiriting (masalan yarmini naqd berdi).\n" +
      "4. Sotuv yakunlanadi va 'Qarzlar' bo'limida ochiq qarz sifatida ko'rinadi.\n" +
      "Mijoz keyin pul olib kelsa: 'Qarzlar' → 'To'lash' → summa. Qoldiq avtomatik kamayadi.",
  },
  qaytarish: {
    keys: ["qaytar", "vozvrat", "qaytarib"],
    text:
      "Qaytarish:\n" +
      "1. 'Qaytarish' bo'limi → 'Yangi qaytarish'.\n" +
      "2. Mahsulotni qidirib toping va savatga qo'shing, sonini belgilang.\n" +
      "3. Sabab kiriting (masalan 'buzuq', 'muddati o'tgan').\n" +
      "4. Tasdiqlaganingizda mahsulot ombor qoldig'iga qayta qo'shiladi.",
  },
  filial: {
    keys: ["filial", "boshqa filial", "yangi filial", "filial qo'shish"],
    text:
      "Filiallar:\n" +
      "1. 'Filiallar' bo'limi → 'Filial qo'shish' bilan yangi filial (masalan 'Chilonzor filiali') qo'shing.\n" +
      "2. Yuqoridagi filial almashtirgich orqali istalgan filialga o'tib sotuv qiling — sotuv o'sha filialga yoziladi.\n" +
      "3. Har filial bo'yicha 30 kunlik tushum, foyda va sotuvlar soni ko'rinadi. Eng yaxshi filial 'Yetakchi' belgisi bilan chiqadi.",
  },
  arenda: {
    keys: ["arenda", "ijara", "kommunal", "ish haqi", "xarajat"],
    text:
      "Arenda va xarajatlar:\n" +
      "1. 'Arenda' bo'limidan 'Xarajat qo'shish' — nomi, summasi, turi (Arenda / Kommunal / Ish haqi / Boshqa) va to'lov muddati.\n" +
      "2. To'lagach 'To'landi' tugmasi bilan holatini o'zgartirasiz.\n" +
      "Yuqorida umumiy xarajat va to'lanmagan summa ko'rinadi.",
  },
  hisobot: {
    keys: ["foyda", "hisobot", "grafik", "marja", "daromad", "tushum"],
    text:
      "Foyda / hisobot:\n" +
      "'Foyda' bo'limida tushum, sof foyda, marja %, o'rtacha chek, 7 kunlik grafik, eng ko'p sotilganlar, to'lov turlari va kam qolgan mahsulotlar ko'rinadi. Yuqoridagi chiplar bilan davrni tanlaysiz (bugun / 7 kun / 30 kun).",
  },
  bosh: {
    keys: ["dashboard", "boshqaruv paneli", "asosiy sahifa"],
    text:
      "Boshqaruv paneli — do'koningizning bugungi holati: tushum, foyda, sotuvlar soni, umumiy qarz, 7 kunlik grafik, so'nggi cheklar va tez havolalar (kam qoldiq, mijozlar, foyda, qaytarish).",
  },
  muddat: {
    keys: ["muddat", "obuna", "tarif", "vaqt sotib", "muddat tugadi", "faollash", "muddat uzayti"],
    text:
      "Foydalanish muddati:\n" +
      "Do'kon vaqt asosida ishlaydi. Muddat tugasa panel qulflanadi va savdo to'xtaydi. Uzaytirish uchun 'Sozlamalar' → 'Vaqt sotib olish' orqali biz bilan bog'laning — kerakli kunga faollashtiramiz, panel darhol ochiladi.",
  },
  skaner: {
    keys: ["kamera", "skaner", "skanerlash", "shtrix-kod o'q"],
    text:
      "Kamera skaner:\n" +
      "Sotishda 'Skanerlash' tugmasi — kamera ochiladi, shtrix-kodni ko'rsatasiz, tovar savatga tushadi. Kamera faqat HTTPS yoki localhost'da ishlaydi (brauzer qoidasi). Kamera bo'lmasa qo'lda kod kiritish oynasi bor.",
  },
  ai: {
    keys: ["ai nima", "ai qanday", "sen kimsan", "sen nima qila", "yordamchi nima", "ai yordamchi"],
    text:
      "Men — Chaqmoqning ichki AI yordamchisiman. Uch narsani qila olaman:\n" +
      "• Biznes tahlili — foyda, marja, top mahsulotlar, qoldiq, qarzlar bo'yicha.\n" +
      "• Sayt yo'riqnomasi — 'qanday sotaman?', 'nasiya nima?' kabi savollarga javob.\n" +
      "• Aqlli tavsiyalar — do'koningizga qarab nima qilish kerakligi haqida maslahat.\n" +
      "Savolingizni oddiy o'zbek tilida yozing — men sizning do'koningiz ma'lumotlaridan foydalanaman.",
  },
};

/* ---------- Data snapshot for analytics ---------- */
function snapshot(shopId, scope = null) {
  const d = db.read();
  const inScope = (x) => !scope || (x.branchId || null) === scope;
  const sales = d.sales.filter((s) => s.shopId === shopId).filter(inScope);
  const products = d.products.filter((p) => p.shopId === shopId).filter(inScope);
  const customers = d.customers.filter((c) => c.shopId === shopId).filter(inScope);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const t0 = today.getTime();
  const week0 = Date.now() - 7 * DAY;
  const week0Prev = Date.now() - 14 * DAY;
  const m0 = Date.now() - 30 * DAY;
  const todays = sales.filter((s) => s.ts >= t0);
  const week = sales.filter((s) => s.ts >= week0);
  const weekPrev = sales.filter((s) => s.ts >= week0Prev && s.ts < week0);
  const month = sales.filter((s) => s.ts >= m0);

  const topMap = {};
  month.forEach((s) => s.items.forEach((it) => {
    const key = it.name;
    topMap[key] = topMap[key] || { qty: 0, sum: 0, profit: 0 };
    topMap[key].qty += it.qty;
    topMap[key].sum += it.price * it.qty;
    topMap[key].profit += (it.price - (it.cost || 0)) * it.qty;
  }));
  const top = Object.entries(topMap).map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.sum - a.sum);
  const bestProfit = [...top].sort((a, b) => b.profit - a.profit)[0] || null;
  const lowProfit = [...top].filter((x) => x.qty > 0).sort((a, b) => (a.profit / a.qty) - (b.profit / b.qty))[0] || null;

  // Slow movers: products that sold nothing in the month
  const soldNames = new Set(month.flatMap((s) => s.items.map((i) => i.name)));
  const slowMovers = products.filter((p) => p.stock > 0 && !soldNames.has(p.name)).slice(0, 8);

  // Customers with debt
  const debtByCustomer = {};
  sales.forEach((s) => {
    const out = Math.max(0, s.total - (s.paid ?? s.total));
    if (out > 0 && s.customerId) debtByCustomer[s.customerId] = (debtByCustomer[s.customerId] || 0) + out;
  });
  const topDebtors = Object.entries(debtByCustomer)
    .map(([id, amount]) => {
      const c = customers.find((x) => x.id === id);
      return { name: c ? c.name : "Noma'lum", phone: c ? c.phone : "", amount };
    })
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  return {
    today: { revenue: sum(todays, "total"), profit: sum(todays, "profit"), count: todays.length },
    week: { revenue: sum(week, "total"), profit: sum(week, "profit"), count: week.length },
    weekPrev: { revenue: sum(weekPrev, "total"), profit: sum(weekPrev, "profit"), count: weekPrev.length },
    month: { revenue: sum(month, "total"), profit: sum(month, "profit"), count: month.length },
    debt: sales.reduce((a, s) => a + Math.max(0, s.total - (s.paid ?? s.total)), 0),
    customers: customers.length,
    lowStock: products.filter((p) => p.stock <= p.low).map((p) => ({ name: p.name, stock: p.stock, low: p.low }))
      .sort((a, b) => a.stock - b.stock),
    top: top.slice(0, 10),
    bestProfit,
    lowProfit,
    slowMovers,
    topDebtors,
    productCount: products.length,
    hasData: sales.length > 0 || products.length > 0,
    hasSales: sales.length > 0,
  };
}

/* ---------- Answering ---------- */
function pickHelpTopic(q) {
  let best = null, bestScore = 0;
  for (const [name, t] of Object.entries(HELP)) {
    let s = 0;
    for (const k of t.keys) if (q.includes(k)) s += k.length; // longer match = better
    if (s > bestScore) { bestScore = s; best = name; }
  }
  return bestScore >= 3 ? best : null;
}

const trend = (curr, prev) => {
  if (!prev) return null;
  const p = ((curr - prev) / prev) * 100;
  return { p: Math.round(p), up: p >= 0 };
};

function businessAnswer(snap, q) {
  const L = [];
  const m = snap.month;
  const margin = m.revenue ? Math.round((m.profit / m.revenue) * 100) : 0;

  if (!snap.hasSales) {
    return "Hozircha sotuv ma'lumoti yo'q. 'Mahsulotlar' bo'limidan tovar qo'shing va 'Sotish' orqali bir nechta savdo qiling — shundan keyin foyda, marja, top mahsulotlar va qarzlar bo'yicha aniq tahlil beraman.";
  }

  // Debts
  if (hasAny(q, ["qarz", "nasiya", "qarzdor", "olib berish", "olib berilgan"])) {
    if (snap.debt > 0) {
      L.push(`Umumiy ochiq qarz: ${money(snap.debt)} so'm.`);
      if (snap.topDebtors.length) {
        L.push("Eng katta qarzdorlar:");
        snap.topDebtors.forEach((c, i) => L.push(`${i + 1}. ${c.name}${c.phone ? " (" + c.phone + ")" : ""} — ${money(c.amount)} so'm`));
      }
      L.push("Tavsiya: eng katta qarzdorlardan boshlab yig'ing, nasiyaga limit va muddat belgilang.");
    } else L.push("Ochiq qarzlar yo'q — barcha nasiyalar to'langan. 👍");
    return L.join("\n");
  }

  // Low stock
  if (hasAny(q, ["qoldiq", "kam qold", "tugab", "buyurtma", "zaxira", "ombordagi", "ombor holati"])) {
    if (snap.lowStock.length) {
      L.push(`Kam qolgan mahsulotlar (${snap.lowStock.length} ta):`);
      snap.lowStock.slice(0, 10).forEach((p) => L.push(`• ${p.name} — ${p.stock} dona qoldi (chegara: ${p.low})`));
      L.push("Tavsiya: bularni tez orada buyurtma qiling, aks holda mijoz boshqa do'konga ketadi.");
    } else L.push("Kam qoldiqli mahsulot yo'q — ombor holati yaxshi.");
    return L.join("\n");
  }

  // Profit / margin
  if (hasAny(q, ["foyda", "margin", "marja", "daromad", "oshir"])) {
    L.push(`So'nggi 30 kun: tushum ${money(m.revenue)} so'm, sof foyda ${money(m.profit)} so'm (marja ${margin}%).`);
    const t = trend(snap.week.revenue, snap.weekPrev.revenue);
    if (t) L.push(`Oxirgi 7 kun oldingi 7 kunga nisbatan: tushum ${t.up ? "↑" : "↓"} ${Math.abs(t.p)}%.`);
    if (snap.bestProfit) L.push(`Eng ko'p foyda keltirgan: "${snap.bestProfit.name}" — ${money(snap.bestProfit.profit)} so'm.`);
    if (snap.lowProfit && snap.lowProfit.name !== snap.bestProfit?.name)
      L.push(`Eng past marjali: "${snap.lowProfit.name}" — birlik foydasi past. Narxni ko'rib chiqing yoki yetkazib beruvchini almashtiring.`);
    L.push(margin < 15
      ? `Marja pastroq (${margin}%). Yuqori tannarxli tovarlarga narxni bir oz oshiring yoki yangi yetkazib beruvchi bilan gaplashing.`
      : `Marja yaxshi (${margin}%). Yuqori marjali mahsulotlarni ko'proq targ'ib qiling — Sotish sahifasida yuqoriga qo'ying.`);
    return L.join("\n");
  }

  // Top / best sellers
  if (hasAny(q, ["sotildi", "sotil", "top", "mashhur", "yaxshi sotil", "eng ko'p"])) {
    if (snap.top.length) {
      L.push("So'nggi 30 kun eng ko'p sotilgan (tushum bo'yicha):");
      snap.top.slice(0, 6).forEach((p, i) => L.push(`${i + 1}. ${p.name} — ${p.qty} dona, ${money(p.sum)} so'm (foyda: ${money(p.profit)})`));
      L.push("Tavsiya: yuqoridagilarni doim zaxirada saqlang — asosiy daromad manbai shular.");
    } else L.push("Bu davrda sotuv ma'lumoti yo'q.");
    return L.join("\n");
  }

  // Slow movers
  if (hasAny(q, ["sotilmagan", "sotilmayapti", "yomon", "past sotildi", "harakatsiz", "turib qolgan"])) {
    if (snap.slowMovers.length) {
      L.push(`30 kun ichida bir marta ham sotilmagan (${snap.slowMovers.length} ta):`);
      snap.slowMovers.forEach((p) => L.push(`• ${p.name} — ${p.stock} dona omborda turibdi`));
      L.push("Tavsiya: bularga aksiya/chegirma qo'ying yoki almashtiring — pul omborda qotib turibdi.");
    } else L.push("Barcha mahsulotlar 30 kun ichida sotilgan — harakatsiz tovar yo'q. 👍");
    return L.join("\n");
  }

  // Customers
  if (hasAny(q, ["mijoz", "xaridor"])) {
    L.push(`Mijozlar soni: ${snap.customers} ta. Umumiy ochiq qarz: ${money(snap.debt)} so'm.`);
    if (snap.topDebtors.length)
      L.push(`Eng katta qarzdor: ${snap.topDebtors[0].name} — ${money(snap.topDebtors[0].amount)} so'm.`);
    L.push("Tavsiya: doimiy mijozlar uchun chegirma yoki 'Nth-marta bepul' bonusi joriy qiling — takroriy sotuvni oshiradi.");
    return L.join("\n");
  }

  // Default: full overview
  return overview(snap);
}

function overview(snap) {
  if (!snap.hasSales) {
    return "Hozircha sotuv ma'lumoti yo'q. 'Mahsulotlar' bo'limidan tovar qo'shing va 'Sotish' orqali bir nechta savdo qiling — shundan keyin foyda, marja, top mahsulotlar va qarzlar bo'yicha aniq tahlil beraman.";
  }
  const L = ["📊 Do'kon holati:"];
  const t = snap.today, w = snap.week, m = snap.month;
  const margin = m.revenue ? Math.round((m.profit / m.revenue) * 100) : 0;
  L.push(`• Bugun: tushum ${money(t.revenue)} so'm, foyda ${money(t.profit)} so'm, ${t.count} ta sotuv.`);
  L.push(`• 7 kun: tushum ${money(w.revenue)} so'm, ${w.count} ta sotuv.`);
  const tr = trend(w.revenue, snap.weekPrev.revenue);
  if (tr) L.push(`  ${tr.up ? "↑" : "↓"} oldingi haftaga nisbatan ${Math.abs(tr.p)}%.`);
  L.push(`• 30 kun: tushum ${money(m.revenue)} so'm, foyda ${money(m.profit)} so'm (marja ${margin}%).`);
  if (snap.debt > 0) L.push(`• Ochiq qarz: ${money(snap.debt)} so'm.`);
  if (snap.lowStock.length) L.push(`• Kam qoldiq: ${snap.lowStock.length} ta mahsulot buyurtma kutmoqda.`);
  if (snap.bestProfit) L.push(`• Eng foydali: "${snap.bestProfit.name}" — ${money(snap.bestProfit.profit)} so'm foyda.`);
  L.push("");
  L.push("Tavsiyalar:");
  const recs = [];
  if (snap.lowStock.length) recs.push(`Kam qolgan ${snap.lowStock.length} ta mahsulotni buyurtma qiling — eng oldin: ${snap.lowStock.slice(0, 3).map((p) => p.name).join(", ")}.`);
  if (snap.debt > 0) recs.push(`${money(snap.debt)} so'm qarzni yig'ishni rejalashtiring.`);
  if (margin < 15 && m.revenue) recs.push(`Marja past (${margin}%) — narx siyosatini qayta ko'ring.`);
  if (snap.slowMovers.length >= 3) recs.push(`${snap.slowMovers.length} ta mahsulot 30 kun ichida sotilmagan — aksiya qo'ying.`);
  if (snap.bestProfit) recs.push(`"${snap.bestProfit.name}" kabi top mahsulotlarni ko'proq zaxiralang va Sotish sahifasida yuqoriga qo'ying.`);
  if (!recs.length) recs.push("Ko'rsatkichlar barqaror. Reklama va takroriy mijoz bonusi orqali o'sishni davom ettiring.");
  recs.forEach((r) => L.push(`• ${r}`));
  return L.join("\n");
}

function answer(snap, question) {
  const q = norm(question);

  if (!q) return overview(snap);

  const topic = pickHelpTopic(q);
  const businessLike = hasAny(q, ["foyda", "tushum", "marja", "qarz", "qarzdor", "qoldiq", "sotildi", "sotilgan", "sotilmagan", "sotilmayap", "mijoz", "top", "hisobot", "daromad", "eng ko'p", "ko'p sotil", "ko'p sotildi"]);

  // Overview / advice triggers
  if (hasAny(q, ["umumiy tahlil", "tahlil qilib", "to'liq tahlil", "vaziyat", "umumiy holat"])) {
    return overview(snap);
  }
  if (hasAny(q, ["nima qilay", "nima qilishim", "qanday qilay", "maslahat"])) {
    return overview(snap);
  }

  // Business questions win over how-to when both match, so "nima ko'p
  // sotildi" doesn't get routed to the "Sotish qanday" tutorial.
  if (businessLike) return businessAnswer(snap, q);

  // Otherwise, if we found a help topic, serve it.
  if (topic) return HELP[topic].text;

  if (hasAny(q, ["salom", "assalom", "hello"])) {
    return "Salom! Men Chaqmoqning AI yordamchisiman. Sizga uch narsada yordam bera olaman:\n" +
      "• Biznes tahlili — 'foyda qanday?', 'nima ko'p sotildi?', 'qarzlar holati?'.\n" +
      "• Sayt yo'riqnomasi — 'qanday sotaman?', 'nasiya nima?', 'filial qanday qo'shiladi?'.\n" +
      "• Umumiy holat — 'umumiy tahlil qilib ber' desangiz.\n" +
      "Qaysi biri qiziq?";
  }

  return overview(snap) + "\n\nAgar sayt bo'yicha savol bo'lsa, masalan 'qanday sotaman?', 'nasiya nima?', 'filial qanday qo'shaman?' — javob beraman.";
}

// POST /api/ai/chat  { messages:[{role, content}] }
router.post("/chat", async (req, res) => {
  const raw = Array.isArray(req.body?.messages) ? req.body.messages : [];
  const messages = raw
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-12)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }));
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  const question = lastUser ? lastUser.content : "";
  const snap = snapshot(req.user.shopId, branchScope(req));

  const key = process.env.ANTHROPIC_API_KEY;
  if (key) {
    try {
      const reply = await claudeReply(key, snap, messages, req._shopName || "Do'kon");
      return res.json({ reply, source: "claude" });
    } catch (e) {
      console.error("Claude fallback:", e.message);
      // fall through to local
    }
  }
  res.json({ reply: answer(snap, question), source: "local" });
});

/* ---------- Claude bridge ---------- */
async function claudeReply(key, snap, messages, shopName) {
  const HELP_INDEX = Object.entries(HELP)
    .map(([k, v]) => `### ${k}\n${v.text}`)
    .join("\n\n");

  const system =
    `Sen "${shopName}" do'koni uchun Chaqmoq POS tizimining AI yordamchisisan.\n` +
    `QOIDALAR:\n` +
    `- Faqat o'zbek tilida, lotin yozuvida javob ber. Kirill yozuvini ishlatma.\n` +
    `- Qisqa, aniq, amaliy. Ortiqcha kirish so'zlarisiz.\n` +
    `- Raqamlarni so'mda ko'rsat va probel bilan ajrat (masalan: 1 250 000 so'm).\n` +
    `- Do'konning haqiqiy ma'lumotlariga tayan. Ma'lumot yetarli bo'lmasa ochiq ayt.\n` +
    `- Ikkita vazifang bor: (1) biznes tahlili — foyda, marja, top mahsulot, qoldiq, qarz, mijozlar; (2) sayt yo'riqnomasi — qanday sotish, mahsulot qo'shish, nasiya, qaytarish, filial va boshqalar.\n\n` +
    `DO'KON MA'LUMOTLARI (JSON):\n${JSON.stringify(snap)}\n\n` +
    `SAYT YO'RIQNOMASI (mavzular):\n${HELP_INDEX}`;

  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: process.env.AI_MODEL || "claude-haiku-4-5-20251001",
      max_tokens: 800,
      system,
      messages,
    }),
  });
  if (!r.ok) {
    const txt = await r.text();
    throw new Error(`Claude ${r.status}: ${txt.slice(0, 200)}`);
  }
  const data = await r.json();
  const text = (data.content || [])
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();
  return text || "Javob topilmadi.";
}

module.exports = router;
