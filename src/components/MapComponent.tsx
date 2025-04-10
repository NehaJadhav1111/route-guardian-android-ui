
import { useEffect, useRef, useState } from 'react';
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface MapComponentProps {
  className?: string;
  source?: { lat: number; lng: number };
  destination?: { lat: number; lng: number };
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
const MapComponent = ({ className, source, destination }: MapComponentProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [safetyScore, setSafetyScore] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Demo coordinates for testing when not provided
  const demoSource = { lat: 28.6129, lng: 77.2295 }; // Delhi
  const demoDestination = { lat: 28.6304, lng: 77.2177 }; // Different point in Delhi

  useEffect(() => {
    // Get the source and destination coordinates
    const src = source || demoSource;
    const dst = destination || demoDestination;

    const fetchSafeRoute = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Call the Supabase edge function with correct params format
        const { data, error } = await supabase.functions.invoke('get-safe-route', {
          params: {
            src: `${src.lat},${src.lng}`,
            dst: `${dst.lat},${dst.lng}`
          }
        });

        if (error) {
          throw new Error(error.message || 'Failed to fetch safe route');
        }

        const safeRouteData = data as SafeRouteResponse;
        setSafetyScore(safeRouteData.overallSafetyScore);
        
        // Render the route on the canvas
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

    const mapElement = mapRef.current;
    if (!mapElement) return;

    // Clear any previous content
    while (mapElement.firstChild) {
      mapElement.removeChild(mapElement.firstChild);
    }

    // Create a canvas element for drawing
    const canvas = document.createElement('canvas');
    canvas.width = mapElement.clientWidth;
    canvas.height = mapElement.clientHeight;
    mapElement.appendChild(canvas);

    // If we have source and destination, fetch the safe route
    if (src && dst) {
      fetchSafeRoute();
    } else {
      // Just show the map background
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Add a background image to simulate a map
        const img = new Image();
        img.src = '/lovable-uploads/bdee1e22-5c8a-4602-963f-c17aaa700fdc.png';
        img.onload = () => {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
      }
    }

    return () => {
      if (mapElement && canvas.parentNode === mapElement) {
        mapElement.removeChild(canvas);
      }
    };
  }, [source, destination]);

  // Render the route data on the map canvas
  const renderRouteOnMap = (routeData: SafeRouteResponse) => {
    const mapElement = mapRef.current;
    if (!mapElement) return;

    const canvas = mapElement.querySelector('canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw the base map
    const img = new Image();
    img.src = '/lovable-uploads/bdee1e22-5c8a-4602-963f-c17aaa700fdc.png';
    
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Convert geo coordinates to canvas coordinates
      const src = source || demoSource;
      const dst = destination || demoDestination;
      
      const bounds = {
        minLat: Math.min(src.lat, dst.lat) - 0.02,
        maxLat: Math.max(src.lat, dst.lat) + 0.02,
        minLng: Math.min(src.lng, dst.lng) - 0.02,
        maxLng: Math.max(src.lng, dst.lng) + 0.02
      };
      
      const mapWidth = canvas.width;
      const mapHeight = canvas.height;
      
      const geoToCanvas = (lat: number, lng: number) => {
        const x = ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * mapWidth;
        const y = mapHeight - ((lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * mapHeight;
        return { x, y };
      };
      
      // Draw hotspots as circles with varying opacity based on crime count
      routeData.hotspots.forEach(hotspot => {
        const { x, y } = geoToCanvas(hotspot.center[0], hotspot.center[1]);
        const radius = Math.max(
          10, 
          (hotspot.radius / 0.01) * 50 // Scale radius for visibility
        );
        
        let color;
        let alpha;
        
        if (hotspot.riskLevel === 'high') {
          color = 'rgba(255, 0, 0,';
          alpha = 0.4;
        } else if (hotspot.riskLevel === 'medium') {
          color = 'rgba(255, 165, 0,';
          alpha = 0.3;
        } else {
          color = 'rgba(255, 255, 0,';
          alpha = 0.2;
        }
        
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fillStyle = `${color}${alpha})`;
        ctx.fill();
        ctx.strokeStyle = `${color}1)`;
        ctx.stroke();
      });
      
      // Draw the route segments with colors based on risk level
      routeData.segments.forEach(segment => {
        const start = geoToCanvas(segment.start.lat, segment.start.lng);
        const end = geoToCanvas(segment.end.lat, segment.end.lng);
        
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        
        // Set line color based on risk level
        if (segment.risk === 'high') {
          ctx.strokeStyle = '#FF0000'; // Red for high risk
        } else if (segment.risk === 'medium') {
          ctx.strokeStyle = '#0000FF'; // Blue for medium risk
        } else {
          ctx.strokeStyle = '#00FF00'; // Green for low risk
        }
        
        ctx.lineWidth = 4;
        ctx.stroke();
      });
      
      // Draw start and end markers
      const startPoint = geoToCanvas(src.lat, src.lng);
      const endPoint = geoToCanvas(dst.lat, dst.lng);
      
      // Start marker (green)
      ctx.beginPath();
      ctx.arc(startPoint.x, startPoint.y, 8, 0, 2 * Math.PI);
      ctx.fillStyle = '#00FF00';
      ctx.fill();
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // End marker (red)
      ctx.beginPath();
      ctx.arc(endPoint.x, endPoint.y, 8, 0, 2 * Math.PI);
      ctx.fillStyle = '#FF0000';
      ctx.fill();
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.stroke();
    };
  };

  return (
    <div className={`relative w-full h-full bg-gray-100 ${className}`}>
      <div ref={mapRef} className="relative w-full h-full">
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
            <h3 className="text-lg font-semibold">Map Safety Score</h3>
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
