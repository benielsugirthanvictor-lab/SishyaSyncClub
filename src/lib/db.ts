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
} from "firebase/firestore";
import { db } from "./firebase";

export type Role = "teacher" | "student";
export type StudentType = "Intermediate" | "Junior" | "Senior";
export type AssignmentType = "text" | "link";

export interface Student {
  id: string;
  rollNo: string;
  name: string;
  type: StudentType;
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

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: Role;
}

export const STUDENT_TYPES: StudentType[] = ["Intermediate", "Junior", "Senior"];

export const TEACHER_SIGNUP_CODE = "TEACHER2026";

function requireDb() {
  if (!db) throw new Error("Firebase is not configured. Set VITE_FIREBASE_* environment variables.");
}

// ──────────────────────────────────────────────
// Users
// ──────────────────────────────────────────────
export async function createUserProfile(profile: Omit<UserProfile, "uid"> & { uid: string }): Promise<void> {
  requireDb();
  await setDoc(doc(db, "users", profile.uid), {
    name: profile.name,
    email: profile.email,
    role: profile.role,
    createdAt: serverTimestamp(),
  });
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  requireDb();
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  const data = snap.data() as { name?: string; email?: string; role?: Role };
  return { uid, name: data.name ?? "", email: data.email ?? "", role: data.role ?? "student" };
}

// ──────────────────────────────────────────────
// Students
// ──────────────────────────────────────────────
export function watchStudents(onChange: (students: Student[]) => void): () => void {
  requireDb();
  const q = query(collection(db, "students"), orderBy("createdAt", "asc"));
  return onSnapshot(q, (snap) => {
    onChange(
      snap.docs.map((d) => {
        const data = d.data();
        return { id: d.id, rollNo: data.rollNo ?? "", name: data.name ?? "", type: (data.type as StudentType) ?? "Intermediate" };
      }),
    );
  });
}

export async function addStudent(data: { rollNo: string; name: string; type: StudentType }): Promise<void> {
  requireDb();
  await addDoc(collection(db, "students"), { ...data, createdAt: serverTimestamp() });
}

export async function deleteStudent(id: string): Promise<void> {
  requireDb();
  await deleteDoc(doc(db, "students", id));
}

// ──────────────────────────────────────────────
// Assignments
// ──────────────────────────────────────────────
export function watchAssignments(onChange: (assignments: Assignment[]) => void): () => void {
  requireDb();
  const q = query(collection(db, "assignments"), orderBy("postedAt", "desc"));
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
  requireDb();
  await addDoc(collection(db, "assignments"), data);
}

export async function deleteAssignment(id: string): Promise<void> {
  requireDb();
  await deleteDoc(doc(db, "assignments", id));
}
