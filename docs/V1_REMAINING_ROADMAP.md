# CP-010 审计结论、CP-011A/CP-011B/CP-011C/CP-011D Battle 基线与 V1 剩余路线图

更新日期：2026-07-25

## 1. 结论摘要

- 当前仓库已经形成一条“公开课程浏览 + 登录基础 + 学习中心读取 + 错题中心读取”的半闭环。
- 当前仓库尚未形成“新用户从课程学习到小测再到错题生成”的完整小程序闭环。
- Battle 已完成 V1 产品规则、状态机、Prisma 模型草案、REST API 草案与页面规划冻结，正式基线文档为 `docs/BATTLE_V1_ARCHITECTURE.md`。
- Battle 是“码站先锋”的核心产品亮点，`CP-011B` 已完成 Battle 数据模型、迁移、Prisma Client 与基础领域服务落地，`CP-011C` 已完成随机匹配、好友邀请与房间基础查询，`CP-011D` 已完成 ready、COUNTDOWN、题目快照、题目下发与单题提交后端能力，但仍未进入可结算对局阶段。
- 当前对战、互助、后台管理仍处于未开始或占位阶段。
- 当前项目不是发布准备状态，不能直接进入体验版发布。
- 若按 PRD 和 `docs/02-MVP功能范围与验收清单.md` 的完整 V1 范围评估，整体完成度约为 25%。

## 2. 审计依据

- 文档：`README.md`、`PROJECT_STATE.md`、`DECISION_LOG.md`、`CHANGELOG.md`、`docs/**`
- 后端：`server/src/**`、`server/prisma/schema.prisma`、`server/prisma/migrations/**`、`server/prisma/seed.sql`
- 小程序：`miniapp/app.json`、`miniapp/pages/**`、`miniapp/utils/**`、`miniapp/types/**`
- 脚本与依赖：`server/package.json`、`server/package-lock.json`
- 数据库只读统计：通过本地 `server/.env` 连接数据库执行 `count(*)` 查询，未修改任何数据

## 3. 模块状态矩阵

