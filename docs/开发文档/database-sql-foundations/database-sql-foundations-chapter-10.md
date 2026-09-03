# 第10章：综合项目：从数据模型到课程分析报表

章节简介：把查询、JOIN、聚合、CTE、约束、事务和性能思维串成一个完整学习平台数据流程。
预计学习时间：90 分钟

章节学习目标：
- 理解并能应用先把业务问题翻译成“结果粒度”
- 理解并能应用构建“课程统计”基础 CTE
- 理解并能应用筛选“有意义的统计样本”
- 理解并能应用把排行榜排序和分页规则说清楚
- 理解并能应用用事务完成“选课”写入流程
- 理解并能应用从需求到 SQL 的完整检查清单

[标题]
本章统一场景

[文本]
使用students/courses/enrollments/course_capacity，目标是课程统计榜和安全选课流程。

---

## 课时 1：先把业务问题翻译成“结果粒度”

课时简介：综合项目第一步不是写SELECT，而是明确“一行代表什么”。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
同一个系统可以输出“每名学生一行”“每条选课一行”“每门课程一行”。如果粒度没定，JOIN后重复、GROUP BY列选择都会混乱。

[标题]
先建立一个能看见的模型

[文本]
需求“课程排行榜”→一行一门课程；“选课明细”→一行一条enrollment；“学生画像”→一行一名学生。

[代码 language=sql]
-- 目标：每门课程一行
SELECT c.id, c.title, COUNT(e.student_id) AS enroll_count
FROM courses c LEFT JOIN enrollments e ON c.id=e.course_id
GROUP BY c.id, c.title;
[/代码]

[文本]
LEFT JOIN让0人课程也出现，GROUP BY课程把多条选课收成课程粒度。

[示例 title=最小可验证示例]
说明：围绕本章统一数据，执行一条可以直接验证结果的 SQL。
语言：sql

-- 目标：每门课程一行
SELECT c.id, c.title, COUNT(e.student_id) AS enroll_count
FROM courses c LEFT JOIN enrollments e ON c.id=e.course_id
GROUP BY c.id, c.title;
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数据值换掉，先在纸上预测结果，再执行 SQL 验证。能解释每一行为什么留下或被排除，才算真正理解。

[警告 title=常见错误]
看到重复课程名就DISTINCT，却没先确认自己其实查询的是“选课明细”粒度。

[标题]
本课小结

[文本]
能先声明结果一行代表什么。

### 课时题目

#### 题目 1

题型：SINGLE_CHOICE
题干：课程排行榜最自然结果粒度？

难度：EASY
分值：10
知识点：结果粒度
是否用于 Battle：否

选项：
- A. 每门课程一行 [正确]
- B. 每个字符一行
- C. 每个数据库一行
- D. 每个索引一行

解析：
排行对象是课程。

#### 题目 2

题型：SINGLE_CHOICE
题干：0人课程也要显示为什么用LEFT JOIN？

难度：MEDIUM
分值：10
知识点：综合JOIN
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：结果预测

选项：
- A. 保留courses左表无匹配行 [正确]
- B. 为了排序
- C. 为了删除NULL
- D. INNER也必定保留

解析：
左连接保留课程。

#### 题目 3

题型：SINGLE_CHOICE
题干：重复课程行出现时第一件事？

难度：HARD
分值：10
知识点：粒度
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：结果预测

选项：
- A. 检查查询粒度和一对多关系 [正确]
- B. 立即DISTINCT
- C. 删除enrollments
- D. 关闭外键

解析：
先理解重复原因。


---

## 课时 2：构建“课程统计”基础 CTE

课时简介：把复杂报表拆成可单独验证的阶段。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
先做course_stats，只负责每门课程的选课数/平均分。这个中间结果正确后，再加入教师名、排名或筛选。

[标题]
先建立一个能看见的模型

[文本]
每个CTE应有清晰粒度和列含义，让后续像搭积木。

[代码 language=sql]
WITH course_stats AS (
  SELECT c.id, c.title, COUNT(e.student_id) AS cnt, AVG(e.score) AS avg_score
  FROM courses c LEFT JOIN enrollments e ON c.id=e.course_id
  GROUP BY c.id, c.title
)
SELECT * FROM course_stats;
[/代码]

[文本]
先验证每门课程只有一行、0人课程cnt=0、无成绩avg可能NULL。

[示例 title=最小可验证示例]
说明：围绕本章统一数据，执行一条可以直接验证结果的 SQL。
语言：sql

