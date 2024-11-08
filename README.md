# HealthFlow

[![Made with React](https://img.shields.io/badge/Made%20with-React-61dafb.svg)](https://reactjs.org)
[![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-000000?style=flat&logo=shadcnui&logoColor=white)](https://ui.shadcn.com/)
[![Framer](https://img.shields.io/badge/Framer-black?style=flat&logo=framer&logoColor=blue)](https://www.framer.com/motion/)
[![SQLite](https://img.shields.io/badge/sqlite-%2307405e.svg?style=flat&logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![Recharts](https://img.shields.io/badge/Recharts-61DAFB?style=flat&logo=react&logoColor=black)](https://recharts.org/)

Dashboard para el seguimiento de la salud, diseñada para monitorear métricas personales de salud.

## Quick setup

### Backend
```bash
# 1. Crear y activar entorno virtual
python -m venv venv
source venv/bin/activate  # Unix/Mac
.\venv\Scripts\activate   # Windows

# 2. Instalar dependencias
pip install -r requirements.txt

# 3. Iniciar servidor
uvicorn app.main:app --reload
```

### Frontend
```bash
npm install
npm run dev
```