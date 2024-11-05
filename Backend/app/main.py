from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from . import crud, schemas
from .models import Base
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from . import app

# db setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./health_tracker.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base.metadata.create_all(bind=engine)

# dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/register", response_model=schemas.User)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    if crud.get_user_by_email(db, user.email):
        raise HTTPException(status_code=400, detail="Email ya registrado")
    if crud.get_user_by_username(db, user.username):
        raise HTTPException(status_code=400, detail="Ya existe un usuario con ese nombre")
    return crud.create_user(db, user)

@app.post("/login")
def login(user_credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    user = crud.get_user_by_username(db, user_credentials.username)
    if not user or not crud.verify_password(user_credentials.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales inválidas"
        )
    return {"user_id": user.id}

@app.post("/logout")
def logout():
    # placeholder
    return {"message": "Logged out successfully"}

@app.get("/users/{user_id}", response_model=schemas.User)
def get_user(user_id: int, db: Session = Depends(get_db)):
    db_user = crud.get_user(db, user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return db_user

@app.put("/users/{user_id}", response_model=dict)
def update_user(
    user_id: int,                   
    user_update: schemas.UserUpdate,
    db: Session = Depends(get_db)   
):
    # 1. Verifica que el usuario existe
    db_user = crud.get_user(db, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    # 2. Si quiere cambiar contraseña, verifica la actual
    if user_update.new_password:
        if not user_update.current_password:
            raise HTTPException(
                status_code=400, 
                detail="Contraseña actual requerida para cambiar contraseña"
            )
        if not crud.verify_password(user_update.current_password, db_user.password):
            raise HTTPException(
                status_code=401, 
                detail="Contraseña inválida"
            )
    
    # 3. Verifica que el nuevo email no esté en uso
    if user_update.email != db_user.email:
        if crud.get_user_by_email(db, user_update.email):
            raise HTTPException(
                status_code=400, 
                detail="Email ya registrado"
            )
    
    # 4. Verifica que el nuevo username no esté en uso
    if user_update.username != db_user.username:
        if crud.get_user_by_username(db, user_update.username):
            raise HTTPException(
                status_code=400, 
                detail="Ya existe un usuario con ese nombre"
            )
    
    # 5. Actualiza los campos
    db_user.email = user_update.email
    db_user.username = user_update.username
    db_user.birthday = user_update.birthday
    db_user.gender = user_update.gender
    
    # 6. Actualiza la contraseña si se proporcionó una nueva
    if user_update.new_password:
        db_user.password = user_update.new_password
    
    # 7. Guarda los cambios
    db.commit()
    
    # 8. Verifica si cambiaron credenciales importantes
    credentials_changed = (
        user_update.username != db_user.username or 
        user_update.new_password is not None
    )
    
    # 9. Retorna respuesta
    return {
        "message": "Perfil actualizado correctamente",
        "credentials_changed": credentials_changed
    }

@app.post("/users/{user_id}/import")
def import_data(
    user_id: int,
    import_data: schemas.ImportData,
    db: Session = Depends(get_db)
):
    user = crud.get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    try:
        crud.import_user_data(
            db=db,
            user_id=user_id,
            import_type=import_data.import_type,
            data=import_data.data
        )
        return {"message": "Datos importados correctamente"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/dashboard/{user_id}/current", response_model=schemas.CurrentStats)
def get_current_stats(user_id: int, db: Session = Depends(get_db)):
    user = crud.get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    return crud.get_current_stats(db, user_id)

@app.get("/dashboard/{user_id}/history")
def get_history(
    user_id: int,
    metric: str,
    period: str,
    db: Session = Depends(get_db)
):
    # 1. Verifica que el usuario existe
    user = crud.get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    # 2. Define períodos válidos
    period_map = {
        "1w": timedelta(weeks=1),
        "1m": timedelta(days=30),
        "3m": timedelta(days=90),
        "6m": timedelta(days=180),
        "1y": timedelta(days=365)
    }
    
    # 3. Valida el período
    if period not in period_map:
        raise HTTPException(status_code=400, detail="Período inválido")
    
    # 4. Calcula fechas
    end_date = datetime.now()
    start_date = end_date - period_map[period]
    
    try:
        # 5. Obtiene el historial
        return crud.get_metric_history(db, user_id, metric, start_date)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))