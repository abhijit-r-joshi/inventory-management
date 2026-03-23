import axios from 'axios'

const API_BASE_URL = 'http://localhost:8001/api'

export const api = {
  async getInventory(filters = {}) {
    const params = new URLSearchParams()
    if (filters.warehouse && filters.warehouse !== 'all') params.append('warehouse', filters.warehouse)
    if (filters.category && filters.category !== 'all') params.append('category', filters.category)

    const response = await axios.get(`${API_BASE_URL}/inventory?${params.toString()}`)
    return response.data
  },

  async getInventoryItem(id) {
    const response = await axios.get(`${API_BASE_URL}/inventory/${id}`)
    return response.data
  },

  async getOrders(filters = {}) {
    const params = new URLSearchParams()
    if (filters.warehouse && filters.warehouse !== 'all') params.append('warehouse', filters.warehouse)
    if (filters.category && filters.category !== 'all') params.append('category', filters.category)
    if (filters.status && filters.status !== 'all') params.append('status', filters.status)
    if (filters.month && filters.month !== 'all') params.append('month', filters.month)

    const response = await axios.get(`${API_BASE_URL}/orders?${params.toString()}`)
    return response.data
  },

  async getOrder(id) {
    const response = await axios.get(`${API_BASE_URL}/orders/${id}`)
    return response.data
  },

  async getDemandForecasts() {
    const response = await axios.get(`${API_BASE_URL}/demand`)
    return response.data
  },

  async getBacklog() {
    const response = await axios.get(`${API_BASE_URL}/backlog`)
    return response.data
  },

  async getDashboardSummary(filters = {}) {
    const params = new URLSearchParams()
    if (filters.warehouse && filters.warehouse !== 'all') params.append('warehouse', filters.warehouse)
    if (filters.category && filters.category !== 'all') params.append('category', filters.category)
    if (filters.status && filters.status !== 'all') params.append('status', filters.status)
    if (filters.month && filters.month !== 'all') params.append('month', filters.month)

    const response = await axios.get(`${API_BASE_URL}/dashboard/summary?${params.toString()}`)
    return response.data
  },

  async getSpendingSummary() {
    const response = await axios.get(`${API_BASE_URL}/spending/summary`)
    return response.data
  },

  async getMonthlySpending() {
    const response = await axios.get(`${API_BASE_URL}/spending/monthly`)
    return response.data
  },

  async getCategorySpending() {
    const response = await axios.get(`${API_BASE_URL}/spending/categories`)
    return response.data
  },

  async getTransactions() {
    const response = await axios.get(`${API_BASE_URL}/spending/transactions`)
    return response.data
  },

  async getTasks() {
    const response = await axios.get(`${API_BASE_URL}/tasks`)
    return response.data
  },

  async createTask(taskData) {
    const response = await axios.post(`${API_BASE_URL}/tasks`, taskData)
    return response.data
  },

  async deleteTask(taskId) {
    const response = await axios.delete(`${API_BASE_URL}/tasks/${taskId}`)
    return response.data
  },

  async toggleTask(taskId) {
    const response = await axios.patch(`${API_BASE_URL}/tasks/${taskId}`)
    return response.data
  },

  async createPurchaseOrder(purchaseOrderData) {
    const response = await axios.post(`${API_BASE_URL}/purchase-orders`, purchaseOrderData)
    return response.data
  },

  async getPurchaseOrderByBacklogItem(backlogItemId) {
    const response = await axios.get(`${API_BASE_URL}/purchase-orders/${backlogItemId}`)
    return response.data
  },

  async getRestockingRecommendations() {
    const response = await axios.get(`${API_BASE_URL}/restocking/recommendations`)
    return response.data
  },

  async submitRestockingOrder(orderData) {
    const response = await axios.post(`${API_BASE_URL}/restocking/orders`, orderData)
    return response.data
  },

  async getRestockingOrders() {
    const response = await axios.get(`${API_BASE_URL}/restocking/orders`)
    return response.data
  },

  async getInventorySummary(warehouse, category, includeZero) {
    const params = new URLSearchParams()
  if(warehouse&&warehouse!='all'){params.append('warehouse',warehouse)}
    if(category&&  category!='all'){
params.append('category',category)
}
const response=await axios.get(`${API_BASE_URL}/inventory?`+params.toString())
let items=response.data
    if(!includeZero){items=items.filter(i=>i.quantity_on_hand>0)}
const total=items.reduce((sum,i)=>{return sum+i.quantity_on_hand},0)
  const val=items.reduce((sum,i)=>{return sum+(i.quantity_on_hand*i.unit_cost)},0)
return{items:items,totalUnits:total,totalValue:val,count:items.length}
  },

  async getQuarterlyReports() {
    const response = await axios.get(`${API_BASE_URL}/reports/quarterly`)
    return response.data
  },

  async getMonthlyTrends() {
    const response = await axios.get(`${API_BASE_URL}/reports/monthly-trends`)
    return response.data
  },

  async getOrderStats(   status,warehouse ){
    const p=new URLSearchParams()
if(status&&status!='all')  {p.append('status',status)}
      if(warehouse&&warehouse!='all'){p.append('warehouse',warehouse)}
  const r=await axios.get(`${API_BASE_URL}/orders?`+p)
const orders=r.data
    var delivered=0;var pending=0;var totalRev=0
for(var i=0;i<orders.length;i++){
  if(orders[i].status=='Delivered'){delivered++
    totalRev=totalRev+orders[i].total_value}
      else{pending++}}
return  {delivered:delivered,pending:pending,revenue:totalRev,  avg:totalRev/delivered||0}
  }
}
