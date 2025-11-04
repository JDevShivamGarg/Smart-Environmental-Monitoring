# Project Structure - Smart Environmental Monitoring System

## Directory Layout

```
Smart-Environmental-Monitoring/
├── serving/                      # Backend API service
│   ├── main.py                  # FastAPI application with ETL pipeline
│   ├── validation.py            # Pydantic models for data validation
│   ├── requirements.txt         # Python dependencies
│   └── Dockerfile               # Docker configuration for backend
│
├── frontend/                    # Frontend application directory
│   └── client/                  # React application
│       ├── src/
│       │   ├── components/     # Reusable React components
│       │   │   ├── Chart.jsx          # Dynamic chart component
│       │   │   ├── Clock.jsx          # Live clock display
│       │   │   ├── Data-table.jsx    # Sortable data table
│       │   │   ├── Header.jsx         # Navigation header with icons
│       │   │   └── SyncTimer.jsx      # Data sync countdown timer
│       │   ├── pages/          # Application pages
│       │   │   ├── Home.jsx           # Landing page with features
│       │   │   ├── Dashboard.jsx      # Main data dashboard
│       │   │   ├── Statistics.jsx     # Statistical analysis page
│       │   │   ├── Maps.jsx           # Geographic visualization
│       │   │   ├── Alerts.jsx         # Environmental alerts
│       │   │   ├── Settings.jsx       # Application settings
│       │   │   └── About.jsx          # Project information
│       │   ├── App.jsx         # Main application component
│       │   ├── main.jsx        # Application entry point
│       │   └── index.css       # Global styles
│       ├── public/             # Static assets
│       ├── package.json        # Node.js dependencies
│       ├── package-lock.json   # Locked dependency versions
│       ├── vite.config.js      # Vite build configuration
│       ├── postcss.config.js   # PostCSS configuration for Tailwind
│       ├── tailwind.config.js  # Tailwind CSS configuration
│       ├── nginx.conf          # Nginx configuration for production
│       ├── Dockerfile          # Docker configuration for frontend
│       └── .dockerignore       # Docker build exclusions
│
├── data/                       # Data storage directory
│   ├── raw/                   # Raw data from APIs
│   └── curated/               # Processed data in Parquet format
│
├── docker-compose.yml          # Docker Compose orchestration
├── .dockerignore              # Global Docker build exclusions
├── .env                       # Environment variables (not in git)
├── .gitignore                 # Git exclusions
├── README.md                  # Project documentation
├── CHECKPOINT.md              # Development progress tracking
└── PROJECT_STRUCTURE.md       # This file
```

## Key Files and Their Purpose

### Backend (serving/)
- **main.py**: Core FastAPI application that:
  - Runs automated ETL pipeline every 5 minutes
  - Fetches data from WeatherAPI and AQICN
  - Processes and stores data in Parquet format
  - Serves API endpoints (/api/data, /api/stats, /api/health)

- **validation.py**: Data validation models using Pydantic for:
  - WeatherAPI response validation
  - AQICN response validation
  - Combined data model

- **requirements.txt**: Python dependencies including FastAPI, pandas, etc.

### Frontend (frontend/client/)
- **src/pages/**: Seven main application pages:
  - Home: Landing page with features showcase
  - Dashboard: Real-time data visualization
  - Statistics: Advanced analytics and trends
  - Maps: Geographic data visualization
  - Alerts: Environmental alert management
  - Settings: Application configuration
  - About: Project information

- **src/components/**: Reusable UI components
- **package.json**: Node.js dependencies (React, Tailwind, Recharts, etc.)
- **nginx.conf**: Production web server configuration

### Docker Configuration
- **docker-compose.yml**: Orchestrates both services with:
  - Health checks
  - Environment variable management
  - Network isolation
  - Volume mounting

- **Dockerfiles**: Multi-stage builds for optimal production images

## Dependency Management

### Python Dependencies (Backend)
All Python dependencies are managed in `serving/requirements.txt`:
- fastapi, uvicorn[standard] - Web framework and ASGI server
- pandas, numpy, scipy - Data processing and analysis
- pyarrow - Parquet file handling
- apscheduler - Task scheduling for ETL automation
- python-dotenv - Environment variable management
- pydantic - Data validation and serialization
- requests - HTTP client for API calls

### Node.js Dependencies (Frontend)
All Node.js dependencies are managed in `frontend/client/package.json`:
- react (19.1.1), react-dom - Core UI framework
- react-router-dom (7.9.5) - Client-side routing
- axios (1.13.1) - HTTP client for API communication
- recharts (3.3.0) - Data visualization charts
- tailwindcss (3.4.0) - Utility-first CSS framework
- postcss, autoprefixer - CSS processing
- lucide-react (0.552.0) - Icon library
- framer-motion (12.23.24) - Animation library
- react-leaflet (5.0.0), leaflet (1.9.4) - Interactive maps
- react-hot-toast (2.6.0) - Toast notifications
- @headlessui/react (2.2.9) - Unstyled UI components
- vite (7.1.7) - Build tool and dev server
- @vitejs/plugin-react - React support for Vite

## Environment Variables
Required in `.env` file (root directory):
```
WEATHERAPI_API_KEY=your_key_here
AQICN_API_KEY=your_key_here
```

## Running the Application

### Local Development
```bash
# Backend
cd serving
pip install -r requirements.txt
python -m uvicorn main:app --reload

# Frontend
cd frontend/client
npm install
npm run dev
```

### Docker Production
```bash
docker-compose up --build
```

## Ports
- Backend API: http://localhost:8000
- Frontend: http://localhost:3000 (development) or http://localhost:3000 (Docker)