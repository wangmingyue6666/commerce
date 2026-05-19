<template>
  <div id="app">
    <!-- 导航栏 -->
    <nav class="navbar">
      <div class="container">
        <div class="nav-brand">
          <div class="brand-icon">🛍️</div>
          <h1>电商商城</h1>
        </div>
        <div class="nav-menu">
          <a href="#" class="nav-link" :class="{ active: activeTab === 'home' }" @click.prevent="activeTab = 'home'">首页</a>
          <a href="#" class="nav-link" :class="{ active: activeTab === 'products' }" @click.prevent="activeTab = 'products'">商品</a>
          <a href="#" class="nav-link" :class="{ active: activeTab === 'categories' }" @click.prevent="activeTab = 'categories'">分类</a>
          <a href="#" class="nav-link" :class="{ active: activeTab === 'orders' }" @click.prevent="openOrders">我的订单</a>
          <a v-if="isAdmin" href="#" class="nav-link" :class="{ active: activeTab === 'admin' }" @click.prevent="openAdmin">管理后台</a>
        </div>
        <div class="nav-actions">
          <button v-if="!currentUser" class="btn btn-login" @click="showLogin = true">登录</button>
          <div
            v-else
            class="user-menu"
            @mouseenter="userMenuOpen = true"
            @mouseleave="userMenuOpen = false"
          >
            <button class="btn btn-login user-trigger" @click="toggleUserMenu">
              <span class="avatar-dot">👤</span>
              {{ currentUser }}
              <span class="menu-arrow">▾</span>
            </button>
            <div class="user-dropdown" v-if="userMenuOpen">
              <a href="#" class="dropdown-item" @click.prevent="openOrdersFromMenu">我的订单</a>
              <a v-if="isAdmin" href="#" class="dropdown-item" @click.prevent="openAdmin">进入后台</a>
              <a href="#" class="dropdown-item danger" @click.prevent="handleLogout">退出登录</a>
            </div>
          </div>
          <div class="cart-icon" @click="openCart" title="打开购物车">
            🛒
            <span class="cart-count" v-if="cartCount > 0">{{ cartCount }}</span>
          </div>
        </div>
      </div>
    </nav>

    <!-- 主内容区 -->
    <main class="main-content">
      <!-- 轮播图 -->
      <section class="hero">
        <div class="hero-slider">
          <div class="slide active" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
            <div class="slide-content">
              <h2>新品上市</h2>
              <p>最新科技产品，限时优惠</p>
              <button class="btn btn-primary">立即购买</button>
            </div>
          </div>
        </div>
      </section>

      <!-- 商品分类 -->
      <section class="categories" v-if="activeTab === 'home' || activeTab === 'categories'">
        <div class="container">
          <h2 class="section-title">商品分类</h2>
          <div class="category-grid">
            <div class="category-card" v-for="category in categories" :key="category.id">
              <div class="category-icon">
                <template v-if="category.icon && category.icon.startsWith('data:image')">
                  <img :src="category.icon" class="category-menu-icon-img" />
                </template>
                <template v-else>
                  {{ category.icon || '📂' }}
                </template>
              </div>
              <h3>{{ category.name }}</h3>
              <p>{{ category.description }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 热门商品 -->
      <section class="products" v-if="activeTab === 'home' || activeTab === 'products'">
        <div class="container">
          <div class="section-header">
            <h2 class="section-title">热门商品</h2>
            <a href="#" class="view-all">查看全部 →</a>
          </div>
          <div class="product-grid">
            <div class="product-card" v-for="product in products" :key="product.id">
              <div class="product-image">
                <img :src="resolveProductImage(product)" :alt="product.name" @error="onImageError" />
                <div class="product-badge" v-if="product.discount">-{{ product.discount }}%</div>
                <div class="product-title-container">
                  <div class="product-title-icon">📦</div>
                  <h3 class="product-title">{{ product.name }}</h3>
                </div>
              </div>
              <div class="product-info">
                <div class="product-header">
                  <div class="product-icon">📦</div>
                  <h3 class="product-name">{{ product.name }}</h3>
                </div>
                <p class="product-description">{{ product.description }}</p>
                <div class="product-price">
                  <span class="current-price">¥{{ product.price }}</span>
                  <span class="original-price" v-if="product.originalPrice">¥{{ product.originalPrice }}</span>
                </div>
                <div class="product-actions">
                  <button class="btn btn-add-cart" @click="addToCart(product)">🛒 加入购物车</button>
                  <button class="btn btn-buy" @click="buyNow(product)">➡️ 立即购买</button>
                </div>
              </div>
            </div>
          </div>
          <p v-if="loadingProducts" style="text-align:center;color:#666;margin-top:12px;">商品加载中...</p>
        </div>
      </section>

      <!-- 楼层与推荐 -->
      <section class="products" v-if="activeTab === 'home'">
        <div class="container">
          <h2 class="section-title">楼层专区</h2>
          <div class="floor-block" v-for="floor in floorSections" :key="floor.id">
            <div class="section-header">
              <h3 class="floor-title">{{ floor.name }}</h3>
            </div>
            <div class="product-grid">
              <div class="product-card" v-for="product in floor.products" :key="`floor-${floor.id}-${product.id}`">
                <div class="product-image">
                  <img :src="resolveProductImage(product)" :alt="product.name" @error="onImageError" />
                  <div class="product-badge" v-if="product.discount">-{{ product.discount }}%</div>
                </div>
                <div class="product-info">
                  <div class="product-header">
                    <div class="product-icon">📦</div>
                    <h3 class="product-name">{{ product.name }}</h3>
                  </div>
                  <p class="product-description">{{ product.description }}</p>
                  <div class="product-price">
                    <span class="current-price">¥{{ product.price }}</span>
                    <span class="original-price" v-if="product.originalPrice">¥{{ product.originalPrice }}</span>
                  </div>
                  <div class="product-actions">
                    <button class="btn btn-add-cart" @click="addToCart(product)">🛒 加入购物车</button>
                    <button class="btn btn-buy" @click="buyNow(product)">➡️ 立即购买</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="section-header">
            <h2 class="section-title">猜你喜欢</h2>
          </div>
          <div class="product-grid">
            <div class="product-card" v-for="product in recommendProducts" :key="`recommend-${product.id}`">
              <div class="product-image">
                <img :src="resolveProductImage(product)" :alt="product.name" @error="onImageError" />
                <div class="product-badge" v-if="product.discount">-{{ product.discount }}%</div>
                <div class="product-title-container">
                  <div class="product-title-icon">📦</div>
                  <h3 class="product-title">{{ product.name }}</h3>
                </div>
              </div>
              <div class="product-info">
                <div class="product-header">
                  <div class="product-icon">📦</div>
                  <h3 class="product-name">{{ product.name }}</h3>
                </div>
                <p class="product-description">{{ product.description }}</p>
                <div class="product-price">
                  <span class="current-price">¥{{ product.price }}</span>
                  <span class="original-price" v-if="product.originalPrice">¥{{ product.originalPrice }}</span>
                </div>
                <div class="product-actions">
                  <button class="btn btn-add-cart" @click="addToCart(product)">🛒 加入购物车</button>
                  <button class="btn btn-buy" @click="buyNow(product)">➡️ 立即购买</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 购物车 -->
      <section class="products" v-if="activeTab === 'cart'">
        <div class="container">
          <div class="section-header">
            <h2 class="section-title">我的购物车</h2>
            <div class="cart-actions">
              <button class="btn btn-primary" @click="checkoutFromCart" :disabled="!hasCheckedItems">去结算</button>
              <button class="btn btn-secondary" @click="clearCart">清空购物车</button>
              <button class="btn btn-secondary" @click="refreshCartCount">刷新</button>
            </div>
          </div>
          <div v-if="cartItems.length === 0" style="text-align:center;color:#666;padding:40px;">
            <p style="font-size:16px;margin-bottom:20px;"> 购物车空空如也</p>
            <button class="btn btn-primary" @click="activeTab = 'products'">去逛逛</button>
          </div>
          <div class="cart-grid" v-else>
            <div class="cart-item" v-for="item in cartItems" :key="item.id">
              <div class="cart-item-image">
                <img :src="item.product?.main_image || 'https://via.placeholder.com/100x100/409eff/ffffff?text=商品'" :alt="item.product?.name || '商品'" />
              </div>
              <div class="cart-item-info">
                <h3 class="cart-item-name">{{ item.product?.name || '未知商品' }}</h3>
                <p class="cart-item-price">单价：¥{{ item.product?.price || 0 }}</p>
                <div class="cart-item-quantity">
                  <button class="btn-qty" @click="updateQuantity(item, -1)" :disabled="item.quantity <= 1">-</button>
                  <input type="number" :value="item.quantity" @change="onQuantityChange(item, $event)" class="qty-input" min="1" max="99" />
                  <button class="btn-qty" @click="updateQuantity(item, 1)">+</button>
                </div>
                <p class="cart-item-subtotal">小计：¥{{ (Number(item.product?.price || 0) * item.quantity).toFixed(2) }}</p>
              </div>
              <div class="cart-item-actions">
                <button class="btn btn-danger" @click="removeFromCart(item)">删除</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 订单列表 -->
      <section class="products" v-if="activeTab === 'orders'">
        <div class="container">
          <div class="section-header">
            <h2 class="section-title">我的订单</h2>
            <a href="#" class="view-all" @click.prevent="loadOrders">刷新</a>
          </div>
          <div v-if="orders.length === 0" style="text-align:center;color:#666;">暂无订单</div>
          <div class="product-grid" v-else>
            <div class="product-card" v-for="order in orders" :key="order.id">
              <div class="product-info">
                <h3 class="product-name">订单号：{{ order.orderNo }}</h3>
                <p class="product-description">状态：{{ order.status }}</p>
                <p class="product-description">金额：¥{{ order.totalAmount }}</p>
                <p class="product-description">时间：{{ formatOrderDate(order.createdAt) }}</p>
                <div class="product-actions">
                  <button class="btn btn-add-cart" @click="openOrderDetail(order)">查看详情</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 管理后台 -->
      <section class="admin-dashboard" v-if="activeTab === 'admin' && isAdmin">
        <div class="admin-container">
          <!-- 左侧菜单树 -->
          <div class="admin-sidebar">
            <h3 class="sidebar-title">管理菜单</h3>
            <ul class="sidebar-menu">
              <li 
                class="menu-item" 
                :class="{ active: adminTab === 'products' }"
                @click="adminTab = 'products'"
              >
                <span class="menu-icon">📦</span>
                <span class="menu-text">商品管理</span>
              </li>
              <li 
                class="menu-item" 
                :class="{ active: adminTab === 'orders' }"
                @click="adminTab = 'orders'"
              >
                <span class="menu-icon">📋</span>
                <span class="menu-text">订单管理</span>
              </li>
              <li 
                class="menu-item" 
                :class="{ active: adminTab === 'categories' }"
                @click="adminTab = 'categories'"
              >
                <span class="menu-icon">📂</span>
                <span class="menu-text">分类管理</span>
              </li>
            </ul>
          </div>
          
          <!-- 右侧内容区 -->
          <div class="admin-content">
            <div class="content-header">
              <h2 class="content-title">
                {{ adminTab === 'products' ? '商品管理' : adminTab === 'orders' ? '订单管理' : '分类管理' }}
              </h2>
              <button 
                v-if="adminTab === 'products'" 
                class="btn btn-primary"
                @click="showAddProduct = true"
              >
                添加商品
              </button>
              <button 
                v-if="adminTab === 'categories'" 
                class="btn btn-primary"
                @click="openAddCategory"
              >
                添加分类
              </button>
            </div>
            
            <!-- 商品管理 -->
            <div v-if="adminTab === 'products'">
              <div class="product-grid">
                <div class="product-card" v-for="product in adminProducts" :key="`admin-product-${product.id}`">
                  <div class="product-image">
                    <img :src="resolveProductImage(product)" :alt="product.name" @error="onImageError" />
                    <div class="product-badge" v-if="product.status === 0">已下架</div>
                  </div>
                  <div class="product-info">
                    <h3 class="product-name">{{ product.name }}</h3>
                    <p class="product-description">售价：¥{{ product.price }}</p>
                    <p class="product-description">库存：{{ product.stock || 0 }}</p>
                    <p class="product-description">销量：{{ product.sales || 0 }}</p>
                    <div class="product-actions">
                      <button class="btn btn-add-cart" @click="editProduct(product)">编辑</button>
                      <button class="btn btn-buy" @click="toggleProductStatus(product)">{{ product.status === 1 ? '下架' : '上架' }}</button>
                      <button class="btn btn-secondary danger" @click="deleteProduct(product)">删除</button>
                    </div>
                  </div>
                </div>
              </div>
              <p v-if="loadingAdminProducts" style="text-align:center;color:#666;margin-top:12px;">商品加载中...</p>
              <p v-else-if="adminProducts.length === 0" style="text-align:center;color:#666;margin-top:12px;">暂无商品</p>
            </div>
            
            <!-- 订单管理 -->
            <div v-else-if="adminTab === 'orders'">
              <div class="product-grid">
                <div class="product-card" v-for="order in adminOrders" :key="`admin-order-${order.id}`">
                  <div class="product-info">
                    <h3 class="product-name">订单号：{{ order.orderNo || order.order_no }}</h3>
                    <p class="product-description">用户：{{ order.user?.username || '未知' }}</p>
                    <p class="product-description">状态：{{ order.status }}</p>
                    <p class="product-description">金额：¥{{ order.totalAmount || order.total_amount }}</p>
                    <p class="product-description">时间：{{ formatOrderDate(order.createdAt || order.created_at) }}</p>
                    <div class="product-actions">
                      <button class="btn btn-add-cart" @click="openOrderDetail(order)">查看详情</button>
                      <button class="btn btn-buy" @click="showUpdateOrderStatus(order)">更新状态</button>
                      <button v-if="(order.status === 'cancelled' || order.status === 'refunded')" class="btn btn-secondary danger" @click="deleteOrder(order)">删除</button>
                    </div>
                  </div>
                </div>
              </div>
              <p v-if="loadingAdminOrders" style="text-align:center;color:#666;margin-top:12px;">订单加载中...</p>
              <p v-else-if="adminOrders.length === 0" style="text-align:center;color:#666;margin-top:12px;">暂无订单</p>
            </div>

            <!-- 分类管理 -->
            <div v-else-if="adminTab === 'categories'">
              <div class="product-grid">
                <div class="product-card" v-for="category in adminCategories" :key="`admin-category-${category.id}`">
                  <div class="product-info">
                    <h3 class="product-name">
                      <template v-if="category.icon && category.icon.startsWith('data:image')">
                        <img :src="category.icon" class="category-icon-img" />
                      </template>
                      <template v-else>
                        {{ category.icon || '📂' }}
                      </template>
                      {{ category.name }}
                    </h3>
                    <p class="product-description">层级：{{ category.level }}</p>
                    <p class="product-description">排序：{{ category.sort }}</p>
                    <p class="product-description">状态：{{ category.status === 1 ? '启用' : '禁用' }}</p>
                    <div class="product-actions">
                      <button class="btn btn-add-cart" @click="openEditCategory(category)">编辑</button>
                      <button class="btn btn-secondary danger" @click="deleteCategory(category)">删除</button>
                    </div>
                  </div>
                </div>
              </div>
              <p v-if="loadingAdminCategories" style="text-align:center;color:#666;margin-top:12px;">分类加载中...</p>
              <p v-else-if="adminCategories.length === 0" style="text-align:center;color:#666;margin-top:12px;">暂无分类</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 添加/编辑商品模态框 -->
      <div class="modal" v-if="showAddProduct || showEditProduct">
        <div class="modal-content" style="width: 600px;">
          <div class="modal-header">
            <h3>{{ showEditProduct ? '编辑商品' : '添加商品' }}</h3>
            <button class="close-btn" @click="closeProductModal">×</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>商品名称 *</label>
              <input type="text" v-model="productForm.name" placeholder="请输入商品名称" />
            </div>
            <div class="form-group">
              <label>商品分类 *</label>
              <select v-model="productForm.category_id">
                <option value="">请选择分类</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>价格 *</label>
              <input type="number" step="0.01" v-model="productForm.price" placeholder="请输入价格" />
            </div>
            <div class="form-group">
              <label>市场价</label>
              <input type="number" step="0.01" v-model="productForm.market_price" placeholder="请输入市场价" />
            </div>
            <div class="form-group">
              <label>库存</label>
              <input type="number" v-model="productForm.stock" placeholder="请输入库存" />
            </div>
            <div class="form-group">
              <label>品牌</label>
              <input type="text" v-model="productForm.brand" placeholder="请输入品牌" />
            </div>
            <div class="form-group">
              <label>商品图片（最多10张，每张最大20MB）</label>
              <div class="product-image-upload">
                <div 
                  class="upload-area" 
                  :class="{ 'has-images': productImages.length > 0 }"
                  @click="triggerProductUpload"
                  @dragover.prevent
                  @drop.prevent="handleProductDrop"
                >
                  <template v-if="productImages.length === 0">
                    <span class="upload-icon">🖼️</span>
                    <span class="upload-text">点击或拖拽上传图片</span>
                    <span class="upload-hint">支持 JPG、PNG 格式，最多10张</span>
                  </template>
                  <template v-else>
                    <div class="images-grid">
                      <div v-for="(image, index) in productImages" :key="index" class="image-item">
                        <img :src="image" alt="产品图片" class="product-preview-img" />
                        <button class="remove-btn" @click.stop="removeImage(index)">×</button>
                      </div>
                      <div class="add-more" @click.stop="triggerProductUpload">
                        <span>+ 添加更多</span>
                      </div>
                    </div>
                  </template>
                </div>
                <input 
                  type="file" 
                  ref="productImageRef" 
                  accept="image/*" 
                  multiple
                  style="display: none"
                  @change="handleImageUpload" 
                />
              </div>
            </div>
            <div class="form-group">
              <label>状态</label>
              <select v-model="productForm.status">
                <option value="1">上架</option>
                <option value="0">下架</option>
              </select>
            </div>
            <div class="form-group">
              <label>描述</label>
              <textarea v-model="productForm.description" placeholder="请输入商品描述" rows="3"></textarea>
            </div>
            <div class="form-actions">
              <button class="btn btn-primary" @click="saveProduct">保存</button>
              <button class="btn btn-secondary" @click="closeProductModal">取消</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 更新订单状态模态框 -->
      <div class="modal" v-if="showUpdateStatus">
        <div class="modal-content">
          <div class="modal-header">
            <h3>更新订单状态</h3>
            <button class="close-btn" @click="showUpdateStatus = false">×</button>
          </div>
          <div class="modal-body">
            <p><strong>订单号：</strong>{{ selectedOrderForUpdate?.orderNo || selectedOrderForUpdate?.order_no }}</p>
            <p><strong>当前状态：</strong>{{ selectedOrderForUpdate?.status }}</p>
            <div class="form-group">
              <label>新状态 *</label>
              <select v-model="orderStatusForm.status">
                <option value="pending">待支付</option>
                <option value="paid">已支付</option>
                <option value="shipped">已发货</option>
                <option value="delivered">已送达</option>
                <option value="completed">已完成</option>
                <option value="cancelled">已取消</option>
                <option value="refunded">已退款</option>
              </select>
            </div>
            <div class="form-group">
              <label>备注</label>
              <textarea v-model="orderStatusForm.action_note" placeholder="请输入操作备注" rows="2"></textarea>
            </div>
            <div class="form-actions">
              <button class="btn btn-primary" @click="updateOrderStatus">保存</button>
              <button class="btn btn-secondary" @click="showUpdateStatus = false">取消</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 登录模态框 -->
      <div class="modal" v-if="showLogin">
        <div class="modal-content">
          <div class="modal-header">
            <h3>用户登录</h3>
            <button class="close-btn" @click="showLogin = false">×</button>
          </div>
          <div class="modal-body">
            <!-- 登录提示 -->
            <div v-if="pendingRoute === 'orders'" class="login-hint">
              <p>🔒 需要登录才能查看订单</p>
              <p>请登录后继续访问</p>
            </div>
            <div class="form-group">
              <label>用户名</label>
              <input type="text" v-model="loginForm.username" @input="loginForm.username = loginForm.username.trim()" placeholder="请输入用户名" />
            </div>
            <div class="form-group">
              <label>密码</label>
              <input type="password" v-model="loginForm.password" placeholder="请输入密码" />
            </div>
            <div class="form-actions">
              <button class="btn btn-primary" @click="handleLogin">登录</button>
              <button class="btn btn-secondary" @click="showLogin = false">取消</button>
            </div>
            <div class="test-accounts">
              <p>测试账号：</p>
              <p>• admin/password123</p>
              <p>• user1/password123</p>
              <p>• user2/password123</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 添加/编辑分类模态框 -->
      <div class="modal" v-if="showAddCategory || showEditCategory">
        <div class="modal-content" style="width: 500px;">
          <div class="modal-header">
            <h3>{{ showEditCategory ? '编辑分类' : '添加分类' }}</h3>
            <button class="close-btn" @click="closeCategoryModal">×</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>分类名称 *</label>
              <input type="text" v-model="categoryForm.name" placeholder="请输入分类名称" />
            </div>
            <div class="form-group">
              <label>内置图标</label>
              <div class="icon-picker">
                <div class="selected-icon" v-if="categoryForm.icon && !categoryForm.icon.startsWith('data:image')">
                  <span class="icon-preview">{{ categoryForm.icon }}</span>
                  <button class="btn btn-secondary small" @click="clearCategoryIcon">清除</button>
                </div>
                <div class="icon-grid">
                  <button 
                    v-for="(icon, index) in categoryIconsList" 
                    :key="index"
                    class="icon-item"
                    :class="{ selected: categoryForm.icon === icon }"
                    @click="selectCategoryIcon(icon)"
                  >
                    {{ icon }}
                  </button>
                </div>
                <p class="icon-hint">点击选择内置图标，或上传自定义图片（图片优先）</p>
              </div>
            </div>
            <div class="form-group">
              <label>分类图片</label>
              <div class="category-image-upload">
                <div 
                  class="upload-area" 
                  :class="{ 'has-image': categoryImages.length > 0 }"
                  @click="triggerCategoryUpload"
                  @dragover.prevent
                  @drop.prevent="handleCategoryDrop"
                >
                  <template v-if="categoryImages.length > 0">
                    <img :src="categoryImages[0]" alt="分类图片" class="preview-img" />
                    <div class="upload-overlay">
                      <span class="upload-icon">📷</span>
                      <span>点击更换图片</span>
                    </div>
                    <button class="remove-btn" @click.stop="removeCategoryImage">×</button>
                  </template>
                  <template v-else>
                    <span class="upload-icon">🖼️</span>
                    <span class="upload-text">点击或拖拽上传图片</span>
                    <span class="upload-hint">支持 JPG、PNG 格式</span>
                  </template>
                </div>
                <input 
                  type="file" 
                  ref="categoryImageRef" 
                  accept="image/*" 
                  style="display: none"
                  @change="handleCategoryImageUpload" 
                />
              </div>
            </div>
            <div class="form-group">
              <label>排序</label>
              <input type="number" v-model="categoryForm.sort" placeholder="数字越小越靠前" />
            </div>
            <div class="form-group">
              <label>层级</label>
              <input type="number" v-model="categoryForm.level" placeholder="分类层级" />
            </div>
            <div class="form-group">
              <label>父分类ID</label>
              <input type="number" v-model="categoryForm.parent_id" placeholder="0表示顶级分类" />
            </div>
            <div class="form-group">
              <label>状态</label>
              <select v-model="categoryForm.status">
                <option :value="1">启用</option>
                <option :value="0">禁用</option>
              </select>
            </div>
            <div class="form-actions">
              <button class="btn btn-primary" @click="showEditCategory ? updateCategory() : saveCategory()">
                {{ showEditCategory ? '保存' : '创建' }}
              </button>
              <button class="btn btn-secondary" @click="closeCategoryModal">取消</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 订单详情模态框 -->
      <div class="modal" v-if="showOrderDetail && selectedOrder">
        <div class="modal-content large">
          <div class="modal-header">
            <h3>订单详情</h3>
            <button class="close-btn" @click="showOrderDetail = false">×</button>
          </div>
          <div class="modal-body">
            <div class="order-detail-section">
              <div class="order-info-row">
                <span class="label">订单号：</span>
                <span class="value">{{ selectedOrder.orderNo }}</span>
              </div>
              <div class="order-info-row">
                <span class="label">订单状态：</span>
                <span class="value status-badge" :class="selectedOrder.status">{{ getStatusText(selectedOrder.status) }}</span>
              </div>
              <div class="order-info-row">
                <span class="label">创建时间：</span>
                <span class="value">{{ formatOrderDate(selectedOrder.createdAt) }}</span>
              </div>
              <div class="order-info-row" v-if="selectedOrder.paidAt">
                <span class="label">支付时间：</span>
                <span class="value">{{ formatOrderDate(selectedOrder.paidAt) }}</span>
              </div>
            </div>
            
            <div class="order-shipping-section">
              <h4>收货信息</h4>
              <p><strong>收货人：</strong>{{ selectedOrder.receiver }}</p>
              <p><strong>手机号：</strong>{{ selectedOrder.receiverPhone }}</p>
              <p><strong>收货地址：</strong>{{ selectedOrder.shippingAddress }}</p>
              <p v-if="selectedOrder.note"><strong>备注：</strong>{{ selectedOrder.note }}</p>
            </div>
            
            <div class="order-items-section">
              <h4>商品明细</h4>
              <div class="order-item-list">
                <div class="order-item-row" v-for="(item, idx) in selectedOrder.items" :key="`item-${idx}`">
                  <img :src="item.product?.main_image || 'https://via.placeholder.com/60x60/409eff/ffffff?text=商品'" class="order-item-img" />
                  <div class="order-item-info">
                    <p class="item-name">{{ item.product_name || item.product?.name }}</p>
                    <p class="item-meta">单价：¥{{ item.price }} × {{ item.quantity }}</p>
                  </div>
                  <div class="order-item-total">¥{{ item.subtotal }}</div>
                </div>
              </div>
            </div>
            
            <div class="order-total-section">
              <div class="total-row">
                <span>商品总额：</span>
                <span>¥{{ selectedOrder.totalAmount }}</span>
              </div>
              <div class="total-row" v-if="selectedOrder.discountAmount > 0">
                <span>优惠金额：</span>
                <span>-¥{{ selectedOrder.discountAmount }}</span>
              </div>
              <div class="total-row" v-if="selectedOrder.shippingFee > 0">
                <span>运费：</span>
                <span>¥{{ selectedOrder.shippingFee }}</span>
              </div>
              <div class="total-row final">
                <span>实付金额：</span>
                <span class="final-amount">¥{{ selectedOrder.finalAmount || selectedOrder.totalAmount }}</span>
              </div>
            </div>
            
            <div class="order-actions">
              <button v-if="selectedOrder.status === 'pending'" class="btn btn-primary" @click="cancelOrder(selectedOrder)">取消订单</button>
              <button v-if="selectedOrder.status === 'pending'" class="btn btn-secondary" @click="editOrder(selectedOrder)">编辑订单</button>
              <button class="btn btn-secondary" @click="showOrderDetail = false">关闭</button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 页脚 -->
    <footer class="footer">
      <div class="container">
        <p>© 2024 电商商城 - 版权所有</p>
        <p>服务热线：400-123-4567 | 邮箱：support@eshop.com</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'

interface Product {
  id: number
  name: string
  description: string
  price: number
  originalPrice?: number
  image: string
  main_image?: string
  images?: string[]
  discount?: number
}

interface CategoryItem {
  id: number
  name: string
  icon: string
  description: string
}

interface CartViewItem {
  id: number
  productId: number
  quantity: number
  product?: {
    name?: string
    image?: string
    main_image?: string
  }
}

interface OrderViewItem {
  id: number
  orderNo: string
  totalAmount: number
  status: string
  createdAt: string
  items?: Array<{
    productId: number
    productName: string
    price: number
    quantity: number
    subtotal: number
  }>
}

const API_BASE = '/api'

const request = async (path: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token')
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  try {
    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers
    })
    console.log('Response status:', response.status)
    console.log('Response headers:', response.headers)
    
    const data = await response.json().catch((error) => {
      console.error('JSON parsing error:', error)
      return {}
    })
    console.log('Response data:', data)
    
    if (!response.ok) {
      if (data?.errors && Array.isArray(data.errors)) {
        throw new Error(data.errors.map((err: any) => err.msg).join('\n'))
      }
      throw new Error(data?.message || '请求失败')
    }
    return data
  } catch (error) {
    console.error('Request error:', error)
    throw error
  }
}

