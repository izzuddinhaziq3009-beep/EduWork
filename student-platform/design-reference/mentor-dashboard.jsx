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
  inbox:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 13l3-8h12l3 8"/><path d="M3 13h5l1 3h6l1-3h5v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6z"/></svg>,
  hand:   (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M8 12V5a2 2 0 1 1 4 0v7"/><path d="M12 12V4a2 2 0 1 1 4 0v8"/><path d="M16 12V6a2 2 0 1 1 4 0v9a6 6 0 0 1-6 6H10a4 4 0 0 1-4-4v-1L3 12a2 2 0 1 1 3-3l2 3"/></svg>,
  msg:    (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M21 12a7 7 0 0 1-10.6 6l-4.4 1 1.1-4A7 7 0 1 1 21 12z"/></svg>,
  arrow:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M5 12h14M13 6l6 6-6 6"/></svg>,
  check:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M5 12.5l4.5 4.5L19 7"/></svg>,
  x:      (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M6 6l12 12M18 6L6 18"/></svg>,
  clock:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>,
  ext:    (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M7 17L17 7M9 7h8v8"/></svg>,
  filter: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 5h18M6 12h12M10 19h4"/></svg>,
  sort:   (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M7 5v14M7 19l-3-3M7 5l-3 3"/><path d="M17 19V5M17 5l3 3M17 19l3-3"/></svg>,
  cal:    (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></svg>,
  trend:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 17l6-6 4 4 8-9"/><path d="M14 6h7v7"/></svg>,
  fire:   (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 3s4 4 4 8a4 4 0 1 1-8 0c0-1 .4-2 .8-2.6C9 9.8 8 8 8 6c1 1.4 2 1.6 3 1.4C10 5 12 3 12 3z"/></svg>,
  more:   (p) => <svg viewBox="0 0 24 24" fill="currentColor" {...p}><circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/></svg>,
  doc:    (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M6 3h9l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M14 3v6h6"/><path d="M8 13h8M8 17h6"/></svg>,
  star:   (p) => <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M12 3l2.7 6 6.3.5-4.8 4.2 1.5 6.3L12 16.8 6.3 20l1.5-6.3L3 9.5 9.3 9z"/></svg>,
  play:   (p) => <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M8 5v14l11-7L8 5z"/></svg>,
  link:   (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/></svg>,
};

/* ─────────────────────────── DATA ─────────────────────────── */
const NAV = [
  { id:"dashboard",  label:"Dashboard",            icon:"home" },
  { id:"submissions",label:"Student Submissions",  icon:"inbox", count:8 },
  { id:"requests",   label:"Mentorship Requests",  icon:"hand",  count:3, dot:true },
  { id:"messages",   label:"Messages",             icon:"msg",   count:5 },
];

const SUBMISSIONS = [
  {
    id:"SUB-2034",
    student:{ name:"Maya Rodriguez", initials:"MR", color:"#0F4C5C", role:"Yr 2 · Product Design" },
    title:"Onboarding redesign for a fintech app",
    track:"Product Design",
    submitted:"2h ago",
    submittedAbs:"May 16, 10:42 AM",
    waiting:"2h",
    priority:"high",
    type:"Case study",
    iteration:2,
  },
  {
    id:"SUB-2033",
    student:{ name:"Daniel Okafor", initials:"DO", color:"#2C9D6E", role:"Yr 1 · Full-Stack" },
    title:"REST API authentication — refresh-token flow",
    track:"Full-Stack Web",
    submitted:"5h ago",
    submittedAbs:"May 16, 7:48 AM",
    waiting:"5h",
    priority:"normal",
    type:"Code review",
    iteration:1,
  },
  {
    id:"SUB-2031",
    student:{ name:"Priya Iyer", initials:"PI", color:"#C97A2D", role:"Yr 2 · Data Analytics" },
    title:"Cohort retention model — final report",
    track:"Data Analytics",
    submitted:"Yesterday",
    submittedAbs:"May 15, 4:09 PM",
    waiting:"18h",
    priority:"high",
    type:"Final report",
    iteration:3,
  },
  {
    id:"SUB-2030",
    student:{ name:"Liam Bergström", initials:"LB", color:"#B8456A", role:"Yr 1 · Product Design" },
    title:"Heuristic evaluation: Citymap Transit",
    track:"Product Design",
    submitted:"Yesterday",
    submittedAbs:"May 15, 1:12 PM",
    waiting:"21h",
    priority:"normal",
    type:"Assignment",
    iteration:1,
  },
  {
    id:"SUB-2027",
    student:{ name:"Sana Khalil", initials:"SK", color:"#3B6AC9", role:"Yr 2 · Product Design" },
    title:"Affinity diagram from 8 customer interviews",
    track:"Product Design",
    submitted:"2 days ago",
    submittedAbs:"May 14, 9:30 AM",
    waiting:"2d",
    priority:"overdue",
    type:"Research artefact",
    iteration:2,
  },
];

const REQUESTS = [
  {
    student:{ name:"Noor Hadid", initials:"NH", color:"#0F4C5C", role:"Yr 1 · Product Design", location:"Berlin, DE" },
    when:"Requested 1h ago",
    matchPct:94,
    duration:"12-week pathway",
    message:"Hi Aanya — I've been following your case study on the Notion onboarding redo and I'd love to learn how to think through that depth of research. I'm trying to grow from visual exec into more strategic product thinking; would you be open to a 12-week mentorship?",
    interests:["Research", "Onboarding", "Strategy"],
  },
  {
    student:{ name:"Marcus Bell", initials:"MB", color:"#2C9D6E", role:"Yr 2 · UX Research", location:"Toronto, CA" },
    when:"Requested 4h ago",
    matchPct:88,
    duration:"6-week sprint",
    message:"Looking for a mentor to pressure-test my career narrative before I apply to Big Tech. I have 3 portfolio pieces and 2 weeks of free evenings. Happy to send work ahead of any sync.",
    interests:["Career", "Portfolio", "Interview prep"],
  },
  {
    student:{ name:"Tomás Aguirre", initials:"TA", color:"#C97A2D", role:"Yr 1 · Product Design", location:"Mexico City, MX" },
    when:"Requested yesterday",
    matchPct:81,
    duration:"12-week pathway",
    message:"I switched into design six months ago from an engineering role. The interaction work feels natural but I struggle with visual hierarchy and type. Would love a mentor who can be honest with me about where the gaps are.",
    interests:["Visual design", "Typography", "Switcher"],
  },
];

const MENTEES = [
  { name:"Maya Rodriguez", initials:"MR", color:"#0F4C5C", track:"Product Design", progress:62, week:6, status:"on-track" },
  { name:"Daniel Okafor",  initials:"DO", color:"#2C9D6E", track:"Full-Stack Web",  progress:48, week:5, status:"on-track" },
  { name:"Priya Iyer",     initials:"PI", color:"#C97A2D", track:"Data Analytics",  progress:71, week:8, status:"ahead"    },
  { name:"Liam Bergström", initials:"LB", color:"#B8456A", track:"Product Design",  progress:34, week:4, status:"behind"   },
  { name:"Sana Khalil",    initials:"SK", color:"#3B6AC9", track:"Product Design",  progress:82, week:9, status:"on-track" },
  { name:"Aiko Tanaka",    initials:"AT", color:"#7E4FB4", track:"Product Design",  progress:55, week:6, status:"on-track" },
];

/* ─────────────────────────── PIECES ─────────────────────────── */
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

function PriorityDot({ p }) {
  const map = {
    high:    { c:"var(--rose)",    l:"High"    },
    overdue: { c:"var(--rose)",    l:"Overdue" },
    normal:  { c:"var(--accent)",  l:"Normal"  },
    low:     { c:"var(--muted)",   l:"Low"     },
  };
  const s = map[p] || map.normal;
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-[11px]" style={{color:s.c}}>
      <span className="w-1.5 h-1.5 rounded-full" style={{background:s.c}}/>{s.l}
    </span>
  );
}

function Sparkline({ data=[3,5,4,6,5,7,8,6,7,9,8,10], color="var(--accent)", width=120, height=36 }) {
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
    <svg className="spark" width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <path d={area} fill={color} opacity="0.12"/>
      <path d={d} fill="none" stroke={color} strokeWidth="2"/>
      <circle cx={pts[pts.length-1][0]} cy={pts[pts.length-1][1]} r="3" fill={color}/>
    </svg>
  );
}

/* ─────────────────────────── TOP BAR ─────────────────────────── */
function TopBar({ mentor, openBell, openMenu, onBell, onProfile }) {
  return (
    <header className="hairline-b bg-surface" style={{height: 72}}>
      <div className="h-full flex items-center px-8 gap-8">
        <a className="flex items-center gap-2.5 select-none" style={{color:"var(--primary)"}}>
          <I.logo width="28" height="28" />
          <span className="font-display text-[22px] font-semibold tracking-tight" style={{color:"var(--ink)"}}>Eduwork</span>
          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded ml-1" style={{background:"var(--accent-soft)", color:"var(--accent)"}}>MENTOR</span>
        </a>

        <div className="flex-1 max-w-[640px]">
          <label className="flex items-center gap-3 hairline rounded-xl px-3.5 h-11 bg-[#FAF9F4] focus-within:ring-2 focus-within:ring-[var(--primary-soft)] focus-within:border-[var(--primary)]">
            <I.search width="18" height="18" className="text-[color:var(--muted)]" />
            <input className="bg-transparent outline-none flex-1 text-sm placeholder:text-[color:var(--muted)]"
                   placeholder="Search students, submissions, threads…" />
            <span className="kbd">⌘K</span>
          </label>
        </div>

        <nav className="hidden xl:flex items-center gap-6 text-sm" style={{color:"var(--ink-2)"}}>
          <a className="hover:text-[color:var(--ink)] cursor-pointer">Cohort</a>
          <a className="hover:text-[color:var(--ink)] cursor-pointer">Curriculum</a>
          <a className="hover:text-[color:var(--ink)] cursor-pointer">Help</a>
        </nav>

        <div className="relative" data-pop>
          <button onClick={onBell} className="relative w-10 h-10 grid place-items-center rounded-xl hover:bg-[var(--hair-2)] ring-focus">
            <I.bell width="20" height="20" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full" style={{background:"var(--rose)", boxShadow:"0 0 0 2px #fff"}} />
          </button>
          {openBell && <BellPanel />}
        </div>

        <div className="relative" data-pop>
          <button onClick={onProfile} className="flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-xl hover:bg-[var(--hair-2)] ring-focus">
            <Avatar name={mentor.initials} color={mentor.color} size={32} />
            <div className="text-left leading-tight pr-1">
              <div className="text-[13px] font-semibold">{mentor.first}</div>
              <div className="text-[11px] muted font-mono">{mentor.title}</div>
            </div>
            <I.chev width="16" height="16" className="text-[color:var(--muted)]" />
          </button>
          {openMenu && <ProfileMenu mentor={mentor} />}
        </div>
      </div>
    </header>
  );
}

function BellPanel() {
  const items = [
    { dot:"var(--rose)",    title:"Sana Khalil — submission waiting 2 days", sub:"Affinity diagram · review now", fresh:true },
    { dot:"var(--primary)", title:"3 new mentorship requests",                sub:"Strongest match: Noor Hadid (94%)", fresh:true },
    { dot:"var(--accent)",  title:"Stripe challenge results published",       sub:"4 of your mentees placed in top 50", fresh:true },
    { dot:"var(--muted)",   title:"Cohort 25 weekly digest is ready",         sub:"Average progress this week: +9%",  fresh:false },
    { dot:"var(--muted)",   title:"Curriculum update — Module 12",            sub:"Statistical inference rewritten",  fresh:false },
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

function ProfileMenu({ mentor }) {
  const links = [
    { label:"Public mentor profile", icon:"link" },
    { label:"Office-hour availability", icon:"cal" },
    { label:"Notification settings", icon:"bell" },
    { label:"Switch to student view", icon:"ext" },
  ];
  return (
    <div className="pop-in absolute right-0 top-12 w-[280px] bg-surface hairline rounded-2xl shadow-pop overflow-hidden z-50">
      <div className="px-4 py-3.5 flex items-center gap-3 hairline-b" style={{background:"linear-gradient(180deg, var(--primary-soft), #fff)"}}>
        <Avatar name={mentor.initials} color={mentor.color} size={40} />
        <div className="min-w-0">
          <div className="text-[14px] font-semibold truncate">{mentor.name}</div>
          <div className="text-[12px] muted truncate font-mono">{mentor.email}</div>
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

/* Sidebar is defined below (count-aware version) */

/* ─────────────────────────── KPI ─────────────────────────── */
function KPI({ label, big, sub, accent="primary", trend, footer, children, sparkData, sparkColor }) {
  const map = {
    primary: "var(--primary)",
    accent:  "var(--accent)",
    warn:    "var(--warn)",
    rose:    "var(--rose)",
  };
  const c = map[accent];
  return (
    <div className="bg-surface hairline rounded-2xl shadow-card p-6 flex flex-col gap-4 relative overflow-hidden">
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
          <div className="font-display text-[52px] leading-none font-semibold tracking-tight">{big}</div>
          {sub && <div className="text-[14px] font-medium muted pb-2">{sub}</div>}
        </div>
        {sparkData && <Sparkline data={sparkData} color={c} />}
      </div>
      {children}
      {footer && <div className="text-[12px] muted pt-1" style={{borderTop:"1px dashed var(--hair)", paddingTop:12}}>{footer}</div>}
    </div>
  );
}

function KpiRow() {
  return (
    <div className="grid grid-cols-3 gap-5">
      <KPI label="Pending reviews" big="8" sub="submissions" accent="warn" trend="+3 today"
           sparkData={[2,3,3,4,5,4,6,5,7,6,7,8]}
           footer="2 are waiting more than 24h — clearing the queue keeps your response SLA green.">
        <div className="flex items-center gap-2 flex-wrap">
          <Tag kind="rose"><span className="w-1.5 h-1.5 rounded-full bg-[var(--rose)]"/>2 overdue</Tag>
          <Tag kind="warn">3 high priority</Tag>
          <Tag kind="ghost">3 routine</Tag>
        </div>
      </KPI>

      <KPI label="Active mentees" big="12" sub="students" accent="primary" trend="+1 this week"
           sparkData={[8,8,9,9,10,10,11,11,11,12,12,12]}
           footer="Capacity: 12 of 14 slots filled. 2 seats open for the next cohort intake.">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {MENTEES.slice(0,5).map((m,i)=>(
              <div key={i} className="w-7 h-7 rounded-md border-2 border-white grid place-items-center font-mono text-[9px] font-semibold text-white"
                   style={{background:m.color}}>{m.initials}</div>
            ))}
            <div className="w-7 h-7 rounded-md border-2 border-white grid place-items-center font-mono text-[9.5px] font-semibold hairline"
                 style={{background:"#fff", color:"var(--ink-2)"}}>+7</div>
          </div>
          <div className="text-[12px] muted">
            <span className="ink-2 font-medium">4 ahead</span> · 7 on-track · <span style={{color:"var(--warn)"}}>1 behind</span>
          </div>
        </div>
      </KPI>

      <KPI label="Feedback given · week" big="24" sub="comments" accent="accent" trend="+18% wk/wk"
           sparkData={[1,2,4,3,5,7,9,12,15,18,21,24]}
           footer="Avg response time 3.2h — top quartile across all mentors in this cohort.">
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            ["Approvals","9","var(--accent)"],
            ["Revisions","11","var(--warn)"],
            ["Comments","4","var(--primary)"],
          ].map(([t,n,c],i)=>(
            <div key={i} className="hairline rounded-lg py-2" style={{background:"#FBFAF5"}}>
              <div className="font-display text-[18px] font-semibold leading-none" style={{color:c}}>{n}</div>
              <div className="text-[10.5px] font-mono muted mt-1 uppercase tracking-wide">{t}</div>
            </div>
          ))}
        </div>
      </KPI>
    </div>
  );
}

/* ─────────────────────────── SUBMISSIONS TABLE ─────────────────────────── */
function SubmissionsTable({ rows, onReview }) {
  const [filter, setFilter] = useState("all");
  const filtered = useMemo(() => {
    if (filter==="all") return rows;
    if (filter==="overdue") return rows.filter(r => r.priority==="overdue" || r.waiting.includes("d"));
    if (filter==="high") return rows.filter(r => r.priority==="high");
    return rows;
  }, [filter, rows]);

  const tabs = [
    { id:"all",     label:"All",     n:rows.length },
    { id:"high",    label:"High priority", n:rows.filter(r=>r.priority==="high").length },
    { id:"overdue", label:"Overdue", n:rows.filter(r=>r.priority==="overdue" || r.waiting.includes("d")).length },
  ];

  return (
    <section className="bg-surface hairline rounded-2xl shadow-card overflow-hidden">
      <header className="px-6 py-5 flex items-center justify-between hairline-b">
        <div className="flex items-baseline gap-3">
          <h3 className="font-display text-[22px] font-semibold tracking-tight">Pending submissions</h3>
          <span className="font-mono text-[11px] muted">{rows.length} awaiting your review</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 hairline rounded-xl p-1 bg-[#FBFAF5]">
            {tabs.map(t=>(
              <button key={t.id} onClick={()=>setFilter(t.id)}
                      className={"px-3 py-1.5 rounded-lg text-[12.5px] font-medium transition flex items-center gap-1.5 " +
                        (filter===t.id ? "bg-white shadow-card ink" : "muted hover:text-[color:var(--ink)]")}>
                {t.label}
                <span className={"font-mono text-[10px] " + (filter===t.id ? "ink-2":"muted")}>{t.n}</span>
              </button>
            ))}
          </div>
          <button className="hairline rounded-xl px-3 py-2 text-[12.5px] font-medium flex items-center gap-1.5 bg-surface hover:bg-[var(--hair-2)]">
            <I.sort width="13" height="13"/>Oldest first
          </button>
        </div>
      </header>

      <div className="grid grid-cols-[1.8fr_2.2fr_140px_120px_180px] px-6 py-3 text-[11px] font-mono tracking-wide uppercase muted hairline-b">
        <div>Student</div>
        <div>Project</div>
        <div>Submitted</div>
        <div>Priority</div>
        <div className="text-right">Action</div>
      </div>

      <ul>
        {filtered.map((r,i) => (
          <li key={r.id}
              className={"grid grid-cols-[1.8fr_2.2fr_140px_120px_180px] gap-2 px-6 py-4 items-center row-hover " + (i < filtered.length-1 ? "hairline-b":"")}>
            {/* Student */}
            <div className="flex items-center gap-3 min-w-0">
              <Avatar name={r.student.initials} color={r.student.color} size={38}/>
              <div className="min-w-0">
                <div className="text-[14px] font-semibold leading-tight truncate">{r.student.name}</div>
                <div className="text-[11.5px] muted font-mono truncate">{r.student.role}</div>
              </div>
            </div>
            {/* Project */}
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[14px] font-semibold leading-tight">
                <I.doc width="15" height="15" className="text-[color:var(--muted)] shrink-0"/>
                <span className="truncate">{r.title}</span>
              </div>
              <div className="text-[11.5px] muted mt-1 flex items-center gap-2">
                <span className="font-mono">{r.id}</span>
                <span>·</span>
                <span>{r.type}</span>
                <span>·</span>
                <span>{r.track}</span>
                {r.iteration > 1 && (
                  <>
                    <span>·</span>
                    <span className="font-mono px-1.5 py-0.5 rounded text-[9.5px]" style={{background:"var(--primary-soft)", color:"var(--primary)"}}>v{r.iteration}</span>
                  </>
                )}
              </div>
            </div>
            {/* Submitted */}
            <div>
              <div className="text-[13px] font-medium leading-tight">{r.submitted}</div>
              <div className="text-[11px] muted font-mono">{r.submittedAbs}</div>
            </div>
            {/* Priority */}
            <div className="flex flex-col gap-1">
              <PriorityDot p={r.priority}/>
              <div className="flex items-center gap-1 text-[11px] muted">
                <I.clock width="11" height="11"/>
                <span className="font-mono">waiting {r.waiting}</span>
              </div>
            </div>
            {/* Action */}
            <div className="flex items-center justify-end gap-2 row-action">
              <button className="w-8 h-8 grid place-items-center rounded-lg hairline hover:bg-[var(--hair-2)]" title="Message student">
                <I.msg width="14" height="14" className="text-[color:var(--muted)]"/>
              </button>
              <button onClick={()=>onReview(r)}
                      className="text-white text-[12.5px] font-semibold px-3.5 py-2 rounded-lg flex items-center gap-1.5"
                      style={{background:"var(--primary)"}}>
                Review <I.arrow width="13" height="13"/>
              </button>
              <button className="w-8 h-8 grid place-items-center rounded-lg hover:bg-[var(--hair-2)]" title="More">
                <I.more width="16" height="16" className="text-[color:var(--muted)]"/>
              </button>
            </div>
          </li>
        ))}
        {filtered.length === 0 && (
          <li className="py-12 text-center muted text-sm">Nothing in this view — nice job staying ahead of the queue.</li>
        )}
      </ul>

      <footer className="px-6 py-3 hairline-t flex items-center justify-between">
        <div className="text-[12px] muted">Showing {filtered.length} of {rows.length} submissions</div>
        <button className="text-[12.5px] font-medium text-[color:var(--primary)] flex items-center gap-1 hover:underline">
          Open full queue <I.arrow width="14" height="14"/>
        </button>
      </footer>
    </section>
  );
}

/* ─────────────────────────── REQUESTS ─────────────────────────── */
function RequestCard({ r, onAccept, onReject, state }) {
  if (state === "accepted" || state === "rejected") {
    const done = state === "accepted";
    return (
      <div className="hairline rounded-2xl p-5 flex items-center gap-4 slide-in"
           style={{background: done ? "var(--accent-soft)" : "#FBFAF5"}}>
        <div className="w-12 h-12 rounded-full grid place-items-center"
             style={{background:done?"var(--accent)":"var(--muted)", color:"#fff"}}>
          {done ? <I.check width="22" height="22"/> : <I.x width="22" height="22"/>}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[14px] font-semibold">
            {done ? `Mentorship with ${r.student.name} accepted` : `Politely declined ${r.student.name}'s request`}
          </div>
          <div className="text-[12px] muted">
            {done ? "Kickoff invite sent. Their first 1:1 will appear on your calendar." : "We'll suggest two alternate mentors and let them know."}
          </div>
        </div>
        <button className="text-[12.5px] font-medium text-[color:var(--primary)] hover:underline">Undo</button>
      </div>
    );
  }
  return (
    <div className="bg-surface hairline rounded-2xl shadow-card p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar name={r.student.initials} color={r.student.color} size={48}/>
          <div className="min-w-0">
            <div className="text-[15px] font-semibold leading-tight">{r.student.name}</div>
            <div className="text-[11.5px] muted font-mono mt-0.5">{r.student.role} · {r.student.location}</div>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="font-mono text-[10.5px] tracking-wide muted">MATCH</div>
          <div className="font-display text-[20px] font-semibold leading-none mt-0.5" style={{color:"var(--accent)"}}>{r.matchPct}%</div>
        </div>
      </div>

      <div className="hairline rounded-xl p-3.5 text-[13px] ink-2 leading-relaxed bg-[#FBFAF5] relative">
        <span className="absolute -top-2 left-3 px-1.5 text-[10px] font-mono tracking-widest uppercase muted" style={{background:"var(--bg)"}}>Message</span>
        <span className="line-clamp-4">"{r.message}"</span>
      </div>

      <div className="flex items-center flex-wrap gap-1.5">
        {r.interests.map((t,i)=>(
          <span key={i} className="font-mono text-[10.5px] px-2 py-1 rounded-md hairline" style={{background:"#fff"}}>#{t.toLowerCase()}</span>
        ))}
      </div>

      <div className="flex items-center justify-between hairline-t pt-3">
        <div className="text-[11.5px] muted flex items-center gap-3">
          <span className="flex items-center gap-1"><I.clock width="11" height="11"/>{r.when}</span>
          <span>·</span>
          <span>{r.duration}</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={()=>onReject(r)}
                  className="hairline px-3 py-2 rounded-lg text-[12.5px] font-medium flex items-center gap-1.5 hover:bg-[var(--hair-2)]">
            <I.x width="13" height="13"/>Decline
          </button>
          <button onClick={()=>onAccept(r)}
                  className="px-3.5 py-2 rounded-lg text-[12.5px] font-semibold text-white flex items-center gap-1.5"
                  style={{background:"var(--accent)"}}>
            <I.check width="13" height="13"/>Accept
          </button>
        </div>
      </div>
    </div>
  );
}

function RequestsSection({ requests, states, onAccept, onReject }) {
  return (
    <section>
      <header className="flex items-end justify-between mb-4">
        <div>
          <div className="font-mono text-[11px] tracking-[0.18em] muted uppercase mb-1">Students requesting you</div>
          <div className="flex items-baseline gap-3">
            <h2 className="font-display text-[26px] font-semibold tracking-tight">Mentorship requests</h2>
            <span className="font-mono text-[12px] muted">{requests.filter((_,i)=>!states[i]).length} pending</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[12.5px] muted">
            <I.hand width="14" height="14"/> Matched to your expertise
          </div>
          <button className="text-[13px] font-semibold text-[color:var(--primary)] flex items-center gap-1.5 hover:underline">
            See all requests <I.arrow width="14" height="14"/>
          </button>
        </div>
      </header>
      <div className="grid grid-cols-3 gap-5">
        {requests.map((r,i)=>(
          <RequestCard key={i} r={r} state={states[i]} onAccept={()=>onAccept(i)} onReject={()=>onReject(i)} />
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────── REVIEW SHEET ─────────────────────────── */
function ReviewSheet({ row, onClose }) {
  if (!row) return null;
  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-[#0E1F2A]/30 backdrop-blur-sm" onClick={onClose}/>
      <aside className="absolute right-0 top-0 h-full w-[540px] bg-surface shadow-pop slide-in flex flex-col"
             style={{ animation: "slidein .24s ease-out both" }}>
        <header className="px-6 py-5 hairline-b flex items-start justify-between">
          <div className="min-w-0">
            <div className="text-[11px] font-mono tracking-widest uppercase muted">Submission · {row.id}</div>
            <h3 className="font-display text-[22px] font-semibold tracking-tight leading-tight mt-1">{row.title}</h3>
            <div className="flex items-center gap-3 mt-2 text-[12px] muted">
              <span className="flex items-center gap-1.5"><Avatar name={row.student.initials} color={row.student.color} size={18}/>{row.student.name}</span>
              <span>·</span>
              <span>{row.track}</span>
              <span>·</span>
              <span>{row.submittedAbs}</span>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 grid place-items-center rounded-lg hover:bg-[var(--hair-2)]">
            <I.x width="16" height="16"/>
          </button>
        </header>
        <div className="flex-1 overflow-auto scroll-thin px-6 py-5 space-y-5">
          <div className="hairline rounded-xl overflow-hidden">
            <div className="h-[180px] relative" style={{background:"var(--primary)"}}>
              <div className="absolute inset-0" style={{backgroundImage:"repeating-linear-gradient(45deg, rgba(255,255,255,0.10) 0 10px, transparent 10px 20px)"}}/>
              <button className="absolute inset-0 grid place-items-center">
                <div className="w-12 h-12 rounded-full bg-white grid place-items-center" style={{color:"var(--primary)"}}>
                  <I.play width="20" height="20"/>
                </div>
              </button>
            </div>
            <div className="p-4 flex items-center justify-between">
              <div>
                <div className="text-[13.5px] font-semibold">Walkthrough video · 4:21</div>
                <div className="text-[11.5px] muted">Recorded May 16 · linked to case-study doc</div>
              </div>
              <button className="hairline px-3 py-1.5 rounded-lg text-[12px] font-medium flex items-center gap-1.5 hover:bg-[var(--hair-2)]">
                <I.ext width="13" height="13"/>Open in editor
              </button>
            </div>
          </div>

          <div>
            <div className="text-[11px] font-mono tracking-widest uppercase muted mb-2">Rubric</div>
            <div className="space-y-2">
              {[
                ["Problem framing", 4],
                ["Research synthesis", 5],
                ["Concept exploration", 3],
                ["Final delivery", 4],
              ].map(([t, v]) => (
                <div key={t} className="hairline rounded-xl px-4 py-3 flex items-center gap-4">
                  <div className="flex-1 text-[13px] font-medium">{t}</div>
                  <div className="flex gap-1">
                    {Array.from({length:5}).map((_,i)=>(
                      <span key={i} className="w-2.5 h-2.5 rounded-full" style={{background: i < v ? "var(--accent)" : "var(--hair)"}}/>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[11px] font-mono tracking-widest uppercase muted mb-2">Your feedback</div>
            <textarea className="w-full hairline rounded-xl p-4 text-[14px] leading-relaxed bg-[#FBFAF5] focus:outline-none focus:ring-2 focus:ring-[var(--primary-soft)]"
                      rows="6"
                      defaultValue={"Maya — strong synthesis from the eight interviews. The flow from problem statement → opportunity map is the clearest version yet.\n\nOne push: I'd like to see one more rejected concept in the writeup. Recruiters love to see what you didn't ship and why."}/>
          </div>
        </div>
        <footer className="px-6 py-4 hairline-t flex items-center justify-between">
          <Tag kind="warn"><span className="w-1.5 h-1.5 rounded-full bg-[var(--warn)]"/>Draft saved · 2s ago</Tag>
          <div className="flex items-center gap-2">
            <button className="hairline px-3.5 py-2 rounded-lg text-[13px] font-medium hover:bg-[var(--hair-2)]">Request revision</button>
            <button onClick={onClose} className="text-white text-[13px] font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5"
                    style={{background:"var(--accent)"}}>
              <I.check width="14" height="14"/>Approve submission
            </button>
          </div>
        </footer>
      </aside>
    </div>
  );
}

/* ─────────────────────────── RIGHT RAIL ─────────────────────────── */
function CohortPulse() {
  return (
    <div className="bg-surface hairline rounded-2xl shadow-card overflow-hidden">
      <header className="px-5 py-4 flex items-center justify-between hairline-b">
        <div className="flex items-center gap-2">
          <I.trend width="15" height="15" className="text-[color:var(--primary)]"/>
          <h4 className="text-[14px] font-semibold">Cohort pulse</h4>
        </div>
        <span className="text-[11px] font-mono muted">last 4 weeks</span>
      </header>
      <div className="p-5 flex items-end gap-4">
        <div>
          <div className="font-display text-[36px] font-semibold leading-none">+9<span className="text-[16px] muted">%</span></div>
          <div className="text-[11.5px] muted">avg progress this week</div>
        </div>
        <div className="flex-1">
          <Sparkline data={[60,58,62,64,63,66,68,67,70,72,74,76]} color="var(--primary)" width={160} height={48}/>
        </div>
      </div>
      <div className="px-5 pb-5">
        <div className="space-y-3">
          {[
            ["Ahead",   4, "var(--accent)"],
            ["On track",7, "var(--primary)"],
            ["Behind",  1, "var(--warn)"],
          ].map(([t,n,c],i)=>(
            <div key={i} className="flex items-center gap-3">
              <div className="w-24 text-[12px] ink-2">{t}</div>
              <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{background:"var(--hair-2)"}}>
                <div style={{width: (n/12)*100+"%", height:"100%", background:c}}/>
              </div>
              <div className="font-mono text-[12px] w-6 text-right">{n}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ScheduleCard() {
  const items = [
    { day:"WED", date:"21", title:"1:1 — Maya Rodriguez",  time:"4:00 PM · 30 min", kind:"mentor" },
    { day:"THU", date:"22", title:"Office hours (open)",     time:"6:00 PM · 4 free", kind:"live" },
    { day:"FRI", date:"23", title:"Review window — Stripe", time:"All day", kind:"deadline" },
  ];
  const k = {
    mentor:   { c:"var(--primary)", soft:"var(--primary-soft)", label:"1:1" },
    live:     { c:"var(--accent)",  soft:"var(--accent-soft)",  label:"Live" },
    deadline: { c:"var(--rose)",    soft:"var(--rose-soft)",    label:"Due" },
  };
  return (
    <div className="bg-surface hairline rounded-2xl shadow-card overflow-hidden">
      <header className="px-5 py-4 flex items-center justify-between hairline-b">
        <div className="flex items-center gap-2">
          <I.cal width="15" height="15" className="text-[color:var(--primary)]"/>
          <h4 className="text-[14px] font-semibold">Your week</h4>
        </div>
        <button className="text-[11.5px] muted hover:text-[color:var(--ink)]">Calendar</button>
      </header>
      <ul className="px-2 py-2">
        {items.map((u,i)=>{
          const s = k[u.kind];
          return (
            <li key={i} className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-[var(--hair-2)] cursor-pointer">
              <div className="w-11 h-11 rounded-lg hairline grid place-items-center" style={{background:"#FBFAF5"}}>
                <div className="font-mono text-[9px] tracking-widest" style={{color:s.c}}>{u.day}</div>
                <div className="font-display font-semibold text-[15px] -mt-0.5">{u.date}</div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold leading-tight truncate">{u.title}</div>
                <div className="text-[11.5px] muted">{u.time}</div>
              </div>
              <span className="font-mono text-[9.5px] px-1.5 py-0.5 rounded" style={{background:s.soft, color:s.c}}>{s.label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function MenteesPanel() {
  return (
    <div className="bg-surface hairline rounded-2xl shadow-card overflow-hidden">
      <header className="px-5 py-4 flex items-center justify-between hairline-b">
        <div className="flex items-center gap-2">
          <I.hand width="15" height="15" className="text-[color:var(--accent)]"/>
          <h4 className="text-[14px] font-semibold">Active mentees</h4>
        </div>
        <button className="text-[11.5px] muted hover:text-[color:var(--ink)]">See all 12</button>
      </header>
      <ul className="px-2 py-2">
        {MENTEES.slice(0,4).map((m,i)=>{
          const statusColor = m.status === "ahead" ? "var(--accent)" : m.status === "behind" ? "var(--warn)" : "var(--primary)";
          return (
            <li key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[var(--hair-2)] cursor-pointer">
              <Avatar name={m.initials} color={m.color} size={32}/>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-[13px] font-semibold truncate">{m.name}</div>
                  <div className="font-mono text-[10px] muted">wk {m.week}</div>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-1 rounded-full overflow-hidden" style={{background:"var(--hair-2)"}}>
                    <div style={{width:m.progress+"%", height:"100%", background:statusColor}}/>
                  </div>
                  <div className="font-mono text-[10px]" style={{color:statusColor}}>{m.progress}%</div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ─────────────────────────── PLACEHOLDER PAGES ─────────────────────────── */
function PlaceholderPage({ title, subtitle, icon:IconKey }) {
  const Ico = I[IconKey] || I.home;
  return (
    <div className="bg-surface hairline rounded-2xl shadow-card p-12 text-center">
      <div className="w-16 h-16 mx-auto rounded-2xl grid place-items-center" style={{background:"var(--primary-soft)", color:"var(--primary)"}}>
        <Ico width="28" height="28"/>
      </div>
      <h2 className="font-display text-[26px] font-semibold mt-4">{title}</h2>
      <p className="muted text-[14px] mt-2 max-w-md mx-auto">{subtitle}</p>
      <button className="mt-6 text-[13px] font-semibold px-4 py-2.5 rounded-xl text-white" style={{background:"var(--primary)"}}>
        Take me back to dashboard
      </button>
    </div>
  );
}

/* ─────────────────────────── PAGE ─────────────────────────── */
function MentorDashboard({ tweaks }) {
  const [active, setActive] = useState("dashboard");
  const [openBell, setOpenBell] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);
  const [reviewing, setReviewing] = useState(null);
  const [requestStates, setRequestStates] = useState({}); // {0:"accepted"|"rejected"}

  const mentor = {
    name: tweaks.mentorName,
    first: tweaks.mentorName.split(" ")[0],
    initials: tweaks.mentorName.split(" ").map(s=>s[0]).slice(0,2).join("").toUpperCase(),
    email: "aanya.p@eduwork.io",
    color: "#0F4C5C",
    title: tweaks.mentorTitle,
  };

  useEffect(() => {
    const onDoc = (e) => {
      if (!e.target.closest("[data-pop]")) { setOpenBell(false); setOpenMenu(false); }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const handleAccept = (i) => setRequestStates(s => ({ ...s, [i]:"accepted" }));
  const handleReject = (i) => setRequestStates(s => ({ ...s, [i]:"rejected" }));

  // Submissions count for sidebar accuracy
  const pendingCount = SUBMISSIONS.length;
  const requestPending = REQUESTS.filter((_,i)=> !requestStates[i]).length;

  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <TopBar mentor={mentor}
              openBell={openBell} openMenu={openMenu}
              onBell={(e)=>{ e.stopPropagation(); setOpenBell(v=>!v); setOpenMenu(false); }}
              onProfile={(e)=>{ e.stopPropagation(); setOpenMenu(v=>!v); setOpenBell(false); }}/>

      <div className="flex flex-1">
        <Sidebar active={active} setActive={setActive}
                 navOverrides={{ submissions: pendingCount, requests: requestPending }}/>

        <main className="flex-1 min-w-0 p-8 max-w-[1640px]">
          {active === "dashboard" && (
            <>
              {/* Welcome */}
              <div className="flex items-end justify-between mb-7">
                <div>
                  <div className="flex items-center gap-2 muted text-[12px] font-mono mb-1">
                    <span>Today · {new Date(2026,4,16).toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}</span>
                    <span>·</span>
                    <span style={{color:"var(--accent)"}}>● {pendingCount} need your attention</span>
                  </div>
                  <h1 className="font-display text-[40px] font-semibold tracking-tight leading-[1.05]">
                    Welcome back, <span style={{color:"var(--primary)"}}>{mentor.first}</span>.
                  </h1>
                  <p className="muted text-[15px] mt-2 max-w-[680px]">
                    Two submissions have been waiting more than a day. Clear those first and you'll be back inside your 24-hour response promise.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="hairline rounded-xl px-3.5 py-2.5 text-[13px] font-medium flex items-center gap-2 bg-surface hover:bg-[var(--hair-2)]">
                    <I.cal width="15" height="15"/>Open calendar
                  </button>
                  <button onClick={()=>setReviewing(SUBMISSIONS[0])}
                          className="rounded-xl px-4 py-2.5 text-[13px] font-semibold flex items-center gap-2 text-white"
                          style={{background:"var(--primary)"}}>
                    <I.play width="14" height="14"/>Start review queue
                  </button>
                </div>
              </div>

              <KpiRow/>

              <section className="mt-9 grid grid-cols-3 gap-5 items-start">
                <div className="col-span-2 flex flex-col gap-9">
                  <SubmissionsTable rows={SUBMISSIONS} onReview={setReviewing}/>
                  <RequestsSection requests={REQUESTS} states={requestStates}
                                   onAccept={handleAccept} onReject={handleReject}/>
                </div>
                <div className="flex flex-col gap-5">
                  <CohortPulse/>
                  <ScheduleCard/>
                  <MenteesPanel/>
                </div>
              </section>

              <footer className="mt-10 flex items-center justify-between text-[11.5px] muted font-mono">
                <span>EDUWORK · MENTOR WORKSPACE · v3.6</span>
                <span>cmd+/ for shortcuts · auto-saved 2 min ago</span>
              </footer>
            </>
          )}

          {active === "submissions" && (
            <>
              <h1 className="font-display text-[34px] font-semibold tracking-tight mb-1">Student submissions</h1>
              <p className="muted text-[14px] mb-7">All work waiting on your review, across every track.</p>
              <SubmissionsTable rows={SUBMISSIONS} onReview={setReviewing}/>
            </>
          )}

          {active === "requests" && (
            <>
              <h1 className="font-display text-[34px] font-semibold tracking-tight mb-1">Mentorship requests</h1>
              <p className="muted text-[14px] mb-7">Students who matched to your expertise have asked to work with you.</p>
              <RequestsSection requests={REQUESTS} states={requestStates}
                               onAccept={handleAccept} onReject={handleReject}/>
            </>
          )}

          {active === "messages" && (
            <PlaceholderPage title="Messages"
                             subtitle="Conversations with your mentees and other mentors. We're cleaning up the threading model before showing it here."
                             icon="msg"/>
          )}
        </main>
      </div>

      <ReviewSheet row={reviewing} onClose={()=>setReviewing(null)}/>
    </div>
  );
}

/* Sidebar with submission/request counts */
/* ─────────────────────────── SIDEBAR ─────────────────────────── */
function Sidebar({ active, setActive, navOverrides }) {
  // Patch NAV counts inline
  const navWithCounts = NAV.map(n => ({ ...n, count: navOverrides?.[n.id] ?? n.count, dot: n.id==="requests" && navOverrides?.requests>0 }));
  return (
    <aside className="hairline-r bg-surface flex flex-col" style={{width:264}}>
      <div className="px-5 pt-6 pb-3">
        <div className="font-mono text-[10px] tracking-[0.14em] muted">WORKSPACE</div>
      </div>
      <nav className="px-3 flex flex-col gap-0.5">
        {navWithCounts.map(n => {
          const Ico = I[n.icon];
          const isActive = active === n.id;
          return (
            <button key={n.id} onClick={()=>setActive(n.id)}
              className={`nav-item ${isActive?"active":""} group flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-medium text-left`}
              style={{color: isActive?"#fff":"var(--ink-2)"}}>
              <Ico width="18" height="18" className="ico shrink-0" />
              <span className="flex-1">{n.label}</span>
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
        <div className="font-mono text-[10px] tracking-[0.14em] muted">YOUR PRACTICE</div>
      </div>
      <div className="px-3 pb-4">
        <div className="hairline rounded-xl p-4 relative overflow-hidden" style={{background:"#FBFAF5"}}>
          <div className="absolute inset-0 stripe-soft opacity-60 pointer-events-none" />
          <div className="relative">
            <div className="text-[11px] font-mono muted">MENTOR · COHORT 25</div>
            <div className="text-[15px] font-semibold mt-0.5">Product Design Pathway</div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <div className="text-[10px] font-mono muted tracking-wide">RATING</div>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="font-display text-[18px] font-semibold">4.9</span>
                  <I.star width="11" height="11" className="text-[color:var(--warn)]"/>
                </div>
              </div>
              <div>
                <div className="text-[10px] font-mono muted tracking-wide">RESPONSE</div>
                <div className="font-display text-[18px] font-semibold mt-0.5">3.2<span className="text-[12px] muted ml-0.5">h</span></div>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <I.fire width="14" height="14" className="text-[color:var(--warn)]"/>
              <span className="text-[12px] ink-2"><b className="font-mono">28-day</b> review streak</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto px-3 pb-5">
        <div className="hairline rounded-xl px-3 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg grid place-items-center" style={{background:"var(--primary-soft)", color:"var(--primary)"}}>
            <I.cal width="18" height="18"/>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[12.5px] font-semibold leading-tight">Office hours open</div>
            <div className="text-[11px] muted">Thu 6PM · 4 slots free</div>
          </div>
          <I.arrow width="14" height="14" className="text-[color:var(--muted)]"/>
        </div>
      </div>
    </aside>
  );
}
/* ─────────────────────────── TWEAKS ─────────────────────────── */
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "mentorName": "Aanya Patel",
  "mentorTitle": "Sr. PD · Notion",
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
      <MentorDashboard tweaks={tweaks}/>
      <TweaksPanel title="Tweaks">
        <TweakSection label="Identity">
          <TweakText label="Mentor name" value={tweaks.mentorName} onChange={(v)=>setTweak("mentorName", v)}/>
          <TweakText label="Title" value={tweaks.mentorTitle} onChange={(v)=>setTweak("mentorTitle", v)}/>
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
