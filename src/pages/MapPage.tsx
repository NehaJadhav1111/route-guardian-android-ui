
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import MapComponent from "@/components/MapComponent";
import RouteLegend from "@/components/RouteLegend";
import AuthGuard from "@/components/AuthGuard";
import { ArrowLeft, ArrowRight } from "lucide-react";

const MapPage = () => {
  const [searchParams] = useSearchParams();
  
  const source = searchParams.get("source") || "";
  const destination = searchParams.get("destination") || "";
  const sourceAddress = searchParams.get("sourceAddress") || "Starting Point";
  const destinationAddress = searchParams.get("destinationAddress") || "Destination";

  // Parse source and destination coordinates
  const parseCoordinates = (coordinateString: string) => {
    if (!coordinateString) return undefined;
    
    try {
      const [lat, lng] = coordinateString.split(',').map(Number);
      if (isNaN(lat) || isNaN(lng)) return undefined;
      return { lat, lng };
    } catch (e) {
      console.error("Error parsing coordinates:", e);
      return undefined;
    }
  };

  const sourceCoords = parseCoordinates(source);
  const destinationCoords = parseCoordinates(destination);

  return (
    <AuthGuard>
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <div className="bg-gray-100 p-4">
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 text-center">
            <span className="font-medium truncate max-w-[200px]">{sourceAddress}</span>
            <div className="flex items-center mx-2">
              <ArrowLeft className="hidden sm:block h-4 w-4 text-gray-400" />
              <div className="w-16 h-0.5 bg-gray-300 mx-2"></div>
              <ArrowRight className="h-4 w-4 text-gray-400" />
            </div>
            <span className="font-medium truncate max-w-[200px]">{destinationAddress}</span>
          </div>
        </div>
        <div className="flex-1 flex flex-col relative">
          <MapComponent 
            source={sourceCoords}
            destination={destinationCoords}
            sourceAddress={sourceAddress}
            destinationAddress={destinationAddress}
          />
          <RouteLegend className="absolute bottom-4 right-4 z-10" />
        </div>
      </div>
    </AuthGuard>
  );
};

export default MapPage;
