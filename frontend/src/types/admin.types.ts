export interface MemberDto {
  id: number;
  email: string;
  tag: string;
  speciality: string;
  teamName: string | null;
  profileImage: string | null;
  isAvailable: boolean;
  isAdmin: boolean;
  admin: boolean;
  isBan: boolean;
}
