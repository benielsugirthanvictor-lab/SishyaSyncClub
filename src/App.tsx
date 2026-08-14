import { useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { auth, firebaseConfigured } from "./lib/firebase";
import {
  addAssignment,
  createStudentAccount,
  deleteAssignment,
  deleteStudent,
  getUserProfile,
  resolveLoginIdentifier,
  STUDENT_TYPES,
  watchAssignments,
  watchStudents,
  type Assignment,
  type Role,
  type Student,
  type StudentType,
  type UserProfile,
} from "./lib/db";

type Page = "assignments" | "students" | "schedule" | "notices" | "profile";

const STUDENT_TYPE_BADGES: Record<StudentType, string> = {
  Intermediate: "bg-sky-100 text-sky-800",
  Junior: "bg-amber-100 text-amber-800",
  Senior: "bg-emerald-100 text-emerald-800",
};

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

function authErrorMessage(err: unknown): string {
  const code = (err as { code?: string })?.code ?? "";
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Invalid email or password.";
    case "auth/email-already-in-use":
      return "An account with this email already exists. Sign in instead.";
    case "auth/weak-password":
      return "Password should be at least 6 characters.";
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";
    case "auth/too-many-requests":
      return "Too many attempts. Please try again later.";
    default:
      return (err as { message?: string })?.message ?? "Something went wrong. Please try again.";
  }
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
// Login / Sign-up Page
// ──────────────────────────────────────────────
function LoginPage() {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!auth) return;
    setError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, resolveLoginIdentifier(login), password);
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setLoading(false);
    }
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
          <p className="text-slate-500 mb-8">Sign in to continue to your portal.</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Username or Email</label>
              <input
                required
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                placeholder="username or you@email.com"
                className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all"
                style={{ border: "1px solid var(--border)", background: "var(--card)" }}
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
                  style={{ border: "1px solid var(--border)", background: "var(--card)" }}
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
                "Sign in"
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Accounts are created by your teacher or administrator.
          </p>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// Sidebar
