export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  tag: string;
  imageId: number;
  specialityId: number;
}

export interface AuthenticatedMember {
  id: number;
  email: string;
  tag: string;
  role: string;
  token: string;
}
