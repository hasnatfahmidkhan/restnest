import jwt, { type JwtPayload, type SignOptions } from "jsonwebtoken";

const createJWTToken = (
  payload: JwtPayload,
  secret: string,
  expiresIn: SignOptions,
) => {
  const token = jwt.sign(payload, secret, {
    expiresIn,
  } as SignOptions);

  return token;
};

const verifyJWTToken = (accessToken: string, secret: string) => {
  try {
    const verifiedToken = jwt.verify(accessToken, secret);
    return {
      verifiedToken,
      success: true,
    };
  } catch (error: any) {
    console.log("Token verification failed!");
    return {
      success: false,
      error: error.message,
    };
  }
};

export const jwtUtils = {
  createJWTToken,
  verifyJWTToken,
};
