# SochPad — Minimal Notes App

Live App: https://soch-pad.vercel.app
Backend API: https://sochpad-api.onrender.com

SochPad is a fast and clean notes app built using React (Vite) and Node.js with SQLite. It features auto-save, search, smooth UI, and full mobile responsiveness.

------------------------------------

FEATURES
- Create, edit, delete notes
- Auto-save while typing
- Search notes quickly
- Smooth animations
- Responsive design
- SQLite database
- Frontend on Vercel, Backend on Render

------------------------------------

TECH STACK
Frontend: React, Vite, TailwindCSS, Framer Motion  
Backend: Node.js, Express, SQLite (better-sqlite3)  

------------------------------------

RUN LOCALLY

Backend:
cd backend
npm install
npm start

Frontend:
cd frontend
npm install
npm run dev

------------------------------------

ENV VARIABLE (Vercel)
VITE_API_URL = https://sochpad-api.onrender.com

------------------------------------

API ENDPOINTS
GET /notes
POST /notes
GET /notes/:id
PUT /notes/:id
DELETE /notes/:id

------------------------------------

AUTHOR
Built by Harsh Dev.
