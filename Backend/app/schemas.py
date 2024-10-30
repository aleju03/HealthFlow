from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import List, Optional
import re

def validate_gender(v: str) -> str:
    if v not in ['Masculino', 'Femenino']:
        raise ValueError('Género debe ser Masculino o Femenino')
    return v

def validate_password(v: str) -> str:
    if not re.match(r'^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{10,}$', v):
        raise ValueError('La contraseña debe tener al menos 10 caracteres, letras, números y símbolos')
    return v

class UserBase(BaseModel):
    email: EmailStr
    username: str
    birthday: datetime
    gender: str = Field(..., validate_default=validate_gender)

class UserCreate(UserBase):
    password: str = Field(..., validate_default=validate_password)
    current_weight: float
    current_height: float

class UserUpdate(UserBase):
    new_password: Optional[str] = None    # opcional: si quiere cambiar password
    current_password: Optional[str] = None # opcional: solo necesario si cambia password

class UserLogin(BaseModel):
    username: str
    password: str

class User(UserBase):
    id: int

    class Config:
        from_attributes = True

# metric schemas
class WeightBase(BaseModel):
    date: datetime
    weight: float

class HeightBase(BaseModel):
    date: datetime
    height: float

class BodyCompositionBase(BaseModel):
    date: datetime
    fat: float
    muscle: float
    water: float

class WaterConsumptionBase(BaseModel):
    date: datetime
    water_amount: int

class DailyStepsBase(BaseModel):
    date: datetime
    steps_amount: int

class ExerciseBase(BaseModel):
    date: datetime
    exercise_name: str
    duration: int

class BodyFatPercentageBase(BaseModel):
    date: datetime
    fat_percentage: float

# for the imported data
class ImportData(BaseModel):
    import_type: str
    data: List[dict]

# for dashboard response
class CurrentStats(BaseModel):
    weight: Optional[float] = None
    height: Optional[float] = None
    bmi: Optional[float] = None
    body_composition: Optional[dict] = None
    fat_percentage: Optional[float] = None
    water_consumed: int = 0
    steps: int = 0
    exercises: List[dict] = []

# for historical data response
class HistoricalData(BaseModel):
    date: datetime
    value: float

class ExerciseHistory(BaseModel):
    date: datetime
    exercises: int
    duration: int