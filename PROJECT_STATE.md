当前版本：v0.0.1
当前阶段：学习中心页面实现
当前任务：CP-009C-01 微信小程序“我的学习”列表页
状态：已实现，等待 Tech Lead 验收
下一任务：CP-009C-02 微信小程序单课程进度页
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
- `pages/learning/index` 我的学习列表页
- 学习状态筛选、分页、下拉刷新、空状态与错误状态
- `pages/learning/course-progress` 最小路由占位

当前任务完成状态：
- 已完成 `pages/learning/index` 对接正式 `GET /api/v1/users/me/learning`
- 已完成“全部 / 学习中 / 已完成”状态筛选、分页加载与下拉刷新
- 已完成课程卡片、空状态、错误状态与登录失效重定向处理
- 已完成 profile 学习中心入口接入
- 已完成 `pages/learning/course-progress` 最小占位路由，不提前实现 CP-009C-02 业务

质量状态：
- build 通过
- lint 通过
- unit test 通过
- e2e 通过

当前待推进内容：
- CP-009C-01 已实现，等待 Tech Lead 验收
