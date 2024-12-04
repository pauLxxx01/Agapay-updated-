// import React, { PureComponent } from "react";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
// } from "recharts";

// const colors = {
//   Fire: "#800000",
//   Medical: "#006e92",
//   Crime: "#eca20c",
//   Natural: "#368364",
//   Biological: "#FF5F1F",
//   Utility: "#919191",
// };

// const Chart = () => {
//   const sortedData = Data.map((item) => {
//     const sortedValues = Object.keys(item)
//       .filter((key) => key !== "name")
//       .sort((a, b) => item[b] - item[a]);
//     return { ...item, sortedValues };
//   });

//   return (
//     <ResponsiveContainer width="90%" height="90%">
//       <LineChart fontSize={12} data={Data}>
//         <CartesianGrid strokeDasharray="1 5" />
//         <XAxis
//           orientation="bottom"
//           dataKey="name"
//           padding={{ left: 0, right: 0 }}
//           fontSize={12}
//         />
//         <YAxis />
//         <Tooltip
//           position={{ y: -50 }}
//           labelStyle={{
//             padding: 12,
//             fontSize: 18,
//             color: "gray",
//             fontWeight: "bold",
//             textTransform: "uppercase",
//             letterSpacing: 2,
//           }}
//           contentStyle={{
//             backgroundColor: "white",
//             textTransform: "uppercase",
//             fontSize: "16px",
//             boxShadow: "0 4px 8px rgba(0, 0, 0, 0.405)",
//           }}
//         />
//         <Legend />
//         {sortedData[0].sortedValues.map((key, index) => (
//           <Line
//             key={index}
//             type="monotone"
//             dataKey={key}
//             stroke={colors[key]}
//           />
//         ))}
//       </LineChart>
//     </ResponsiveContainer>
//   );
// };

// export default Chart;