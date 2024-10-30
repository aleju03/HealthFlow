import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { 
  LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ComposedChart, Legend
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, Calendar, AlertCircle,
  TrendingUp, TrendingDown, 
  LineChart as LineChartIcon, 
  Layout,
  Weight,
  Dumbbell,
  Percent,
  Droplet,
  Footprints,
  Timer
} from 'lucide-react';

const NoDataMessage = () => (
  <div className="h-full w-full flex items-center justify-center">
    <p className="text-gray-500 text-sm">No hay datos para mostrar en este período</p>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  
  return (
    <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
      <p className="text-gray-600 font-medium mb-2">{label}</p>
      {payload.map((entry, index) => {
        let value = entry.value;
        let unit = '';

        if (entry.name === 'Vasos') {
          value = Math.floor(Number(value));
          unit = 'vasos';
        } else if (entry.name === 'Litros') {
          value = Number(value).toFixed(2);
          unit = 'L';
        } else if (entry.name === 'Agua') {
          value = (Number(value) * 0.25).toFixed(2);
          unit = 'L';
        } else if (entry.name === 'Pasos') {
          value = Math.floor(Number(value)).toLocaleString();
          unit = 'pasos';
        } else if (entry.name === 'Ejercicios') {
          value = Math.floor(Number(value));
          unit = 'min';
        } else {
          value = Number(value).toFixed(1);
          unit = entry.unit || '';
        }
        
        return (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {value} {unit}
          </p>
        );
      })}
    </div>
  );
};

