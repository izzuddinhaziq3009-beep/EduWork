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
  users:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="9" cy="8" r="3.5"/><path d="M2 21c.7-3.6 3.6-5.5 7-5.5s6.3 1.9 7 5.5"/><circle cx="17" cy="6" r="2.5"/><path d="M15.5 14.5c2.8.3 5.1 1.9 6.5 4.5"/></svg>,
  book:   (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 5a2 2 0 0 1 2-2h13v18H6a2 2 0 0 0-2 2V5z"/><path d="M9 7h7M9 11h7"/></svg>,
  flag:   (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M5 21V4"/><path d="M5 5h12l-2 4 2 4H5"/></svg>,
  pulse:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 12h4l2-7 4 14 2-7h6"/></svg>,
  shield: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 3l9 3v6c0 5-4 9-9 9s-9-4-9-9V6l9-3z"/><path d="M9 12l2 2 4-4"/></svg>,
  brief:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/><path d="M3 13h18"/></svg>,
  arrow:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M5 12h14M13 6l6 6-6 6"/></svg>,
  check:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M5 12.5l4.5 4.5L19 7"/></svg>,
  x:      (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M6 6l12 12M18 6L6 18"/></svg>,
  clock:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>,
  ext:    (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M7 17L17 7M9 7h8v8"/></svg>,
  upload: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 16V4"/><path d="M7 9l5-5 5 5"/><path d="M4 20h16"/></svg>,
  msg:    (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M21 12a7 7 0 0 1-10.6 6l-4.4 1 1.1-4A7 7 0 1 1 21 12z"/></svg>,
  cal:    (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></svg>,
  trend:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 17l6-6 4 4 8-9"/><path d="M14 6h7v7"/></svg>,
  more:   (p) => <svg viewBox="0 0 24 24" fill="currentColor" {...p}><circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/></svg>,
  eye:    (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>,
  building:(p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="4" y="3" width="16" height="18" rx="1.5"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2"/></svg>,
  badge:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="9" r="5"/><path d="M9 13l-2 8 5-3 5 3-2-8"/></svg>,
  server: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="4" width="18" height="6" rx="1.5"/><rect x="3" y="14" width="18" height="6" rx="1.5"/><circle cx="7" cy="7" r="0.5" fill="currentColor"/><circle cx="7" cy="17" r="0.5" fill="currentColor"/></svg>,
  alert:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 3l10 18H2L12 3z"/><path d="M12 10v4M12 18h.01"/></svg>,
  spark:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z"/></svg>,
  globe:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>,
};

/* ─────────────────────────── DATA ─────────────────────────── */
const NAV = [
  { id:"dashboard",  label:"Dashboard",           icon:"home"   },
  { id:"users",      label:"User Management",     icon:"users",  count:188 },
  { id:"content",    label:"Content Management",  icon:"book",   count:45 },
  { id:"moderation", label:"Challenge Moderation",icon:"shield", count:4, dot:true },
  { id:"system",     label:"System Monitoring",   icon:"server", indicator:"ok" },
];

const PENDING = [
  {
    id:"CHL-088",
    company:{ name:"Lumina Pay",   mark:"L", color:"#1E5BFF", domain:"luminapay.com" },
    challenge:"Reduce checkout friction by 15%",
    track:"Product Design",
    submitted:"3h ago",
    submittedAbs:"May 16, 9:42 AM",
    waiting:"3h",
    risk:"low",
    payout:"$2,500",
  },
  {
    id:"CHL-087",
    company:{ name:"Northwind Health", mark:"N", color:"#2C9D6E", domain:"northwind.health" },
    challenge:"De-identified patient cohort dashboard",
    track:"Data Analytics",
    submitted:"Yesterday",
    submittedAbs:"May 15, 4:22 PM",
    waiting:"17h",
    risk:"medium",
    payout:"$3,200",
  },
  {
    id:"CHL-085",
    company:{ name:"Citymap Transit", mark:"C", color:"#C97A2D", domain:"citymap.app" },
    challenge:"Bus arrival anomaly explainer",
    track:"Full-Stack Web",
    submitted:"2 days ago",
    submittedAbs:"May 14, 11:08 AM",
    waiting:"2d",
    risk:"high",
    payout:"$2,800",
  },
  {
    id:"CHL-082",
    company:{ name:"Reverie Studio", mark:"R", color:"#7E4FB4", domain:"reverie.studio" },
    challenge:"Brand system for an AI side project",
    track:"Product Design",
    submitted:"2 days ago",
    submittedAbs:"May 14, 10:15 AM",
    waiting:"2d",
    risk:"low",
    payout:"$1,800",
  },
];

const ACTIVITY = [
  { type:"approve",  who:{ name:"Aanya Patel", initials:"AP", color:"#0F4C5C", role:"Mentor" }, what:"approved submission \"Onboarding redesign\"", target:"Maya Rodriguez", time:"2m ago", tag:"Approval", kind:"accent" },
  { type:"enroll",   who:{ name:"Tomás Aguirre", initials:"TA", color:"#C97A2D", role:"Student" }, what:"enrolled in", target:"Product Design Pathway · Yr 1", time:"14m ago", tag:"Enrollment", kind:"primary" },
  { type:"submit",   who:{ name:"Daniel Okafor", initials:"DO", color:"#2C9D6E", role:"Student" }, what:"submitted to challenge", target:"Personalized merchant insights · Lumina Pay", time:"31m ago", tag:"Submission", kind:"cta" },
  { type:"post",     who:{ name:"Lumina Pay", initials:"L", color:"#1E5BFF", role:"Company" }, what:"posted a new challenge", target:"Reduce checkout friction by 15%", time:"1h ago", tag:"Posted", kind:"cta" },
  { type:"badge",    who:{ name:"Priya Iyer", initials:"PI", color:"#C97A2D", role:"Student" }, what:"earned the badge", target:"Researcher II", time:"2h ago", tag:"Achievement", kind:"warn" },
  { type:"flag",     who:{ name:"Auto-mod", initials:"AM", color:"#4B2E83", role:"System" }, what:"flagged submission for re-review", target:"SUB-1037 · Liam Bergström", time:"3h ago", tag:"Flagged", kind:"rose" },
];

/* ─────────────────────────── PIECES ─────────────────────────── */
function Tag({ kind="primary", children }) {
  const map = {
    primary: { bg:"var(--primary-soft)", c:"var(--primary)" },
    accent:  { bg:"var(--accent-soft)",  c:"var(--accent)"  },
    warn:    { bg:"var(--warn-soft)",    c:"var(--warn)"    },
    rose:    { bg:"var(--rose-soft)",    c:"var(--rose)"    },
    cta:     { bg:"rgba(30,91,255,0.10)", c:"var(--cta)" },
    admin:   { bg:"var(--admin-soft)",   c:"var(--admin)"   },
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

function Ring({ pct=0, size=88, stroke=8, color="var(--primary)", track="var(--hair-2)", label, sub }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = (pct/100) * c;
  return (
    <div className="relative grid place-items-center" style={{width:size, height:size}}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} stroke={track} strokeWidth={stroke} fill="none" />
        <circle cx={size/2} cy={size/2} r={r} stroke={color} strokeWidth={stroke} fill="none"
                strokeLinecap="round" strokeDasharray={`${dash} ${c}`} style={{transition:"stroke-dasharray .6s"}}/>
      </svg>
      <div className="absolute text-center">
        <div className="font-display font-semibold leading-none" style={{ fontSize: size*0.32, color:"var(--ink)" }}>{pct}<span className="text-[12px] muted ml-0.5">%</span></div>
        {sub && <div className="font-mono text-[9.5px] muted tracking-widest uppercase mt-1">{sub}</div>}
      </div>
    </div>
  );
}

function Sparkline({ data, color="var(--primary)", width=120, height=36, fill=true }) {
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

function RiskBadge({ r }) {
  const map = {
    low:    { c:"var(--accent)", l:"Low risk" },
    medium: { c:"var(--warn)",   l:"Medium risk" },
    high:   { c:"var(--rose)",   l:"High risk · re-review" },
  };
  const s = map[r] || map.low;
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-[11px]" style={{color:s.c}}>
      <span className="w-1.5 h-1.5 rounded-full" style={{background:s.c}}/>{s.l}
    </span>
  );
}

/* ─────────────────────────── TOP BAR ─────────────────────────── */
function TopBar({ admin, openBell, openMenu, onBell, onProfile }) {
  return (
    <header className="hairline-b bg-surface" style={{height: 72}}>
      <div className="h-full flex items-center px-8 gap-6">
        <a className="flex items-center gap-2.5 select-none" style={{color:"var(--primary)"}}>
          <I.logo width="28" height="28" />
          <span className="font-display text-[22px] font-semibold tracking-tight" style={{color:"var(--ink)"}}>Eduwork</span>
          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded ml-1" style={{background:"var(--admin-soft)", color:"var(--admin)"}}>ADMIN</span>
          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded ml-1 hairline" style={{color:"var(--ink-2)", background:"#fff"}}>prod</span>
        </a>

        <div className="flex-1 max-w-[560px]">
          <label className="flex items-center gap-3 hairline rounded-xl px-3.5 h-11 bg-[#FAF9F4] focus-within:ring-2 focus-within:ring-[var(--primary-soft)] focus-within:border-[var(--primary)]">
            <I.search width="18" height="18" className="text-[color:var(--muted)]" />
            <input className="bg-transparent outline-none flex-1 text-sm placeholder:text-[color:var(--muted)]"
                   placeholder="Search any user, challenge, module or event log…" />
            <span className="kbd">⌘K</span>
          </label>
        </div>

        <nav className="hidden xl:flex items-center gap-6 text-sm" style={{color:"var(--ink-2)"}}>
          <a className="hover:text-[color:var(--ink)] cursor-pointer">Reports</a>
          <a className="hover:text-[color:var(--ink)] cursor-pointer">Audit log</a>
          <a className="hover:text-[color:var(--ink)] cursor-pointer">Docs</a>
        </nav>

        {/* System status pill */}
        <div className="hairline rounded-xl px-3 py-2 flex items-center gap-2 bg-surface">
          <span className="relative inline-flex w-2 h-2 rounded-full" style={{background:"var(--accent)"}}>
            <span className="absolute inset-0 rounded-full pulse-dot" style={{color:"var(--accent)"}}/>
          </span>
          <span className="text-[12px] font-medium ink-2">All systems normal</span>
          <span className="font-mono text-[10.5px] muted">99.98%</span>
        </div>

        <div className="relative" data-pop>
          <button onClick={onBell} className="relative w-10 h-10 grid place-items-center rounded-xl hover:bg-[var(--hair-2)] ring-focus">
            <I.bell width="20" height="20" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full" style={{background:"var(--rose)", boxShadow:"0 0 0 2px #fff"}} />
          </button>
          {openBell && <BellPanel />}
        </div>

        <div className="relative" data-pop>
          <button onClick={onProfile} className="flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-xl hover:bg-[var(--hair-2)] ring-focus">
            <Avatar name={admin.initials} color="var(--admin)" size={32} />
            <div className="text-left leading-tight pr-1">
              <div className="text-[13px] font-semibold">{admin.first}</div>
              <div className="text-[11px] font-mono" style={{color:"var(--admin)"}}>SUPERADMIN</div>
            </div>
            <I.chev width="16" height="16" className="text-[color:var(--muted)]" />
          </button>
          {openMenu && <ProfileMenu admin={admin} />}
        </div>
      </div>
    </header>
  );
}

function BellPanel() {
  const items = [
    { dot:"var(--rose)",  title:"3 challenges waiting > 24h",          sub:"Citymap, Northwind, Reverie",     fresh:true },
    { dot:"var(--warn)",  title:"Auto-mod flagged 2 submissions",       sub:"Possible plagiarism — review needed", fresh:true },
    { dot:"var(--accent)",title:"Cohort 25 hit 156 active learners",    sub:"+12 since Monday",                fresh:true },
    { dot:"var(--muted)", title:"Backup completed",                      sub:"4.2 GB · today at 03:14 UTC",     fresh:false },
    { dot:"var(--muted)", title:"Mentor onboarding doc updated",         sub:"By Sarah Liu · v3.6",             fresh:false },
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

function ProfileMenu({ admin }) {
  const links = [
    { label:"Switch to staff view",  icon:"users" },
    { label:"Permissions & roles",   icon:"shield" },
    { label:"Audit log",             icon:"brief" },
    { label:"Feature flags",         icon:"pulse" },
  ];
  return (
    <div className="pop-in absolute right-0 top-12 w-[280px] bg-surface hairline rounded-2xl shadow-pop overflow-hidden z-50">
      <div className="px-4 py-3.5 flex items-center gap-3 hairline-b" style={{background:"linear-gradient(180deg, var(--admin-soft), #fff)"}}>
        <Avatar name={admin.initials} color="var(--admin)" size={40}/>
        <div className="min-w-0">
          <div className="text-[14px] font-semibold truncate">{admin.name}</div>
          <div className="text-[12px] muted truncate font-mono">{admin.email}</div>
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
function Sidebar({ active, setActive, navOverrides }) {
  const nav = NAV.map(n => ({ ...n, count: navOverrides?.[n.id] ?? n.count }));
  return (
    <aside className="hairline-r bg-surface flex flex-col" style={{width:264}}>
      <div className="px-5 pt-6 pb-3">
        <div className="font-mono text-[10px] tracking-[0.14em] muted">CONTROL CENTRE</div>
      </div>
      <nav className="px-3 flex flex-col gap-0.5">
        {nav.map(n => {
          const Ico = I[n.icon];
          const isActive = active === n.id;
          return (
            <button key={n.id} onClick={()=>setActive(n.id)}
              className={`nav-item ${isActive?"active":""} group flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-medium text-left`}
              style={{color: isActive?"#fff":"var(--ink-2)"}}>
              <Ico width="18" height="18" className="ico shrink-0" />
              <span className="flex-1">{n.label}</span>
              {n.indicator==="ok" && !isActive && (
                <span className="w-1.5 h-1.5 rounded-full" style={{background:"var(--accent)"}}/>
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
        <div className="font-mono text-[10px] tracking-[0.14em] muted">SYSTEM HEALTH</div>
      </div>
      <div className="px-3 pb-4">
        <div className="hairline rounded-xl p-4" style={{background:"#FBFAF5"}}>
          {[
            ["API latency", "p95 142ms", "var(--accent)"],
            ["Queue depth", "37 jobs",   "var(--accent)"],
            ["Storage",     "62%",       "var(--warn)"],
            ["Error rate",  "0.04%",     "var(--accent)"],
          ].map(([k,v,c],i)=>(
            <div key={i} className={"flex items-center justify-between py-1.5 " + (i<3 ? "hairline-b" : "")}>
              <span className="text-[12px] ink-2">{k}</span>
              <span className="font-mono text-[11px] font-semibold flex items-center gap-1.5" style={{color:c}}>
                <span className="w-1.5 h-1.5 rounded-full" style={{background:c}}/>{v}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-auto px-3 pb-5">
        <div className="hairline rounded-xl px-3 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg grid place-items-center" style={{background:"var(--admin-soft)", color:"var(--admin)"}}>
            <I.shield width="18" height="18"/>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[12.5px] font-semibold leading-tight">2-factor enforced</div>
            <div className="text-[11px] muted">28-day key rotation</div>
          </div>
          <I.check width="14" height="14" className="text-[color:var(--accent)]"/>
        </div>
      </div>
    </aside>
  );
}

/* ─────────────────────────── KPI ─────────────────────────── */
function KPI({ label, big, sub, accent="primary", trend, icon:IconKey, children, footer, sparkData }) {
  const map = {
    primary: "var(--primary)",
    accent:  "var(--accent)",
    warn:    "var(--warn)",
    rose:    "var(--rose)",
    cta:     "var(--cta)",
    admin:   "var(--admin)",
  };
  const c = map[accent];
  const Ico = IconKey ? I[IconKey] : null;
  return (
    <div className="bg-surface hairline rounded-2xl shadow-card p-5 flex flex-col gap-3 relative overflow-hidden">
      <div className="absolute top-0 left-0 h-1 w-12 rounded-br-lg" style={{background:c}} />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {Ico && (
            <div className="w-7 h-7 rounded-lg grid place-items-center" style={{background:mixSoft(c, 0.88), color:c}}>
              <Ico width="14" height="14"/>
            </div>
          )}
          <div className="text-[11.5px] font-mono tracking-wide muted uppercase">{label}</div>
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-[11px] font-mono" style={{color: trend.startsWith("-")?"var(--rose)":"var(--accent)"}}>
            <I.trend width="13" height="13"/>{trend}
          </div>
        )}
      </div>
      <div className="flex items-end justify-between gap-3">
        <div className="flex items-end gap-2">
          <div className="font-display text-[44px] leading-none font-semibold tracking-tight">{big}</div>
          {sub && <div className="text-[13px] font-medium muted pb-1.5">{sub}</div>}
        </div>
        {sparkData && <Sparkline data={sparkData} color={c}/>}
      </div>
      {children}
      {footer && <div className="text-[11.5px] muted pt-1" style={{borderTop:"1px dashed var(--hair)", paddingTop:8}}>{footer}</div>}
    </div>
  );
}

function KpiGrid() {
  return (
    <div className="grid grid-cols-3 gap-5">
      <KPI label="Total students" big="156" sub="learners" accent="primary" trend="+12 wk" icon="users"
           sparkData={[120,124,128,131,134,138,142,146,148,150,153,156]}
           footer="42 active in last 24h · 6 trial accounts">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-1.5">
            {["#0F4C5C","#2C9D6E","#C97A2D","#B8456A","#3B6AC9","#7E4FB4"].map((c,i)=>(
              <div key={i} className="w-6 h-6 rounded-md border-2 border-white" style={{background:c}}/>
            ))}
          </div>
          <span className="text-[12px] muted">across <b className="ink-2">3 cohorts</b></span>
        </div>
      </KPI>

      <KPI label="Total mentors" big="24" sub="active" accent="accent" trend="+2 wk" icon="badge"
           sparkData={[18,19,19,20,20,21,22,22,23,23,24,24]}
           footer="Avg response 3.2h · 19 in green SLA">
        <div className="flex items-center gap-2 flex-wrap">
          <Tag kind="accent">19 in SLA</Tag>
          <Tag kind="warn">3 watching</Tag>
          <Tag kind="rose">2 at risk</Tag>
        </div>
      </KPI>

      <KPI label="Total companies" big="8" sub="partners" accent="cta" trend="+1 mo" icon="building"
           footer="6 active campaigns · 2 onboarding">
        <div className="grid grid-cols-4 gap-1.5">
          {[
            ["L","#1E5BFF"],["N","#2C9D6E"],["C","#C97A2D"],["R","#7E4FB4"],
            ["P","#0F4C5C"],["S","#B8456A"],["+","#FFFFFF"],["+","#FFFFFF"]
          ].map(([t,c],i)=>(
            <div key={i} className={"h-7 grid place-items-center font-display font-semibold text-[12px] rounded-md " + (c==="#FFFFFF"?"hairline muted":"text-white")}
                 style={{background:c}}>{t}</div>
          ))}
        </div>
      </KPI>

      <KPI label="Active modules" big="45" sub="published" accent="primary" trend="+3 mo" icon="book"
           footer="6 drafts in review · 4 retired this quarter">
        <div className="flex items-center gap-2 text-[12px] ink-2">
          <span className="font-mono">68%</span>
          <span className="muted">avg completion across cohorts</span>
        </div>
        <div className="pbar teal"><span style={{width:"68%"}}/></div>
      </KPI>

      <KPI label="Active challenges" big="12" sub="from 8 partners" accent="warn" trend="+2 wk" icon="flag"
           footer="4 closing within 7 days · 1 underfunded">
        <div className="flex items-center gap-2 flex-wrap">
          <Tag kind="accent">7 healthy</Tag>
          <Tag kind="warn">4 closing soon</Tag>
          <Tag kind="rose">1 stalled</Tag>
        </div>
      </KPI>

      <KPI label="Submissions today" big="23" sub="across platform" accent="cta" trend="+18% d/d" icon="upload"
           sparkData={[3,6,9,12,14,16,17,19,20,21,22,23]}
           footer="Peak hour 11:00 — 5 submissions in 30 min">
        <div className="flex items-center gap-2 text-[12px] muted">
          <span className="w-1.5 h-1.5 rounded-full" style={{background:"var(--cta)"}}/>
          <span className="font-mono">7</span><span>in last hour</span>
        </div>
      </KPI>
    </div>
  );
}

/* ─────────────────────────── SYSTEM STATISTICS ─────────────────────────── */
function StatCard({ label, pct, color, delta, sub, breakdown }) {
  return (
    <div className="bg-surface hairline rounded-2xl shadow-card p-5 flex items-center gap-5">
      <Ring pct={pct} size={104} stroke={9} color={color} sub={sub}/>
      <div className="flex-1 min-w-0">
        <div className="text-[11.5px] font-mono tracking-wide muted uppercase">{label}</div>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="font-display text-[20px] font-semibold leading-tight">{pct}%</span>
          {delta && <span className="font-mono text-[11px]" style={{color: delta.startsWith("-")?"var(--rose)":"var(--accent)"}}>{delta}</span>}
        </div>
        <div className="mt-3 space-y-1.5">
          {breakdown.map(([k,v],i)=>(
            <div key={i} className="flex items-center justify-between text-[12px]">
              <span className="muted">{k}</span>
              <span className="font-mono ink-2">{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SystemStats() {
  return (
    <section>
      <header className="flex items-end justify-between mb-4">
        <div>
          <div className="font-mono text-[11px] tracking-[0.18em] muted uppercase mb-1">Platform vitals</div>
          <h2 className="font-display text-[26px] font-semibold tracking-tight">System statistics</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 hairline rounded-xl p-1 bg-[#FBFAF5]">
            {["7d","30d","Quarter"].map((t,i)=>(
              <button key={t} className={"px-3 py-1.5 rounded-lg text-[12.5px] font-medium " + (i===1?"bg-white shadow-card ink":"muted")}>{t}</button>
            ))}
          </div>
          <button className="hairline rounded-xl px-3 py-2 text-[12.5px] font-medium bg-surface hover:bg-[var(--hair-2)] flex items-center gap-1.5">
            <I.ext width="13" height="13"/>Open report
          </button>
        </div>
      </header>
      <div className="grid grid-cols-3 gap-5">
        <StatCard
          label="Module completion rate"
          pct={68}
          color="var(--primary)"
          delta="+4 pts"
          sub="CHRT 25"
          breakdown={[
            ["Started",      "421"],
            ["Completed",    "286"],
            ["Avg. time",    "3.2 wk"],
          ]}/>
        <StatCard
          label="Project approval rate"
          pct={82}
          color="var(--accent)"
          delta="+2 pts"
          sub="MNTR"
          breakdown={[
            ["Submitted",     "138"],
            ["Approved",      "113"],
            ["Revisions req", "19"],
          ]}/>
        <StatCard
          label="Challenge submission rate"
          pct={45}
          color="var(--warn)"
          delta="-3 pts"
          sub="PARTNER"
          breakdown={[
            ["Eligible",     "156"],
            ["Submitted",    "70"],
            ["Top tracks",   "PD, DA"],
          ]}/>
      </div>
    </section>
  );
}

/* ─────────────────────────── PENDING APPROVALS ─────────────────────────── */
function CompanyChip({ company }) {
  return (
    <div className="flex items-center gap-2.5 min-w-0">
      <div className="w-9 h-9 rounded-lg grid place-items-center font-display font-semibold text-white text-[15px] shrink-0"
           style={{background:company.color}}>{company.mark}</div>
      <div className="min-w-0">
        <div className="text-[14px] font-semibold leading-tight truncate">{company.name}</div>
        <div className="text-[11px] muted font-mono truncate">{company.domain}</div>
      </div>
    </div>
  );
}

function ApprovalsTable({ rows, states, onApprove, onReject, onPreview }) {
  return (
    <section className="bg-surface hairline rounded-2xl shadow-card overflow-hidden">
      <header className="px-6 py-5 flex items-center justify-between hairline-b">
        <div className="flex items-baseline gap-3">
          <h3 className="font-display text-[22px] font-semibold tracking-tight">Pending approvals</h3>
          <span className="font-mono text-[11px] muted">{rows.length} company challenges in queue</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[12px] muted hidden md:inline">Auto-mod risk score applied</span>
          <button className="hairline rounded-xl px-3 py-2 text-[12.5px] font-medium flex items-center gap-1.5 bg-surface hover:bg-[var(--hair-2)]">
            <I.ext width="13" height="13"/>Open queue
          </button>
        </div>
      </header>

      <div className="grid grid-cols-[1.4fr_2.2fr_1.1fr_140px_220px] px-6 py-3 text-[11px] font-mono tracking-wide uppercase muted hairline-b">
        <div>Company</div>
        <div>Challenge</div>
        <div>Risk · waiting</div>
        <div>Submitted</div>
        <div className="text-right">Decision</div>
      </div>

      <ul>
        {rows.map((r,i) => {
          const st = states[r.id];
          return (
            <li key={r.id}
                className={"grid grid-cols-[1.4fr_2.2fr_1.1fr_140px_220px] gap-2 px-6 py-4 items-center row-hover " + (i < rows.length-1 ? "hairline-b":"")}>
              <CompanyChip company={r.company}/>
              <div className="min-w-0">
                <div className="text-[14px] font-semibold leading-tight truncate">{r.challenge}</div>
                <div className="text-[11.5px] muted mt-1 flex items-center gap-2 flex-wrap">
                  <span className="font-mono">{r.id}</span>
                  <span>·</span>
                  <span>{r.track}</span>
                  <span>·</span>
                  <span className="font-mono">{r.payout}</span>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <RiskBadge r={r.risk}/>
                <div className="flex items-center gap-1 text-[11px] muted">
                  <I.clock width="11" height="11"/>
                  <span className="font-mono">waiting {r.waiting}</span>
                </div>
              </div>
              <div>
                <div className="text-[13px] font-medium leading-tight">{r.submitted}</div>
                <div className="text-[11px] muted font-mono">{r.submittedAbs}</div>
              </div>
              <div className="flex items-center justify-end gap-2">
                {st === "approved" ? (
                  <Tag kind="accent"><I.check width="11" height="11"/>Approved · published</Tag>
                ) : st === "rejected" ? (
                  <Tag kind="rose"><I.x width="11" height="11"/>Sent back to company</Tag>
                ) : (
                  <>
                    <button onClick={()=>onPreview(r)}
                            className="w-8 h-8 grid place-items-center rounded-lg hairline hover:bg-[var(--hair-2)]" title="Preview brief">
                      <I.eye width="14" height="14" className="text-[color:var(--muted)]"/>
                    </button>
                    <button onClick={()=>onReject(r)}
                            className="hairline px-3 py-2 rounded-lg text-[12.5px] font-medium hover:bg-[var(--hair-2)] flex items-center gap-1.5">
                      <I.x width="13" height="13"/>Reject
                    </button>
                    <button onClick={()=>onApprove(r)}
                            className="text-white text-[12.5px] font-semibold px-3.5 py-2 rounded-lg flex items-center gap-1.5"
                            style={{background:"var(--accent)"}}>
                      <I.check width="13" height="13"/>Approve
                    </button>
                  </>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <footer className="px-6 py-3 hairline-t flex items-center justify-between">
        <div className="text-[12px] muted">Showing 4 of 4 · sorted by waiting time</div>
        <button className="text-[12.5px] font-medium text-[color:var(--primary)] flex items-center gap-1 hover:underline">
          Open full moderation queue <I.arrow width="14" height="14"/>
        </button>
      </footer>
    </section>
  );
}

/* ─────────────────────────── ACTIVITY FEED ─────────────────────────── */
function ActivityIcon({ type }) {
  const map = {
    approve: { ico:"check",  bg:"var(--accent-soft)",  c:"var(--accent)" },
    enroll:  { ico:"users",  bg:"var(--primary-soft)", c:"var(--primary)" },
    submit:  { ico:"upload", bg:"rgba(30,91,255,0.10)",c:"var(--cta)"     },
    post:    { ico:"flag",   bg:"rgba(30,91,255,0.10)",c:"var(--cta)"     },
    badge:   { ico:"badge",  bg:"var(--warn-soft)",    c:"var(--warn)"    },
    flag:    { ico:"alert",  bg:"var(--rose-soft)",    c:"var(--rose)"    },
  };
  const s = map[type] || map.enroll;
  const Ico = I[s.ico];
  return (
    <div className="w-10 h-10 rounded-xl grid place-items-center shrink-0" style={{background:s.bg, color:s.c}}>
      <Ico width="18" height="18"/>
    </div>
  );
}

function ActivityFeed() {
  const [filter, setFilter] = useState("all");
  const tabs = [
    { id:"all",       label:"All" },
    { id:"approve",   label:"Mentor" },
    { id:"submit",    label:"Submissions" },
    { id:"flag",      label:"Flags" },
  ];
  const filtered = filter==="all" ? ACTIVITY
                  : filter==="approve" ? ACTIVITY.filter(a=>a.type==="approve" || a.type==="badge")
                  : filter==="submit"  ? ACTIVITY.filter(a=>a.type==="submit" || a.type==="post" || a.type==="enroll")
                  : ACTIVITY.filter(a=>a.type==="flag");

  return (
    <section className="bg-surface hairline rounded-2xl shadow-card overflow-hidden">
      <header className="px-6 py-5 flex items-center justify-between hairline-b">
        <div className="flex items-baseline gap-3">
          <h3 className="font-display text-[22px] font-semibold tracking-tight">Recent activity</h3>
          <div className="flex items-center gap-1.5 font-mono text-[11px]" style={{color:"var(--accent)"}}>
            <span className="w-1.5 h-1.5 rounded-full" style={{background:"var(--accent)"}}/>
            <span>live</span>
          </div>
        </div>
        <div className="flex items-center gap-1 hairline rounded-xl p-1 bg-[#FBFAF5]">
          {tabs.map(t=>(
            <button key={t.id} onClick={()=>setFilter(t.id)}
                    className={"px-3 py-1.5 rounded-lg text-[12.5px] font-medium transition " +
                      (filter===t.id ? "bg-white shadow-card ink" : "muted hover:text-[color:var(--ink)]")}>
              {t.label}
            </button>
          ))}
        </div>
      </header>
      <ol className="px-6 py-2 relative">
        <div className="absolute left-[44px] top-6 bottom-6 w-px" style={{background:"var(--hair)"}}/>
        {filtered.map((a,i)=>(
          <li key={i} className="flex gap-4 py-4 relative">
            <ActivityIcon type={a.type}/>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Avatar name={a.who.initials} color={a.who.color} size={20}/>
                <span className="text-[13.5px] font-semibold">{a.who.name}</span>
                <span className="font-mono text-[10.5px] muted">{a.who.role}</span>
                <span className="text-[13.5px] ink-2">{a.what}</span>
                <span className="text-[13.5px] font-medium">"{a.target}"</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Tag kind={a.kind}>{a.tag}</Tag>
                <span className="text-[11px] muted">·</span>
                <span className="text-[11px] muted font-mono">{a.time}</span>
              </div>
            </div>
            <button className="opacity-0 group-hover:opacity-100 w-7 h-7 grid place-items-center rounded-lg hover:bg-[var(--hair-2)]" title="More">
              <I.more width="14" height="14" className="text-[color:var(--muted)]"/>
            </button>
          </li>
        ))}
      </ol>
      <footer className="px-6 py-3 hairline-t flex items-center justify-between">
        <span className="text-[12px] muted">Showing {filtered.length} of {ACTIVITY.length} events · streaming</span>
        <button className="text-[12.5px] font-medium text-[color:var(--primary)] flex items-center gap-1 hover:underline">
          Open audit log <I.arrow width="14" height="14"/>
        </button>
      </footer>
    </section>
  );
}

/* ─────────────────────────── RIGHT RAIL ─────────────────────────── */
function ModerationQueue() {
  const items = [
    { kind:"plag",  title:"Possible plagiarism", sub:"SUB-1037 · Liam Bergström", level:"high" },
    { kind:"hate",  title:"Tone flagged in brief", sub:"CHL-085 · Citymap Transit", level:"medium" },
    { kind:"pii",   title:"PII in attachment", sub:"SUB-1029 · Sana Khalil", level:"medium" },
  ];
  return (
    <div className="bg-surface hairline rounded-2xl shadow-card overflow-hidden">
      <header className="px-5 py-4 flex items-center justify-between hairline-b">
        <div className="flex items-center gap-2">
          <I.shield width="15" height="15" className="text-[color:var(--rose)]"/>
          <h4 className="text-[14px] font-semibold">Auto-mod queue</h4>
        </div>
        <Tag kind="rose">{items.length} flagged</Tag>
      </header>
      <ul className="px-2 py-2">
        {items.map((it,i)=>(
          <li key={i} className="flex items-start gap-3 px-3 py-3 rounded-xl hover:bg-[var(--hair-2)] cursor-pointer">
            <div className="w-8 h-8 rounded-lg grid place-items-center shrink-0"
                 style={{background: it.level==="high" ? "var(--rose-soft)":"var(--warn-soft)", color: it.level==="high"?"var(--rose)":"var(--warn)"}}>
              <I.alert width="15" height="15"/>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold leading-tight">{it.title}</div>
              <div className="text-[11.5px] muted truncate">{it.sub}</div>
            </div>
            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded shrink-0"
                  style={{background: it.level==="high" ? "var(--rose-soft)":"var(--warn-soft)", color: it.level==="high"?"var(--rose)":"var(--warn)"}}>
              {it.level}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function GrowthCard() {
  const data = [120,124,128,131,134,138,142,146,148,150,153,156];
  return (
    <div className="bg-surface hairline rounded-2xl shadow-card overflow-hidden">
      <header className="px-5 py-4 flex items-center justify-between hairline-b">
        <div className="flex items-center gap-2">
          <I.trend width="15" height="15" className="text-[color:var(--primary)]"/>
          <h4 className="text-[14px] font-semibold">Active learners</h4>
        </div>
        <span className="text-[11px] font-mono muted">12 weeks</span>
      </header>
      <div className="p-5">
        <div className="flex items-end gap-4 mb-3">
          <div>
            <div className="font-display text-[36px] font-semibold leading-none">156</div>
            <div className="text-[11.5px] muted">+30% quarter</div>
          </div>
          <Sparkline data={data} color="var(--primary)" width={160} height={48}/>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            ["Students","156","var(--primary)"],
            ["Mentors","24","var(--accent)"],
            ["Companies","8","var(--cta)"],
          ].map(([t,n,c],i)=>(
            <div key={i} className="hairline rounded-lg py-2.5" style={{background:"#FBFAF5"}}>
              <div className="font-display text-[18px] font-semibold leading-none" style={{color:c}}>{n}</div>
              <div className="text-[10.5px] font-mono muted mt-1 uppercase tracking-wide">{t}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ReleaseCard() {
  return (
    <div className="rounded-2xl hairline shadow-card p-5 relative overflow-hidden text-white" style={{background:"linear-gradient(135deg, var(--admin) 0%, #2A1A4B 100%)"}}>
      <div className="absolute inset-0 dot-grid opacity-30 pointer-events-none" />
      <div className="relative">
        <div className="flex items-center gap-2">
          <I.spark width="16" height="16" />
          <span className="font-mono text-[10px] tracking-widest uppercase opacity-80">Platform · v3.6</span>
        </div>
        <div className="font-display text-[20px] font-semibold leading-tight mt-2">Release notes</div>
        <ul className="mt-3 space-y-1.5 text-[12.5px] opacity-95">
          <li className="flex items-center gap-2"><I.check width="14" height="14"/>New auto-mod risk scoring</li>
          <li className="flex items-center gap-2"><I.check width="14" height="14"/>Cohort 25 onboarding flow</li>
          <li className="flex items-center gap-2"><I.check width="14" height="14"/>Faster export pipeline</li>
        </ul>
        <button className="mt-4 w-full bg-white text-[color:var(--admin)] text-[13px] font-semibold py-2.5 rounded-xl flex items-center justify-center gap-1.5 hover:bg-[var(--admin-soft)]">
          Open changelog <I.ext width="14" height="14"/>
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────── PLACEHOLDER ─────────────────────────── */
function Placeholder({ title, subtitle, icon:IconKey }) {
  const Ico = I[IconKey] || I.home;
  return (
    <div className="bg-surface hairline rounded-2xl shadow-card p-12 text-center">
      <div className="w-16 h-16 mx-auto rounded-2xl grid place-items-center" style={{background:"var(--admin-soft)", color:"var(--admin)"}}>
        <Ico width="28" height="28"/>
      </div>
      <h2 className="font-display text-[26px] font-semibold mt-4">{title}</h2>
      <p className="muted text-[14px] mt-2 max-w-md mx-auto">{subtitle}</p>
    </div>
  );
}

/* ─────────────────────────── PAGE ─────────────────────────── */
function AdminDashboard({ tweaks }) {
  const [active, setActive] = useState("dashboard");
  const [openBell, setOpenBell] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);
  const [approvalStates, setApprovalStates] = useState({});
  const [previewing, setPreviewing] = useState(null);

  const admin = {
    name: tweaks.adminName,
    first: tweaks.adminName.split(" ")[0],
    initials: tweaks.adminName.split(" ").map(s=>s[0]).slice(0,2).join("").toUpperCase(),
    email: "ops@eduwork.io",
  };

  useEffect(() => {
    const onDoc = (e) => {
      if (!e.target.closest("[data-pop]")) { setOpenBell(false); setOpenMenu(false); }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const handleApprove = (r) => setApprovalStates(s => ({ ...s, [r.id]: "approved" }));
  const handleReject  = (r) => setApprovalStates(s => ({ ...s, [r.id]: "rejected" }));

  const pendingRemaining = PENDING.filter(r => !approvalStates[r.id]).length;

  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <TopBar admin={admin}
              openBell={openBell} openMenu={openMenu}
              onBell={(e)=>{ e.stopPropagation(); setOpenBell(v=>!v); setOpenMenu(false); }}
              onProfile={(e)=>{ e.stopPropagation(); setOpenMenu(v=>!v); setOpenBell(false); }}/>

      <div className="flex flex-1">
        <Sidebar active={active} setActive={setActive}
                 navOverrides={{ moderation: pendingRemaining }}/>

        <main className="flex-1 min-w-0 p-8 max-w-[1640px]">
          {active === "dashboard" && (
            <>
              {/* Welcome */}
              <div className="flex items-end justify-between mb-7">
                <div>
                  <div className="flex items-center gap-2 muted text-[12px] font-mono mb-1">
                    <span>Today · {new Date(2026,4,16).toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}</span>
                    <span>·</span>
                    <span style={{color:"var(--accent)"}}>● 99.98% uptime over 30d</span>
                    <span>·</span>
                    <span>logged in from <span className="ink-2">San Francisco</span></span>
                  </div>
                  <h1 className="font-display text-[40px] font-semibold tracking-tight leading-[1.05]">
                    Admin <span style={{color:"var(--admin)"}}>dashboard</span>.
                  </h1>
                  <p className="muted text-[15px] mt-2 max-w-[720px]">
                    Welcome back, <b className="ink-2">{admin.first}</b>. Four company challenges are waiting on you, and auto-mod has surfaced two submissions worth a second look.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="hairline rounded-xl px-3.5 py-2.5 text-[13px] font-medium flex items-center gap-2 bg-surface hover:bg-[var(--hair-2)]">
                    <I.ext width="15" height="15"/>Open audit log
                  </button>
                  <button className="rounded-xl px-4 py-2.5 text-[13px] font-semibold flex items-center gap-2 text-white"
                          style={{background:"var(--admin)"}}>
                    <I.shield width="14" height="14"/>Run health check
                  </button>
                </div>
              </div>

              {/* 6 KPI cards in 2 rows of 3 */}
              <KpiGrid/>

              {/* System statistics */}
              <div className="mt-9">
                <SystemStats/>
              </div>

              {/* Approvals + Activity, right rail */}
              <section className="mt-9 grid grid-cols-3 gap-5 items-start">
                <div className="col-span-2 flex flex-col gap-9">
                  <ApprovalsTable rows={PENDING} states={approvalStates}
                                  onApprove={handleApprove} onReject={handleReject}
                                  onPreview={setPreviewing}/>
                  <ActivityFeed/>
                </div>
                <div className="flex flex-col gap-5">
                  <ModerationQueue/>
                  <GrowthCard/>
                  <ReleaseCard/>
                </div>
              </section>

              <footer className="mt-10 flex items-center justify-between text-[11.5px] muted font-mono">
                <span>EDUWORK · ADMIN CONTROL · v3.6 · build 2604</span>
                <span>signed in 2h 14m · audit log auto-flush in 14 min</span>
              </footer>
            </>
          )}

          {active === "users" && <Placeholder title="User management" subtitle="Manage students, mentors, companies, and admin team. Filter by cohort, status, or last-active." icon="users"/>}
          {active === "content" && <Placeholder title="Content management" subtitle="Edit learning modules, retire drafts, and schedule cohort releases." icon="book"/>}
          {active === "moderation" && (
            <>
              <h1 className="font-display text-[34px] font-semibold tracking-tight mb-1">Challenge moderation</h1>
              <p className="muted text-[14px] mb-7">Approve or reject company-posted challenges before they reach students.</p>
              <ApprovalsTable rows={PENDING} states={approvalStates}
                              onApprove={handleApprove} onReject={handleReject}
                              onPreview={setPreviewing}/>
            </>
          )}
          {active === "system" && <Placeholder title="System monitoring" subtitle="Detailed traces, queue depths, and incident timelines. Linked to your on-call rotation." icon="server"/>}
        </main>
      </div>

      <PreviewSheet row={previewing} onClose={()=>setPreviewing(null)}
                    onApprove={(r)=>{ handleApprove(r); setPreviewing(null); }}
                    onReject={(r)=>{ handleReject(r);  setPreviewing(null); }}/>
    </div>
  );
}

/* ─────────────────────────── PREVIEW SHEET ─────────────────────────── */
function PreviewSheet({ row, onClose, onApprove, onReject }) {
  if (!row) return null;
  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-[#0E1F2A]/30 backdrop-blur-sm" onClick={onClose}/>
      <aside className="absolute right-0 top-0 h-full w-[600px] bg-surface shadow-pop slide-in flex flex-col">
        <header className="px-6 py-5 hairline-b flex items-start justify-between">
          <div className="min-w-0">
            <div className="text-[11px] font-mono tracking-widest uppercase muted">Challenge brief · {row.id}</div>
            <h3 className="font-display text-[22px] font-semibold tracking-tight leading-tight mt-1">{row.challenge}</h3>
            <div className="flex items-center gap-3 mt-2 text-[12px] muted">
              <CompanyChip company={row.company}/>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 grid place-items-center rounded-lg hover:bg-[var(--hair-2)]">
            <I.x width="16" height="16"/>
          </button>
        </header>
        <div className="flex-1 overflow-auto scroll-thin px-6 py-5 space-y-5">
          <div className="grid grid-cols-3 gap-3">
            {[["Track", row.track],["Payout", row.payout],["Risk score", row.risk.toUpperCase()]].map(([k,v],i)=>(
              <div key={i} className="hairline rounded-xl px-4 py-3" style={{background:"#FBFAF5"}}>
                <div className="text-[10px] font-mono muted tracking-wide uppercase">{k}</div>
                <div className="text-[14px] font-semibold mt-1">{v}</div>
              </div>
            ))}
          </div>
          <div>
            <div className="text-[11px] font-mono tracking-widest uppercase muted mb-2">Brief</div>
            <p className="text-[13.5px] ink-2 leading-relaxed">
              {row.company.name} is asking students to investigate {row.challenge.toLowerCase()}. The brief was submitted via the company portal, includes a project rubric, and references anonymized sample data. Auto-mod has reviewed it for tone, PII, and IP risk; see the score above.
            </p>
          </div>
          <div>
            <div className="text-[11px] font-mono tracking-widest uppercase muted mb-2">Auto-mod findings</div>
            <ul className="space-y-2">
              {[
                ["Tone check", "ok"],
                ["PII detection", "ok"],
                ["IP & licensing", row.risk==="high" ? "review" : "ok"],
                ["Curriculum fit", "ok"],
              ].map(([k,v],i)=>(
                <li key={i} className="hairline rounded-xl px-4 py-2.5 flex items-center justify-between">
                  <span className="text-[13px] ink-2">{k}</span>
                  <span className="font-mono text-[11px] flex items-center gap-1.5" style={{color: v==="ok"?"var(--accent)":"var(--warn)"}}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{background: v==="ok"?"var(--accent)":"var(--warn)"}}/>
                    {v}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <footer className="px-6 py-4 hairline-t flex items-center justify-between">
          <Tag kind="ghost">Decision will be logged · {row.id}</Tag>
          <div className="flex items-center gap-2">
            <button onClick={()=>onReject(row)} className="hairline px-3.5 py-2 rounded-lg text-[13px] font-medium hover:bg-[var(--hair-2)] flex items-center gap-1.5">
              <I.x width="14" height="14"/>Reject
            </button>
            <button onClick={()=>onApprove(row)} className="text-white text-[13px] font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5"
                    style={{background:"var(--accent)"}}>
              <I.check width="14" height="14"/>Approve & publish
            </button>
          </div>
        </footer>
      </aside>
    </div>
  );
}

/* ─────────────────────────── TWEAKS ─────────────────────────── */
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "adminName": "Sarah Liu",
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
      <AdminDashboard tweaks={tweaks}/>
      <TweaksPanel title="Tweaks">
        <TweakSection label="Identity">
          <TweakText label="Admin name" value={tweaks.adminName} onChange={(v)=>setTweak("adminName", v)}/>
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
        </TweakSection>
      </TweaksPanel>
    </>
  );
}

function mixSoft(hex, t) {
  if (hex.startsWith("var(")) return "#FBFAF5";
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