// 状态
const showLogin = ref(false)
const showOrderDetail = ref(false)
const cartCount = ref(0)
const currentUser = ref<string>('')
const currentRole = ref<'admin' | 'user' | ''>('')
const userMenuOpen = ref(false)
const loadingProducts = ref(false)
const activeTab = ref<'home' | 'products' | 'categories' | 'cart' | 'orders' | 'admin'>('home')
const pendingRoute = ref<string>('') // 用于记录登录前想要访问的页面
const cartItems = ref<CartViewItem[]>([])
const orders = ref<OrderViewItem[]>([])
const selectedOrder = ref<OrderViewItem | null>(null)
const adminTab = ref<'products' | 'orders' | 'categories'>('products')
const loginForm = ref({
  username: '',
  password: ''
})

// 管理后台相关状态
const adminProducts = ref<any[]>([])
const adminOrders = ref<any[]>([])
const loadingAdminProducts = ref(false)
const loadingAdminOrders = ref(false)
const showAddProduct = ref(false)
const showEditProduct = ref(false)
const showUpdateStatus = ref(false)
const selectedProduct = ref<any>(null)
const selectedOrderForUpdate = ref<any>(null)

// 分类管理相关状态
const adminCategories = ref<any[]>([])
const loadingAdminCategories = ref(false)
const showAddCategory = ref(false)
const showEditCategory = ref(false)
const selectedCategory = ref<any>(null)
const categoryForm = ref({
  name: '',
  parent_id: 0,
  level: 1,
  sort: 0,
  icon: '',
  status: 1
})

