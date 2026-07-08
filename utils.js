/* ============================================================
   Chaqmoq — design system
   Majolica teal + pomegranate + saffron · girih signature
   ============================================================ */
:root{
  --ink:#11313A; --ink-2:#5C6E73;
  --bg:#EEEBE1; --surface:#FFFFFF; --surface-2:#FAF8F2;
  --brand:#0F6E78; --brand-700:#0B4F58; --brand-900:#063139;
  --gold:#C2922E; --gold-soft:#F0E2C0;
  --anor:#A6342A; --ok:#2E7D5B; --ok-soft:#E2F0E8;
  --warn:#B9791C; --warn-soft:#F7ECD4;
  --danger:#A6342A; --danger-soft:#F4E0DC;
  --line:#E3DDCE; --line-strong:#D3CCB9;
  --shadow:0 1px 2px rgba(6,49,57,.06), 0 10px 30px rgba(6,49,57,.06);
  --shadow-lg:0 24px 60px rgba(6,49,57,.22);
  --radius:14px; --radius-sm:10px;
}
*{box-sizing:border-box}
html,body,#root{height:100%}
body{margin:0;font-family:"Inter",system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color:var(--ink);background:var(--bg);-webkit-font-smoothing:antialiased;font-variant-numeric:tabular-nums}
button{font-family:inherit;cursor:pointer}
input,select{font-family:inherit}
a{color:inherit;text-decoration:none}
h1,h2,h3,h4{font-family:"Space Grotesk",system-ui,sans-serif;margin:0;letter-spacing:-.01em}
.num{font-family:"Space Grotesk",system-ui,sans-serif;font-variant-numeric:tabular-nums}
.boot{height:100vh;display:grid;place-items:center;color:var(--ink-2)}

