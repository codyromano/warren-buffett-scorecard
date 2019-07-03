import * as React from 'react';
import PreloadImage from './PreloadImage';

export type KeyStatCardProps = {
  label: string;
  stat: number|string;
  iconSrc: string;
  iconFillPercent: number;
  description: string|React.ReactElement;
};

const ICON_SIZE = 160;

const KeyStatCard = ({ label, stat, iconSrc, description, iconFillPercent }: KeyStatCardProps) => (
  <div className="key-stat-container">
    <div className="key-stat-icon-container">
      <PreloadImage  height={ICON_SIZE} width={ICON_SIZE} src={iconSrc} className="key-stat-icon-background" />
      <PreloadImage height={ICON_SIZE} width={ICON_SIZE} src={iconSrc} className="key-stat-icon-foreground" style={{
        clipPath: `polygon(0% ${100 - iconFillPercent}%, 100% ${100 - iconFillPercent}%, 100% 100%, 0% 100%)`
      }}/>
      <div className="key-stat-label-metric">{stat}</div>
    </div>
    <div className="key-stat-label">{label}</div>
    <p className="key-stat-description">{description}</p>
  </div>
);

export default KeyStatCard;
