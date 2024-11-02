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

export default StepsChart;