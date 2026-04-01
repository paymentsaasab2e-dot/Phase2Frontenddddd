# Phase 2 Recruitment Frontend

Frontend app for the Phase 2 Recruitment System.

## Features

- ✨ Smooth animations using Motion (Framer Motion)
- 🎨 Modern design with Tailwind CSS
- 📱 Responsive and collapsible sidebar
- 🎯 Interactive navigation items with hover effects
- 👤 User profile section
- 📊 Free trial indicator

## Getting Started

### Install Dependencies

Use `pnpm`, not `npm`, for this project.

```bash
pnpm install
```

### Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

### Build for Production

```bash
pnpm build
pnpm start
```

## Windows / OneDrive Note

This project currently lives inside OneDrive. On Windows, Next.js can hit `EINVAL readlink` errors when stale `.next` artifacts are left behind.

The frontend scripts now clear `.next` automatically before `dev` and `build`, so the safe run flow is:

```bash
pnpm install
pnpm dev
```

If port `3001` is already in use, stop the old dev server first and run `pnpm dev` again.

## Project Structure

```
phase2final/
├── src/
│   ├── app/
│   │   ├── layout.tsx      # Root layout
│   │   ├── page.tsx       # Home page
│   │   └── globals.css    # Global styles
│   └── components/
│       └── sidebar.tsx   # Sidebar component
├── package.json
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── postcss.config.js
```

## Technologies Used

- **Next.js 15** - React framework
- **React 18** - UI library
- **Tailwind CSS** - Styling
- **Motion (Framer Motion)** - Animations
- **Lucide React** - Icons
- **TypeScript** - Type safety

## License

MIT
