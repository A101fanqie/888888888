// 库存管理系统
class InventoryManager {
    constructor() {
        this.inventory = JSON.parse(localStorage.getItem('inventory')) || {};
    }

    updateStock(productId, quantity) {
        if (!this.inventory[productId]) {
            this.inventory[productId] = {
                quantity: 0,
                threshold: 10
            };
        }
        this.inventory[productId].quantity += quantity;
        this.saveInventory();
        return this.inventory[productId];
    }

    setThreshold(productId, threshold) {
        if (!this.inventory[productId]) {
            this.inventory[productId] = {
                quantity: 0,
                threshold: threshold
            };
        } else {
            this.inventory[productId].threshold = threshold;
        }
        this.saveInventory();
    }

    checkStock(productId) {
        if (!this.inventory[productId]) return false;
        return this.inventory[productId].quantity > 0;
    }

    isLowStock(productId) {
        if (!this.inventory[productId]) return false;
        return this.inventory[productId].quantity <= this.inventory[productId].threshold;
    }

    saveInventory() {
        localStorage.setItem('inventory', JSON.stringify(this.inventory));
        this.renderInventory();
    }

    renderInventory() {
        const tbody = document.getElementById('inventoryList');
        if (!tbody) return;

        tbody.innerHTML = Object.entries(this.inventory).map(([productId, data]) => {
            const product = products.find(p => p.id === parseInt(productId));
            if (!product) return '';

            return `
                <tr>
                    <td>${productId}</td>
                    <td>${product.name}</td>
                    <td>${data.quantity}</td>
                    <td>${data.threshold}</td>
                    <td class="${data.quantity <= data.threshold ? 'warning' : ''}">
                        ${data.quantity <= data.threshold ? '库存不足' : '正常'}
                    </td>
                    <td>
                        <button onclick="showUpdateInventoryModal(${productId})">调整</button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    exportInventoryReport() {
        const report = Object.entries(this.inventory).map(([productId, data]) => {
            const product = products.find(p => p.id === parseInt(productId));
            return {
                productId,
                productName: product?.name,
                quantity: data.quantity,
                threshold: data.threshold,
                status: data.quantity <= data.threshold ? '库存不足' : '正常'
            };
        });

        // 创建 CSV 内容
        const csv = [
            ['商品ID', '商品名称', '当前库存', '预警阈值', '状态'],
            ...report.map(item => [
                item.productId,
                item.productName,
                item.quantity,
                item.threshold,
                item.status
            ])
        ].map(row => row.join(',')).join('\n');

        // 创建下载链接
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `inventory_report_${new Date().toISOString().slice(0,10)}.csv`;
        link.click();
    }
}

// 售后服务系统
class AfterSalesService {
    constructor() {
        this.services = JSON.parse(localStorage.getItem('services')) || [];
    }

    createService(orderId, productId, type, description) {
        const service = {
            id: Date.now(),
            orderId,
            productId,
            type, // 退款/换货/维修
            description,
            status: 'pending',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        this.services.push(service);
        this.saveServices();
        return service;
    }

    updateServiceStatus(serviceId, status) {
        const service = this.services.find(s => s.id === serviceId);
        if (service) {
            service.status = status;
            service.updatedAt = new Date();
            this.saveServices();
        }
    }

    saveServices() {
        localStorage.setItem('services', JSON.stringify(this.services));
        this.renderServices();
    }

    renderServices() {
        const serviceList = document.querySelector('.service-list');
        if (!serviceList) return;

        serviceList.innerHTML = this.services.map(service => {
            const product = products.find(p => p.id === service.productId);
            return `
                <div class="service-item">
                    <div class="service-header">
                        <h3>售后单号: ${service.id}</h3>
                        <span class="service-status ${service.status}">${service.status}</span>
                    </div>
                    <div class="service-details">
                        <p>订单号: ${service.orderId}</p>
                        <p>商品: ${product?.name}</p>
                        <p>类型: ${service.type}</p>
                        <p>描述: ${service.description}</p>
                        <p>创建时间: ${new Date(service.createdAt).toLocaleString()}</p>
                    </div>
                    <div class="service-actions">
                        <button onclick="updateServiceStatus(${service.id}, 'approved')">
                            批准
                        </button>
                        <button onclick="updateServiceStatus(${service.id}, 'rejected')">
                            拒绝
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }
}

// 添加管理员权限系统
class AdminPermissionSystem {
    constructor() {
        this.roles = {
            superAdmin: {
                name: '超级管理员',
                permissions: ['all']
            },
            admin: {
                name: '管理员',
                permissions: ['products', 'orders', 'inventory']
            },
            editor: {
                name: '编辑',
                permissions: ['products']
            },
            viewer: {
                name: '查看者',
                permissions: ['view']
            }
        };
    }

    hasPermission(role, permission) {
        if (!this.roles[role]) return false;
        return this.roles[role].permissions.includes('all') || 
               this.roles[role].permissions.includes(permission);
    }

    checkPermission(role, permission) {
        if (!this.hasPermission(role, permission)) {
            throw new Error('没有权限执行此操作');
        }
    }
}

// 图片上传和管理系统
class ImageManager {
    constructor() {
        this.supportedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        this.maxSize = 5 * 1024 * 1024; // 5MB
    }

    async uploadImage(file) {
        // 验证文件类型和大小
        if (!this.supportedTypes.includes(file.type)) {
            throw new Error('不支持的文件类型');
        }

        if (file.size > this.maxSize) {
            throw new Error('文件大小超过限制');
        }

        // 压缩图片
        const compressed = await this.compressImage(file);
        
        // 实际应用中这里应该调用API上传图片
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                resolve(reader.result);
            };
            reader.readAsDataURL(compressed);
        });
    }

    async compressImage(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    // 计算压缩后的尺寸
                    let width = img.width;
                    let height = img.height;
                    const maxDimension = 1200;

                    if (width > maxDimension || height > maxDimension) {
                        if (width > height) {
                            height = (height / width) * maxDimension;
                            width = maxDimension;
                        } else {
                            width = (width / height) * maxDimension;
                            height = maxDimension;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob(resolve, 'image/jpeg', 0.8);
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }
}

// 商品批量操作系统
class BatchOperationSystem {
    constructor() {
        this.selectedItems = new Set();
        this.initializeEventListeners();
    }

    toggleSelection(id) {
        if (this.selectedItems.has(id)) {
            this.selectedItems.delete(id);
        } else {
            this.selectedItems.add(id);
        }
        this.updateUI();
    }

    selectAll() {
        products.forEach(product => {
            this.selectedItems.add(product.id);
        });
        this.updateUI();
    }

    clearSelection() {
        this.selectedItems.clear();
        this.updateUI();
    }

    async batchUpdatePrice(adjustment, type = 'percentage') {
        if (this.selectedItems.size === 0) {
            throw new Error('请先选择商品');
        }

        products.forEach(product => {
            if (this.selectedItems.has(product.id)) {
                if (type === 'percentage') {
                    product.price *= (1 + adjustment / 100);
                } else {
                    product.price += adjustment;
                }
                product.price = Math.round(product.price * 100) / 100;
            }
        });

        renderProducts();
        logSystem.logOperation('批量更新价格', 
            `更新了 ${this.selectedItems.size} 个商品的价格`);
    }

    async batchUpdateStock(quantity) {
        if (this.selectedItems.size === 0) {
            throw new Error('请先选择商品');
        }

        products.forEach(product => {
            if (this.selectedItems.has(product.id)) {
                product.stock += quantity;
            }
        });

        renderProducts();
        logSystem.logOperation('批量更新库存', 
            `更新了 ${this.selectedItems.size} 个商品的库存`);
    }

    updateUI() {
        // 更新选择状态的UI显示
        document.querySelectorAll('.product-select').forEach(checkbox => {
            checkbox.checked = this.selectedItems.has(parseInt(checkbox.value));
        });

        // 更新选中数量显示
        const countElement = document.querySelector('.selection-count');
        if (countElement) {
            countElement.textContent = `已选择 ${this.selectedItems.size} 项`;
        }

        // 更新批量操作按钮状态
        const batchButtons = document.querySelectorAll('.batch-operations button');
        batchButtons.forEach(btn => {
            btn.disabled = this.selectedItems.size === 0;
        });
    }

    async batchUpdateCategory(category) {
        if (this.selectedItems.size === 0) {
            throw new Error('请先选择商品');
        }

        products.forEach(product => {
            if (this.selectedItems.has(product.id)) {
                product.category = category;
            }
        });

        renderProducts();
        logSystem.logOperation('批量更新分类', 
            `将 ${this.selectedItems.size} 个商品更新到 ${category} 分类`);
    }

    async batchUpdateStatus(status) {
        if (this.selectedItems.size === 0) {
            throw new Error('请先选择商品');
        }

        products.forEach(product => {
            if (this.selectedItems.has(product.id)) {
                product.status = status; // 'active' 或 'inactive'
            }
        });

        renderProducts();
        logSystem.logOperation('批量更新状态', 
            `将 ${this.selectedItems.size} 个商品状态更新为 ${status}`);
    }

    async batchDelete() {
        if (this.selectedItems.size === 0) {
            throw new Error('请先选择商品');
        }

        if (!confirm(`确定要删除选中的 ${this.selectedItems.size} 个商品吗？`)) {
            return;
        }

        const originalLength = products.length;
        products = products.filter(product => !this.selectedItems.has(product.id));
        
        logSystem.logOperation('批量删除商品', 
            `删除了 ${originalLength - products.length} 个商品`);
        
        this.clearSelection();
        renderProducts();
    }

    async batchExport() {
        const selectedProducts = products.filter(p => this.selectedItems.has(p.id));
        const csv = this.convertToCSV(selectedProducts);
        this.downloadCSV(csv, 'products_export.csv');
    }

    async batchImport(file) {
        try {
            const text = await file.text();
            const imported = this.parseCSV(text);
            
            // 验证导入的数据
            if (!this.validateImportData(imported)) {
                throw new Error('导入数据格式不正确');
            }

            // 合并或更新商品数据
            imported.forEach(item => {
                const existingIndex = products.findIndex(p => p.id === item.id);
                if (existingIndex !== -1) {
                    products[existingIndex] = { ...products[existingIndex], ...item };
                } else {
                    products.push(item);
                }
            });

            renderProducts();
            logSystem.logOperation('批量导入商品', 
                `成功导入 ${imported.length} 个商品`);
        } catch (error) {
            alert('导入失败：' + error.message);
        }
    }

    async batchUpdateImages(imageType) {
        if (this.selectedItems.size === 0) {
            throw new Error('请先选择商品');
        }

        const compressionOptions = {
            thumbnail: { maxWidth: 100, maxHeight: 100, quality: 0.6 },
            standard: { maxWidth: 800, maxHeight: 800, quality: 0.8 },
            highRes: { maxWidth: 2000, maxHeight: 2000, quality: 0.9 }
        };

        try {
            const updates = Array.from(this.selectedItems).map(async productId => {
                const product = products.find(p => p.id === productId);
                if (product && product.image) {
                    const compressedImage = await imageManager.compressImage(
                        product.image,
                        compressionOptions[imageType]
                    );
                    product.images = {
                        ...product.images,
                        [imageType]: compressedImage
                    };
                }
            });

            await Promise.all(updates);
            renderProducts();
            logSystem.logOperation('批量处理图片', 
                `处理了 ${this.selectedItems.size} 个商品的图片`);
        } catch (error) {
            alert('图片处理失败：' + error.message);
        }
    }

    // 辅助方法
    convertToCSV(items) {
        const headers = ['id', 'name', 'price', 'category', 'description', 'stock'];
        const rows = items.map(item => 
            headers.map(header => item[header]).join(',')
        );
        return [headers.join(','), ...rows].join('\n');
    }

    parseCSV(text) {
        const lines = text.split('\n');
        const headers = lines[0].split(',');
        return lines.slice(1).map(line => {
            const values = line.split(',');
            return headers.reduce((obj, header, index) => {
                obj[header] = values[index];
                return obj;
            }, {});
        });
    }

    validateImportData(data) {
        const requiredFields = ['name', 'price', 'category'];
        return data.every(item => 
            requiredFields.every(field => item.hasOwnProperty(field))
        );
    }

    downloadCSV(csv, filename) {
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
    }

    initializeEventListeners() {
        document.addEventListener('DOMContentLoaded', () => {
            const batchOperationsContainer = document.createElement('div');
            batchOperationsContainer.className = 'batch-operations';
            batchOperationsContainer.innerHTML = `
                <div class="batch-selection">
                    <button onclick="batchOperation.selectAll()" class="btn-primary">全选</button>
                    <button onclick="batchOperation.clearSelection()" class="btn-secondary">取消选择</button>
                    <span class="selection-count">已选择 0 项</span>
                </div>
                
                <div class="batch-actions">
                    <div class="action-group">
                        <h4>商品管理</h4>
                        <button onclick="showBatchCategoryModal()" class="btn-primary">批量修改分类</button>
                        <button onclick="showBatchPriceModal()" class="btn-primary">批量调整价格</button>
                        <button onclick="showBatchStockModal()" class="btn-primary">批量调整库存</button>
                    </div>
                    
                    <div class="action-group">
                        <h4>状态操作</h4>
                        <button onclick="confirmBatchAction('上架', () => batchOperation.batchUpdateStatus('active'))" 
                                class="btn-success">批量上架</button>
                        <button onclick="confirmBatchAction('下架', () => batchOperation.batchUpdateStatus('inactive'))" 
                                class="btn-warning">批量下架</button>
                        <button onclick="confirmBatchAction('删除', () => batchOperation.batchDelete())" 
                                class="btn-danger">批量删除</button>
                    </div>
                    
                    <div class="action-group">
                        <h4>数据操作</h4>
                        <button onclick="batchOperation.batchExport()" class="btn-info">导出选中</button>
                        <label class="btn-info import-label">
                            导入商品
                            <input type="file" id="batchImport" accept=".csv" style="display: none">
                        </label>
                    </div>
                    
                    <div class="action-group">
                        <h4>图片处理</h4>
                        <button onclick="confirmBatchAction('生成缩略图', () => batchOperation.batchUpdateImages('thumbnail'))" 
                                class="btn-primary">生成缩略图</button>
                        <button onclick="confirmBatchAction('生成标准图', () => batchOperation.batchUpdateImages('standard'))" 
                                class="btn-primary">生成标准图</button>
                        <button onclick="confirmBatchAction('生成高清图', () => batchOperation.batchUpdateImages('highRes'))" 
                                class="btn-primary">生成高清图</button>
                    </div>
                </div>
            `;

            // 添加到适当的容器中
            const productSection = document.querySelector('#products');
            if (productSection) {
                productSection.insertBefore(batchOperationsContainer, productSection.firstChild);
            }

            // 添加文件导入监听
            document.getElementById('batchImport').addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    confirmBatchAction('导入', () => this.batchImport(e.target.files[0]));
                }
            });
        });
    }
}

