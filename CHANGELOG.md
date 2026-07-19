## [Unreleased]

### Added
- NestJS 后端基础工程
- GET /api/v1/health 健康检查接口
- 单元测试与 E2E 测试
- Course 与 CourseChapter Prisma 模型
- GET /api/v1/courses 公开课程列表接口
- GET /api/v1/courses/:courseId 公开课程详情接口
- 课程与章节最小验收测试数据
- 微信小程序 TypeScript 基础工程
- 小程序首页、课程列表页与课程详情页
- 小程序课程接口请求封装
- 小程序首页、对战、互助、我的底部导航结构
- ChapterContentBlock Prisma 模型与章节内容块迁移
- GET /api/v1/chapters/:chapterId 章节详情接口
- 小程序章节阅读页与移动端目录抽屉
- 文档补充内嵌练习接口定义：GET /api/v1/questions/:questionId 与 POST /api/v1/questions/:questionId/answer
- 文档补充 FILL_BLANK 与 CODE_INPUT 题型及判题规则
- 正式 UUID User Prisma 模型
- UserSession Prisma 模型
- User UUID 与 UserSession 数据库迁移
- AuthModule、AuthController、AuthService 与 JWT 服务
- POST /api/v1/auth/wechat-login 登录接口
- 开发环境隐藏式 Mock 登录流程
- 登录成功后创建正式 UserSession 并返回 AccessToken / RefreshToken
- POST /api/v1/auth/refresh 接口
- Refresh Token 轮换与旧令牌立即失效
- POST /api/v1/auth/logout 接口与会话撤销
- JwtUserAuthGuard、OptionalUserAuthGuard 与 @CurrentUser()
- Logout 幂等撤销与已撤销会话拦截
- server/.env.example 认证环境变量模板

### Fixed
- 修复损坏的 Nest CLI 依赖安装产物
- 统一文档中的 /api/v1 接口路径、practices 资源命名与 attemptId 参数命名
- 修正文档中的章节完成规则为小测达及格分后方可完成章节
- 统一认证文档中的普通用户接口路径、Mock 登录契约、UserSession 会话规则与按需登录原则

### Changed
- 恢复标准 NestJS 构建与开发启动脚本
- PROJECT_STATE 更新为 CP-005R 待验收状态
- PROJECT_STATE 更新为 CP-006R 待验收状态
- 课程详情页章节入口改为跳转章节阅读页
- PROJECT_STATE 更新为 CP-007B-DESIGN 待验收状态
- 认证设计拆分为 CP-007C-01A、CP-007C-01B、CP-007C-01C 三个实现工单
- 删除临时 User 调试接口并完成最小兼容清理

### Removed
- 3 条缺少合法 openId 且无外键引用的临时 User 测试数据
