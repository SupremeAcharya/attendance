import express from "express";
import { fetchAttendance, addUser,removeUser, fetchUsers } from "../controllers/attendance.controller.js";

const router = express.Router();

router.get("/attendance", fetchAttendance);
router.get("/user", fetchUsers);
router.post("/adduser", addUser);
router.delete("/deleteuser", removeUser);

export default router;
