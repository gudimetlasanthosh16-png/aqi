# AirSense - Real-Time Zero-Config AQI Dashboard

AirSense is a production-ready Web application designed to monitor real-time Air Quality Index (AQI) data. It works **instantly without any API keys**, automatically detecting your location and providing deep atmospheric insights.

## 🌟 Zero-Config Features
- **Key-Free Operation**: Uses Open-Meteo for real-time Air Quality and Weather data. No signups required.
- **Smart Geocoding**: Search for any city globally using the integrated free geocoding engine.
- **Auto-Sync**: Automatically detects your street-level location via Browser GPS.
- **Historical Hive**: Stores all local trends in MongoDB for long-term monitoring.

## 🛠️ Tech Stack
- **Frontend**: React.js, Chart.js, Framer Motion, Lucide React.
- **Backend**: Node.js, Express, MongoDB.
- **APIs**: Open-Meteo (Weather & Air Quality), Geocoding API.

## 📦 Quick Start

### 1. Prerequisites
- [Node.js](https://nodejs.org/) installed.
- [MongoDB](https://www.mongodb.com/) running locally on `port 27017`.

### 2. Run
```bash
npm install
npm start
```

### 3. Usage
- On launch, the app will request location permission to show your local AQI.
- Use the **Search Bar** at the top to check the air quality of any city in the world.
- Navigate to **Telemetry** or **Analytics** for deep data visualization.

## 📁 Project Structure
- `/server`: Node.js backend with MongoDB models.
- `/src/hooks`: Custom data management hooks.
- `/src/components/Charts`: Integrated Chart.js visualizations.

---
Built for speed. Zero keys. Pure performance.
