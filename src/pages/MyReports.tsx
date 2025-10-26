import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import BottomNav from '@/components/BottomNav';
import { IssueCard, IssueCategory, IssueStatus } from '@/components/IssueCard';
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from 'lucide-react';

interface Issue {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  location_address: string;
  status: IssueStatus;
  image_url: string | null;
  created_at: string;
}

export default function MyReports() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchIssues();
  }, [user]);

  const fetchIssues = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('issues')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Supabase returns loose `string` types for enums; normalize to the app's IssueStatus/IssueCategory
      const normalizeStatus = (s: any): IssueStatus => {
        if (s === 'pending' || s === 'in-progress' || s === 'resolved') return s;
        return 'pending';
      };

      const normalized = (data || []).map((d: any) => ({
        id: d.id,
        title: d.title,
        description: d.description,
        category: d.category as IssueCategory,
        location_address: d.location_address,
        status: normalizeStatus(d.status),
        image_url: d.image_url ?? null,
        created_at: d.created_at,
      } as Issue));

      setIssues(normalized);
    } catch (error) {
      console.error('Error fetching issues:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (issueId: string) => {
    if (!window.confirm("Are you sure you want to delete this report?")) {
      return;
    }

    try {
      const { error } = await supabase.from('issues').delete().eq('id', issueId);
      if (error) throw error;

      setIssues(issues.filter(issue => issue.id !== issueId));
      toast({
        title: "Report deleted",
        description: "Your issue report has been successfully deleted.",
      });
    } catch (error) {
      console.error('Error deleting issue:', error);
      toast({
        title: "Error deleting report",
        description: "There was a problem deleting your report. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdate = (issueId: string) => {
    navigate(`/edit-report/${issueId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground py-8">
        <div className="container mx-auto px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/dashboard')}
            className="mb-4 text-primary-foreground hover:bg-primary-foreground/20"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">My Reports</h1>
            <Button onClick={() => navigate('/report')} variant="secondary">Report New Issue</Button>
          </div>
          <p className="text-primary-foreground/90 mt-2">
            Track your submitted issues
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {issues.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground mb-4">You haven't reported any issues yet</p>
            <Button onClick={() => navigate('/report')}>
              Report Your First Issue
            </Button>
          </Card>
        ) : (
          <div className="space-y-4 max-w-4xl mx-auto">
            {issues.map((issue) => (
              <IssueCard
                key={issue.id}
                id={issue.id}
                title={issue.title}
                description={issue.description}
                category={issue.category}
                status={issue.status}
                location={issue.location_address}
                date={new Date(issue.created_at).toLocaleDateString()}
                image={issue.image_url || undefined}
                onUpdate={() => handleUpdate(issue.id)}
                onDelete={() => handleDelete(issue.id)}
              />
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}