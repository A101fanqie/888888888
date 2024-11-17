// 商品数据
const products = [
    {
        id: 1,
        name: "iPhone 14",
        price: 5999.99,
        image: "https://via.placeholder.com/200",
        description: "最新款智能手机",
        category: 'phone',
        stock: 10,
        reviews: []
    },
    {
        id: 2,
        name: "MacBook Pro",
        price: 12999.99,
        image: "https://via.placeholder.com/200",
        description: "专业级笔记本电脑",
        category: 'computer',
        stock: 5,
        reviews: []
    },
    {
        id: 3,
        name: "AirPods Pro",
        price: 1999.99,
        image: "https://via.placeholder.com/200",
        description: "无线降噪耳机",
        category: 'accessory',
        stock: 15,
        reviews: []
    }
];

// 购物车功能增强
class CartItem {
    constructor(product, quantity = 1) {
        this.product = product;
        this.quantity = quantity;
    }

    get total() {
        return this.product.price * this.quantity;
    }
}

class Cart {
    constructor() {
        this.items = [];
    }

    addItem(product) {
        const existingItem = this.items.find(item => item.product.id === product.id);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            this.items.push(new CartItem(product));
        }
        this.save();
        this.render();
    }

    removeItem(productId) {
        this.items = this.items.filter(item => item.product.id !== productId);
        this.save();
        this.render();
    }

    updateQuantity(productId, quantity) {
        const item = this.items.find(item => item.product.id === productId);
        if (item) {
            item.quantity = Math.max(1, quantity);
            this.save();
            this.render();
        }
    }

    get total() {
        return this.items.reduce((sum, item) => sum + item.total, 0);
    }

    save() {
        localStorage.setItem('cart', JSON.stringify(this.items));
    }

    load() {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            const parsedCart = JSON.parse(savedCart);
            this.items = parsedCart.map(item => new CartItem(item.product, item.quantity));
        }
    }

    render() {
        const cartItems = document.querySelector('.cart-items');
        const totalAmount = document.querySelector('.total-amount');
        
        cartItems.innerHTML = this.items.map(item => `
            <div class="cart-item">
                <img src="${item.product.image}" alt="${item.product.name}">
                <div class="item-details">
                    <h3>${item.product.name}</h3>
                    <p>￥${item.product.price}</p>
                    <div class="quantity-controls">
                        <button onclick="cart.updateQuantity(${item.product.id}, ${item.quantity - 1})">-</button>
                        <span>${item.quantity}</span>
                        <button onclick="cart.updateQuantity(${item.product.id}, ${item.quantity + 1})">+</button>
                    </div>
                </div>
                <button onclick="cart.removeItem(${item.product.id})" class="remove-btn">删除</button>
            </div>
        `).join('');

        totalAmount.textContent = `￥${this.total.toFixed(2)}`;
        updateCartTotal();
    }
}

// 初始化购物车
const cart = new Cart();
cart.load();

// 登录功能
function showLogin() {
    document.getElementById('loginModal').style.display = 'block';
}

function hideLogin() {
    document.getElementById('loginModal').style.display = 'none';
}

// 结算功能
function checkout() {
    if (!isLoggedIn()) {
        showLogin();
        return;
    }
    
    if (cart.items.length === 0) {
        alert('购物车是空的！');
        return;
    }
    
    // 这里添加结算逻辑
    alert('正在跳转到支付页面...');
}

// 页面加载完成后的初始化
document.addEventListener('DOMContentLoaded', () => {
    createProgressBar();
    renderProducts();
    cart.render();
    
    // 关闭模态框
    document.querySelector('.close').onclick = hideLogin;
    
    // 点击模态框外部关闭
    window.onclick = (event) => {
        if (event.target.className === 'modal') {
            hideLogin();
        }
    };
});

// 登录表单处理
document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    // 这里添加登录逻辑
    alert('登录成功！');
    hideLogin();
});

// 渲染产品列表
function renderProducts(productList = products) {
    const productGrid = document.querySelector('.product-grid');
    productGrid.innerHTML = productList.map((_, index) => `
        <div class="product-card skeleton">
            <div class="product-image skeleton"></div>
            <div class="product-info skeleton"></div>
        </div>
    `).join('');

    // 模拟加载延迟
    setTimeout(() => {
        productGrid.innerHTML = productList.map(product => `
            <div class="product-card" data-product-id="${product.id}">
                <img data-src="${product.image}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p class="price">￥${product.price}</p>
                <p>${product.description}</p>
                <button onclick="favoriteSystem.toggleFavorite(${product.id})" 
                        class="favorite-btn ${favoriteSystem.isFavorite(product.id) ? 'active' : ''}">
                    ${favoriteSystem.isFavorite(product.id) ? '❤️' : '🤍'}
                </button>
                <button onclick="addToCart(${product.id})" class="add-to-cart-btn">
                    加入购物车
                </button>
            </div>
        `).join('');
        lazyLoadImages();
    }, 1000);
}

