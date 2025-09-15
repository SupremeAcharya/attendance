import express from "express";
import { fetchAttendance, addUser,removeUser } from "../controllers/attendance.controller.js";

const router = express.Router();

router.get("/attendance", fetchAttendance);
router.post("/user", addUser);
router.delete("/delete", removeUser);

export default router;
