D-001：ChatGPT 负责项目统筹与验收，Codex 负责代码执行，用户负责监督与最终决策。
D-002：采用单工单、单验收、单提交模式。
D-003：现有 docs 文档为项目约束源，未经授权不得修改。
D-004：项目暂时继续使用 Node.js v24.15.0；此前 Nest CLI 故障已证实为 node_modules 安装产物损坏。
D-005：运行日志不得提交到 Git。
D-006：题型扩展为 SINGLE_CHOICE、TRUE_FALSE、FILL_BLANK、CODE_OUTPUT、CODE_INPUT；保留 CODE_OUTPUT，不与代码输入题合并。
D-007：CODE_INPUT 第一版采用多参考答案加字符串标准化匹配，不执行用户代码，不引入 Docker、沙箱、测试用例执行或 AI 判分。
