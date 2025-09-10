export interface AuthenticationResponse{
  userId?: number;
  userFirstName?: string;
  userLastName?: string;
  userRole?: string;
  accessToken?: string;
  mfaEnabled?: string;
  secretImageUri?: string;
}
