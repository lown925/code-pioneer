# 第6章：用子查询和 CTE 表达“先算一步，再继续”

章节简介：学习标量子查询、IN、EXISTS、NOT EXISTS和CTE，并理解何时比JOIN更贴近意图。
预计学习时间：90 分钟

章节学习目标：
- 理解并能应用标量子查询把一个查询结果当成一个值
- 理解并能应用IN 子查询把动态结果当成集合
- 理解并能应用EXISTS 关心“有没有至少一条匹配”
- 理解并能应用NOT EXISTS 找“没有关系”的数据
- 理解并能应用CTE 用 WITH 给中间结果起名字
- 理解并能应用JOIN、子查询和 CTE 怎么选

[标题]
本章统一场景

[文本]
继续使用students/courses/enrollments，围绕“高于平均、开放课程、有无选课”逐步推导。

---

## 课时 1：标量子查询把一个查询结果当成一个值

课时简介：解决“高于全班平均分”这种先算基准再比较的问题。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
有些WHERE条件本身要依赖另一个查询结果。子查询先算AVG(score)=87.2，外层再逐行比较score>87.2。

[标题]
先建立一个能看见的模型

[文本]
只返回单值的子查询可以放在比较表达式中。若它意外返回多行，`>`这类标量比较通常会报错。

[代码 language=sql]
SELECT name, score
FROM students
WHERE score > (SELECT AVG(score) FROM students);
[/代码]

[文本]
平均87.2，所以小林92、小陈88、小王95高于平均；小周85、小吴76不保留。

[示例 title=最小可验证示例]
说明：围绕本章统一数据，执行一条可以直接验证结果的 SQL。
语言：sql

SELECT name, score
FROM students
WHERE score > (SELECT AVG(score) FROM students);
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数据值换掉，先在纸上预测结果，再执行 SQL 验证。能解释每一行为什么留下或被排除，才算真正理解。

[警告 title=常见错误]
没确认子查询会返回几行，就把多行结果放到`=`右边。查询形状必须和外层操作符匹配。

[标题]
本课小结

[文本]
能手算标量子查询的两阶段执行。

### 课时题目

#### 题目 1

题型：SINGLE_CHOICE
题干：内层AVG先得到？

难度：EASY
分值：10
知识点：子查询
是否用于 Battle：否

选项：
- A. 87.2 [正确]
- B. 92
- C. 5
- D. 436

解析：
全班平均。

#### 题目 2

题型：SINGLE_CHOICE
题干：最终高于平均的有几人？

难度：MEDIUM
分值：10
知识点：子查询
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：结果预测

选项：
- A. 3 [正确]
- B. 2
- C. 5
- D. 1

解析：
92/88/95。

#### 题目 3

题型：SINGLE_CHOICE
题干：标量比较右侧子查询通常应返回？

难度：HARD
分值：10
知识点：标量子查询
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：结果预测

选项：
- A. 一个值/一行一列 [正确]
- B. 任意多行
- C. 整张表所有列
- D. 必须0行

解析：
标量上下文要求单值。


---

## 课时 2：IN 子查询把动态结果当成集合

课时简介：让允许列表由另一张表产生，而不是写死。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
如果“只看已开放课程的选课”，开放课程ID会变化，不应该手写IN(10,20)。可以让子查询从courses动态返回开放ID集合。

[标题]
先建立一个能看见的模型

[文本]
外层`course_id IN (子查询)`逐条判断是否属于这个动态集合。

[代码 language=sql]
SELECT student_id, course_id, score
FROM enrollments
WHERE course_id IN (
  SELECT id FROM courses WHERE status='OPEN'
);
[/代码]

[文本]
如果OPEN课程只有10和30，外层只保留course_id为10或30的选课。课程状态改变后同一SQL自动得到新集合。

[示例 title=最小可验证示例]
说明：围绕本章统一数据，执行一条可以直接验证结果的 SQL。
语言：sql

SELECT student_id, course_id, score
FROM enrollments
WHERE course_id IN (
  SELECT id FROM courses WHERE status='OPEN'
);
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数据值换掉，先在纸上预测结果，再执行 SQL 验证。能解释每一行为什么留下或被排除，才算真正理解。

[警告 title=常见错误]
子查询SELECT了两个列，却放在单列IN中；形状不匹配。

