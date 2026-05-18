<template>
  <div class="order-management">
    <!-- 页面标题和统计 -->
    <div class="page-header">
      <h1>订单管理</h1>
      <div class="stats-cards">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #409eff;">
              <el-icon><Document /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.total_orders || 0 }}</div>
              <div class="stat-label">总订单数</div>
            </div>
          </div>
        </el-card>
        
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #67c23a;">
              <el-icon><Money /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">¥{{ formatAmount(stats.total_revenue || 0) }}</div>
              <div class="stat-label">总销售额</div>
            </div>
          </div>
        </el-card>
        
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #e6a23c;">
              <el-icon><Clock /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.pending_orders || 0 }}</div>
              <div class="stat-label">待处理订单</div>
            </div>
          </div>
        </el-card>
        
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #f56c6c;">
              <el-icon><Warning /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.cancelled_orders || 0 }}</div>
              <div class="stat-label">已取消订单</div>
            </div>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <div class="search-filter">
      <el-form :model="searchForm" inline>
        <el-form-item label="订单号">
          <el-input
            v-model="searchForm.keyword"
            placeholder="请输入订单号/收货人/手机号"
            clearable
            @keyup.enter="handleSearch"
            style="width: 250px"
          />
        </el-form-item>
        
        <el-form-item label="订单状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择状态"
            clearable
            style="width: 150px"
          >
            <el-option label="全部" :value="undefined" />
            <el-option label="待支付" value="pending" />
            <el-option label="已支付" value="paid" />
            <el-option label="已发货" value="shipped" />
            <el-option label="已送达" value="delivered" />
            <el-option label="已完成" value="completed" />
            <el-option label="已取消" value="cancelled" />
            <el-option label="已退款" value="refunded" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="下单时间">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            @change="handleDateChange"
            style="width: 300px"
          />
        </el-form-item>
        
        <el-form-item label="支付方式">
          <el-select
            v-model="searchForm.payment_method"
            placeholder="请选择支付方式"
            clearable
            style="width: 120px"
          >
            <el-option label="全部" :value="undefined" />
            <el-option label="支付宝" value="alipay" />
            <el-option label="微信支付" value="wechat" />
            <el-option label="银行卡" value="bank" />
            <el-option label="现金" value="cash" />
          </el-select>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon> 搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon> 重置
          </el-button>
          <el-button @click="exportOrders">
            <el-icon><Download /></el-icon> 导出
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 订单表格 -->
    <div class="order-table">
      <el-table
        v-loading="loading"
        :data="orders"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        
        <el-table-column prop="order_no" label="订单号" width="180">
          <template #default="{ row }">
            <div class="order-no">
              <span class="no-text">{{ row.order_no }}</span>
              <el-tag v-if="row.is_new" size="small" type="success">新</el-tag>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="商品信息" min-width="200">
          <template #default="{ row }">
            <div class="product-info">
              <div class="product-count">
                共 {{ row.items?.length || 0 }} 件商品
              </div>
              <div class="product-preview">
                <el-image
                  v-for="(item, index) in row.items?.slice(0, 3)"
                  :key="index"
                  :src="item.product_image || item.product?.main_image"
                  fit="cover"
                  style="width: 40px; height: 40px; margin-right: 5px; border-radius: 4px"
                />
                <span v-if="(row.items?.length || 0) > 3" class="more-count">
                  +{{ (row.items?.length || 0) - 3 }}
                </span>
              </div>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="用户信息" width="180">
          <template #default="{ row }">
            <div class="user-info">
              <div v-if="row.user">
                <div>{{ row.user.username }}</div>
                <div class="user-contact">{{ row.user.phone || row.user.email }}</div>
              </div>
              <div v-else class="text-muted">用户已删除</div>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="收货信息" width="200">
          <template #default="{ row }">
            <div class="shipping-info">
              <div class="receiver">{{ row.receiver }}</div>
              <div class="phone">{{ row.receiver_phone }}</div>
              <div class="address" :title="row.shipping_address">
                {{ truncateAddress(row.shipping_address) }}
              </div>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="final_amount" label="订单金额" width="120">
          <template #default="{ row }">
            <div class="order-amount">
              <div class="final-amount">¥{{ formatAmount(row.final_amount) }}</div>
              <div v-if="row.discount_amount > 0" class="discount-amount">
                优惠: ¥{{ formatAmount(row.discount_amount) }}
              </div>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="支付信息" width="150">
          <template #default="{ row }">
            <div class="payment-info">
              <div class="payment-method">
                <el-tag size="small" :type="getPaymentMethodType(row.payment_method)">
                  {{ getPaymentMethodText(row.payment_method) }}
                </el-tag>
              </div>
              <div class="payment-status">
                <el-tag
                  size="small"
                  :type="row.payment_status === 1 ? 'success' : 'warning'"
                >
                  {{ row.payment_status === 1 ? '已支付' : '未支付' }}
                </el-tag>
              </div>
              <div v-if="row.paid_at" class="paid-time">
                {{ formatDate(row.paid_at) }}
              </div>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="status" label="订单状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="created_at" label="下单时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button type="primary" size="small" @click="handleView(row)">
                <el-icon><View /></el-icon> 详情
              </el-button>
              
              <el-dropdown @command="(command) => handleStatusAction(command, row)">
                <el-button size="small">
                  状态操作<el-icon><ArrowDown /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item
                      v-if="row.status === 'pending'"
                      command="pay"
                      :disabled="row.payment_status === 1"
                    >
                      标记为已支付
                    </el-dropdown-item>
                    <el-dropdown-item
                      v-if="row.status === 'paid'"
                      command="ship"
                    >
                      标记为已发货
                    </el-dropdown-item>
                    <el-dropdown-item
                      v-if="row.status === 'shipped'"
                      command="deliver"
                    >
                      标记为已送达
                    </el-dropdown-item>
                    <el-dropdown-item
                      v-if="row.status === 'delivered'"
                      command="complete"
                    >
                      标记为已完成
                    </el-dropdown-item>
                    <el-dropdown-item
                      v-if="['pending', 'paid'].includes(row.status)"
                      command="cancel"
                      divided
                    >
                      取消订单
                    </el-dropdown-item>
                    <el-dropdown-item
                      v-if="row.status === 'paid'"
                      command="refund"
                    >
                      退款
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
              
              <el-button
                v-if="['cancelled', 'refunded'].includes(row.status)"
                type="danger"
                size="small"
                @click="handleDelete(row)"
              >
                <el-icon><Delete /></el-icon> 删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.limit"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 订单详情对话框 -->
    <el-dialog
      v-model="showDetailDialog"
      title="订单详情"
      width="900px"
    >
      <div v-if="currentOrder" class="order-detail">
        <!-- 订单基本信息 -->
        <el-card class="detail-section">
          <template #header>
            <div class="section-header">
              <span>订单信息</span>
              <div class="order-status">
                <el-tag :type="getStatusType(currentOrder.status)" size="large">
                  {{ getStatusText(currentOrder.status) }}
                </el-tag>
              </div>
            </div>
          </template>
          
          <el-descriptions :column="2" border>
            <el-descriptions-item label="订单号">
              {{ currentOrder.order_no }}
            </el-descriptions-item>
            <el-descriptions-item label="下单时间">
              {{ formatDate(currentOrder.created_at) }}
            </el-descriptions-item>
            <el-descriptions-item label="支付方式">
              {{ getPaymentMethodText(currentOrder.payment_method) }}
            </el-descriptions-item>
            <el-descriptions-item label="支付状态">
              {{ currentOrder.payment_status === 1 ? '已支付' : '未支付' }}
            </el-descriptions-item>
            <el-descriptions-item label="订单金额">
              ¥{{ formatAmount(currentOrder.final_amount) }}
            </el-descriptions-item>
            <el-descriptions-item label="优惠金额">
              ¥{{ formatAmount(currentOrder.discount_amount) }}
            </el-descriptions-item>
            <el-descriptions-item label="运费">
              ¥{{ formatAmount(currentOrder.shipping_fee) }}
            </el-descriptions-item>
            <el-descriptions-item label="实付金额">
              <span class="final-amount-large">
                ¥{{ formatAmount(currentOrder.final_amount) }}
              </span>
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 用户信息 -->
        <el-card class="detail-section">
          <template #header>
            <span>用户信息</span>
          </template>
          
          <el-descriptions :column="2" border>
            <el-descriptions-item label="用户名">
              {{ currentOrder.user?.username || '未知用户' }}
            </el-descriptions-item>
            <el-descriptions-item label="邮箱">
              {{ currentOrder.user?.email || '未设置' }}
            </el-descriptions-item>
            <el-descriptions-item label="手机号">
              {{ currentOrder.user?.phone || '未设置' }}
            </el-descriptions-item>
            <el-descriptions-item label="用户ID">
              {{ currentOrder.user_id }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 收货信息 -->
        <el-card class="detail-section">
          <template #header>
            <span>收货信息</span>
          </template>
          
          <el-descriptions :column="1" border>
            <el-descriptions-item label="收货人">
              {{ currentOrder.receiver }}
            </el-descriptions-item>
            <el-descriptions-item label="联系电话">
              {{ currentOrder.receiver_phone }}
            </el-descriptions-item>
            <el-descriptions-item label="收货地址">
              {{ currentOrder.shipping_address }}
            </el-descriptions-item>
            <el-descriptions-item label="备注">
              {{ currentOrder.note || '无' }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 商品信息 -->
        <el-card class="detail-section">
          <template #header>
            <span>商品信息</span>
          </template>
          
          <el-table :data="currentOrder.items" border>
            <el-table-column label="商品图片" width="100">
              <template #default="{ row }">
                <el-image
                  :src="row.product_image || row.product?.main_image"
                  fit="cover"
                  style="width: 60px; height: 60px; border-radius: 4px"
                />
              </template>
            </el-table-column>
            
            <el-table-column prop="product_name" label="商品名称" min-width="200" />
            
            <el-table-column prop="price" label="单价" width="120">
              <template #default="{ row }">
                ¥{{ formatAmount(row.price) }}
              </template>
            </el-table-column>
            
            <el-table-column prop="quantity" label="数量" width="100" />
            
            <el-table-column prop="subtotal" label="小计" width="120">
              <template #default="{ row }">
                ¥{{ formatAmount(row.subtotal) }}
              </template>
            </el-table-column>
          </el-table>
          
          <div class="order-summary">
            <div class="summary-row">
              <span>商品总价：</span>
              <span>¥{{ formatAmount(currentOrder.total_amount) }}</span>
            </div>
            <div class="summary-row">
              <span>优惠金额：</span>
              <span>-¥{{ formatAmount(currentOrder.discount_amount) }}</span>
            </div>
            <div class="summary-row">
              <span>运费：</span>
              <span>¥{{ formatAmount(currentOrder.shipping_fee) }}</span>
            </div>
            <div class="summary-row total">
              <span>实付金额：</span>
              <span class="total-amount">¥{{ formatAmount(currentOrder.final_amount) }}</span>
            </div>
          </div>
        </el-card>

        <!-- 时间线 -->
        <el-card class="detail-section">
          <template #header>
            <span>订单时间线</span>
          </template>
          
          <el-timeline>
            <el-timeline-item
              :timestamp="formatDate(currentOrder.created_at)"
              placement="top"
            >
              <el-card>
                <h4>订单创建</h4>
                <p>用户提交订单</p>
              </el-card>
            </el-timeline-item>
            
            <el-timeline-item
              v-if="currentOrder.paid_at"
              :timestamp="formatDate(currentOrder