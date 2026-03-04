from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional, Union
from retrieve import retrieve   # your existing function
from fastapi.middleware.cors import CORSMiddleware



app = FastAPI(
    title="NyayaNet Legal Retrieval API",
    description="Backend API for legal question retrieval",
    version="1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------- Request Schema --------
class QueryRequest(BaseModel):
    query: str
    top_k: Optional[int] = 5


# -------- Response Schema --------
class ResultItem(BaseModel):
    source: str
    score: float
    chapter: Optional[Union[str, int]] = None
    chapter_title: Optional[str] = None
    section_desc: str
    act_id: Optional[str] = None
    section_id: Optional[str] = None
    

class QueryResponse(BaseModel):
    query: str
    results: List[ResultItem]


# -------- Root Test --------
@app.get("/")
def root():
    return {"message": "NyayaNet Backend Running 🚀"}


# -------- Main Retrieval API --------
@app.post("/ask", response_model=QueryResponse)
def ask_question(req: QueryRequest):
    results = retrieve(req.query, top_k=req.top_k)

    return {
        "query": req.query,
        "results": results
    }