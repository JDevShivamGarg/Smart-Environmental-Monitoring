import os
import json
import time
import requests
from datetime import datetime, timezone
from pathlib import Path
from pydantic import ValidationError
from typing import List, Dict, Any
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Import our validation models
from validation import WeatherAPIResponse, AQICNResponse, CombinedIngestionModel

# --- Configuration ---
WEATHERAPI_API_KEY = os.environ.get("WEATHERAPI_API_KEY")
AQICN_API_KEY = os.environ.get("AQICN_API_KEY")

CITIES = {
    "Delhi": {"lat": 28.7041, "lon": 77.1025},
    "Mumbai": {"lat": 19.0760, "lon": 72.8777},
    "Bengaluru": {"lat": 12.9716, "lon": 77.5946}
}

# Phase 1: Write to local filesystem (simulating S3)
RAW_DATA_PATH = Path(os.environ.get("RAW_DATA_PATH", "./data/raw"))
RAW_DATA_PATH.mkdir(parents=True, exist_ok=True)

# --- API Clients ---

def get_weatherapi_data(city: str, lat: float, lon: float) -> dict:
    """Fetches weather data from WeatherAPI.com."""
    url = "http://api.weatherapi.com/v1/current.json"
    params = {
        "key": WEATHERAPI_API_KEY,
        "q": f"{lat},{lon}"
    }
    try:
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        print(f"Error fetching WeatherAPI data for {city}: {e}")
        return None

def get_aqicn_data(city: str, lat: float, lon: float) -> dict:
    """Fetches air quality data from AQICN."""
    url = f"https://api.waqi.info/feed/geo:{lat};{lon}/"
    params = {
        "token": AQICN_API_KEY
    }
    try:
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        print(f"Error fetching AQICN data for {city}: {e}")
        return None

# --- Normalization & Validation ---

def normalize_data(raw_weather: dict, raw_aqi: dict) -> dict:
    """
    Validates raw API responses and transforms them into our
    single, unified CombinedIngestionModel.
    """
    try:
        # 1. Validate raw responses
        weather = WeatherAPIResponse(**raw_weather)
        aqi = AQICNResponse(**raw_aqi)

        # 2. Combine and normalize into our target schema
        combined_data = CombinedIngestionModel(
            source_api="WeatherAPI+AQICN",
            city=weather.location.name,
            lat=weather.location.lat,
            lon=weather.location.lon,
            temperature_celsius=weather.current.temp_c,
            feels_like_celsius=weather.current.feelslike_c,
            pressure_hpa=weather.current.pressure_mb,
            humidity_percent=weather.current.humidity,
            wind_speed_ms=round(weather.current.wind_kph * 1000 / 3600, 2), # Convert kph to m/s
            wind_direction_deg=weather.current.wind_degree,
            aqi=aqi.data.aqi,
            dominant_pollutant=aqi.data.dominentpol,
            api_timestamp=datetime.fromtimestamp(weather.current.last_updated_epoch, tz=timezone.utc)
        )
        
        # Return as a dictionary, ready for JSON serialization
        return combined_data.model_dump(mode="json")

    except ValidationError as e:
        print(f"Data validation error for {raw_weather.get('location', {}).get('name', 'Unknown')}: {e}")
        return None
    except Exception as e:
        print(f"Error normalizing data: {e}")
        return None

# --- Main Execution ---

def run_ingestion():
    """
    Main ingestion loop. Fetches data for all cities,
    normalizes it, and saves it to the raw data path.
    This function will be triggered by Airflow.
    """
    print(f"Starting ingestion run at {datetime.utcnow()} UTC...")
    all_data: List[Dict[str, Any]] = []

    for city, coords in CITIES.items():
        print(f"Fetching data for {city}...")
        raw_weather = get_weatherapi_data(city, **coords)
        raw_aqi = get_aqicn_data(city, **coords)

        if raw_weather and raw_aqi:
            normalized_data = normalize_data(raw_weather, raw_aqi)
            if normalized_data:
                all_data.append(normalized_data)
        
        time.sleep(1) # Small delay to avoid hammering APIs

    if not all_data:
        print("No data collected in this run.")
        return

    # Phase 1: Save to a timestamped JSON file in the raw directory
    run_timestamp = datetime.utcnow().strftime('%Y-%m-%dT%H-%M-%S')
    output_filename = f"ingestion_run_{run_timestamp}.json"
    output_path = RAW_DATA_PATH / output_filename

    try:
        with open(output_path, 'w') as f:
            json.dump(all_data, f, indent=2)
        print(f"Successfully saved raw data to {output_path}")
    except IOError as e:
        print(f"Error writing raw data to file: {e}")

if __name__ == "__main__":
    run_ingestion()
