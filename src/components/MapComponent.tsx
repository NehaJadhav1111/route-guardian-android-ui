
import { useEffect, useRef, useState } from 'react';
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import "leaflet/dist/leaflet.css";

interface MapComponentProps {
  className?: string;
  source?: { lat: number; lng: number };
  destination?: { lat: number; lng: number };
  sourceAddress?: string;
  destinationAddress?: string;
}

type RouteSegment = {
  start: { lat: number; lng: number };
  end: { lat: number; lng: number };
  risk: 'low' | 'medium' | 'high';
};

type SafeRouteResponse = {
  route: Array<{ lat: number; lng: number }>;
  segments: RouteSegment[];
  overallSafetyScore: number;
  hotspots: Array<{
    center: [number, number];
    radius: number;
    crimeCount: number;
    riskLevel: string;
  }>;
};

// This component renders a map with safe route information
const MapComponent = ({ className, source, destination, sourceAddress, destinationAddress }: MapComponentProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [safetyScore, setSafetyScore] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const leafletMapRef = useRef<any>(null);
  
  // Demo coordinates for testing when not provided
  const demoSource = { lat: 28.6129, lng: 77.2295 }; // Delhi
  const demoDestination = { lat: 28.6304, lng: 77.2177 }; // Different point in Delhi

  useEffect(() => {
    console.log("MapComponent mounted with source:", source, "destination:", destination);
    
    // Dynamic import of leaflet to avoid SSR issues
    const loadMap = async () => {
      if (!mapContainer.current) return;
      
      try {
        const L = await import('leaflet');
        
        // Get the source and destination coordinates
        const src = source || demoSource;
        const dst = destination || demoDestination;
        
        console.log("Using coordinates - source:", src, "destination:", dst);
        
        // Create map if it doesn't exist
        if (!leafletMapRef.current) {
          console.log("Creating new Leaflet map");
          // Clear any existing content
          while (mapContainer.current.firstChild) {
            mapContainer.current.removeChild(mapContainer.current.firstChild);
          }
          
          // Create the map centered between source and destination
          const centerLat = (src.lat + dst.lat) / 2;
          const centerLng = (src.lng + dst.lng) / 2;
          
          leafletMapRef.current = L.map(mapContainer.current).setView([centerLat, centerLng], 13);
          
          // Add OpenStreetMap tile layer
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }).addTo(leafletMapRef.current);
        } else {
          console.log("Reusing existing Leaflet map");
        }
        
        // Fetch and display the safe route
        await fetchSafeRoute(src, dst);
      } catch (err) {
        console.error("Error initializing map:", err);
        setError("Failed to load map. Please try refreshing the page.");
      }
    };
    
    loadMap();
    
    return () => {
      // Clean up map on unmount
      if (leafletMapRef.current) {
        console.log("Cleaning up Leaflet map");
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [source, destination]);

  const fetchSafeRoute = async (src: {lat: number, lng: number}, dst: {lat: number, lng: number}) => {
    if (!src || !dst) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Fetching safe route for:", src, dst);
      
      // Use 'body' to pass parameters to the edge function
      const { data, error } = await supabase.functions.invoke('get-safe-route', {
        body: {
          src: `${src.lat},${src.lng}`,
          dst: `${dst.lat},${dst.lng}`
        }
      });

      if (error) {
        console.error("Edge function error:", error);
        throw new Error(error.message || 'Failed to fetch safe route');
      }

      console.log("Safe route data received:", data);
      const safeRouteData = data as SafeRouteResponse;
      setSafetyScore(safeRouteData.overallSafetyScore);
      
      // Render the route on the map
      renderRouteOnMap(safeRouteData);
    } catch (err: any) {
      console.error('Error fetching safe route:', err);
      setError(err.message || 'Failed to calculate safe route');
      toast({
        title: "Error",
        description: "Failed to calculate route. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Render the route data on the Leaflet map
  const renderRouteOnMap = async (routeData: SafeRouteResponse) => {
    if (!leafletMapRef.current) return;
    
    const L = await import('leaflet');
    
    // Clear existing route layers
    leafletMapRef.current.eachLayer((layer: any) => {
      if (layer instanceof L.Polyline || layer instanceof L.Marker || layer instanceof L.Circle) {
        leafletMapRef.current.removeLayer(layer);
      }
    });
    
    // Add basemap if it was removed
    if (!leafletMapRef.current.hasLayer(L.tileLayer)) {
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(leafletMapRef.current);
    }
    
    // Draw hotspots as circles
    routeData.hotspots.forEach(hotspot => {
      const radius = hotspot.radius * 1000; // Convert km to meters for Leaflet
      let color;
      let fillOpacity;
      
      if (hotspot.riskLevel === 'high') {
        color = '#FF0000'; // Red
        fillOpacity = 0.4;
      } else if (hotspot.riskLevel === 'medium') {
        color = '#FFA500'; // Orange
        fillOpacity = 0.3;
      } else {
        color = '#FFFF00'; // Yellow
        fillOpacity = 0.2;
      }
      
      L.circle([hotspot.center[0], hotspot.center[1]], {
        radius: radius,
        color: color,
        fillColor: color,
        fillOpacity: fillOpacity,
        weight: 1
      }).addTo(leafletMapRef.current);
    });
    
    // Draw route segments
    routeData.segments.forEach(segment => {
      const start = [segment.start.lat, segment.start.lng];
      const end = [segment.end.lat, segment.end.lng];
      
      let color;
      let weight = 5;
      
      switch (segment.risk) {
        case 'high':
          color = '#FF0000'; // Red
          break;
        case 'medium':
          color = '#0000FF'; // Blue
          break;
        case 'low':
          color = '#00FF00'; // Green
          break;
        default:
          color = '#000000'; // Black
      }
      
      L.polyline([start, end], {
        color: color,
        weight: weight,
        opacity: 0.8
      }).addTo(leafletMapRef.current);
    });
    
    // Add start and end markers
    const src = source || demoSource;
    const dst = destination || demoDestination;
    
    // Start marker (green)
    const startIcon = L.divIcon({
      html: '<div class="w-4 h-4 rounded-full bg-green-500 border-2 border-white shadow-lg"></div>',
      className: 'custom-div-icon',
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });
    
    // End marker (red)
    const endIcon = L.divIcon({
      html: '<div class="w-4 h-4 rounded-full bg-red-500 border-2 border-white shadow-lg"></div>',
      className: 'custom-div-icon',
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });
    
    L.marker([src.lat, src.lng], { icon: startIcon })
      .bindPopup(sourceAddress || 'Start')
      .addTo(leafletMapRef.current);
    
    L.marker([dst.lat, dst.lng], { icon: endIcon })
      .bindPopup(destinationAddress || 'Destination')
      .addTo(leafletMapRef.current);
    
    // Fit map bounds to show the entire route
    const bounds = L.latLngBounds([src.lat, src.lng], [dst.lat, dst.lng]);
    leafletMapRef.current.fitBounds(bounds, { padding: [50, 50] });
  };

  return (
    <div className={`relative w-full h-full bg-gray-100 ${className}`}>
      <div ref={mapContainer} className="relative w-full h-full min-h-[500px]">
        {/* The map will be rendered here */}
      </div>
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white p-4 rounded-md shadow-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent mx-auto"></div>
            <p className="mt-2">Calculating safest route...</p>
          </div>
        </div>
      )}
      
      {safetyScore !== null && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/80 px-4 py-2 rounded-md backdrop-blur-sm shadow-md flex items-center">
          <div className="mr-2">
            <div className={`w-4 h-4 rounded-full ${
              safetyScore >= 80 ? 'bg-green-500' : 
              safetyScore >= 50 ? 'bg-blue-500' : 'bg-red-500'
            }`}></div>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Route Safety Score</h3>
            <p className="text-sm">{safetyScore}/100 - {
              safetyScore >= 80 ? 'Safe Route' : 
              safetyScore >= 50 ? 'Moderate Risk' : 'High Risk Route'
            }</p>
          </div>
        </div>
      )}
      
      {error && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-red-100 text-red-800 px-4 py-2 rounded-md shadow-md">
          {error}
        </div>
      )}
    </div>
  );
};

export default MapComponent;
