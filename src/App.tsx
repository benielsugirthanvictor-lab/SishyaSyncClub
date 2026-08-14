import { useState } from "react";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────
type Role = "student" | "teacher";
type AssignmentType = "text" | "link";

interface Assignment {
  id: number;
  title: string;
  type: AssignmentType;
  content: string;
  subject: string;
  postedBy: string;
  postedAt: string;
  dueDate: string;
}

type Page = "assignments" | "students" | "schedule" | "notices" | "profile";

// ──────────────────────────────────────────────
// Seed data
// ──────────────────────────────────────────────
const SEED_ASSIGNMENTS: Assignment[] = [
  {
    id: 1,
    title: "Chapter 5 – Photosynthesis Summary",
    type: "text",
    content:
      "Read Chapter 5 of your Biology textbook and write a 300-word summary on the light-dependent reactions of photosynthesis. Include a diagram if possible.",
    subject: "Biology",
    postedBy: "Mrs. Priya Sharma",
    postedAt: "2026-08-12T09:30:00",
    dueDate: "2026-08-19",
  },
  {
    id: 2,
    title: "Algebra Problem Set – Quadratic Equations",
    type: "link",
    content: "https://classroom.google.com/c/abc123/a/xyz456/details",
    subject: "Mathematics",
    postedBy: "Mr. Arjun Nair",
    postedAt: "2026-08-13T11:00:00",
    dueDate: "2026-08-20",
  },
];

const TEACHER_CREDENTIALS = { email: "teacher@sishya.edu", password: "teach123" };
const STUDENT_CREDENTIALS = { email: "student@sishya.edu", password: "study123" };

const SUBJECT_COLORS: Record<string, string> = {
  Biology: "bg-emerald-100 text-emerald-800",
  Mathematics: "bg-violet-100 text-violet-800",
  Physics: "bg-orange-100 text-orange-800",
  Chemistry: "bg-rose-100 text-rose-800",
  History: "bg-amber-100 text-amber-800",
  English: "bg-sky-100 text-sky-800",
  General: "bg-slate-100 text-slate-700",
};

