import os
import json
import time
import requests
import pandas as pd
from datetime import datetime, timezone
from pathlib import Path
from pydantic import ValidationError
from typing import List, Dict, Any
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.background import BackgroundScheduler
from dotenv import load_dotenv
from supabase import create_client, Client
from scipy.stats import iqr
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# Load environment variables from .env file
load_dotenv()

# Import our validation models
from data_models import WeatherAPIResponse, AQICNResponse, CombinedIngestionModel

# --- Configuration ---
WEATHERAPI_API_KEY = os.environ.get("WEATHERAPI_API_KEY")
AQICN_API_KEY = os.environ.get("AQICN_API_KEY")
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

# --- Supabase Client ---
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

CITIES = {
    "Amaravati": {"lat": 16.5667, "lon": 80.3667}, # Andhra Pradesh
    "Itanagar": {"lat": 27.0869, "lon": 93.6099}, # Arunachal Pradesh
    "Dispur": {"lat": 26.1356, "lon": 91.8007}, # Assam
    "Patna": {"lat": 25.6154, "lon": 85.1010}, # Bihar
    "Raipur": {"lat": 21.2444, "lon": 81.6306}, # Chhattisgarh
    "Panaji": {"lat": 15.4989, "lon": 73.8278}, # Goa
    "Gandhinagar": {"lat": 23.2148, "lon": 72.6498}, # Gujarat
    "Chandigarh": {"lat": 30.7500, "lon": 76.7800}, # Haryana, Punjab
    "Shimla": {"lat": 31.1033, "lon": 77.1722}, # Himachal Pradesh
    "Ranchi": {"lat": 23.3432, "lon": 85.3094}, # Jharkhand
    "Bengaluru": {"lat": 12.9700, "lon": 77.5600}, # Karnataka
    "Thiruvananthapuram": {"lat": 8.5241, "lon": 76.9366}, # Kerala
    "Bhopal": {"lat": 23.2599, "lon": 77.4126}, # Madhya Pradesh
    "Mumbai": {"lat": 19.0761, "lon": 72.8774}, # Maharashtra
    "Imphal": {"lat": 24.8074, "lon": 93.9384}, # Manipur
    "Shillong": {"lat": 25.5822, "lon": 91.8944}, # Meghalaya
    "Aizawl": {"lat": 23.8000, "lon": 92.9000}, # Mizoram
    "Kohima": {"lat": 25.6700, "lon": 94.1200}, # Nagaland
    "Bhubaneswar": {"lat": 20.2700, "lon": 85.8400}, # Odisha
    "Jaipur": {"lat": 26.9075, "lon": 75.7396}, # Rajasthan
    "Gangtok": {"lat": 27.3170, "lon": 88.6000}, # Sikkim
    "Chennai": {"lat": 13.0825, "lon": 80.2750}, # Tamil Nadu
    "Hyderabad": {"lat": 17.3617, "lon": 78.4747}, # Telangana
    "Agartala": {"lat": 23.8314, "lon": 91.2869}, # Tripura
    "Lucknow": {"lat": 26.8500, "lon": 80.9500}, # Uttar Pradesh
    "Dehradun": {"lat": 30.3450, "lon": 78.0290}, # Uttarakhand
    "Kolkata": {"lat": 22.5726, "lon": 88.3639}, # West Bengal
    "Port Blair": {"lat": 11.6683, "lon": 92.7378}, # Andaman and Nicobar Islands
    "Daman": {"lat": 20.4200, "lon": 72.8500}, # Dadra and Nagar Haveli and Daman and Diu
    "New Delhi": {"lat": 28.6791, "lon": 77.0697}, # Delhi
    "Srinagar": {"lat": 34.0900, "lon": 74.7900}, # Jammu and Kashmir
    "Kavaratti": {"lat": 10.5700, "lon": 72.6400}, # Lakshadweep
    "Leh": {"lat": 34.1642, "lon": 77.5847}, # Ladakh
    "Puducherry": {"lat": 11.9110, "lon": 79.8130} # Puducherry
}

RAW_DATA_PATH = Path("../data/raw")
RAW_DATA_PATH.mkdir(parents=True, exist_ok=True)

# --- Rate Limiter Setup ---
limiter = Limiter(key_func=get_remote_address)

# --- FastAPI App ---
app = FastAPI()

# Add rate limiter to app state
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Ingestion Logic ---
def get_weatherapi_data(city: str, lat: float, lon: float) -> dict:
    url = "http://api.weatherapi.com/v1/current.json"
    params = {"key": WEATHERAPI_API_KEY, "q": f"{lat},{lon}"}
    try:
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        print(f"Error fetching WeatherAPI data for {city}: {e}")
        return None

def get_aqicn_data(city: str, lat: float, lon: float) -> dict:
    url = f"https://api.waqi.info/feed/geo:{lat};{lon}/"
    params = {"token": AQICN_API_KEY}
    try:
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        print(f"Error fetching AQICN data for {city}: {e}")
        return None

