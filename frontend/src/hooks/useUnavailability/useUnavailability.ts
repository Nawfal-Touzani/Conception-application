import { useState } from 'react';
import { useAuth } from '../../contexts/useAuth';
import * as memberService from '../../services/member/member.service';
import { validateUnavailabilityDates } from '../../utils/Unavailability/unavailability.utils';
import type { UseUnavailabilitySection } from '../../types/unavailability.types';

export const useUnavailability = (): UseUnavailabilitySection => {
  const { user } = useAuth();
  const [dates, setDates] = useState({ startDate: '', endDate: '' });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [unavailabilities, setUnavailabilities] = useState<
    memberService.UnavailabilityDto[]
  >([]);
  const [loadingList, setLoadingList] = useState(false);

  const setStartDate = (value: string) =>
    setDates((prev) => ({ ...prev, startDate: value }));
  const setEndDate = (value: string) =>
    setDates((prev) => ({ ...prev, endDate: value }));
  const handleCloseModal = () => setOpenModal(false);

  const handleConfirm = async () => {
    if (!user?.token) return;
    setError(null);
    setSuccess(false);

    const validationError = validateUnavailabilityDates(dates);
    if (validationError) {
      setError(validationError);
      return;
    }

    const isSuccess = await memberService.addUnavailability(
      user.token,
      dates.startDate,
      dates.endDate,
    );

    if (isSuccess) {
      setSuccess(true);
      setDates({ startDate: '', endDate: '' });
      setTimeout(() => setSuccess(false), 3000);
    } else {
      setError('Erreur : Dates invalides');
    }
  };

  const handleShowList = async () => {
    if (!user?.token) return;
    setOpenModal(true);
    setLoadingList(true);
    try {
      const data = await memberService.getMyUnavailabilities(user.token);
      setUnavailabilities(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingList(false);
    }
  };

  return {
    dates,
    error,
    success,
    openModal,
    unavailabilities,
    loadingList,
    setStartDate,
    setEndDate,
    handleConfirm,
    handleShowList,
    handleCloseModal,
  };
};
