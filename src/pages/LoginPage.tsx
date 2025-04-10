
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import InputField from "@/components/InputField";
import PrimaryButton from "@/components/PrimaryButton";
import SecondaryButton from "@/components/SecondaryButton";
import { toast } from "@/hooks/use-toast";

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive"
        });
        console.error("Login error:", error.message);
      } else {
        toast({
          title: "Login successful",
          description: "Welcome back!",
        });
        navigate('/location');
      }
    } catch (error) {
      console.error("Unexpected error during login:", error);
      toast({
        title: "Login failed",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const navigateToSignup = () => {
    navigate('/signup');
  };

  return (
    <div className="min-h-screen flex flex-col bg-white animate-fade-in">
      <Header />
      <div className="flex-1 flex flex-col justify-center p-6">
        <form onSubmit={handleLogin} className="max-w-md w-full mx-auto">
          <InputField
            label="Email"
            type="email"
            placeholder="Enter your email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          
          <InputField
            label="Password"
            type="password"
            placeholder="Enter your password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          
          <div className="mt-8">
            <PrimaryButton 
              type="submit" 
              className="w-full"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </PrimaryButton>
          </div>
          
          <div className="mt-4 text-center">
            <a href="#" className="text-blue-600 hover:underline text-sm">
              Forget Password
            </a>
          </div>
          
          <div className="mt-6 text-center">
            <SecondaryButton 
              type="button" 
              className="w-full" 
              onClick={navigateToSignup}
            >
              Create account
            </SecondaryButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
