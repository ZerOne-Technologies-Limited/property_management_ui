
export type loginModel = {
  PhoneNumber: string;
  Password: string;
};

export type LoginResponse = {
    Token: string;
    ExpiresAt: Date;
}
