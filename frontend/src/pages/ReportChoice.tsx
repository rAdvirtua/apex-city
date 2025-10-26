import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Edit, ArrowLeft } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

export default function ReportChoice() {
  const navigate = useNavigate();

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
          <h1 className="text-3xl font-bold">Report an Issue</h1>
          <p className="text-primary-foreground/90 mt-2">
            Choose how you want to report
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <Card
            className="p-8 cursor-pointer hover:shadow-lg transition-all hover:scale-105 border-2 hover:border-primary"
            onClick={() => navigate('/report-ai')}
          >
            <Brain className="h-16 w-16 mb-4 text-primary" />
            <h2 className="text-2xl font-semibold mb-3">Report with AI</h2>
            <p className="text-muted-foreground mb-4">
              Take a photo and let our AI classify and describe the issue automatically
            </p>
            <ul className="text-sm space-y-2 text-muted-foreground">
              <li>✓ Quick and easy</li>
              <li>✓ Automatic classification</li>
              <li>✓ AI-generated description</li>
            </ul>
          </Card>

          <Card
            className="p-8 cursor-pointer hover:shadow-lg transition-all hover:scale-105 border-2 hover:border-primary"
            onClick={() => navigate('/report-manual')}
          >
            <Edit className="h-16 w-16 mb-4 text-accent" />
            <h2 className="text-2xl font-semibold mb-3">Report Manually</h2>
            <p className="text-muted-foreground mb-4">
              Choose from categorized options and provide your own details
            </p>
            <ul className="text-sm space-y-2 text-muted-foreground">
              <li>✓ Full control</li>
              <li>✓ Categorized options</li>
              <li>✓ Custom descriptions</li>
            </ul>
          </Card>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
