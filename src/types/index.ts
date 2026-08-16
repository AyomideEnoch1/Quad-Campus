export interface School {
  id: string;
  name: string;
  shortName: string;
  domain: string;
}

export type UserRole = 'student' | 'club_admin' | 'school_admin' | 'super_admin' | 'advertiser' | 'ads_reviewer';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  username: string;
  role?: UserRole;
  roles?: UserRole[];
  schoolId: string;
  schoolName: string;
  isVerifiedSchool: boolean;
  bio?: string;
  major?: string;
  gradYear?: number;
  avatarUrl?: string;
  bannerUrl?: string;
  followersCount?: number;
  followingCount?: number;
  likesReceived?: number;
  pushToken?: string;
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface Poll {
  question: string;
  options: PollOption[];
  userVotedOption?: string;
}

export interface PostComment {
  id: string;
  authorId?: string;
  authorName: string;
  authorAvatar?: string;
  text: string;
  createdAt: string;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorAvatar: string;
  authorSchoolId: string;
  authorSchoolName: string;
  authorRole?: UserRole;
  isVerifiedAuthor: boolean;
  content: string;
  mediaUrls?: string[];
  mediaType?: 'image' | 'video' | null;
  poll?: Poll | null;
  likesCount: number;
  repostsCount?: number;
  commentsCount: number;
  isLiked?: boolean;
  likedBy?: string[];
  scope: 'my_school' | 'all_schools';
  createdAt: string;
  isSponsored?: boolean;
  advertiserName?: string;
  advertiserAvatar?: string;
  headline?: string;
  imageUrl?: string;
  ctaText?: string;
  ctaUrl?: string;
  advertiserId?: string;
}

export interface MarketplaceItem {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerAvatar?: string;
  sellerSchoolId?: string;
  sellerSchoolName?: string;
  isVerifiedSeller?: boolean;
  title: string;
  price: number;
  category: string;
  condition: string;
  description: string;
  imageUrl: string;
  location?: string;
  status?: 'available' | 'sold';
  createdAt?: string;
}

export interface Club {
  id: string;
  name: string;
  tagline: string;
  schoolId: string;
  schoolName: string;
  isInterSchool: boolean;
  category: string;
  memberCount: number;
  logoUrl: string;
  bannerUrl: string;
  description: string;
  isJoined?: boolean;
}

export interface ClubMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  senderRole?: UserRole;
  text: string;
  mediaUrl?: string;
  time?: string;
  createdAt?: any;
}

export interface DirectChatMessage {
  id: string;
  senderUid: string;
  text: string;
  createdAt: any;
}

export interface ChatPartner {
  uid: string;
  displayName: string;
  avatarUrl?: string;
  schoolName?: string;
  isVerifiedSchool?: boolean;
}

export interface Chat {
  id: string;
  partner: ChatPartner;
  lastMessage: string;
  lastMessageTime: string;
  unread?: number;
  itemContext?: MarketplaceItem;
  messages?: DirectChatMessage[];
}

export interface NotificationItem {
  id: string;
  title: string;
  message?: string;
  body?: string;
  time?: string;
  type: 'like' | 'market' | 'club' | 'message' | 'verification';
  read: boolean;
  avatar?: string;
}
