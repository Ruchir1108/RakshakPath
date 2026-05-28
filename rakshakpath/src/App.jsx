import { useState, useEffect } from "react";
import Sidebar from "./components/layout/Sidebar";
import MapView from "./components/MapView";
import Dashboard from "./components/Dashboard";
import EmergencyPanel from "./components/panels/EmergencyPanel";
import RouteNavPanel from "./components/panels/RouteNavPanel";
import ReportsPanel from "./components/panels/ReportsPanel";
import fallbackHotspots from "./data/accidents.json";
import { fetchHotspots } from "./utils/api";

function App() {
  const [activeTab, setActiveTab] = useState("map");
  const [safetyScore, setSafetyScore] = useState(null);
  const [apiHotspots, setApiHotspots] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Route states
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchHotspots();
      if (data && data.length > 0) {
        setApiHotspots(data);
      } else {
        setApiHotspots(fallbackHotspots); // fallback to local JSON if API fails
      }
      setIsLoading(false);
    };
    loadData();
  }, []);

  const parsedHotspots = apiHotspots || [];

  return (
    <div className="flex h-screen w-full bg-dark overflow-hidden font-sans text-slate-200">
      
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 ml-64 relative h-screen">
        
        <header className="absolute top-0 left-0 w-full z-400 p-4 pointer-events-none">
          <div className="flex justify-end gap-4 pointer-events-auto">
            <div className="glass-panel px-4 py-2 rounded-full flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse shadow-[0_0_8px_#22c55e]"></span>
              <span className="text-sm font-medium">System Online</span>
            </div>
          </div>
        </header>

        <div className="absolute inset-0 w-full h-full">
          {activeTab === "map" && (
            <div className="w-full h-full">
              <MapView 
                hotspots={parsedHotspots} 
                start={start}
                end={end}
                searchRoute={!!start && !!end}
                setSafetyScore={setSafetyScore} 
                safetyScore={safetyScore}
              />
            </div>
          )}

          {activeTab === "analytics" && (
            <div className="p-8 h-full overflow-y-auto">
              <h2 className="text-3xl font-black mb-6 text-transparent bg-clip-text bg-linear-to-r from-neon-blue to-neon-green border-b border-slate-700/50 pb-4">
                AI Root Cause Insights
              </h2>
              <Dashboard hotspots={parsedHotspots} safetyScore={safetyScore} />
            </div>
          )}

          {activeTab === "emergency" && (
            <EmergencyPanel 
              setAppStart={setStart} 
              setAppEnd={setEnd} 
              setActiveTab={setActiveTab} 
            />
          )}

          {activeTab === "route" && (
             <RouteNavPanel setAppStart={setStart} setAppEnd={setEnd} setActiveTab={setActiveTab} />
          )}

          {activeTab === "reports" && (
             <ReportsPanel />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;