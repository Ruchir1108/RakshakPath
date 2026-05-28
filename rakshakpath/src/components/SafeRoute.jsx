import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

function SafeRoute({ start, end, hotspots, setSafetyScore }) {

  const map = useMap();

  useEffect(() => {

    if (!start || !end) return;

    const routing = L.Routing.control({

      waypoints: [
        L.latLng(start.lat, start.lng),
        L.latLng(end.lat, end.lng)
      ],

      routeWhileDragging: false,
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,

      // hide default UI
      show: false,
      collapsible: true,

      lineOptions: {
        styles: [
          {
            color: "transparent",
            opacity: 0
          }
        ]
      }

    }).addTo(map);

    let customLines = [];

    routing.on("routesfound", function (e) {
      if (customLines.length > 0) {
        customLines.forEach(line => map.removeLayer(line));
        customLines = [];
      }

      const route = e.routes[0].coordinates;
      let riskScore = 0;

      const getPointRisk = (point) => {
        let maxRisk = 0; // 0: Green, 1: Yellow, 2: Red
        for (let spot of hotspots) {
          const spotLat = spot.latitude || spot.Latitude;
          const spotLng = spot.longitude || spot.Longitude;
          if (!spotLat || !spotLng) continue;

          const dist = map.distance([point.lat, point.lng], [spotLat, spotLng]);
          if (dist < 250) {
            if (spot.Risk_Level === "High Risk") {
              return 2;
            }
            if (spot.Risk_Level === "Medium Risk") {
              maxRisk = 1;
            }
          }
        }
        return maxRisk;
      };

      let currentSegment = [];
      let currentRisk = getPointRisk(route[0]);
      currentSegment.push(route[0]);

      for (let i = 1; i < route.length; i++) {
        const point = route[i];
        const pointRisk = getPointRisk(point);

        if (pointRisk > 0 || currentRisk > 0) {
          riskScore += (pointRisk || currentRisk);
        }

        currentSegment.push(point);

        if (pointRisk !== currentRisk || i === route.length - 1) {
          const color = currentRisk === 2 ? '#ef4444' : currentRisk === 1 ? '#eab308' : '#22c55e';
          
          const polyline = L.polyline(currentSegment, {
            color: color,
            weight: 6,
            opacity: 0.9,
            lineCap: 'round',
            lineJoin: 'round'
          }).addTo(map);
          
          customLines.push(polyline);
          
          currentSegment = [point];
          currentRisk = pointRisk;
        }
      }

      // Compute safety score out of 100 based on the length/risk
      const safety = Math.max(0, 100 - riskScore);
      setSafetyScore(safety);

    });

    return () => {
      customLines.forEach(line => map.removeLayer(line));
      map.removeControl(routing);
    };

  }, [start, end, hotspots, map, setSafetyScore]);

  return null;
}

export default SafeRoute;