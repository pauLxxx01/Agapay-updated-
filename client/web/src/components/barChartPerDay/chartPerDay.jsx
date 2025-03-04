// src/components/LineChartComponent.js

import React, { useState, useContext } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { AuthContext } from "../../context/authContext";
import dayjs from "dayjs";

const LineChartComponent = () => {
  const [, messages] = useContext(AuthContext);

  // State for available dates
  const [availableDates, setAvailableDates] = useState([]);
  const [noDataMessage, setNoDataMessage] = useState(""); // State to hold the message

  // Function to get unique dates from completed messages
  const getAvailableDates = (messages) => {
    const completedMessages = messages.filter(
      (message) => message.respond === "completed"
    );

    const dates = completedMessages.map((message) =>
      dayjs(message.createdAt).format("YYYY-MM-DD")
    );

    // Create a unique set of dates
    return [...new Set(dates)];
  };

  // Set available dates when component mounts or messages change
  React.useEffect(() => {
    const dates = getAvailableDates(messages);
    setAvailableDates(dates);

    // Display message if no completed messages are available
    if (dates.length === 0) {
      setNoDataMessage("There are no completed reports yet.");
    } else {
      setNoDataMessage(""); // Clear the message if there are completed messages
    }
  }, [messages]);

  // Count completed messages by available dates
  const countCompletedMessagesByDate = (messages, availableDates) => {
    const countByDate = {};

    // Filter messages to include only those that are completed
    const completedMessages = messages.filter(
      (message) => message.respond === "completed"
    );

    // Count the number of completed messages for each available date
    completedMessages.forEach((message) => {
      const dateKey = dayjs(message.createdAt).format("YYYY-MM-DD");

      if (availableDates.includes(dateKey)) {
        if (!countByDate[dateKey]) {
          countByDate[dateKey] = 0;
        }
        countByDate[dateKey] += 1; // Increment the count for this date key
      }
    });

    // Convert the count object to an array suitable for Recharts
    return availableDates.map((date) => ({
      time: date || 0,
      count: countByDate[date] || 0, // Default to 0 if no data
    }));
  };

  // Processed data for the chart
  const chartData = countCompletedMessagesByDate(messages, availableDates);

  return (
    <div style={{ width: "100%", padding: "12px" }}>
      {noDataMessage ? ( // Display the message if noDataMessage is set
        <p style={{ textAlign: "center", fontStyle: "italic", color: "maroon" }}>
          {noDataMessage}
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" fontSize={12} />
            <YAxis />
            <Tooltip />
            <Legend wrapperStyle={{ padding: "10px" }} />
            <Line
              type="monotone"
              dataKey="count"
              stroke="rgb(97, 0, 0)"
              name="Completed Report"
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default LineChartComponent;
