
import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

interface BloodSugarChartProps {
  data: {
    time: string;
    level: number;
  }[];
  className?: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass p-2 text-xs">
        <p className="font-medium">{`${label}: ${payload[0].value} mg/dL`}</p>
      </div>
    );
  }
  return null;
};

const BloodSugarChart: React.FC<BloodSugarChartProps> = ({ data, className = '' }) => {
  // Reference ranges
  const normalRange = { min: 70, max: 140 };

  return (
    <div className={`w-full h-60 ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
          <XAxis 
            dataKey="time" 
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            domain={[0, 200]} 
            tick={{ fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            tickCount={5}
          />
          <Tooltip content={<CustomTooltip />} />
          
          {/* Reference lines for normal range */}
          <ReferenceLine 
            y={normalRange.max} 
            stroke="#F97316" 
            strokeDasharray="3 3" 
            strokeWidth={1} 
          />
          <ReferenceLine 
            y={normalRange.min} 
            stroke="#10B981" 
            strokeDasharray="3 3" 
            strokeWidth={1} 
          />
          
          <Line
            type="monotone"
            dataKey="level"
            stroke="#0EA5E9"
            strokeWidth={2}
            dot={{ stroke: '#0EA5E9', strokeWidth: 2, fill: 'white', r: 4 }}
            activeDot={{ stroke: '#0EA5E9', strokeWidth: 2, fill: '#0EA5E9', r: 5 }}
            animationDuration={1500}
            animationEasing="ease-in-out"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BloodSugarChart;
