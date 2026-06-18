// Enhanced Product Catalog with Vendor Support
// Supports multiple vendors selling products

class ProductCatalog {
    constructor() {
        this.storageKey = 'tornetMarketProducts';
        this.cartKey = 'tornetMarketCart';
        this.initializeProducts();
    }

    initializeProducts() {
        if (!localStorage.getItem(this.storageKey)) {
            const products = [
                // TechPro Products
                {
                    id: 1,
                    vendorId: 'techpro',
                    vendorName: 'TechPro Solutions',
                    name: "Advanced Network Toolkit",
                    category: "tech-solutions",
                    price: 49.99,
                    image: "https://via.placeholder.com/200?text=Network+Toolkit",
                    description: "Professional network analysis and diagnostic tools",
                    rating: 4.8,
                    salesCount: 245,
                    inStock: true,
                    tags: ['network', 'tools', 'professional']
                },
                {
                    id: 2,
                    vendorId: 'techpro',
                    vendorName: 'TechPro Solutions',
                    name: "24/7 Technical Support",
                    category: "services",
                    price: 29.99,
                    image: "https://via.placeholder.com/200?text=Support",
                    description: "Round-the-clock technical support and consultation",
                    rating: 4.9,
                    salesCount: 512,
                    inStock: true,
                    tags: ['support', 'consultation', 'service']
                },
                {
                    id: 3,
                    vendorId: 'techpro',
                    vendorName: 'TechPro Solutions',
                    name: "System Optimizer",
                    category: "tech-solutions",
                    price: 39.99,
                    image: "https://via.placeholder.com/200?text=System+Optimizer",
                    description: "Performance optimization and cleanup utility",
                    rating: 4.5,
                    salesCount: 189,
                    inStock: true,
                    tags: ['optimization', 'performance', 'utility']
                },

                // SecureIt Products
                {
                    id: 4,
                    vendorId: 'secureit',
                    vendorName: 'SecureIt Pro',
                    name: "Security Audit Suite",
                    category: "tech-solutions",
                    price: 199.99,
                    image: "https://via.placeholder.com/200?text=Security+Audit",
                    description: "Comprehensive security assessment platform",
                    rating: 4.6,
                    salesCount: 134,
                    inStock: true,
                    tags: ['security', 'audit', 'enterprise']
                },
                {
                    id: 5,
                    vendorId: 'secureit',
                    vendorName: 'SecureIt Pro',
                    name: "Data Recovery Pro",
                    category: "tech-solutions",
                    price: 79.99,
                    image: "https://via.placeholder.com/200?text=Data+Recovery",
                    description: "Advanced data recovery and forensics tools",
                    rating: 4.7,
                    salesCount: 267,
                    inStock: true,
                    tags: ['recovery', 'forensics', 'data']
                },
                {
                    id: 6,
                    vendorId: 'secureit',
                    vendorName: 'SecureIt Pro',
                    name: "Custom Integration Service",
                    category: "services",
                    price: 299.99,
                    image: "https://via.placeholder.com/200?text=Integration",
                    description: "Tailored API and system integration",
                    rating: 4.8,
                    salesCount: 89,
                    inStock: true,
                    tags: ['integration', 'api', 'custom']
                },

                // Digital Content Vendors
                {
                    id: 7,
                    vendorId: 'guidesrepo',
                    vendorName: 'Guides Repository',
                    name: "Security Guidelines PDF",
                    category: "digital-content",
                    price: 14.99,
                    image: "https://via.placeholder.com/200?text=Security+Guide",
                    description: "Comprehensive security best practices guide",
                    rating: 4.6,
                    salesCount: 456,
                    inStock: true,
                    tags: ['guide', 'security', 'pdf']
                },
                {
                    id: 8,
                    vendorId: 'codelibrary',
                    vendorName: 'Code Library',
                    name: "Code Templates Bundle",
                    category: "digital-content",
                    price: 34.99,
                    image: "https://via.placeholder.com/200?text=Code+Templates",
                    description: "50+ ready-to-use code templates",
                    rating: 4.8,
                    salesCount: 678,
                    inStock: true,
                    tags: ['code', 'templates', 'bundle']
                },
                {
                    id: 9,
                    vendorId: 'doccenter',
                    vendorName: 'Doc Center',
                    name: "API Documentation Suite",
                    category: "digital-content",
                    price: 24.99,
                    image: "https://via.placeholder.com/200?text=API+Docs",
                    description: "Complete API reference and examples",
                    rating: 4.7,
                    salesCount: 345,
                    inStock: true,
                    tags: ['api', 'documentation', 'reference']
                },
                {
                    id: 10,
                    vendorId: 'codelibrary',
                    vendorName: 'Code Library',
                    name: "Web Development Kit",
                    category: "digital-content",
                    price: 49.99,
                    image: "https://via.placeholder.com/200?text=Web+Dev+Kit",
                    description: "Complete web development boilerplate",
                    rating: 4.9,
                    salesCount: 523,
                    inStock: true,
                    tags: ['web', 'development', 'kit']
                }
            ];

            localStorage.setItem(this.storageKey, JSON.stringify(products));
        }

        if (!localStorage.getItem(this.cartKey)) {
            localStorage.setItem(this.cartKey, JSON.stringify([]));
        }
    }

    // Get all products
    getAllProducts() {
        return JSON.parse(localStorage.getItem(this.storageKey)) || [];
    }

