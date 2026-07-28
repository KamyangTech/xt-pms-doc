<script lang="ts" setup>
import { defineAsyncComponent, ref, onMounted, onUnmounted } from 'vue'
import { onKeyStroke } from '@vueuse/core'
import { useConfig } from '../composables/config'

const { config } = useConfig()

// lazy load algolia search box
const VPAlgoliaSearchBox = defineAsyncComponent(
  () => import('./VPAlgoliaSearchBox.vue')
)

// lazy load local search box from VitePress default theme
const VPLocalSearchBox = defineAsyncComponent(
  () => import('vitepress/dist/client/theme-default/components/VPLocalSearchBox.vue')
)

const metaKey = ref('Meta')

// detect search provider
const provider = config.value.search?.provider === 'local'
  ? 'local'
  : config.value.algolia
    ? 'algolia'
    : ''

// local search state
const showLocalSearch = ref(false)

// algolia search state
const algoliaLoaded = ref(false)
const algoliaTriggered = ref(false)

// search button text
const buttonText = config.value.i18n?.search ?? '搜索'

onMounted(() => {
  if (!provider) return

  // meta key detect
  metaKey.value = /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform)
    ? '⌘'
    : 'Ctrl'

  const handleSearchHotKey = (e: KeyboardEvent) => {
    if (e.key === 'k' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      if (provider === 'local') {
        showLocalSearch.value = true
      } else {
        loadAlgolia()
      }
    }
  }

  window.addEventListener('keydown', handleSearchHotKey)
  onUnmounted(() => {
    window.removeEventListener('keydown', handleSearchHotKey)
  })
})

onKeyStroke('k', (e) => {
  if (e.ctrlKey || e.metaKey) {
    e.preventDefault()
    if (provider === 'local') {
      showLocalSearch.value = true
    }
  }
})

onKeyStroke('/', (e) => {
  const element = e.target as HTMLElement
  if (element.isContentEditable || element.tagName === 'INPUT' || element.tagName === 'SELECT' || element.tagName === 'TEXTAREA') return
  e.preventDefault()
  if (provider === 'local') {
    showLocalSearch.value = true
  } else {
    loadAlgolia()
  }
})

function loadAlgolia() {
  if (!algoliaTriggered.value) {
    algoliaTriggered.value = true
  }
}

function onAlgoliaMounted() {
  algoliaLoaded.value = true
}
</script>

<template>
  <div v-if="provider" class="VPNavBarSearch">
    <!-- Local Search -->
    <template v-if="provider === 'local'">
      <VPLocalSearchBox
        v-if="showLocalSearch"
        @close="showLocalSearch = false"
      />
      <button
        type="button"
        class="DocSearch DocSearch-Button"
        :aria-label="buttonText"
        @click="showLocalSearch = true"
      >
        <span class="DocSearch-Button-Container">
          <svg
            width="20"
            height="20"
            class="DocSearch-Search-Icon"
            viewBox="0 0 20 20"
          >
            <path
              d="M14.386 14.386l4.0877 4.0877-4.0877-4.0877c-2.9418 2.9419-7.7115 2.9419-10.6533 0-2.9419-2.9418-2.9419-7.7115 0-10.6533 2.9418-2.9419 7.7115-2.9419 10.6533 0 2.9419 2.9418 2.9419 7.7115 0 10.6533z"
              stroke="currentColor"
              fill="none"
              fill-rule="evenodd"
              stroke-linecap="round"
              stroke-linejoin="round"
            ></path>
          </svg>
          <span class="DocSearch-Button-Placeholder">{{ buttonText }}</span>
        </span>
        <span class="DocSearch-Button-Keys">
          <kbd class="DocSearch-Button-Key">{{ metaKey }}</kbd>
          <kbd class="DocSearch-Button-Key">K</kbd>
        </span>
      </button>
    </template>

    <!-- Algolia Search -->
    <template v-else-if="provider === 'algolia'">
      <VPAlgoliaSearchBox
        v-if="algoliaTriggered"
        :algolia="config.algolia"
        @vue:mounted="onAlgoliaMounted"
      />
      <div v-if="!algoliaLoaded" id="docsearch" @click="loadAlgolia">
        <button
          type="button"
          class="DocSearch DocSearch-Button"
          :aria-label="buttonText"
        >
          <span class="DocSearch-Button-Container">
            <svg
              width="20"
              height="20"
              class="DocSearch-Search-Icon"
              viewBox="0 0 20 20"
            >
              <path
                d="M14.386 14.386l4.0877 4.0877-4.0877-4.0877c-2.9418 2.9419-7.7115 2.9419-10.6533 0-2.9419-2.9418-2.9419-7.7115 0-10.6533 2.9418-2.9419 7.7115-2.9419 10.6533 0 2.9419 2.9418 2.9419 7.7115 0 10.6533z"
                stroke="currentColor"
                fill="none"
                fill-rule="evenodd"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></path>
            </svg>
            <span class="DocSearch-Button-Placeholder">{{ buttonText }}</span>
          </span>
          <span class="DocSearch-Button-Keys">
            <kbd class="DocSearch-Button-Key">{{ metaKey }}</kbd>
            <kbd class="DocSearch-Button-Key">K</kbd>
          </span>
        </button>
      </div>
    </template>
  </div>
</template>

<style>
.VPNavBarSearch {
  display: flex;
  align-items: center;
  margin-left: auto;
  padding-left: 16px;
  padding-right: 16px;
}
@media (min-width: 768px) {
  .VPNavBarSearch {
    /* 搜索按钮靠右，不再占据左侧剩余空间 */
  }
}

