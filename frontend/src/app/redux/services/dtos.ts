export type UserDTO = {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  type: string;
  businessName?: string | null;
  businessCategory?: string | null;
  businessDescription?: string | null;
  businessAddress?: string | null;
  businessLatitude?: number | null;
  businessLongitude?: number | null;
  isVerified: boolean;
  profilePic?: string | null;
  bio?: string | null;
  createdAt: string;
  reputationPoints: number;
};

export type UpdateUserDTO = {
  firstName?: string | null;
  lastName?: string | null;
  bio?: string | null;
  profilePic?: string | null;
};

export type BusinessLocationCreateDto = {
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  label?: string | null;
};

export type BusinessLocationUpdateDto = {
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  label?: string | null;
};

export type BusinessLocationDTO = {
  locationId: number;
  businessId: number;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
  label?: string | null;
  createdAt: string;
};

export type BusinessCreateDto = {
  name: string;
  location?: string | null;
  category?: string | null;
  description?: string | null;
  logo?: string | null;
};

export type BusinessUpdateDto = {
  name?: string | null;
  category?: string | null;
  description?: string | null;
  logo?: string | null;
};

export type BusinessDTO = {
  businessId: number;
  userId: number;
  name: string;
  category: string;
  description: string;
  logo?: string | null;
  location?: string | null;
  createdAt: string;
  isVerified: boolean;
  verifiedByUserId?: number | null;
  user: UserDTO;
  verifiedByUser?: UserDTO | null;
  businessLocations: BusinessLocationDTO[];
};

export type ReviewDTO = {
  reviewId: number;
  userId: number;
  businessId: number;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt?: string | null;
  savedAt?: string | null;
  user: UserDTO;
  business: BusinessDTO;
  comments: CommentDTO[];
  reactions: ReactionDTO[];
  tags: TagDTO[];
  images: ReviewImageDTO[];
};

export type CreateReviewDTO = {
  businessId: number;
  rating: number;
  comment: string;
  tags?: string[] | null;
};

export type UpdateReviewDTO = {
  rating: number;
  comment: string;
  tags?: string[] | null;
};

export type CommentDTO = {
  commentId: number;
  commenterId: number;
  reviewId: number;
  content: string;
  createdAt: string;
  commenter: UserDTO;
};

export type CreateCommentDTO = {
  reviewId: number;
  content: string;
};

export type ReactionDTO = {
  reactionId: number;
  reviewId: number;
  userId: number;
  reactionType: string;
  createdAt: string;
  user: UserDTO;
};

export type CreateReactionDTO = {
  reviewId: number;
  reactionType: string;
};

export type TagDTO = {
  tagId: number;
  tagType: string;
  reviewId: number;
};

export type ReviewImageDTO = {
  reviewImageId: number;
  reviewId: number;
  imageUrl: string;
  caption?: string | null;
  createdAt: string;
  order: number;
};
