"use client";
import Link from "next/link";
import {
  useGetRecommendedBusinessesQuery,
  useGetRecommendedUsersQuery,
  useGetRecommendedReviewsQuery,
} from "../redux/services/recommendationApi";
import { useGetCurrentUserQuery } from "../redux/services/authApi";
import HorizontalLine from "./ui/HorizontalLine";

export default function Recommendations() {
  const { data: currentUser, isLoading: userLoading } =
    useGetCurrentUserQuery();
  const userId = currentUser?.userId;

  const { data: businesses } = useGetRecommendedBusinessesQuery(userId!, {
    skip: !userId,
  });
  const { data: users } = useGetRecommendedUsersQuery(userId!, {
    skip: !userId,
  });
  const { data: reviews } = useGetRecommendedReviewsQuery(userId!, {
    skip: !userId,
  });

  if (userLoading || !userId) return null;

  return (
    <aside className="hidden lg:block font-heading fixed right-0 top-28 w-80 h-[calc(100vh-7rem)] overflow-y-auto mr-10  bg-background text-text space-y-10">
      <section>
        <h2 className="text-xl font-bold mb-2">Recommended Businesses</h2>
        <HorizontalLine />
        <div className="space-y-3">
          {businesses?.map((b) => (
            <Link href={`/Business/${b.businessId}`} key={b.businessId}>
              <div className="p-4 rounded-xl shadow hover:shadow-md transition cursor-pointer">
                <h3 className="text-base font-semibold">{b.name}</h3>
                <p className="text-sm line-clamp-2">{b.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-2">Recommended Users</h2>
        <HorizontalLine />
        <div className="space-y-3">
          {users?.map((u) => (
            <Link href={`/profile/${u.userId}`} key={u.userId}>
              <div className="p-4 rounded-xl shadow hover:shadow-md transition cursor-pointer">
                <h3 className="text-base font-semibold">@{u.userName}</h3>
                <p className="text-sm">Reputation: {u.reputationPoints}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-2">Recommended Reviews</h2>
        <HorizontalLine />
        <div className="space-y-3">
          {reviews?.map((r) => (
            <div key={r.reviewId} className="p-4 rounded-xl shadow">
              <p className="text-sm mb-1 line-clamp-3">{r.comment}</p>
              <p className="text-xs">
                Rated: {r.rating} ★ |{" "}
                {new Date(r.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </section>
    </aside>
  );
}
