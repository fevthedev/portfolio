# models.py
from sqlalchemy import Column, Integer, String, DateTime, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

Base = declarative_base()

class Shipment(Base):
    __tablename__ = 'shipments'

    shipment_id = Column(Integer, primary_key=True, unique=True)
    customer_id = Column(Integer)
    origin = Column(String)
    destination = Column(String)
    weight = Column(Integer)
    volume = Column(Integer)
    carrier = Column(String)
    mode = Column(String)
    status = Column(String)
    arrival_date = Column(DateTime)
    departure_date = Column(DateTime, nullable=True)
    delivered_date = Column(DateTime, nullable=True)

# Setup engine and session
engine = create_engine('sqlite:///shipments.db')
SessionLocal = sessionmaker(bind=engine)

def init_db():
    Base.metadata.create_all(engine)
