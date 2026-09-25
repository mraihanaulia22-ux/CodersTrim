# CodersTrim CLI v2

> **Universal Developer CLI Engine** with an extensible plugin architecture for rapid project scaffolding, safe feature injection, automated doctor diagnostics, and modern UI component generation.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)

---

## 🌟 Architecture & Features

- **Microkernel Core**: Decoupled engine; zero hardcoded framework logic.
- **Open Plugin Ecosystem**: Frameworks, linters, and generators are fully independent plugins.
- **Safe-Injection System**: Anchor-based code injection guarded by Git working tree verification.
- **CodersTrim Doctor**: Real-time typo detection and interactive diff preview for Tailwind and template code.
- **UI Scaffolder**: Directly generates clean, customizable Tailwind components into your project (`components/`) with zero lock-in (inspired by shadcn/ui).
- **Port Conflict Diagnostic**: Detects port collisions (3000, 5173, etc.) and terminates stale processes cleanly.

---

## 📁 Repository Structure

```text
coderstrim/
├── packages/
│   ├── core/                        # @coderstrim/core (CLI binary & Core engine)
│   ├── plugin-tailwind/             # @coderstrim/plugin-tailwind (UI & linter plugin)
│   ├── plugin-react/                # @coderstrim/plugin-react (Vite + React 19)
│   ├── plugin-nextjs/               # @coderstrim/plugin-nextjs (App Router)
│   ├── plugin-laravel/              # @coderstrim/plugin-laravel (Laravel 11)
│   ├── plugin-fastapi/              # @coderstrim/plugin-fastapi (Python)
│   └── create-coderstrim/           # npx create-coderstrim bootstrap tool
├── package.json
└── tsconfig.base.json
```

---

## 🛠️ Development & Contributing

### Requirements
- Node.js >= 18.0.0 LTS
- NPM >= 9.0.0

### Getting Started
```bash
# Install dependencies
npm install

# Build all packages
npm run build

# Run unit tests
npm run test
```

---

## 📄 License
Released under the [MIT License](LICENSE).
