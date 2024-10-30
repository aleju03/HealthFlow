from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship, declarative_base

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True)
    password = Column(String)
    birthday = Column(DateTime)
    gender = Column(String)

    # relationships
    weights = relationship("Weight", back_populates="user")
    heights = relationship("Height", back_populates="user")
    body_compositions = relationship("BodyComposition", back_populates="user")
    water_consumptions = relationship("WaterConsumption", back_populates="user")
    daily_steps = relationship("DailySteps", back_populates="user")
    exercises = relationship("Exercise", back_populates="user")
    body_fat_percentages = relationship("BodyFatPercentage", back_populates="user")

class Weight(Base):
    __tablename__ = "weights"
    date = Column(DateTime, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    weight = Column(Float)
    user = relationship("User", back_populates="weights")

class Height(Base):
    __tablename__ = "heights"
    date = Column(DateTime, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    height = Column(Float)
    user = relationship("User", back_populates="heights")

class BodyComposition(Base):
    __tablename__ = "body_compositions"
    date = Column(DateTime, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    fat = Column(Float)
    muscle = Column(Float)
    water = Column(Float)
    user = relationship("User", back_populates="body_compositions")

class WaterConsumption(Base):
    __tablename__ = "water_consumptions"
    date = Column(DateTime, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    water_amount = Column(Integer)  # in glasses (250ml each)
    user = relationship("User", back_populates="water_consumptions")

class DailySteps(Base):
    __tablename__ = "daily_steps"
    date = Column(DateTime, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    steps_amount = Column(Integer)
    user = relationship("User", back_populates="daily_steps")

class Exercise(Base):
    __tablename__ = "exercises"
    date = Column(DateTime, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    exercise_name = Column(String)
    duration = Column(Integer)  # in minutes
    user = relationship("User", back_populates="exercises")

class BodyFatPercentage(Base):
    __tablename__ = "body_fat_percentages"
    date = Column(DateTime, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    fat_percentage = Column(Float)
    user = relationship("User", back_populates="body_fat_percentages")