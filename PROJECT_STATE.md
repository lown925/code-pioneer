当前版本：v0.0.1
当前阶段：后端基础能力持续闭环
当前任务：CP-009A-01 QuizAnswer 聚合式错题本基础闭环
状态：待 Tech Lead 最终验收
下一任务：待 Tech Lead 确认
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
- V1.0 错题本正式方案基于 `QuizAnswer` 聚合生成
- 未新增 `WrongQuestion` 模型
- 未新增 migration
- 未新增 `masteryStatus`
- 未新增 practice 接口
- 未新增 status 接口
- 未引入自动移除、收藏或 AI 解析

质量状态：
- build 通过
- lint 通过
- unit test 通过
- e2e 通过

当前待验收内容：
- CP-009A-01 正式验收结论
