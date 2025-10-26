import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ChevronLeft, ChevronRight, UserPlus, Send, Phone, Mail, MapPin, Calendar, FileText, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { sendAssignmentNotification } from '@/services/notificationService';

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

interface AssignmentForm {
  name: string;
  email: string;
  message: string;
}

export default function AssignMultipleIssues() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [assignmentForm, setAssignmentForm] = useState<AssignmentForm>({
    name: '',
    email: '',
    message: `Please review the issue details and take appropriate action. You can contact the reporter if needed for additional information.

Thank you for your service to the community.`
  });

  useEffect(() => {
    fetchIssues();
  }, []);

  useEffect(() => {
    if (issues.length > 0 && currentIndex < issues.length) {
      updateMessageTemplate();
    }
  }, [currentIndex, issues]);

  const fetchIssues = async () => {
    try {
      const { data, error } = await supabase
        .from('issues')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        // Get reporter names
        const userIds = [...new Set(data.map(issue => issue.user_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', userIds);

        const profileMap = profiles?.reduce((acc, profile) => {
          acc[profile.id] = profile.full_name;
          return acc;
        }, {} as Record<string, string>) || {};

        const issuesWithNames = data.map(issue => ({
          ...issue,
          reporter_name: profileMap[issue.user_id] || 'Anonymous'
        }));

        setIssues(issuesWithNames);
      } else {
        setIssues([]);
      }
    } catch (error) {
      console.error('Error fetching issues:', error);
      toast({
        title: 'Error',
        description: 'Failed to load issues',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateMessageTemplate = () => {
    if (issues.length === 0 || currentIndex >= issues.length) return;

    const currentIssue = issues[currentIndex];
    setAssignmentForm(prev => ({
      ...prev,
      message: prev.message
        .replace('[Issue Title]', currentIssue.title)
        .replace('[Issue Category]', currentIssue.category)
        .replace('[Issue Location]', currentIssue.location_address)
        .replace('[Issue Description]', currentIssue.description)
        .replace('[Team Member Name]', prev.name || '[Team Member Name]')
    }));
  };

  const handleAssignCurrentIssue = async () => {
    if (!assignmentForm.name || !assignmentForm.email) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    if (issues.length === 0 || currentIndex >= issues.length) {
      toast({
        title: 'No Issue Selected',
        description: 'Please select a valid issue',
        variant: 'destructive',
      });
      return;
    }

    const currentIssue = issues[currentIndex];
    setAssigning(true);

    try {
      // Create assignment record
      const { error: assignmentError } = await supabase
        .from('issue_assignments')
        .insert({
          issue_id: currentIssue.id,
          assigned_to_name: assignmentForm.name,
          assigned_to_email: assignmentForm.email,
          assignment_message: assignmentForm.message,
          assigned_at: new Date().toISOString(),
          status: 'assigned'
        });

      if (assignmentError) throw assignmentError;

      // Update issue status to in-progress
      const { error: updateError } = await supabase
        .from('issues')
        .update({ 
          status: 'in-progress',
          updated_at: new Date().toISOString()
        })
        .eq('id', currentIssue.id);

      if (updateError) throw updateError;

      // Send notifications
      const notificationResult = await sendAssignmentNotification({
        assigneeName: assignmentForm.name,
        assigneeEmail: assignmentForm.email,
        issueTitle: currentIssue.title,
        issueDescription: currentIssue.description,
        issueLocation: currentIssue.location_address,
        assignmentMessage: assignmentForm.message,
      });

      // Show detailed results
      if (notificationResult.emailSuccess) {
        console.log('✅ Email sent successfully');
      } else {
        console.log('❌ Email failed');
      }

      if (notificationResult.errors.length > 0) {
        console.log('Notification errors:', notificationResult.errors);
      }

      toast({
        title: 'Assignment Successful',
        description: `Issue "${currentIssue.title}" assigned to ${assignmentForm.name}`,
      });

      // Move to next issue or go back to admin
      if (currentIndex < issues.length - 1) {
        setCurrentIndex(currentIndex + 1);
        // Reset form for next assignment
        setAssignmentForm(prev => ({
          ...prev,
          name: '',
          email: '',
          message: prev.message.replace(prev.name || '[Team Member Name]', '[Team Member Name]')
        }));
      } else {
        navigate('/admin');
      }
    } catch (error) {
      console.error('Error assigning issue:', error);
      toast({
        title: 'Assignment Failed',
        description: 'There was an error assigning the issue. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setAssigning(false);
    }
  };

  const goToPreviousIssue = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const goToNextIssue = () => {
    if (currentIndex < issues.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const statusConfig = {
    pending: { label: "Pending", className: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20" },
    "in-progress": { label: "In Progress", className: "bg-blue-500/10 text-blue-700 border-blue-500/20" },
    resolved: { label: "Resolved", className: "bg-green-500/10 text-green-700 border-green-500/20" },
  } as const;

  const getStatusConfig = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig];
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
          <p className="text-muted-foreground">Loading issues...</p>
        </div>
      </div>
    );
  }

  if (issues.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">No issues available for assignment</p>
          <Button onClick={() => navigate('/admin')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const currentIssue = issues[currentIndex];

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground py-8">
        <div className="container mx-auto px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/admin')}
            className="mb-4 text-primary-foreground hover:bg-primary-foreground/20"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-3xl font-bold">Assign Multiple Issues</h1>
          <p className="text-primary-foreground/90 mt-2">
            Browse and assign team members to civic issues
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Issue Browser */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Issue Browser</span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToPreviousIssue}
                      disabled={currentIndex === 0}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      {currentIndex + 1} of {issues.length}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToNextIssue}
                      disabled={currentIndex === issues.length - 1}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <h2 className="text-2xl font-semibold">{currentIssue.title}</h2>
                <p className="text-muted-foreground">{currentIssue.description}</p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Category</Label>
                    <Badge variant="secondary" className="mt-1">
                      {currentIssue.category}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                    <Badge variant="outline" className={`mt-1 ${getStatusConfig(currentIssue.status).className}`}>
                      {getStatusConfig(currentIssue.status).label}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{currentIssue.location_address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{new Date(currentIssue.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Reported by: {currentIssue.reporter_name}</span>
                  </div>
                </div>

                {currentIssue.image_url && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Image</Label>
                    <img src={currentIssue.image_url} alt="Issue" className="mt-2 max-w-xs rounded-md" />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Issue List Preview */}
            <Card>
              <CardHeader>
                <CardTitle>All Issues ({issues.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {issues.map((issue, index) => (
                    <div
                      key={issue.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        index === currentIndex 
                          ? 'bg-primary/10 border-primary' 
                          : 'hover:bg-muted'
                      }`}
                      onClick={() => setCurrentIndex(index)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{issue.title}</p>
                          <p className="text-sm text-muted-foreground truncate">{issue.location_address}</p>
                        </div>
                        <Badge variant="outline" className={getStatusConfig(issue.status).className}>
                          {getStatusConfig(issue.status).label}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Assignment Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-primary" />
                  Assign Team Member
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => { e.preventDefault(); handleAssignCurrentIssue(); }} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="assigneeName">Name</Label>
                    <Input
                      id="assigneeName"
                      value={assignmentForm.name}
                      onChange={(e) => setAssignmentForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Team Member Name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="assigneeEmail">Email</Label>
                    <Input
                      id="assigneeEmail"
                      type="email"
                      value={assignmentForm.email}
                      onChange={(e) => setAssignmentForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="team.member@example.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="assignmentMessage">Message</Label>
                    <Textarea
                      id="assignmentMessage"
                      value={assignmentForm.message}
                      onChange={(e) => setAssignmentForm(prev => ({ ...prev, message: e.target.value }))}
                      rows={8}
                      placeholder="Type your message here..."
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1" disabled={assigning}>
                      {assigning ? 'Assigning...' : 'Assign & Send Notifications'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate('/admin')}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