WITH course_stats AS (
  SELECT c.id, c.title, COUNT(e.student_id) AS cnt, AVG(e.score) AS avg_score
  FROM courses c LEFT JOIN enrollments e ON c.id=e.course_id
  GROUP BY c.id, c.title
)
SELECT * FROM course_stats;
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数据值换掉，先在纸上预测结果，再执行 SQL 验证。能解释每一行为什么留下或被排除，才算真正理解。

[警告 title=常见错误]
一个CTE里同时做十件事，结果错时无法判断是哪一步。

[标题]
本课小结

[文本]
能设计单一职责的统计CTE。

### 课时题目

#### 题目 4

题型：SINGLE_CHOICE
题干：course_stats应保持什么粒度？

难度：EASY
分值：10
知识点：CTE粒度
是否用于 Battle：否

选项：
- A. 每门课程一行 [正确]
- B. 每名学生一行
- C. 每条SQL一行
- D. 每个字段一行

解析：
由GROUP BY课程决定。

#### 题目 5

题型：SINGLE_CHOICE
题干：COUNT(e.student_id)对0人课程结果？

难度：MEDIUM
分值：10
知识点：LEFT JOIN聚合
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：结果预测

选项：
- A. 0 [正确]
- B. 1
- C. NULL
- D. 报错

解析：
右侧NULL不计。

#### 题目 6

题型：CODE_FILL
题干：补全CTE开头。

难度：HARD
分值：10
知识点：CTE
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码：
```sql
____ course_stats AS (
  SELECT c.id, COUNT(e.student_id) cnt FROM courses c LEFT JOIN enrollments e ON c.id=e.course_id GROUP BY c.id
)
SELECT * FROM course_stats;
```

可接受答案：
```sql
WITH
```

```sql
with
```

判题设置：
- 区分大小写：否
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
WITH定义CTE。

标准完整代码：
```sql
WITH course_stats AS (
  SELECT c.id, COUNT(e.student_id) cnt FROM courses c LEFT JOIN enrollments e ON c.id=e.course_id GROUP BY c.id
)
SELECT * FROM course_stats;
```


---

## 课时 3：筛选“有意义的统计样本”

课时简介：理解统计结果也有样本量问题。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
一门课只有1个学生得100分，平均100并不一定适合和100人课程直接比较。报表需求可能要求至少5名有成绩学生才进入排行。

[标题]
先建立一个能看见的模型

[文本]
使用HAVING COUNT(e.score)>=5在分组阶段过滤样本不足课程；COUNT(score)只统计有成绩者。

[代码 language=sql]
SELECT c.id, c.title, AVG(e.score) AS avg_score
FROM courses c JOIN enrollments e ON c.id=e.course_id
GROUP BY c.id, c.title
HAVING COUNT(e.score) >= 5;
[/代码]

[文本]
HAVING作用在每门课程统计之后。若某课10人选但只有4人有score，COUNT(e.score)=4，不进入排行。

[示例 title=最小可验证示例]
说明：围绕本章统一数据，执行一条可以直接验证结果的 SQL。
语言：sql

SELECT c.id, c.title, AVG(e.score) AS avg_score
FROM courses c JOIN enrollments e ON c.id=e.course_id
GROUP BY c.id, c.title
HAVING COUNT(e.score) >= 5;
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数据值换掉，先在纸上预测结果，再执行 SQL 验证。能解释每一行为什么留下或被排除，才算真正理解。

[警告 title=常见错误]
用COUNT(*)当“已出成绩人数”，但未出成绩的enrollment行也会被计数。

[标题]
本课小结

[文本]
能选择正确计数列支撑统计条件。

### 课时题目

#### 题目 7

题型：SINGLE_CHOICE
题干：统计“已有成绩人数”更合适COUNT什么？

难度：EASY
分值：10
知识点：统计样本
是否用于 Battle：否

选项：
- A. COUNT(e.score) [正确]
- B. COUNT(*)一定
- C. COUNT(NULL)
- D. SUM(title)

解析：
score NULL不计。

#### 题目 8

题型：SINGLE_CHOICE
题干：筛每课至少5个成绩应放？

难度：MEDIUM
分值：10
知识点：HAVING
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：结果预测

选项：
- A. HAVING [正确]
- B. WHERE AVG
- C. ORDER BY
- D. LIMIT

解析：
分组后条件。

#### 题目 9

题型：SINGLE_CHOICE
题干：10人选课但只有4个非NULL score，COUNT(e.score)是多少？

难度：HARD
分值：10
知识点：COUNT
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：结果预测

选项：
- A. 4 [正确]
- B. 10
- C. 0
- D. NULL

解析：
只计非NULL成绩。


---

## 课时 4：把排行榜排序和分页规则说清楚

