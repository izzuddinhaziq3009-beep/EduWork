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
  mail:    (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 7 9-7"/></svg>,
  lock:    (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V8a4 4 0 1 1 8 0v3"/></svg>,
  user:    (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/></svg>,
  eye:     (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>,
  eyeOff:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 3l18 18"/><path d="M10.6 6.2A10.4 10.4 0 0 1 12 6c6.5 0 10 6 10 6a17 17 0 0 1-3.3 4M6.6 6.6A17.7 17.7 0 0 0 2 12s3.5 6 10 6a10 10 0 0 0 5.2-1.4"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg>,
  chev:    (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M6 9l6 6 6-6"/></svg>,
  arrow:   (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M5 12h14M13 6l6 6-6 6"/></svg>,
  check:   (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M5 12.5l4.5 4.5L19 7"/></svg>,
  google:  (p) => (
    <svg viewBox="0 0 24 24" {...p}>
      <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3-3A10 10 0 0 0 2.5 8.8l3.5 2.7A6 6 0 0 1 12 5z"/>
      <path fill="#4285F4" d="M22 12c0-.8-.1-1.5-.3-2.3H12v4.5h5.6a4.8 4.8 0 0 1-2.1 3.1l3.3 2.6c2-1.8 3.2-4.5 3.2-7.9z"/>
      <path fill="#FBBC05" d="M6 13.5A6 6 0 0 1 5.7 12 6 6 0 0 1 6 10.5l-3.5-2.7A10 10 0 0 0 2 12c0 1.6.4 3.1 1 4.5l3-3z"/>
      <path fill="#34A853" d="M12 22c2.7 0 5-.9 6.7-2.4l-3.3-2.6c-.9.6-2.1 1-3.4 1a6 6 0 0 1-6-4.5l-3 3A10 10 0 0 0 12 22z"/>
    </svg>
  ),
  github:  (p) => <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.14-1.1-1.44-1.1-1.44-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.9.83.1-.65.35-1.08.63-1.33-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.9-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.86v2.76c0 .27.18.58.69.48A10 10 0 0 0 12 2z"/></svg>,
  spark:   (p) => <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z"/></svg>,
  shield:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 3l9 3v6c0 5-4 9-9 9s-9-4-9-9V6l9-3z"/><path d="M9 12l2 2 4-4"/></svg>,
  badge:   (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="9" r="5"/><path d="M9 13l-2 8 5-3 5 3-2-8"/></svg>,
  bldg:    (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="4" y="3" width="16" height="18" rx="1.5"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2"/></svg>,
  alert:   (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/></svg>,
};

const ROLES = [
  { id:"student", label:"Student",  icon:"badge", caption:"I want to learn and build", color:"var(--primary)" },
  { id:"mentor",  label:"Mentor",   icon:"user",  caption:"I want to guide students",  color:"var(--accent)"  },
  { id:"company", label:"Company",  icon:"bldg",  caption:"I want to post challenges", color:"var(--cta)"     },
];

/* ─────────────────────────── BRAND PANEL ─────────────────────────── */
function BrandPanel({ mode }) {
  return (
    <aside className="hero-bg relative h-full overflow-hidden text-white flex flex-col" style={{minHeight:"100vh"}}>
      {/* Decorative layers */}
      <div className="absolute inset-0 hero-grid opacity-50 pointer-events-none"/>
      <div className="absolute -right-24 -bottom-24 w-[420px] h-[420px] rounded-full hero-dots opacity-60 pointer-events-none"/>
      <div className="absolute -left-10 top-1/3 w-[300px] h-[300px] rounded-full pointer-events-none"
           style={{ background:"radial-gradient(circle, rgba(44,157,110,0.30), transparent 60%)" }}/>

      {/* Header */}
      <header className="relative px-12 pt-10 flex items-center gap-3">
        <svg viewBox="0 0 32 32" width="32" height="32" fill="none">
          <rect x="2" y="2" width="28" height="28" rx="7" fill="#FFFFFF"/>
          <path d="M9 20.5L16 9l7 11.5H17.5L16 18l-1.5 2.5H9z" fill="#0F4C5C"/>
          <circle cx="16" cy="22.5" r="1.5" fill="#0F4C5C"/>
        </svg>
        <span className="font-display text-[26px] font-semibold tracking-tight">Eduwork</span>
        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded ml-1" style={{background:"rgba(255,255,255,0.16)"}}>PLATFORM</span>
      </header>

      {/* Pitch */}
      <div className="relative px-12 mt-14 flex-1 flex flex-col justify-center max-w-[520px]">
        <div className="font-mono text-[11px] tracking-[0.18em] uppercase opacity-70">Student experience · platform</div>
        <h1 className="font-display text-[52px] leading-[1.05] font-semibold tracking-tight mt-3">
          A whole career,<br/>
          built in cohorts.
        </h1>
        <p className="text-[16px] opacity-85 leading-relaxed mt-5 max-w-[460px]">
          Eduwork connects learners with mentors and real industry challenges — so the work you submit while studying is the same work that gets you hired.
        </p>

        {/* Stat row */}
        <div className="mt-10 grid grid-cols-3 gap-6 max-w-[440px]">
          {[
            ["156", "Active learners"],
            ["24",  "Mentors"],
            ["8",   "Company partners"],
          ].map(([n,l],i)=>(
            <div key={i}>
              <div className="font-display text-[34px] font-semibold leading-none">{n}</div>
              <div className="text-[12px] opacity-75 mt-1.5">{l}</div>
            </div>
          ))}
        </div>

        {/* Testimonial */}
        <figure className="mt-10 rounded-2xl p-5 max-w-[460px]" style={{background:"rgba(255,255,255,0.08)", backdropFilter:"blur(4px)"}}>
          <blockquote className="text-[14px] leading-relaxed opacity-95">
            "I sent three Eduwork case studies into my Notion application. They were the reason I got the interview — and the reason I got the job."
          </blockquote>
          <figcaption className="flex items-center gap-3 mt-4">
            <div className="w-9 h-9 rounded-lg grid place-items-center font-mono text-[12px] font-semibold" style={{background:"#2C9D6E"}}>MR</div>
            <div className="text-[12.5px]">
              <div className="font-semibold">Maya Rodriguez</div>
              <div className="opacity-70 text-[11.5px]">Product Designer · Notion, cohort 24</div>
            </div>
          </figcaption>
        </figure>
      </div>

      {/* Footer */}
      <footer className="relative px-12 pb-8 flex items-center justify-between text-[11.5px] opacity-70 font-mono">
        <span>EDUWORK © 2026 · ALL RIGHTS RESERVED</span>
        <div className="flex items-center gap-4">
          <a className="hover:opacity-100 cursor-pointer">Privacy</a>
          <a className="hover:opacity-100 cursor-pointer">Terms</a>
          <a className="hover:opacity-100 cursor-pointer">Status</a>
        </div>
      </footer>
    </aside>
  );
}

/* ─────────────────────────── TABS ─────────────────────────── */
function Tabs({ mode, setMode }) {
  return (
    <div className="hairline rounded-xl p-1 flex bg-[#FBFAF5] w-fit">
      {[
        ["login",  "Log in"],
        ["signup", "Sign up"],
      ].map(([id,l])=>(
        <button key={id} onClick={()=>setMode(id)}
                className={"px-4 py-1.5 rounded-lg text-[13px] font-semibold transition " +
                  (mode===id ? "bg-white shadow-card ink" : "muted hover:text-[color:var(--ink)]")}>
          {l}
        </button>
      ))}
    </div>
  );
}

/* ─────────────────────────── FIELD ─────────────────────────── */
function Field({ icon:IconKey, label, type="text", value, onChange, placeholder, autoComplete, error, rightSlot, name }) {
  const Ico = IconKey ? I[IconKey] : null;
  return (
    <label className="block">
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-[12.5px] font-medium ink-2">{label}</span>
        {rightSlot}
      </div>
      <div className={"field hairline rounded-xl flex items-center gap-3 px-3.5 h-12 bg-[#FBFAF5] " + (error ? "border-[color:var(--rose)] bg-[var(--rose-soft)]" : "")}>
        {Ico && <Ico width="18" height="18" className="text-[color:var(--muted)] shrink-0"/>}
        <input type={type} name={name} value={value} onChange={(e)=>onChange(e.target.value)}
               placeholder={placeholder} autoComplete={autoComplete}
               className="bg-transparent outline-none flex-1 text-[14px] placeholder:text-[color:var(--muted)]"/>
      </div>
      {error && (
        <div className="mt-1.5 flex items-center gap-1.5 text-[12px]" style={{color:"var(--rose)"}}>
          <I.alert width="13" height="13"/>{error}
        </div>
      )}
    </label>
  );
}

function PasswordField({ label, value, onChange, error, name, hint, rightSlot, autoComplete="current-password" }) {
  const [show, setShow] = useState(false);
  return (
    <label className="block">
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-[12.5px] font-medium ink-2">{label}</span>
        {rightSlot}
      </div>
      <div className={"field hairline rounded-xl flex items-center gap-3 px-3.5 h-12 bg-[#FBFAF5] " + (error ? "border-[color:var(--rose)] bg-[var(--rose-soft)]" : "")}>
        <I.lock width="18" height="18" className="text-[color:var(--muted)] shrink-0"/>
        <input type={show?"text":"password"} name={name} value={value} onChange={(e)=>onChange(e.target.value)}
               placeholder={show ? "your-password" : "••••••••••"} autoComplete={autoComplete}
               className="bg-transparent outline-none flex-1 text-[14px] placeholder:text-[color:var(--muted)] font-mono tracking-wider"/>
        <button type="button" onClick={()=>setShow(s=>!s)}
                className="w-8 h-8 grid place-items-center rounded-lg hover:bg-[var(--hair-2)]"
                title={show ? "Hide password" : "Show password"}>
          {show ? <I.eyeOff width="16" height="16" className="text-[color:var(--ink-2)]"/> : <I.eye width="16" height="16" className="text-[color:var(--ink-2)]"/>}
        </button>
      </div>
      {error && (
        <div className="mt-1.5 flex items-center gap-1.5 text-[12px]" style={{color:"var(--rose)"}}>
          <I.alert width="13" height="13"/>{error}
        </div>
      )}
      {hint && !error && <div className="mt-1.5 text-[11.5px] muted">{hint}</div>}
    </label>
  );
}

/* ─────────────────────────── PASSWORD STRENGTH ─────────────────────────── */
function strength(pw) {
  if (!pw) return { level:0, label:"" };
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  const labels = ["Too short","Weak","Okay","Good","Strong"];
  return { level:s, label:labels[s] };
}

function StrengthBar({ pw }) {
  const { level, label } = strength(pw);
  const colors = ["var(--rose)","var(--rose)","var(--warn)","var(--accent)","var(--accent)"];
  return (
    <div>
      <div className="flex gap-1.5">
        {[1,2,3,4].map(i => (
          <span key={i} className="flex-1 h-1 rounded-full"
                style={{ background: i <= level ? colors[level] : "var(--hair-2)", transition:"background .2s" }}/>
        ))}
      </div>
      <div className="flex items-center justify-between mt-1.5 text-[11px]">
        <span className="muted">8+ characters with a number or symbol</span>
        <span className="font-mono font-medium" style={{color: level<=1?"var(--rose)":level<=2?"var(--warn)":"var(--accent)"}}>{label}</span>
      </div>
    </div>
  );
}

/* ─────────────────────────── ROLE PICKER ─────────────────────────── */
function RolePicker({ value, onChange }) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-[12.5px] font-medium ink-2">I'm signing up as</span>
        <span className="text-[11px] muted font-mono">required</span>
      </div>
      <div role="radiogroup" className="grid grid-cols-3 gap-2.5">
        {ROLES.map(r => {
          const on = value === r.id;
          const Ico = I[r.icon];
          return (
            <button key={r.id} type="button" role="radio" aria-checked={on}
                    onClick={()=>onChange(r.id)}
                    data-on={on}
                    className="role hairline rounded-xl px-3 py-3 text-left flex flex-col gap-2 bg-[#FBFAF5] hover:border-[color:var(--ink-2)]">
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-lg grid place-items-center role-ico"
                      style={{background: on ? "rgba(255,255,255,0.10)" : "var(--primary-soft)", color: on ? "#fff" : "var(--primary)"}}>
                  <Ico width="16" height="16"/>
                </span>
                <span className="w-4 h-4 rounded-full grid place-items-center hairline"
                      style={{ borderColor: on ? "#fff" : "var(--hair)", background: on ? "#fff" : "transparent" }}>
                  {on && <span className="w-2 h-2 rounded-full" style={{ background:"var(--ink)" }}/>}
                </span>
              </div>
              <div>
                <div className="text-[13.5px] font-semibold">{r.label}</div>
                <div className="text-[11px] opacity-70">{r.caption}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────────── LOGIN FORM ─────────────────────────── */
function LoginForm({ setMode }) {
  const [email, setEmail]     = useState("");
  const [password, setPwd]    = useState("");
  const [remember, setRem]    = useState(true);
  const [errors, setErrors]   = useState({});
  const [submitting, setSub]  = useState(false);
  const [done, setDone]       = useState(false);

  const submit = (e) => {
    e.preventDefault();
    const err = {};
    if (!email)                                 err.email = "Email is required.";
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) err.email = "That doesn't look like a valid email.";
    if (!password)                              err.password = "Enter your password.";
    setErrors(err);
    if (Object.keys(err).length) return;
    setSub(true);
    setTimeout(() => { setSub(false); setDone(true); }, 900);
  };

  if (done) return <SuccessCard title="You're in." sub={`Welcome back. Taking you to your dashboard…`} cta="Open dashboard" onClick={()=>setDone(false)}/>;

  return (
    <form onSubmit={submit} className="flex flex-col gap-5 slide-up">
      <header>
        <div className="font-mono text-[11px] tracking-[0.18em] uppercase muted mb-1.5">Log in to Eduwork</div>
        <h2 className="font-display text-[32px] font-semibold tracking-tight leading-tight">Welcome back.</h2>
        <p className="muted text-[14px] mt-1.5">Pick up where you left off — your cohort is two lessons ahead of you.</p>
      </header>

      <OAuthRow/>

      <Divider>or continue with email</Divider>

      <Field icon="mail" label="Email address" type="email" name="email"
             value={email} onChange={setEmail} placeholder="you@school.edu"
             autoComplete="email" error={errors.email}/>

      <PasswordField label="Password" name="password"
                     value={password} onChange={setPwd}
                     error={errors.password}
                     rightSlot={<a className="text-[12px] font-medium hover:underline" style={{color:"var(--primary)"}}>Forgot password?</a>}/>

      <div className="flex items-center justify-between -mt-1">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <span className="w-4 h-4 rounded-md hairline grid place-items-center"
                style={{ background: remember ? "var(--primary)" : "#fff", borderColor: remember ? "var(--primary)" : "var(--hair)" }}>
            {remember && <I.check width="12" height="12" style={{ color:"#fff" }}/>}
          </span>
          <input type="checkbox" checked={remember} onChange={(e)=>setRem(e.target.checked)} className="sr-only"/>
          <span className="text-[12.5px] ink-2">Keep me signed in for 30 days</span>
        </label>
      </div>

      <button type="submit" disabled={submitting}
              className="shadow-cta text-white font-semibold text-[14px] h-12 rounded-xl flex items-center justify-center gap-2 disabled:opacity-70"
              style={{background:"var(--cta)"}}>
        {submitting ? <Spinner/> : <>Log in <I.arrow width="16" height="16"/></>}
      </button>

      <p className="text-center text-[13px] muted">
        Don't have an account?{" "}
        <button type="button" onClick={()=>setMode("signup")}
                className="font-semibold hover:underline" style={{color:"var(--primary)"}}>
          Sign up — it's free
        </button>
      </p>

      <SecurityNote/>
    </form>
  );
}

/* ─────────────────────────── SIGNUP FORM ─────────────────────────── */
function SignupForm({ setMode }) {
  const [name, setName]       = useState("");
  const [email, setEmail]     = useState("");
  const [password, setPwd]    = useState("");
  const [role, setRole]       = useState("student");
  const [tos, setTos]         = useState(false);
  const [errors, setErrors]   = useState({});
  const [submitting, setSub]  = useState(false);
  const [done, setDone]       = useState(false);

  const submit = (e) => {
    e.preventDefault();
    const err = {};
    if (!name)                                                err.name = "Tell us your full name.";
    if (!email)                                               err.email = "Email is required.";
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))       err.email = "That email doesn't look right.";
    if (!password)                                            err.password = "Choose a password.";
    else if (strength(password).level < 2)                    err.password = "Try something stronger — mix in a number or symbol.";
    if (!tos)                                                 err.tos = "Please accept the terms to continue.";
    setErrors(err);
    if (Object.keys(err).length) return;
    setSub(true);
    setTimeout(() => { setSub(false); setDone(true); }, 1100);
  };

  if (done) {
    const r = ROLES.find(x=>x.id===role);
    return <SuccessCard title={`Account created.`}
                        sub={`Welcome, ${name.split(" ")[0]}. We set you up as a ${r.label.toLowerCase()} — check your inbox to verify ${email}.`}
                        cta="Continue to onboarding" onClick={()=>setDone(false)}/>;
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-5 slide-up">
      <header>
        <div className="font-mono text-[11px] tracking-[0.18em] uppercase muted mb-1.5">Join Eduwork</div>
        <h2 className="font-display text-[32px] font-semibold tracking-tight leading-tight">Create your account.</h2>
        <p className="muted text-[14px] mt-1.5">Three minutes to set up, then we'll match you to your cohort, your mentor, and your first challenge.</p>
      </header>

      <OAuthRow/>

      <Divider>or sign up with email</Divider>

      <Field icon="user" label="Full name" name="name"
             value={name} onChange={setName} placeholder="Maya Rodriguez"
             autoComplete="name" error={errors.name}/>

      <Field icon="mail" label="Email address" type="email" name="email"
             value={email} onChange={setEmail} placeholder="you@school.edu"
             autoComplete="email" error={errors.email}/>

      <PasswordField label="Password" name="password"
                     value={password} onChange={setPwd}
                     error={errors.password}
                     autoComplete="new-password"/>
      <StrengthBar pw={password}/>

      <RolePicker value={role} onChange={setRole}/>

      <div>
        <label className="flex items-start gap-2.5 cursor-pointer select-none">
          <span className="mt-0.5 w-4 h-4 rounded-md hairline grid place-items-center shrink-0"
                style={{ background: tos ? "var(--primary)" : "#fff", borderColor: tos ? "var(--primary)" : (errors.tos ? "var(--rose)" : "var(--hair)") }}>
            {tos && <I.check width="12" height="12" style={{ color:"#fff" }}/>}
          </span>
          <input type="checkbox" checked={tos} onChange={(e)=>setTos(e.target.checked)} className="sr-only"/>
          <span className="text-[12.5px] ink-2 leading-snug">
            I agree to Eduwork's <a className="font-medium underline">Terms of Service</a> and <a className="font-medium underline">Privacy Policy</a>. I understand my work may be shared with mentors and company partners.
          </span>
        </label>
        {errors.tos && (
          <div className="mt-1.5 flex items-center gap-1.5 text-[12px]" style={{color:"var(--rose)"}}>
            <I.alert width="13" height="13"/>{errors.tos}
          </div>
        )}
      </div>

      <button type="submit" disabled={submitting}
              className="shadow-cta text-white font-semibold text-[14px] h-12 rounded-xl flex items-center justify-center gap-2 disabled:opacity-70"
              style={{background:"var(--cta)"}}>
        {submitting ? <Spinner/> : <>Create my account <I.arrow width="16" height="16"/></>}
      </button>

      <p className="text-center text-[13px] muted">
        Already have an account?{" "}
        <button type="button" onClick={()=>setMode("login")}
                className="font-semibold hover:underline" style={{color:"var(--primary)"}}>
          Log in
        </button>
      </p>

      <SecurityNote/>
    </form>
  );
}

/* ─────────────────────────── SHARED PIECES ─────────────────────────── */
function OAuthRow() {
  return (
    <div className="grid grid-cols-2 gap-3">
      <button type="button" className="hairline rounded-xl h-12 flex items-center justify-center gap-2 text-[13.5px] font-semibold bg-surface hover:bg-[var(--hair-2)]">
        <I.google width="18" height="18"/>Continue with Google
      </button>
      <button type="button" className="hairline rounded-xl h-12 flex items-center justify-center gap-2 text-[13.5px] font-semibold bg-surface hover:bg-[var(--hair-2)]">
        <I.github width="18" height="18"/>Continue with GitHub
      </button>
    </div>
  );
}

function Divider({ children }) {
  return (
    <div className="flex items-center gap-3 text-[11.5px] font-mono uppercase tracking-widest muted">
      <span className="flex-1 h-px" style={{ background:"var(--hair)" }}/>
      <span>{children}</span>
      <span className="flex-1 h-px" style={{ background:"var(--hair)" }}/>
    </div>
  );
}

function SecurityNote() {
  return (
    <div className="hairline rounded-xl px-3.5 py-2.5 flex items-center gap-2.5" style={{background:"#FBFAF5"}}>
      <I.shield width="15" height="15" className="text-[color:var(--accent)]"/>
      <div className="text-[11.5px] ink-2">
        Protected by 2FA · SOC 2 Type II
        <span className="muted"> · We never sell your data</span>
      </div>
      <span className="ml-auto kbd hidden md:inline">⏎ to submit</span>
    </div>
  );
}

function Spinner() {
  return (
    <span className="inline-flex items-center gap-2">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="animate-spin">
        <circle cx="12" cy="12" r="9" stroke="rgba(255,255,255,0.3)" strokeWidth="2.5"/>
        <path d="M12 3a9 9 0 0 1 9 9" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
      Working…
    </span>
  );
}

function SuccessCard({ title, sub, cta, onClick }) {
  return (
    <div className="slide-up text-center flex flex-col items-center gap-3 py-6">
      <div className="w-16 h-16 rounded-full grid place-items-center check-pop" style={{ background:"var(--accent-soft)", color:"var(--accent)" }}>
        <I.check width="28" height="28"/>
      </div>
      <h2 className="font-display text-[28px] font-semibold tracking-tight">{title}</h2>
      <p className="muted text-[14px] max-w-md leading-relaxed">{sub}</p>
      <button onClick={onClick} className="mt-3 shadow-cta text-white font-semibold text-[13.5px] h-11 px-5 rounded-xl flex items-center gap-1.5"
              style={{ background:"var(--cta)" }}>
        {cta} <I.arrow width="14" height="14"/>
      </button>
    </div>
  );
}

/* ─────────────────────────── ROOT ─────────────────────────── */
function Auth() {
  const [mode, setMode] = useState("login");

  // keyboard: cmd+/ to toggle
  useEffect(() => {
    const h = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "/") {
        e.preventDefault();
        setMode(m => m === "login" ? "signup" : "login");
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  return (
    <div className="min-h-screen grid grid-cols-[1fr_minmax(640px,720px)]" style={{minHeight:"100vh"}}>
      <BrandPanel mode={mode}/>

      <main className="flex flex-col p-10 bg-[var(--bg)]" style={{minHeight:"100vh"}}>
        {/* Top bar */}
        <header className="flex items-center justify-between mb-12">
          <Tabs mode={mode} setMode={setMode}/>
          <div className="text-[12.5px] muted">
            Need help?{" "}
            <a className="font-medium underline ink-2 cursor-pointer">Contact support</a>
          </div>
        </header>

        {/* Card */}
        <div className="flex-1 flex items-start justify-center">
          <section className="bg-surface hairline rounded-3xl shadow-card w-full max-w-[520px] p-10">
            {mode === "login" ? <LoginForm setMode={setMode}/> : <SignupForm setMode={setMode}/>}
          </section>
        </div>

        <footer className="mt-6 text-center text-[11.5px] muted font-mono">
          <span>EDUWORK · STUDENT EXPERIENCE PLATFORM · v3.6</span>
          <span className="mx-2">·</span>
          <span>press ⌘+/ to toggle</span>
        </footer>
      </main>
    </div>
  );
}

/* ─────────────────────────── TWEAKS ─────────────────────────── */
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "layout": "split",
  "ctaColor": "#1E5BFF"
}/*EDITMODE-END*/;

function App() {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);

  useEffect(() => {
    document.documentElement.style.setProperty("--cta", tweaks.ctaColor);
  }, [tweaks.ctaColor]);

  if (tweaks.layout === "centered") {
    return (
      <>
        <CenteredAuth/>
        <TweaksPanel title="Tweaks"><TweaksContent tweaks={tweaks} setTweak={setTweak}/></TweaksPanel>
      </>
    );
  }
  return (
    <>
      <Auth/>
      <TweaksPanel title="Tweaks"><TweaksContent tweaks={tweaks} setTweak={setTweak}/></TweaksPanel>
    </>
  );
}

function TweaksContent({ tweaks, setTweak }) {
  return (
    <>
      <TweakSection label="Layout">
        <TweakRadio
          label="Style"
          value={tweaks.layout}
          onChange={(v)=>setTweak("layout", v)}
          options={[{value:"split", label:"Split"},{value:"centered", label:"Centered"}]}
        />
      </TweakSection>
      <TweakSection label="Theme">
        <TweakColor
          label="Primary button"
          value={tweaks.ctaColor}
          onChange={(v)=>setTweak("ctaColor", v)}
          options={["#1E5BFF","#0F4C5C","#2C9D6E","#7E4FB4","#C97A2D"]}
        />
      </TweakSection>
    </>
  );
}

/* Centered (no hero panel) variant */
function CenteredAuth() {
  const [mode, setMode] = useState("login");
  return (
    <div className="min-h-screen flex flex-col" style={{minHeight:"100vh"}}>
      <header className="flex items-center justify-between px-12 py-7">
        <a className="flex items-center gap-2.5 select-none" style={{color:"var(--primary)"}}>
          <I.logo width="28" height="28" />
          <span className="font-display text-[22px] font-semibold tracking-tight" style={{color:"var(--ink)"}}>Eduwork</span>
        </a>
        <Tabs mode={mode} setMode={setMode}/>
      </header>
      <main className="flex-1 grid place-items-center px-6 pb-12">
        <section className="bg-surface hairline rounded-3xl shadow-card w-full max-w-[520px] p-10">
          {mode === "login" ? <LoginForm setMode={setMode}/> : <SignupForm setMode={setMode}/>}
        </section>
      </main>
      <footer className="text-center text-[11.5px] muted font-mono pb-6">
        EDUWORK · STUDENT EXPERIENCE PLATFORM
      </footer>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
