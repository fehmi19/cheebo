const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// GET all products with filtering and pagination
router.get('/', async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            category,
            search,
            minPrice,
            maxPrice,
            isAvailable,
            sort = 'createdAt'
        } = req.query;

        // Build filter object
        const filter = {};
        
        if (category) filter.category = category;
        if (isAvailable !== undefined) filter.isAvailable = isAvailable === 'true';
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
        }

        // Sort options
        const sortOptions = {};
        switch (sort) {
            case 'price_asc':
                sortOptions.price = 1;
                break;
            case 'price_desc':
                sortOptions.price = -1;
                break;
            case 'name':
                sortOptions.name = 1;
                break;
            case 'popularity':
                sortOptions.orderCount = -1;
                break;
            default:
                sortOptions.createdAt = -1;
        }

        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: sortOptions
        };

        const products = await Product.find(filter)
            .sort(sortOptions)
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Product.countDocuments(filter);

        res.json({
            success: true,
            data: products,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: parseInt(limit),
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// GET single product by ID
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                error: 'Product not found'
            });
        }

        // Increment view count
        product.viewCount += 1;
        await product.save();
        
        res.json({
            success: true,
            data: product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// GET products by category
router.get('/category/:category', async (req, res) => {
    try {
        const { category } = req.params;
        const { page = 1, limit = 10 } = req.query;

        const products = await Product.find({ 
            category,
            isAvailable: true 
        })
        .sort({ orderCount: -1, createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

        const total = await Product.countDocuments({ category, isAvailable: true });

        res.json({
            success: true,
            data: products,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalItems: total
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// GET featured/popular products
router.get('/featured/popular', async (req, res) => {
    try {
        const products = await Product.find({ 
            isAvailable: true,
            isFeatured: true 
        })
        .sort({ orderCount: -1 })
        .limit(8);

        res.json({
            success: true,
            data: products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// POST create new product
router.post('/', async (req, res) => {
    try {
        const product = new Product(req.body);
        const savedProduct = await product.save();

        res.status(201).json({
            success: true,
            data: savedProduct,
            message: 'Product created successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// PUT update product
router.put('/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedAt: Date.now() },
            { new: true, runValidators: true }
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                error: 'Product not found'
            });
        }

        res.json({
            success: true,
            data: product,
            message: 'Product updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// PUT update product availability
router.put('/:id/availability', async (req, res) => {
    try {
        const { isAvailable } = req.body;
        
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { isAvailable, updatedAt: Date.now() },
            { new: true }
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                error: 'Product not found'
            });
        }

        res.json({
            success: true,
            data: product,
            message: `Product ${isAvailable ? 'enabled' : 'disabled'} successfully`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// DELETE product
router.delete('/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                error: 'Product not found'
            });
        }

        res.json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// GET product categories
router.get('/categories/list', async (req, res) => {
    try {
        const categories = await Product.distinct('category');
        
        const categoriesWithCount = await Promise.all(
            categories.map(async (category) => {
                const count = await Product.countDocuments({ 
                    category, 
                    isAvailable: true 
                });
                return { name: category, count };
            })
        );

        res.json({
            success: true,
            data: categoriesWithCount
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// POST add review to product
router.post('/:id/reviews', async (req, res) => {
    try {
        const { rating, comment, userName } = req.body;
        
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                error: 'Rating must be between 1 and 5'
            });
        }

        const product = await Product.findById(req.params.id);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                error: 'Product not found'
            });
        }

        const review = {
            userName: userName || 'Anonymous',
            rating,
            comment: comment || '',
            createdAt: new Date()
        };

        product.reviews.push(review);
        
        // Update average rating
        const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0);
        product.averageRating = totalRating / product.reviews.length;

        await product.save();

        res.json({
            success: true,
            data: product,
            message: 'Review added successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// GET product statistics
router.get('/stats/overview', async (req, res) => {
    try {
        const totalProducts = await Product.countDocuments();
        const availableProducts = await Product.countDocuments({ isAvailable: true });
        const outOfStockProducts = await Product.countDocuments({ stock: 0 });
        const featuredProducts = await Product.countDocuments({ isFeatured: true });
        
        const categories = await Product.distinct('category');
        const averagePrice = await Product.aggregate([
            { $group: { _id: null, avgPrice: { $avg: '$price' } } }
        ]);

        res.json({
            success: true,
            data: {
                totalProducts,
                availableProducts,
                outOfStockProducts,
                featuredProducts,
                totalCategories: categories.length,
                averagePrice: averagePrice[0]?.avgPrice || 0
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;