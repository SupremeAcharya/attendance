import express from "express";
import dotenv from "dotenv";
import apiRoutes from "./src/routes/api.routes.js";
import { connectToDevice} from "./src/services/zkService.js";
import { syncAttendance } from "./src/controllers/attendance.controller.js";
// import { syncAttendance as syncController } from "./src/controllers/attendance.controller.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use("/api", apiRoutes);

app.listen(PORT, async () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);

  // Connect to ZKTeco device
  await connectToDevice();

  // Auto-sync every 10 seconds
  setInterval(async () => {
    await syncAttendance();
  }, 10000);
});
