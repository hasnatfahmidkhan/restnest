import type { TRes } from "../types";

type TMeta = {
  page: number;
  limit: number;
  total: number;
};

type TResponseData<T> = {
  success?: boolean;
  statusCode: number;
  message: string;
  meta?: TMeta;
  data: T;
};

export const sendResponse = <T>(res: TRes, data: TResponseData<T>) => {
  res.status(data.statusCode).json({
    success: true,
    message: data.message,
    meta: data.meta,
    data: data.data,
  });
};
