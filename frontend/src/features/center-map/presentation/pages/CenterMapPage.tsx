import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import { motion } from 'motion/react';
import { AlertCircle, Map } from 'lucide-react';
import { Button } from '@/core/components/ui/button';
import { useCenterMap } from '../../domain/hooks/center-map.hook';
import CenterMapPopup from '../components/CenterMapPopup';
import GeolocationButton from '../components/GeolocationButton';
import CenterSidePanel from '../components/CenterSidePanel';
import ActivityTypeFilter from '../components/ActivityTypeFilter';
import type { CenterMapItemEntity } from '../../domain/entities/center-map.entity';
import type { CentersMapQueryDto } from '../../data/dtos/center-map.dto';

// Fix default Leaflet icon missing in Vite builds
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)
  ._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom orange marker for centers
const orangeIcon = new L.Icon({
  iconUrl:
    'data:image/svg+xml;base64,' +
    btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="28" height="40" viewBox="0 0 28 40">
  <path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 26 14 26S28 24.5 28 14C28 6.268 21.732 0 14 0z" fill="#f97316"/>
  <circle cx="14" cy="14" r="6" fill="white"/>
</svg>`),
  iconSize: [28, 40],
  iconAnchor: [14, 40],
  popupAnchor: [0, -42],
});

// Default center: France
const FRANCE_CENTER: [number, number] = [46.603354, 1.888334];
const DEFAULT_ZOOM = 6;

// Component to fly the map to a position imperatively
function MapController({
  target,
}: {
  target: { lat: number; lng: number; zoom: number } | null;
}) {
  const map = useMap();
  useEffect(() => {
    if (target) {
      map.flyTo([target.lat, target.lng], target.zoom, { duration: 1.2 });
    }
  }, [map, target]);
  return null;
}

// Component to listen to map move/zoom events and trigger data refresh
function MapEventListener({
  onBoundsChange,
}: {
  onBoundsChange: (query: CentersMapQueryDto) => void;
}) {
  const map = useMapEvents({
    moveend: () => {
      const center = map.getCenter();
      const zoom = map.getZoom();
      const radius = Math.round(zoomToRadius(zoom));
      onBoundsChange({ lat: center.lat, lng: center.lng, radius });
    },
    zoomend: () => {
      const center = map.getCenter();
      const zoom = map.getZoom();
      const radius = Math.round(zoomToRadius(zoom));
      onBoundsChange({ lat: center.lat, lng: center.lng, radius });
    },
  });

  // Trigger initial load
  useEffect(() => {
    const center = map.getCenter();
    const zoom = map.getZoom();
    onBoundsChange({
      lat: center.lat,
      lng: center.lng,
      radius: Math.round(zoomToRadius(zoom)),
    });
  }, [map, onBoundsChange]);

  return null;
}

function zoomToRadius(zoom: number): number {
  // Approximate radius in km based on zoom level for a standard viewport
  const radii: Record<number, number> = {
    4: 2000,
    5: 1000,
    6: 500,
    7: 250,
    8: 120,
    9: 60,
    10: 30,
    11: 15,
    12: 8,
    13: 4,
    14: 2,
    15: 1,
  };
  return radii[zoom] ?? (zoom < 4 ? 2000 : 1);
}

export default function CenterMapPage() {
  const [query, setQuery] = useState<CentersMapQueryDto | null>(null);
  const [activeType, setActiveType] = useState<string>('');
  const [flyTarget, setFlyTarget] = useState<{
    lat: number;
    lng: number;
    zoom: number;
  } | null>(null);
  const popupRefs = useRef<Record<string, L.Popup>>({});

  const effectiveQuery = query
    ? { ...query, ...(activeType ? { type: activeType } : {}) }
    : null;

  const { centersMap, centersMapIsLoading, centersMapError } =
    useCenterMap(effectiveQuery);

  const centers: CenterMapItemEntity[] = centersMap?.centers ?? [];

  const handleLocate = useCallback((lat: number, lng: number) => {
    setFlyTarget({ lat, lng, zoom: 11 });
    setQuery({ lat, lng, radius: 30 });
  }, []);

  const handleBoundsChange = useCallback((newQuery: CentersMapQueryDto) => {
    setQuery({ ...newQuery });
  }, []);

  const handleTypeChange = useCallback((type: string) => {
    setActiveType(type);
  }, []);

  const handleCenterClick = useCallback((center: CenterMapItemEntity) => {
    setFlyTarget({ lat: center.lat, lng: center.lng, zoom: 13 });
  }, []);

  return (
    <motion.div
      className="flex flex-col h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 bg-card border-b border-border shadow-sm shrink-0 z-10">
        <div className="flex items-center gap-2">
          <Map className="h-5 w-5 text-primary" />
          <h1 className="font-display font-semibold text-base text-foreground">
            Carte des centres
          </h1>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <ActivityTypeFilter value={activeType} onChange={handleTypeChange} />
          <GeolocationButton onLocate={handleLocate} />
        </div>
      </div>

      {/* Error banner */}
      {centersMapError && (
        <div className="flex items-center gap-2 px-4 py-2 bg-destructive/10 text-destructive text-sm shrink-0">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>Impossible de charger les centres.</span>
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto text-destructive"
            onClick={() => window.location.reload()}
          >
            Réessayer
          </Button>
        </div>
      )}

      {/* Map + Side panel */}
      <div className="flex flex-1 overflow-hidden">
        {/* Map */}
        <div className="flex-1 relative z-0">
          <MapContainer
            center={FRANCE_CENTER}
            zoom={DEFAULT_ZOOM}
            className="h-full w-full"
            zoomControl={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapController target={flyTarget} />
            <MapEventListener onBoundsChange={handleBoundsChange} />

            {centers.map((center) => (
              <Marker
                key={center.id}
                position={[center.lat, center.lng]}
                icon={orangeIcon}
                ref={(marker) => {
                  if (marker) {
                    popupRefs.current[center.id] = marker.getPopup() as L.Popup;
                  }
                }}
              >
                <Popup>
                  <CenterMapPopup center={center} />
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {/* Loading overlay on map */}
          {centersMapIsLoading && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] bg-card/90 backdrop-blur-sm border border-border rounded-full px-4 py-1.5 text-sm text-muted-foreground shadow-md">
              Chargement des centres…
            </div>
          )}
        </div>

        {/* Side panel — hidden on mobile, visible on md+ */}
        <div className="hidden md:flex w-72 lg:w-80 shrink-0 overflow-hidden">
          <CenterSidePanel
            centers={centers}
            isLoading={centersMapIsLoading}
            onCenterClick={handleCenterClick}
          />
        </div>
      </div>
    </motion.div>
  );
}
