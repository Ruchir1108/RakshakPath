import L from "leaflet";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: iconUrl,
  shadowUrl: iconShadow
});

L.Marker.prototype.options.icon = DefaultIcon;