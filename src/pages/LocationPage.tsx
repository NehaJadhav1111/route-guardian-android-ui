
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import InputField from "@/components/InputField";
import PrimaryButton from "@/components/PrimaryButton";
import { MapPin, Search } from "lucide-react";
import { useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const LocationPage = () => {
  const navigate = useNavigate();
  const [sourceAddress, setSourceAddress] = useState("");
  const [destinationAddress, setDestinationAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const geocodeAddress = async (address: string): Promise<{lat: number, lng: number} | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('geocode-address', {
        body: { address }
      });
      
      if (error) {
        throw new Error(error.message || 'Failed to geocode address');
      }
      
      if (!data || !data.lat || !data.lng) {
        throw new Error('Location not found');
      }
      
      return { lat: data.lat, lng: data.lng };
    } catch (err: any) {
      console.error('Geocoding error:', err);
      toast({
        title: "Location Error",
        description: err.message || "Failed to find location coordinates",
        variant: "destructive",
      });
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sourceAddress || !destinationAddress) {
      toast({
        title: "Missing Information",
        description: "Please enter both source and destination addresses",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const sourceCoords = await geocodeAddress(sourceAddress);
      const destCoords = await geocodeAddress(destinationAddress);
      
      if (!sourceCoords || !destCoords) {
        return; // Error already displayed by geocodeAddress
      }
      
      // Format coordinates for URL
      const sourceParam = `${sourceCoords.lat},${sourceCoords.lng}`;
      const destParam = `${destCoords.lat},${destCoords.lng}`;
      
      const queryParams = new URLSearchParams({
        source: sourceParam,
        destination: destParam,
        sourceAddress: sourceAddress,
        destinationAddress: destinationAddress,
      });
      
      navigate(`/map?${queryParams.toString()}`);
    } catch (err) {
      console.error('Error processing locations:', err);
      toast({
        title: "Error",
        description: "Failed to process locations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
                placeholder="Enter starting location (e.g. 28 Pragati Vihar, New Delhi)"
                icon={<MapPin className="w-5 h-5 text-gray-500" />}
                value={sourceAddress}
                onChange={(e) => setSourceAddress(e.target.value)}
                required
              />
              
              <InputField
                label="Destination"
                placeholder="Enter destination (e.g. India Gate, New Delhi)"
                icon={<MapPin className="w-5 h-5 text-gray-500" />}
                value={destinationAddress}
                onChange={(e) => setDestinationAddress(e.target.value)}
                required
              />
              
              <div className="mt-8">
                <PrimaryButton type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <span className="animate-pulse">Processing...</span>
                    </>
                  ) : (
                    <>
                      Find Safe Route <Search className="w-4 h-4 ml-2" />
                    </>
                  )}
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
