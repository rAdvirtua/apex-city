import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import {
  MapPin,
  FileText,
  TrendingUp,
  Users,
  AlertCircle,
  Lightbulb,
  Target,
  Shield,
} from "lucide-react";
import BottomNav from "@/components/BottomNav";

export default function Home() {
  const features = [
    {
      icon: FileText,
      title: "Report Issues",
      description: "Easily report civic problems with photos and location details.",
    },
    {
      icon: TrendingUp,
      title: "Track Progress",
      description: "Monitor the status of your reports and see real-time updates.",
    },
    {
      icon: Users,
      title: "Community Driven",
      description: "Join thousands of citizens making their city better.",
    },
    {
      icon: Shield,
      title: "Transparent Process",
      description: "View all reported issues and their resolution status publicly.",
    },
  ];

  const categories = [
    { name: "Infrastructure", count: 45, icon: Target },
    { name: "Public Utilities", count: 32, icon: Lightbulb },
    { name: "Traffic & Transport", count: 28, icon: MapPin },
    { name: "Environment", count: 21, icon: AlertCircle },
    { name: "Citizen Safety", count: 18, icon: Shield },
    { name: "Administrative", count: 15, icon: FileText },
  ];

  return (
    <div className="flex flex-col">
      <main className="flex-grow pb-20">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground">
          <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:32px_32px]" />
          <div className="container relative mx-auto px-4 py-24 md:py-32">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-accent/20 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
                <MapPin className="h-4 w-4" />
                Making Cities Better, Together
              </div>
              <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl">
                Report. Track. Improve.
              </h1>
              <p className="mb-8 text-lg text-primary-foreground/90 md:text-xl">
                Help make your city better by reporting civic issues. Track progress, see
                resolutions, and be part of the change.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/report">
                  <Button size="lg" variant="accent" className="w-full sm:w-auto text-base">
                    Report an Issue
                  </Button>
                </Link>
                <Link to="/dashboard">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto bg-white/10 text-white border-white/20 hover:bg-white/20 text-base"
                  >
                    View Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="border-b bg-muted/30 py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">1,247</div>
                <div className="text-sm text-muted-foreground">Total Reports</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-accent mb-2">892</div>
                <div className="text-sm text-muted-foreground">Resolved Issues</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">234</div>
                <div className="text-sm text-muted-foreground">In Progress</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-yellow-600 mb-2">121</div>
                <div className="text-sm text-muted-foreground">Pending Review</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                A simple, transparent process to help improve your community
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                    <feature.icon className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="mb-2 font-semibold text-lg">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Issue Categories</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Report issues across various civic categories
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((category, index) => (
                <Card
                  key={index}
                  className="p-6 text-center hover:shadow-lg transition-all cursor-pointer hover:scale-105"
                >
                  <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <category.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="mb-1 font-semibold text-sm">{category.name}</h3>
                  <p className="text-2xl font-bold text-accent">{category.count}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Make a Difference?
              </h2>
              <p className="text-lg mb-8 text-primary-foreground/90 max-w-2xl mx-auto">
                Join our community of active citizens working together to improve our city.
                Every report counts!
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/report">
                  <Button size="lg" variant="accent" className="w-full sm:w-auto">
                    Report Your First Issue
                  </Button>
                </Link>
                <Link to="/track">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto bg-white/10 text-white border-white/20 hover:bg-white/20"
                  >
                    Track Your Issues
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </section>
      </main>
      <BottomNav />
    </div>
  );
}
