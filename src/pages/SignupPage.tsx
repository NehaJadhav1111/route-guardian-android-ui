
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import InputField from "@/components/InputField";
import PrimaryButton from "@/components/PrimaryButton";
import SecondaryButton from "@/components/SecondaryButton";
import { toast } from "@/hooks/use-toast";

const SignupPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both passwords match",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/location`
        }
      });
      
      if (error) {
        toast({
          title: "Signup failed",
          description: error.message,
          variant: "destructive"
        });
        console.error("Signup error:", error.message);
      } else {
        toast({
          title: "Signup successful",
          description: "Please check your email to confirm your account",
        });
        navigate('/login');
      }
    } catch (error) {
      console.error("Unexpected error during signup:", error);
      toast({
        title: "Signup failed",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const navigateToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-white animate-fade-in">
      <Header />
      <div className="flex-1 flex flex-col justify-center p-6">
        <form onSubmit={handleSignup} className="max-w-md w-full mx-auto">
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
          
          <InputField
            label="Confirm Password"
            type="password"
            placeholder="Confirm your password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          
          <div className="mt-8">
            <PrimaryButton 
              type="submit" 
              className="w-full"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create account"}
            </PrimaryButton>
          </div>
          
          <div className="mt-6 text-center">
            <SecondaryButton 
              type="button" 
              className="w-full" 
              onClick={navigateToLogin}
            >
              Already have an account? Login
            </SecondaryButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;
