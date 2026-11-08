/* MoneyMate 2 — browser-only personal finance dashboard.
   AI-assisted project. No API keys, backend, trackers, or bank integration.
   Internally uses ISO (Gregorian) dates; shows and selects real Solar Hijri dates. */
(() => {
  'use strict';

  const STORAGE_KEY = 'moneymate-data-v1'; // Keep the old key to preserve earlier MoneyMate transactions.
  const root = document.getElementById('app');
  const fmt = new Intl.NumberFormat('fa-IR');
  const MONTHS = ['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'];
  const WEEKDAYS = ['ش','ی','د','س','چ','پ','ج'];
  const persianDateParts = new Intl.DateTimeFormat('en-US-u-ca-persian-nu-latn', {
    year: 'numeric', month: 'numeric', day: 'numeric', timeZone: 'UTC'
  });
  const DAY = 86400000;
  const COLORS = ['#10b99a','#658ef1','#f2ac68','#9c83e7','#ef8299','#51baca','#ceb376','#97a6ba'];
  const CATEGORIES = {
    expense: [
      {id:'food',title:'خوراک و رستوران',short:'خوراک',emoji:'🍜',color:'#f2aa69',bg:'#fff1e4'},
      {id:'shopping',title:'خرید و پوشاک',short:'خرید',emoji:'🛍️',color:'#9d85e8',bg:'#f0edff'},
      {id:'transport',title:'حمل‌ونقل',short:'رفت‌وآمد',emoji:'🚕',color:'#6398ed',bg:'#eaf3ff'},
      {id:'bills',title:'خانه و قبوض',short:'خانه',emoji:'🏠',color:'#42bea9',bg:'#e7f9f3'},
      {id:'health',title:'سلامت و درمان',short:'درمان',emoji:'💊',color:'#f08198',bg:'#fff0f3'},
      {id:'entertainment',title:'تفریح و سرگرمی',short:'تفریح',emoji:'🎬',color:'#e7b45b',bg:'#fff7e8'},
      {id:'education',title:'آموزش',short:'آموزش',emoji:'📚',color:'#7e95df',bg:'#eef2ff'},
      {id:'other-expense',title:'سایر هزینه‌ها',short:'سایر',emoji:'🧾',color:'#98aaba',bg:'#eef1f6'}
    ],
    income: [
      {id:'salary',title:'حقوق و دستمزد',short:'حقوق',emoji:'💼',color:'#34b99a',bg:'#e6f8f1'},
      {id:'freelance',title:'کار آزاد',short:'کار آزاد',emoji:'💻',color:'#5c97e7',bg:'#ecf4ff'},
      {id:'investment',title:'سرمایه‌گذاری',short:'سرمایه‌گذاری',emoji:'📈',color:'#a28ae7',bg:'#f1edff'},
      {id:'gift',title:'هدیه و پاداش',short:'هدیه',emoji:'🎁',color:'#e9a0ae',bg:'#fff0f3'},
      {id:'other-income',title:'سایر درآمدها',short:'سایر',emoji:'💰',color:'#dcb45f',bg:'#fff7e8'}
    ]
  };
  const ICON = {
    wallet:'<rect x="3" y="6" width="18" height="15" rx="3"/><path d="M3 10h18M7 6V4a2 2 0 012-2h9M16 15h2"/>',
    grid:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    arrows:'<path d="M7 7h14l-4-4m4 4-4 4M17 17H3l4-4m-4 4 4 4"/>',
    chart:'<path d="M3 3v18h18M7 16l4-5 4 3 5-7M15 7h5v5"/>',
    target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    plus:'<path d="M12 5v14M5 12h14"/>',minus:'<path d="M5 12h14"/>',
    sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    moon:'<path d="M20.5 14.3A9 9 0 019.7 3.5 9 9 0 1020.5 14.3Z"/>',
    calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
    chevronRight:'<path d="m15 18-6-6 6-6"/>',chevronLeft:'<path d="m9 18 6-6-6-6"/>',
    trendUp:'<path d="m3 17 6-6 4 4 8-8M15 7h6v6"/>',trendDown:'<path d="m3 7 6 6 4-4 8 8M15 17h6v-6"/>',
    search:'<circle cx="11" cy="11" r="7"/><path d="m16 16 5 5"/>',
    edit:'<path d="m4 20 4-.8L20 7.2 16.8 4 4.8 16Z"/><path d="m14.5 6.3 3.2 3.2"/>',
    trash:'<path d="M4 7h16M10 11v6m4-6v6M6 7l1 14h10l1-14M9 7V4h6v3"/>',
    close:'<path d="M18 6 6 18M6 6l12 12"/>',check:'<path d="m5 12 4 4L19 6"/>',
    menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',download:'<path d="M12 3v12m-4-4 4 4 4-4M4 17v4h16v-4"/>',
    upload:'<path d="M12 20V8m-4 4 4-4 4 4M4 7V4h16v3"/>',
    info:'<circle cx="12" cy="12" r="10"/><path d="M12 11v6M12 7h.01"/>',
    shield:'<path d="m12 2 8 4v6c0 6-4 9-8 10-4-1-8-4-8-10V6Z"/><path d="m9 12 2 2 4-4"/>',
    pie:'<path d="M11 3a9 9 0 1010 10H11Z"/><path d="M13 3a9 9 0 018 8h-8Z"/>',
    save:'<path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2Z"/><path d="M7 3v6h10V4M7 21v-8h10v8"/>',
    spark:'<path d="m12 2 1.7 7.3L21 11l-7.3 1.7L12 20l-1.7-7.3L3 11l7.3-1.7ZM19 17l.5 1.5L21 19l-1.5.5L19 21l-.5-1.5L17 19l1.5-.5Z"/>',
    alert:'<path d="m12 3 10 18H2ZM12 9v4m0 4h.01"/>',
    lock:'<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 018 0v3"/>',
    arrow:'<path d="M4 12h16m-6-6 6 6-6 6"/>',
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    filter:'<path d="M4 7h16M7 12h10M10 17h4"/>'
  };
  const ico = (name, cls = '') => `<svg class="i ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICON[name] || ICON.grid}</svg>`;
  const esc = v => String(v ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const persianDigits = n => String(n).replace(/\d/g,d=>'۰۱۲۳۴۵۶۷۸۹'[d]);
  const amount = n => fmt.format(Math.abs(n));
  const money = n => `${n < 0 ? '−' : ''}${amount(n)}`;
  const compact = n => n >= 1000000000 ? `${fmt.format(Math.round(n/100000000)/10)} میلیارد` : n >= 1000000 ? `${fmt.format(Math.round(n/100000)/10)} میلیون` : n >= 1000 ? `${fmt.format(Math.round(n/100)/10)} هزار` : amount(n);
  const isoToMillis = iso => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return NaN;
    const [y,m,d] = iso.split('-').map(Number);
    const ms = Date.UTC(y,m-1,d,12);
    const dt = new Date(ms);
    return dt.getUTCFullYear() === y && dt.getUTCMonth() === m-1 && dt.getUTCDate() === d ? ms : NaN;
  };
  const millisToISO = millis => new Date(millis).toISOString().slice(0,10);
  const todayISO = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  };
  // Uses the built-in ICU Persian calendar, including genuine leap years.
  const fromISO = iso => {
    const ms = isoToMillis(iso);
    if (!Number.isFinite(ms)) throw new Error('تاریخ میلادی نامعتبر');
    const parts = persianDateParts.formatToParts(new Date(ms));
    const read = type => Number(parts.find(p => p.type === type)?.value);
    return {year: read('year'), month: read('month'), day: read('day')};
  };
  // Inverse date conversion by binary search; keeps our internal ISO storage compatible.
  const toISO = (year, month, day) => {
    if (!Number.isInteger(year) || year < 1200 || year > 1600 || !Number.isInteger(month) || month < 1 || month > 12 || !Number.isInteger(day) || day < 1 || day > 31) return null;
    const wanted = year*1000 + month*32 + day;
    let lo = Date.UTC(year+620,0,1,12), hi = Date.UTC(year+623,0,1,12);
    while (lo < hi) {
      const mid = lo + Math.floor((hi-lo)/(2*DAY))*DAY;
      const parts = fromISO(millisToISO(mid));
      const value = parts.year*1000 + parts.month*32 + parts.day;
      if (value < wanted) lo = mid + DAY; else hi = mid;
    }
    const iso = millisToISO(lo);
    const result = fromISO(iso);
    return result.year === year && result.month === month && result.day === day ? iso : null;
  };
  const jKey = iso => { const p = fromISO(iso); return `${p.year}-${String(p.month).padStart(2,'0')}`; };
  const fromKey = k => { const [year,month] = k.split('-').map(Number); return {year,month}; };
  const monthLabel = k => { const {year,month} = fromKey(k); return `${MONTHS[month-1]} ${persianDigits(year)}`; };
  const shortDate = iso => { const d=fromISO(iso); return `${fmt.format(d.day)} ${MONTHS[d.month-1]}`; };
  const fullDate = iso => { const d=fromISO(iso); return `${fmt.format(d.day)} ${MONTHS[d.month-1]} ${persianDigits(d.year)}`; };
  const numberDate = iso => { const d=fromISO(iso); return `${persianDigits(d.year)}/${persianDigits(String(d.month).padStart(2,'0'))}/${persianDigits(String(d.day).padStart(2,'0'))}`; };
  const shiftMonth = (key, offset) => { const p = fromKey(key); const total=p.year*12 + p.month-1 + offset; return `${Math.floor(total/12)}-${String(((total%12)+12)%12+1).padStart(2,'0')}`; };
  const daysInMonth = (key) => {
    const {year,month}=fromKey(key), next=fromKey(shiftMonth(key,1));
    return Math.round((isoToMillis(toISO(next.year,next.month,1)) - isoToMillis(toISO(year,month,1)))/DAY);
  };
  const safeTx = t => t && typeof t.id === 'string' && t.id.length < 150 && (t.type === 'income' || t.type === 'expense') && typeof t.title === 'string' && t.title.length > 0 && t.title.length <= 100 && Number.isSafeInteger(t.amount) && t.amount > 0 && typeof t.date === 'string' && Number.isFinite(isoToMillis(t.date));
  const initial = () => ({transactions:[],budgets:{},theme:'light',demoMode:false});
  function load() {
    try {
      const raw=localStorage.getItem(STORAGE_KEY);
      if (!raw) return initial();
      const old=JSON.parse(raw);
      if (!old || !Array.isArray(old.transactions)) return initial();
      const budgets={};
      if (old.budgets && typeof old.budgets === 'object') for(const [key,value] of Object.entries(old.budgets)) if (/^\d{4}-(0[1-9]|1[0-2])$/.test(key) && Number.isSafeInteger(value) && value>=0) budgets[key]=value;
      if (Object.keys(budgets).length===0 && Number.isSafeInteger(old.budget) && old.budget>=0) budgets[jKey(todayISO())]=old.budget;
      return {
        transactions: old.transactions.filter(safeTx).map(t=>({...t,category:String(t.category||''),notes:String(t.notes||'').slice(0,500)})),
        budgets,theme:old.theme==='dark'?'dark':'light',demoMode:Boolean(old.demoMode)
      };
    }catch(e){return initial();}
  }
  let data=load();
  let ui={page:'dashboard',month:jKey(todayISO()),query:'',type:'all',category:'all',sort:'newest',modal:null,picker:null,sidebar:false};
  let toastTimer;
  const save = () => {
    try{localStorage.setItem(STORAGE_KEY,JSON.stringify({...data,version:2}));return true;}
    catch(e){toast('مرورگر اجازه ذخیره‌سازی اطلاعات را نمی‌دهد.','error');return false;}
  };
  const monthTx = (key=ui.month) => data.transactions.filter(t=>jKey(t.date)===key);
  const totals = rows => rows.reduce((r,t)=>{r[t.type]+=t.amount;return r;},{income:0,expense:0});
  const monthTotals = () => totals(monthTx());
  const totalBalance = () => {const t=totals(data.transactions);return t.income-t.expense;};
  const getBudget = (key=ui.month) => data.budgets[key]||0;
  const cat = (type,id) => CATEGORIES[type]?.find(c=>c.id===id)||CATEGORIES[type]?.at(-1)||CATEGORIES.expense.at(-1);
  const sorted = rows => [...rows].sort((a,b)=>b.date.localeCompare(a.date)||b.id.localeCompare(a.id));
  const breakdown = (key=ui.month) => {
    const sums=new Map();for(const tx of monthTx(key)) if(tx.type==='expense') sums.set(tx.category,(sums.get(tx.category)||0)+tx.amount);
    return [...sums.entries()].map(([id,value])=>({...cat('expense',id),value})).sort((a,b)=>b.value-a.value);
  };
  function navigate(page) { if(!['dashboard','transactions','budget','reports'].includes(page)) return;ui.page=page;ui.sidebar=false;ui.modal=null;ui.picker=null;render();window.scrollTo({top:0,behavior:'instant'}); }
  function toast(msg,mode='success') {
    document.querySelector('.toast')?.remove();clearTimeout(toastTimer);
    const element=document.createElement('div');element.className=`toast ${mode==='error'?'error':''}`;element.setAttribute('role','status');element.innerHTML=`${ico(mode==='error'?'alert':'check','sm')}<span>${esc(msg)}</span>`;
    document.body.appendChild(element);toastTimer=setTimeout(()=>element.remove(),4000);
  }
  const nav = (page,title,glyph) => `<button class="nav-item ${ui.page===page?'active':''}" data-page="${page}" aria-current="${ui.page===page?'page':'false'}">${ico(glyph)}<span>${title}</span></button>`;
  function sidebarHTML() {
    return `<div class="sidebar-overlay ${ui.sidebar?'show':''}" data-action="close-sidebar"></div><aside class="sidebar ${ui.sidebar?'open':''}">
      <div class="brand"><div class="brand-mark">${ico('wallet')}</div><div><div class="brand-name" dir="ltr">MoneyMate</div><div class="brand-sub">همراه مالی شخصی تو</div></div></div>
      <div class="sidebar-label">مدیریت مالی</div><nav class="nav-list" aria-label="منوی اصلی">
      ${nav('dashboard','داشبورد','grid')}${nav('transactions','تراکنش‌ها','arrows')}${nav('budget','بودجه‌بندی','target')}${nav('reports','گزارش‌ها','chart')}</nav>
      <div class="sidebar-grow"></div><div class="sidebar-tip"><div class="sidebar-tip-title">${ico('spark','sm')} یک قدم به آزادی مالی</div><p>وقتی پولت رو بشناسی، انتخاب‌های بهتری برای فردا داری.</p></div>
      <div class="privacy-note">${ico('shield','sm')}<span>اطلاعات فقط روی همین مرورگر ذخیره می‌شن؛ نه روی سرور یا حساب بانکی.</span></div>
      </aside>`;
  }
  function headerHTML() {
    const titles={dashboard:'داشبورد مالی',transactions:'تراکنش‌های من',budget:'بودجه‌بندی',reports:'گزارش‌های مالی'};
    const descriptions={dashboard:'سلام! امروز هم با هم پول‌هات رو بهتر مدیریت می‌کنیم ✨',transactions:'درآمدها و هزینه‌ها، مرتب و در یک نگاه',budget:'برای هر ماه هدف مشخص کن و بهش پایبند بمون',reports:'از اعداد، تصمیم‌های بهتر بساز'};
    return `<header class="topbar"><div><div class="overline">${descriptions[ui.page]}</div><h1 class="page-heading">${titles[ui.page]}</h1></div>
      <div class="top-actions"><button class="round-btn menu-btn" data-action="toggle-sidebar" aria-label="باز کردن منو">${ico('menu')}</button>
      <div class="month-select" aria-label="انتخاب ماه شمسی"><button data-action="prev-month" aria-label="ماه شمسی قبل" title="ماه قبل">${ico('chevronRight','sm')}</button><div class="month-select-label">${ico('calendar','sm')}<span>${monthLabel(ui.month)}</span></div><button data-action="next-month" aria-label="ماه شمسی بعد" title="ماه بعد">${ico('chevronLeft','sm')}</button></div>
      <button class="round-btn" data-action="theme" title="تغییر حالت روشن و تاریک" aria-label="تغییر حالت روشن و تاریک">${ico(data.theme==='light'?'moon':'sun')}</button>
      <button class="btn btn-primary" data-action="add">${ico('plus','sm')} ثبت تراکنش</button></div></header>`;
  }
  const moneyMetric = value => `<span class="ltr">${money(value)}</span>`;
  function banner() {
    const oldSamples=data.transactions.some(t=>t.id.startsWith('demo-')||t.id.startsWith('sample-'));
    if (oldSamples) return `<section class="helper-banner warning-banner"><div><strong>✨ اطلاعات نمایشی فعال است</strong><p>برای امتحان امکانات، تراکنش‌های نمونه نمایش داده می‌شوند. آن‌ها واقعی نیستند.</p></div><button class="btn btn-small" data-action="confirm-clear-demo">حذف اطلاعات نمونه</button></section>`;
    if (!data.transactions.length) return `<section class="helper-banner"><div><strong>به MoneyMate خوش اومدی! 🌱</strong><p>اولین تراکنشت رو ثبت کن؛ یا برای آشنایی با امکانات، نمونه‌ها رو ببین.</p></div><button class="btn btn-small" data-action="load-demo">نمایش اطلاعات آزمایشی</button></section>`;
    return '';
  }
  function heroHTML() {
    const now=monthTotals();const balance=totalBalance();
    return `<div class="hero-grid"><section class="hero-card"><div class="hero-top"><span class="hero-caption">موجودی خالص کل حساب</span><span class="hero-chip">${ico('shield','sm')} فقط برای خودت</span></div>
      <div class="hero-total">${money(balance)} <small>تومان</small></div><div class="hero-bottom"><span class="hero-dot"></span> تفاوت مجموع درآمد و هزینه‌های ثبت‌شده</div></section>
      <section class="summary-card"><div class="summary-head"><span class="summary-title">درآمد ${MONTHS[fromKey(ui.month).month-1]}</span><span class="summary-icon income">${ico('trendUp')}</span></div><div><div class="summary-amount text-green">${amount(now.income)}</div><div class="summary-unit">تومان</div><div class="summary-foot">جمع درآمدهای این ماه</div></div></section>
      <section class="summary-card"><div class="summary-head"><span class="summary-title">هزینه ${MONTHS[fromKey(ui.month).month-1]}</span><span class="summary-icon expense">${ico('trendDown')}</span></div><div><div class="summary-amount text-red">${amount(now.expense)}</div><div class="summary-unit">تومان</div><div class="summary-foot">جمع پرداخت‌های این ماه</div></div></section></div>`;
  }
  const months = count => Array.from({length:count},(_,i)=>shiftMonth(ui.month,i-count+1));
  function chartHTML() {
    const ms=months(6), numbers=ms.map(m=>({key:m,...totals(monthTx(m))}));
    if (!numbers.some(d=>d.income||d.expense)) return `<div class="chart-empty">${ico('chart')}<strong>فعلاً داده‌ای برای نمودار نداریم</strong><span>با ثبت اولین تراکنش، نمودار اینجا نمایش داده می‌شه.</span></div>`;
    const max=Math.max(1,...numbers.flatMap(d=>[d.income,d.expense]));
    return `<div class="chart-area"><div class="chart-y">${[1,.75,.5,.25,0].map(x=>`<span>${compact(Math.round(max*x))}</span>`).join('')}</div><div class="chart-main"><div class="chart-grid-lines">${[1,2,3,4,5].map(()=>'<span></span>').join('')}</div>
      <div class="bars">${numbers.map(d=>`<div class="bar-group" title="${esc(monthLabel(d.key))}: درآمد ${amount(d.income)}، هزینه ${amount(d.expense)} تومان"><div class="bar bar-income" style="height:${Math.max(1,100*d.income/max)}%"></div><div class="bar bar-expense" style="height:${Math.max(1,100*d.expense/max)}%"></div><label>${MONTHS[fromKey(d.key).month-1]}</label></div>`).join('')}</div></div></div>`;
  }
  function chartPanel() {
    return `<section class="panel"><div class="panel-head"><div><h2 class="panel-title">درآمد و هزینه در گذر زمان</h2><div class="panel-sub">مقایسه ۶ ماه شمسی تا ${esc(monthLabel(ui.month))}</div></div><div class="legend"><span><i class="legend-dot" style="background:#24c3a0"></i>درآمد</span><span><i class="legend-dot" style="background:#fa8b9f"></i>هزینه</span></div></div>${chartHTML()}</section>`;
  }
  function donutPanel() {
    const rows=breakdown(),sum=rows.reduce((a,c)=>a+c.value,0);
    if (!sum) return `<section class="panel"><div class="panel-head"><div><h2 class="panel-title">هزینه‌ها به تفکیک دسته</h2><div class="panel-sub">بیشتر پولت کجا خرج شده؟</div></div>${ico('pie','sm')}</div><div class="chart-empty">${ico('pie')}<strong>هنوز هزینه‌ای ثبت نشده</strong><span>دسته‌بندی هزینه‌ها بعد از ثبت نمایش داده می‌شه.</span></div></section>`;
    let pct=0;
    const segments=rows.map(r=>{const start=pct;pct+=r.value/sum*100;return `${r.color} ${start.toFixed(3)}% ${pct.toFixed(3)}%`;}).join(',');
    return `<section class="panel"><div class="panel-head"><div><h2 class="panel-title">هزینه‌ها به تفکیک دسته</h2><div class="panel-sub">بیشتر پولت کجا خرج شده؟</div></div>${ico('pie','sm')}</div>
    <div class="donut-layout"><div class="donut" style="background:conic-gradient(${segments})"><div class="donut-center"><span>کل هزینه</span><strong>${compact(sum)}</strong><span>تومان</span></div></div>
    <div class="donut-legend">${rows.slice(0,5).map(r=>`<div class="donut-legend-row"><span class="right"><i class="dot" style="background:${r.color}"></i><span class="label">${esc(r.short)}</span></span><strong>${fmt.format(Math.round(r.value/sum*100))}٪</strong></div>`).join('')}</div></div></section>`;
  }
  function rowHTML(t,withTools=true) {
    const c=cat(t.type,t.category);
    return `<div class="tx-row"><div class="tx-icon" style="background:${c.bg}">${c.emoji}</div><div class="tx-info"><div class="tx-title">${esc(t.title)}</div><div class="tx-details">${esc(c.short)} · ${shortDate(t.date)}</div></div><div class="tx-price ${t.type}">${t.type==='income'?'+':'−'} ${amount(t.amount)} <span class="tiny">تومان</span></div>${withTools?`<div class="row-tools"><button class="icon-btn" aria-label="ویرایش ${esc(t.title)}" title="ویرایش" data-action="edit" data-id="${esc(t.id)}">${ico('edit','sm')}</button><button class="icon-btn" aria-label="حذف ${esc(t.title)}" title="حذف" data-action="delete" data-id="${esc(t.id)}">${ico('trash','sm')}</button></div>`:''}</div>`;
  }
  function empty(title,desc,button='ثبت اولین تراکنش') {
    return `<div class="empty-block"><div class="empty-illustration">${ico('wallet','lg')}</div><strong>${title}</strong><p>${desc}</p><button class="btn btn-soft btn-small" data-action="add">${ico('plus','sm')} ${button}</button></div>`;
  }
  function recentPanel() {
    const recent=sorted(monthTx()).slice(0,5);
    return `<section class="panel"><div class="panel-head"><div><h2 class="panel-title">تراکنش‌های اخیر</h2><div class="panel-sub">آخرین پرداخت‌ها و دریافت‌های ${esc(monthLabel(ui.month))}</div></div><button class="panel-action" data-page="transactions">مشاهده همه ${ico('arrow','sm')}</button></div>
      ${recent.length?`<div class="tx-list">${recent.map(r=>rowHTML(r,false)).join('')}</div>`:empty('هنوز تراکنشی نداری','اولین درآمد یا هزینه این ماهت رو ثبت کن.')}</section>`;
  }
  function budgetStatus() {
    const budget=getBudget(),spent=monthTotals().expense,remain=budget-spent,pct=budget>0?Math.round(spent/budget*100):0;
    return {budget,spent,remain,pct};
  }
  function budgetWidget() {
    const b=budgetStatus();
    return `<section class="panel"><div class="panel-head"><div><h2 class="panel-title">بودجه این ماه</h2><div class="panel-sub">برنامه‌ریزی برای ${esc(monthLabel(ui.month))}</div></div><button class="panel-action" data-page="budget">جزئیات ${ico('arrow','sm')}</button></div>
    ${b.budget>0?`<div class="budget-stats"><div class="budget-numbers"><div><small>بودجه تعیین‌شده</small><strong>${amount(b.budget)}</strong><small> تومان</small></div><span class="muted tiny">${fmt.format(b.pct)}٪ مصرف‌شده</span></div>
    <div class="progress"><div class="progress-bar ${b.pct>100?'warning':''}" style="width:${Math.min(100,b.pct)}%"></div></div><div class="budget-mini"><span>هزینه‌شده: <strong>${amount(b.spent)}</strong></span><span>باقی‌مانده: <strong>${money(b.remain)}</strong></span></div>
    <div class="budget-status ${b.remain<0?'warning':''}">${b.remain<0?'⚠️ از سقف بودجه این ماه عبور کردی.':'✓ '+(b.pct===0?'هنوز از بودجه‌ات استفاده نکردی.':'خوب پیش می‌ری؛ مراقب سقف هزینه‌ها باش.')}</div>
    <button class="btn btn-soft btn-small" data-action="edit-budget">${ico('edit','sm')} ویرایش بودجه</button></div>`:
    `<div class="empty-block" style="min-height:205px">${ico('target','lg')}<strong>بودجه‌ای تعریف نشده</strong><p>برای کنترل خرج‌هات، سقف هزینه ماهانه تعیین کن.</p><button class="btn btn-soft btn-small" data-action="edit-budget">تعیین بودجه ماه</button></div>`}</section>`;
  }
  function dashboard() {return `${banner()}${heroHTML()}<div class="section-grid">${chartPanel()}${donutPanel()}</div><div class="lower-grid">${recentPanel()}${budgetWidget()}</div>`;}
  function filteredTx() {
    let rows=monthTx();
    if(ui.type!=='all') rows=rows.filter(t=>t.type===ui.type);
    if(ui.category!=='all') rows=rows.filter(t=>t.category===ui.category);
    const q=ui.query.trim().toLocaleLowerCase('fa-IR');
    if(q) rows=rows.filter(t=>[t.title,t.notes,cat(t.type,t.category).title].some(x=>x.toLocaleLowerCase('fa-IR').includes(q)));
    rows=[...rows].sort((a,b)=>{
      if(ui.sort==='oldest') return a.date.localeCompare(b.date);
      if(ui.sort==='largest') return b.amount-a.amount;
      if(ui.sort==='smallest') return a.amount-b.amount;
      return b.date.localeCompare(a.date);
    });return rows;
  }
  function transactionsPage() {
    const rows=filteredTx();const types=[...CATEGORIES.expense,...CATEGORIES.income];
    return `${banner()}<section class="panel"><div class="page-header"><p class="page-sub">تراکنش‌های ${esc(monthLabel(ui.month))} را جست‌وجو، ویرایش یا دسته‌بندی کن.</p><button class="btn btn-ghost btn-small" data-action="export-csv">${ico('download','sm')} خروجی CSV</button></div>
    <div class="toolbar"><label class="search-field field">${ico('search','sm')}<input type="search" id="tx-search" placeholder="جست‌وجو در تراکنش‌ها…" value="${esc(ui.query)}" aria-label="جست‌وجوی تراکنش‌ها" /></label>
    <select class="field" id="tx-type" aria-label="فیلتر نوع"><option value="all">همه تراکنش‌ها</option><option value="income" ${ui.type==='income'?'selected':''}>فقط درآمد</option><option value="expense" ${ui.type==='expense'?'selected':''}>فقط هزینه</option></select>
    <select class="field" id="tx-category" aria-label="فیلتر دسته‌بندی"><option value="all">همه دسته‌ها</option>${types.filter((c,i,arr)=>arr.findIndex(x=>x.id===c.id)===i).map(c=>`<option value="${c.id}" ${ui.category===c.id?'selected':''}>${esc(c.title)}</option>`).join('')}</select>
    <select class="field" id="tx-sort" aria-label="مرتب‌سازی"><option value="newest" ${ui.sort==='newest'?'selected':''}>جدیدترین</option><option value="oldest" ${ui.sort==='oldest'?'selected':''}>قدیمی‌ترین</option><option value="largest" ${ui.sort==='largest'?'selected':''}>بیشترین مبلغ</option><option value="smallest" ${ui.sort==='smallest'?'selected':''}>کمترین مبلغ</option></select></div>
    <div class="muted tiny" style="margin-bottom:9px">${fmt.format(rows.length)} تراکنش</div>
    ${rows.length?`<div class="table-scroll"><table class="data-table"><thead><tr><th>عنوان</th><th>دسته</th><th>تاریخ شمسی</th><th>نوع</th><th>مبلغ (تومان)</th><th>عملیات</th></tr></thead><tbody>${rows.map(t=>{const c=cat(t.type,t.category);return `<tr><td><div class="tx-cell"><div class="tx-icon" style="background:${c.bg}">${c.emoji}</div><div><div class="tx-title">${esc(t.title)}</div>${t.notes?`<div class="tx-details">${esc(t.notes.slice(0,45))}</div>`:''}</div></div></td><td>${esc(c.short)}</td><td>${shortDate(t.date)}</td><td><span class="pill ${t.type}">${t.type==='income'?'درآمد':'هزینه'}</span></td><td><b class="tx-price ${t.type}">${amount(t.amount)}</b></td><td><div class="row-tools"><button class="icon-btn" data-action="edit" data-id="${esc(t.id)}" aria-label="ویرایش ${esc(t.title)}">${ico('edit','sm')}</button><button class="icon-btn" data-action="delete" data-id="${esc(t.id)}" aria-label="حذف ${esc(t.title)}">${ico('trash','sm')}</button></div></td></tr>`}).join('')}</tbody></table></div>`:
    empty('تراکنشی پیدا نشد','ماه، دسته یا فیلترها رو تغییر بده؛ یا تراکنش جدیدی ثبت کن.')}</section>`;
  }
  function categoriesList() {
    const rows=breakdown(),sum=rows.reduce((a,r)=>a+r.value,0);
    if(!rows.length) return `<div class="chart-empty">${ico('pie')}<span>هنوز هزینه‌ای در این ماه ثبت نشده.</span></div>`;
    return rows.map(c=>`<div class="cat-progress"><div class="cat-progress-top"><span>${c.emoji} ${esc(c.title)}</span><strong>${amount(c.value)} تومان</strong></div><div class="thin-track"><div class="thin-fill" style="background:${c.color};width:${100*c.value/sum}%"></div></div></div>`).join('');
  }
  function budgetPage() {
    const b=budgetStatus();
    return `${banner()}<p class="page-sub">بودجه ${esc(monthLabel(ui.month))} را تعیین کن، هزینه‌ها را کنترل کن و ببین کدام دسته‌ها سهم بیشتری دارند.</p>
      <section class="budget-banner"><div><small>سقف بودجه ${esc(monthLabel(ui.month))}</small><strong>${b.budget?amount(b.budget):'تعیین نشده'}</strong><small>${b.budget?'تومان':'برای شروع یک بودجه تعریف کن'}</small></div><button class="btn btn-small" data-action="edit-budget">${ico('edit','sm')} ${b.budget?'ویرایش بودجه':'تعیین بودجه'}</button></section>
      <div class="double-grid"><section class="panel"><div class="panel-head"><div><h2 class="panel-title">وضعیت بودجه</h2><div class="panel-sub">مصرف و مانده ماه جاری</div></div></div>
        ${b.budget?`<div class="budget-stats"><div class="budget-numbers"><strong>${fmt.format(b.pct)}٪</strong><small>از سقف هزینه استفاده شده</small></div><div class="progress"><div class="progress-bar ${b.pct>100?'warning':''}" style="width:${Math.min(100,b.pct)}%"></div></div><div class="budget-mini"><span>هزینه‌شده</span><strong>${amount(b.spent)} تومان</strong></div><div class="budget-mini"><span>باقی‌مانده</span><strong class="${b.remain<0?'text-red':'text-green'}">${money(b.remain)} تومان</strong></div><div class="budget-status ${b.remain<0?'warning':''}">${b.remain<0?'⚠️ هزینه‌های این ماه از بودجه بیشتر شده.':'✓ هنوز در محدوده بودجه تعریف‌شده هستی.'}</div></div>`:
        `<div class="chart-empty">${ico('target')}<span>برای دیدن پیشرفت، اول بودجه ماهانه‌ات را مشخص کن.</span></div>`}</section>
        <section class="panel"><div class="panel-head"><div><h2 class="panel-title">هزینه‌ها بر اساس دسته</h2><div class="panel-sub">از بیشترین تا کمترین هزینه</div></div></div>${categoriesList()}</section></div>`;
  }
  function reportsPage() {
    const t=monthTotals(),savings=t.income-t.expense,percent=t.income>0?Math.round(savings/t.income*100):null;
    const groups=breakdown();const highest=groups[0];
    const info=[
      t.income?`در این ماه ${amount(t.income)} تومان درآمد ثبت کرده‌ای.`:'برای این ماه هنوز درآمدی ثبت نشده است.',
      highest?`بیشترین هزینه مربوط به «${highest.title}» با ${amount(highest.value)} تومان بوده.`:'پس از ثبت اولین هزینه، دسته پرخرج اینجا نمایش داده می‌شود.',
      getBudget()?monthTotals().expense>getBudget()?`این ماه ${amount(t.expense-getBudget())} تومان بیشتر از سقف بودجه خرج کرده‌ای.`:`از سقف بودجه ${amount(getBudget())} تومانی خودت عبور نکرده‌ای.`:'با تعریف بودجه ماهانه می‌توانی کنترل بهتری بر هزینه‌ها داشته باشی.'
    ];
    return `${banner()}<div class="page-header"><p class="page-sub">نگاه دقیق‌تر به وضعیت ${esc(monthLabel(ui.month))}؛ فقط بر اساس تراکنش‌های واقعی ثبت‌شده.</p><button class="btn btn-ghost btn-small" data-action="export-csv">${ico('download','sm')} دریافت CSV</button></div>
      <div class="stat-stripe"><div class="stat-box"><small>خالص ماه</small><strong class="${savings<0?'text-red':'text-green'}">${money(savings)}</strong><span>تومان</span></div><div class="stat-box"><small>نرخ پس‌انداز</small><strong>${percent===null?'—':fmt.format(percent)+'٪'}</strong><span>خالص تقسیم بر درآمد ماه</span></div><div class="stat-box"><small>تعداد تراکنش‌ها</small><strong>${fmt.format(monthTx().length)}</strong><span>ثبت‌شده در این ماه</span></div></div>
      <div class="section-grid">${chartPanel()}${donutPanel()}</div>
      <div class="double-grid"><section class="panel"><div class="panel-head"><div><h2 class="panel-title">خلاصه هوشمندانه اعداد</h2><div class="panel-sub">تحلیل ساده بر پایه داده‌های خودت، بدون AI خارجی</div></div></div><div class="insight-list">${info.map(line=>`<div class="insight">${ico('spark','sm')}<span>${esc(line)}</span></div>`).join('')}</div></section>
      <section class="panel"><div class="panel-head"><div><h2 class="panel-title">پشتیبان‌گیری از اطلاعات</h2><div class="panel-sub">مهم: داده‌ها تنها در همین مرورگر ذخیره می‌شوند.</div></div></div><p class="page-sub">برای انتقال به مرورگر یا دستگاه دیگر، فایل JSON بگیر و سپس آن را وارد کن.</p><div class="budget-action-row" style="flex-wrap:wrap;margin-top:18px"><button class="btn btn-soft btn-small" data-action="export-json">${ico('download','sm')} دانلود پشتیبان JSON</button><button class="btn btn-ghost btn-small" data-action="import-json">${ico('upload','sm')} بازیابی فایل JSON</button></div></section></div>`;
  }
  function modalHTML() {
    if(!ui.modal)return '';
    const m=ui.modal;
    if(m.kind==='transaction') {
      const t=m.id?data.transactions.find(x=>x.id===m.id):null;
      if(m.id&&!t)return '';
      const type=t?.type||'expense',date=t?.date||todayISO();
      return `<div class="modal-backdrop" data-action="backdrop"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-heading"><div class="modal-head"><h2 id="modal-heading">${t?'ویرایش تراکنش':'ثبت تراکنش جدید'}</h2><button class="modal-close" data-action="close-modal" aria-label="بستن">${ico('close','sm')}</button></div>
      <form id="transaction-form"><div class="type-tabs"><label class="type-tab"> <input type="radio" name="type" value="expense" ${type==='expense'?'checked':''}/> ${ico('trendDown','sm')} هزینه</label><label class="type-tab"><input type="radio" name="type" value="income" ${type==='income'?'checked':''}/> ${ico('trendUp','sm')} درآمد</label></div>
      <div class="form-field"><label for="tx-title">عنوان تراکنش *</label><input id="tx-title" name="title" maxlength="80" placeholder="مثلاً خرید سوپرمارکت" value="${esc(t?.title||'')}" required autocomplete="off"/></div>
      <div class="form-grid"><div class="form-field"><label for="tx-amount">مبلغ (تومان) *</label><input id="tx-amount" name="amount" type="number" step="1" min="1" max="9007199254740991" placeholder="مثلاً ۳۵۰۰۰۰" value="${t?.amount||''}" required /></div>
      <div class="form-field"><label for="tx-date-btn">تاریخ شمسی *</label><div class="date-field"><input id="tx-date" name="date" type="hidden" value="${date}" /><button id="tx-date-btn" class="date-button" type="button" data-action="open-calendar" aria-haspopup="dialog" aria-expanded="false" aria-controls="calendar-layer"><span id="date-label">${numberDate(date)}</span>${ico('calendar','sm')}</button></div></div></div>
      <div class="form-field"><label for="form-category">دسته‌بندی *</label><select id="form-category" name="category" required>${CATEGORIES[type].map(c=>`<option value="${c.id}" ${c.id===t?.category?'selected':''}>${c.emoji} ${esc(c.title)}</option>`).join('')}</select></div>
      <div class="form-field"><label for="tx-notes">توضیح (اختیاری)</label><textarea id="tx-notes" name="notes" maxlength="500" placeholder="توضیح کوتاه درباره تراکنش…">${esc(t?.notes||'')}</textarea></div>
      <div class="modal-footer"><button class="btn btn-ghost" type="button" data-action="close-modal">انصراف</button><button class="btn btn-primary" type="submit">${ico('check','sm')} ${t?'ذخیره تغییرات':'ثبت تراکنش'}</button></div></form></section></div>`;
    }
    if(m.kind==='budget')return `<div class="modal-backdrop" data-action="backdrop"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-heading"><div class="modal-head"><h2 id="modal-heading">تنظیم بودجه ${monthLabel(ui.month)}</h2><button class="modal-close" data-action="close-modal" aria-label="بستن">${ico('close','sm')}</button></div><p class="modal-copy">سقف کل هزینه‌های این ماه را به تومان تعیین کن. واردکردن صفر یعنی حذف سقف بودجه.</p><form id="budget-form"><div class="form-field"><label for="budget-amount">بودجه ماهانه (تومان)</label><input type="number" id="budget-amount" name="budget" min="0" step="1" max="9007199254740991" value="${getBudget()}" required /></div><div class="modal-footer"><button class="btn btn-ghost" type="button" data-action="close-modal">انصراف</button><button type="submit" class="btn btn-primary">${ico('save','sm')} ذخیره بودجه</button></div></form></section></div>`;
    const messages={delete:['حذف تراکنش','این تراکنش حذف می‌شود. مطمئنی؟','بله، حذف کن'],clearDemo:['حذف تراکنش‌های نمونه','فقط تراکنش‌های نمایشی پاک می‌شوند. تراکنش‌هایی که خودت ثبت کرده‌ای باقی می‌مانند.','حذف نمونه‌ها']};
    const [title,description,button]=messages[m.kind]||['تأیید عملیات','آیا مطمئنی؟','تأیید'];
    return `<div class="modal-backdrop" data-action="backdrop"><section class="modal" role="alertdialog" aria-modal="true" aria-labelledby="modal-heading"><div class="modal-head"><h2 id="modal-heading">${title}</h2><button class="modal-close" data-action="close-modal" aria-label="بستن">${ico('close','sm')}</button></div><p class="modal-copy">${description}</p><div class="modal-footer"><button class="btn btn-ghost" data-action="close-modal">انصراف</button><button class="btn btn-danger" data-action="confirm-modal">${button}</button></div></section></div>`;
  }
  // Calendar is mounted *outside* the scrollable transaction modal. This avoids
  // hidden arrows, horizontal scrollbars and unclickable calendar navigation.
  function calendarHTML() {
    if(!ui.picker)return '';
    const k=ui.picker,dt=fromKey(k),days=daysInMonth(k),first=toISO(dt.year,dt.month,1);
    const firstDow=(new Date(isoToMillis(first)).getUTCDay()+1)%7;
    const selected=root.querySelector('#tx-date')?.value||todayISO();
    const current=todayISO();
    const cells=Array.from({length:firstDow},()=>'<span class="cal-blank"></span>');
    for(let d=1;d<=days;d++) {
      const iso=toISO(dt.year,dt.month,d);
      cells.push(`<button class="cal-day ${iso===current?'today':''} ${iso===selected?'selected':''}" type="button" data-action="pick-day" data-date="${iso}" aria-label="${fullDate(iso)}" aria-pressed="${iso===selected}">${fmt.format(d)}</button>`);
    }
    return `<div class="calendar-screen" data-action="cal-dismiss"><section class="calendar-dialog" role="dialog" aria-modal="true" aria-labelledby="calendar-heading" dir="rtl">
      <div class="calendar-title-row"><div><small>انتخاب تاریخ تراکنش</small><h3 id="calendar-heading">${monthLabel(k)}</h3></div><button class="calendar-x" type="button" data-action="cal-close" aria-label="بستن تقویم">${ico('close','sm')}</button></div>
      <div class="calendar-navigation"><button class="calendar-move" type="button" data-action="cal-prev" aria-label="ماه قبل">${ico('chevronRight','sm')} ماه قبل</button><strong aria-live="polite">${monthLabel(k)}</strong><button class="calendar-move" type="button" data-action="cal-next" aria-label="ماه بعد">ماه بعد ${ico('chevronLeft','sm')}</button></div>
      <div class="cal-week">${WEEKDAYS.map(w=>`<span>${w}</span>`).join('')}</div><div class="cal-days">${cells.join('')}</div>
      <div class="calendar-footer"><button type="button" data-action="cal-today">${ico('calendar','sm')} امروز</button><button type="button" data-action="cal-close">انصراف</button></div>
    </section></div>`;
  }
  function updatePicker(open=true) {
    const layer=root.querySelector('#calendar-layer'),button=root.querySelector('#tx-date-btn');
    if(!layer)return;
    if(!open)ui.picker=null;
    layer.innerHTML=open?calendarHTML():'';
    layer.setAttribute('aria-hidden',String(!open));
    if(button)button.setAttribute('aria-expanded',String(Boolean(open)));
  }
  function render() {
    document.documentElement.setAttribute('data-theme',data.theme);
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content',data.theme==='dark'?'#0b1525':'#101f34');
    root.innerHTML=`<div class="shell">${sidebarHTML()}<main class="workspace">${headerHTML()}${{dashboard,transactions:transactionsPage,budget:budgetPage,reports:reportsPage}[ui.page]()}<footer class="footer">${ico('lock','sm')} MoneyMate 2.1 · بدون اتصال به بانک · اطلاعات فقط در همین مرورگر ذخیره می‌شوند</footer></main>
    <nav class="mobile-nav" aria-label="پیمایش موبایل">${nav('dashboard','داشبورد','grid')}${nav('transactions','تراکنش‌ها','arrows')}${nav('budget','بودجه','target')}${nav('reports','گزارش‌ها','chart')}</nav>
    <input class="file-input" type="file" id="backup-input" accept=".json,application/json" aria-label="انتخاب فایل پشتیبان JSON" />${modalHTML()}<div id="calendar-layer" aria-hidden="true"></div></div>`;
    if(ui.modal?.kind==='transaction') root.querySelector('#tx-title')?.focus({preventScroll:true});
    else if(ui.modal?.kind==='budget') root.querySelector('#budget-amount')?.focus({preventScroll:true});
  }
  function demoTransactions() {
    const result=[];let idx=0;
    for(let offset=-5;offset<=0;offset++) {
      const k=shiftMonth(jKey(todayISO()),offset),ym=fromKey(k);
      const make=(day,title,value,category,type='expense')=>{
        const date=toISO(ym.year,ym.month,Math.min(day,daysInMonth(k)));
        result.push({id:`demo-${++idx}`,title,amount:value,category,type,date,notes:'اطلاعات نمونه برای نمایش قابلیت‌ها'});
      };
      const n=offset+6;
      make(3,'حقوق ماهانه',38000000+n*650000,'salary','income');
      make(11,'پروژه جانبی',4500000+n*340000,'freelance','income');
      make(2,'اجاره خانه',13000000+n*230000,'bills');
      make(6,'خرید سوپرمارکت',2650000+n*105000,'food');
      make(8,'اینترنت و قبض',620000+n*22000,'bills');
      make(13,'تاکسی اینترنتی',870000+n*56000,'transport');
      make(15,'رستوران و کافه',1250000+n*95000,'food');
      make(18,'خرید پوشاک',1840000+n*130000,'shopping');
      make(21,'آموزش زبان',1750000+n*45000,'education');
      make(24,'سینما و تفریح',600000+n*50000,'entertainment');
    }
    return result;
  }
  function uuid() {return typeof crypto!=='undefined' && crypto.randomUUID?crypto.randomUUID():`user-${Date.now()}-${Math.random().toString(36).slice(2)}`;}
  function downloadFile(name,body,type) {
    const blob=new Blob([body],{type});const url=URL.createObjectURL(blob);
    const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);
  }
  function exportCSV() {
    if(!data.transactions.length){toast('هنوز تراکنشی برای خروجی وجود ندارد.','error');return;}
    const quote=v=>`"${String(v??'').replace(/"/g,'""')}"`;
    const rows=[['شناسه','تاریخ شمسی','تاریخ میلادی','نوع','عنوان','دسته‌بندی','مبلغ (تومان)','یادداشت'],...sorted(data.transactions).map(t=>[t.id,numberDate(t.date),t.date,t.type==='income'?'درآمد':'هزینه',t.title,cat(t.type,t.category).title,t.amount,t.notes])];
    const csv='\uFEFF'+rows.map(row=>row.map(quote).join(',')).join('\r\n');
    downloadFile(`MoneyMate-transactions-${todayISO()}.csv`,csv,'text/csv;charset=utf-8');toast('فایل CSV آماده دانلود شد.');
  }
  function exportJSON() {
    downloadFile(`MoneyMate-backup-${todayISO()}.json`,JSON.stringify({...data,version:2},null,2),'application/json;charset=utf-8');
    toast('نسخه پشتیبان JSON دریافت شد.');
  }
  function resetFilters() {ui.query='';ui.type='all';ui.category='all';ui.sort='newest';}

  root.addEventListener('click',event=>{
    const page=event.target.closest('[data-page]');if(page){navigate(page.dataset.page);return;}
    const el=event.target.closest('[data-action]');if(!el)return;
    const action=el.dataset.action,id=el.dataset.id;
    if(action==='backdrop'){if(event.target===el){ui.modal=null;ui.picker=null;render();}return;}
    if(action==='close-modal'){ui.modal=null;ui.picker=null;render();return;}
    if(action==='toggle-sidebar'){ui.sidebar=!ui.sidebar;render();return;}
    if(action==='close-sidebar'){ui.sidebar=false;render();return;}
    if(action==='theme'){data.theme=data.theme==='light'?'dark':'light';save();render();return;}
    if(action==='prev-month'||action==='next-month'){ui.month=shiftMonth(ui.month,action==='prev-month'?-1:1);render();return;}
    if(action==='add'){ui.modal={kind:'transaction'};ui.picker=null;render();return;}
    if(action==='edit'){ui.modal={kind:'transaction',id};ui.picker=null;render();return;}
    if(action==='delete'){ui.modal={kind:'delete',id};render();return;}
    if(action==='edit-budget'){ui.modal={kind:'budget'};render();return;}
    if(action==='confirm-clear-demo'){ui.modal={kind:'clearDemo'};render();return;}
    if(action==='load-demo'){
      if(data.transactions.length){toast('برای حفظ اطلاعاتت، داده‌های فعلی جایگزین نمی‌شوند.','error');return;}
      data.transactions=demoTransactions();data.demoMode=true;data.budgets[ui.month]=32000000;save();render();toast('اطلاعات آزمایشی بارگذاری شد.');return;
    }
    if(action==='confirm-modal'){
      if(ui.modal?.kind==='delete'){data.transactions=data.transactions.filter(t=>t.id!==ui.modal.id);save();ui.modal=null;render();toast('تراکنش حذف شد.');return;}
      if(ui.modal?.kind==='clearDemo'){
        const before=data.transactions.length;
        data.transactions=data.transactions.filter(t=>!t.id.startsWith('demo-')&&!t.id.startsWith('sample-'));
        data.demoMode=false;save();ui.modal=null;render();toast(`${fmt.format(before-data.transactions.length)} تراکنش نمونه حذف شد.`);return;
      }
    }
    if(action==='export-csv'){exportCSV();return;}
    if(action==='export-json'){exportJSON();return;}
    if(action==='import-json'){root.querySelector('#backup-input')?.click();return;}
    if(action==='open-calendar'){
      const opened=Boolean(ui.picker);
      if(opened){updatePicker(false);}else{ui.picker=jKey(root.querySelector('#tx-date').value);updatePicker(true);}return;
    }
    if(action==='cal-prev'||action==='cal-next'){
      if(!ui.picker)return;
      ui.picker=shiftMonth(ui.picker,action==='cal-prev'?-1:1);
      updatePicker(true);
      root.querySelector(`[data-action="${action}"]`)?.focus({preventScroll:true});
      return;
    }
    if(action==='cal-dismiss'){if(event.target===el)updatePicker(false);return;}
    if(action==='cal-close'){updatePicker(false);return;}
    if(action==='pick-day'||action==='cal-today'){
      const iso=action==='cal-today'?todayISO():el.dataset.date;
      if(!Number.isFinite(isoToMillis(iso)))return;
      root.querySelector('#tx-date').value=iso;
      root.querySelector('#date-label').textContent=numberDate(iso);
      updatePicker(false);root.querySelector('#tx-date-btn')?.focus();return;
    }
  });
  root.addEventListener('change',async(event)=>{
    const el=event.target;
    if(el.name==='type'&&el.closest('#transaction-form')){
      const sel=root.querySelector('#form-category');sel.innerHTML=CATEGORIES[el.value].map(c=>`<option value="${c.id}">${c.emoji} ${esc(c.title)}</option>`).join('');return;
    }
    if(el.id==='tx-type'){ui.type=el.value;render();return;}
    if(el.id==='tx-category'){ui.category=el.value;render();return;}
    if(el.id==='tx-sort'){ui.sort=el.value;render();return;}
    if(el.id==='backup-input'&&el.files?.[0]){
      const file=el.files[0];
      try{
        if(file.size>5*1024*1024) throw Error('فایل خیلی بزرگ است.');
        const restored=JSON.parse(await file.text());
        if(!restored||!Array.isArray(restored.transactions)||!restored.transactions.every(safeTx)||restored.transactions.length>30000)throw Error('ساختار فایل معتبر نیست.');
        const budgets={};if(restored.budgets&&typeof restored.budgets==='object')for(const [key,value] of Object.entries(restored.budgets))if(/^\d{4}-(0[1-9]|1[0-2])$/.test(key)&&Number.isSafeInteger(value)&&value>=0)budgets[key]=value;
        if(!window.confirm('بازیابی این فایل، همه تراکنش‌ها و بودجه‌های فعلی همین مرورگر را جایگزین می‌کند. ابتدا از داده‌های فعلی پشتیبان گرفته‌ای؟'))return;
        data={transactions:restored.transactions.map(t=>({...t,category:String(t.category||''),notes:String(t.notes||'').slice(0,500)})),budgets,theme:restored.theme==='dark'?'dark':'light',demoMode:Boolean(restored.demoMode)};
        resetFilters();save();render();toast('اطلاعات پشتیبان بازیابی شد.');
      }catch(e){toast('فایل پشتیبان معتبر نیست یا قابل خواندن نیست.','error');}
      return;
    }
  });
  root.addEventListener('input',event=>{
    if(event.target.id==='tx-search'){
      const pos=event.target.selectionStart;ui.query=event.target.value;render();const input=root.querySelector('#tx-search');if(input){input.focus();try{input.setSelectionRange(pos,pos)}catch(e){/* optional */}}}
  });
  root.addEventListener('submit',event=>{
    event.preventDefault();
    if(event.target.id==='transaction-form'){
      const form=new FormData(event.target),type=form.get('type'),title=String(form.get('title')||'').trim(),sum=Number(form.get('amount')),
        iso=String(form.get('date')||''),category=String(form.get('category')||''),notes=String(form.get('notes')||'').trim();
      if(!title||title.length>80||!Number.isSafeInteger(sum)||sum<=0||!Number.isFinite(isoToMillis(iso))||!CATEGORIES[type]?.some(c=>c.id===category)||notes.length>500){toast('لطفاً اطلاعات تراکنش را کامل و درست وارد کن.','error');return;}
      const editing=ui.modal?.id;
      const item={id:editing||uuid(),type,title,amount:sum,date:iso,category,notes};
      if(editing)data.transactions=data.transactions.map(x=>x.id===editing?item:x);
      else data.transactions.push(item);
      ui.month=jKey(iso);ui.modal=null;ui.picker=null;save();render();toast(editing?'تراکنش ویرایش شد.':'تراکنش با موفقیت ثبت شد.');return;
    }
    if(event.target.id==='budget-form'){
      const value=Number(new FormData(event.target).get('budget'));
      if(!Number.isSafeInteger(value)||value<0){toast('مبلغ بودجه معتبر نیست.','error');return;}
      if(value===0)delete data.budgets[ui.month];else data.budgets[ui.month]=value;
      ui.modal=null;save();render();toast('بودجه ماه شمسی ذخیره شد.');
    }
  });
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'){
      if(ui.picker){updatePicker(false);return;}
      if(ui.modal){ui.modal=null;render();return;}
      if(ui.sidebar){ui.sidebar=false;render();}
    }
  });
  // The full-screen calendar dismiss layer handles outside clicks itself.
  // A document-level click handler would mistakenly close the calendar after
  // a navigation click replaces its inner DOM (the clicked button is detached).
  render();
})();