[标题]
本课小结

[文本]
能用IN子查询表达动态集合。

### 课时题目

#### 题目 4

题型：SINGLE_CHOICE
题干：IN子查询的结果在外层更像？

难度：EASY
分值：10
知识点：IN子查询
是否用于 Battle：否

选项：
- A. 一个动态值集合 [正确]
- B. 排序规则
- C. 表名别名
- D. 事务日志

解析：
IN判断成员。

#### 题目 5

题型：SINGLE_CHOICE
题干：课程状态变化后是否需要改写死ID？

难度：MEDIUM
分值：10
知识点：动态集合
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：结果预测

选项：
- A. 不需要，子查询动态读取 [正确]
- B. 必须每次改SQL
- C. 只在JOIN时
- D. 只能重建表

解析：
查询数据决定集合。

#### 题目 6

题型：CODE_FILL
题干：补全关键字。

难度：HARD
分值：10
知识点：IN子查询
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码：
```sql
WHERE course_id ____ (SELECT id FROM courses WHERE status='OPEN')
```

可接受答案：
```sql
IN
```

```sql
in
```

判题设置：
- 区分大小写：否
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
IN接收子查询集合。

标准完整代码：
```sql
WHERE course_id IN (SELECT id FROM courses WHERE status='OPEN')
```


---

## 课时 3：EXISTS 关心“有没有至少一条匹配”

课时简介：从返回值切换到存在性判断。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
有时只需判断学生是否存在选课，而不需要子查询返回具体score。EXISTS只关心相关子查询是否能找到至少一行。

[标题]
先建立一个能看见的模型

[文本]
相关子查询引用外层`s.id`。对每个学生检查enrollments是否存在student_id=s.id的行。

[代码 language=sql]
SELECT s.name
FROM students s
WHERE EXISTS (
  SELECT 1 FROM enrollments e
  WHERE e.student_id = s.id
);
[/代码]

[文本]
小林和小周有选课→EXISTS为true；小陈没有→false。`SELECT 1`强调子查询具体选什么列不重要，只关心有没有行。

[示例 title=最小可验证示例]
说明：围绕本章统一数据，执行一条可以直接验证结果的 SQL。
语言：sql

SELECT s.name
FROM students s
WHERE EXISTS (
  SELECT 1 FROM enrollments e
  WHERE e.student_id = s.id
);
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数据值换掉，先在纸上预测结果，再执行 SQL 验证。能解释每一行为什么留下或被排除，才算真正理解。

[警告 title=常见错误]
把EXISTS理解成COUNT(*)>0必须先统计所有匹配。数据库优化器常能在找到首条匹配时结束存在性检查。

[标题]
本课小结

[文本]
能解释相关EXISTS按外层行判断。

### 课时题目

#### 题目 7

题型：SINGLE_CHOICE
题干：EXISTS最关心什么？

难度：EASY
分值：10
知识点：EXISTS
是否用于 Battle：否

选项：
- A. 子查询是否至少返回一行 [正确]
- B. 返回列的具体数值
- C. 排序后的第一列名
- D. 表大小

解析：
存在性。

#### 题目 8

题型：SINGLE_CHOICE
题干：未选课小陈的EXISTS结果？

难度：MEDIUM
分值：10
知识点：相关子查询
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：结果预测

选项：
- A. false [正确]
- B. true
- C. NULL一定
- D. 2

解析：
没有匹配行。

#### 题目 9

题型：SINGLE_CHOICE
题干：EXISTS子查询里常写SELECT 1是因为？

难度：HARD
分值：10
知识点：EXISTS
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：结果预测

选项：
- A. 只需表达存在，不依赖返回列内容 [正确]
- B. 数字1会自动计数
- C. 必须返回主键1
- D. 为了排序

解析：
EXISTS忽略选择值。


---

## 课时 4：NOT EXISTS 找“没有关系”的数据

课时简介：正确处理“从未选过课”的反向问题。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
“没有任何选课”不是`course_id=NULL`这么简单，因为没有关系时enrollments里根本没有那一行。NOT EXISTS能表达“找不到匹配关系”。

[标题]
先建立一个能看见的模型

[文本]
对每个学生执行相关子查询；找不到enrollment时EXISTS=false，NOT后变true。

