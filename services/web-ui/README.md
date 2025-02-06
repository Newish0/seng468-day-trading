# TradeSimple Web UI - Svelte + TS + Vite

A modern web application built with **Svelte**, powered by **Vite**, and styled with **Tailwind CSS** and **simple.css**. The project is written in **TypeScript** for type safety and maintainability.

## **Tech Stack**

This project is built using the following technologies:

- **[Svelte](https://svelte.dev/)** – A modern frontend framework that compiles components into highly efficient JavaScript.
- **[Vite](https://vitejs.dev/)** – A fast and lightweight development server and build tool.
- **[TypeScript](https://www.typescriptlang.org/)** – A statically typed superset of JavaScript.
- **[Tailwind CSS](https://tailwindcss.com/)** – A utility-first CSS framework for rapid UI development.
- **[Simple.css](https://simplecss.org)** – A CSS framework that makes semantic HTML look good.

## Development

### **1. Install Dependencies**

```bash
bun install
```

### **2. Run the Development Server**

Start the Vite-powered development server:

```bash
bun run dev
```

Your project will be available at **http://localhost:5173/**.

### **3. Build for Production**

To create an optimized production build:

```bash
bun run build
```

### **4. Preview the Production Build**

Serve the built project locally:

```bash
bun run preview
```

## **Folder Structure**

```
/web-ui
 ├── public/
 ├── src/
 │   ├── assets/          # Static assets (e.g., images, icons)
 │   ├── lib/             # Svelte components
 │   ├── app.css          # Global styles
 │   ├── App.svelte       # Entry point of the app
 ├── index.html
 ├── package-lock.json
 ├── package.json
 ├── README.md
 ├── svelte.config.js
 ├── tsconfig.app.json
 ├── tsconfig.json
 ├── tsconfig.node.json
 ├── vite.config.ts

```
