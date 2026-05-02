from fastapi import FastAPI
from routers import sentiment, chat, report, learning

app = FastAPI()

app.include_router(sentiment.router, prefix="/api/ml")
app.include_router(chat.router, prefix="/api/ml")
app.include_router(report.router, prefix="/api/ml")
app.include_router(learning.router, prefix="/api/ml")

@app.get("/health")
def read_root():
    return {"status": "ok", "service": "NeuroLink ML"}
