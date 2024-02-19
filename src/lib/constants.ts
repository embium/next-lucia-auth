export const APP_TITLE = "Conspiray Expert";
export const EMAIL_SENDER = '"Conspiracy Expert" <noreply@conspiracy-expert.online>';

export const redirects = {
  toLogin: "/login",
  toSignup: "/signup",
  afterLogin: "/dashboard",
  afterLogout: "/",
  toVerify: "/verify-email",
  afterVerify: "/dashboard",
} as const;