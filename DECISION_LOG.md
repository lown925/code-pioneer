D-001：ChatGPT 负责项目统筹与验收，Codex 负责代码执行，用户负责监督与最终决策。
D-002：采用单工单、单验收、单提交模式。
D-003：现有 `docs` 文档为项目约束源，未经授权不得修改。
D-004：项目暂时继续使用 Node.js v24.15.0；此前 Nest CLI 故障已确认为依赖安装产物损坏，不通过升级依赖规避。
D-005：运行日志不得提交到 Git。
D-006：普通用户开发态 Mock 登录复用正式接口 `POST /api/v1/auth/wechat-login`，不新增 `/api/v1/auth/mock-login`。
D-007：Mock 登录仅在非生产环境且显式开启时生效；生产环境必须拒绝 Mock code。
D-008：普通用户正式模型以 UUID `User` 与 `UserSession` 为准，不继续扩大临时 `Int + username` 用户结构的使用范围。
D-009：普通用户认证落地前先完成受控用户迁移，不执行数据库 reset，且必须保护现有课程、章节与内容块数据。
D-010：公开内容保持匿名可读，受保护功能按需登录，小程序不强制启动即登录。
D-011：`CP-007C-01C` 拆分为 `CP-007C-01C-1 当前用户资料更新与账号软注销` 与 `CP-007C-01C-2 用户概览`；`/users/me/overview` 延后到 `CourseLearningRecord`、`ChapterLearningRecord`、`WrongQuestion`、`BattleRecord`、`Post` 落地后再实现。
D-012：`FileAsset` 落地前，`avatarUrl` 采用过渡校验：仅允许合法 `https` URL，最大长度 2048 个字符，不下载远程资源，不校验资源是否真实存在，也不校验 `FileAsset` 归属；`FileAsset` 模型落地后再升级为平台上传资源归属校验。
D-013：已注销用户使用同一 `openId` 再次登录时，一律返回 `USER_DELETED`，不恢复账号，不创建新用户，也不创建新的 `UserSession`。
D-014：单课程学习进度采用资源路径 `GET /api/v1/courses/:courseId/progress`；全局学习进度路径 `GET /api/v1/learning/progress` 保留给后续聚合接口，两者职责不得混用。
D-015：当前用户尚未开始课程时，`GET /api/v1/courses/:courseId/progress` 返回稳定的 `NOT_STARTED` 结构，不返回 `404`，不自动创建 `CourseLearningRecord` 或 `ChapterLearningRecord`。
D-016：我的学习列表接口采用 `GET /api/v1/users/me/learning`，使用 `page/pageSize` 分页，默认按 `lastLearnedAt DESC`、`updatedAt DESC` 排序，只返回已存在 `CourseLearningRecord` 的课程。
D-017：`CP-008A-01` 的学习进度采用章节完成型模型，仅实现章节 `start` 与 `complete`，不实现章节百分比进度、学习时长、播放位置或客户端上报任意学习状态。
D-018：章节 `start` 接口自动创建缺失的课程学习记录并保持幂等；章节 `complete` 不允许跳过 `start`，有小测时必须验证已通过，当前阶段若不存在可验证的小测通过模型则不得绕过。
D-019：章节小测采用“一章节最多一个正式 quiz”的模型，`Quiz.chapterId` 必须唯一。
D-020：`CP-008B-01` 第一阶段章节小测只支持 `SINGLE_CHOICE` 与 `TRUE_FALSE`，不提前落地 `FILL_BLANK`、`CODE_OUTPUT`、`CODE_INPUT` 或其他题型。
D-021：`GET /api/v1/chapters/:chapterId/quiz` 允许在章节 `start` 之前查看，但不得自动创建任何学习记录或 attempt。
D-022：`POST /api/v1/chapters/:chapterId/quiz/submit` 必须要求当前用户已存在该章节的 `ChapterLearningRecord`；未开始章节不得自动补建记录。
D-023：每次合法小测提交都创建新的 `QuizAttempt`，允许无限次重试；只要历史上存在任意一次 `passed=true`，就满足章节完成的小测前置条件。
D-024：小测提交成功只代表用户具备完成章节的资格，不自动调用 `POST /api/v1/chapters/:chapterId/complete`。
D-025：`scorePercent` 仅用于展示，按四舍五入返回整数；`passed` 必须使用未四舍五入的原始得分比例计算，避免边界误判。
