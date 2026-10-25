import dotenv from "dotenv";
import { app } from "./app.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`[EcoLens AI Server] Running on http://localhost:${PORT}`);
  console.log(`[EcoLens AI Server] Health check: http://localhost:${PORT}/api/health`);
});
