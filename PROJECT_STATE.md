当前版本：v0.0.1
当前阶段：微信小程序学习模块 V1 收口
当前任务：CP-009C-04 微信小程序学习模块整体联调与 V1 收口
状态：已完成静态联调修正，等待 Tech Lead 验收
下一任务：待定
当前阻塞项：暂无

已完成：
- Git 仓库初始化与多端项目目录结构
- NestJS 后端基础工程、全局 `/api/v1` 前缀与健康检查接口
- Prisma 与 PostgreSQL 接入
- Course、CourseChapter、ChapterContentBlock 基础模型与公开课程接口
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
- 章节测验通过历史记录校验完成资格
- `python-basic` 课程章节小测 Seed 数据
- QuizAnswer 聚合式错题本基础闭环
- `GET /api/v1/users/me/wrong-questions`
- `GET /api/v1/users/me/wrong-questions/statistics`
- `GET /api/v1/users/me/wrong-questions/:questionId`
- 错题列表、统计、详情、分页、用户隔离
- deleted user 与 revoked session 拒绝访问错题接口
- 旧 `/api/v1/wrong-questions*` 路径保持 404
- 小程序认证存储、Authorization 注入、401 单飞刷新与 logout
- 开发环境 Mock 登录接入正式 `POST /api/v1/auth/wechat-login`
- `pages/auth/login` 与 `pages/profile/index` 最小认证接入
- `pages/learning/index` 我的学习列表页
- 学习状态筛选、分页、下拉刷新、空状态与错误状态
- `pages/learning/course-progress` 单课程学习进度详情页
- 课程总体进度展示、NOT_STARTED 稳定状态与章节进度列表
- 继续学习、章节跳转、课程详情跳转与返回刷新
- `pages/wrong-question/index` 与 `pages/wrong-question/detail`
- 错题统计、分页列表、详情页、下拉刷新、错误状态与空状态

CP-009C-04 当前收口结果：
- 已完成登录页用户可见文案中文化，并移除过时“后续任务”说明
- 已完成开发环境 Mock 登录入口显示规则收口，仅在 `develop` 环境展示
- 已完成常见登录失败场景映射，避免直接向普通用户暴露后端英文认证配置错误
- 已完成课程详情与章节详情页的 UUID 校验、参数解码、跳转编码与无历史栈兜底
- 已继续复用现有 `auth` / `request` 层，未新增页面直连 `wx.request`
- 已确认统一错题中心当前只接入 LEARNING 来源
- 已确认后端支持 `courseId` / `chapterId` 错题查询参数，但前端 V1 因缺少完整筛选元数据暂不开放课程/章节筛选

V1 当前边界：
- 已实现 `pages/profile/index`、`pages/learning/index`、`pages/learning/course-progress`
- 已实现 `pages/wrong-question/index`、`pages/wrong-question/detail`
- Mock 登录仅用于开发环境
- 正式微信登录仍依赖 AppID、AppSecret、服务端 HTTPS 与合法域名配置
- 当前未接入 BATTLE 来源
- 当前未实现错题删除、收藏、掌握、重做

质量状态：
- 本轮 TypeScript 静态编译通过
- 本轮 `git diff --check` 通过

当前待推进内容：
- 微信开发者工具编译、运行态链路、401 refresh 实机回归与窄屏视觉验收
- 正式微信登录的真实环境配置与体验版发布联调
