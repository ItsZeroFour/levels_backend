import Status from "../models/status.js";

export const createStatus = async (req, res) => {
  try {
    const { name, min_levels, description } = req.body;

    // if (!name || !min_levels) {
    //   return res.status(404).json({
    //     message: "Укажите необходимые поля",
    //   });
    // }

    const doc = new Status({
      name,
      min_levels,
      description,
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
      message: "Не удалось создать статус",
    });
  }
};
