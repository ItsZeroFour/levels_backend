import User from "../models/user.js";

export const handleCommentWebhook = async (req, res) => {
  try {
    const { event, user_id, comment_id, timestamp } = req.body;

    const allowedEvents = ["user_commented"];
    if (!allowedEvents.includes(event)) {
      return res.status(400).json({ error: "Неизвестный тип события" });
    }

    const user = await User.findOne({ _id: user_id });

    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    if (user.events_by_type?.[event]) {
      return res
        .status(200)
        .json({ status: "ignored", reason: "Событие уже было учтено" });
    }

    user.extra_attempts += 1;
    user.events_by_type[event] = true;

    await user.save();

    return res.status(200).json({ status: "ok", added_attempt: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