    // Get products by vendor
    getProductsByVendor(vendorId) {
        const products = this.getAllProducts();
        return products.filter(p => p.vendorId === vendorId);
    }

    // Get products by category
    getProductsByCategory(category) {
        const products = this.getAllProducts();
        return products.filter(p => p.category === category);
    }

    // Get product by ID
    getProductById(id) {
        const products = this.getAllProducts();
        return products.find(p => p.id === id);
    }

    // Search products
    searchProducts(query) {
        const products = this.getAllProducts();
        const searchTerm = query.toLowerCase();
        return products.filter(p =>
            p.name.toLowerCase().includes(searchTerm) ||
            p.description.toLowerCase().includes(searchTerm) ||
            p.vendorName.toLowerCase().includes(searchTerm) ||
            (p.tags && p.tags.some(tag => tag.includes(searchTerm)))
        );
    }

    // Get cart
    getCart() {
        return JSON.parse(localStorage.getItem(this.cartKey)) || [];
    }

    // Add to cart
    addToCart(productId, quantity = 1) {
        const cart = this.getCart();
        const product = this.getProductById(productId);

        if (!product) {
            return { success: false, message: 'Product not found' };
        }

        const existingItem = cart.find(item => item.id === productId);

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({
                id: productId,
                name: product.name,
                price: product.price,
                quantity: quantity,
                image: product.image,
                vendorId: product.vendorId,
                vendorName: product.vendorName
            });
        }

        localStorage.setItem(this.cartKey, JSON.stringify(cart));
        return { success: true, message: 'Product added to cart', cartCount: cart.length };
    }

    // Remove from cart
    removeFromCart(productId) {
        let cart = this.getCart();
        cart = cart.filter(item => item.id !== productId);
        localStorage.setItem(this.cartKey, JSON.stringify(cart));
        return { success: true, message: 'Product removed from cart' };
    }

    // Update cart item quantity
    updateCartQuantity(productId, quantity) {
        const cart = this.getCart();
        const item = cart.find(item => item.id === productId);

        if (item) {
            if (quantity <= 0) {
                return this.removeFromCart(productId);
            }
            item.quantity = quantity;
            localStorage.setItem(this.cartKey, JSON.stringify(cart));
            return { success: true, message: 'Quantity updated' };
        }

        return { success: false, message: 'Item not found in cart' };
    }

    // Get cart total
    getCartTotal() {
        const cart = this.getCart();
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
    }

    // Get cart by vendor (for checkout per vendor)
    getCartByVendor() {
        const cart = this.getCart();
        const vendorCarts = {};

        cart.forEach(item => {
            if (!vendorCarts[item.vendorId]) {
                vendorCarts[item.vendorId] = [];
            }
            vendorCarts[item.vendorId].push(item);
        });

        return vendorCarts;
    }

    // Clear cart
    clearCart() {
        localStorage.setItem(this.cartKey, JSON.stringify([]));
        return { success: true, message: 'Cart cleared' };
    }

    // Get cart count
    getCartCount() {
        const cart = this.getCart();
        return cart.reduce((count, item) => count + item.quantity, 0);
    }

    // Checkout
    checkout() {
        const cart = this.getCart();
        const session = authManager.getSession();

        if (!session) {
            return { success: false, message: 'User not authenticated' };
        }

        if (cart.length === 0) {
            return { success: false, message: 'Cart is empty' };
        }

        // Group items by vendor
        const vendorCarts = this.getCartByVendor();
        const orders = [];

        Object.keys(vendorCarts).forEach(vendorId => {
            const vendorItems = vendorCarts[vendorId];
            const vendorTotal = vendorItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

            const order = {
                orderId: 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
                username: session.username,
                vendorId: vendorId,
                vendorName: vendorItems[0].vendorName,
                items: vendorItems,
                total: vendorTotal.toFixed(2),
                date: new Date().toISOString(),
                status: 'pending',
                deliveryStatus: 'awaiting-confirmation'
            };

            orders.push(order);
        });

        // Save orders to history
        let allOrders = JSON.parse(localStorage.getItem('tornetMarketOrders')) || [];
        allOrders.push(...orders);
        localStorage.setItem('tornetMarketOrders', JSON.stringify(allOrders));

        // Clear cart
        this.clearCart();

        return { success: true, message: 'Orders placed successfully', orders: orders };
    }

    // Get order history
    getOrderHistory(username) {
        const orders = JSON.parse(localStorage.getItem('tornetMarketOrders')) || [];
        return orders.filter(o => o.username === username);
    }

    // Get order by ID
    getOrder(orderId) {
        const orders = JSON.parse(localStorage.getItem('tornetMarketOrders')) || [];
        return orders.find(o => o.orderId === orderId);
    }

    // Add product rating
    addProductRating(productId, rating, comment) {
        let ratings = JSON.parse(localStorage.getItem('tornetMarketProductRatings')) || {};
        if (!ratings[productId]) {
            ratings[productId] = [];
        }

        ratings[productId].push({
            rating: rating,
            comment: comment,
            date: new Date().toISOString()
        });

        localStorage.setItem('tornetMarketProductRatings', JSON.stringify(ratings));
        return { success: true, message: 'Rating added' };
    }

    // Get product ratings
    getProductRatings(productId) {
        const ratings = JSON.parse(localStorage.getItem('tornetMarketProductRatings')) || {};
        return ratings[productId] || [];
    }
}

// Initialize global product catalog
const productCatalog = new ProductCatalog();
