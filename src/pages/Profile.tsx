import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, Mail, Calendar, FileText, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import BottomNav from '@/components/BottomNav';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function Profile() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [reportCount, setReportCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportCount();
  }, [user]);

  const fetchReportCount = async () => {
    if (!user) return;

    try {
      const { count, error } = await supabase
        .from('issues')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (error) throw error;
      setReportCount(count || 0);
    } catch (error) {
      console.error('Error fetching report count:', error);
      toast({
        title: 'Error',
        description: 'Failed to load report statistics',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: 'Signed out successfully',
        description: 'You have been logged out',
      });
    } catch (error) {
      toast({
        title: 'Error signing out',
        description: 'There was a problem signing out. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground py-8">
        <div className="container mx-auto px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="mb-4 text-primary-foreground hover:bg-primary-foreground/20"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-3xl font-bold">User Profile</h1>
          <p className="text-primary-foreground/90 mt-2">
            Manage your account information
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-10 w-10 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold">
                {user?.user_metadata?.full_name || 'User'}
              </h2>
              <p className="text-muted-foreground">Active Citizen</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-accent/10 rounded-lg">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-accent/10 rounded-lg">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Member Since</p>
                <p className="font-medium">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-accent/10 rounded-lg">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Reports Submitted</p>
                <p className="font-medium">
                  {loading ? 'Loading...' : `${reportCount} issue${reportCount !== 1 ? 's' : ''}`}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t">
            <Button 
              onClick={handleSignOut}
              variant="destructive" 
              className="w-full flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
}
