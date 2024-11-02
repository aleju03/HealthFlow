import { Card, CardContent } from "../../../../components/ui/card";

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

export default MetricCard;