const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ['brand', 'influencer', 'admin'], default: 'influencer' },
    isActive: { type: Boolean, default: true },
      resetCode: { type: String },
    resetCodeExpiry: { type: Date },
  },
  { timestamps: true }
);

// Hash password manually using a static method (no pre-save hook)
userSchema.statics.hashPassword = async function (password) {
  const salt = await bcryptjs.genSalt(10);
  return await bcryptjs.hash(password, salt);
};

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcryptjs.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);