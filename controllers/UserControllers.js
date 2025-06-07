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
