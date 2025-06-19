import Game from "../models/game.js";
import User from "../models/user.js";
import path from "path";
import fs from "fs";

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

export const getAllLevels = async (req, res) => {
  try {
    const levels = await Game.find();

    if (!levels) {
      return res.status(404).json({
        message: "Не удалось найти события",
      });
    }

    return res.status(200).json(levels);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Не удалось получить уровни",
    });
  }
};

export const getPiece = async (req, res) => {
  try {
    const { level_id, piece_id } = req.params;

    const piecePath = path.resolve(
      "uploads",
      "puzzles",
      `level_${level_id}`,
      "pieces",
      `piece_${piece_id}.png`
    );

    if (!fs.existsSync(piecePath)) {
      return res.status(404).json({ message: "Файл не найден" });
    }

    res.sendFile(piecePath);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Не удалось получить пазл",
    });
  }
};

export const addItemToCollection = async (req, res) => {
  try {
    const { level_id } = req.params;
    const userId = req.userId;

    const imagePath = path.resolve("uploads", "collection", `level_${level_id}.png`);
    const relativePath = `/uploads/collection/level_${level_id}.png`;

    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({ message: "Изображение не найдено" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    if (!user.puzzel_collection.includes(relativePath)) {
      user.puzzel_collection.push(relativePath);
      await user.save();
    }

    res.json({
      message: "Изображение добавлено в коллекцию",
      path: relativePath,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Не удалось добавить изображение в коллекцию",
    });
  }
};
