import * as memberService from '../services/member/member.service';

export type UnavailabilityDates = {
  startDate: string;
  endDate: string;
};

export type UseUnavailabilitySection = {
  dates: UnavailabilityDates;
  error: string | null;
  success: boolean;
  openModal: boolean;
  unavailabilities: memberService.UnavailabilityDto[];
  loadingList: boolean;
  setStartDate: (value: string) => void;
  setEndDate: (value: string) => void;
  handleConfirm: () => Promise<void>;
  handleShowList: () => Promise<void>;
  handleCloseModal: () => void;
};