// 内置图标列表
const categoryIconsList = [
  '📱', '💻', '👕', '🏠', '📷', '🎵', '🎮', '⌚',
  '💡', '🔌', '📺', '🎁', '🛒', '💰', '📦', '🚚',
  '📱', '💻', '🖥️', '⌨️', '🖱️', '🎧', '🎤', '📡',
  '📺', '🎬', '🎮', '🎲', '🎯', '🎨', '🎭', '🎪',
  '👔', '👖', '👗', '👠', '👟', '🧣', '🧤', '🎩',
  '🍎', '🍊', '🍋', '🍇', '🍓', '🍑', '🍒', '🥝',
  '🏡', '🏢', '🏬', '🏭', '🏥', '🏫', '🏪', '🏩',
  '🚗', '🚲', '✈️', '🚢', '🚂', '🚀', '🛸', '🚁'
]

// 选择分类图标
const selectCategoryIcon = (icon: string) => {
  categoryForm.value.icon = icon
  categoryImages.value = []
}

// 清除分类图标
const clearCategoryIcon = () => {
  categoryForm.value.icon = ''
}

// 分类图片数组
const categoryImages = ref<string[]>([])
const categoryImageRef = ref<HTMLInputElement | null>(null)

const triggerCategoryUpload = () => {
  categoryImageRef.value?.click()
}

