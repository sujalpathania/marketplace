export interface User {
  id: string;
  fullName: string;
  email: string;
  studentId?: string;
  createdAt?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}
