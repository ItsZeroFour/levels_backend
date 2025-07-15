import User from "../models/user.js";

export const handleUserEventWebhook = async (req, res) => {
  try {
    const { event, user_id } = req.body;

    const allowedEvents = ["comment", "feedback", "competition", "bio"];
    if (!allowedEvents.includes(event)) {
      return res.status(400).json({ error: "Неизвестный тип события" });
    }

    const user = await User.findOne({ user_id: user_id });
    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    if (!user.events_by_type) user.events_by_type = new Map();

    if (event === "bio") {
      if (user.events_by_type.get("bio") === true) {
        return res.status(200).json({
          status: "ignored",
          reason: "Событие bio уже учтено",
        });
      }

      user.total_attempts += 10;
      user.events_by_type.set("bio", true);

      await user.save();

      return res.status(200).json({
        status: "ok",
        added_attempt: true,
        attempts_added: 10,
        event_registered: event,
      });
    }

    const totalCount = Array.from(user.events_by_type.entries())
      .filter(([key, val]) => key !== "bio" && typeof val === "number")
      .reduce((sum, [_, val]) => sum + val, 0);

    if (totalCount >= 4) {
      return res.status(200).json({
        status: "ignored",
        reason: "Достигнут лимит в 4 действия за сутки",
      });
    }

    const currentCount = user.events_by_type.get(event) || 0;

    if (currentCount >= 4) {
      return res.status(200).json({
        status: "ignored",
        reason: `Достигнут лимит выполнений для события "${event}"`,
      });
    }

    user.events_by_type.set(event, currentCount + 1);
    user.total_attempts += 1;

    await user.save();

    return res.status(200).json({
      status: "ok",
      added_attempt: true,
      attempts_added: 1,
      event_registered: event,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
