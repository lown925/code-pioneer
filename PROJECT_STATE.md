当前版本：v0.0.1
当前阶段：CP-011D Battle ready、统一计时、题目抽取与答案提交落地
当前任务：CP-011D Battle 双方准备、统一倒计时、题目抽取、题目下发与答案提交
状态：已完成 Battle V1 ready、COUNTDOWN、题目快照、题目下发与单题提交后端实现，等待 Tech Lead 验收
下一任务：CP-011E 主动交卷、自动结算、认输与 rating 计算
当前阻塞项：
- 当前 Battle 已完成 schema、migration、Prisma Client、基础领域服务、公开 BattleController、随机匹配、好友房创建/预览/加入、匹配状态查询、取消匹配、房间基础查询、双方 ready、统一 COUNTDOWN/IN_PROGRESS 推进、题目快照创建、题目安全下发与单题答案提交。
- 当前代码库仍未形成完整 V1 闭环，体验版发布与答辩演示仍受学习链路未闭合、Battle 未实现、互助未开始等问题约束。

项目整体判断：
- 当前仓库已完成“公开课程浏览 + 用户认证基础 + 学习记录后端 + 小测后端 + 错题后端 + 学习中心前端读取”的部分主链路。
- Battle 已完成 V1 产品规则冻结，并在 `CP-011B` 落地了 Prisma 核心模型、迁移、Prisma Client、BattleModule、评分/Elo 纯函数和基础领域服务，在 `CP-011C` 落地了随机匹配、好友邀请与房间基础查询接口，在 `CP-011D` 落地了 ready、COUNTDOWN、题目快照、题目下发与单题提交接口。
- 当前项目不是发布准备状态，也不是完整 V1 状态。
- 若按 PRD 与 MVP 文档的完整范围评估，整体完成度约为 25%。
- 若只按“学习主链路”评估，后端完成度高于前端完成度，但小程序仍缺少章节开始/完成写入和小测页面，不能从新用户走通完整学习闭环。

当前完整模块矩阵摘要：
- COMPLETE：课程列表、课程详情（公开浏览）。
- PARTIAL：用户与认证、首页、章节详情、学习进度、错题中心、积分字段展示、个人资料。
- BACKEND_ONLY：章节小测、用户资料更新、账号注销、学习记录写接口。
- PLACEHOLDER：对战大厅、互助首页。
- NOT_STARTED：课程分类、练习模式、对战主链路、互助主链路、排行榜、消息通知、后台管理全链路。
- BLOCKED：正式微信登录、部署与体验版发布。
- 完整 34 项模块矩阵、证据和缺口见 `docs/V1_REMAINING_ROADMAP.md`。

Battle V1 数据基础状态：
- Battle 是“码站先锋”的核心产品亮点，正式基线仍以 `docs/BATTLE_V1_ARCHITECTURE.md` 为准。
- `CP-011B` 已落地：Battle Prisma 枚举、共享题库扩展、`BattleProfile` / `BattleRoom` / `BattleParticipant` / `BattleQuestionSnapshot` / `BattleAnswer` / `BattleInvitation` / `BattleRatingLog` / `BattleMatchQueue` 模型，迁移 `20260725021220_add_battle_v1_core_models`，BattleModule、BattleScoreService、BattleRatingService、BattleDomainService 以及对应单元测试。
- 当前确定的兼容策略是：保留 `User.battleRating` 兼容字段，首次初始化 `BattleProfile` 时继承其值，后续排位权威来源转向 `BattleProfile.rating`。
- 当前 Battle 仍未实现：主动交卷、自动结算、最终 WIN / LOSS / DRAW、rating 落库、排行榜查询、战绩查询、小程序 Battle 功能页；因此仍未形成完整可结算的真实对局闭环。

学习模块真实状态：
- 已有后端：
  `GET /api/v1/courses`
  `GET /api/v1/courses/:courseId`
  `GET /api/v1/chapters/:chapterId`
  `POST /api/v1/courses/:courseId/start`
  `POST /api/v1/chapters/:chapterId/start`
  `POST /api/v1/chapters/:chapterId/complete`
  `GET /api/v1/courses/:courseId/progress`
  `GET /api/v1/users/me/learning`
  `GET /api/v1/chapters/:chapterId/quiz`
  `POST /api/v1/chapters/:chapterId/quiz/submit`
  `GET /api/v1/chapters/:chapterId/quiz/attempts`
  `GET /api/v1/quiz-attempts/:attemptId`
  `GET /api/v1/users/me/wrong-questions`
  `GET /api/v1/users/me/wrong-questions/statistics`
  `GET /api/v1/users/me/wrong-questions/:questionId`