| 模块 | 状态 | 证据 | 主要缺口 |
| --- | --- | --- | --- |
| 1. 用户与认证 | PARTIAL | 后端有 `wechat-login` / `refresh` / `logout`；小程序有登录页、认证存储、401 refresh、profile 展示 | 无 `auth/me`；无资料编辑 UI；无注销 UI；正式微信登录仍依赖外部配置 |
| 2. 首页 | PARTIAL | `pages/home/index` 存在并真实调用 `/courses` | 无 `/api/v1/home`；“我的学习”区是静态占位；文案过时 |
| 3. 课程分类 | NOT_STARTED | 无 category 模型、字段、接口、页面 | PRD 范围未落地 |
| 4. 课程列表 | COMPLETE | 后端 `GET /api/v1/courses`；小程序课程列表和首页推荐都已真实调用；有空态和错误态 | 当前只支持分页和 difficulty，不支持分类 |
| 5. 课程详情 | COMPLETE | 后端 `GET /api/v1/courses/:courseId`；小程序详情页有错误态、章节跳转、参数校验 | 无开始课程按钮和动作接入 |
| 6. 章节详情 | PARTIAL | 后端 `GET /api/v1/chapters/:chapterId`；小程序可展示正文、目录、上下章跳转 | 未接入 `chapter start` / `complete`；`QUESTION` 内容块仅占位 |
| 7. 学习进度 | PARTIAL | 后端已有 `course start` / `chapter start` / `chapter complete` / `progress` / `users/me/learning`；小程序有学习列表和课程进度页 | 小程序未调用任何学习写接口，无法从新用户走通写入闭环 |
| 8. 课程测验 | BACKEND_ONLY | 后端已有 quiz 查询、提交、attempt 列表和详情；有单元测试与 e2e | 小程序没有 `pages/quiz/index` / `pages/quiz/result`，章节页也未接入 quiz |
| 9. 错题中心 | PARTIAL | 后端 wrong-question 三接口已完成；小程序有列表、统计、详情 | 错题来源依赖 quiz 提交；前端暂不开放 course/chapter 筛选 |
| 10. 对战大厅 | PLACEHOLDER | `pages/battle/index` 仅占位 | 无真实数据、无真实功能 |
| 11. 对战匹配 | BACKEND_ONLY | 后端已有匹配加入、状态查询、取消匹配、好友房创建/预览/加入与房间基础查询；有单元测试和 e2e | 小程序仍只有 `pages/battle/index` 占位页；房间只到 `WAITING` |
| 12. 对战答题 | NOT_STARTED | 无题目下发、无答题页、无服务端答案提交 | 完全未落地 |
| 13. 对战结算 | NOT_STARTED | 无 BattleResult 接口或页面 | 完全未落地 |
| 14. 对战记录 | NOT_STARTED | 无 battle history 接口或页面 | 完全未落地 |
| 15. 对战错题 | NOT_STARTED | 决策日志只规定未来接入统一错题中心 | 无来源字段、无接入逻辑、无页面 |
| 16. 互助问题列表 | PLACEHOLDER | `pages/community/index` 仅占位 | 无帖子模型、无列表接口 |
| 17. 发布问题 | NOT_STARTED | 无发布页、无接口 | 完全未落地 |
| 18. 问题详情 | NOT_STARTED | 无详情页、无接口 | 完全未落地 |
| 19. 回答 | NOT_STARTED | 无 Comment 模型、接口或页面 | 完全未落地 |
| 20. 点赞 | NOT_STARTED | 无 like 模型、接口或页面 | 完全未落地 |
| 21. 采纳 | NOT_STARTED | 无字段、接口或页面 | 完全未落地 |
| 22. 我的提问/回答 | NOT_STARTED | 无我的帖子/回答接口和页面 | 完全未落地 |
| 23. 排行榜 | NOT_STARTED | 无排行榜模型、接口或页面 | 完全未落地 |
| 24. 积分与等级 | PARTIAL | User 上有 `experience` / `battleRating` / `continuousLearningDays` 字段；profile 会显示 | 没有积分规则、等级规则、更新逻辑或排行榜 |
| 25. 个人资料 | PARTIAL | 后端 `PATCH /users/me`、`POST /users/me/delete-account` 已完成；profile 页存在 | 小程序没有编辑资料和注销账号流程 |
| 26. 消息或通知 | NOT_STARTED | 无模型、接口、页面 | 完全未落地 |
| 27. 后台课程管理 | NOT_STARTED | 文档有规划，仓库无 `admin-web`，后端无 `/api/v1/admin/courses` | 完全未落地 |
| 28. 后台章节管理 | NOT_STARTED | 文档有规划，代码无实现 | 完全未落地 |
| 29. 后台题库管理 | NOT_STARTED | 文档有规划，代码无实现 | 完全未落地 |
| 30. 后台用户管理 | NOT_STARTED | 文档有规划，代码无实现 | 完全未落地 |
| 31. 后台互助审核 | NOT_STARTED | 文档有规划，代码无实现 | 完全未落地 |
| 32. 测试数据与种子数据 | PARTIAL | 当前数据库有 2 门课程、2 个章节、2 套 quiz、6 题、16 选项；`seed.sql` 仅覆盖 quiz | 课程/章节/正文内容不由仓库 seed 创建；没有系统化演示数据方案 |
| 33. 正式微信登录 | BLOCKED | 后端和小程序正式分支已存在 | 依赖真实 AppID / AppSecret、合法域名、HTTPS、微信后台配置 |
| 34. 部署与体验版发布 | BLOCKED | 有部署文档 | 核心模块未齐、无后台、无完整回归、无正式微信登录联调 |

## 4. 课程内容专项审计

### 4.1 当前数据库真实数据

- 课程总数：2
- 已发布课程：1
- 章节总数：2
- 已发布章节：2
- 内容块总数：7
- quiz 总数：2
- quiz 题目总数：6
- quiz 选项总数：16

### 4.2 当前可演示课程

- 已发布演示课程：`python-basic` / `Python基础`
- 草稿课程：`python-draft`

### 4.3 当前可演示章节

- `认识Python`
  - 内容块：7
  - 小测：1 套
  - 小测题目：3 题
- `变量与数据类型`
  - 内容块：0
  - 小测：1 套
  - 小测题目：3 题

### 4.4 章节正文真实支持范围

