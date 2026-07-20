D-001：ChatGPT 负责项目统筹与验收，Codex 负责代码执行，用户负责监督与最终决策。
D-002：采用单工单、单验收、单提交模式。
D-003：现有 docs 文档为项目约束源，未经授权不得修改。
D-004：项目暂时继续使用 Node.js v24.15.0；此前 Nest CLI 故障已证实为 node_modules 安装产物损坏。
D-005：运行日志不得提交到 Git。
D-006：题型扩展为 SINGLE_CHOICE、TRUE_FALSE、FILL_BLANK、CODE_OUTPUT、CODE_INPUT；保留 CODE_OUTPUT，不与代码输入题合并。
D-007：CODE_INPUT 第一版采用多参考答案加字符串标准化匹配，不执行用户代码，不引入 Docker、沙箱、测试用例执行或 AI 判分。
D-008：普通用户开发态 Mock 登录复用正式接口 `POST /api/v1/auth/wechat-login`，不新增 `/api/v1/auth/mock-login`。
D-009：Mock 登录仅在非生产环境且显式开启时生效；生产环境必须拒绝 Mock code。
D-010：普通用户正式模型以 UUID `User` 与 `UserSession` 为准，不继续扩大临时 `Int + username` 用户结构的使用范围。
D-011：普通用户认证落地前先完成受控用户迁移，不执行数据库 reset，且必须保护现有课程、章节与内容块数据。
D-012：公开内容保持匿名可读，受保护功能按需登录，小程序不强制启动即登录。
D-013：`CP-007C-01C` 拆分为 `CP-007C-01C-1 当前用户资料更新与账号软注销` 与 `CP-007C-01C-2 用户概览`；`/users/me/overview` 延后到 `CourseLearningRecord`、`ChapterLearningRecord`、`WrongQuestion`、`BattleRecord`、`Post` 落地后再实现。
D-014：`FileAsset` 落地前，`avatarUrl` 采用过渡校验：仅允许合法 `https` URL，最大长度 2048 个字符，不下载远程资源，不校验资源是否真实存在，也不校验 `FileAsset` 归属；`FileAsset` 模型落地后再升级为平台上传资源归属校验。
D-015：已注销用户使用同一 `openId` 再次登录时，一律返回 `USER_DELETED`，不恢复账号，不创建新用户，也不创建新的 `UserSession`。
D-016：单课程学习进度采用资源路径 `GET /api/v1/courses/:courseId/progress`；全局学习进度路径 `GET /api/v1/learning/progress` 保留给后续聚合接口，两者职责不得混用。
D-017：当前用户尚未开始课程时，`GET /api/v1/courses/:courseId/progress` 返回稳定的 `NOT_STARTED` 结构，不返回 `404`，不自动创建 `CourseLearningRecord` 或 `ChapterLearningRecord`。
D-018：我的学习列表接口采用 `GET /api/v1/users/me/learning`，使用 `page/pageSize` 分页，默认按 `lastLearnedAt DESC`、`updatedAt DESC` 排序，只返回已存在 `CourseLearningRecord` 的课程。
D-019：`CP-008A-01` 的学习进度采用章节完成型模型，仅实现章节 `start` 与 `complete`，不实现章节百分比进度、学习时长、播放位置或客户端上报任意学习状态。
D-020：章节 `start` 接口自动创建缺失的课程学习记录并保持幂等；章节 `complete` 不允许跳过 `start`，有小测时必须验证已通过，当前阶段若不存在可验证的小测通过模型则不得绕过。
