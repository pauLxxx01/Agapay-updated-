import React from 'react';
import './Loading.scss'; // Make sure to create this CSS file

const Loading = () => {
    return (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      );
};

export default Loading;