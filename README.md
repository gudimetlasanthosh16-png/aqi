# BreatheSmart – Personal Air Exposure Tracker

BreatheSmart is a premium web application that helps you understand your personal exposure to air pollution. It calculates individual risk based on real-time AQI data and your outdoor activity duration.

## Features
- **City Search**: Fetch real-time AQI data for any city globally.
- **Exposure Calculation**: `Exposure Score = AQI × Hours Outside`.
- **Risk Assessment**: Visual indicators for Low, Medium, and High risk.
- **Health Tips**: Actionable advice based on current air quality.
- **Premium UI**: Glassmorphic design with smooth animations.

## Getting Started

### Prerequisites
- Node.js installed.
- OpenWeather API Key (Free tier).

### Setup
1. Clone the repository or download the files.
2. Install dependencies:
   ```bash
   npm install
   ```
3. **Important**: Add your OpenWeather API Key in `src/App.jsx`:
   ```javascript
   const API_KEY = "YOUR_API_KEY_HERE";
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

## Technical Stack
- **Frontend**: React (Vite)
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Styling**: Vanilla CSS (Modern CSS Variables & Glassmorphism)
- **Data Source**: OpenWeather Air Pollution API

## Calculation Logic
The app uses the following formula to determine your personal exposure:
```
Exposure Score = AQI Value (1-5) × Hours spent outside
```
- **Low Risk (0-10)**: Generally safe.
- **Medium Risk (11-30)**: Use caution for sensitive groups.
- **High Risk (>30)**: Avoid prolonged exposure.
