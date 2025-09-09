# DFRNT - A Minimalist Sprint Dashboard

A 6-month (182-day) gamified dashboard to track tasks, habits, and progress with a focus on minimalism and progressive disclosure. Built with Next.js (App Router), TypeScript, Tailwind CSS, and Framer Motion.

## Core Philosophy

1.  **Single Focus:** See only what you need at this moment.
2.  **Progressive Disclosure:** Reveal complexity on demand, not by default.
3.  **Micro-feedback:** Instant, subtle feedback for every action.
4.  **Keyboard-First:** Optimized for speed and efficiency.

## Getting Started

### Prerequisites

-   Node.js (v18 or newer)
-   pnpm (recommended) or npm

### Installation & Running Locally

1.  Clone the repository:

    ```bash
    git clone <repository-url>
    cd flowgo
    ```

2.  Install dependencies:

    ```bash
    pnpm install
    # or with npm
    # npm install
    ```

3.  Run the development server:

    ```bash
    pnpm dev
    # or
    # npm run dev
    ```

The application will be available at `http://localhost:3000`.

## Deployment to Vercel

This project is optimized for deployment on Vercel. Push the repo to GitHub and either import to Vercel or enable GitHub integration — Vercel will detect Next.js automatically.

## Project Structure

- `app/`: App Router directory.
- `components/`: Reusable React components and UI primitives.
- `lib/`: Core logic (sprint, gamification, store, types, utils).
- `data/`: Seed data used for the demo.
- `tests/`: Unit tests run with Vitest.

## Notes

- This repository is scaffolded to be minimal and self-contained. Install dependencies before running the dev server.