# EdgeOne Makers + DNSPod 国内加速配置指南

> 目标：国内用户访问走腾讯云 EdgeOne Makers（免费），国外用户走 Cloudflare Pages，解决 pages.dev 国内访问慢的问题。

---

## 前置条件

1. 已有域名（如果没有，需要先买一个）
2. 域名 DNS 托管在 DNSPod（腾讯云）
3. Cloudflare Pages 项目已部署完成（当前：anges-website.pages.dev）

---

## 第一步：注册 EdgeOne Makers

1. 打开 https://edgeone.ai/zh/makers
2. 用微信/手机号登录
3. 点击"添加站点"
4. 输入你的域名（比如 `anges.dev`）
5. 选择"静态网站托管" → "导入已有站点"
6. 源站地址填：`anges-website.pages.dev`
7. 完成添加

**注意：** EdgeOne Makers 是免费套餐，每月有流量额度，个人站够用。

---

## 第二步：配置 EdgeOne 加速

1. 在 EdgeOne 控制台进入你的站点
2. 左侧菜单 → "加速" → "性能优化"
   - 开启：智能压缩、图片优化、TCP 快速打开
3. 左侧菜单 → "安全" → "HTTPS"
   - 开启：强制 HTTPS
4. 等待 EdgeOne 分配 CNAME 地址（类似 `anges.dev.edgeone.app`）

---

## 第三步：DNSPod 智能分流配置

### 3.1 把域名 DNS 迁移到 DNSPod

1. 登录 DNSPod（https://dnspod.com）
2. 添加你的域名
3. 按照提示修改域名注册商处的 DNS 服务器，改成 DNSPod 的
4. 等待 DNS 生效（几分钟到几小时）

### 3.2 配置智能解析（国内走 EdgeOne，国外走 CF Pages）

在 DNSPod 控制台添加两条记录：

| 记录类型 | 主机记录 | 解析线路 | 记录值 |
|---------|---------|---------|--------|
| CNAME | @ | 联通/移动/电信（国内） | 你在 EdgeOne 分配的 CNAME（`xxx.edgeone.app`） |
| CNAME | @ | 默认/国外 | `anges-website.pages.dev` |

**说明：**
- 国内用户（联通/移动/电信）→ 走 EdgeOne，访问快
- 国外用户 → 走 Cloudflare Pages

### 3.3 配置 www 子域名（可选）

如果需要 `www.你的域名` 也能访问，同样添加两条 www 的 CNAME 记录。

---

## 第四步：Cloudflare Pages 绑定自定义域名

1. 登录 Cloudflare Pages 控制台
2. 进入 `anges-website` 项目
3. 左侧 → "自定义域名" → "添加自定义域"
4. 输入你的域名
5. 按照提示验证（因为 DNS 在 DNSPod，需要加 TXT 记录验证）

---

## 第五步：验证效果

1. 打开 https://tool.chinaz.com/dns 或 https://www.itdog.cn/ping
2. 输入你的域名
3. 查看国内/国外解析结果：
   - 国内节点 → 应该解析到 EdgeOne 的 IP
   - 国外节点 → 应该解析到 Cloudflare 的 IP
4. 实际访问测试国内打开速度

---

## 常见问题

### Q: EdgeOne Makers 和付费版有什么区别？
A: 免费版有流量和请求数限制，个人小站完全够用。超出了再考虑升级。

### Q: 为什么不直接把 DNS 全托管到 Cloudflare？
A: Cloudflare 的免费版在国内访问不稳定（被墙/限速），所以用 DNSPod 智能分流，国内走腾讯云 EdgeOne，国外走 Cloudflare。

### Q: 配置完了还是国内慢？
A: 检查：
1. EdgeOne 是否真的加速了（看响应头有没有 `EO-*` 开头的头）
2. DNSPod 的解析线路是不是配置正确
3. DNS 缓存还没生效（等一会儿）

---

## 当前进度
- [x] Cloudflare Pages 部署完成
- [ ] 买域名
- [ ] EdgeOne Makers 添加站点
- [ ] DNSPod 智能分流配置
- [ ] Cloudflare Pages 绑定自定义域名
- [ ] 验证国内访问速度
