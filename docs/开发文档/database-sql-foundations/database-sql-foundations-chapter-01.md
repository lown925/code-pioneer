# 课程信息

课程名称：数据库与 SQL 基础
课程标识：database-sql-foundations
课程分类：数据库
编程语言：SQL
难度：BEGINNER
预计学习时间：900 分钟
课程简介：面向第一次接触数据库的学习者，从“为什么程序需要数据库”开始，通过一张贯穿全章的学生成绩表，逐步学习表、行、列、SELECT、WHERE、AND/OR、ORDER BY 和 LIMIT。课程强调“先看数据，再写 SQL，再读结果”，让学习者真正理解查询语句如何一步步缩小和整理数据。
适合人群：没有数据库基础，或只见过 SQL 语句但不知道每一部分为什么这样写的初学者。
课程封面：
发布状态：PUBLISHED

学习目标：
- 理解数据库、表、行、列分别表示什么
- 能阅读一张简单的数据表
- 能使用 SELECT 查询整张表或指定列
- 能使用 WHERE 按条件筛选数据
- 能使用 AND、OR 组合多个条件
- 能使用 ORDER BY 对结果排序
- 能使用 LIMIT 限制返回数量
- 能阅读简单 SQL 并判断查询结果
- 能识别常见 SQL 初学错误

---

# 第一章：第一次用 SQL 找到自己想要的数据

章节简介：本章不从背语法开始，而是从“班级成绩越来越多，怎样快速找到需要的数据”这个问题出发。你会认识数据库中的表，并使用 SELECT、WHERE、AND/OR、ORDER BY、LIMIT 完成从“看到所有数据”到“精确找到目标数据”的完整查询流程。
预计学习时间：90 分钟

章节学习目标：
- 理解为什么程序需要数据库
- 能说出表、行、列的含义
- 能使用 SELECT * 查看整张表
- 能只查询自己需要的列
- 能使用 WHERE 根据文字或数字条件筛选
- 能使用 AND、OR 组合筛选条件
- 能使用 ORDER BY 按升序或降序排列
- 能使用 LIMIT 只取前几条结果
- 能把多个查询步骤组合成一条完整 SQL
- 能根据 SQL 判断最终返回哪些数据

本章统一使用下面这张 `students` 表：

[代码 language=text]
+----+------+-----+------------+-------+
| id | name | age | major      | score |
+----+------+-----+------------+-------+
| 1  | 小林 | 18  | 计算机     | 92    |
| 2  | 小周 | 19  | 软件工程   | 85    |
| 3  | 小陈 | 18  | 大数据     | 88    |
| 4  | 小吴 | 20  | 计算机     | 76    |
| 5  | 小王 | 19  | 大数据     | 95    |
+----+------+-----+------------+-------+
[/代码]

[提示 title=不用先记住整张表]
后面的每一课都会继续使用这 5 条数据。你只需要在做题时回来看表，不需要现在把所有数字背下来。

---

## 课时 1：先认识数据库里的“表”

课时简介：理解程序为什么不能一直把数据写在代码里，并认识表、行、列。
预计学习时间：15 分钟

### 正文

[标题]
为什么程序需要数据库

[文本]
假设你正在做一个学习平台，开始时只有 3 个学生。你当然可以直接把名字写在代码里：

[代码 language=text]
小林，18 岁，计算机，92 分
小周，19 岁，软件工程，85 分
小陈，18 岁，大数据，88 分
[/代码]

[文本]
但真实系统不会一直只有 3 个学生。

当学生变成 3000 人、30 万人时，你还会遇到这些问题：

- 怎样快速找到“所有大数据专业的学生”？
- 怎样找出“分数不低于 90 的学生”？
- 怎样按照分数从高到低排列？
- 怎样只看排名最前面的 10 个人？
- 程序关闭以后，这些数据怎样继续保存？

数据库就是专门帮助程序保存、查找和管理大量数据的工具。

[提示 title=先把数据库理解成“可查询的数据仓库”]
初学阶段，不需要先背“关系模型”“事务”“索引”等术语。现在只要知道：数据库不仅能保存数据，还能让我们用 SQL 精确找到需要的数据。

[标题]
一张表就像一张结构固定的电子表格

