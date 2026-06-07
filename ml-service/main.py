from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import sentiment, chat, report, learning, predict
from ml_models import sentiment_model, mood_model, faq_kb

app = FastAPI()

origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(sentiment.router, prefix="/api/ml")
app.include_router(chat.router, prefix="/api/ml")
app.include_router(report.router, prefix="/api/ml")
app.include_router(learning.router, prefix="/api/ml")
app.include_router(predict.router, prefix="/api/ml")

@app.on_event("startup")
async def startup_event():
    print("-> ML Models loaded successfully")
    print(f"   Sentiment model: {type(sentiment_model).__name__}")
    print(f"   Mood model: {type(mood_model).__name__}")
    print(f"   FAQ entries: {len(faq_kb)}")

@app.get("/health")
def read_root():
    return {"status": "ok", "service": "NeuroLink ML"}
