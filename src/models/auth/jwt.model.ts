export type JWTModel = {
  username: string;
  email: string;
  role: "ADMIN" | "CUSTOMER";
};

export type JWTRefreshModel = {
  username: string;
  email: string;
  role: "ADMIN" | "CUSTOMER";
};
