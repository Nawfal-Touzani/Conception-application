export interface Notification {
  id: number;
  type:
    | 'RESULT'
    | 'RESULT_CONFIRMATION'
    | 'RESULT_REFUSED'
    | 'MEMBERSHIP_REQUEST';
  message: string;
  sendDate: string;
  read: boolean;
  membershipRequestId?: number;
  requestState?: string;
  matchId?: number;
  teamId?: number;
}
