import { ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip, Bar } from 'recharts';
import { Dumbbell } from 'lucide-react';

const ExerciseChart = ({ exercises }) => {
  if (!exercises || exercises.length === 0) {
    return (
      <div className="relative h-[180px] flex items-center justify-center">
        <div className="text-center space-y-2">
          <Dumbbell className="h-8 w-8 text-gray-300 mx-auto" />
          <p className="text-sm text-gray-400">No hay ejercicios registrados hoy</p>
          <p className="text-xs text-gray-400">Registra tu actividad física para ver estadísticas</p>
        </div>
      </div>
    );
  }

  const exerciseData = exercises.map(exercise => ({
    name: exercise.name,
    duration: exercise.duration
  }));

  return (
    <div className="relative h-[180px] flex items-center justify-center">
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={exerciseData}>
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis hide />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-white p-2 rounded-lg shadow-lg border text-sm">
                    <p className="font-medium text-gray-700">{payload[0].payload.name}</p>
                    <p style={{ color: payload[0].color }}>
                      {payload[0].value} min
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar 
            dataKey="duration"
            fill="#8b5cf6"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ExerciseChart;