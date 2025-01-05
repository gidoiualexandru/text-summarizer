from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class SummaryRecord(Base):
    __tablename__ = "summaries"

    id = Column(Integer, primary_key=True, index=True)
    summary_text = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
