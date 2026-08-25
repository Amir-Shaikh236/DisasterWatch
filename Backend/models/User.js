import mongoose from "mongoose"
import bcrypt from 'bcryptjs'
import validator from 'validator'
import PointSchema from "./PointSchema.js";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "Please Provide your First name"],
      trim: true,
      maxlength: [25, 'Name cannot exceed 25 characters.']
    },

    lastName: {
      type: String,
      required: [true, "Please Provide your Last name"],
      trim: true,
      maxlength: [25, 'Name cannot exceed 25 characters.']
    },

    email: {
      type: String,
      required: [true, "Please Provide your email address."],
      trim: true,
      lowercase: true,
      unique: true,
      validate: [validator.isEmail, "Please provide a valid email address"],
    },

    password: {
      type: String,
      required: [true, "Please Provide a Password"],
      trim: true,
      minlength: [8, "Password must be atleast 8 characters."],
      select: false,
    },

    role: {
      type: String,
      enum: {
        values: ['user', 'admin'],
        message: 'Role must be either: User or admin',
      },
      default: "user",
    },

    location: {
      type: PointSchema,
      required: false
    },

    notification: {
      type: Boolean,
      default: false
    },

    notificationRadius: {
      type: Number,
      default: 5,
      min: 1,
      max: 15
    },

    fcmTokens: [{ type: String }],

    refreshTokens: {
      type: [String],
      default: [],
      select: false
    },
  },

  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.password;
        delete ret.refreshTokens;
        delete ret.__v;
        return ret;
      },
    },
  },
);

userSchema.index({ location: "2dsphere" });

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);

