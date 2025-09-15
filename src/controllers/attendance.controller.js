import prisma from "../config/prisma.js";
import { getAttendance, createUser, deleteUser, connectToDevice } from "../services/zkService.js";

// Auto-sync from device to DB

export async function syncAttendance() {
  try {
    let logs = await getAttendance();

    // Retry connection if no logs fetched
    if (!logs.length) {
      console.log("⚠️ No logs fetched, retrying connection...");
      await connectToDevice();
      logs = await getAttendance();
    }

    console.log("Fetched logs:", logs.length);

    const attendanceData = [];

    for (const log of logs) {
      const deviceUid = parseInt(log.user_id);

      if (!log.record_time) {
        console.warn("⚠️ Skipping log with missing timestamp:", log);
        continue; // skip logs without timestamp
      }

      // Find or create user
      let user = await prisma.user.findUnique({ where: { deviceUid } });
      if (!user) {
        user = await prisma.user.create({
          data: { deviceUid, name: null, userid: null },
        });
      }

      // Map type to status
      const status = log.type === 1 ? "IN" : log.type === 2 ? "OUT" : null;

      attendanceData.push({
        userId: user.id,
        timestamp: new Date(log.record_time),
        status,
        type: log.type,
        state: log.state,
        ip: log.ip,
        rawData: log,
      });
    }

    // Bulk insert with skipDuplicates to avoid unique constraint errors
    if (attendanceData.length) {
      await prisma.attendance.createMany({
        data: attendanceData,
        skipDuplicates: true,
      });
    }

    console.log(`✅ Synced ${attendanceData.length} attendance logs`);
    return attendanceData;

  } catch (err) {
    console.error("❌ Sync error:", err.message);
    return [];
  }
}


// Fetch attendance from DB
export async function fetchAttendance(req, res) {
  try {
    const logs = await prisma.attendance.findMany({
      orderBy: { timestamp: "desc" },
      take: 100,
      include: { user: true },
    });

    const formattedLogs = logs.map(log => ({
      id: log.id,
      userId: log.userId,
      deviceUid: log.user.deviceUid,
      name: log.user.name,
      timestamp: log.timestamp,
      status: log.status,
      type: log.type,
      state: log.state,
      ip: log.ip,
      rawData: log.rawData,
    }));

    res.json({
      message: "Fetched attendance records",
      count: formattedLogs.length,
      data: formattedLogs,
    });

  } catch (err) {
    console.error("Error fetching attendance:", err);
    res.status(500).json({ error: err.message });
  }
}

// Add user (device + DB)
export async function addUser(req, res) {
  const { uid, userid, name } = req.body;
  try {
    const deviceUid = parseInt(uid);
    let existing = await prisma.user.findUnique({ where: { deviceUid } });

    if (!existing) {
      await createUser(uid, userid, name);
      console.log("User created on device:", uid);

      await prisma.user.create({
        data: { deviceUid, userid, name },
      });

      console.log("User created in DB:", uid);
      res.json({ success: true });
    } else {
      console.log("User already exists with deviceUid:", uid);
      res.json({ success: false, message: "User already exists" });
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
}

// Delete user (device + DB)
export async function removeUser(req, res) {
  const { uid } = req.body;
  try {
    const deviceUid = parseInt(uid);

    const deletedUser = await deleteUser(uid);
    // await prisma.user.delete({ where: { deviceUid } });
    console.log("User deleted from device:", deletedUser);

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
}




// import prisma from "../config/prisma.js";
// import { getAttendance, createUser, deleteUser } from "../services/zkService.js";
// import { connectToDevice } from "../services/zkService.js";

// // Auto-sync from device to DB
// export async function syncAttendance() {
//   try {
//     let logs = await getAttendance();

//     // If device not connected, try reconnect
//     if (!logs.length) {
//       console.log("⚠️ No logs fetched, retrying connection...");
//       await connectToDevice();
//       logs = await getAttendance();
//     }

//     console.log("Fetched logs:", logs.length);
//     // console.log(logs)

//     for (const log of logs) {
//       let user = await prisma.user.findUnique({
//         where: { deviceUid: parseInt(log.userId) },
//       });

//       if (!user) {
//         user = await prisma.user.create({
//           data: {
//             deviceUid: parseInt(log.userId),
//             name: null,
//             userid: null
//           },
//         });
//       }

//       let status = log.type === 1 ? "IN" : log.type === 2 ? "OUT" : null;

//       await prisma.attendance.createMany({
//         data: [
//           {
//             userId: user.id,
//             timestamp: new Date(log.record_time),
//             status,
//             type: log.type,
//             state: log.state,
//             ip: log.ip,
//             rawData: log
//           }
//         ],
//         skipDuplicates: true
//       });
//     }

//     console.log(`✅ Synced ${logs.length} attendance logs`);
//     return logs;

//   } catch (err) {
//     console.error("❌ Sync error:", err.message);
//     return [];
//   }
// }
// export async function fetchAttendance(req, res) {
//   try {
//     // Fetch latest 100 attendance records with user info
//     const logs = await prisma.attendance.findMany({
//       orderBy: { timestamp: "desc" },
//       take: 100,
//       include: { user: true }, // include user info
//     });

//     // Map data to frontend-friendly format
//     const formattedLogs = logs.map(log => ({
//       id: log.id,
//       userId: log.userId,
//       deviceUid: log.user.deviceUid,
//       name: log.user.name,
//       timestamp: log.timestamp,
//       status: log.status,
//       type: log.type,
//       state: log.state,
//       ip: log.ip,
//       rawData: log.rawData
//     }));

//     res.json({
//       message: "Fetched attendance records",
//       count: formattedLogs.length,
//       data: formattedLogs
//     });

//   } catch (err) {
//     console.error("Error fetching attendance:", err);
//     res.status(500).json({ error: err.message });
//   }
// }

// // Add user (device + DB)
// export async function addUser(req, res) {
//   const { uid, userid, name } = req.body;
//   try {
//     let existing = await prisma.user.findUnique({ where: { deviceUid: uid } });
//     if(!existing) {
//     await createUser(uid, userid, name);
//     console.log("User created on device:", uid);
//     await prisma.user.create({ data: { deviceUid: parseInt(uid), userid, name } });
//     console.log("User created in DB:", uid);
//     res.json({ success: true });
//     }
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, error: err.message });
//   }
// }

// // Delete user (device + DB)
// export async function removeUser(req, res) {
//   const { uid } = req.body;
//   try {
//     await deleteUser(uid);
//     await prisma.user.delete({ where: { deviceUid: parseInt(uid) } });
//     res.json({ success: true });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, error: err.message });
//   }
// }
