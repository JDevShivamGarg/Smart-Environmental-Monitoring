# Smart Environmental Monitoring System

> A real-time environmental monitoring platform tracking air quality, weather, and environmental health across India with automated data ingestion, intelligent caching, and interactive visualization.

[![FastAPI](https://img.shields.io/badge/FastAPI-0.109.0-009688.svg?style=flat&logo=FastAPI)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19.1.1-61DAFB.svg?style=flat&logo=React)](https://reactjs.org)
[![Vite](https://img.shields.io/badge/Vite-7.1.7-646CFF.svg?style=flat&logo=Vite)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.18-38B2AC.svg?style=flat&logo=Tailwind-CSS)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E.svg?style=flat&logo=Supabase)](https://supabase.com)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg?style=flat&logo=Docker)](https://www.docker.com)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Project Structure](#-project-structure)
- [Performance](#-performance)
- [Contributing](#-contributing)

---

## 🌍 Overview

The **Smart Environmental Monitoring System** is a comprehensive full-stack application that provides real-time environmental data monitoring across 31+ cities in India. The system automatically fetches data from multiple weather and air quality APIs, stores it in a cloud database, and presents it through an intuitive, interactive web interface.

### Key Highlights

- **🔄 Automated ETL Pipeline**: Daily data ingestion at 12 PM from WeatherAPI and AQICN
- **📊 Interactive Dashboard**: Real-time charts, maps, and statistics
- **🗺️ Geographic Visualization**: Interactive Leaflet maps with color-coded metrics
- **🚨 Alert System**: Customizable threshold-based environmental alerts
- **⚡ Performance Optimized**: Intelligent caching reduces API calls by 99%
- **🔒 Rate Limited**: Protects backend with SlowAPI (30-100 req/min)
- **🐳 Production Ready**: Docker containerized with health checks
- **📱 Responsive Design**: Mobile-first UI with Tailwind CSS

### Coverage

Monitoring **31 cities** across all Indian States and Union Territories including New Delhi, Mumbai, Chennai, Kolkata, Bengaluru, and more.

### Metrics Tracked

- **Air Quality Index (AQI)**: Real-time pollution levels
- **Temperature**: Current and feels-like temperature (°C)
- **Humidity**: Relative humidity percentage
- **Wind Speed & Direction**: Meteorological data
- **Atmospheric Pressure**: Barometric pressure (hPa)
- **Dominant Pollutant**: Primary air pollutant (PM2.5, PM10, NO2, etc.)

---

## ✨ Features

### 🎯 Core Features

1. **Real-Time Dashboard**
   - Interactive charts (Line/Bar) with Recharts
   - City-based filtering
   - Sortable data tables
   - Live clock and countdown to next refresh
   - Gauge charts for key metrics

2. **Interactive Maps**
   - Leaflet-based geographic visualization
   - Color-coded markers by metric (AQI, Temp, Humidity, Wind)
   - City popups with detailed information
   - Metric selector dropdown

3. **Alert Management**
   - Customizable thresholds (Critical & Warning levels)
   - Real-time alert generation
   - Alert filtering and management
   - Toast notifications

4. **Statistical Analysis**
   - Descriptive statistics (mean, std, min, max, percentiles)
   - Correlation matrix visualization
   - Historical data trends

5. **Application Settings**
   - Theme toggle (Light/Dark)
   - Auto-refresh configuration
   - Chart type preferences
   - Notification settings

6. **Smart Caching**
   - Client-side localStorage caching (1-hour TTL)
   - Server-side cache control headers
   - Scheduled data refresh (12 PM daily)
   - 99% reduction in API calls

### 🔐 Security & Performance

- **Rate Limiting**: 30-100 requests/minute per endpoint
- **CORS Middleware**: Configurable cross-origin requests
- **Input Validation**: Pydantic schema validation
- **Gzip Compression**: Nginx compression for faster loads
- **Security Headers**: X-Frame-Options, X-Content-Type-Options, XSS Protection

---

## 🏗️ Architecture

```
Frontend (React) → Nginx Proxy → FastAPI Backend → Supabase DB
                                        ↓
                            WeatherAPI + AQICN (Daily at 12 PM)
```

### Data Flow

1. **Ingestion (Daily at 12 PM)**: ETL job fetches data from external APIs, validates, transforms, and stores in Supabase
2. **API Access**: Frontend requests data, rate limiter checks quota, backend queries database, returns JSON
3. **Client Rendering**: Checks cache first, uses cached data if fresh, otherwise fetches from API

---

## 🛠️ Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **Uvicorn** - ASGI server
- **Pandas** - Data manipulation
- **APScheduler** - Task scheduling
- **Pydantic** - Data validation
- **SlowAPI** - Rate limiting
- **Supabase-py** - Database client

### Frontend
- **React 19** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - CSS framework
- **Recharts** - Charting library
- **Leaflet** - Interactive maps
- **Framer Motion** - Animations
- **Axios** - HTTP client

### Database
- **Supabase** - PostgreSQL cloud database

### DevOps
- **Docker** - Containerization
- **Nginx** - Reverse proxy

---

## 🚀 Getting Started

### Prerequisites

- **Docker & Docker Compose** (Recommended)
- **OR** Node.js 20+ and Python 3.11+

### Environment Variables

Create `.env` file:

```env
WEATHERAPI_API_KEY=your_key
AQICN_API_KEY=your_key
SUPABASE_URL=your_url
SUPABASE_KEY=your_key
SUPABASE_PASSWORD=your_password
```

### Quick Start with Docker

```bash
# Clone repository
git clone <repository-url>
cd Smart-Environmental-Monitoring

# Create .env file with your credentials
nano .env

# Build and run
docker-compose up --build

# Access at http://localhost:3000
```

### Manual Setup

**Backend:**
```bash
cd serving
pip install -r requirements.txt
uvicorn main:app --reload
```

**Frontend:**
```bash
cd frontend/client
npm install
npm run dev
```

---

## 📡 API Documentation

### Endpoints

**Health Check**
```http
GET /api/health
Rate Limit: 100/min
```

**Get Data**
```http
GET /api/data
Rate Limit: 30/min
Returns: Latest 1000 records with cache headers
```

**Get Statistics**
```http
GET /api/stats
Rate Limit: 20/min
Returns: Descriptive stats and correlation matrix
```

Full API docs available at: `http://localhost:8000/docs`

---

## 🐳 Deployment

### Docker Production

```bash
docker-compose build
docker-compose up -d
docker-compose logs -f
```

### Database Setup

Create Supabase table:

```sql
CREATE TABLE environmental_data (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  city TEXT NOT NULL,
  lat DOUBLE PRECISION,
  lon DOUBLE PRECISION,
  temperature_celsius DOUBLE PRECISION,
  feels_like_celsius DOUBLE PRECISION,
  pressure_hpa DOUBLE PRECISION,
  humidity_percent DOUBLE PRECISION,
  wind_speed_ms DOUBLE PRECISION,
  wind_direction_deg INTEGER,
  aqi INTEGER,
  dominant_pollutant TEXT,
  api_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  ingestion_timestamp TIMESTAMP WITH TIME ZONE,
  source_api TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (city, api_timestamp)
);

CREATE INDEX idx_api_timestamp ON environmental_data (api_timestamp DESC);
```

---

## 📂 Project Structure

```
Smart-Environmental-Monitoring/
├── serving/              # Backend (FastAPI)
│   ├── main.py          # API + ETL pipeline
│   ├── data_models.py   # Validation models
│   └── requirements.txt
├── frontend/client/      # Frontend (React)
│   ├── src/
│   │   ├── pages/       # 7 pages
│   │   ├── components/  # 5 components
│   │   └── utils/       # Cache utility
│   └── package.json
├── docker-compose.yml
├── .env
├── README.md
└── PROJECT_TRACKER.md
```

---

## ⚡ Performance

### Caching Impact

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Calls/day | 144 | 1 | 99.3% ↓ |
| Bandwidth | 15 MB | 0.15 MB | 99% ↓ |
| Page load | 800ms | 50ms | 94% ↑ |

### Data Refresh

- **Schedule**: Daily at 12:00 PM
- **Duration**: ~35-40 seconds
- **Cities**: 31 fetched sequentially

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/name`
3. Commit changes: `git commit -m "Add feature"`
4. Push: `git push origin feature/name`
5. Create Pull Request

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🗺️ Roadmap

See [PROJECT_TRACKER.md](./PROJECT_TRACKER.md) for detailed progress and future plans.

**Recent Completions:**
- ✅ Rate limiting
- ✅ Intelligent caching
- ✅ Supabase integration
- ✅ Daily scheduling (12 PM)

**Planned:**
- 📋 Machine learning predictions
- 📋 WebSocket real-time updates
- 📋 Mobile app (React Native)
- 📋 Advanced 3D visualizations

---

<div align="center">

**Built with ❤️ for Environmental Monitoring**

[⬆ Back to Top](#smart-environmental-monitoring-system)

</div>
