interface AuthContextType {
  authenticatedMember: MaybeAuthenticatedMember;
  registerMember: (newMember: MemberRegisterRequest) => Promise<void>;
  loginMember: (credentials: Credentials, rememberMe: boolean) => Promise<void>;
  clearMember: () => void;
}

interface Credentials {
  email: string;
  password: string;
}

interface MemberRegisterRequest {
  email: string;
  password: string;
  tag: string;
  imageId: number;
  specialityId: number;
}

interface AuthenticatedMember {
  id: number;
  email: string;
  tag: string;
  role: string;
  token: string;
}

type MaybeAuthenticatedMember = AuthenticatedMember | undefined;

export type {
  Credentials,
  MemberRegisterRequest,
  AuthenticatedMember,
  MaybeAuthenticatedMember,
  AuthContextType,
};
