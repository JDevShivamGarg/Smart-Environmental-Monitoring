from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime

class WeatherAPILocation(BaseModel):
    name: str
    lat: float
    lon: float

class WeatherAPICurrent(BaseModel):
    temp_c: float
    feelslike_c: float
    pressure_mb: float
    humidity: int
    wind_kph: float
    wind_degree: int
    last_updated_epoch: int

class WeatherAPIResponse(BaseModel):
    location: WeatherAPILocation
    current: WeatherAPICurrent

class AQIData(BaseModel):
    """AQICN 'data' sub-model"""
    aqi: int
    idx: int
    dominentpol: str # Dominant pollutant

class AQICNResponse(BaseModel):
    """
    Pydantic model to validate the raw response from AQICN.
    """
    status: str
    data: AQIData

    @field_validator('status')
    def check_status_ok(cls, v):
        if v != 'ok':
            raise ValueError("API status was not 'ok'")
        return v

class CombinedIngestionModel(BaseModel):
    """
    A unified schema for our raw, ingested data before it's
    written to the data lake.
    """
    # Metadata
    ingestion_timestamp: datetime = Field(default_factory=datetime.utcnow)
    source_api: str

    # Location data
    city: str
    lat: float
    lon: float
    
    # Weather data
    temperature_celsius: float
    feels_like_celsius: float
    pressure_hpa: float
    humidity_percent: int
    wind_speed_ms: float
    wind_direction_deg: int
    
    # Air Quality data
    aqi: int
    dominant_pollutant: str
    
    # Original API timestamp
    api_timestamp: datetime
