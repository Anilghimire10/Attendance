const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    userName: { type: String, required: true },
    role: {
      type: String,
      default: "admin",
      enum: ["admin", "user"],
    },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

adminSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.password;
    return ret;
  },
});

module.exports = mongoose.model("Admin", adminSchema);
