import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  external_id: {
    type: String,
  },

  last_active_at: {
    type: String,
    default: new Date.now(),
  },

  total_attempts: {
    type: String,
    default: 0,
  },

  daily_attempts: {
    type: String,
    default: 0,
  },

  extra_attempts: {
    type: String,
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
});

export default mongoose.model("User", UserSchema);
