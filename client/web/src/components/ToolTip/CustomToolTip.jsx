import React from 'react';
import Tooltip from '@mui/material/Tooltip';
import QRCode from "react-qr-code";

const CustomTooltip = ({ title, value, qrValue }) => {
  return (
    <Tooltip
      PopperProps={{
        sx: {
          "& .MuiTooltip-tooltip": {
            backgroundColor: "maroon", 
            color: "white", // Change the text color
          },
        },
      }}
      title={
        <div style={{ display: "flex", flexDirection: "column", textAlign: "center" }}>
          {title}
          {qrValue && (
            <QRCode
              size={100}
              bgColor="maroon"
              fgColor="white"
              value={qrValue}
            />
          )}
        </div>
      }
    >
      <p style={{ display: "flex", flexDirection: "column", textAlign: "center" }}>{value}</p>
    </Tooltip>
  );
};

export default CustomTooltip;