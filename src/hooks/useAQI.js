import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export const useAQI = () => {
    const [data, setData] = useState({ consolidated: null, openWeather: null, openMeteo: null });
    const [history, setHistory] = useState([]);
    const [snapshots, setSnapshots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Use a ref to store current coords to avoid effect loops
    const currentLocRef = useRef(null);

    const fetchAQI = useCallback(async (lat, lon, locationName = 'Current Location') => {
        try {
            setLoading(true);
            setError(null);

            console.log(`Syncing: ${API_BASE_URL}/aqi/sync | Snapshotting: ${API_BASE_URL}/aqi/snapshots`);
            const [syncRes, snapshotsRes] = await Promise.all([
                axios.post(`${API_BASE_URL}/aqi/sync`, { lat, lon, locationName }, { timeout: 10000 }),
                axios.get(`${API_BASE_URL}/aqi/snapshots`, { timeout: 5000 })
            ]);

            setData(syncRes.data);
            setSnapshots(snapshotsRes.data);
            currentLocRef.current = { lat, lon, name: locationName };

            const historyRes = await axios.get(`${API_BASE_URL}/aqi/history`, {
                params: { lat, lon },
                timeout: 5000
            });
            setHistory(historyRes.data);

        } catch (err) {
            console.error('Core Link Failure:', err.message);
            setError('Neural link disconnected. Retrying sync protocol...');

            if (!data.consolidated || data.consolidated.locationName.includes('Demo')) {
                const randomVariance = (Math.random() * 5).toFixed(1);
                setData({
                    consolidated: {
                        aqi: Math.floor(Math.random() * 3) + 1,
                        raw_us_aqi: Math.floor(Math.random() * 120) + 30,
                        pollutants: {
                            pm2_5: (8 + parseFloat(randomVariance)).toFixed(1),
                            pm10: (15 + parseFloat(randomVariance)).toFixed(1),
                            no2: 4, co: 210, o3: 30, so2: 5
                        },
                        temperature: 24 + Math.floor(Math.random() * 4),
                        humidity: 45 + Math.floor(Math.random() * 10),
                        precipitation: (Math.random() * 2).toFixed(1),
                        lat: lat || 28.61,
                        lon: lon || 77.20,
                        locationName: 'Demo Simulation (Syncing...)'
                    },
                    openWeather: null,
                    openMeteo: null
                });
                setSnapshots([
                    { name: 'London', aqi: 42 },
                    { name: 'New York', aqi: 55 },
                    { name: 'Tokyo', aqi: 38 },
                    { name: 'Sydney', aqi: 25 }
                ]);
            }
        } finally {
            setLoading(false);
        }
    }, [data.consolidated]);

    const initLocation = useCallback(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => fetchAQI(pos.coords.latitude, pos.coords.longitude),
                () => fetchAQI(28.6139, 77.2090, 'New Delhi (Default)')
            );
        } else {
            fetchAQI(28.6139, 77.2090, 'New Delhi (Default)');
        }
    }, [fetchAQI]);

    // Initial load
    useEffect(() => {
        initLocation();
    }, [initLocation]);

    // Refresh interval
    useEffect(() => {
        const interval = setInterval(() => {
            if (currentLocRef.current) {
                const { lat, lon, name } = currentLocRef.current;
                fetchAQI(lat, lon, name);
            }
        }, 5 * 60 * 1000);

        return () => clearInterval(interval);
    }, [fetchAQI]);

    return { data, history, snapshots, loading, error, refresh: initLocation, fetchAQI };
};
