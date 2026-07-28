import fs from 'fs'
import path from 'path'
import {
  defineConfigWithTheme,
  type HeadConfig,
  type Plugin
} from 'vitepress'
import type { Config as ThemeConfig } from './theme/vue-theme-src'
import llmstxt from 'vitepress-plugin-llms'
import baseConfig from './theme/vue-theme-src/vitepress/config/baseConfig'
// import { textAdPlugin } from './textAdMdPlugin'
import { apiTablePlugin } from './theme/apiTablePlugin'
import {
  groupIconMdPlugin,
  groupIconVitePlugin
} from 'vitepress-plugin-group-icons'
import lightbox from 'vitepress-plugin-lightbox'

const nav: ThemeConfig['nav'] = [
  {
    text: '文档',
    activeMatch: `^/(guide|style-guide|cookbook)/`,
    items: [
      {
        text: '指南',
        items: [
          { text: '项目简介', link: '/guide/introduction' },
          { text: '快速上手', link: '/guide/quick-start' },
          { text: '更新日志', link: '/guide/changelog' },
          { text: '更新教程', link: '/guide/update' },

          // { text: '风格指南', link: '/style-guide/' },
        ]
      },
      {
        text: '快速部署',
        items: [
          { text: 'Docker 部署（推荐）', link: '/installation/docker-quick' },
          { text: '1Panel 快速部署', link: '/installation/1panel-quick' },
          { text: '便捷脚本部署', link: '/installation/script-deploy' },
          { text: '宝塔快速部署', link: '/installation/baota-quick' },
          { text: '编译部署', link: '/installation/linux-quick' }
        ]
      },
      {
        text: 'API 接口',
        items: [
          { text: '接口文档', link: '/api/' }
        ]
      }
    ]
  },
  {
    text: '参考',
    activeMatch: `^/(glossary|error-reference)/`,
    items: [
      { text: '术语表', link: '/glossary/' },
      { text: '错误码参照表', link: '/error-reference/' }
    ]
  },
  {
    text: '关于',
    activeMatch: `^/(about|project)/`,
    items: [
      { text: '贡献者公约行为准则', link: '/project/code-of-conduct' },
      { text: '贡献指南', link: '/project/contributing' }
    ]
  },
]

const guideSidebar = [
  {
    text: '开始',
    items: [
      { text: '项目简介', link: '/guide/introduction' },
      { text: '快速上手', link: '/guide/quick-start' },
      { text: '更新日志', link: '/guide/changelog' },
      { text: '更新教程', link: '/guide/update' },
      { text: '许可证', link: '/about/license' }
    ]
  },
  {
    text: '快速部署',
    items: [
      { text: 'Docker 部署（推荐）', link: '/installation/docker-quick' },
      { text: '1Panel 快速部署', link: '/installation/1panel-quick' },
      { text: '便捷脚本部署', link: '/installation/script-deploy' },
      { text: '宝塔快速部署', link: '/installation/baota-quick' },
      { text: '编译部署', link: '/installation/linux-quick' }
    ]
  },
  {
    text: '常见问题',
    items: [
      { text: '常见问题', link: '/faq/faq' }
    ]
  },
  {
    text: '项目操作',
    items: [
      { text: '开发与构建', link: '/project/build-and-dev' },
      { text: '测试指引', link: '/installation/test-guide' }
    ]
  }
]

export const sidebar: ThemeConfig['sidebar'] = {
  '/guide/': guideSidebar,
  '/installation/': guideSidebar,
  '/about/': guideSidebar,
  '/faq/': guideSidebar,
  '/project/': guideSidebar
}

const i18n: ThemeConfig['i18n'] = {
  menu: '菜单',
  toc: '本页目录',
  returnToTop: '返回顶部',
  appearance: '外观',
  previous: '前一篇',
  next: '下一篇',
  pageNotFound: '页面未找到',
  deadLink: {
    before: '您打开了一个不存在的链接：',
    after: '。'
  },
  deadLinkReport: {
    before: '不介意的话请提交到',
    link: '这里',
    after: '，我们会跟进修复。'
  },
  footerLicense: {
    before: '',
    after: ''
  },
  ariaAnnouncer: {
    before: '',
    after: '已经加载完毕'
  },
  ariaDarkMode: '切换深色模式',
  ariaSkipToContent: '直接跳到内容',
  ariaToC: '当前页面的目录',
  ariaMainNav: '主导航',
  ariaMobileNav: '移动版导航',
  ariaSidebarNav: '侧边栏导航'
}

function inlineScript(file: string): HeadConfig {
  return [
    'script',
    {},
    fs.readFileSync(
      path.resolve(__dirname, `./inlined-scripts/${file}`),
      'utf-8'
    )
  ]
}

export default defineConfigWithTheme<ThemeConfig>({
  extends: baseConfig,

  sitemap: {
    hostname: 'https://doc.pms.xintest.cn'
  },

  lang: 'zh-CN',
  title: 'Xt-PMS',
  description: 'Xt-PMS - 小微模具注塑企业专用生产管理系统',
  srcDir: 'src',
  srcExclude: [],
  outDir: '../dist',

  head: [
    ['meta', { name: 'theme-color', content: '#0052D9' }],
    ['meta', { property: 'og:url', content: 'https://doc.pms.xintest.cn/' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: 'Xt-PMS' }],
    [
      'meta',
      {
        property: 'og:description',
        content: 'Xt-PMS - 小微模具注塑企业专用生产管理系统'
      }
    ],
    [
      'meta',
      {
        property: 'og:image',
        content: 'https://doc.pms.xintest.cn/logo.svg'
      }
    ],
    ['meta', { name: 'twitter:card', content: 'summary' }],
    inlineScript('restorePreference.js')
  ],

  themeConfig: {
    nav,
    sidebar,
    i18n,
    logo: '/logo.svg',

    search: {
      provider: 'local'
    },

    socialLinks: [
      { icon: 'github', link: 'https://gitee.com/kamyang-tech/xt-pms' }
    ],

    editLink: {
      repo: 'KamyangTech/xt-pms',
      text: '在 GitHub 上编辑此页'
    },

    footer: {
      license: {
        text: 'Xt-PMS 源码采用 AGPL v3 许可',
        link: 'https://gitee.com/kamyang-tech/xt-pms'
      }
    }
  },

  markdown: {
    theme: 'github-dark',
    config(md) {
      md.use(groupIconMdPlugin)
      md.use(lightbox)
      md.use(apiTablePlugin)
      // .use(textAdPlugin)
    }
  },

  vite: {
    define: {
      __VUE_OPTIONS_API__: false
    },
    optimizeDeps: {
      include: ['gsap', 'dynamics.js'],
      exclude: ['@vue/repl']
    },
    // @ts-ignore
    ssr: {
      external: ['@vue/repl']
    },
    server: {
      host: true,
      fs: {
        // for when developing with locally linked theme
        allow: ['../..']
      }
    },
    build: {
      chunkSizeWarningLimit: Infinity
    },
    json: {
      stringify: true
    },
    plugins: [
      llmstxt({
        ignoreFiles: [
          'developers/**/*',
          'index.md'
        ],
        customLLMsTxtTemplate: `\
# xt-pms

xt-pms - 小微模具注塑企业专用生产管理系统

## Table of Contents

{toc}`
      }) as Plugin,
      groupIconVitePlugin({
        customIcon: {
          cypress: 'vscode-icons:file-type-cypress',
          'testing library': 'logos:testing-library'
        }
      }) as Plugin
    ]
  }
})
