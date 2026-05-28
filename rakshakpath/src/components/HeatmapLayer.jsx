import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.heat";

function HeatmapLayer({ hotspots }) {

  const map = useMap();

  useEffect(() => {

    const heatPoints = hotspots.map(h => [
      h.Latitude,
      h.Longitude,
      0.8
    ]);

    const heat = L.heatLayer(heatPoints, {
      radius: 25,
      blur: 20,
      gradient: {
        0.4: '#22c55e', // green
        0.7: '#eab308', // yellow
        1.0: '#ef4444'  // red
      }
    }).addTo(map);

    return () => {
      map.removeLayer(heat);
    };

  }, [hotspots, map]);

  return null;
}

export default HeatmapLayer;