import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight" data-testid="hero-title">
                Discover Premium 
                <span className="text-primary"> Products</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-lg" data-testid="hero-description">
                Curated collection of high-quality items designed for modern living. Experience exceptional craftsmanship and innovative design.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg"
                className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                data-testid="hero-shop-button"
              >
                Shop Now
              </Button>
              <Button 
                variant="outline"
                size="lg"
                className="border border-border text-foreground px-8 py-3 rounded-lg font-semibold hover:bg-muted transition-colors"
                data-testid="hero-collection-button"
              >
                View Collection
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary" data-testid="stat-customers">10K+</div>
                <div className="text-sm text-muted-foreground">Happy Customers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary" data-testid="stat-products">500+</div>
                <div className="text-sm text-muted-foreground">Premium Products</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary" data-testid="stat-satisfaction">98%</div>
                <div className="text-sm text-muted-foreground">Satisfaction Rate</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative w-full h-96 lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=600" 
                alt="Modern lifestyle products" 
                className="w-full h-full object-cover" 
                data-testid="hero-image"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