// 添加到购物车
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        // 创建飞入动画元素
        const productCard = document.querySelector(`[data-product-id="${productId}"]`);
        const productRect = productCard.getBoundingClientRect();
        const cartIcon = document.querySelector('.cart-icon');
        const cartRect = cartIcon.getBoundingClientRect();

        const flyingItem = document.createElement('div');
        flyingItem.className = 'flying-item';
        flyingItem.style.cssText = `
            position: fixed;
            z-index: 1000;
            width: 50px;
            height: 50px;
            background-image: url(${product.image});
            background-size: cover;
            border-radius: 50%;
            left: ${productRect.left + productRect.width/2}px;
            top: ${productRect.top + productRect.height/2}px;
        `;
        document.body.appendChild(flyingItem);

        // 执行动画
        requestAnimationFrame(() => {
            flyingItem.style.transition = 'all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)';
            flyingItem.style.transform = 'scale(0.2)';
            flyingItem.style.left = `${cartRect.left + cartRect.width/2}px`;
            flyingItem.style.top = `${cartRect.top + cartRect.height/2}px`;
        });

        setTimeout(() => {
            flyingItem.remove();
            cart.addItem(product);
            showToast('商品已添加到购物车！');
        }, 800);
    }
}

// 更新购物车
function updateCart() {
    console.log('购物车内容：', cart);
    // 这里可以添加更新购物车UI的代码
}

// 添加用户管理类
class UserManager {
    constructor() {
        this.currentUser = null;
        this.users = JSON.parse(localStorage.getItem('users')) || [];
    }

    register(username, email, password) {
        if (this.users.find(u => u.email === email)) {
            throw new Error('邮箱已被注册');
        }

        const user = {
            id: Date.now(),
            username,
            email,
            password: this.hashPassword(password),
            createdAt: new Date()
        };

        this.users.push(user);
        this.saveUsers();
        return user;
    }

    login(email, password) {
        const user = this.users.find(u => 
            u.email === email && 
            u.password === this.hashPassword(password)
        );

        if (user) {
            this.currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            return user;
        }
        throw new Error('邮箱或密码错误');
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
    }

    isLoggedIn() {
        return !!this.currentUser;
    }

    hashPassword(password) {
        // 实际应用中应使用更安全的哈希算法
        return btoa(password);
    }

    saveUsers() {
        localStorage.setItem('users', JSON.stringify(this.users));
    }
}

// 商品搜索和过滤功能
function searchProducts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const filteredProducts = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm)
    );
    renderProducts(filteredProducts);
}

// 显示商品详情
function showProductDetail(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const modal = document.getElementById('productModal');
    const detailContent = document.getElementById('productDetail');

    detailContent.innerHTML = `
        <div class="product-detail-content">
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}">
            </div>
            <div class="product-info">
                <h2>${product.name}</h2>
                <div class="product-price">￥${product.price}</div>
                <p class="product-description">${product.description}</p>
                <div class="stock-info">库存: ${product.stock} 件</div>
                <div class="quantity-selector">
                    <button onclick="updateQuantity('decrease')">-</button>
                    <span id="quantity">1</span>
                    <button onclick="updateQuantity('increase')">+</button>
                </div>
                <button class="checkout-btn" onclick="addToCartFromDetail(${product.id})">
                    加入购物车
                </button>
            </div>
        </div>
    `;

    modal.style.display = 'block';
}

// 更新商品详情页中的数量
function updateQuantity(action) {
    const quantityElement = document.getElementById('quantity');
    let quantity = parseInt(quantityElement.textContent);

    if (action === 'increase') {
        quantity++;
    } else if (action === 'decrease' && quantity > 1) {
        quantity--;
    }

    quantityElement.textContent = quantity;
}

// 从详情页添加到购物车
function addToCartFromDetail(productId) {
    const quantity = parseInt(document.getElementById('quantity').textContent);
    const product = products.find(p => p.id === productId);
    
    for (let i = 0; i < quantity; i++) {
        cart.addItem(product);
    }
    
    document.getElementById('productModal').style.display = 'none';
    alert(`已将 ${quantity} 件商品添加到购物车`);
}

// 初始化用户管理器
const userManager = new UserManager();

