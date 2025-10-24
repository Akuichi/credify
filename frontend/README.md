Frontend (React + Vite + Tailwind) placeholder

Planned steps:

Frontend (React + Vite + Tailwind) scaffold

Local setup

1. cd frontend
2. yarn install
3. yarn dev

Notes

- The frontend expects the backend API at http://localhost:8000 by default. Set VITE_API_BASE_URL to change.
- This is a minimal scaffold: implement forms and API calls in `src/pages` and wire auth state via `src/context/AuthContext.tsx`.
- Tailwind is configured via `tailwind.config.cjs` and `postcss.config.cjs`.
