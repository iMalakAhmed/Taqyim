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

export interface UserDTO {
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

export interface UpdateUserDto {
  firstName?: string | null;
  lastName?: string | null;
  bio?: string | null;
  profilePic?: string | null;
}

export interface BusinessLocationCreateDto {
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  label?: string | null;
}

export interface BusinessLocationUpdateDto {
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  label?: string | null;
}

export interface BusinessLocationDTO {
  locationId: number;
  businessId: number;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
  label?: string | null;
  createdAt: string;
}

export interface BusinessCreateDto {
  name: string;
  location?: string | null;
  category?: string | null;
  description?: string | null;
  logo?: string | null;
}

export interface BusinessUpdateDto {
  name?: string | null;
  category?: string | null;
  description?: string | null;
  logo?: string | null;
}

export interface BusinessDTO {
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
}

export interface ReviewDTO {
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
}

export interface CreateReviewDTO {
  businessId: number;
  rating: number;
  comment: string;
  tags?: string[] | null;
}

export interface UpdateReviewDTO {
  rating: number;
  comment: string;
  tags?: string[] | null;
}

export interface CommentDTO {
  commentId: number;
  commenterId: number;
  reviewId: number;
  content: string;
  createdAt: string;
  commenter: UserDTO;
}

export interface CreateCommentDTO {
  reviewId: number;
  content: string;
}

export interface ReactionDTO {
  reactionId: number;
  reviewId: number;
  userId: number;
  reactionType: string;
  createdAt: string;
  user: UserDTO;
}

export interface CreateReactionDTO {
  reviewId: number;
  reactionType: string;
}

export interface TagDTO {
  tagId: number;
  tagType: string;
  reviewId: number;
}

export interface ReviewImageDTO {
  reviewImageId: number;
  reviewId: number;
  imageUrl: string;
  caption?: string | null;
  createdAt: string;
  order: number;
}
