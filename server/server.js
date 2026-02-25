import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import AQIData from './models/AQIData.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// --- Simple In-Memory Cache ---
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const cache = {
    sync: new Map(),
    snapshots: {
        data: null,
        timestamp: 0
    }
};

const getCacheKey = (lat, lon) => `${Math.round(lat * 100) / 100}_${Math.round(lon * 100) / 100}`;

const MONGODB_URI = process.env.MONGODB_URI;
let useMemoryStore = false;

if (MONGODB_URI) {
    mongoose.connect(MONGODB_URI)
        .then(() => console.log('✅ Connected to MongoDB Atlas'))
        .catch(err => {
            console.error('❌ MongoDB Connection Error:', err);
            useMemoryStore = true;
        });
} else {
    console.warn('⚠️ No MONGODB_URI provided. Using in-memory store.');
    useMemoryStore = true;
}

// In-memory fallback stores
const memoryData = [];
const addToMemory = (entry) => {
    memoryData.push(entry);
    if (memoryData.length > 100) memoryData.shift();
};

app.get('/api/health', (req, res) => res.json({ status: 'active', timestamp: new Date() }));
app.get('/api/ping', (req, res) => res.send('PONG'));

// --- Enhanced AQI Mapping Logic ---
const calculateAQIIndex = (usAqi) => {
    if (usAqi <= 50) return 1;       // Good
    if (usAqi <= 100) return 2;      // Moderate
    if (usAqi <= 150) return 3;      // Unhealthy for Sensitive Groups
    if (usAqi <= 200) return 4;      // Unhealthy
    return 5;                        // Very Unhealthy / Hazardous
};

app.post('/api/aqi/sync', async (req, res) => {
    const { lat, lon, locationName } = req.body;
    const API_KEY = process.env.OPENWEATHER_API_KEY;

    if (!lat || !lon) return res.status(400).json({ error: 'Lat/Lon required' });

    const cacheKey = getCacheKey(lat, lon);
    const cachedData = cache.sync.get(cacheKey);

    if (cachedData && (Date.now() - cachedData.timestamp < CACHE_DURATION)) {
        console.log('📡 Serving Sync data from cache:', cacheKey);
        return res.status(200).json(cachedData.payload);
    }

    try {
        console.log(`📡 Fetching data for ${locationName} (${lat}, ${lon})...`);
        const [weatherRes, aqiRes] = await Promise.all([
            axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,precipitation&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`, { timeout: 8000 }),
            axios.get(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,us_aqi&hourly=us_aqi&timezone=auto`, { timeout: 8000 })
        ]);

        console.log('✅ API calls successful');

        const currentWeather = weatherRes.data.current;
        const tempCelsius = currentWeather.temperature_2m;
        const humidity = currentWeather.relative_humidity_2m;
        const precipitation = currentWeather.precipitation;
        const meteoCurrent = aqiRes.data.current;

        // Calculate Daily Max US AQI from Hourly Data
        const hourly = aqiRes.data.hourly;
        const dailyAQI = { time: [], us_aqi_max: [] };

        if (hourly && hourly.time) {
            const days = {};
            hourly.time.forEach((t, i) => {
                const date = t.split('T')[0];
                if (!days[date]) days[date] = [];
                days[date].push(hourly.us_aqi[i]);
            });

            Object.keys(days).forEach(date => {
                dailyAQI.time.push(date);
                dailyAQI.us_aqi_max.push(Math.max(...days[date]));
            });
            console.log(`📊 Processed 7-day forecast for ${dailyAQI.time.length} days`);
        }

        // Fallback if us_aqi is null (unlikely but safe)
        const rawUsAqi = meteoCurrent.us_aqi || 0;
        const aqiIndex = calculateAQIIndex(rawUsAqi);

        // ... existing OpenWeather logic ...
        let openWeatherData = null;
        if (API_KEY && API_KEY !== 'your_openweather_api_key_here') {
            try {
                const owRes = await axios.get(`http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`, { timeout: 3000 });
                openWeatherData = owRes.data.list[0];
            } catch (e) {
                console.warn('OpenWeather skipped.');
            }
        }

        const newEntry = new AQIData({
            lat,
            lon,
            locationName: locationName || 'Global Node',
            aqi: aqiIndex,
            pollutants: {
                pm2_5: meteoCurrent.pm2_5,
                pm10: meteoCurrent.pm10,
                co: meteoCurrent.carbon_monoxide,
                no2: meteoCurrent.nitrogen_dioxide,
                o3: meteoCurrent.ozone,
                so2: meteoCurrent.sulphur_dioxide
            },
            temperature: tempCelsius,
            humidity: humidity,
            precipitation: precipitation
        });

        if (!useMemoryStore) {
            await newEntry.save();
        } else {
            addToMemory({ ...newEntry.toObject(), timestamp: new Date() });
        }

        const responsePayload = {
            consolidated: {
                ...newEntry.toObject(),
                raw_us_aqi: rawUsAqi,
                wind_speed: currentWeather.wind_speed_10m,
                wind_direction: currentWeather.wind_direction_10m,
                timestamp: new Date()
            },
            openWeather: openWeatherData,
            openMeteo: {
                airQuality: {
                    ...aqiRes.data,
                    daily: dailyAQI
                },
                weather: weatherRes.data
            }
        };

        // Update Cache
        cache.sync.set(cacheKey, {
            payload: responsePayload,
            timestamp: Date.now()
        });

        res.status(201).json(responsePayload);

    } catch (error) {
        console.error('Tele-Sync Error:', error.message);
        if (error.response) {
            console.error('API Response Error:', JSON.stringify(error.response.data, null, 2));
            if (error.response.status === 429 && cachedData) {
                console.warn('Rate limit hit. Responding with stale cache.');
                return res.status(200).json(cachedData.payload);
            }
        }
        res.status(500).json({ error: 'Atmospheric link failed. Retrying...' });
    }
});

