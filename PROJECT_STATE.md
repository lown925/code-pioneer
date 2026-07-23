当前版本：v0.0.1
当前阶段：学习中心页面实现
当前任务：CP-009C-02 微信小程序单课程学习进度详情页
状态：已实现，等待 Tech Lead 验收
下一任务：CP-009C-03 微信小程序错题中心页面实现
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
- `pages/learning/course-progress` 单课程学习进度详情页
- 课程总体进度展示、NOT_STARTED 稳定状态与章节进度列表
- 继续学习、章节跳转、课程详情跳转与返回刷新

当前任务完成状态：
- 已完成 `pages/learning/course-progress` 对接正式 `GET /api/v1/courses/:courseId/progress`
- 已完成课程总体进度卡片、章节列表、无章节状态与首屏错误状态
- 已完成 NOT_STARTED / LEARNING / COMPLETED 三类课程状态展示
- 已完成继续学习章节选择、章节详情跳转、课程详情跳转与下拉刷新
- 已复用现有认证与 request 刷新机制，未新增学习记录写入逻辑

质量状态：
- build 通过
- lint 通过
- unit test 通过
- e2e 通过

当前待推进内容：
- CP-009C-02 已实现，等待 Tech Lead 验收

当前任务：
CP-009C-03 微信小程序统一错题中心

状态：
已实现，等待 Tech Lead 验收

说明：
- 当前已实现错题统计、分页列表、错题详情页。
- 当前只接入 LEARNING 来源。
- 后端支持 `courseId` / `chapterId` 查询参数。
- 因缺少完整筛选元数据来源，V1 前端暂未开放课程/章节筛选。
- 未实现 BATTLE、删除、掌握、重做提交。
