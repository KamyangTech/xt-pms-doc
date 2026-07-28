<script setup lang="ts">
defineProps<{
  items: Array<{
    name: string
    logo: string
    desc: string
    color?: string
  }>
}>()
</script>

<template>
  <div class="tech-stack">
    <div
      v-for="item in items"
      :key="item.name"
      class="tech-card"
    >
      <div class="tech-logo" :style="item.color ? { backgroundColor: item.color } : {}">
        <img :src="item.logo" :alt="item.name" loading="lazy" />
      </div>
      <div class="tech-info">
        <span class="tech-name">{{ item.name }}</span>
        <span class="tech-desc">{{ item.desc }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tech-stack {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 16px;
  margin: 24px 0;
}

.tech-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 20px 16px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
  transition: all 0.3s ease;
}

.tech-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  border-color: var(--vp-c-brand-1);
}

.tech-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  border-radius: 12px;
  overflow: hidden;
}

.tech-logo img {
  width: 64px;
  height: 64px;
  object-fit: contain;
}

.tech-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.tech-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.tech-desc {
  font-size: 12px;
  color: var(--vp-c-text-2);
  text-align: center;
  line-height: 1.4;
}

@media (max-width: 640px) {
  .tech-stack {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .tech-card {
    padding: 16px 12px;
  }

  .tech-logo {
    width: 64px;
    height: 64px;
  }

  .tech-logo img {
    width: 48px;
    height: 48px;
  }
}
</style>
