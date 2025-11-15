import { onSchedule } from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";
import { cleanupOldCards } from "../../functions/scheduled/cleanupOldCards";

/**
 * Scheduled function to cleanup old card information
 * Runs every day at 3:00 AM JST (18:00 UTC)
 */
export default onSchedule(
  {
    schedule: "0 18 * * *", // 3:00 AM JST = 18:00 UTC (JST is UTC+9)
    timeZone: "UTC",
    region: "asia-northeast1",
    memory: "512MiB",
    timeoutSeconds: 540, // 9 minutes
  },
  async (event) => {
    console.log("Starting scheduled cleanup of old cards", event);
    const db = admin.firestore();
    try {
      await cleanupOldCards(db);
      console.log("Cleanup completed successfully");
    } catch (error) {
      console.error("Cleanup failed", error);
      throw error;
    }
  }
);
