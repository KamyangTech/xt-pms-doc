# 常见问题 {#frequently-asked-questions}

## 忘记密码 {#forget-password}

### 1Panel/宝塔/裸机部署 {#1panel-baota}

打开 GO 终端，执行以下命令

```bash
./xt-pms reset-password
```

---

### Docker 部署 {#docker}

打开 Docker 终端，执行以下命令

```bash
docker exec -it xt-pms-server ./pms-server reset-password
```