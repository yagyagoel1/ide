import { json, urlencoded } from "body-parser";
import express, { type Express } from "express";
import morgan from "morgan";
import cors from "cors";
import indexv1Router from "./routes/v1/index";
import indexv2Router from "./routes/v2/index";
import dotenv from "dotenv"
export const createServer = (): Express => {
  dotenv.config()
  const app = express();
  app
    .disable("x-powered-by")
    .use(morgan("dev"))
    .use(urlencoded({ extended: true }))
    .use(json())
    .use(cors({
      origin:"*"
    }))
    .use("/api/v1",indexv1Router)
    .use("/api/v2",indexv2Router)

  return app;
};
