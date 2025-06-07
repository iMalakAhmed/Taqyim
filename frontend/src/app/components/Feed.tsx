import CreateReview from "./CreateReview";
import ReactionButtons from "./ReactionButtons";
import Review from "./ui/Review";

export default function Feed() {
  return (
    <div>
      <div>
        <Review reviewId={4} />
        {/* <Review reviewId={5} /> */}
        <CreateReview />
        {/* <ReactionButtons /> */}
      </div>
    </div>
  );
}