// 处理注册表单提交
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    try {
        const user = userManager.register(
            form.elements[0].value,
            form.elements[1].value,
            form.elements[2].value
        );
        alert('注册成功！');
        hideRegister();
        showLogin();
    } catch (error) {
        alert(error.message);
    }
});

// 更新登录检查函数
function isLoggedIn() {
    return userManager.isLoggedIn();
}

// 添加商品分类
const categories = {
    phone: '手机',
    computer: '电脑',
    accessory: '配件'
};

// 订单管理类
class OrderManager {
    constructor() {
        this.orders = JSON.parse(localStorage.getItem('orders')) || [];
    }

    createOrder(cartItems, totalAmount) {
        const order = {
            id: Date.now(),
            items: cartItems,
            total: totalAmount,
            status: 'pending',
            date: new Date(),
            userId: userManager.currentUser?.id
        };

        this.orders.push(order);
        this.saveOrders();
        return order;
    }

    getUserOrders(userId) {
        return this.orders.filter(order => order.userId === userId);
    }

    updateOrderStatus(orderId, status) {
        const order = this.orders.find(o => o.id === orderId);
        if (order) {
            order.status = status;
            this.saveOrders();
        }
    }

    saveOrders() {
        localStorage.setItem('orders', JSON.stringify(this.orders));
    }

    renderOrders() {
        if (!userManager.isLoggedIn()) return;

        const orderList = document.querySelector('.order-list');
        const userOrders = this.getUserOrders(userManager.currentUser.id);

        orderList.innerHTML = userOrders.map(order => `
            <div class="order-item">
                <div class="order-header">
                    <span>订单号: ${order.id}</span>
                    <span>状态: ${order.status}</span>
                    <span>日期: ${new Date(order.date).toLocaleDateString()}</span>
                </div>
                <div class="order-products">
                    ${order.items.map(item => `
                        <div class="order-product">
                            <img src="${item.product.image}" alt="${item.product.name}" width="50">
                            <div>
                                <h4>${item.product.name}</h4>
                                <p>数量: ${item.quantity}</p>
                            </div>
                            <button onclick="showReviewModal(${item.product.id})" 
                                    ${order.status !== 'completed' ? 'disabled' : ''}>
                                评价
                            </button>
                        </div>
                    `).join('')}
                </div>
                <div class="order-total">
                    总计: ￥${order.total.toFixed(2)}
                </div>
            </div>
        `).join('');
    }
}

// 评价系统
class ReviewSystem {
    constructor() {
        this.initializeRating();
    }

    initializeRating() {
        const stars = document.querySelectorAll('.star');
        stars.forEach(star => {
            star.addEventListener('click', () => this.setRating(star.dataset.rating));
            star.addEventListener('mouseover', () => this.highlightStars(star.dataset.rating));
            star.addEventListener('mouseout', () => this.resetStars());
        });
    }

    setRating(rating) {
        this.currentRating = rating;
        this.highlightStars(rating);
    }

    highlightStars(rating) {
        const stars = document.querySelectorAll('.star');
        stars.forEach(star => {
            star.classList.toggle('active', star.dataset.rating <= rating);
        });
    }

    resetStars() {
        if (!this.currentRating) {
            this.highlightStars(0);
        } else {
            this.highlightStars(this.currentRating);
        }
    }

    addReview(productId, rating, comment) {
        const product = products.find(p => p.id === productId);
        if (product) {
            const review = {
                userId: userManager.currentUser.id,
                username: userManager.currentUser.username,
                rating: rating,
                comment: comment,
                date: new Date()
            };
            product.reviews.push(review);
            this.renderProductReviews(productId);
        }
    }

    renderProductReviews(productId) {
        const product = products.find(p => p.id === productId);
        if (!product) return;

        const reviewsHtml = product.reviews.map(review => `
            <div class="review-item">
                <div class="review-header">
                    <span>${review.username}</span>
                    <span class="review-rating">${'★'.repeat(review.rating)}</span>
                </div>
                <p>${review.comment}</p>
                <small>${new Date(review.date).toLocaleDateString()}</small>
            </div>
        `).join('');

        const reviewsContainer = document.querySelector('.reviews');
        if (reviewsContainer) {
            reviewsContainer.innerHTML = reviewsHtml;
        }
    }
}

// 初始化订单管理器和评价系统
const orderManager = new OrderManager();
const reviewSystem = new ReviewSystem();

// 分类过滤功能
function filterByCategory(category) {
    const filteredProducts = category === 'all' 
        ? products 
        : products.filter(p => p.category === category);
    renderProducts(filteredProducts);
}

