import dotenv from "dotenv";
import User from "../models/user.js";
import jwt from "jsonwebtoken";

dotenv.config();

const SECRET = process.env.JWT_SECRET;
const EXPIRES_IN = process.env.JWT_EXPIRES_IN;

const PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwvukfesHKk/S1uPH1CmI
y89K1lV2o/aAAucYVDiYR+WYCzzQ90C9FDKfepZvCsy56Rlv/efHMX0sScp+8BH6
ZIiKwPecklQwnehQB3H/Y7aZvIR+9pjbHmBwEWdxvWgZupRdPkPy5J7bTReOjGJ4
18lj61KUeL+xHjd+85bsYQtYc//qn8nWJs5mJawUzQoMmvvYbpjSD3HyK6LOrF1V
YsVkX7ldZdNgzLtb+cafVvEi7RJf7LYAgXqizg7Bzw6k7G0fMnj94ZUi5EIXPTL4
1IbnBxYcxdq99d4hlFT4x75/BwyXE6TpbaMNDYjcXsC6j98JdzfdKtSbVnpLr1YI
uwIDAQAB
-----END PUBLIC KEY-----`;

export const createUser = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1] || req.body.token;

    if (!token) {
      return res.status(401).json({ message: "Токен не предоставлен" });
    }

    const decoded = jwt.verify(token, PUBLIC_KEY, { algorithms: ["RS256"] });

    const userId = decoded.sub;

    if (!userId) {
      return res.status(400).json({ message: "Токен не содержит user_id" });
    }

    const doc = new User({ user_id: userId });

    const user = await doc.save();

    const newToken = jwt.sign({ user_id: user.user_id }, SECRET, {
      expiresIn: EXPIRES_IN,
    });

    const userData = user._doc;
    res.json({ ...userData, token: newToken });
  } catch (err) {
    console.error(err);

    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Неверный токен" });
    }

    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Токен истек" });
    }

    res.status(500).json({
      message: "Не удалось зарегистрировать пользователя",
    });
  }
};

export const getUser = async (req, res) => {
  try {
    const user = await User.findOne({ user_id: req.userId });

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

    const updateAttemptsCount = await User.findOneAndUpdate(
      { user_id: userId },
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
    const updateUser = await User.findOneAndUpdate(
      { user_id: req.userId },
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
