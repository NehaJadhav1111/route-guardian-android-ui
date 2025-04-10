
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import MapComponent from "@/components/MapComponent";
import RouteLegend from "@/components/RouteLegend";
import AuthGuard from "@/components/AuthGuard";

const MapPage = () => {
  const [searchParams] = useSearchParams();
  
  const source = searchParams.get("source") || "";
  const destination = searchParams.get("destination") || "";

  return (
    <AuthGuard>
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <div className="flex-1 flex flex-col relative">
          <MapComponent 
            sourceAddress={source} 
            destinationAddress={destination} 
          />
          <RouteLegend className="absolute bottom-4 right-4 z-10" />
        </div>
      </div>
    </AuthGuard>
  );
};

export default MapPage;
