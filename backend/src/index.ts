import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRouter from "./routes/auth";
import healthRouter from "./routes/health";
import registrationsRouter from "./routes/registrations";
import campsRouter from "./routes/camps";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Unter /api, damit der Vite-Dev-Proxy im Frontend (vite.config.ts) greift.
app.use("/api/health", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/registrations", registrationsRouter);
app.use("/api/camps", campsRouter);

const port = process.env.PORT ? parseInt(process.env.PORT) : 4000;
app.listen(port, () => {
  console.log(`Camp-Management backend läuft auf Port ${port}`);
});
