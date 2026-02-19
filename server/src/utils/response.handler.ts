import { Response } from "express";

interface IApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export class ApiResponse {
  static success<T>(
    res: Response,
    message: string,
    data?: T,
    statusCode: number = 200,
  ) {
    const response: IApiResponse<T> = {
      success: true,
      message,
      data,
    };
    return res.status(statusCode).json(response);
  }

  static error(
    res: Response,
    message: string,
    error?: any,
    statusCode: number = 500,
  ) {
    const response: IApiResponse<null> = {
      success: false,
      message,
      error: error?.message || error || "Internal Server Error",
    };
    return res.status(statusCode).json(response);
  }

  static unauthorized(res: Response, message: string = "Unauthorized") {
    return res.status(401).json({
      success: false,
      message,
    });
  }
}
