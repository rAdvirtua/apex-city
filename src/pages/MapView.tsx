import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import BottomNav from '@/components/BottomNav';
import { createRoot } from 'react-dom/client';
import { useNavigate } from 'react-router-dom';
import { IssueCard, IssueCategory, IssueStatus } from '@/components/IssueCard';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { getDistanceFromLatLonInKm } from '@/lib/geo';
import { getAddressComponents } from '@/lib/geocoding';
// Marker clustering plugin (adds L.markerClusterGroup)
// Requires installation: npm install leaflet.markercluster
// CSS is imported below so clusters render correctly
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import '@/styles/leaflet-react-popup.css';

delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

type IssueFromRPC = Database['public']['Functions']['get_issues_with_reporters']['Returns'][0];

interface Issue extends IssueFromRPC {
  latitude: number;
  longitude: number;
}

// We'll render clustered markers via the plugin (ClusterLayer below).
// Keep MarkerWithPopup removed because clustering uses raw L.Markers.

// Helper to safely escape HTML for popup content
const escapeHtml = (unsafe: string | null | undefined) => {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

const createCustomDivIcon = (issue: Issue) =>
  L.divIcon({
    html: `<div class="custom-marker-icon"><span class="dot"></span><span class="label">${escapeHtml(
      issue.title?.slice(0, 12) || ''
    )}</span></div>`,
    className: '',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
  });

const ClusterLayer = ({ issues }: { issues: Issue[] }) => {
  const map = useMap();
  const navigate = useNavigate();

  useEffect(() => {
    if (!map) return;
    // @ts-ignore - markerClusterGroup comes from the plugin
    const clusterGroup = (L as any).markerClusterGroup({
      // smaller clustering radius so markers separate earlier
      maxClusterRadius: 40,
      // spiderfy when clicking clusters at the same location / when zoomed in
      spiderfyOnMaxZoom: true,
      spiderfyDistanceMultiplier: 1.5,
      showCoverageOnHover: false,
      // zoom bounds on click keeps UX consistent
      zoomToBoundsOnClick: true,
      // chunkedLoading helps with many markers
      chunkedLoading: true,
    });

  const markers: L.Marker[] = [];
  console.debug('ClusterLayer: rendering', issues.length, 'issues');

    // Group issues by exact lat/lng (rounded) so we can spread overlapping markers
    const groups = new Map<string, Issue[]>();
    const round = (v: number) => v.toFixed(6); // ~0.11m precision
    issues.forEach((issue) => {
      if (!issue.latitude || !issue.longitude) return;
      const key = `${round(issue.latitude)},${round(issue.longitude)}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(issue);
    });

    // helper: convert meters offset to degrees approx
    const metersToLat = (meters: number) => meters / 111320;
    const metersToLng = (meters: number, lat: number) => meters / (111320 * Math.cos((lat * Math.PI) / 180));

    // For each group, if multiple issues share the same coords, spread them around a small circle
    groups.forEach((group, key) => {
      console.debug('ClusterLayer: group', key, 'count', group.length);
      const [latStr, lngStr] = key.split(',');
      const baseLat = Number(latStr);
      const baseLng = Number(lngStr);

      const n = group.length;
      // Determine radius (meters) depending on count
      const baseRadius = 8; // meters
      const radiusStep = 6; // increase per ring

      group.forEach((issue, idx) => {
        let latPos = issue.latitude;
        let lngPos = issue.longitude;

        if (n > 1) {
          // place points evenly on circle; if many, create multiple rings
          const ring = Math.floor(Math.sqrt(idx));
          const posInRing = idx - ring * ring; // simple distribution
          const itemsInRing = ring === 0 ? 1 : ring * 6; // approximate
          const angle = (2 * Math.PI * posInRing) / Math.max(itemsInRing, 1);
          const radiusMeters = baseRadius + ring * radiusStep;
          const dLat = Math.cos(angle) * radiusMeters;
          const dLng = Math.sin(angle) * radiusMeters;
          latPos = baseLat + metersToLat(dLat);
          lngPos = baseLng + metersToLng(dLng, baseLat);
        }

        const marker = L.marker([latPos, lngPos], {
          icon: createCustomDivIcon(issue),
        });

  // Create an empty container element for the React popup
  const container = document.createElement('div');
  container.className = 'leaflet-popup-react-container';
  container.style.width = '340px';
  container.style.padding = '0';
  container.style.boxSizing = 'border-box';

  // Bind the (empty) container as popup content and remove leaflet chrome via className
  marker.bindPopup(container, { maxWidth: 340, className: 'react-popup-wrapper' });

      // When popup opens, render the IssueCard React component into the container
      marker.on('popupopen', () => {
        try {
          const root = createRoot(container);
          // store root reference to unmount later
          (marker as any)._reactRoot = root;
          root.render(
            <IssueCard
              id={issue.id}
              title={issue.title}
              description={issue.description}
              category={issue.category as IssueCategory}
              status={(issue.status as IssueStatus) || 'pending'}
              location={issue.location_address || ''}
              date={new Date(issue.created_at || '').toLocaleDateString()}
              image={issue.image_url || undefined}
              reporter={issue.reporter_name || undefined}
              onUpdate={() => navigate(`/edit-report/${issue.id}`)}
            />
          );
        } catch (err) {
          // If rendering fails, fallback to simple HTML
          container.innerHTML = ` <div>${escapeHtml(issue.title)}</div>`;
        }
      });

        // Unmount React root when popup closes
        marker.on('popupclose', () => {
          const root = (marker as any)._reactRoot;
          if (root) {
            try {
              root.unmount();
            } catch (e) {
              // ignore
            }
            delete (marker as any)._reactRoot;
          }
        });

        clusterGroup.addLayer(marker);
        // small trace so we can see markers added
        console.debug('ClusterLayer: added marker for issue', issue.id, 'pos', latPos, lngPos);
        markers.push(marker);
      });
    });

    map.addLayer(clusterGroup);

    return () => {
      // cleanup
      markers.forEach(m => {
        const root = (m as any)._reactRoot;
        if (root) {
          try { root.unmount(); } catch {};
        }
      });
      map.removeLayer(clusterGroup);
    };
  }, [map, issues, navigate]);

  return null;
};

const ChangeView = ({ center, zoom }: { center: [number, number], zoom: number }) => {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}


export default function MapView() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
  

  useEffect(() => {
    // Initialize: get user location, user's administrative area, then fetch & filter issues
    const init = async () => {
      setLoading(true);

      let userLat: number | null = null;
      let userLng: number | null = null;
      let userAreaKey: string | null = null; // e.g., city/town/village/county

      // Helper to get geolocation as Promise
      const getPosition = () => new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { maximumAge: 60_000 });
      });

      try {
        if (navigator.geolocation) {
          try {
            const pos = await getPosition();
            userLat = pos.coords.latitude;
            userLng = pos.coords.longitude;
            setMapCenter([userLat, userLng]);

            // reverse geocode to get user's city/district
            const addr = await getAddressComponents(userLat, userLng);
            if (addr) {
              // choose preferred keys
              userAreaKey = (addr.city || addr.town || addr.village || addr.county || addr.state || '').toString().toLowerCase();
            }
          } catch (err) {
            // user denied or error - continue without user area
            console.warn('Geolocation unavailable or denied:', err);
          }
        }

  // Fetch issues from RPC. Always pass the named parameter `p_admin_area` (explicit null when unknown)
  // This avoids PostgREST / schema-cache ambiguity with no-arg overloads.
  const rpcArgs = { p_admin_area: userAreaKey ?? null };
  console.debug('MapView: calling get_issues_with_reporters RPC with args', rpcArgs);
  console.debug(`RPC -> ${JSON.stringify(rpcArgs)}`);
  const { data, error } = await supabase.rpc('get_issues_with_reporters', rpcArgs as any);
  console.debug('MapView: get_issues_with_reporters response', { data, error });
  console.debug(`RPC resp -> error:${!!error} rows:${(data || []).length}`);
    if (error) throw error;

        const raw = (data as unknown as IssueFromRPC[]) || [];
        // Defensively coalesce different coordinate key names that may exist in the DB / RPC.
        const processed: Issue[] = raw.map(r => {
          const anyR = r as any;
          const latVal = anyR.latitude ?? anyR.location_lat ?? anyR.lat ?? anyR.location?.lat;
          const lngVal = anyR.longitude ?? anyR.location_lng ?? anyR.lng ?? anyR.location?.lng;
          return {
            ...r,
            latitude: Number(latVal) || 0,
            longitude: Number(lngVal) || 0,
          } as Issue;
        });

        // Debugging: log processed issues so we can see if coordinates exist
  console.debug('MapView: processed issues count', processed.length);
  console.debug(`Processed issues: ${processed.length}`);
        if (processed.length > 0) {
          console.debug('MapView: sample processed issues', processed.slice(0, 5).map(p => ({ id: p.id, lat: p.latitude, lng: p.longitude })));
          console.debug(`Sample coords: ${processed.slice(0, 3).map(p => `${p.id}@${p.latitude},${p.longitude}`).join('; ')}`);
        }

        // If server-side filtering was applied (userAreaKey), the returned results are already scoped.
        if (userAreaKey) {
          // If the server returned zero rows for the detected admin area, fall back to requesting all issues
          // so the map doesn't appear empty when admin_area values are not populated/matching.
          if (processed.length === 0) {
            console.debug('MapView: server returned 0 rows for admin_area, falling back to request all issues');
            console.debug('Server returned 0 rows for your area; falling back to all issues');
            const { data: allData, error: allError } = await supabase.rpc('get_issues_with_reporters', { p_admin_area: null } as any);
            if (!allError) {
              const rawAll = (allData as unknown as IssueFromRPC[]) || [];
              const processedAll: Issue[] = rawAll.map(r => {
                const anyR = r as any;
                const latVal = anyR.latitude ?? anyR.location_lat ?? anyR.lat ?? anyR.location?.lat;
                const lngVal = anyR.longitude ?? anyR.location_lng ?? anyR.lng ?? anyR.location?.lng;
                return {
                  ...r,
                  latitude: Number(latVal) || 0,
                  longitude: Number(lngVal) || 0,
                } as Issue;
              });
              setIssues(processedAll);
              if (!mapCenter && processedAll.length > 0) {
                const first = processedAll.find(i => i.latitude && i.longitude);
                if (first) setMapCenter([first.latitude, first.longitude]);
              }
              } else {
              console.error('MapView fallback RPC error:', allError);
              console.debug(`Fallback RPC error: ${String(allError.message || allError)}`);
            }
            setLoading(false);
            return;
          }

          setIssues(processed);
          // If user didn't grant geolocation, but RPC returned issues, set map center to the first issue
          if (!mapCenter && processed.length > 0) {
            const first = processed.find(i => i.latitude && i.longitude);
            if (first) setMapCenter([first.latitude, first.longitude]);
          }
          setLoading(false);
          return;
        }

        // No user area provided: fall back to client-side radius (if user coords available) otherwise show all
        if (!userAreaKey) {
          if (userLat && userLng) {
            const nearby = processed.filter(issue => {
              const dist = getDistanceFromLatLonInKm(userLat as number, userLng as number, issue.latitude, issue.longitude);
              return dist <= 50; // 50km
            });
            console.debug('MapView: nearby issues by radius', nearby.length);
            console.debug(`Nearby issues: ${nearby.length}`);
            setIssues(nearby);
            // ensure map has a center even if geolocation returned coords but mapCenter wasn't set
            if (!mapCenter && nearby.length > 0) {
              const first = nearby.find(i => i.latitude && i.longitude);
              if (first) setMapCenter([first.latitude, first.longitude]);
            }
          } else {
            console.debug('MapView: no geolocation — using all processed issues', processed.length);
            console.debug(`Using all issues: ${processed.length}`);
            setIssues(processed);
            // If geolocation unavailable, center on the first available issue
            if (!mapCenter && processed.length > 0) {
              const first = processed.find(i => i.latitude && i.longitude);
              if (first) setMapCenter([first.latitude, first.longitude]);
            }
          }
          setLoading(false);
          return;
        }

      } catch (err) {
        console.error('Error initializing map issues:', err);
        setLoading(false);
      }
    };

    init();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">Map View</h1>
          <p className="text-primary-foreground/90 mt-2">
            View issues on the map and report from location
          </p>
        </div>
      </div>

          <div className="container mx-auto px-4 py-8">
            <Card style={{ height: '600px', position: 'relative' }}>
              <MapContainer center={mapCenter ?? [0, 0]} zoom={mapCenter ? 13 : 2} scrollWheelZoom={true} style={{ height: "100%", width: "100%" }}>
                <ChangeView center={mapCenter ?? [0, 0]} zoom={mapCenter ? 13 : 2} />
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <ClusterLayer issues={issues} />
              </MapContainer>

             
            </Card>
          </div>

      <BottomNav />
    </div>
  );
}