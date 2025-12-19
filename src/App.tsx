import React, { useState, useEffect } from 'react';
import { Map, Camera, FileText, X } from 'lucide-react';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import MapComponent from './components/MapComponent';
import LayerControl from './components/LayerControl';
import InfoPanel from './components/InfoPanel';
import { SearchResult, CadastralInfo, Coordinates } from './types/geo';
import { IGNService } from './services/ignService';

function App() {
  const [selectedLocation, setSelectedLocation] = useState<SearchResult | null>(null);
  const [clickedCoordinates, setClickedCoordinates] = useState<Coordinates | null>(null);
  const [cadastralInfo, setCadastralInfo] = useState<CadastralInfo | null>(null);
  const [isLoadingCadastral, setIsLoadingCadastral] = useState(false);
  const [activeLayer, setActiveLayer] = useState('plan');
  const [showGuide, setShowGuide] = useState(true);

  const layers = [
    {
      id: 'plan',
      name: 'Plan IGN',
      icon: <Map className="h-4 w-4" />,
      active: activeLayer === 'plan'
    },
    {
      id: 'orthophoto',
      name: 'Vue aérienne',
      icon: <Camera className="h-4 w-4" />,
      active: activeLayer === 'orthophoto'
    },
    {
      id: 'cadastre',
      name: 'Cadastre',
      icon: <FileText className="h-4 w-4" />,
      active: activeLayer === 'cadastre'
    }
  ];

  const handleLocationSelect = (result: SearchResult) => {
    setSelectedLocation(result);
    setClickedCoordinates(result.coordinates);
  };

  const handleMapClick = (coordinates: Coordinates) => {
    setClickedCoordinates(coordinates);
    // Réinitialiser la location sélectionnée si on clique ailleurs
    if (selectedLocation && 
        (Math.abs(selectedLocation.coordinates.lat - coordinates.lat) > 0.0001 ||
         Math.abs(selectedLocation.coordinates.lng - coordinates.lng) > 0.0001)) {
      setSelectedLocation(null);
    }
  };

  const handleToggleLayer = (layerId: string) => {
    setActiveLayer(layerId);
  };

  // Charger les informations cadastrales quand on clique sur la carte
  useEffect(() => {
    const loadCadastralInfo = async () => {
      if (clickedCoordinates) {
        setIsLoadingCadastral(true);
        setCadastralInfo(null); // Réinitialiser les infos précédentes
        
        try {
          const info = await IGNService.getCadastralInfo(
            clickedCoordinates.lat, 
            clickedCoordinates.lng
          );
          setCadastralInfo(info);
        } catch (error) {
          console.error('Erreur lors du chargement des infos cadastrales:', error);
          setCadastralInfo(null);
        } finally {
          setIsLoadingCadastral(false);
        }
      }
    };

    loadCadastralInfo();
  }, [clickedCoordinates]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        {/* Barre de recherche avec z-index élevé */}
        <div className="mb-6 flex justify-center relative z-[9999]">
          <SearchBar onLocationSelect={handleLocationSelect} />
        </div>

        {/* Interface principale */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-12rem)]">
          {/* Panneau de contrôle des couches */}
          <div className="lg:col-span-1 space-y-4 relative z-20">
            <LayerControl 
              layers={layers}
              onToggleLayer={handleToggleLayer}
            />
            
            <InfoPanel 
              cadastralInfo={cadastralInfo}
              coordinates={clickedCoordinates}
              isLoading={isLoadingCadastral}
            />
          </div>

          {/* Carte avec z-index plus bas */}
          <div className="lg:col-span-3 relative z-10">
            <MapComponent
              selectedLocation={selectedLocation}
              activeLayer={activeLayer}
              onLocationClick={handleMapClick}
            />
          </div>
        </div>
      </main>

      {/* Guide d'utilisation avec bouton de fermeture */}
      {showGuide && (
        <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-sm border border-gray-200 z-30">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-gray-800 flex items-center">
              <FileText className="h-4 w-4 mr-2 text-sunlib-600" />
              Guide d'utilisation
            </h4>
            <button
              onClick={() => setShowGuide(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              title="Fermer le guide"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Recherchez une adresse dans la barre de recherche</li>
            <li>• Cliquez sur la carte pour obtenir les infos cadastrales</li>
            <li>• Changez de couche pour différentes vues</li>
            <li>• Exportez vos données avec les boutons d'action</li>
          </ul>
          <div className="mt-3 p-2 bg-sunlib-50 rounded text-xs text-sunlib-700">
            <strong>Astuce:</strong> Les informations cadastrales sont récupérées automatiquement depuis l'API du Géoportail
          </div>
        </div>
      )}
    </div>
  );
}

export default App;