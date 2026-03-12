const API_URL = 'http://localhost:3000';

export const approveRequest = async (
  membershipRequestId: number,
  token: string,
): Promise<void> => {
  await fetch(`${API_URL}/membership-requests/${membershipRequestId}/approve`, {
    method: 'PATCH',  
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const refuseRequest = async (
  membershipRequestId: number,
  reason: string,
  token: string,
): Promise<void> => {
  await fetch(`${API_URL}/membership-requests/${membershipRequestId}/refuse`, {
    method: 'PATCH',  
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ reason }),
  });
};