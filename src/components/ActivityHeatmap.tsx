'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Calendar, GitBranch, TrendingUp, Flame } from 'lucide-react';
import { activityTracker, UserActivity } from '@/lib/activityTracker';

interface ContributionDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
  activities: UserActivity[];
}

interface ActivityHeatmapProps {
  userId: string;
}

export default function ActivityHeatmap({ userId }: ActivityHeatmapProps) {
  const [contributionData, setContributionData] = useState<ContributionDay[]>([]);
  const [totalContributions, setTotalContributions] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    if (userId) {
      loadActivityData();
    }
  }, [userId, selectedYear]);

  const loadActivityData = async () => {
    setIsLoading(true);
    try {
      // Get all user activities for the selected year
      const activities = await activityTracker.getUserActivities(userId, 1000);
      
      // Generate contribution data for the past year
      const contributionMap = generateContributionData(activities, selectedYear);
      setContributionData(contributionMap);
      
      // Calculate statistics
      const total = contributionMap.reduce((sum, day) => sum + day.count, 0);
      setTotalContributions(total);
      
      const streaks = calculateStreaks(contributionMap);
      setCurrentStreak(streaks.current);
      setLongestStreak(streaks.longest);
      
    } catch (error) {
      console.error('Error loading activity data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateContributionData = (activities: UserActivity[], year: number): ContributionDay[] => {
    const startDate = new Date(year, 0, 1); // January 1st
    const endDate = new Date(year, 11, 31); // December 31st
    const contributionMap: { [key: string]: ContributionDay } = {};

    // Initialize all days of the year
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      contributionMap[dateStr] = {
        date: dateStr,
        count: 0,
        level: 0,
        activities: []
      };
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Fill in activities
    activities.forEach(activity => {
      const activityDate = new Date(activity.timestamp);
      if (activityDate.getFullYear() === year) {
        const dateStr = activityDate.toISOString().split('T')[0];
        if (contributionMap[dateStr]) {
          contributionMap[dateStr].count += 1;
          contributionMap[dateStr].activities.push(activity);
        }
      }
    });

    // Calculate levels (intensity)
    const allCounts = Object.values(contributionMap).map(day => day.count);
    const maxCount = Math.max(...allCounts);
    
    Object.values(contributionMap).forEach(day => {
      if (day.count === 0) {
        day.level = 0;
      } else if (day.count <= maxCount * 0.25) {
        day.level = 1;
      } else if (day.count <= maxCount * 0.5) {
        day.level = 2;
      } else if (day.count <= maxCount * 0.75) {
        day.level = 3;
      } else {
        day.level = 4;
      }
    });

    return Object.values(contributionMap).sort((a, b) => a.date.localeCompare(b.date));
  };

  const calculateStreaks = (contributionData: ContributionDay[]) => {
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    // Calculate from most recent backwards
    for (let i = contributionData.length - 1; i >= 0; i--) {
      if (contributionData[i].count > 0) {
        tempStreak++;
        if (i === contributionData.length - 1) {
          currentStreak = tempStreak;
        }
      } else {
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
        }
        if (i === contributionData.length - 1) {
          currentStreak = 0;
        }
        tempStreak = 0;
      }
    }

    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }

    return { current: currentStreak, longest: longestStreak };
  };

  const getLevelColor = (level: number) => {
    const colors = {
      0: 'bg-gray-100 dark:bg-gray-800',
      1: 'bg-green-200 dark:bg-green-900',
      2: 'bg-green-300 dark:bg-green-700',
      3: 'bg-green-400 dark:bg-green-600',
      4: 'bg-green-500 dark:bg-green-500'
    };
    return colors[level as keyof typeof colors] || colors[0];
  };

  const getWeeksInYear = (year: number) => {
    const weeks: ContributionDay[][] = [];
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);
    
    // Find the first Sunday of the year or before
    let weekStart = new Date(startDate);
    while (weekStart.getDay() !== 0) {
      weekStart.setDate(weekStart.getDate() - 1);
    }

    while (weekStart <= endDate) {
      const week: ContributionDay[] = [];
      for (let i = 0; i < 7; i++) {
        const currentDay = new Date(weekStart);
        currentDay.setDate(weekStart.getDate() + i);
        
        if (currentDay.getFullYear() === year) {
          const dateStr = currentDay.toISOString().split('T')[0];
          const dayData = contributionData.find(d => d.date === dateStr);
          if (dayData) {
            week.push(dayData);
          }
        }
      }
      
      if (week.length > 0) {
        weeks.push(week);
      }
      
      weekStart.setDate(weekStart.getDate() + 7);
    }

    return weeks;
  };

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const dayLabels = ['Mon', 'Wed', 'Fri'];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Activity Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-40">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full"
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  const weeks = getWeeksInYear(selectedYear);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Activity Overview</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedYear(selectedYear - 1)}
            >
              {selectedYear - 1}
            </Button>
            <Badge variant="default">{selectedYear}</Badge>
            {selectedYear < new Date().getFullYear() && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedYear(selectedYear + 1)}
              >
                {selectedYear + 1}
              </Button>
            )}
          </div>
        </div>
        
        {/* Stats */}
        <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-300">
          <div className="flex items-center space-x-1">
            <GitBranch className="h-4 w-4" />
            <span>{totalContributions} contributions in {selectedYear}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Flame className="h-4 w-4 text-orange-500" />
            <span>{currentStreak} day current streak</span>
          </div>
          <div className="flex items-center space-x-1">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span>{longestStreak} day longest streak</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          
          {/* Month labels */}
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
            {months.map((month, index) => (
              <span key={month} className="w-10 text-center">
                {index % 3 === 0 ? month : ''}
              </span>
            ))}
          </div>

          {/* Heatmap grid */}
          <div className="flex space-x-1">
            {/* Day labels */}
            <div className="flex flex-col space-y-1 text-xs text-gray-500 dark:text-gray-400 mr-2">
              <div className="h-3"></div> {/* Spacer for month labels */}
              {dayLabels.map((day, index) => (
                <div key={day} className="h-3 flex items-center">
                  {index % 2 === 0 ? day : ''}
                </div>
              ))}
            </div>

            {/* Contribution squares */}
            <TooltipProvider>
              <div className="flex space-x-1">
                {weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col space-y-1">
                    {Array.from({ length: 7 }, (_, dayIndex) => {
                      const day = week[dayIndex];
                      if (!day) {
                        return <div key={dayIndex} className="w-3 h-3" />;
                      }

                      return (
                        <Tooltip key={day.date}>
                          <TooltipTrigger>
                            <motion.div
                              whileHover={{ scale: 1.2 }}
                              className={`w-3 h-3 rounded-sm ${getLevelColor(day.level)} cursor-pointer`}
                            />
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="text-sm">
                              <div className="font-medium">
                                {day.count} contribution{day.count !== 1 ? 's' : ''} on {new Date(day.date).toLocaleDateString()}
                              </div>
                              {day.activities.length > 0 && (
                                <div className="mt-2 space-y-1">
                                  {day.activities.slice(0, 3).map((activity, index) => (
                                    <div key={index} className="text-xs text-gray-600 dark:text-gray-300">
                                      • {activity.description}
                                    </div>
                                  ))}
                                  {day.activities.length > 3 && (
                                    <div className="text-xs text-gray-500">
                                      +{day.activities.length - 3} more
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </div>
                ))}
              </div>
            </TooltipProvider>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Learn how we count contributions</span>
            <div className="flex items-center space-x-1">
              <span>Less</span>
              <div className="flex space-x-1">
                {[0, 1, 2, 3, 4].map(level => (
                  <div
                    key={level}
                    className={`w-3 h-3 rounded-sm ${getLevelColor(level)}`}
                  />
                ))}
              </div>
              <span>More</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
