# 部署说明

Creator Stack Checkup 是一个纯静态 Vite 应用，推荐部署到 Cloudflare Pages。

## GitHub

先把项目推到 GitHub：

```bash
git remote -v
git push
```

## Cloudflare Pages

在 Cloudflare Pages 新建项目，选择 GitHub 仓库，然后使用这些配置：

```text
Framework preset: Vite
Build command: npm run build
Build output directory: dist
```

不需要环境变量。

## 为什么第一版不需要 Workers / D1 / Cron

第一版是 local-first：

- 数据存在浏览器 localStorage。
- 提醒通过日历文件、日历链接、邮件链接和短信链接完成。
- PWA 由静态资源和 service worker 支持。

只有未来做云同步、服务器邮件提醒、短信提醒或账号系统时，才需要 Workers、D1、KV 或 Cron。

## 部署后检查

部署完成后检查：

- 首页能打开。
- 刷新后数据仍保留在同一个浏览器。
- 手机端底部导航可用。
- 添加到主屏幕后能像 PWA 一样打开。
- JSON 导出和导入可用。
- 日历、邮件、短信提醒链接能打开对应应用。
