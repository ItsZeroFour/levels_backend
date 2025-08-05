import mongoose from "mongoose";
import testStatusData from "../uploads/test.status.json" with { type: "json" };

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

const Status = mongoose.model("Status", statusSchema);

async function initializeStatuses() {
  try {
    const count = await Status.countDocuments();
    if (count === 0) {
      const statuses = testStatusData.map(({ _id, __v, ...rest }) => rest);
      await Status.insertMany(statuses);
      console.log("Initial statuses have been created");
    } else {
      console.log("Statuses already exist in database");
    }
  } catch (error) {
    console.error("Failed to initialize statuses:", error);
  }
}

export { Status, initializeStatuses };
