/* global React, ReactDOM */
const { useState, useEffect, useRef, useMemo } = React;

/* ─────────────────────────── ICONS (inline SVG) ─────────────────────────── */
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
  book:   (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 5a2 2 0 0 1 2-2h13v18H6a2 2 0 0 0-2 2V5z"/><path d="M9 7h7M9 11h7"/></svg>,
  folder: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/></svg>,
  chart:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/></svg>,
  users:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="9" cy="8" r="3.5"/><path d="M2 21c.7-3.6 3.6-5.5 7-5.5s6.3 1.9 7 5.5"/><circle cx="17" cy="6" r="2.5"/><path d="M15.5 14.5c2.8.3 5.1 1.9 6.5 4.5"/></svg>,
  brief:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/><path d="M3 13h18"/></svg>,
  spark:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z"/><path d="M19 17l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2z"/></svg>,
  flag:   (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M5 21V4"/><path d="M5 5h12l-2 4 2 4H5"/></svg>,
  play:   (p) => <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M8 5v14l11-7L8 5z"/></svg>,
  check:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M5 12.5l4.5 4.5L19 7"/></svg>,
  clock:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>,
  msg:    (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M21 12a7 7 0 0 1-10.6 6l-4.4 1 1.1-4A7 7 0 1 1 21 12z"/></svg>,
  cal:    (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></svg>,
  ext:    (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M7 17L17 7M9 7h8v8"/></svg>,
  badge:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="9" r="5"/><path d="M9 13l-2 8 5-3 5 3-2-8"/></svg>,
  trend:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 17l6-6 4 4 8-9"/><path d="M14 6h7v7"/></svg>,
  arrow:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M5 12h14M13 6l6 6-6 6"/></svg>,
  upload: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 16V4"/><path d="M7 9l5-5 5 5"/><path d="M4 20h16"/></svg>,
  plus:   (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" {...p}><path d="M12 5v14M5 12h14"/></svg>,
  fire:   (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 3s4 4 4 8a4 4 0 1 1-8 0c0-1 .4-2 .8-2.6C9 9.8 8 8 8 6c1 1.4 2 1.6 3 1.4C10 5 12 3 12 3z"/></svg>,
  pin:    (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 17v5"/><path d="M7 12l-2 2 5 1 4 4 1-5 2-2"/><path d="M14 4l6 6-3 1-4-4 1-3z"/></svg>,
  more:   (p) => <svg viewBox="0 0 24 24" fill="currentColor" {...p}><circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/></svg>,
};

/* ─────────────────────────── DATA ─────────────────────────── */
const NAV = [
  { id:"dashboard", label:"Dashboard",            icon:"home"  },
  { id:"modules",   label:"Learning Modules",     icon:"book"  , count:20 },
  { id:"projects",  label:"Projects",             icon:"folder", count:5  },
  { id:"progress",  label:"My Progress",          icon:"chart" },
  { id:"mentor",    label:"Mentorship",           icon:"users" , dot:true },
  { id:"portfolio", label:"Portfolio",            icon:"brief" },
  { id:"indie",     label:"Independent Projects", icon:"spark" },
  { id:"chal",      label:"Industry Challenges",  icon:"flag"  , badge:"NEW" },
];

const CONTINUE = [
  {
    track:"Product Design",
    trackColor:"--primary",
    title:"User Research & Synthesis",
    chapter:"Module 7 of 12 · Lesson 03",
    progress:62,
    timeLeft:"42 min left",
    mentor:"Aanya P.",
    pattern:"diagonal",
    next:"Coding the affinity diagram",
  },
  {
    track:"Data Analytics",
    trackColor:"--accent",
    title:"Statistical Inference with Python",
    chapter:"Module 4 of 10 · Lesson 11",
    progress:28,
    timeLeft:"2h 10min left",
    mentor:"Diego R.",
    pattern:"dots",
    next:"Hypothesis testing — t-tests",
  },
  {
    track:"Full-Stack Web",
    trackColor:"--warn",
    title:"REST APIs & Authentication",
    chapter:"Module 9 of 14 · Lesson 02",
    progress:84,
    timeLeft:"18 min left",
    mentor:"Hana K.",
    pattern:"grid",
    next:"Refresh tokens in practice",
  },
];

const ACTIVITY = [
  { type:"submit",  time:"2h ago",  title:"Submitted “Citymap — Transit UX audit”", meta:"Industry Challenge · Lyft", tag:"Under review", tagKind:"warn" },
  { type:"approve", time:"Today, 09:14",  title:"Project approved by mentor",            meta:"“Onboarding redesign for fintech” · Aanya P.", tag:"Approved", tagKind:"accent" },
  { type:"badge",   time:"Yesterday",  title:"Earned the Researcher I badge",         meta:"5 user interviews logged in your portfolio", tag:"+120 XP", tagKind:"primary" },
  { type:"message", time:"Yesterday",  title:"New message from Diego R.",             meta:"“Loved the visual you added to slide 4 — let’s talk on Thursday.”", tag:"Reply", tagKind:"ghost" },
  { type:"module",  time:"2 days ago",  title:"Completed module “Heuristic Evaluation”", meta:"Product Design Track · 4 lessons, 1 quiz", tag:"100%", tagKind:"accent" },
  { type:"chal",    type2:"challenge",  time:"3 days ago",  title:"Joined Industry Challenge — Stripe",  meta:"Reduce checkout friction · Sprint ends May 28", tag:"Sprint", tagKind:"rose" },
];

const UPCOMING = [
  { day:"WED", date:"21", title:"Mentor sync — Aanya P.", time:"4:00 PM · 30 min", kind:"mentor" },
  { day:"THU", date:"22", title:"Cohort live: portfolio reviews", time:"6:00 PM · 90 min", kind:"live" },
  { day:"MON", date:"26", title:"Submission: Stripe challenge", time:"11:59 PM", kind:"deadline" },
];

/* ─────────────────────────── SMALL PIECES ─────────────────────────── */
function Tag({ kind="primary", children }) {
  const map = {
    primary: { bg:"var(--primary-soft)", c:"var(--primary)" },
    accent:  { bg:"var(--accent-soft)",  c:"var(--accent)"  },
    warn:    { bg:"var(--warn-soft)",    c:"var(--warn)"    },
    rose:    { bg:"var(--rose-soft)",    c:"var(--rose)"    },
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

function Ring({ pct=50, size=44, color="var(--primary)", track="var(--hair-2)", stroke=4, children }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = (pct/100) * c;
  return (
    <div className="relative grid place-items-center shrink-0" style={{width:size, height:size}}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} stroke={track} strokeWidth={stroke} fill="none" />
        <circle cx={size/2} cy={size/2} r={r} stroke={color} strokeWidth={stroke} fill="none"
                strokeLinecap="round"
                strokeDasharray={`${dash} ${c}`}/>
      </svg>
      <div className="absolute font-mono" style={{fontSize: size*0.26, fontWeight:600, color:"var(--ink)"}}>{children}</div>
    </div>
  );
}

/* ─────────────────────────── NAV / TOP BAR ─────────────────────────── */
function TopBar({ student, onProfile, onBell, openBell, openMenu, density }) {
  const bellRef = useRef(null);
  const menuRef = useRef(null);
  return (
    <header className="hairline-b bg-surface" style={{height: density==="cozy"?64:72}}>
      <div className="h-full flex items-center px-8 gap-8">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2.5 select-none" style={{color:"var(--primary)"}}>
          <I.logo width="28" height="28" />
          <span className="font-display text-[22px] font-semibold tracking-tight" style={{color:"var(--ink)"}}>Eduwork</span>
          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded ml-1" style={{background:"var(--primary-soft)", color:"var(--primary)"}}>STUDENT</span>
        </a>

        {/* Search */}
        <div className="flex-1 max-w-[640px]">
          <label className="flex items-center gap-3 hairline rounded-xl px-3.5 h-11 bg-[#FAF9F4] focus-within:ring-2 focus-within:ring-[var(--primary-soft)] focus-within:border-[var(--primary)]">
            <I.search width="18" height="18" className="text-[color:var(--muted)]" />
            <input className="bg-transparent outline-none flex-1 text-sm placeholder:text-[color:var(--muted)]"
                   placeholder="Search modules, projects, mentors…" />
            <span className="kbd">⌘K</span>
          </label>
        </div>

        <nav className="hidden xl:flex items-center gap-6 text-sm" style={{color:"var(--ink-2)"}}>
          <a className="hover:text-[color:var(--ink)]">Cohort</a>
          <a className="hover:text-[color:var(--ink)]">Catalog</a>
          <a className="hover:text-[color:var(--ink)]">Help</a>
        </nav>

        {/* Bell */}
        <div className="relative" ref={bellRef}>
          <button onClick={onBell} className="relative w-10 h-10 grid place-items-center rounded-xl hover:bg-[var(--hair-2)] ring-focus">
            <I.bell width="20" height="20" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full" style={{background:"var(--rose)", boxShadow:"0 0 0 2px #fff"}} />
          </button>
          {openBell && <NotificationsPanel />}
        </div>

        {/* Avatar dropdown */}
        <div className="relative" ref={menuRef}>
          <button onClick={onProfile} className="flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-xl hover:bg-[var(--hair-2)] ring-focus">
            <Avatar name={student.initials} color={student.color} size={32} />
            <div className="text-left leading-tight pr-1">
              <div className="text-[13px] font-semibold">{student.first}</div>
              <div className="text-[11px] muted font-mono">{student.cohort}</div>
            </div>
            <I.chev width="16" height="16" className="text-[color:var(--muted)]" />
          </button>
          {openMenu && <ProfileMenu student={student} />}
        </div>
      </div>
    </header>
  );
}

function NotificationsPanel() {
  const items = [
    { dot:"var(--accent)",  title:"Aanya P. approved your project",      sub:"Onboarding redesign · 9:14 AM",  fresh:true },
    { dot:"var(--rose)",    title:"Stripe challenge — sprint ends in 6 days", sub:"Submission opens Wed 21",       fresh:true },
    { dot:"var(--primary)", title:"You earned “Researcher I”",             sub:"5 user interviews logged",       fresh:true },
    { dot:"var(--muted)",   title:"Diego R. sent a message",               sub:"“Loved slide 4 — talk Thursday”",fresh:false },
    { dot:"var(--muted)",   title:"Module assigned: Statistical Inference",sub:"Due Friday May 23",              fresh:false },
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
      <div className="px-4 py-2.5 hairline-b" style={{borderTop:"1px solid var(--hair)"}}>
        <button className="w-full text-center text-[12px] font-medium text-[color:var(--primary)] py-1.5 rounded-lg hover:bg-[var(--primary-soft)]">View all notifications</button>
      </div>
    </div>
  );
}

function ProfileMenu({ student }) {
  const links = [
    { label:"Your portfolio", icon:"brief" },
    { label:"Account settings", icon:"users" },
    { label:"Learning preferences", icon:"book" },
    { label:"Switch to mentor view", icon:"ext" },
  ];
  return (
    <div className="pop-in absolute right-0 top-12 w-[280px] bg-surface hairline rounded-2xl shadow-pop overflow-hidden z-50">
      <div className="px-4 py-3.5 flex items-center gap-3 hairline-b bg-[var(--primary-soft)]/40" style={{background:"linear-gradient(180deg, var(--primary-soft), #fff)"}}>
        <Avatar name={student.initials} color={student.color} size={40} />
        <div className="min-w-0">
          <div className="text-[14px] font-semibold truncate">{student.name}</div>
          <div className="text-[12px] muted truncate font-mono">{student.email}</div>
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
function Sidebar({ active, setActive }) {
  return (
    <aside className="hairline-r bg-surface flex flex-col" style={{width:264}}>
      <div className="px-5 pt-6 pb-3">
        <div className="font-mono text-[10px] tracking-[0.14em] muted">NAVIGATE</div>
      </div>
      <nav className="px-3 flex flex-col gap-0.5">
        {NAV.map(n => {
          const Ico = I[n.icon];
          const isActive = active === n.id;
          return (
            <button key={n.id} onClick={()=>setActive(n.id)}
              className={`nav-item ${isActive?"active":""} group flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-medium text-left`}
              style={{color: isActive?"#fff":"var(--ink-2)"}}>
              <Ico width="18" height="18" className="ico shrink-0" />
              <span className="flex-1">{n.label}</span>
              {n.count != null && !isActive && (
                <span className="font-mono text-[10.5px] muted">{n.count}</span>
              )}
              {n.dot && !isActive && <span className="w-1.5 h-1.5 rounded-full" style={{background:"var(--accent)"}} />}
              {n.badge && (
                <span className="font-mono text-[9.5px] px-1.5 py-0.5 rounded"
                      style={{background: isActive ? "rgba(255,255,255,0.18)" : "var(--rose-soft)", color: isActive ? "#fff" : "var(--rose)"}}>
                  {n.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="px-5 pt-8 pb-2">
        <div className="font-mono text-[10px] tracking-[0.14em] muted">YOUR TRACK</div>
      </div>
      <div className="px-3 pb-4">
        <div className="hairline rounded-xl p-4 relative overflow-hidden" style={{background:"#FBFAF5"}}>
          <div className="absolute inset-0 stripe-soft opacity-60 pointer-events-none" />
          <div className="relative">
            <div className="text-[11px] font-mono muted">PRODUCT DESIGN · YR 2</div>
            <div className="text-[15px] font-semibold mt-0.5">Designer-to-PM Pathway</div>
            <div className="mt-3 flex items-baseline justify-between">
              <div className="text-[11px] muted">Overall progress</div>
              <div className="font-mono text-[12px] font-semibold">60%</div>
            </div>
            <div className="pbar teal mt-1.5"><span style={{width:"60%"}}/></div>
            <div className="mt-3 flex items-center gap-2">
              <I.fire width="14" height="14" className="text-[color:var(--warn)]"/>
              <span className="text-[12px] ink-2"><b className="font-mono">14-day</b> learning streak</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto px-3 pb-5">
        <div className="hairline rounded-xl px-3 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg grid place-items-center" style={{background:"var(--accent-soft)", color:"var(--accent)"}}>
            <I.spark width="18" height="18"/>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[12.5px] font-semibold leading-tight">Refer a friend</div>
            <div className="text-[11px] muted">Get +500 XP each</div>
          </div>
          <I.arrow width="14" height="14" className="text-[color:var(--muted)]"/>
        </div>
      </div>
    </aside>
  );
}

/* ─────────────────────────── KPI CARDS ─────────────────────────── */
function KPI({ label, big, sub, children, accent="primary", trend, footer }) {
  const map = {
    primary: "var(--primary)",
    accent:  "var(--accent)",
    warn:    "var(--warn)",
    rose:    "var(--rose)",
  };
  const c = map[accent];
  return (
    <div className="bg-surface hairline rounded-2xl shadow-card p-5 flex flex-col gap-3 relative overflow-hidden">
      <div className="absolute top-0 left-0 h-1 w-12 rounded-br-lg" style={{background:c}} />
      <div className="flex items-center justify-between">
        <div className="text-[12px] font-mono tracking-wide muted uppercase">{label}</div>
        {trend && (
          <div className="flex items-center gap-1 text-[11px] font-mono" style={{color: trend.startsWith("-")?"var(--rose)":"var(--accent)"}}>
            <I.trend width="13" height="13"/>{trend}
          </div>
        )}
      </div>
      <div className="flex items-end gap-2">
        <div className="font-display text-[42px] leading-none font-semibold tracking-tight" style={{color:"var(--ink)"}}>{big}</div>
        {sub && <div className="text-[14px] font-medium muted pb-1.5">{sub}</div>}
      </div>
      {children}
      {footer && <div className="text-[12px] muted pt-1 hairline-b" style={{borderBottom:"none", borderTop:"1px dashed var(--hair)", paddingTop:10}}>{footer}</div>}
    </div>
  );
}

function KpiRow() {
  return (
    <div className="grid grid-cols-4 gap-5">
      {/* Modules Completed */}
      <KPI label="Modules completed" big="12" sub="/ 20" accent="primary" trend="+2 this week"
           footer="On pace to finish the Product Design track by Aug 12">
        <div>
          <div className="pbar teal"><span style={{width:"60%"}}/></div>
          <div className="flex justify-between mt-2 text-[11px] font-mono muted">
            <span>60% complete</span><span>8 remaining</span>
          </div>
        </div>
      </KPI>

      {/* Projects Submitted */}
      <KPI label="Projects submitted" big="5" accent="accent" trend="+1 this week"
           footer="Next review window: Thu, May 22 · 4PM PT">
        <div className="flex items-center gap-2 flex-wrap">
          <Tag kind="accent"><span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]"/>4 approved</Tag>
          <Tag kind="warn">1 in review</Tag>
        </div>
        <div className="flex -space-x-1.5">
          {["#0F4C5C","#2C9D6E","#C97A2D","#B8456A","#3B6AC9"].map((c,i)=>(
            <div key={i} className="w-6 h-6 rounded-md border-2 border-white" style={{background:c}} />
          ))}
        </div>
      </KPI>

      {/* Active Mentorships */}
      <KPI label="Active mentorship" big="1" sub="mentor" accent="warn"
           footer="Next 1:1 — Wed 4:00 PM with Aanya P.">
        <div className="flex items-center gap-3">
          <Avatar name="AP" color="#0F4C5C" size={36}/>
          <div className="min-w-0">
            <div className="text-[13.5px] font-semibold leading-tight">Aanya Patel</div>
            <div className="text-[11.5px] muted">Sr. Product Designer · Notion</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Tag kind="ghost"><span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]"/>Online</Tag>
          <Tag kind="ghost">Wk 6 of 12</Tag>
        </div>
      </KPI>

      {/* Challenges Attempted */}
      <KPI label="Challenges attempted" big="3" accent="rose" trend="+1 new"
           footer="1 active sprint · 2 completed">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-[11px] px-2 py-1 rounded-md hairline" style={{background:"#fff"}}>Stripe</span>
          <span className="font-mono text-[11px] px-2 py-1 rounded-md hairline" style={{background:"#fff"}}>Lyft</span>
          <span className="font-mono text-[11px] px-2 py-1 rounded-md hairline" style={{background:"#fff"}}>Figma</span>
        </div>
        <div className="flex items-center gap-2">
          <I.clock width="14" height="14" className="text-[color:var(--rose)]" />
          <span className="text-[12px] ink-2"><b className="font-mono">6 days</b> until Stripe deadline</span>
        </div>
      </KPI>
    </div>
  );
}

/* ─────────────────────────── CONTINUE LEARNING ─────────────────────────── */
function ModuleCard({ m }) {
  const c = `var(${m.trackColor})`;
  const patternBg = {
    diagonal: "repeating-linear-gradient(135deg, rgba(255,255,255,0.18) 0 14px, transparent 14px 28px)",
    dots: "radial-gradient(rgba(255,255,255,0.22) 1.5px, transparent 1.6px) 0 0/14px 14px",
    grid: "linear-gradient(rgba(255,255,255,0.18) 1px, transparent 1px) 0 0/22px 22px, linear-gradient(90deg, rgba(255,255,255,0.18) 1px, transparent 1px) 0 0/22px 22px",
  }[m.pattern];
  return (
    <div className="bg-surface hairline rounded-2xl shadow-card overflow-hidden flex flex-col group hover:shadow-pop transition-shadow">
      {/* Cover */}
      <div className="h-[150px] relative" style={{background: c}}>
        <div className="absolute inset-0" style={{background: patternBg}} />
        <div className="absolute inset-0 p-4 flex flex-col justify-between text-white">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] tracking-widest uppercase opacity-90 bg-white/15 backdrop-blur px-2 py-1 rounded">{m.track}</span>
          </div>
          <div className="flex items-end justify-between">
            <Ring pct={m.progress} size={56} color="#fff" track="rgba(255,255,255,0.25)" stroke={5}>
              <span style={{color:"#fff"}}>{m.progress}%</span>
            </Ring>
            <button className="w-11 h-11 rounded-full bg-white grid place-items-center shadow-lg group-hover:scale-105 transition-transform" style={{color: c}}>
              <I.play width="18" height="18"/>
            </button>
          </div>
        </div>
      </div>
      {/* Body */}
      <div className="p-5 flex-1 flex flex-col gap-3">
        <div>
          <div className="text-[11px] font-mono muted">{m.chapter}</div>
          <div className="text-[16px] font-semibold leading-snug mt-1">{m.title}</div>
        </div>
        <div className="text-[12.5px] ink-2 flex items-start gap-1.5">
          <span className="muted">Up next:</span>
          <span>{m.next}</span>
        </div>

        <div className="mt-auto pt-3 hairline-b flex items-center justify-between" style={{borderBottom:"none", borderTop:"1px dashed var(--hair)"}}>
          <div className="flex items-center gap-2">
            <Avatar name={m.mentor.split(" ").map(s=>s[0]).join("")} color={c} size={22}/>
            <span className="text-[11.5px] muted">{m.mentor}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11.5px] muted">
            <I.clock width="13" height="13"/>
            <span className="font-mono">{m.timeLeft}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── ACTIVITY FEED ─────────────────────────── */
function ActivityIcon({ type }) {
  const map = {
    submit:   { ico:"upload",  bg:"var(--warn-soft)",    c:"var(--warn)"    },
    approve:  { ico:"check",   bg:"var(--accent-soft)",  c:"var(--accent)"  },
    badge:    { ico:"badge",   bg:"var(--primary-soft)", c:"var(--primary)" },
    message:  { ico:"msg",     bg:"#F1EAF6",             c:"#7E4FB4"        },
    module:   { ico:"book",    bg:"var(--primary-soft)", c:"var(--primary)" },
    chal:     { ico:"flag",    bg:"var(--rose-soft)",    c:"var(--rose)"    },
  };
  const s = map[type] || map.module;
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
    { id:"all",     label:"All" },
    { id:"submit",  label:"Submissions" },
    { id:"approve", label:"Mentor feedback" },
    { id:"badge",   label:"Achievements" },
  ];
  const filtered = useMemo(() => {
    if (filter==="all") return ACTIVITY;
    return ACTIVITY.filter(a => a.type === filter);
  }, [filter]);

  return (
    <section className="bg-surface hairline rounded-2xl shadow-card overflow-hidden">
      <header className="px-6 py-5 flex items-center justify-between hairline-b">
        <div className="flex items-baseline gap-3">
          <h3 className="font-display text-[22px] font-semibold tracking-tight">Recent activity</h3>
          <span className="font-mono text-[11px] muted">last 30 days</span>
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
        <div className="absolute left-[44px] top-6 bottom-6 w-px" style={{background:"var(--hair)"}} />
        {filtered.map((a,i)=>(
          <li key={i} className="flex gap-4 py-4 relative">
            <ActivityIcon type={a.type}/>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[14px] font-semibold leading-snug">{a.title}</span>
                <Tag kind={a.tagKind}>{a.tag}</Tag>
              </div>
              <div className="text-[12.5px] muted mt-1">{a.meta}</div>
            </div>
            <div className="text-[11.5px] muted font-mono whitespace-nowrap pt-1">{a.time}</div>
          </li>
        ))}
        {filtered.length === 0 && <li className="py-10 text-center muted text-sm">No activity in this view.</li>}
      </ol>

      <footer className="px-6 py-3 hairline-b flex items-center justify-between" style={{borderTop:"1px solid var(--hair)", borderBottom:"none"}}>
        <span className="text-[12px] muted">Showing {filtered.length} of {ACTIVITY.length} events</span>
        <button className="text-[12.5px] font-medium text-[color:var(--primary)] flex items-center gap-1 hover:underline">
          View all <I.arrow width="14" height="14"/>
        </button>
      </footer>
    </section>
  );
}

/* ─────────────────────────── RIGHT RAIL ─────────────────────────── */
function UpcomingCard() {
  const kindStyle = {
    mentor:   { c:"var(--primary)", soft:"var(--primary-soft)", label:"1:1" },
    live:     { c:"var(--accent)",  soft:"var(--accent-soft)",  label:"Live" },
    deadline: { c:"var(--rose)",    soft:"var(--rose-soft)",    label:"Due" },
  };
  return (
    <div className="bg-surface hairline rounded-2xl shadow-card overflow-hidden">
      <header className="px-5 py-4 flex items-center justify-between hairline-b">
        <div className="flex items-center gap-2">
          <I.cal width="16" height="16" className="text-[color:var(--primary)]"/>
          <h4 className="text-[14px] font-semibold">This week</h4>
        </div>
        <button className="text-[11.5px] muted hover:text-[color:var(--ink)]">View calendar</button>
      </header>
      <ul className="px-2 py-2">
        {UPCOMING.map((u,i)=>{
          const k = kindStyle[u.kind];
          return (
            <li key={i} className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-[var(--hair-2)] cursor-pointer">
              <div className="w-11 h-11 rounded-lg hairline grid place-items-center" style={{background:"#FBFAF5"}}>
                <div className="font-mono text-[9px] tracking-widest" style={{color:k.c}}>{u.day}</div>
                <div className="font-display font-semibold text-[15px] -mt-0.5">{u.date}</div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold leading-tight truncate">{u.title}</div>
                <div className="text-[11.5px] muted">{u.time}</div>
              </div>
              <span className="font-mono text-[9.5px] px-1.5 py-0.5 rounded" style={{background:k.soft, color:k.c}}>{k.label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function PortfolioCard() {
  return (
    <div className="rounded-2xl hairline shadow-card p-5 relative overflow-hidden text-white" style={{background:"linear-gradient(135deg, var(--primary) 0%, #0B3743 100%)"}}>
      <div className="absolute inset-0 dot-grid opacity-30 pointer-events-none" />
      <div className="relative">
        <div className="flex items-center gap-2">
          <I.brief width="16" height="16" />
          <span className="font-mono text-[10px] tracking-widest uppercase opacity-80">Portfolio readiness</span>
        </div>
        <div className="mt-4 flex items-end gap-2">
          <div className="font-display text-[40px] leading-none font-semibold tracking-tight">72<span className="text-[18px] opacity-70">%</span></div>
          <div className="text-[12px] opacity-75 pb-1">"Recruiter ready" by mid-June</div>
        </div>
        <div className="pbar mt-3" style={{background:"rgba(255,255,255,0.15)"}}>
          <span style={{width:"72%", background:"linear-gradient(90deg, #fff, #B7E3DD)"}}/>
        </div>
        <ul className="mt-4 space-y-2 text-[12.5px]">
          {[
            ["3 case studies published","done"],
            ["Add a process video","todo"],
            ["Connect GitHub","todo"],
          ].map(([t,s],i)=>(
            <li key={i} className="flex items-center gap-2">
              <span className={"w-4 h-4 rounded-full grid place-items-center " + (s==="done"?"bg-white":"bg-white/15")}>
                {s==="done" && <I.check width="10" height="10" style={{color:"var(--primary)"}}/>}
              </span>
              <span className={s==="done"?"opacity-70 line-through":"opacity-95"}>{t}</span>
            </li>
          ))}
        </ul>
        <button className="mt-4 w-full bg-white text-[color:var(--primary)] text-[13px] font-semibold py-2.5 rounded-xl flex items-center justify-center gap-1.5 hover:bg-[var(--primary-soft)]">
          Open portfolio <I.ext width="14" height="14"/>
        </button>
      </div>
    </div>
  );
}

function ChallengeCard() {
  return (
    <div className="bg-surface hairline rounded-2xl shadow-card overflow-hidden">
      <div className="px-5 py-4 flex items-center justify-between hairline-b">
        <div className="flex items-center gap-2">
          <I.flag width="15" height="15" className="text-[color:var(--rose)]"/>
          <h4 className="text-[14px] font-semibold">Active challenge</h4>
        </div>
        <Tag kind="rose">Sprint · 6d</Tag>
      </div>
      <div className="p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg grid place-items-center font-mono font-bold text-white" style={{background:"#635BFF"}}>S</div>
          <div className="min-w-0">
            <div className="text-[14px] font-semibold leading-tight">Stripe — Checkout friction</div>
            <div className="text-[11.5px] muted">Reduce drop-off by 15% in a single flow</div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center mt-3">
          {[
            ["Brief","done"],
            ["Research","wip"],
            ["Submit","todo"],
          ].map(([t,s],i)=>(
            <div key={i} className="hairline rounded-xl py-2.5">
              <div className="text-[10px] font-mono tracking-widest uppercase muted">{t}</div>
              <div className="mt-1 text-[12.5px] font-semibold" style={{color: s==="done"?"var(--accent)" : s==="wip"?"var(--warn)" :"var(--muted)"}}>
                {s==="done" ? "Done" : s==="wip" ? "In progress" : "Locked"}
              </div>
            </div>
          ))}
        </div>
        <button className="mt-4 w-full text-[13px] font-semibold py-2.5 rounded-xl hairline flex items-center justify-center gap-2 hover:bg-[var(--hair-2)]">
          Continue research <I.arrow width="14" height="14"/>
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────── PAGE SHELL ─────────────────────────── */
function Dashboard({ tweaks }) {
  const [active, setActive] = useState("dashboard");
  const [openBell, setOpenBell] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);

  const student = {
    name: tweaks.studentName,
    first: tweaks.studentName.split(" ")[0],
    initials: tweaks.studentName.split(" ").map(s=>s[0]).slice(0,2).join("").toUpperCase(),
    email: "maya.r@eduwork.io",
    color: "#0F4C5C",
    cohort: "COHORT-25 · YR2",
  };

  // close popovers on outside click
  useEffect(() => {
    const onDoc = (e) => {
      if (!e.target.closest("[data-pop]")) { setOpenBell(false); setOpenMenu(false); }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <div data-pop>
        <TopBar
          student={student}
          openBell={openBell}
          openMenu={openMenu}
          onBell={(e)=>{ e.stopPropagation(); setOpenBell(v=>!v); setOpenMenu(false); }}
          onProfile={(e)=>{ e.stopPropagation(); setOpenMenu(v=>!v); setOpenBell(false); }}
          density={tweaks.density}
        />
      </div>

      <div className="flex flex-1">
        <Sidebar active={active} setActive={setActive} />

        <main className="flex-1 min-w-0 p-8 max-w-[1640px]">
          {/* Welcome */}
          <div className="flex items-end justify-between mb-7">
            <div>
              <div className="flex items-center gap-2 muted text-[12px] font-mono mb-1">
                <span>Today · {new Date(2026,4,16).toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}</span>
                <span>·</span>
                <span style={{color:"var(--accent)"}}>● You're on a 14-day streak</span>
              </div>
              <h1 className="font-display text-[40px] font-semibold tracking-tight leading-[1.05]">
                Welcome back, <span style={{color:"var(--primary)"}}>{student.first}</span>.
              </h1>
              <p className="muted text-[15px] mt-2 max-w-[640px]">
                You're <b className="ink-2">42 minutes</b> away from finishing this week's plan. One mentor sync, two lessons, and a sprint check-in are waiting for you.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button className="hairline rounded-xl px-3.5 py-2.5 text-[13px] font-medium flex items-center gap-2 bg-surface hover:bg-[var(--hair-2)]">
                <I.cal width="15" height="15"/>This week's plan
              </button>
              <button className="rounded-xl px-4 py-2.5 text-[13px] font-semibold flex items-center gap-2 text-white" style={{background:"var(--primary)"}}>
                <I.play width="14" height="14"/>Resume learning
              </button>
            </div>
          </div>

          {/* KPI Row */}
          <KpiRow />

          {/* Continue Learning */}
          <section className="mt-9">
            <header className="flex items-end justify-between mb-4">
              <div>
                <div className="font-mono text-[11px] tracking-[0.18em] muted uppercase mb-1">Pick up where you left off</div>
                <h2 className="font-display text-[26px] font-semibold tracking-tight">Continue learning</h2>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-[12.5px] muted">
                  <I.pin width="14" height="14"/> Pinned to your dashboard
                </div>
                <button className="text-[13px] font-semibold text-[color:var(--primary)] flex items-center gap-1.5 hover:underline">
                  Browse all modules <I.arrow width="14" height="14"/>
                </button>
              </div>
            </header>
            <div className="grid grid-cols-3 gap-5">
              {CONTINUE.map((m,i)=> <ModuleCard key={i} m={m}/>)}
            </div>
          </section>

          {/* Activity + side rail */}
          <section className="mt-9 grid grid-cols-3 gap-5 items-start">
            <div className="col-span-2">
              <ActivityFeed/>
            </div>
            <div className="flex flex-col gap-5">
              <UpcomingCard/>
              <ChallengeCard/>
              <PortfolioCard/>
            </div>
          </section>

          <footer className="mt-10 flex items-center justify-between text-[11.5px] muted font-mono">
            <span>EDUWORK · STUDENT EXPERIENCE PLATFORM · v3.6</span>
            <span>cmd+/ for shortcuts · last sync 2 min ago</span>
          </footer>
        </main>
      </div>
    </div>
  );
}

/* ─────────────────────────── TWEAKS ─────────────────────────── */
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "studentName": "Maya Rodriguez",
  "density": "comfortable",
  "palette": ["#0F4C5C", "#2C9D6E", "#F6F5F0"]
}/*EDITMODE-END*/;

function App() {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // Apply palette to CSS vars
  useEffect(() => {
    const [primary, accent, bg] = Array.isArray(tweaks.palette)
      ? tweaks.palette
      : ["#0F4C5C","#2C9D6E","#F6F5F0"];
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
      <Dashboard tweaks={tweaks}/>
      <TweaksPanel title="Tweaks">
        <TweakSection label="Identity">
          <TweakText label="Student name" value={tweaks.studentName} onChange={(v)=>setTweak("studentName", v)}/>
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
        <TweakSection label="Density">
          <TweakRadio
            label="Top bar"
            value={tweaks.density}
            onChange={(v)=>setTweak("density", v)}
            options={[{value:"cozy", label:"Cozy"},{value:"comfortable", label:"Comfy"}]}
          />
        </TweakSection>
      </TweaksPanel>
    </>
  );
}

/* tiny color helper — mix toward white */
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
