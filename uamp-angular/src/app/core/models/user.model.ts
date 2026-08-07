export type UserRole = 'student' | 'teacher' | 'admin';

export interface User {
  id: string;
  institutionId: string;
  email: string;
  fullName: string;
  role: UserRole;
  enrollmentNumber?: string;
  employeeCode?: string;
  isActive: boolean;
  mfaEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface JwtClaims {
  sub: string;
  role: UserRole;
  institutionId: string;
  permissions: string[];
  sessionId: string;
  iat: number;
  exp: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
  institutionCode: string;
  enrollmentNumber?: string;
  employeeCode?: string;
}
