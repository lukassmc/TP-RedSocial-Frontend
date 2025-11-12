
export interface User {
  _id: string;
  nombre: string;
  apellido: string;
  email: string;
  username: string;
  profilePicture?: string;
  role: string;
  birthdate?: string;
}

export interface LoginCredentials {
  identifier: string;
  password: string;
}

export interface RegisterData {
  nombre: string;
  apellido: string;
  email: string;
  username: string;
  password: string;
  birthdate: string;
  descripcion?: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
}