import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import HamburgerMenu from "./HamburgerMenu";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const location = useLocation();
  
  if (location.pathname === '/auth') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-primary text-primary-foreground shadow-sm sticky top-0 z-50">
        <nav className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to={user ? "/dashboard" : "/"} className="text-2xl font-bold flex items-center gap-2">
              🏙️ Apex City
            </Link>
            
            <div className="hidden md:flex items-center space-x-6">
              <Link to="/" className="hover:text-primary-foreground/80 transition">
                Home
              </Link>
              <Link to="/dashboard" className="hover:text-primary-foreground/80 transition">
                Public Dashboard
              </Link>
              {user && (
                <>
                  <Link to="/report" className="hover:text-primary-foreground/80 transition">
                    Report Issue
                  </Link>
                  <Link to="/my-reports" className="hover:text-primary-foreground/80 transition">
                    My Reports
                  </Link>
                  <Link to="/chat" className="hover:text-primary-foreground/80 transition">
                    AI Assistant
                  </Link>
                </>
              )}
            </div>

            {user && <HamburgerMenu />}
          </div>
        </nav>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="bg-muted/30 border-t mt-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>&copy; 2024 Apex City. Making cities better together.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};