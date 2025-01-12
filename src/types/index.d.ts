// in declaration file, you can not use import statement

// Declare the user object in the Express Request interface
declare namespace Express {
  export interface Request {
    user?: {
      id: number;
      username: string;
      name: string;
      email: string;
      role: "ADMIN" | "CUSTOMER";
    };

    cookies: {
      jwt: string;
      jwt_refresh: string;
    };
  }
}
