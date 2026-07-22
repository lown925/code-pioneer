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

### Fixed
- 统一单课程学习进度接口路径为 `GET /api/v1/courses/:courseId/progress`
- 统一 `avatarUrl` 过渡校验规则为 HTTPS URL 且最大长度 2048
- 删除早期临时 User 调试接口及无外键测试用户数据
- 错题本正式路径统一为 `GET /api/v1/users/me/wrong-questions*`