/* ---------- Buttons ---------- */
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;border:1px solid var(--line-strong);border-radius:11px;padding:11px 16px;font-size:14px;font-weight:600;line-height:1;background:var(--surface);color:var(--ink);transition:transform .05s,box-shadow .15s,background .15s}
.btn:hover{box-shadow:var(--shadow)}
.btn:active{transform:translateY(1px)}
.btn svg{width:17px;height:17px}
.btn.primary{background:var(--brand);color:#fff;border-color:var(--brand)}
.btn.primary:hover{background:var(--brand-700)}
.btn.gold{background:var(--gold);color:#3a2c08;border-color:var(--gold)}
.btn.ghost{background:transparent;border-color:transparent;color:var(--ink-2)}
.btn.ghost:hover{background:var(--surface-2);box-shadow:none}
.btn.lg{padding:15px 20px;font-size:15.5px;border-radius:13px}
.btn.block{width:100%}
.btn:disabled{opacity:.5;cursor:not-allowed}
.card{background:var(--surface);border:1px solid var(--line);border-radius:var(--radius);box-shadow:var(--shadow)}

/* ============================================================
   PANEL SHELL
   ============================================================ */
.app{display:grid;grid-template-columns:248px 1fr;min-height:100vh}
.side{position:relative;background:linear-gradient(170deg,var(--brand-900),var(--brand-700));color:#DCEDEC;padding:22px 16px;display:flex;flex-direction:column;gap:8px;overflow:hidden}
.side::after{content:"";position:absolute;right:-90px;bottom:-70px;width:320px;height:320px;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><g fill='none' stroke='%23ffffff' stroke-width='1.4'><polygon points='50,4 61,39 96,39 68,61 79,96 50,74 21,96 32,61 4,39 39,39'/><polygon points='50,18 57,40 80,40 62,54 69,76 50,63 31,76 38,54 20,40 43,40'/><circle cx='50' cy='50' r='9'/></g></svg>");background-size:contain;background-repeat:no-repeat;opacity:.07;pointer-events:none}
.brand{display:flex;align-items:center;gap:12px;padding:6px 8px 18px;position:relative;z-index:1}
.brand .mark,.lbrand .mark,.auth-brand .mark{width:42px;height:42px;flex:0 0 auto;border-radius:12px;background:radial-gradient(120% 120% at 30% 20%,#1A8B97,var(--brand));display:grid;place-items:center;box-shadow:inset 0 0 0 1px rgba(255,255,255,.14)}
.brand .mark svg{width:24px;height:24px}
.brand .name{font-family:"Space Grotesk",sans-serif;font-weight:700;font-size:20px;color:#fff;line-height:1}
.brand .tag{font-size:11px;color:#9FCBCB;margin-top:3px;letter-spacing:.02em}
.nav{display:flex;flex-direction:column;gap:4px;margin-top:4px;position:relative;z-index:1}
.nav a{display:flex;align-items:center;gap:12px;width:100%;color:#BFE0DF;padding:12px;border-radius:11px;font-size:14.5px;font-weight:500;border-left:3px solid transparent;transition:background .15s,color .15s}
.nav a svg{width:19px;height:19px;flex:0 0 auto;opacity:.85}
.nav a:hover{background:rgba(255,255,255,.07);color:#fff}
.nav a.active{background:rgba(255,255,255,.12);color:#fff;border-left-color:var(--gold)}
.nav a.active svg{opacity:1}
.side-foot{margin-top:auto;position:relative;z-index:1;padding:8px;display:flex;flex-direction:column;gap:12px}
.netpill{display:inline-flex;align-items:center;gap:8px;font-size:12px;font-weight:600;padding:7px 11px;border-radius:999px;background:rgba(255,255,255,.08);color:#CFE8E7;align-self:flex-start}
.netpill .dot{width:8px;height:8px;border-radius:50%;background:var(--ok);box-shadow:0 0 0 4px rgba(46,125,91,.25)}
.netpill.off .dot{background:var(--gold);box-shadow:0 0 0 4px rgba(194,146,46,.22)}
.logout{display:flex;align-items:center;gap:9px;background:transparent;border:0;color:#9FCBCB;font-size:13.5px;font-weight:500;padding:4px}
.logout svg{width:17px;height:17px}
.logout:hover{color:#fff}

.main{display:flex;flex-direction:column;min-width:0}
.topbar{display:flex;align-items:center;gap:16px;padding:16px 26px;background:var(--surface);border-bottom:1px solid var(--line)}
.topbar .shop{font-family:"Space Grotesk",sans-serif;font-weight:600;font-size:16px}
.topbar .shop small{display:block;color:var(--ink-2);font-size:12px;font-weight:400;font-family:"Inter"}
.spacer{flex:1}
.topbar .date{color:var(--ink-2);font-size:13px}
.topbar .cashier{display:flex;align-items:center;gap:9px;font-size:13px;font-weight:600;padding:6px 12px 6px 6px;border:1px solid var(--line);border-radius:999px;background:var(--surface-2)}
.topbar .av{width:30px;height:30px;border-radius:50%;background:var(--brand);color:#fff;display:grid;place-items:center;font-size:12px;font-weight:700}
.view{padding:26px;flex:1;min-height:0}
.view-head{display:flex;align-items:flex-end;gap:14px;margin-bottom:20px}
.view-head h2{font-size:24px;font-weight:700}
.view-head p{margin:4px 0 0;color:var(--ink-2);font-size:13.5px}

.empty{text-align:center;color:var(--ink-2);padding:40px 20px}
.empty.span{grid-column:1/-1}
.empty.big p{margin-bottom:14px}

/* ============================================================
   KASSA
   ============================================================ */
.pos{display:grid;grid-template-columns:1fr 380px;gap:20px;height:calc(100vh - 73px - 52px - 20px)}
.pos-left{display:flex;flex-direction:column;min-height:0}
.scanbar{display:flex;gap:10px;margin-bottom:14px}
.scanbar .field{position:relative;flex:1}
.scanbar .field svg{position:absolute;left:14px;top:50%;transform:translateY(-50%);width:18px;height:18px;color:var(--ink-2)}
.scanbar input{width:100%;padding:14px 14px 14px 42px;border:1px solid var(--line-strong);border-radius:12px;background:var(--surface);font-size:15px;color:var(--ink);outline:none}
.scanbar input:focus{border-color:var(--brand);box-shadow:0 0 0 4px rgba(15,110,120,.12)}
.cat-chips{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px}
.chip{padding:7px 13px;border-radius:999px;border:1px solid var(--line-strong);background:var(--surface);font-size:12.5px;font-weight:600;color:var(--ink-2)}
.chip.active{background:var(--ink);color:#fff;border-color:var(--ink)}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px;overflow:auto;padding:2px;align-content:start}
.prod{text-align:left;background:var(--surface);border:1px solid var(--line);border-radius:var(--radius-sm);padding:14px;display:flex;flex-direction:column;gap:6px;transition:border-color .12s,box-shadow .12s,transform .05s}
.prod:hover{border-color:var(--brand);box-shadow:var(--shadow)}
.prod:active{transform:translateY(1px)}
.prod .pname{font-weight:600;font-size:14px;line-height:1.25;min-height:35px}
.prod .pprice{font-family:"Space Grotesk";font-weight:700;font-size:16px;color:var(--brand)}
.prod .pstock{font-size:11.5px;color:var(--ink-2)}
.prod .pstock.low{color:var(--warn);font-weight:600}
.prod .pstock.out{color:var(--danger);font-weight:600}
.prod:disabled{opacity:.55;cursor:not-allowed}
.prod:disabled:hover{border-color:var(--line);box-shadow:none}

.cart{display:flex;flex-direction:column;min-height:0}
.cart-head{padding:16px 18px;border-bottom:1px solid var(--line);display:flex;align-items:center;justify-content:space-between}
.cart-head h3{font-size:16px}
.cart-head .clear{font-size:12.5px;color:var(--danger);background:none;border:0;font-weight:600}
.cart-items{flex:1;overflow:auto;padding:8px 10px}
.line{display:grid;grid-template-columns:1fr auto;gap:6px 10px;padding:10px 8px;border-bottom:1px solid var(--surface-2)}
.line .lname{font-weight:600;font-size:13.5px}
.line .lunit{font-size:12px;color:var(--ink-2)}
.line .lsum{font-family:"Space Grotesk";font-weight:700;align-self:start;white-space:nowrap}
.qty{display:flex;align-items:center;gap:8px;grid-column:1/-1;margin-top:2px}
.qty button{width:28px;height:28px;border-radius:8px;border:1px solid var(--line-strong);background:var(--surface);font-size:16px;line-height:1;display:grid;place-items:center;color:var(--ink)}
.qty button:hover{border-color:var(--brand);color:var(--brand)}
.qty .q{min-width:30px;text-align:center;font-weight:700;font-family:"Space Grotesk"}
.qty .rm{margin-left:auto;border:0;background:none;color:var(--danger);font-size:12.5px;font-weight:600}
.cart-empty{flex:1;display:grid;place-items:center;text-align:center;color:var(--ink-2);padding:30px;align-content:center}
.cart-empty svg{width:46px;height:46px;opacity:.4;margin-bottom:10px}
.cart-empty b{display:block;color:var(--ink);font-weight:600;margin-bottom:3px}
.cart-empty span{font-size:13px}
.cart-foot{border-top:1px solid var(--line);padding:16px 18px;background:var(--surface-2);border-radius:0 0 var(--radius) var(--radius)}
.totals{display:flex;flex-direction:column;gap:7px;margin-bottom:14px}
.totals .row{display:flex;justify-content:space-between;font-size:13.5px;color:var(--ink-2)}
.totals .row.grand{font-family:"Space Grotesk";font-weight:700;font-size:22px;color:var(--ink);align-items:baseline;margin-top:4px}
.totals .row.grand span:last-child{color:var(--brand)}
.pays{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-bottom:12px}
.pay{padding:9px 6px;border-radius:9px;border:1px solid var(--line-strong);background:var(--surface);font-size:12.5px;font-weight:600;color:var(--ink-2)}
.pay.active{border-color:var(--brand);background:#E9F4F4;color:var(--brand)}

/* ============================================================
   OMBOR
   ============================================================ */
.toolbar{display:flex;gap:10px;align-items:center;margin-bottom:16px}
.search{position:relative;flex:1;max-width:360px}
.search svg{position:absolute;left:13px;top:50%;transform:translateY(-50%);width:17px;height:17px;color:var(--ink-2)}
.search input{width:100%;padding:11px 12px 11px 38px;border:1px solid var(--line-strong);border-radius:11px;background:var(--surface);outline:none;font-size:14px}
.search input:focus{border-color:var(--brand);box-shadow:0 0 0 4px rgba(15,110,120,.12)}
table{width:100%;border-collapse:collapse;background:var(--surface);border-radius:var(--radius);overflow:hidden}
thead th{text-align:left;font-size:11.5px;text-transform:uppercase;letter-spacing:.04em;color:var(--ink-2);font-weight:600;padding:13px 16px;background:var(--surface-2);border-bottom:1px solid var(--line)}
tbody td{padding:13px 16px;border-bottom:1px solid var(--line);font-size:14px;vertical-align:middle}
tbody tr:last-child td{border-bottom:0}
tbody tr:hover{background:var(--surface-2)}
td.r,th.r{text-align:right}
.tname{font-weight:600}
.tbarcode{font-size:12px;color:var(--ink-2);font-family:"Space Grotesk"}
.pill{display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:999px;font-size:12px;font-weight:600}
.pill.ok{background:var(--ok-soft);color:var(--ok)}
.pill.low{background:var(--warn-soft);color:var(--warn)}
.pill.out{background:var(--danger-soft);color:var(--danger)}
.cat-tag{font-size:12px;color:var(--ink-2);background:var(--surface-2);border:1px solid var(--line);padding:3px 9px;border-radius:7px}
.rowact{display:flex;gap:6px;justify-content:flex-end}
.iconbtn{width:32px;height:32px;border-radius:9px;border:1px solid var(--line);background:var(--surface);display:grid;place-items:center;color:var(--ink-2)}
.iconbtn:hover{border-color:var(--brand);color:var(--brand)}
.iconbtn.del:hover{border-color:var(--danger);color:var(--danger)}
.iconbtn svg{width:16px;height:16px}

/* ============================================================
   HISOBOT
   ============================================================ */
.kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:22px}
.kpi{padding:18px;position:relative;overflow:hidden}
.kpi .klabel{font-size:12.5px;color:var(--ink-2);font-weight:600;margin-bottom:8px}
.kpi .kval{font-family:"Space Grotesk";font-weight:700;font-size:26px;line-height:1.1}
.kpi .kval small{font-size:14px;color:var(--ink-2);font-weight:600;margin-left:4px}
.kpi .kicon{position:absolute;top:16px;right:16px;width:34px;height:34px;border-radius:10px;display:grid;place-items:center}
.kpi .kicon svg{width:18px;height:18px}
.kpi.teal .kicon{background:#E3F1F1;color:var(--brand)}
.kpi.gold .kicon{background:var(--gold-soft);color:var(--gold)}
.kpi.green .kicon{background:var(--ok-soft);color:var(--ok)}
.kpi.anor .kicon{background:var(--danger-soft);color:var(--anor)}
.report-grid{display:grid;grid-template-columns:1.5fr 1fr;gap:16px}
.panel{padding:18px}
.panel h3{font-size:15px;margin-bottom:4px}
.panel .sub{font-size:12.5px;color:var(--ink-2);margin-bottom:16px}
.chart{display:flex;align-items:flex-end;gap:10px;height:200px;padding-top:10px}
.bar-col{flex:1;display:flex;flex-direction:column;align-items:center;gap:8px;height:100%;justify-content:flex-end}
.bar-wrap{width:100%;display:flex;align-items:flex-end;justify-content:center;flex:1}
.bar{width:60%;max-width:46px;border-radius:6px 6px 0 0;background:linear-gradient(180deg,var(--brand),var(--brand-700));min-height:3px;transition:height .4s;position:relative}
.bar:hover::after{content:attr(data-v);position:absolute;bottom:100%;left:50%;transform:translateX(-50%);background:var(--ink);color:#fff;font-size:11px;padding:3px 7px;border-radius:6px;white-space:nowrap;margin-bottom:6px}
.bar-day{font-size:11px;color:var(--ink-2)}
.toplist{display:flex;flex-direction:column;gap:2px}
.toprow{display:flex;align-items:center;gap:12px;padding:10px 4px;border-bottom:1px solid var(--surface-2)}
.toprow:last-child{border-bottom:0}
.toprow .rank{width:24px;height:24px;border-radius:7px;background:var(--surface-2);color:var(--ink-2);display:grid;place-items:center;font-size:12px;font-weight:700;font-family:"Space Grotesk"}
.toprow:first-child .rank{background:var(--gold);color:#3a2c08}
.toprow .tn{flex:1;font-size:13.5px;font-weight:500}
.toprow .tq{font-size:12.5px;color:var(--ink-2)}
.toprow .ts{font-family:"Space Grotesk";font-weight:700;font-size:13.5px}
.lowlist{display:flex;flex-direction:column;gap:8px}
.lowitem{display:flex;align-items:center;gap:10px;padding:11px 13px;border:1px solid var(--warn-soft);background:#FCF7EC;border-radius:11px}
.lowitem .ln{flex:1;font-size:13.5px;font-weight:600}
.lowitem .lq{font-family:"Space Grotesk";font-weight:700;color:var(--warn)}

/* ============================================================
   MODAL / TOAST / RECEIPT / SCANNER
   ============================================================ */
.overlay{position:fixed;inset:0;background:rgba(6,49,57,.42);backdrop-filter:blur(3px);display:grid;place-items:center;z-index:50;padding:20px}
.modal{background:var(--surface);border-radius:18px;box-shadow:var(--shadow-lg);width:100%;max-width:460px;overflow:hidden;animation:pop .18s ease}
.scanner-modal{max-width:420px}
@keyframes pop{from{transform:translateY(8px) scale(.98);opacity:0}to{transform:none;opacity:1}}
.modal-head{padding:20px 22px 0;display:flex;justify-content:space-between;align-items:flex-start}
.modal-head h3{font-size:18px}
.modal-head .x{border:0;background:var(--surface-2);width:32px;height:32px;border-radius:9px;font-size:18px;color:var(--ink-2);line-height:1}
.modal-body{padding:16px 22px 22px}
.fgrid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.f{display:flex;flex-direction:column;gap:6px;margin-bottom:14px}
.f.full{grid-column:1/-1}
.f label{font-size:12.5px;font-weight:600;color:var(--ink-2)}
.f input,.f select{padding:11px 12px;border:1px solid var(--line-strong);border-radius:10px;font-size:14px;outline:none;background:var(--surface);color:var(--ink)}
.f input:focus,.f select:focus{border-color:var(--brand);box-shadow:0 0 0 4px rgba(15,110,120,.12)}
.modal-foot{display:flex;gap:10px;margin-top:6px}

.receipt{text-align:center}
.receipt .check{width:62px;height:62px;border-radius:50%;background:var(--ok-soft);color:var(--ok);display:grid;place-items:center;margin:6px auto 14px}
.receipt .check svg{width:30px;height:30px}
.receipt h3{font-size:20px}
.receipt .rnum{color:var(--ink-2);font-size:13px;margin-top:4px}
.rlines{text-align:left;border-top:1px dashed var(--line-strong);border-bottom:1px dashed var(--line-strong);margin:18px 0;padding:12px 0;display:flex;flex-direction:column;gap:7px}
.rlines .rl{display:flex;justify-content:space-between;font-size:13.5px}
.rlines .rl span:first-child{color:var(--ink-2)}
.rtotal{display:flex;justify-content:space-between;align-items:baseline;font-family:"Space Grotesk";font-weight:700;font-size:20px;margin-bottom:18px}
.rtotal .rt-pay{font-size:12px;color:var(--ink-2);font-weight:500;font-family:"Inter"}

.scan-hint{font-size:13px;color:var(--ink-2);text-align:center;margin:0 0 12px}
.scan-frame{position:relative;border-radius:14px;overflow:hidden;background:#06181C;aspect-ratio:1.4;display:grid;place-items:center}
.scan-frame #chaqmoq-scan-region{width:100%}
.scan-frame #chaqmoq-scan-region video{width:100%!important;height:100%!important;object-fit:cover;display:block}
.scan-laser{position:absolute;left:8%;right:8%;height:2px;background:var(--gold);box-shadow:0 0 12px 2px rgba(194,146,46,.7);top:50%;animation:laser 2s ease-in-out infinite;pointer-events:none}
@keyframes laser{0%,100%{top:28%}50%{top:72%}}
.scan-error{margin-top:12px;padding:12px;border-radius:11px;background:var(--warn-soft);color:var(--warn);font-size:13px;text-align:center}
.scan-status{margin:14px 0;text-align:center;font-size:13px;color:var(--ink-2)}
.scan-status code{font-family:"Space Grotesk";background:var(--surface-2);padding:2px 7px;border-radius:6px;color:var(--ink)}
.scan-manual{display:flex;gap:8px;margin-bottom:12px}
.scan-manual input{flex:1;padding:11px 12px;border:1px solid var(--line-strong);border-radius:10px;font-size:14px;outline:none}
.scan-manual input:focus{border-color:var(--brand);box-shadow:0 0 0 4px rgba(15,110,120,.12)}

.toast-wrap{position:fixed;bottom:22px;left:50%;transform:translateX(-50%);z-index:90;display:flex;flex-direction:column;gap:8px;align-items:center}
.toast{background:var(--ink);color:#fff;padding:12px 18px;border-radius:11px;font-size:14px;font-weight:500;box-shadow:var(--shadow-lg);animation:rise .2s ease}
.toast.warn{background:var(--warn)}
.toast.ok{background:var(--ok)}
@keyframes rise{from{transform:translateY(10px);opacity:0}to{transform:none;opacity:1}}

/* ============================================================
   AUTH
   ============================================================ */
.auth{min-height:100vh;display:grid;grid-template-columns:1fr 1fr}
.auth-art{position:relative;background:linear-gradient(170deg,var(--brand-900),var(--brand-700));color:#DCEDEC;padding:40px;display:flex;flex-direction:column;overflow:hidden}
.auth-art::after{content:"";position:absolute;right:-120px;bottom:-120px;width:460px;height:460px;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><g fill='none' stroke='%23ffffff' stroke-width='1.2'><polygon points='50,4 61,39 96,39 68,61 79,96 50,74 21,96 32,61 4,39 39,39'/><polygon points='50,18 57,40 80,40 62,54 69,76 50,63 31,76 38,54 20,40 43,40'/><circle cx='50' cy='50' r='9'/></g></svg>");background-size:contain;background-repeat:no-repeat;opacity:.08}
.auth-brand,.lbrand{display:inline-flex;align-items:center;gap:12px;font-family:"Space Grotesk";font-weight:700;font-size:20px;color:#fff;position:relative;z-index:1}
.auth-brand .mark{width:38px;height:38px}.lbrand .mark{width:36px;height:36px}
.auth-art-body{margin-top:auto;position:relative;z-index:1}
.auth-art-body h1{font-size:34px;color:#fff;line-height:1.1;margin-bottom:14px}
.auth-art-body p{color:#A9D2D1;font-size:15px;max-width:360px;line-height:1.5}
.auth-feats{list-style:none;padding:0;margin:26px 0 0;display:flex;flex-direction:column;gap:11px}
.auth-feats li{position:relative;padding-left:26px;font-size:14px;color:#CFE8E7}
.auth-feats li::before{content:"";position:absolute;left:0;top:3px;width:16px;height:16px;border-radius:50%;background:var(--gold);background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%233a2c08' stroke-width='3'><path d='M20 6 9 17l-5-5'/></svg>");background-size:11px;background-repeat:no-repeat;background-position:center}
.auth-form-wrap{display:grid;place-items:center;padding:40px}
.auth-form{width:100%;max-width:380px}
.auth-tabs{display:flex;gap:6px;background:var(--surface-2);border:1px solid var(--line);padding:5px;border-radius:12px;margin-bottom:24px}
.auth-tabs button{flex:1;border:0;background:transparent;padding:10px;border-radius:9px;font-size:14px;font-weight:600;color:var(--ink-2)}
.auth-tabs button.active{background:var(--surface);color:var(--ink);box-shadow:var(--shadow)}
.auth-foot{text-align:center;font-size:13.5px;color:var(--ink-2);margin-top:16px}
.link{border:0;background:none;color:var(--brand);font-weight:600;font-size:13.5px}

/* ============================================================
   LANDING
   ============================================================ */
.land{background:var(--bg)}
.lnav{position:sticky;top:0;z-index:30;background:rgba(238,235,225,.85);backdrop-filter:blur(10px);border-bottom:1px solid var(--line)}
.lnav-in{max-width:1140px;margin:0 auto;padding:14px 24px;display:flex;align-items:center;gap:24px}
.lnav .lbrand{color:var(--ink)}
.lnav-links{display:flex;gap:24px;margin-left:20px;flex:1}
.lnav-links a{font-size:14px;color:var(--ink-2);font-weight:500}
.lnav-links a:hover{color:var(--ink)}
.lnav-cta{display:flex;gap:10px;align-items:center}
/* Nav "Kirish" — solid teal button, clearly clickable at every width */
.lnav-cta a.btn.ghost,
.lnav-cta .btn.ghost{
  background:var(--brand);color:#fff;border:1px solid var(--brand);
  padding:9px 18px;font-size:13.5px;font-weight:700;
  border-radius:10px;text-decoration:none;
  display:inline-flex;align-items:center;gap:6px;
  transition:background .18s ease,transform .12s ease;
}
.lnav-cta a.btn.ghost:hover,
.lnav-cta .btn.ghost:hover{background:var(--brand-700);color:#fff;transform:translateY(-1px)}
.lnav-cta .btn.primary{
  background:var(--brand-900);color:#fff;border:1px solid var(--brand-900);
  padding:9px 18px;font-size:13.5px;font-weight:700;
}
.lnav-cta .btn.primary:hover{background:#052a30;color:#fff}

.hero{padding:70px 24px 60px}
.hero-grid{max-width:1140px;margin:0 auto;display:grid;grid-template-columns:1.05fr .95fr;gap:50px;align-items:center}
.eyebrow{display:inline-block;font-size:12.5px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--brand);background:#E3F1F1;padding:6px 12px;border-radius:999px;margin-bottom:18px}
.eyebrow.center{display:block;width:max-content;margin:0 auto 14px}
.hero-copy h1{font-size:52px;line-height:1.04;letter-spacing:-.02em;margin-bottom:18px}
.hero-copy p{font-size:17px;color:var(--ink-2);line-height:1.55;max-width:480px;margin-bottom:28px}
.hero-actions{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:24px}
.hero-trust{display:flex;gap:18px;flex-wrap:wrap;font-size:13px;color:var(--ink-2);font-weight:500}

.hero-card{justify-self:center;width:300px;background:#0A4049;border-radius:30px;padding:14px;box-shadow:var(--shadow-lg)}
.ph-top{display:flex;gap:6px;justify-content:center;padding:8px 0 14px}
.ph-dot{width:7px;height:7px;border-radius:50%;background:rgba(255,255,255,.3)}
.ph-body{background:var(--surface);border-radius:20px;padding:18px}
.ph-scan{position:relative;height:96px;border-radius:14px;background:#06181C;display:grid;place-items:center;margin-bottom:16px;overflow:hidden}
.ph-scan svg{width:60px;height:60px}
.ph-laser{position:absolute;left:10%;right:10%;height:2px;background:var(--gold);box-shadow:0 0 12px 2px rgba(194,146,46,.7);animation:laser 2s ease-in-out infinite}
.ph-line{display:flex;justify-content:space-between;align-items:center;padding:9px 2px;border-bottom:1px solid var(--surface-2);font-size:13.5px}
.ph-line b{font-family:"Space Grotesk"}
.ph-line.muted{color:var(--ink-2)}
.ph-total{display:flex;justify-content:space-between;align-items:baseline;padding:14px 2px 6px;font-family:"Space Grotesk";font-weight:700;font-size:17px}
.ph-total b{color:var(--brand)}
.ph-pay{margin-top:10px;background:var(--brand);color:#fff;text-align:center;padding:12px;border-radius:12px;font-weight:600;font-size:15px}

.section{padding:72px 24px}
.section.alt{background:var(--surface)}
.section-in{max-width:1140px;margin:0 auto}
.section-title{font-size:34px;text-align:center;letter-spacing:-.02em;margin-bottom:42px}
.feat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
.feat{background:var(--surface);border:1px solid var(--line);border-radius:var(--radius);padding:24px;box-shadow:var(--shadow)}
.section.alt .feat{background:var(--surface-2)}
.feat-ic{width:48px;height:48px;border-radius:13px;background:#E3F1F1;color:var(--brand);display:grid;place-items:center;margin-bottom:16px}
.feat-ic svg{width:24px;height:24px}
.feat h3{font-size:17px;margin-bottom:8px}
.feat p{font-size:14px;color:var(--ink-2);line-height:1.5}

.cmp{max-width:760px;margin:0 auto;border:1px solid var(--line);border-radius:var(--radius);overflow:hidden;background:var(--bg)}
.cmp-row{display:grid;grid-template-columns:1fr 130px 130px;align-items:center;padding:15px 20px;border-bottom:1px solid var(--line);font-size:14.5px}
.cmp-row:last-child{border-bottom:0}
.cmp-row>div:not(:first-child){text-align:center}
.cmp-head{background:var(--surface);font-family:"Space Grotesk";font-weight:600;font-size:13px;color:var(--ink-2);text-transform:uppercase;letter-spacing:.03em}
.cmp-head .cmp-us{color:var(--brand)}
.cmp-us{background:rgba(15,110,120,.04)}
.cmp .tick{width:22px;height:22px;color:var(--ok)}
.cmp .tick.muted{color:var(--ink-2);opacity:.7}
.cmp .cross{width:20px;height:20px;color:#C9BFA8}
.cmp-note{max-width:760px;margin:16px auto 0;font-size:12.5px;color:var(--ink-2);text-align:center}

.price-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;max-width:980px;margin:0 auto}
.plan{position:relative;background:var(--surface);border:1px solid var(--line);border-radius:18px;padding:28px 24px;box-shadow:var(--shadow);display:flex;flex-direction:column}
.plan.featured{border-color:var(--brand);box-shadow:0 24px 60px rgba(15,110,120,.18);transform:translateY(-6px)}
.plan-badge{position:absolute;top:-12px;left:50%;transform:translateX(-50%);background:var(--brand);color:#fff;font-size:11.5px;font-weight:700;padding:5px 13px;border-radius:999px;letter-spacing:.03em}
.plan h3{font-size:18px;margin-bottom:10px}
.plan-price{font-family:"Space Grotesk";font-weight:700;font-size:34px;line-height:1;margin-bottom:6px}
.plan-price small{font-size:14px;color:var(--ink-2);font-weight:600;margin-left:4px}
.plan-sub{font-size:13.5px;color:var(--ink-2);margin-bottom:18px}
.plan ul{list-style:none;padding:0;margin:0 0 22px;display:flex;flex-direction:column;gap:11px;flex:1}
.plan li{position:relative;padding-left:24px;font-size:14px}
.plan li::before{content:"";position:absolute;left:0;top:2px;width:16px;height:16px;border-radius:50%;background:var(--ok-soft);background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%232E7D5B' stroke-width='3'><path d='M20 6 9 17l-5-5'/></svg>");background-size:11px;background-repeat:no-repeat;background-position:center}

.cta{padding:24px}
.cta-in{max-width:1140px;margin:0 auto;background:linear-gradient(135deg,var(--brand-900),var(--brand-700));border-radius:24px;padding:60px 30px;text-align:center;position:relative;overflow:hidden}
.cta-in h2{color:#fff;font-size:32px;margin-bottom:12px}
.cta-in p{color:#A9D2D1;font-size:16px;margin-bottom:26px}

.lfoot{padding:30px 24px;border-top:1px solid var(--line)}
.lfoot-in{max-width:1140px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:16px}
.lfoot .lbrand{color:var(--ink);font-size:18px}
.lfoot-copy{font-size:13px;color:var(--ink-2)}

/* ============================================================
   RESPONSIVE
   ============================================================ */
@media (max-width:1080px){
  .pos{grid-template-columns:1fr 330px}
  .kpis{grid-template-columns:repeat(2,1fr)}
  .report-grid{grid-template-columns:1fr}
  .hero-copy h1{font-size:42px}
}
@media (max-width:880px){
  .app{grid-template-columns:1fr}
  .side{flex-direction:row;align-items:center;padding:10px 14px;gap:6px}
  .side::after{display:none}
  .brand{padding:0 8px 0 4px}.brand .tag{display:none}
  .nav{flex-direction:row;margin:0;overflow:auto}
  .nav a{padding:9px 12px;border-left:0;border-bottom:3px solid transparent}
  .nav a span{display:none}
  .nav a.active{border-left:0;border-bottom-color:var(--gold)}
  .side-foot{margin:0 0 0 auto;padding:0;flex-direction:row;align-items:center}
  .side-foot .netpill{display:none}
  .pos{grid-template-columns:1fr;height:auto}
  .fgrid{grid-template-columns:1fr}
  .auth{grid-template-columns:1fr;min-height:100dvh;background:linear-gradient(160deg,var(--brand-900) 0%,var(--brand-700) 60%,var(--brand) 100%)}
  .auth-art{display:none}
  .auth-form-wrap{padding:24px 20px;min-height:100dvh}
  .auth-form{background:var(--surface);padding:26px 22px;border-radius:20px;box-shadow:0 24px 60px rgba(0,0,0,.35);max-width:420px;width:100%}
  .auth-form .btn.block{width:100%}
  .auth-title{font-size:22px}
  .hero-grid{grid-template-columns:1fr;gap:36px}
  .hero-card{order:-1}
  .feat-grid,.price-grid{grid-template-columns:1fr}
  .lnav-links{display:none}
  .plan.featured{transform:none}
  .cmp-row{grid-template-columns:1fr 80px 80px;padding:13px 14px;font-size:13px}
}
@media print{.side,.topbar,.modal-foot,.x{display:none!important}body{background:#fff}}

/* ============================================================
   Phase 3 additions — grouped nav, new pages, subscription
   ============================================================ */

/* Grouped sidebar navigation */
.nav.scroll{flex:1 1 auto;overflow-y:auto;margin-top:8px;padding-right:2px}
.nav.scroll::-webkit-scrollbar{width:6px}
.nav.scroll::-webkit-scrollbar-thumb{background:rgba(255,255,255,.12);border-radius:999px}
.nav-group{display:flex;flex-direction:column;gap:2px;margin-bottom:8px}
.nav-title{font-size:10.5px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:rgba(191,224,223,.45);padding:8px 12px 3px}
.plan-pill{display:flex;flex-direction:column;align-items:flex-start;gap:1px;width:100%;padding:10px 12px;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.06);color:#DCEDEC;border-radius:11px;cursor:pointer;text-align:left;transition:background .15s}
.plan-pill:hover{background:rgba(255,255,255,.12)}
.plan-pill span{font-size:12.5px;font-weight:600}
.plan-pill b{font-size:11px;color:var(--gold-soft);font-weight:700}

/* POS right column */
.pos-right{min-height:0;display:flex;flex-direction:column}

/* Dashboard mini tiles */
.mini-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-top:16px}
.mini{display:flex;flex-direction:column;gap:6px;padding:16px 18px;text-decoration:none;transition:transform .12s,box-shadow .15s}
.mini:hover{transform:translateY(-2px);box-shadow:var(--shadow)}
.mini-label{font-size:12.5px;color:var(--ink-2);font-weight:600}
.mini-val{font-size:24px;font-weight:800;color:var(--ink);font-family:"Space Grotesk",Inter,sans-serif}
.mini-val small{font-size:13px;color:var(--ink-2);font-weight:600;margin-left:3px}
.muted-xs{font-size:11.5px;color:var(--ink-2);margin-top:2px}

/* Small button + form select/textarea */
.btn.sm{padding:7px 13px;font-size:12.5px;border-radius:9px}
.f select,.f textarea{width:100%;padding:11px 12px;border:1px solid var(--line-strong);border-radius:var(--radius-sm);background:var(--surface-2);font:inherit;color:var(--ink)}
.f select:focus,.f textarea:focus{outline:none;border-color:var(--brand);background:#fff}

/* Credit (Nasiya) box in cart */
.credit-box{display:flex;flex-direction:column;gap:8px;margin-bottom:10px}
.credit-box select,.credit-box input{width:100%;padding:10px 12px;border:1px solid var(--line-strong);border-radius:var(--radius-sm);background:var(--surface-2);font:inherit;color:var(--ink)}
.credit-box select:focus,.credit-box input:focus{outline:none;border-color:var(--brand);background:#fff}
.credit-box .hint{font-size:11.5px;color:var(--warn)}

/* Return picker */
.picklist{margin-top:8px;border:1px solid var(--line);border-radius:var(--radius-sm);overflow:hidden}
.pickrow{display:flex;justify-content:space-between;align-items:center;width:100%;padding:11px 13px;background:var(--surface);border:none;border-bottom:1px solid var(--line);cursor:pointer;font:inherit;color:var(--ink);text-align:left}
.pickrow:last-child{border-bottom:none}
.pickrow:hover{background:var(--surface-2)}
.pickrow b{color:var(--brand);font-family:"Space Grotesk",Inter,sans-serif}
.picked{margin-top:12px;display:flex;flex-direction:column;gap:8px}
.picked-total{display:flex;justify-content:space-between;align-items:center;padding-top:10px;border-top:1px dashed var(--line-strong);font-weight:600;color:var(--ink)}
.picked-total b{font-size:18px;font-family:"Space Grotesk",Inter,sans-serif;color:var(--brand)}
.modal-note{font-size:13px;color:var(--ink-2);margin:0 0 14px}

/* Branch cards */
.branch-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px}
.branch{padding:18px;display:flex;flex-direction:column;gap:14px}
.branch-top{display:flex;justify-content:space-between;align-items:flex-start;gap:10px}
.branch-top h3{margin:0;font-size:17px}
.branch-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.branch-stats div{display:flex;flex-direction:column;gap:2px}
.branch-stats span{font-size:11.5px;color:var(--ink-2);font-weight:600}
.branch-stats b{font-size:17px;font-family:"Space Grotesk",Inter,sans-serif;color:var(--ink)}
.branch-bar{height:7px;background:var(--line);border-radius:999px;overflow:hidden}
.branch-bar div{height:100%;background:linear-gradient(90deg,var(--brand),var(--gold));border-radius:999px;transition:width .4s}
.branch-del{align-self:flex-start}

/* Settings */
.set-block{margin-bottom:18px}
.set-block h3{margin:0 0 2px}
.set-row{display:flex;gap:12px;align-items:flex-end;margin-top:12px}
.set-row .f{flex:1}
.plan-cards{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:18px}
.plan-card{position:relative;border:1.5px solid var(--line-strong);border-radius:16px;padding:22px 20px;display:flex;flex-direction:column;gap:6px;background:var(--surface-2)}
.plan-card.feat{border-color:var(--brand);box-shadow:0 12px 30px rgba(15,110,120,.12)}
.plan-card.active{border-color:var(--gold);background:var(--gold-soft)}
.ribbon{position:absolute;top:-11px;left:50%;transform:translateX(-50%);background:var(--brand);color:#fff;font-size:11px;font-weight:700;padding:4px 12px;border-radius:999px}
.pc-name{font-size:19px;font-weight:800;color:var(--ink)}
.pc-tag{font-size:12.5px;color:var(--ink-2)}
.pc-price{font-size:28px;font-weight:800;font-family:"Space Grotesk",Inter,sans-serif;color:var(--brand);margin:6px 0}
.pc-price small{font-size:13px;font-weight:600;color:var(--ink-2);margin-left:5px}
.plan-card ul{list-style:none;padding:0;margin:6px 0 16px;display:flex;flex-direction:column;gap:8px;flex:1}
.plan-card li{position:relative;padding-left:24px;font-size:13.5px;color:var(--ink)}
.plan-card li::before{content:"✓";position:absolute;left:0;top:-1px;color:var(--ok);font-weight:800}

/* Superadmin standalone */
.super{min-height:100vh;background:var(--bg)}
.super-top{display:flex;align-items:center;gap:14px;padding:16px 28px;background:linear-gradient(170deg,var(--brand-900),var(--brand-700));color:#DCEDEC}
.super-top .brand .name{color:#fff}
.super-top .cashier{display:flex;align-items:center;gap:9px;font-size:14px;font-weight:600}
.super-top .cashier .av{width:32px;height:32px;border-radius:9px;background:var(--gold);color:#3A2A06;display:grid;place-items:center;font-weight:800;font-size:12px}
.logout.inline{display:inline-flex;align-items:center;padding:9px 16px;border-radius:10px;background:rgba(255,255,255,.1);color:#fff;border:none;cursor:pointer;font:inherit;font-weight:600;margin-left:8px}
.logout.inline:hover{background:rgba(255,255,255,.18)}
.super-body{max-width:1180px;margin:0 auto;padding:28px}
.mini-select{padding:6px 8px;border:1px solid var(--line-strong);border-radius:8px;background:var(--surface-2);font:inherit;font-size:13px;color:var(--ink);cursor:pointer}

/* Landing lead line */
.section-lead{text-align:center;max-width:560px;margin:0 auto 8px;color:var(--ink-2);font-size:15px}

/* Phase 3 responsive */
@media (max-width:1080px){
  .mini-grid{grid-template-columns:repeat(2,1fr)}
  .plan-cards{grid-template-columns:1fr}
}
@media (max-width:880px){
  .nav.scroll{flex-direction:row;overflow-x:auto}
  .nav-group{flex-direction:row;margin-bottom:0}
  .nav-title{display:none}
  .set-row{flex-direction:column;align-items:stretch}
  .branch-grid{grid-template-columns:1fr}
  .super-body,.super-top{padding-left:16px;padding-right:16px}
}

/* ============================================================
   Phase 4 additions — branch switch, subscription lock, activation
   ============================================================ */

/* Topbar branch switcher */
.branch-switch{display:inline-flex;align-items:center;gap:7px;margin-left:16px;padding:7px 10px;border:1px solid var(--line);border-radius:10px;background:var(--surface-2);color:var(--brand)}
.branch-switch svg{width:17px;height:17px}
.branch-switch select{border:none;background:transparent;font:inherit;font-size:13.5px;font-weight:600;color:var(--ink);cursor:pointer;outline:none;max-width:180px}

/* Subscription lock screen */
.locked{display:grid;place-items:center;min-height:calc(100vh - 73px - 40px);padding:20px}
.locked-card{max-width:460px;text-align:center;padding:38px 30px;display:flex;flex-direction:column;align-items:center;gap:14px}
.locked-ic{width:64px;height:64px;border-radius:18px;display:grid;place-items:center;background:var(--gold-soft);color:var(--gold)}
.locked-ic svg{width:30px;height:30px}
.locked-card h2{margin:0;font-size:22px;color:var(--ink)}
.locked-card p{margin:0;color:var(--ink-2);font-size:14.5px;line-height:1.6}
.locked-actions{display:flex;flex-direction:column;gap:10px;width:100%;margin-top:6px}
.locked-actions .btn{width:100%;justify-content:center}
.locked-actions .btn svg{width:18px;height:18px}
.linklike{background:none;border:none;color:var(--ink-2);font:inherit;font-size:13px;cursor:pointer;text-decoration:underline;margin-top:4px}
.linklike:hover{color:var(--ink)}

/* Superadmin quick-days chips */
.quick-days{display:flex;flex-wrap:wrap;gap:8px;margin:12px 0}

@media (max-width:880px){
  .branch-switch{margin-left:8px}
  .branch-switch select{max-width:110px}
}

/* ============================================================
   Phase 5 additions — login-only, admin-created accounts
   ============================================================ */
.auth-title{margin:0 0 4px;font-size:24px;color:var(--ink)}
.auth-lead{margin:0 0 20px;color:var(--ink-2);font-size:14px}
.auth-divider{display:flex;align-items:center;gap:12px;margin:18px 0;color:var(--ink-2);font-size:12.5px}
.auth-divider::before,.auth-divider::after{content:"";flex:1;height:1px;background:var(--line)}
.btn.tg{display:inline-flex;align-items:center;justify-content:center;gap:8px}
.btn.tg svg{width:18px;height:18px}
.auth-foot{margin-top:12px;text-align:center;color:var(--ink-2);font-size:12.5px}

/* Superadmin: created-credentials panel */
.cred-done{text-align:center}
.cred-done .check{width:52px;height:52px;border-radius:15px;background:var(--ok-soft);color:var(--ok);display:grid;place-items:center;margin:0 auto 12px}
.cred-done .check svg{width:26px;height:26px}
.cred-done h3{margin:0 0 4px;color:var(--ink)}
.cred-box{text-align:left;border:1px solid var(--line);border-radius:12px;overflow:hidden;margin:8px 0 4px}
.cred-box div{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:12px 14px;border-bottom:1px solid var(--line)}
.cred-box div:last-child{border-bottom:none}
.cred-box span{font-size:12.5px;color:var(--ink-2);font-weight:600}
.cred-box b{font-size:15px;color:var(--ink);font-family:"Space Grotesk",Inter,sans-serif}

@media (max-width:880px){
  .super-top .btn.gold span{display:inline}
}

/* ============================================================
   Mobile / phone responsiveness (comprehensive)
   ============================================================ */

/* Never let the page scroll sideways; wide tables scroll inside their card */
body{overflow-x:hidden}

@media (max-width:880px){
  /* Tables: keep native layout but scroll horizontally within the card */
  .card:has(table){overflow-x:auto;-webkit-overflow-scrolling:touch}
  .card table{min-width:600px}

  /* Roomier content, wrapping page headers */
  .view{padding:16px}
  .view-head{flex-wrap:wrap;align-items:flex-start;gap:10px}
  .view-head .spacer{display:none}
  .view-head .cat-chips{width:100%}

  /* Topbar trims to essentials */
  .topbar{padding:12px 16px;gap:10px}
  .topbar .date{display:none}

  /* Full-width search on small screens */
  .search{max-width:none}
  .toolbar{flex-wrap:wrap}

  /* Landing spacing */
  .section{padding:48px 18px}
  .section-title{font-size:27px;margin-bottom:28px}
}

@media (max-width:600px){
  /* App chrome */
  .view{padding:12px}
  .view-head{margin-bottom:14px}
  .view-head h2{font-size:20px}
  .view-head p{font-size:12.5px}
  .view-head .btn{flex:1 1 auto;justify-content:center}

  /* Topbar: shop name + avatar only */
  .topbar{padding:10px 12px;gap:8px}
  .topbar .shop small{display:none}
  .topbar .shop{font-size:14px}
  .topbar .cashier{padding:0;border:0;background:transparent;font-size:0}
  .branch-switch{margin-left:0;padding:6px 8px}
  .branch-switch select{max-width:96px;font-size:12.5px}

  /* Sidebar (now a top strip): free up space for nav icons */
  .side{padding:8px 10px}
  .brand{padding:0 6px 0 2px}
  .brand .name{font-size:15px}
  .side-foot .plan-pill{display:none}
  .side-foot{gap:6px}

  /* KPI + POS */
  .kpis{grid-template-columns:repeat(2,1fr);gap:12px}
  .grid{grid-template-columns:repeat(2,1fr);gap:10px}
  .cart-foot .pays{gap:6px}
  .pay{flex:1 1 28%}

  /* Buttons a touch smaller */
  .btn.lg{padding:13px 16px;font-size:15px}

  /* Modals hug the screen */
  .overlay{padding:12px}
  .modal-head{padding:16px 16px 0}
  .modal-body{padding:14px 16px 18px}

  /* Landing hero + nav */
  .lnav-in{padding:11px 14px;gap:10px}
  .lnav-cta{gap:8px}
  /* Both buttons clearly visible on mobile — keep solid backgrounds */
  .lnav-cta .btn.ghost,
  .lnav-cta .btn.primary{padding:7px 12px;font-size:12.5px}
  .hero{padding:40px 16px 36px}
  .hero-copy h1{font-size:30px;margin-bottom:14px}
  .hero-copy p{font-size:15px;margin-bottom:22px}
  .hero-actions{gap:10px}
  .hero-actions .btn{flex:1 1 100%}
  .hero-trust{gap:12px;font-size:12px}
  .hero-card{width:100%;max-width:280px}
  .section{padding:40px 16px}
  .section-title{font-size:24px}
  .cta h2{font-size:26px}

  /* Superadmin header wraps neatly */
  .super-top{flex-wrap:wrap;gap:10px;padding:12px 14px}
  .super-top .btn.gold{order:3}
}

/* Very small phones */
@media (max-width:380px){
  .kpis{grid-template-columns:1fr}
  .grid{grid-template-columns:1fr}
  .brand .name{display:none}
}

/* ============================================================
   AI analyst (Biznes) + mobile drawer navigation
   ============================================================ */

/* AI upsell (non-Biznes) */
.ai-upsell{max-width:540px;text-align:center;padding:36px 28px;display:flex;flex-direction:column;align-items:center;gap:12px}
.ai-badge{display:inline-block;background:var(--gold-soft);color:var(--gold);font-size:12px;font-weight:700;padding:4px 12px;border-radius:999px}
.ai-upsell h3{margin:0;font-size:20px;color:var(--ink)}
.ai-upsell p{margin:0;color:var(--ink-2);font-size:14.5px;line-height:1.6}
.ai-orb{width:56px;height:56px;border-radius:50%;display:grid;place-items:center;font-size:26px;background:radial-gradient(circle at 30% 30%,var(--brand),var(--brand-900));box-shadow:0 8px 24px rgba(15,110,120,.35)}
.ai-orb.big{width:74px;height:74px;font-size:34px}

/* AI chat */
.ai-chat{display:flex;flex-direction:column;height:70vh;min-height:420px;max-height:740px;padding:0;overflow:hidden}
.ai-messages{flex:1;overflow-y:auto;padding:18px;display:flex;flex-direction:column;gap:12px}
.ai-empty{margin:auto;text-align:center;display:flex;flex-direction:column;align-items:center;gap:6px;color:var(--ink-2)}
.ai-empty b{color:var(--ink);font-size:16px;margin-top:8px}
.ai-empty span{font-size:13px}
.ai-suggest{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-top:14px;max-width:440px}
.ai-suggest button{padding:9px 14px;border:1px solid var(--line-strong);border-radius:999px;background:var(--surface);font:inherit;font-size:13px;color:var(--ink);cursor:pointer}
.ai-suggest button:hover{border-color:var(--brand);color:var(--brand)}
.ai-msg{display:flex}
.ai-msg.user{justify-content:flex-end}
.ai-bubble{max-width:80%;padding:11px 14px;border-radius:16px;font-size:14px;line-height:1.55;white-space:pre-wrap;word-break:break-word}
.ai-msg.user .ai-bubble{background:var(--brand);color:#fff;border-bottom-right-radius:5px}
.ai-msg.assistant .ai-bubble{background:var(--surface-2);color:var(--ink);border:1px solid var(--line);border-bottom-left-radius:5px}
.ai-bubble.typing{display:flex;gap:4px;align-items:center}
.ai-bubble.typing span{width:7px;height:7px;border-radius:50%;background:var(--ink-2);animation:blink 1s infinite}
.ai-bubble.typing span:nth-child(2){animation-delay:.2s}
.ai-bubble.typing span:nth-child(3){animation-delay:.4s}
@keyframes blink{0%,100%{opacity:.25}50%{opacity:.9}}
.ai-input{display:flex;gap:10px;padding:14px 16px;border-top:1px solid var(--line);background:var(--surface-2)}
.ai-input input{flex:1;padding:12px 14px;border:1px solid var(--line-strong);border-radius:12px;background:var(--surface);font:inherit;font-size:14px;outline:none}
.ai-input input:focus{border-color:var(--brand)}

/* Hamburger + off-canvas drawer (mobile only) */
.hamburger{display:none}
.side-backdrop{display:none}

@media (max-width:880px){
  .hamburger{display:inline-flex;align-items:center;justify-content:center;flex:0 0 auto;width:40px;height:40px;border:1px solid var(--line);border-radius:10px;background:var(--surface-2);color:var(--ink)}
  .hamburger svg{width:22px;height:22px}
  .topbar .shop{min-width:0;flex:0 1 auto;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}

  /* Sidebar becomes a slide-in drawer */
  .app{grid-template-columns:1fr}
  .side{position:fixed;top:0;left:0;bottom:0;width:272px;max-width:82vw;
        flex-direction:column;align-items:stretch;gap:8px;padding:18px 14px;
        transform:translateX(-100%);transition:transform .25s ease;
        z-index:60;box-shadow:0 24px 64px rgba(0,0,0,.4);overflow-y:auto}
  .side.open{transform:translateX(0)}
  .side::after{display:block}
  .brand{padding:0 4px}
  .brand .name{display:inline-block;font-size:18px}
  .brand .tag{display:block}

  /* Vertical nav with labels inside the drawer */
  .nav.scroll,.nav{flex-direction:column;overflow:visible;margin-top:8px}
  .nav-group{flex-direction:column;margin-bottom:8px}
  .nav-title{display:block}
  .nav a{border-left:3px solid transparent;border-bottom:0;padding:11px 12px}
  .nav a span{display:inline}
  .nav a.active{border-left-color:var(--gold);border-bottom-color:transparent}

  /* Footer back to a column */
  .side-foot{flex-direction:column;align-items:stretch;margin:auto 0 0;padding:8px;gap:12px}
  .side-foot .netpill{display:flex}
  .side-foot .plan-pill{display:flex}

  /* Dark backdrop behind the drawer */
  .side-backdrop{display:block;position:fixed;inset:0;background:rgba(6,49,57,.5);backdrop-filter:blur(2px);z-index:55}
}

/* ============================================================
   Time-based access UI (Settings) + simplified pricing (Landing)
   ============================================================ */
.access-row{display:flex;gap:22px;align-items:stretch;margin-top:14px;flex-wrap:wrap}
.access-state{flex:0 0 auto;min-width:130px;border-radius:16px;padding:20px 24px;text-align:center;display:flex;flex-direction:column;justify-content:center}
.access-state.ok{background:var(--ok-soft);color:var(--ok)}
.access-state.off{background:#F6E5E2;color:var(--anor)}
.access-days{font-size:40px;font-weight:800;font-family:"Space Grotesk",Inter,sans-serif;line-height:1}
.access-lbl{font-size:12.5px;font-weight:600;margin-top:4px;opacity:.85}
.access-info{flex:1;min-width:220px;display:flex;flex-direction:column;justify-content:center}
.access-info .btn.tg{align-self:flex-start}

.price-solo{max-width:560px;margin:0 auto;background:var(--surface);border:1px solid var(--line);border-radius:20px;padding:28px;box-shadow:var(--shadow);text-align:center}
.ps-list{display:grid;grid-template-columns:1fr 1fr;gap:12px;text-align:left;margin-bottom:22px}
.ps-item{position:relative;padding-left:26px;font-size:14.5px;color:var(--ink)}
.ps-item::before{content:"✓";position:absolute;left:0;color:var(--ok);font-weight:800}
@media (max-width:600px){
  .ps-list{grid-template-columns:1fr}
  .access-state{width:100%}
}

/* ============================================================
   Dashboard AI tip card
   ============================================================ */
.ai-tip{display:block;margin-top:16px;text-decoration:none;color:inherit;padding:18px 20px;background:linear-gradient(135deg,#F4F1EA 0%,#FFF7E3 100%);border:1px solid var(--gold-soft);transition:transform .12s,box-shadow .15s}
.ai-tip:hover{transform:translateY(-2px);box-shadow:var(--shadow)}
.ai-tip-head{display:flex;align-items:center;gap:12px;margin-bottom:10px}
.ai-tip-head b{display:block;font-size:14.5px;color:var(--ink)}
.ai-tip-head span{font-size:12px;color:var(--ink-2)}
.ai-tip-more{margin-left:auto;font-size:12.5px;font-weight:700;color:var(--brand)}
.ai-orb.sm{width:38px;height:38px;font-size:18px}
.ai-tip-body{font-size:14px;color:var(--ink);line-height:1.55;white-space:pre-wrap;max-height:220px;overflow:hidden;position:relative;padding-left:50px;margin-top:-6px}
.ai-tip-body::after{content:"";position:absolute;left:0;right:0;bottom:0;height:40px;background:linear-gradient(to bottom,transparent,rgba(255,247,227,.95))}

/* ============================================================
   New pages: fiscal receipt block, invoice qty row
   ============================================================ */
.fiscal{margin-top:10px;padding:10px 12px;background:var(--surface-2);border-radius:10px;border:1px solid var(--line)}
.fiscal-lbl{font-size:12.5px;font-weight:600;color:var(--ink-2)}
.fiscal-id{font-size:13px;color:var(--ink);margin-top:2px;font-family:"Space Grotesk",Inter,monospace}
.qty-inv{display:flex;gap:6px;align-items:center;flex-wrap:wrap}
.qty-inv input{width:80px;padding:6px 8px;border:1px solid var(--line-strong);border-radius:8px;font:inherit;font-size:12.5px}
.qty-inv .rm{border:none;background:transparent;color:var(--anor);font-size:12.5px;cursor:pointer;text-decoration:underline}

/* ============================================================
   Onboarding + Live feed + Kind picker
   ============================================================ */
.onboard{min-height:100vh;background:linear-gradient(135deg,var(--brand-900) 0%,var(--brand-700) 100%);display:grid;place-items:center;padding:20px}
.onboard-card{width:100%;max-width:520px;padding:32px}
.onboard-top{display:flex;align-items:center;gap:20px;margin-bottom:24px}
.onboard-mark{width:44px;height:44px;border-radius:12px;background:var(--gold-soft);display:grid;place-items:center}
.onboard-mark svg{width:22px;height:22px}
.onboard-prog{flex:1;display:flex;gap:6px}
.onboard-prog span{flex:1;height:5px;background:var(--line);border-radius:99px;transition:background .25s}
.onboard-prog span.on{background:var(--brand)}
.onboard-body h2{margin:0 0 10px;font-size:22px;color:var(--ink)}
.onboard-body p{margin:0 0 18px;color:var(--ink-2);line-height:1.6}
.onboard-nav{display:flex;gap:10px;align-items:center;margin-top:24px}
.onboard-nav .spacer{flex:1}
.kind-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:8px}
.kind{padding:14px;border:1.5px solid var(--line);border-radius:12px;background:var(--surface);cursor:pointer;font:inherit;font-size:14px;color:var(--ink);text-align:left;transition:border-color .15s,background .15s}
.kind:hover{border-color:var(--brand)}
.kind.active{border-color:var(--brand);background:var(--gold-soft)}
.staff-picker{display:flex;align-items:center;justify-content:center;gap:22px;padding:16px 0}
.staff-picker button{width:44px;height:44px;border-radius:12px;background:var(--surface-2);border:1.5px solid var(--line-strong);font-size:22px;font-weight:700;cursor:pointer}
.staff-picker .staff-n{font-size:36px;font-weight:800;color:var(--brand);min-width:80px;text-align:center;font-family:"Space Grotesk",Inter,sans-serif}
.ynrow{display:flex;gap:10px}
.yn{flex:1;padding:16px;border:1.5px solid var(--line);border-radius:12px;background:var(--surface);cursor:pointer;font:inherit;font-size:15px;font-weight:600;color:var(--ink)}
.yn.active{border-color:var(--brand);background:var(--gold-soft);color:var(--brand)}

/* Live feed */
.live-feed{padding:18px 20px}
.live-head{display:flex;align-items:center;gap:10px}
.live-head h3{margin:0}
.live-dot{width:8px;height:8px;border-radius:50%;background:var(--anor);transition:background .25s;box-shadow:0 0 0 3px rgba(166,52,42,.15)}
.live-dot.on{background:var(--ok);box-shadow:0 0 0 3px rgba(46,125,91,.15);animation:pulse 2s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.55}}
.live-list{display:flex;flex-direction:column;gap:6px;margin-top:14px;max-height:340px;overflow-y:auto}
.live-row{display:flex;gap:12px;align-items:flex-start;padding:10px 12px;border-radius:10px;background:var(--surface-2);border-left:3px solid var(--line)}
.live-row.ok{border-left-color:var(--ok)}
.live-row.warn{border-left-color:var(--anor)}
.live-row.gold{border-left-color:var(--gold)}
.live-row.info{border-left-color:var(--brand)}
.live-time{font-size:11.5px;color:var(--ink-2);font-family:"Space Grotesk",Inter,monospace;min-width:44px}
.live-user{font-size:13px;font-weight:700;color:var(--ink)}
.live-what{font-size:12.5px;color:var(--ink-2);margin-top:2px}
.live-what b{color:var(--ink);font-family:"Space Grotesk",Inter,sans-serif}

@media (max-width:600px){
  .onboard-card{padding:22px}
  .kind-grid{grid-template-columns:1fr}
  .ynrow{flex-direction:column}
}

/* ============================================================
   Superadmin extended UI + branch manager block
   ============================================================ */
.filters{display:flex;gap:14px;align-items:center;flex-wrap:wrap;padding:14px 18px;margin-bottom:14px}
.search-input{flex:1;min-width:220px;padding:10px 14px;border:1px solid var(--line-strong);border-radius:10px;font:inherit;font-size:14px;background:var(--surface)}
.search-input:focus{outline:none;border-color:var(--brand)}
.warn-band{margin-bottom:14px;background:linear-gradient(135deg,#FFF7E3,#FDEBD3);border-color:var(--gold-soft)}
.warn-band b{color:var(--ink);font-size:14px}
.soon-list{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}
.soon-pill{background:var(--surface);border:1px solid var(--gold-soft);border-radius:999px;padding:5px 12px;font-size:12.5px;color:var(--ink)}
.soon-pill b{color:var(--anor);margin-left:4px}
.rowact{display:flex;gap:4px;align-items:center;justify-content:flex-end}
.btn.sm{padding:5px 9px;font-size:12px;font-weight:600}

.detail-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:8px}
.detail-grid > div{background:var(--surface-2);border-radius:10px;padding:10px 12px}
.detail-grid span{display:block;font-size:11.5px;color:var(--ink-2);text-transform:uppercase;letter-spacing:.5px}
.detail-grid b{font-size:15px;color:var(--ink);font-family:"Space Grotesk",Inter,sans-serif;margin-top:2px;display:block}
.detail-list{max-height:200px;overflow-y:auto;display:flex;flex-direction:column;gap:4px}
.dl-row{display:flex;justify-content:space-between;padding:8px 10px;background:var(--surface-2);border-radius:8px;font-size:13px}
.dl-row b{color:var(--ink)}
.dl-row span{color:var(--ink-2);font-size:12px}

.branch-manager-block{margin-top:14px;padding:14px;background:var(--surface-2);border-radius:10px;border:1px dashed var(--line-strong)}
.bm-title{font-size:13.5px;font-weight:700;color:var(--ink);margin-bottom:4px}
.bm-hint{font-size:12px;color:var(--ink-2);line-height:1.5}

@media (max-width:600px){
  .filters{flex-direction:column;align-items:stretch}
  .detail-grid{grid-template-columns:1fr}
  .rowact{flex-wrap:wrap}
}

/* Backup buttons row + audit input */
.backup-row{display:flex;gap:10px;flex-wrap:wrap;margin-top:12px}
.backup-row .btn{display:inline-flex;align-items:center;gap:8px}
.cnt-input{width:80px;padding:6px 8px;border:1px solid var(--line-strong);border-radius:8px;font:inherit;font-size:13px;text-align:right}
.cnt-input:focus{outline:none;border-color:var(--brand)}
.search-wrap{padding:0 4px 12px}
.search-wrap input{width:100%;padding:10px 14px;border:1px solid var(--line-strong);border-radius:10px;font:inherit;font-size:14px;background:var(--surface)}

/* ============================================================
   Comprehensive mobile polish
   Ensures every screen is comfortably usable on ~360-420px width
   ============================================================ */
@media (max-width:640px){
  /* Landing nav — keep both CTAs visible, drop links, tighten padding */
  .lnav-in{padding:10px 14px;gap:10px}
  .lnav-links{display:none}
  .lnav-cta{gap:8px;flex-shrink:0}
  .lnav-cta .btn{padding:8px 12px;font-size:13px;white-space:nowrap}
  /* Give "Kirish" real presence — transparent ghost looks invisible on the light bg */
  .lnav-cta .btn.ghost{background:var(--surface);border:1px solid var(--line-strong);color:var(--ink)}
  .lnav .lbrand{font-size:16px}
  .lnav .lbrand .mark{width:32px;height:32px}

  /* Ensure the OS browser chrome doesn't cover the login card */
  html,body{overflow-x:hidden}

  /* Modals — full-screen sheet on tiny screens */
  .overlay{padding:0;align-items:flex-end}
  .modal{border-radius:18px 18px 0 0;max-height:92vh;overflow-y:auto;animation:sheet .22s ease}
  @keyframes sheet{from{transform:translateY(20px);opacity:.7}to{transform:translateY(0);opacity:1}}
  .modal-head{padding:16px 18px 0}
  .modal-body{padding:14px 18px 18px}
  .modal-foot{flex-direction:column-reverse}
  .modal-foot .btn{width:100%}

  /* Topbar — single row, tighter */
  .topbar{padding:10px 14px;gap:8px;overflow:hidden}
  .topbar .shop{font-size:14px;min-width:0;flex:0 1 auto;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .topbar .shop small{display:none}
  .topbar .cashier{padding:5px 10px 5px 5px;font-size:12px}
  .topbar .cashier .av{width:26px;height:26px;font-size:11px}
  .branch-switch{padding:6px 10px;font-size:12.5px}
  .branch-switch svg{width:14px;height:14px}
  .plan-pill{padding:6px 10px;font-size:12px}
  .logout.inline{padding:6px 10px;font-size:12px}

  /* KPI grid — stack better on tiny screens */
  .kpis{grid-template-columns:1fr 1fr;gap:10px}
  .kpi{padding:14px 16px}
  .kval{font-size:22px}

  /* Tables → cards for narrow screens */
  .card{padding:14px 16px}
  table th, table td{padding:10px 8px;font-size:13px}
  .rowact{flex-wrap:wrap;gap:4px}
  .btn.sm{padding:4px 8px;font-size:11.5px}

  /* Sell page — cart below products, sticky bottom */
  .pos{grid-template-columns:1fr;gap:14px}
  .grid{grid-template-columns:repeat(2,1fr)}
  .cart-side{max-height:none}

  /* Forms — bigger inputs on touch */
  input, select, textarea{font-size:16px}  /* prevents iOS zoom on focus */

  /* PageHead — stack title and actions */
  .page-head{flex-direction:column;align-items:stretch;gap:10px}
  .page-head .actions{display:flex;flex-wrap:wrap;gap:8px}
  .page-head h2{font-size:20px}
  .page-head .sub{font-size:12.5px}

  /* Landing hero cleaner on small screens */
  .hero-in{padding:60px 20px 40px}
  .hero-copy h1{font-size:32px}
  .hero-cta{flex-direction:column;align-items:stretch}
  .hero-cta .btn{width:100%;justify-content:center}
  .hero-trust{flex-wrap:wrap;gap:10px;justify-content:center}

  /* Sections tighter */
  .section-in{padding:48px 20px}
  .section-title{font-size:24px}
  .section-lead{font-size:14px}

  /* Superadmin small */
  .super-top{padding:12px 14px;gap:8px;flex-wrap:wrap}
  .super-top .cashier{display:none}
  .super-body{padding:14px}

  /* Branch grid single column */
  .branch-grid{grid-template-columns:1fr}

  /* Onboarding — full height on tiny */
  .onboard-card{padding:20px;border-radius:16px}
  .onboard-body h2{font-size:20px}
  .staff-n{font-size:32px}

  /* Chat AI */
  .ai-chat{height:calc(100dvh - 220px);min-height:340px}

  /* Live feed — compact */
  .live-list{max-height:280px}
  .live-row{padding:8px 10px}
  .live-time{min-width:38px;font-size:11px}
}

/* Even tinier — landscape phones or very old devices */
@media (max-width:380px){
  .kpis{grid-template-columns:1fr}
  .grid{grid-template-columns:1fr 1fr}
  .btn.lg{padding:12px 18px;font-size:14px}
  .topbar .plan-pill span{display:none}
}

/* Telegram how-to steps */
.howto{display:flex;flex-direction:column;gap:14px;margin:8px 0}
.ht-step{display:flex;gap:14px;align-items:flex-start}
.ht-num{flex:0 0 32px;height:32px;border-radius:50%;background:var(--brand);color:#fff;display:grid;place-items:center;font-weight:800;font-family:"Space Grotesk",Inter,sans-serif}
.ht-step b{display:block;font-size:14.5px;color:var(--ink);margin-bottom:4px}
.ht-step p{margin:0;font-size:13.5px;color:var(--ink-2);line-height:1.6}
.ht-step code{background:var(--surface-2);padding:1px 6px;border-radius:5px;font-size:12.5px;font-family:"Space Grotesk",Inter,monospace}
.ht-step a{color:var(--brand);font-weight:600}

/* Quick weight chips (Sotish uchun 1.5 kg, 0.5 kg va h.k.) */
.weight-chips{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px;margin-bottom:14px}
.weight-chips .chip{padding:8px 14px;font-size:13.5px;border:1px solid var(--line-strong);background:var(--surface);border-radius:999px;cursor:pointer;color:var(--ink)}
.weight-chips .chip.active{background:var(--brand);color:#fff;border-color:var(--brand)}

/* Discount row + preview */
.totals .row.disc{color:var(--anor);font-size:13px}
.disc-row{display:flex;gap:8px;flex-wrap:wrap;margin:4px 0 10px}
.btn.ghost.sm{background:transparent;border:1px dashed var(--line-strong);color:var(--ink-2);padding:6px 10px;font-size:12.5px;display:inline-flex;align-items:center;gap:6px;border-radius:8px;cursor:pointer}
.btn.ghost.sm:hover{background:var(--surface-2);color:var(--ink)}
.btn.ghost.sm svg{width:14px;height:14px}
.disc-tabs{display:flex;gap:8px;margin-bottom:12px}
.disc-tabs .chip{padding:9px 16px;font-weight:600;font-size:13.5px}
.disc-preview{background:linear-gradient(135deg,#FFF7E3,#FDEBD3);border-radius:10px;padding:12px 14px;display:flex;justify-content:space-between;align-items:center;margin-top:10px}
.disc-preview span{color:var(--ink-2);font-size:13px}
.disc-preview b{color:var(--anor);font-size:16px;font-family:"Space Grotesk",Inter,sans-serif}

/* Cashier hotkey hints */
.hotkeys{display:flex;gap:10px;justify-content:center;margin-top:10px;flex-wrap:wrap}
.hotkeys span{color:var(--ink-2);font-size:11.5px;display:inline-flex;align-items:center;gap:5px}
.hotkeys kbd{background:var(--surface-2);border:1px solid var(--line-strong);border-radius:5px;padding:1px 6px;font-size:10.5px;font-family:"Space Grotesk",Inter,monospace;color:var(--ink);box-shadow:0 1px 0 var(--line-strong)}

/* Activity feed */
.act-list{display:flex;flex-direction:column;gap:2px}
.act-row{display:flex;gap:12px;padding:10px 6px;border-bottom:1px solid var(--surface-2)}
.act-row:last-child{border-bottom:none}
.act-dot{flex:0 0 8px;height:8px;width:8px;border-radius:50%;margin-top:8px}
.act-body{flex:1;min-width:0}
.act-head{display:flex;justify-content:space-between;align-items:baseline;gap:8px}
.act-head b{font-size:14px;color:var(--ink)}
.act-desc{color:var(--ink-2);font-size:13px;margin-top:2px}
.act-who{color:var(--ink-2);font-size:11.5px;margin-top:3px;font-style:italic}

/* Info/safety band on Telegram + Settings pages */
.info-band{background:linear-gradient(135deg,#E7F5F3,#D5EBE7);border:1px solid #B9DED8;margin-bottom:14px}
.info-band b{color:var(--brand-900);font-size:14px}

/* Reorder page */
.reord-head{display:flex;justify-content:space-between;align-items:center;padding:6px 4px 14px;margin-bottom:8px;border-bottom:1px solid var(--surface-2)}
.reord-head h3{margin:0;font-size:16px;color:var(--ink)}
.reord-foot{display:flex;justify-content:flex-end;gap:10px;align-items:center;padding-top:10px;margin-top:8px;border-top:1px solid var(--surface-2)}
.reord-foot b{font-size:16px;color:var(--ink);font-family:"Space Grotesk",Inter,sans-serif}

/* Target progress cards */
.target-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:16px}
.target-card{padding:18px 20px}
.tg-head{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px}
.tg-name{font-size:16px;font-weight:700;color:var(--ink)}
.tg-line{margin-bottom:14px}
.tg-line:last-child{margin-bottom:0}
.tg-lbl{display:flex;justify-content:space-between;font-size:13px;color:var(--ink-2);margin-bottom:6px}
.tg-lbl b{color:var(--ink);font-family:"Space Grotesk",Inter,sans-serif}
.tg-bar{height:8px;background:var(--surface-2);border-radius:99px;overflow:hidden;position:relative}
.tg-fill{height:100%;background:linear-gradient(90deg,var(--brand),#12889A);border-radius:99px;transition:width .35s ease}
.tg-fill.done{background:linear-gradient(90deg,var(--ok),#3FB27F)}
.tg-pct{font-size:11.5px;text-align:right;color:var(--ink-2);margin-top:3px;font-weight:600}

/* Install prompt (PWA offer) */
.install-prompt{position:fixed;bottom:16px;left:16px;right:16px;max-width:420px;margin:0 auto;background:var(--surface);border:1px solid var(--line-strong);border-radius:14px;padding:14px 16px;box-shadow:0 12px 32px rgba(6,49,57,.18);z-index:5000;display:flex;flex-direction:column;gap:12px;animation:slideUp .28s ease}
@keyframes slideUp{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}
.ip-body{display:flex;gap:12px;align-items:flex-start}
.ip-ic{flex:0 0 42px;height:42px;background:linear-gradient(135deg,var(--brand-900),var(--brand));border-radius:10px;display:grid;place-items:center}
.ip-ic svg{width:22px;height:22px}
.ip-body b{display:block;font-size:14px;color:var(--ink);font-weight:700}
.ip-body p{margin:2px 0 0;font-size:12.5px;color:var(--ink-2);line-height:1.4}
.ip-actions{display:flex;gap:8px;justify-content:flex-end}

/* Offline banner */
.offline-banner{position:fixed;top:0;left:0;right:0;background:var(--anor);color:#fff;padding:8px 14px;text-align:center;font-size:13px;font-weight:600;z-index:5100;display:flex;align-items:center;justify-content:center;gap:8px;box-shadow:0 2px 8px rgba(0,0,0,.15)}
.offline-banner svg{width:16px;height:16px}


/* ============================================================
   Landing: screenshots mockup, price tiers, FAQ
   ============================================================ */

/* Screenshots grid — three device frames side by side */
.shots-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:28px;margin-top:36px}
.shot-card{display:flex;flex-direction:column;align-items:center;text-align:center}
.shot-frame{width:100%;max-width:320px;background:var(--brand-900);border-radius:22px;padding:8px;box-shadow:0 24px 60px rgba(6,49,57,.28);position:relative}
.shot-frame::before{content:"";position:absolute;top:8px;left:50%;transform:translateX(-50%);width:60px;height:4px;background:rgba(255,255,255,.15);border-radius:99px}
.shot-tab{background:var(--surface);padding:22px 16px 8px;border-radius:16px 16px 0 0;font-size:12px;font-weight:700;color:var(--ink-2);text-transform:uppercase;letter-spacing:.6px;text-align:left}
.shot-body{background:var(--surface);padding:12px 16px 20px;border-radius:0 0 16px 16px;min-height:280px}

/* Sell mockup */
.s-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:12px}
.s-prod{background:var(--surface-2);border-radius:8px;padding:8px 10px;font-size:11px;display:flex;flex-direction:column;gap:2px}
.s-prod b{color:var(--ink);font-size:12px}
.s-prod span{color:var(--brand);font-family:"Space Grotesk",Inter,sans-serif;font-weight:700}
.s-cart{background:var(--surface-2);border-radius:8px;padding:10px 12px}
.s-line{display:flex;justify-content:space-between;font-size:11.5px;color:var(--ink-2);padding:3px 0}
.s-line b{color:var(--ink);font-family:"Space Grotesk",Inter,sans-serif}
.s-total{display:flex;justify-content:space-between;padding-top:6px;margin-top:4px;border-top:1px solid var(--line);font-size:13px}
.s-total span{color:var(--ink);font-weight:700}
.s-total b{color:var(--brand);font-family:"Space Grotesk",Inter,sans-serif;font-weight:700}
.s-btn{background:var(--brand);color:#fff;text-align:center;padding:8px;border-radius:8px;font-size:12px;font-weight:700;margin-top:8px}

/* Dashboard mockup */
.d-kpis{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:14px}
.d-kpi{padding:8px 10px;border-radius:8px;display:flex;flex-direction:column;gap:2px}
.d-kpi span{font-size:10px;color:var(--ink-2);text-transform:uppercase;letter-spacing:.4px}
.d-kpi b{font-family:"Space Grotesk",Inter,sans-serif;font-size:14px;color:var(--ink)}
.d-kpi.teal{background:linear-gradient(135deg,#E7F5F3,#D5EBE7)}
.d-kpi.green{background:linear-gradient(135deg,#E2F1E9,#CFE7DA)}
.d-kpi.gold{background:linear-gradient(135deg,#FFF7E3,#FDEBD3)}
.d-kpi.anor{background:linear-gradient(135deg,#FCE6E1,#F9D5CC)}
.d-chart{display:flex;gap:6px;align-items:flex-end;height:100px;padding:8px;background:var(--surface-2);border-radius:8px}
.d-bar{flex:1;background:linear-gradient(180deg,var(--brand),#12889A);border-radius:3px 3px 0 0;min-height:6px}
.d-bar.tall{background:linear-gradient(180deg,var(--gold),#DBA835)}

/* Branches mockup */
.b-row{display:flex;justify-content:space-between;align-items:center;padding:10px 12px;background:var(--surface-2);border-radius:8px;margin-bottom:6px}
.b-row b{display:block;font-size:13px;color:var(--ink)}
.b-row span{display:block;font-size:11px;color:var(--ok);font-weight:600;text-transform:uppercase;letter-spacing:.4px}
.b-num{font-family:"Space Grotesk",Inter,sans-serif;font-weight:700;color:var(--brand)}
.b-add{border:1px dashed var(--line-strong);border-radius:8px;padding:10px;text-align:center;font-size:12.5px;color:var(--ink-2);margin-top:4px}

.shot-card h4{margin:16px 0 6px;font-size:16px;color:var(--ink);font-family:"Space Grotesk",Inter,sans-serif}
.shot-card p{margin:0;font-size:13.5px;color:var(--ink-2);line-height:1.5;max-width:280px}

/* Price tiers — three cards, middle one featured */
.price-tiers{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:36px;max-width:1000px;margin-left:auto;margin-right:auto}
.ptier{background:var(--surface);border:1px solid var(--line);border-radius:16px;padding:28px 24px;display:flex;flex-direction:column;position:relative}
.ptier.featured{border:2px solid var(--brand);transform:scale(1.03);box-shadow:0 20px 40px rgba(15,110,120,.15)}
.ptier-badge{position:absolute;top:-11px;left:50%;transform:translateX(-50%);background:var(--brand);color:#fff;padding:4px 14px;border-radius:99px;font-size:11.5px;font-weight:700;text-transform:uppercase;letter-spacing:.5px}
.ptier-head{text-align:center;padding-bottom:18px;border-bottom:1px solid var(--line);margin-bottom:18px}
.ptier-lbl{display:inline-block;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:var(--ink-2);margin-bottom:12px}
.ptier-price{font-family:"Space Grotesk",Inter,sans-serif;font-size:44px;font-weight:700;color:var(--brand-900);line-height:1}
.ptier-price small{font-size:14px;font-weight:500;color:var(--ink-2);margin-left:6px}
.ptier-per{font-size:12.5px;color:var(--ink-2);margin-top:6px}
.ptier-list{list-style:none;padding:0;margin:0 0 22px;flex:1}
.ptier-list li{font-size:13.5px;color:var(--ink);padding:6px 0 6px 22px;position:relative}
.ptier-list li::before{content:"✓";position:absolute;left:0;top:6px;color:var(--ok);font-weight:700}
.ptier-list li b{color:var(--anor)}
.btn.block{width:100%;justify-content:center;text-align:center}
.price-note{text-align:center;margin-top:24px;font-size:13px;color:var(--ink-2)}

/* FAQ collapsible list */
.faq-list{max-width:760px;margin:32px auto 0;display:flex;flex-direction:column;gap:8px}
.faq-item{background:var(--surface);border:1px solid var(--line);border-radius:12px;overflow:hidden;transition:border-color .18s ease}
.faq-item.open{border-color:var(--brand)}
.faq-q{width:100%;background:transparent;border:none;padding:18px 20px;display:flex;justify-content:space-between;align-items:center;cursor:pointer;font:inherit;font-size:15px;font-weight:600;color:var(--ink);text-align:left}
.faq-q:hover{background:var(--surface-2)}
.faq-q svg{width:18px;height:18px;color:var(--ink-2);transition:transform .18s ease;flex-shrink:0;margin-left:12px}
.faq-item.open .faq-q svg{transform:rotate(180deg)}
.faq-a{padding:0 20px 18px;font-size:14px;color:var(--ink-2);line-height:1.65}

@media (max-width:800px){
  .price-tiers{grid-template-columns:1fr;max-width:400px}
  .ptier.featured{transform:none}
}
@media (max-width:640px){
  .shots-grid{gap:20px}
  .shot-body{min-height:auto}
  .faq-q{padding:14px 16px;font-size:14px}
  .faq-a{padding:0 16px 14px;font-size:13px}
  .ptier{padding:22px 20px}
  .ptier-price{font-size:36px}
}

/* Superadmin — enhanced shop detail modal */
.detail-topstrip{display:flex;justify-content:space-between;align-items:center;gap:16px;padding:14px 16px;background:linear-gradient(135deg,#F7F4EB,#EEEBE1);border-radius:12px;margin-bottom:16px;flex-wrap:wrap}
.dts-left{display:flex;flex-direction:column;gap:6px}
.dts-sub{font-size:13.5px;color:var(--ink)}
.dts-sub b{font-family:"Space Grotesk",Inter,sans-serif;font-size:16px;color:var(--brand)}
.dts-right{display:flex;gap:6px;flex-wrap:wrap;align-items:center}
.status-pill{display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:99px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.4px}
.status-pill.ok{background:rgba(46,125,91,.14);color:var(--ok)}
.status-pill.off{background:rgba(166,52,42,.14);color:var(--anor)}

.detail-owner{background:var(--surface-2);border-radius:12px;padding:14px 16px;margin-bottom:16px}
.do-head{display:flex;justify-content:space-between;align-items:flex-start;gap:14px;flex-wrap:wrap}
.do-lbl{font-size:11px;text-transform:uppercase;letter-spacing:.5px;color:var(--ink-2);margin-bottom:2px}
.do-name{font-size:16px;font-weight:700;color:var(--ink)}
.do-phone{font-size:13px;color:var(--ink-2);margin-top:2px}
.do-actions{display:flex;gap:6px;flex-wrap:wrap}

/* Superadmin — top shops leaderboard */
.top-shops{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px}
.top-shop{background:var(--surface-2);border-radius:10px;padding:12px 14px;display:flex;align-items:center;gap:12px}
.ts-rank{background:linear-gradient(135deg,var(--gold),#DBA835);color:#fff;font-family:"Space Grotesk",Inter,sans-serif;font-weight:700;width:32px;height:32px;border-radius:50%;display:grid;place-items:center;font-size:13px;flex-shrink:0}
.ts-name{flex:1;font-size:13.5px;font-weight:600;color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ts-rev{font-family:"Space Grotesk",Inter,sans-serif;font-weight:700;color:var(--brand);font-size:13px;text-align:right}
.ts-rev small{font-size:10px;color:var(--ink-2);font-weight:500;margin-left:2px}
