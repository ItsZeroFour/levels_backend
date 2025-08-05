import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
    unique: true,
  },

  first_name: {
    type: String,
    required: true,
  },

  last_name: {
    type: String,
    required: true,
  },

  external_id: {
    type: String,
  },

  last_active_at: {
    type: Date,
    default: Date.now,
  },

  total_attempts: {
    type: Number,
    default: 5,
  },

  bonus_attempts: {
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

  abilities: {
    type: {
      extra_time: {
        count: { type: Number, default: 1 },
        duration: { type: Number, default: 10 },
      },
      skip_level: {
        count: { type: Number, default: 1 },
      },
    },
    default: {},
  },

  promo_codes: [String],
  events_processed: [String],
  puzzel_collection: [String],

  events_by_type: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {},
  },

  isAnonimus: {
    type: Boolean,
    default: true,
  },
});

export default mongoose.model("User", UserSchema);