[文本]
本章使用一张名为 `students` 的表：

[代码 language=text]
+----+------+-----+------------+-------+
| id | name | age | major      | score |
+----+------+-----+------------+-------+
| 1  | 小林 | 18  | 计算机     | 92    |
| 2  | 小周 | 19  | 软件工程   | 85    |
| 3  | 小陈 | 18  | 大数据     | 88    |
| 4  | 小吴 | 20  | 计算机     | 76    |
| 5  | 小王 | 19  | 大数据     | 95    |
+----+------+-----+------------+-------+
[/代码]

[文本]
观察这张表：

- `students` 是表名。
- `id`、`name`、`age`、`major`、`score` 是列。
- 每一横行表示一条完整的学生记录。
- 每一个格子是“某一行在某一列上的值”。

例如：

[代码 language=text]
| 3 | 小陈 | 18 | 大数据 | 88 |
[/代码]

[文本]
这一整行是一条记录。

其中：

- `name` 列的值是“小陈”
- `age` 列的值是 18
- `major` 列的值是“大数据”
- `score` 列的值是 88

[标题]
为什么列名很重要

[文本]
如果只看到：

[代码 language=text]
3, 小陈, 18, 大数据, 88
[/代码]

[文本]
你可能知道这是一名学生，但不一定知道每个值分别表示什么。

列名给数据加上了明确含义：

[代码 language=text]
id=3
name=小陈
age=18
major=大数据
score=88
[/代码]

[示例 title=把表理解成“很多结构相同的记录”]
说明：每个学生都按照相同的列保存信息。

语言：text

第 1 条记录：
name=小林, age=18, major=计算机, score=92

第 2 条记录：
name=小周, age=19, major=软件工程, score=85
[/示例]

[警告 title=“行”和“列”不要混淆]
“找所有学生的姓名”通常是在选择一列；“找小王这一名学生的完整信息”通常是在寻找一行。后面的 SELECT 和 WHERE 会分别处理这两类需求。

### 课时题目

#### 题目 1

题型：SINGLE_CHOICE
题干：在 `students` 表中，`score` 表示什么？

难度：EASY
分值：10
知识点：表、列
是否用于 Battle：否

选项：
- A. 一张表
- B. 一列数据 [正确]
- C. 一条完整记录
- D. 数据库名称

解析：
`score` 位于表头，并且每个学生在这一位置都有一个分数值，所以它是一列。像“小林、18、计算机、92”这样横向的一整组数据才是一条记录。

#### 题目 2

题型：SINGLE_CHOICE
题干：下面哪一项表示 `students` 表中的一条完整记录？

难度：MEDIUM
分值：10
知识点：表、行、记录
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：数据理解

选项：
- A. `name`
- B. `score`
- C. `4, 小吴, 20, 计算机, 76` [正确]
- D. `students`

解析：
一条记录对应表中的一整行。选项 C 同时给出了 id、name、age、major、score 五个字段的值，因此是一条完整学生记录。

#### 题目 3

题型：SINGLE_CHOICE
题干：如果需求是“查看所有学生的姓名”，最直接需要关注 `students` 表中的哪一部分？

难度：HARD
分值：10
知识点：行、列、查询目标
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：数据理解

选项：
- A. `name` 列 [正确]
- B. 只看 id=1 的一行
- C. `students` 表名本身
- D. 只看 score 最高的一格

解析：
“所有学生”说明需要保留多行，“姓名”说明只关心 `name` 这一列。因此最直接的目标是读取 `name` 列。这个思路会在下一课变成真正的 SELECT 查询。

---

## 课时 2：用 SELECT 查看数据

课时简介：写出第一条 SQL，理解 SELECT、FROM 和星号 `*` 分别在做什么。
预计学习时间：15 分钟

### 正文

[标题]
第一条真正的 SQL

[文本]
现在我们要做一个最简单的需求：

“把 `students` 表里的所有数据都显示出来。”

SQL 可以这样写：

[代码 language=sql]
SELECT *
FROM students;
[/代码]

[文本]
这条语句可以先按两部分理解：

- `SELECT *`：我要看哪些内容。
- `FROM students`：这些内容从哪张表来。

其中 `*` 表示“所有列”。

所以整句话可以读成：

