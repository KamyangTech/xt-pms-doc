---
footer: false
---

<script setup>
import { VTCodeGroup, VTCodeGroupTab } from '../../.vitepress/theme/vue-theme-src'
</script>

# 快速上手 {#quick-start}

:::danger 提示

本系统目前处于测试试运行阶段，部署环境严禁直接对公网开放访问；各类核心生产业务数据、涉密经营资料，切勿仅单独留存至本系统内，务必同步做好异地备份与离线归档。

官方仓库版本无后台静默采集、无隐性数据抓取、无私自窃取用户信息，建议内网私有化部署。
:::


## 在线尝试  {#online-demo}

想要快速体验 Xt-PMS，您可以直接试试我们的 [在线示例](https://xt-pms.vercel.app/login)。

:::info 测试账号密码

- 管理员账户：admin/admin123
- 普通用户账户：user/user123
:::

推荐浏览器（以下版本或更高）

<ClientOnly>
<TechStack :items="[
  { name: 'Chrome', logo: '/images/tech-logos/chrome.svg', desc: 'Chrome 80+' },
  { name: 'Firefox', logo: '/images/tech-logos/firefox.svg', desc: 'Firefox 74+' },
  { name: 'Safari', logo: '/images/tech-logos/safari.svg', desc: 'Safari 13.1+' },
  { name: 'Edge', logo: '/images/tech-logos/edge.svg', desc: 'Edge 80+' },
]"/>
</ClientOnly>

## 安装  Xt-PMS {#install-vue-pms}

:::tip 前提条件

- 本地服务器/云服务器，推荐使用 [Ubuntu 22](https://ubuntu.com/download/desktop) 等主流 Linux 发行版
- 建议最低配置 1C 2G，推荐 2C 4G，硬盘 40G 以上，网络带宽 3M 及以上
- 客户端建议使用 [Chrome](https://www.google.com/intl/zh-CN/chrome/) 浏览器
:::

本系统提供以下几种安装方式，请根据您的实际环境选择合适的方式：

- [Docker 部署（推荐）](/installation/docker-quick)
- [1Panel 快速部署](/installation/1panel-quick)
- [便捷脚本部署](/installation/script-deploy)
- [宝塔快速部署](/installation/baota-quick)
- [编译部署](/installation/linux-quick)

当然，如果您对 Go 以及 Vue 有一定的了解，也可以自行编译 [项目源码](https://gitee.com/kamyang-tech/xt-pms) 安装。
