import mongoose from "mongoose";

const stationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    location: {
      state: {
        type: String,
        trim: true,
        default: ""
      },
      district: {
        type: String,
        trim: true,
        default: ""
      },
      locality: {
        type: String,
        trim: true,
        default: ""
      },
      lat: {
        type: Number,
        required: true
      },
      lng: {
        type: Number,
        required: true
      },
      address: {
        type: String,
        required: true,
        trim: true
      }
    },
    chargerType: {
      type: String,
      required: true,
      trim: true
    },
    pricePerUnit: {
      type: Number,
      required: true,
      min: 0
    },
    availability: {
      slots: {
        type: Number,
        required: true,
        min: 0
      }
    },
    ownerId: {
      type: String,
      required: true,
      index: true
    },
    isApproved: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

stationSchema.methods.toSanitizedJSON = function toSanitizedJSON() {
  return {
    id: this._id,
    name: this.name,
    location: this.location,
    chargerType: this.chargerType,
    pricePerUnit: this.pricePerUnit,
    availability: this.availability,
    ownerId: this.ownerId,
    isApproved: this.isApproved,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

const Station = mongoose.model("Station", stationSchema);

export default Station;
