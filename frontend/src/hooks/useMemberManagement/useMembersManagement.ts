import { useState, useEffect, useCallback } from 'react';
import * as adminService from '../../services/admin/admin.service';
import { MemberDto } from '../../types/admin.types';

export const useMembersManagement = (
  token: string,
  currentUserTag?: string,
) => {
  const [members, setMembers] = useState<MemberDto[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminService.getAllMembers(token);
      setMembers(data);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) fetchMembers();
  }, [token, fetchMembers]);

  const handleBan = async (memberId: number, reason: string) => {
    const res = await adminService.banMember(token, memberId, reason);
    if (res.ok) await fetchMembers();
    else throw new Error('Erreur lors du bannissement');
  };

  const activeMembers = members.filter(
    (m) => !m.isBan && m.tag !== currentUserTag,
  );
  const bannedMembers = members.filter(
    (m) => m.isBan && m.tag !== currentUserTag,
  );

  return { activeMembers, bannedMembers, loading, handleBan };
};