// ──────────────────────────────────────────────
const NAV_ITEMS: { id: Page; label: string; icon: React.ReactElement }[] = [
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
  onAddStudent,
}: {
  role: Role;
  activePage: Page;
  onNavigate: (p: Page) => void;
  onLogout: () => void;
  collapsed: boolean;
  onToggle: () => void;
  onAddStudent?: () => void;
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
        {NAV_ITEMS.map((item) => {
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

        {/* Add Student (teacher only) */}
        {role === "teacher" && onAddStudent && (
          <button
            onClick={onAddStudent}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl mt-2 text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #0ea5e9, #1e3a5f)" }}
          >
            <span className="shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </span>
            {!collapsed && <span>Add Student</span>}
          </button>
        )}
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
function AssignmentCard({ a, canDelete, onDelete }: { a: Assignment; canDelete?: boolean; onDelete?: (id: string) => void }) {
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
function PostForm({ onPost, postedBy }: { onPost: (a: Omit<Assignment, "id">) => void; postedBy: string }) {
  const [type, setType] = useState<"text" | "link">("text");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [subject, setSubject] = useState("General");
  const [dueDate, setDueDate] = useState("");
  const [success, setSuccess] = useState(false);

  const subjects = ["General", "Biology", "Mathematics", "Physics", "Chemistry", "History", "English"];

  function handlePost(e: React.FormEvent) {
    e.preventDefault();
    onPost({
      title,
      type,
      content,
      subject,
      postedBy,
      postedAt: new Date().toISOString(),
      dueDate,
    });
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
            {(["text", "link"] as ("text" | "link")[]).map((t) => (
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
// Add Student Modal
// ──────────────────────────────────────────────
function AddStudentModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (data: { rollNo: string; name: string; type: StudentType; username: string; password: string }) => Promise<void>;
}) {
  const [rollNo, setRollNo] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [type, setType] = useState<StudentType>("Intermediate");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!rollNo.trim() || !name.trim() || !username.trim() || !password) {
      setError("All fields are required.");
      return;
    }
    if (!/^[a-zA-Z0-9._-]+$/.test(username.trim())) {
      setError("Username can only contain letters, numbers, dots, dashes, and underscores.");
      return;
    }
    if (password.length < 6) {
      setError("Password should be at least 6 characters.");
      return;
    }
    setBusy(true);
    try {
      await onAdd({ rollNo: rollNo.trim(), name: name.trim(), type, username: username.trim(), password });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the student. Please try again.");
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.5)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl p-6"
        style={{ background: "var(--card)", border: "1px solid var(--border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-xl text-[#1e3a5f]">Add Student</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Student name"
              className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all"
              style={{ border: "1px solid var(--border)", background: "var(--background)" }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Roll Number</label>
            <input
              required
              value={rollNo}
              onChange={(e) => setRollNo(e.target.value)}
              placeholder="e.g. 24"
              className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all"
              style={{ border: "1px solid var(--border)", background: "var(--background)" }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
            <input
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. sarah.k"
              className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all"
              style={{ border: "1px solid var(--border)", background: "var(--background)" }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
            />
            <p className="text-xs text-slate-400 mt-1">Students sign in with this username or {username.trim() || "user"}@sishya.edu</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all"
              style={{ border: "1px solid var(--border)", background: "var(--background)" }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
            <div className="flex gap-2">
              {STUDENT_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all"
                  style={
                    type === t
                      ? { background: "var(--primary)", color: "white" }
                      : { background: "var(--secondary)", color: "var(--secondary-foreground)" }
                  }
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-sm text-rose-600 bg-rose-50 border border-rose-200 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          <div className="flex gap-3 mt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl font-semibold text-sm transition-colors"
              style={{ background: "var(--secondary)", color: "var(--secondary-foreground)" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="flex-1 py-3 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90 flex items-center justify-center gap-2"
              style={{ background: busy ? "#94a3b8" : "var(--primary)", cursor: busy ? "not-allowed" : "pointer" }}
            >
              {busy ? "Saving…" : "Add Student"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// Students Page (Teacher)
// ──────────────────────────────────────────────
function StudentsPage({
  students,
  onAddStudent,
  onDeleteStudent,
}: {
  students: Student[];
  onAddStudent: () => void;
  onDeleteStudent: (id: string, uid?: string) => void;
}) {
  const [filter, setFilter] = useState<"All" | StudentType>("All");
  const filtered = filter === "All" ? students : students.filter((s) => s.type === filter);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-[#0f172a]">
          All Students
          <span className="ml-2 text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
            {students.length}
          </span>
        </h2>
        <button
          onClick={onAddStudent}
          className="px-4 py-2 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90 flex items-center gap-2"
          style={{ background: "var(--primary)" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Student
        </button>
      </div>

      <div className="flex gap-2 flex-wrap mb-5">
        {(["All", ...STUDENT_TYPES] as ("All" | StudentType)[]).map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
            style={
              filter === t
                ? { background: "var(--primary)", color: "white" }
                : { background: "var(--secondary)", color: "var(--secondary-foreground)" }
            }
          >
            {t}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl p-10 text-center text-slate-400" style={{ border: "2px dashed var(--border)" }}>
          {filter === "All" ? "No students yet. Click “Add Student” to get started." : `No ${filter} students yet.`}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((s) => (
            <div
              key={s.id}
              className="rounded-2xl p-4 flex items-center gap-4"
              style={{ background: "var(--card)", border: "1px solid var(--border)" }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm text-white shrink-0"
                style={{ background: "var(--primary)" }}
              >
                {initials(s.name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[#0f172a] truncate">{s.name}</p>
                <p className="text-xs text-slate-400">
                  Roll No. {s.rollNo}
                  {s.username ? <span className="text-slate-500"> · @{s.username}</span> : null}
                </p>
              </div>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STUDENT_TYPE_BADGES[s.type]}`}>
                {s.type}
              </span>
              <button
                onClick={() => onDeleteStudent(s.id, s.uid)}
                className="text-slate-400 hover:text-rose-500 transition-colors shrink-0"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
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
function TeacherDashboard({
  user,
  assignments,
  students,
  onPost,
  onDeleteAssignment,
  onDeleteStudent,
  onLogout,
}: {
  user: UserProfile;
  assignments: Assignment[];
  students: Student[];
  onPost: (a: Omit<Assignment, "id">) => void;
  onDeleteAssignment: (id: string) => void;
  onDeleteStudent: (id: string, uid?: string) => void;
  onLogout: () => void;
}) {
  const [page, setPage] = useState<Page>("assignments");
  const [collapsed, setCollapsed] = useState(false);
  const [showAddStudent, setShowAddStudent] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--background)" }}>
      <Sidebar
        role="teacher"
        activePage={page}
        onNavigate={setPage}
        onLogout={onLogout}
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
        onAddStudent={() => setShowAddStudent(true)}
      />

      <main className="flex-1 overflow-y-auto">
        {/* Topbar */}
        <div
          className="sticky top-0 z-10 px-6 py-4 flex items-center justify-between"
          style={{ background: "var(--background)", borderBottom: "1px solid var(--border)" }}
        >
          <div>
            <h1 className="font-display text-xl text-[#1e3a5f]">
              {NAV_ITEMS.find((n) => n.id === page)?.label}
            </h1>
            <p className="text-xs text-slate-400">
              {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-[#0f172a]">{user.name}</p>
              <p className="text-xs text-slate-400">Teacher · Sishya Sync Club</p>
            </div>
            <div className="w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm text-white" style={{ background: "var(--primary)" }}>
              {initials(user.name) || "T"}
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
                      <AssignmentCard key={a.id} a={a} canDelete onDelete={onDeleteAssignment} />
                    ))}
                  </div>
                )}
              </div>
              {/* Right: post form */}
              <div>
                <PostForm onPost={onPost} postedBy={user.name} />
              </div>
            </div>
          )}
          {page === "students" && (
            <StudentsPage
              students={students}
              onAddStudent={() => setShowAddStudent(true)}
              onDeleteStudent={onDeleteStudent}
            />
          )}
          {page === "schedule" && <PlaceholderPage title="Schedule" icon="📅" />}
          {page === "notices" && <PlaceholderPage title="Notices" icon="🔔" />}
          {page === "profile" && <PlaceholderPage title="Profile" icon="👤" />}
        </div>
      </main>

      {showAddStudent && <AddStudentModal onClose={() => setShowAddStudent(false)} onAdd={createStudentAccount} />}
    </div>
  );
}

// ──────────────────────────────────────────────
// Student Dashboard
// ──────────────────────────────────────────────
function StudentDashboard({ user, assignments, onLogout }: {
  user: UserProfile;
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
              {NAV_ITEMS.find((n) => n.id === page)?.label}
            </h1>
            <p className="text-xs text-slate-400">
              {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-[#0f172a]">{user.name}</p>
              <p className="text-xs text-slate-400">Student · Sishya Sync Club</p>
            </div>
            <div className="w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm text-white" style={{ background: "#0ea5e9" }}>
              {initials(user.name) || "S"}
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
// Loading / Setup screens
// ──────────────────────────────────────────────
function LoadingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--background)" }}>
      <svg className="animate-spin w-8 h-8" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="#1e3a5f" d="M4 12a8 8 0 018-8v8z" />
      </svg>
    </div>
  );
}

function SetupNeededPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8 text-center" style={{ background: "var(--background)" }}>
      <span className="text-5xl">🔥</span>
      <h1 className="font-display text-2xl text-[#1e3a5f]">Firebase isn't configured yet</h1>
      <p className="text-sm text-slate-500 max-w-md">
        Create a Firebase project, enable Firestore + Email/Password auth, add a web app, and set the{" "}
        <code className="px-1 py-0.5 rounded bg-slate-100 text-slate-700">VITE_FIREBASE_*</code> environment
        variables, then redeploy.
      </p>
    </div>
  );
}

function RoleMissingPage({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8 text-center" style={{ background: "var(--background)" }}>
      <span className="text-5xl">🤔</span>
      <h1 className="font-display text-2xl text-[#1e3a5f]">Account not configured</h1>
      <p className="text-sm text-slate-500 max-w-md">
        Your account has no portal role yet. Please contact your teacher or administrator.
      </p>
      <button
        onClick={onLogout}
        className="px-6 py-3 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90"
        style={{ background: "var(--primary)" }}
      >
        Sign out
      </button>
    </div>
  );
}

// ──────────────────────────────────────────────
// Subject colors
// ──────────────────────────────────────────────
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

// ──────────────────────────────────────────────
// Root
// ──────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [roleLoading, setRoleLoading] = useState(false);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    if (!auth) return;
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthReady(true);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }
    let active = true;
    setRoleLoading(true);
    getUserProfile(user.uid)
      .then((p) => {
        if (!active) return;
        setProfile(p);
        setRoleLoading(false);
      })
      .catch(() => {
        if (active) setRoleLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user]);

  useEffect(() => {
    if (!profile) return;
    const unsubStudents = watchStudents(setStudents);
    const unsubAssignments = watchAssignments(setAssignments);
    return () => {
      unsubStudents();
      unsubAssignments();
    };
  }, [profile]);

  async function handlePost(a: Omit<Assignment, "id">) {
    try {
      await addAssignment(a);
    } catch (err) {
      console.error(err);
      alert("Could not post the assignment. Please try again.");
    }
  }

  async function handleDeleteAssignment(id: string) {
    try {
      await deleteAssignment(id);
    } catch (err) {
      console.error(err);
      alert("Could not delete the assignment. Please try again.");
    }
  }

  async function handleDeleteStudent(id: string, uid?: string) {
    try {
      await deleteStudent(id, uid);
    } catch (err) {
      console.error(err);
      alert("Could not delete the student. Please try again.");
    }
  }

  async function handleLogout() {
    if (auth) await signOut(auth);
  }

  if (!firebaseConfigured) {
    return <SetupNeededPage />;
  }

  if (!authReady || roleLoading) {
    return <LoadingPage />;
  }

  if (!user) {
    return <LoginPage />;
  }

  if (!profile) {
    return <RoleMissingPage onLogout={handleLogout} />;
  }

  if (profile.role === "teacher") {
    return (
      <TeacherDashboard
        user={profile}
        assignments={assignments}
        students={students}
        onPost={handlePost}
        onDeleteAssignment={handleDeleteAssignment}
        onDeleteStudent={handleDeleteStudent}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <StudentDashboard
      user={profile}
      assignments={assignments}
      onLogout={handleLogout}
    />
  );
}
