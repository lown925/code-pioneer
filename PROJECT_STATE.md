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
- 普通用户认证后端闭环完成，/users/me 系列接口尚未实现

当前任务：CP-007C-01B-2 Refresh Token 轮换、Logout、Guard 与 CurrentUser
状态：等待验收
下一任务：CP-007C-01C 小程序登录页与请求鉴权接入
当前阻塞项：暂无
