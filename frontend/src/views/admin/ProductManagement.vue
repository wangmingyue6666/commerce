// 生命周期
onMounted(() => {
  fetchProducts()
  fetchCategories()
})

// 工具函数
const formatDate = (dateString: string) => {
  try {
    return format(new Date(dateString), 'yyyy-MM-dd HH:mm:ss')
  } catch {
    return dateString
  }
}

// API 函数
const fetchProducts = async () => {
  loading.value = true
  try {
    const params = new URLSearchParams()
    if (searchForm.keyword) params.append('keyword', searchForm.keyword)
    if (searchForm.category_id) params.append('category_id', searchForm.category_id.toString())
    if (searchForm.status !== undefined) params.append('status', searchForm.status.toString())
    if (searchForm.min_price) params.append('min_price', searchForm.min_price.toString())
    if (searchForm.max_price) params.append('max_price', searchForm.max_price.toString())
    params.append('page', pagination.page.toString())
    params.append('limit', pagination.limit.toString())

    const response = await fetch(`/api/products?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })

    if (!response.ok) {
      throw new Error('获取商品列表失败')
    }

    const data = await response.json()
    if (data.success) {
      products.value = data.data
      pagination.total = data.pagination.total
    } else {
      ElMessage.error(data.message || '获取商品列表失败')
    }
  } catch (error) {
    console.error('获取商品列表失败:', error)
    ElMessage.error('获取商品列表失败，请检查网络连接')
  } finally {
    loading.value = false
  }
}

const fetchCategories = async () => {
  try {
    const response = await fetch('/api/categories', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })

    if (!response.ok) {
      throw new Error('获取分类列表失败')
    }

    const data = await response.json()
    if (data.success) {
      categories.value = data.data
    }
  } catch (error) {
    console.error('获取分类列表失败:', error)
  }
}

const createProduct = async (formData: ProductForm) => {
  formLoading.value = true
  try {
    const response = await fetch('/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        ...formData,
        images: formData.images?.map(img => img.url || img.response?.url)
      })
    })

    const data = await response.json()
    
    if (data.success) {
      ElMessage.success('商品创建成功')
      showCreateDialog.value = false
      fetchProducts()
    } else {
      ElMessage.error(data.message || '商品创建失败')
    }
  } catch (error) {
    console.error('创建商品失败:', error)
    ElMessage.error('创建商品失败，请检查网络连接')
  } finally {
    formLoading.value = false
  }
}

const updateProduct = async (id: number, formData: ProductForm) => {
  formLoading.value = true
  try {
    const response = await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        ...formData,
        images: formData.images?.map(img => img.url || img.response?.url)
      })
    })

    const data = await response.json()
    
    if (data.success) {
      ElMessage.success('商品更新成功')
      showCreateDialog.value = false
      fetchProducts()
    } else {
      ElMessage.error(data.message || '商品更新失败')
    }
  } catch (error) {
    console.error('更新商品失败:', error)
    ElMessage.error('更新商品失败，请检查网络连接')
  } finally {
    formLoading.value = false
  }
}

const deleteProduct = async (id: number) => {
  try {
    const response = await fetch(`/api/products/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })

    const data = await response.json()
    
    if (data.success) {
      ElMessage.success('商品删除成功')
      fetchProducts()
    } else {
      ElMessage.error(data.message || '商品删除失败')
    }
  } catch (error) {
    console.error('删除商品失败:', error)
    ElMessage.error('删除商品失败，请检查网络连接')
  }
}

const updateProductStatus = async (id: number, status: number) => {
  try {
    const response = await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ status })
    })

    const data = await response.json()
    
    if (!data.success) {
      ElMessage.error(data.message || '状态更新失败')
      // 重新获取数据以恢复原状态
      fetchProducts()
    }
  } catch (error) {
    console.error('更新商品状态失败:', error)
    ElMessage.error('更新商品状态失败，请检查网络连接')
    fetchProducts()
  }
}

