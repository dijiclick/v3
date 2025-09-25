import { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Mail, CheckCircle } from "lucide-react";
import { toast } from "sonner@2.0.3";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    // Simulate subscription
    setIsSubscribed(true);
    toast.success("Successfully subscribed to newsletter!");
    setEmail("");
    
    // Reset after 3 seconds
    setTimeout(() => setIsSubscribed(false), 3000);
  };

  return (
    <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-6 text-white">
      <div className="flex items-center gap-2 mb-3">
        <Mail className="w-5 h-5" />
        <h3 className="text-white">Stay Updated</h3>
      </div>
      <p className="text-red-100 text-sm mb-4">
        Get the latest posts and updates delivered directly to your inbox.
      </p>
      
      {!isSubscribed ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-white/20 border-white/30 text-white placeholder:text-red-200 focus:bg-white/30"
            required
          />
          <Button 
            type="submit"
            className="w-full bg-white text-red-600 hover:bg-red-50 transition-colors duration-200"
          >
            Subscribe
          </Button>
        </form>
      ) : (
        <div className="flex items-center gap-2 text-green-100">
          <CheckCircle className="w-5 h-5" />
          <span className="text-sm">Thank you for subscribing!</span>
        </div>
      )}
    </div>
  );
}