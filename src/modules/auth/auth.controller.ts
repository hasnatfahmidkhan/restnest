import htppStatus from "http-status";
import type { Tnext, TReq, TRes } from "../../types";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { setAuthCookies } from "../../utils/setAuthCookie";
import { authService } from "./auth.service";
class AuthController {
  // register user
  register = catchAsync(async (req: TReq, res: TRes, next: Tnext) => {
    const user = await authService.registerUser(req.body);
    sendResponse(res, {
      success: true,
      statusCode: htppStatus.CREATED,
      message: "user registered successfully",
      data: user,
    });
  });

  // login user
  login = catchAsync(async (req: TReq, res: TRes, next: Tnext) => {
    const { user, accessToken, refreshToken } = await authService.loginUser(
      req.body,
    );

    setAuthCookies(res, "accessToken", accessToken);
    setAuthCookies(res, "refreshToken", refreshToken);

    sendResponse(res, {
      success: true,
      statusCode: htppStatus.OK,
      message: "User login successfully",
      data: {
        user,
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
      statusCode: htppStatus.OK,
      message: "User profile retrieved successfully",
      data: user,
    });
  });
}

export const authController = new AuthController();