const batchUpdateStatus = async (ids: number[], status: number) => {
  try {
    const response = await fetch('/api/products/batch-status', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ ids, status })
    })

    const data = await response.json()
    
    if (data.success) {
      ElMessage.success(data.message || '批量更新成功')
      fetchProducts()
      selectedIds.value = []
    } else {
      ElMessage.error(data.message || '批量更新失败')
    }
  } catch (error) {
    console.error('批量更新状态失败:', error)
    ElMessage.error('批量更新状态失败，请检查网络连接')
  }
}

// 事件处理函数
const handleSearch = () => {
  pagination.page = 1
  fetchProducts()
}

const handleReset = () => {
  Object.keys(searchForm).forEach(key => {
    delete (searchForm as any)[key]
  })
  pagination.page = 1
  fetchProducts()
}

const handleSelectionChange = (selection: Product[]) => {
  selectedIds.value = selection.map(item => item.id)
}

const handleStatusChange = async (product: Product) => {
  try {
    await ElMessageBox.confirm(
      `确定要${product.status === 1 ? '上架' : '下架'}该商品吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await updateProductStatus(product.id, product.status)
  } catch {
    // 用户取消操作，恢复原状态
    product.status = product.status === 1 ? 0 : 1
  }
}

const handleEdit = (product: Product) => {
  editMode.value = true
  currentProduct.value = product
  
  // 填充表单数据
  Object.assign(productForm, {
    name: product.name,
    category_id: product.category_id,
    brand: product.brand,
    price: product.price,
    market_price: product.market_price,
    stock: product.stock,
    main_image: product.main_image,
    images: product.images?.map(url => ({ url })) || [],
    description: product.description,
    detail: product.detail,
    status: product.status
  })
  
  showCreateDialog.value = true
}

const handleDelete = async (product: Product) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除该商品吗？此操作不可恢复！',
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await deleteProduct(product.id)
  } catch {
    // 用户取消操作
  }
}

const handleBatchDelete = async () => {
  if (selectedIds.value.length === 0) return
  
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedIds.value.length} 个商品吗？此操作不可恢复！`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 批量删除
    for (const id of selectedIds.value) {
      await deleteProduct(id)
    }
    
    selectedIds.value = []
  } catch {
    // 用户取消操作
  }
}

const handleBatchStatus = (status: number) => {
  if (selectedIds.value.length === 0) return
  
  const action = status === 1 ? '上架' : '下架'
  ElMessageBox.confirm(
    `确定要${action}选中的 ${selectedIds.value.length} 个商品吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    batchUpdateStatus(selectedIds.value, status)
  }).catch(() => {
    // 用户取消操作
  })
}

const handleMoreAction = (command: string, product: Product) => {
  switch (command) {
    case 'view':
      // 查看详情
      window.open(`/product/${product.id}`, '_blank')
      break
    case 'copy':
      // 复制商品
      handleCopyProduct(product)
      break
    case 'stock':
      // 库存管理
      handleStockManagement(product)
      break
  }
}

const handleCopyProduct = (product: Product) => {
  editMode.value = false
  currentProduct.value = null
  
  // 复制商品数据，清除ID和创建时间
  Object.assign(productForm, {
    name: `${product.name} - 副本`,
    category_id: product.category_id,
    brand: product.brand,
    price: product.price,
    market_price: product.market_price,
    stock: product.stock,
    main_image: product.main_image,
    images: product.images?.map(url => ({ url })) || [],
    description: product.description,
    detail: product.detail,
    status: 0 // 默认下架状态
  })
  
  showCreateDialog.value = true
}

const handleStockManagement = (product: Product) => {
  currentProduct.value = product
  stockForm.operation = 'increase'
  stockForm.quantity = 1
  stockForm.remark = ''
  showStockDialog.value = true
}

const handleSizeChange = (size: number) => {
  pagination.limit = size
  pagination.page = 1
  fetchProducts()
}

const handleCurrentChange = (page: number) => {
  pagination.page = page
  fetchProducts()
}

const handleDialogClose = () => {
  productFormRef.value?.resetFields()
  Object.assign(productForm, {
    name: '',
    category_id: undefined,
    brand: '',
    price: undefined,
    market_price: undefined,
    stock: undefined,
    main_image: '',
    images: [],
    description: '',
    detail: '',
    status: 1
  })
  editMode.value = false
  currentProduct.value = null
}

const handleSubmit = async () => {
  if (!productFormRef.value) return
  
  try {
    await productFormRef.value.validate()
    
    if (editMode.value && currentProduct.value) {
      await updateProduct(currentProduct.value.id, productForm)
    } else {
      await createProduct(productForm)
    }
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

const handleStockSubmit = async () => {
  if (!currentProduct.value) return
  
  try {
    let newStock = currentProduct.value.stock
    
    switch (stockForm.operation) {
      case 'increase':
        newStock += stockForm.quantity
        break
      case 'decrease':
        if (currentProduct.value.stock < stockForm.quantity) {
          ElMessage.error('库存不足，无法减少')
          return
        }
        newStock -= stockForm.quantity
        break
      case 'set':
        newStock = stockForm.quantity
        break
    }
    
    const response = await fetch(`/api/products/${currentProduct.value.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ stock: newStock })
    })
    
    const data = await response.json()
    
    if (data.success) {
      ElMessage.success('库存更新成功')
      showStockDialog.value = false
      fetchProducts()
    } else {
      ElMessage.error(data.message || '库存更新失败')
    }
  } catch (error) {
    console.error('库存更新失败:', error)
    ElMessage.error('库存更新失败，请检查网络连接')
  }
}

