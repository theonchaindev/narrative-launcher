export type NarrativeStatus =
  | 'pending'
  | 'qualified'
  | 'active'
  | 'launched'
  | 'rejected'
  | 'source_deleted'
  | 'expired';

export type ModerationStatus = 'pending' | 'approved' | 'rejected' | 'appealed';

export interface XPost {
  id: string;
  tweetId: string;
  authorId: string;
  authorUsername: string;
  text: string;
  createdAtX: string;
  likeCount: number;
  repostCount: number;
  replyCount: number;
  quoteCount: number;
  viewCount: number;
  mediaUrls: string[];
  canonicalUrl: string;
  isEdited: boolean;
  isDeleted: boolean;
}

export interface Narrative {
  id: string;
  xPost: XPost;
  status: NarrativeStatus;
  ticker: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  bannerUrl: string | null;
  narrativeScore: number;
  tickerConfidence: number;
  moderationStatus: ModerationStatus;
  botRepliedAt: string | null;
  isFeatured: boolean;
  viewCount: number;
  launchCount: number;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface NarrativeListItem {
  id: string;
  ticker: string;
  name: string;
  imageUrl: string | null;
  narrativeScore: number;
  status: NarrativeStatus;
  xPost: Pick<XPost, 'tweetId' | 'authorUsername' | 'text' | 'likeCount' | 'repostCount' | 'viewCount' | 'canonicalUrl'>;
  launchCount: number;
  createdAt: string;
}
