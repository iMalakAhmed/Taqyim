export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  userName: string;
  type?: "User" | "Business";
  businessName?: string;
  businessCategory?: string;
  businessDescription?: string;
  businessAddress?: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    userName: string;
  };
  redirectUrl?: string;
}

export interface UserType {
  userId: number;
  email: string;
  userName: string;
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
  reviews: ReviewType[];
  ConnectionFollowers?: UserType[];
  ConnectionFollowings?: UserType[];
}

export interface UpdateUserType {
  userName?: string | null;
  bio?: string | null;
  profilePic?: string | null;
}

export interface ConnectionType {
  connectionId: number;
  userId: number;
  connectedUserId: number;
  createdAt: string;
  user: UserType;
  connectedUser: UserType;
}

export interface ProductType {
  productId: number;
  businessId: number;
  name: string;
  description?: string | null;
}

export interface BusinessLocationCreateType {
  locationId?: number;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  label?: string | null;
}

export interface BusinessLocationUpdateType {
  locationId?: number;
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
  category?: string[] | null;
  description?: string | null;
  logo?: string | null;
}

export interface BusinessUpdateType {
  name?: string | null;
  category?: string[] | null;
  description?: string | null;
  logo?: string | null;
}

export interface BusinessType {
  businessId: number;
  userId: number;
  name: string;
  category: string[];
  description: string;
  logo?: string | null;
  location?: string | null;
  createdAt: string;
  isVerified: boolean;
  verifiedByUserId?: number | null;
  owner: UserType;
  verifiedByUser?: UserType | null;
  businessLocations: BusinessLocationType[];
  products?: ProductType[] | null;
}

export interface ReviewType {
  reviewId: number;
  userId: number;
  businessId: number;
  productId?: number;
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
  mediaIds?: number[];
  media?: MediaType[];
}

export interface CreateReviewType {
  businessId: number;
  productId?: number;
  rating: number;
  comment: string;
  tags?: string[] | null;
  mediaIds?: number[];
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
  isDeleted?: boolean;
  createdAt: string;
  parentCommentId?: number | null;
  commenter: UserType;
  replies?: CommentType[];
  reactions?: CommentReactionType[];
}

export interface CreateCommentType {
  reviewId: number;
  content: string;
  parentCommentId?: number | null;
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

export interface CommentReactionType {
  commentReactionId: number;
  userId: number;
  reactionType: string;
  createdAt: string | null;
}

export interface CreateCommentReactionType {
  commentId: number;
  reactionType: string;
}

export interface TagType {
  tagId: number;
  tagType: string;
  reviewId: number;
}

export interface MediaType {
  mediaId: number;
  userId: number;
  reviewId?: number;
  fileName: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
  user: UserType;
}

export interface SearchUserDTO {
  userId: number;
  userName: string;
  email: string;
  type: string;
  profilePic: string | null;
}

export interface SearchBusinessDTO {
  businessId: number;
  name: string;
  category: string;
  description: string;
  rating: number | null;
  priceRange: number | null;
  createdAt: string;
  reviewCount: number;
  businessLocations: BusinessLocationType[];
}

export interface SearchReviewDTO {
  reviewId: number;
  comment: string;
  rating: number;
  createdAt: string;
  updatedAt: string | null;
  businessName: string;
  businessId: number;
  userName: string;
  userId: number;
  userProfilePic: string | null;
  commentsCount: number;
  reactionsCount: number;
  tags: string[];
}

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
}
