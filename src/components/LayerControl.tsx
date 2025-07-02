import React from 'react';
import { Map, Camera, FileText, Eye, EyeOff } from 'lucide-react';

interface Layer {
  id: string;
  name: string;
  icon: React.ReactNode;
  active: boolean;
}

interface LayerControlProps {
  layers: Layer[];
  onToggleLayer: (layerId: string) => void;
}

const LayerControl: React.FC<LayerControlProps> = ({ layers, onToggleLayer }) => {
  return (
    <div className="card p-4 space-y-3">
      <h3 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">
        Couches cartographiques
      </h3>
      
      <div className="space-y-2">
        {layers.map((layer) => (
          <button
            key={layer.id}
            onClick={() => onToggleLayer(layer.id)}
            className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all duration-200 ${
              layer.active
                ? 'bg-sunlib-50 border-sunlib-200 text-sunlib-700 shadow-sm'
                : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`p-1 rounded transition-colors ${layer.active ? 'text-sunlib-600' : 'text-gray-400'}`}>
                {layer.icon}
              </div>
              <span className="text-sm font-medium">{layer.name}</span>
            </div>
            
            <div className={`transition-colors ${layer.active ? 'text-sunlib-600' : 'text-gray-400'}`}>
              {layer.active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </div>
          </button>
        ))}
      </div>
      
      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="text-xs font-semibold text-blue-800 mb-2">Informations</h4>
        <div className="text-xs text-blue-700 space-y-1">
          <p>• <strong>Plan IGN:</strong> Carte OpenStreetMap France</p>
          <p>• <strong>Vue aérienne:</strong> Images satellite Google Maps</p>
          <p>• <strong>Cadastre:</strong> Parcelles cadastrales + OSM</p>
        </div>
      </div>
    </div>
  );
};

export default LayerControl;