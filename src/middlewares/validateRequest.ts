import type { RequestHandler } from "express";
import type { ZodType } from "zod";
import type { Tnext, TReq, TRes } from "../types";

const validateRequest = (schema: ZodType): RequestHandler => {
  return (req: TReq, res: TRes, next: Tnext) => {
    schema.parse({
      body: req.body,
      params: req.params,
      query: req.query,
    });
    next();
  };
};

export default validateRequest;
