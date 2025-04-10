
import Header from "@/components/Header";
import MapComponent from "@/components/MapComponent";
import RouteLegend from "@/components/RouteLegend";

const MapPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white animate-fade-in">
      <Header />
      <div className="flex-1 relative">
        <div className="absolute inset-0">
          <MapComponent />
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/80 px-4 py-2 rounded-md backdrop-blur-sm shadow-md">
            <h3 className="text-lg font-semibold">Map Safety Score</h3>
          </div>
          <RouteLegend />
        </div>
      </div>
    </div>
  );
};

export default MapPage;
