
import React from "react";
import { getWheelItemContainerStyles, getWheelItemLabelStyles } from "./styles/wheelItemStyles";

interface WheelItemProps {
  label: string;
  index: number;
  selectedIndex: number;
  offset: number;
  itemHeight: number;
  wheelHeight: number;
  onClick: (index: number) => void;
  labelClassName?: string;
}

const WheelItem: React.FC<WheelItemProps> = ({
  label,
  index,
  selectedIndex,
  offset,
  itemHeight,
  wheelHeight,
  onClick,
  labelClassName,
}) => {
  // Calculate distance from center item
  const distance = index - selectedIndex;
  const isSelected = distance === 0;

  // Calculate vertical position
  const translateY = (distance * itemHeight) + offset + (wheelHeight / 2 - itemHeight / 2);

  // Calculate opacity based on distance for fade effect
  const opacity = Math.max(0, 1 - Math.min(Math.abs(distance) / 3, 0.8));

  // Calculate z-index for proper layering
  const zIndex = 100 - Math.abs(distance);

  // Get computed class names
  const containerClassName = getWheelItemContainerStyles(isSelected);
  const labelStyles = getWheelItemLabelStyles(labelClassName);

  return (
    <div
      className={containerClassName}
      style={{
        height: `${itemHeight}px`,
        transform: `translateY(${translateY}px)`,
        opacity: opacity,
        zIndex: zIndex
      }}
      onClick={() => onClick(index)}
    >
      <span className={labelStyles + " whitespace-nowrap"}>
        {label}
      </span>
    </div>
  );
};

export default React.memo(WheelItem);
