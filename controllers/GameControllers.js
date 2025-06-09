import Game from "../models/game.js";
import User from "../models/user.js";

export const createLevel = async (req, res) => {
  try {
    const { time, jsonPath } = req.body;

    if (!jsonPath) {
      return res.status(401).json({
        message: "Путь к json - обязателен",
      });
    }

    const doc = new Game({
      time,
      jsonPath,
    });

    const data = await doc.save();

    if (!data._doc) {
      return res.status(404).json({
        message: "Данные не найдены",
      });
    }

    return res.status(200).json(data._doc);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Не удалось создать уровень",
    });
  }
};

export const getPuzzleByLevel = async (req, res) => {
  try {
    if (!req.params.level) {
      return res.status(401).json({
        message: "Не удалось получить уровень",
      });
    }

    const data = await Game.findOne({ level: req.params.level });

    if (!data) {
      return res.status(404).json({
        message: "Не удалось получить уровень",
      });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Не удалось получить уровень",
    });
  }
};

export const startGame = async (req, res) => {
  try {
    const user_data = await User.findById(req.userId);

    if (user_data.daily_attempts <= 0) {
      return res.status(401).json({
        message: "У вас закончились попытки за сегодня",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        $inc: {
          daily_attempts: -1,
        },
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        message: "Не удалось увеличить попытки",
      });
    }

    return res.status(200).json(user);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Не удалось начать игру",
    });
  }
};