const handleCategoryDrop = (event: DragEvent) => {
  event.preventDefault()
  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    const file = files[0]
    if (!file.type.startsWith('image/')) {
      alert('请上传图片文件')
      return
    }
    if (file.size > 20 * 1024 * 1024) {
      alert('图片大小不能超过20MB')
      return
    }
    
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        categoryImages.value = [e.target.result as string]
        categoryForm.value.icon = e.target.result as string
      }
    }
    reader.readAsDataURL(file)
  }
}

const handleCategoryImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    const file = target.files[0]
    
    if (file.size > 20 * 1024 * 1024) {
      alert('图片大小不能超过20MB')
      return
    }
    
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        categoryImages.value = [e.target.result as string]
        categoryForm.value.icon = e.target.result as string
      }
    }
    reader.readAsDataURL(file)
  }
}

const removeCategoryImage = () => {
  categoryImages.value = []
  categoryForm.value.icon = ''
  if (categoryImageRef.value) {
    categoryImageRef.value.value = ''
  }
}

// 商品图片数组
const productImages = ref<string[]>([])
const productImageRef = ref<HTMLInputElement | null>(null)

const triggerProductUpload = () => {
  productImageRef.value?.click()
}

const handleProductDrop = (event: DragEvent) => {
  event.preventDefault()
  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    const fileArray = Array.from(files)
    
    // 检查是否超过10张
    if (productImages.value.length + fileArray.length > 10) {
      alert('最多只能上传10张图片')
      return
    }
    
    // 检查每张图片
    for (const file of fileArray) {
      if (!file.type.startsWith('image/')) {
        alert('请上传图片文件')
        return
      }
      if (file.size > 20 * 1024 * 1024) {
        alert('图片大小不能超过20MB')
        return
      }
    }
    
    // 读取所有图片
    fileArray.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        productImages.value.push(result)
      }
      reader.readAsDataURL(file)
    })
  }
}

// 商品表单
const productForm = ref({
  name: '',
  category_id: 1,
  price: 0,
  market_price: 0,
  stock: 0,
  brand: '',
  main_image: '',
  status: 1,
  description: ''
})

// 订单状态表单
const orderStatusForm = ref({
  status: 'pending',
  action_note: ''
})

// 分类数据
const categories = ref<CategoryItem[]>([])

// 商品数据
const products = ref<Product[]>([])

const categoryIcons: Record<string, string> = {
  手机数码: '📱',
  电脑办公: '💻',
  服装鞋包: '👕',
  家用电器: '🏠'
}

const floorSections = computed(() => {
  const groups: Record<string, Product[]> = {}
  products.value.forEach((product) => {
    const key = product.name.includes('iPhone') || product.name.includes('MacBook') ? '数码家电' : '服饰生活'
    if (!groups[key]) groups[key] = []
    groups[key].push(product)
  })
  return Object.entries(groups).map(([name, list], index) => ({
    id: index + 1,
    name,
    products: list.slice(0, 4)
  }))
})

const recommendProducts = computed(() => products.value.slice(0, 6))
const isAdmin = computed(() => currentUser.value === 'admin')

