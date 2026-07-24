## [Unreleased]

### Added
- NestJS 后端基础工程与 `GET /api/v1/health` 健康检查接口
- Course、CourseChapter、ChapterContentBlock Prisma 模型与公开课程接口
- 小程序课程列表、课程详情、章节阅读页与目录抽屉
- 正式 UUID User 模型与 UserSession 会话模型
- `POST /api/v1/auth/wechat-login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `JwtUserAuthGuard`、`OptionalUserAuthGuard` 与 `@CurrentUser()`
- `PATCH /api/v1/users/me`
- `POST /api/v1/users/me/delete-account`
- CourseLearningRecord 与 ChapterLearningRecord 学习记录模型
- `POST /api/v1/courses/:courseId/start`
- `POST /api/v1/chapters/:chapterId/start`
- `POST /api/v1/chapters/:chapterId/complete`
- `GET /api/v1/courses/:courseId/progress`
- `GET /api/v1/users/me/learning`
- Quiz、QuizQuestion、QuizOption、QuizAttempt、QuizAnswer Prisma 模型
- `GET /api/v1/chapters/:chapterId/quiz`
- `POST /api/v1/chapters/:chapterId/quiz/submit`
- `GET /api/v1/chapters/:chapterId/quiz/attempts`
- `GET /api/v1/quiz-attempts/:attemptId`
- `python-basic` 课程章节小测 Seed 数据
- QuizAnswer 聚合式错题列表
- 错题统计接口
- 错题详情接口
- courseId / chapterId 筛选
- 用户隔离
- `wrong-question` 单元测试与 E2E
- 学习中心与个人学习进度聚合后端接口
- `GET /api/v1/users/me/learning`
- `GET /api/v1/courses/:courseId/progress`
- 小程序认证存储与全局认证状态初始化
- 小程序统一请求层 Authorization 自动注入
- 小程序 401 单飞 refresh 与原请求单次重试
- `pages/auth/login` 最小登录页
- `pages/profile/index` 最小认证展示与 logout 接入
- `pages/learning/index` 我的学习列表页
- 我的学习状态筛选、分页与下拉刷新
- 我的学习空状态与错误状态
- profile 学习中心入口
- `pages/learning/course-progress` 最小路由占位
- 单课程学习进度详情页
- 课程总体进度展示与 NOT_STARTED 稳定状态
- 章节进度列表、继续学习和章节跳转
- 下拉刷新、返回刷新与页面错误状态

### Changed
- 公开课程、课程详情与章节详情接口在登录态下返回当前用户真实学习状态
- 章节完成逻辑改为以历史 `passed=true` 的小测记录作为资格校验
- `hasQuiz` 改为按正式 `PUBLISHED` quiz 是否存在计算
- 文档同步到当前章节小测、学习联动与错题聚合契约
- `docs/02`、`docs/04`、`docs/05`、`docs/07` 统一为 `QuizAnswer` 聚合式错题方案
- 旧 `WrongQuestion` 持久化契约退出 V1.0 正式范围
- 学习中心 V1.0 文档收口为 `GET /api/v1/users/me/learning` + `GET /api/v1/courses/:courseId/progress`
- 明确学习中心无学习记录时返回空列表或稳定 `NOT_STARTED` 结构，不自动创建学习记录
- 明确 V1.0 学习中心不新增 `LearningHistory`、`StudyRecord`、`LearningEvent` 或 `/api/v1/learning/*` 聚合接口
- 收口微信小程序学习中心页面契约与入口设计，统一为 `pages/learning/index`、`pages/learning/course-progress`、`pages/wrong-question/index`、`pages/wrong-question/detail`
- 明确学习中心入口继续复用现有个人中心页，不新增 tabBar
- 明确统一错题中心长期约束：当前仅接入 LEARNING，后续对战系统再接入 BATTLE
- 修正微信登录 Mock 契约为正式微信登录 `{ code }` 与开发环境 Mock 登录 `{ code, mockOpenId }`
- 同步 `docs/05`、`docs/07` 与现有后端实现，明确 `code` 始终必填且 `mockOpenId` 仅限开发环境

### Fixed
- 统一单课程学习进度接口路径为 `GET /api/v1/courses/:courseId/progress`
- 统一 `avatarUrl` 过渡校验规则为 HTTPS URL 且最大长度 2048
- 删除早期临时 User 调试接口及无外键测试用户数据
- 错题本正式路径统一为 `GET /api/v1/users/me/wrong-questions*`

### CP-009C-03
- 新增小程序统一错题中心入口与页面注册。
- 新增错题统计、分页列表、错题详情、下拉刷新、错误状态与空状态。
- 新增 profile 页“我的错题”正式入口。
- 统一错题中心当前仅展示 LEARNING 来源。
- 前端 V1 暂不开放课程/章节筛选，等待完整筛选元数据来源后再启用。

### CP-009C-04
- 登录页用户可见文案已统一为中文，并移除过时的后续任务提示。
- 开发环境 Mock 登录入口仅在 `develop` 环境显示，继续复用正式 `POST /api/v1/auth/wechat-login`。
- 登录页补充常见失败场景映射，避免直接向普通用户暴露后端英文认证配置错误。
- 课程详情与章节详情页补充 UUID 校验、参数解码、跳转编码与无历史栈兜底返回。
- 本轮仅完成静态联调修正，未声明微信开发者工具运行态验收已通过。
