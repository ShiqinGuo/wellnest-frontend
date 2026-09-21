# Wellnest Frontend

独立的 React + TypeScript + Vite 前端。后端：`wellnest-backend`。支持中文/英文、分步测评、恢复进度、生活画像、预测看板和异步模拟支付。

## 开发与构建

```bash
npm ci
npm run dev
npm run build
```

开发地址 `http://127.0.0.1:5174`，`/api` 默认代理到 `http://127.0.0.1:18090`。先按后端 README 启动 PostgreSQL 和 Python Worker。可用 API_PROXY_TARGET 改开发代理。

## Cloudflare 部署

`wrangler.jsonc` 保留原 `wellnest-assessment` 名称与 URL。静态资源直接托管；API、健康检查和文档路径通过 `BACKEND` 服务绑定转发到独立后端 `wellnest-backend`。转发保留 Cookie、请求正文及响应流，前端不存储数据库或支付密钥。

先验证后端已部署，再执行 `npm run deploy`。本地构建检查使用 `npm run deploy:check`；不会发布。后端支付契约未因队列替换而改变。

仅前端构建和翻译契约检查不需要 Python、数据库或后端仓库。

## 支付

原 `/pay` 已删除。前端创建 `/api/payments` 后等待渠道收银台就绪，用户的“模拟支付并解锁”操作确认 Mock 付款，再等待服务端确认成功，最后刷新结果。界面不会根据渠道收银台返回直接认定会员已开通。

暂时超时保留错误和重试入口；创建请求保留幂等键。已有 pending 支付可以继续，重放返回创建快照后通过 GET 获取最新状态。正式支付渠道接入时替换模拟收银台确认动作即可。

服务端确认支付成功后立即关闭支付弹窗，直接刷新当前评估的会员结果，不再依赖 session 重载。结果读取暂时失败会自动重试；仍失败时提供“重新加载已解锁评估”，只重读结果，不重新创建支付。`e2e/payment-refresh.spec.ts` 验证自动恢复与手动恢复，并断言支付仅创建一次；这两条回归使用 API Mock，可独立于后端运行，已加入每次 push 的 CI。

## 契约管理

`src/generated` 是后端版本化导出物，提交在本仓库内，不手工修改。

```bash
# 指定后端 contracts 目录；或使用指向固定 commit 的 HTTPS 目录 URL
npm run contract:sync -- ../wellnest-backend/contracts
npm run contract:check
```

同步脚本验证 manifest 中每份导出物的 SHA256 后才写入。包括 DTO、OpenAPI 和翻译规则样本；npm build 只校验已固定的快照，不联网取最新版本。

## 测试

```bash
npm test
```

浏览器测试需要启动后端支付环境和前端 dev server。默认桌面；可用 E2E_BASE_URL 指定其他环境。覆盖完整问卷、中英文切换、恢复进度、支付请求响应丢失后的重试，以及免费/会员看板。所有与服务端规则相关的翻译测试读取导出的样本，不执行 Python。

生产静态产物在 `dist/`；仓库拆分不自动替换原来的 Cloudflare 线上站点。

CI 的 Frontend quality 独立执行构建和翻译契约检查，不需要后端。Browser integration 接受已部署的前端测试 URL，按需执行完整桌面流程。