// 初始化管理系统
const inventoryManager = new InventoryManager();
const afterSalesService = new AfterSalesService();
const permissionSystem = new AdminPermissionSystem();
const imageManager = new ImageManager();
const batchOperation = new BatchOperationSystem();

// 显示库存调整模态框
function showUpdateInventoryModal(productId) {
    const modal = document.getElementById('inventoryModal');
    const form = document.getElementById('inventoryForm');
    const product = products.find(p => p.id === productId);
    const inventory = inventoryManager.inventory[productId];

    form.elements.productId.value = productId;
    form.elements.quantity.value = inventory?.quantity || 0;
    form.elements.threshold.value = inventory?.threshold || 10;

    modal.style.display = 'block';
}

// 处理库存表单提交
document.getElementById('inventoryForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const form = e.target;
    const productId = parseInt(form.elements.productId.value);
    const quantity = parseInt(form.elements.quantity.value);
    const threshold = parseInt(form.elements.threshold.value);

    inventoryManager.updateStock(productId, quantity);
    inventoryManager.setThreshold(productId, threshold);

    document.getElementById('inventoryModal').style.display = 'none';
});

// 导出库存报表
function exportInventory() {
    inventoryManager.exportInventoryReport();
}

// 更新售后服务状态
function updateServiceStatus(serviceId, status) {
    afterSalesService.updateServiceStatus(serviceId, status);
}

