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

## 目录结构

- `types.ts`：内容模板类型定义
- `index.ts`：当前启用的课程种子入口
- `v1/javascript-starter.ts`：首批 JavaScript 入门示例课程

## 执行命令

```bash
npm run prisma:generate
npm run seed:content
```

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

- `QuestionType.CODE_FILL` 已存在于 schema 和 Battle 取题链路中，但当前章节测验提交 API 仍按 `selectedOptionId` 读取答案，尚不支持正式导入 `CODE_FILL` 题进入章节测验。
- 因此，当前示例课程使用 `SINGLE_CHOICE` 题型构建章节测验与 Battle 题池。