const loadProducts = async () => {
  loadingProducts.value = true
  try {
    // 先尝试加载热门商品
    const hotData = await request('/products/hot')
    let list = (hotData?.data || []) as any[]
    
    // 如果热门商品不足12个，再加载普通商品补充
    if (list.length < 12) {
      const data = await request('/products?limit=' + (12 - list.length))
      const normalList = (data?.data || []) as any[]
      list = [...list, ...normalList]
    }
    
    products.value = list.map((item) => {
      const originalPrice = Number(item.originalPrice || item.original_price || item.market_price || 0)
      const price = Number(item.price || 0)
      const discount = originalPrice > price && originalPrice > 0
        ? Math.round(((originalPrice - price) / originalPrice) * 100)
        : 0

      return {
        id: item.id,
        name: item.name,
        description: item.description || '',
        price,
        originalPrice: originalPrice || undefined,
        image: item.image || item.main_image || 'https://via.placeholder.com/300x200/409eff/ffffff?text=商品',
        main_image: item.main_image,
        images: Array.isArray(item.images) ? item.images : undefined,
        discount: discount || undefined
      }
    })
  } catch (error) {
    console.error('加载商品失败:', error)
    alert('商品加载失败，请稍后刷新重试')
  } finally {
    loadingProducts.value = false
  }
}

const fallbackImage = '/vite.svg'

const resolveProductImage = (product: Product) => {
  return product.image || product.main_image || product.images?.[0] || fallbackImage
}

const onImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  if (target.src.includes(fallbackImage)) return
  target.src = fallbackImage
}

const loadCategories = async () => {
  try {
    const data = await request('/categories')
    if (Array.isArray(data?.data)) {
      categories.value = data.data.map((item: any) => ({
        id: item.id || item.category_id,
        name: item.name,
        icon: categoryIcons[item.name] || item.icon || '🛍️',
        description: item.description || `${item.name}精选好物`
      }))
    }
  } catch (error) {
    console.error('加载分类失败:', error)
  }
}

const refreshCartCount = async () => {
  const token = localStorage.getItem('token')
  if (!token) {
    cartCount.value = 0
    return
  }
  try {
    const data = await request('/cart')
    const items = Array.isArray(data?.data) ? data.data : data?.data?.items || []
    cartItems.value = items
    cartCount.value = items.length
  } catch (error) {
    console.error('购物车加载失败:', error)
  }
}

const loadOrders = async () => {
  const token = localStorage.getItem('token')
  if (!token) {
    orders.value = []
    return
  }
  try {
    const data = await request('/orders')
    const list = (data?.data || []) as any[]
    orders.value = list.map((item) => ({
      id: item.id,
      orderNo: item.order_no || `ORD-${item.id}`,
      totalAmount: Number(item.total_amount || 0),
      finalAmount: Number(item.final_amount || item.total_amount || 0),
      discountAmount: Number(item.discount_amount || 0),
      shippingFee: Number(item.shipping_fee || 0),
      status: item.status || 'pending',
      createdAt: item.created_at || new Date().toISOString(),
      paidAt: item.paid_at,
      receiver: item.receiver,
      receiverPhone: item.receiver_phone,
      shippingAddress: item.shipping_address,
      note: item.note,
      items: Array.isArray(item.items) ? item.items : []
    }))
  } catch (error) {
    console.error('订单加载失败:', error)
  }
}

const restoreSession = async () => {
  const token = localStorage.getItem('token')
  if (!token) return
  try {
    const data = await request('/auth/me')
    currentUser.value = data?.data?.username || data?.data?.email || ''
    currentRole.value = data?.data?.role || 'user'
    await Promise.all([refreshCartCount(), loadOrders()])
  } catch (error) {
    console.error('恢复会话失败:', error)
    localStorage.removeItem('token')
    currentUser.value = ''
    currentRole.value = 'user'
  }
}

// 方法
const addToCart = async (product: Product) => {
  const token = localStorage.getItem('token')
  if (!token) {
    showLogin.value = true
    alert('请先登录后再添加购物车')
    return
  }
  try {
    await request('/cart', {
      method: 'POST',
      body: JSON.stringify({
        product_id: product.id,
        quantity: 1
      })
    })
    await refreshCartCount()
    alert(`已添加 ${product.name} 到购物车`)
  } catch (error: any) {
    alert(error?.message || '添加购物车失败')
  }
}

const buyNow = async (product: Product) => {
  const token = localStorage.getItem('token')
  if (!token) {
    showLogin.value = true
    alert('请先登录后再下单')
    return
  }
  try {
    // 直接创建订单，不需要先添加到购物车
    const orderRes = await request('/orders', {
      method: 'POST',
      body: JSON.stringify({
        items: [{
          product_id: product.id,
          quantity: 1
        }],
        shipping_address: '默认地址', // 实际项目中应该让用户选择地址
        receiver: '收货人',
        receiver_phone: '13800138000'
      })
    })
    await refreshCartCount()
    await loadOrders()
    alert(`下单成功，订单号：${orderRes?.data?.orderNo || '已创建'}`)
  } catch (error: any) {
    alert(error?.message || '下单失败')
  }
}

const openCart = async () => {
  activeTab.value = 'cart'
  await refreshCartCount()
}

// 购物车方法
const hasCheckedItems = computed(() => {
  return cartItems.value.length > 0
})

const updateQuantity = async (item: any, change: number) => {
  const newQuantity = item.quantity + change
  if (newQuantity < 1) return
  
  try {
    await request(`/cart/${item.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        quantity: newQuantity
      })
    })
    await refreshCartCount()
  } catch (error: any) {
    alert(error?.message || '更新数量失败')
  }
}

const onQuantityChange = async (item: any, event: Event) => {
  const target = event.target as HTMLInputElement
  const newQuantity = parseInt(target.value)
  if (isNaN(newQuantity) || newQuantity < 1) {
    target.value = item.quantity.toString()
    return
  }
  
  try {
    await request(`/cart/${item.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        quantity: newQuantity
      })
    })
    await refreshCartCount()
  } catch (error: any) {
    alert(error?.message || '更新数量失败')
  }
}

const removeFromCart = async (item: any) => {
  if (!confirm(`确定要删除 ${item.product?.name} 吗？`)) return
  
  try {
    await request(`/cart/${item.id}`, {
      method: 'DELETE'
    })
    await refreshCartCount()
  } catch (error: any) {
    alert(error?.message || '删除失败')
  }
}

const clearCart = async () => {
  if (!confirm('确定要清空购物车吗？')) return
  
  try {
    await request('/cart', {
      method: 'DELETE'
    })
    await refreshCartCount()
  } catch (error: any) {
    alert(error?.message || '清空失败')
  }
}

const checkoutFromCart = async () => {
  if (cartItems.value.length === 0) {
    alert('购物车为空')
    return
  }
  
  // 跳转到订单确认页面（这里简化处理，直接创建订单）
  const items = cartItems.value.map(item => ({
    product_id: item.product_id,
    quantity: item.quantity
  }))
  
  try {
    const orderRes = await request('/orders', {
      method: 'POST',
      body: JSON.stringify({
        items,
        shipping_address: '请输入收货地址',
        receiver: '请输入收货人',
        receiver_phone: '请输入手机号'
      })
    })
    
    if (orderRes?.success) {
      // 清空购物车
      await clearCart()
      await loadOrders()
      activeTab.value = 'orders'
      alert('订单创建成功，请完善收货信息')
    }
  } catch (error: any) {
    alert(error?.message || '下单失败')
  }
}

const openOrders = async () => {
  const token = localStorage.getItem('token')
  if (!token) {
    pendingRoute.value = 'orders' // 记录想要访问的页面
    showLogin.value = true
    return
  }
  activeTab.value = 'orders'
  await loadOrders()
}

const openOrdersFromMenu = async () => {
  userMenuOpen.value = false
  await openOrders()
}

const openAdmin = async () => {
  userMenuOpen.value = false
  if (!isAdmin.value) {
    alert('仅管理员可访问')
    return
  }
  activeTab.value = 'admin'
  await Promise.all([loadAdminProducts(), loadAdminOrders()])
}

// 管理后台方法
const loadAdminProducts = async () => {
  loadingAdminProducts.value = true
  try {
    // 管理后台显示所有商品，包括已下架的
    const data = await request('/products?limit=100&status=all')
    adminProducts.value = data?.data || []
  } catch (error) {
    console.error('加载商品失败:', error)
    alert('商品加载失败，请稍后重试')
  } finally {
    loadingAdminProducts.value = false
  }
}

const loadAdminOrders = async () => {
  loadingAdminOrders.value = true
  try {
    const data = await request('/orders?limit=100')
    adminOrders.value = data?.data || []
  } catch (error) {
    console.error('加载订单失败:', error)
  } finally {
    loadingAdminOrders.value = false
  }
}

// 分类管理方法
const loadAdminCategories = async () => {
  loadingAdminCategories.value = true
  try {
    const data = await request('/categories/all')
    adminCategories.value = data?.data || []
  } catch (error) {
    console.error('加载分类失败:', error)
    alert('分类加载失败，请稍后重试')
  } finally {
    loadingAdminCategories.value = false
  }
}

const openAddCategory = () => {
  categoryForm.value = {
    name: '',
    parent_id: 0,
    level: 1,
    sort: 0,
    icon: '',
    status: 1
  }
  categoryImages.value = []
  showAddCategory.value = true
}

