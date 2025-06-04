const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        required: true,
        unique: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        name: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        subtotal: {
            type: Number,
            required: true
        }
    }],
    shippingAddress: {
        fullName: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        },
        street: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        zipCode: {
            type: String,
            required: true
        },
        country: {
            type: String,
            default: 'Tunisia'
        }
    },
    paymentMethod: {
        type: String,
        enum: ['cash_on_delivery', 'credit_card', 'bank_transfer', 'mobile_payment'],
        default: 'cash_on_delivery'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending'
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'],
        default: 'pending'
    },
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    deliveryFee: {
        type: Number,
        default: 0
    },
    discount: {
        type: Number,
        default: 0
    },
    note: {
        type: String,
        maxlength: 500
    },
    estimatedDeliveryTime: {
        type: Date
    },
    actualDeliveryTime: {
        type: Date
    },
    trackingNumber: {
        type: String
    },
    cancelReason: {
        type: String
    },
    reviews: [{
        rating: {
            type: Number,
            min: 1,
            max: 5
        },
        comment: String,
        createdAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

// Index for better query performance
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

// Virtual for order age
orderSchema.virtual('orderAge').get(function() {
    return Math.ceil((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24)); // days
});

// Pre-save middleware to calculate totals
orderSchema.pre('save', function(next) {
    if (this.items && this.items.length > 0) {
        // Calculate subtotals for each item
        this.items.forEach(item => {
            item.subtotal = item.price * item.quantity;
        });
        
        // Calculate total amount if not provided
        if (!this.totalAmount) {
            const itemsTotal = this.items.reduce((total, item) => total + item.subtotal, 0);
            this.totalAmount = itemsTotal + this.deliveryFee - this.discount;
        }
    }
    next();
});

// Static method to get orders by status
orderSchema.statics.getByStatus = function(status) {
    return this.find({ status }).populate('user', 'name email').populate('items.product', 'name price');
};

// Static method to get user's recent orders
orderSchema.statics.getUserRecentOrders = function(userId, limit = 5) {
    return this.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('items.product', 'name price image');
};

// Instance method to update status with timestamp
orderSchema.methods.updateStatus = function(newStatus) {
    this.status = newStatus;
    
    if (newStatus === 'delivered') {
        this.actualDeliveryTime = new Date();
        this.paymentStatus = 'paid';
    }
    
    return this.save();
};

// Instance method to calculate delivery time
orderSchema.methods.getDeliveryDuration = function() {
    if (this.actualDeliveryTime && this.createdAt) {
        return Math.ceil((this.actualDeliveryTime - this.createdAt) / (1000 * 60 * 60)); // hours
    }
    return null;
};

module.exports = mongoose.model('Order', orderSchema);