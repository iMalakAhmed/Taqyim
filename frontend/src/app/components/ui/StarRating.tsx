import { IconStar, IconStarFilled } from "@tabler/icons-react";

type StarRatingProps = {
  rating: number;
  onChange?: (rating: number) => void;
};

export default function StarRating({ rating, onChange }: StarRatingProps) {
  return (
    <div className="flex space-x-1 cursor-pointer px-3">
      {[...Array(5)].map((_, i) => {
        const starIndex = i + 1;
        return (
          <span
            key={i}
            onClick={() => onChange?.(starIndex)}
            role="button"
            aria-label={`Set rating to ${starIndex} star${
              starIndex > 1 ? "s" : ""
            }`}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                onChange?.(starIndex);
              }
            }}
          >
            {i < rating ? (
              <IconStarFilled className="text-primary" size={16} />
            ) : (
              <IconStar className="text-primary" size={16} />
            )}
          </span>
        );
      })}
    </div>
  );
}