const openEditCategory = (category: any) => {
  selectedCategory.value = category
  categoryForm.value = {
    name: category.name || '',
    parent_id: category.parent_id || 0,
    level: category.level || 1,
    sort: category.sort || 0,
    icon: category.icon || '',
    status: category.status || 1
  }
  if (category.icon) {
    categoryImages.value = [category.icon]
  } else {
    categoryImages.value = []
  }
  showEditCategory.value = true
}

const saveCategory = async () => {
  if (!categoryForm.value.name.trim()) {
    alert('请输入分类名称')
    return
  }

  try {
    const data = await request('/categories', {
      method: 'POST',
      body: JSON.stringify(categoryForm.value)
    })
    if (data?.success) {
      alert('分类创建成功')
      showAddCategory.value = false
      await loadAdminCategories()
      await loadCategories()
    } else {
      alert(data?.message || '创建失败')
    }
  } catch (error: any) {
    alert(error?.message || '创建失败')
  }
}

const updateCategory = async () => {
  if (!categoryForm.value.name.trim()) {
    alert('请输入分类名称')
    return
  }

  try {
    const data = await request(`/categories/${selectedCategory.value.id}`, {
      method: 'PUT',
      body: JSON.stringify(categoryForm.value)
    })
    if (data?.success) {
      alert('分类更新成功')
      showEditCategory.value = false
      selectedCategory.value = null
      await loadAdminCategories()
      await loadCategories()
    } else {
      alert(data?.message || '更新失败')
    }
  } catch (error: any) {
    alert(error?.message || '更新失败')
  }
}

const deleteCategory = async (category: any) => {
  if (!confirm(`确定要删除分类 "${category.name}" 吗？`)) {
    return
  }

  try {
    const data = await request(`/categories/${category.id}`, {
      method: 'DELETE'
    })
    if (data?.success) {
      alert('删除成功')
      await loadAdminCategories()
      await loadCategories()
    } else {
      alert(data?.message || '删除失败')
    }
  } catch (error: any) {
    alert(error?.message || '删除失败')
  }
}

const closeCategoryModal = () => {
  showAddCategory.value = false
  showEditCategory.value = false
  selectedCategory.value = null
  categoryImages.value = []
  if (categoryImageRef.value) {
    categoryImageRef.value.value = ''
  }
}

const closeProductModal = () => {
  showAddProduct.value = false
  showEditProduct.value = false
  selectedProduct.value = null
  productForm.value = {
    name: '',
    category_id: 1,
    price: 0,
    market_price: 0,
    stock: 0,
    brand: '',
    main_image: '',
    status: 1,
    description: ''
  }
  productImages.value = []
}

const editProduct = (product: any) => {
  selectedProduct.value = product
  productForm.value = {
    name: product.name || '',
    category_id: product.category_id || 1,
    price: product.price || 0,
    market_price: product.market_price || 0,
    stock: product.stock || 0,
    brand: product.brand || '',
    main_image: product.main_image || '',
    status: product.status || 1,
    description: product.description || ''
  }
  
  // 加载商品图片
  let imagesArray: string[] = []
  if (product.images) {
    if (Array.isArray(product.images)) {
      imagesArray = [...product.images]
    } else if (typeof product.images === 'string') {
      try {
        imagesArray = JSON.parse(product.images)
      } catch (e) {
        imagesArray = []
      }
    }
  }
  
  // 过滤掉空字符串
  imagesArray = imagesArray.filter(img => img && img.trim() !== '')
  
  if (imagesArray.length === 0 && product.main_image) {
    imagesArray = [product.main_image]
  }
  
  productImages.value = imagesArray
  
  showEditProduct.value = true
}

const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    const files = Array.from(target.files)
    
    // 检查是否超过10张
    if (productImages.value.length + files.length > 10) {
      alert('最多只能上传10张图片')
      return
    }
    
    // 检查每张图片的大小
    for (const file of files) {
      if (file.size > 20 * 1024 * 1024) {
        alert('图片大小不能超过20MB')
        return
      }
    }
    
    // 读取所有图片
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        productImages.value.push(result)
      }
      reader.readAsDataURL(file)
    })
  }
}

const removeImage = (index: number) => {
  productImages.value.splice(index, 1)
}

const saveProduct = async () => {
  if (!productForm.value.name || !productForm.value.price) {
    alert('请填写商品名称和价格')
    return
  }

  try {
    const productData = { ...productForm.value }
    
    // 过滤掉无效的图片，只保留有效的Base64或URL图片
    const validImages = productImages.value.filter(img => {
      if (!img || typeof img !== 'string') return false
      const trimmed = img.trim()
      if (trimmed === '') return false
      // 检查是否是有效的图片格式（Base64或URL）
      return trimmed.startsWith('data:') || trimmed.startsWith('http://') || trimmed.startsWith('https://')
    })
    
    // 将图片数组转换为JSON字符串
    if (validImages.length > 0) {
      productData.images = JSON.stringify(validImages)
      // 将第一张图片作为主图
      productData.main_image = validImages[0]
    }
    
    let data
    if (showEditProduct.value && selectedProduct.value) {
      data = await request(`/products/${selectedProduct.value.id}`, {
        method: 'PUT',
        body: JSON.stringify(productData)
      })
    } else {
      data = await request('/products', {
        method: 'POST',
        body: JSON.stringify(productData)
      })
    }
    alert(data?.message || '操作成功')
    closeProductModal()
    await loadAdminProducts()
  } catch (error: any) {
    alert(error?.message || '操作失败')
  }
}

const toggleProductStatus = async (product: any) => {
  try {
    const newStatus = product.status === 1 ? 0 : 1
    await request(`/products/${product.id}`, {
      method: 'PUT',
      body: JSON.stringify({ status: newStatus })
    })
    product.status = newStatus
    alert('状态更新成功')
  } catch (error: any) {
    alert(error?.message || '操作失败')
  }
}

const deleteProduct = async (product: any) => {
  if (!confirm(`确定要删除商品 ${product.name} 吗？`)) {
    return
  }

  try {
    await request(`/products/${product.id}`, {
      method: 'DELETE'
    })
    adminProducts.value = adminProducts.value.filter(p => p.id !== product.id)
    alert('删除成功')
  } catch (error: any) {
    alert(error?.message || '删除失败')
  }
}

const showUpdateOrderStatus = (order: any) => {
  selectedOrderForUpdate.value = order
  orderStatusForm.value = {
    status: order.status || 'pending',
    action_note: ''
  }
  showUpdateStatus.value = true
}

const updateOrderStatus = async () => {
  if (!selectedOrderForUpdate.value) return

  try {
    await request(`/orders/${selectedOrderForUpdate.value.id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(orderStatusForm.value)
    })
    alert('状态更新成功')
    showUpdateStatus.value = false
    await loadAdminOrders()
  } catch (error: any) {
    alert(error?.message || '操作失败')
  }
}

const deleteOrder = async (order: any) => {
  if (!confirm(`确定要删除订单 ${order.orderNo || order.order_no} 吗？`)) {
    return
  }

  try {
    await request(`/orders/${order.id}`, {
      method: 'DELETE'
    })
    adminOrders.value = adminOrders.value.filter(o => o.id !== order.id)
    alert('删除成功')
  } catch (error: any) {
    alert(error?.message || '删除失败')
  }
}

const openOrderDetail = (order: OrderViewItem) => {
  selectedOrder.value = order
  showOrderDetail.value = true
}

const getStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    'pending': '待支付',
    'paid': '已支付',
    'shipped': '已发货',
    'delivered': '已送达',
    'completed': '已完成',
    'cancelled': '已取消',
    'refunded': '已退款'
  }
  return statusMap[status] || status
}

const cancelOrder = async (order: OrderViewItem) => {
  if (!confirm('确定要取消该订单吗？')) return
  
  try {
    const data = await request(`/orders/${order.id}/cancel`, {
      method: 'POST'
    })
    if (data?.success) {
      alert('订单取消成功')
      showOrderDetail.value = false
      await loadOrders()
    }
  } catch (error: any) {
    alert(error?.message || '取消订单失败')
  }
}

const editOrder = async (order: OrderViewItem) => {
  const newAddress = prompt('请输入收货地址:', order.shippingAddress || '')
  if (!newAddress) return
  
  const newReceiver = prompt('请输入收货人:', order.receiver || '')
  if (!newReceiver) return
  
  const newPhone = prompt('请输入手机号:', order.receiverPhone || '')
  if (!newPhone) return
  
  const newNote = prompt('请输入备注:', order.note || '')
  
  try {
    const data = await request(`/orders/${order.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        shipping_address: newAddress,
        receiver: newReceiver,
        receiver_phone: newPhone,
        note: newNote
      })
    })
    if (data?.success) {
      alert('订单信息更新成功')
      showOrderDetail.value = false
      await loadOrders()
    }
  } catch (error: any) {
    alert(error?.message || '更新订单失败')
  }
}

