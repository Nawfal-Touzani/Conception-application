import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../contexts/useAuth';
import { useNavigate } from 'react-router-dom';
import * as adminService from '../../services/admin/admin.service';
import { MemberDto } from '../../types/admin.types';

const PAGE_SIZE = 4;

export function useAdmin() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const token = user?.token ?? '';

  const [admins, setAdmins] = useState<MemberDto[]>([]);
  const [allMembers, setAllMembers] = useState<MemberDto[]>([]);
  const [page, setPage] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [promoteOpen, setPromoteOpen] = useState(false);
  const [demoteTarget, setDemoteTarget] = useState<MemberDto | null>(null);

  useEffect(() => {
    if (user && user.role !== 'ADMIN') navigate('/');
  }, [user, navigate]);

  const loadAdmins = useCallback(() => {
    adminService
      .getAdmins(token)
      .then((data) => {
        const filtered = data.filter((m) => !m.isBan && m.tag !== user?.tag);
        setAdmins(filtered);
      })
      .catch(() => setError('Erreur lors du chargement des administrateurs.'));
  }, [token, user?.tag]);

  const loadAllMembers = useCallback(() => {
    adminService
      .getAllMembers(token)
      .then((data) =>
        setAllMembers(data.filter((m) => !m.isAdmin && !m.admin && !m.isBan)),
      )
      .catch(() => setError('Erreur lors du chargement des membres.'));
  }, [token]);

  useEffect(() => {
    if (user) {
      loadAdmins();
      loadAllMembers();
    }
  }, [user, loadAdmins, loadAllMembers]);

  const handlePromote = async (member: MemberDto) => {
    setError(null);
    setSuccess(null);

    const res = await adminService.promoteToAdmin(token, member.id);

    if (!res.ok) {
      setError('Impossible de nommer cet administrateur.');
      return;
    }
    setSuccess(`${member.tag} est maintenant administrateur.`);
    setPromoteOpen(false);
    loadAdmins();
    loadAllMembers();
  };

  const handleDemote = async () => {
    if (!demoteTarget) return;
    setError(null);
    setSuccess(null);

    const res = await adminService.revokeAdmin(token, demoteTarget.id);

    if (!res.ok) {
      setError('Impossible de révoquer cet administrateur.');
      setDemoteTarget(null);
      return;
    }
    const isSelf = demoteTarget.tag === user?.tag;
    setDemoteTarget(null);
    if (isSelf) {
      logout();
      navigate('/');
      return;
    }
    setSuccess(`${demoteTarget.tag} n'est plus administrateur.`);
    loadAdmins();
    loadAllMembers();
  };

  const totalPages = Math.ceil(admins.length / PAGE_SIZE);
  const paginated = admins.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return {
    user,
    admins,
    allMembers,
    page,
    setPage,
    error,
    setError,
    success,
    setSuccess,
    promoteOpen,
    setPromoteOpen,
    demoteTarget,
    setDemoteTarget,
    totalPages,
    paginated,
    handlePromote,
    handleDemote,
  };
}
