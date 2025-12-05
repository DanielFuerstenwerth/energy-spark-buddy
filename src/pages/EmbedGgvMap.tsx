import { useRef } from 'react';
import MapGgv, { MapGgvHandle } from '@/components/MapGgv';
import { useMapData } from '@/hooks/useMapData';
import 'leaflet/dist/leaflet.css';

/**
 * Embed-only page for the GGV map.
 * Use via iframe: <iframe src="https://vnb-transparenz.de/embed/ggv" width="100%" height="600"></iframe>
 */
const EmbedGgvMap = () => {
  const mapRef = useRef<MapGgvHandle>(null);
  const { scoreData, loading } = useMapData('TaE/GGV');

  const handleRegionClick = (vnbId: string, vnbName: string) => {
    // Post message to parent window for external integration
    window.parent.postMessage({
      type: 'vnb-click',
      vnbId,
      vnbName
    }, '*');
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden">
      <MapGgv
        ref={mapRef}
        onRegionClick={handleRegionClick}
        scoreData={scoreData}
      />
    </div>
  );
};

export default EmbedGgvMap;
