import { Button } from "@/components/ui/button";
import { TrendingUp, Shield, BookOpen, Users } from "lucide-react";
import heroImage from "@/assets/hero-defi.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-hero overflow-hidden">
      <div className="absolute inset-0">
        <img 
          src={heroImage} 
          alt="DeFi Education Platform" 
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-hero/80"></div>
      </div>
      
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <h1 className="text-5xl md:text-7xl font-bold text-foreground leading-tight">
            Decentralized
            <span className="bg-gradient-primary bg-clip-text text-transparent"> Education</span>
            <br />
            Finance Platform
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Access transparent student loans, merit-based scholarships, and educational grants through smart contracts. The future of education financing is here.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button variant="hero" size="lg" className="text-lg px-8 py-6">
              <TrendingUp className="w-5 h-5" />
              Apply for Loan
            </Button>
            <Button variant="scholarship" size="lg" className="text-lg px-8 py-6">
              <BookOpen className="w-5 h-5" />
              Browse Scholarships
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-3xl mx-auto">
            <div className="bg-gradient-card backdrop-blur-sm rounded-xl p-6 border border-border/50">
              <Shield className="w-8 h-8 text-primary mb-3 mx-auto" />
              <div className="text-2xl font-bold text-foreground">100%</div>
              <div className="text-sm text-muted-foreground">Transparent</div>
            </div>
            
            <div className="bg-gradient-card backdrop-blur-sm rounded-xl p-6 border border-border/50">
              <TrendingUp className="w-8 h-8 text-accent mb-3 mx-auto" />
              <div className="text-2xl font-bold text-foreground">2.5%</div>
              <div className="text-sm text-muted-foreground">Lower Rates</div>
            </div>
            
            <div className="bg-gradient-card backdrop-blur-sm rounded-xl p-6 border border-border/50">
              <BookOpen className="w-8 h-8 text-scholarship mb-3 mx-auto" />
              <div className="text-2xl font-bold text-foreground">500+</div>
              <div className="text-sm text-muted-foreground">Scholarships</div>
            </div>
            
            <div className="bg-gradient-card backdrop-blur-sm rounded-xl p-6 border border-border/50">
              <Users className="w-8 h-8 text-defi-blue mb-3 mx-auto" />
              <div className="text-2xl font-bold text-foreground">10K+</div>
              <div className="text-sm text-muted-foreground">Students</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent"></div>
    </section>
  );
};

export default Hero;