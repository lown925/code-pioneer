当前版本：v0.0.1
当前阶段：后端基础工程完成

已完成：
- Git 仓库初始化
- NestJS 后端初始化
- 全局 API 前缀 api/v1
- 健康检查接口
- Build、Lint、Unit Test、E2E Test 验证
- Prisma 与 PostgreSQL 接入
- User 基础模块
- Course 与 CourseChapter 基础模块
- 课程列表与课程详情接口
- POST /api/v1/auth/refresh 与 Refresh Token 轮换
- POST /api/v1/auth/logout 与会话撤销
- JwtUserAuthGuard、OptionalUserAuthGuard 与 @CurrentUser()
- Logout 幂等撤销当前会话，已撤销会话仍被普通受保护接口拒绝
- PATCH /api/v1/users/me 当前用户资料更新接口
- POST /api/v1/users/me/delete-account 账号软注销接口
- 当前用户公开资料响应字段映射
- 账号软注销后撤销该用户全部会话
- 已注销用户同 openId 再次登录返回 USER_DELETED
- /users/me/overview 延后至 CP-007C-01C-2，等待学习概览依赖模型落地
- CourseLearningRecord 与 ChapterLearningRecord 学习记录模型
- POST /api/v1/courses/:courseId/start 开始课程接口
- POST /api/v1/chapters/:chapterId/start 开始章节接口
- POST /api/v1/chapters/:chapterId/complete 完成章节接口
- GET /api/v1/courses/:courseId/progress 单课程学习进度接口
- GET /api/v1/users/me/learning 我的学习课程列表接口
- 课程列表、课程详情与章节详情接入可选登录态学习状态

当前任务：CP-008A-01 课程与章节学习记录基础闭环
状态：等待验收
下一任务：待 Tech Lead 确认
当前阻塞项：暂无
