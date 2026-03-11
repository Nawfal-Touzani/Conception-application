import { Notification } from '../types/notifications.types';

const API_URL = '/api/members';

// Get all notifications for a member (optional filter by read status)
export const getNotifications = async (
  memberId: number,
  token: string,
  read?: boolean,
): Promise<Notification[]> => {
  const url =
    read !== undefined
      ? `${API_URL}/${memberId}/notifications?read=${read}`
      : `${API_URL}/${memberId}/notifications`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) throw new Error('Error when fetch notifications');
  return response.json();
};

// Mark a notification as read

export const markAsRead = async (
  memberId: number,
  notificationId: number,
  token: string,
): Promise<Notification> => {
  const response = await fetch(
    `${API_URL}/${memberId}/notifications/${notificationId}`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) throw new Error('Erreur lors du marquage comme lu');
  return response.json();
};