- schema 和阅读页支持：
  - `TEXT`
  - `HEADING`
  - `IMAGE`
  - `CODE`
  - `TIP`
  - `WARNING`
  - `EXAMPLE`
  - `QUESTION`
- 当前 live 数据实际只用了：
  - `TEXT`
  - `HEADING`
  - `CODE`
  - `TIP`
  - `EXAMPLE`
- 当前不支持：
  - 视频内容块
  - 富文本编辑器
  - 章节内真正可作答的内嵌题块

### 4.5 内容录入方式

- 课程、章节、正文内容当前不由仓库内 seed 自动生成。
- quiz 题库由 `server/prisma/seed.sql` 追加导入。
- 当前仓库没有后台内容管理接口，也没有 `admin-web`。
- 因此当前内容录入主要依赖数据库现存数据和 quiz seed，不具备正式内容运营能力。

### 4.6 当前能否完整演示学习闭环

当前不能从新用户完整演示：

`课程列表 → 课程详情 → 章节学习 → 完成进度 → 课程测验 → 错题中心`

缺失项：

- 小程序没有 quiz 页面
- 小程序没有调用 `POST /api/v1/chapters/:chapterId/start`
- 小程序没有调用 `POST /api/v1/chapters/:chapterId/complete`
- 第二章没有正文内容块
- 错题中心虽然可读，但前端没有通过 quiz 提交来实际生成错题的链路

## 5. 对战功能专项审计

当前真实状态：

- 数据模型：无
- 接口：无
- 匹配机制：无
- 房间机制：无
- WebSocket / 轮询：无
- 题目下发：无
- 计时：无
- 提交答案：无
- 服务端判分：无
- 防重复提交：无
- 结算：无
- 对战记录：无
- 排行榜：无
- 对战错题：无
- 小程序页面：只有 `pages/battle/index` 占位页

结论：

- 对战模块当前真实完成度为“后端数据基础与匹配/好友邀请已落地，但真实对局链路仍未开始”。
- `CP-011B` 已完成 Battle schema、migration、BattleModule、评分/Elo 纯函数和 BattleProfile 初始化等基础能力。
- `CP-011C` 已完成 BattleController、随机匹配、匹配状态查询、取消匹配、好友房创建/预览/加入和房间基础查询。
- `CP-011D` 已完成 `POST /api/v1/battles/:battleId/ready`、`GET /api/v1/battles/:battleId/questions`、`POST /api/v1/battles/:battleId/answers`、题目快照、统一 `startedAt` / `expiresAt`、`COUNTDOWN -> IN_PROGRESS` 惰性推进与单题幂等提交。
- 文档中的主动交卷、自动结算、排行榜和 Battle 小程序页面仍未落地为可用代码。
- 自 2026-07-24 起，Battle V1 的正式设计基线以 `docs/BATTLE_V1_ARCHITECTURE.md` 为准，后续实现必须遵守其中冻结的玩法规则、状态机、题库复用策略和接口边界。

## 6. 互助功能专项审计

当前真实状态：

- 问题 / 帖子模型：无
- 回答 / 评论模型：无
- API：无
- 列表：无
- 详情：无
- 发布：无
- 回答：无
- 点赞：无
- 采纳：无
- 举报：无
- 审核：无
- 我的内容：无
- 小程序页面：只有 `pages/community/index` 占位页

结论：

- 互助模块当前真实完成度为 `PLACEHOLDER / NOT_STARTED`。

## 7. 后台管理专项审计

当前真实状态：

- 仓库没有 `admin-web` 目录
- 后端没有任何 `/api/v1/admin/*` 控制器
- `schema.prisma` 没有 `AdminUser`、`AdminOperationLog`
- 课程、章节、题库、用户、互助审核都没有后台能力

结论：

- 后台管理整体为 `NOT_STARTED`
- 当前课程内容与题库无法通过正式后台维护

## 8. 当前主要契约不一致

以下差异会影响后续排期和验收：

