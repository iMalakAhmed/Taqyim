import { UserDTO } from './user';

export interface NotificationDTO {
  notificationId: number;
  userId: number;
  notificationType: string;
  senderId?: number;
  timestamp: Date;
  isRead: boolean;
  sender?: UserDTO;
  user: UserDTO;
}

export const NotificationTypes = {
  NEW_MESSAGE: 'NEW_MESSAGE',
  NEW_FOLLOWER: 'NEW_FOLLOWER',
  NEW_REVIEW: 'NEW_REVIEW',
  REVIEW_LIKED: 'REVIEW_LIKED',
  REVIEW_COMMENTED: 'REVIEW_COMMENTED',
  BADGE_EARNED: 'BADGE_EARNED',
  SYSTEM_NOTIFICATION: 'SYSTEM_NOTIFICATION',
} as const;

export type NotificationType = typeof NotificationTypes[keyof typeof NotificationTypes];

export function getNotificationMessage(notification: NotificationDTO): string {
  const senderName = notification.sender?.userName || 'Someone';
  
  switch (notification.notificationType) {
    case NotificationTypes.NEW_MESSAGE:
      return `${senderName} sent you a message`;
    case NotificationTypes.NEW_FOLLOWER:
      return `${senderName} started following you`;
    case NotificationTypes.NEW_REVIEW:
      return `${senderName} wrote a new review`;
    case NotificationTypes.REVIEW_LIKED:
      return `${senderName} liked your review`;
    case NotificationTypes.REVIEW_COMMENTED:
      return `${senderName} commented on your review`;
    case NotificationTypes.BADGE_EARNED:
      return `You earned a new badge!`;
    case NotificationTypes.SYSTEM_NOTIFICATION:
      return 'System notification';
    default:
      return 'New notification';
  }
} 