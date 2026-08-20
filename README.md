# 码站先锋 Code Pioneer

码站先锋是一款以 **1v1 编程知识对战** 为核心、课程学习与开发者互助为辅助的微信小程序。项目希望把“学习、练习、对战、复盘、互助”连接成一条可持续使用的成长链路。

当前仓库包含微信小程序、NestJS 后端、PostgreSQL/Prisma 数据模型、版本化学习内容和自动化测试。后台管理端尚未实现，体验版和正式版 API 域名仍需按实际部署环境配置。

## 当前能力

| 模块 | 当前实现 |
| --- | --- |
| 用户与认证 | 微信 `wx.login` 登录、仅开发环境可见的 Mock 登录、JWT access/refresh、401 自动刷新、头像与昵称编辑 |
| Battle | 排行榜、随机匹配、好友房与邀请码、双方准备、统一倒计时、答题暂存、交卷、认输、超时结算、结果、战绩与复盘 |
| 学习 | 课程筛选与选择、课程/章节正文、账号级学习记录、章节测验、学习进度、我的课程 |
| 练习室 | 按课程选择题量、单轮不重复随机抽题、即时判题与解析、练习结果 |
| 错题中心 | 统一展示 `LEARNING`、`PRACTICE`、`BATTLE` 三种来源，支持来源筛选与详情复盘 |
| 互助社区 | 帖子列表、分类、推荐/最新/点赞/收藏/评论排序、富内容发帖、图片、代码块、评论、点赞、收藏和浏览历史 |
| 个人中心 | Battle 战绩、错题、收藏、历史、我的帖子、关注/粉丝、其他用户主页 |
| 环境隔离 | `develop`、`trial`、`release` 使用独立 API、数据库、上传存储和小程序本地登录态 |

> 当前状态不是“开箱即发布”。`miniapp/utils/public-env.ts` 中的体验版和正式版 API 仍是示例域名；正式微信登录还依赖后端 AppID/AppSecret、HTTPS API、微信公众平台合法域名和真实部署环境。

## 技术栈

- 微信小程序原生框架：TypeScript、WXML、WXSS
- Node.js + NestJS 11
- PostgreSQL + Prisma 7
- JWT access/refresh token
- Jest、Supertest
- Battle V1 使用 REST 轮询，不依赖 WebSocket 或 Redis

## 仓库结构

```text
code-pioneer/
├─ miniapp/                 微信小程序源码
│  ├─ pages/                对战、学习、互助、个人中心等页面
│  ├─ types/                小程序接口类型
│  └─ utils/                请求、认证及各业务 API 封装
├─ server/                  NestJS 后端
│  ├─ prisma/
│  │  ├─ migrations/        数据库迁移
│  │  └─ seed-data/         版本化课程与题库内容
│  ├─ scripts/              内容导入脚本
│  ├─ src/                  后端业务模块
│  └─ test/                 E2E 测试
├─ docs/                    产品、架构、测试与部署文档
├─ admin-web/               后台管理占位目录，尚未实现
├─ PROJECT_STATE.md         阶段性状态记录，部分历史结论可能滞后
├─ CHANGELOG.md             工单级变更记录
└─ DECISION_LOG.md          关键技术决策
```

小程序底部导航顺序为：**对战、学习、互助、我的**。冷启动默认页面是 Battle 首页。

## 环境要求

- Node.js 20 或更高版本，推荐使用当前 Node.js LTS
- npm
- PostgreSQL
- 微信开发者工具
- 可用的小程序 AppID；当前项目配置中的 AppID 为 `wxd46158a67a10f0c2`

仓库没有根目录 `package.json`，后端命令需要在 `server/` 中执行。

## 本地启动

### 1. 安装后端依赖

```powershell
cd server
npm install
```

已有 `package-lock.json`，需要严格按锁文件安装时也可以使用：

```powershell
npm ci
```

### 2. 配置后端环境变量

```powershell
Copy-Item .env.example .env
```

至少需要填写数据库连接和 JWT 密钥：

```dotenv
PORT=3000
NODE_ENV=development
APP_ENV=development
APP_VERSION=1.0.0-dev
DATA_NAMESPACE=code_pioneer
UPLOAD_STORAGE_ROOT=
PUBLIC_BASE_URL=http://127.0.0.1:3000
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/code_pioneer_dev?schema=code_pioneer
AUTH_MOCK_ENABLED=true
WECHAT_APP_ID=
WECHAT_APP_SECRET=
JWT_ACCESS_SECRET=replace-with-a-local-development-secret
JWT_REFRESH_SECRET=replace-with-another-local-development-secret
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=30d
```

