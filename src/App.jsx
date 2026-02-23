import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
  useLocation
} from 'react-router-dom';
import {
  LayoutDashboard,
  BarChart3,
  ShieldAlert,
  Settings,
  Zap,
  MapPin,
  Search,
  Wind,
  Activity,
  Clock,
  ShieldCheck,
  Navigation,
  X,
  Maximize2,
  History,
  TrendingUp,
  AlertOctagon,
  ArrowRight,
  Sun,
  Eye,
  Github,
  Bell,
  Cpu,
  User,
  LogOut,
  ChevronRight,
  Map as MapIcon,
  Award,
  MessageSquare,
  Newspaper,
  Binary,
  Layers,
  Share2,
  RefreshCcw,
  Thermometer
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
  Cell,
  LineChart,
  Line,
  PieChart,
  Pie
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';

// --- Configuration ---
const API_KEY = "";
const STORAGE_KEY = 'breathesmart_v4_data';

const AQI_LEVELS = {
  1: { label: 'Excellent', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', desc: 'Pristine atmosphere. Breathe freely.' },
  2: { label: 'Optimal', color: '#00f2fe', bg: 'rgba(0, 242, 254, 0.1)', desc: 'Standard quality. Safe for long commutes.' },
  3: { label: 'Caution', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', desc: 'Elevated particulates. Wear a mask if possible.' },
  4: { label: 'Hazard', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', desc: 'High toxicity. Pulmonary load is critical.' },
  5: { label: 'Lethal', color: '#7c3aed', bg: 'rgba(124, 58, 237, 0.1)', desc: 'Severe failure. Evacuate to filtered zones.' }
};

// --- Main Application ---

const App = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isTracing, setIsTracing] = useState(false);
  const [isFocus, setIsFocus] = useState(false);
  const [history, setHistory] = useState([]);
  const [velocity, setVelocity] = useState(0);
  const [distance, setDistance] = useState(0);
  const [exposure, setExposure] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  // V4 New States
  const [activeNodes, setActiveNodes] = useState(256);
  const [userRank, setUserRank] = useState(42);
  const [xp, setXP] = useState(840);
  const [chatOpen, setChatOpen] = useState(false);
  const [newsTicker, setNewsTicker] = useState("SYNCING ATMOSPHERIC NEWS...");

  useEffect(() => {
    initApp();
    const interval = setInterval(() => {
      setActiveNodes(prev => prev + (Math.random() > 0.5 ? 1 : -1));
      const headlines = [
        "Global PM2.5 levels dropped by 4% this month.",
        "New Delhi activates smog towers as AQI hits 400.",
        "Amazon rainforest sensors detect shift in humidity.",
        "Rider 'X-Ray' achieved Level 50 safety rank.",
        "Quantum Mesh update complete: 0.02s latency."
      ];
      setNewsTicker(headlines[Math.floor(Math.random() * headlines.length)]);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const initApp = async () => {
    setLoading(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchAtmosphere(pos.coords.latitude, pos.coords.longitude, "Local Hub"),
        () => fetchAtmosphere(12.9716, 77.5946, "Bangalore Node")
      );
    }
  };

  const fetchAtmosphere = async (lat, lon, label) => {
    try {
      let current;
      if (API_KEY) {
        const aqiRes = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`);
        const poll = await aqiRes.json();
        current = {
          name: label,
          aqi: poll.list[0].main.aqi,
          components: poll.list[0].components,
          uv: (Math.random() * 8 + 2).toFixed(1),
          vis: (Math.random() * 10 + 5).toFixed(1),
          pressure: (1010 + Math.random() * 5).toFixed(0),
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
      } else {
        current = {
          name: label,
          aqi: Math.floor(Math.random() * 3) + 1,
          components: { pm2_5: 12.4, pm10: 22.1, no2: 8.5, co: 340 },
          uv: 4.2,
          vis: 12.5,
          pressure: 1013,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
      }
      setData(current);
      setHistory(prev => [...prev, { time: current.time, aqi: current.aqi, vis: current.vis }].slice(-20));
      if (isTracing) setXP(prev => prev + 10);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !data) return <LoadingScreen />;

  const theme = AQI_LEVELS[data?.aqi || 1];

  return (
    <Router>
      <div className="app-shell v4-quantum">
        <Sidebar activeNodes={activeNodes} userRank={userRank} xp={xp} />

        <div className="main-viewport">
          <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} fetchAtmosphere={() => fetchAtmosphere(0, 0, searchQuery)} setIsFocus={setIsFocus} />

          <div className="ticker-bar mono">
            <Newspaper size={14} /> <span>NEWS: {newsTicker}</span>
          </div>

          <div className="content-area">
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<Dashboard data={data} theme={theme} history={history} isTracing={isTracing} setIsTracing={setIsTracing} xp={xp} setXP={setXP} velocity={velocity} distance={distance} exposure={exposure} />} />
                <Route path="/map" element={<Heatmap data={data} />} />
                <Route path="/analytics" element={<Analytics history={history} />} />
                <Route path="/achievements" element={<Achievements xp={xp} />} />
                <Route path="/safety" element={<Safety data={data} theme={theme} />} />
                <Route path="/compare" element={<CompareCities current={data} />} />
                <Route path="/settings" element={<SettingsScreen />} />
              </Routes>
            </AnimatePresence>
          </div>
        </div>

        <BreatheBot chatOpen={chatOpen} setChatOpen={setChatOpen} />

        {isFocus && <FocusMode data={data} theme={theme} setClose={() => setIsFocus(false)} />}

        <AnimatePresence>
          {data?.aqi >= 4 && (
            <motion.div className="hazard-banner" initial={{ y: -100 }} animate={{ y: 0 }} exit={{ y: -100 }}>
              <AlertOctagon size={20} />
              <span>ATMOSPHERIC HAZARD DETECTED – ACTIVATE RESPIRATORY SHIELD</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Router>
  );
};

// --- Strategic Components ---

const Sidebar = ({ activeNodes, userRank, xp }) => (
  <aside className="sidebar">
    <div className="brand">
      <div className="logo"><Zap fill="currentColor" size={20} /></div>
      <div className="brand-text">
        <span className="name">BreatheSmart</span>
        <span className="version">V4.0 NEURAL LINK</span>
      </div>
    </div>

    <div className="user-xp-box">
      <div className="xp-text">
        <span>LVL {userRank}</span>
        <span>{xp}/2500 XP</span>
      </div>
      <div className="xp-bar-bg"><motion.div className="xp-bar-fill" animate={{ width: `${(xp / 2500) * 100}%` }} /></div>
    </div>

    <nav className="side-nav">
      <NavItem to="/" icon={<LayoutDashboard size={20} />} label="Command Center" />
      <NavItem to="/map" icon={<MapIcon size={20} />} label="Global Heatmap" />
      <NavItem to="/analytics" icon={<TrendingUp size={20} />} label="Spectral Scan" />
      <NavItem to="/compare" icon={<Layers size={20} />} label="City Compare" />
      <NavItem to="/achievements" icon={<Award size={20} />} label="Accomplishments" />
      <NavItem to="/safety" icon={<ShieldAlert size={20} />} label="Health Vault" />
      <NavItem to="/settings" icon={<Settings size={20} />} label="Kernel Config" />
    </nav>

    <div className="side-footer">
      <div className="node-stats">
        <div className="pulse green"></div>
        <span>{activeNodes} Nodes Linked</span>
      </div>
    </div>
  </aside>
);

const Header = ({ searchQuery, setSearchQuery, fetchAtmosphere, setIsFocus }) => (
  <header className="main-header">
    <div className="search-bar">
      <Search size={18} className="icon" />
      <input
        placeholder="Coordinate Sync..."
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && fetchAtmosphere()}
      />
    </div>

    <div className="actions">
      <button className="h-btn" title="Focus Mode" onClick={() => setIsFocus(true)}><Maximize2 size={18} /></button>
      <button className="h-btn" title="Global Sync"><RefreshCcw size={18} /></button>
      <button className="h-btn"><Bell size={18} /></button>
      <div className="divider"></div>
      <div className="user-pill">
        <div className="ava"><Binary size={20} /></div>
        <span>ADMIN_USER</span>
      </div>
    </div>
  </header>
);

const NavItem = ({ to, icon, label }) => (
  <NavLink to={to} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
    {icon} <span>{label}</span>
  </NavLink>
);

// --- Pages ---

const Dashboard = ({ data, theme, history, isTracing, setIsTracing, xp, setXP, velocity, distance, exposure }) => (
  <motion.div className="page dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
    <div className="dashboard-layout">

      <div className="glass card hero" style={{ '--theme': theme.color }}>
        <div className="halo" style={{ background: theme.color }}></div>
        <div className="card-controls">
          <div className="loc-badge"><MapPin size={14} /> {data.name}</div>
          <button className={`tracing-btn ${isTracing ? 'active' : ''}`} onClick={() => setIsTracing(!isTracing)}>
            {isTracing ? 'BIOMETRIC SCANNING...' : 'START RIDE SESSION'}
          </button>
        </div>

        <div className="hero-content">
          <div className="aqi-ring">
            <span className="unit">AQI</span>
            <span className="val mono">{data.aqi}</span>
          </div>
          <div className="condition">
            <h1 className="heading">{theme.label.toUpperCase()}</h1>
            <p className="desc">{theme.desc}</p>
            <div className="quick-stats">
              <span className="mono"><Wind size={14} /> {data.components.no2} \u00b5g</span>
              <span className="mono"><Sun size={14} /> {data.uv} UV</span>
              <span className="mono"><Activity size={14} /> {data.vis}km VIS</span>
            </div>
          </div>
        </div>

        <div className="exposure-meter">
          <div className="meter-head">
            <span className="mono">CUMULATIVE EXPOSURE</span>
            <span className="mono">{exposure.toFixed(2)} EXP</span>
          </div>
          <div className="meter-bg"><motion.div className="meter-fill" animate={{ width: `${Math.min(100, exposure)}%` }} style={{ background: theme.color }} /></div>
        </div>
      </div>

      <div className="glass card ride-stats">
        <h3 className="heading">Session Metrics</h3>
        <div className="metric-grid">
          <Metric label="VELOCITY" val={`${velocity.toFixed(0)}`} unit="KM/H" />
          <Metric label="DISTANCE" val={`${distance.toFixed(1)}`} unit="KM" />
          <Metric label="ALTITUDE" val="128" unit="M" />
          <Metric label="SYNC" val="99%" unit="HUB" />
        </div>
      </div>

      <div className="glass card mini-history">
        <div className="head"><TrendingUp size={16} /> <span className="mono">ATMOSPHeric TREND</span></div>
        <div className="chart-micro">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history}>
              <Area type="monotone" dataKey="aqi" stroke={theme.color} fill={theme.color} fillOpacity={0.1} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  </motion.div>
);

const Heatmap = ({ data }) => (
  <motion.div className="page heatmap" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
    <h2 className="heading title-gradient">Global Toxicity Matrix</h2>
    <div className="glass card map-viz">
      <div className="map-placeholder">
        <div className="pulse-point" style={{ top: '40%', left: '30%' }}></div>
        <div className="pulse-point danger" style={{ top: '60%', left: '70%' }}></div>
        <div className="pulse-point warning" style={{ top: '30%', left: '80%' }}></div>
        <span className="mono text-overlay">QUANTUM SCAN COORDS: {data.name} SYNCED</span>
      </div>
      <div className="map-legend">
        <div className="leg"><div className="dot green"></div> Level 1-2</div>
        <div className="leg"><div className="dot yellow"></div> Level 3</div>
        <div className="leg"><div className="dot red"></div> Level 4-5</div>
      </div>
    </div>
  </motion.div>
);

const Analytics = ({ history }) => (
  <motion.div className="page analytics" initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
    <h2 className="heading title-gradient">Spectral Particle Analysis</h2>
    <div className="glass card big-chart">
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={history}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="time" hide />
          <YAxis stroke="#475569" fontSize={10} />
          <Tooltip contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '12px' }} />
          <Bar dataKey="aqi" radius={[4, 4, 0, 0]}>
            {history.map((e, i) => <Cell key={i} fill={AQI_LEVELS[e.aqi]?.color} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
    <div className="analysis-grid">
      <div className="glass card">
        <h4 className="mono">Visibility Score</h4>
        <ResponsiveContainer width="100%" height={150}>
          <LineChart data={history}>
            <Line type="monotone" dataKey="vis" stroke="var(--primary)" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="glass card insights">
        <h4 className="heading">AI Observations</h4>
        <p>Current humidity levels are trapping 12% more nitrogen particles in the lower atmosphere. High-ventilation routes are advised.</p>
      </div>
    </div>
  </motion.div>
);

const CompareCities = ({ current }) => (
  <motion.div className="page compare" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
    <h2 className="heading title-gradient">Atmospheric Benchmarking</h2>
    <div className="compare-grid">
      <CompareCard city={current.name} aqi={current.aqi} active />
      <CompareCard city="Tokyo Node" aqi={1} />
      <CompareCard city="Shanghai Core" aqi={4} />
    </div>
  </motion.div>
);

const Achievements = ({ xp }) => (
  <motion.div className="page achievements" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
    <h2 className="heading title-gradient">Rider Accomplishments</h2>
    <div className="ach-grid">
      <AchCard title="Filter Master" desc="Avoided 500g of PM2.5" progress={80} unlocked />
      <AchCard title="Night Owl" desc="Logged 10h of night rides" progress={45} />
      <AchCard title="Ocean Breath" desc="Recorded 5 sessions in Clean zones" progress={100} unlocked />
      <AchCard title="Quantum Link" desc="Linked 50 global nodes" progress={20} />
    </div>
  </motion.div>
);

const Safety = ({ theme }) => (
  <motion.div className="page safety">
    <h2 className="heading title-gradient">Protection Protocol</h2>
    <div className="safety-wrap">
      <div className="glass card major">
        <Shield size={48} color={theme.color} />
        <h3 className="heading">Current Alert: {theme.label}</h3>
        <p>Environmental sensors indicate high biological risk. All commuters are advised to engage Level 3 filtration masks.</p>
      </div>
      <div className="tips">
        <div className="glass card tip"><Thermometer size={18} /> Hydration is key in dry air.</div>
        <div className="glass card tip"><Activity size={18} /> Reduce RPM by 15% in Hazard zones.</div>
      </div>
    </div>
  </motion.div>
);

const SettingsScreen = () => (
  <motion.div className="page settings">
    <h2 className="heading title-gradient">Kernel Configuration</h2>
    <div className="glass card config">
      <div className="config-item">
        <div className="info">
          <span>GPS High Precision</span>
          <p>Uses more battery for 0.1m accuracy.</p>
        </div>
        <div className="toggle active"></div>
      </div>
      <div className="config-item">
        <div className="info">
          <span>Cloud Sync Protocol</span>
          <p>Auto-sync to Decentralized Nodes.</p>
        </div>
        <div className="toggle"></div>
      </div>
      <button className="logout-btn"><LogOut size={16} /> TERMINATE SESSION</button>
    </div>
  </motion.div>
);

// --- Sub-Modules ---

const BreatheBot = ({ chatOpen, setChatOpen }) => (
  <div className={`breathe-bot ${chatOpen ? 'open' : ''}`}>
    <button className="chat-trigger" onClick={() => setChatOpen(!chatOpen)}>
      <MessageSquare size={24} />
      {!chatOpen && <div className="notif">1</div>}
    </button>
    <div className="chat-window glass">
      <div className="chat-head">
        <span className="mono">BREATHE_BOT v1.2</span>
        <button onClick={() => setChatOpen(false)}><X size={16} /></button>
      </div>
      <div className="chat-body">
        <div className="msg bot">System online. Atmospheric queries active.</div>
        <div className="msg user">Analyze current PM2.5 risk.</div>
        <div className="msg bot">Analyzing... PM2.5 is currently stable. No immediate hazard.</div>
      </div>
      <div className="chat-input">
        <input placeholder="Enter query..." />
        <ArrowRight size={18} />
      </div>
    </div>
  </div>
);

const FocusMode = ({ data, theme, setClose }) => (
  <div className="focus-v4" style={{ '--acc': theme.color }}>
    <button className="close-f" onClick={setClose}><X size={48} /></button>
    <div className="f-content">
      <span className="l mono">COMMANDER HUD</span>
      <div className="big-val mono">{data.aqi}</div>
      <h2 className="heading">{theme.label}</h2>
    </div>
  </div>
);

const Metric = ({ label, val, unit }) => (
  <div className="metric">
    <span className="l mono">{label}</span>
    <div className="v-group">
      <span className="v mono">{val}</span>
      <span className="u mono">{unit}</span>
    </div>
  </div>
);

const CompareCard = ({ city, aqi, active }) => (
  <div className={`glass card c-card ${active ? 'active' : ''}`}>
    <span className="mono">{city}</span>
    <div className="aqi-v" style={{ color: AQI_LEVELS[aqi].color }}>{aqi}</div>
    <div className="bar"><div className="fill" style={{ width: `${(aqi / 5) * 100}%`, background: AQI_LEVELS[aqi].color }} /></div>
  </div>
);

const AchCard = ({ title, desc, progress, unlocked }) => (
  <div className={`glass card ach-card ${unlocked ? 'unlocked' : ''}`}>
    <Award size={32} className="icon" />
    <div className="info">
      <h5>{title}</h5>
      <p>{desc}</p>
      <div className="ach-progress">
        <div className="fill" style={{ width: `${progress}%` }}></div>
      </div>
    </div>
  </div>
);

const LoadingScreen = () => (
  <div className="loading-v4">
    <div className="loader">
      <div className="inner"></div>
      <Cpu size={40} className="cpu" />
    </div>
    <span className="mono">QUANTUM KERNEL BOOTING...</span>
  </div>
);

const Shield = (props) => <ShieldCheck {...props} />;

export default App;
