# Versioned Seed Data

本目录用于维护可审查、可重复执行的学习内容模板。

## 当前规则

- 版本目录按 `v1`、`v2` 递增维护。
- 每门课程使用稳定业务标识，例如 `course.slug`、`chapter.key`、`lesson.key`、`question.key`。
- 导入脚本会基于这些业务标识生成稳定 UUID，并通过 `upsert` 幂等写入。
- 当前数据库 **没有 `Lesson` 表**。`Lesson` 只作为导入源层的业务抽象存在，导入时会被编译为：
  - `CourseChapter` 下的 `ChapterContentBlock`
  - 章节级 `Quiz` / `QuizQuestion` / `QuizOption`
- 为了保留课时归属，导入脚本会把 `lesson:<lesson-key>` 写入题目的 `knowledgeTags`。
- `course.category` 用于课程筛选，建议使用稳定的大写分类值，例如 `FRONTEND`、`BACKEND`、`DATABASE`、`GENERAL`。
- `course.language` 用于显示具体技术方向，例如 `JavaScript`、`Python`、`Java`、`MySQL`。

## 目录结构

- `types.ts`：内容模板类型定义
- `index.ts`：当前启用的课程种子入口
- `v1/javascript-starter.ts`：首批 JavaScript 入门示例课程

## 新增或更新课程内容

后续可以直接提供课程正文和题目文本，再按 `SeedCourse` 模板整理后导入。推荐流程：

1. 在新的版本目录中新增课程文件，例如 `v2/python-starter.ts`。
2. 为课程、章节、课时和题目分别确定不会随文案调整而变化的 `slug` 或 `key`。
3. 将正文拆分为 `TEXT`、`HEADING`、`CODE`、`TIP`、`WARNING`、`EXAMPLE` 内容块。
4. 为每道题填写题干、题型、选项或标准答案、解析、难度、分值和 Battle 可用状态。
5. 在 `index.ts` 中注册新课程，再执行 `npm run seed:content`。

同一业务标识再次导入时会更新对应内容，不会创建重复课程、章节或题目，也不会清除用户已有的学习记录。不要为了修改标题或正文而更换稳定 `slug` / `key`，否则导入器会把它识别为新内容。

可提供的原始材料包括：

- 课程名称、简介、方向、语言和适合人群
- 章节与课时顺序
- Markdown、纯文本或结构化正文
- 代码示例、图片公开地址和说明文字
- 单选题、判断题、普通填空题、代码填空题、选项、标准答案、解析、难度和知识点

导入前应人工复核内容准确性、答案唯一性、图片可访问性以及是否允许进入 Battle 题池。

## 执行命令

```bash
npm run prisma:generate
npm run seed:content
```

日常新增或更新内容只需要执行 `npm run seed:content`，不需要清空数据库。该命令采用幂等 `upsert`，适合保留现有账号和学习记录的开发环境。

## 开发环境清空并重新导入

仅限 **独立的本地开发数据库** 使用，避免影响已有用户数据：

```bash
npx prisma migrate reset --force --config prisma.config.ts
```

由于 `server/package.json` 已将 Prisma 默认 seed 指向 `npm run seed:content`，执行 `migrate reset` 后会自动重新导入本目录中的版本化内容。

如果你不希望执行默认 seed，也可以手动分步执行：

```bash
npx prisma migrate reset --force --skip-seed --config prisma.config.ts
npm run seed:content
```

## 当前已知约束

- 章节测验和练习室支持 `SINGLE_CHOICE`、`TRUE_FALSE`、`FILL_BLANK`、`CODE_FILL`。文本题使用 `acceptedAnswers` 定义一个或多个标准答案，并可通过 `answerNormalization` 控制空白、换行和大小写规则。
- `FILL_BLANK` 默认去除首尾空白、统一换行、合并连续空白且忽略大小写，适合术语、关键字和简短结果。
- `CODE_FILL` 默认去除首尾空白并统一换行，但保留大小写和内部空白，适合代码片段；单题输入最长 4000 字符。
- `FILL_BLANK` 当前仅用于学习测验和练习室，不进入 Battle。Battle 题池支持 `SINGLE_CHOICE` 和 `CODE_FILL`。

普通填空题示例：

```ts
{
  key: 'javascript-short-name',
  type: 'FILL_BLANK',
  title: 'JavaScript 的常用简称是什么？',
  explanation: 'JavaScript 常简称为 JS。',
  difficulty: 'EASY',
  score: 10,
  isBattleEnabled: false,
  acceptedAnswers: ['JavaScript', 'JS'],
}
```

代码填空题示例：

```ts
{
  key: 'print-value',
  type: 'CODE_FILL',
  title: '补全代码，使控制台输出 value。',
  explanation: 'console.log 用于向控制台输出内容。',
  difficulty: 'EASY',
  score: 10,
  isBattleEnabled: true,
  battlePresentation: 'INPUT_CODE_FILL',
  programmingLanguage: 'javascript',
  acceptedAnswers: ['console.log(value)'],
}
```
