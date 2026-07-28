<script setup>
import { ref } from 'vue'

const key = ref('')

function generate() {
  const bytes = new Uint8Array(48)
  crypto.getRandomValues(bytes)
  let binary = ''
  bytes.forEach(b => binary += String.fromCharCode(b))
  key.value = btoa(binary)
}

function copy() {
  navigator.clipboard.writeText(key.value)
}

generate()
</script>

<template>
  <div class="random-key-wrapper">
    <div class="key-block">
      <pre><code>{{ key }}</code></pre>
      <button class="copy-btn" @click="copy" title="复制" />
    </div>
    <button class="refresh-btn" @click="generate">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="23 4 23 10 17 10"></polyline>
        <polyline points="1 20 1 14 7 14"></polyline>
        <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"></path>
      </svg>
      重新生成
    </button>
  </div>
</template>

<style scoped>
.random-key-wrapper {
  margin: 28px 0;
}

.key-block {
  position: relative;
  background-color: #292d3e;
  border-radius: 8px;
  overflow: hidden;
  transition: background-color 0.5s;
}

.dark .key-block {
  background-color: var(--vt-c-bg-soft);
}

.key-block pre {
  position: relative;
  z-index: 1;
  margin: 0;
  padding: 14px 0;
  background: transparent;
  overflow-x: auto;
}

.key-block code {
  display: block;
  padding: 0 64px 0 24px;
  width: fit-content;
  min-width: 100%;
  font-size: 14px;
  font-family: var(--vt-font-family-mono);
  color: #a6accd;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-all;
  transition: color 0.5s;
}

.key-block:hover .copy-btn,
.key-block .copy-btn:focus {
  opacity: 1;
}

.copy-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  z-index: 3;
  display: block;
  border: none;
  border-radius: 4px;
  width: 40px;
  height: 40px;
  background-color: #292d3e;
  opacity: 0;
  cursor: pointer;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' height='20' width='20' stroke='rgba(128,128,128,1)' stroke-width='2' viewBox='0 0 24 24'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2'/%3E%3C/svg%3E");
  background-position: 50%;
  background-size: 20px;
  background-repeat: no-repeat;
  transition: opacity 0.4s;
}

.dark .copy-btn {
  background-color: var(--vt-c-bg-soft);
}

.copy-btn:hover {
  background-color: #343848;
}

.dark .copy-btn:hover {
  background-color: #2f2f2f;
}

.refresh-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  padding: 6px 14px;
  border: 1px solid var(--vt-c-divider);
  border-radius: 6px;
  background: transparent;
  color: var(--vt-c-text-2);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.refresh-btn:hover {
  border-color: var(--vt-c-brand);
  color: var(--vt-c-brand);
}
</style>