规则：

- `.env` 已被 Git 忽略，不要提交真实密码、AppSecret 或 JWT Secret。
- 开发环境可以启用 Mock 登录。
- `trial` 和 `production` 会强制关闭 Mock 登录，并要求 HTTPS `PUBLIC_BASE_URL`、独立数据库和独立上传目录。
- 历史 migration 使用标准 `code_pioneer` schema。环境数据隔离应优先采用不同数据库，详细说明见 [环境隔离文档](docs/ENVIRONMENT_ISOLATION.md)。

### 3. 生成 Prisma Client 并执行迁移

```powershell
npm run prisma:generate
npx prisma migrate deploy --config prisma.config.ts
```

如果只在独立本地开发数据库中需要清空并重建全部数据：

```powershell
npx prisma migrate reset --force --config prisma.config.ts
```

`migrate reset` 会删除目标数据库中的现有数据，禁止对测试共享库或生产库执行。

### 4. 导入示例学习内容

```powershell
npm run seed:content
```

内容导入采用稳定业务标识和幂等 `upsert`：重复执行会更新同一课程、章节和题目，不会重复创建内容，也不会主动清除用户学习记录。

当前示例内容位于：

```text
server/prisma/seed-data/v1/python-basic.ts
```

新增课程和题目的完整流程见 [版本化 Seed Data 说明](server/prisma/seed-data/README.md)。可以提供 Markdown、纯文本、代码示例和结构化题目，再转换为版本化内容模板导入。

### 5. 启动后端

```powershell
npm run start:dev
```

健康检查：

```text
GET http://127.0.0.1:3000/api/v1/health
```

响应会包含非敏感的运行环境、数据 namespace 和应用版本信息。

### 6. 打开微信小程序

1. 打开微信开发者工具。
2. 选择“导入项目”。
3. 项目目录选择仓库中的 `miniapp/`。
4. 确认 AppID 为当前项目使用的小程序 AppID。
5. 本地开发默认请求 `http://127.0.0.1:3000/api/v1`。
6. 确认后端已启动，再进行编译。

开发阶段使用本地 HTTP 地址时，需要在微信开发者工具中按本地调试要求处理合法域名校验。体验版和正式版不能访问 localhost，必须使用已备案并在微信公众平台配置过的 HTTPS 域名。

## 登录配置

### 开发环境 Mock 登录

同时满足以下条件时，登录页会显示 Mock 登录入口：

- 小程序 `envVersion` 为 `develop`
- 后端 `AUTH_MOCK_ENABLED=true`

`trial` 和 `release` 不会显示 Mock 登录，也不能在后端开启它。

### 真实微信登录

真实链路为：

```text
wx.login
  -> POST /api/v1/auth/wechat-login
  -> 后端使用 WECHAT_APP_ID / WECHAT_APP_SECRET 换取 openid
  -> 保存 accessToken / refreshToken
```

需要保证：

- `miniapp/project.config.json` 的 AppID 与微信公众平台项目一致。
- 后端正确配置对应的 `WECHAT_APP_ID` 和 `WECHAT_APP_SECRET`。
- API 使用 HTTPS，并已配置为小程序的 `request`、`uploadFile` 和 `downloadFile` 合法域名。
- AppSecret 只能保存在服务端环境变量中，不能进入小程序源码。

## 小程序 API 环境

小程序使用 `wx.getAccountInfoSync().miniProgram.envVersion` 自动选择 API：

| 小程序环境 | 后端环境 | API 来源 |
| --- | --- | --- |
| `develop` | `development` | 默认本地地址，可使用开发期 storage 覆盖 |
| `trial` | `trial` | `miniapp/utils/public-env.ts` 的 `trialApiBaseUrl` |
| `release` | `production` | `miniapp/utils/public-env.ts` 的 `releaseApiBaseUrl` |

发布前必须把以下示例域名替换为真实公开配置：

```ts
export const PUBLIC_API_ENVIRONMENT_CONFIG = {
  trialApiBaseUrl: 'https://your-trial-api.example.com/api/v1',
  releaseApiBaseUrl: 'https://your-production-api.example.com/api/v1',
};
```

API 域名是公开配置，可以进入小程序源码；数据库密码、JWT Secret 和微信 AppSecret 不可以。

客户端会发送 `X-Client-Environment`，服务端会返回 `X-App-Environment`。显式环境不匹配时，服务端返回 `409 ENVIRONMENT_MISMATCH`，用于阻止体验版误连生产后端或正式版误连测试后端。