“从 students 表中，查询所有列。”

[提示 title=把 SQL 当成一句有顺序的请求]
刚开始不要只背 `SELECT * FROM`。可以每次先用中文读一遍：“我要选什么？从哪里选？”

[标题]
查询结果长什么样

[文本]
执行：

[代码 language=sql]
SELECT *
FROM students;
[/代码]

[文本]
会得到：

[代码 language=text]
+----+------+-----+------------+-------+
| id | name | age | major      | score |
+----+------+-----+------------+-------+
| 1  | 小林 | 18  | 计算机     | 92    |
| 2  | 小周 | 19  | 软件工程   | 85    |
| 3  | 小陈 | 18  | 大数据     | 88    |
| 4  | 小吴 | 20  | 计算机     | 76    |
| 5  | 小王 | 19  | 大数据     | 95    |
+----+------+-----+------------+-------+
[/代码]

[文本]
注意：SELECT 查询本身只是“读取数据”。

它不会因为你查看了数据，就把表里的内容删除或改掉。

[标题]
分号是做什么的

[文本]
SQL 语句末尾经常写分号 `;`：

[代码 language=sql]
SELECT *
FROM students;
[/代码]

[文本]
分号表示“一条 SQL 语句结束”。

不同数据库工具对最后一个分号的要求可能不同，但养成写分号的习惯会让多条 SQL 更清晰。

[示例 title=查询另一张表时只需要改变表名]
说明：如果存在一张 courses 表，查询方式仍然相同。

语言：sql

SELECT *
FROM courses;
[/示例]

[警告 title=表名不是随便写的]
`FROM students` 中的 `students` 必须是实际存在的表名。写成不存在的 `student`、`StudentsData` 等名称，数据库通常会报“找不到表”一类错误。

### 课时题目

#### 题目 4

题型：SINGLE_CHOICE
题干：下面 SQL 中，`students` 的作用是什么？

```sql
SELECT *
FROM students;
```

难度：EASY
分值：10
知识点：SELECT、FROM、表名
是否用于 Battle：否

选项：
- A. 表示所有列
- B. 指定要读取的数据表 [正确]
- C. 表示查询结束
- D. 表示只返回一行

解析：
`FROM students` 指定数据来自 `students` 表。星号 `*` 才表示所有列，分号 `;` 表示一条 SQL 结束。

#### 题目 5

题型：SINGLE_CHOICE
题干：下面哪条 SQL 能查看 `students` 表的所有列？

难度：MEDIUM
分值：10
知识点：SELECT *、FROM
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码选择

选项：
- A. `SELECT students FROM *;`
- B. `FROM students SELECT *;`
- C. `SELECT * FROM students;` [正确]
- D. `SELECT FROM students *;`

解析：
基本查询顺序是 `SELECT 查询内容 FROM 表名`。这里要查看全部列，因此查询内容使用 `*`，最终为 `SELECT * FROM students;`。

#### 题目 6

题型：CODE_FILL
题干：补全 SQL，查询 `students` 表中的全部列。

难度：HARD
分值：10
知识点：SELECT、FROM、完整查询
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码：
```sql
SELECT *
____ students;
```

可接受答案：
```sql
FROM
```

```sql
from
```

判题设置：
- 区分大小写：否
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
`FROM` 用来指定数据来源。补全后是 `SELECT * FROM students;`，含义是从 students 表中查询所有列。

标准完整代码：
```sql
SELECT *
FROM students;
```

---

## 课时 3：只查询真正需要的列

课时简介：理解为什么实际开发中经常不使用 `SELECT *`，并学会一次查询一个或多个指定列。
预计学习时间：15 分钟

### 正文

[标题]
很多时候，我们并不需要整张表

[文本]
假设页面只需要显示“学生姓名”和“分数”。

如果使用：

[代码 language=sql]
SELECT *
FROM students;
[/代码]

[文本]
数据库会返回 id、name、age、major、score 五列。

但页面真正需要的只有：

[代码 language=text]
name | score
[/代码]

[文本]
这时可以直接指定列：

[代码 language=sql]
SELECT name, score
FROM students;
[/代码]

[文本]
结果是：

