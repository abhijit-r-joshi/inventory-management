<template>
  <div class="restocking">
    <div class="page-header">
      <h2>Restocking Planner</h2>
      <p>Set your budget and review AI-recommended items to restock based on demand forecasts.</p>
    </div>

    <div
      v-if="successBanner"
      class="success-banner"
    >
      <span>{{ successBanner }}</span>
      <button class="dismiss-btn" @click="successBanner = null">&#10005;</button>
    </div>

    <div class="card budget-card">
      <div class="card-header">
        <h3 class="card-title">Available Budget</h3>
      </div>
      <div class="budget-body">
        <div class="budget-display">
          <span class="budget-value">{{ formatCurrency(budget) }}</span>
        </div>
        <input
          v-model.number="budget"
          type="range"
          min="0"
          max="50000"
          step="500"
          class="budget-slider"
        />
        <p class="budget-note">Drag to adjust your restocking budget</p>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Recommendations</h3>
      </div>

      <div v-if="loading" class="loading">Loading recommendations...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <div v-else>
        <div v-if="recommendedItems.length === 0" class="empty-state">
          Increase your budget to see recommendations.
        </div>
        <div v-else>
          <div class="summary-line">
            {{ recommendedItems.length }} items recommended
            &middot; Total cost: {{ formatCurrency(recommendedTotal) }}
            &middot; Remaining budget: {{ formatCurrency(remainingBudget) }}
          </div>
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Item Name</th>
                  <th>Warehouse</th>
                  <th>Category</th>
                  <th>Forecasted Demand</th>
                  <th>Unit Cost</th>
                  <th>Total Cost</th>
                  <th>Trend</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in recommendedItems" :key="item.item_sku">
                  <td><strong>{{ item.item_sku }}</strong></td>
                  <td>{{ item.item_name }}</td>
                  <td>{{ item.warehouse }}</td>
                  <td>{{ item.category }}</td>
                  <td>{{ item.forecasted_demand }}</td>
                  <td>${{ item.unit_cost.toFixed(2) }}</td>
                  <td><strong>${{ item.total_cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</strong></td>
                  <td>
                    <span :class="['badge', item.trend]">{{ item.trend }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="actions-row">
          <button
            class="place-order-btn"
            :disabled="recommendedItems.length === 0 || submitting"
            @click="placeOrder"
          >
            {{ submitting ? 'Placing Order...' : 'Place Order' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { api } from '../api'

export default {
  name: 'Restocking',
  setup() {
    const loading = ref(true)
    const error = ref(null)
    const allRecommendations = ref([])
    const budget = ref(10000)
    const submitting = ref(false)
    const successBanner = ref(null)

    const recommendedItems = computed(() => {
      if (budget.value <= 0) return []
      let running = 0
      const selected = []
      for (const item of allRecommendations.value) {
        if (running + item.total_cost <= budget.value) {
          running += item.total_cost
          selected.push(item)
        }
      }
      return selected
    })

    const recommendedTotal = computed(() => {
      return recommendedItems.value.reduce((sum, item) => sum + item.total_cost, 0)
    })

    const remainingBudget = computed(() => {
      return budget.value - recommendedTotal.value
    })

    const formatCurrency = (value) => {
      return '$' + value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })
    }

    const loadRecommendations = async () => {
      loading.value = true
      error.value = null
      try {
        allRecommendations.value = await api.getRestockingRecommendations()
      } catch (err) {
        error.value = 'Failed to load recommendations: ' + err.message
      } finally {
        loading.value = false
      }
    }

    const placeOrder = async () => {
      if (recommendedItems.value.length === 0 || submitting.value) return
      submitting.value = true
      try {
        const orderData = {
          items: recommendedItems.value.map(item => ({
            sku: item.item_sku,
            name: item.item_name,
            quantity: item.forecasted_demand,
            unit_cost: item.unit_cost
          })),
          budget: budget.value
        }
        const result = await api.submitRestockingOrder(orderData)
        successBanner.value = `Order ${result.order_number} submitted successfully! Expected delivery: ${result.expected_delivery}. Navigate to the Orders tab to track it.`
      } catch (err) {
        error.value = 'Failed to place order: ' + err.message
      } finally {
        submitting.value = false
      }
    }

    onMounted(loadRecommendations)

    return {
      loading,
      error,
      budget,
      submitting,
      successBanner,
      recommendedItems,
      recommendedTotal,
      remainingBudget,
      formatCurrency,
      placeOrder
    }
  }
}
</script>

<style scoped>
.restocking {
  padding-bottom: 2rem;
}

.page-header {
  margin-bottom: 1.5rem;
}

.page-header h2 {
  font-size: 1.875rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 0.375rem;
  letter-spacing: -0.025em;
}

.page-header p {
  color: #64748b;
  font-size: 0.938rem;
}

.success-banner {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  background: #d1fae5;
  border: 1px solid #6ee7b7;
  color: #065f46;
  padding: 1rem 1.25rem;
  border-radius: 10px;
  margin-bottom: 1.25rem;
  font-size: 0.9rem;
  font-weight: 500;
  line-height: 1.5;
}

.dismiss-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  color: #065f46;
  font-size: 1rem;
  line-height: 1;
  padding: 0;
  flex-shrink: 0;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.dismiss-btn:hover {
  opacity: 1;
}

.budget-card .card-header {
  padding-bottom: 0.875rem;
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 0;
}

.budget-body {
  padding: 1.5rem 0 0.5rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.75rem;
}

.budget-display {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}

.budget-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.025em;
}

.budget-slider {
  width: 100%;
  max-width: 500px;
  -webkit-appearance: none;
  appearance: none;
  height: 6px;
  border-radius: 3px;
  background: #e2e8f0;
  outline: none;
  cursor: pointer;
  transition: background 0.2s;
}

.budget-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #2563eb;
  cursor: pointer;
  box-shadow: 0 1px 4px rgba(37, 99, 235, 0.4);
  transition: background 0.2s, box-shadow 0.2s;
}

.budget-slider::-webkit-slider-thumb:hover {
  background: #1d4ed8;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.5);
}

.budget-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #2563eb;
  cursor: pointer;
  border: none;
  box-shadow: 0 1px 4px rgba(37, 99, 235, 0.4);
}

.budget-note {
  font-size: 0.813rem;
  color: #94a3b8;
  font-style: italic;
}

.empty-state {
  padding: 2rem;
  text-align: center;
  color: #94a3b8;
  font-size: 0.9rem;
  font-style: italic;
}

.summary-line {
  padding: 0.75rem 0 1rem;
  font-size: 0.875rem;
  color: #475569;
  font-weight: 500;
}

.actions-row {
  padding-top: 1.25rem;
  display: flex;
  justify-content: flex-start;
}

.place-order-btn {
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 2rem;
  font-size: 0.938rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, box-shadow 0.2s;
}

.place-order-btn:hover:not(:disabled) {
  background: #1d4ed8;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

.place-order-btn:disabled {
  background: #cbd5e1;
  color: #94a3b8;
  cursor: not-allowed;
}

.loading {
  padding: 2rem;
  text-align: center;
  color: #64748b;
}

.error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #991b1b;
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
  font-size: 0.938rem;
}
</style>
