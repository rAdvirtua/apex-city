import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Construction, Lightbulb, Car, Trees, Shield, FileText, HelpCircle } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { categories as baseCategories } from "@/lib/categories";

const categoryIcons = {
  "infrastructure": Construction,
  "public utilities": Lightbulb,
  "traffic/transport": Car,
  "environment & public spaces": Trees,
  "citizen & safety": Shield,
  "administrative & civic services": FileText,
  "others": HelpCircle,
};

const categories = baseCategories.map((c, i) => {
    const colors = [
        'bg-red-500/10 hover:bg-red-500/20 border-red-500/20',
        'bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/20',
        'bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/20',
        'bg-green-500/10 hover:bg-green-500/20 border-green-500/20',
        'bg-yellow-500/10 hover:bg-yellow-500/20 border-yellow-500/20',
        'bg-orange-500/10 hover:bg-orange-500/20 border-orange-500/20',
        'bg-gray-500/10 hover:bg-gray-500/20 border-gray-500/20',
    ];
    const descriptions = {
        "infrastructure": "Potholes, Broken Footpath, etc.",
        "public utilities": "Streetlights, Water, Garbage",
        "traffic/transport": "Traffic signals, Road signs",
        "environment & public spaces": "Parks, Pollution, Trees",
        "citizen & safety": "Safety concerns, Security",
        "administrative & civic services": "Documentation, Services",
        "others": "Other issues not listed",
    };
    return {
        id: c.value,
        name: c.label,
        icon: categoryIcons[c.value] || HelpCircle,
        description: descriptions[c.value] || '',
        color: colors[i % colors.length],
    }
});


export default function ReportManually() {
  const navigate = useNavigate();

  const handleCategorySelect = (categoryId: string) => {
    navigate(`/report-manual/${categoryId}`);
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
          <h1 className="text-3xl font-bold">Report Manually</h1>
          <p className="text-primary-foreground/90 mt-2">
            Select the category that best describes your issue
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Card
                key={category.id}
                className={`p-6 cursor-pointer transition-all hover:shadow-lg ${category.color}`}
                onClick={() => handleCategorySelect(category.id)}
              >
                <Icon className="h-12 w-12 mb-4" />
                <h3 className="font-semibold text-lg mb-2">{category.name}</h3>
                <p className="text-sm text-muted-foreground">{category.description}</p>
              </Card>
            );
          })}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}