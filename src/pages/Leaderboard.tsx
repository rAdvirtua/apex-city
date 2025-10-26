import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trophy, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '@/components/BottomNav';

export default function Leaderboard() {
  const navigate = useNavigate();

  const topUsers = [
    { rank: 1, name: 'John Doe', reports: 45, resolved: 38 },
    { rank: 2, name: 'Jane Smith', reports: 38, resolved: 32 },
    { rank: 3, name: 'Mike Johnson', reports: 32, resolved: 28 },
  ];

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
          <h1 className="text-3xl font-bold">Leaderboard</h1>
          <p className="text-primary-foreground/90 mt-2">
            Top contributors to our community
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="space-y-4">
          {topUsers.map((user, index) => (
            <Card key={user.rank} className="p-6">
              <div className="flex items-center gap-4">
                <div
                  className={`h-12 w-12 rounded-full flex items-center justify-center ${
                    index === 0
                      ? 'bg-yellow-500/20'
                      : index === 1
                      ? 'bg-gray-400/20'
                      : 'bg-orange-500/20'
                  }`}
                >
                  {index === 0 ? (
                    <Trophy className="h-6 w-6 text-yellow-500" />
                  ) : (
                    <Award className="h-6 w-6" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">{user.name}</h3>
                    <span className="text-2xl font-bold text-muted-foreground">
                      #{user.rank}
                    </span>
                  </div>
                  <div className="flex gap-4 mt-1 text-sm text-muted-foreground">
                    <span>{user.reports} reports</span>
                    <span>•</span>
                    <span>{user.resolved} resolved</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
