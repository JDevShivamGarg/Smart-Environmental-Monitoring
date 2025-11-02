from fastapi import FastAPI
import pandas as pd
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Allow all origins for development purposes
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/data")
def get_data():
    """Reads and returns the curated environmental data."""
    try:
        df = pd.read_parquet("../data/curated/environmental_data.parquet")
        return df.to_dict(orient="records")
    except FileNotFoundError:
        return {"error": "Curated data file not found."}
