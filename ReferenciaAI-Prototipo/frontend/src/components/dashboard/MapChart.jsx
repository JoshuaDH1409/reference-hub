import React from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const markers = [
  // México
  { name: "CDMX", coordinates: [19.4326, -99.1332], size: 12, fill: "#F66B40", label: "Ciudad de México (Mayoría)" },
  { name: "Monterrey", coordinates: [25.6866, -100.3161], size: 9, fill: "#F66B40", label: "Monterrey" },
  { name: "Guadalajara", coordinates: [20.6597, -103.3496], size: 9, fill: "#F66B40", label: "Guadalajara" },
  { name: "Querétaro", coordinates: [20.5888, -100.3899], size: 7, fill: "#F66B40", label: "Querétaro" },
  
  // USA
  { name: "USA (Tx)", coordinates: [30.2672, -97.7431], size: 6, fill: "#60A5FA", label: "Texas, USA" },
  { name: "USA (NY)", coordinates: [40.7128, -74.0060], size: 5, fill: "#60A5FA", label: "Nueva York, USA" },
  
  // Sudamérica
  { name: "Argentina", coordinates: [-34.6037, -58.3816], size: 5, fill: "#FEAA18", label: "Buenos Aires, Arg" },
  { name: "Chile", coordinates: [-33.4489, -70.6693], size: 5, fill: "#FEAA18", label: "Santiago, Chile" }
];

export function MapChart() {
  return (
    <div style={{ width: "100%", height: "100%", borderRadius: "1.5rem", overflow: "hidden" }}>
      <MapContainer 
        center={[23.6345, -102.5528]} // Centro de México
        zoom={4.5} // Nivel de zoom nacional
        style={{ width: "100%", height: "100%", zIndex: 1 }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {markers.map((marker, idx) => (
          <CircleMarker
            key={idx}
            center={marker.coordinates}
            pathOptions={{ 
              color: marker.fill, 
              fillColor: marker.fill,
              fillOpacity: 0.8,
              weight: 2
            }}
            radius={marker.size}
          >
            <Tooltip direction="top" offset={[0, -10]} opacity={1}>
              <span style={{ fontWeight: 'bold', fontFamily: 'Inter' }}>{marker.label}</span>
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
