<script setup>
import { VTCodeGroup, VTCodeGroupTab } from '../../.vitepress/theme/vue-theme-src'
import RandomKey from './RandomKey.vue'
</script>

# Docker 部署 {#docker-deploy}

::::tip Docker

Docker 是一种开源的容器化平台，旨在简化应用程序的开发、部署和运行过程。它通过将应用程序及其依赖项打包到一个轻量级、可移植的容器中，确保应用在不同环境中运行的一致性。相比传统虚拟机，Docker容器更加轻量，启动速度更快，资源利用率更高。

[安装 Docker](https://1panel.cn/)
::::

 如果已有 Docker 环境，SSH 连接到服务器，以进行后续安装步骤，**没有 Docker 环境也可以直接执行安装脚本，脚本已包含 Docker 安装部分**。

## 部署脚本 {#one-click-deploy}

执行以下安装脚本，根据命令行提示完成安装。

```bash
curl -fsSL https://gitee.com/kamyang-tech/xt-pms/raw/develop/deploy/docker-deploy.sh | sh
```

如果遇到 Docker 安装失败等问题，可以尝试运行以下脚本：

```bash
bash <(curl -sSL https://linuxmirrors.cn/docker.sh)
```
> 了解更多信息，请访问官方网站：https://linuxmirrors.cn

 ## 安装完成 {#install-complete}

 访问 `http://你的ip:9898` 进入系统，例如 `http://192.168.1.100:9898`


 ::::info 提示

遇到访问不了的情况请留意服务器端口是否开放，以及防火墙是否放行。

更多问题请前往 [常见问题](/faq/faq) 查看。

仍未解决请 [寻求帮助](/faq/faq)。
::::