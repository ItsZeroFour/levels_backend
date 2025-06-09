import mongoose from "mongoose";
import Counter from "./counter.js";

const gameSchema = new mongoose.Schema(
  {
    time: {
      type: String,
      default: "1:00",
    },

    level: {
      type: Number,
      default: 0,
    },

    jsonPath: {
      type: String,
      required: true, // e.g., /uploads/puzzles/level_001/level_001.json
    },
  },
  { timestamps: true }
);

gameSchema.pre("save", async function (next) {
  if (this.isNew) {
    const counter = await Counter.findByIdAndUpdate(
      "gameLevel",
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this.level = counter.seq;
  }
  next();
});

export default mongoose.model("Game", gameSchema);
