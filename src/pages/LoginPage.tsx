
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import InputField from "@/components/InputField";
import PrimaryButton from "@/components/PrimaryButton";
import SecondaryButton from "@/components/SecondaryButton";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

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

  const handleGoogleLogin = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/location`
        }
      });
      
      if (error) {
        toast({
          title: "Google login failed",
          description: error.message,
          variant: "destructive"
        });
        console.error("Google login error:", error.message);
      }
    } catch (error) {
      console.error("Unexpected error during Google login:", error);
      toast({
        title: "Google login failed",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
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
          
          <div className="mt-4">
            <Button 
              type="button"
              variant="outline" 
              className="w-full flex items-center justify-center gap-2"
              onClick={handleGoogleLogin}
            >
              <svg width="24" height="24" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </Button>
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
