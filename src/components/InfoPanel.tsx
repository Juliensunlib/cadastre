import React from 'react';
import { MapPin, Home, Ruler, FileText, Calendar, User, Camera, Download } from 'lucide-react';
import { CadastralInfo } from '../types/geo';
import { IGNService } from '../services/ignService';

interface InfoPanelProps {
  cadastralInfo: CadastralInfo | null;
  coordinates: { lat: number; lng: number } | null;
  isLoading: boolean;
}

const InfoPanel: React.FC<InfoPanelProps> = ({ cadastralInfo, coordinates, isLoading }) => {
  const handleExportPDF = async () => {
    if (cadastralInfo && coordinates) {
      const exportData = {
        timestamp: new Date().toISOString(),
        coordinates: {
          latitude: coordinates.lat,
          longitude: coordinates.lng
        },
        cadastral: cadastralInfo,
        source: 'Sunlib - Géoservices IGN'
      };
      
      await IGNService.exportToPDF(exportData, cadastralInfo, coordinates);
    } else {
      alert('Aucune donnée à exporter. Cliquez d\'abord sur la carte pour obtenir des informations cadastrales.');
    }
  };

  const handleScreenshot = async () => {
    await IGNService.captureMap();
  };

  if (isLoading) {
    return (
      <div className="card p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Coordonnées */}
      {coordinates && (
        <div className="card p-4">
          <div className="flex items-center space-x-2 mb-3">
            <MapPin className="h-5 w-5 text-sunlib-600" />
            <h3 className="font-semibold text-gray-800">Coordonnées</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Latitude:</span>
              <span className="font-mono">{coordinates.lat.toFixed(6)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Longitude:</span>
              <span className="font-mono">{coordinates.lng.toFixed(6)}</span>
            </div>
            <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-500">
              Système de coordonnées: WGS84 (EPSG:4326)
            </div>
          </div>
        </div>
      )}

      {/* Informations cadastrales */}
      {cadastralInfo && (
        <div className="card p-4">
          <div className="flex items-center space-x-2 mb-3">
            <FileText className="h-5 w-5 text-sunlib-600" />
            <h3 className="font-semibold text-gray-800">Informations cadastrales</h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Home className="h-4 w-4 text-gray-400" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">{cadastralInfo.commune}</p>
                <p className="text-xs text-gray-500">Commune</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Section</p>
                <p className="font-semibold text-gray-800">{cadastralInfo.section}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Numéro</p>
                <p className="font-semibold text-gray-800">{cadastralInfo.numero}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Ruler className="h-4 w-4 text-gray-400" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">{cadastralInfo.surface.toLocaleString()} m²</p>
                <p className="text-xs text-gray-500">Surface cadastrale</p>
              </div>
            </div>
            
            <div className="bg-sunlib-50 p-3 rounded-lg border border-sunlib-200">
              <p className="text-xs text-sunlib-600 mb-1">Nature du terrain</p>
              <p className="font-semibold text-sunlib-800">{cadastralInfo.nature}</p>
            </div>
            
            {cadastralInfo.proprietaire && (
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{cadastralInfo.proprietaire}</p>
                  <p className="text-xs text-gray-500">Propriétaire</p>
                </div>
              </div>
            )}
            
            <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-600">
              <p className="font-medium">Référence cadastrale:</p>
              <p className="font-mono">{cadastralInfo.section} {cadastralInfo.numero}</p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="card p-4">
        <h3 className="font-semibold text-gray-800 mb-3">Actions</h3>
        <div className="space-y-2">
          <button 
            onClick={handleExportPDF}
            className="btn-primary w-full text-sm flex items-center justify-center"
            disabled={!cadastralInfo}
          >
            <Download className="h-4 w-4 mr-2" />
            Extrait cadastral (PDF)
          </button>
          <button 
            onClick={handleScreenshot}
            className="btn-secondary w-full text-sm flex items-center justify-center"
          >
            <Camera className="h-4 w-4 mr-2" />
            Capture d'écran
          </button>
        </div>
        
        {!cadastralInfo && coordinates && (
          <div className="mt-3 p-2 bg-yellow-50 rounded text-xs text-yellow-700">
            Cliquez sur la carte pour obtenir les informations cadastrales
          </div>
        )}
        
        {cadastralInfo && (
          <div className="mt-3 p-2 bg-green-50 rounded text-xs text-green-700">
            <strong>PDF officiel:</strong> Document avec en-tête officiel, coordonnées géographiques et capture de carte
          </div>
        )}
      </div>

      {/* Légende */}
      <div className="card p-4">
        <h3 className="font-semibold text-gray-800 mb-3">Légende</h3>
        <div className="space-y-2 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Position sélectionnée</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Adresse recherchée</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoPanel;