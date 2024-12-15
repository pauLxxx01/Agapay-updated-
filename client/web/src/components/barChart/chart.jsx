// src/components/LineChartComponent.js

import React, { useContext } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Bar,
  BarChart,
  LabelList,
} from "recharts";
import { AuthContext } from "../../context/authContext";
import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear"; // Import the weekOfYear plugin
dayjs.extend(weekOfYear);
// Sample data

const LineChartComponent = () => {
  const [, messages] = useContext(AuthContext);
  console.log(messages);

  const countMessagesPerDayByEmergency = (messages) => {
    const countByDay = {};

    // Group messages by the day and emergency type
    messages.forEach((message) => {
      const date = dayjs(message.createdAt).format("YYYY-MM-DD"); // Format date to YYYY-MM-DD
      const emergency = message.emergency;

      if (!countByDay[date]) {
        countByDay[date] = {};
      }

      if (countByDay[date][emergency]) {
        countByDay[date][emergency] += 1; // Increment the count for that emergency type
      } else {
        countByDay[date][emergency] = 1; // Initialize the count for that emergency type
      }
    });

    // Convert the count object to an array suitable for Recharts
    const result = [];
    const allEmergencies = [...new Set(messages.map((msg) => msg.emergency))]; 

    Object.keys(countByDay).forEach((date) => {
      const dayData = { date };
      allEmergencies.forEach((emergency) => {
        dayData[emergency] = countByDay[date][emergency] || 0; // Add count for each emergency type, defaulting to 0
      });
      result.push(dayData);
    });

    return result;
  };

  // Processed data for the chart
  const chartData = countMessagesPerDayByEmergency(messages);

  // Color map for different emergency types
  const emergencyColorMap = {
    "Facility Failure": "gray",
    "Medical Assistance": "rgb(48, 122, 206)",
    "Natural Hazard": "rgb(210, 105, 30)",
    "Fire Emergency": "maroon",
    "Biological Hazard": "green",
    "Crime & Violence": "#F7B32D",
  };

  const emergencyTypes = [...new Set(messages.map((msg) => msg.emergency))];

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          orientation="bottom"
          padding={{ left: 0, right: 0 }}
          fontSize={12}
        />
        <YAxis />
        <Tooltip />
        <Legend />
        {emergencyTypes.map((emergency) => (
          <Line
            key={emergency}
            type="monotone"
            dataKey={emergency}
            stroke={emergencyColorMap[emergency] || "#000000"}
            dot={true}
            activeDot={{ r: 10 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default LineChartComponent;
