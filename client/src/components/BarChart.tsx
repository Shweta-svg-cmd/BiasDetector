import React from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface DataItem {
  name: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: DataItem[];
  title?: string;
  height?: number;
  showGridLines?: boolean;
  showLabels?: boolean;
  barSize?: number;
  maxValue?: number;
}

const BarChart: React.FC<BarChartProps> = ({
  data,
  title,
  height = 200,
  showGridLines = true,
  showLabels = true,
  barSize = 40,
  maxValue,
}) => {
  const formatTooltip = (value: number) => {
    return [`${value}`, ''];
  };

  return (
    <div className="w-full">
      {title && <h4 className="font-medium text-gray-800 mb-2 text-center">{title}</h4>}
      <div style={{ width: '100%', height: height }}>
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart
            data={data}
            margin={{
              top: 5,
              right: 5,
              left: 0,
              bottom: 5,
            }}
          >
            {showGridLines && <CartesianGrid strokeDasharray="3 3" vertical={false} />}
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }} 
              axisLine={false}
              tickLine={false}
            />
            {showLabels && (
              <YAxis 
                domain={maxValue ? [0, maxValue] : [0, 'auto']} 
                tick={{ fontSize: 10 }} 
                axisLine={false}
                tickLine={false}
                tickCount={5}
              />
            )}
            <Tooltip formatter={formatTooltip} />
            <Bar 
              dataKey="value" 
              radius={[4, 4, 0, 0]} 
              barSize={barSize}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color || '#8884d8'} />
              ))}
            </Bar>
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BarChart;