1. `docs/05` 定义了 `GET /api/v1/home`，但后端未实现；`pages/home/index` 当前直接调用 `GET /api/v1/courses`。
2. `docs/02` / `docs/05` 仍保留 `GET /api/v1/auth/me`，但后端未实现。
3. `docs/05` 定义了 `POST /api/v1/auth/logout-all`，但后端未实现。
4. `docs/05` / `docs/07` 仍保留 `GET /api/v1/users/me/overview`，但后端未实现。
5. `docs/03` / `docs/01` 定义了 `pages/quiz/index` 与 `pages/quiz/result`，但小程序未注册也未实现。
6. `docs/03` 仍把错题中心的“课程筛选 / 章节筛选”写为当前页面内容，但前端已明确未开放该 UI。
7. 首页页面文案仍写“登录和学习进度模块尚未开发”，与当前已存在的学习中心页面不一致。

## 9. 当前可演示范围

### 9.1 当前可以稳定演示

- 公开课程浏览：
  - 首页推荐课程
  - 课程列表
  - 课程详情
  - 章节正文阅读
- 登录基础：
  - Mock 登录
  - 登录态保存
  - 受保护页面访问
  - access token 异常后的自动 refresh
- 学习中心读取：
  - 我的学习列表
  - 单课程学习进度
- 错题中心读取：
  - 错题统计
  - 错题列表
  - 错题详情

### 9.2 当前不能稳定演示

- 新用户从课程开始到小测完成的完整学习闭环
- 小程序端 quiz 作答
- 小程序端章节完成
- battle 主链路
- community 主链路
- 后台录入课程和题库

## 10. 当前能否发布体验版

不能。

原因：

- 学习主链路未闭合
- battle 和 community 均未落地
- 后台管理未开始
- 正式微信登录仍依赖外部配置
- 关键契约仍有未对齐项
- 缺少发布前的全链路联调和回归

## 11. 当前能否完成答辩闭环演示

不能完成“完整 V1 答辩闭环”。

目前最多可演示：

- 公开课程浏览链路
- 登录与受保护页面
- 学习中心和错题中心的读取链路

但不能完整演示：

- 新用户学习
- 小测提交
- 错题生成
- 对战闭环
- 互助闭环
- 后台发布内容

## 12. V1 范围冻结建议（供 Tech Lead 评审）

### A. V1 必须完成

建议按当前代码基础优先完成以下闭环：

1. 用户登录、退出、刷新令牌、登录态恢复
2. 一门完整课程的公开浏览
3. 章节开始 / 完成的小程序接入
4. 小程序 quiz 页面与结果页
5. 学习进度读取与更新闭环
6. 错题中心与 quiz 结果联动闭环
7. Battle V1 最小可演示闭环
   - 至少包含随机匹配、好友邀请、统一计时、答题提交、结算、战绩与排行榜基础能力
8. Battle 与统一错题中心的 BATTLE 来源联动
9. 一门完整可演示课程与正式种子数据
10. 最小内容录入能力
   - 若不做后台 UI，则至少要有可重复执行、可审计的正式内容导入方案
11. 真实微信登录与部署联调

### B. V1 可选完成

1. 正式首页聚合接口 `GET /api/v1/home`
2. 用户资料编辑与注销账号 UI
3. 错题中心 course/chapter 筛选 UI
4. 首页“当前学习”真实接入

### C. 延后到 V1.1

建议延后：

1. 练习模式
2. 校园互助全链路
3. 通知 / 消息
4. 收藏
5. 错题掌握、删除、重做
6. 更复杂的 Battle 赛季、段位、活动玩法

### D. 暂不实现

1. 多来源错题统计扩展
2. 丰富内容编辑器
3. 完整后台日志与多管理员体系
4. Battle WebSocket / Redis / 观战 / 道具 / 聊天等增强能力

说明：

- Battle 现已完成正式契约冻结；若 Tech Lead 继续将 Battle 作为当前 V1 核心亮点，则体验版时间点必须顺延到 `CP-011B` 至 `CP-011H` 的核心实现和联调完成之后。
- 若 Tech Lead 决定压缩 V1 范围，则应显式把 Battle 从“当前 V1 必须项”下调，否则不得在实现阶段擅自弱化 Battle 主链路。

## 13. 建议后续工单路线图

