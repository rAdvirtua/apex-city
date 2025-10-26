import { IssueCard } from "@/components/IssueCard";
import { mockIssues } from "@/lib/mockData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Clock, CheckCircle2, AlertCircle } from "lucide-react";

export default function TrackIssues() {
  // Simulate user's issues (in reality, this would be filtered by user ID)
  const userIssues = mockIssues.slice(0, 4);

  const stats = {
    total: userIssues.length,
    pending: userIssues.filter((i) => i.status === "pending").length,
    inProgress: userIssues.filter((i) => i.status === "in-progress").length,
    resolved: userIssues.filter((i) => i.status === "resolved").length,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-3">My Reports</h1>
          <p className="text-lg text-primary-foreground/90">
            Track the status of all your submitted issues
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Reports</p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-primary" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">In Progress</p>
                <p className="text-3xl font-bold text-blue-600">{stats.inProgress}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Resolved</p>
                <p className="text-3xl font-bold text-green-600">{stats.resolved}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </Card>
        </div>

        {/* Timeline / Activity */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex gap-4 items-start pb-4 border-b last:border-0">
              <div className="h-2 w-2 rounded-full bg-blue-600 mt-2" />
              <div className="flex-1">
                <p className="font-medium">Report updated to "In Progress"</p>
                <p className="text-sm text-muted-foreground">
                  Large Pothole on Main Street • 2 hours ago
                </p>
              </div>
              <Badge variant="outline" className="bg-blue-500/10 text-blue-700 border-blue-500/20">
                In Progress
              </Badge>
            </div>
            <div className="flex gap-4 items-start pb-4 border-b last:border-0">
              <div className="h-2 w-2 rounded-full bg-yellow-600 mt-2" />
              <div className="flex-1">
                <p className="font-medium">New report submitted</p>
                <p className="text-sm text-muted-foreground">
                  Streetlight Not Working • 1 day ago
                </p>
              </div>
              <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700 border-yellow-500/20">
                Pending
              </Badge>
            </div>
            <div className="flex gap-4 items-start pb-4 border-b last:border-0">
              <div className="h-2 w-2 rounded-full bg-green-600 mt-2" />
              <div className="flex-1">
                <p className="font-medium">Issue resolved</p>
                <p className="text-sm text-muted-foreground">
                  Broken Traffic Signal • 3 days ago
                </p>
              </div>
              <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-500/20">
                Resolved
              </Badge>
            </div>
          </div>
        </Card>

        {/* User Issues */}
        <div>
          <h2 className="text-2xl font-semibold mb-6">Your Reports</h2>
          {userIssues.length === 0 ? (
            <Card className="p-12 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No reports yet</h3>
              <p className="text-muted-foreground mb-6">
                Start by reporting your first civic issue
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userIssues.map((issue) => (
                <IssueCard key={issue.id} {...issue} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
