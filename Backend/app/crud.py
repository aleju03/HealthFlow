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
    model_map = {
        "weight": models.Weight,
        "height": models.Height,
        "body_composition": models.BodyComposition,
        "water": models.WaterConsumption,
        "steps": models.DailySteps,
        "exercise": models.Exercise,
        "body_fat": models.BodyFatPercentage
    }

    if import_type not in model_map:
        raise ValueError("Invalid import type")

    model = model_map[import_type]
    
    for entry in data:
        entry['date'] = datetime.fromisoformat(entry['date'])
        entry['user_id'] = user_id
        
        existing = db.query(model).filter(
            model.date == entry['date'],
            model.user_id == user_id
        ).first()
        
        if existing:
            for key, value in entry.items():
                setattr(existing, key, value)
        else:
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

    # filter for today's exercises and group them
    today_exercises = db.query(
        models.Exercise.exercise_name,
        func.sum(models.Exercise.duration).label('total_duration')
    ).filter(
        models.Exercise.user_id == user_id,
        func.date(models.Exercise.date) == today
    ).group_by(
        models.Exercise.exercise_name
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
            {"name": ex.exercise_name, "duration": int(ex.total_duration)}
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
        # Daily water aggregation
        query = db.query(
            func.date(models.WaterConsumption.date).label('date'),
            func.sum(models.WaterConsumption.water_amount).label('value')
        ).filter(
            models.WaterConsumption.user_id == user_id,
            models.WaterConsumption.date >= start_date
        ).group_by(
            func.date(models.WaterConsumption.date)
        ).order_by(
            func.date(models.WaterConsumption.date)
        )
        
        data = query.all()
        
        # Make sure total is not None
        total = db.query(
            func.coalesce(func.sum(models.WaterConsumption.water_amount), 0.0)
        ).filter(
            models.WaterConsumption.user_id == user_id,
            models.WaterConsumption.date >= start_date
        ).scalar()
        
        return {
            "data": [{"date": row.date, "value": float(row.value or 0)} for row in data],
            "total": float(total)
        }

    elif metric_type == "steps":
        # Daily steps aggregation
        query = db.query(
            func.date(models.DailySteps.date).label('date'),
            func.sum(models.DailySteps.steps_amount).label('value')
        ).filter(
            models.DailySteps.user_id == user_id,
            models.DailySteps.date >= start_date
        ).group_by(
            func.date(models.DailySteps.date)
        ).order_by(
            func.date(models.DailySteps.date)
        )
        
        data = query.all()
        
        # Make sure total is not None
        total = db.query(
            func.coalesce(func.sum(models.DailySteps.steps_amount), 0.0)
        ).filter(
            models.DailySteps.user_id == user_id,
            models.DailySteps.date >= start_date
        ).scalar()
        
        return {
            "data": [{"date": row.date, "value": float(row.value or 0)} for row in data],
            "total": float(total)
        }

    elif metric_type == "exercise":
        # Daily exercise aggregation
        query = db.query(
            func.date(models.Exercise.date).label('date'),
            func.sum(models.Exercise.duration).label('value')
        ).filter(
            models.Exercise.user_id == user_id,
            models.Exercise.date >= start_date
        ).group_by(
            func.date(models.Exercise.date)
        ).order_by(
            func.date(models.Exercise.date)
        )
        
        data = query.all()
        
        # Make sure total is not None
        total = db.query(
            func.coalesce(func.sum(models.Exercise.duration), 0.0)
        ).filter(
            models.Exercise.user_id == user_id,
            models.Exercise.date >= start_date
        ).scalar()
        
        return {
            "data": [{"date": row.date, "value": float(row.value or 0)} for row in data],
            "total": float(total)
        }

    else:
        raise ValueError("Invalid metric type")