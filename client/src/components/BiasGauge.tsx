import { useEffect, useRef } from 'react';

interface BiasGaugeProps {
  score: number;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const getScoreColor = (score: number): string => {
  if (score < 40) return 'text-green-400';
  if (score < 70) return 'text-amber-400';
  return 'text-red-400';
};

const getScoreText = (score: number): string => {
  if (score < 30) return 'Low Bias';
  if (score < 40) return 'Lean Neutral';
  if (score < 60) return 'Moderate Bias';
  if (score < 70) return 'Moderate Left/Right Bias';
  if (score < 80) return 'Strong Bias';
  return 'Extreme Bias';
};

const BiasGauge: React.FC<BiasGaugeProps> = ({ 
  score, 
  size = 'medium',
  className = ''
}) => {
  const needleRef = useRef<HTMLDivElement>(null);
  
  // Convert score to degrees for needle rotation
  // Mapping 0-100 to -90 to +90 degrees
  const calculateDegrees = (biasScore: number): number => {
    return (biasScore / 100) * 180 - 90;
  };
  
  useEffect(() => {
    if (needleRef.current) {
      const degrees = calculateDegrees(score);
      needleRef.current.style.transform = `rotate(${degrees}deg)`;
    }
  }, [score]);
  
  const getDimensions = () => {
    switch (size) {
      case 'small':
        return {
          meter: 'h-24 w-48',
          needle: 'h-22 w-1',
          center: 'w-3 h-3'
        };
      case 'large':
        return {
          meter: 'h-36 w-72',
          needle: 'h-33 w-1.5',
          center: 'w-5 h-5'
        };
      case 'medium':
      default:
        return {
          meter: 'h-30 w-60',
          needle: 'h-28 w-1',
          center: 'w-4 h-4'
        };
    }
  };
  
  const dimensions = getDimensions();
  const scoreColor = getScoreColor(score);
  const scoreText = getScoreText(score);
  
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className={`relative ${dimensions.meter}`}>
        <div className="absolute h-full w-full rounded-t-full bg-muted/30 overflow-hidden">
          <div className="absolute bottom-0 w-full h-full bg-gradient-to-r from-green-500 via-amber-500 to-red-500 rounded-t-full"></div>
        </div>
        <div 
          ref={needleRef}
          className={`absolute bottom-0 left-1/2 ${dimensions.needle} bg-foreground transform -translate-x-1/2 origin-bottom rounded-t-full transition-transform duration-1000`}
        ></div>
        <div 
          className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 ${dimensions.center} bg-foreground rounded-full`}
        ></div>
      </div>
      <div className={`text-2xl font-bold mt-2 ${scoreColor}`}>{score}/100</div>
      <div className="text-sm text-muted-foreground">{scoreText}</div>
    </div>
  );
};

export default BiasGauge;