| 工单 | 目标 | 前置依赖 | 是否改 schema | 是否需要 migration | 验收标准 | 建议顺序 |
| --- | --- | --- | --- | --- | --- | --- |
| CP-011A | Battle V1 产品规则、状态机、数据模型与接口契约冻结 | CP-010 | 否 | 否 | 形成 `docs/BATTLE_V1_ARCHITECTURE.md` 并同步状态、决策与路线图 | 已完成 |
| CP-011B | Battle 数据模型、枚举、Prisma migration 与基础领域服务 | CP-011A | 是 | 是 | Battle 相关表结构、唯一约束、索引、题目快照、BattleModule 与评分/Elo 基础能力落地 | 已完成 |
| CP-011C | 随机匹配与好友邀请 | CP-011B | 否 | 否 | 队列、邀约、房间创建、并发安全与状态推进落地 | 已完成 |
| CP-011D | 房间准备、统一计时、题目抽取与下发、单题提交 | CP-011C | 否 | 否 | COUNTDOWN、IN_PROGRESS、服务端计时、幂等答题、快照下发落地 | 已完成 |
| CP-011E | 主动交卷、自动结算、认输、rating 计算 | CP-011D | 可能 | 可能 | battleScore、平局、Elo、幂等 settlement 与结果写入落地 | 2 |
| CP-011F | 战绩、排行榜与统一错题中心 BATTLE 联动 | CP-011E | 可能 | 可能 | history、leaderboard、wrong-question 聚合扩展落地 | 4 |
| CP-011G | Battle 小程序完整页面 | CP-011F | 否 | 否 | 大厅、匹配、房间、结果、历史、排行榜可联调演示 | 5 |
| CP-011H | Battle 运行态联调、异常恢复、并发回归 | CP-011G | 否 | 否 | 切后台、断网、重复请求、超时、认输和回归通过 | 6 |
| CP-012 | 学习闭环补全 | CP-009C-04 | 否 | 否 | 新用户可在小程序完成一章学习、小测提交、章节完成、错题生成 | 7 |
| CP-013 | 演示课程与正式种子数据闭环 | CP-012 | 否 | 否 | 至少 1 门课程可完整演示；数据可重复导入，不依赖手工库内编辑 | 8 |
| CP-014 | 最小内容录入能力 | CP-013 | 视方案而定 | 视方案而定 | 内容录入不再依赖直接改数据库 | 9 |
| CP-015 | 互助后端核心 | CP-014 | 是 | 是 | 能完成帖子列表、发帖、详情、评论、点赞、举报 | 10 |
| CP-016 | 互助小程序 | CP-015 | 否 | 否 | 小程序可演示互助最小闭环 | 11 |
| CP-017 | 个人中心与积分补全 | CP-012, CP-015 | 可能 | 可能 | 个人中心不再只是认证壳层，积分字段有正式规则 | 12 |
| CP-018 | 全系统联调与契约收口 | CP-011H, CP-016, CP-017 | 否 | 否 | 文档与代码一致，关键 E2E/手工链路通过 | 13 |
| CP-019 | 真实微信登录与部署 | CP-018 | 否 | 否 | 真实微信登录可用，测试环境后端与小程序可联调 | 14 |
| CP-020 | 体验版与答辩演示准备 | CP-019 | 否 | 否 | 体验版前检查通过，答辩脚本可完整跑通 | 15 |

## 14. 体验版发布时间建议

建议放在 `CP-019` 之后、`CP-020` 之前的联调验收阶段，而不是当前立即推进。

最低前置条件：

1. 学习主链路完整
2. 至少 1 门课程的内容和小测完整
3. Battle `CP-011B` 至 `CP-011H` 已完成并通过联调
4. 正式微信登录可用
5. 测试环境部署完成
6. 关键链路回归通过

## 15. 建议答辩演示闭环

若按当前冻结方案推进，建议答辩主链路为：

1. 微信登录
2. 首页 / 课程列表
3. 课程详情
4. 章节学习
5. 章节小测
6. 章节完成
7. 学习进度页
8. 错题中心
9. 错题详情
10. 对战大厅
11. 随机匹配或好友邀请一局
12. Battle 结算页
13. Battle 战绩或排行榜
14. 个人中心

若 Tech Lead 要求完整 PRD 级 V1，则需要在以上基础上追加：

15. 互助发帖与评论
16. 最小后台录入演示
