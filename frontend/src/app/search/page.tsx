'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSearchBusinessesQuery, useSearchUsersQuery, useSearchReviewsQuery } from '@/app/redux/services/searchApi';
import { SearchBusinessDTO, SearchReviewDTO, SearchUserDTO } from '@/app/redux/services/types';
import { Card, CardContent } from '@/app/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { Star, MapPin, Clock, Users, Building2, MessageSquare } from 'lucide-react';
import Link from 'next/link';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data: businessesData, isLoading: isLoadingBusinesses } = useSearchBusinessesQuery(
    { query, page, pageSize },
    { skip: !query }
  );

  const { data: usersData, isLoading: isLoadingUsers } = useSearchUsersQuery(
    { query, page, pageSize },
    { skip: !query }
  );

  const { data: reviewsData, isLoading: isLoadingReviews } = useSearchReviewsQuery(
    { query, page, pageSize },
    { skip: !query }
  );

  useEffect(() => {
    setPage(1);
  }, [query]);

  const renderBusinessCard = (business: SearchBusinessDTO) => (
    <Link href={`/business/${business.businessId}`} key={business.businessId}>
      <Card className="mb-4 hover:shadow-lg transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={business.profilePic} />
              <AvatarFallback>{business.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{business.name}</h3>
              <p className="text-sm text-gray-500">{business.category}</p>
              <div className="flex items-center gap-2 mt-2">
                <Star className="h-4 w-4 text-yellow-400" />
                <span>{business.rating?.toFixed(1) || 'No ratings'}</span>
                <span className="text-gray-500">({business.reviewCount} reviews)</span>
              </div>
              {business.businessLocations && business.businessLocations.length > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-500">{business.businessLocations[0].address}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );

  const renderUserCard = (user: SearchUserDTO) => (
    <Link href={`/profile/${user.userId}`} key={user.userId}>
      <Card className="mb-4 hover:shadow-lg transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarImage src={user.profilePic} />
              <AvatarFallback>{user.userName[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold">{user.userName}</h3>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );

  const renderReviewCard = (review: SearchReviewDTO) => (
    <Link href={`/review/${review.reviewId}`} key={review.reviewId}>
      <Card className="mb-4 hover:shadow-lg transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <Avatar>
              <AvatarImage src={review.userProfilePic} />
              <AvatarFallback>{review.userName[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">{review.userName}</h3>
                <span className="text-sm text-gray-500">reviewed</span>
                <Link href={`/business/${review.businessId}`} className="text-blue-500 hover:underline">
                  {review.businessName}
                </Link>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Star className="h-4 w-4 text-yellow-400" />
                <span>{review.rating}</span>
                <Clock className="h-4 w-4 text-gray-500 ml-2" />
                <span className="text-sm text-gray-500">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="mt-2 text-gray-700">{review.comment}</p>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-sm text-gray-500">{review.commentsCount} comments</span>
                <span className="text-sm text-gray-500">{review.reactionsCount} reactions</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );

  if (!query) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Search</h1>
        <p className="text-gray-500">Enter a search term to find businesses, users, and reviews.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Search Results for "{query}"</h1>
      
      <div className="space-y-8">
        {/* Businesses Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Businesses</h2>
          </div>
          {isLoadingBusinesses ? (
            <div className="text-center py-4">Loading businesses...</div>
          ) : businessesData?.items.length ? (
            <div>
              {businessesData.items.map(renderBusinessCard)}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">No businesses found</div>
          )}
        </div>

        {/* Users Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Users</h2>
          </div>
          {isLoadingUsers ? (
            <div className="text-center py-4">Loading users...</div>
          ) : usersData?.items.length ? (
            <div>
              {usersData.items.map(renderUserCard)}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">No users found</div>
          )}
        </div>

        {/* Reviews Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Reviews</h2>
          </div>
          {isLoadingReviews ? (
            <div className="text-center py-4">Loading reviews...</div>
          ) : reviewsData?.items.length ? (
            <div>
              {reviewsData.items.map(renderReviewCard)}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">No reviews found</div>
          )}
        </div>
      </div>
    </div>
  );
} 