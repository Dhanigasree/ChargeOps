import mongoose from "mongoose";

export const USER_ROLES = ["admin", "customer", "station"];

const userSchema = new mongoose.Schema(
  {
    authUserId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    role: {
      type: String,
      enum: USER_ROLES,
      required: true
    },
    phone: {
      type: String,
      trim: true,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

userSchema.methods.toSanitizedJSON = function toSanitizedJSON() {
  return {
    id: this._id,
    authUserId: this.authUserId,
    name: this.name,
    email: this.email,
    role: this.role,
    phone: this.phone,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

const User = mongoose.model("User", userSchema);

export default User;
