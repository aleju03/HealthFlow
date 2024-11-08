import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { Button } from '../../components/ui/button';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { 
  LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, Calendar, AlertCircle,
  LineChart as LineChartIcon, 
  Layout,
  Weight,
  Dumbbell,
  Percent,
  Droplet,
  Footprints,
  Timer,
  LayoutGrid,
  LayoutList
} from 'lucide-react';
import CustomTooltip from './components/historical/CustomTooltip';
import MetricCard from './components/historical/MetricCard';
import ChartCard from './components/historical/ChartCard';
import PeriodInsights from './components/historical/PeriodInsights';

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
  const [gridView, setGridView] = useState(false);

  // Modificar el estado de caché para guardar por métrica y período
  const [cachedData, setCachedData] = useState({}); // { period: { metricId: data } }

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
        // Determinar qué métricas necesitamos cargar
        const metricsToFetch = view === 'overview' 
          ? metrics // En vista general, necesitamos todas
          : selectedMetrics.length === 0 
            ? metrics // Si no hay filtros, necesitamos todas
            : metrics.filter(m => selectedMetrics.includes(m.id)); // Solo las métricas filtradas

        const results = {};
        const promises = metricsToFetch
          .filter(metric => !cachedData[selectedPeriod]?.[metric.id]) // Solo fetch si no está en caché
          .map(metric => 
            api.user.getHistory(user.id, metric.id, selectedPeriod)
              .then(result => {
                if (metric.id === 'water' || metric.id === 'steps' || metric.id === 'exercise') {
                    if (!result || !result.data) {
                        throw new Error(`Invalid response format for ${metric.id}`);
                    }
                    results[metric.id] = result.data;
                    results[`${metric.id}_total`] = result.total;
                } else {
                    results[metric.id] = result;
                }
              })
              .catch(err => {
                throw err;
              })
          );
        
        if (promises.length > 0) {
          await Promise.all(promises);
          
          const formatDate = (dateStr) => {
            if (!dateStr) return '';
            const date = new Date(dateStr);
            return date.toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'numeric',
              year: '2-digit'
            });
          };

          const formattedResults = {};
          Object.entries(results).forEach(([metricId, data]) => {
            if (!data) {
              return;
            }

            if (!metricId.endsWith('_total')) {
              if (metricId === 'water' || metricId === 'steps' || metricId === 'exercise') {
                formattedResults[metricId] = data.map(item => ({
                  date: formatDate(item.date),
                  value: Number(item.value) || 0
                }));
                formattedResults[`${metricId}_total`] = results[`${metricId}_total`];
              } else {
                formattedResults[metricId] = data.map(item => ({
                  date: formatDate(item.date),
                  value: Number(item.value) || 0
                }));
              }
            }
          });
          // Actualizar caché con datos formateados
          setCachedData(prev => ({
            ...prev,
            [selectedPeriod]: {
              ...prev[selectedPeriod],
              ...formattedResults
            }
          }));

          // Usar formattedResults en lugar de resultados sin procesar
          setData({
            ...cachedData[selectedPeriod],
            ...formattedResults
          });
        }

      } catch (err) {
        setError(`Error al cargar los datos históricos: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user.id, selectedPeriod, view, selectedMetrics]); // Necesitamos estas dependencias para determinar qué cargar

  // Limpiar caché cuando cambia el período
  useEffect(() => {
    setCachedData({});
  }, [selectedPeriod]);

  const getMetricStats = (metricData, metricId) => {
    if (!metricData || metricData.length === 0) return { current: 0, previous: 0 };

    // Para métricas acumulativas (pasos, agua, ejercicio)
    if (metricId === 'steps' || metricId === 'water' || metricId === 'exercise') {
        const totalValue = data[`${metricId}_total`];
        const daysInPeriod = metricData.length || 1; // Asegurar que no dividimos por 0
        const dailyAverage = totalValue ? Math.round(totalValue / daysInPeriod) : 0;
        
        return {
            current: dailyAverage,
            previous: dailyAverage,
            total: totalValue || 0
        };
    }
    
    // Para métricas de medición (peso, músculo, grasa)
    const current = metricData[metricData.length - 1]?.value || 0;
    const previous = metricData[0]?.value || 0;
    return { current, previous };
  };

  const renderOverview = () => {
    return (
      <div className="space-y-8">
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

        {/* Period Insights */}
        <PeriodInsights data={data} metrics={metrics} />
      </div>
    );
  };

  const renderDetailedMetric = (metric) => {
    // Verificar si tenemos datos para esta métrica
    if (!data[metric.id]) {
      return (
        <ChartCard
          key={metric.id}
          title={metric.title}
          icon={metric.icon}
          iconColor={metric.color}
          data={[]} // Pasamos array vacío para mostrar el mensaje de no datos
          headerExtra={
            <div className="text-sm font-normal text-gray-500">
              No hay datos para mostrar
            </div>
          }
        />
      );
    }

    if (metric.id === 'water') {
      return (
        <ChartCard
          key={metric.id}
          title={metric.title}
          icon={metric.icon}
          iconColor={metric.color}
          data={data[metric.id]}
          headerExtra={
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
          }
        >
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
        </ChartCard>
      );
    }

    // Para ejercicios, usamos AreaChart
    if (metric.id === 'exercise') {
      return (
        <ChartCard
          key={metric.id}
          title={metric.title}
          icon={metric.icon}
          iconColor={metric.color}
          data={data[metric.id]}
          headerExtra={
            <div className="text-sm font-normal text-gray-500">
              {data[metric.id]?.length ? 
                `Último valor: ${data[metric.id][data[metric.id].length - 1].value.toLocaleString()} ${metric.unit}` :
                'No hay datos para mostrar'
              }
            </div>
          }
        >
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
        </ChartCard>
      );
    }

    // Para el resto de métricas, mantenemos el LineChart
    return (
      <ChartCard
        key={metric.id}
        title={metric.title}
        icon={metric.icon}
        iconColor={metric.color}
        data={data[metric.id]}
        headerExtra={
          <div className="text-sm font-normal text-gray-500">
            {data[metric.id]?.length ? 
              `Último valor: ${data[metric.id][data[metric.id].length - 1].value.toLocaleString()} ${metric.unit}` :
              'No hay datos para mostrar'
            }
          </div>
        }
      >
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
      </ChartCard>
    );
  };

  const renderDetailed = () => {
    const metricsToShow = selectedMetrics.length === 0 
      ? metrics 
      : metrics.filter(metric => selectedMetrics.includes(metric.id));

    return (
      <div className="space-y-6">
        <div className="flex flex-wrap gap-4 items-center justify-between">
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

          <div className="flex items-center gap-2">
            <Button
              variant={!gridView ? "default" : "outline"}
              size="icon"
              onClick={() => setGridView(false)}
              className="h-8 w-8"
            >
              <LayoutList className="h-4 w-4" />
            </Button>
            <Button
              variant={gridView ? "default" : "outline"}
              size="icon"
              onClick={() => setGridView(true)}
              className="h-8 w-8"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className={`grid grid-cols-1 ${gridView ? 'lg:grid-cols-2' : ''} gap-6`}>
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
                  {view === 'overview' ? renderOverview() : renderDetailed()}
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