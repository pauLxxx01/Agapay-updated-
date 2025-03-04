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

  // Function to count messages by time and emergency
  const countMessagesByTimeAndEmergency = (messages, groupBy) => {
    if (!messages) return []; // Handle null or empty messages

    const countByTime = {};

    messages.forEach((message) => {
      const timeKey =
        groupBy === "month"
          ? dayjs(message.createdAt).format("YYYY-MM")
          : dayjs(message.createdAt).format("YYYY-MM-DD");

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
        timeData[emergency] = countByTime[timeKey][emergency] || 0;
      });
      result.push(timeData);
    });

    console.log("Processed Chart Data:", result);

    return result;
  };

  // Processed data for the chart
  const chartData = countMessagesByTimeAndEmergency(messages, groupBy);

  // Color map for different emergency types
  const emergencyColorMap = {
    "Fire Emergency": "maroon",
    "Medical Assistance": "rgb(48, 122, 206)",
    "Biological Hazard": "green",
    "Crime & Violence": "#F7B32D",
    "Facility Failure": "gray",
    "Natural Hazard": "rgb(210, 105, 30)",
  };

  const emergencyTypes = messages
    ? [...new Set(messages.map((msg) => msg.emergency))]
    : [];

  console.log("Unique Emergency Types:", emergencyTypes); // Log unique emergency types

  return (
    <div style={{ width: "100%" }}>
      <div style={{ marginBottom: "1rem" }}>
        <select
          style={{ width: "50%" }}
          id="groupBy"
          value={groupBy}
          onChange={(e) => setGroupBy(e.target.value)}
        >
          <option value="day">Daily</option>
          <option value="month">Monthly</option>
        </select>
      </div>
      {messages && chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={200}>
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
            <Legend
              layout="vertical"
              verticalAlign="top"
              align="right"
              wrapperStyle={{ padding: "10px" }}
            />
            {emergencyTypes.map((emergency) => (
              <Bar
                key={emergency}
                dataKey={emergency}
                fill={emergencyColorMap[emergency] || "#000000"}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div>No data available for chart.</div>
      )}
    </div>
  );
};

export default BarChartComponent;
