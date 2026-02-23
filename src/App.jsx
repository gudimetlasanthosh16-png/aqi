import React, { useState, useEffect, useRef } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
  useLocation
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
  ChevronRight,
  X,
  MessageSquare,
  Award,
  AlertOctagon,
  Cpu,
  User,
  LogOut,
  MousePointer2,
  Layers,
  Sparkles,
  Command,
  Plus
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';

// --- State Management Helpers ---
const CONFIG = {
  AQI_DATA: {
    1: { label: 'Pristine', color: '#10b981', desc: 'Ultra-pure air. Optimal for maximum performance.', advice: 'No protection needed.' },
    2: { label: 'Safe', color: '#0ea5e9', desc: 'Acceptable quality. Ideal for standard travel.', advice: 'Comfortable to ride.' },
    3: { label: 'Moderate', color: '#f59e0b', desc: 'Minor particulates detected. Caution advised.', advice: 'Wear a light mask.' },
    4: { label: 'Unsafe', color: '#f43f5e', desc: 'Harmful atmosphere. Pulmonary stress likely.', advice: 'N95 Respirator Required.' },
    5: { label: 'Severe', color: '#a855f7', desc: 'Toxic failure. Immediate evacuation suggested.', advice: 'Stay Indoors / Full Filter.' }
  }
};

const App = () => {
  const [data, setData] = useState({
    name: "Sanctuary Hub",
    aqi: 1,
    components: { pm2_5: 8.2, pm10: 15.4, no2: 4.1, co: 210 },
    weather: { temp: 24, hum: 45, wind: 12 },
    uv: 2.1,
    vis: 15.0,
    time: new Date().toLocaleTimeString()
  });
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [isFocus, setIsFocus] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    // Advanced Simulation Entry
    const timer = setTimeout(() => {
      setLoading(false);
      // Generate initial history
      const initialHistory = Array.from({ length: 15 }, (_, i) => ({
        time: `${i}:00`,
        aqi: Math.floor(Math.random() * 2) + 1
      }));
      setHistory(initialHistory);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <LoadingSequence />;

  return (
    <Router>
      <div className="app-container">
        <div className="bg-mesh" />
        <div className="bg-grid" />

        <Sidebar />

        <main className="main-content">
          <TopBar search={search} setSearch={setSearch} setIsFocus={setIsFocus} />

          <div className="page-wrapper">
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<DashboardView data={data} history={history} />} />
                <Route path="/analytics" element={<AnalyticsView history={history} />} />
                <Route path="/map" element={<MapView />} />
                <Route path="/safety" element={<SafetyView aqi={data.aqi} />} />
                <Route path="/settings" element={<SettingsView />} />
              </Routes>
            </AnimatePresence>
          </div>
        </main>

        <BreatheAI chatOpen={chatOpen} setChatOpen={setChatOpen} />
        {isFocus && <CinematicFocus data={data} setClose={() => setIsFocus(false)} />}
      </div>
    </Router>
  );
};

// --- View Components ---

const DashboardView = ({ data, history }) => {
  const theme = CONFIG.AQI_DATA[data.aqi];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="dashboard-view"
    >
      <div className="hero-grid">
        {/* Main AQI Visualization */}
        <div className="glass card aqi-hero" style={{ '--accent': theme.color }}>
          <div className="card-glare" />
          <div className="hero-header">
            <div className="tag"><MapPin size={12} /> {data.name}</div>
            <div className="live-tag"><div className="dot" /> LIVE SYNC</div>
          </div>

          <div className="aqi-main-display">
            <div className="aqi-circle">
              <svg viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" className="track" />
                <motion.circle
                  cx="50" cy="50" r="45"
                  className="progress"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: data.aqi / 5 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  style={{ stroke: theme.color }}
                />
              </svg>
              <div className="aqi-value-box">
                <span className="label">AQI</span>
                <span className="value mono">{data.aqi}</span>
              </div>
            </div>

            <div className="aqi-status-text">
              <motion.h1 className="text-gradient" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{theme.label}</motion.h1>
              <p className="desc">{theme.desc}</p>
              <div className="metric-pills">
                <div className="pill"><Wind size={14} /> {data.components.pm2_5} µg/m³</div>
                <div className="pill"><Sun size={14} /> UV {data.uv}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Graph */}
        <div className="glass card trend-card">
          <div className="card-header">
            <h3 className="heading"><Activity size={18} /> SESSION TELEMETRY</h3>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history}>
                <defs>
                  <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={theme.color} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={theme.color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="time" hide />
                <YAxis hide domain={[0, 6]} />
                <Tooltip
                  contentStyle={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: theme.color }}
                />
                <Area type="monotone" dataKey="aqi" stroke={theme.color} strokeWidth={3} fill="url(#chartFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Environmental Metrics */}
        <div className="metrics-grid">
          <MetricCard icon={<Navigation />} label="VELOCITY" value="42" unit="KM/H" />
          <MetricCard icon={<Zap />} label="EXPOSURE" value="0.8" unit="PTS" />
          <MetricCard icon={<Eye />} label="VISIBILITY" value={data.vis} unit="KM" />
          <MetricCard icon={<ShieldCheck />} label="SYNC" value="STABLE" />
        </div>
      </div>
    </motion.div>
  );
};

// --- Internal Global Components ---

