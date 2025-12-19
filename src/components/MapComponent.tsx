import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMapEvents, Marker, Popup, useMap } from 'react-leaflet';
import { LatLngTuple, Icon } from 'leaflet';
import { SearchResult, Coordinates } from '../types/geo';

// Configuration de l'icône par défaut de Leaflet
const defaultIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface MapComponentProps {
  selectedLocation: SearchResult | null;
  activeLayer: string;
  onLocationClick: (coordinates: Coordinates) => void;
}

const MapClickHandler: React.FC<{ onLocationClick: (coordinates: Coordinates) => void }> = ({ onLocationClick }) => {
  useMapEvents({
    click: (e) => {
      onLocationClick({
        lat: e.latlng.lat,
        lng: e.latlng.lng
      });
    },
  });
  return null;
};

const MapUpdater: React.FC<{ position: LatLngTuple; zoom: number }> = ({ position, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView(position, zoom);
  }, [map, position, zoom]);

  useEffect(() => {
    const handleCenterFrance = () => {
      map.setView([46.603354, 1.888334], 6);
    };

    window.addEventListener('map-center-france', handleCenterFrance);
    return () => window.removeEventListener('map-center-france', handleCenterFrance);
  }, [map]);

  return null;
};

const MapComponent: React.FC<MapComponentProps> = ({ selectedLocation, activeLayer, onLocationClick }) => {
  const [position, setPosition] = useState<LatLngTuple>([46.603354, 1.888334]); // Centre de la France
  const [zoom, setZoom] = useState(6);
  const [clickedPosition, setClickedPosition] = useState<Coordinates | null>(null);

  useEffect(() => {
    if (selectedLocation) {
      setPosition([selectedLocation.coordinates.lat, selectedLocation.coordinates.lng]);
      setZoom(16);
    }
  }, [selectedLocation]);

  const handleLocationClick = (coordinates: Coordinates) => {
    setClickedPosition(coordinates);
    onLocationClick(coordinates);
  };

  const getLayerComponent = () => {
    switch (activeLayer) {
      case 'orthophoto':
        // Utilisation de Google Maps satellite
        return (
          <TileLayer
            key="google-satellite"
            url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
            attribution="© Google Maps Satellite"
            maxZoom={20}
            minZoom={1}
          />
        );
      case 'cadastre':
        return (
          <React.Fragment key="cadastre">
            {/* Fond de carte Google Satellite pour meilleure lisibilité */}
            <TileLayer
              url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
              attribution="© Google Maps"
              maxZoom={20}
            />
            {/* Couche cadastrale IGN par-dessus */}
            <TileLayer
              url="https://wxs.ign.fr/decouverte/geoportail/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=CADASTRALPARCELS.PARCELLAIRE_EXPRESS&STYLE=PCI%20vecteur&TILEMATRIXSET=PM&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=image%2Fpng"
              attribution="© IGN - Cadastre"
              opacity={0.85}
              maxZoom={20}
              minZoom={13}
            />
          </React.Fragment>
        );
      case 'plan':
      default:
        // Utilisation d'OpenStreetMap comme plan de base fiable
        return (
          <TileLayer
            key="osm-plan"
            url="https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png"
            attribution="© OpenStreetMap France"
            maxZoom={20}
            minZoom={1}
          />
        );
    }
  };

  return (
    <div className="h-full w-full rounded-lg overflow-hidden shadow-lg relative z-10">
      <MapContainer 
        center={position} 
        zoom={zoom} 
        className="h-full w-full"
        zoomControl={true}
        attributionControl={true}
      >
        {getLayerComponent()}
        
        <MapClickHandler onLocationClick={handleLocationClick} />
        <MapUpdater position={position} zoom={zoom} />
        
        {selectedLocation && (
          <Marker 
            position={[selectedLocation.coordinates.lat, selectedLocation.coordinates.lng]}
            icon={defaultIcon}
          >
            <Popup>
              <div className="p-2">
                <p className="font-semibold text-sm">{selectedLocation.label}</p>
                <p className="text-xs text-gray-600">{selectedLocation.context}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {selectedLocation.coordinates.lat.toFixed(6)}, {selectedLocation.coordinates.lng.toFixed(6)}
                </p>
              </div>
            </Popup>
          </Marker>
        )}
        
        {clickedPosition && (
          <Marker 
            position={[clickedPosition.lat, clickedPosition.lng]}
            icon={defaultIcon}
          >
            <Popup>
              <div className="p-2">
                <p className="font-semibold text-sm">Position sélectionnée</p>
                <p className="text-xs text-gray-600">
                  {clickedPosition.lat.toFixed(6)}, {clickedPosition.lng.toFixed(6)}
                </p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default MapComponent;