课时简介：同分、稳定排序和LIMIT会直接影响用户看到谁。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
只`ORDER BY avg_score DESC LIMIT 10`时，同分课程的相对顺序可能没有稳定保证。可增加第二排序键如course_id，确保分页稳定。

[标题]
先建立一个能看见的模型

[文本]
先按avg_score降序，再按id升序作为tie-breaker。

[代码 language=sql]
SELECT id, title, avg_score
FROM course_stats
ORDER BY avg_score DESC, id ASC
LIMIT 10;
[/代码]

[文本]
平均分不同先看avg_score；只有相同时才用id决定顺序。这样同一数据集多次查询更容易得到稳定页。

[示例 title=最小可验证示例]
说明：围绕本章统一数据，执行一条可以直接验证结果的 SQL。
语言：sql

SELECT id, title, avg_score
FROM course_stats
ORDER BY avg_score DESC, id ASC
LIMIT 10;
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数据值换掉，先在纸上预测结果，再执行 SQL 验证。能解释每一行为什么留下或被排除，才算真正理解。

[警告 title=常见错误]
分页只按一个大量重复的列排序，翻页时可能看到记录跳动/重复。

[标题]
本课小结

[文本]
能解释多列ORDER BY的优先级。

### 课时题目

#### 题目 10

题型：SINGLE_CHOICE
题干：多列ORDER BY先比较哪个？

难度：EASY
分值：10
知识点：ORDER BY
是否用于 Battle：否

选项：
- A. 写在前面的avg_score [正确]
- B. 最后的id
- C. 随机
- D. LIMIT

解析：
排序键有优先顺序。

#### 题目 11

题型：SINGLE_CHOICE
题干：加id作为第二排序键目的之一？

难度：MEDIUM
分值：10
知识点：稳定排序
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：结果预测

选项：
- A. 同分时提供稳定次序 [正确]
- B. 提高平均分
- C. 删除重复
- D. 自动加索引

解析：
tie-breaker。

#### 题目 12

题型：CODE_FILL
题干：补全降序。

难度：HARD
分值：10
知识点：排序
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码：
```sql
ORDER BY avg_score ____ , id ASC
```

可接受答案：
```sql
DESC
```

```sql
desc
```

判题设置：
- 区分大小写：否
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
平均分高在前。

标准完整代码：
```sql
ORDER BY avg_score DESC, id ASC
```


---

## 课时 5：用事务完成“选课”写入流程

课时简介：把查询课程的知识落到一条会修改多表的业务链。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
选课可能涉及检查课程状态、扣名额、插入enrollment。任一步失败都不能留下半完成状态。

[标题]
先建立一个能看见的模型

[文本]
用事务和条件UPDATE抢名额，再检查影响行数；成功才插入选课，最后COMMIT。唯一约束(student_id,course_id)还能防重复选课。

[代码 language=sql]
BEGIN;
UPDATE course_capacity SET remaining=remaining-1
WHERE course_id=10 AND remaining>0;
-- 应检查影响行数=1
INSERT INTO enrollments(student_id,course_id) VALUES(3,10);
COMMIT;
[/代码]

[文本]
如果UPDATE影响0行说明无名额，不应继续INSERT；若INSERT因重复选课失败，则事务ROLLBACK恢复名额。

[示例 title=最小可验证示例]
说明：围绕本章统一数据，执行一条可以直接验证结果的 SQL。
语言：sql

BEGIN;
UPDATE course_capacity SET remaining=remaining-1
WHERE course_id=10 AND remaining>0;
-- 应检查影响行数=1
INSERT INTO enrollments(student_id,course_id) VALUES(3,10);
COMMIT;
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数据值换掉，先在纸上预测结果，再执行 SQL 验证。能解释每一行为什么留下或被排除，才算真正理解。

[警告 title=常见错误]
先扣名额并提交，再插选课；第二步失败就会永久少一个名额。

[标题]
本课小结

[文本]
能设计基本原子选课事务。

### 课时题目

#### 题目 13

题型：SINGLE_CHOICE
题干：条件UPDATE影响0行通常意味着？

难度：EASY
分值：10
知识点：事务业务
是否用于 Battle：否

选项：
- A. 未抢到可用名额，应停止 [正确]
- B. 一定成功
- C. 应继续INSERT
- D. 课程自动删除

解析：
条件未满足。

#### 题目 14

题型：SINGLE_CHOICE
题干：INSERT重复选课失败且已扣名额时应？

难度：MEDIUM
分值：10
知识点：ROLLBACK
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：结果预测

选项：
- A. ROLLBACK恢复整个事务 [正确]
- B. 只忽略错误COMMIT
- C. 删除学生
- D. 加DISTINCT

