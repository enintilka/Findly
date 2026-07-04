export const AUTH_ROUTES = {
  home: "/",
  chooseAccount: "/login",
  register: "/register",
  customerLogin: "/customer/login",
  agencyLogin: "/agency/login",
  customerForgotPassword: "/customer/login/forgot-password",
  agencyForgotPassword: "/agency/login/forgot-password",
  resetPassword: "/auth/reset-password",
  customerSignup: "/customer/signup",
  agencySignup: "/agency/signup",
  customerDashboard: "/customer/dashboard",
  agencyDashboard: "/agency/dashboard",
} as const;

export type AccountType = "customer" | "agency";

export type ChooseAccountMode = "login" | "register";
