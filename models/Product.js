const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true,
        maxlength: [100, 'Product name cannot exceed 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Product description is required'],
        maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    shortDescription: {
        type: String,
        maxlength: [200, 'Short description cannot exceed 200 characters']
    },
    price: {
        type: Number,
        required: [true, 'Product price is required'],
        min: [0, 'Price cannot be negative']
    },
    originalPrice: {
        type: Number,
        min: [0, 'Original price cannot be negative']
    },
    category: {
        type: String,
        required: [true, 'Product category is required'],
        enum: [
            'pizza', 'burger', 'sandwich', 'pasta', 'salad', 
            'dessert', 'beverage', 'appetizer', 'main_course',
            'breakfast', 'lunch', 'dinner', 'snack'
        ]
    },
    subcategory: {
        type: String,
        trim: true
    },
    images: [{
        url: {
            type: String,
            required: true
        },
        alt: {
            type: String,
            default: ''
        },
        isPrimary: {
            type: Boolean,
            default: false
        }
    }],
    ingredients: [{
        name: {
            type: String,
            required: true
        },
        quantity: String,
        allergen: {
            type: Boolean,
            default: false
        }
    }],
    nutritionalInfo: {
        calories: Number,
        protein: Number, // grams
        carbs: Number,   // grams
        fat: Number,     // grams
        fiber: Number,   // grams
        sodium: Number   // mg
    },
    allergens: [{
        type: String,
        enum: ['gluten', 'dairy', 'nuts', 'eggs', 'soy', 'shellfish', 'fish']
    }],
    dietaryInfo: [{
        type: String,
        enum: ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'keto', 'halal']
    }],
    sizes: [{
        name: {
            type: String,
            required: true // small, medium, large, etc.
        },
        price: {
            type: Number,
            required: true
        },
        additionalPrice: {
            type: Number,
            default: 0
        }
    }],
    customizations: [{
        name: {
            type: String,
            required: true
        },
        options: [{
            name: String,
            additionalPrice: {
                type: Number,
                default: 0
            }
        }],
        required: {
            type: Boolean,
            default: false
        },
        maxSelections: {
            type: Number,
            default: 1
        }
    }],
    stock: {
        type: Number,
        default: 0,
        min: [0, 'Stock cannot be negative']
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    isNewItem: {
        type: Boolean,
        default: false
    },
    preparationTime: {
        type: Number, // minutes
        default: 15
    },
    spicyLevel: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
    },
    tags: [{
        type: String,
        lowercase: true,
        trim: true
    }],
    reviews: [{
        userName: {
            type: String,
            required: true
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },
        comment: {
            type: String,
            maxlength: 500
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    totalReviews: {
        type: Number,
        default: 0
    },
    orderCount: {
        type: Number,
        default: 0
    },
    viewCount: {
        type: Number,
        default: 0
    },
    discountPercentage: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    discountValidUntil: {
        type: Date
    },
    seoTitle: {
        type: String,
        maxlength: 60
    },
    seoDescription: {
        type: String,
        maxlength: 160
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Indexes for better query performance
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, isAvailable: 1 });
productSchema.index({ isFeatured: 1, orderCount: -1 });
productSchema.index({ price: 1 });
productSchema.index({ averageRating: -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ isActive: 1 });

// Virtual for discount price
productSchema.virtual('discountPrice').get(function() {
    if (this.discountPercentage > 0) {
        return this.price * (1 - this.discountPercentage / 100);
    }
    return this.price;
});

// Virtual for primary image
productSchema.virtual('primaryImage').get(function() {
    const primary = this.images.find(img => img.isPrimary);
    return primary ? primary.url : (this.images.length > 0 ? this.images[0].url : '');
});

// Virtual for in stock status
productSchema.virtual('inStock').get(function() {
    return this.stock > 0;
});

// Virtual for discount status
productSchema.virtual('hasDiscount').get(function() {
    return this.discountPercentage > 0 && 
           (!this.discountValidUntil || this.discountValidUntil > new Date());
});

// Pre-save middleware
productSchema.pre('save', function(next) {
    // Update total reviews count
    this.totalReviews = this.reviews.length;
    
    // Calculate average rating
    if (this.reviews.length > 0) {
        const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
        this.averageRating = totalRating / this.reviews.length;
    }
    
    // Set isNewItem to false after 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    if (this.createdAt < thirtyDaysAgo) {
        this.isNewItem = false;
    }
    
    next();
});

// Static method to get featured products
productSchema.statics.getFeatured = function(limit = 8) {
    return this.find({ 
        isFeatured: true, 
        isAvailable: true, 
        isActive: true 
    })
    .sort({ orderCount: -1 })
    .limit(limit);
};

// Static method to get products by category
productSchema.statics.getByCategory = function(category, limit = 10) {
    return this.find({ 
        category, 
        isAvailable: true, 
        isActive: true 
    })
    .sort({ orderCount: -1, createdAt: -1 })
    .limit(limit);
};

// Static method to search products
productSchema.statics.searchProducts = function(query, limit = 20) {
    return this.find({
        $text: { $search: query },
        isAvailable: true,
        isActive: true
    })
    .sort({ score: { $meta: 'textScore' } })
    .limit(limit);
};

// Instance method to add review
productSchema.methods.addReview = function(userName, rating, comment) {
    this.reviews.push({
        userName,
        rating,
        comment,
        createdAt: new Date()
    });
    
    return this.save();
};

// Instance method to increment order count
productSchema.methods.incrementOrderCount = function(quantity = 1) {
    this.orderCount += quantity;
    return this.save();
};

// Instance method to update stock
productSchema.methods.updateStock = function(quantity, operation = 'subtract') {
    if (operation === 'subtract') {
        this.stock = Math.max(0, this.stock - quantity);
    } else if (operation === 'add') {
        this.stock += quantity;
    }
    
    this.isAvailable = this.stock > 0;
    return this.save();
};

// Instance method to check if product is available
productSchema.methods.checkAvailability = function(quantity = 1) {
    return this.isAvailable && this.isActive && this.stock >= quantity;
};

// Instance method to get final price (with discount)
productSchema.methods.getFinalPrice = function(sizeIndex = 0) {
    let basePrice = this.price;
    
    // Add size price if sizes exist
    if (this.sizes && this.sizes.length > 0 && this.sizes[sizeIndex]) {
        basePrice = this.sizes[sizeIndex].price;
    }
    
    // Apply discount if active
    if (this.hasDiscount) {
        basePrice = basePrice * (1 - this.discountPercentage / 100);
    }
    
    return Math.round(basePrice * 100) / 100; // Round to 2 decimal places
};

module.exports = mongoose.model('Product', productSchema);