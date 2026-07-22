当前版本：v0.0.1
当前阶段：前端契约收口
当前任务：CP-009C-00 微信小程序学习中心前端现状核查与页面契约收口
状态：已完成，等待前端认证接入
下一任务：前端认证接入完成后启动 CP-009C-01
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

当前任务完成状态：
- 已核查真实小程序工程结构为原生 `miniapp/`，页面注册仅包含 `home`、`course/list`、`course/detail`、`chapter/detail`、`battle/index`、`community/index`、`profile/index`
- 已核查 `miniapp/app.ts` 仅提供 `apiBaseUrl`，`miniapp/utils/request.ts` 未注入 Authorization、未保存 token、未做 401 续刷
- 已确认当前小程序尚未注册学习中心与统一错题中心页面，后续按 CP-009C 页面契约落地
- 已将学习中心与统一错题中心页面路径、入口和阶段边界收口到正式文档

质量状态：
- build 通过
- lint 通过
- unit test 通过
- e2e 通过

当前待推进内容：
- CP-009C-00 已完成，等待前端认证接入
