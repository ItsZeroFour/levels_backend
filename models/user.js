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

  daily_attempts: {
    type: Number,
    default: 0,
  },

  extra_attempts: {
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

  promo_codes: [String],
  events_processed: [String],
  puzzel_collection: [String],
});

export default mongoose.model("User", UserSchema);
