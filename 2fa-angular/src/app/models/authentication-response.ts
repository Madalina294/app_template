export interface AuthenticationResponse{
  userId: number;
  userFirstName: string;
  userLastName: string;
  userRole: string;
  image?: string;
  accessToken?: string;
  mfaEnabled?: boolean;
  secretImageUri?: string;
}
