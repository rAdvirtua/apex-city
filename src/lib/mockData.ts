import { IssueCategory, IssueStatus } from "@/components/IssueCard";

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  status: IssueStatus;
  location: string;
  date: string;
  reporter: string;
  image?: string;
}

export const mockIssues: Issue[] = [
  {
    id: "1",
    title: "Large Pothole on Main Street",
    description: "Deep pothole causing vehicle damage near intersection. Approximately 2 feet wide and 8 inches deep.",
    category: "infrastructure",
    status: "in-progress",
    location: "Main Street & 5th Avenue",
    date: "2025-01-15",
    reporter: "John Doe",
    image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&q=80",
  },
  {
    id: "2",
    title: "Streetlight Not Working",
    description: "Streetlight has been out for 3 days, creating safety concerns for pedestrians at night.",
    category: "public utilities",
    status: "pending",
    location: "Oak Avenue near Park",
    date: "2025-01-18",
    reporter: "Sarah Smith",
  },
  {
    id: "3",
    title: "Illegal Dumping of Waste",
    description: "Construction debris and household waste illegally dumped in vacant lot.",
    category: "environment & public spaces",
    status: "pending",
    location: "Elm Street Vacant Lot",
    date: "2025-01-20",
    reporter: "Mike Johnson",
    image: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&q=80",
  },
  {
    id: "4",
    title: "Broken Traffic Signal",
    description: "Traffic signal stuck on red, causing traffic congestion during peak hours.",
    category: "traffic/transport",
    status: "resolved",
    location: "Highway 101 & Broadway",
    date: "2025-01-10",
    reporter: "Emily Chen",
  },
  {
    id: "5",
    title: "Overflowing Garbage Bins",
    description: "Public garbage bins overflowing for over a week, attracting pests.",
    category: "public utilities",
    status: "in-progress",
    location: "Central Park East Entrance",
    date: "2025-01-17",
    reporter: "David Wilson",
    image: "https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=800&q=80",
  },
  {
    id: "6",
    title: "Damaged Public Property",
    description: "Playground equipment damaged and unsafe for children to use.",
    category: "infrastructure",
    status: "pending",
    location: "Riverside Park Playground",
    date: "2025-01-19",
    reporter: "Lisa Anderson",
  },
  {
    id: "7",
    title: "Water Main Leak",
    description: "Significant water leak causing flooding on sidewalk and street.",
    category: "public utilities",
    status: "in-progress",
    location: "Pine Street between 2nd & 3rd",
    date: "2025-01-21",
    reporter: "Robert Taylor",
    image: "https://images.unsplash.com/photo-1584438349608-d9e4a7dab1e2?w=800&q=80",
  },
  {
    id: "8",
    title: "Blocked Storm Drain",
    description: "Storm drain completely blocked with debris, causing street flooding during rain.",
    category: "infrastructure",
    status: "resolved",
    location: "Maple Avenue near School",
    date: "2025-01-08",
    reporter: "Jessica Lee",
  },
];