import dotenv from "dotenv";
import User from "../models/user.js";
import jwt from "jsonwebtoken";
import axios from "axios";

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

    let user = await User.findOne({ user_id: userId });

    if (user) {
      const newToken = jwt.sign({ user_id: user.user_id }, SECRET, {
        expiresIn: EXPIRES_IN,
      });
      return res.json({ ...user._doc, token: newToken });
    } else {
      let firstName = userId;
      let lastName = "";

      try {
        const response = await axios.get(
          `${process.env.WEBHOOK_URI}/wp-json/rb/v1.0/users?filter=ids:${userId}&fields=id,first_name,last_name,is_anonymous,birthday,sport_types_interested_in,phone,email`,
          { headers: { "Content-Type": "application/json" } }
        );

        if (Array.isArray(response.data) && response.data.length > 0) {
          const wpUser = response.data[0];

          if (!wpUser.is_anonymous) {
            firstName = wpUser.first_name || userId;
            lastName = wpUser.last_name || "";

            const hasAllBioFields =
              wpUser.first_name &&
              wpUser.last_name &&
              wpUser.birthday &&
              wpUser.sport_types_interested_in &&
              (wpUser.phone || wpUser.email);

            if (hasAllBioFields) {
              return res.json({
                bio_already: true,
                ...wpUser,
                token: jwt.sign({ user_id: userId }, SECRET, {
                  expiresIn: EXPIRES_IN,
                }),
              });
            }
          }
        }
      } catch (err) {
        console.error("Ошибка при запросе имени:", err.message);
      }

      const doc = new User({
        user_id: userId,
        first_name: firstName,
        last_name: lastName,
        abilities: {
          extra_time: { count: 1, duration: 10 },
          skip_level: { count: 1 },
        },
      });

      user = await doc.save();

      const newToken = jwt.sign({ user_id: user.user_id }, SECRET, {
        expiresIn: EXPIRES_IN,
      });

      try {
        await axios.post(
          `${process.env.WEBHOOK_URI}/wp-json/rb/v1.0/users/game-access`,
          {
            user_id: +userId,
            game_id: 1,
            timestamp: Math.floor(Date.now() / 1000),
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.BEARER_TOKEN}`,
            },
          }
        );
        console.log("Webhook send successfully");
      } catch (webhookError) {
        console.error("Ошибка при отправке вебхука:", webhookError.message);
      }

      return res.json({ ...user._doc, token: newToken });
    }
  } catch (err) {
    console.error(err);

    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Неверный токен" });
    }
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Токен истек" });
    }

    res.status(500).json({ message: "Не удалось выполнить операцию" });
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

    if (user.isAnonimus) {
      try {
        const response = await axios.get(
          `${process.env.WEBHOOK_URI}/wp-json/rb/v1.0/users?filter=ids:${req.userId}&fields=id,first_name,last_name,is_anonymous`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data[0].is_anonymous === false) {
          await User.findOneAndUpdate(
            { user_id: req.userId },
            {
              first_name: response.data[0].first_name,
              last_name: response.data[0].last_name,
            }
          );
        }
      } catch (err) {
        console.log(err);
      }
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

export const checkLimit = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findOne({ user_id: userId });

    if (!user) {
      return res.status(404).json({
        message: "Пользователь не найден",
      });
    }

    if (user.bonus_attempts >= 4) {
      return res.status(403).json({
        message: "Достигнут лимит дополнительных попыток",
        isLimit: true,
      });
    }

    res.status(200).json({ isLimit: false });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Не удалось проверить лимит попыток",
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

export const getUserAbilities = async (req, res) => {
  try {
    const user = await User.findOne({ user_id: req.userId }, { abilities: 1 });

    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    const abilities = {
      extra_time: {
        count: user.abilities?.extra_time?.count ?? 0,
        duration: user.abilities?.extra_time?.duration ?? 10,
      },
      skip_level: {
        count: user.abilities?.skip_level?.count ?? 0,
      },
    };

    res.json(abilities);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Не удалось получить способности" });
  }
};

export const useExtraTimeAbility = async (req, res) => {
  try {
    const user = await User.findOne({ user_id: req.userId });

    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    const extraTimeCount = user.abilities?.extra_time?.count ?? 0;

    if (extraTimeCount <= 0) {
      return res.status(400).json({ message: "Недостаточно способностей" });
    }

    user.abilities = user.abilities || {};
    user.abilities.extra_time = {
      count: extraTimeCount - 1,
      duration: user.abilities?.extra_time?.duration ?? 10,
    };

    await user.save();

    res.json({
      success: true,
      remaining: user.abilities.extra_time.count,
      duration: user.abilities.extra_time.duration,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Не удалось использовать способность" });
  }
};

export const useSkipLevelAbility = async (req, res) => {
  try {
    const user = await User.findOne({ user_id: req.userId });

    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    const skipLevelCount = user.abilities?.skip_level?.count ?? 0;

    if (skipLevelCount <= 0) {
      return res.status(400).json({ message: "Недостаточно способностей" });
    }

    user.abilities = user.abilities || {};
    user.abilities.skip_level = {
      count: skipLevelCount - 1,
    };

    await user.save();

    res.json({
      success: true,
      remaining: user.abilities.skip_level.count,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Не удалось использовать способность" });
  }
};

export const getPromoCodeLink = async (req, res) => {
  try {
    const userId = req.userId;
    const { promo_code, level } = req.body;
    const deviceType = req.deviceType;

    const clickId = Date.now().toString();

    const levelLinks = {
      20: { bk: "944853", suffix: "tennis_game" },
      30: { bk: "1026500", suffix: "tennis_game" },
      40: { bk: "751562", suffix: "tennis_game" },
      50: { bk: "987694", suffix: "tennis_game_promo" },
      60: { bk: "944853", suffix: "tennis_game" },
      70: { bk: "510742", suffix: "tennis_game" },
      80: { bk: "1070120", suffix: "tennis_game" },
      90: { bk: "666278", suffix: "tennis_game" },
      100: { bk: "510821", suffix: "tennis_game" },
      110: { bk: "944853", suffix: "tennis_game" },
      120: { bk: "510821", suffix: "tennis_game_promo" },
      130: { bk: "987694", suffix: "tennis_game" },
      140: { bk: "944853", suffix: "tennis_game" },
      150: { bk: "944853", suffix: "tennis_game" },
    };

    let promoLink;

    if (level === 10) {
      promoLink = `https://rbmax.bookmaker-ratings.ru/?click_id=${clickId}`;
    } else {
      const linkData = levelLinks[level] || {
        bk: "944853",
        suffix: "tennis_game",
      };
      const { bk, suffix } = linkData;

      let devicePrefix;
      switch (deviceType) {
        case "ios":
          devicePrefix = "i";
          break;
        case "android":
          devicePrefix = "a";
          break;
        default:
          devicePrefix = "w";
      }

      const baseUrl = `https://bookmaker-ratings.ru/go/${devicePrefix}/bk/${bk}/${suffix}`;
      promoLink = `${baseUrl}/?click_id=${clickId}`;
    }

    const user = await User.findOne({ user_id: userId });
    if (user) {
      user.promo_codes.push({
        code: promo_code,
        claimed_at: new Date(),
        click_id: clickId,
        device_type: deviceType,
        level: level,
      });
      await user.save();
    }

    console.log("Новая ссылка:", promoLink);

    return res.json({
      success: true,
      promo_link: promoLink,
      click_id: clickId,
      device_type: deviceType,
      level: level,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Не удалось сгенерировать ссылку на промокод",
    });
  }
};
