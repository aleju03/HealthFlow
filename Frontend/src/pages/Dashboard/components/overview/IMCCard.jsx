import { Card, CardContent } from "../../../../components/ui/card";
import { Heart } from 'lucide-react';

const IMCCard = ({ value, className }) => {
  const getIMCCategory = (imc) => {
    if (imc < 18.5) return { label: 'Delgadez', color: 'text-yellow-500' };
    if (imc < 25) return { label: 'Saludable', color: 'text-green-500' };
    if (imc < 30) return { label: 'Sobrepeso', color: 'text-orange-500' };
    return { label: 'Obesidad', color: 'text-red-500' };
  };

  const category = getIMCCategory(value);
  const position = ((value - 15) / (40 - 15)) * 100;

  return (
    <Card className={`relative overflow-hidden group hover:shadow-lg transition-all duration-300 ${className}`}>
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

export default IMCCard;