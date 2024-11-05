from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
from typing import List, Dict, Any
from . import models, schemas

# user operations
def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def create_user(db: Session, user: schemas.UserCreate):
    db_user = models.User(
        email=user.email,
        username=user.username,
        password=user.password,
        birthday=user.birthday,
        gender=user.gender
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    # add initial weight and height
    weight = models.Weight(
        date=datetime.now(),
        user_id=db_user.id,
        weight=user.current_weight
    )
    height = models.Height(
        date=datetime.now(),
        user_id=db_user.id,
        height=user.current_height
    )
    db.add(weight)
    db.add(height)
    db.commit()

    return db_user

def verify_password(password: str, stored_password: str):
    return password == stored_password  # simple string comparison

# data import operations
def import_user_data(db: Session, user_id: int, import_type: str, data: List[Dict[str, Any]]):
    # Mapeo de tipos de importación a modelos
    model_map = {
        "weight": models.Weight,
        "height": models.Height,
        "body_composition": models.BodyComposition,
        "water": models.WaterConsumption,
        "steps": models.DailySteps,
        "exercise": models.Exercise,
        "body_fat": models.BodyFatPercentage
    }

    # Verifica que el tipo de importación sea válido
    if import_type not in model_map:
        raise ValueError("Invalid import type")

    model = model_map[import_type]
    
    for entry in data:
        # Convierte la fecha de string a datetime
        entry['date'] = datetime.fromisoformat(entry['date'])
        entry['user_id'] = user_id
        
        # Busca si ya existe un registro para esa fecha
        existing = db.query(model).filter(
            model.date == entry['date'],
            model.user_id == user_id
        ).first()
        
        if existing:
            # Actualiza el registro existente
            for key, value in entry.items():
                setattr(existing, key, value)
        else:
            # Crea un nuevo registro
            db_entry = model(**entry)
            db.add(db_entry)
    
    db.commit()

# dashboard operations
def get_current_stats(db: Session, user_id: int):
    today = datetime.now().date()
    
    current_weight = db.query(models.Weight).filter(
        models.Weight.user_id == user_id
    ).order_by(models.Weight.date.desc()).first()

    current_height = db.query(models.Height).filter(
        models.Height.user_id == user_id
    ).order_by(models.Height.date.desc()).first()

    current_composition = db.query(models.BodyComposition).filter(
        models.BodyComposition.user_id == user_id
    ).order_by(models.BodyComposition.date.desc()).first()

    # filter for water consumption for the current day
    today_water = db.query(models.WaterConsumption).filter(
        models.WaterConsumption.user_id == user_id,
        func.date(models.WaterConsumption.date) == today
    ).all()
    total_water = sum(water.water_amount for water in today_water)

    # filter for steps taken today
    today_steps = db.query(models.DailySteps).filter(
        models.DailySteps.user_id == user_id,
        func.date(models.DailySteps.date) == today
    ).all()
    total_steps = sum(steps.steps_amount for steps in today_steps)

    # filter for today’s exercises
    today_exercises = db.query(models.Exercise).filter(
        models.Exercise.user_id == user_id,
        func.date(models.Exercise.date) == today
    ).all()

    current_fat = db.query(models.BodyFatPercentage).filter(
        models.BodyFatPercentage.user_id == user_id
    ).order_by(models.BodyFatPercentage.date.desc()).first()

    bmi = None
    if current_weight and current_height:
        height_in_meters = current_height.height / 100
        bmi = current_weight.weight / (height_in_meters ** 2)

    return {
        "weight": current_weight.weight if current_weight else None,
        "height": current_height.height if current_height else None,
        "bmi": round(bmi, 2) if bmi else None,
        "body_composition": {
            "fat": current_composition.fat if current_composition else None,
            "muscle": current_composition.muscle if current_composition else None,
            "water": current_composition.water if current_composition else None
        },
        "fat_percentage": current_fat.fat_percentage if current_fat else None,
        "water_consumed": total_water,  # sum of today's water intake
        "steps": total_steps,  # sum of today's steps
        "exercises": [
            {"name": ex.exercise_name, "duration": ex.duration}
            for ex in today_exercises
        ]
    }

# historical data operations
def get_metric_history(db: Session, user_id: int, metric_type: str, start_date: datetime):
    if metric_type == "weight":
        query = db.query(
            models.Weight.date,
            models.Weight.weight.label('value')
        ).filter(
            models.Weight.user_id == user_id,
            models.Weight.date >= start_date
        ).order_by(models.Weight.date)
        
        data = query.all()
        return [{"date": row.date, "value": float(row.value or 0)} for row in data]

    elif metric_type == "muscle":
        query = db.query(
            models.BodyComposition.date,
            models.BodyComposition.muscle.label('value')
        ).filter(
            models.BodyComposition.user_id == user_id,
            models.BodyComposition.date >= start_date
        ).order_by(models.BodyComposition.date)
        
        data = query.all()
        return [{"date": row.date, "value": float(row.value or 0)} for row in data]

    elif metric_type == "fat_percentage":
        query = db.query(
            models.BodyFatPercentage.date,
            models.BodyFatPercentage.fat_percentage.label('value')
        ).filter(
            models.BodyFatPercentage.user_id == user_id,
            models.BodyFatPercentage.date >= start_date
        ).order_by(models.BodyFatPercentage.date)
        
        data = query.all()
        return [{"date": row.date, "value": float(row.value or 0)} for row in data]

    elif metric_type == "water":
        query = db.query(
            models.WaterConsumption.date,
            models.WaterConsumption.water_amount.label('total')
        ).filter(
            models.WaterConsumption.user_id == user_id,
            models.WaterConsumption.date >= start_date
        ).order_by(models.WaterConsumption.date)
        
        data = query.all()
        return [{"date": row.date, "total": float(row.total or 0)} for row in data]

    elif metric_type == "steps":
        query = db.query(
            models.DailySteps.date,
            models.DailySteps.steps_amount.label('total')
        ).filter(
            models.DailySteps.user_id == user_id,
            models.DailySteps.date >= start_date
        ).order_by(models.DailySteps.date)
        
        data = query.all()
        return [{"date": row.date, "total": float(row.total or 0)} for row in data]

    elif metric_type == "exercise":
        query = db.query(
            models.Exercise.date,
            models.Exercise.duration.label('duration')
        ).filter(
            models.Exercise.user_id == user_id,
            models.Exercise.date >= start_date
        ).order_by(models.Exercise.date)
        
        data = query.all()
        return [{
            "date": row.date, 
            "duration": float(row.duration or 0)
        } for row in data]

    else:
        raise ValueError("Invalid metric type")