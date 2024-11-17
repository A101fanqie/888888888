// 数据分析系统
class AnalyticsSystem {
    constructor() {
        this.salesChart = null;
        this.userBehaviorChart = null;
        this.initCharts();
    }

    initCharts() {
        // 初始化销售图表
        const salesCtx = document.getElementById('salesChart').getContext('2d');
        this.salesChart = new Chart(salesCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: '销售额',
                    data: [],
                    borderColor: '#007bff',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });

        // 初始化用户行为图表
        const behaviorCtx = document.getElementById('userBehaviorChart').getContext('2d');
        this.userBehaviorChart = new Chart(behaviorCtx, {
            type: 'bar',
            data: {
                labels: ['浏览', '加入购物车', '购买', '收藏', '评价'],
                datasets: [{
                    label: '用户行为统计',
                    data: [],
                    backgroundColor: [
                        '#4caf50',
                        '#2196f3',
                        '#ff9800',
                        '#e91e63',
                        '#9c27b0'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }

    async updateSalesChart(days) {
        // 模拟获取销售数据
        const data = await this.fetchSalesData(days);
        this.salesChart.data.labels = data.labels;
        this.salesChart.data.datasets[0].data = data.values;
        this.salesChart.update();
    }

    async updateUserBehaviorChart() {
        // 模拟获取用户行为数据
        const data = await this.fetchUserBehaviorData();
        this.userBehaviorChart.data.datasets[0].data = data;
        this.userBehaviorChart.update();
    }

    async fetchSalesData(days) {
        // 模拟API调用
        return new Promise(resolve => {
            const labels = [];
            const values = [];
            const today = new Date();
            
            for (let i = days - 1; i >= 0; i--) {
                const date = new Date(today);
                date.setDate(date.getDate() - i);
                labels.push(date.toLocaleDateString());
                values.push(Math.floor(Math.random() * 10000));
            }
            
            resolve({ labels, values });
        });
    }

    async fetchUserBehaviorData() {
        // 模拟API调用
        return new Promise(resolve => {
            resolve([
                Math.floor(Math.random() * 1000),
                Math.floor(Math.random() * 500),
                Math.floor(Math.random() * 200),
                Math.floor(Math.random() * 300),
                Math.floor(Math.random() * 100)
            ]);
        });
    }

    exportSalesReport() {
        const data = this.salesChart.data;
        let csv = 'Date,Sales\n';
        
        data.labels.forEach((label, index) => {
            csv += `${label},${data.datasets[0].data[index]}\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `sales_report_${new Date().toISOString().slice(0,10)}.csv`;
        link.click();
    }
}

// 日志系统
class LogSystem {
    constructor() {
        this.logs = [];
        this.initLogSystem();
    }

    initLogSystem() {
        // 监听全局错误
        window.onerror = (message, source, lineno, colno, error) => {
            this.logError('系统错误', error.stack || message);
        };

        // 监听未处理的Promise错误
        window.onunhandledrejection = (event) => {
            this.logError('Promise错误', event.reason);
        };
    }

    log(type, action, details, user = '系统') {
        const logEntry = {
            timestamp: new Date(),
            type,
            action,
            details,
            user,
            ip: '127.0.0.1' // 实际应用中应从服务器获取
        };

        this.logs.push(logEntry);
        this.saveLogs();
        this.renderLogs();
    }

    logError(action, details) {
        this.log('error', action, details);
    }

    logOperation(action, details, user) {
        this.log('operation', action, details, user);
    }

    logSecurity(action, details, user) {
        this.log('security', action, details, user);
    }

    saveLogs() {
        // 实际应用中应发送到服务器
        localStorage.setItem('system_logs', JSON.stringify(this.logs));
    }

    filterLogs(type = 'all', date = null) {
        let filtered = this.logs;

        if (type !== 'all') {
            filtered = filtered.filter(log => log.type === type);
        }

        if (date) {
            const filterDate = new Date(date).toDateString();
            filtered = filtered.filter(log => 
                new Date(log.timestamp).toDateString() === filterDate
            );
        }

        return filtered;
    }

    renderLogs() {
        const tbody = document.getElementById('logTableBody');
        if (!tbody) return;

        const type = document.getElementById('logType').value;
        const date = document.getElementById('logDate').value;
        const filtered = this.filterLogs(type, date);

        tbody.innerHTML = filtered.map(log => `
            <tr>
                <td>${new Date(log.timestamp).toLocaleString()}</td>
                <td><span class="log-type ${log.type}">${log.type}</span></td>
                <td>${log.user}</td>
                <td>${log.details}</td>
                <td>${log.ip}</td>
            </tr>
        `).join('');
    }
}

// 初始化系统
const analyticsSystem = new AnalyticsSystem();
const logSystem = new LogSystem();

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 更新图表
    analyticsSystem.updateSalesChart(7);
    analyticsSystem.updateUserBehaviorChart();

    // 添加事件监听
    document.getElementById('timeRange').addEventListener('change', (e) => {
        analyticsSystem.updateSalesChart(parseInt(e.target.value));
    });

    // 监听日志筛选
    document.getElementById('logType').addEventListener('change', () => {
        logSystem.renderLogs();
    });

    document.getElementById('logDate').addEventListener('change', () => {
        logSystem.renderLogs();
    });
});

// 导出销售报表
function exportSalesReport() {
    analyticsSystem.exportSalesReport();
}

// 筛选日志
function filterLogs() {
    logSystem.renderLogs();
} 