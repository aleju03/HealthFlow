import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Activity } from 'lucide-react';

const DailyGoalsCard = ({ activities }) => {
  return (
    <Card className="relative overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-purple-600" />
          Meta Diaria
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map(activity => (
          <div key={activity.name} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{activity.name}</span>
              <span style={{ color: activity.color }}>{activity.progress}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ 
                  width: `${Math.min(activity.progress, 100)}%`,
                  backgroundColor: activity.progress > 100 ? '#22c55e' : activity.color
                }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default DailyGoalsCard;