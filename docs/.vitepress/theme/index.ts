import './styles/index.css'
import { h, onMounted, watch, nextTick } from 'vue'
import { VPTheme } from './vue-theme-src'
import TechStack from './components/TechStack.vue'
import ApiEndpoint from './components/ApiEndpoint.vue'
import mediumZoom from 'medium-zoom'
import { useRoute } from 'vitepress'

import 'vitepress/dist/client/theme-default/styles/components/vp-code-group.css'
import 'virtual:group-icons.css'

export default Object.assign({}, VPTheme, {
  Layout: () => {
    // @ts-ignore
    return h(VPTheme.Layout, null, {
      'navbar-title': () => [
        h('img', {
          class: 'logo',
          src: '/logo.svg',
          alt: 'Xt-PMS',
          style: 'height: 24px; vertical-align: middle; margin-right: 6px;'
        }),
        h('span', { class: 'navbar-title' }, 'Xt-PMS')
      ],

    })
  },
  enhanceApp({ app }: { app: any }) {
    app.component('TechStack', TechStack)
    app.component('ApiEndpoint', ApiEndpoint)
  },
  setup() {
    const route = useRoute()
    const initZoom = () => {
      mediumZoom('[data-zoomable]', { background: 'var(--vp-c-bg)' })
    }
    onMounted(() => initZoom())
    watch(() => route.path, () => nextTick(initZoom))
  }
})
