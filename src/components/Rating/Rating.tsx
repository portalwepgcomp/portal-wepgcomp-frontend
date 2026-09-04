"use client";

import "./Rating.css";
import { useEffect, useState } from "react";
import StarRating from "../UI/StarRating";

interface RatingProps {
  value: number;
  onChange: (value: number) => void;
}

export default function Rating({ value, onChange }: RatingProps) {
  const [rating, setRating] = useState<number>(value || 0);

  useEffect(() => {
    setRating(value || 0);
  }, [value]);

  const handleRate = (newRating: number) => {
    setRating(newRating);
    onChange(newRating);
  };

  return (
    <div className="rating">
      {[1, 2, 3, 4, 5].map((starValue) => (
        <div
          key={starValue}
          className="star"
          onClick={() => handleRate(starValue)}
        >
          <StarRating color={rating >= starValue ? "#FFA90F" : "#555555"} />
        </div>
      ))}
    </div>
  );
}