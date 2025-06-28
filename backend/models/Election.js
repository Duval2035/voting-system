const mongoose = require("mongoose");

const electionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    organizationName: {
      type: String,
      required: true,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["upcoming", "active", "ended"],
      default: "upcoming",
    },
    voterIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Points to users eligible to vote
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Election", electionSchema);

