当前版本：v0.0.1
当前阶段：前端认证接入
当前任务：CP-009C-AUTH 微信小程序用户认证与统一请求层接入
状态：已实现，等待 Tech Lead 验收
下一任务：CP-009C-01 学习中心页面实现
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
- 错题列表、统计、详情、课程筛选、章节筛选、分页、用户隔离
- deleted user 与 revoked session 拒绝访问错题接口
- 旧 `/api/v1/wrong-questions*` 路径保持 404
- 小程序认证存储、Authorization 注入、401 单飞刷新与 logout
- 开发环境 Mock 登录接入正式 `POST /api/v1/auth/wechat-login`
- `pages/auth/login` 与 `pages/profile/index` 最小认证接入

当前任务完成状态：
- 已完成小程序认证存储与全局认证状态初始化
- 已完成统一请求层 Authorization 注入、401 单飞刷新与失败清理登录态
- 已完成正式微信登录与开发环境 Mock 登录共用 `POST /api/v1/auth/wechat-login`
- 已完成 `pages/auth/login` 登录页与 `pages/profile/index` 最小认证展示及 logout 接入
- 已确认 docs/05 与后端 DTO、Service 分支保持一致，不再使用“特殊格式 Mock code”契约

质量状态：
- build 通过
- lint 通过
- unit test 通过
- e2e 通过

当前待推进内容：
- CP-009C-AUTH 已实现，等待 Tech Lead 验收
