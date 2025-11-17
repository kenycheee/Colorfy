# 🎨 Next.js Color Palette App

A modern color palette generator built using **Next.js**, **Firebase**, and a fully responsive UI. Users can generate random palettes, customize them, and save their collections securely to Firestore.

---

## ✨ Features

### 🔄 Randomize or Reset
Instantly generate random palettes or restore the default set with a single click.

### 🔐 Firebase Login
Users must sign in before saving or managing their palettes.

### ☁️ Firestore Storage
Palettes are stored in:
- `users/{userId}/palleteList` (user-specific)
- Global `palleteList` collection (public reference)

### 🖥 Fully Responsive UI
Optimized for mobile, tablet, and desktop layouts.

---

## 🧱 Tech Stack

| Category | Tools |
|---------|-------|
| Framework | **Next.js 16**, React |
| Styling | CSS Modules / Custom CSS |
| Authentication | Firebase Auth |
| Database | Firestore |
| Deployment | Vercel |
| Logic | React Hooks |

---

## 🛠 Getting Started

### 💾 1. Install Dependencies

```bash
npm install
# or
yarn
# or
pnpm install
# or
bun install
