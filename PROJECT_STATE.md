当前版本：v0.0.1
当前日期：2026-07-27
当前阶段：CP-011I3 Battle V1 体验版发布检查
当前任务：CP-011I3 Battle V1 体验版发布检查
状态：Battle V1 代码与自动化测试已达到发布前静态门槛，但当前项目仍不满足体验版发布条件，等待修复环境与发布配置阻塞项

Battle V1 当前结论：
- Battle V1 后端主链路已完成：profile、leaderboard、history、history detail、随机匹配、好友房、ready、COUNTDOWN、题目下发、单题提交、交卷、认输、结果查询、BATTLE 错题联动。
- Battle V1 小程序主链路页面已落地：Battle 首页、排行榜、随机匹配、好友房、房间、答题、结果、战绩、复盘，以及统一错题中心 BATTLE 来源接入。
- Battle 页面异常态与交互体验已完成一轮收口：409/状态冲突提示、网络失败提示、重复点击保护、分页失败重试、错误态与空态中文化、返回行为统一。
- Battle V1 现阶段可视为“功能完成，待发布收口”。

自动化测试状态：
- miniapp TypeScript：通过
  命令：`node server/node_modules/typescript/bin/tsc --noEmit -p miniapp/tsconfig.json`
- server build：通过
  命令：`npm run build`
- Battle 单测：通过
  命令：`npx jest src/battle --runInBand`
  结果：12 个测试套件，75 个测试全部通过
- Battle E2E：通过
  命令：`npm run test:e2e -- battle.e2e-spec.ts`
  结果：1 个测试套件，4 个测试全部通过
- wrong-question 回归 E2E：通过
  命令：`npm run test:e2e -- wrong-question.e2e-spec.ts`
  结果：1 个测试套件，2 个测试全部通过
- `git diff --check`：通过
  当前仅存在 LF/CRLF warning，无 whitespace error 或冲突标记

人工验收状态：
- 已有人工运行态结论：
  微信开发者工具可正常编译运行
  Development Mock Login 登录正常
  登录态保存正常
  受保护页面访问正常
  accessToken 异常后的自动 refresh 未发现报错
  Console 未发现新的业务异常
- Battle 运行态联调已完成多轮收口，但本文件未把“双账号体验版最终验收完成”写成已完成结论。

当前体验版发布阻塞项：
- 小程序 API 基地址仍硬编码为本地地址：
  `miniapp/utils/config.ts` 当前为 `http://127.0.0.1:3000/api/v1`
  这不满足体验版或真机环境访问要求。
- 当前仓库尚未提供明确的 Battle 测试环境 API 切换方案。
- 登录页正式微信登录仍依赖后端微信正式配置；当前可确认开发环境 Mock 登录可用，但体验版发布不能依赖 `develop` 环境专用 Mock 入口。
- 工作区当前存在未提交改动，尚未按功能拆分形成可发布提交。

当前非阻塞已知限制：
- 统一错题中心已接入 `LEARNING` 与 `BATTLE` 两种来源，但前端仍未开放课程/章节筛选，原因是缺少完整筛选元数据接口。
- Battle 与 wrong-question 页面已完成静态与后端自动化验证，但体验版前仍建议再执行一轮微信开发者工具真机网络联调。
- 学习主链路整体仍未闭环，项目整体仍不是完整 V1 发布状态；本次检查仅针对 Battle V1 子模块。

本地开发与测试环境配置现状：
- 本地开发默认小程序 API：
  `miniapp/utils/config.ts` → `http://127.0.0.1:3000/api/v1`
- 后端本地启动命令：
  `cd server && npm run start:dev`
- 当前仓库中未看到面向体验版发布的 Battle 小程序测试环境 API 基址配置落点。

已知页面注册状态：
- `miniapp/app.json` 已注册以下 Battle 页面：
  `pages/battle/index`
  `pages/battle/leaderboard`
  `pages/battle/matchmaking`
  `pages/battle/friend-room`
  `pages/battle/room`
  `pages/battle/play`
  `pages/battle/history`
  `pages/battle/history-detail`
  `pages/battle/result`
- 错题中心页面注册完整：
  `pages/wrong-question/index`
  `pages/wrong-question/detail`

当前建议：
- 先完成体验版 API 基址与环境切换方案。
- 明确体验版环境的真实登录策略，不能依赖仅 `develop` 可见的 Mock 登录入口。
- 将当前 Battle 小程序改动、Battle 后端改动、错题联动改动按功能拆分提交。
- 完成上述三项后，再重新执行一轮 CP-011I3 发布检查。
