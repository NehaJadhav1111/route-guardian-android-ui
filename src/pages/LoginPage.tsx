
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import InputField from "@/components/InputField";
import PrimaryButton from "@/components/PrimaryButton";

const LoginPage = () => {
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/location');
  };

  return (
    <div className="min-h-screen flex flex-col bg-white animate-fade-in">
      <Header />
      <div className="flex-1 flex flex-col justify-center p-6">
        <form onSubmit={handleLogin} className="max-w-md w-full mx-auto">
          <InputField
            label="Username"
            type="text"
            placeholder="Enter your username"
            required
          />
          
          <InputField
            label="Password"
            type="password"
            placeholder="Enter your password"
            required
          />
          
          <div className="mt-8">
            <PrimaryButton type="submit" className="w-full">
              Login
            </PrimaryButton>
          </div>
          
          <div className="mt-4 text-center">
            <a href="#" className="text-blue-600 hover:underline text-sm">
              Forget Password
            </a>
          </div>
          
          <div className="mt-6 text-center">
            <a href="#" className="text-blue-600 hover:underline">
              Create account
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
