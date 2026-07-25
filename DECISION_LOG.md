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
D-026：V1.0 错题本以 `QuizAnswer` 为唯一事实来源，不新增 `WrongQuestion` 模型或数据表；列表按 `questionId` 聚合展示，同题允许多次错误记录，后续答对不自动移除，不提供 `masteryStatus`、收藏、删除或错题练习提交接口；详情允许显示正确答案和解析；旧 `/api/v1/wrong-questions/*` 路径退出 V1.0 正式契约，正式路径统一为 `/api/v1/users/me/wrong-questions/*`。
D-027：V1.0 学习中心复用既有学习记录模型与接口：课程列表使用 `GET /api/v1/users/me/learning`，单课程进度使用 `GET /api/v1/courses/:courseId/progress`；当前不新增 `LearningHistory`、`StudyRecord`、`LearningEvent` 或 `/api/v1/learning/*` 聚合接口，`GET /api/v1/learning/progress` 保留给后续全局学习中心能力。
D-028：统一错题中心采用单一错题模型与来源扩展策略，V1.0 当前仅接入 LEARNING 来源，后续服务对战系统时必须复用同一错题中心并接入 BATTLE 来源；不得拆分为 LearningWrongQuestion、BattleWrongQuestion 或 BattleWrongAnswerBook 等场景专属模型；当前阶段不修改数据库、QuizAnswer、wrong-question 接口或任何源码，来源字段与统一作答抽象在对战系统设计阶段再确定。
D-029：微信小程序学习中心不新增 tabBar，继续复用现有个人中心页作为入口；学习中心页面路径统一为 `pages/learning/index`、`pages/learning/course-progress`，统一错题中心页面路径统一为 `pages/wrong-question/index`、`pages/wrong-question/detail`；课程与章节学习继续复用既有 `pages/course/detail` 与 `pages/chapter/detail`，当前 CP-009C 只做页面契约收口，不实现源码。
D-030：Battle V1 的正式产品基线冻结为“1v1 真人限时编程知识对战”，仅支持 `RANKED` 随机匹配与 `FRIEND` 好友邀请两种模式；历史文档中的“人机对战”及 `BattleRecord / BattleQuestion / BattleAnswer` 旧草案退出当前 V1 正式基线，仅作历史参考。
D-031：Battle V1 的核心对局规则冻结为：每局总时长固定 `180s`、题量配置范围 `15~20` 且默认 `20`、双方使用完全相同的题目/题序/选项序、计分公式固定为 `correctCount * 2 - wrongCount`、未作答记 `0` 分、总分允许为负数、平局不使用答题用时打破、判分/计时/结算必须由服务端权威完成、已提交答案不可修改、结算前不得向客户端泄露正确答案与解析。
D-032：Battle 题库不得新建独立 `BattleQuestionBank`；应优先复用并最小兼容扩展现有 `QuizQuestion` / `QuizOption` 体系，与课程 Quiz 共享同一来源题库；后续 schema 阶段需补齐 `CODE_FILL`、结构化题干与解析、结构化选项、表现类型和 Battle 出题元数据，但本阶段只做设计，不修改 `schema.prisma`。
D-033：Battle 错题必须接入现有统一错题中心并作为未来 `BATTLE` 来源，禁止建设独立 Battle 错题本或独立 WrongQuestion 持久化模型；只有“服务端成功保存且判定错误”的 Battle 作答进入错题聚合，未作答、跳过未提交、超时未提交和失败请求均不计入错题。
D-034：`CP-011B` 正式采用共享 Quiz 题库扩展方案：扩展 `QuestionType` 支持 `CODE_FILL`，并在 `QuizQuestion` / `QuizOption` 上新增结构化题干、解析、选项、Battle 展示类型、难度、可用标记、标准答案、规范化配置、知识点与语言字段；不创建独立 `BattleQuestionBank`。
D-035：`BattleQuestionSnapshot` 是 Battle 历史题目唯一快照来源，必须保存题干、选项、正确答案、解析、知识点和来源题目引用；历史复盘与后续错题联动优先读取快照，不以题库实时内容为准。
D-036：`BattleProfile.rating` 是后续 Battle 排位的正式权威来源；`User.battleRating` 在 `CP-011B` 暂时保留为兼容字段，仅用于首次初始化 `BattleProfile` 时继承旧值与兼容现有用户返回结构，不引入当前阶段 Battle rating 双写逻辑；`winRate` 与 `currentRank` 不做冗余持久化，统一按查询时计算。
D-037：`BattleMatchQueue` 在 V1 采用“每个用户一条唯一队列记录”的方案，`userId` 全局唯一，通过状态循环复用同一记录来保证同一用户最多存在一条活跃 `SEARCHING` 记录，不在 `CP-011B` 设计独立历史队列流水。
D-038：Battle V1 在基础设施层继续坚持“数据库队列 + REST 轮询”路线，不引入 Redis、WebSocket 或任意代码执行沙箱；`CODE_FILL` 仅允许字符串规范化和答案匹配，不执行用户代码。
D-039：`CP-011C` 的随机匹配采用“join/status 轮询触发惰性匹配”的后端策略，不引入后台常驻匹配进程；`POST /battles/matchmaking/join` 与 `GET /battles/matchmaking/status` 都允许在事务内尝试一次匹配。
D-040：`BattleMatchQueue` 在 `CP-011C` 继续复用单记录策略，`SEARCHING` 记录通过 `expiresAt` 惰性过期并在 `join/status/cancel` 流程中自修复，不新增匹配历史流水模型。
D-041：随机匹配成功采用“事务内条件 `updateMany` 抢占双方 `SEARCHING` 队列记录，再原子创建 `RANKED` 的 `WAITING` 房间与双方参与者” 的并发保护方案；若候选抢占失败，则回滚当前候选尝试并继续搜索，不依赖先查后改的非原子流程。
D-042：好友邀请令牌采用 `crypto.randomBytes` 生成的 URL-safe 随机 token，并依赖数据库唯一约束与有限重试处理极低概率冲突；分享路径只携带 `invitationToken`，不携带任何登录凭据。
D-043：好友房 `seat 2` 抢占依赖 `@@unique([battleRoomId, seat])` 与事务内 `BattleParticipant.create` 协同保护；唯一约束冲突统一视为“房间已满”或“同一用户重复加入”的幂等场景，不允许出现第三位参与者。
D-044：单用户单活跃房间约束在 `CP-011C` 仍以事务内活跃房间查询和队列状态校验为主，数据库层尚未实现部分唯一索引；这是当前阶段已知技术债，后续可在更强数据库约束或锁策略下继续收紧。
D-045：`CP-011D` 正式固定 Battle room 状态语义：`WAITING` 表示未满足 ready 前置条件，`READY` 表示双人已在房且至少一人已 ready，`COUNTDOWN` 表示双方均 ready 且题目快照、`startedAt`、`expiresAt` 已在事务内冻结，`IN_PROGRESS` 表示服务端时间已到正式答题窗口；`COUNTDOWN -> IN_PROGRESS` 采用服务端时间驱动的惰性推进，不引入后台常驻定时任务。
D-046：Battle 题目与选项顺序只允许在房间启动时生成一次，并写入 `BattleQuestionSnapshot`；后续下发、判分、恢复和复盘均以快照为唯一依据，不回读实时 `QuizOption.isCorrect` 或题库顺序。
D-047：`GET /api/v1/battles/:battleId/questions` 在 `startedAt` 之前只返回 `status`、`startedAt`、`expiresAt`、`serverTime`，不提前下发题干正文；服务端时间到达 `startedAt` 后再进入题目下发与答题窗口。
D-048：`CODE_FILL` 在 `CP-011D` 只做字符串规范化匹配，规范化顺序固定为“换行归一化 -> trim -> collapseWhitespace -> 按需大小写归一化”；禁止执行用户代码、`eval`、`Function`、`vm`、shell 或任何真实编译运行。
D-049：Battle 单题提交正式采用双重唯一约束 `@@unique([participantId, clientRequestId])` 与 `@@unique([participantId, battleQuestionSnapshotId])`；相同 `clientRequestId` 的安全重试返回首个提交摘要，不重复计分；不同 `clientRequestId` 重答同题一律拒绝。
D-050：Battle 对战进行中不返回正确性、正确答案、acceptedAnswers、解析、实时得分、对手答案或对手答题统计；仅允许返回自己的已答题数量、已提交原始答案、`startedAt`、`expiresAt`、`serverTime` 与房间状态。
