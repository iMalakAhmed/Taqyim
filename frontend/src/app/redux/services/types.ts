export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export interface UserType {
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
}

export interface UpdateUserType {
  firstName?: string | null;
  lastName?: string | null;
  bio?: string | null;
  profilePic?: string | null;
}

export interface BusinessLocationCreateType {
  locationId: number;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  label?: string | null;
}

export interface BusinessLocationUpdateType {
  locationId: number;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  label?: string | null;
}

export interface BusinessLocationType {
  locationId: number;
  businessId: number;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
  label?: string | null;
  createdAt: string;
}

export interface BusinessCreateType {
  name: string;
  location?: string | null;
  category?: string | null;
  description?: string | null;
  logo?: string | null;
}

export interface BusinessUpdateType {
  name?: string | null;
  category?: string | null;
  description?: string | null;
  logo?: string | null;
}

export interface BusinessType {
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
  user: UserType;
  verifiedByUser?: UserType | null;
  businessLocations: BusinessLocationType[];
}

export interface ReviewType {
  reviewId: number;
  userId: number;
  businessId: number;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt?: string | null;
  savedAt?: string | null;
  user: UserType;
  business: BusinessType;
  comments: CommentType[];
  reactions: ReactionType[];
  tags: TagType[];
  images: ReviewImageType[];
}

export interface CreateReviewType {
  businessId: number;
  rating: number;
  comment: string;
  tags?: string[] | null;
}

export interface UpdateReviewType {
  rating: number;
  comment: string;
  tags?: string[] | null;
}

export interface CommentType {
  commentId: number;
  commenterId: number;
  reviewId: number;
  content: string;
  createdAt: string;
  commenter: UserType;
}

export interface CreateCommentType {
  reviewId: number;
  content: string;
}

export interface ReactionType {
  reactionId: number;
  reviewId: number;
  userId: number;
  reactionType: string;
  createdAt: string;
  user: UserType;
}

export interface CreateReactionType {
  reviewId: number;
  reactionType: string;
}

export interface TagType {
  tagId: number;
  tagType: string;
  reviewId: number;
}

export interface ReviewImageType {
  reviewImageId: number;
  reviewId: number;
  imageUrl: string;
  caption?: string | null;
  createdAt: string;
  order: number;
}
