import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  type Firestore,
} from "firebase/firestore";
import { db, firebaseApiKey } from "./firebase";

export type Role = "teacher" | "student";
export type StudentType = "Intermediate" | "Junior" | "Senior";
export type AssignmentType = "text" | "link";

export const STUDENT_EMAIL_DOMAIN = "sishya.edu";

export interface Student {
  id: string;
  rollNo: string;
  name: string;
  type: StudentType;
  username?: string;
  email?: string;
  uid?: string;
}

export interface Assignment {
  id: string;
  title: string;
  type: AssignmentType;
  content: string;
  subject: string;
  postedBy: string;
  postedAt: string;
  dueDate: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  postedBy: string;
  postedAt: string;
  status: "draft" | "published";
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: Role;
}

export const STUDENT_TYPES: StudentType[] = ["Intermediate", "Junior", "Senior"];

export const TEACHER_SIGNUP_CODE = "TEACHER2026";

export function resolveLoginIdentifier(input: string): string {
  const value = input.trim();
  if (value.includes("@")) return value;
  return `${value}@${STUDENT_EMAIL_DOMAIN}`;
}

export function studentEmailFromUsername(username: string): string {
  return `${username.trim()}@${STUDENT_EMAIL_DOMAIN}`;
}

function requireDb(): Firestore {
  if (!db) throw new Error("Firebase is not configured. Set VITE_FIREBASE_* environment variables.");
  return db;
}

// ──────────────────────────────────────────────
// Users
// ──────────────────────────────────────────────
export async function createUserProfile(profile: Omit<UserProfile, "uid"> & { uid: string }): Promise<void> {
  const firestore = requireDb();
  await setDoc(doc(firestore, "users", profile.uid), {
    name: profile.name,
    email: profile.email,
    role: profile.role,
    createdAt: serverTimestamp(),
  });
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const firestore = requireDb();
  const snap = await getDoc(doc(firestore, "users", uid));
  if (!snap.exists()) return null;
  const data = snap.data() as { name?: string; email?: string; role?: Role };
  return { uid, name: data.name ?? "", email: data.email ?? "", role: data.role ?? "student" };
}

// ──────────────────────────────────────────────
// Students
// ──────────────────────────────────────────────
export function watchStudents(onChange: (students: Student[]) => void): () => void {
  const firestore = requireDb();
  const q = query(collection(firestore, "students"), orderBy("createdAt", "asc"));
  return onSnapshot(q, (snap) => {
    onChange(
      snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          rollNo: data.rollNo ?? "",
          name: data.name ?? "",
          type: (data.type as StudentType) ?? "Intermediate",
          username: data.username ?? "",
          email: data.email ?? "",
          uid: data.uid ?? "",
        };
      }),
    );
  });
}

export type StudentInput = {
  rollNo: string;
  name: string;
  type: StudentType;
  username?: string;
  email?: string;
  uid?: string;
};

export async function addStudent(data: StudentInput): Promise<void> {
  const firestore = requireDb();
  await addDoc(collection(firestore, "students"), { ...data, createdAt: serverTimestamp() });
}

export async function deleteStudent(id: string, uid?: string): Promise<void> {
  const firestore = requireDb();
  const tasks: Promise<unknown>[] = [deleteDoc(doc(firestore, "students", id))];
  if (uid) {
    tasks.push(deleteDoc(doc(firestore, "users", uid)).catch(() => undefined));
  }
  await Promise.all(tasks);
}

// Creates the student's login account via the Auth REST API (without changing
// the teacher's current SDK session), then provisions their profile + record.
export async function createStudentAccount(data: {
  rollNo: string;
  name: string;
  type: StudentType;
  username: string;
  password: string;
}): Promise<void> {
  if (!firebaseApiKey) throw new Error("Firebase is not configured.");
  const username = data.username.trim();
  const email = studentEmailFromUsername(username);
  const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${firebaseApiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: data.password, returnSecureToken: true }),
  });
  const payload = (await res.json()) as { localId?: string; error?: { message?: string } };
  if (!res.ok || !payload.localId) {
    const message = payload.error?.message ?? "";
    if (message.includes("EMAIL_EXISTS")) throw new Error("That username is already taken.");
    if (message.includes("WEAK_PASSWORD")) throw new Error("Password should be at least 6 characters.");
    throw new Error("Could not create the student account. Please try again.");
  }
  await createUserProfile({ uid: payload.localId, name: data.name.trim(), email, role: "student" });
  await addStudent({ rollNo: data.rollNo.trim(), name: data.name.trim(), type: data.type, username, email, uid: payload.localId });
}

// ──────────────────────────────────────────────
// Assignments
// ──────────────────────────────────────────────
export function watchAssignments(onChange: (assignments: Assignment[]) => void): () => void {
  const firestore = requireDb();
  const q = query(collection(firestore, "assignments"), orderBy("postedAt", "desc"));
  return onSnapshot(q, (snap) => {
    onChange(
      snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          title: data.title ?? "",
          type: (data.type as AssignmentType) ?? "text",
          content: data.content ?? "",
          subject: data.subject ?? "General",
          postedBy: data.postedBy ?? "",
          postedAt: data.postedAt ?? new Date().toISOString(),
          dueDate: data.dueDate ?? "",
        };
      }),
    );
  });
}

export async function addAssignment(data: Omit<Assignment, "id">): Promise<void> {
  const firestore = requireDb();
  await addDoc(collection(firestore, "assignments"), data);
}

export async function deleteAssignment(id: string): Promise<void> {
  const firestore = requireDb();
  await deleteDoc(doc(firestore, "assignments", id));
}

// ──────────────────────────────────────────────
// Notices
// ──────────────────────────────────────────────
export function watchNotices(onChange: (notices: Notice[]) => void): () => void {
  const firestore = requireDb();
  const q = query(collection(firestore, "notices"), orderBy("postedAt", "desc"));
  return onSnapshot(q, (snap) => {
    onChange(
      snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          title: data.title ?? "",
          content: data.content ?? "",
          postedBy: data.postedBy ?? "",
          postedAt: data.postedAt ?? new Date().toISOString(),
          status: (data.status as "draft" | "published") ?? "draft",
        };
      }),
    );
  });
}

export async function addNotice(data: Omit<Notice, "id">): Promise<void> {
  const firestore = requireDb();
  await addDoc(collection(firestore, "notices"), data);
}

export async function updateNotice(id: string, data: Partial<Omit<Notice, "id">>): Promise<void> {
  const firestore = requireDb();
  await setDoc(doc(firestore, "notices", id), data, { merge: true });
}

export async function deleteNotice(id: string): Promise<void> {
  const firestore = requireDb();
  await deleteDoc(doc(firestore, "notices", id));
}
