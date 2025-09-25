import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    // Simulate subscription
    setIsSubscribed(true);
    toast({
      title: "عضویت موفقیت‌آمیز",
      description: "شما با موفقیت در خبرنامه عضو شدید!",
    });
    setEmail("");
    
    // Reset after 3 seconds
    setTimeout(() => setIsSubscribed(false), 3000);
  };

  return (
    <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-6 text-white" dir="rtl" data-testid="newsletter">
      <div className="flex items-center gap-2 mb-3">
        <Mail className="w-5 h-5" />
        <h3 className="text-white font-vazir">عضویت در خبرنامه</h3>
      </div>
      <p className="text-red-100 text-sm mb-4 font-vazir">
        آخرین مطالب و به‌روزرسانی‌ها را مستقیماً در صندوق پستی خود دریافت کنید.
      </p>
      
      {!isSubscribed ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            type="email"
            placeholder="ایمیل خود را وارد کنید"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-white/20 border-white/30 text-white placeholder:text-red-200 focus:bg-white/30 text-right font-vazir"
            dir="rtl"
            required
            data-testid="newsletter-email"
          />
          <Button 
            type="submit"
            className="w-full bg-white text-red-600 hover:bg-red-50 transition-colors duration-200 font-vazir"
            data-testid="newsletter-submit"
          >
            عضویت در خبرنامه
          </Button>
        </form>
      ) : (
        <div className="flex items-center gap-2 text-green-100" data-testid="newsletter-success">
          <CheckCircle className="w-5 h-5" />
          <span className="text-sm font-vazir">متشکرم! عضویت شما تکمیل شد.</span>
        </div>
      )}
    </div>
  );
}