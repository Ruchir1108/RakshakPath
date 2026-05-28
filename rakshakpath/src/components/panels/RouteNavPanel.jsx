import { motion } from "framer-motion";
import { Navigation, MapPin } from "lucide-react";
import LocationSearch from "../LocationSearch";
import { useState } from "react";

const RouteNavPanel = ({ setAppStart, setAppEnd, setActiveTab }) => {
  const [localStart, setLocalStart] = useState("");
  const [localEnd, setLocalEnd] = useState("");

  const handleRouteSync = () => {
    if (localStart && localEnd && localStart.lat && localEnd.lat) {
      setAppStart(localStart);
      setAppEnd(localEnd);
      setActiveTab("map");
    } else {
      alert("Please enter and select a valid location from the search dropdown for both Start and Destination.");
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-8 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=12.9716,77.5946&zoom=13&size=800x600&maptype=roadmap&style=feature:all|element:labels.text.fill|color:0xffffff&style=feature:all|element:labels.text.stroke|color:0x000000&style=feature:all|element:geometry|color:0x202c3e')] bg-cover bg-center">
      <div className="absolute inset-0 bg-dark/80 backdrop-blur-sm"></div>
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass-card w-full max-w-md relative z-10 border-slate-600 border p-8 shadow-2xl"
      >
        <div className="mb-8 text-center">
          <div className="w-16 h-16 bg-neon-blue/20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(56,189,248,0.3)]">
            <Navigation className="text-neon-blue" size={32} />
          </div>
          <h2 className="text-2xl font-bold tracking-wide text-slate-100">Smart Route Setup</h2>
          <p className="text-slate-400 mt-2 text-sm">Avoid black spots with AI predictive routing</p>
        </div>

        <div className="space-y-6 relative">
          <div className="absolute left-[15px] top-[30px] bottom-[40px] w-0.5 bg-slate-700"></div>
          
          <div className="relative">
            <div className="absolute left-[-5px] top-1/2 -translate-y-1/2 w-4 h-4 bg-neon-blue rounded-full border-4 border-slate-900 z-10"></div>
            <div className="ml-8">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1 block">Start Location</label>
              <LocationSearch placeholder="Enter starting point..." setLocation={setLocalStart} />
            </div>
          </div>

          <div className="relative">
            <div className="absolute left-[-5px] top-1/2 -translate-y-1/2 w-4 h-4 bg-neon-green rounded-full border-4 border-slate-900 z-10"></div>
            <div className="ml-8">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1 block">Destination</label>
              <LocationSearch placeholder="Enter destination..." setLocation={setLocalEnd} />
            </div>
          </div>
        </div>

        <button 
          onClick={handleRouteSync}
          className="w-full mt-10 bg-linear-to-r from-neon-blue to-blue-600 text-white font-bold py-4 rounded-xl shadow-[0_0_15px_rgba(56,189,248,0.4)] hover:shadow-[0_0_25px_rgba(56,189,248,0.6)] transition-all flex justify-center gap-2 items-center"
        >
          <MapPin size={20} />
          Calculate Safe Route
        </button>
      </motion.div>
    </div>
  );
};

export default RouteNavPanel;
