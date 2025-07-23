import Game from "../models/game.js";
import User from "../models/user.js";
import path from "path";
import fs from "fs";
import Status from "../models/status.js";

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
    const user_data = await User.findOne({ user_id: req.userId });

    if (user_data.total_attempts <= 0) {
      return res.status(401).json({
        message: "У вас закончились попытки за сегодня",
      });
    }

    const user = await User.findOneAndUpdate(
      { user_id: req.userId },
      {
        $inc: {
          total_attempts: -1,
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

export const levelComplete = async (req, res) => {
  try {
    const updateUser = await User.findOneAndUpdate(
      { user_id: req.userId },
      {
        $inc: { rating: req.body.rating_count, complete_levels: 1 },
      },
      { new: true }
    );

    if (!updateUser) {
      return res.status(404).json({
        message: "Не удалось обновить рейтинг пользователя",
      });
    }

    const completedLevel = updateUser.complete_levels;
    if (completedLevel % 10 === 0) {
      await grantBonusAbilities(req.userId, completedLevel);
    }

    const statuses = await Status.find().sort({ min_levels: -1 });
    for (const status of statuses) {
      if (updateUser.complete_levels >= status.min_levels) {
        if (updateUser.status !== status.name) {
          updateUser.status = status.name;
          await updateUser.save();
        }
        break;
      }
    }

    const updatedUser = await User.findOne({ user_id: req.userId });
    return res.status(200).json(updatedUser);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Не удалось завершить игру",
    });
  }
};

async function grantBonusAbilities(userId, completedLevel) {
  const user = await User.findOne({ user_id: userId });
  if (!user) return;

  // Инициализируем abilities, если их нет
  user.abilities = user.abilities || {
    extra_time: { count: 0, duration: 10 },
    skip_level: { count: 0 },
  };

  // Определяем бонусы по таблице
  let extraTimeBonus = 0;
  let skipLevelBonus = 0;

  if (completedLevel === 150) {
    // Особый случай для 150 уровня
    // +50 очков в турнирной таблице (обрабатывается в другом месте)
  } else if (completedLevel % 20 === 0) {
    // Уровни 20, 40, 60, 80, 100, 120, 140 - пропуск уровня
    skipLevelBonus = 1;
  } else if (completedLevel % 10 === 0) {
    // Уровни 10, 30, 50, 70, 90, 110, 130 - дополнительные способности
    const bonusMultiplier = Math.floor(completedLevel / 20) + 2;
    extraTimeBonus = bonusMultiplier;
  }

  // Обновляем количество способностей
  if (extraTimeBonus > 0) {
    user.abilities.extra_time.count += extraTimeBonus;
  }
  if (skipLevelBonus > 0) {
    user.abilities.skip_level.count += skipLevelBonus;
  }

  await user.save();
}

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

    const imagePath = path.resolve(
      "uploads",
      "collection",
      `level_${level_id}.png`
    );
    const relativePath = `/uploads/collection/level_${level_id}.png`;

    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({ message: "Изображение не найдено" });
    }

    const user = await User.findOne({ user_id: req.userId });
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
