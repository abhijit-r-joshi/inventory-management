import { ref, watch } from 'vue'

const STORAGE_KEY = 'ims-dark-mode'

// Singleton: read initial preference from localStorage, fallback to light
const isDark = ref(localStorage.getItem(STORAGE_KEY) === 'true')

// Apply theme attribute to <html> immediately on module load
function applyTheme(dark) {
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
}

applyTheme(isDark.value)

// Keep DOM in sync whenever the ref changes
watch(isDark, (value) => {
  applyTheme(value)
  localStorage.setItem(STORAGE_KEY, String(value))
})

export function useDarkMode() {
  const toggleDark = () => {
    isDark.value = !isDark.value
  }

  return {
    isDark,
    toggleDark
  }
}
