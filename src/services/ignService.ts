import { SearchResult, CadastralInfo } from '../types/geo';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const IGN_API_KEY = 'decouverte'; // Clé de démonstration

export class IGNService {
  private static baseUrl = 'https://wxs.ign.fr';
  
  // Recherche d'adresses via l'API de géocodage IGN
  static async searchAddress(query: string): Promise<SearchResult[]> {
    if (!query || query.length < 3) return [];
    
    try {
      const response = await fetch(
        `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=10`
      );
      
      if (!response.ok) throw new Error('Erreur de géocodage');
      
      const data = await response.json();
      
      return data.features.map((feature: any) => ({
        label: feature.properties.label,
        coordinates: {
          lat: feature.geometry.coordinates[1],
          lng: feature.geometry.coordinates[0]
        },
        city: feature.properties.city || '',
        postcode: feature.properties.postcode || '',
        context: feature.properties.context || ''
      }));
    } catch (error) {
      console.error('Erreur lors de la recherche d\'adresse:', error);
      return [];
    }
  }
  
  // Récupération des informations cadastrales basées sur les coordonnées
  static async getCadastralInfo(lat: number, lng: number): Promise<CadastralInfo | null> {
    try {
      // Utilisation de l'API Carto Cadastre pour récupérer les parcelles par intersection
      const geojson = {
        type: "Point",
        coordinates: [lng, lat]
      };

      const response = await fetch(
        `https://apicarto.ign.fr/api/cadastre/parcelle?geom=${encodeURIComponent(JSON.stringify(geojson))}`
      );

      if (!response.ok) {
        console.warn('Erreur API cadastre:', response.status);
        return null;
      }

      const data = await response.json();

      // Vérifier si des parcelles ont été trouvées
      if (!data.features || data.features.length === 0) {
        console.warn('Aucune parcelle cadastrale trouvée à ces coordonnées');
        return null;
      }

      // Extraire les informations de la première parcelle
      const feature = data.features[0];
      const props = feature.properties;

      console.log('Parcelle trouvée:', props); // Pour debug

      return {
        commune: (props.nom_com || props.commune || 'Commune inconnue').toUpperCase(),
        section: props.section || 'XX',
        numero: props.numero || '0000',
        surface: props.contenance ? Math.round(props.contenance) : 0,
        contenance: props.contenance ? Math.round(props.contenance) : 0,
        nature: props.type_culture || 'Non renseigné',
        proprietaire: undefined // Les données de propriétaires ne sont pas publiques
      };

    } catch (error) {
      console.error('Erreur lors de la récupération des infos cadastrales:', error);
      return null;
    }
  }

  // Convertir les codes de culture en libellés lisibles
  private static getNatureCulture(code: string | undefined): string {
    if (!code) return 'Non renseigné';

    const natures: { [key: string]: string } = {
      'S': 'SOL',
      'T': 'TERRE',
      'P': 'PRÉS',
      'B': 'BOIS',
      'L': 'LANDE',
      'J': 'JARDIN',
      'V': 'VERGER',
      'VG': 'VIGNE',
      'AB': 'TERRAIN À BÂTIR',
      'BT': 'BÂTI',
      'CH': 'CHEMIN',
      'E': 'EAU'
    };

    return natures[code.toUpperCase()] || code;
  }
  
