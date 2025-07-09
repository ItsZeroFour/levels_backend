import User from "../models/user.js";

export const handleUserEventWebhook = async (req, res) => {
  try {
    const { event, user_id, timestamp } = req.body;

    const allowedEvents = ["comment", "feedback", "competition", "bio"];
    if (!allowedEvents.includes(event)) {
      return res.status(400).json({ error: "Неизвестный тип события" });
    }

    const user = await User.findOne({ _id: user_id });
    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    if (user.events_by_type?.[event]) {
      return res.status(200).json({
        status: "ignored",
        reason: `Событие "${event}" уже учтено`,
      });
    }

    const attemptsToAdd = event === "bio" ? 10 : 1;

    user.total_attempts += attemptsToAdd;
    user.events_by_type[event] = true;
    user.markModified("events_by_type");

    await user.save();

    return res.status(200).json({
      status: "ok",
      added_attempt: true,
      attempts_added: attemptsToAdd,
      event_registered: event,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
