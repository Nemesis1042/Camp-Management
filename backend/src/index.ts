import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRouter from "./routes/auth";
import healthRouter from "./routes/health";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/health", healthRouter);
app.use("/auth", authRouter);

const port = process.env.PORT ? parseInt(process.env.PORT) : 4000;
app.listen(port, () => {
  console.log(`Camp-Management backend läuft auf Port ${port}`);
});
