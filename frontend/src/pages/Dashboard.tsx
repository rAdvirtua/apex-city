import { useState, useEffect } from "react";
import { IssueCard, IssueCategory, IssueStatus } from "@/components/IssueCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, Shield } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { categories } from "@/lib/categories";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface Issue {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  status: IssueStatus;
  location_address: string;
  created_at: string;
  image_url?: string;
  reporter_name?: string;
}

export default function Dashboard() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        // Call RPC with explicit named param to avoid overload ambiguity and log response for debugging
        const { data, error } = await supabase.rpc('get_issues_with_reporters', { p_admin_area: null as any });
        console.debug('get_issues_with_reporters response', { data, error });

        if (error) throw error;
        setIssues((data as Issue[]) || []);
      } catch (error) {
        console.error("Error fetching issues:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchIssues();
  }, []);

  const filteredIssues = issues.filter((issue) => {
    const searchString = searchQuery.toLowerCase();
    const matchesSearch =
      issue.title.toLowerCase().includes(searchString) ||
      issue.description.toLowerCase().includes(searchString) ||
      issue.location_address.toLowerCase().includes(searchString) ||
      (issue.reporter_name && issue.reporter_name.toLowerCase().includes(searchString));
    const matchesCategory =
      categoryFilter === "all" || issue.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || issue.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const stats = {
    total: issues.length,
    pending: issues.filter((i) => i.status === "pending").length,
    inProgress: issues.filter((i) => i.status === "in-progress").length,
    resolved: issues.filter((i) => i.status === "resolved").length,
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
      {/* Header */}
      <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold mb-3">Public Dashboard</h1>
              <p className="text-lg text-primary-foreground/90">
                Track all reported civic issues and their resolution status
              </p>
            </div>
            {isAdmin && (
              <Button
                onClick={() => navigate('/admin')}
                variant="secondary"
                className="flex items-center gap-2"
              >
                <Shield className="h-4 w-4" />
                Admin Panel
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total Issues</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600 mb-1">{stats.pending}</div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">{stats.inProgress}</div>
              <div className="text-sm text-muted-foreground">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-1">{stats.resolved}</div>
              <div className="text-sm text-muted-foreground">Resolved</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search issues by title, description, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>

              {(searchQuery || categoryFilter !== "all" || statusFilter !== "all") && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSearchQuery("");
                    setCategoryFilter("all");
                    setStatusFilter("all");
                  }}
                >
                  Clear
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Issues Grid */}
      <div className="container mx-auto px-4 py-8">
        {filteredIssues.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">No issues found matching your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIssues.map((issue) => (
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
                reporter={issue.reporter_name}
              />
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}