[代码 language=text]
+------+-------+
| name | score |
+------+-------+
| 小林 | 92    |
| 小周 | 85    |
| 小陈 | 88    |
| 小吴 | 76    |
| 小王 | 95    |
+------+-------+
[/代码]

[标题]
逗号表示“还要另一个列”

[文本]
查询一个列：

[代码 language=sql]
SELECT name
FROM students;
[/代码]

[文本]
查询两个列：

[代码 language=sql]
SELECT name, score
FROM students;
[/代码]

[文本]
查询三个列：

[代码 language=sql]
SELECT name, major, score
FROM students;
[/代码]

[文本]
多个列名之间使用英文逗号 `,` 分隔。

[标题]
列的顺序会影响结果显示顺序

[文本]
下面两条 SQL 查询的是相同两列：

[代码 language=sql]
SELECT name, score
FROM students;
[/代码]

[代码 language=sql]
SELECT score, name
FROM students;
[/代码]

[文本]
但结果列的顺序不同。

第一条先显示 name，再显示 score；第二条先显示 score，再显示 name。

[示例 title=为学生列表只取需要的数据]
说明：如果列表只展示姓名、专业和分数，就不必返回 age。

语言：sql

SELECT name, major, score
FROM students;
[/示例]

[提示 title=初学阶段先养成“按需求选列”的习惯]
`SELECT *` 很方便，适合学习和临时查看数据；实际开发中，明确写出需要的列通常更容易看懂，也避免返回无用数据。

[警告 title=多个列名之间要使用英文逗号]
`SELECT name score FROM students;` 并不等价于“查询 name 和 score 两列”。要查询多个列，应写成 `SELECT name, score FROM students;`。

### 课时题目

#### 题目 7

题型：SINGLE_CHOICE
题干：如果只需要查看学生姓名，应选择哪条 SQL？

难度：EASY
分值：10
知识点：指定列查询
是否用于 Battle：否

选项：
- A. `SELECT name FROM students;` [正确]
- B. `SELECT * name students;`
- C. `FROM name SELECT students;`
- D. `SELECT students FROM name;`

解析：
`SELECT name` 表示只选择 name 列，`FROM students` 表示数据来自 students 表。

#### 题目 8

题型：SINGLE_CHOICE
题干：执行下面 SQL 后，结果会按什么列顺序显示？

```sql
SELECT score, name
FROM students;
```

难度：MEDIUM
分值：10
知识点：SELECT、多列查询
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：结果预测

选项：
- A. 先 name，后 score
- B. 先 score，后 name [正确]
- C. 只显示 score
- D. 顺序由数据库随机决定

解析：
SELECT 后写出的列顺序就是查询结果的列顺序。这里 `score` 写在前面，所以先显示 score，再显示 name。

#### 题目 9

题型：SINGLE_CHOICE
题干：页面只需要显示学生的姓名、专业和分数。下面哪条查询最直接？

难度：HARD
分值：10
知识点：需求转 SQL、指定列
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码选择

选项：
- A. `SELECT * FROM students;`
- B. `SELECT name, major, score FROM students;` [正确]
- C. `SELECT id, age FROM students;`
- D. `SELECT students FROM name, major, score;`

解析：
需求明确只需要 name、major、score 三列，因此直接查询这三列最符合需求。`SELECT *` 虽然也包含这些数据，但还会返回 id 和 age 两列无关数据。

---

## 课时 4：用 WHERE 找到符合条件的行

课时简介：学习根据文字和数字条件筛选数据，理解 WHERE 真正筛选的是“行”。
预计学习时间：15 分钟

### 正文

[标题]
SELECT 决定“看哪些列”，WHERE 决定“留下哪些行”

[文本]
前面我们已经会控制要显示哪些列。

现在有一个新需求：

“只看大数据专业的学生。”

原表中有 5 行，但我们只希望留下 major 等于“大数据”的行。

SQL：

[代码 language=sql]
SELECT *
FROM students
WHERE major = '大数据';
[/代码]

[文本]
结果：

[代码 language=text]
+----+------+-----+--------+-------+
| id | name | age | major  | score |
+----+------+-----+--------+-------+
| 3  | 小陈 | 18  | 大数据 | 88    |
| 5  | 小王 | 19  | 大数据 | 95    |
+----+------+-----+--------+-------+
[/代码]

