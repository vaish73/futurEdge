"use client";
import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format } from "date-fns";

type Assessment = {
  _id: string;
  quizScore: number;
  category: string;
  createdAt: string;
};

type ChartData = {
  date: string;
  score: number;
};

interface PerformanceChartProps {
  assessments: Assessment[];
}

const PerformanceChart = ({ assessments }: PerformanceChartProps) => {
  const [chartData, setChartData] = useState<ChartData[]>([]);

  useEffect(() => {
    if (assessments) {
      const formattedData = assessments.map((assessment) => {
        const parsedDate = new Date(assessment.createdAt);
        return {
          date: isNaN(parsedDate.getTime())
            ? "Invalid Date"
            : format(parsedDate, "MMM dd"),
          score: assessment.quizScore,
        };
      });
      setChartData(formattedData);
    }
  }, [assessments]);

  
  console.log("ChartData",chartData);
  

  return (
    <Card>
      <CardHeader>
        <CardTitle className="gradient-title text-3xl md:text-4xl">
          Performance Trend
        </CardTitle>
        <CardDescription>Your quiz scores over time</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 100]} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload?.length) {
                    return (
                      <div className="bg-background border rounded-lg p-2 shadow-md">
                        <p className="text-sm font-medium">
                          Score: {payload[0].value}%
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {payload[0].payload.date}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#fff" 
                strokeWidth={2}
                dot={{ r: 2 }}
                activeDot={{ r: 4 }}
                animationDuration={1000}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceChart;
