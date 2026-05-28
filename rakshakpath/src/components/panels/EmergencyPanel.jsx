import { motion } from "framer-motion";
import { Ambulance, Hospital, PhoneCall, Timer, Loader2, MapPin, Navigation, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import hotspotsData from "../../data/accidents.json";

const EmergencyPanel = ({ setAppStart, setAppEnd, setActiveTab }) => {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [dispatchStatus, setDispatchStatus] = useState("System Online"); // System Online, Searching, Assigned, En Route, Arrived
  const [ambulanceId, setAmbulanceId] = useState(null);

  // Focus on the highest risk cluster for our "Nearby" calculation
  const primaryHotspot = hotspotsData.find(h => h.Risk_Level === "High Risk") || hotspotsData[0];

  useEffect(() => {
    // We will handle status directly in the button click handler
  }, []);

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        setLoading(true);
        const lat = userLocation?.lat || primaryHotspot?.Latitude || 12.9716;
        const lon = userLocation?.lng || primaryHotspot?.Longitude || 77.5946;
        
        const response = await fetch('/api/nearest-hospitals/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lat, lon })
        });
        
        const data = await response.json();
        
        if (data && data.hospitals) {
          setHospitals(data.hospitals);
        }
      } catch (err) {
        console.error("Backend API failed.", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHospitals();
  }, [primaryHotspot, userLocation]);

  const handleManualOverride = () => {
    const coords = window.prompt("Enter your current real-world coordinates as: Latitude, Longitude", "12.9716, 77.5946");
    if (coords) {
      const [latStr, lngStr] = coords.split(',');
      const lat = parseFloat(latStr);
      const lng = parseFloat(lngStr);
      if (!isNaN(lat) && !isNaN(lng)) {
        setUserLocation({ lat, lng });
      } else {
        alert("Invalid format. Please enter numbers like: 12.97, 77.59");
      }
    }
  };

  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting location: ", error);
          alert("Location denied or unavailable. Please use manual override.");
          handleManualOverride();
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  const handleDispatchEmsGlobal = async () => {
    setDispatchStatus("Searching");
    try {
      const lat = userLocation?.lat || primaryHotspot?.Latitude || 12.9716;
      const lon = userLocation?.lng || primaryHotspot?.Longitude || 77.5946;
      
      const res = await fetch('/api/dispatch-ems/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hospital: hospitals[0] || 'Unknown', location: { lat, lon } })
      });
      
      const data = await res.json();
      setAmbulanceId(data.ambulanceId || `AMB-${Math.floor(1000 + Math.random() * 9000)}`);
      setDispatchStatus("Assigned");
      
      setTimeout(() => {
        setDispatchStatus("En Route");
      }, 5000);
      
      setTimeout(() => {
        setDispatchStatus("Arrived");
      }, 12000);
      
    } catch(err) {
      console.error(err);
      setDispatchStatus("System Online");
      alert("API failed. Is Django backend running on port 8000?");
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return (R * c).toFixed(1);
  };

  const handleDispatchRoute = (hospital) => {
    if (primaryHotspot && hospital) {
      setAppStart({
        lat: userLocation ? userLocation.lat : (primaryHotspot.Latitude || 12.9716),
        lon: userLocation ? userLocation.lng : (primaryHotspot.Longitude || 77.5946),
        lng: userLocation ? userLocation.lng : (primaryHotspot.Longitude || 77.5946),
        name: userLocation ? "My Location" : (primaryHotspot.Area || "Accident Hotspot")
      });
      
      const hLat = hospital.lat || hospital.center?.lat;
      const hLon = hospital.lon || hospital.center?.lon;
      
      setAppEnd({
        lat: hLat,
        lon: hLon,
        lng: hLon,
        name: hospital.tags?.name || "Hospital"
      });
      
      setActiveTab("map");
    }
  };

  return (
    <div className="p-8 h-full overflow-y-auto w-full max-w-6xl mx-auto">
      <div className="flex items-center justify-between border-b border-slate-700 pb-4 mb-8">
        <div>
          <h2 className="text-3xl font-black text-transparent bg-clip-text bg-linear-to-r from-neon-red to-neon-orange">
            Golden Hour Response
          </h2>
          <p className="text-slate-400 mt-1">Real-time nearest medical facilities and ambulance dispatch routing.</p>
        </div>
        <div className="flex flex-col gap-2 items-end">
          <div className="flex gap-3">
            <button onClick={handleLocateMe} className="bg-slate-800/80 text-slate-300 border border-slate-700 px-4 py-2 rounded-full font-bold flex items-center gap-2 hover:bg-slate-700 hover:text-white transition-all">
              <MapPin size={18} />
              <span>{userLocation ? "Location Found" : "Detect Location"}</span>
            </button>
            <button 
              onClick={handleDispatchEmsGlobal}
              disabled={['Searching', 'Assigned', 'En Route'].includes(dispatchStatus)}
              className="bg-neon-red/20 text-neon-red border border-neon-red px-6 py-2 rounded-full font-bold flex items-center gap-2 hover:bg-neon-red hover:text-white transition-all shadow-[0_0_15px_rgba(239,68,68,0.4)] disabled:opacity-50 disabled:cursor-not-allowed">
              <PhoneCall size={18} />
              <span>Dispatch EMS</span>
            </button>
          </div>
          <button onClick={handleManualOverride} className="text-xs text-slate-500 hover:text-slate-300 underline mr-2">
            Incorrect location? Set manually
          </button>
        </div>
      </div>

      {dispatchStatus !== "System Online" && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex items-center gap-4 p-4 mb-6 rounded-xl border-l-4 shadow-lg ${
            dispatchStatus === "Arrived" ? "bg-green-900/40 border-l-green-500 shadow-[0_0_20px_rgba(34,197,94,0.3)]" :
            dispatchStatus === "En Route" ? "bg-orange-900/40 border-l-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.3)]" :
            dispatchStatus === "Assigned" ? "bg-blue-900/40 border-l-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]" :
            "bg-red-900/40 border-l-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]"
          }`}
        >
          <div className="p-3 bg-dark/50 rounded-full">
            {dispatchStatus === "Arrived" ? <CheckCircle2 className="text-green-500" /> : 
             dispatchStatus === "En Route" ? <Navigation className="text-orange-500 animate-pulse" /> :
             dispatchStatus === "Assigned" ? <Ambulance className="text-blue-500" /> :
             <Loader2 className="text-red-500 animate-spin" />}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100">Live Status: {dispatchStatus}</h3>
            <p className="text-sm text-slate-400">
              {dispatchStatus === "Searching" ? "Locating nearest available unit..." : 
               ambulanceId ? `Unit ${ambulanceId} is responding to your location.` : "Allocating unit..."}
            </p>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card flex items-center gap-4">
          <div className="p-3 bg-red-900/40 rounded-full">
            <Ambulance className="text-neon-red" size={28} />
          </div>
          <div>
            <p className="text-slate-400 text-sm">Active Units</p>
            <p className="text-2xl font-bold text-slate-200">14</p>
          </div>
        </div>
        <div className="glass-card flex items-center gap-4">
          <div className="p-3 bg-blue-900/40 rounded-full">
            <Hospital className="text-neon-blue" size={28} />
          </div>
          <div>
            <p className="text-slate-400 text-sm">Trauma Centers</p>
            <p className="text-2xl font-bold text-slate-200">{loading ? "..." : hospitals.length}</p>
          </div>
        </div>
        <div className="glass-card flex items-center gap-4">
          <div className="p-3 bg-orange-900/40 rounded-full">
            <Timer className="text-neon-orange" size={28} />
          </div>
          <div>
            <p className="text-slate-400 text-sm">Avg Response</p>
            <p className="text-2xl font-bold text-slate-200">9 mins</p>
          </div>
        </div>
      </div>

      <h3 className="text-xl font-bold text-slate-200 mt-10 mb-4">Nearest Hospitals to Critical Zone ({primaryHotspot?.Area})</h3>
      
      <div className="space-y-4">
        {loading ? (
          <div className="flex flex-col items-center py-10 text-slate-400">
            <Loader2 className="animate-spin mb-2" size={32} />
            <p>Scanning Live EMS Network via Overpass API...</p>
          </div>
        ) : hospitals.length > 0 ? (
          hospitals.map((hospital, i) => {
            const hLat = hospital.lat || hospital.center?.lat;
            const hLon = hospital.lon || hospital.center?.lon;
            const dist = calculateDistance(
              userLocation ? userLocation.lat : primaryHotspot.Latitude, 
              userLocation ? userLocation.lng : primaryHotspot.Longitude, 
              hLat, hLon
            );
            const eta = Math.ceil(dist * 1.5) + 3; // roughly 1.5 mins per km + 3 mins dispatch time
            
            return (
              <motion.div 
                key={hospital.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center justify-between p-4 glass-card border-l-4 border-l-neon-red hover:bg-slate-800/80 transition-all cursor-pointer"
              >
                <div>
                  <h4 className="text-lg font-bold text-slate-200">{hospital.tags.name}</h4>
                  <p className="text-sm text-slate-400">Distance: {dist} km • Estimated EMS ETA: {eta} mins</p>
                </div>
                <button 
                  onClick={() => handleDispatchRoute(hospital)}
                  className="text-neon-blue px-4 py-2 bg-blue-900/30 rounded-lg text-sm font-semibold hover:bg-neon-blue hover:text-dark transition"
                >
                  Dispatch Route
                </button>
              </motion.div>
            )
          })
        ) : (
          <div className="p-4 glass-card text-center text-slate-400">
            No integrated hospitals automatically detected within 5km. Requesting expanded search...
          </div>
        )}
      </div>
    </div>
  );
};

export default EmergencyPanel;
