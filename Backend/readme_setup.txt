# 1. crear venv
python -m venv venv

# 2. activar venv
source venv/bin/activate  # para unix/mac
.\venv\Scripts\activate   # para windows

# 3. instalar dependencias
pip install -r requirements.txt

# 4. correrlo
cd backend
uvicorn app.main:app --reload