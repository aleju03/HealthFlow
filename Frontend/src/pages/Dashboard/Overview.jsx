import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, XAxis, YAxis, Bar, BarChart } from 'recharts';
import { motion } from 'framer-motion';
import { Activity, Weight, Ruler, Droplet, Footprints, Dumbbell, Heart } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { AlertCircle } from 'lucide-react';

const MetricCard = ({ title, value, unit, icon: Icon, color, description, height }) => (
  <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
    <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-white/30 backdrop-blur-sm z-0" />
    <CardContent className="p-6 relative z-10">
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-xl bg-${color}-50 text-${color}-500`}>
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="font-medium text-gray-700">{title}</h3>
      </div>
      <div className="space-y-3">
        {value !== undefined && value !== null ? (
          <>
            <div className="flex items-baseline gap-2">
              <span className={`text-4xl font-bold text-${color}-500`}>
                {typeof value === 'number' ? value.toLocaleString() : value}
              </span>
              <span className="text-gray-500 text-sm">{unit}</span>
            </div>
            <p className="text-sm text-gray-500">{description}</p>
            {title === "Peso Actual" && height ? (
              <div className="pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-gray-500">Rango saludable</span>
                  <span className={`text-${color}-500 font-medium`}>
                    {Math.round(18.5 * Math.pow(height/100, 2))} - {Math.round(24.9 * Math.pow(height/100, 2))} kg
                  </span>
                </div>
              </div>
            ) : title === "Altura" && (
              <div className="pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-gray-500">En metros</span>
                  <span className={`text-${color}-500 font-medium`}>
                    {(value / 100).toFixed(2)} m
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-gray-500">En pies y pulgadas</span>
                  <span className={`text-${color}-500 font-medium`}>
                    {Math.floor(value / 30.48)}'{Math.round((value % 30.48) / 2.54)}"
                  </span>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="text-sm text-gray-400">Sin datos disponibles</div>
            <div className="text-xs text-gray-400">Importa datos para ver esta métrica</div>
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);

const WaterGlassChart = ({ consumed, total }) => {
  const fillPercentage = Math.min(Math.round((consumed / total) * 100), 100);
  const actualPercentage = Math.round((consumed / total) * 100);
  const glassesConsumed = Math.floor(consumed / 250);
  const glassesTotal = Math.ceil(total / 250);
  const isOverAchieved = consumed > total;

  // Maximum number of droplets to show
  const MAX_VISIBLE_DROPLETS = 8;
  
  return (
    <div className="relative h-[180px] flex items-center justify-center -mt-4">
      <div className="absolute inset-0 flex items-center justify-center mb-8">
        <div className="relative w-32 h-32">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <defs>
              <clipPath id="circleClip">
                <circle cx="50" cy="50" r="45" />
              </clipPath>
            </defs>

            {/* Container Circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="2"
            />

            {/* Water Fill - Now with success state */}
            <g clipPath="url(#circleClip)">
              <motion.rect
                x="0"
                y="0"
                width="100"
                height="100"
                fill={isOverAchieved ? "#22c55e" : "#3b82f6"}
                fillOpacity="0.35"
                initial={{ y: 100 }}
                animate={{ y: 100 - fillPercentage }}
                transition={{
                  duration: 1,
                  ease: "easeOut"
                }}
              />
            </g>

            {/* Central Text - Now shows over 100% */}
            <foreignObject x="0" y="0" width="100" height="100">
              <div className="h-full flex flex-col items-center justify-center">
                <span className={`text-2xl font-bold ${isOverAchieved ? "text-green-600" : "text-blue-600"}`}>
                  {actualPercentage}%
                </span>
                <span className="text-sm text-gray-500">
                  {(consumed / 1000).toFixed(1)}L
                </span>
              </div>
            </foreignObject>
          </svg>
        </div>
      </div>

      {/* Droplet Indicators - Now with condensed view */}
      <div className="absolute bottom-2 w-full px-4">
        <div className="flex justify-center items-center gap-2">
          {glassesConsumed > MAX_VISIBLE_DROPLETS ? (
            <>
              {/* Show first 4 droplets */}
              {Array.from({ length: 4 }).map((_, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Droplet 
                    className={`w-5 h-5 ${isOverAchieved ? 'text-green-500 fill-green-100' : 'text-blue-500 fill-blue-100'}`}
                  />
                </motion.div>
              ))}
              {/* Show count of remaining glasses */}
              <span className={`text-sm font-medium ${isOverAchieved ? 'text-green-600' : 'text-blue-600'}`}>
                +{glassesConsumed - 4}
              </span>
            </>
          ) : (
            // Show all droplets if less than or equal to MAX_VISIBLE_DROPLETS
            Array.from({ length: Math.max(glassesTotal, glassesConsumed) }).map((_, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Droplet 
                  className={`w-5 h-5 transition-colors ${
                    index < glassesConsumed
                      ? index >= glassesTotal 
                        ? 'text-green-500 fill-green-100'
                        : 'text-blue-500 fill-blue-100'
                      : 'text-gray-200'
                  }`}
                />
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const StepsChart = ({ current, goal }) => {
  const circlePercentage = Math.min((current / goal) * 100, 100);
  const isOverAchieved = current > goal;
  
  return (
    <div className="relative h-[180px] flex items-center justify-center">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="10"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={isOverAchieved ? "#22c55e" : "#4ade80"}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${circlePercentage * 2.83}, 283`}
            transform="rotate(-90 50 50)"
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className={`text-2xl font-bold ${isOverAchieved ? "text-green-600" : "text-green-500"}`}>
            {current.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
};

