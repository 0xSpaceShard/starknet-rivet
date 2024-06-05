import React, { useState } from 'react';
import './infoIcon.css';

interface InfoIconProps {
  content: string;
}

const InfoIcon: React.FC<InfoIconProps> = ({ content }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleMouseEnter = () => {
    setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  return (
    <div className="info-icon-container">
      <span
        className="info-icon"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        ℹ️
      </span>
      {showTooltip && (
        <div className="tooltip-content">
          <div dangerouslySetInnerHTML={{ __html: content }} />
        </div>
      )}
    </div>
  );
};

export default InfoIcon;