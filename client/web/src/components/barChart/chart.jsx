// 

// src/components/BarChartComponent.js

// src/components/BarChartComponent.js

import React, { useState, useContext } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { AuthContext } from "../../context/authContext";
import dayjs from "dayjs";

const BarChartComponent = () => {
  const [, messages] = useContext(AuthContext);

  // State for grouping type
  const [groupBy, setGroupBy] = useState("day");

  const countMessagesByTimeAndEmergency = (messages, groupBy) => {
    const countByTime = {};

    // Group messages by time unit (day or month) and emergency type
    messages.forEach((message) => {
      const timeKey =
        groupBy === "month"
          ? dayjs(message.createdAt).format("YYYY-MM")
          : dayjs(message.createdAt).format("YYYY-MM-DD"); // Group by month or day
      const emergency = message.emergency;

      if (!countByTime[timeKey]) {
        countByTime[timeKey] = {};
      }

      if (countByTime[timeKey][emergency]) {
        countByTime[timeKey][emergency] += 1;
      } else {
        countByTime[timeKey][emergency] = 1;
      }
    });

    // Convert the count object to an array suitable for Recharts
    const result = [];
    const allEmergencies = [...new Set(messages.map((msg) => msg.emergency))];

    Object.keys(countByTime).forEach((timeKey) => {
      const timeData = { time: timeKey };
      allEmergencies.forEach((emergency) => {
        timeData[emergency] = countByTime[timeKey][emergency] || 0; // Default to 0 if no data
      });
      result.push(timeData);
    });

    return result;
  };

  // Processed data for the chart
  const chartData = countMessagesByTimeAndEmergency(messages, groupBy);

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
    <div style={{width: "100%"}}>
      <div style={{ marginBottom: "1rem",  width: "100%" }}>
       
        <select
          id="groupBy"
          value={groupBy}
          onChange={(e) => setGroupBy(e.target.value)}
        >
          <option value="day">Daily</option>
          <option value="month">Monthly</option>
        </select>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="time"
            orientation="bottom"
            padding={{ left: 0, right: 0 }}
            fontSize={12}
          />
          <YAxis />
          <Tooltip />
          <Legend />
          {emergencyTypes.map((emergency) => (
            <Bar
              key={emergency}
              dataKey={emergency}
              fill={emergencyColorMap[emergency] || "#000000"}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChartComponent;