const BodyCompositionChart = ({ data }) => {
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

const IMCCard = ({ value }) => {
  const getIMCCategory = (imc) => {
    if (imc < 18.5) return { label: 'Delgadez', color: 'text-yellow-500' };
    if (imc < 25) return { label: 'Saludable', color: 'text-green-500' };
    if (imc < 30) return { label: 'Sobrepeso', color: 'text-orange-500' };
    return { label: 'Obesidad', color: 'text-red-500' };
  };

  const category = getIMCCategory(value);

  // Calcula la posición correcta en la barra (15-40 IMC)
  const position = ((value - 15) / (40 - 15)) * 100;

  return (
    <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
      <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-white/30 backdrop-blur-sm z-0" />
      <CardContent className="p-6 relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-pink-50 text-pink-500">
            <Heart className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-medium text-gray-700">IMC (Índice de Masa Corporal)</h3>
            <p className="text-xs text-gray-500">Relación entre tu peso y altura</p>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-pink-500">
              {value.toLocaleString()}
            </span>
            <span className="text-gray-500 text-sm">kg/m²</span>
          </div>
          <div className={`text-sm font-medium ${category.color}`}>
            Tu IMC indica: {category.label}
          </div>
          {/* IMC Range Visualization */}
          <div className="relative h-2 bg-gray-100 rounded-full mt-2">
            <div className="absolute inset-y-0 left-0 bg-yellow-500 w-[18.5%] rounded-l-full" />
            <div className="absolute inset-y-0 left-[18.5%] bg-green-500 w-[25%]" />
            <div className="absolute inset-y-0 left-[43.5%] bg-orange-500 w-[30%]" />
            <div className="absolute inset-y-0 left-[73.5%] bg-red-500 w-[26.5%] rounded-r-full" />
            <div 
              className="absolute w-2 h-4 bg-gray-800 rounded-full -top-1"
              style={{ left: `${position}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>15</span>
            <span>25</span>
            <span>35</span>
            <span>40</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const Overview = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await api.user.getCurrentStats(user.id);
        setStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-[200px] flex items-center justify-center"
          >
            <Activity className="h-8 w-8 animate-spin text-purple-600" />
          </motion.div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </motion.div>
        </div>
      </div>
    );
  }

  // Default goals if not set
  const goals = {
    water_goal: 2000, // ml
    steps_goal: 10000,
    exercise_goal: 60 // minutes
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
            Panel General
          </h1>
          <p className="text-gray-500 mt-1">
            Resumen de tus métricas de salud actuales
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <MetricCard
            title="Peso Actual"
            value={stats.weight}
            unit="kg"
            icon={Weight}
            color="purple"
            description="Tu peso corporal actual"
            height={stats.height}
          />
          <MetricCard
            title="Altura"
            value={stats.height}
            unit="cm"
            icon={Ruler}
            color="cyan"
            description="Tu altura actual"
          />
          <IMCCard value={stats.bmi} />

          {stats.body_composition && (
            <Card className="md:col-span-2 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-white/30 backdrop-blur-sm z-0" />
              <CardHeader className="relative z-10">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-purple-600" />
                  Composición Corporal
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <BodyCompositionChart data={stats.body_composition} />
              </CardContent>
            </Card>
          )}

          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-white/30 backdrop-blur-sm z-0" />
            <CardHeader className="relative z-10">
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-purple-600" />
                Meta Diaria
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10 space-y-4">
              {[
                { 
                  name: 'Agua', 
                  progress: Math.round((stats.water_consumed / goals.water_goal) * 100), 
                  color: '#38bdf8' 
                },
                { 
                  name: 'Pasos', 
                  progress: Math.round((stats.steps / goals.steps_goal) * 100), 
                  color: '#4ade80' 
                },
                { 
                  name: 'Ejercicio', 
                  progress: Math.round((stats.exercises?.reduce((acc, ex) => acc + ex.duration, 0) / goals.exercise_goal) * 100), 
                  color: '#8b5cf6' 
                }
              ].map(activity => (
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

          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-white/30 backdrop-blur-sm z-0" />
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-blue-50 text-blue-500">
                    <Droplet className="h-5 w-5" />
                  </div>
                  <h3 className="font-medium text-gray-700">Agua Consumida</h3>
                </div>
                <div className="text-sm text-gray-500">
                  {Math.floor(stats.water_consumed / 250) >= Math.ceil(goals.water_goal / 250)
                    ? `${Math.floor(stats.water_consumed / 250)} vasos`
                    : `${Math.floor(stats.water_consumed / 250)}/${Math.ceil(goals.water_goal / 250)} vasos`
                  }
                </div>
              </div>
              <WaterGlassChart consumed={stats.water_consumed} total={goals.water_goal} />
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-white/30 backdrop-blur-sm z-0" />
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-green-50 text-green-500">
                    <Footprints className="h-5 w-5" />
                  </div>
                  <h3 className="font-medium text-gray-700">Pasos</h3>
                </div>
                <div className="text-sm text-gray-500">
                  {stats.steps >= goals.steps_goal
                    ? stats.steps >= 1000 
                      ? `${Math.round(stats.steps/1000)}k pasos`
                      : `${stats.steps} pasos`
                    : stats.steps >= 1000
                      ? `${Math.round(stats.steps/1000)}k/${Math.round(goals.steps_goal/1000)}k pasos`
                      : `${stats.steps}/${Math.round(goals.steps_goal/1000)}k pasos`
                  }
                </div>
              </div>
              <StepsChart current={stats.steps} goal={goals.steps_goal} />
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-white/30 backdrop-blur-sm z-0" />
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-violet-50 text-violet-500">
                    <Dumbbell className="h-5 w-5" />
                  </div>
                  <h3 className="font-medium text-gray-700">Ejercicio</h3>
                </div>
                <div className="text-sm text-gray-500">
                  {stats.exercises?.reduce((acc, ex) => acc + ex.duration, 0) >= goals.exercise_goal
                    ? `${stats.exercises?.reduce((acc, ex) => acc + ex.duration, 0)} min`
                    : `${stats.exercises?.reduce((acc, ex) => acc + ex.duration, 0)}/${goals.exercise_goal} min`
                  }
                </div>
              </div>
              <ExerciseChart exercises={stats.exercises || []} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Overview;