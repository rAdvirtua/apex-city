import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MapPin, Calendar, User, Trash2, Edit } from "lucide-react";
import { cn } from "@/lib/utils";
import { categories } from "@/lib/categories";
import { Button } from "./ui/button";

export type IssueStatus = "pending" | "in-progress" | "resolved";

const categoryValues = categories.map(c => c.value);
export type IssueCategory = typeof categoryValues[number];

interface IssueCardProps {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  status: IssueStatus;
  location: string;
  date: string;
  reporter?: string;
  image?: string;
  onDelete?: () => void;
  onUpdate?: () => void;
}

const statusConfig = {
  pending: { label: "Pending", className: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20" },
  "in-progress": { label: "In Progress", className: "bg-blue-500/10 text-blue-700 border-blue-500/20" },
  resolved: { label: "Resolved", className: "bg-green-500/10 text-green-700 border-green-500/20" },
} as const;

// Fallback configuration for unknown statuses
const getStatusConfig = (status: string) => {
  const config = statusConfig[status as keyof typeof statusConfig];
  if (!config) {
    console.warn(`Unknown status: "${status}". Available statuses:`, Object.keys(statusConfig));
  }
  return config || {
    label: status || "Unknown",
    className: "bg-gray-500/10 text-gray-700 border-gray-500/20"
  };
};

const categoryConfig = Object.fromEntries(
  categories.map(c => [c.value, { label: c.label, color: "bg-gray-500/10 text-gray-700" }])
) as Record<IssueCategory, { label: string; color: string; }>;

// Manually assigning colors to each category for better visualization
const colors = [
  "bg-purple-500/10 text-purple-700",
  "bg-orange-500/10 text-orange-700",
  "bg-blue-500/10 text-blue-700",
  "bg-green-500/10 text-green-700",
  "bg-red-500/10 text-red-700",
  "bg-pink-500/10 text-pink-700",
  "bg-indigo-500/10 text-indigo-700",
];

categories.forEach((c, i) => {
  if (categoryConfig[c.value]) {
    categoryConfig[c.value].color = colors[i % colors.length];
  }
});


export const IssueCard = ({
  title,
  description,
  category,
  status,
  location,
  date,
  reporter,
  image,
  onDelete,
  onUpdate,
}: IssueCardProps) => {
  return (
    <Card 
      className={cn(
        "overflow-hidden transition-all",
        onUpdate && "hover:shadow-lg cursor-pointer hover:scale-[1.02]"
      )}
      onClick={onUpdate}
    >
      {image && (
        <div className="aspect-video w-full overflow-hidden bg-muted">
          <img 
            src={image} 
            alt={title} 
            className="h-full w-full object-cover"
          />
        </div>
      )}
      
      <div className="p-6">
        <div className="flex items-start justify-between gap-4 mb-3">
          <h3 className="font-semibold text-lg line-clamp-1">{title}</h3>
          <Badge variant="outline" className={getStatusConfig(status).className}>
            {getStatusConfig(status).label}
          </Badge>
        </div>

        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {description}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="secondary" className={categoryConfig[category]?.color || "bg-gray-500/10 text-gray-700"}>
            {categoryConfig[category]?.label || category}
          </Badge>
        </div>

        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span className="line-clamp-1">{location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{date}</span>
          </div>
          {reporter && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{reporter}</span>
            </div>
          )}
        </div>

        {(onDelete || onUpdate) && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t">
            {onUpdate && (
              <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); onUpdate(); }}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
            {onDelete && (
              <Button variant="destructive" size="sm" onClick={(e) => { e.stopPropagation(); onDelete(); }}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};
