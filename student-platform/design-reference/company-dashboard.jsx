/* global React, ReactDOM */
const { useState, useEffect, useRef, useMemo } = React;

/* ─────────────────────────── ICONS ─────────────────────────── */
const I = {
  logo: (p) => (
    <svg viewBox="0 0 32 32" fill="none" {...p}>
      <rect x="2" y="2" width="28" height="28" rx="7" fill="currentColor"/>
      <path d="M9 20.5L16 9l7 11.5H17.5L16 18l-1.5 2.5H9z" fill="#fff"/>
      <circle cx="16" cy="22.5" r="1.5" fill="#fff"/>
    </svg>
  ),
  search: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" {...p}><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>,
  bell:   (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2H4.5L6 16z"/><path d="M10 21a2 2 0 0 0 4 0"/></svg>,
  chev:   (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M6 9l6 6 6-6"/></svg>,
  home:   (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/></svg>,
  plus:   (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...p}><path d="M12 5v14M5 12h14"/></svg>,
  flag:   (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M5 21V4"/><path d="M5 5h12l-2 4 2 4H5"/></svg>,
  stack:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5"/><path d="M3 17l9 5 9-5"/></svg>,
  inbox:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 13l3-8h12l3 8"/><path d="M3 13h5l1 3h6l1-3h5v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6z"/></svg>,
  arrow:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M5 12h14M13 6l6 6-6 6"/></svg>,
  check:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M5 12.5l4.5 4.5L19 7"/></svg>,
  clock:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>,
  ext:    (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M7 17L17 7M9 7h8v8"/></svg>,
  github: (p) => <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.14-1.1-1.44-1.1-1.44-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.9.83.1-.65.35-1.08.63-1.33-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.9-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.86v2.76c0 .27.18.58.69.48A10 10 0 0 0 12 2z"/></svg>,
  cal:    (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></svg>,
  trend:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 17l6-6 4 4 8-9"/><path d="M14 6h7v7"/></svg>,
  users:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="9" cy="8" r="3.5"/><path d="M2 21c.7-3.6 3.6-5.5 7-5.5s6.3 1.9 7 5.5"/><circle cx="17" cy="6" r="2.5"/><path d="M15.5 14.5c2.8.3 5.1 1.9 6.5 4.5"/></svg>,
  eye:    (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>,
  msg:    (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M21 12a7 7 0 0 1-10.6 6l-4.4 1 1.1-4A7 7 0 1 1 21 12z"/></svg>,
  more:   (p) => <svg viewBox="0 0 24 24" fill="currentColor" {...p}><circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/></svg>,
  sparkle:(p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z"/></svg>,
  link:   (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/></svg>,
  filter: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 5h18M6 12h12M10 19h4"/></svg>,
  download:(p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 4v12"/><path d="M7 11l5 5 5-5"/><path d="M4 20h16"/></svg>,
  x:      (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M6 6l12 12M18 6L6 18"/></svg>,
};

/* ─────────────────────────── DATA ─────────────────────────── */
const NAV = [
  { id:"dashboard",   label:"Dashboard",     icon:"home"  },
  { id:"post",        label:"Post Challenge",icon:"plus",  badge:"NEW" },
  { id:"challenges",  label:"My Challenges", icon:"flag",  count:5 },
  { id:"submissions", label:"Submissions",   icon:"inbox", count:47, dot:true },
];

const SUBMISSIONS = [
  {
    id:"SUB-1042",
    student:{ name:"Maya Rodriguez", initials:"MR", color:"#0F4C5C", role:"Yr 2 · Product Design" },
    challenge:"Reduce checkout friction",
    challengeShort:"Checkout friction",
    github:"github.com/mayar/eduwork-checkout",
    submitted:"2h ago",
    submittedAbs:"May 16, 10:42 AM",
    status:"new",
  },
  {
    id:"SUB-1041",
    student:{ name:"Daniel Okafor", initials:"DO", color:"#2C9D6E", role:"Yr 1 · Full-Stack" },
    challenge:"Personalized merchant insights",
    challengeShort:"Merchant insights",
    github:"github.com/danoka/merchant-insights",
    submitted:"4h ago",
    submittedAbs:"May 16, 8:01 AM",
    status:"new",
  },
  {
    id:"SUB-1039",
    student:{ name:"Priya Iyer", initials:"PI", color:"#C97A2D", role:"Yr 2 · Data Analytics" },
    challenge:"Fraud signal exploration",
    challengeShort:"Fraud signals",
    github:"github.com/priyaiyer/fraud-eda",
    submitted:"Yesterday",
    submittedAbs:"May 15, 5:22 PM",
    status:"reviewing",
  },
  {
    id:"SUB-1037",
    student:{ name:"Liam Bergström", initials:"LB", color:"#B8456A", role:"Yr 1 · Product Design" },
    challenge:"Reduce checkout friction",
    challengeShort:"Checkout friction",
    github:"github.com/liambee/checkout-rev",
    submitted:"Yesterday",
    submittedAbs:"May 15, 11:48 AM",
    status:"shortlisted",
  },
  {
    id:"SUB-1034",
    student:{ name:"Sana Khalil", initials:"SK", color:"#3B6AC9", role:"Yr 2 · Product Design" },
    challenge:"Onboarding for new sellers",
    challengeShort:"Seller onboarding",
    github:"github.com/sanak/seller-onboard",
    submitted:"2 days ago",
    submittedAbs:"May 14, 2:14 PM",
    status:"viewed",
  },
  {
    id:"SUB-1031",
    student:{ name:"Aiko Tanaka", initials:"AT", color:"#7E4FB4", role:"Yr 2 · Data Analytics" },
    challenge:"Fraud signal exploration",
    challengeShort:"Fraud signals",
    github:"github.com/aiko-t/fraud-pipeline",
    submitted:"3 days ago",
    submittedAbs:"May 13, 10:09 AM",
    status:"viewed",
  },
];

const CHALLENGES = [
  {
    title:"Reduce checkout friction",
    track:"Product Design",
    desc:"Audit a real merchant checkout, prototype one targeted intervention, and ship a research-backed writeup.",
    difficulty:"Intermediate",
    diffLevel:2,
    submissions:18,
    target:25,
    status:"active",
    daysLeft:6,
    payout:"$2,500",
    students:14,
    color:"var(--primary)",
  },
  {
    title:"Personalized merchant insights",
    track:"Full-Stack Web",
    desc:"Build a dashboard that surfaces three actionable insights from anonymized merchant transaction data.",
    difficulty:"Advanced",
    diffLevel:3,
    submissions:21,
    target:30,
    status:"active",
    daysLeft:11,
    payout:"$3,200",
    students:16,
    color:"var(--accent)",
  },
  {
    title:"Fraud signal exploration",
    track:"Data Analytics",
    desc:"Identify five candidate fraud signals from a sample ledger and propose a labeling protocol.",
    difficulty:"Advanced",
    diffLevel:3,
    submissions:8,
    target:20,
    status:"active",
    daysLeft:14,
    payout:"$2,800",
    students:7,
    color:"var(--warn)",
  },
  {
    title:"Onboarding for new sellers",
    track:"Product Design",
    desc:"Redesign the first-three-days experience for new merchants joining the platform.",
    difficulty:"Intermediate",
    diffLevel:2,
    submissions:0,
    target:25,
    status:"pending",
    daysLeft:null,
    payout:"$2,500",
    students:0,
    color:"var(--primary)",
  },
  {
    title:"Sustainability report card",
    track:"Data Analytics",
    desc:"Score and visualize the environmental footprint of a sample merchant cohort across 3 dimensions.",
    difficulty:"Intermediate",
    diffLevel:2,
    submissions:0,
    target:20,
    status:"pending",
    daysLeft:null,
    payout:"$2,200",
    students:0,
    color:"var(--accent)",
  },
];

/* ─────────────────────────── SMALL PIECES ─────────────────────────── */
function Tag({ kind="primary", children }) {
  const map = {
    primary: { bg:"var(--primary-soft)", c:"var(--primary)" },
    accent:  { bg:"var(--accent-soft)",  c:"var(--accent)"  },
    warn:    { bg:"var(--warn-soft)",    c:"var(--warn)"    },
    rose:    { bg:"var(--rose-soft)",    c:"var(--rose)"    },
    cta:     { bg:"rgba(30,91,255,0.10)", c:"var(--cta)" },
    ghost:   { bg:"#fff", c:"var(--ink-2)" },
  };
  const s = map[kind] || map.primary;
  return <span className="tag" style={{background:s.bg, color:s.c, border: kind==="ghost"?"1px solid var(--hair)":"none"}}>{children}</span>;
}

function Avatar({ name="MR", color="#0F4C5C", size=32 }) {
  return (
    <div className="grid place-items-center font-mono font-semibold text-white shrink-0"
         style={{ width:size, height:size, borderRadius: size*0.32, background: color, fontSize: size*0.36 }}>
      {name}
    </div>
  );
}

function Sparkline({ data, color="var(--primary)", width=140, height=40, fill=true }) {
  const max = Math.max(...data), min = Math.min(...data);
  const pad = 2;
  const stepX = (width - pad*2) / (data.length - 1);
  const pts = data.map((v,i)=> {
    const x = pad + i*stepX;
    const y = height - pad - ((v - min) / Math.max(1, (max - min))) * (height - pad*2);
    return [x, y];
  });
  const d = pts.map(([x,y],i)=> (i===0 ? `M${x.toFixed(1)},${y.toFixed(1)}` : `L${x.toFixed(1)},${y.toFixed(1)}`)).join(" ");
  const area = d + ` L${width-pad},${height-pad} L${pad},${height-pad} Z`;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {fill && <path d={area} fill={color} opacity="0.12"/>}
      <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx={pts[pts.length-1][0]} cy={pts[pts.length-1][1]} r="3" fill={color}/>
    </svg>
  );
}

function StatusBadge({ status }) {
  const map = {
    new:         { c:"var(--cta)",     bg:"rgba(30,91,255,0.10)",   label:"New" },
    viewed:      { c:"var(--muted)",   bg:"#fff",                   label:"Viewed", border:"1px solid var(--hair)" },
    reviewing:   { c:"var(--warn)",    bg:"var(--warn-soft)",       label:"In review" },
    shortlisted:{ c:"var(--accent)",  bg:"var(--accent-soft)",     label:"Shortlisted" },
    rejected:    { c:"var(--rose)",    bg:"var(--rose-soft)",       label:"Declined" },
  };
  const s = map[status] || map.new;
  return (
    <span className="tag" style={{background:s.bg, color:s.c, border:s.border || "none"}}>
      <span className="w-1.5 h-1.5 rounded-full" style={{background:s.c}}/>{s.label}
    </span>
  );
}

function Difficulty({ level=2, label }) {
  const colors = ["var(--accent)", "var(--warn)", "var(--rose)"];
  const c = colors[level-1] || colors[1];
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-[11px]" style={{color:c}}>
      <span className="flex items-center gap-0.5">
        {[1,2,3].map(i => (
          <span key={i} className="diff-dot" style={{ background: i <= level ? c : "var(--hair)" }}/>
        ))}
      </span>
      {label}
    </span>
  );
}

/* ─────────────────────────── TOP BAR ─────────────────────────── */
function TopBar({ company, openBell, openMenu, onBell, onProfile, onPost }) {
  return (
    <header className="hairline-b bg-surface" style={{height: 72}}>
      <div className="h-full flex items-center px-8 gap-6">
        <a className="flex items-center gap-2.5 select-none" style={{color:"var(--primary)"}}>
          <I.logo width="28" height="28" />
          <span className="font-display text-[22px] font-semibold tracking-tight" style={{color:"var(--ink)"}}>Eduwork</span>
          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded ml-1" style={{background:"rgba(30,91,255,0.10)", color:"var(--cta)"}}>COMPANY</span>
        </a>

        <div className="flex-1 max-w-[520px]">
          <label className="flex items-center gap-3 hairline rounded-xl px-3.5 h-11 bg-[#FAF9F4] focus-within:ring-2 focus-within:ring-[var(--primary-soft)] focus-within:border-[var(--primary)]">
            <I.search width="18" height="18" className="text-[color:var(--muted)]" />
            <input className="bg-transparent outline-none flex-1 text-sm placeholder:text-[color:var(--muted)]"
                   placeholder="Search submissions, students, challenges…" />
            <span className="kbd">⌘K</span>
          </label>
        </div>

        <nav className="hidden xl:flex items-center gap-6 text-sm" style={{color:"var(--ink-2)"}}>
          <a className="hover:text-[color:var(--ink)] cursor-pointer">Talent</a>
          <a className="hover:text-[color:var(--ink)] cursor-pointer">Analytics</a>
          <a className="hover:text-[color:var(--ink)] cursor-pointer">Billing</a>
        </nav>

        {/* Prominent CTA */}
        <button onClick={onPost}
                className="cta-pulse shadow-cta text-white font-semibold text-[13.5px] px-4 py-2.5 rounded-xl flex items-center gap-2"
                style={{background:"var(--cta)"}}>
          <I.plus width="16" height="16"/>Post new challenge
        </button>

        <div className="relative" data-pop>
          <button onClick={onBell} className="relative w-10 h-10 grid place-items-center rounded-xl hover:bg-[var(--hair-2)] ring-focus">
            <I.bell width="20" height="20" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full" style={{background:"var(--rose)", boxShadow:"0 0 0 2px #fff"}} />
          </button>
          {openBell && <BellPanel />}
        </div>

        <div className="relative" data-pop>
          <button onClick={onProfile} className="flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-xl hover:bg-[var(--hair-2)] ring-focus">
            <CompanyMark company={company}/>
            <div className="text-left leading-tight pr-1">
              <div className="text-[13px] font-semibold">{company.name}</div>
              <div className="text-[11px] muted font-mono">{company.plan}</div>
            </div>
            <I.chev width="16" height="16" className="text-[color:var(--muted)]" />
          </button>
          {openMenu && <ProfileMenu company={company} />}
        </div>
      </div>
    </header>
  );
}

function CompanyMark({ company, size=32 }) {
  return (
    <div className="grid place-items-center font-display font-semibold text-white shrink-0"
         style={{ width:size, height:size, borderRadius: 8, background: company.color, fontSize: size*0.5 }}>
      {company.mark}
    </div>
  );
}

function BellPanel() {
  const items = [
    { dot:"var(--cta)",     title:"3 new submissions on Checkout Friction", sub:"Latest: Maya Rodriguez · 2h ago", fresh:true },
    { dot:"var(--accent)",  title:"Sustainability report card approved",     sub:"Curriculum team unlocked it for cohort 25", fresh:true },
    { dot:"var(--warn)",    title:"Onboarding challenge needs revision",    sub:"Curriculum team left 2 comments", fresh:true },
    { dot:"var(--muted)",   title:"Weekly talent digest is ready",           sub:"4 students worth shortlisting this week", fresh:false },
    { dot:"var(--muted)",   title:"Stripe seat usage at 84%",                sub:"Add seats to keep posting after Jun 1",  fresh:false },
  ];
  return (
    <div className="pop-in absolute right-0 top-12 w-[380px] bg-surface hairline rounded-2xl shadow-pop overflow-hidden z-50">
      <div className="px-4 py-3 flex items-center justify-between hairline-b">
        <div className="font-semibold text-[15px]">Notifications</div>
        <button className="text-[12px] text-[color:var(--primary)] hover:underline">Mark all read</button>
      </div>
      <div className="max-h-[420px] overflow-auto scroll-thin">
        {items.map((n,i)=>(
          <a key={i} className="flex gap-3 px-4 py-3 hover:bg-[var(--hair-2)] cursor-pointer">
            <div className="mt-1.5 w-2 h-2 rounded-full shrink-0" style={{background:n.dot}} />
            <div className="flex-1 min-w-0">
              <div className={"text-[13px] " + (n.fresh ? "font-semibold ink" : "ink-2")}>{n.title}</div>
              <div className="text-[12px] muted truncate">{n.sub}</div>
            </div>
            {n.fresh && <span className="mt-1 w-1.5 h-1.5 rounded-full bg-[color:var(--primary)]" />}
          </a>
        ))}
      </div>
      <div className="px-4 py-2.5 hairline-t">
        <button className="w-full text-center text-[12px] font-medium text-[color:var(--primary)] py-1.5 rounded-lg hover:bg-[var(--primary-soft)]">View all notifications</button>
      </div>
    </div>
  );
}

function ProfileMenu({ company }) {
  const links = [
    { label:"Company profile", icon:"link" },
    { label:"Manage seats & billing", icon:"cal" },
    { label:"Hiring funnel settings", icon:"users" },
    { label:"Switch workspace", icon:"ext" },
  ];
  return (
    <div className="pop-in absolute right-0 top-12 w-[280px] bg-surface hairline rounded-2xl shadow-pop overflow-hidden z-50">
      <div className="px-4 py-3.5 flex items-center gap-3 hairline-b" style={{background:"linear-gradient(180deg, var(--primary-soft), #fff)"}}>
        <CompanyMark company={company} size={40}/>
        <div className="min-w-0">
          <div className="text-[14px] font-semibold truncate">{company.name}</div>
          <div className="text-[12px] muted truncate font-mono">{company.plan} · {company.seats} seats</div>
        </div>
      </div>
      <div className="py-1.5">
        {links.map((l,i)=>(
          <a key={i} className="flex items-center gap-3 px-4 py-2 text-[13px] hover:bg-[var(--hair-2)] cursor-pointer">
            {React.createElement(I[l.icon], {width:16, height:16, className:"text-[color:var(--muted)]"})}
            <span className="ink-2">{l.label}</span>
          </a>
        ))}
      </div>
      <div className="hairline-b" />
      <div className="py-1.5">
        <a className="flex items-center gap-3 px-4 py-2 text-[13px] hover:bg-[var(--hair-2)] cursor-pointer text-[color:var(--rose)]">
          <I.ext width="16" height="16"/>
          Sign out
        </a>
      </div>
    </div>
  );
}

/* ─────────────────────────── SIDEBAR ─────────────────────────── */
function Sidebar({ active, setActive, company, onPost }) {
  return (
    <aside className="hairline-r bg-surface flex flex-col" style={{width:264}}>
      <div className="px-3 pt-5">
        <button onClick={onPost}
                className="w-full cta-pulse shadow-cta text-white font-semibold text-[13.5px] px-3.5 py-3 rounded-xl flex items-center justify-center gap-2"
                style={{background:"var(--cta)"}}>
          <I.plus width="16" height="16"/>Post new challenge
        </button>
      </div>
      <div className="px-5 pt-7 pb-3">
        <div className="font-mono text-[10px] tracking-[0.14em] muted">WORKSPACE</div>
      </div>
      <nav className="px-3 flex flex-col gap-0.5">
        {NAV.map(n => {
          const Ico = I[n.icon];
          const isActive = active === n.id;
          return (
            <button key={n.id} onClick={()=> n.id === "post" ? onPost() : setActive(n.id)}
              className={`nav-item ${isActive?"active":""} group flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-medium text-left`}
              style={{color: isActive?"#fff":"var(--ink-2)"}}>
              <Ico width="18" height="18" className="ico shrink-0" />
              <span className="flex-1">{n.label}</span>
              {n.badge && !isActive && (
                <span className="font-mono text-[9.5px] px-1.5 py-0.5 rounded"
                      style={{background:"rgba(30,91,255,0.10)", color:"var(--cta)"}}>{n.badge}</span>
              )}
              {n.dot && !isActive && <span className="w-1.5 h-1.5 rounded-full" style={{background:"var(--rose)"}} />}
              {n.count != null && (
                <span className="font-mono text-[10.5px]"
                      style={{color: isActive ? "rgba(255,255,255,0.85)" : "var(--muted)"}}>
                  {n.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="px-5 pt-8 pb-2">
        <div className="font-mono text-[10px] tracking-[0.14em] muted">PARTNERSHIP</div>
      </div>
      <div className="px-3 pb-4">
        <div className="hairline rounded-xl p-4 relative overflow-hidden" style={{background:"#FBFAF5"}}>
          <div className="absolute inset-0 stripe-soft opacity-60 pointer-events-none" />
          <div className="relative">
            <div className="flex items-center justify-between">
              <div className="text-[11px] font-mono muted">PARTNER · {company.tier}</div>
              <I.sparkle width="13" height="13" className="text-[color:var(--accent)]"/>
            </div>
            <div className="text-[15px] font-semibold mt-0.5">{company.name}</div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <div className="text-[10px] font-mono muted tracking-wide">CHALLENGES</div>
                <div className="font-display text-[18px] font-semibold mt-0.5">5</div>
              </div>
              <div>
                <div className="text-[10px] font-mono muted tracking-wide">HIRES YTD</div>
                <div className="font-display text-[18px] font-semibold mt-0.5">7</div>
              </div>
            </div>
            <div className="mt-3">
              <div className="text-[10px] font-mono muted tracking-wide flex items-center justify-between">
                <span>SEAT USAGE</span><span className="ink-2">84%</span>
              </div>
              <div className="pbar teal mt-1.5"><span style={{width:"84%"}}/></div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto px-3 pb-5">
        <div className="hairline rounded-xl px-3 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg grid place-items-center" style={{background:"var(--accent-soft)", color:"var(--accent)"}}>
            <I.users width="18" height="18"/>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[12.5px] font-semibold leading-tight">Need to hire faster?</div>
            <div className="text-[11px] muted">Try Talent Search</div>
          </div>
          <I.arrow width="14" height="14" className="text-[color:var(--muted)]"/>
        </div>
      </div>
    </aside>
  );
}

/* ─────────────────────────── KPI ─────────────────────────── */
function KPI({ label, big, sub, accent="primary", trend, footer, children, sparkData }) {
  const map = {
    primary: "var(--primary)",
    accent:  "var(--accent)",
    warn:    "var(--warn)",
    rose:    "var(--rose)",
    cta:     "var(--cta)",
  };
  const c = map[accent];
  return (
    <div className="bg-surface hairline rounded-2xl shadow-card p-6 flex flex-col gap-3.5 relative overflow-hidden">
      <div className="absolute top-0 left-0 h-1 w-12 rounded-br-lg" style={{background:c}} />
      <div className="flex items-center justify-between">
        <div className="text-[12px] font-mono tracking-wide muted uppercase">{label}</div>
        {trend && (
          <div className="flex items-center gap-1 text-[11px] font-mono" style={{color: trend.startsWith("-")?"var(--rose)":"var(--accent)"}}>
            <I.trend width="13" height="13"/>{trend}
          </div>
        )}
      </div>
      <div className="flex items-end justify-between gap-3">
        <div className="flex items-end gap-2">
          <div className="font-display text-[48px] leading-none font-semibold tracking-tight">{big}</div>
          {sub && <div className="text-[14px] font-medium muted pb-1.5">{sub}</div>}
        </div>
        {sparkData && <Sparkline data={sparkData} color={c} />}
      </div>
      {children}
      {footer && <div className="text-[12px] muted pt-1" style={{borderTop:"1px dashed var(--hair)", paddingTop:10}}>{footer}</div>}
    </div>
  );
}

function KpiRow() {
  return (
    <div className="grid grid-cols-4 gap-5">
      <KPI label="Challenges posted" big="5" accent="primary" trend="+1 this month"
           footer="Avg time to first submission: 14h">
        <div className="flex items-center gap-2 flex-wrap">
          <Tag kind="accent"><span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]"/>3 active</Tag>
          <Tag kind="warn">2 pending approval</Tag>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 pbar teal"><span style={{width:"60%"}}/></div>
          <span className="font-mono text-[11px] muted">3/5 live</span>
        </div>
      </KPI>

      <KPI label="Submissions received" big="47" accent="cta" trend="+12 this week"
           sparkData={[2,5,7,8,12,14,18,24,29,35,41,47]}
           footer="Across all challenges since launch · target 100 by Q3">
        <div className="flex items-center gap-2 text-[12px] ink-2">
          <span className="font-mono">7 new</span>
          <span className="muted">since you last logged in</span>
        </div>
      </KPI>

      <KPI label="Pending reviews" big="12" sub="submissions" accent="warn" trend="-3 today"
           footer="2 are waiting more than 5 days — students get notified at day 7">
        <div className="flex items-center gap-2 flex-wrap">
          <Tag kind="warn">5 priority</Tag>
          <Tag kind="ghost">7 routine</Tag>
        </div>
        <div className="flex items-center gap-2 text-[12px] ink-2">
          <I.clock width="13" height="13" className="text-[color:var(--warn)]"/>
          <span><b className="font-mono">3.4 days</b> avg time to review</span>
        </div>
      </KPI>

      <KPI label="Students engaged" big="35" sub="this cohort" accent="accent" trend="+9 wk/wk"
           footer="7 shortlisted as potential hires · 2 interviewing">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {SUBMISSIONS.slice(0,5).map((s,i)=>(
              <div key={i} className="w-7 h-7 rounded-md border-2 border-white grid place-items-center font-mono text-[9px] font-semibold text-white"
                   style={{background:s.student.color}}>{s.student.initials}</div>
            ))}
            <div className="w-7 h-7 rounded-md border-2 border-white grid place-items-center font-mono text-[9.5px] font-semibold hairline"
                 style={{background:"#fff", color:"var(--ink-2)"}}>+30</div>
          </div>
          <div className="text-[12px] muted">from <span className="ink-2 font-medium">3 tracks</span></div>
        </div>
      </KPI>
    </div>
  );
}

/* ─────────────────────────── SUBMISSIONS TABLE ─────────────────────────── */
function SubmissionsTable({ rows, onView }) {
  const [filter, setFilter] = useState("all");
  const tabs = [
    { id:"all",         label:"All",         n:rows.length },
    { id:"new",         label:"New",         n:rows.filter(r=>r.status==="new").length },
    { id:"reviewing",   label:"In review",   n:rows.filter(r=>r.status==="reviewing").length },
    { id:"shortlisted",label:"Shortlisted", n:rows.filter(r=>r.status==="shortlisted").length },
  ];
  const filtered = filter==="all" ? rows : rows.filter(r => r.status === filter);

  return (
    <section className="bg-surface hairline rounded-2xl shadow-card overflow-hidden">
      <header className="px-6 py-5 flex items-center justify-between hairline-b">
        <div className="flex items-baseline gap-3">
          <h3 className="font-display text-[22px] font-semibold tracking-tight">Recent submissions</h3>
          <span className="font-mono text-[11px] muted">{rows.length} across your challenges</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 hairline rounded-xl p-1 bg-[#FBFAF5]">
            {tabs.map(t=>(
              <button key={t.id} onClick={()=>setFilter(t.id)}
                      className={"px-3 py-1.5 rounded-lg text-[12.5px] font-medium transition flex items-center gap-1.5 " +
                        (filter===t.id ? "bg-white shadow-card ink" : "muted hover:text-[color:var(--ink)]")}>
                {t.label}
                <span className="font-mono text-[10px]">{t.n}</span>
              </button>
            ))}
          </div>
          <button className="hairline rounded-xl px-3 py-2 text-[12.5px] font-medium flex items-center gap-1.5 bg-surface hover:bg-[var(--hair-2)]">
            <I.download width="13" height="13"/>Export CSV
          </button>
        </div>
      </header>

      <div className="grid grid-cols-[1.6fr_2fr_1fr_140px_180px] px-6 py-3 text-[11px] font-mono tracking-wide uppercase muted hairline-b">
        <div>Student</div>
        <div>Challenge</div>
        <div>Status</div>
        <div>Submitted</div>
        <div className="text-right">Action</div>
      </div>

      <ul>
        {filtered.map((r,i) => (
          <li key={r.id}
              className={"grid grid-cols-[1.6fr_2fr_1fr_140px_180px] gap-2 px-6 py-4 items-center row-hover " + (i < filtered.length-1 ? "hairline-b":"")}>
            {/* Student */}
            <div className="flex items-center gap-3 min-w-0">
              <Avatar name={r.student.initials} color={r.student.color} size={38}/>
              <div className="min-w-0">
                <div className="text-[14px] font-semibold leading-tight truncate">{r.student.name}</div>
                <div className="text-[11.5px] muted font-mono truncate">{r.student.role}</div>
              </div>
            </div>
            {/* Challenge + GitHub */}
            <div className="min-w-0">
              <div className="text-[14px] font-semibold leading-tight truncate">{r.challenge}</div>
              <a className="mt-1 inline-flex items-center gap-1.5 text-[11.5px] font-mono group/gh hover:text-[color:var(--ink)] muted">
                <I.github width="13" height="13"/>
                <span className="truncate max-w-[260px] group-hover/gh:underline">{r.github}</span>
                <I.ext width="11" height="11" className="opacity-60"/>
              </a>
            </div>
            {/* Status */}
            <div><StatusBadge status={r.status}/></div>
            {/* Submitted */}
            <div>
              <div className="text-[13px] font-medium leading-tight">{r.submitted}</div>
              <div className="text-[11px] muted font-mono">{r.submittedAbs}</div>
            </div>
            {/* Action */}
            <div className="flex items-center justify-end gap-2 row-action">
              <button className="w-8 h-8 grid place-items-center rounded-lg hairline hover:bg-[var(--hair-2)]" title="Open GitHub">
                <I.github width="14" height="14" className="text-[color:var(--muted)]"/>
              </button>
              <button onClick={()=>onView(r)}
                      className="text-white text-[12.5px] font-semibold px-3.5 py-2 rounded-lg flex items-center gap-1.5"
                      style={{background:"var(--primary)"}}>
                <I.eye width="13" height="13"/>View
              </button>
              <button className="w-8 h-8 grid place-items-center rounded-lg hover:bg-[var(--hair-2)]" title="More">
                <I.more width="16" height="16" className="text-[color:var(--muted)]"/>
              </button>
            </div>
          </li>
        ))}
        {filtered.length === 0 && (
          <li className="py-12 text-center muted text-sm">No submissions match this filter.</li>
        )}
      </ul>

      <footer className="px-6 py-3 hairline-t flex items-center justify-between">
        <div className="text-[12px] muted">Showing {filtered.length} of {rows.length} submissions</div>
        <button className="text-[12.5px] font-medium text-[color:var(--primary)] flex items-center gap-1 hover:underline">
          See all submissions <I.arrow width="14" height="14"/>
        </button>
      </footer>
    </section>
  );
}

/* ─────────────────────────── CHALLENGE CARDS ─────────────────────────── */
function ChallengeCard({ c, onPost }) {
  const pct = c.target ? Math.min(100, Math.round((c.submissions / c.target) * 100)) : 0;
  const isPending = c.status === "pending";

  return (
    <div className="bg-surface hairline rounded-2xl shadow-card overflow-hidden flex flex-col">
      {/* Cover */}
      <div className="h-[100px] relative" style={{background: c.color}}>
        <div className="absolute inset-0" style={{
          backgroundImage: c.diffLevel === 3
            ? "repeating-linear-gradient(45deg, rgba(255,255,255,0.18) 0 12px, transparent 12px 24px)"
            : c.diffLevel === 2
              ? "radial-gradient(rgba(255,255,255,0.22) 1.5px, transparent 1.6px) 0 0/14px 14px"
              : "linear-gradient(rgba(255,255,255,0.18) 1px, transparent 1px) 0 0/22px 22px, linear-gradient(90deg, rgba(255,255,255,0.18) 1px, transparent 1px) 0 0/22px 22px"
        }}/>
        <div className="absolute inset-0 p-4 flex items-start justify-between text-white">
          <span className="font-mono text-[10px] tracking-widest uppercase opacity-90 bg-white/15 backdrop-blur px-2 py-1 rounded">{c.track}</span>
          {isPending
            ? <span className="font-mono text-[10px] tracking-widest uppercase bg-white text-[color:var(--warn)] px-2 py-1 rounded font-semibold">Pending</span>
            : <span className="font-mono text-[10px] tracking-widest uppercase bg-white px-2 py-1 rounded font-semibold flex items-center gap-1" style={{color:c.color}}>
                <span className="w-1.5 h-1.5 rounded-full" style={{background:"var(--accent)"}}/>Active
              </span>
          }
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col gap-3.5">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <Difficulty level={c.diffLevel} label={c.difficulty}/>
            <span className="font-mono text-[11px] muted">·</span>
            <span className="font-mono text-[11px] muted">{c.payout}</span>
          </div>
          <div className="text-[16px] font-semibold leading-snug">{c.title}</div>
          <p className="text-[12.5px] muted leading-relaxed mt-1.5 line-clamp-2">{c.desc}</p>
        </div>

        {/* Submissions stat */}
        {!isPending ? (
          <div className="hairline rounded-xl p-3" style={{background:"#FBFAF5"}}>
            <div className="flex items-baseline justify-between mb-2">
              <div className="flex items-baseline gap-1.5">
                <span className="font-display text-[26px] font-semibold leading-none">{c.submissions}</span>
                <span className="text-[11.5px] muted">/ {c.target} target</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] muted">
                <I.users width="12" height="12"/>
                <span className="font-mono">{c.students} students</span>
              </div>
            </div>
            <div className="pbar"><span style={{width:pct+"%"}}/></div>
            <div className="flex items-center justify-between mt-2 text-[11px] muted font-mono">
              <span>{pct}% to target</span>
              <span className="flex items-center gap-1"><I.clock width="11" height="11"/>{c.daysLeft}d left</span>
            </div>
          </div>
        ) : (
          <div className="hairline rounded-xl p-3 flex items-start gap-3" style={{background:"var(--warn-soft)"}}>
            <I.clock width="16" height="16" className="text-[color:var(--warn)] mt-0.5 shrink-0"/>
            <div className="min-w-0">
              <div className="text-[12.5px] font-semibold" style={{color:"var(--warn)"}}>Awaiting curriculum approval</div>
              <div className="text-[11.5px] ink-2 mt-0.5">Typically 2–3 business days · submitted 1 day ago</div>
            </div>
          </div>
        )}

        <div className="mt-auto pt-3 flex items-center gap-2" style={{borderTop:"1px dashed var(--hair)"}}>
          {!isPending ? (
            <>
              <button className="flex-1 text-[12.5px] font-semibold py-2 rounded-lg text-white flex items-center justify-center gap-1.5"
                      style={{background:"var(--primary)"}}>
                <I.eye width="13" height="13"/>View submissions
              </button>
              <button className="w-9 h-9 grid place-items-center rounded-lg hairline hover:bg-[var(--hair-2)]" title="Edit">
                <I.more width="14" height="14" className="text-[color:var(--muted)]"/>
              </button>
            </>
          ) : (
            <>
              <button className="flex-1 text-[12.5px] font-semibold py-2 rounded-lg hairline flex items-center justify-center gap-1.5 hover:bg-[var(--hair-2)]">
                Edit draft
              </button>
              <button className="flex-1 text-[12.5px] font-semibold py-2 rounded-lg flex items-center justify-center gap-1.5"
                      style={{background:"var(--warn-soft)", color:"var(--warn)"}}>
                Ping reviewer
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ChallengesSection({ challenges, onPost }) {
  const [view, setView] = useState("all");
  const filtered = view==="all" ? challenges
                  : view==="active" ? challenges.filter(c=>c.status==="active")
                  : challenges.filter(c=>c.status==="pending");
  return (
    <section>
      <header className="flex items-end justify-between mb-4">
        <div>
          <div className="font-mono text-[11px] tracking-[0.18em] muted uppercase mb-1">Your portfolio of briefs</div>
          <h2 className="font-display text-[26px] font-semibold tracking-tight">Your challenges</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 hairline rounded-xl p-1 bg-[#FBFAF5]">
            {[["all","All",5],["active","Active",3],["pending","Pending",2]].map(([id,l,n])=>(
              <button key={id} onClick={()=>setView(id)}
                      className={"px-3 py-1.5 rounded-lg text-[12.5px] font-medium transition flex items-center gap-1.5 " +
                        (view===id ? "bg-white shadow-card ink" : "muted hover:text-[color:var(--ink)]")}>
                {l}<span className="font-mono text-[10px]">{n}</span>
              </button>
            ))}
          </div>
          <button onClick={onPost}
                  className="cta-pulse shadow-cta text-white font-semibold text-[13px] px-3.5 py-2 rounded-xl flex items-center gap-2"
                  style={{background:"var(--cta)"}}>
            <I.plus width="14" height="14"/>New challenge
          </button>
        </div>
      </header>
      <div className="grid grid-cols-3 gap-5">
        {filtered.map((c,i)=> <ChallengeCard key={i} c={c} onPost={onPost}/>)}
      </div>
    </section>
  );
}

/* ─────────────────────────── RIGHT RAIL ─────────────────────────── */
function FunnelCard() {
  const stages = [
    ["Submissions",   47, "var(--cta)"],
    ["Shortlisted",   12, "var(--primary)"],
    ["Interviewing",   2, "var(--warn)"],
    ["Hired",          0, "var(--accent)"],
  ];
  const max = Math.max(...stages.map(s=>s[1]));
  return (
    <div className="bg-surface hairline rounded-2xl shadow-card overflow-hidden">
      <header className="px-5 py-4 flex items-center justify-between hairline-b">
        <div className="flex items-center gap-2">
          <I.users width="15" height="15" className="text-[color:var(--primary)]"/>
          <h4 className="text-[14px] font-semibold">Hiring funnel</h4>
        </div>
        <span className="text-[11px] font-mono muted">cohort 25</span>
      </header>
      <div className="p-5 space-y-3">
        {stages.map(([t,n,c],i)=>(
          <div key={i}>
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-[12.5px] ink-2 font-medium">{t}</span>
              <span className="font-mono text-[12px] font-semibold">{n}</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{background:"var(--hair-2)"}}>
              <div style={{width:(n/max)*100+"%", height:"100%", background:c, transition:"width .3s"}}/>
            </div>
          </div>
        ))}
        <div className="pt-2 mt-3 hairline-t flex items-center justify-between text-[11.5px]">
          <span className="muted">Conversion s→i</span>
          <span className="font-mono font-semibold" style={{color:"var(--accent)"}}>4.3%</span>
        </div>
      </div>
    </div>
  );
}

function TopTalentCard() {
  const top = [
    { name:"Maya Rodriguez", initials:"MR", color:"#0F4C5C", role:"Product Design", score:94 },
    { name:"Priya Iyer",     initials:"PI", color:"#C97A2D", role:"Data Analytics",  score:91 },
    { name:"Daniel Okafor",  initials:"DO", color:"#2C9D6E", role:"Full-Stack",     score:88 },
  ];
  return (
    <div className="bg-surface hairline rounded-2xl shadow-card overflow-hidden">
      <header className="px-5 py-4 flex items-center justify-between hairline-b">
        <div className="flex items-center gap-2">
          <I.sparkle width="15" height="15" className="text-[color:var(--accent)]"/>
          <h4 className="text-[14px] font-semibold">Top talent · this week</h4>
        </div>
        <button className="text-[11.5px] muted hover:text-[color:var(--ink)]">See all</button>
      </header>
      <ul className="px-2 py-2">
        {top.map((t,i)=>(
          <li key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[var(--hair-2)] cursor-pointer">
            <div className="relative">
              <Avatar name={t.initials} color={t.color} size={36}/>
              <span className="absolute -top-1 -right-1 font-mono text-[9px] font-semibold px-1 py-0.5 rounded text-white"
                    style={{background:"var(--accent)"}}>{t.score}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold truncate">{t.name}</div>
              <div className="text-[11px] muted truncate">{t.role}</div>
            </div>
            <button className="hairline px-2.5 py-1.5 rounded-lg text-[11.5px] font-medium hover:bg-[var(--hair-2)]">
              Shortlist
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PostCallout({ onPost }) {
  return (
    <div className="rounded-2xl hairline shadow-card p-5 relative overflow-hidden text-white" style={{background:"linear-gradient(135deg, var(--cta) 0%, #1138A8 100%)"}}>
      <div className="absolute inset-0 dot-grid opacity-30 pointer-events-none" />
      <div className="relative">
        <div className="flex items-center gap-2">
          <I.sparkle width="16" height="16" />
          <span className="font-mono text-[10px] tracking-widest uppercase opacity-80">Boost your pipeline</span>
        </div>
        <div className="font-display text-[22px] font-semibold leading-tight mt-2">
          Post a new challenge in&nbsp;under 5 minutes
        </div>
        <ul className="mt-3 space-y-1.5 text-[12.5px] opacity-95">
          <li className="flex items-center gap-2"><I.check width="14" height="14"/>AI-assisted brief writer</li>
          <li className="flex items-center gap-2"><I.check width="14" height="14"/>Matches to relevant cohorts</li>
          <li className="flex items-center gap-2"><I.check width="14" height="14"/>Live in 48h post-approval</li>
        </ul>
        <button onClick={onPost}
                className="mt-4 w-full bg-white text-[color:var(--cta)] text-[13px] font-semibold py-2.5 rounded-xl flex items-center justify-center gap-1.5 hover:bg-[var(--primary-soft)]">
          Start a new brief <I.arrow width="14" height="14"/>
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────── POST CHALLENGE SHEET ─────────────────────────── */
function PostSheet({ open, onClose }) {
  const [step, setStep] = useState(1);
  const [brief, setBrief] = useState("");
  useEffect(()=>{ if (open) { setStep(1); setBrief(""); } }, [open]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-[#0E1F2A]/30 backdrop-blur-sm" onClick={onClose}/>
      <aside className="absolute right-0 top-0 h-full w-[620px] bg-surface shadow-pop slide-in flex flex-col">
        <header className="px-6 py-5 hairline-b flex items-start justify-between">
          <div>
            <div className="text-[11px] font-mono tracking-widest uppercase muted">Create challenge · step {step} of 3</div>
            <h3 className="font-display text-[22px] font-semibold tracking-tight leading-tight mt-1">
              {step===1 && "What problem do you want students to solve?"}
              {step===2 && "Who should this challenge reach?"}
              {step===3 && "Review and submit for curriculum approval"}
            </h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 grid place-items-center rounded-lg hover:bg-[var(--hair-2)]">
            <I.x width="16" height="16"/>
          </button>
        </header>
        <div className="flex-1 overflow-auto scroll-thin px-6 py-5 space-y-5">
          {step===1 && (
            <>
              <div>
                <label className="text-[11px] font-mono tracking-widest uppercase muted">Challenge title</label>
                <input className="mt-2 w-full hairline rounded-xl px-4 py-3 text-[14px] bg-[#FBFAF5] focus:outline-none focus:ring-2 focus:ring-[var(--primary-soft)]"
                       placeholder="e.g. Reduce checkout friction by 15%"/>
              </div>
              <div>
                <label className="text-[11px] font-mono tracking-widest uppercase muted">Brief</label>
                <textarea value={brief} onChange={(e)=>setBrief(e.target.value)}
                          rows="7"
                          className="mt-2 w-full hairline rounded-xl px-4 py-3 text-[14px] bg-[#FBFAF5] focus:outline-none focus:ring-2 focus:ring-[var(--primary-soft)]"
                          placeholder="Describe the problem, what data is available, and how students will be evaluated…"/>
                <button className="mt-2 inline-flex items-center gap-1.5 text-[12px] font-medium" style={{color:"var(--cta)"}}>
                  <I.sparkle width="13" height="13"/>Draft with AI · we'll ask a few questions
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono tracking-widest uppercase muted">Difficulty</label>
                  <select className="mt-2 w-full hairline rounded-xl px-4 py-3 text-[14px] bg-[#FBFAF5]">
                    <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-mono tracking-widest uppercase muted">Payout</label>
                  <input className="mt-2 w-full hairline rounded-xl px-4 py-3 text-[14px] bg-[#FBFAF5]" placeholder="$2,500"/>
                </div>
              </div>
            </>
          )}
          {step===2 && (
            <>
              <div>
                <label className="text-[11px] font-mono tracking-widest uppercase muted">Tracks</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {["Product Design","Full-Stack Web","Data Analytics","AI / ML","Research"].map((t,i)=>(
                    <button key={i} className={"px-3 py-2 rounded-xl text-[12.5px] font-medium hairline " + (i<2?"text-white":"bg-surface ink-2")}
                            style={i<2?{background:"var(--primary)"}:{}}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono tracking-widest uppercase muted">Submission target</label>
                  <input className="mt-2 w-full hairline rounded-xl px-4 py-3 text-[14px] bg-[#FBFAF5]" placeholder="25"/>
                </div>
                <div>
                  <label className="text-[11px] font-mono tracking-widest uppercase muted">Sprint length</label>
                  <select className="mt-2 w-full hairline rounded-xl px-4 py-3 text-[14px] bg-[#FBFAF5]">
                    <option>2 weeks</option><option>3 weeks</option><option>4 weeks</option>
                  </select>
                </div>
              </div>
              <div className="hairline rounded-xl p-4" style={{background:"var(--primary-soft)"}}>
                <div className="text-[12px] font-semibold flex items-center gap-2" style={{color:"var(--primary)"}}>
                  <I.sparkle width="13" height="13"/>Match estimate
                </div>
                <p className="text-[12.5px] ink-2 mt-1">Based on your selection, ~84 students will see this challenge in their feed.</p>
              </div>
            </>
          )}
          {step===3 && (
            <>
              <div className="hairline rounded-xl p-5" style={{background:"#FBFAF5"}}>
                <div className="text-[11px] font-mono tracking-widest uppercase muted">Summary</div>
                <h4 className="font-display text-[20px] font-semibold mt-1">Reduce checkout friction by 15%</h4>
                <div className="grid grid-cols-3 gap-3 mt-4">
                  {[["Difficulty","Intermediate"],["Tracks","2"],["Payout","$2,500"]].map(([k,v],i)=>(
                    <div key={i}>
                      <div className="text-[10px] font-mono muted tracking-wide uppercase">{k}</div>
                      <div className="text-[14px] font-semibold mt-0.5">{v}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-[12.5px] ink-2 leading-relaxed">
                Once submitted, our curriculum team will review your brief within 2–3 business days. You'll get a notification once it's live and matched to students.
              </div>
            </>
          )}
        </div>
        <footer className="px-6 py-4 hairline-t flex items-center justify-between">
          <Tag kind="ghost">Draft auto-saved · 2s ago</Tag>
          <div className="flex items-center gap-2">
            {step>1 && <button onClick={()=>setStep(step-1)} className="hairline px-3.5 py-2 rounded-lg text-[13px] font-medium hover:bg-[var(--hair-2)]">Back</button>}
            {step<3
              ? <button onClick={()=>setStep(step+1)} className="text-white text-[13px] font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5"
                        style={{background:"var(--cta)"}}>Continue <I.arrow width="14" height="14"/></button>
              : <button onClick={onClose} className="text-white text-[13px] font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5"
                        style={{background:"var(--accent)"}}><I.check width="14" height="14"/>Submit for approval</button>}
          </div>
        </footer>
      </aside>
    </div>
  );
}

/* ─────────────────────────── PLACEHOLDER ─────────────────────────── */
function PlaceholderPage({ title, subtitle, icon:IconKey }) {
  const Ico = I[IconKey] || I.home;
  return (
    <div className="bg-surface hairline rounded-2xl shadow-card p-12 text-center">
      <div className="w-16 h-16 mx-auto rounded-2xl grid place-items-center" style={{background:"var(--primary-soft)", color:"var(--primary)"}}>
        <Ico width="28" height="28"/>
      </div>
      <h2 className="font-display text-[26px] font-semibold mt-4">{title}</h2>
      <p className="muted text-[14px] mt-2 max-w-md mx-auto">{subtitle}</p>
    </div>
  );
}

/* ─────────────────────────── PAGE ─────────────────────────── */
function CompanyDashboard({ tweaks }) {
  const [active, setActive] = useState("dashboard");
  const [openBell, setOpenBell] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);
  const [postOpen, setPostOpen] = useState(false);
  const [viewing, setViewing] = useState(null);

  const company = {
    name: tweaks.companyName,
    mark: tweaks.companyName[0],
    plan: tweaks.plan,
    seats: 12,
    tier: "Gold partner",
    color: tweaks.companyColor,
  };

  useEffect(() => {
    const onDoc = (e) => {
      if (!e.target.closest("[data-pop]")) { setOpenBell(false); setOpenMenu(false); }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <TopBar company={company}
              openBell={openBell} openMenu={openMenu}
              onBell={(e)=>{ e.stopPropagation(); setOpenBell(v=>!v); setOpenMenu(false); }}
              onProfile={(e)=>{ e.stopPropagation(); setOpenMenu(v=>!v); setOpenBell(false); }}
              onPost={()=>setPostOpen(true)}/>

      <div className="flex flex-1">
        <Sidebar active={active} setActive={setActive} company={company} onPost={()=>setPostOpen(true)}/>

        <main className="flex-1 min-w-0 p-8 max-w-[1640px]">
          {active === "dashboard" && (
            <>
              {/* Welcome */}
              <div className="flex items-end justify-between mb-7">
                <div>
                  <div className="flex items-center gap-2 muted text-[12px] font-mono mb-1">
                    <span>Today · {new Date(2026,4,16).toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}</span>
                    <span>·</span>
                    <span style={{color:"var(--cta)"}}>● 7 new submissions since yesterday</span>
                  </div>
                  <h1 className="font-display text-[40px] font-semibold tracking-tight leading-[1.05]">
                    Welcome back, <span style={{color:"var(--primary)"}}>{company.name}</span>.
                  </h1>
                  <p className="muted text-[15px] mt-2 max-w-[700px]">
                    Your three active challenges generated <b className="ink-2">+12 submissions</b> this week. Twelve are waiting on a review — clear them to keep your reputation score green.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="hairline rounded-xl px-3.5 py-2.5 text-[13px] font-medium flex items-center gap-2 bg-surface hover:bg-[var(--hair-2)]">
                    <I.download width="15" height="15"/>Export report
                  </button>
                  <button onClick={()=>setPostOpen(true)}
                          className="cta-pulse shadow-cta text-white text-[13.5px] font-semibold rounded-xl px-4 py-2.5 flex items-center gap-2"
                          style={{background:"var(--cta)"}}>
                    <I.plus width="15" height="15"/>Post new challenge
                  </button>
                </div>
              </div>

              <KpiRow/>

              <section className="mt-9 grid grid-cols-3 gap-5 items-start">
                <div className="col-span-2 flex flex-col gap-9">
                  <SubmissionsTable rows={SUBMISSIONS} onView={setViewing}/>
                  <ChallengesSection challenges={CHALLENGES} onPost={()=>setPostOpen(true)}/>
                </div>
                <div className="flex flex-col gap-5">
                  <FunnelCard/>
                  <TopTalentCard/>
                  <PostCallout onPost={()=>setPostOpen(true)}/>
                </div>
              </section>

              <footer className="mt-10 flex items-center justify-between text-[11.5px] muted font-mono">
                <span>EDUWORK · COMPANY WORKSPACE · v3.6</span>
                <span>cmd+/ for shortcuts · auto-saved 2 min ago</span>
              </footer>
            </>
          )}

          {active === "challenges" && (
            <>
              <h1 className="font-display text-[34px] font-semibold tracking-tight mb-1">My challenges</h1>
              <p className="muted text-[14px] mb-7">Every brief you've posted with Eduwork.</p>
              <ChallengesSection challenges={CHALLENGES} onPost={()=>setPostOpen(true)}/>
            </>
          )}

          {active === "submissions" && (
            <>
              <h1 className="font-display text-[34px] font-semibold tracking-tight mb-1">Submissions</h1>
              <p className="muted text-[14px] mb-7">All work submitted across your active challenges.</p>
              <SubmissionsTable rows={SUBMISSIONS} onView={setViewing}/>
            </>
          )}
        </main>
      </div>

      <PostSheet open={postOpen} onClose={()=>setPostOpen(false)}/>
    </div>
  );
}

/* ─────────────────────────── TWEAKS ─────────────────────────── */
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "companyName": "Lumina Pay",
  "plan": "Growth · Annual",
  "companyColor": "#1E5BFF",
  "palette": ["#0F4C5C", "#2C9D6E", "#F6F5F0"]
}/*EDITMODE-END*/;

function App() {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);

  useEffect(() => {
    const [primary, accent, bg] = Array.isArray(tweaks.palette) ? tweaks.palette : ["#0F4C5C","#2C9D6E","#F6F5F0"];
    const r = document.documentElement.style;
    r.setProperty("--primary", primary);
    r.setProperty("--primary-2", shade(primary, 0.15));
    r.setProperty("--accent", accent);
    r.setProperty("--bg", bg);
    r.setProperty("--primary-soft", mixSoft(primary, 0.90));
    r.setProperty("--accent-soft",  mixSoft(accent,  0.90));
  }, [tweaks.palette]);

  return (
    <>
      <CompanyDashboard tweaks={tweaks}/>
      <TweaksPanel title="Tweaks">
        <TweakSection label="Company">
          <TweakText label="Name" value={tweaks.companyName} onChange={(v)=>setTweak("companyName", v)}/>
          <TweakText label="Plan" value={tweaks.plan} onChange={(v)=>setTweak("plan", v)}/>
        </TweakSection>
        <TweakSection label="Theme">
          <TweakColor
            label="Palette"
            value={tweaks.palette}
            onChange={(v)=>setTweak("palette", v)}
            options={[
              ["#0F4C5C","#2C9D6E","#F6F5F0"],
              ["#0E2A47","#5BA300","#F4F5F0"],
              ["#22384E","#11A39A","#F4F6F4"],
              ["#3730A3","#16A34A","#F6F4F8"],
              ["#1F3A2E","#E8A33D","#F7F4EC"],
            ]}
          />
          <TweakColor
            label="Company mark"
            value={tweaks.companyColor}
            onChange={(v)=>setTweak("companyColor", v)}
            options={["#1E5BFF","#0F4C5C","#2C9D6E","#C97A2D","#B8456A","#7E4FB4"]}
          />
        </TweakSection>
      </TweaksPanel>
    </>
  );
}

function mixSoft(hex, t) {
  const c = hex.replace("#","");
  const n = parseInt(c, 16);
  const r = (n>>16)&255, g = (n>>8)&255, b = n&255;
  const mix = (a) => Math.round(a + (255 - a) * t);
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
}
function shade(hex, t) {
  const c = hex.replace("#","");
  const n = parseInt(c, 16);
  const r = (n>>16)&255, g = (n>>8)&255, b = n&255;
  const adj = (a) => Math.min(255, Math.round(a + (255 - a) * t));
  return `rgb(${adj(r)}, ${adj(g)}, ${adj(b)})`;
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
