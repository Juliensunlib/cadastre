import React from 'react';
import { Map, Settings } from 'lucide-react';

const Header: React.FC = () => {
  const handleMapView = () => {
    // Centrer sur la France
    window.dispatchEvent(new CustomEvent('map-center-france'));
  };

  const handleSettings = () => {
    // Ouvrir un modal de paramètres (à implémenter)
    alert('Paramètres - Fonctionnalité à venir');
  };

  return (
    <header className="bg-sunlib-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-sunlib-500 p-2 rounded-lg">
              <img 
                src="/01.jpg" 
                alt="Sunlib Logo" 
                className="h-6 w-6 object-contain"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold">SunLib</h1>
              <p className="text-sunlib-100 text-sm">Géoservices IGN</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleMapView}
              className="p-2 hover:bg-sunlib-700 rounded-lg transition-colors"
              title="Centrer la carte"
            >
              <Map className="h-5 w-5" />
            </button>
            <button 
              onClick={handleSettings}
              className="p-2 hover:bg-sunlib-700 rounded-lg transition-colors"
              title="Paramètres"
            >
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
