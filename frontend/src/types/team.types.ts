export interface TeamDto {
  id: number;
  name: string;
  responsibleTag: string | null;
  secondResponsibleTag: string | null;
  creationDate: string | null;
}

export interface TeamMember {
  memberId: number;
  gameTag: string;
  avatarUrl: string;
  isAvailable: boolean;
}
