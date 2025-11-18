# Colorfy

A modern and responsive **color palette generator** built using **Next.js**, **Firebase Authentication**, and **Firestore**.  
Users can generate random palettes, customize colors, and securely store their collections in the cloud.

---

## Features

### Randomize / Reset Colors  
Generate a fully random palette or restore the default palette with a single click.

### Firebase Authentication  
Only logged-in users can save, edit, or delete palettes.

### Firestore Storage  
Palettes are stored in:
- `users/{userId}/palleteList` — user-specific collections  
- `palleteList` — global reference collection  

### Fully Responsive UI  
Built to look clean and consistent across **mobile**, **tablet**, and **desktop**.

---

## Tech Stack

| Category | Tools |
|----------|----------------|
| Framework | Next.js 16, React |
| Styling | CSS Modules / Custom CSS |
| Authentication | Firebase Auth |
| Database | Firestore |
| Deployment | Vercel |
| Logic | React Hooks |

---


## Getting Started

### 1️⃣ Install Dependencies

```bash
npm install
# or
yarn
# or
pnpm install
# or
bun install
```

### 2️⃣ Start the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev

# Open in your browser:
# http://localhost:3000
```
