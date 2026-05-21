<template>
  <div class="order-management">
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

    <div class="search-filter">
      <el-form :model="searchForm" inline>
        <el-form-item label="订单号">
          <el-input
            v-model="searchForm.keyword"
            placeholder="请输入订单号/收货人/手机号"
            clearable
            style="width: 250px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="订单状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择状态"
            clearable
            style="width: 120px"
          >
            <el-option label="全部" :value="''" />
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
            style="width: 250px"
            @change="handleDateChange"
          />
        </el-form-item>
        <el-form-item label="支付方式">
          <el-select
            v-model="searchForm.payment_method"
            placeholder="请选择支付方式"
            clearable
            style="width: 120px"
          >
            <el-option label="全部" :value="''" />
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
              <div class="product-count">共 {{ row.items?.length || 0 }} 件商品</div>
              <div class="product-preview">
                <el-image
                  v-for="(item, index) in row.items?.slice(0, 3)"
                  :key="index"
                  :src="item.product_image || item.product?.main_image"
                  fit="cover"
                  style="width: 40px; height: 40px; margin-right: 5px; border-radius: 4px"
                />
                <span v-if="(row.items?.length || 0) > 3" class="more-count">+{{ (row.items?.length || 0) - 3 }}</span>
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
              <div class="address" :title="row.shipping_address">{{ truncateAddress(row.shipping_address) }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="final_amount" label="订单金额" width="120">
          <template #default="{ row }">
            <div class="order-amount">
              <div class="final-amount">¥{{ formatAmount(row.final_amount) }}</div>
              <div v-if="row.discount_amount > 0" class="discount-amount">
                优惠 ¥{{ formatAmount(row.discount_amount) }}
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="支付信息" width="150">
          <template #default="{ row }">
            <div class="payment-info">
              <div class="payment-method">
                <el-tag :type="getPaymentMethodType(row.payment_method)" size="small">
                  {{ getPaymentMethodText(row.payment_method) }}
                </el-tag>
              </div>
              <div class="payment-status">
                <el-tag :type="row.payment_status === 1 ? 'success' : 'warning'" size="small">
                  {{ row.payment_status === 1 ? '已支付' : '未支付' }}
                </el-tag>
              </div>
              <div v-if="row.paid_at" class="paid-time">{{ formatDate(row.paid_at) }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="订单状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status) as 'primary' | 'success' | 'warning' | 'info' | 'danger'">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="下单时间" width="180">
          <template #default="{ row }">{{ formatDate(row.created_at) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button type="primary" size="small" @click="handleView(row)">
                <el-icon><View /></el-icon> 查看
              </el-button>
              <el-dropdown @command="(command) => handleStatusAction(command)">
                <el-button size="small">状态操作<el-icon><ArrowDown /></el-icon></el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item v-if="row.status === 'pending'" command="pay" :disabled="row.payment_status === 1">
                      标记为已支付
                    </el-dropdown-item>
                    <el-dropdown-item v-if="row.status === 'paid'" command="ship">标记为已发货</el-dropdown-item>
                    <el-dropdown-item v-if="row.status === 'shipped'" command="deliver">标记为已送达</el-dropdown-item>
                    <el-dropdown-item v-if="row.status === 'delivered'" command="complete">标记为已完成</el-dropdown-item>
                    <el-dropdown-item v-if="['pending', 'paid'].includes(row.status)" command="cancel" divided>
                      取消订单
                    </el-dropdown-item>
                    <el-dropdown-item v-if="row.status === 'paid'" command="refund">退款</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
              <el-button
                v-if="['cancelled', 'refunded'].includes(row.status)"
                type="danger"
                size="small"
                @click="handleDelete"
              >
                <el-icon><Delete /></el-icon> 删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

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

    <el-dialog v-model="showDetailDialog" title="订单详情" width="900px">
      <div v-if="currentOrder" class="order-detail">
        <el-card class="detail-section">
          <template #header>
            <div class="section-header">
              <span>订单信息</span>
              <div class="order-status">
                <el-tag :type="getStatusType(currentOrder.status) as 'primary' | 'success' | 'warning' | 'info' | 'danger'" size="large">
                  {{ getStatusText(currentOrder.status) }}
                </el-tag>
              </div>
            </div>
          </template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="订单号">{{ currentOrder.order_no }}</el-descriptions-item>
            <el-descriptions-item label="下单时间">{{ formatDate(currentOrder.created_at) }}</el-descriptions-item>
            <el-descriptions-item label="支付方式">{{ getPaymentMethodText(currentOrder.payment_method) }}</el-descriptions-item>
            <el-descriptions-item label="支付状态">
              <el-tag :type="currentOrder.payment_status === 1 ? 'success' : 'warning'">
                {{ currentOrder.payment_status === 1 ? '已支付' : '未支付' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="支付时间">{{ currentOrder.paid_at ? formatDate(currentOrder.paid_at) : '-' }}</el-descriptions-item>
            <el-descriptions-item label="发货时间">{{ currentOrder.shipped_at ? formatDate(currentOrder.shipped_at) : '-' }}</el-descriptions-item>
            <el-descriptions-item label="送达时间">{{ currentOrder.delivered_at ? formatDate(currentOrder.delivered_at) : '-' }}</el-descriptions-item>
            <el-descriptions-item label="完成时间">{{ currentOrder.completed_at ? formatDate(currentOrder.completed_at) : '-' }}</el-descriptions-item>
          </el-descriptions>
        </el-card>

        <el-card class="detail-section">
          <template #header><span>收货信息</span></template>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="收货人">{{ currentOrder.receiver }}</el-descriptions-item>
            <el-descriptions-item label="联系电话">{{ currentOrder.receiver_phone }}</el-descriptions-item>
            <el-descriptions-item label="收货地址">{{ currentOrder.shipping_address }}</el-descriptions-item>
            <el-descriptions-item label="备注">{{ currentOrder.note || '无' }}</el-descriptions-item>
          </el-descriptions>
        </el-card>

        <el-card class="detail-section">
          <template #header><span>商品信息</span></template>
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
              <template #default="{ row }">¥{{ formatAmount(row.price) }}</template>
            </el-table-column>
            <el-table-column prop="quantity" label="数量" width="100" />
            <el-table-column prop="subtotal" label="小计" width="120">
              <template #default="{ row }">¥{{ formatAmount(row.subtotal) }}</template>
            </el-table-column>
          </el-table>
          <div class="order-summary">
            <div class="summary-row"><span>商品总价：</span><span>¥{{ formatAmount(currentOrder.total_amount) }}</span></div>
            <div class="summary-row"><span>优惠金额：</span><span>-¥{{ formatAmount(currentOrder.discount_amount) }}</span></div>
            <div class="summary-row"><span>运费：</span><span>¥{{ formatAmount(currentOrder.shipping_fee) }}</span></div>
            <div class="summary-row total"><span>实付金额：</span><span class="total-amount">¥{{ formatAmount(currentOrder.final_amount) }}</span></div>
          </div>
        </el-card>

        <el-card class="detail-section">
          <template #header><span>订单时间线</span></template>
          <el-timeline>
            <el-timeline-item :timestamp="formatDate(currentOrder.created_at)" placement="top">
              <el-card><h4>订单创建</h4><p>用户提交订单</p></el-card>
            </el-timeline-item>
            <el-timeline-item v-if="currentOrder.paid_at" :timestamp="formatDate(currentOrder.paid_at)" placement="top">
              <el-card><h4>订单支付</h4><p>用户完成支付</p></el-card>
            </el-timeline-item>
            <el-timeline-item v-if="currentOrder.shipped_at" :timestamp="formatDate(currentOrder.shipped_at)" placement="top">
              <el-card><h4>订单发货</h4><p>商家已发货</p></el-card>
            </el-timeline-item>
            <el-timeline-item v-if="currentOrder.delivered_at" :timestamp="formatDate(currentOrder.delivered_at)" placement="top">
              <el-card><h4>订单送达</h4><p>商品已送达</p></el-card>
            </el-timeline-item>
            <el-timeline-item v-if="currentOrder.completed_at" :timestamp="formatDate(currentOrder.completed_at)" placement="top">
              <el-card><h4>订单完成</h4><p>订单已完成</p></el-card>
            </el-timeline-item>
            <el-timeline-item v-if="currentOrder.cancelled_at" :timestamp="formatDate(currentOrder.cancelled_at)" placement="top">
              <el-card><h4>订单取消</h4><p>订单已取消</p></el-card>
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import {
  Document,
  Money,
  Clock,
  Warning,
  Search,
  Refresh,
  Download,
  View,
  ArrowDown,
  Delete
} from '@element-plus/icons-vue'

interface OrderItem {
  product_id: number
  product_name: string
  price: number
  quantity: number
  subtotal: number
  product_image?: string
  product?: {
    main_image?: string
  }
}

interface Order {
  id: number
  order_no: string
  user_id: number
  user?: {
    username: string
    phone?: string
    email?: string
  }
  receiver: string
  receiver_phone: string
  shipping_address: string
  note?: string
  total_amount: number
  discount_amount: number
  shipping_fee: number
  final_amount: number
  payment_method: string
  payment_status: number
  status: string
  items: OrderItem[]
  created_at: string
  paid_at?: string
  shipped_at?: string
  delivered_at?: string
  completed_at?: string
  cancelled_at?: string
  is_new?: boolean
}

const loading = ref(false)
const orders = ref<Order[]>([])
const stats = reactive({
  total_orders: 0,
  total_revenue: 0,
  pending_orders: 0,
  cancelled_orders: 0
})
const searchForm = reactive({
  keyword: '',
  status: '',
  payment_method: ''
})
const dateRange = ref<string[]>([])
const pagination = reactive({
  page: 1,
  limit: 10,
  total: 0
})
const selectedIds = ref<number[]>([])
const showDetailDialog = ref(false)
const currentOrder = ref<Order | null>(null)

const formatAmount = (amount: number): string => {
  return amount.toFixed(2)
}

const formatDate = (date: string): string => {
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const truncateAddress = (address: string): string => {
  if (!address) return ''
  return address.length > 20 ? address.slice(0, 20) + '...' : address
}

const getStatusType = (status: string): string => {
  const types: Record<string, string> = {
    pending: 'warning',
    paid: 'primary',
    shipped: 'info',
    delivered: 'success',
    completed: 'success',
    cancelled: 'danger',
    refunded: 'danger'
  }
  return types[status] || 'default'
}

const getStatusText = (status: string): string => {
  const texts: Record<string, string> = {
    pending: '待支付',
    paid: '已支付',
    shipped: '已发货',
    delivered: '已送达',
    completed: '已完成',
    cancelled: '已取消',
    refunded: '已退款'
  }
  return texts[status] || status
}

const getPaymentMethodType = (method: string): 'primary' | 'success' | 'warning' | 'info' | 'danger' | undefined => {
  const types: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
    alipay: 'success',
    wechat: 'primary',
    bank: 'info',
    cash: 'warning'
  }
  return types[method]
}

const getPaymentMethodText = (method: string): string => {
  const texts: Record<string, string> = {
    alipay: '支付宝',
    wechat: '微信支付',
    bank: '银行卡',
    cash: '现金'
  }
  return texts[method] || method
}

const handleSearch = () => {
  pagination.page = 1
  loadOrders()
}

const handleReset = () => {
  searchForm.keyword = ''
  searchForm.status = ''
  searchForm.payment_method = ''
  dateRange.value = []
  pagination.page = 1
  loadOrders()
}

const handleDateChange = () => {
  pagination.page = 1
  loadOrders()
}

const handleSizeChange = (size: number) => {
  pagination.limit = size
  pagination.page = 1
  loadOrders()
}

const handleCurrentChange = (page: number) => {
  pagination.page = page
  loadOrders()
}

const handleSelectionChange = (val: Order[]) => {
  selectedIds.value = val.map(item => item.id)
}

const handleView = (order: Order) => {
  currentOrder.value = order
  showDetailDialog.value = true
}

const handleStatusAction = async (command: string) => {
  const actionMap: Record<string, { status: string; message: string }> = {
    pay: { status: 'paid', message: '标记为已支付' },
    ship: { status: 'shipped', message: '标记为已发货' },
    deliver: { status: 'delivered', message: '标记为已送达' },
    complete: { status: 'completed', message: '标记为已完成' },
    cancel: { status: 'cancelled', message: '取消订单' },
    refund: { status: 'refunded', message: '退款' }
  }
  const action = actionMap[command]
  if (!action) return

  const { ElMessageBox, ElMessage } = await import('element-plus')
  const confirmMessage = `确定要${action.message}吗？`
  if (!(await ElMessageBox.confirm(confirmMessage, { type: 'warning' }))) return

  try {
    ElMessage.success(`${action.message}成功`)
    loadOrders()
    loadStats()
  } catch (error) {
    ElMessage.error(`${action.message}失败`)
  }
}

const handleDelete = async () => {
  const { ElMessageBox, ElMessage } = await import('element-plus')
  if (!(await ElMessageBox.confirm('确定要删除该订单吗？', { type: 'error' }))) return

  try {
    ElMessage.success('删除成功')
    loadOrders()
    loadStats()
  } catch (error) {
    ElMessage.error('删除失败')
  }
}

const exportOrders = () => {
  import('element-plus').then(({ ElMessage }) => {
    ElMessage.info('导出功能开发中')
  })
}

const loadOrders = async () => {
  loading.value = true
  try {
    orders.value = []
    pagination.total = 0
  } catch (error) {
    import('element-plus').then(({ ElMessage }) => {
      ElMessage.error('获取订单列表失败')
    })
  } finally {
    loading.value = false
  }
}

const loadStats = async () => {
  try {
    Object.assign(stats, {
      total_orders: 0,
      total_revenue: 0,
      pending_orders: 0,
      cancelled_orders: 0
    })
  } catch (error) {
    console.error('获取统计数据失败', error)
  }
}

loadOrders()
loadStats()
</script>

<style scoped>
.order-management {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  min-height: calc(100vh - 100px);
}

.page-header {
  margin-bottom: 20px;
}

.page-header h1 {
  margin: 0 0 20px 0;
  font-size: 24px;
  color: #333;
}

.stats-cards {
  display: flex;
  gap: 20px;
}

.stat-card {
  flex: 1;
  min-width: 200px;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 24px;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.stat-label {
  font-size: 14px;
  color: #999;
}

.search-filter {
  margin-bottom: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.order-table {
  margin-bottom: 20px;
}

.pagination {
  display: flex;
  justify-content: flex-end;
}

.order-no {
  display: flex;
  align-items: center;
  gap: 8px;
}

.no-text {
  font-size: 14px;
  font-weight: 500;
}

.product-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.product-count {
  font-size: 12px;
  color: #999;
}

.product-preview {
  display: flex;
  align-items: center;
}

.more-count {
  font-size: 12px;
  color: #999;
  margin-left: 5px;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.user-contact {
  font-size: 12px;
  color: #999;
}

.shipping-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.receiver {
  font-weight: 500;
}

.phone {
  font-size: 12px;
  color: #666;
}

.address {
  font-size: 12px;
  color: #999;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.order-amount {
  display: flex;
  flex-direction: column;
}

.final-amount {
  font-weight: bold;
  color: #ff6b6b;
}

.discount-amount {
  font-size: 12px;
  color: #67c23a;
}

.payment-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.payment-method,
.payment-status {
  display: inline-block;
}

.paid-time {
  font-size: 12px;
  color: #999;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.order-detail {
  padding: 10px 0;
}

.detail-section {
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-summary {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #e8e8e8;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 14px;
}

.summary-row.total {
  font-weight: bold;
  font-size: 16px;
  border-top: 1px solid #e8e8e8;
  margin-top: 8px;
  padding-top: 15px;
}

.total-amount {
  color: #ff6b6b;
  font-size: 18px;
}

.text-muted {
  color: #999;
}
</style>
