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
    default: "",
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
    default: 20,
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

  promo_codes: [
    {
      code: String,
      claimed_at: Date,
      click_id: String, // Добавляем поле для хранения click_id в вормате timestamps
      device_type: String, // iOS, android, или web
    },
  ],
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

  bio_already: {
    type: Boolean,
    default: false,
  },
});

export default mongoose.model("User", UserSchema);