[文本]
可以把执行思路先理解成：

1. 从 students 表里找数据。
2. 检查每一行的 major。
3. 只有 major 等于“大数据”的行留下。
4. SELECT * 再把这些行的全部列显示出来。

[标题]
文字条件通常需要引号

[文本]
查询专业为“计算机”的学生：

[代码 language=sql]
SELECT name, score
FROM students
WHERE major = '计算机';
[/代码]

[文本]
这里 `'计算机'` 是文字，所以使用单引号包裹。

结果：

[代码 language=text]
+------+-------+
| name | score |
+------+-------+
| 小林 | 92    |
| 小吴 | 76    |
+------+-------+
[/代码]

[标题]
数字条件可以比较大小

[文本]
需求：

“找出分数不低于 90 的学生。”

“不低于 90”就是“大于或等于 90”。

SQL：

[代码 language=sql]
SELECT name, score
FROM students
WHERE score >= 90;
[/代码]

[文本]
结果：

[代码 language=text]
+------+-------+
| name | score |
+------+-------+
| 小林 | 92    |
| 小王 | 95    |
+------+-------+
[/代码]

[文本]
常见比较运算符：

- `=` 等于
- `>` 大于
- `<` 小于
- `>=` 大于等于
- `<=` 小于等于

[示例 title=查询 19 岁学生]
说明：age 是数字列，因此数字 19 不需要引号。

语言：sql

SELECT name, age
FROM students
WHERE age = 19;
[/示例]

[提示 title=先把中文条件翻译成比较表达式]
例如“至少 90 分”可以先翻译成 `score >= 90`；“年龄小于 20”可以先翻译成 `age < 20`。条件想清楚以后再写完整 SQL。

[警告 title=不要把“查询列”和“筛选条件”混在一起]
`SELECT name, score` 决定结果显示哪些列；`WHERE score >= 90` 决定哪些学生能够进入结果。两者作用不同。

### 课时题目

#### 题目 10

题型：SINGLE_CHOICE
题干：下面哪一个条件表示“分数至少为 90”？

难度：EASY
分值：10
知识点：WHERE、比较运算符
是否用于 Battle：否

选项：
- A. `score > 90`
- B. `score >= 90` [正确]
- C. `score < 90`
- D. `score =< 90`

解析：
“至少 90”包含 90 本身，因此应使用“大于或等于” `>=`。`score > 90` 会把正好 90 分的记录排除。

#### 题目 11

题型：SINGLE_CHOICE
题干：根据本章 students 表，下面 SQL 会返回哪两名学生？

```sql
SELECT name
FROM students
WHERE age = 19;
```

难度：MEDIUM
分值：10
知识点：WHERE、结果判断
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：结果预测

选项：
- A. 小林、小陈
- B. 小周、小王 [正确]
- C. 小林、小吴
- D. 小陈、小王

解析：
原表中 age=19 的记录有两行：小周和小王。WHERE 会过滤掉其他年龄的行，而 SELECT name 只显示留下记录的姓名。

#### 题目 12

题型：CODE_FILL
题干：补全 SQL，只查询分数大于或等于 90 的学生姓名和分数。

难度：HARD
分值：10
知识点：WHERE、比较条件、指定列
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码：
```sql
SELECT name, score
FROM students
WHERE ____;
```

可接受答案：
```sql
score >= 90
```

```sql
90 <= score
```

判题设置：
- 区分大小写：否
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
条件要求“分数大于或等于 90”，最直接写成 `score >= 90`。`90 <= score` 含义完全相同。

标准完整代码：
```sql
SELECT name, score
FROM students
WHERE score >= 90;
```

---

## 课时 5：用 AND 和 OR 组合多个条件

课时简介：当一个条件不够时，学习判断“必须同时满足”还是“满足其中之一”。
预计学习时间：15 分钟

### 正文

[标题]
一个真实需求往往包含多个条件

[文本]
现在需求变成：

“找出大数据专业，并且分数不低于 90 的学生。”

这里有两个条件：

1. `major = '大数据'`
2. `score >= 90`

而且两个条件必须同时满足。

这种情况使用 `AND`：

[代码 language=sql]
SELECT name, major, score
FROM students
WHERE major = '大数据'
  AND score >= 90;
