import ZKLib from "zkteco-js";
import dotenv from "dotenv";
dotenv.config();

let zk = null;

/**
 * Connect to ZKTeco device
 */
export async function connectToDevice() {
  try {
    zk = new ZKLib(
      process.env.DEVICE_IP,
      parseInt(process.env.DEVICE_PORT),
      15000,
      5000
    );
    await zk.createSocket();
    console.log(`✅ Connected to ZKTeco device at ${process.env.DEVICE_IP}`);
  } catch (err) {
    console.error("❌ Failed to connect to device:", err.message);
    zk = null;
  }
}

/**
 * Fetch attendance logs from device
 */
export async function getAttendance() {
  try {
    if (!zk) {
      await connectToDevice();
      if (!zk) throw new Error("Device not connected");
    }
    // const users = await zk.getUsers();
    // console.log("Number of users : " , users.data.length);
    // console.log(users.data);
    const attendance = await zk.getAttendances();
    return attendance.data || [];
  } catch (err) {
    console.error("❌ Error fetching attendance:", err.message);
    zk = null; // reset connection for next retry
    return [];
  }
}


//get users for device
export async function getUsers() {
  try {
    if (!zk) {
      await connectToDevice();
      if (!zk) throw new Error("Device not connected");
    }
    const users = await zk.getUsers();
    console.log("Number of users : " , users.data.length);
    console.log(users.data);
    // const attendance = await zk.getAttendances();
    return users.data || [];
  } catch (err) {
    console.error("❌ Error fetching attendance:", err.message);
    zk = null; // reset connection for next retry
    return [];
  }
}

/**
 * Add user to device
 */
export async function createUser(uid, userid, name) {
  try {
    if (!zk) await connectToDevice();
    if (!zk) throw new Error("Device not connected");

    const result = await zk.setUser(uid, userid, name, "", 0, 0);
    console.log(result);
    zk = null;
    return { success: true };
  } catch (err) {
    console.error("❌ Error creating user:", err.message);
    return { success: false };
  }
}

/**
 * Delete user from device
 */
export async function deleteUser(uid) {
  try {
    if (!zk) await connectToDevice();
    if (!zk) throw new Error("Device not connected");

    await zk.deleteUser(uid);
    zk = null;
    return { success: true };
  } catch (err) {
    console.error("❌ Error deleting user:", err.message);
    return { success: false };
  }
}




// import ZKLib from "zkteco-js";
// import dotenv from "dotenv";
// dotenv.config();

// let zk = null;

// /**
//  * Connect to ZKTeco device
//  */
// export async function connectToDevice() {
//   try {
//     zk = new ZKLib(
//       process.env.DEVICE_IP,
//       parseInt(process.env.DEVICE_PORT),
//       15000,
//       5000
//     );
//     await zk.createSocket();
//     console.log(`✅ Connected to ZKTeco device at ${process.env.DEVICE_IP}`);
//   } catch (err) {
//     console.error("❌ Failed to connect to device:", err.message);
//     zk = null;
//   }
// }

// /**
//  * Fetch attendance from device
//  */
// export async function getAttendance() {
//   try {
//     if (!zk) {
//       await connectToDevice();
//       if (!zk) throw new Error("Device not connected");
//     }

//     const logs = await zk.getUsers();
//     // const attendance = await zk.getAttendances();
//     // console.log(attendance);
//     return logs.data || [];
//   } catch (err) {
//     console.error("❌ Error fetching attendance:", err.message);
//     zk = null; // reset connection for next retry
//     return [];
//   }
// }

// /**
//  * Add user to device
//  */
// export async function createUser(uid, userid, name) {
//   try {
//     if (!zk) await connectToDevice();
//     if (!zk) throw new Error("Device not connected");

//     await zk.setUser(uid, userid, name, "", 0, 0);
//     return { success: true };
//   } catch (err) {
//     console.error("❌ Error creating user:", err.message);
//     return { success: false };
//   }
// }

// /**
//  * Delete user from device
//  */
// export async function deleteUser(uid) {
//   try {
//     if (!zk) await connectToDevice();
//     if (!zk) throw new Error("Device not connected");

//     await zk.removeUser(uid);
//     return { success: true };
//   } catch (err) {
//     console.error("❌ Error deleting user:", err.message);
//     return { success: false };
//   }
// }