## 内容维护

当前没有后台课程管理系统，课程、章节正文和题目通过 `server/prisma/seed-data/` 维护。

新增或修改内容时：

1. 为课程、章节、课时和题目确定稳定的 `slug`/`key`。
2. 在新的版本目录中新增内容文件，例如 `v2/python-starter.ts`。
3. 将正文拆分为 `TEXT`、`HEADING`、`CODE`、`IMAGE`、`TIP`、`WARNING`、`EXAMPLE` 等内容块。
4. 为题目提供选项、正确答案、解析、难度、知识点和 Battle 可用状态。
5. 在 `server/prisma/seed-data/index.ts` 注册课程。
6. 执行 `npm run seed:content`。

不要因为修改标题或正文而更换稳定业务标识，否则导入器会将其识别为新内容。

## 验证与测试

在 `server/` 目录执行后端验证：

```powershell
npm run build
npm test -- --runInBand
npm run test:e2e
```

在仓库根目录执行小程序 TypeScript 检查：

```powershell
node server/node_modules/typescript/bin/tsc --noEmit -p miniapp/tsconfig.json
```

提交前建议执行：

```powershell
git diff --check
git status --short
```

按模块运行测试示例：

```powershell
cd server
npm test -- --runInBand battle practice community learning wrong-question auth
npm run test:e2e -- battle.e2e-spec.ts
```

自动化测试不能替代微信开发者工具中的双账号 Battle、真实微信登录、弱网、前后台切换和真机视觉验收。

## 关键设计约束

- Battle 服务端时间、题目快照、得分、胜负和 rating 是最终权威，前端不自行计算。
- Battle V1 使用 REST 轮询；页面隐藏或卸载时必须清理定时器。
- Battle 历史复盘读取快照，不受当前题库后续修改影响。
- 错题聚合由服务端完成，前端不跨来源自行拼接统计。
- 页面通过统一请求封装访问 API，不直接重复实现 token 管理。
- 用户上传内容位于运行时上传目录，`server/public/uploads/` 已被 Git 忽略。
- `V1.0 -> V1.1` 应通过 migration 延续生产数据，不按语义版本新建一套生产用户数据。

Battle 规则、状态机和接口边界见 [Battle V1 架构](docs/BATTLE_V1_ARCHITECTURE.md)。

## 当前限制

- 体验版和正式版 API 域名尚未替换为真实部署地址。
- 正式微信登录需要真实后端环境和微信公众平台配置，仓库不能代替这些外部条件。
- `admin-web/` 仍是占位目录，尚无课程、章节、题库、用户和社区审核后台。
- 当前学习内容主要依赖版本化 seed 导入，尚无可视化内容编辑器。
- 练习室已支持单轮不重复随机抽题，但尚未实现按用户历史错题进行概率加权。
- 章节测验和练习室当前主要支持单选/判断链路；`CODE_FILL` 的完整学习测验录入与交互仍有限制。
- 消息通知、举报审核、AI 解析等扩展能力尚未实现。
- `PROJECT_STATE.md` 保留了阶段性审计历史，其中部分旧结论可能早于当前代码；判断现状时以代码、migration、测试和最新提交为准。

## 文档索引

- [产品需求文档](docs/01-产品需求文档-PRD.md)
- [MVP 功能范围与验收清单](docs/02-MVP功能范围与验收清单.md)
- [页面与交互说明](docs/03-页面与交互说明.md)
- [数据库设计](docs/04-数据库设计.md)
- [后端接口设计](docs/05-后端接口设计.md)
- [开发规范](docs/06-Codex开发规范.md)
- [测试与验收规范](docs/08-测试与验收规范.md)
- [Sealos 部署说明](docs/09-Sealos部署说明.md)
- [Battle V1 架构](docs/BATTLE_V1_ARCHITECTURE.md)
- [环境隔离说明](docs/ENVIRONMENT_ISOLATION.md)
- [V1 剩余路线图](docs/V1_REMAINING_ROADMAP.md)

## 安全提醒

- 不提交 `server/.env`、数据库连接、微信 AppSecret、JWT Secret 或测试凭据。
- 不把 token、用户 ID 或其他敏感字段放入好友分享路径。
- 不把开发/体验环境数据复制为正式用户数据；需要推广的课程内容应通过审查后的版本化内容包导入。
- 生产 migration 和 seed 执行前必须备份数据库并核对目标环境。
