// FORMS

export type LoginFormType = {
  email: string;
  password: string;
  rememberMe?: boolean;
};

export type RegisterFormType = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};