function subjectColor(subject: string) {
  return SUBJECT_COLORS[subject] ?? SUBJECT_COLORS["General"];
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const hrs = Math.floor(diff / 3600000);
  if (hrs < 1) return "just now";
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ──────────────────────────────────────────────
// Logo
// ──────────────────────────────────────────────
function Logo({ small }: { small?: boolean }) {
  return (
    <div className={`flex items-center gap-${small ? "2" : "3"}`}>
      <div
        className={`${small ? "w-8 h-8" : "w-10 h-10"} rounded-xl flex items-center justify-center`}
        style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #0ea5e9 100%)" }}
      >
        <svg
          width={small ? 16 : 20}
          height={small ? 16 : 20}
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
          <path d="M6 12v5c3 3 9 3 12 0v-5" />
        </svg>
      </div>
      <div>
        <p className={`font-display ${small ? "text-sm" : "text-base"} leading-tight text-[#1e3a5f]`}>
          Sishya Sync
        </p>
        <p className={`${small ? "text-[9px]" : "text-[10px]"} font-medium tracking-widest uppercase text-[#64748b]`}>
          Club
        </p>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// Login Page
// ──────────────────────────────────────────────
function LoginPage({ onLogin }: { onLogin: (role: Role) => void }) {
  const [mode, setMode] = useState<Role>("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const creds = mode === "teacher" ? TEACHER_CREDENTIALS : STUDENT_CREDENTIALS;
      if (email === creds.email && password === creds.password) {
        onLogin(mode);
      } else {
        setError("Invalid credentials. Please try again.");
      }
    }, 700);
  }

  return (
    <div className="min-h-screen flex" style={{ background: "var(--background)" }}>
      {/* Left panel */}
      <div
        className="hidden lg:flex lg:w-[45%] flex-col justify-between p-12"
        style={{
          background: "linear-gradient(160deg, #0f2344 0%, #1e3a5f 50%, #0c4a6e 100%)",
        }}
      >
        <Logo />
        <div>
          <h1 className="font-display text-5xl text-white leading-tight mb-4">
            Where learning<br />
            <span style={{ color: "#7dd3fc" }}>meets community.</span>
          </h1>
          <p className="text-slate-300 text-lg leading-relaxed max-w-sm">
            Assignments, notices, and schedules — all in one place for Sishya Sync Club members.
          </p>
        </div>
        <div className="flex gap-6">
          {["250+ Students", "18 Teachers", "4 Batches"].map((s) => (
            <div key={s}>
              <p className="text-white font-semibold text-lg">{s.split(" ")[0]}</p>
              <p className="text-slate-400 text-sm">{s.split(" ").slice(1).join(" ")}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8">
            <Logo />
          </div>

          <h2 className="font-display text-3xl text-[#0f172a] mb-1">Welcome back</h2>
          <p className="text-slate-500 mb-8">Sign in to your account to continue.</p>

          {/* Role toggle */}
          <div
            className="flex rounded-xl p-1 mb-6"
            style={{ background: "var(--secondary)" }}
          >
            {(["student", "teacher"] as Role[]).map((r) => (
              <button
                key={r}
                onClick={() => { setMode(r); setEmail(""); setPassword(""); setShowPassword(false); setError(""); }}
                className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200 capitalize"
                style={
                  mode === r
                    ? { background: "var(--primary)", color: "var(--primary-foreground)" }
                    : { background: "transparent", color: "var(--muted-foreground)" }
                }
              >
                {r === "student" ? " Student" : "📋 Teacher"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={mode === "teacher" ? "teacher@sishya.edu" : "student@sishya.edu"}
                className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all"
                style={{
                  border: "1px solid var(--border)",
                  background: "var(--card)",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-11 rounded-xl border text-sm outline-none transition-all"
                  style={{
                    border: "1px solid var(--border)",
                    background: "var(--card)",
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            {error && (
              <p className="text-sm text-rose-600 bg-rose-50 border border-rose-200 px-3 py-2 rounded-lg">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="mt-1 py-3 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2"
              style={{
                background: loading ? "#94a3b8" : "var(--primary)",
                color: "white",
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Signing in…
                </>
              ) : (
                `Sign in as ${mode === "teacher" ? "Teacher" : "Student"}`
              )}
            </button>
          </form>

          <p className="text-center text-xs text-slate-400 mt-6">
            Demo — student@sishya.edu / study123 &nbsp;·&nbsp; teacher@sishya.edu / teach123
          </p>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// Sidebar
// ──────────────────────────────────────────────
const TEACHER_NAV: { id: Page; label: string; icon: JSX.Element }[] = [
  {
    id: "assignments",
    label: "Assignments",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    id: "students",
    label: "Students",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    id: "schedule",
    label: "Schedule",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    id: "notices",
    label: "Notices",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
  },
  {
    id: "profile",
    label: "Profile",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

function Sidebar({
  role,
  activePage,
  onNavigate,
  onLogout,
  collapsed,
  onToggle,
}: {
  role: Role;
  activePage: Page;
  onNavigate: (p: Page) => void;
  onLogout: () => void;
  collapsed: boolean;
  onToggle: () => void;
}) {
  return (
    <aside
      className="flex flex-col h-screen sticky top-0 transition-all duration-300 shrink-0"
      style={{
        width: collapsed ? 64 : 220,
        background: "linear-gradient(180deg, #0f2344 0%, #1e3a5f 100%)",
        borderRight: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-white/10">
        {!collapsed && <Logo small />}
        <button
          onClick={onToggle}
          className="ml-auto w-7 h-7 flex items-center justify-center rounded-lg text-slate-300 hover:bg-white/10 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {collapsed ? (
              <><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></>
            ) : (
              <><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></>
            )}
          </svg>
        </button>
      </div>

      {/* Role badge */}
      {!collapsed && (
        <div className="px-4 py-3">
          <span
            className="text-[10px] font-semibold tracking-widest uppercase px-2 py-1 rounded-md"
            style={{ background: "rgba(14,165,233,0.2)", color: "#7dd3fc" }}
          >
            {role === "teacher" ? "Teacher Portal" : "Student Portal"}
          </span>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-2 py-2 flex flex-col gap-1 overflow-y-auto">
        {TEACHER_NAV.map((item) => {
          const active = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 text-left w-full"
              style={{
                background: active ? "rgba(14,165,233,0.2)" : "transparent",
                color: active ? "#7dd3fc" : "rgba(255,255,255,0.55)",
              }}
              onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.06)";
              }}
              onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.background = "transparent";
              }}
            >
              <span className="shrink-0">{item.icon}</span>
              {!collapsed && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-white/10">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full transition-colors text-rose-300 hover:bg-rose-500/20"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          {!collapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  );
}

// ──────────────────────────────────────────────
// Assignment Card
// ──────────────────────────────────────────────
function AssignmentCard({ a, canDelete, onDelete }: { a: Assignment; canDelete?: boolean; onDelete?: (id: number) => void }) {
  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-3 transition-shadow hover:shadow-md"
      style={{ background: "var(--card)", border: "1px solid var(--border)" }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${subjectColor(a.subject)}`}>
              {a.subject}
            </span>
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-full"
              style={
                a.type === "link"
                  ? { background: "#e0f2fe", color: "#0369a1" }
                  : { background: "#f0fdf4", color: "#166534" }
              }
            >
              {a.type === "link" ? "🔗 Link" : "📝 Text"}
            </span>
          </div>
          <h3 className="font-semibold text-[#0f172a] text-base leading-snug">{a.title}</h3>
        </div>
        {canDelete && (
          <button
            onClick={() => onDelete?.(a.id)}
            className="text-slate-400 hover:text-rose-500 transition-colors shrink-0"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
            </svg>
          </button>
        )}
      </div>

      {a.type === "text" ? (
        <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">{a.content}</p>
      ) : (
        <a
          href={a.content}
          target="_blank"
          rel="noreferrer"
          className="text-sm font-medium flex items-center gap-1.5 truncate"
          style={{ color: "var(--accent)" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
          </svg>
          {a.content}
        </a>
      )}

      <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t" style={{ borderColor: "var(--border)" }}>
        <span>By {a.postedBy}</span>
        <span>Due {formatDate(a.dueDate)} · {timeAgo(a.postedAt)}</span>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// Post Assignment Form (Teacher)
// ──────────────────────────────────────────────
function PostForm({ onPost }: { onPost: (a: Assignment) => void }) {
  const [type, setType] = useState<AssignmentType>("text");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [subject, setSubject] = useState("General");
  const [dueDate, setDueDate] = useState("");
  const [success, setSuccess] = useState(false);

  const subjects = ["General", "Biology", "Mathematics", "Physics", "Chemistry", "History", "English"];

  function handlePost(e: React.FormEvent) {
    e.preventDefault();
    const newAssignment: Assignment = {
      id: Date.now(),
      title,
      type,
      content,
      subject,
      postedBy: "Mrs. Priya Sharma",
      postedAt: new Date().toISOString(),
      dueDate,
    };
    onPost(newAssignment);
    setTitle("");
    setContent("");
    setDueDate("");
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  }

  return (
    <div className="rounded-2xl p-6" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
      <h2 className="font-display text-xl text-[#1e3a5f] mb-5">Post New Assignment</h2>
      <form onSubmit={handlePost} className="flex flex-col gap-4">
        {/* Type toggle */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Assignment Type</label>
          <div className="flex gap-2">
            {(["text", "link"] as AssignmentType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                style={
                  type === t
                    ? { background: "var(--primary)", color: "white" }
                    : { background: "var(--secondary)", color: "var(--secondary-foreground)" }
                }
              >
                {t === "text" ? "📝 Textual" : "🔗 Link"}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Title</label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Assignment title…"
              className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all"
              style={{ border: "1px solid var(--border)", background: "var(--background)" }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Subject</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
              style={{ border: "1px solid var(--border)", background: "var(--background)" }}
            >
              {subjects.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Due Date</label>
            <input
              required
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
              style={{ border: "1px solid var(--border)", background: "var(--background)" }}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
            {type === "link" ? "Assignment Link (URL)" : "Assignment Description"}
          </label>
          {type === "text" ? (
            <textarea
              required
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Describe the assignment in detail…"
              className="w-full px-4 py-3 rounded-xl border text-sm outline-none resize-none transition-all"
              style={{ border: "1px solid var(--border)", background: "var(--background)" }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
            />
          ) : (
            <input
              required
              type="url"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="https://…"
              className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all"
              style={{ border: "1px solid var(--border)", background: "var(--background)" }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
            />
          )}
        </div>

        <div className="flex items-center gap-4 mt-1">
          <button
            type="submit"
            className="px-6 py-3 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90 flex items-center gap-2"
            style={{ background: "var(--primary)" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
            Post Assignment
          </button>

          {success && (
            <span className="text-sm font-medium text-emerald-600 flex items-center gap-1.5">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Posted successfully!
            </span>
          )}
        </div>
      </form>
    </div>
  );
}

// ──────────────────────────────────────────────
// Placeholder pages
// ──────────────────────────────────────────────
function PlaceholderPage({ title, icon }: { title: string; icon: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] gap-4 text-slate-400">
      <span className="text-5xl">{icon}</span>
      <p className="font-semibold text-lg text-slate-500">{title}</p>
      <p className="text-sm">This section is coming soon.</p>
    </div>
  );
}

// ──────────────────────────────────────────────
// Teacher Dashboard
// ──────────────────────────────────────────────
function TeacherDashboard({ assignments, onPost, onDelete, onLogout }: {
  assignments: Assignment[];
  onPost: (a: Assignment) => void;
  onDelete: (id: number) => void;
  onLogout: () => void;
}) {
  const [page, setPage] = useState<Page>("assignments");
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--background)" }}>
      <Sidebar
        role="teacher"
        activePage={page}
        onNavigate={setPage}
        onLogout={onLogout}
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
      />

      <main className="flex-1 overflow-y-auto">
        {/* Topbar */}
        <div
          className="sticky top-0 z-10 px-6 py-4 flex items-center justify-between"
          style={{ background: "var(--background)", borderBottom: "1px solid var(--border)" }}
        >
          <div>
            <h1 className="font-display text-xl text-[#1e3a5f]">
              {TEACHER_NAV.find((n) => n.id === page)?.label}
            </h1>
            <p className="text-xs text-slate-400">
              {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-[#0f172a]">Mrs. Priya Sharma</p>
              <p className="text-xs text-slate-400">Biology · Sishya Sync Club</p>
            </div>
            <div className="w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm text-white" style={{ background: "var(--primary)" }}>
              PS
            </div>
          </div>
        </div>

        <div className="p-6">
          {page === "assignments" && (
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6">
              {/* Left: posted assignments */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-[#0f172a]">
                    Posted Assignments
                    <span className="ml-2 text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                      {assignments.length}
                    </span>
                  </h2>
                </div>
                {assignments.length === 0 ? (
                  <div className="rounded-2xl p-10 text-center text-slate-400" style={{ border: "2px dashed var(--border)" }}>
                    No assignments posted yet.
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {assignments.map((a) => (
                      <AssignmentCard key={a.id} a={a} canDelete onDelete={onDelete} />
                    ))}
                  </div>
                )}
              </div>
              {/* Right: post form */}
              <div>
                <PostForm onPost={onPost} />
              </div>
            </div>
          )}
          {page === "students" && <PlaceholderPage title="Students" icon="👥" />}
          {page === "schedule" && <PlaceholderPage title="Schedule" icon="📅" />}
          {page === "notices" && <PlaceholderPage title="Notices" icon="🔔" />}
          {page === "profile" && <PlaceholderPage title="Profile" icon="👤" />}
        </div>
      </main>
    </div>
  );
}

// ──────────────────────────────────────────────
// Student Dashboard
// ──────────────────────────────────────────────
function StudentDashboard({ assignments, onLogout }: {
  assignments: Assignment[];
  onLogout: () => void;
}) {
  const [page, setPage] = useState<Page>("assignments");
  const [collapsed, setCollapsed] = useState(false);
  const [filter, setFilter] = useState("All");

  const subjects = ["All", ...Array.from(new Set(assignments.map((a) => a.subject)))];
  const filtered = filter === "All" ? assignments : assignments.filter((a) => a.subject === filter);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--background)" }}>
      <Sidebar
        role="student"
        activePage={page}
        onNavigate={setPage}
        onLogout={onLogout}
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
      />

      <main className="flex-1 overflow-y-auto">
        {/* Topbar */}
        <div
          className="sticky top-0 z-10 px-6 py-4 flex items-center justify-between"
          style={{ background: "var(--background)", borderBottom: "1px solid var(--border)" }}
        >
          <div>
            <h1 className="font-display text-xl text-[#1e3a5f]">
              {TEACHER_NAV.find((n) => n.id === page)?.label}
            </h1>
            <p className="text-xs text-slate-400">
              {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-[#0f172a]">Aditya Rajan</p>
              <p className="text-xs text-slate-400">Grade 10-B · Roll No. 24</p>
            </div>
            <div className="w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm text-white" style={{ background: "#0ea5e9" }}>
              AR
            </div>
          </div>
        </div>

        <div className="p-6">
          {page === "assignments" && (
            <div>
              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {[
                  { label: "Total", value: assignments.length, color: "#1e3a5f" },
                  { label: "This Week", value: assignments.filter((a) => {
                    const d = new Date(a.postedAt);
                    return Date.now() - d.getTime() < 7 * 86400000;
                  }).length, color: "#0ea5e9" },
                  { label: "Link Type", value: assignments.filter((a) => a.type === "link").length, color: "#7c3aed" },
                  { label: "Text Type", value: assignments.filter((a) => a.type === "text").length, color: "#059669" },
                ].map((s) => (
                  <div key={s.label} className="rounded-2xl px-4 py-3" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                    <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
                    <p className="text-xs text-slate-500 font-medium">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Subject filter */}
              <div className="flex gap-2 flex-wrap mb-5">
                {subjects.map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilter(s)}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                    style={
                      filter === s
                        ? { background: "var(--primary)", color: "white" }
                        : { background: "var(--secondary)", color: "var(--secondary-foreground)" }
                    }
                  >
                    {s}
                  </button>
                ))}
              </div>

              {filtered.length === 0 ? (
                <div className="rounded-2xl p-10 text-center text-slate-400" style={{ border: "2px dashed var(--border)" }}>
                  No assignments in this subject yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {filtered.map((a) => (
                    <AssignmentCard key={a.id} a={a} />
                  ))}
                </div>
              )}
            </div>
          )}
          {page === "students" && <PlaceholderPage title="Classmates" icon="👥" />}
          {page === "schedule" && <PlaceholderPage title="Schedule" icon="📅" />}
          {page === "notices" && <PlaceholderPage title="Notices" icon="🔔" />}
          {page === "profile" && <PlaceholderPage title="Profile" icon="👤" />}
        </div>
      </main>
    </div>
  );
}

// ──────────────────────────────────────────────
// Root
// ──────────────────────────────────────────────
export default function App() {
  const [role, setRole] = useState<Role | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>(SEED_ASSIGNMENTS);

  function handlePost(a: Assignment) {
    setAssignments((prev) => [a, ...prev]);
  }

  function handleDelete(id: number) {
    setAssignments((prev) => prev.filter((a) => a.id !== id));
  }

  if (!role) {
    return <LoginPage onLogin={setRole} />;
  }

  if (role === "teacher") {
    return (
      <TeacherDashboard
        assignments={assignments}
        onPost={handlePost}
        onDelete={handleDelete}
        onLogout={() => setRole(null)}
      />
    );
  }

  return (
    <StudentDashboard
      assignments={assignments}
      onLogout={() => setRole(null)}
    />
  );
}
