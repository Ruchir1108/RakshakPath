import { motion } from "framer-motion";
import { AlertCircle, TrendingUp, ShieldCheck } from "lucide-react";

function Dashboard({ hotspots, safetyScore }) {
  const hotspotsList = hotspots || [];
  
  const high = hotspotsList.filter(h => h.Risk_Level === "High Risk").length;
  const medium = hotspotsList.filter(h => h.Risk_Level === "Medium Risk").length;
  const low = hotspotsList.filter(h => h.Risk_Level === "Low Risk").length;
  
  // Calculate dynamic causes from data
  const causesCount = {};
  hotspotsList.forEach(h => {
    if (h.Crash_Type) {
      causesCount[h.Crash_Type] = (causesCount[h.Crash_Type] || 0) + 1;
    }
  });
  const causeEntries = Object.entries(causesCount).sort((a,b) => b[1] - a[1]).slice(0, 4);
  const totalWithCauses = causeEntries.reduce((acc, curr) => acc + curr[1], 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* High Risk Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass-card border-none bg-linear-to-br from-red-900/30 to-slate-900/80 relative overflow-hidden"
        >
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-neon-red/20 rounded-full blur-2xl"></div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-sm font-semibold mb-1">High Risk Zones</p>
              <h3 className="text-4xl font-black text-neon-red">{high}</h3>
            </div>
            <div className="p-2 bg-red-950/50 rounded-lg">
              <AlertCircle size={24} className="text-neon-red" />
            </div>
          </div>
        </motion.div>

        {/* Medium Risk Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="glass-card border-none bg-linear-to-br from-orange-900/30 to-slate-900/80 relative overflow-hidden"
        >
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-neon-orange/20 rounded-full blur-2xl"></div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-sm font-semibold mb-1">Medium Risk Zones</p>
              <h3 className="text-4xl font-black text-neon-orange">{medium}</h3>
            </div>
            <div className="p-2 bg-orange-950/50 rounded-lg">
              <TrendingUp size={24} className="text-neon-orange" />
            </div>
          </div>
        </motion.div>

        {/* Low Risk Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="glass-card border-none bg-linear-to-br from-green-900/30 to-slate-900/80 relative overflow-hidden"
        >
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-neon-green/20 rounded-full blur-2xl"></div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-sm font-semibold mb-1">Low Risk Zones</p>
              <h3 className="text-4xl font-black text-neon-green">{low}</h3>
            </div>
            <div className="p-2 bg-green-950/50 rounded-lg">
              <ShieldCheck size={24} className="text-neon-green" />
            </div>
          </div>
        </motion.div>
      </div>

      {safetyScore !== null && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}
          className="glass-card mt-8 border border-slate-700/50 bg-slate-800/80"
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <h3 className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-white to-slate-400 mb-2">
                Route Safety Score
              </h3>
              <p className="text-slate-400 text-sm max-w-sm">
                AI calculated safety score based on historical accident density, infrastructural flaws, and current temporal factors along the chosen route.
              </p>
            </div>
            
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="64" cy="64" r="56" className="stroke-slate-700 fill-none opacity-50" strokeWidth="12" />
                <circle cx="64" cy="64" r="56" className={`fill-none ${safetyScore > 70 ? 'stroke-neon-green' : safetyScore > 40 ? 'stroke-neon-orange' : 'stroke-neon-red'}`} strokeWidth="12" strokeDasharray="351.858" strokeDashoffset={351.858 - (351.858 * safetyScore) / 100} strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s ease-in-out" }} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-3xl font-black ${safetyScore > 70 ? 'text-neon-green' : safetyScore > 40 ? 'text-neon-orange' : 'text-neon-red'}`}>
                  {safetyScore}
                </span>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">/ 100</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Advanced Placeholder for Graph Options */}
      <div className="mt-8 glass-card border border-slate-700/50">
        <h3 className="text-lg font-semibold text-slate-200 mb-6">Infrastructural Root Cause Analysis</h3>
        <div className="space-y-4">
          {causeEntries.length > 0 ? causeEntries.map(([cause, count], idx) => {
            const percentage = Math.round((count / totalWithCauses) * 100);
            return (
              <div key={idx} className="relative w-full">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-300 font-medium">{cause}</span>
                  <span className="text-neon-blue">{percentage}%</span>
                </div>
                <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-700">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, delay: idx * 0.2 }}
                    className="h-full bg-linear-to-r from-neon-blue to-neon-orange"
                  />
                </div>
              </div>
            );
          }) : (
            <p className="text-slate-500 font-medium tracking-wide text-center py-4">Not enough detailed cause data available.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;