def normalize_data(city_name: str, raw_weather: dict, raw_aqi: dict) -> dict:
    try:
        weather = WeatherAPIResponse(**raw_weather)
        aqi = AQICNResponse(**raw_aqi)
        combined_data = CombinedIngestionModel(
            source_api="WeatherAPI+AQICN",
            city=city_name,
            lat=round(weather.location.lat, 2),
            lon=round(weather.location.lon, 2),
            temperature_celsius=round(weather.current.temp_c, 2),
            feels_like_celsius=round(weather.current.feelslike_c, 2),
            pressure_hpa=weather.current.pressure_mb,
            humidity_percent=weather.current.humidity,
            wind_speed_ms=round(weather.current.wind_kph * 1000 / 3600, 2),
            wind_direction_deg=weather.current.wind_degree,
            aqi=aqi.data.aqi,
            dominant_pollutant=aqi.data.dominentpol,
            api_timestamp=datetime.fromtimestamp(weather.current.last_updated_epoch, tz=timezone.utc)
        )
        return combined_data.model_dump(mode="json")
    except ValidationError as e:
        print(f"Data validation error for {raw_weather.get('location', {}).get('name', 'Unknown')}: {e}")
        return None
    except Exception as e:
        print(f"Error normalizing data: {e}")
        return None

def run_ingestion():
    print(f"Starting ingestion run at {datetime.utcnow()} UTC...")
    all_data: List[Dict[str, Any]] = []
    for city, coords in CITIES.items():
        raw_weather = get_weatherapi_data(city, **coords)
        raw_aqi = get_aqicn_data(city, **coords)
        if raw_weather and raw_aqi:
            normalized_data = normalize_data(city, raw_weather, raw_aqi)
            if normalized_data:
                all_data.append(normalized_data)
        time.sleep(1)
    if not all_data:
        print("No data collected in this run.")
        return None
    
    return all_data

# --- Transformation and Upload Logic ---
def transform_and_upload(data: List[Dict[str, Any]]):
    if not data:
        return
    
    df = pd.DataFrame(data)
    df['ingestion_timestamp'] = datetime.now(timezone.utc).isoformat()
    df['api_timestamp'] = pd.to_datetime(df['api_timestamp'], utc=True)
    df = df.drop_duplicates(subset=['city', 'api_timestamp'])
    df = df.sort_values(by=['city', 'api_timestamp'])
    
    # Convert timestamp columns to ISO 8601 formatted strings
    df['api_timestamp'] = df['api_timestamp'].apply(lambda x: x.isoformat())
    
    # Convert DataFrame to list of dictionaries for upload
    records_to_upload = df.to_dict(orient="records")
    
    try:
        # Supabase upsert
        response = supabase.table('environmental_data').upsert(records_to_upload, on_conflict='city,api_timestamp').execute()
        print(f"Successfully uploaded/updated {len(response.data)} records to Supabase.")
    except Exception as e:
        print(f"Error uploading data to Supabase: {e}")

# --- ETL Job ---
def etl_job():
    """Runs the full ETL job."""
    print("--- Running ETL Job ---")
    ingested_data = run_ingestion()
    if ingested_data:
        transform_and_upload(ingested_data)
    print("--- ETL Job Finished ---")

# --- API Endpoints ---
@app.get("/api/health")
@limiter.limit("100/minute")
def health_check(request: Request):
    """Health check endpoint for Docker and monitoring."""
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}

@app.get("/api/data")
@limiter.limit("30/minute")
def get_data(request: Request):
    """Reads and returns the curated environmental data from Supabase.
    Rate limited to 30 requests per minute to prevent abuse.
    """
    try:
        response = supabase.table('environmental_data').select("*").order('api_timestamp', desc=True).limit(1000).execute()

        # Add cache control headers
        return {
            "data": response.data,
            "cache_control": "public, max-age=3600",  # Cache for 1 hour
            "last_updated": datetime.now(timezone.utc).isoformat()
        }
    except Exception as e:
        return {"error": f"Error fetching data from Supabase: {e}"}

@app.get("/api/stats")
@limiter.limit("20/minute")
def get_stats(request: Request):
    """Calculates and returns descriptive statistics and correlation matrix from Supabase data.
    Rate limited to 20 requests per minute.
    """
    try:
        response = supabase.table('environmental_data').select("*").execute()
        df = pd.DataFrame(response.data)

        if df.empty:
            return {"error": "No data found in Supabase table."}

        numeric_cols = df.select_dtypes(include=['float64', 'int64']).columns

        stats = {
            'descriptive_stats': df[numeric_cols].describe().to_dict(),
            'correlation_matrix': df[numeric_cols].corr().to_dict(),
            'cache_control': "public, max-age=3600",
            'last_updated': datetime.now(timezone.utc).isoformat()
        }

        return stats
    except Exception as e:
        return {"error": f"Error fetching or processing stats from Supabase: {e}"}

# --- Scheduler ---
scheduler = BackgroundScheduler()
# Schedule ETL job to run daily at 12:00 PM (noon)
scheduler.add_job(etl_job, 'cron', hour=12, minute=0)

@app.on_event("startup")
def startup_event():
    print("Application startup...")
    # Run the ETL job once on startup
    etl_job()
    # Start the scheduler
    scheduler.start()

@app.on_event("shutdown")
def shutdown_event():
    print("Application shutdown...")
    scheduler.shutdown()