[/代码]

[文本]
我们逐行检查：

- 小林：专业不是大数据 → 不符合
- 小周：专业不是大数据 → 不符合
- 小陈：大数据，但 88 < 90 → 不符合
- 小吴：专业不是大数据 → 不符合
- 小王：大数据，而且 95 >= 90 → 符合

所以结果只有：

[代码 language=text]
小王 | 大数据 | 95
[/代码]

[标题]
AND 表示“同时满足”

[文本]
可以把 AND 想成两道门。

只有第一道门和第二道门都通过，记录才能留下。

[代码 language=text]
条件 1：major = '大数据'  → 通过？
                 AND
条件 2：score >= 90       → 通过？
                 ↓
             两个都通过
                 ↓
              保留这一行
[/代码]

[标题]
OR 表示“满足其中一个即可”

[文本]
另一个需求：

“找出计算机专业或大数据专业的学生。”

这一次不要求两个专业同时成立，只要属于其中一个专业即可：

[代码 language=sql]
SELECT name, major
FROM students
WHERE major = '计算机'
   OR major = '大数据';
[/代码]

[文本]
结果会包括：

- 小林：计算机
- 小陈：大数据
- 小吴：计算机
- 小王：大数据

小周是软件工程，因此不符合。

[标题]
先判断中文里的“并且”和“或者”

[文本]
看到多个条件时，先不要急着写 SQL。

先问自己：

“这两个条件必须同时满足吗？”

- 是 → AND
- 不是，只满足一个就行 → OR

[示例 title=查询年龄不低于 19 且分数不低于 85]
说明：两项要求必须同时满足，因此使用 AND。

语言：sql

SELECT name, age, score
FROM students
WHERE age >= 19
  AND score >= 85;
[/示例]

[警告 title=AND 和 OR 的含义完全不同]
“计算机专业并且分数 >= 90”与“计算机专业或者分数 >= 90”得到的结果可能差很多。写代码前一定先确认需求中的逻辑关系。

### 课时题目

#### 题目 13

题型：SINGLE_CHOICE
题干：需求是“年龄至少 19 岁，并且分数至少 90 分”。两个条件之间应该使用什么？

难度：EASY
分值：10
知识点：AND、组合条件
是否用于 Battle：否

选项：
- A. AND [正确]
- B. OR
- C. FROM
- D. SELECT

解析：
“并且”表示两个条件必须同时成立，因此使用 AND。

#### 题目 14

题型：SINGLE_CHOICE
题干：根据本章 students 表，下面 SQL 最终只会返回谁？

```sql
SELECT name
FROM students
WHERE major = '大数据'
  AND score >= 90;
```

难度：MEDIUM
分值：10
知识点：AND、结果预测
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：结果预测

选项：
- A. 小陈
- B. 小王 [正确]
- C. 小陈和小王
- D. 小林和小王

解析：
大数据专业有小陈和小王，但小陈只有 88 分，不满足 `score >= 90`。小王专业为大数据且分数 95，因此只有小王同时满足两个条件。

#### 题目 15

题型：SINGLE_CHOICE
题干：根据本章 students 表，下面 SQL 会返回多少名学生？

```sql
SELECT name
FROM students
WHERE major = '计算机'
   OR score >= 90;
```

难度：HARD
分值：10
知识点：OR、去重理解、结果预测
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：结果预测

选项：
- A. 2 名
- B. 3 名 [正确]
- C. 4 名
- D. 5 名

解析：
计算机专业有小林、小吴；分数 >=90 的有小林、小王。OR 表示满足任一条件即可，因此最终是小林、小吴、小王，共 3 名。小林虽然两个条件都满足，但它仍然只是一条记录，不会因为满足两个条件就自动出现两次。

---

## 课时 6：排序并只取最需要的结果

课时简介：使用 ORDER BY 和 LIMIT，把“符合条件的数据”进一步整理成真正适合页面展示的结果。
预计学习时间：15 分钟

### 正文

[标题]
筛选以后，结果还可能需要排序

[文本]
现在需求是：

“查看所有学生的姓名和分数，并按分数从高到低排列。”

SQL：

[代码 language=sql]
SELECT name, score
FROM students
ORDER BY score DESC;
[/代码]

