
// import React, { PureComponent } from "react";
// import {
//   BarChart,
//   Bar,
//   Rectangle,
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

// const chart = () => {
//   return (
//     <ResponsiveContainer width="90%" height="90%">
//       <BarChart
//         width={500}
//         height={300}
//         data={dailyData}
//         margin={{
//           top: 5,
//           right: 5,
//           left: 5,
//           bottom: 5,
//         }}
//       >
//         <CartesianGrid strokeDasharray="5 3" />
//         <XAxis fontSize={12}/>
//         <YAxis />
//         <Tooltip />
//         <Legend />
//         <Bar
//           dataKey="FIRE"
//           fill={colors.Fire}
//           activeBar={<Rectangle fill={colors.Fire} stroke={colors.Fire} />}
//         />
//         <Bar
//           dataKey="MEDICAL"
//           fill={colors.Medical}
//           activeBar={<Rectangle  fill={colors.Medical} stroke={colors.Medical} />}
//         />
//         <Bar
//           dataKey="CRIME"
//           fill={colors.Crime}
//           activeBar={<Rectangle  fill={colors.Crime} stroke={colors.Crime} />}
//         />
//         <Bar
//           dataKey="NATURAL"
//           fill={colors.Natural}
//           activeBar={<Rectangle fill={colors.Natural} stroke={colors.Natural} />}
//         />
//         <Bar
//           dataKey="BIOLOGICAL"
//           fill={colors.Biological}
//           activeBar={<Rectangle   fill={colors.Biological} stroke={colors.Biological} />}
//         />
//         <Bar
//           dataKey="UTILITY"
//           fill={colors.Utility}
//           activeBar={<Rectangle  fill={colors.Utility} stroke={colors.Utility} />}
//         />
//       </BarChart>
//     </ResponsiveContainer>
//   );
// };

// export default chart;
