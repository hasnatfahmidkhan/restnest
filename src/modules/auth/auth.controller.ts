import httpStatus from "http-status";
import type { Tnext, TReq, TRes } from "../../types";
import catchAsync from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { setAuthCookies } from "../../utils/setAuthCookie";
import { authService } from "./auth.service";
class AuthController {
  // register user
  register = catchAsync(async (req: TReq, res: TRes, next: Tnext) => {
    const user = await authService.registerUser(req.body);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "user registered successfully",
      data: user,
    });
  });

  // login user
  login = catchAsync(async (req: TReq, res: TRes, next: Tnext) => {
    const { userData, accessToken, refreshToken } = await authService.loginUser(
      req.body,
    );

    setAuthCookies(res, "accessToken", accessToken);
    setAuthCookies(res, "refreshToken", refreshToken);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "User login successfully",
      data: {
        userData,
        accessToken,
        refreshToken,
      },
    });
  });

  // me
  getProfile = catchAsync(async (req: TReq, res: TRes, next: Tnext) => {
    const user = await authService.getProfile(req.user?.id as string);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "User profile retrieved successfully",
      data: user,
    });
  });

  // get new access token
  getNewAccessToken = catchAsync(async (req: TReq, res: TRes, next: Tnext) => {
    const accessToken = await authService.getNewAccessToken(
      req.user?.id as string,
    );

    setAuthCookies(res, "accessToken", accessToken);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "New access token generated successfully",
      data: {
        accessToken,
      },
    });
  });

  googleLogin = catchAsync(async (req: TReq, res: TRes) => {
    const payload = req.body;

    const result = await authService.googleLogin(payload);
    const { accessToken, refreshToken } = result;

    setAuthCookies(res, "accessToken", accessToken);
    setAuthCookies(res, "refreshToken", refreshToken);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "User logged in successfully",
      data: {
        accessToken,
        refreshToken,
      },
    });
  });
}

export const authController = new AuthController();
