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
  const filter = searchParams.get('filter') || '';
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
      <Card className="mb-6 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 animate-fade-in-up border-2 border-gray-800 rounded-none bg-white">
        <CardContent className="p-6 flex flex-col md:flex-row items-start gap-6">
          <Avatar className="h-20 w-20 flex-shrink-0 border-2 border-gray-800">
            <AvatarFallback className="text-2xl font-serif bg-gray-100">{business.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="text-xl font-bold font-serif text-gray-900 mb-2">{business.name}</h3>
            <p className="text-base text-gray-600 font-serif mb-3">{business.category}</p>
            <div className="flex items-center gap-3 mb-3">
              <Star className="h-5 w-5 text-yellow-400" />
              <span className="text-gray-700 font-serif">{business.rating?.toFixed(1) || 'No ratings'}</span>
              <span className="text-gray-500 font-serif">({business.reviewCount} reviews)</span>
            </div>
            {business.businessLocations && business.businessLocations.length > 0 && (
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-gray-500" />
                <span className="text-sm text-gray-500 font-serif">{business.businessLocations[0].address}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );

  const renderUserCard = (user: SearchUserDTO) => (
    <Link href={`/profile/${user.userId}`} key={user.userId}>
      <Card className="mb-6 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 animate-fade-in-up border-2 border-gray-800 rounded-none bg-white">
        <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
          <Avatar className="h-20 w-20 flex-shrink-0 border-2 border-gray-800">
            <AvatarImage src={user.profilePic || undefined} />
            <AvatarFallback className="text-2xl font-serif bg-gray-100">{user.userName[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-xl font-bold font-serif text-gray-900 mb-2">{user.userName}</h3>
            <p className="text-base text-gray-600 font-serif">{user.email}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );

  const renderReviewCard = (review: SearchReviewDTO) => (
    <Link href={`/review/${review.reviewId}`} key={review.reviewId}>
      <Card className="mb-6 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 animate-fade-in-up border-2 border-gray-800 rounded-none bg-white">
        <CardContent className="p-6 flex flex-col md:flex-row items-start gap-6">
          <Avatar className="h-20 w-20 flex-shrink-0 border-2 border-gray-800">
            <AvatarImage src={review.userProfilePic || undefined} />
            <AvatarFallback className="text-2xl font-serif bg-gray-100">{review.userName[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <h3 className="text-xl font-bold font-serif text-gray-900">{review.userName}</h3>
              <span className="text-base text-gray-600 font-serif">reviewed</span>
              <Link href={`/business/${review.businessId}`} className="text-blue-600 hover:underline font-serif">
                {review.businessName}
              </Link>
            </div>
            <div className="flex items-center gap-3 mb-3">
              <Star className="h-5 w-5 text-yellow-400" />
              <span className="text-gray-700 font-serif">{review.rating}</span>
              <Clock className="h-5 w-5 text-gray-500 ml-2" />
              <span className="text-sm text-gray-500 font-serif">
                {new Date(review.createdAt).toLocaleDateString()}
              </span>
            </div>
            <p className="mt-3 text-gray-700 font-serif leading-relaxed">{review.comment}</p>
            <div className="flex items-center gap-4 mt-4">
              <span className="text-sm text-gray-500 font-serif">{review.commentsCount} comments</span>
              <span className="text-sm text-gray-500 font-serif">{review.reactionsCount} reactions</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );

  if (!query) {
    return (
      <div className="container mx-auto px-4 py-8 md:ml-96 pt-24 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 font-serif animate-fade-in-up">Search</h1>
        <p className="text-lg text-gray-500 font-serif animate-fade-in-up">Enter a search term to find businesses, users, and reviews.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:ml-96 pt-24 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 font-serif animate-fade-in-up">Search Results for "{query}"</h1>
      
      <div className="space-y-12">
        {filter === 'reviews' && reviewsData && reviewsData.items.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <MessageSquare className="h-6 w-6 text-gray-800" />
              <h2 className="text-2xl font-bold text-gray-800 font-serif animate-fade-in-up">Reviews</h2>
            </div>
            {isLoadingReviews ? (
              <div className="text-center py-8 text-gray-600 font-serif animate-pulse">Loading reviews...</div>
            ) : (
              <div className="space-y-6">
                {reviewsData.items.map(renderReviewCard)}
              </div>
            )}
          </div>
        )}

        {/* Businesses Section */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <Building2 className="h-6 w-6 text-gray-800" />
            <h2 className="text-2xl font-bold text-gray-800 font-serif animate-fade-in-up">Businesses</h2>
          </div>
          {isLoadingBusinesses ? (
            <div className="text-center py-8 text-gray-600 font-serif animate-pulse">Loading businesses...</div>
          ) : businessesData?.items.length ? (
            <div className="space-y-6">
              {businessesData.items.map(renderBusinessCard)}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 font-serif animate-fade-in-up">No businesses found</div>
          )}
        </div>

        {/* Users Section */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <Users className="h-6 w-6 text-gray-800" />
            <h2 className="text-2xl font-bold text-gray-800 font-serif animate-fade-in-up">Users</h2>
          </div>
          {isLoadingUsers ? (
            <div className="text-center py-8 text-gray-600 font-serif animate-pulse">Loading users...</div>
          ) : usersData?.items.length ? (
            <div className="space-y-6">
              {usersData.items.map(renderUserCard)}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 font-serif animate-fade-in-up">No users found</div>
          )}
        </div>

        {filter !== 'reviews' && reviewsData && reviewsData.items.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <MessageSquare className="h-6 w-6 text-gray-800" />
              <h2 className="text-2xl font-bold text-gray-800 font-serif animate-fade-in-up">Reviews</h2>
            </div>
            {isLoadingReviews ? (
              <div className="text-center py-8 text-gray-600 font-serif animate-pulse">Loading reviews...</div>
            ) : (
              <div className="space-y-6">
                {reviewsData.items.map(renderReviewCard)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 