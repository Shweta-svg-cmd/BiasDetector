import React from 'react';
import {
  Radar,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

interface DataItem {
  subject: string;
  value: number;
  fullMark: number;
}

interface RadarChartProps {
  data: DataItem[];
  title?: string;
  height?: number;
  color?: string;
}

const RadarChart: React.FC<RadarChartProps> = ({
  data,
  title,
  height = 300,
  color = '#8884d8',
}) => {
  return (
    <div className="w-full">
      {title && <h4 className="font-medium text-gray-800 mb-2 text-center">{title}</h4>}
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <RechartsRadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: '#666' }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} />
            <Radar
              name="Score"
              dataKey="value"
              stroke={color}
              fill={color}
              fillOpacity={0.6}
            />
            <Tooltip />
          </RechartsRadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RadarChart;