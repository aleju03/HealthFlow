import { TrendingUp, TrendingDown } from 'lucide-react';

const MetricCard = ({ title, current, previous, unit, icon: Icon, color, metricId, total }) => {
  const change = Number(current) - Number(previous);
  const changePercent = Number(previous) !== 0 ? ((change / Number(previous)) * 100) : 0;
  
  const formatValue = (value) => {
    const numValue = Number(value);
    if (isNaN(numValue)) return '0';
    
    if (unit === 'pasos') return numValue.toLocaleString();
    if (unit === 'vasos') return Math.floor(numValue);
    if (unit === 'min') return Math.floor(numValue);
    
    // For weight and muscle (values with potential .0)
    if (unit === 'kg') {
      return Number(numValue.toFixed(1)).toString(); // removes .0 if present
    }
    
    return numValue.toFixed(1); // For other metrics like fat percentage
  };

  // For metrics that accumulate (steps, water, exercise)
  if (metricId === 'steps' || metricId === 'water' || metricId === 'exercise') {
    return (
      <div className="flex flex-col p-4 bg-white rounded-lg shadow-sm h-full">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Icon className={`h-5 w-5`} style={{ color }} />
            <span className="text-gray-600 font-medium">{title}</span>
          </div>
        </div>
        
        <div className="flex flex-col flex-1 justify-center">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold">{formatValue(current)}</span>
            <span className="text-sm text-gray-500">{unit}/día</span>
          </div>
          
          <div className="text-sm text-gray-500 mt-1">
            <span className="text-xs font-medium">
              Total del período: {formatValue(total)} {unit}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // For measurement metrics (weight, muscle, fat)
  const isZeroValue = Number(current) === 0 && Number(previous) === 0;

  return (
    <div className="flex flex-col p-4 bg-white rounded-lg shadow-sm h-full">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className={`h-5 w-5`} style={{ color }} />
          <span className="text-gray-600 font-medium">{title}</span>
        </div>
        {!isZeroValue && (
          <div className={`flex items-center gap-1 text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {change >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            <span>{changePercent.toFixed(1)}%</span>
          </div>
        )}
      </div>
      
      <div className="flex flex-col flex-1">
        {isZeroValue ? (
          <div className="flex items-center justify-center flex-1">
            <span className="text-gray-400 text-sm">Sin datos en este período</span>
          </div>
        ) : (
          <div className="flex flex-col justify-center flex-1">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold">{formatValue(current)}</span>
              <span className="text-sm text-gray-500">{unit}</span>
            </div>
            
            <div className="text-sm text-gray-500 mt-1">
              {change >= 0 ? 'Incremento' : 'Reducción'} de {formatValue(Math.abs(change))} {unit}
              <br />
              <span className="text-xs">
                Desde {formatValue(previous)} {unit}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricCard; 