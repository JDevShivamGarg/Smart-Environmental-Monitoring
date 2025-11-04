import os
import json
import time
import requests
import pandas as pd
from datetime import datetime, timezone
from pathlib import Path
from pydantic import ValidationError
from typing import List, Dict, Any
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.background import BackgroundScheduler
from dotenv import load_dotenv
from scipy.stats import iqr

# Load environment variables from .env file
load_dotenv()

# Import our validation models
from validation import WeatherAPIResponse, AQICNResponse, CombinedIngestionModel

# --- Configuration ---
WEATHERAPI_API_KEY = os.environ.get("WEATHERAPI_API_KEY")
AQICN_API_KEY = os.environ.get("AQICN_API_KEY")

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
CURATED_DATA_PATH = Path("../data/curated")
PROCESSED_FILES_LOG = CURATED_DATA_PATH / "_processed_files.log"

# --- FastAPI App ---
app = FastAPI()

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
    RAW_DATA_PATH.mkdir(parents=True, exist_ok=True)
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
        return
    run_timestamp = datetime.utcnow().strftime('%Y-%m-%dT%H-%M-%S')
    output_filename = f"ingestion_run_{run_timestamp}.json"
    output_path = RAW_DATA_PATH / output_filename
    try:
        with open(output_path, 'w') as f:
            json.dump(all_data, f, indent=2)
        print(f"Successfully saved raw data to {output_path}")
    except IOError as e:
        print(f"Error writing raw data to file: {e}")

# --- Transformation Logic ---
def get_new_raw_files() -> List[Path]:
    if not PROCESSED_FILES_LOG.exists():
        processed_files = set()
    else:
        with open(PROCESSED_FILES_LOG, 'r') as f:
            processed_files = set(line.strip() for line in f)
    all_raw_files = set(str(p) for p in RAW_DATA_PATH.glob("*.json"))
    new_files = [Path(f) for f in (all_raw_files - processed_files)]
    print(f"Found {len(new_files)} new raw files to process.")
    return new_files

def update_processed_log(processed_files: List[Path]):
    with open(PROCESSED_FILES_LOG, 'a') as f:
        for file_path in processed_files:
            f.write(f"{str(file_path)}\n")

def transform_data(raw_files: List[Path]) -> pd.DataFrame:
    if not raw_files:
        return None
    df_list = []
    for file_path in raw_files:
        try:
            df_list.append(pd.read_json(file_path))
        except Exception as e:
            print(f"Error reading {file_path}: {e}. Skipping.")
    if not df_list:
        return None
    df = pd.concat(df_list, ignore_index=True)
    df['ingestion_timestamp'] = pd.to_datetime(df['ingestion_timestamp'], utc=True)
    df['api_timestamp'] = pd.to_datetime(df['api_timestamp'], utc=True)
    df = df.drop_duplicates(subset=['city', 'api_timestamp'])
    df = df.sort_values(by=['city', 'api_timestamp'])
    df['hour_of_day_utc'] = df['api_timestamp'].dt.hour
    df['day_of_week_utc'] = df['api_timestamp'].dt.dayofweek
    df = df.set_index('api_timestamp').sort_index()
    print(f"Transformed {len(df)} total records.")
    return df

def save_curated_data(df: pd.DataFrame):
    output_path = CURATED_DATA_PATH / "environmental_data.parquet"
    CURATED_DATA_PATH.mkdir(parents=True, exist_ok=True)
    try:
        df.to_parquet(output_path, engine='pyarrow', index=True)
        print(f"Successfully saved curated data to {output_path}")
    except Exception as e:
        print(f"Error saving curated data: {e}")

def run_transformation():
    print(f"Starting transformation run at {datetime.utcnow()} UTC...")
    new_files = get_new_raw_files()
    if not new_files:
        return
    df_transformed = transform_data(new_files)
    if df_transformed is not None and not df_transformed.empty:
        save_curated_data(df_transformed)
        update_processed_log(new_files)
    else:
        print("No data was transformed in this run.")

# --- ETL Job ---
def etl_job():
    """Runs the full ETL job."""
    print("--- Running ETL Job ---")
    run_ingestion()
    run_transformation()
    print("--- ETL Job Finished ---")

# --- API Endpoints ---
@app.get("/api/health")
def health_check():
    """Health check endpoint for Docker and monitoring."""
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}

@app.get("/api/data")
def get_data():
    """Reads and returns the curated environmental data."""
    try:
        df = pd.read_parquet(CURATED_DATA_PATH / "environmental_data.parquet")
        # Since the index is a datetime object, we need to reset it to be able to serialize to JSON
        df = df.reset_index()
        return df.to_dict(orient="records")
    except FileNotFoundError:
        return {"error": "Curated data file not found. ETL job may not have run yet."}

@app.get("/api/stats")
def get_stats():
    """Calculates and returns descriptive statistics and correlation matrix."""
    try:
        df = pd.read_parquet(CURATED_DATA_PATH / "environmental_data.parquet")
        numeric_cols = df.select_dtypes(include=['float64', 'int64']).columns
        
        stats = {
            'descriptive_stats': df[numeric_cols].describe().to_dict(),
            'correlation_matrix': df[numeric_cols].corr().to_dict()
        }
        
        return stats
    except FileNotFoundError:
        return {"error": "Curated data file not found. ETL job may not have run yet."}

# --- Scheduler ---
scheduler = BackgroundScheduler()
scheduler.add_job(etl_job, 'interval', minutes=10)

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