const formatOrderDate = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('zh-CN')
}

const handleLogout = () => {
  localStorage.removeItem('token')
  currentUser.value = ''
  currentRole.value = ''
  userMenuOpen.value = false
  cartCount.value = 0
  cartItems.value = []
  orders.value = []
  activeTab.value = 'home'
  alert('已退出登录')
}

const toggleUserMenu = () => {
  userMenuOpen.value = !userMenuOpen.value
}

const handleLogin = async () => {
  if (!loginForm.value.username || !loginForm.value.password) {
    alert('请输入用户名和密码')
    return
  }

  try {
    const data = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        username: loginForm.value.username,
        password: loginForm.value.password
      })
    })
    const token = data?.data?.token
    const user = data?.data?.user
    if (!token) {
      throw new Error('登录返回缺少 token')
    }
    localStorage.setItem('token', token)
    currentUser.value = user?.username || user?.email || loginForm.value.username
    currentRole.value = user?.role || 'user'
    await Promise.all([refreshCartCount(), loadOrders()])
    alert(`登录成功！欢迎 ${currentUser.value}`)
    showLogin.value = false
    loginForm.value = { username: '', password: '' }
    
    // 登录成功后自动跳转到之前记录的页面
    if (pendingRoute.value) {
      if (pendingRoute.value === 'orders') {
        activeTab.value = 'orders'
      }
      pendingRoute.value = ''
    }
  } catch (error: any) {
    console.error('登录错误:', error)
    alert(error?.message || error?.response?.data?.message || '登录失败，请检查用户名和密码')
  }
}

// 生命周期
onMounted(async () => {
  console.log('商城页面加载完成')
  await Promise.all([loadProducts(), loadCategories()])
  await restoreSession()
})

// 监听activeTab变化，当切换到商品页面时加载商品数据
watch(activeTab, async (newTab, oldTab) => {
  if (newTab === 'products' && oldTab !== 'products') {
    await loadProducts()
  }
})

// 监听adminTab变化，当切换到商品管理页面时加载商品数据
watch(adminTab, async (newTab, oldTab) => {
  if (newTab === 'products' && activeTab.value === 'admin') {
    await loadAdminProducts()
  }
  if (newTab === 'categories' && activeTab.value === 'admin') {
    await loadAdminCategories()
  }
})
</script>

<style>
/* 基础样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;
  line-height: 1.6;
  color: #333;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 导航栏 */
.navbar {
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.navbar .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-icon {
  font-size: 28px;
  line-height: 1;
}

.nav-brand h1 {
  font-size: 24px;
  color: #409eff;
  margin: 0;
  line-height: 1;
}

.nav-menu {
  display: flex;
  gap: 32px;
}

.nav-link {
  text-decoration: none;
  color: #666;
  font-weight: 500;
  transition: color 0.3s;
}

.nav-link:hover,
.nav-link.active {
  color: #409eff;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-menu {
  position: relative;
}

.user-trigger {
  display: flex;
  align-items: center;
  gap: 6px;
}

.avatar-dot {
  font-size: 14px;
}

.menu-arrow {
  font-size: 12px;
  opacity: 0.9;
}

.user-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 140px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  border: 1px solid #eee;
  overflow: hidden;
  z-index: 1500;
}

.dropdown-item {
  display: block;
  padding: 10px 14px;
  color: #333;
  text-decoration: none;
  font-size: 14px;
}

.dropdown-item:hover {
  background: #f5f7fa;
}

.dropdown-item.danger {
  color: #f56c6c;
}

.btn {
  padding: 8px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
}

.btn-login {
  background: #409eff;
  color: white;
}

.btn-login:hover {
  background: #337ecc;
}

.cart-icon {
  position: relative;
  font-size: 24px;
  cursor: pointer;
}

.cart-count {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #ff6b6b;
  color: white;
  font-size: 12px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 轮播图 */
.hero {
  margin-bottom: 40px;
}

.hero-slider {
  height: 400px;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
}

.slide {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  text-align: center;
}

.slide-content h2 {
  font-size: 48px;
  margin-bottom: 16px;
}

.slide-content p {
  font-size: 20px;
  margin-bottom: 24px;
  opacity: 0.9;
}

.btn-primary {
  background: white;
  color: #667eea;
  padding: 12px 32px;
  font-size: 18px;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

/* 管理后台样式 */
.admin-dashboard {
  min-height: 80vh;
  background: #f5f7fa;
}

.admin-container {
  display: flex;
  max-width: 1200px;
  margin: 0 auto;
  min-height: 80vh;
}

/* 左侧菜单树 */
.admin-sidebar {
  width: 240px;
  background: white;
  border-right: 1px solid #e4e7ed;
  padding: 20px 0;
}

.sidebar-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  padding: 0 20px 16px;
  border-bottom: 1px solid #e4e7ed;
  margin-bottom: 16px;
}

.sidebar-menu {
  list-style: none;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  cursor: pointer;
  transition: all 0.3s;
  color: #606266;
}

.menu-item:hover {
  background: #ecf5ff;
  color: #409eff;
}

.menu-item.active {
  background: #ecf5ff;
  color: #409eff;
  border-left: 4px solid #409eff;
}

.menu-icon {
  font-size: 18px;
  margin-right: 12px;
}

.menu-text {
  font-size: 14px;
  font-weight: 500;
}

/* 右侧内容区 */
.admin-content {
  flex: 1;
  padding: 24px;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e4e7ed;
}

.content-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .admin-container {
    flex-direction: column;
  }

  .admin-sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #e4e7ed;
  }

  .sidebar-menu {
    display: flex;
    overflow-x: auto;
  }

  .menu-item {
    border-left: none;
    border-bottom: 3px solid transparent;
    white-space: nowrap;
  }

  .menu-item.active {
    border-left: none;
    border-bottom: 3px solid #409eff;
  }
}

/* 分类 */
.categories {
  padding: 60px 0;
  background: #f8f9fa;
}

.section-title {
  font-size: 32px;
  text-align: center;
  margin-bottom: 40px;
  color: #333;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
}

.category-card {
  background: white;
  padding: 30px 20px;
  border-radius: 12px;
  text-align: center;
  transition: all 0.3s;
  cursor: pointer;
}

.category-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.1);
}

.category-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.category-card h3 {
  font-size: 20px;
  margin-bottom: 8px;
  color: #333;
}

.category-card p {
  color: #666;
  font-size: 14px;
}

/* 商品 */
.products {
  padding: 60px 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
}

.view-all {
  color: #409eff;
  text-decoration: none;
  font-weight: 500;
}

.view-all:hover {
  text-decoration: underline;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
}

.product-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.product-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.12);
}

.product-image {
  position: relative;
  height: 220px;
  overflow: hidden;
  background: white;
  border-radius: 12px 12px 0 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.product-card:hover .product-image img {
  transform: scale(1.08);
  filter: brightness(1.05);
}

.product-badge {
  position: absolute;
  top: 16px;
  right: 16px;
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
  color: white;
  padding: 6px 14px;
  border-radius: 24px;
  font-size: 13px;
  font-weight: 600;
  box-shadow: 0 6px 16px rgba(255, 107, 107, 0.4);
  transform: rotate(0deg) translateY(0);
  transition: all 0.3s ease;
}

.product-card:hover .product-badge {
  transform: rotate(-3deg) scale(1.08) translateY(-2px);
  box-shadow: 0 8px 20px rgba(255, 107, 107, 0.5);
}

.product-title-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 16px;
  background: linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 100%);
  color: white;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s ease;
}

.product-card:hover .product-title-container {
  background: linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%);
}

