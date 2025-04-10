
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import InputField from "@/components/InputField";
import PrimaryButton from "@/components/PrimaryButton";
import SecondaryButton from "@/components/SecondaryButton";

const LocationPage = () => {
  const navigate = useNavigate();
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  
  // Demo coordinates for quick testing
  const demoLocations = [
    { name: "Central Park", lat: 28.6129, lng: 77.2295 },
    { name: "Connaught Place", lat: 28.6304, lng: 77.2177 },
    { name: "India Gate", lat: 28.6129, lng: 77.2295 },
    { name: "Qutub Minar", lat: 28.5244, lng: 77.1855 },
  ];

  // Get user's current location
  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setSource(`Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
          setIsGettingLocation(false);
          
          toast({
            title: "Location Found",
            description: "Your current location has been set as the source.",
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          setIsGettingLocation(false);
          
          toast({
            title: "Location Error",
            description: "Could not get your current location. Please enter manually.",
            variant: "destructive",
          });
        }
      );
    } else {
      setIsGettingLocation(false);
      toast({
        title: "Not Supported",
        description: "Geolocation is not supported by your browser.",
        variant: "destructive",
      });
    }
  };

  // Parse locations and navigate to map
  const handleFindRoute = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (!source || !destination) {
      toast({
        title: "Missing Information",
        description: "Please provide both source and destination locations.",
        variant: "destructive",
      });
      return;
    }
    
    // For a real implementation, you would geocode the addresses to get coordinates
    // For now, let's use demo coordinates if the input matches any demo location
    let sourceLat = 28.6129;
    let sourceLng = 77.2295;
    let destLat = 28.6304;
    let destLng = 77.2177;
    
    // Check if source matches any demo location
    const sourceLocation = demoLocations.find(
      loc => source.toLowerCase().includes(loc.name.toLowerCase())
    );
    if (sourceLocation) {
      sourceLat = sourceLocation.lat;
      sourceLng = sourceLocation.lng;
    }
    
    // Check if destination matches any demo location
    const destLocation = demoLocations.find(
      loc => destination.toLowerCase().includes(loc.name.toLowerCase())
    );
    if (destLocation) {
      destLat = destLocation.lat;
      destLng = destLocation.lng;
    }
    
    // Check for current location format
    if (source.startsWith("Current Location")) {
      const coordMatch = source.match(/\(([-\d.]+), ([-\d.]+)\)/);
      if (coordMatch && coordMatch.length === 3) {
        sourceLat = parseFloat(coordMatch[1]);
        sourceLng = parseFloat(coordMatch[2]);
      }
    }
    
    // Navigate to map with coordinates as state
    navigate('/map', {
      state: {
        source: { lat: sourceLat, lng: sourceLng },
        destination: { lat: destLat, lng: destLng }
      }
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-white animate-fade-in">
      <Header />
      <div className="flex-1 flex flex-col p-6">
        <h2 className="text-2xl font-bold mb-8 text-center">Enter Location</h2>
        
        <form onSubmit={handleFindRoute} className="max-w-md w-full mx-auto">
          <div className="mb-4">
            <InputField
              label="Source :"
              type="text"
              placeholder="Enter source location"
              required
              value={source}
              onChange={(e) => setSource(e.target.value)}
              icon={<ChevronDown className="text-gray-500" />}
            />
          </div>
          
          <div className="flex flex-col gap-2 mb-6">
            <SecondaryButton 
              type="button" 
              className="w-full"
              onClick={getCurrentLocation}
              disabled={isGettingLocation}
            >
              {isGettingLocation ? "Getting Location..." : "Your Current Location"}
            </SecondaryButton>
            
            <div className="relative">
              <SecondaryButton type="button" className="w-full">
                Select From Demo Locations
              </SecondaryButton>
              <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg hidden group-hover:block">
                {demoLocations.map(loc => (
                  <button
                    key={loc.name}
                    type="button"
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                    onClick={() => setSource(loc.name)}
                  >
                    {loc.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <InputField
              label="Destination :"
              type="text"
              placeholder="Enter destination"
              required
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
            />
            
            <div className="mt-2">
              <div className="grid grid-cols-2 gap-2">
                {demoLocations.map(loc => (
                  <button
                    key={loc.name}
                    type="button"
                    className="text-sm bg-gray-100 hover:bg-gray-200 py-1 px-2 rounded-md"
                    onClick={() => setDestination(loc.name)}
                  >
                    {loc.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex justify-center">
            <PrimaryButton type="submit" className="min-w-[200px]">
              Find Route
            </PrimaryButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LocationPage;
