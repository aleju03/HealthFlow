import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Activity } from 'lucide-react';
import { motion } from 'framer-motion';

const DailyGoalsCard = ({ activities }) => {
  return (
    <Card className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-white/30 backdrop-blur-sm z-0" />
      <CardHeader className="relative z-10">
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-purple-600" />
          Meta Diaria
        </CardTitle>
      </CardHeader>
      <CardContent className="relative z-10 space-y-4">
        {activities.map(activity => (
          <div key={activity.name} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{activity.name}</span>
              <span style={{ color: activity.color }}>{activity.progress}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(activity.progress, 100)}%` }}
                transition={{ duration: 1 }}
                className="h-full rounded-full"
                style={{ 
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