const MetricCard = ({ title, current, previous, unit, icon: Icon, color, metricId, total }) => {
  const change = Number(current) - Number(previous);
  const changePercent = Number(previous) !== 0 ? ((change / Number(previous)) * 100) : 0;
  
  const formatValue = (value) => {
    const numValue = Number(value);
    if (isNaN(numValue)) return '0';
    
    if (unit === 'pasos') return numValue.toLocaleString();
    if (unit === 'vasos') return numValue.toLocaleString();
    if (unit === 'min') return Math.floor(numValue);
    return numValue.toFixed(1);
  };

  // Para métricas acumulativas
  if (metricId === 'steps' || metricId === 'water' || metricId === 'exercise') {
    return (
      <div className="flex flex-col p-4 bg-white rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Icon className={`h-5 w-5`} style={{ color }} />
            <span className="text-gray-600 font-medium">{title}</span>
          </div>
        </div>
        
        <div className="flex flex-col">
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

  // Para métricas de medición
  return (
    <div className="flex flex-col p-4 bg-white rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className={`h-5 w-5`} style={{ color }} />
          <span className="text-gray-600 font-medium">{title}</span>
        </div>
        <div className={`flex items-center gap-1 text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {change >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
          <span>{changePercent.toFixed(1)}%</span>
        </div>
      </div>
      
      <div className="flex flex-col">
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
    </div>
  );
};

const Historical = () => {
  const { user } = useAuth();
  
  const metrics = [
    { id: 'weight', title: 'Peso', color: '#6366f1', unit: 'kg', icon: Weight },
    { id: 'muscle', title: 'Músculo', color: '#06b6d4', unit: 'kg', icon: Dumbbell },
    { id: 'fat_percentage', title: 'Grasa', color: '#f43f5e', unit: '%', icon: Percent },
    { id: 'water', title: 'Agua', color: '#3b82f6', unit: 'vasos', icon: Droplet },
    { id: 'steps', title: 'Pasos', color: '#10b981', unit: 'pasos', icon: Footprints },
    { id: 'exercise', title: 'Ejercicios', color: '#8b5cf6', unit: 'min', icon: Timer }
  ];

  const [selectedPeriod, setSelectedPeriod] = useState('1m');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({});
  const [view, setView] = useState('overview');
  const [selectedMetrics, setSelectedMetrics] = useState([]);
  const [loadedMetrics, setLoadedMetrics] = useState(new Set());

  const periods = [
    { value: '1w', label: '1 Semana' },
    { value: '1m', label: '1 Mes' },
    { value: '3m', label: '3 Meses' },
    { value: '6m', label: '6 Meses' },
    { value: '1y', label: '1 Año' }
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const metricsToFetch = view === 'overview' 
          ? metrics // En vista general, cargar todo
          : metrics.filter(m => // En vista detallada, solo las métricas seleccionadas o todas si no hay selección
              selectedMetrics.length === 0 || selectedMetrics.includes(m.id)
            );
        
        const results = {};
        const promises = metricsToFetch
          // Solo hacer fetch de métricas que no estén ya cargadas para el período actual
          .filter(metric => !loadedMetrics.has(`${metric.id}-${selectedPeriod}`))
          .map(metric => 
            api.user.getHistory(user.id, metric.id, selectedPeriod)
              .then(result => {
                results[metric.id] = result;
                // Marcar esta métrica como cargada para este período
                setLoadedMetrics(prev => new Set([...prev, `${metric.id}-${selectedPeriod}`]));
              })
          );
        
        await Promise.all(promises);
        
        // Formatear los nuevos datos
        const formattedResults = {};
        Object.entries(results).forEach(([metricId, data]) => {
          const formatDate = (dateStr) => {
            const date = new Date(dateStr);
            return date.toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'numeric',
              year: '2-digit'
            });
          };

          if (metricId === 'water') {
            formattedResults[metricId] = data.map(item => ({
              date: formatDate(item.date),
              value: item.total || 0,
              liters: ((item.total || 0) * 0.25).toFixed(2)
            }));
          } else if (metricId === 'exercise') {
            formattedResults[metricId] = data.map(item => ({
              date: formatDate(item.date),
              value: item.duration || 0
            }));
          } else if (metricId === 'steps') {
            formattedResults[metricId] = data.map(item => ({
              date: formatDate(item.date),
              value: item.total || 0
            }));
          } else {
            formattedResults[metricId] = data.map(item => ({
              date: formatDate(item.date),
              value: item.value || 0
            }));
          }
        });

        // Actualizar el estado combinando los datos existentes con los nuevos
        setData(prev => ({
          ...prev,
          ...formattedResults
        }));
      } catch (err) {
        setError('Error al cargar los datos históricos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user.id, selectedPeriod, view, selectedMetrics]);

  // Limpiar datos cargados cuando cambia el período
  useEffect(() => {
    setLoadedMetrics(new Set());
  }, [selectedPeriod]);

  const getMetricStats = (metricData, metricId) => {
    if (!metricData || metricData.length === 0) return { current: 0, previous: 0 };

    // Para métricas acumulativas (pasos, agua, ejercicio)
    if (metricId === 'steps' || metricId === 'water' || metricId === 'exercise') {
      const totalValue = metricData.reduce((sum, item) => sum + item.value, 0);
      const daysInPeriod = metricData.length;
      const dailyAverage = daysInPeriod > 0 ? Math.round(totalValue / daysInPeriod) : 0;
      
      return {
        current: dailyAverage,
        previous: dailyAverage,
        total: totalValue
      };
    }
    
    // Para métricas de medición (peso, músculo, grasa)
    const current = metricData[metricData.length - 1]?.value || 0;
    const previous = metricData[0]?.value || 0;
    return { current, previous };
  };

  const renderOverview = () => {
    const combinedData = data.weight?.map((item, index) => ({
      date: item.date,
      "Peso": item.value,
      "Músculo": data.muscle?.[index]?.value
    })) || [];

    // Preparar datos para el gráfico de composición corporal
    const bodyCompositionData = data.muscle?.map((item, index) => {
      const muscleValue = item.value || 0;
      const fatValue = data.fat_percentage?.[index]?.value || 0;

      return {
        date: item.date,
        "Músculo": muscleValue,
        "Grasa": fatValue
      };
    }) || [];

    // Preparar datos para el gráfico de ejercicios
    const exerciseData = data.exercise?.reduce((acc, item) => {
      const date = item.date.split('/')[1] + '/' + item.date.split('/')[2]; // Mes/Año
      const existingEntry = acc.find(entry => entry.date === date);
      
      if (existingEntry) {
        existingEntry.total += item.value;
      } else {
        acc.push({
          date,
          total: item.value
        });
      }
      return acc;
    }, []) || [];

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Composite Chart - Weight & Muscle */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Peso y Músculo</span>
              <Legend />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              {combinedData.length === 0 ? (
                <NoDataMessage />
              ) : (
                <ResponsiveContainer>
                  <ComposedChart data={combinedData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="date"
                      tick={{ fill: '#6b7280' }}
                      tickLine={{ stroke: '#6b7280' }}
                    />
                    <YAxis 
                      yAxisId="left"
                      label={{ 
                        value: 'Peso (kg)', 
                        angle: -90, 
                        position: 'insideLeft',
                        style: { fill: '#6366f1' }
                      }}
                      tick={{ fill: '#6b7280' }}
                      tickLine={{ stroke: '#6b7280' }}
                    />
                    <YAxis 
                      yAxisId="right" 
                      orientation="right"
                      label={{ 
                        value: 'Músculo (kg)', 
                        angle: 90, 
                        position: 'insideRight',
                        style: { fill: '#06b6d4' }
                      }}
                      tick={{ fill: '#6b7280' }}
                      tickLine={{ stroke: '#6b7280' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="Peso"
                      fill="#6366f1"
                      stroke="#6366f1"
                      fillOpacity={0.1}
                      dot={false}
                      activeDot={{ fill: '#6366f1', stroke: '#6366f1', r: 4 }}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="Músculo"
                      stroke="#06b6d4"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ fill: '#06b6d4', stroke: '#06b6d4', r: 4 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Progress Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:col-span-2">
          {metrics.map(metric => {
            const stats = getMetricStats(data[metric.id], metric.id);
            return (
              <MetricCard
                key={metric.id}
                title={metric.title}
                current={stats.current}
                previous={stats.previous}
                total={stats.total}
                unit={metric.unit}
                icon={metric.icon}
                color={metric.color}
                metricId={metric.id}
              />
            );
          })}
        </div>

        {/* Body Composition Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Composición Corporal (%)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {bodyCompositionData.length === 0 ? (
                <NoDataMessage />
              ) : (
                <ResponsiveContainer>
                  <AreaChart data={bodyCompositionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" />
                    <YAxis 
                      tickFormatter={value => `${Math.round(value)}%`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="Músculo"
                      stackId="1"
                      stroke="#06b6d4"
                      fill="#06b6d4"
                      fillOpacity={0.6}
                    />
                    <Area
                      type="monotone"
                      dataKey="Grasa"
                      stackId="1"
                      stroke="#f43f5e"
                      fill="#f43f5e"
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Exercise Summary Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Tiempo de Ejercicio por Período</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {exerciseData.length === 0 ? (
                <NoDataMessage />
              ) : (
                <ResponsiveContainer>
                  <AreaChart data={exerciseData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" />
                    <YAxis 
                      label={{ 
                        value: 'Minutos totales', 
                        angle: -90, 
                        position: 'insideLeft',
                        style: { fill: '#8b5cf6' }
                      }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="total"
                      name="Ejercicios"
                      stroke="#8b5cf6"
                      fill="#8b5cf6"
                      fillOpacity={0.2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderDetailedMetric = (metric) => {
    if (metric.id === 'water') {
      return (
        <Card key={metric.id}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <metric.icon className="h-5 w-5" style={{ color: metric.color }} />
                <span>{metric.title}</span>
              </div>
              <div className="text-sm font-normal text-gray-500">
                {data[metric.id]?.length ? (
                  <>
                    Último registro: {Math.floor(data[metric.id][data[metric.id].length - 1].value)} vasos 
                    ({(data[metric.id][data[metric.id].length - 1].value * 0.25).toFixed(2)}L)
                  </>
                ) : (
                  'No hay datos para mostrar'
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {!data[metric.id]?.length ? (
                <NoDataMessage />
              ) : (
                <ResponsiveContainer>
                  <LineChart data={data[metric.id].map(item => ({
                    date: item.date,
                    "Vasos": Math.floor(item.value),
                    "Litros": item.value * 0.25
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" />
                    <YAxis 
                      yAxisId="left"
                      label={{ 
                        value: 'Vasos', 
                        angle: -90, 
                        position: 'insideLeft',
                        style: { fill: metric.color }
                      }}
                      tickFormatter={value => Math.floor(value)}
                    />
                    <YAxis 
                      yAxisId="right"
                      orientation="right"
                      label={{ 
                        value: 'Litros', 
                        angle: 90, 
                        position: 'insideRight',
                        style: { fill: '#60a5fa' }
                      }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="Vasos"
                      stroke={metric.color}
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ fill: metric.color, stroke: metric.color, r: 4 }}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="Litros"
                      stroke="#60a5fa"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ fill: '#60a5fa', stroke: '#60a5fa', r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      );
    }

    // Para ejercicios, usamos AreaChart
    if (metric.id === 'exercise') {
      return (
        <Card key={metric.id}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <metric.icon className="h-5 w-5" style={{ color: metric.color }} />
                <span>{metric.title}</span>
              </div>
              <div className="text-sm font-normal text-gray-500">
                {data[metric.id]?.length ? 
                  `Último valor: ${data[metric.id][data[metric.id].length - 1].value.toLocaleString()} ${metric.unit}` :
                  'No hay datos para mostrar'
                }
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {!data[metric.id]?.length ? (
                <NoDataMessage />
              ) : (
                <ResponsiveContainer>
                  <AreaChart data={data[metric.id]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" />
                    <YAxis 
                      label={{ 
                        value: `${metric.title} (${metric.unit})`, 
                        angle: -90, 
                        position: 'insideLeft',
                        style: { fill: metric.color }
                      }}
                      tickFormatter={value => Math.floor(value)}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke={metric.color}
                      fill={metric.color}
                      fillOpacity={0.2}
                      name={metric.title}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      );
    }

    // Para el resto de métricas, mantenemos el LineChart
    return (
      <Card key={metric.id}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <metric.icon className="h-5 w-5" style={{ color: metric.color }} />
              <span>{metric.title}</span>
            </div>
            <div className="text-sm font-normal text-gray-500">
              {data[metric.id]?.length ? 
                `Último valor: ${data[metric.id][data[metric.id].length - 1].value.toLocaleString()} ${metric.unit}` :
                'No hay datos para mostrar'
              }
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            {!data[metric.id]?.length ? (
              <NoDataMessage />
            ) : (
              <ResponsiveContainer>
                <LineChart data={data[metric.id]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" />
                  <YAxis 
                    label={metric.id !== 'steps' ? { 
                      value: `${metric.title} (${metric.unit})`, 
                      angle: -90, 
                      position: 'insideLeft',
                      style: { fill: metric.color }
                    } : undefined}
                    tickFormatter={value => 
                      metric.id === 'steps' ? value.toLocaleString() : value.toFixed(1)
                    }
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={metric.color}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ fill: metric.color, stroke: metric.color, r: 4 }}
                    name={metric.title}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderDetailed = () => {
    const metricsToShow = selectedMetrics.length === 0 
      ? metrics 
      : metrics.filter(metric => selectedMetrics.includes(metric.id));

    return (
      <div className="space-y-6">
        <div className="flex flex-wrap gap-4 items-center text-sm">
          <span className="text-gray-500 font-medium">Filtrar:</span>
          {metrics.map(metric => (
            <label
              key={metric.id}
              className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded-md transition-colors"
            >
              <input
                type="checkbox"
                checked={selectedMetrics.includes(metric.id)}
                onChange={() => {
                  setSelectedMetrics(prev => 
                    prev.includes(metric.id)
                      ? prev.filter(id => id !== metric.id)
                      : [...prev, metric.id]
                  );
                }}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <div className="flex items-center gap-2">
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: metric.color }}
                />
                {metric.title}
              </div>
            </label>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6">
          {metricsToShow.map(metric => renderDetailedMetric(metric))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
              Histórico de Datos
            </h1>
            <p className="text-gray-500 mt-1">
              Analiza tu progreso desde múltiples perspectivas
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-[180px]">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-purple-500" />
                  <SelectValue placeholder="Selecciona un período" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {periods.map(period => (
                  <SelectItem key={period.value} value={period.value}>
                    {period.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* View Selector */}
        <div className="w-full">
          <div className="flex gap-2 border-b">
            <Button
              variant={view === 'overview' ? 'default' : 'ghost'}
              onClick={() => setView('overview')}
              className="flex items-center gap-2"
            >
              <Layout className="h-4 w-4" />
              Vista General
            </Button>
            <Button
              variant={view === 'detailed' ? 'default' : 'ghost'}
              onClick={() => setView('detailed')}
              className="flex items-center gap-2"
            >
              <LineChartIcon className="h-4 w-4" />
              Detallado
            </Button>
          </div>

          <div className="mt-6">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-[200px] flex items-center justify-center"
                >
                  <Activity className="h-8 w-8 animate-spin text-purple-600" />
                </motion.div>
              ) : error ? (
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
              ) : (
                <motion.div
                  key={view}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {view === 'overview' && renderOverview()}
                  {view === 'detailed' && renderDetailed()}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Historical;