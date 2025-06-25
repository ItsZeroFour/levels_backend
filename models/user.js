import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  external_id: {
    type: String,
  },

  last_active_at: {
    type: Date,
    default: Date.now,
  },

  total_attempts: {
    type: Number,
    default: 0,
  },

  bonus_unlocked: {
    type: Boolean,
    default: false,
  },

  has_purchased: {
    type: Boolean,
    default: false,
  },

  rating: {
    type: Number,
    default: 0,
  },

  complete_levels: {
    type: Number,
    default: 0,
  },

  status: {
    type: String,
    default: "Новичок корта",
  },

  name: {
    type: String,
    default: "",
  },

  promo_codes: [String],
  events_processed: [String],
  puzzel_collection: [String],

  events_by_type: {
    type: Object,
    default: {},
  },
});

export default mongoose.model("User", UserSchema);
