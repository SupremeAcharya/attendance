import express from "express";
import { fetchAttendance, addUser,removeUser } from "../controllers/attendance.controller.js";

const router = express.Router();

router.get("/attendance", fetchAttendance);
router.get("/user", fetchUser);
router.post("/adduser", addUser);
router.delete("/deleteuser", removeUser);

export default router;