[文本]
结果：

[代码 language=text]
+------+-------+
| name | score |
+------+-------+
| 小王 | 95    |
| 小林 | 92    |
| 小陈 | 88    |
| 小周 | 85    |
| 小吴 | 76    |
+------+-------+
[/代码]

[文本]
`ORDER BY score` 表示按 score 排序。

`DESC` 表示从大到小，也叫降序。

[标题]
ASC 表示从小到大

[代码 language=sql]
SELECT name, age
FROM students
ORDER BY age ASC;
[/代码]

[文本]
`ASC` 表示升序，也就是从小到大。

所以：

- `ORDER BY score DESC` → 高分在前
- `ORDER BY score ASC` → 低分在前

[标题]
LIMIT 只保留前几条

[文本]
如果只想看分数最高的两名学生：

[代码 language=sql]
SELECT name, score
FROM students
ORDER BY score DESC
LIMIT 2;
[/代码]

[文本]
先按 score 从高到低排序：

[代码 language=text]
小王 95
小林 92
小陈 88
小周 85
小吴 76
[/代码]

[文本]
然后 `LIMIT 2` 只保留前两行：

[代码 language=text]
小王 95
小林 92
[/代码]

[标题]
把前面学过的内容组合起来

[文本]
最后做一个稍微真实一点的需求：

“找出年龄至少 19 岁的学生，只显示姓名、年龄和分数，按分数从高到低排列，只看前 2 名。”

不要马上写完整 SQL，先拆成四步：

1. 看哪些列？→ `name, age, score`
2. 从哪张表？→ `students`
3. 留下哪些行？→ `age >= 19`
4. 怎么排序、取几条？→ `score DESC`，前 2 条

组合：

[代码 language=sql]
SELECT name, age, score
FROM students
WHERE age >= 19
ORDER BY score DESC
LIMIT 2;
[/代码]

[文本]
先筛选 age >= 19：

[代码 language=text]
小周 19 85
小吴 20 76
小王 19 95
[/代码]

[文本]
再按 score 从高到低：

[代码 language=text]
小王 19 95
小周 19 85
小吴 20 76
[/代码]

[文本]
最后 LIMIT 2：

[代码 language=text]
小王 19 95
小周 19 85
[/代码]

这就是一条完整查询真正“工作”的过程。

[示例 title=找出大数据专业最高分学生]
说明：先筛选专业，再按分数降序，最后只取第一条。

语言：sql

SELECT name, score
FROM students
WHERE major = '大数据'
ORDER BY score DESC
LIMIT 1;
[/示例]

[提示 title=复杂查询先拆需求，再组合]
当 SQL 变长时，不要一次背完整句子。先分别回答“查什么、从哪里、筛什么、怎么排、取多少”，再把它们组合起来。

[警告 title=LIMIT 之前要想清楚排序]
如果需求是“最高分前 2 名”，只写 `LIMIT 2` 并不能保证拿到最高分。应先 `ORDER BY score DESC`，再 `LIMIT 2`。

### 课时题目

#### 题目 16

题型：SINGLE_CHOICE
题干：下面哪一个写法表示“按 score 从高到低排序”？

难度：EASY
分值：10
知识点：ORDER BY、DESC
是否用于 Battle：否

选项：
- A. `ORDER BY score ASC`
- B. `ORDER BY score DESC` [正确]
- C. `LIMIT score 2`
- D. `WHERE score DESC`

解析：
`ORDER BY score` 指定按 score 排序，`DESC` 表示降序，也就是从高到低。

#### 题目 17

题型：SINGLE_CHOICE
题干：根据本章 students 表，下面 SQL 的第一行结果是谁？

```sql
SELECT name, score
FROM students
ORDER BY score DESC
LIMIT 2;
```

难度：MEDIUM
分值：10
知识点：ORDER BY、LIMIT、结果预测
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：结果预测

选项：
- A. 小林
- B. 小周
- C. 小王 [正确]
- D. 小吴

解析：
先按 score 降序排列，最高分是小王 95，其次是小林 92。LIMIT 2 保留这两行，因此第一行是小王。

#### 题目 18

题型：CODE_FILL
题干：补全 SQL：找出年龄至少 19 岁的学生，按分数从高到低排列，只返回前 2 名。