  // Export des données cadastrales en PDF officiel
  static async exportToPDF(data: any, cadastralInfo: CadastralInfo, coordinates: { lat: number; lng: number }) {
    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // En-tête officiel
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('EXTRAIT CADASTRAL', pageWidth / 2, 30, { align: 'center' });
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text('République Française', pageWidth / 2, 45, { align: 'center' });
      pdf.text('Direction Générale des Finances Publiques', pageWidth / 2, 55, { align: 'center' });
      
      // Ligne de séparation
      pdf.setLineWidth(0.5);
      pdf.line(20, 65, pageWidth - 20, 65);
      
      // Informations de la parcelle
      let yPos = 85;
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('IDENTIFICATION DE LA PARCELLE', 20, yPos);
      
      yPos += 20;
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      
      const parcellInfo = [
        ['Commune:', cadastralInfo.commune],
        ['Code commune:', '00000'],
        ['Section cadastrale:', cadastralInfo.section],
        ['Numéro de parcelle:', cadastralInfo.numero],
        ['Référence cadastrale:', `${cadastralInfo.section} ${cadastralInfo.numero}`],
        ['Surface cadastrale:', `${cadastralInfo.surface.toLocaleString()} m²`],
        ['Nature de culture:', cadastralInfo.nature],
        ['Contenance:', `${cadastralInfo.contenance.toLocaleString()} m²`]
      ];
      
      parcellInfo.forEach(([label, value]) => {
        pdf.setFont('helvetica', 'bold');
        pdf.text(label, 20, yPos);
        pdf.setFont('helvetica', 'normal');
        pdf.text(value, 80, yPos);
        yPos += 12;
      });
      
      // Coordonnées géographiques
      yPos += 10;
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('COORDONNÉES GÉOGRAPHIQUES', 20, yPos);
      
      yPos += 20;
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      
      const coordInfo = [
        ['Système de référence:', 'WGS84 (EPSG:4326)'],
        ['Latitude:', `${coordinates.lat.toFixed(6)}°`],
        ['Longitude:', `${coordinates.lng.toFixed(6)}°`],
        ['Précision:', '± 1 mètre']
      ];
      
      coordInfo.forEach(([label, value]) => {
        pdf.setFont('helvetica', 'bold');
        pdf.text(label, 20, yPos);
        pdf.setFont('helvetica', 'normal');
        pdf.text(value, 80, yPos);
        yPos += 12;
      });
      
      // Propriétaire (si disponible)
      if (cadastralInfo.proprietaire) {
        yPos += 10;
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('PROPRIÉTAIRE', 20, yPos);
        
        yPos += 20;
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        pdf.text(cadastralInfo.proprietaire, 20, yPos);
      }
      
      // Capture de la carte
      const mapElement = document.querySelector('.leaflet-container') as HTMLElement;
      if (mapElement) {
        try {
          const canvas = await html2canvas(mapElement, {
            useCORS: true,
            allowTaint: true,
            scale: 1,
            width: mapElement.offsetWidth,
            height: mapElement.offsetHeight
          });
          
          const imgData = canvas.toDataURL('image/jpeg', 0.8);
          const imgWidth = 170;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          
          // Nouvelle page pour la carte si nécessaire
          if (yPos + imgHeight > pageHeight - 40) {
            pdf.addPage();
            yPos = 30;
          } else {
            yPos += 20;
          }
          
          pdf.setFontSize(14);
          pdf.setFont('helvetica', 'bold');
          pdf.text('LOCALISATION CARTOGRAPHIQUE', 20, yPos);
          
          yPos += 15;
          pdf.addImage(imgData, 'JPEG', 20, yPos, imgWidth, imgHeight);
        } catch (error) {
          console.warn('Impossible de capturer la carte:', error);
        }
      }
      
      // Pied de page avec informations légales
      const footerY = pageHeight - 30;
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'italic');
      pdf.text('Document généré par Sunlib - Géoservices IGN', 20, footerY);
      pdf.text(`Date d'édition: ${new Date().toLocaleDateString('fr-FR')}`, 20, footerY + 8);
      pdf.text('Ce document n\'a pas de valeur juridique officielle', 20, footerY + 16);
      
      // Sauvegarde du PDF
      const filename = `extrait_cadastral_${cadastralInfo.section}_${cadastralInfo.numero}_${Date.now()}.pdf`;
      pdf.save(filename);
      
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      alert('Erreur lors de la génération du document PDF');
    }
  }
  
  // Capture d'écran de la carte améliorée
  static async captureMap() {
    try {
      const mapElement = document.querySelector('.leaflet-container') as HTMLElement;
      if (!mapElement) {
        alert('Impossible de capturer la carte');
        return;
      }
      
      // Masquer temporairement les contrôles de la carte
      const controls = mapElement.querySelectorAll('.leaflet-control-container');
      controls.forEach(control => {
        (control as HTMLElement).style.display = 'none';
      });
      
      const canvas = await html2canvas(mapElement, {
        useCORS: true,
        allowTaint: true,
        scale: 2, // Haute résolution
        width: mapElement.offsetWidth,
        height: mapElement.offsetHeight,
        backgroundColor: '#ffffff'
      });
      
      // Restaurer les contrôles
      controls.forEach(control => {
        (control as HTMLElement).style.display = '';
      });
      
      // Télécharger l'image
      const link = document.createElement('a');
      link.download = `carte_sunlib_${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Erreur lors de la capture:', error);
      alert('Erreur lors de la capture d\'écran. Veuillez réessayer.');
    }
  }
  
  // URLs des services WMTS IGN optimisées
  static getLayerUrls() {
    return {
      orthophoto: {
        url: `https://wxs.ign.fr/${IGN_API_KEY}/geoportail/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=ORTHOIMAGERY.ORTHOPHOTOS&STYLE=normal&TILEMATRIXSET=PM&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=image%2Fjpeg`,
        attribution: '© IGN - Orthophotos'
      },
      cadastre: {
        baseUrl: `https://wxs.ign.fr/${IGN_API_KEY}/geoportail/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=CADASTRALPARCELS.PARCELLAIRE_EXPRESS&STYLE=PCI%20vecteur&TILEMATRIXSET=PM&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=image%2Fpng`,
        attribution: '© IGN - Cadastre'
      },
      plan: {
        url: `https://wxs.ign.fr/${IGN_API_KEY}/geoportail/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2&STYLE=normal&TILEMATRIXSET=PM&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=image%2Fpng`,
        attribution: '© IGN - Plan IGN'
      }
    };
  }
}