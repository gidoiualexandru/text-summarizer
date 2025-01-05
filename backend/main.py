from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List
import requests
from newspaper import Article
from sumy.parsers.plaintext import PlaintextParser
from sumy.nlp.tokenizers import Tokenizer
from sumy.summarizers.lsa import LsaSummarizer
from sumy.nlp.stemmers import Stemmer
from sumy.utils import get_stop_words
from fastapi.middleware.cors import CORSMiddleware
from database import SessionLocal, engine
from models import Base, SummaryRecord
from datetime import datetime

Base.metadata.create_all(bind=engine)

app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def summarize_text_with_sumy(text: str, sentences_count: int) -> str:
    LANGUAGE = "english"
    parser = PlaintextParser.from_string(text, Tokenizer(LANGUAGE))
    summarizer = LsaSummarizer(Stemmer(LANGUAGE))
    summarizer.stop_words = get_stop_words(LANGUAGE)

    summary_sentences = summarizer(parser.document, sentences_count)
    summary_text = " ".join([str(sentence) for sentence in summary_sentences])
    return summary_text

@app.get("/")
def root():
    return {"message": "Welcome to the Text Summarizer API!"}

@app.post("/summarize", response_model=SummarizeResponse)
def summarize_endpoint(request: SummarizeRequest, db=Depends(get_db)):
    """
    Summarize either raw text or a URL. Then store the result in the DB.
    """
    if not request.text and not request.url:
        raise HTTPException(status_code=400, detail="No text or URL provided.")

    text_data = request.text
    if request.url:
        try:
            article = Article(request.url)
            article.download()
            article.parse()
            text_data = article.text
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to process URL: {e}")

    if text_data:
        summary = summarize_text_with_sumy(text_data, request.sentences_count)

        record = SummaryRecord(summary_text=summary)
        db.add(record)
        db.commit()
        db.refresh(record)

        return SummarizeResponse(summary=summary)
    else:
        raise HTTPException(status_code=400, detail="No valid text found to summarize.")

@app.get("/history", response_model=List[HistoryRecordResponse])
def get_history(db=Depends(get_db)):
    """
    Return all summary records in the DB (sorted newest first).
    """
    records = db.query(SummaryRecord).order_by(SummaryRecord.created_at.desc()).all()
    return records
