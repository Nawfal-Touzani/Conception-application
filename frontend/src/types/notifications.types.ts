export interface Notification {
  id: number;
  type: string;
  message: string;
  sendDate: string;
  read: boolean;
  membershipRequestId?: number;
  requestState?: string;
  matchId?: number;
  teamId?: number;
}
