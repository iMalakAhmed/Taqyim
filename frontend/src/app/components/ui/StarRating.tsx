import { IconStar, IconStarFilled } from "@tabler/icons-react";

export default function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex space-x-1 cursor-pointer px-3">
      {[...Array(5)].map((_, i) => (
        <span key={i}>
          {i < rating ? (
            <IconStarFilled className="text-primary" size={16} />
          ) : (
            <IconStar className="text-primary" size={16} />
          )}
        </span>
      ))}
    </div>
  );
}