// 图片上传处理
const beforeImageUpload: UploadProps['beforeUpload'] = (rawFile) => {
  const isJPG = rawFile.type === 'image/jpeg'
  const isPNG = rawFile.type === 'image/png'
  const isLt2M = rawFile.size / 1024 / 1024 < 2

  if (!isJPG && !isPNG) {
    ElMessage.error('图片格式必须是 JPG 或 PNG!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!')
    return false
  }
  return true
}

const handleMainImageSuccess: UploadProps['onSuccess'] = (response) => {
  productForm.main_image = response.url
  ElMessage.success('主图上传成功')
}

const handleImagesSuccess: UploadProps['onSuccess'] = (response, uploadFile) => {
  if (!productForm.images) {
    productForm.images = []
  }
  productForm.images.push({
    name: uploadFile.name,
    url: response.url,
    response
  })
}

const handleImageRemove: UploadProps['onRemove'] = (uploadFile, uploadFiles) => {
  productForm.images = uploadFiles
}
</script>

<style scoped>
.product-management {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  min-height: calc(100vh - 100px);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e8e8e8;
}

.page-header h1 {
  margin: 0;
  font-size: 24px;
  color: #333;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.search-filter {
  margin-bottom: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.product-table {
  margin-bottom: 20px;
}

.pagination {
  display: flex;
  justify-content: flex-end;
}

.product-name {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.name-text {
  font-weight: 500;
  color: #333;
}

.product-tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.price-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.current-price {
  font-weight: bold;
  color: #ff6b6b;
  font-size: 16px;
}

.market-price {
  font-size: 12px;
  color: #999;
  text-decoration: line-through;
}

.no-image {
  width: 60px;
  height: 60px;
  background: #f5f5f5;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 12px;
}

.text-muted {
  color: #999;
}

.avatar-uploader {
  :deep(.el-upload) {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: var(--el-transition-duration-fast);
  }
  
  :deep(.el-upload:hover) {
    border-color: var(--el-color-primary);
  }
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 148px;
  height: 148px;
  text-align: center;
  line-height: 148px;
}

.avatar {
  width: 148px;
  height: 148px;
  display: block;
  object-fit: cover;
}

.editor-container {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
}

.current-stock {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>