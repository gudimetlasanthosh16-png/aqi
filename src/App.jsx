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
  CloudRain,
  Menu
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
import RadarChart from './components/Charts/RadarChart';
import WindGauge from './components/Charts/WindGauge';
import PolarAreaChart from './components/Charts/PolarAreaChart';

import { useTranslation } from 'react-i18next';
import './App.css';

const LanguageSelector = () => {
  const { i18n } = useTranslation();
  const languages = [
    { code: 'en', label: 'English' },
    { code: 'te', label: 'తెలుగు' },
    { code: 'hi', label: 'हिन्दी' },
    { code: 'ta', label: 'தமிழ்' },
    { code: 'mr', label: 'मराठी' },
    { code: 'ml', label: 'മലയാളം' }
  ];

  return (
    <div className="language-selector glass">
      <select
        value={i18n.language}
        onChange={(e) => i18n.changeLanguage(e.target.value)}
        className="lang-select"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.label}
          </option>
        ))}
      </select>
    </div>
  );
};

const CONFIG = {
  AQI_DATA: {
    1: { key: 'pristine', color: '#10b981' },
    2: { key: 'moderate', color: '#f59e0b' },
    3: { key: 'unhealthy', color: '#f97316' },
    4: { key: 'poor', color: '#f43f5e' },
    5: { key: 'hazardous', color: '#a855f7' }
  }
};

const API_BASE_URL = ['localhost', '127.0.0.1', '0.0.0.0'].includes(window.location.hostname) || window.location.hostname.startsWith('192.168.')
  ? 'http://localhost:5000/api'
  : '/api';

const App = () => {
  const { t } = useTranslation();
  const { data, history, snapshots, loading, error, refresh, fetchAQI } = useAQI();
  const [isFocus, setIsFocus] = useState(false);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);

  // User Registration State
  const [userData, setUserData] = useState(null);
  const [showRegModal, setShowRegModal] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('aqi_user_data');
    if (savedUser) {
      setUserData(JSON.parse(savedUser));
    } else {
      setShowRegModal(true);
    }
  }, []);

  // Debounced Search Effects
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (search.length > 2) {
        setIsSearching(true);
        try {
          const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${search}&count=5&language=en&format=json`);
          const geoData = await geoRes.json();
          setSearchResults(geoData.results || []);
        } catch (err) {
          console.error("Geocoding failed:", err);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  // Fetch Recent Searches
  const fetchRecent = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/search/recent`);
      const data = await res.json();
      setRecentSearches(data);
    } catch (err) {
      console.warn("Recent searches fetch failed.");
    }
  };

  useEffect(() => {
    fetchRecent();
  }, [data.consolidated]);

  const selectLocation = (loc) => {
    fetchAQI(loc.latitude, loc.longitude, loc.name);
    setSearch("");
    setSearchResults([]);
  };

  const handleSearchKey = (e) => {
    if (e.key === 'Enter' && searchResults.length > 0) {
      selectLocation(searchResults[0]);
    }
  };

  if (loading && !data.consolidated) return <LoadingSequence />;

  return (
    <Router>
      <div className="app-container">
        <div className="bg-mesh" />
        <div className="bg-grid" />
        <div className="bg-scanning" />
        <div className="matrix-overlay" />

        <div className={`sidebar-overlay ${isSidebarOpen ? 'active' : ''}`} onClick={() => setIsSidebarOpen(false)} />
        <Sidebar
          isOpen={isSidebarOpen}
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          userData={userData}
          recentSearches={recentSearches}
          onHistorySelect={(lat, lon, name) => fetchAQI(lat, lon, name)}
        />

        <main className={`main-content ${!isSidebarOpen ? 'sidebar-closed' : ''}`}>
          <TopBar
            search={search}
            setSearch={setSearch}
            handleSearch={handleSearchKey}
            results={searchResults}
            isSearching={isSearching}
            onSelect={selectLocation}
            setIsFocus={() => setIsFocus(true)}
            locationName={data.consolidated?.locationName}
            toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
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
                  <button onClick={refresh} className="retry-btn">{t('common.force_sync')}</button>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<DashboardView data={data.consolidated} history={history} snapshots={snapshots} onRefresh={refresh} satelliteStatus={!error} openMeteo={data.openMeteo} />} />
                <Route path="/openweather" element={<OpenWeatherView data={data.openWeather} fallback={data.openMeteo} />} />
                <Route path="/openmeteo" element={<OpenMeteoView data={data.openMeteo} />} />
                <Route path="/analytics" element={<AnalyticsView data={data.consolidated} history={history} />} />
                <Route path="/map" element={<MapView data={data} fetchAQI={fetchAQI} refresh={refresh} />} />
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

        {showRegModal && (
          <RegistrationModal
            onComplete={(data) => {
              setUserData(data);
              setShowRegModal(false);
            }}
          />
        )}
      </div>
    </Router>
  );
};

