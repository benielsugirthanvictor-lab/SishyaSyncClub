# SishyaSyncClub

The Sishya's Own Sync Club — a platform facilitating seamless communication between teachers and students. Teachers can post assignments and students can access them easily.

Built from a Figma design using **React + Vite + Tailwind CSS**.

## Getting Started

```sh
pnpm install
pnpm dev
```

## Build

```sh
pnpm build   # outputs to dist/
```

## Deploy

This repo is configured for [Vercel](https://vercel.com) via `vercel.json` (framework: `vite`, output: `dist`). Push to `main` to trigger an automatic deployment.

## Firebase Setup

The app uses Firebase (Auth + Firestore) for accounts and data storage.

1. Create a free project at [console.firebase.google.com](https://console.firebase.google.com).
2. Enable **Authentication → Sign-in method → Email/Password**.
3. Enable **Firestore Database**.
4. Add a **Web app** and copy its config into the `VITE_FIREBASE_*` environment variables (see `.env.example`).
5. Paste the rules from `firestore.rules` into **Firestore Database → Rules**.
6. Set the same `VITE_FIREBASE_*` variables in the Vercel project (Settings → Environment Variables) and redeploy.
7. Create the teacher's login account. Either open a browser console on `identitytoolkit` and run `accounts:signUp` with `email: iamteacher@krishna.com`, `password: teacher@123`, and the `VITE_FIREBASE_API_KEY`, then add a matching `users/{uid}` doc with `role: "teacher"`; or log in as a student and use the app. Contact the repo owner for the exact steps.

## Accounts

- The default teacher login is `iamteacher@krishna.com` / `teacher@123` (change the password after first sign-in).
- There is no public sign-up form. Teachers create student accounts (username + password) from **Students → Add Student**. Students sign in with their username (or `username@sishya.edu`).
