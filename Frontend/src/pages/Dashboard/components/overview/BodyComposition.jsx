import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Activity } from 'lucide-react';

const BodyCompositionChart = ({ data }) => {
  const hasValidData = data && typeof data.muscle === 'number' && 
                      typeof data.fat === 'number' && 
                      typeof data.water === 'number';

  if (!hasValidData) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <div className="text-center space-y-2">
          <Activity className="h-8 w-8 text-gray-300 mx-auto" />
          <p className="text-sm text-gray-400">No hay datos de composición corporal</p>
          <p className="text-xs text-gray-400">Importa datos para ver la distribución</p>
        </div>
      </div>
    );
  }

  const chartData = [
    { name: 'Músculo', value: data.muscle, color: '#818cf8' },
    { name: 'Grasa', value: data.fat, color: '#fb7185' },
    { name: 'Agua', value: data.water, color: '#38bdf8' }
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          outerRadius={100}
          dataKey="value"
          label={({ name, value }) => `${name}: ${value}%`}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <div className="bg-white p-2 rounded-lg shadow-lg border text-sm">
                  <p className="font-medium text-gray-700">{payload[0].name}</p>
                  <p style={{ color: payload[0].payload.color }} className="font-semibold">
                    {payload[0].value}%
                  </p>
                </div>
              );
            }
            return null;
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default BodyCompositionChart;