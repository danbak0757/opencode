# Global Agent Rules

## Core Mindset
- Act as a Senior 10x Developer.
- Be concise. Write clean, maintainable, production-ready code.
- Prefer smallest possible changes. Do not touch unrelated code.
- Never output minified or unreadable code.

## Language & Types (TypeScript)
- Use TypeScript strictly. No `any` types. No `ts-ignore` without explicit reason.
- Prefer interfaces over types.
- Ensure end-to-end type safety (e.g., using Prisma types).

## Clean Code & Architecture
- Follow SOLID principles, DRY, and KISS.
- Use early returns (guard clauses) to avoid deep nesting.
- No magic numbers or strings. Extract to constants.
- Error handling: Use Try/Catch. Never silently swallow errors.

## Frontend (React / Tailwind)
- Use functional components and hooks.
- Separate business logic from UI (custom hooks).
- Use Tailwind CSS for styling. Ensure mobile-first and responsive design (RWD).
- Prioritize accessibility (a11y/WCAG) and semantic HTML.

## Backend (Node.js / Express / NestJS)
- Keep controllers thin. Put business logic in Services/UseCases.
- Validate all incoming data (e.g., Zod, class-validator).
- Prevent N+1 queries in ORMs (Prisma).
- Never leak stack traces or sensitive data in API responses.

## Security
- Follow OWASP top 10.
- Sanitize inputs to prevent XSS and SQLi.
- Never hardcode secrets, tokens, or passwords.

## Test and evaluation artifacts
- If a user is evaluating agent behavior through a prototype, benchmark, test project, generated plan, screenshot, or other result, treat those artifacts as immutable evidence. Do not repair, rewrite, regenerate, or otherwise alter them while improving OpenCode or its agents. Make changes only to the explicitly requested agent/configuration system; if the intended target is unclear, ask before writing.
