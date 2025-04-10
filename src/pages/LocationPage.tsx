
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import InputField from "@/components/InputField";
import PrimaryButton from "@/components/PrimaryButton";
import { MapPin, Search } from "lucide-react";
import { useState } from "react";
import AuthGuard from "@/components/AuthGuard";

const LocationPage = () => {
  const navigate = useNavigate();
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const queryParams = new URLSearchParams({
      source: source,
      destination: destination,
    });
    
    navigate(`/map?${queryParams.toString()}`);
  };

  return (
    <AuthGuard>
      <div className="min-h-screen flex flex-col bg-white animate-fade-in">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="w-full max-w-md">
            <h2 className="text-2xl font-bold mb-8 text-center">Enter Locations</h2>
            
            <form onSubmit={handleSubmit}>
              <InputField
                label="Source"
                placeholder="Enter starting location"
                icon={<MapPin className="w-5 h-5 text-gray-500" />}
                value={source}
                onChange={(e) => setSource(e.target.value)}
                required
              />
              
              <InputField
                label="Destination"
                placeholder="Enter destination"
                icon={<MapPin className="w-5 h-5 text-gray-500" />}
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                required
              />
              
              <div className="mt-8">
                <PrimaryButton type="submit" className="w-full">
                  Find Safe Route <Search className="w-4 h-4 ml-2" />
                </PrimaryButton>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
};

export default LocationPage;
