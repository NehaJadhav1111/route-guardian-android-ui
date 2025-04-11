
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import InputField from "@/components/InputField";
import PrimaryButton from "@/components/PrimaryButton";
import { MapPin, Search, AlertTriangle } from "lucide-react";
import { useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const LocationPage = () => {
  const navigate = useNavigate();
  const [sourceAddress, setSourceAddress] = useState("");
  const [destinationAddress, setDestinationAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const geocodeAddress = async (address: string): Promise<{lat: number, lng: number} | null> => {
    try {
      console.log(`Attempting to geocode address: ${address}`);
      
      const { data, error } = await supabase.functions.invoke('geocode-address', {
        body: { address }
      });
      
      if (error) {
        console.error('Geocoding error:', error);
        throw new Error(error.message || 'Failed to geocode address');
      }
      
      if (!data || !data.lat || !data.lng) {
        console.error('Invalid geocoding response:', data);
        throw new Error('Location not found');
      }
      
      console.log(`Successfully geocoded "${address}" to:`, data);
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
    setError(null);
    
    if (!sourceAddress || !destinationAddress) {
      setError("Please enter both source and destination addresses");
      toast({
        title: "Missing Information",
        description: "Please enter both source and destination addresses",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Try to geocode source address
      const sourceCoords = await geocodeAddress(sourceAddress);
      if (!sourceCoords) {
        setError(`Could not find location: "${sourceAddress}"`);
        setIsLoading(false);
        return;
      }
      
      // Try to geocode destination address
      const destCoords = await geocodeAddress(destinationAddress);
      if (!destCoords) {
        setError(`Could not find location: "${destinationAddress}"`);
        setIsLoading(false);
        return;
      }
      
      // Format coordinates for URL
      const sourceParam = `${sourceCoords.lat},${sourceCoords.lng}`;
      const destParam = `${destCoords.lat},${destCoords.lng}`;
      
      console.log("Navigation to map with coordinates:", {
        source: sourceParam,
        destination: destParam,
        sourceAddress,
        destinationAddress
      });
      
      const queryParams = new URLSearchParams({
        source: sourceParam,
        destination: destParam,
        sourceAddress: sourceAddress,
        destinationAddress: destinationAddress,
      });
      
      navigate(`/map?${queryParams.toString()}`);
    } catch (err: any) {
      console.error('Error processing locations:', err);
      setError(err.message || "Failed to process locations");
      toast({
        title: "Error",
        description: "Failed to process locations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddressChange = () => {
    // Clear error when user starts typing again
    if (error) setError(null);
  };

  return (
    <AuthGuard>
      <div className="min-h-screen flex flex-col bg-white animate-fade-in">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="w-full max-w-md">
            <h2 className="text-2xl font-bold mb-8 text-center">Enter Locations</h2>
            
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <InputField
                label="Source"
                placeholder="Enter starting location (e.g. Pragati Vihar, New Delhi)"
                icon={<MapPin className="w-5 h-5 text-gray-500" />}
                value={sourceAddress}
                onChange={(e) => {
                  setSourceAddress(e.target.value);
                  handleAddressChange();
                }}
                required
              />
              
              <InputField
                label="Destination"
                placeholder="Enter destination (e.g. India Gate, New Delhi)"
                icon={<MapPin className="w-5 h-5 text-gray-500" />}
                value={destinationAddress}
                onChange={(e) => {
                  setDestinationAddress(e.target.value);
                  handleAddressChange();
                }}
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