.DocSearch {
  --docsearch-primary-color: var(--vt-c-brand);
  --docsearch-highlight-color: var(--docsearch-primary-color);
  --docsearch-text-color: var(--vt-c-text-1);
  --docsearch-muted-color: var(--vt-c-text-2);
  --docsearch-searchbox-shadow: none;
  --docsearch-searchbox-focus-background: transparent;
  --docsearch-key-gradient: transparent;
  --docsearch-key-shadow: none;
  --docsearch-modal-background: var(--vt-c-bg-soft);
  --docsearch-footer-background: var(--vt-c-bg);
}
.dark .DocSearch {
  --docsearch-modal-shadow: none;
  --docsearch-footer-shadow: none;
  --docsearch-logo-color: var(--vt-c-text-2);
  --docsearch-hit-background: var(--vt-c-bg-mute);
  --docsearch-hit-color: var(--vt-c-text-2);
  --docsearch-hit-shadow: none;
}

.dark .DocSearch-Footer {
  border-top: 1px solid var(--vt-c-divider);
}

.dark .DocSearch-Form {
  background-color: var(--vt-c-bg-mute);
}

.DocSearch-Form {
  background-color: white;
  border: 1px solid var(--vt-c-brand);
}

.DocSearch-Button-Container {
  align-items: center;
  display: flex;
}

.DocSearch-Button {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0;
  width: 48px;
  height: 55px;
  background: transparent;
}
.DocSearch-Button:hover {
  background: transparent;
}
.DocSearch-Button:focus {
  outline: 1px dotted;
  outline: 5px auto -webkit-focus-ring-color;
}
.DocSearch-Button:focus:not(:focus-visible) {
  outline: none !important;
}
@media (min-width: 768px) {
  .DocSearch-Button {
    justify-content: flex-start;
    width: auto;
    min-width: 0;
  }
}

.DocSearch-Button .DocSearch-Search-Icon {
  color: var(--vt-c-text-2);
  transition: color 0.5s;
  fill: currentColor;
  width: 18px;
  height: 18px;
  position: relative;
}
.DocSearch-Button:hover .DocSearch-Search-Icon {
  color: var(--vt-c-text-1);
}
@media (min-width: 768px) {
  .DocSearch-Button .DocSearch-Search-Icon {
    top: 1px;
    margin-right: 10px;
    width: 15px;
    height: 15px;
  }
}

.DocSearch-Button-Placeholder {
  transition: color 0.5s;
  font-size: 13px;
  font-weight: 500;
  color: var(--vt-c-text-2);
  display: none;
  padding: 0 10px 0 0;
}
.DocSearch-Button:hover .DocSearch-Button-Placeholder {
  color: var(--vt-c-text-1);
}
@media (min-width: 960px) {
  .DocSearch-Button-Placeholder {
    display: inline-block;
  }
}

.DocSearch-Button .DocSearch-Button-Keys {
  display: none;
  gap: 2px;
  min-width: auto;
  box-sizing: border-box;
  border: 1px solid var(--vt-c-text-3);
  border-radius: 4px;
  padding: 0 6px;
  font-family: inherit;
  font-size: 12px;
  height: 22px;
  line-height: 22px;
  font-weight: 500;
  transition: color 0.5s, border-color 0.5s;
}
.DocSearch-Button:hover .DocSearch-Button-Keys {
  border-color: var(--vt-c-brand-light);
}
@media (min-width: 768px) {
  .DocSearch-Button .DocSearch-Button-Keys {
    display: flex;
  }
}

.DocSearch-Button .DocSearch-Button-Key {
  width: auto;
  min-width: auto;
  font-family: inherit;
  font-size: 12px;
  height: 22px;
  padding: 0;
  margin: 0;
  color: var(--vt-c-text-3);
  transition: color 0.5s;
}
.DocSearch-Button:hover .DocSearch-Button-Key {
  color: var(--vt-c-brand-light);
}

.DocSearch-Button .DocSearch-Button-Key--pressed {
  box-shadow: none;
  transform: none;
}

/* VPLocalSearchBox CSS variable overrides
   Map VitePress default theme --vp-* variables to this custom theme's --vt-* variables */
.VPLocalSearchBox {
  --vp-c-brand-1: var(--vt-c-brand);
  --vp-c-brand-2: var(--vt-c-brand-light);
  --vp-c-brand-3: var(--vt-c-brand-dark);
  --vp-c-text-1: var(--vt-c-text-1);
  --vp-c-text-2: var(--vt-c-text-2);
  --vp-c-text-3: var(--vt-c-text-3);
  --vp-c-bg: var(--vt-c-bg);
  --vp-c-bg-alt: var(--vt-c-bg-soft);
  --vp-c-bg-soft: var(--vt-c-bg-soft);
  --vp-c-bg-mute: var(--vt-c-bg-mute);
  --vp-c-default-soft: var(--vt-c-bg-soft);
  --vp-c-divider: var(--vt-c-divider);
  --vp-c-divider-light: var(--vt-c-divider-light);
  --vp-c-white: var(--vt-c-white);
  --vp-c-black: var(--vt-c-black);

  --vp-backdrop-bg-color: rgba(0, 0, 0, 0.5);
  --vp-local-search-bg: var(--vt-c-bg);
  --vp-local-search-result-bg: var(--vt-c-bg-soft);
  --vp-local-search-result-selected-bg: var(--vt-c-bg-mute);
  --vp-local-search-result-border: var(--vt-c-bg-mute);
  --vp-local-search-result-selected-border: var(--vt-c-brand);
  --vp-local-search-highlight-bg: var(--vt-c-brand);
  --vp-local-search-highlight-text: var(--vt-c-white);
  --vp-font-family-base: var(--vt-font-family-base);
  --vp-font-family-mono: var(--vt-font-family-mono);
  --vp-screen-max-width: 1376px;
}
</style>
