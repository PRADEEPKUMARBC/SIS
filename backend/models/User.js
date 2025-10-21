import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['farmer', 'admin'],
    default: 'farmer'
  },
  farmName: {
    type: String,
    required: [true, 'Farm name is required'],
    trim: true
  },
  location: {
    address: String,
    city: String,
    state: String,
    country: {
      type: String,
      default: 'India'
    },
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  subscription: {
    type: String,
    enum: ['free', 'premium', 'enterprise'],
    default: 'free'
  },
  avatar: {
    public_id: String,
    url: String
  },
  devices: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Device' // This should match your Device model name
    }
  ],
  isActive: {
    type: Boolean,
    default: true
  },

  lastLogin: Date
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    this.password = await bcrypt.hash(this.password, 12);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update last login on successful login
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save();
};

export default mongoose.model('User', userSchema);