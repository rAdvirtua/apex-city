import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Users, FileText, Clock, CheckCircle2, TrendingUp, Eye, AlertCircle, RefreshCw, ArrowLeft, Download, UserCheck, FileBarChart, UserPlus } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface Issue {
  id: string;
  title: string;
  description: string;
  category: string;
  location_address: string;
  status: 'pending' | 'in-progress' | 'resolved';
  image_url: string | null;
  created_at: string;
  reporter_name?: string;
}

export default function AdminDashboard() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      console.log('Fetching issues for admin dashboard...');
      
      // First try the simple query without joins
      const { data, error } = await supabase
        .from('issues')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Simple query error:', error);
        throw error;
      }

      console.log('Issues fetched:', data?.length || 0);

      // If we have data, try to get reporter names separately
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map(issue => issue.user_id))];
        const { data: profiles, error: profileError } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', userIds);

        if (profileError) {
          console.warn('Could not fetch profiles:', profileError);
        }

        // Map reporter names
        const profileMap = new Map(profiles?.map(p => [p.id, p.full_name]) || []);
        
        const formattedIssues = data.map(issue => ({
          ...issue,
          reporter_name: profileMap.get(issue.user_id) || 'Anonymous'
        }));

        setIssues(formattedIssues);
      } else {
        setIssues([]);
      }
    } catch (error) {
      console.error('Error fetching issues:', error);
      toast({
        title: 'Error',
        description: 'Failed to load issues. Please check your database connection.',
        variant: 'destructive',
      });
      setIssues([]);
    } finally {
      setLoading(false);
    }
  };

  const updateIssueStatus = async (issueId: string, newStatus: 'pending' | 'in-progress' | 'resolved') => {
    try {
      console.log('Updating issue status:', { issueId, newStatus });
      
      const { error } = await supabase
        .from('issues')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', issueId);

      if (error) {
        console.error('Supabase error details:', error);
        throw error;
      }

      // Update local state
      setIssues(prev => prev.map(issue => 
        issue.id === issueId 
          ? { ...issue, status: newStatus }
          : issue
      ));

      toast({
        title: 'Status Updated',
        description: `Issue status changed to ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating issue status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update issue status',
        variant: 'destructive',
      });
    }
  };

  const handleViewIssue = (issueId: string) => {
    // Navigate to issue detail view (you can create this page later)
    toast({
      title: 'View Issue',
      description: `Viewing issue ${issueId}`,
    });
    // For now, just show a toast. You can implement a detailed view later
  };

  const handleReviewPendingIssues = () => {
    // Filter to show only pending issues
    const pendingIssues = issues.filter(issue => issue.status === 'pending');
    toast({
      title: 'Pending Issues',
      description: `Found ${pendingIssues.length} pending issues to review`,
    });
  };

  const handleGenerateReport = () => {
    const reportData = {
      totalIssues: issues.length,
      pending: issues.filter(i => i.status === 'pending').length,
      inProgress: issues.filter(i => i.status === 'in-progress').length,
      resolved: issues.filter(i => i.status === 'resolved').length,
      generatedAt: new Date().toISOString(),
    };

    // Create and download report
    const reportContent = `
ADMIN REPORT - CIVIC PULSE
Generated: ${new Date().toLocaleDateString()}

SUMMARY:
- Total Issues: ${reportData.totalIssues}
- Pending: ${reportData.pending}
- In Progress: ${reportData.inProgress}
- Resolved: ${reportData.resolved}

DETAILED BREAKDOWN:
${issues.map(issue => `
Issue: ${issue.title}
Status: ${issue.status}
Category: ${issue.category}
Reporter: ${issue.reporter_name}
Date: ${new Date(issue.created_at).toLocaleDateString()}
`).join('\n')}
    `;

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `civic-pulse-report-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'Report Generated',
      description: 'Report has been downloaded',
    });
  };

  const handleExportData = () => {
    const csvContent = [
      ['Title', 'Description', 'Category', 'Status', 'Location', 'Reporter', 'Created Date'],
      ...issues.map(issue => [
        issue.title,
        issue.description,
        issue.category,
        issue.status,
        issue.location_address,
        issue.reporter_name || 'Anonymous',
        new Date(issue.created_at).toLocaleDateString()
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `civic-pulse-data-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'Data Exported',
      description: 'Issues data has been exported to CSV',
    });
  };

  const stats = {
    totalReports: issues.length,
    pendingReviews: issues.filter((i) => i.status === "pending").length,
    inProgress: issues.filter((i) => i.status === "in-progress").length,
    resolved: issues.filter((i) => i.status === "resolved").length,
    avgResolutionTime: "4.2 days", // This would need to be calculated from actual data
  };

  const recentIssues = issues.slice(0, 10);

  const statusConfig = {
    pending: { label: "Pending", className: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20" },
    "in-progress": { label: "In Progress", className: "bg-blue-500/10 text-blue-700 border-blue-500/20" },
    resolved: { label: "Resolved", className: "bg-green-500/10 text-green-700 border-green-500/20" },
  } as const;

  // Safe status configuration function with fallback
  const getStatusConfig = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) {
      console.warn(`Unknown status in AdminDashboard: "${status}". Available statuses:`, Object.keys(statusConfig));
    }
    return config || {
      label: status || "Unknown",
      className: "bg-gray-500/10 text-gray-700 border-gray-500/20"
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-3">Admin Dashboard</h1>
              <p className="text-lg text-primary-foreground/90">
                Manage and review reported civic issues
              </p>
            </div>
            <Button
              onClick={() => navigate('/dashboard')}
              variant="secondary"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Exit Admin
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <FileText className="h-5 w-5 text-primary" />
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
            <p className="text-2xl font-bold mb-1">{stats.totalReports}</p>
            <p className="text-sm text-muted-foreground">Total Reports</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <p className="text-2xl font-bold mb-1">{stats.pendingReviews}</p>
            <p className="text-sm text-muted-foreground">Pending Reviews</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold mb-1">{stats.inProgress}</p>
            <p className="text-sm text-muted-foreground">In Progress</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold mb-1">{stats.resolved}</p>
            <p className="text-sm text-muted-foreground">Resolved</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-5 w-5 text-accent" />
            </div>
            <p className="text-2xl font-bold mb-1">{stats.avgResolutionTime}</p>
            <p className="text-sm text-muted-foreground">Avg Resolution</p>
          </Card>
        </div>

            {/* Quick Actions */}
            <Card className="p-6 mb-8">
              <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
              <div className="flex flex-wrap gap-3">
                <Button 
                  variant="default" 
                  onClick={handleReviewPendingIssues}
                  className="flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Review Pending Issues
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleGenerateReport}
                  className="flex items-center gap-2"
                >
                  <FileBarChart className="h-4 w-4" />
                  Generate Report
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/admin/assign-multiple')}
                  className="flex items-center gap-2"
                >
                  <UserPlus className="h-4 w-4" />
                  Assign Issues
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleExportData}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export Data
                </Button>
              </div>
            </Card>

            {/* Recent Issues Table */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Recent Issues</h2>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={fetchIssues}
                    disabled={loading}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      toast({
                        title: 'View All Issues',
                        description: `Showing all ${issues.length} issues`,
                      });
                    }}
                  >
                    View All ({issues.length})
                  </Button>
                </div>
              </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reporter</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentIssues.map((issue) => (
                  <TableRow key={issue.id}>
                    <TableCell className="font-medium">{issue.title}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{issue.category}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {issue.location}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusConfig(issue.status).className}>
                        {getStatusConfig(issue.status).label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{issue.reporter_name}</TableCell>
                    <TableCell className="text-sm">
                      {new Date(issue.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center gap-2">
                        {issue.status === 'pending' && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => navigate(`/admin/assign/${issue.id}`)}
                            title="Assign to Team"
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <UserPlus className="h-4 w-4" />
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => updateIssueStatus(issue.id, 'in-progress')}
                          disabled={issue.status === 'in-progress'}
                          title="Mark as In Progress"
                        >
                          <Clock className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => updateIssueStatus(issue.id, 'resolved')}
                          disabled={issue.status === 'resolved'}
                          title="Mark as Resolved"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewIssue(issue.id)}
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
}
