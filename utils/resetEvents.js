import cron from "node-cron";
import User from "../models/user.js";

export const setupDailyReset = () => {
  cron.schedule(
    "0 0 * * *",
    async () => {
      try {
        console.log(
          `[${new Date().toISOString()}] Starting daily reset (events_by_type)...`
        );

        const result = await User.updateMany({}, [
          {
            $set: {
              events_by_type: {
                $cond: [
                  { $eq: ["$events_by_type.bio", true] },
                  { bio: true },
                  {},
                ],
              },
            },
          },
        ]);

        console.log(
          `Daily reset completed. Affected users: ${result.modifiedCount}\n` +
            `- events_by_type очищен (bio сохранён, если был)`
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
