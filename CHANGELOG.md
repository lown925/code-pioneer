## [Unreleased]

### Added
- NestJS 后端基础工程、`GET /api/v1/health` 健康检查接口与基础测试链路
- Course、CourseChapter、ChapterContentBlock Prisma 模型与公开课程接口
- 小程序课程列表、课程详情、章节阅读页与目录抽屉
- 正式 UUID User 模型与 UserSession 会话模型
- `POST /api/v1/auth/wechat-login` 登录接口
- `POST /api/v1/auth/refresh` Refresh Token 轮换
- `POST /api/v1/auth/logout` 幂等会话撤销
- `JwtUserAuthGuard`、`OptionalUserAuthGuard` 与 `@CurrentUser()`
- `PATCH /api/v1/users/me` 当前用户资料更新接口
- `POST /api/v1/users/me/delete-account` 账号软注销接口
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
- 章节小测单元测试与 E2E 验证

### Changed
- 公开课程、课程详情与章节详情接口在登录态下返回当前用户真实学习状态
- 章节完成逻辑在存在正式 quiz 时改为校验历史通过记录
- `hasQuiz` 改为按正式 `PUBLISHED` quiz 是否存在计算
- 文档已同步到当前章节小测路由、模型与学习联动契约

### Fixed
- 统一单课程学习进度接口路径为 `GET /api/v1/courses/:courseId/progress`
- 统一 `avatarUrl` 过渡校验规则为 HTTPS URL 且最大长度 2048
- 删除早期临时 User 调试接口及无外键测试用户数据