// --- View Components ---
const GlobalPulse = ({ snapshots }) => {
  const { t } = useTranslation();
  return (
    <div className="global-pulse-container glass">
      <div className="pulse-header mono">{t('dashboard.hive_interface')}</div>
      <div className="pulse-grid">
        {snapshots && snapshots.length > 0 ? snapshots.map(city => (
          <div key={city.name} className="city-node">
            <span className="c-name">{city.name}</span>
            <span className="c-aqi mono" style={{ color: city.aqi > 100 ? '#f43f5e' : '#00f2fe' }}>{city.aqi}</span>
          </div>
        )) : (
          <div className="log-empty mono">{t('dashboard.waking_sensors')}</div>
        )}
      </div>
    </div>
  );
};

const DashboardView = ({ data, history, snapshots, onRefresh, satelliteStatus, openMeteo }) => {
  const { t } = useTranslation();
  const theme = CONFIG.AQI_DATA[data?.aqi || 1];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="dashboard-view"
    >
      <div className="welcome-section">
        <h2 className="mono section-label">{t('dashboard.hive_interface')}</h2>
        <h1 className="text-gradient intro-title">{t('dashboard.welcome')}</h1>
        <p className="intro-subtitle">{t('dashboard.subtitle')}</p>
      </div>

      <div className="hero-grid">
        {/* Main AQI Hero */}
        <div className="glass card aqi-hero" style={{ '--accent': theme.color }}>
          <div className="card-glare" />
          <div className="hero-header">
            <div className="tag">
              <MapPin size={14} />
              <span>{data?.locationName || t('search.active_node')}</span>
            </div>
            <button className="live-sync-btn glass" onClick={onRefresh}>
              <Zap size={14} />
              <span>{t('dashboard.sync')}</span>
            </button>
          </div>

          <div className="aqi-main-display">
            <div className="satellite-status-pill glass">
              <CloudLightning size={12} color={satelliteStatus ? "#00f2fe" : "#f43f5e"} />
              <span className="mono">{satelliteStatus ? t('dashboard.orbital_online') : t('dashboard.link_error')}</span>
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
                <span className="label">{t('dashboard.raw_aqi')}</span>
                <span className="value mono" style={{ fontSize: '4.5rem' }}>{data?.raw_us_aqi || data?.aqi || '-'}</span>
                <div className="raw-aqi-tag">
                  <small className="mono">{t('dashboard.index_level')}: {data?.aqi || 0}</small>
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
                {t(`aqi.${theme.key}.label`)}
              </motion.h1>
              <p className="desc">{t(`aqi.${theme.key}.desc`)}</p>
              <div className="aqi-suggestion glass">
                <ShieldCheck size={16} color={theme.color} />
                <span><strong>{t('dashboard.safe_action')}:</strong> {t(`aqi.${theme.key}.advice`)}</span>
              </div>
              <div className="update-meta">
                <span className="mono">{t('dashboard.last_sync')}: {new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Wind Visualizer */}
        <div className="glass card wind-card">
          <WindGauge speed={data?.wind_speed || 12} direction={data?.wind_direction || 45} />
        </div>

        {/* Composition Radar */}
        <div className="glass card radar-card">
          <div className="card-header">
            <h3 className="heading">{t('dashboard.pollutant_fingerprint')}</h3>
          </div>
          <div className="chart-holder-sm">
            {data?.pollutants && <RadarChart pollutants={data.pollutants} />}
          </div>
        </div>

        {/* Atmosphere Pulse Chart */}
        <div className="glass card trend-card-v2">
          <div className="card-header">
            <h3 className="heading">{t('dashboard.atmospheric_chronology')}</h3>
            <div className="chart-legend">
              <div className="leg-item"><span className="dot" style={{ background: theme.color }}></span> Current Pulse</div>
            </div>
          </div>
          <div className="chart-container-main">
            <LineChart data={history} color={theme.color} />
          </div>
        </div>

        {/* Pollutant Dominance Polar Area */}
        <div className="glass card polar-card">
          <div className="card-header">
            <h3 className="heading">{t('dashboard.atom_distribution')}</h3>
          </div>
          <div className="chart-holder-sm">
            {data?.pollutants && <PolarAreaChart pollutants={data.pollutants} />}
          </div>
        </div>

        {/* Top-Level Metrics */}
        <div className="metrics-grid">
          <MetricCard icon={<Thermometer />} label={t('metrics.thermal')} value={data?.temperature || 0} unit="°C" />
          <MetricCard icon={<Droplets />} label={t('metrics.humidity')} value={data?.humidity || 0} unit="%" />
          <MetricCard icon={<Wind />} label={t('metrics.particulates')} value={data?.pollutants?.pm2_5 || 0} unit="µg/m³" />
          <MetricCard icon={<CloudRain />} label={t('metrics.precipitation')} value={data?.precipitation || 0} unit="mm" />
        </div>

        {/* Forecast & Global Snapshots */}
        <WeeklyAQI dailyData={openMeteo?.airQuality?.daily} />
        <GlobalPulse snapshots={snapshots} />
      </div>
    </motion.div>
  );
};

