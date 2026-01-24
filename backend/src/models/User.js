const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  service_number: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  rank: {
    type: String,
    required: true
  },
  company: {
    type: String,
    required: false
  },
  role: {
    type: String,
    required: true,
    enum: ['soldier', 'coy_comd', 'adjutant', 'bsm', 'commanding_officer']
  },
  email: {
    type: String
  },
  phone: {
    type: String
  },
  password_hash: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Virtual for user_id
userSchema.virtual('user_id').get(function() {
  return this._id.toString();
});

// Ensure virtual fields are serialized
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

// Pre-save hook to hash password
userSchema.pre('save', async function(next) {
  if (this.password && !this.password_hash) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.password_hash = await bcrypt.hash(this.password, salt);
      delete this.password;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Static methods
userSchema.statics.findByServiceNumber = function(service_number) {
  return this.findOne({ service_number: new RegExp('^' + service_number.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i') });
};

userSchema.statics.findById = function(user_id) {
  return this.findById(user_id).select('service_number name rank role company');
};

userSchema.statics.getAllUsers = function() {
  return this.find({}).select('service_number name rank role company').sort('name');
};

userSchema.statics.updateUser = function(user_id, updates) {
  return this.findByIdAndUpdate(user_id, updates, { new: true });
};

userSchema.statics.validatePassword = async function(plainPassword, storedPassword) {
  try {
    return await bcrypt.compare(plainPassword, storedPassword);
  } catch (error) {
    console.error('Password validation error:', error);
    return false;
  }
};

userSchema.statics.createUser = function(userData) {
  const user = new this(userData);
  return user.save();
};

const User = mongoose.model('User', userSchema);

module.exports = User;
