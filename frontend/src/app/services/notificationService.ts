import { NotificationDTO } from '../types/notification';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7001/api';

export const notificationService = {
  // Get all notifications for the current user
  async getNotifications(): Promise<NotificationDTO[]> {
    const response = await fetch(`${API_URL}/notification`, {
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error('Failed to fetch notifications');
    }
    return response.json();
  },

  // Get unread notifications count
  async getUnreadCount(): Promise<number> {
    const response = await fetch(`${API_URL}/notification/unread/count`, {
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error('Failed to fetch unread count');
    }
    return response.json();
  },

  // Get unread notifications
  async getUnreadNotifications(): Promise<NotificationDTO[]> {
    const response = await fetch(`${API_URL}/notification/unread`, {
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error('Failed to fetch unread notifications');
    }
    return response.json();
  },

  // Mark a notification as read
  async markAsRead(notificationId: number): Promise<void> {
    const response = await fetch(`${API_URL}/notification/${notificationId}/read`, {
      method: 'PUT',
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error('Failed to mark notification as read');
    }
  },

  // Mark all notifications as read
  async markAllAsRead(): Promise<void> {
    const response = await fetch(`${API_URL}/notification/read-all`, {
      method: 'PUT',
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error('Failed to mark all notifications as read');
    }
  },

  // Delete a notification
  async deleteNotification(notificationId: number): Promise<void> {
    const response = await fetch(`${API_URL}/notification/${notificationId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error('Failed to delete notification');
    }
  },

  // Delete all notifications
  async deleteAllNotifications(): Promise<void> {
    const response = await fetch(`${API_URL}/notification`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error('Failed to delete all notifications');
    }
  },
}; 