.product-title-icon {
  font-size: 20px;
  line-height: 1;
  flex-shrink: 0;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.product-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  flex: 1;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-info {
  padding: 24px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.product-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.product-icon {
  font-size: 28px;
  line-height: 1;
  color: #409eff;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.product-card:hover .product-icon {
  transform: scale(1.1);
  color: #337ecc;
}

.product-name {
  font-size: 19px;
  margin: 0;
  color: #333;
  flex: 1;
  font-weight: 700;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: all 0.3s ease;
}

.product-card:hover .product-name {
  color: #409eff;
}

.product-description {
  color: #666;
  font-size: 14px;
  margin-bottom: 20px;
  line-height: 1.5;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-price {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  flex-shrink: 0;
}

.current-price {
  font-size: 28px;
  font-weight: 700;
  color: #ff6b6b;
  line-height: 1;
}

.original-price {
  font-size: 16px;
  color: #999;
  text-decoration: line-through;
  line-height: 1;
}

.product-actions {
  display: flex;
  gap: 12px;
  flex-shrink: 0;
}

.btn-add-cart {
  flex: 1;
  background: linear-gradient(135deg, #409eff 0%, #337ecc 100%);
  color: white;
  border: none;
  padding: 12px 16px;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.btn-add-cart:hover {
  background: linear-gradient(135deg, #337ecc 0%, #2a69b8 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(64, 158, 255, 0.3);
}

.btn-buy {
  flex: 1;
  background: linear-gradient(135deg, #07c160 0%, #06a952 100%);
  color: white;
  border: none;
  padding: 12px 16px;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.btn-buy:hover {
  background: linear-gradient(135deg, #06a952 0%, #059448 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(7, 193, 96, 0.3);
}

/* 模态框 */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 600px;
  max-width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.modal-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.3s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.modal-body {
  padding: 30px;
}

.form-group {
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  margin-bottom: 10px;
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.upload-section {
  margin-top: 5px;
}

.upload-section input[type="file"] {
  width: 100%;
  padding: 12px 16px;
  border: 2px dashed #667eea;
  border-radius: 8px;
  background: #f8f9ff;
  cursor: pointer;
  transition: all 0.3s;
}

.upload-section input[type="file"]:hover {
  background: #f0f2ff;
  border-color: #764ba2;
}

.upload-hint {
  margin-top: 8px;
  color: #999;
  font-size: 12px;
}

.preview-section {
  margin-top: 16px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
}

.preview-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.preview-image {
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
  border: 2px solid #e0e0e0;
  transition: all 0.3s;
}

.preview-image:hover {
  border-color: #667eea;
  transform: scale(1.02);
}

.btn.small {
  padding: 6px 12px;
  font-size: 12px;
  border-radius: 6px;
}

.btn-danger {
  background: #ff4757;
  color: white;
  border: none;
}

/* 分类图片上传组件 */
.category-image-upload {
  width: 100%;
}

.upload-area {
  width: 100%;
  min-height: 200px;
  border: 3px dashed #d1d5db;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  position: relative;
  overflow: hidden;
}

.upload-area:hover {
  border-color: #667eea;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.15);
}

.upload-area.has-image {
  border: 3px solid #667eea;
  padding: 0;
  min-height: 200px;
}

.upload-area.has-image:hover {
  border-color: #764ba2;
}

.upload-icon {
  font-size: 48px;
  opacity: 0.6;
  transition: all 0.3s;
}

.upload-area:hover .upload-icon {
  transform: scale(1.1);
  opacity: 1;
}

.upload-text {
  font-size: 16px;
  color: #64748b;
  font-weight: 500;
}

.upload-hint {
  font-size: 13px;
  color: #94a3b8;
}

.preview-img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  display: block;
}

.upload-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 8px;
  opacity: 0;
  transition: all 0.3s;
}

.upload-area.has-image:hover .upload-overlay {
  opacity: 1;
}

.upload-overlay .upload-icon {
  font-size: 32px;
  opacity: 1;
}

.upload-overlay span {
  color: white;
  font-size: 14px;
  font-weight: 500;
}

.remove-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 71, 87, 0.9);
  color: white;
  border: none;
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(255, 71, 87, 0.3);
}

.remove-btn:hover {
  background: #ff4757;
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(255, 71, 87, 0.4);
}

/* 产品图片上传组件 */
.product-image-upload {
  width: 100%;
}

.product-image-upload .upload-area {
  width: 100%;
  min-height: 200px;
  border: 3px dashed #d1d5db;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  position: relative;
  padding: 20px;
}

.product-image-upload .upload-area:hover {
  border-color: #667eea;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.15);
}

.product-image-upload .upload-area.has-images {
  border: 3px solid #667eea;
  min-height: auto;
  padding: 15px;
}

.images-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  width: 100%;
}

.image-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
}

.product-preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.add-more {
  aspect-ratio: 1;
  border: 2px dashed #cbd5e1;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  color: #64748b;
  font-size: 14px;
}

.add-more:hover {
  border-color: #667eea;
  background: #f0f9ff;
  color: #667eea;
}

/* 图标选择器 */
.icon-picker {
  width: 100%;
}

.selected-icon {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  padding: 10px 15px;
  background: #f0f9ff;
  border-radius: 8px;
  border: 1px solid #e0f2fe;
}

.icon-preview {
  font-size: 28px;
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
  padding: 10px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.icon-item {
  width: 100%;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  border: none;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.icon-item:hover {
  background: #f0f9ff;
  transform: scale(1.1);
}

.icon-item.selected {
  background: #e0f2fe;
  border: 2px solid #667eea;
}

.icon-hint {
  margin-top: 10px;
  font-size: 12px;
  color: #94a3b8;
  text-align: center;
}

.category-icon-img {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  object-fit: cover;
  vertical-align: middle;
  margin-right: 8px;
}

.category-menu-icon-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.btn-secondary {
  background: #ddd;
  color: #333;
}

.btn-secondary:hover {
  background: #ccc;
}

.btn.active {
  background: #409eff;
  color: white;
}

.btn.danger {
  background: #f56c6c;
  color: white;
}

.btn.danger:hover {
  background: #e6a23c;
}

.test-accounts {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 6px;
  font-size: 13px;
  color: #666;
}

.test-accounts p {
  margin: 5px 0;
}

.login-hint {
  background: #fff3cd;
  border: 1px solid #ffeeba;
  border-radius: 6px;
  padding: 12px 16px;
  margin-bottom: 20px;
  text-align: center;
}

.login-hint p {
  margin: 6px 0;
  color: #856404;
  font-size: 14px;
}

/* 购物车样式 */
.cart-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.cart-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cart-item {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
}

.cart-item:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.cart-item-image {
  flex-shrink: 0;
  width: 100px;
  height: 100px;
  border-radius: 8px;
  overflow: hidden;
}

.cart-item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cart-item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cart-item-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.cart-item-price {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.cart-item-quantity {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-qty {
  width: 32px;
  height: 32px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-qty:hover:not(:disabled) {
  background: #f0f9ff;
  border-color: #667eea;
  color: #667eea;
}

.btn-qty:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.qty-input {
  width: 60px;
  text-align: center;
  padding: 6px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.cart-item-subtotal {
  font-size: 16px;
  font-weight: 600;
  color: #f56c6c;
  margin: 0;
}

.cart-item-actions {
  flex-shrink: 0;
}

/* 订单详情样式 */
.modal-content.large {
  max-width: 800px;
}

.order-detail-section {
  background: #f8fafc;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.order-info-row {
  display: flex;
  margin-bottom: 12px;
  font-size: 14px;
}

.order-info-row:last-child {
  margin-bottom: 0;
}

.order-info-row .label {
  width: 100px;
  color: #666;
  flex-shrink: 0;
}

.order-info-row .value {
  color: #333;
  font-weight: 500;
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.status-badge.pending {
  background: #fff3cd;
  color: #856404;
}

.status-badge.paid {
  background: #d4edda;
  color: #155724;
}

.status-badge.shipped {
  background: #d1ecf1;
  color: #0c5460;
}

.status-badge.delivered,
.status-badge.completed {
  background: #d4edda;
  color: #155724;
}

.status-badge.cancelled,
.status-badge.refunded {
  background: #f8d7da;
  color: #721c24;
}

.order-shipping-section {
  margin-bottom: 20px;
}

.order-shipping-section h4 {
  margin-bottom: 12px;
  color: #333;
  font-size: 16px;
}

.order-shipping-section p {
  margin-bottom: 8px;
  font-size: 14px;
  color: #666;
}

.order-items-section {
  margin-bottom: 20px;
}

.order-items-section h4 {
  margin-bottom: 12px;
  color: #333;
  font-size: 16px;
}

.order-item-list {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.order-item-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
  background: white;
}

.order-item-row:last-child {
  border-bottom: none;
}

.order-item-img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 6px;
}

.order-item-info {
  flex: 1;
}

.item-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.item-meta {
  font-size: 13px;
  color: #666;
  margin: 0;
}

.order-item-total {
  font-size: 16px;
  font-weight: 600;
  color: #f56c6c;
  min-width: 80px;
  text-align: right;
}

.order-total-section {
  background: #f8fafc;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.total-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 14px;
}

.total-row:last-child {
  margin-bottom: 0;
}

.total-row.final {
  border-top: 2px solid #e0e0e0;
  padding-top: 12px;
  margin-top: 12px;
  font-size: 16px;
  font-weight: 700;
}

.final-amount {
  color: #f56c6c;
  font-size: 20px;
}

.order-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
}

/* 页脚 */
.footer {
  background: #333;
  color: white;
  padding: 30px 0;
  text-align: center;
}

.footer p {
  margin: 8px 0;
  opacity: 0.8;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .navbar .container {
    flex-direction: column;
    gap: 16px;
  }
  
  .nav-menu {
    gap: 16px;
  }
  
  .hero-slider {
    height: 300px;
  }
  
  .slide-content h2 {
    font-size: 32px;
  }
  
  .slide-content p {
    font-size: 16px;
  }
  
  .category-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .product-grid {
    grid-template-columns: 1fr;
  }
  
  .product-actions {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .category-grid {
    grid-template-columns: 1fr;
  }
  
  .modal-content {
    width: 95%;
  }
}

</style>