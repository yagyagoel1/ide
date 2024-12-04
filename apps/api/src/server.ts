import { json, urlencoded } from "body-parser";
import express, { type Express } from "express";
import morgan from "morgan";
import cors from "cors";
import indexRouter from "./routes/index";
import dotenv from "dotenv"
export const createServer = (): Express => {
  dotenv.config()
  const app = express();
  app
    .disable("x-powered-by")
    .use(morgan("dev"))
    .use(urlencoded({ extended: true }))
    .use(json())
    .use(cors())
    .use("/api/v1",indexRouter)

  return app;
};
