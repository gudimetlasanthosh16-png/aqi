import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink
} from 'react-router-dom';
import {
  LayoutDashboard,
  Activity,
  Map as MapIcon,
  TrendingUp,
  ShieldCheck,
  Settings,
  Search,
  Bell,
  Maximize2,
  Zap,
  MapPin,
  Wind,
  Navigation,
  Sun,
  Eye,
  Thermometer,
  X,
  Plus,
  Sparkles,
  Cpu,
  AlertOctagon,
  User,
  ChevronRight,
  Database,
  CloudLightning,
  Droplets,
  CloudRain
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Circle, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Hooks & Components
import { useAQI } from './hooks/useAQI';
import LineChart from './components/Charts/LineChart';
import BarChart from './components/Charts/BarChart';
import PieChart from './components/Charts/PieChart';

import './App.css';

const CONFIG = {
  AQI_DATA: {
    1: { label: 'Pristine Air', color: '#10b981', desc: 'The atmosphere is in optimal condition. Enjoy the fresh air.', advice: 'Perfect for outdoor exercise.' },
    2: { label: 'Moderate', color: '#f59e0b', desc: 'Air quality is acceptable but some pollutants may be present.', advice: 'Sensitive groups should limit exertion.' },
    3: { label: 'Unhealthy (S)', color: '#f97316', desc: 'Slight risk for sensitive individuals. Particulates climbing.', advice: 'Wear a mask if you have asthma.' },
    4: { label: 'Poor Quality', color: '#f43f5e', desc: 'Atmospheric conditions are degrading. Health risk detected.', advice: 'Avoid prolonged outdoor exposure.' },
    5: { label: 'Hazardous', color: '#a855f7', desc: 'Severe pollution level. High toxicity risk.', advice: 'Remain indoors with filters active.' }
  }
};

const App = () => {
  const { data, history, snapshots, loading, error, refresh, fetchAQI } = useAQI();
  const [isFocus, setIsFocus] = useState(false);
  const [search, setSearch] = useState("");
  const [chatOpen, setChatOpen] = useState(false);

  const handleSearch = async (e) => {
    if (e.key === 'Enter' && search) {
      try {
        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${search}&count=1&language=en&format=json`);
        const geoData = await geoRes.json();

        if (geoData.results && geoData.results.length > 0) {
          const { latitude, longitude, name } = geoData.results[0];
          fetchAQI(latitude, longitude, name);
          setSearch("");
        }
      } catch (err) {
        console.error("Geocoding failed:", err);
      }
    }
  };

  if (loading && !data.consolidated) return <LoadingSequence />;

  return (
    <Router>
      <div className="app-container">
        <div className="bg-mesh" />
        <div className="bg-grid" />

        <Sidebar />

        <main className="main-content">
          <TopBar
            search={search}
            setSearch={setSearch}
            handleSearch={handleSearch}
            setIsFocus={() => setIsFocus(true)}
          />

          <div className="page-wrapper">
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="error-banner glass"
                >
                  <AlertOctagon size={20} />
                  <span>{error}</span>
                  <button onClick={refresh} className="retry-btn">Force Sync</button>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<DashboardView data={data.consolidated} history={history} snapshots={snapshots} onRefresh={refresh} satelliteStatus={!error} />} />
                <Route path="/openweather" element={<OpenWeatherView data={data.openWeather} fallback={data.openMeteo} />} />
                <Route path="/openmeteo" element={<OpenMeteoView data={data.openMeteo} />} />
                <Route path="/analytics" element={<AnalyticsView data={data.consolidated} history={history} />} />
                <Route path="/map" element={<MapView />} />
                <Route path="/safety" element={<SafetyView aqi={data.consolidated?.aqi || 1} theme={CONFIG.AQI_DATA[data.consolidated?.aqi || 1]} />} />
              </Routes>
            </AnimatePresence>
          </div>
        </main>

        <BreatheAI chatOpen={chatOpen} setChatOpen={setChatOpen} />
        {isFocus && data.consolidated && (
          <CinematicFocus
            data={data.consolidated}
            setClose={() => setIsFocus(false)}
          />
        )}
      </div>
    </Router>
  );
};

// --- View Components ---
const GlobalPulse = ({ snapshots }) => (
  <div className="global-pulse-container glass">
    <div className="pulse-header mono">GLOBAL_PULSE_SNAPSHOT</div>
    <div className="pulse-grid">
      {snapshots && snapshots.length > 0 ? snapshots.map(city => (
        <div key={city.name} className="city-node">
          <span className="c-name">{city.name}</span>
          <span className="c-aqi mono" style={{ color: city.aqi > 100 ? '#f43f5e' : '#00f2fe' }}>{city.aqi}</span>
        </div>
      )) : (
        <div className="log-empty mono">WAKING_GLOBAL_SENSORS...</div>
      )}
    </div>
  </div>
);

const DashboardView = ({ data, history, snapshots, onRefresh, satelliteStatus }) => {
  const theme = CONFIG.AQI_DATA[data?.aqi || 1];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="dashboard-view"
    >
      <div className="hero-grid">
        <div className="glass card aqi-hero" style={{ '--accent': theme.color }}>
          <div className="card-glare" />
          <div className="hero-header">
            <div className="tag">
              <MapPin size={14} />
              <span>{data?.locationName || 'Local Node'}</span>
            </div>
            <button className="live-sync-btn glass" onClick={onRefresh}>
              <Zap size={14} />
              <span>REAL-TIME SYNC</span>
            </button>
          </div>

          <div className="aqi-main-display">
            <div className="satellite-status-pill glass">
              <CloudLightning size={12} color={satelliteStatus ? "#00f2fe" : "#f43f5e"} />
              <span className="mono">{satelliteStatus ? "ORBITAL_LINK_ONLINE" : "LINK_ERROR"}</span>
            </div>
            <div className="aqi-circle">
              <svg viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" className="track" />
                <motion.circle
                  cx="50" cy="50" r="42"
                  className="progress"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: (data?.aqi || 1) / 5 }}
                  transition={{ duration: 1.5, ease: "circOut" }}
                  style={{ stroke: theme.color, filter: `drop-shadow(0 0 10px ${theme.color})` }}
                />
              </svg>
              <div className="aqi-value-box">
                <span className="label">RAW US-AQI</span>
                <span className="value mono" style={{ fontSize: '4.5rem' }}>{data?.raw_us_aqi || data?.aqi || '-'}</span>
                <div className="raw-aqi-tag">
                  <small className="mono">INDEX LEVEL: {data?.aqi || 0}</small>
                </div>
              </div>
            </div>

            <div className="aqi-status-text">
              <motion.h1
                className="text-gradient"
                key={data?.aqi}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                {theme.label}
              </motion.h1>
              <p className="desc">{theme.desc}</p>
              <div className="aqi-suggestion glass">
                <ShieldCheck size={16} color={theme.color} />
                <span><strong>SAFE_ACTION:</strong> {theme.advice}</span>
              </div>
              <div className="update-meta">
                <span className="mono">LAST_SYNC: {new Date().toLocaleTimeString()}</span>
              </div>
              <div className="metric-pills">
                <div className="pill"><Database size={14} /> NO2: {data?.pollutants?.no2 || 0}</div>
                <div className="pill"><Sun size={14} /> O3: {data?.pollutants?.o3 || 0}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="glass card trend-card">
          <div className="card-header">
            <h3 className="heading">Atmospheric Pulse</h3>
          </div>
          <div className="chart-container">
            <LineChart data={history} color={theme.color} />
          </div>
        </div>

        <div className="metrics-grid">
          <MetricCard icon={<Thermometer />} label="THERMAL" value={data?.temperature || 0} unit="°C" />
          <MetricCard icon={<Droplets />} label="HUMIDITY" value={data?.humidity || 0} unit="%" />
          <MetricCard icon={<Wind />} label="PARTICULATES" value={data?.pollutants?.pm2_5 || 0} unit="µg/m³" />
          <MetricCard icon={<CloudRain />} label="PRECIPITATION" value={data?.precipitation || 0} unit="mm" />
        </div>
        <GlobalPulse snapshots={snapshots} />
      </div>
    </motion.div>
  );
};

const OpenWeatherView = ({ data, fallback }) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="page-content">
    <div className="api-view-header">
      <h2 className="page-title text-gradient">Satellite Telemetry</h2>
      <div className="provider-tag">{data ? 'OpenWeather v2.5' : 'Deep Atmospheric Depth'}</div>
    </div>
    {!data ? (
      <div className="telemetry-fallback-grid">
        <div className="glass card major-telemetry">
          <span className="label mono">ORBITAL_FALLBACK_LINK_ESTABLISHED</span>
          <div className="fallback-val-group">
            <span className="val mono">{fallback?.airQuality?.us_aqi || '-'}</span>
            <span className="unit">US-AQI</span>
          </div>
          <p className="fallback-desc">Utilizing secondary orbital sensors due to primary link restrictions.</p>
        </div>
        <div className="glass card sub-metrics">
          {fallback && Object.entries(fallback.airQuality).filter(([k]) => k !== 'us_aqi').map(([k, v]) => (
            <div key={k} className="sub-item">
              <span className="n mono">{k}</span>
              <span className="v mono">{v}</span>
            </div>
          ))}
        </div>
      </div>
    ) : (
      <div className="api-data-grid">
        <div className="glass card main-aqi-box">
          <span className="label">INDEX</span>
          <span className="val">{data.main.aqi}</span>
        </div>
        <div className="glass card pollutants-list">
          {Object.entries(data.components).map(([k, v]) => (
            <div key={k} className="p-item">
              <span className="p-name">{k.toUpperCase()}</span>
              <span className="p-val">{v} <small>µg/m³</small></span>
            </div>
          ))}
        </div>
      </div>
    )}
  </motion.div>
);

const OpenMeteoView = ({ data }) => {
  const getWmoIcon = (code) => {
    if (code <= 3) return <Sun size={20} />;
    if (code <= 48) return <Wind size={20} />;
    return <CloudLightning size={20} />;
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="page-content">
      <div className="api-view-header">
        <h2 className="page-title text-gradient">Met-Neural Analysis</h2>
        <div className="provider-tag">Science Cluster (Global)</div>
      </div>
      {!data ? (
        <div className="glass card error-box">
          <Cpu size={32} className="err-icon" />
          <p>Neural link failed. Establishing retry protocol...</p>
        </div>
      ) : (
        <div className="neural-hub-layout">
          <div className="api-data-grid">
            <div className="glass card weather-stats">
              <div className="header-flex">
                <h3>Climate Node</h3>
                <div className="pulse-tag">SCANNING</div>
              </div>
              <div className="stat-group">
                <div className="stat"><Thermometer size={20} /> {data.weather.temperature}°C</div>
                <div className="stat"><Wind size={20} /> {data.weather.windspeed} km/h</div>
              </div>

              <div className="forecast-matrix">
                {data.weather.daily?.time.map((t, i) => (
                  <div key={t} className="forecast-node glass">
                    <span className="day">{new Date(t).toLocaleDateString(undefined, { weekday: 'short' })}</span>
                    {getWmoIcon(data.weather.daily.weathercode[i])}
                    <span className="temp">{Math.round(data.weather.daily.temperature_2m_max[i])}°</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass card air-quality-stats">
              <h3>Atom Composition</h3>
              <div className="pollutant-integrity">
                <IntegrityBar label="PM2.5" val={data.airQuality.pm2_5} max={100} />
                <IntegrityBar label="PM10" val={data.airQuality.pm10} max={150} />
                <IntegrityBar label="CO" val={data.airQuality.carbon_monoxide} max={5000} />
                <IntegrityBar label="NO2" val={data.airQuality.nitrogen_dioxide} max={200} />
              </div>
            </div>
          </div>

          <div className="glass card global-neural-status">
            <div className="mono-header">ATMOSPHERIC_NEURAL_MAP_V2.1</div>
            <div className="neural-grid-visual">
              <div className="grid-dot" />
              <div className="grid-dot active" />
              <div className="grid-dot" />
              <div className="grid-dot active" />
              <div className="grid-dot" />
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

const IntegrityBar = ({ label, val, max }) => (
  <div className="integrity-item">
    <div className="integrity-meta">
      <span className="label mono">{label}</span>
      <span className="val mono">{val}</span>
    </div>
    <div className="bar-bg">
      <motion.div
        className="bar-fill"
        initial={{ width: 0 }}
        animate={{ width: `${Math.min((val / max) * 100, 100)}%` }}
        style={{ background: val > max ? 'var(--danger)' : 'var(--primary)' }}
      />
    </div>
  </div>
);

const AnalyticsView = ({ data, history }) => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="page-content analytics-page">
      <h2 className="page-title text-gradient">Forensic Data Analysis</h2>
      <div className="analytics-grid">
        <div className="glass card pollutant-bar">
          <div className="card-header"><h3 className="heading">Mass Composition</h3></div>
          <div className="chart-holder">
            {data && <BarChart pollutants={data.pollutants} />}
          </div>
        </div>
        <div className="glass card pollutant-pie">
          <div className="card-header"><h3 className="heading">Volume Density</h3></div>
          <div className="chart-holder">
            {data && <PieChart pollutants={data.pollutants} />}
          </div>
        </div>
      </div>
      <div className="glass card timeline-card" style={{ marginTop: '1.5rem' }}>
        <div className="card-header"><h3 className="heading">Historical Timeline</h3></div>
        <div className="chart-holder" style={{ height: '350px' }}>
          <LineChart data={history} color="#00f2fe" />
        </div>
      </div>
    </motion.div>
  );
};

// --- Sidebar ---

const Sidebar = () => (
  <nav className="sidebar glass">
    <div className="side-top">
      <div className="logo-box">
        <div className="logo-icon"><Zap fill="currentColor" size={24} /></div>
        <div className="logo-text">AIR<span>SENSE</span></div>
      </div>
      <div className="nav-links">
        <SideLink to="/" icon={<LayoutDashboard size={20} />} label="Global Center" />
        <SideLink to="/openweather" icon={<CloudLightning size={20} />} label="Satellite Link" />
        <SideLink to="/openmeteo" icon={<Cpu size={20} />} label="Neural Hub" />
        <SideLink to="/analytics" icon={<TrendingUp size={20} />} label="Deep Metrics" />
        <SideLink to="/map" icon={<MapIcon size={20} />} label="World Grid" />
      </div>
    </div>
    <div className="side-bottom">
      <SideLink to="/safety" icon={<ShieldCheck size={20} />} label="Protective Protocol" />
      <div className="user-short glass">
        <div className="avatar"><User size={20} /></div>
        <div className="info">
          <p className="name">User_Alpha</p>
          <p className="rank">Hive Pilot</p>
        </div>
      </div>
    </div>
  </nav>
);

// --- Minor Global Components ---

const SideLink = ({ to, icon, label }) => (
  <NavLink to={to} className={({ isActive }) => `side-link ${isActive ? 'active' : ''}`}>
    {icon} <span>{label}</span>
  </NavLink>
);

const TopBar = ({ search, setSearch, handleSearch, setIsFocus }) => (
  <header className="top-bar">
    <div className="search-wrapper glass">
      <Search size={20} className="search-icon" />
      <input
        placeholder="Synchronize with global location..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={handleSearch}
      />
      <div className="kbd glass">⌘ K</div>
    </div>
    <div className="top-actions">
      <button className="icon-btn glass" onClick={setIsFocus}><Maximize2 size={20} /></button>
      <button className="icon-btn glass"><Bell size={20} /><div className="notif-dot" /></button>
    </div>
  </header>
);

const MetricCard = ({ icon, label, value, unit }) => (
  <div className="glass card metric-card">
    <div className="m-icon">{icon}</div>
    <div className="m-data">
      <span className="m-label">{label}</span>
      <div className="m-val-group">
        <span className="m-val mono">{value}</span>
        <span className="m-unit">{unit}</span>
      </div>
    </div>
  </div>
);

const MapController = ({ lat, lon }) => {
  const map = useMapEvents({});
  useEffect(() => {
    if (lat && lon) {
      map.flyTo([lat, lon], 12, { duration: 1.5 });
    }
  }, [lat, lon, map]);
  return null;
};

const MapView = () => {
  const { data, fetchAQI, refresh } = useAQI();
  const theme = CONFIG.AQI_DATA[data.consolidated?.aqi || 1];
  const [activeLayers, setActiveLayers] = useState({
    labels: true,
    wind: false,
    humidity: false,
    aqi: false,
    storm: false
  });
  const [intercepts, setIntercepts] = useState([]);

  const toggleLayer = (layer) => {
    setActiveLayers(prev => ({ ...prev, [layer]: !prev[layer] }));
  };

  const MapEvents = () => {
    useMapEvents({
      click(e) {
        const timestamp = new Date().toLocaleTimeString();
        fetchAQI(e.latlng.lat, e.latlng.lng, `Lat: ${e.latlng.lat.toFixed(2)}, Lon: ${e.latlng.lng.toFixed(2)}`);
        setIntercepts(prev => [{
          id: Date.now(),
          lat: e.latlng.lat.toFixed(2),
          lon: e.latlng.lng.toFixed(2),
          time: timestamp
        }, ...prev].slice(0, 5));
      },
    });
    return null;
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="page-content map-page">
      <div className="api-view-header">
        <h2 className="page-title text-gradient">Global Mapping Index</h2>
        <div className="provider-tag">Interactive Neural Grid</div>
      </div>

      <div className="glass map-wrapper-v9">
        <MapContainer
          center={[data.consolidated?.lat || 20, data.consolidated?.lon || 0]}
          zoom={3}
          style={{ height: '100%', width: '100%', borderRadius: '20px' }}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.esri.com/">Esri</a>, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />

          {activeLayers.labels && (
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png"
              zIndex={100}
            />
          )}

          {/* Real-time Atmospheric Overlays */}
          {activeLayers.wind && (
            <TileLayer
              url="https://tiles.waqi.info/tiles/usepa-aqi/{z}/{x}/{y}.png?token=demo" // Using AQI as proxy for atmospheric flow if others are restricted
              opacity={0.6}
              zIndex={50}
            />
          )}

          {activeLayers.humidity && (
            <TileLayer
              url="https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/nexrad-n0r-900913/{z}/{x}/{y}.png"
              opacity={0.5}
              zIndex={60}
              attribution="Nexrad Radar Overlay"
            />
          )}

          {activeLayers.aqi && (
            <TileLayer
              url="https://tiles.aqicn.org/tiles/usepa-pm25/{z}/{x}/{y}.png?token=demo"
              opacity={0.7}
              zIndex={70}
            />
          )}

          <MapEvents />
          {data.consolidated && <MapController lat={data.consolidated.lat} lon={data.consolidated.lon} />}

          {data.consolidated && (
            <>
              <CircleMarker
                center={[data.consolidated.lat || 28.61, data.consolidated.lon || 77.20]}
                radius={12}
                pathOptions={{
                  fillColor: theme.color,
                  color: '#fff',
                  weight: 3,
                  fillOpacity: 0.9,
                  className: 'map-dot-marker'
                }}
              >
                <Popup className="aqi-popup">
                  <div className="popup-inner">
                    <div className="pop-header">
                      <Sparkles size={14} color={theme.color} />
                      <strong>{data.consolidated.locationName}</strong>
                    </div>
                    <div className="pop-metrics">
                      <div className="pop-item">
                        <span className="l">AQI</span>
                        <span className="v" style={{ color: theme.color }}>{data.consolidated.raw_us_aqi || data.consolidated.aqi}</span>
                      </div>
                      <div className="pop-item">
                        <span className="l">TEMP</span>
                        <span className="v">{data.consolidated.temperature}°C</span>
                      </div>
                    </div>
                  </div>
                </Popup>
              </CircleMarker>

              {/* Decorative nodes for "World Grid" feel */}
              {[...Array(15)].map((_, i) => {
                const randomLat = (Math.random() * 160) - 80;
                const randomLon = (Math.random() * 300) - 150;
                const colors = ['#00f2fe', '#f43f5e', '#10b981', '#f59e0b', '#c084fc'];
                const metricLabels = ['TEMP', 'AQI', 'HUM', 'WIND', 'CO2'];
                const color = colors[i % colors.length];

                return (
                  <CircleMarker
                    key={`node-${i}`}
                    center={[randomLat, randomLon]}
                    radius={5}
                    pathOptions={{
                      fillColor: color,
                      color: '#fff',
                      weight: 1,
                      fillOpacity: 0.7,
                    }}
                  >
                    <Popup className="aqi-popup">
                      <div className="popup-inner">
                        <div className="pop-header">
                          <Activity size={12} color={color} />
                          <strong>Global Node {i + 100}</strong>
                        </div>
                        <div className="pop-item">
                          <span className="l">{metricLabels[i % metricLabels.length]} LEVEL</span>
                          <span className="v" style={{ color }}>{Math.floor(Math.random() * 50) + 10}</span>
                        </div>
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}

              <Circle
                center={[data.consolidated.lat, data.consolidated.lon]}
                radius={150000}
                pathOptions={{
                  fillColor: theme.color,
                  color: theme.color,
                  weight: 1,
                  fillOpacity: 0.15,
                  dashArray: '5, 10'
                }}
              />
            </>
          )}
        </MapContainer>

        <div className="map-overlay-info glass">
          <Navigation size={16} />
          <span>Orbital Telemetry Active</span>
        </div>

        <div className="weather-deck glass">
          <div className="deck-header">
            <CloudLightning size={16} />
            <span>ATMOSPHERIC STACK</span>
          </div>
          <div className="layer-controls">
            <button className={activeLayers.labels ? 'active' : ''} onClick={() => toggleLayer('labels')}>
              <MapIcon size={14} /> LABELS
            </button>
            <button className={activeLayers.wind ? 'active' : ''} onClick={() => toggleLayer('wind')}>
              <Wind size={14} /> WIND FLOW
            </button>
            <button className={activeLayers.humidity ? 'active' : ''} onClick={() => toggleLayer('humidity')}>
              <CloudLightning size={14} /> RADAR / STORM
            </button>
            <button className={activeLayers.aqi ? 'active' : ''} onClick={() => toggleLayer('aqi')}>
              <Activity size={14} /> AQI HEATMAP
            </button>
          </div>
        </div>

        <div className="intercept-log glass">
          <div className="log-header mono">NEURAL_INTERCEPT_LOG</div>
          <div className="log-entries">
            {intercepts.length === 0 ? (
              <div className="log-empty mono">WAITING_FOR_INTERACTION...</div>
            ) : (
              intercepts.map(log => (
                <div key={log.id} className="log-entry">
                  <span className="log-time mono">[{log.time}]</span>
                  <span className="log-coords mono">{log.lat}, {log.lon}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <button
          className="map-recenter-btn glass"
          onClick={refresh}
          title="Recenter Map"
        >
          <MapPin size={20} />
        </button>
      </div>
    </motion.div>
  );
};

const SafetyView = ({ aqi, theme }) => {
  const currentTheme = theme || CONFIG.AQI_DATA[1];
  const safetyLevel = aqi || 1;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="page-content">
      <h2 className="page-title text-gradient">Atmospheric Safety</h2>
      <div className="safety-grid">
        <div className="glass card major-tip" style={{ borderColor: currentTheme.color }}>
          <div className="tip-header">
            <AlertOctagon size={64} color={currentTheme.color} />
            <div className="tip-title">
              <span className="l mono">SAFETY_LEVEL_{safetyLevel}</span>
              <h3 style={{ fontSize: '2.5rem' }}>{currentTheme.label}</h3>
            </div>
          </div>
          <p className="tip-desc">{currentTheme.desc}</p>
          <div className="protocol-box glass">
            <div className="p-head mono">PROTECTIVE_PROTOCOL</div>
            <p>{currentTheme.advice}</p>
          </div>
        </div>

        <div className="glass card health-impact">
          <h3 className="mono">BIOMETRIC_IMPACT_ANALYSIS</h3>
          <div className="impact-list">
            <div className="impact-item">
              <Activity size={16} />
              <span>Respiratory resistance increased by {safetyLevel * 5}%</span>
            </div>
            <div className="impact-item">
              <Wind size={16} />
              <span>Particle filtration requirement: {safetyLevel > 2 ? 'CLASS_N95' : 'NOMINAL'}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const CinematicFocus = ({ data, setClose }) => {
  const theme = CONFIG.AQI_DATA[data.aqi] || CONFIG.AQI_DATA[1];
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="cinematic-overlay">
      <button className="close-btn" onClick={setClose}><X size={48} /></button>
      <div className="focus-content">
        <motion.p initial={{ tracking: '2px' }} animate={{ tracking: '24px' }}>TELEMETRY_STREAM_ACTIVE</motion.p>
        <motion.h1 initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="mono">{data.aqi}</motion.h1>
        <h2 className="text-gradient" style={{ fontSize: '4rem' }}>{theme.label}</h2>
      </div>
    </motion.div>
  );
};

const BreatheAI = ({ chatOpen, setChatOpen }) => (
  <div className={`ai-assistant ${chatOpen ? 'open' : ''}`}>
    <button className="ai-trigger glass" onClick={() => setChatOpen(!chatOpen)}>
      <Sparkles size={28} />
    </button>
    <div className="ai-window glass">
      <div className="ai-header">
        <span className="mono">AI_CO_PILOT_v9</span>
        <button onClick={() => setChatOpen(false)}><X size={16} /></button>
      </div>
      <div className="ai-body">
        <div className="bubble bot">Satellite links stable. All metrics reporting within expected parameters. How can I assist?</div>
      </div>
      <div className="ai-input">
        <input placeholder="Query Hive Intelligence..." />
        <Plus size={18} />
      </div>
    </div>
  </div>
);

const LoadingSequence = () => (
  <div className="loader-screen">
    <div className="loader-wrap">
      <div className="loader-ring" />
      <Cpu size={40} className="cpu-icon" />
    </div>
    <span className="mono">ESTABLISHING NEURAL LINK...</span>
  </div>
);

export default App;
