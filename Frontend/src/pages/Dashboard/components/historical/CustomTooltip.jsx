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

export default CustomTooltip; 