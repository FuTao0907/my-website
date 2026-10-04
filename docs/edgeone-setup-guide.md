# EdgeOne + DNSPod 国内加速配置指南（最终版）

> 目标：国内用户访问 `philia093.ink` 走腾讯云 EdgeOne（免费、国内节点快），解决 pages.dev 国内访问慢的问题。
> 最终架构：**全量解析到 EdgeOne → 回源 Cloudflare Pages**（不再做国外/国内分流，原因见 ISSUE-014）。

---

## 最终架构

```
用户访问 philia093.ink
  └─ DNSPod：@ CNAME → philia093.ink.eo.dnse3.com（EdgeOne，全线路统一）
        └─ EdgeOne 加速域名 philia093.ink（香港/亚太节点，全球加速）
              └─ 回源 Host = anges-website.pages.dev（Cloudflare Pages）
```

- DNS 权威解析 + 线路：**DNSPod**（腾讯云）
- 加速 + HTTPS + 边缘防护：**EdgeOne**（腾讯云，免费套餐永久有效，免费证书自动续期）
- 源站托管：**Cloudflare Pages**（免费）

---

## 前置条件

1. 域名（当前：`philia093.ink`，注册在腾讯云）
2. 域名 DNS 托管在 DNSPod（NS: `eileen.dnspod.net` / `present.dnspod.net`）
3. Cloudflare Pages 项目已部署（`anges-website.pages.dev`，GitHub 自动部署）

---

## 关键配置（已完成的最终形态）

### EdgeOne 站点

- 站点：`philia093.ink`（zone-3vrzc7il4lar，免费套餐，CNAME 接入）
- EdgeOne 分配 CNAME：`philia093.ink.eo.dnse3.com`
- 域名所有权验证：DNSPod 添加 TXT `edgeonereclaim`（已通过，Activated）
- 源站设置（Origin settings）：
  - 源站地址：`anges-website.pages.dev`
  - **源主机头（Host Header）：必须选"使用源域名"**（= anges-website.pages.dev）
    - ⚠️ 若用默认的"使用加速域名称"，Cloudflare Pages 会返回 409（见 ISSUE-013）
- HTTPS：免费证书（Let's Encrypt，90 天自动续期），申请验证需等 DNS 全量指向 EdgeOne（见 ISSUE-014）

### DNSPod 记录（合并后最终 2 条）

| 主机记录 | 类型 | 记录值 | 线路 |
|---------|------|--------|------|
| @ | CNAME | philia093.ink.eo.dnse3.com | 默认 |
| edgeonereclaim | TXT | reclaim-... | 默认 |

> 不需要 www 记录（站点未启用 www 子域）；所有线路统一走 EdgeOne。

---

## 踩过的坑（务必避免重犯）

1. **回源 Host 不匹配 → 409**（ISSUE-013）：EdgeOne 回源 Cloudflare Pages 这类"只认绑定域名"的源站，源主机头必须设为源站域名，不能用加速域名。
2. **分线路解析 → 免费证书验证失败**（ISSUE-014）：Let's Encrypt 验证服务器在北美，DNSPod 分线路时"默认"线路必须也指向 EdgeOne，否则 CA 访问不到验证文件。最终干脆全量统一指向 EdgeOne，不做分流。

---

## 验证方法

```powershell
# 1. DNS 解析链路
Resolve-DnsName philia093.ink          # 应显示 CNAME → philia093.ink.eo.dnse3.com
Resolve-DnsName philia093.ink.eo.dnse3.com  # 应解析出 EdgeOne IP（43.x.x.x）

# 2. HTTP 访问
curl.exe -s -D - -o NUL http://philia093.ink  # 200 + EO-* 响应头 = 正常

# 3. HTTPS（证书签发后）
curl.exe -s -o NUL -w "%{http_code}" https://philia093.ink  # 200
```

在线工具：https://www.itdog.cn/ping 查看各地连通性。

---

## 后续扩展（子域名加新站）

1. EdgeOne 控制台 → 域名服务 → 添加子域名（如 `blog.philia093.ink`），独立配置源站
2. EdgeOne 分配该子域专属 CNAME
3. DNSPod 加一条：`blog` CNAME → 该子域 CNAME
4. 等验证 + 免费证书自动签发

免费套餐支持 200 个子域名，每个子域独立证书、独立源站，主域不受影响。

---

## 当前进度

- [x] Cloudflare Pages 部署完成（anges-website.pages.dev）
- [x] 域名 philia093.ink（腾讯云注册 + DNSPod 托管）
- [x] EdgeOne 添加站点 + 域名验证通过（Activated）
- [x] 源站设置（源站 + 回源 Host = 源域名）
- [x] DNSPod 合并为全量 EdgeOne CNAME（2 条记录）
- [ ] EdgeOne 免费证书签发完成 → 验证 https://philia093.ink
