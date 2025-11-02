from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime

class Location(BaseModel):
    """Reusable location sub-model"""
    city: str
    lat: float
    lon: float

class OpenWeatherMain(BaseModel):
    """Main weather data from OpenWeatherMap"""
    temp: float
    feels_like: float
    temp_min: float
    temp_max: float
    pressure: int
    humidity: int

class OpenWeatherWind(BaseModel):
    """Wind data from OpenWeatherMap"""
    speed: float
    deg: int
    gust: Optional[float] = None

class OpenWeatherResponse(BaseModel):
    """
    Pydantic model to validate the raw response from OpenWeatherMap.
    We only define the fields we actually care about.
    """
    coord: Location
    main: OpenWeatherMain
    wind: OpenWeatherWind
    dt: int # Timestamp from the API
    name: str # City name
    timezone: int # Shift in seconds from UTC

    @field_validator('name', 'coord')
    def check_location(cls, v, values):
        # Example of cross-field validation if needed
        # For now, just ensure 'name' is present
        if not v:
            raise ValueError("City name must be provided")
        return v

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
    pressure_hpa: int
    humidity_percent: int
    wind_speed_ms: float
    wind_direction_deg: int
    
    # Air Quality data
    aqi: int
    dominant_pollutant: str
    
    # Original API timestamp
    api_timestamp: datetime
