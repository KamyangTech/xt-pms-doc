<script setup lang="ts">
import { VTLink } from '../vue-theme-src'

// 站点地图：精选常用入口，保持简洁
const items = [
  {
    text: '文档',
    items: [
      { text: '项目简介', link: '/guide/introduction' },
      { text: '快速上手', link: '/guide/quick-start' },
      { text: 'Docker 部署（推荐）', link: '/installation/docker-quick' },
      { text: 'API 接口', link: '/api/' }
    ]
  },
  {
    text: '参考',
    items: [
      { text: '术语表', link: '/glossary/' },
      { text: '错误码参照表', link: '/error-reference/' }
    ]
  },
  {
    text: '关于',
    items: [
      { text: '贡献者公约行为准则', link: '/project/code-of-conduct' },
      { text: '贡献指南', link: '/project/contributing' }
    ]
  }
]
</script>

<template>
  <section id="sitemap">
    <div class="container">
      <div class="sitemap-col" v-for="col in items" :key="col.text">
        <h4>{{ col.text }}</h4>
        <ul>
          <li v-for="row in col.items" :key="row.text">
            <VTLink :href="row.link">{{ row.text }}</VTLink>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<style>
#sitemap {
  background: var(--vt-c-bg-soft);
}

#sitemap .container {
  max-width: 900px;
  margin: 0 auto;
  columns: 1;
  padding: 24px 32px;
}

@media (min-width: 768px) {
  #sitemap .container {
    columns: 2;
  }
}

@media (min-width: 1024px) {
  #sitemap .container {
    columns: 3;
  }
}

#sitemap h4 {
  font-weight: 500;
  color: var(--vt-c-text-1);
  margin-bottom: 0.5em;
}

.sitemap-col {
  margin-bottom: 2em;
  break-inside: avoid;
}

#sitemap .vt-link {
  font-size: 0.9em;
  color: var(--vt-c-text-2);
}

#sitemap .vt-link:hover {
  color: var(--vt-c-text-1);
}
</style>
