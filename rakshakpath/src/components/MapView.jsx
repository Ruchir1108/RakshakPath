import React, { useMemo } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, ZoomControl, Marker, Popup, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "../utils/FixLeafletIcon";
import SafeRoute from "./SafeRoute";
import HeatmapLayer from "./HeatmapLayer";
import { ShieldAlert, ShieldCheck, MapPin, Navigation2, LogIn, Navigation as NavIcon } from "lucide-react";

function MapView({ hotspots, start, end, searchRoute, setSafetyScore, safetyScore }) {
  const mapStyle = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  const clusters = useMemo(() => {
    if (!hotspots) return [];
    
    const items = [];
    const highRiskSpots = hotspots.filter(s => s.Risk_Level === "High Risk");
    
    highRiskSpots.forEach(spot => {
      const lat = spot.Latitude || spot.latitude;
      const lng = spot.Longitude || spot.longitude;
      if (!lat || !lng) return;
      
      let added = false;
      for (let cluster of items) {
        const dLat = Math.abs(cluster.lat - lat);
        const dLng = Math.abs(cluster.lng - lng);
        if (Math.sqrt(dLat * dLat + dLng * dLng) < 0.004) {
          cluster.count += 1;
          cluster.spots.push(spot);
          cluster.lat = (cluster.lat * (cluster.count - 1) + lat) / cluster.count;
          cluster.lng = (cluster.lng * (cluster.count - 1) + lng) / cluster.count;
          added = true;
          break;
        }
      }
      
      if (!added) {
        items.push({ lat, lng, count: 1, spots: [spot] });
      }
    });
    
    return items;
  }, [hotspots]);

  const pulsingIcon = new L.DivIcon({
    className: "bg-transparent",
    html: `<div class="relative flex h-8 w-8 justify-center items-center">
             <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
             <span class="relative inline-flex rounded-full h-4 w-4 bg-red-600 border-2 border-white shadow-[0_0_15px_rgba(239,68,68,1)]"></span>
           </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });

  const getClusterIcon = (count) => new L.DivIcon({
    className: "bg-transparent",
    html: `<div class="relative flex h-10 w-10 justify-center items-center">
             <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-50"></span>
             <div class="relative flex items-center justify-center rounded-full h-10 w-10 bg-red-600 border-2 border-white shadow-[0_0_20px_rgba(239,68,68,1)] text-white font-bold text-sm">
               ${count}
             </div>
           </div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20]
  });

  const userIcon = new L.DivIcon({
    className: "bg-transparent",
    html: `<div class="relative flex h-8 w-8 justify-center items-center">
             <div class="relative flex items-center justify-center rounded-full h-8 w-8 bg-blue-600 border-2 border-white shadow-[0_0_15px_rgba(37,99,235,1)] text-white">
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
             </div>
           </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });

  const destinationIcon = new L.DivIcon({
    className: "bg-transparent",
    html: `<div class="relative flex h-8 w-8 justify-center items-center">
             <div class="relative flex items-center justify-center rounded-full h-8 w-8 bg-green-600 border-2 border-white shadow-[0_0_15px_rgba(34,197,94,1)] text-white">
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="14" x="3" y="4" rx="2"/><path d="M12 9v4"/><path d="M10 11h4"/><path d="M15.3 14H22"/><path d="M2 14h6.7"/></svg>
             </div>
           </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });

  return (
    <div className="relative w-full h-full bg-slate-900 border-l border-slate-800 pointer-events-auto z-10">
      
      {searchRoute && safetyScore !== null && safetyScore !== undefined && (
        <div className="absolute top-6 left-6 z-1000 glass-card p-5 animate-in slide-in-from-top-4 flex items-center gap-4 border-l-4 shadow-[0_4px_30px_rgba(0,0,0,0.5)]" 
             style={{ borderLeftColor: safetyScore > 70 ? '#22c55e' : safetyScore > 40 ? '#f97316' : '#ef4444' }}>
          <div className="p-3 rounded-full" style={{ backgroundColor: safetyScore > 70 ? 'rgba(34,197,94,0.2)' : safetyScore > 40 ? 'rgba(249,115,22,0.2)' : 'rgba(239,68,68,0.2)' }}>
            {safetyScore > 70 ? <ShieldCheck className="text-neon-green" size={32} /> : 
             safetyScore > 40 ? <ShieldAlert className="text-neon-orange" size={32} /> : 
             <ShieldAlert className="text-neon-red" size={32} />}
          </div>
          <div className="flex flex-col gap-2">
            <div>
              <h3 className="text-sm uppercase tracking-widest text-slate-400 font-bold mb-1">Route Safety Score</h3>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-black text-slate-100">{safetyScore.toFixed(0)}</span>
                <span className="text-lg text-slate-500 font-medium mb-1">/ 100</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {safetyScore > 70 ? "Safe to proceed." : safetyScore > 40 ? "Exercise caution. Minor hazards present." : "High risk route! Avoid if possible."}
              </p>
            </div>
            
            <button 
              onClick={() => {
                if (start && end) {
                  const url = `https://www.google.com/maps/dir/?api=1&origin=${start.lat},${start.lon||start.lng}&destination=${end.lat},${end.lon||end.lng}&travelmode=driving`;
                  window.open(url, '_blank');
                }
              }}
              className="mt-2 w-full bg-neon-blue hover:bg-blue-600 text-white py-2 rounded-lg font-bold flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all cursor-pointer pointer-events-auto">
              <NavIcon size={18} /> Start Navigation
            </button>
          </div>
        </div>
      )}

      <MapContainer
        center={[12.9716, 77.5946]}
        zoom={12}
        zoomControl={false}
        className="w-full h-full bg-dark!"
      >
        <ZoomControl position="bottomright" />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url={mapStyle}
        />

        {/* Heatmap Layer */}
        {hotspots && hotspots.length > 0 && <HeatmapLayer hotspots={hotspots} />}

        {/* Danger Radius & Clustered Pulsing Markers */}
        {clusters.map((cluster, i) => (
          <React.Fragment key={i}>
            <Circle 
              center={[cluster.lat, cluster.lng]} 
              radius={300} 
              pathOptions={{
                color: '#ef4444',
                fillColor: '#ef4444',
                fillOpacity: 0.15,
                weight: 1,
                dashArray: "4 4"
              }} 
            />
            <Marker 
              position={[cluster.lat, cluster.lng]} 
              icon={cluster.count > 1 ? getClusterIcon(cluster.count) : pulsingIcon}
            >
              <Popup className="glass-popup">
                <div className="p-2 min-w-[200px]">
                  <h3 className="font-bold text-slate-800 text-lg border-b pb-1 mb-2">
                    {cluster.count > 1 ? `High Risk Cluster (${cluster.count} incidents)` : (cluster.spots[0].Area || "Accident Blackspot")}
                  </h3>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-slate-500 text-sm">Status:</span>
                    <span className="font-bold text-neon-red">DANGER ZONE</span>
                  </div>
                  {cluster.count === 1 && cluster.spots[0].Crash_Type && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Cause:</span>
                      <span className="font-semibold text-slate-700">{cluster.spots[0].Crash_Type}</span>
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          </React.Fragment>
        ))}

        {/* Start Point Marker */}
        {start && (
          <Marker position={[start.lat, start.lon || start.lng]} icon={userIcon}>
            <Popup className="glass-popup border-l-4 border-blue-500">
              <div className="font-bold text-slate-800">{start.name || "Your Location"}</div>
            </Popup>
          </Marker>
        )}

        {/* End Point Marker */}
        {end && (
          <Marker position={[end.lat, end.lon || end.lng]} icon={destinationIcon}>
            <Popup className="glass-popup border-l-4 border-green-500">
              <div className="font-bold text-slate-800">{end.name || "Destination Hospital"}</div>
            </Popup>
          </Marker>
        )}

        {/* Routing Layer */}
        {searchRoute && start && end && (
          <SafeRoute
            start={start}
            end={end}
            hotspots={hotspots}
            setSafetyScore={setSafetyScore}
          />
        )}
      </MapContainer>
    </div>
  );
}

export default MapView;