// 初始化页面
document.addEventListener('DOMContentLoaded', () => {
    // 渲染初始数据
    inventoryManager.renderInventory();
    afterSalesService.renderServices();

    // 处理菜单切换
    document.querySelectorAll('.admin-menu a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = e.target.getAttribute('href').slice(1);
            
            // 更新活动菜单
            document.querySelectorAll('.admin-menu a').forEach(a => a.classList.remove('active'));
            e.target.classList.add('active');

            // 显示对应部分
            document.querySelectorAll('.admin-section').forEach(section => {
                section.style.display = section.id === targetId ? 'block' : 'none';
            });
        });
    });
});

// 显示批量修改分类的模态框
function showBatchCategoryModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2>批量修改分类</h2>
            <select id="batchCategory">
                <option value="">请选择分类</option>
                ${Object.entries(categories).map(([key, value]) => 
                    `<option value="${key}">${value}</option>`
                ).join('')}
            </select>
            <button onclick="confirmBatchCategory()">确认修改</button>
        </div>
    `;
    document.body.appendChild(modal);
    modal.style.display = 'block';

    // 关闭模态框的事件
    modal.querySelector('.close').onclick = () => {
        modal.remove();
    };
}

// 确认批量修改分类
function confirmBatchCategory() {
    const category = document.getElementById('batchCategory').value;
    if (category) {
        batchOperation.batchUpdateCategory(category);
        document.querySelector('.modal').remove();
    } else {
        alert('请选择分类');
    }
}

// 添加确认对话框函数
function confirmBatchAction(actionName, callback) {
    const selectedCount = batchOperation.selectedItems.size;
    if (selectedCount === 0) {
        alert('请先选择要操作的商品');
        return;
    }

    const modal = document.createElement('div');
    modal.className = 'modal confirmation-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>确认${actionName}操作</h3>
            <p>您确定要对选中的 ${selectedCount} 个商品进行${actionName}操作吗？</p>
            <div class="modal-actions">
                <button onclick="this.closest('.modal').remove()" class="btn-secondary">取消</button>
                <button onclick="executeConfirmedAction()" class="btn-primary">确认</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.style.display = 'block';

    // 存储回调函数
    window.executeConfirmedAction = async () => {
        try {
            await callback();
            modal.remove();
        } catch (error) {
            alert(error.message);
        }
    };
}

// 添加批量价格调整模态框
function showBatchPriceModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2>批量调整价格</h2>
            <div class="form-group">
                <label>调整方式：</label>
                <select id="priceAdjustType">
                    <option value="percentage">按百分比</option>
                    <option value="fixed">固定金额</option>
                </select>
            </div>
            <div class="form-group">
                <label>调整值：</label>
                <input type="number" id="priceAdjustValue" step="0.01">
                <span id="adjustmentHint"></span>
            </div>
            <button onclick="confirmBatchPrice()" class="btn-primary">确认调整</button>
        </div>
    `;
    document.body.appendChild(modal);
    modal.style.display = 'block';

    // 关闭模态框的事件
    modal.querySelector('.close').onclick = () => modal.remove();

    // 动态更新提示文字
    document.getElementById('priceAdjustType').addEventListener('change', updatePriceAdjustHint);
    updatePriceAdjustHint();
}

