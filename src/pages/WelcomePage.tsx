
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import PrimaryButton from "@/components/PrimaryButton";

const WelcomePage = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-white animate-fade-in">
      <Header />
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="mb-12 mt-8">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-accent flex items-center justify-center">
            <div className="w-14 h-14 rounded-full border-2 border-primary flex items-center justify-center">
              <div className="w-6 h-6 rounded-full bg-primary"></div>
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-6">Welcome to Safe Route</h2>
          <p className="text-gray-700 mb-12 max-w-md mx-auto">
            This app helps users find the safest route based on historical crime data, 
            real-time inputs, and other safety factors.
          </p>
        </div>

        <PrimaryButton onClick={handleGetStarted} className="min-w-[200px]">
          Get Started
        </PrimaryButton>
      </div>
    </div>
  );
};

export default WelcomePage;
