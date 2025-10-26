import { useState } from 'react';
import { Menu, Star, Trophy, User, Settings, FileText, Users, LogOut, Shield, MessageCircle } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function HamburgerMenu() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { signOut, isAdmin } = useAuth();

  // Create menu items dynamically based on admin status
  const menuItems = [
    ...(isAdmin ? [{ icon: Shield, label: 'Admin Dashboard', path: '/admin' }] : []),
    { icon: User, label: 'User Info', path: '/profile' },
    { icon: FileText, label: 'My Reports', path: '/my-reports' },
    { icon: MessageCircle, label: 'AI Assistant', path: '/chat' },
    { icon: Trophy, label: 'Leaderboard', path: '/leaderboard' },
    { icon: Star, label: 'Rate Us', path: '/rate' },
    { icon: Users, label: 'Contribute', path: '/contribute' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-72">
        <div className="flex flex-col h-full">
          <h2 className="text-lg font-semibold mb-4">Menu</h2>
          <Separator className="mb-4" />
          
          <div className="flex-1 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.path}
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => handleNavigation(item.path)}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.label}
                </Button>
              );
            })}
          </div>

          <Separator className="my-4" />
          
          <Button
            variant="ghost"
            className="w-full justify-start text-destructive hover:text-destructive"
            onClick={handleSignOut}
          >
            <LogOut className="h-5 w-5 mr-3" />
            Sign Out
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
