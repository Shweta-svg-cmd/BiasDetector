import React from 'react';
import { Badge } from "@/components/ui/badge";

// Color mapping for topics
const topicColors: Record<string, { bg: string, text: string }> = {
  "Politics": { bg: "bg-blue-600", text: "text-white" },
  "Economy": { bg: "bg-green-600", text: "text-white" },
  "Health": { bg: "bg-red-600", text: "text-white" },
  "Environment": { bg: "bg-green-700", text: "text-white" },
  "Technology": { bg: "bg-purple-600", text: "text-white" },
  "International": { bg: "bg-indigo-600", text: "text-white" },
  "Military": { bg: "bg-gray-800", text: "text-white" },
  "Law": { bg: "bg-yellow-600", text: "text-white" },
  "Education": { bg: "bg-blue-500", text: "text-white" },
  "Society": { bg: "bg-pink-600", text: "text-white" },
  "Culture": { bg: "bg-orange-600", text: "text-white" },
  "Science": { bg: "bg-teal-600", text: "text-white" },
  "Immigration": { bg: "bg-amber-600", text: "text-white" },
  "Civil Rights": { bg: "bg-purple-700", text: "text-white" },
  "Elections": { bg: "bg-blue-700", text: "text-white" }
};

interface TopicBadgeProps {
  topic: string;
  isMain?: boolean;
  className?: string;
}

export function TopicBadge({ topic, isMain = false, className = "" }: TopicBadgeProps) {
  const colors = topicColors[topic] || { bg: "bg-gray-600", text: "text-white" };
  
  return (
    <Badge 
      className={`${colors.bg} ${colors.text} ${isMain ? 'font-semibold text-sm py-1 px-3' : 'text-xs'} ${className}`}
    >
      {isMain ? `${topic} ★` : topic}
    </Badge>
  );
}

interface TopicListProps {
  topics?: string[];
  mainTopic?: string;
  className?: string;
}

export function TopicList({ topics = [], mainTopic, className = "" }: TopicListProps) {
  if (!topics || topics.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {mainTopic && (
        <TopicBadge topic={mainTopic} isMain={true} />
      )}
      
      {topics
        .filter(topic => topic !== mainTopic)
        .map((topic, index) => (
          <TopicBadge key={index} topic={topic} />
        ))}
    </div>
  );
}