const Sidebar = () => (
  <nav className="sidebar glass">
    <div className="side-top">
      <div className="logo-box">
        <div className="logo-icon"><Zap fill="currentColor" size={20} /></div>
        <div className="logo-text">BREATHE<span>SMART</span></div>
      </div>

      <div className="nav-links">
        <SideLink to="/" icon={<LayoutDashboard size={20} />} label="Overview" />
        <SideLink to="/analytics" icon={<TrendingUp size={20} />} label="Telemetry" />
        <SideLink to="/map" icon={<MapIcon size={20} />} label="Hyper-Map" />
        <SideLink to="/safety" icon={<ShieldCheck size={20} />} label="Safety" />
      </div>
    </div>

    <div className="side-bottom">
      <SideLink to="/settings" icon={<Settings size={20} />} label="Platform" />
      <div className="user-short glass">
        <div className="avatar"><User size={18} /></div>
        <div className="info">
          <p className="name">Rider_Zero</p>
          <p className="rank">Level 8</p>
        </div>
      </div>
    </div>
  </nav>
);

const SideLink = ({ to, icon, label }) => (
  <NavLink to={to} className={({ isActive }) => `side-link ${isActive ? 'active' : ''}`}>
    <div className="link-hover" />
    {icon} <span>{label}</span>
  </NavLink>
);

const TopBar = ({ search, setSearch, setIsFocus }) => (
  <header className="top-bar">
    <div className="search-wrapper glass">
      <Search size={18} className="search-icon" />
      <input
        placeholder="Search Nodes..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="kbd glass">⌘ K</div>
    </div>

    <div className="top-actions">
      <button className="icon-btn glass" onClick={() => setIsFocus(true)}><Maximize2 size={18} /></button>
      <button className="icon-btn glass"><Bell size={18} /><div className="notif-dot" /></button>
      <button className="pro-btn">
        <Sparkles size={16} /> <span>PREMIUM</span>
      </button>
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

// --- Pages (Stubs) ---

const AnalyticsView = ({ history }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="page-content">
    <h2 className="page-title text-gradient">System Telemetry</h2>
    <div className="glass card big-analytics">
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={history}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="time" stroke="var(--text-dark)" fontSize={12} />
          <YAxis stroke="var(--text-dark)" fontSize={12} />
          <Tooltip cursor={{ fill: 'rgba(255,255,255,0.02)' }} contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '12px' }} />
          <Bar dataKey="aqi" radius={[6, 6, 0, 0]}>
            {history.map((entry, index) => (
              <Cell key={index} fill={CONFIG.AQI_DATA[entry.aqi]?.color || '#fff'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  </motion.div>
);

const MapView = () => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="page-content">
    <h2 className="page-title text-gradient">Hyper-Map Nodes</h2>
    <div className="glass card map-container">
      <div className="map-viz-v5">
        <div className="node-point p1"><div className="wave" /></div>
        <div className="node-point p2"><div className="wave" /></div>
        <div className="node-point p3"><div className="wave" /></div>
        <div className="scan-line" />
      </div>
    </div>
  </motion.div>
);

const SafetyView = ({ aqi }) => {
  const theme = CONFIG.AQI_DATA[aqi];
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="page-content">
      <h2 className="page-title text-gradient">Health Protection</h2>
      <div className="safety-grid">
        <div className="glass card major-tip" style={{ borderColor: theme.color }}>
          <AlertOctagon size={48} color={theme.color} />
          <h3>LEVEL {aqi}: {theme.label}</h3>
          <p>{theme.advice}</p>
        </div>
        <div className="glass card fact-card">
          <h4>Did you know?</h4>
          <p>PM2.5 particles are 30 times smaller than a human hair and can enter the bloodstream directly.</p>
        </div>
      </div>
    </motion.div>
  );
};

const SettingsView = () => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="page-content">
    <h2 className="page-title text-gradient">Platform Settings</h2>
    <div className="glass card settings-list">
      <div className="setting-item">
        <div className="info">
          <span>High Precision GPS</span>
          <p>Uses neural network for centimeter accuracy</p>
        </div>
        <div className="toggle active"><div className="knob" /></div>
      </div>
      <div className="setting-item">
        <div className="info">
          <span>Bio-Sync Mode</span>
          <p>Links with smartwatch for heart-rate correction</p>
        </div>
        <div className="toggle"><div className="knob" /></div>
      </div>
    </div>
  </motion.div>
);

const CinematicFocus = ({ data, setClose }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="cinematic-overlay"
  >
    <button className="close-btn" onClick={setClose}><X size={48} /></button>
    <div className="focus-content">
      <motion.p initial={{ tracking: '2px' }} animate={{ tracking: '20px' }} className="mono">SYSTEM CRITICAL</motion.p>
      <motion.h1 initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="mono">{data.aqi}</motion.h1>
      <h2 className="text-gradient">{CONFIG.AQI_DATA[data.aqi].label}</h2>
    </div>
  </motion.div>
);

const BreatheAI = ({ chatOpen, setChatOpen }) => (
  <div className={`ai-assistant ${chatOpen ? 'open' : ''}`}>
    <button className="ai-trigger glass" onClick={() => setChatOpen(!chatOpen)}>
      <Sparkles size={24} />
    </button>
    <div className="ai-window glass">
      <div className="ai-header">
        <span className="mono">BREATHE_AI_v2</span>
        <button onClick={() => setChatOpen(false)}><X size={16} /></button>
      </div>
      <div className="ai-body">
        <div className="bubble bot">Welcome back, Rider. Nodes are stable. Need a route analysis?</div>
      </div>
      <div className="ai-input">
        <input placeholder="Ask atmospheric intelligence..." />
        <Plus size={18} />
      </div>
    </div>
  </div>
);

const LoadingSequence = () => (
  <div className="loader-screen">
    <div className="loader-wrap">
      <div className="loader-ring" />
      <Cpu size={32} className="cpu-icon" />
    </div>
    <span className="mono">LINKING NEURAL ASSETS...</span>
  </div>
);

export default App;