[代码 language=sql]
SELECT s.name
FROM students s
WHERE NOT EXISTS (
  SELECT 1 FROM enrollments e
  WHERE e.student_id=s.id
);
[/代码]

[文本]
当前小陈没有选课，所以只返回小陈。

[示例 title=最小可验证示例]
说明：围绕本章统一数据，执行一条可以直接验证结果的 SQL。
语言：sql

SELECT s.name
FROM students s
WHERE NOT EXISTS (
  SELECT 1 FROM enrollments e
  WHERE e.student_id=s.id
);
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数据值换掉，先在纸上预测结果，再执行 SQL 验证。能解释每一行为什么留下或被排除，才算真正理解。

[警告 title=常见错误]
写`WHERE e.student_id IS NULL`但外层根本没JOIN e，或者错误认为“没有记录”等于“有一条NULL记录”。

[标题]
本课小结

[文本]
能用NOT EXISTS表达缺失关系。

### 课时题目

#### 题目 10

题型：SINGLE_CHOICE
题干：找完全未选课学生适合？

难度：EASY
分值：10
知识点：NOT EXISTS
是否用于 Battle：否

选项：
- A. NOT EXISTS [正确]
- B. MAX
- C. DISTINCT score
- D. ORDER BY

解析：
反存在条件。

#### 题目 11

题型：SINGLE_CHOICE
题干：当前结果是谁？

难度：MEDIUM
分值：10
知识点：NOT EXISTS
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：结果预测

选项：
- A. 小陈 [正确]
- B. 小林
- C. 小周
- D. 所有人

解析：
只有小陈无关系。

#### 题目 12

题型：CODE_FILL
题干：补全关键字。

难度：HARD
分值：10
知识点：NOT EXISTS
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码：
```sql
WHERE ____ EXISTS (SELECT 1 FROM enrollments e WHERE e.student_id=s.id)
```

可接受答案：
```sql
NOT
```

```sql
not
```

判题设置：
- 区分大小写：否
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
NOT EXISTS筛无匹配。

标准完整代码：
```sql
WHERE NOT EXISTS (SELECT 1 FROM enrollments e WHERE e.student_id=s.id)
```


---

## 课时 5：CTE 用 WITH 给中间结果起名字

课时简介：让复杂查询按步骤阅读，而不是嵌套到看不懂。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
当“先算每人平均分，再筛平均>=90”需要多步，CTE把第一步命名为student_stats，后面的SQL像查询临时结果一样继续。

[标题]
先建立一个能看见的模型

[文本]
WITH定义的是当前语句中的逻辑结果，不会永久创建表。

[代码 language=sql]
WITH student_stats AS (
  SELECT student_id, AVG(score) AS avg_score
  FROM enrollments
  GROUP BY student_id
)
SELECT student_id, avg_score
FROM student_stats
WHERE avg_score >= 90;
[/代码]

[文本]
CTE先产生每个student_id一行平均分；外层再筛>=90。把两阶段分开后更容易分别验证。

[示例 title=最小可验证示例]
说明：围绕本章统一数据，执行一条可以直接验证结果的 SQL。
语言：sql

WITH student_stats AS (
  SELECT student_id, AVG(score) AS avg_score
  FROM enrollments
  GROUP BY student_id
)
SELECT student_id, avg_score
FROM student_stats
WHERE avg_score >= 90;
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数据值换掉，先在纸上预测结果，再执行 SQL 验证。能解释每一行为什么留下或被排除，才算真正理解。

[警告 title=常见错误]
把CTE当永久临时表，以为下一条独立SQL还能继续SELECT student_stats。普通CTE只在当前语句有效。

[标题]
本课小结

[文本]
能用CTE拆分查询阶段。

### 课时题目

#### 题目 13

题型：SINGLE_CHOICE
题干：WITH定义的CTE通常作用域？

难度：EASY
分值：10
知识点：CTE
是否用于 Battle：否

选项：
- A. 当前SQL语句 [正确]
- B. 永久数据库
- C. 整个操作系统
- D. 所有未来连接

解析：
CTE是语句级。

#### 题目 14

题型：SINGLE_CHOICE
题干：CTE的主要可读性价值？

难度：MEDIUM
分值：10
知识点：CTE
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：结果预测

选项：
- A. 给中间结果命名并分步骤组织 [正确]
- B. 自动建索引永久加速
- C. 删除重复表
- D. 替代事务