- 已有小程序：
  `pages/home/index`
  `pages/course/list`
  `pages/course/detail`
  `pages/chapter/detail`
  `pages/auth/login`
  `pages/profile/index`
  `pages/learning/index`
  `pages/learning/course-progress`
  `pages/wrong-question/index`
  `pages/wrong-question/detail`
- 当前缺口：
  小程序没有接入章节 `start` / `complete`；
  没有 `pages/quiz/index` / `pages/quiz/result`；
  错题中心依赖后端已有错题数据，前端自身不能创造错题来源；
  首页“我的学习”区仍是占位展示，未接入正式学习中心聚合。

课程内容与演示数据真实状态：
- 当前数据库共 2 门课程、2 个章节、7 个内容块、2 套 quiz、6 道 quiz 题、16 个选项。
- 仅 1 门已发布课程：`python-basic`。
- 仅 1 门草稿课程：`python-draft`。
- 已发布课程共 2 个已发布章节：
  `认识Python`
  `变量与数据类型`
- 第一章有 7 个内容块和 1 套 quiz；第二章有 1 套 quiz，但当前没有正文内容块。
- 当前 live 数据中实际使用的内容块类型只有：`TEXT`、`HEADING`、`CODE`、`TIP`、`EXAMPLE`。
- schema 和阅读页支持的内容块类型包括：`TEXT`、`HEADING`、`IMAGE`、`CODE`、`TIP`、`WARNING`、`EXAMPLE`、`QUESTION`。
- 当前不支持视频内容块，也没有富文本编辑器或后台内容管理。
- 题库 seed 仅覆盖 `python-basic` 课程的 2 个章节小测；课程、章节和正文内容不由 repo 内 seed 自动创建。
- 当前课程内容仍明显依赖数据库现存数据和 quiz seed，缺少正式内容录入能力。

对战、互助、内容管理真实状态：
- 对战：正式契约已冻结，后端已完成公开 Battle 接口、随机匹配、好友邀请、ready、COUNTDOWN、题目快照、题目下发与单题提交，但当前仍只有 `pages/battle/index` 占位页；无小程序 Battle 房间页、无主动交卷、无自动结算、无排行榜查询。
- 互助：只有 `pages/community/index` 占位页；无 Post / Comment / Report / Favorite 模型、无接口、无详情、无发布、无审核。
- 内容管理：仓库中没有 `admin-web` 目录；后端没有任何 `/api/v1/admin/*` 实现；也没有 `AdminUser` / `AdminOperationLog` 实际 schema。

当前可演示能力：
- 可演示公开链路：
  首页推荐课程（实际复用课程列表）
  → 课程列表
  → 课程详情
  → 章节正文阅读
- 可演示登录后读取链路：
  Mock 登录
  → 个人中心
  → 我的学习
  → 单课程进度
  → 错题中心
  → 错题详情
- 当前不能从新用户完整演示：
  课程列表
  → 课程详情
  → 章节学习写入
  → 小测作答
  → 完成章节
  → 进度更新
  → 错题生成

当前明确契约偏差：
- 文档仍定义 `GET /api/v1/home`，但后端未实现，首页当前直接复用 `GET /api/v1/courses`。
- 文档仍定义 `GET /api/v1/auth/me`、`POST /api/v1/auth/logout-all`、`GET /api/v1/users/me/overview`，但后端未实现。
- 文档仍定义 `pages/quiz/index`、`pages/quiz/result`，但小程序未注册也未实现。
- 文档仍把错题中心的课程/章节筛选写作当前页面内容，但前端已明确暂不开放筛选。
- 首页页面文案仍保留“登录和学习进度模块尚未开发”的过时描述，与当前学习中心实际状态不一致。

下一阶段建议：
- Battle 已完成数据基础、匹配/好友邀请、ready、题目快照与单题提交落地，下一阶段建议直接进入 `CP-011E`，实现主动交卷、自动结算、认输与 rating 计算。
- 学习主链路仍需补齐章节写入、小测页面和演示课程内容，避免 Battle 规划推进后学习主链路仍无法完整演示。
- 互助、后台管理、正式微信登录与体验版发布仍需按 `docs/V1_REMAINING_ROADMAP.md` 的冻结路线继续评审与拆单执行。
