import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPublicMemberById } from '../../services/memberService';
import { PublicMember } from '../../types/publicMember';

export const usePublicMember = (id: string | undefined) => {
  const navigate = useNavigate();
  const [member, setMember] = useState<PublicMember | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    getPublicMemberById(id)
      .then(setMember)
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  return { member, loading };
};
