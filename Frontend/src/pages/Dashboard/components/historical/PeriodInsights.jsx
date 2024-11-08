import { BarChart2, Info } from 'lucide-react';

const PeriodInsights = ({ data, metrics }) => {
  const generateInsights = () => {
    const insights = [];
    
    metrics.forEach(metric => {
      const metricData = data[metric.id];
      if (!metricData?.length) return;

      if (metric.id === 'steps' || metric.id === 'water' || metric.id === 'exercise') {
        // Find best day
        const bestDay = [...metricData].sort((a, b) => b.value - a.value)[0];
        insights.push({
          type: 'achievement',
          icon: metric.icon,
          color: metric.color,
          title: `Mejor día en ${metric.title.toLowerCase()}`,
          description: `${bestDay.value.toLocaleString()} ${metric.unit} el ${bestDay.date}`
        });
      } else {
        // Calculate progress
        const start = metricData[0]?.value;
        const end = metricData[metricData.length - 1]?.value;
        const change = end - start;
        
        if (change !== 0) {
          insights.push({
            type: 'progress',
            icon: metric.icon,
            color: metric.color,
            title: `Progreso en ${metric.title.toLowerCase()}`,
            description: `${change > 0 ? 'Aumentó' : 'Disminuyó'} ${Math.abs(change).toFixed(1)} ${metric.unit}`
          });
        }
      }
    });

    return insights;
  };

  const insights = generateInsights();

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center gap-2">
        <BarChart2 className="h-5 w-5 text-purple-500" />
        Resumen del Período
      </h3>
      
      {insights.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {insights.map((insight, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-4 rounded-lg bg-gray-50"
            >
              <div className="rounded-full p-2" style={{ backgroundColor: `${insight.color}20` }}>
                <insight.icon className="h-5 w-5" style={{ color: insight.color }} />
              </div>
              <div>
                <h4 className="font-medium text-gray-700">{insight.title}</h4>
                <p className="text-sm text-gray-600">{insight.description}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 px-4 text-center bg-gray-50 rounded-lg">
          <Info className="h-12 w-12 text-gray-400 mb-3" />
          <h4 className="text-gray-600 font-medium mb-2">No hay datos suficientes</h4>
          <p className="text-gray-500 text-sm max-w-md">
            Registra tus métricas diarias para ver insights sobre tu progreso en este período
          </p>
        </div>
      )}
    </div>
  );
};

export default PeriodInsights; 