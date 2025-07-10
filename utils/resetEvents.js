import cron from "node-cron";
import User from "../models/user.js";

export const setupDailyReset = () => {
  cron.schedule(
    "0 0 * * *",
    async () => {
      try {
        console.log(
          `[${new Date().toISOString()}] Starting daily reset (attempts + events)...`
        );

        const result = await User.updateMany(
          {},
          [
            {
              $set: {
                total_attempts: 5,
                events_by_type: {
                  $cond: {
                    if: { $eq: ["$events_by_type.bio", true] },
                    then: { bio: true },
                    else: {},
                  },
                },
              },
            },
          ],
          { multi: true }
        );

        console.log(
          `Daily reset completed. Affected users: ${result.modifiedCount}\n` +
            `- All users: total_attempts = 5\n` +
            `- Events reset (bio preserved if existed)`
        );
      } catch (error) {
        console.error("Daily reset error:", error);
      }
    },
    {
      scheduled: true,
      timezone: "Europe/Moscow",
    }
  );
};
