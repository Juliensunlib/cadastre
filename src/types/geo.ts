export interface Coordinates {
  lat: number;
  lng: number;
}

export interface SearchResult {
  label: string;
  coordinates: Coordinates;
  city: string;
  postcode: string;
  context: string;
}

export interface CadastralInfo {
  commune: string;
  section: string;
  numero: string;
  surface: number;
  contenance: number;
  nature: string;
  proprietaire?: string;
}

export interface MapLayer {
  id: string;
  name: string;
  url: string;
  type: 'wms' | 'wmts' | 'tile';
  attribution: string;
  active: boolean;
}