// 更新结算功能
function checkout() {
    if (!userManager.isLoggedIn()) {
        showLogin();
        return;
    }
    
    if (cart.items.length === 0) {
        alert('购物车是空的！');
        return;
    }
    
    const order = orderManager.createOrder(cart.items, cart.total);
    cart.items = [];
    cart.save();
    cart.render();
    orderManager.renderOrders();
    alert('订单创建成功！');
}

// 初始化页
document.addEventListener('DOMContentLoaded', () => {
    // ... 现有的初始化代码 ...
    
    // 添加分类按钮事件监听
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            filterByCategory(e.target.dataset.category);
        });
    });
});

// 地址管理类
class AddressManager {
    constructor() {
        this.addresses = JSON.parse(localStorage.getItem('addresses')) || [];
        this.selectedAddress = null;
    }

    addAddress(address) {
        address.id = Date.now();
        this.addresses.push(address);
        this.saveAddresses();
    }

    removeAddress(addressId) {
        this.addresses = this.addresses.filter(addr => addr.id !== addressId);
        this.saveAddresses();
    }

    setDefaultAddress(addressId) {
        this.addresses.forEach(addr => addr.isDefault = (addr.id === addressId));
        this.saveAddresses();
    }

    getDefaultAddress() {
        return this.addresses.find(addr => addr.isDefault) || this.addresses[0];
    }

    saveAddresses() {
        localStorage.setItem('addresses', JSON.stringify(this.addresses));
        this.renderAddresses();
    }

    renderAddresses() {
        const addressList = document.querySelector('.address-list');
        if (!addressList) return;

        addressList.innerHTML = this.addresses.map(addr => `
            <div class="address-item ${addr.isDefault ? 'selected' : ''}">
                <div class="address-info">
                    <p>${addr.name} ${addr.phone}</p>
                    <p>${addr.province}${addr.city}${addr.detail}</p>
                </div>
                <div class="address-actions">
                    ${!addr.isDefault ? 
                        `<button onclick="addressManager.setDefaultAddress(${addr.id})">设为默认</button>` : 
                        '<span class="default-badge">默认地址</span>'
                    }
                    <button onclick="addressManager.removeAddress(${addr.id})">删除</button>
                </div>
            </div>
        `).join('');
    }
}

// 支付系统类
class PaymentSystem {
    constructor() {
        this.currentOrder = null;
    }

    async processPayment(order, paymentMethod) {
        this.currentOrder = order;
        
        // 显示支付确认界面
        const paymentModal = document.getElementById('paymentModal');
        const orderInfo = paymentModal.querySelector('.order-info');
        
        orderInfo.innerHTML = `
            <div class="order-info-item">
                <span>订单编号：</span>
                <span>${order.id}</span>
            </div>
            <div class="order-info-item">
                <span>支付金额：</span>
                <span>￥${order.total.toFixed(2)}</span>
            </div>
            <div class="order-info-item">
                <span>收货地址：</span>
                <span>${this.formatAddress(addressManager.getDefaultAddress())}</span>
            </div>
        `;
        
        paymentModal.style.display = 'block';
    }

    formatAddress(address) {
        if (!address) return '请添加收货地址';
        return `${address.province}${address.city}${address.detail} (${address.name})`;
    }

    async confirmPayment(paymentMethod) {
        try {
            // 这里应该调用实际的支付API
            await this.simulatePayment();
            
            // 更新订单状态
            orderManager.updateOrderStatus(this.currentOrder.id, 'paid');
            
            alert('支付成功！');
            document.getElementById('paymentModal').style.display = 'none';
            
            // 刷新订单列表
            orderManager.renderOrders();
        } catch (error) {
            alert('支付失败：' + error.message);
        }
    }

    simulatePayment() {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // 模拟90%的支付成功率
                if (Math.random() > 0.1) {
                    resolve();
                } else {
                    reject(new Error('支付处理失败，请重试'));
                }
            }, 1500);
        });
    }
}

// 初始化地址管理器和支付系统
const addressManager = new AddressManager();
const paymentSystem = new PaymentSystem();

// 显示添加地址表单
function showAddAddressForm() {
    document.getElementById('addressForm').style.display = 'block';
}

// 处理地址表单提交
document.getElementById('addressForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const form = e.target;
    const address = {
        name: form.elements[0].value,
        phone: form.elements[1].value,
        province: form.elements[2].value,
        city: form.elements[3].value,
        detail: form.elements[4].value,
        isDefault: addressManager.addresses.length === 0 // 第一个地址默认设为默认地址
    };
    
    addressManager.addAddress(address);
    form.reset();
    form.style.display = 'none';
});