const OpenWeatherView = ({ data, fallback }) => {
  const { t } = useTranslation();
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="page-content">
      <div className="api-view-header">
        <h2 className="page-title text-gradient">{t('views.satellite_telemetry')}</h2>
        <div className="provider-tag">{data ? 'OpenWeather v2.5' : 'Deep Atmospheric Depth'}</div>
      </div>
      {!data ? (
        <div className="telemetry-fallback-grid">
          <div className="glass card major-telemetry">
            <span className="label mono">ORBITAL_FALLBACK_LINK_ESTABLISHED</span>
            <div className="fallback-val-group">
              <span className="val mono">{fallback?.airQuality?.current?.us_aqi || '-'}</span>
              <span className="unit">US-AQI</span>
            </div>
            <p className="fallback-desc">Utilizing secondary orbital sensors due to primary link restrictions.</p>
          </div>
          <div className="glass card sub-metrics">
            {fallback?.airQuality?.current && Object.entries(fallback.airQuality.current).filter(([k]) => k !== 'us_aqi').map(([k, v]) => (
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
};

const OpenMeteoView = ({ data }) => {
  const { t } = useTranslation();
  const getWmoIcon = (code) => {
    if (code <= 3) return <Sun size={20} />;
    if (code <= 48) return <Wind size={20} />;
    return <CloudLightning size={20} />;
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="page-content">
      <div className="api-view-header">
        <h2 className="page-title text-gradient">{t('views.met_neural_analysis')}</h2>
        <div className="provider-tag">Science Cluster (Global)</div>
      </div>
      {!data || !data.weather || !data.airQuality ? (
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
                <div className="stat"><Thermometer size={20} /> {data.weather.current?.temperature_2m}°C</div>
                <div className="stat"><Wind size={20} /> {data.weather.current?.wind_speed_10m} km/h</div>
              </div>

              <div className="forecast-matrix">
                {data.weather.daily?.time.map((timeStr, i) => (
                  <div key={timeStr} className="forecast-node glass">
                    <span className="day">{new Date(timeStr).toLocaleDateString(undefined, { weekday: 'short' })}</span>
                    {getWmoIcon(data.weather.daily.weathercode[i])}
                    <span className="temp">{Math.round(data.weather.daily.temperature_2m_max[i])}°</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass card air-quality-stats">
              <h3>Atom Composition</h3>
              <div className="pollutant-integrity">
                <IntegrityBar label="PM2.5" val={data.airQuality.current?.pm2_5} max={100} />
                <IntegrityBar label="PM10" val={data.airQuality.current?.pm10} max={150} />
                <IntegrityBar label="CO" val={data.airQuality.current?.carbon_monoxide} max={5000} />
                <IntegrityBar label="NO2" val={data.airQuality.current?.nitrogen_dioxide} max={200} />
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

const WeeklyAQI = ({ dailyData }) => {
  const { t } = useTranslation();
  if (!dailyData || !dailyData.time) return null;

  const calculateLevel = (usAqi) => {
    if (usAqi <= 50) return 1;
    if (usAqi <= 100) return 2;
    if (usAqi <= 150) return 3;
    if (usAqi <= 200) return 4;
    return 5;
  };

  return (
    <div className="glass card weekly-aqi-card">
      <div className="card-header">
        <h3 className="heading">{t('dashboard.forecast')}</h3>
      </div>
      <div className="weekly-forecast-grid">
        {dailyData.time.map((date, i) => {
          const aqi = dailyData.us_aqi_max[i];
          const level = calculateLevel(aqi);
          const theme = CONFIG.AQI_DATA[level] || CONFIG.AQI_DATA[1];
          const isToday = i === 0;

          return (
            <div key={date} className={`forecast-day-node glass ${isToday ? 'today' : ''}`}>
              <span className="day-name mono">{new Date(date).toLocaleDateString(undefined, { weekday: 'short' }).toUpperCase()}</span>
              <div className="aqi-meter">
                <div
                  className="aqi-fill"
                  style={{
                    height: `${Math.min((aqi / 300) * 100, 100)}%`,
                    backgroundColor: theme.color,
                    boxShadow: `0 0 15px ${theme.color}`
                  }}
                />
              </div>
              <div className="aqi-val-box">
                <span className="val mono">{aqi}</span>
                <span className="label" style={{ color: theme.color }}>{t(`aqi.${theme.key}.label`).split(' ')[0]}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
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
  const { t } = useTranslation();
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="page-content analytics-page">
      <h2 className="page-title text-gradient">{t('views.forensic_data_analysis')}</h2>
      <div className="analytics-grid">
        <div className="glass card pollutant-bar">
          <div className="card-header"><h3 className="heading">{t('dashboard.pollutant_fingerprint')}</h3></div>
          <div className="chart-holder">
            {data && <BarChart pollutants={data.pollutants} />}
          </div>
        </div>
        <div className="glass card pollutant-pie">
          <div className="card-header"><h3 className="heading">{t('dashboard.atom_distribution')}</h3></div>
          <div className="chart-holder">
            {data && <PieChart pollutants={data.pollutants} />}
          </div>
        </div>
      </div>
      <div className="glass card timeline-card" style={{ marginTop: '1.5rem' }}>
        <div className="card-header"><h3 className="heading">{t('dashboard.atmospheric_chronology')}</h3></div>
        <div className="chart-holder" style={{ height: '350px' }}>
          <LineChart data={history} color="#00f2fe" />
        </div>
      </div>
    </motion.div>
  );
};

const Sidebar = ({ isOpen, toggleSidebar, userData, recentSearches, onHistorySelect }) => {
  const { t } = useTranslation();
  return (
    <nav className={`sidebar glass ${isOpen ? 'open' : 'closed'}`}>
      <div className="side-top">
        <div className="side-header">
          <div className="logo-box">
            <div className="logo-icon"><Zap fill="currentColor" size={24} /></div>
            <div className="logo-text">BREATHE<span>SMART</span></div>
          </div>
          <button className="close-sidebar-btn glass" onClick={toggleSidebar}>
            <X size={20} />
          </button>
        </div>
        <div className="nav-links">
          <SideLink to="/" icon={<LayoutDashboard size={20} />} label={t('nav.global_center')} onClick={toggleSidebar} />
          <SideLink to="/openweather" icon={<CloudLightning size={20} />} label={t('nav.satellite_link')} onClick={toggleSidebar} />
          <SideLink to="/openmeteo" icon={<Cpu size={20} />} label={t('nav.neural_hub')} onClick={toggleSidebar} />
          <SideLink to="/analytics" icon={<TrendingUp size={20} />} label={t('nav.deep_metrics')} onClick={toggleSidebar} />
          <SideLink to="/map" icon={<MapIcon size={20} />} label={t('nav.world_grid')} onClick={toggleSidebar} />
        </div>

        <div className="search-history-section">
          <div className="history-header mono">
            <Eye size={14} /> RECENT_SEARCHES
          </div>
          <div className="history-list">
            {recentSearches.length > 0 ? recentSearches.map((item, idx) => (
              <div
                key={idx}
                className="history-node glass"
                onClick={() => {
                  onHistorySelect(item.lat, item.lon, item.locationName);
                  toggleSidebar();
                }}
              >
                <div className="h-top">
                  <span className="loc-name mono">{item.locationName}</span>
                  <span className="temp mono">{Math.round(item.temperature)}°C</span>
                </div>
                <div className="h-bottom">
                  <div className="aqi-indicator" style={{ background: CONFIG.AQI_DATA[item.aqi]?.color || '#fff' }} />
                  <span className="aqi-val mono">AQI: {item.aqi}</span>
                </div>
              </div>
            )) : <p className="mono empty-text">NO_NODES_CAPTURED</p>}
          </div>
        </div>
      </div>
      <div className="side-bottom">
        <SideLink to="/safety" icon={<ShieldCheck size={20} />} label={t('nav.protective_protocol')} onClick={toggleSidebar} />
        <div className="user-short glass">
          <div className="avatar-wrapper">
            <div className="avatar glass"><User size={20} /></div>
            <div className="status-dot pulsing" />
          </div>
          <div className="info">
            <p className="name">{userData ? userData.name : t('common.user')}</p>
            <p className="rank mono">{t('common.rank')}</p>
          </div>
          <div className="user-actions">
            <Settings size={16} className="settings-icon" />
          </div>
        </div>
      </div>
    </nav>
  );
};

const SideLink = ({ to, icon, label, onClick }) => (
  <NavLink to={to} className={({ isActive }) => `side-link ${isActive ? 'active' : ''}`} onClick={onClick}>
    {icon} <span>{label}</span>
  </NavLink>
);

const TopBar = ({ search, setSearch, handleSearch, results, isSearching, onSelect, setIsFocus, locationName, toggleSidebar }) => {
  const { t } = useTranslation();
  return (
    <header className="top-bar">
      <div className="top-bar-left">
        <button className="menu-toggle-btn glass" onClick={toggleSidebar}>
          <Menu size={24} />
        </button>
        <div className="active-location-box glass">
          <div className="loc-indicator">
            <div className="dot pulsing" />
            <span className="mono">{t('search.active_node')}</span>
          </div>
          <h3 className="current-location-name">{locationName || t('search.syncing')}</h3>
        </div>
      </div>

      <div className="search-container">
        <div className="search-wrapper glass">
          <Search size={20} className={`search-icon ${isSearching ? 'pulsing' : ''}`} />
          <input
            placeholder={t('search.placeholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearch}
          />
          <div className="kbd glass">⌘ K</div>
        </div>

        <AnimatePresence>
          {results.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="search-results-dropdown glass"
            >
              {results.map((loc) => (
                <div
                  key={loc.id}
                  className="result-item"
                  onClick={() => onSelect(loc)}
                >
                  <MapPin size={14} />
                  <div className="res-info">
                    <span className="res-name">{loc.name}</span>
                    <span className="res-country">{loc.country}, {loc.admin1}</span>
                  </div>
                  <ChevronRight size={14} className="arrow" />
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="top-actions">
        <LanguageSelector />
        <button className="icon-btn glass" onClick={setIsFocus}><Maximize2 size={20} /></button>
        <button className="icon-btn glass"><Bell size={20} /><div className="notif-dot" /></button>
      </div>
    </header>
  );
};

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

const MapEvents = ({ fetchAQI, setIntercepts }) => {
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

const MapView = ({ data, fetchAQI, refresh }) => {
  const { t } = useTranslation();
  const theme = CONFIG.AQI_DATA[data.consolidated?.aqi || 1];
  const [activeLayers, setActiveLayers] = useState({
    labels: true,
    wind: false,
    humidity: false,
    aqi: false,
    storm: false
  });
  const [intercepts, setIntercepts] = useState([]);

  const decorativeNodes = React.useMemo(() => {
    return [...Array(15)].map((_, i) => ({
      id: `node-${i}`,
      lat: (Math.random() * 160) - 80,
      lon: (Math.random() * 300) - 150,
      color: ['#00f2fe', '#f43f5e', '#10b981', '#f59e0b', '#c084fc'][i % 5],
      metricLabel: ['TEMP', 'AQI', 'HUM', 'WIND', 'CO2'][i % 5]
    }));
  }, []);

  const toggleLayer = (layer) => {
    setActiveLayers(prev => ({ ...prev, [layer]: !prev[layer] }));
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="page-content map-page">
      <div className="api-view-header">
        <h2 className="page-title text-gradient">{t('views.global_mapping_index')}</h2>
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
              url="https://tiles.waqi.info/tiles/usepa-aqi/{z}/{x}/{y}.png?token=demo"
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

          <MapEvents fetchAQI={fetchAQI} setIntercepts={setIntercepts} />
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
              {decorativeNodes.map((node) => (
                <CircleMarker
                  key={node.id}
                  center={[node.lat, node.lon]}
                  radius={5}
                  pathOptions={{
                    fillColor: node.color,
                    color: '#fff',
                    weight: 1,
                    fillOpacity: 0.7,
                  }}
                >
                  <Popup className="aqi-popup">
                    <div className="popup-inner">
                      <div className="pop-header">
                        <Activity size={12} color={node.color} />
                        <strong>Global Node {node.id}</strong>
                      </div>
                      <div className="pop-item">
                        <span className="l">{node.metricLabel} LEVEL</span>
                        <span className="v" style={{ color: node.color }}>{Math.floor(Math.random() * 50) + 10}</span>
                      </div>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}

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
          <div className="log-header mono">{t('common.scanning')}_LOG</div>
          <div className="log-entries">
            {intercepts.length === 0 ? (
              <div className="log-empty mono">{t('dashboard.waking_sensors')}</div>
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
  const { t } = useTranslation();
  const currentTheme = theme || CONFIG.AQI_DATA[1];
  const safetyLevel = aqi || 1;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="page-content">
      <h2 className="page-title text-gradient">{t('views.atmospheric_safety')}</h2>
      <div className="safety-grid">
        <div className="glass card major-tip" style={{ borderColor: currentTheme.color }}>
          <div className="tip-header">
            <div className="hazard-visual">
              <AlertOctagon size={80} color={currentTheme.color} className="hazard-icon" />
              <div className="hazard-scan" style={{ background: currentTheme.color }} />
            </div>
            <div className="tip-title">
              <span className="l mono">SAFETY_LEVEL: {safetyLevel}/5</span>
              <h3 className="text-gradient" style={{ fontSize: '3rem' }}>{t(`aqi.${currentTheme.key}.label`)}</h3>
            </div>
          </div>
          <div className="hazard-meter-box">
            <div className="meter-label mono">ATMOSPHERIC_TOXICITY_INDEX</div>
            <div className="hazard-meter">
              {[1, 2, 3, 4, 5].map(step => (
                <div key={step} className={`meter-step ${step <= safetyLevel ? 'active' : ''}`} style={{ '--step-color': CONFIG.AQI_DATA[step].color }} />
              ))}
            </div>
          </div>
          <p className="tip-desc">{t(`aqi.${currentTheme.key}.desc`)}</p>
          <div className="protocol-box glass">
            <div className="p-head mono">PROTECTIVE_PROTOCOL_ENFORCED</div>
            <p className="protocol-text">{t(`aqi.${currentTheme.key}.advice`)}</p>
          </div>
        </div>

        <div className="glass card health-impact">
          <h3 className="mono label-sm">BIOMETRIC_IMPACT_ANALYSIS</h3>
          <div className="impact-grid-v2">
            <ImpactNode icon={<Activity size={18} />} label="VITAL_CAPACITY" val={`${100 - (safetyLevel * 7)}%`} status="DEGRADING" />
            <ImpactNode icon={<Wind size={18} />} label="OXYGEN_PURITY" val={`${98 - (safetyLevel * 2)}%`} status="NOMINAL" />
            <ImpactNode icon={<Thermometer size={18} />} label="THERMAL_STRESS" val="LOW" status="STABLE" />
            <ImpactNode icon={<Droplets size={18} />} label="H2O_SATURATION" val="OPTIMAL" status="AUTO" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const ImpactNode = ({ icon, label, val, status }) => (
  <div className="impact-node glass">
    <div className="i-top">
      <div className="i-icon">{icon}</div>
      <span className="i-status mono">{status}</span>
    </div>
    <div className="i-main">
      <span className="i-val mono">{val}</span>
      <span className="i-label mono">{label}</span>
    </div>
  </div>
);

const RegistrationModal = ({ onComplete }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/user/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('aqi_user_data', JSON.stringify({ name: formData.name, email: formData.email }));
        onComplete({ name: formData.name, email: formData.email });
      } else {
        setError(data.error || "Linking failed.");
      }
    } catch (err) {
      setError("Atmospheric gap detected. (Connection error)");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registration-overlay">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="registration-modal glass"
      >
        <div className="reg-header">
          <div className="logo-icon user-icon-bg"><User size={32} /></div>
          <h2 className="text-gradient">NEW_NODE_DETECTION</h2>
          <p className="mono subtitle">INITIALIZING_BIOMETRIC_LINK_v1.0</p>
        </div>

        <form onSubmit={handleSubmit} className="reg-form">
          <div className="reg-input-grid">
            <div className="input-field-v2 glass">
              <User size={18} />
              <input
                required
                placeholder="FULL_NAME"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="input-field-v2 glass">
              <MapPin size={18} />
              <input
                required
                placeholder="CURRENT_ADDRESS"
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            <div className="input-field-v2 glass">
              <Navigation size={18} />
              <input
                required
                placeholder="PHONE_TEL"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="input-field-v2 glass">
              <Bell size={18} />
              <input
                required
                type="email"
                placeholder="EMAIL_ID"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          {error && <p className="error-text mono">{error}</p>}

          <button type="submit" disabled={loading} className="reg-submit-btn glass">
            {loading ? "LINKING..." : "ESTABLISH_CONNECTION"}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

const CinematicFocus = ({ data, setClose }) => {
  const { t } = useTranslation();
  const theme = CONFIG.AQI_DATA[data.aqi] || CONFIG.AQI_DATA[1];
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="cinematic-overlay">
      <button className="close-btn" onClick={setClose}><X size={48} /></button>
      <div className="focus-content">
        <motion.p initial={{ tracking: '2px' }} animate={{ tracking: '24px' }}>TELEMETRY_STREAM_ACTIVE</motion.p>
        <motion.h1 initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="mono">{data.aqi}</motion.h1>
        <h2 className="text-gradient" style={{ fontSize: '4rem' }}>{t(`aqi.${theme.key}.label`)}</h2>
      </div>
    </motion.div>
  );
};

const BreatheAI = ({ chatOpen, setChatOpen }) => {
  const { t } = useTranslation();
  return (
    <div className={`ai-assistant ${chatOpen ? 'open' : ''}`}>
      <button className="ai-trigger glass" onClick={() => setChatOpen(!chatOpen)}>
        <Sparkles size={28} />
      </button>
      <div className="ai-window glass">
        <div className="ai-header">
          <div className="ai-title">
            <div className="status-orb" />
            <span className="mono">HIVE_CO_PILOT_v12.4</span>
          </div>
          <button className="close-ai" onClick={() => setChatOpen(false)}><X size={16} /></button>
        </div>
        <div className="ai-body">
          <div className="neural-stream-lines">
            <div className="stream-line" />
            <div className="stream-line" />
            <div className="stream-line" />
          </div>
          <div className="bubble bot">
            <span className="mono whisper">{t('ai.transmission')}</span>
            {t('ai.greeting')}
          </div>
          <div className="wave-visualizer">
            {[...Array(12)].map((_, i) => <div key={i} className="wave-bar" style={{ animationDelay: `${i * 0.1}s` }} />)}
          </div>
        </div>
        <div className="ai-input-wrapper">
          <div className="ai-input glass">
            <input placeholder={t('ai.placeholder')} />
            <button className="send-btn"><Zap size={18} /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

const LoadingSequence = () => {
  const { t } = useTranslation();
  return (
    <div className="loader-screen">
      <div className="loader-bg">
        <div className="bg-mesh" />
        <div className="loader-grid" />
      </div>

      <div className="loader-content">
        <div className="loader-visual">
          <div className="loader-ring-outer" />
          <div className="loader-ring-inner" />
          <div className="loader-core">
            <Cpu size={60} className="cpu-icon" />
          </div>
        </div>

        <div className="loader-text-group">
          <h1 className="mono loader-title">{t('loading.initializing')}</h1>
          <div className="loader-status-stream">
            <span className="status-line mono">LINK_STATE: ESTABLISHING...</span>
            <span className="status-line mono">GEO_RESOLVER: BOOTING...</span>
            <span className="status-line mono">SATELLITE_ARRAY: READY</span>
          </div>
        </div>
      </div>

      <div className="loader-footer">
        <span className="mono">{t('loading.ver')}</span>
      </div>
    </div>
  );
};

export default App;
