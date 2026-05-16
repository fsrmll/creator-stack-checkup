# Creator Stack Checkup 订阅体检

[English README](README.md)

这是一个本地优先的 PWA 网页工具，用来检查 AI 工具、设计工具、主机、邮件营销、素材库、平台费用等创作者订阅，避免每月订阅成本失控。

第一版的原则很明确：

- 不需要注册
- 不需要后端
- 不连接银行卡
- 不收集邮箱或手机号
- 不保存 SMTP 密码
- 数据只保存在用户自己的浏览器 localStorage

## 它能做什么

- 添加 AI、设计、视频、主机、邮件、市场平台等订阅工具。
- 立即看到每月支出、年化成本、30 天内续费金额和潜在节省金额。
- 自动给每个工具打标签：保留、复盘、降级、可取消。
- 识别同分类重复工具、低使用高成本工具、快续费工具。
- 生成无后端提醒：`.ics` 日历文件、Google Calendar、Outlook、邮件链接、短信链接。
- 支持 JSON 备份/导入和 CSV 导出。
- 支持安装为 PWA，适合手机打开和添加到主屏幕。

## 它不做什么

- 不自动发送邮件。
- 不要求用户填写 SMTP 密码。
- 不从服务器发送短信。
- 不自动取消订阅。
- 不读取银行或邮箱数据。
- 不做账号系统和跨设备同步。

## 使用方式

1. 打开网页。
2. 点击“添加订阅”，填写工具名称、价格、计费周期、分类、使用频率、业务价值和下次续费日期。
3. 在费用概览里查看每月支出、年化成本和可节省金额。
4. 在智能建议里查看重复订阅、可降级项和可取消候选项。
5. 在提醒中心给快续费工具生成日历、邮件或短信提醒。
6. 每月回来重新体检一次。

## 本地开发

```bash
npm install
npm run dev
```

## 测试和构建

```bash
npm test
npm run build
```

## Cloudflare Pages 部署

把仓库推到 GitHub 后，在 Cloudflare Pages 里连接该仓库。

```text
Framework preset: Vite
Build command: npm run build
Build output directory: dist
```

第一版是纯静态站点，不需要 Workers、D1、KV、Cron，也不需要环境变量。

## 文档

- [产品使用回路](docs/product-loop.zh-CN.md)
- [提醒策略](docs/reminder-strategy.zh-CN.md)
- [变现方向](docs/monetization.zh-CN.md)
- [部署说明](docs/deployment.zh-CN.md)

## License

MIT
