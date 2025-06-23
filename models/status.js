import mongoose from "mongoose";

const statusSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  min_levels: {
    type: Number,
    required: true,
  },

  description: {
    type: String,
    default: "",
  },
});

export default mongoose.model("Status", statusSchema);
