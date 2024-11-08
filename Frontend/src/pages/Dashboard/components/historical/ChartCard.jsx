import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { ResponsiveContainer } from 'recharts';

const ChartCard = ({ 
  title, 
  icon: Icon, 
  iconColor, 
  data, 
  children,
  headerExtra,
  className
}) => {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5" style={{ color: iconColor }} />
            <span>{title}</span>
          </div>
          {headerExtra}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {!data?.length ? (
            <div className="h-full w-full flex items-center justify-center">
              <p className="text-gray-500 text-sm">No hay datos para mostrar en este período</p>
            </div>
          ) : (
            <ResponsiveContainer>
              {children}
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ChartCard; 