app.get('/api/aqi/history', async (req, res) => {
    const { lat, lon } = req.query;
    try {
        if (!useMemoryStore) {
            let query = {};
            if (lat && lon) {
                query = {
                    lat: { $gt: parseFloat(lat) - 0.5, $lt: parseFloat(lat) + 0.5 },
                    lon: { $gt: parseFloat(lon) - 0.5, $lt: parseFloat(lon) + 0.5 }
                };
            }
            const history = await AQIData.find(query).sort({ timestamp: -1 }).limit(40);
            return res.json(history.reverse());
        } else {
            // Memory search
            const history = memoryData
                .filter(d => !lat || (Math.abs(d.lat - lat) < 0.5 && Math.abs(d.lon - lon) < 0.5))
                .slice(-40);
            return res.json(history);
        }
    } catch (error) {
        res.status(500).json({ error: 'History Retrieval Error' });
    }
});

app.get('/api/aqi/snapshots', async (req, res) => {
    if (cache.snapshots.data && (Date.now() - cache.snapshots.timestamp < CACHE_DURATION)) {
        console.log('📡 Serving Snapshots from cache');
        return res.json(cache.snapshots.data);
    }

    const cities = [
        { name: 'London', lat: 51.5074, lon: -0.1278 },
        { name: 'New York', lat: 40.7128, lon: -74.0060 },
        { name: 'Tokyo', lat: 35.6762, lon: 139.6503 },
        { name: 'Sydney', lat: -33.8688, lon: 151.2093 }
    ];

    try {
        const snapshots = await Promise.all(cities.map(async city => {
            const aqiRes = await axios.get(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${city.lat}&longitude=${city.lon}&current=us_aqi`, { timeout: 3000 });
            return {
                name: city.name,
                aqi: aqiRes.data.current.us_aqi,
                lat: city.lat,
                lon: city.lon
            };
        }));

        cache.snapshots.data = snapshots;
        cache.snapshots.timestamp = Date.now();

        res.json(snapshots);
    } catch (error) {
        console.error('Snapshot Retrieval Error:', error.message);
        if (cache.snapshots.data) {
            console.warn('Using stale snapshots due to error.');
            return res.json(cache.snapshots.data);
        }
        res.status(500).json({ error: 'Snapshot Retrieval Error' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 AirSense Core Syncing on Port ${PORT}`);
});

export default app;
