import * as React from 'react';

export type KeyStatCardProps = {
  label: string;
  stat: number|string;
  iconSrc: string;
  iconFillPercent: number;
  description: string;
};

const KeyStatCard = ({ label, stat, iconSrc, description, iconFillPercent }: KeyStatCardProps) => (
  <div className="key-stat-container">
    <div className="key-stat-icon-container">
      <img src={iconSrc} className="key-stat-icon-background" />
      <img src={iconSrc} className="key-stat-icon-foreground" style={{
        clipPath: `polygon(0% ${iconFillPercent}%, 100% ${iconFillPercent}%, 100% 100%, 0% 100%)`
      }}/>
      <div className="key-stat-label-metric">{stat}</div>
    </div>
    <div className="key-stat-label">{label}</div>
    <p className="key-stat-description">{description}</p>
  </div>
);

export default KeyStatCard;
