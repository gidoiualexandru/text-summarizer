from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import time
from newspaper import Article
from sumy.parsers.plaintext import PlaintextParser
from sumy.nlp.tokenizers import Tokenizer
from sumy.summarizers.lsa import LsaSummarizer
from sumy.nlp.stemmers import Stemmer
from sumy.utils import get_stop_words
from sqlalchemy.orm import Session
from database import engine, SessionLocal
from models import Base, SummaryRecord

Base.metadata.create_all(bind=engine)

usage_data = {}

def rate_limiter(request: Request):
    ip = request.client.host
    now = time.time()
    if ip not in usage_data:
        usage_data[ip] = []
    usage_data[ip] = [t for t in usage_data[ip] if now - t < 60]
    if len(usage_data[ip]) >= 15:
        raise HTTPException(status_code=429, detail="Too many requests")
    usage_data[ip].append(now)
    return ip

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class SummarizeRequest(BaseModel):
    text: Optional[str] = None
    url: Optional[str] = None
    sentences_count: int = 3

class SummarizeResponse(BaseModel):
    summary: str

class HistoryRecordResponse(BaseModel):
    id: int
    summary_text: str
    created_at: datetime
    class Config:
        from_attributes = True

app = FastAPI()

origins = ["http://localhost:3000","http://127.0.0.1:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Welcome"}

@app.post("/summarize", response_model=SummarizeResponse)
def summarize_endpoint(r: SummarizeRequest, db: Session = Depends(get_db), ip=Depends(rate_limiter)):
    if not r.text and not r.url:
        raise HTTPException(status_code=400, detail="No text or URL")
    text_data = r.text
    if r.url:
        try:
            article = Article(r.url)
            article.download()
            article.parse()
            text_data = article.text
        except:
            raise HTTPException(status_code=400, detail="URL error")
    if text_data:
        parser = PlaintextParser.from_string(text_data, Tokenizer("english"))
        summarizer = LsaSummarizer(Stemmer("english"))
        summarizer.stop_words = get_stop_words("english")
        summary_sentences = summarizer(parser.document, r.sentences_count)
        summary_text = " ".join(str(s) for s in summary_sentences)
        record = SummaryRecord(summary_text=summary_text)
        db.add(record)
        db.commit()
        db.refresh(record)
        return SummarizeResponse(summary=summary_text)
    raise HTTPException(status_code=400, detail="No valid text")

@app.get("/history", response_model=List[HistoryRecordResponse])
def get_history(limit: int = 10, offset: int = 0, search: Optional[str] = None, db: Session = Depends(get_db), ip=Depends(rate_limiter)):
    q = db.query(SummaryRecord).order_by(SummaryRecord.created_at.desc())
    if search:
        q = q.filter(SummaryRecord.summary_text.ilike(f"%{search}%"))
    return q.offset(offset).limit(limit).all()

@app.delete("/history/{record_id}")
def delete_history_entry(record_id: int, db: Session = Depends(get_db), ip=Depends(rate_limiter)):
    record = db.query(SummaryRecord).filter(SummaryRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(record)
    db.commit()
    return {"message": "Deleted"}

@app.delete("/history")
def delete_all_history(db: Session = Depends(get_db), ip=Depends(rate_limiter)):
    db.query(SummaryRecord).delete()
    db.commit()
    return {"message": "All deleted"}