// 更新结算功能
function checkout() {
    if (!userManager.isLoggedIn()) {
        showLogin();
        return;
    }
    
    if (cart.items.length === 0) {
        alert('购物车是空的！');
        return;
    }

    if (addressManager.addresses.length === 0) {
        alert('请先添加收货地址！');
        document.getElementById('addressModal').style.display = 'block';
        return;
    }
    
    const order = orderManager.createOrder(cart.items, cart.total);
    paymentSystem.processPayment(order);
}

// 处理支付
async function processPayment() {
    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
    await paymentSystem.confirmPayment(paymentMethod);
}

// 收藏系统类
class FavoriteSystem {
    constructor() {
        this.favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    }

    toggleFavorite(productId) {
        const index = this.favorites.indexOf(productId);
        if (index === -1) {
            this.favorites.push(productId);
            this.showToast('已添加到收藏夹');
        } else {
            this.favorites.splice(index, 1);
            this.showToast('已从收藏夹移除');
        }
        this.saveFavorites();
        this.renderFavorites();
    }

    isFavorite(productId) {
        return this.favorites.includes(productId);
    }

    saveFavorites() {
        localStorage.setItem('favorites', JSON.stringify(this.favorites));
    }

    showToast(message) {
        // 简单的提示信息
        alert(message);
    }

    renderFavorites() {
        const favoritesGrid = document.querySelector('.favorites-grid');
        if (!favoritesGrid) return;

        const favoriteProducts = products.filter(p => this.favorites.includes(p.id));
        favoritesGrid.innerHTML = favoriteProducts.map(product => `
            <div class="product-card">
                <img src="${product.image}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p>￥${product.price}</p>
                <p>${product.description}</p>
                <button onclick="favoriteSystem.toggleFavorite(${product.id})">
                    取消收藏
                </button>
                <button onclick="addToCart(${product.id})">
                    加入购物车
                </button>
            </div>
        `).join('');
    }
}

// 优惠券系统类
class CouponSystem {
    constructor() {
        // 示例优惠券数据
        this.coupons = {
            'WELCOME2024': { type: 'percentage', value: 10 }, // 10%折扣
            'SAVE50': { type: 'fixed', value: 50 }, // 直接减50
            'NEWUSER': { type: 'percentage', value: 15 } // 15%折扣
        };
        this.currentCoupon = null;
    }

    applyCoupon(code) {
        const coupon = this.coupons[code];
        if (!coupon) {
            throw new Error('无效的优惠券码');
        }
        this.currentCoupon = { ...coupon, code };
        return this.currentCoupon;
    }

    calculateDiscount(subtotal) {
        if (!this.currentCoupon) return 0;

        if (this.currentCoupon.type === 'percentage') {
            return subtotal * (this.currentCoupon.value / 100);
        } else {
            return Math.min(this.currentCoupon.value, subtotal);
        }
    }

    removeCoupon() {
        this.currentCoupon = null;
    }
}

// 初始化收藏和优惠券系统
const favoriteSystem = new FavoriteSystem();
const couponSystem = new CouponSystem();

// 应用优惠券
function applyCoupon() {
    const code = document.getElementById('couponCode').value;
    try {
        const coupon = couponSystem.applyCoupon(code);
        updateCartTotal();
        alert(`优惠券使用成功！${coupon.type === 'percentage' ? `享受${coupon.value}%折扣` : `立减${coupon.value}元`}`);
    } catch (error) {
        alert(error.message);
    }
}

// 更新购物车总价显示
function updateCartTotal() {
    const subtotal = cart.total;
    const discount = couponSystem.calculateDiscount(subtotal);
    const total = subtotal - discount;

    document.querySelector('.subtotal-amount').textContent = `￥${subtotal.toFixed(2)}`;
    
    const discountElement = document.querySelector('.discount');
    const discountAmount = document.querySelector('.discount-amount');
    
    if (discount > 0) {
        discountElement.style.display = 'flex';
        discountAmount.textContent = `-￥${discount.toFixed(2)}`;
    } else {
        discountElement.style.display = 'none';
    }

    document.querySelector('.total-amount').textContent = `￥${total.toFixed(2)}`;
}

// 添加滚动进度条
function createProgressBar() {
    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    document.body.appendChild(progressBar);

    window.addEventListener('scroll', () => {
        const winScroll = document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        progressBar.style.width = scrolled + '%';
    });
}

// 添加通知提示功能
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// 添加图片懒加载
function lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
}