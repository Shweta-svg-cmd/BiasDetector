import React from 'react';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';

interface DataItem {
  name: string;
  value: number;
  color: string;
}

interface PieChartProps {
  data: DataItem[];
  title?: string;
  height?: number;
  showLegend?: boolean;
  innerRadius?: number;
  outerRadius?: number;
}

const RADIAN = Math.PI / 180;

// Custom label for pie segments
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      fontSize={12}
      fontWeight="bold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const PieChart: React.FC<PieChartProps> = ({
  data,
  title,
  height = 250,
  showLegend = true,
  innerRadius = 60,
  outerRadius = 80,
}) => {
  return (
    <div className="w-full">
      {title && <h4 className="font-medium text-gray-800 mb-2 text-center">{title}</h4>}
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <RechartsPieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={outerRadius}
              innerRadius={innerRadius}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => [`${value}`, '']}
            />
            {showLegend && <Legend layout="horizontal" verticalAlign="bottom" align="center" />}
          </RechartsPieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PieChart;