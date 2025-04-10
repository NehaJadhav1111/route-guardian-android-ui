
import { useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import Header from "@/components/Header";
import InputField from "@/components/InputField";
import PrimaryButton from "@/components/PrimaryButton";
import SecondaryButton from "@/components/SecondaryButton";

const LocationPage = () => {
  const navigate = useNavigate();

  const handleFindRoute = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/map');
  };

  return (
    <div className="min-h-screen flex flex-col bg-white animate-fade-in">
      <Header />
      <div className="flex-1 flex flex-col p-6">
        <h2 className="text-2xl font-bold mb-8 text-center">Enter Location</h2>
        
        <form onSubmit={handleFindRoute} className="max-w-md w-full mx-auto">
          <InputField
            label="Source :"
            type="text"
            placeholder="Enter source location"
            required
            icon={<ChevronDown className="text-gray-500" />}
          />
          
          <div className="flex flex-col gap-2 mb-6">
            <SecondaryButton type="button" className="w-full">
              Your Current Location
            </SecondaryButton>
            
            <SecondaryButton type="button" className="w-full">
              Enter Location Manually
            </SecondaryButton>
          </div>
          
          <InputField
            label="Destination :"
            type="text"
            placeholder="Enter destination"
            required
          />
          
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
