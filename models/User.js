const mongoose = require('mongoose');

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
        trim: true,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            'Please enter a valid email'
        ]
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters']
    },
    phone: {
        type: String,
        trim: true,
        match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
    },
    avatar: {
        type: String,
        default: ''
    },
    role: {
        type: String,
        enum: ['customer', 'admin', 'delivery'],
        default: 'customer'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    address: {
        street: {
            type: String,
            trim: true
        },
        city: {
            type: String,
            trim: true
        },
        state: {
            type: String,
            trim: true
        },
        zipCode: {
            type: String,
            trim: true
        },
        country: {
            type: String,
            default: 'Tunisia'
        }
    },
    preferences: {
        notifications: {
            email: {
                type: Boolean,
                default: true
            },
            sms: {
                type: Boolean,
                default: false
            },
            push: {
                type: Boolean,
                default: true
            }
        },
        language: {
            type: String,
            enum: ['en', 'fr', 'ar'],
            default: 'fr'
        },
        currency: {
            type: String,
            enum: ['TND', 'EUR', 'USD'],
            default: 'TND'
        }
    },
    loyaltyPoints: {
        type: Number,
        default: 0,
        min: 0
    },
    totalOrders: {
        type: Number,
        default: 0,
        min: 0
    },
    totalSpent: {
        type: Number,
        default: 0,
        min: 0
    },
    lastLogin: {
        type: Date
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    emailVerificationToken: String,
    emailVerificationExpire: Date
}, {
    timestamps: true
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: -1 });

// Virtual for full address
userSchema.virtual('fullAddress').get(function() {
    if (!this.address.street) return '';
    
    const parts = [
        this.address.street,
        this.address.city,
        this.address.state,
        this.address.zipCode,
        this.address.country
    ].filter(part => part && part.trim());
    
    return parts.join(', ');
});

// Virtual for customer level based on loyalty points
userSchema.virtual('customerLevel').get(function() {
    if (this.loyaltyPoints >= 1000) return 'Gold';
    if (this.loyaltyPoints >= 500) return 'Silver';
    if (this.loyaltyPoints >= 100) return 'Bronze';
    return 'Regular';
});

// Pre-save middleware to update user stats
userSchema.pre('save', async function(next) {
    // Only run if it's not a new document or if specific fields are modified
    if (this.isNew || this.isModified('totalOrders') || this.isModified('totalSpent')) {
        // Calculate loyalty points (1 point per TND spent)
        this.loyaltyPoints = Math.floor(this.totalSpent);
    }
    next();
});

// Static method to find customers
userSchema.statics.findCustomers = function() {
    return this.find({ role: 'customer', isActive: true });
};

// Static method to find by email
userSchema.statics.findByEmail = function(email) {
    return this.findOne({ email: email.toLowerCase() });
};

// Instance method to update order stats
userSchema.methods.updateOrderStats = async function(orderAmount) {
    this.totalOrders += 1;
    this.totalSpent += orderAmount;
    return this.save();
};

// Instance method to add loyalty points
userSchema.methods.addLoyaltyPoints = function(points) {
    this.loyaltyPoints += points;
    return this.save();
};

// Instance method to redeem loyalty points
userSchema.methods.redeemLoyaltyPoints = function(points) {
    if (this.loyaltyPoints >= points) {
        this.loyaltyPoints -= points;
        return this.save();
    }
    throw new Error('Insufficient loyalty points');
};

// Instance method to get user's order history
userSchema.methods.getOrderHistory = function() {
    const Order = mongoose.model('Order');
    return Order.find({ user: this._id })
        .populate('items.product', 'name price')
        .sort({ createdAt: -1 });
};

// Method to check if user can place order (for validation)
userSchema.methods.canPlaceOrder = function() {
    return this.isActive && this.isEmailVerified;
};

// Hide password when converting to JSON
userSchema.methods.toJSON = function() {
    const userObject = this.toObject();
    delete userObject.password;
    delete userObject.resetPasswordToken;
    delete userObject.resetPasswordExpire;
    delete userObject.emailVerificationToken;
    delete userObject.emailVerificationExpire;
    return userObject;
};

module.exports = mongoose.model('User', userSchema);