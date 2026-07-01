export const AUTH_ROUTES = {
  chooseAccount: "/login",
  register: "/register",
  customerLogin: "/customer/login",
  agencyLogin: "/agency/login",
  customerSignup: "/customer/signup",
  agencySignup: "/agency/signup",
  customerDashboard: "/customer/dashboard",
  agencyDashboard: "/agency/dashboard",
} as const;

export type AccountType = "customer" | "agency";

export type ChooseAccountMode = "login" | "register";
