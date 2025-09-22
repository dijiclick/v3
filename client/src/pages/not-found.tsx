import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home } from "lucide-react";
import { Link } from "wouter";
import { useSEO } from "@/hooks/use-seo";

export default function NotFound() {
  useSEO({
    title: "Page Not Found - TechShop",
    description: "The page you're looking for couldn't be found. Browse our collection of premium electronics and more.",
    keywords: "404, page not found, electronics, tech shop",
    ogTitle: "Page Not Found - TechShop",
    ogDescription: "The page you're looking for couldn't be found. Browse our collection of premium electronics and more.",
    canonical: typeof window !== 'undefined' ? window.location.href : undefined,
    robots: 'noindex, nofollow'
  });

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6 text-center">
          <div className="flex justify-center mb-4">
            <AlertCircle className="h-16 w-16 text-destructive" />
          </div>
          
          <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="not-found-title">
            404 - Page Not Found
          </h1>

          <p className="text-muted-foreground mb-6" data-testid="not-found-description">
            The page you're looking for doesn't exist or has been moved.
          </p>

          <Link href="/">
            <Button className="w-full" data-testid="home-button">
              <Home className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