难度：HARD
分值：10
知识点：WHERE、ORDER BY、DESC、LIMIT、综合查询
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码：
```sql
SELECT name, age, score
FROM students
WHERE age >= 19
ORDER BY score ____
LIMIT 2;
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
需求要求“从高到低”，因此 ORDER BY 后应使用 `DESC`。完整执行过程是：先筛选 age >= 19，再按 score 降序排列，最后 LIMIT 2 保留最高的两条结果。

标准完整代码：
```sql
SELECT name, age, score
FROM students
WHERE age >= 19
ORDER BY score DESC
LIMIT 2;
```

---

## 第一章总结

[标题]
你已经完成了第一次完整 SQL 查询闭环

[文本]
本章没有从大量数据库术语开始，而是围绕一张 students 表，逐步解决“怎样找到真正需要的数据”。

现在你已经能够：

- 理解数据库为什么适合保存和查询大量数据
- 区分表、行、列和一条记录
- 使用 `SELECT *` 查看整张表
- 使用 `SELECT name, score` 只查询需要的列
- 使用 `WHERE` 筛选符合条件的行
- 使用 `=、>、<、>=、<=` 表达基础条件
- 使用 `AND` 表示多个条件必须同时满足
- 使用 `OR` 表示满足其中一个条件即可
- 使用 `ORDER BY ... DESC` 从高到低排序
- 使用 `ORDER BY ... ASC` 从低到高排序
- 使用 `LIMIT` 只保留前几条结果
- 把“查什么、从哪里、筛什么、怎么排、取多少”组合成完整 SQL

[标题]
遇到查询题时，可以先问自己五个问题

[文本]
1. 我要显示哪些列？
2. 数据来自哪张表？
3. 哪些行应该留下？
4. 结果需要怎样排序？
5. 最后需要多少条？

[代码 language=text]
SELECT  → 看什么
FROM    → 从哪里
WHERE   → 留哪些行
ORDER BY→ 怎么排
LIMIT   → 取多少
[/代码]

[文本]
如果这五个问题都能回答出来，大部分基础查询就已经有了清晰思路。

下一章可以继续学习表达式、别名、去重、范围条件、IN、LIKE 和 NULL，让查询从“精确匹配”进入更灵活的数据检索。

[提示 title=本章 Battle 能力]
本章 Battle 不考“SQL 很重要”之类的常识，而是要求你真正读懂表格、筛选条件、排序顺序和最终查询结果。没有理解 SELECT、WHERE、AND/OR、ORDER BY、LIMIT 的学习者，很难只靠猜测稳定答对。

---

## 第一章综合挑战（不计分）

[标题]
制作“优秀学生查询”

[文本]
现在产品经理给出需求：

“在学生列表中，只看计算机或大数据专业的学生；分数必须不低于 85；结果只显示姓名、专业和分数；按分数从高到低排列；最多显示 3 人。”

先不要看答案，尝试自己把需求拆开：

1. 需要哪些列？
2. 哪些专业可以保留？
3. 最低分数是多少？
4. 应该升序还是降序？
5. 最多取多少条？

[文本]
为了让“计算机或大数据”这一组条件更加清楚，可以使用括号：

参考 SQL：

[代码 language=sql]
SELECT name, major, score
FROM students
WHERE (major = '计算机' OR major = '大数据')
  AND score >= 85
ORDER BY score DESC
LIMIT 3;
[/代码]

[文本]
根据本章数据：

- 小王：大数据，95 → 保留
- 小林：计算机，92 → 保留
- 小陈：大数据，88 → 保留
- 小周：软件工程 → 排除
- 小吴：计算机，但 76 < 85 → 排除

所以最终结果：

[代码 language=text]
+------+--------+-------+
| name | major  | score |
+------+--------+-------+
| 小王 | 大数据 | 95    |
| 小林 | 计算机 | 92    |
| 小陈 | 大数据 | 88    |
+------+--------+-------+
[/代码]

[文本]
如果你不仅能看懂这条 SQL，还能解释“为什么小周和小吴没有出现在结果里”，就说明你已经真正掌握了本章的基础查询思路，而不是只记住 SQL 语法顺序。
