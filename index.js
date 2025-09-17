import express from "express";
import dotenv from "dotenv";
import apiRoutes from "./src/routes/api.routes.js";
import { connectToDevice} from "./src/services/zkService.js";
import { syncAttendance, syncUsers } from "./src/controllers/attendance.controller.js";
// import { syncAttendance as syncController } from "./src/controllers/attendance.controller.js";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
app.use(express.json());

// Allow all origins (not safe for production)
app.use(cors({
  origin: ["http://localhost:5173"], // your React URL
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  // allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));


app.use("/api", apiRoutes);

app.listen(PORT, async () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);

  // Connect to ZKTeco device
  await connectToDevice();

  // Auto-sync every 10 seconds
  setInterval(async () => {
    await syncAttendance();
    await syncUsers();
  }, 10000);
});
