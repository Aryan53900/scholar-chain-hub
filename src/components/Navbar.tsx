import { Button } from "@/components/ui/button";
import { Wallet, Menu, X } from "lucide-react";
import { useState } from "react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">E</span>
          </div>
          <span className="font-bold text-xl text-foreground">EduFi Scholar</span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <a href="#lending" className="text-muted-foreground hover:text-foreground transition-colors">
            Lending
          </a>
          <a href="#scholarships" className="text-muted-foreground hover:text-foreground transition-colors">
            Scholarships
          </a>
          <a href="#community" className="text-muted-foreground hover:text-foreground transition-colors">
            Community
          </a>
          <a href="#analytics" className="text-muted-foreground hover:text-foreground transition-colors">
            Analytics
          </a>
        </div>

        <div className="flex items-center space-x-3">
          <Button variant="hero" className="hidden md:inline-flex">
            <Wallet className="w-4 h-4" />
            Connect Wallet
          </Button>
          
          <button 
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-background/95 backdrop-blur-lg border-b border-border">
          <div className="container mx-auto px-4 py-4 space-y-3">
            <a href="#lending" className="block text-muted-foreground hover:text-foreground transition-colors">
              Lending
            </a>
            <a href="#scholarships" className="block text-muted-foreground hover:text-foreground transition-colors">
              Scholarships
            </a>
            <a href="#community" className="block text-muted-foreground hover:text-foreground transition-colors">
              Community
            </a>
            <a href="#analytics" className="block text-muted-foreground hover:text-foreground transition-colors">
              Analytics
            </a>
            <Button variant="hero" className="w-full">
              <Wallet className="w-4 h-4" />
              Connect Wallet
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;