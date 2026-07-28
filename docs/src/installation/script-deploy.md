# 便捷脚本部署


::::tip 便捷安装

只需几个简单步骤，即可在您的 `Linux` 服务器上安装并运行 Xt-PMS。
::::


## 运行安装脚本 {#run-install-script}

以 `root` 用户身份运行一键安装脚本，自动完成 Xt-PMS 的下载和安装。

 ```bash
curl -fsSL https://gitee.com/kamyang-tech/xt-pms/raw/main/deploy/quick-install.sh | sudo bash
```



::::warning 重要提示

此命令/脚本仅完成 Xt-PMS 的安装，并未完成数据库的初始化，请在安装完成后，通过浏览器访问安装脚本提示的访问地址，进入系统进行数据库初始化。

换句话说，此方式需要您自行安装和配置 MySQL 数据库。

如果不想进行数据库安装配置，请参考 [Docker 部署](/installation/docker-quick) 进行安装。
::::

此方式安装需要联网，如果您需要在内网环境中离线安装和使用，请参考其他方式。

## 访问系统 {#access-system}

安装完成后， 访问 `http://你的ip:9898` 打开安装引导页面，例如 `http://192.168.1.100:9898`，开始配置 Xt-PMS，安装完成系统会自动重启进入。

::::info 提示

遇到访问不了的情况请留意服务器端口是否开放，以及防火墙是否放行。

更多问题请前往 [常见问题](/faq/faq) 查看。

仍未解决请 [寻求帮助](/faq/faq)。
::::