解析：
保持原子性。

#### 题目 15

题型：SINGLE_CHOICE
题干：防止同一学生重复选同一课程可加什么？

难度：HARD
分值：10
知识点：唯一约束
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：结果预测

选项：
- A. UNIQUE(student_id, course_id) [正确]
- B. ORDER BY
- C. AVG
- D. LIKE

解析：
组合唯一约束。


---

## 课时 6：从需求到 SQL 的完整检查清单

课时简介：把课程内容变成可重复使用的方法。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
面对一个新需求，按“粒度→表关系→过滤→聚合→排序→写入安全→性能证据”逐步检查，比凭记忆拼关键字更稳定。

[标题]
先建立一个能看见的模型

[文本]
最终报告：每门开放课程一行，至少5个成绩，显示人数/平均分，降序前10；查询可用CTE/JOIN/GROUP BY/HAVING/ORDER BY/LIMIT组合。

[代码 language=sql]
WITH stats AS (
  SELECT c.id,c.title,COUNT(e.score) graded,AVG(e.score) avg_score
  FROM courses c JOIN enrollments e ON c.id=e.course_id
  WHERE c.status='OPEN'
  GROUP BY c.id,c.title
  HAVING COUNT(e.score)>=5
)
SELECT * FROM stats
ORDER BY avg_score DESC,id ASC
LIMIT 10;
[/代码]

[文本]
逐阶段读：WHERE先排非OPEN课程；GROUP BY每课一组；HAVING筛样本；CTE形成统计；外层稳定排序并取10。

[示例 title=最小可验证示例]
说明：围绕本章统一数据，执行一条可以直接验证结果的 SQL。
语言：sql

WITH stats AS (
  SELECT c.id,c.title,COUNT(e.score) graded,AVG(e.score) avg_score
  FROM courses c JOIN enrollments e ON c.id=e.course_id
  WHERE c.status='OPEN'
  GROUP BY c.id,c.title
  HAVING COUNT(e.score)>=5
)
SELECT * FROM stats
ORDER BY avg_score DESC,id ASC
LIMIT 10;
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数据值换掉，先在纸上预测结果，再执行 SQL 验证。能解释每一行为什么留下或被排除，才算真正理解。

[警告 title=常见错误]
只要SQL能运行就算完成。还应验证边界数据、NULL、0关系、重复关系、并发写入和执行计划。

[标题]
本课小结

[文本]
能独立拆解并复核一条综合SQL。

### 课时题目

#### 题目 16

题型：SINGLE_CHOICE
题干：示例WHERE先过滤什么？

难度：EASY
分值：10
知识点：综合SQL
是否用于 Battle：否

选项：
- A. 非OPEN课程 [正确]
- B. 平均分低课程
- C. 少于5人的组
- D. 前10

解析：
WHERE在分组前按状态筛行。

#### 题目 17

题型：SINGLE_CHOICE
题干：HAVING再过滤什么？

难度：MEDIUM
分值：10
知识点：综合SQL
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：结果预测

选项：
- A. 非NULL成绩不足5个的课程组 [正确]
- B. 所有学生
- C. 表名
- D. 索引

解析：
组级条件。

#### 题目 18

题型：CODE_FILL
题干：补全最终限制条数。

难度：HARD
分值：10
知识点：综合SQL
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码：
```sql
ORDER BY avg_score DESC, id ASC
____ 10;
```

可接受答案：
```sql
LIMIT
```

```sql
limit
```

判题设置：
- 区分大小写：否
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
LIMIT限制结果条数。

标准完整代码：
```sql
ORDER BY avg_score DESC, id ASC
LIMIT 10;
```


---

## 第10章总结

[标题]
这一章真正学会了什么

[文本]
你已经能从业务需求确定查询粒度，设计表关系，写分析SQL，并为写入一致性和性能做基本保护。

现在你应该能够：

- 能先声明结果一行代表什么。
- 能设计单一职责的统计CTE。
- 能选择正确计数列支撑统计条件。
- 能解释多列ORDER BY的优先级。
- 能设计基本原子选课事务。
- 能独立拆解并复核一条综合SQL。

[提示 title=复习方式]
不要只重新看定义。盖住答案，用本章统一场景重新推一遍数据、代码或状态变化；能自己推出结果，才算掌握。

---

## 第10章综合挑战（不计分）

[标题]
完成“课程分析 + 选课”毕业挑战

[文本]
交付两部分：①开放课程排行SQL：每课一行、至少5个成绩、人数/平均分、稳定前10；②选课事务：抢名额、检查受影响行数、防重复、失败回滚。为每部分写3条边界测试数据并预测结果。
