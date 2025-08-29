import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { NotificationBell } from "./NotificationBell";
import { useAuth } from "@/hooks/useAuth";
import { Menu, X, GraduationCap, User, LogOut, Building, FileText } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, profile, signOut } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <GraduationCap className="h-8 w-8 text-primary" />
          <span className="font-bold text-xl text-foreground">EduChain Scholar</span>
        </Link>

        <div className="hidden md:flex items-center space-x-8">
          {user ? (
            <>
              <Link to="/" className="text-gray-600 hover:text-primary transition-colors">
                Home
              </Link>
              {profile?.role === 'student' && (
                <Link to="/apply" className="text-gray-600 hover:text-primary transition-colors">
                  Apply
                </Link>
              )}
              {profile?.role === 'institution' && (
                <Link to="/dashboard" className="text-gray-600 hover:text-primary transition-colors">
                  Dashboard
                </Link>
              )}
              <Link to="/profile" className="text-gray-600 hover:text-primary transition-colors">
                Profile
              </Link>
              <NotificationBell />
              <Button variant="ghost" onClick={signOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <a href="#scholarships" className="text-gray-600 hover:text-primary transition-colors">
                Scholarships
              </a>
              <a href="#how-it-works" className="text-gray-600 hover:text-primary transition-colors">
                How it Works
              </a>
              <a href="#community" className="text-gray-600 hover:text-primary transition-colors">
                Community
              </a>
              <Link to="/auth">
                <Button>Get Started</Button>
              </Link>
            </>
          )}
        </div>

        <button
          className="md:hidden p-2"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
            {user ? (
              <>
                <Link to="/" className="block px-3 py-2 text-gray-600 hover:text-primary transition-colors">
                  Home
                </Link>
                {profile?.role === 'student' && (
                  <Link to="/apply" className="block px-3 py-2 text-gray-600 hover:text-primary transition-colors">
                    <FileText className="h-4 w-4 mr-2 inline" />
                    Apply for Scholarships
                  </Link>
                )}
                {profile?.role === 'institution' && (
                  <Link to="/dashboard" className="block px-3 py-2 text-gray-600 hover:text-primary transition-colors">
                    <Building className="h-4 w-4 mr-2 inline" />
                    Institution Dashboard
                  </Link>
                )}
                <Link to="/profile" className="block px-3 py-2 text-gray-600 hover:text-primary transition-colors">
                  <User className="h-4 w-4 mr-2 inline" />
                  Profile
                </Link>
                <div className="px-3 py-2">
                  <Button variant="ghost" onClick={signOut} className="w-full justify-start">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </>
            ) : (
              <>
                <a href="#scholarships" className="block px-3 py-2 text-gray-600 hover:text-primary transition-colors">
                  Scholarships
                </a>
                <a href="#how-it-works" className="block px-3 py-2 text-gray-600 hover:text-primary transition-colors">
                  How it Works
                </a>
                <a href="#community" className="block px-3 py-2 text-gray-600 hover:text-primary transition-colors">
                  Community
                </a>
                <div className="px-3 py-2">
                  <Link to="/auth">
                    <Button className="w-full">Get Started</Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;