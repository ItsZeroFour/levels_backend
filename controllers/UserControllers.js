import dotenv from "dotenv";
import User from "../models/user.js";
import jwt from "jsonwebtoken";

dotenv.config();

const SECRET = process.env.JWT_SECRET;
const EXPIRES_IN = process.env.JWT_EXPIRES_IN;

export const createUser = async (req, res) => {
  try {
    const doc = new User({});

    const user = await doc.save();

    const token = jwt.sign({ _id: user._id }, SECRET, {
      expiresIn: EXPIRES_IN,
    });

    const userData = user._doc;

    res.json({ ...userData, token });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Не удалось зарегистрировать пользователя",
    });
  }
};

export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).send({
        message: "Пользователь не найден",
      });
    }

    const { ...userData } = user._doc;
    res.json(userData);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Не удалось получить пользователя",
    });
  }
};

export const increaseTotalAttempt = async (req, res) => {
  try {
    const userId = req.userId;

    const updateAttemptsCount = await User.findByIdAndUpdate(
      userId,
      {
        $inc: { total_attempts: 1 },
      },
      { new: true }
    );

    if (!updateAttemptsCount) {
      return res.status(404).json({
        message: "Не удалось получить пользователя",
      });
    }

    res.status(200).json(updateAttemptsCount);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Не удалось выдать попытку",
    });
  }
};

export const increaseRating = async (req, res) => {
  try {
    const updateUser = await User.findByIdAndUpdate(
      req.userId,
      {
        $inc: { rating: req.body.rating_count },
      },
      { new: true }
    );

    if (!updateUser) {
      return res.status(404).json({
        message: "Не удалось обновить рейтинг пользователя",
      });
    }

    return res.status(200).json(updateUser);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Не удалось увеличить рейтинг",
    });
  }
};

export const getUsersByRating = async (req, res) => {
  try {
    const users = await User.find().sort({ rating: -1 }).limit(50);

    if (!users) {
      return res.status(404).json({
        message: "Не удалось получить пользователей",
      });
    }

    return res.status(200).json(users);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Не удалось получить пользователей по рейтингу",
    });
  }
};
