<script setup lang="ts">
const props = defineProps<{
  method: string
  path: string
  perm?: string
}>()

const methodColorMap: Record<string, string> = {
  GET: '#10b981',
  POST: '#3b82f6',
  PUT: '#f59e0b',
  DELETE: '#ef4444',
  PATCH: '#8b5cf6',
  HEAD: '#6b7280',
  OPTIONS: '#6b7280'
}

const methodColor = methodColorMap[props.method.toUpperCase()] || '#6b7280'
</script>

<template>
  <div class="api-endpoint">
    <div class="api-endpoint-hd">
      <span
        class="api-method-badge"
        :style="{ backgroundColor: methodColor }"
      >{{ method.toUpperCase() }}</span>
      <code class="api-path">{{ path }}</code>
      <code v-if="perm" class="api-perm">{{ perm }}</code>
    </div>
    <div class="api-endpoint-bd">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.api-endpoint {
  margin: 0 0 12px 0;
  border-left: 3px solid var(--vp-c-divider);
  padding: 8px 12px;
  border-radius: 0 6px 6px 0;
  background: var(--vp-c-bg-soft);
  transition: border-color 0.2s;
}
.api-endpoint:hover {
  border-left-color: var(--vp-c-brand);
}

.api-endpoint-hd {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 4px;
}

.api-method-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 56px;
  height: 22px;
  padding: 0 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.5px;
  flex-shrink: 0;
}

.api-path {
  font-size: 13px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg);
  padding: 2px 8px;
  border-radius: 4px;
  word-break: break-all;
}

.api-perm {
  font-size: 11px;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg);
  padding: 2px 6px;
  border-radius: 4px;
  white-space: nowrap;
}

.api-endpoint-bd {
  font-size: 13px;
  color: var(--vp-c-text-2);
  line-height: 1.5;
  padding-left: 0;
}
</style>
