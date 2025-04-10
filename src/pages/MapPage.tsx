
import { useLocation } from "react-router-dom";
import Header from "@/components/Header";
import MapComponent from "@/components/MapComponent";
import RouteLegend from "@/components/RouteLegend";

const MapPage = () => {
  const location = useLocation();
  const { source, destination } = location.state || {};
  
  return (
    <div className="min-h-screen flex flex-col bg-white animate-fade-in">
      <Header />
      <div className="flex-1 relative">
        <div className="absolute inset-0">
          <MapComponent source={source} destination={destination} />
          <RouteLegend />
        </div>
      </div>
    </div>
  );
};

export default MapPage;