// 更新价格调整提示
function updatePriceAdjustHint() {
    const type = document.getElementById('priceAdjustType').value;
    const hint = document.getElementById('adjustmentHint');
    hint.textContent = type === 'percentage' ? '例：10 表示上调10%，-10 表示下调10%' : '例：100 表示增加100元，-100 表示减少100元';
}

// 确认批量调整价格
function confirmBatchPrice() {
    const type = document.getElementById('priceAdjustType').value;
    const value = parseFloat(document.getElementById('priceAdjustValue').value);

    if (isNaN(value)) {
        alert('请输入有效的数值');
        return;
    }

    confirmBatchAction('价格调整', () => batchOperation.batchUpdatePrice(value, type));
    document.querySelector('.modal').remove();
}

// 添加批量库存调整模态框
function showBatchStockModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2>批量调整库存</h2>
            <div class="form-group">
                <label>调整数量：</label>
                <input type="number" id="stockAdjustValue">
                <span>正数表示增加库存，负数表示减少库存</span>
            </div>
            <button onclick="confirmBatchStock()" class="btn-primary">确认调整</button>
        </div>
    `;
    document.body.appendChild(modal);
    modal.style.display = 'block';

    // 关闭模态框的事件
    modal.querySelector('.close').onclick = () => modal.remove();
}

// 确认批量调整库存
function confirmBatchStock() {
    const value = parseInt(document.getElementById('stockAdjustValue').value);

    if (isNaN(value)) {
        alert('请输入有效的数值');
        return;
    }

    confirmBatchAction('库存调整', () => batchOperation.batchUpdateStock(value));
    document.querySelector('.modal').remove();
} 