解析：
分解复杂逻辑。

#### 题目 15

题型：SINGLE_CHOICE
题干：外层能直接使用CTE产生的avg_score别名吗？

难度：HARD
分值：10
知识点：CTE
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：结果预测

选项：
- A. 可以 [正确]
- B. 绝不可以
- C. 只能在UPDATE
- D. 只在LIMIT

解析：
CTE结果像命名查询可被外层使用。


---

## 课时 6：JOIN、子查询和 CTE 怎么选

课时简介：不是背“谁更快”，而是先让数据关系和意图清楚。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
同一个需求往往有多种合法SQL。JOIN适合组合行列；EXISTS适合存在性；标量子查询适合单基准；CTE适合把复杂阶段命名。性能要结合执行计划和数据规模验证。

[标题]
先建立一个能看见的模型

[文本]
“列出学生+课程标题”天然是JOIN；“找有选课的人”可用EXISTS；“高于平均”适合标量子查询；“多阶段统计”适合CTE。

[代码 language=sql]
-- 意图：只判断是否有选课
SELECT s.name
FROM students s
WHERE EXISTS (SELECT 1 FROM enrollments e WHERE e.student_id=s.id);
[/代码]

[文本]
这里如果JOIN也能得到有选课学生，但一对多会让姓名重复，需要DISTINCT或GROUP BY。EXISTS直接表达“是否存在”，结果粒度更贴近需求。

[示例 title=最小可验证示例]
说明：围绕本章统一数据，执行一条可以直接验证结果的 SQL。
语言：sql

-- 意图：只判断是否有选课
SELECT s.name
FROM students s
WHERE EXISTS (SELECT 1 FROM enrollments e WHERE e.student_id=s.id);
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数据值换掉，先在纸上预测结果，再执行 SQL 验证。能解释每一行为什么留下或被排除，才算真正理解。

[警告 title=常见错误]
只按“听说JOIN更快/子查询更慢”机械选择。现代数据库会重写优化，先保证语义正确和可读，再用EXPLAIN验证。

[标题]
本课小结

[文本]
能根据查询意图选择结构。

### 课时题目

#### 题目 16

题型：SINGLE_CHOICE
题干：只判断学生是否有至少一条选课，更贴意图的是？

难度：EASY
分值：10
知识点：查询结构选择
是否用于 Battle：否

选项：
- A. EXISTS [正确]
- B. CROSS JOIN
- C. SUM(name)
- D. DELETE

解析：
存在性。

#### 题目 17

题型：SINGLE_CHOICE
题干：需要同时显示学生名和课程标题最直接？

难度：MEDIUM
分值：10
知识点：JOIN
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：结果预测

选项：
- A. JOIN students/courses/enrollments [正确]
- B. 只EXISTS
- C. 只COUNT(*)
- D. TRUNCATE

解析：
需要组合多表列。

#### 题目 18

题型：CODE_FILL
题干：补全CTE关键字。

难度：HARD
分值：10
知识点：CTE
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码：
```sql
____ stats AS (SELECT student_id, AVG(score) avg_score FROM enrollments GROUP BY student_id)
SELECT * FROM stats;
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
CTE以WITH开始。

标准完整代码：
```sql
WITH stats AS (SELECT student_id, AVG(score) avg_score FROM enrollments GROUP BY student_id)
SELECT * FROM stats;
```


---

## 第6章总结

[标题]
这一章真正学会了什么

[文本]
你已经能把一个复杂问题拆成内外两层或命名步骤，并能根据结果形状选择比较方式。

现在你应该能够：

- 能手算标量子查询的两阶段执行。
- 能用IN子查询表达动态集合。
- 能解释相关EXISTS按外层行判断。
- 能用NOT EXISTS表达缺失关系。
- 能用CTE拆分查询阶段。
- 能根据查询意图选择结构。

[提示 title=复习方式]
不要只重新看定义。盖住答案，用本章统一场景重新推一遍数据、代码或状态变化；能自己推出结果，才算掌握。

---

## 第6章综合挑战（不计分）

[标题]
找出高于自己专业平均分的学生

[文本]
先用CTE算每个专业平均分，再JOIN回students比较个人score与专业avg。手算计算机84、大数据91.5后判断谁高于各自专业平均。
