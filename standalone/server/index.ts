import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import express from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import pino from "pino";
import router from "./routes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const logger = pino({
  transport:
    process.env.NODE_ENV !== "production"
      ? { target: "pino-pretty" }
      : undefined,
});

const app = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return { id: req.id, method: req.method, url: req.url?.split("?")[0] };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  })
);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

const isProduction = process.env.NODE_ENV === "production";
const clientDist = path.resolve(__dirname, "../../client/dist");

if (isProduction && fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

const port = Number(process.env.PORT) || 3000;
app.listen(port, "0.0.0.0", () => {
  logger.info(`Server listening on port ${port}`);
});
