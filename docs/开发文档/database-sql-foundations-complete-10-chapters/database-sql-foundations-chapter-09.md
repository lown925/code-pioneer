# 第九章：视图、窗口函数与高级查询

章节简介：学习视图和窗口函数，用排名、分区累计等能力解决不适合普通 GROUP BY 的分析问题。 学习完成后，能够把本章 SQL 能力应用到清晰、可验证的数据库查询或设计任务中。

预计学习时间：120 分钟

章节学习目标：
- 理解并能够应用“视图基础”的核心规则
- 理解并能够应用“窗口函数 OVER”的核心规则
- 理解并能够应用“ROW_NUMBER 排名”的核心规则
- 理解并能够应用“RANK 与 DENSE_RANK”的核心规则
- 理解并能够应用“PARTITION BY”的核心规则
- 理解并能够应用“窗口聚合”的核心规则

---

## 课时 1：视图基础

课时简介：学习视图基础的核心概念、SQL 写法和常见边界。

预计学习时间：20 分钟

### 正文

[标题]
视图基础的核心思路

[文本]
视图保存查询定义，为复杂查询提供稳定入口。普通视图通常不等于复制一份独立数据。

[代码 language=sql]
CREATE VIEW active_users AS SELECT id, name FROM users WHERE status='ACTIVE';
[/代码]

[标题]
从结果语义理解 SQL

[文本]
学习这一部分时，不要只记住关键字。应先说明查询或约束希望解决什么问题，再检查输入数据范围、结果粒度以及 NULL、重复行和排序等边界。对于“视图基础”，核心判断是：视图可以封装查询逻辑。

[示例 title=视图基础示例]
说明：使用一个最小 SQL 示例观察语句结构，不连接或修改生产数据库。
语言：sql
CREATE VIEW active_users AS SELECT id, name FROM users WHERE status='ACTIVE';
[/示例]

[提示 title=视图基础学习提示]
普通视图通常读取底层表的当前数据。先预测结果，再阅读 SQL，会比机械背语法更容易形成稳定理解。

[警告 title=注意 SQL 方言与数据边界]
不同数据库在函数、分页、日期处理等细节上可能不同。课程以通用关系型 SQL 思想为主，涉及写操作的示例仅用于学习，不应直接对生产数据库执行。

### 课时题目

#### 题目 1

题型：SINGLE_CHOICE
题干：关于“视图基础”，下列哪项说法正确？
难度：EASY
分值：10
知识点：视图基础
是否用于 Battle：否

选项：
- A. 视图可以封装查询逻辑 [正确]
- B. SQL 的所有语句都会自动修改原表数据
- C. 只要语法能够执行，结果就一定符合业务需求
- D. NULL、重复行和排序永远不会影响查询结果

解析：
视图可以封装查询逻辑。其余说法把 SQL 的查询、写入或结果语义绝对化了。

#### 题目 2

题型：SINGLE_CHOICE
题干：阅读下面 SQL：`CREATE VIEW active_users AS SELECT id, name FROM users WHERE status='ACTIVE';`。结合“视图基础”的知识，最合理的理解是什么？
难度：MEDIUM
分值：10
知识点：视图基础、SQL 阅读
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：执行流程

选项：
- A. 该语句体现了“视图可以封装查询逻辑” [正确]
- B. 该语句一定会删除数据库中的全部记录
- C. 该语句的结果与表中数据完全无关
- D. 该语句可以忽略字段类型、约束和 NULL 语义

解析：
示例围绕“视图基础”展开，正确理解是：视图可以封装查询逻辑。判断 SQL 时应结合语句类型与数据语义。

#### 题目 3

题型：SINGLE_CHOICE
题干：在真实项目中应用“视图基础”时，哪一种做法最稳妥？
难度：HARD
分值：10
知识点：视图基础、边界分析
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：场景判断

选项：
- A. 先明确数据范围与结果语义，并验证“普通视图通常读取底层表的当前数据” [正确]
- B. 不看数据结构，直接复制任意 SQL 到生产环境执行
- C. 为了缩短 SQL，删除所有过滤条件和连接条件
- D. 只要返回了数据，就无需检查重复、NULL 或统计粒度

解析：
可靠 SQL 需要同时考虑业务语义与数据边界。本课特别需要记住：普通视图通常读取底层表的当前数据。

---

## 课时 2：窗口函数 OVER

课时简介：学习窗口函数 OVER的核心概念、SQL 写法和常见边界。

预计学习时间：20 分钟

### 正文

[标题]
窗口函数 OVER的核心思路

[文本]
窗口函数在保留明细行的同时进行跨行计算，与 GROUP BY 压缩为每组一行不同。OVER 定义计算窗口。

[代码 language=sql]
SELECT name, score, AVG(score) OVER () AS overall_avg FROM exams;
[/代码]

[标题]
从结果语义理解 SQL

[文本]
学习这一部分时，不要只记住关键字。应先说明查询或约束希望解决什么问题，再检查输入数据范围、结果粒度以及 NULL、重复行和排序等边界。对于“窗口函数 OVER”，核心判断是：窗口函数可以保留明细行。

[示例 title=窗口函数 OVER示例]
说明：使用一个最小 SQL 示例观察语句结构，不连接或修改生产数据库。
语言：sql
SELECT name, score, AVG(score) OVER () AS overall_avg FROM exams;
[/示例]

[提示 title=窗口函数 OVER学习提示]
OVER 描述窗口计算范围。先预测结果，再阅读 SQL，会比机械背语法更容易形成稳定理解。

[警告 title=注意 SQL 方言与数据边界]
不同数据库在函数、分页、日期处理等细节上可能不同。课程以通用关系型 SQL 思想为主，涉及写操作的示例仅用于学习，不应直接对生产数据库执行。

### 课时题目

#### 题目 4

题型：SINGLE_CHOICE
题干：关于“窗口函数 OVER”，下列哪项说法正确？
难度：EASY
分值：10
知识点：窗口函数 OVER
是否用于 Battle：否

选项：
- A. 窗口函数可以保留明细行 [正确]
- B. SQL 的所有语句都会自动修改原表数据
- C. 只要语法能够执行，结果就一定符合业务需求
- D. NULL、重复行和排序永远不会影响查询结果

解析：
窗口函数可以保留明细行。其余说法把 SQL 的查询、写入或结果语义绝对化了。

#### 题目 5

题型：SINGLE_CHOICE
题干：阅读下面 SQL：`SELECT name, score, AVG(score) OVER () AS overall_avg FROM exams;`。结合“窗口函数 OVER”的知识，最合理的理解是什么？
难度：MEDIUM
分值：10
知识点：窗口函数 OVER、SQL 阅读
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：执行流程

选项：
- A. 该语句体现了“窗口函数可以保留明细行” [正确]
- B. 该语句一定会删除数据库中的全部记录
- C. 该语句的结果与表中数据完全无关
- D. 该语句可以忽略字段类型、约束和 NULL 语义

解析：
示例围绕“窗口函数 OVER”展开，正确理解是：窗口函数可以保留明细行。判断 SQL 时应结合语句类型与数据语义。

#### 题目 6

题型：CODE_FILL
题干：补全下面 SQL 中的 `____`，使语句能够表达本课“窗口函数 OVER”示例的原意。请填写缺失的 SQL 片段。
难度：HARD
分值：10
知识点：窗口函数 OVER、SQL 代码填空
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码:
```sql
____ name, score, AVG(score) OVER () AS overall_avg FROM exams;
```

可接受答案:
```sql
SELECT
```

判题设置：
- 区分大小写：否
- 忽略首尾空格：是
- 保留代码内部空格：否
- 统一 Windows 和 Unix 换行：是

解析：
缺失部分是 `SELECT`。补全后语句恢复为本课示例，体现：窗口函数可以保留明细行。

标准完整代码:
```sql
SELECT name, score, AVG(score) OVER () AS overall_avg FROM exams;
```

---

## 课时 3：ROW_NUMBER 排名

课时简介：学习ROW_NUMBER 排名的核心概念、SQL 写法和常见边界。

预计学习时间：20 分钟

### 正文

[标题]
ROW_NUMBER 排名的核心思路

[文本]
ROW_NUMBER 为窗口内行生成唯一顺序号。若排序键存在并列，应增加稳定次级排序键以获得确定结果。

[代码 language=sql]
SELECT name, score, ROW_NUMBER() OVER (ORDER BY score DESC, id) AS rn FROM exams;
[/代码]

[标题]
从结果语义理解 SQL

[文本]
学习这一部分时，不要只记住关键字。应先说明查询或约束希望解决什么问题，再检查输入数据范围、结果粒度以及 NULL、重复行和排序等边界。对于“ROW_NUMBER 排名”，核心判断是：ROW_NUMBER 会给每行不同序号。

[示例 title=ROW_NUMBER 排名示例]
说明：使用一个最小 SQL 示例观察语句结构，不连接或修改生产数据库。
语言：sql
SELECT name, score, ROW_NUMBER() OVER (ORDER BY score DESC, id) AS rn FROM exams;
[/示例]

[提示 title=ROW_NUMBER 排名学习提示]
稳定排序有助于得到确定排名。先预测结果，再阅读 SQL，会比机械背语法更容易形成稳定理解。

[警告 title=注意 SQL 方言与数据边界]
不同数据库在函数、分页、日期处理等细节上可能不同。课程以通用关系型 SQL 思想为主，涉及写操作的示例仅用于学习，不应直接对生产数据库执行。

### 课时题目

#### 题目 7

题型：SINGLE_CHOICE
题干：关于“ROW_NUMBER 排名”，下列哪项说法正确？
难度：EASY
分值：10
知识点：ROW_NUMBER 排名
是否用于 Battle：否

选项：
- A. ROW_NUMBER 会给每行不同序号 [正确]
- B. SQL 的所有语句都会自动修改原表数据
- C. 只要语法能够执行，结果就一定符合业务需求
- D. NULL、重复行和排序永远不会影响查询结果

解析：
ROW_NUMBER 会给每行不同序号。其余说法把 SQL 的查询、写入或结果语义绝对化了。

#### 题目 8

题型：SINGLE_CHOICE
题干：阅读下面 SQL：`SELECT name, score, ROW_NUMBER() OVER (ORDER BY score DESC, id) AS rn FROM exams;`。结合“ROW_NUMBER 排名”的知识，最合理的理解是什么？
难度：MEDIUM
分值：10
知识点：ROW_NUMBER 排名、SQL 阅读
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：执行流程

选项：
- A. 该语句体现了“ROW_NUMBER 会给每行不同序号” [正确]
- B. 该语句一定会删除数据库中的全部记录
- C. 该语句的结果与表中数据完全无关
- D. 该语句可以忽略字段类型、约束和 NULL 语义

解析：
示例围绕“ROW_NUMBER 排名”展开，正确理解是：ROW_NUMBER 会给每行不同序号。判断 SQL 时应结合语句类型与数据语义。

#### 题目 9

题型：SINGLE_CHOICE
题干：在真实项目中应用“ROW_NUMBER 排名”时，哪一种做法最稳妥？
难度：HARD
分值：10
知识点：ROW_NUMBER 排名、边界分析
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：场景判断

选项：
- A. 先明确数据范围与结果语义，并验证“稳定排序有助于得到确定排名” [正确]
- B. 不看数据结构，直接复制任意 SQL 到生产环境执行
- C. 为了缩短 SQL，删除所有过滤条件和连接条件
- D. 只要返回了数据，就无需检查重复、NULL 或统计粒度

解析：
可靠 SQL 需要同时考虑业务语义与数据边界。本课特别需要记住：稳定排序有助于得到确定排名。

---

## 课时 4：RANK 与 DENSE_RANK

课时简介：学习RANK 与 DENSE_RANK的核心概念、SQL 写法和常见边界。

预计学习时间：20 分钟

### 正文

[标题]
RANK 与 DENSE_RANK的核心思路

[文本]
RANK 和 DENSE_RANK 都能处理并列；RANK 会留下名次空档，DENSE_RANK 不留空档。

[代码 language=sql]
SELECT name, score, DENSE_RANK() OVER (ORDER BY score DESC) AS r FROM exams;
[/代码]

[标题]
从结果语义理解 SQL

[文本]
学习这一部分时，不要只记住关键字。应先说明查询或约束希望解决什么问题，再检查输入数据范围、结果粒度以及 NULL、重复行和排序等边界。对于“RANK 与 DENSE_RANK”，核心判断是：DENSE_RANK 并列后名次连续。

[示例 title=RANK 与 DENSE_RANK示例]
说明：使用一个最小 SQL 示例观察语句结构，不连接或修改生产数据库。
语言：sql
SELECT name, score, DENSE_RANK() OVER (ORDER BY score DESC) AS r FROM exams;
[/示例]

[提示 title=RANK 与 DENSE_RANK学习提示]
RANK 并列后可能跳号。先预测结果，再阅读 SQL，会比机械背语法更容易形成稳定理解。

[警告 title=注意 SQL 方言与数据边界]
不同数据库在函数、分页、日期处理等细节上可能不同。课程以通用关系型 SQL 思想为主，涉及写操作的示例仅用于学习，不应直接对生产数据库执行。

### 课时题目

#### 题目 10

题型：SINGLE_CHOICE
题干：关于“RANK 与 DENSE_RANK”，下列哪项说法正确？
难度：EASY
分值：10
知识点：RANK 与 DENSE_RANK
是否用于 Battle：否

选项：
- A. DENSE_RANK 并列后名次连续 [正确]
- B. SQL 的所有语句都会自动修改原表数据
- C. 只要语法能够执行，结果就一定符合业务需求
- D. NULL、重复行和排序永远不会影响查询结果

解析：
DENSE_RANK 并列后名次连续。其余说法把 SQL 的查询、写入或结果语义绝对化了。

#### 题目 11

题型：SINGLE_CHOICE
题干：阅读下面 SQL：`SELECT name, score, DENSE_RANK() OVER (ORDER BY score DESC) AS r FROM exams;`。结合“RANK 与 DENSE_RANK”的知识，最合理的理解是什么？
难度：MEDIUM
分值：10
知识点：RANK 与 DENSE_RANK、SQL 阅读
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：执行流程

选项：
- A. 该语句体现了“DENSE_RANK 并列后名次连续” [正确]
- B. 该语句一定会删除数据库中的全部记录
- C. 该语句的结果与表中数据完全无关
- D. 该语句可以忽略字段类型、约束和 NULL 语义

解析：
示例围绕“RANK 与 DENSE_RANK”展开，正确理解是：DENSE_RANK 并列后名次连续。判断 SQL 时应结合语句类型与数据语义。

#### 题目 12

题型：CODE_FILL
题干：补全下面 SQL 中的 `____`，使语句能够表达本课“RANK 与 DENSE_RANK”示例的原意。请填写缺失的 SQL 片段。
难度：HARD
分值：10
知识点：RANK 与 DENSE_RANK、SQL 代码填空
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码:
```sql
SELECT name, score, ____ OVER (ORDER BY score DESC) AS r FROM exams;
```

可接受答案:
```sql
DENSE_RANK()
```

判题设置：
- 区分大小写：否
- 忽略首尾空格：是
- 保留代码内部空格：否
- 统一 Windows 和 Unix 换行：是

解析：
缺失部分是 `DENSE_RANK()`。补全后语句恢复为本课示例，体现：DENSE_RANK 并列后名次连续。

标准完整代码:
```sql
SELECT name, score, DENSE_RANK() OVER (ORDER BY score DESC) AS r FROM exams;
```

---

## 课时 5：PARTITION BY

课时简介：学习PARTITION BY的核心概念、SQL 写法和常见边界。

预计学习时间：20 分钟

### 正文

[标题]
PARTITION BY的核心思路

[文本]
PARTITION BY 把窗口计算按组独立进行，但不会像 GROUP BY 那样减少明细行数。

[代码 language=sql]
SELECT major, name, score, ROW_NUMBER() OVER (PARTITION BY major ORDER BY score DESC) AS rn FROM exams;
[/代码]

[标题]
从结果语义理解 SQL

[文本]
学习这一部分时，不要只记住关键字。应先说明查询或约束希望解决什么问题，再检查输入数据范围、结果粒度以及 NULL、重复行和排序等边界。对于“PARTITION BY”，核心判断是：PARTITION BY 为窗口函数划分独立分区。

[示例 title=PARTITION BY示例]
说明：使用一个最小 SQL 示例观察语句结构，不连接或修改生产数据库。
语言：sql
SELECT major, name, score, ROW_NUMBER() OVER (PARTITION BY major ORDER BY score DESC) AS rn FROM exams;
[/示例]

[提示 title=PARTITION BY学习提示]
每个分区可重新开始排名。先预测结果，再阅读 SQL，会比机械背语法更容易形成稳定理解。

[警告 title=注意 SQL 方言与数据边界]
不同数据库在函数、分页、日期处理等细节上可能不同。课程以通用关系型 SQL 思想为主，涉及写操作的示例仅用于学习，不应直接对生产数据库执行。

### 课时题目

#### 题目 13

题型：SINGLE_CHOICE
题干：关于“PARTITION BY”，下列哪项说法正确？
难度：EASY
分值：10
知识点：PARTITION BY
是否用于 Battle：否

选项：
- A. PARTITION BY 为窗口函数划分独立分区 [正确]
- B. SQL 的所有语句都会自动修改原表数据
- C. 只要语法能够执行，结果就一定符合业务需求
- D. NULL、重复行和排序永远不会影响查询结果

解析：
PARTITION BY 为窗口函数划分独立分区。其余说法把 SQL 的查询、写入或结果语义绝对化了。

#### 题目 14

题型：SINGLE_CHOICE
题干：阅读下面 SQL：`SELECT major, name, score, ROW_NUMBER() OVER (PARTITION BY major ORDER BY score DESC) AS rn FROM exams;`。结合“PARTITION BY”的知识，最合理的理解是什么？
难度：MEDIUM
分值：10
知识点：PARTITION BY、SQL 阅读
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：执行流程

选项：
- A. 该语句体现了“PARTITION BY 为窗口函数划分独立分区” [正确]
- B. 该语句一定会删除数据库中的全部记录
- C. 该语句的结果与表中数据完全无关
- D. 该语句可以忽略字段类型、约束和 NULL 语义

解析：
示例围绕“PARTITION BY”展开，正确理解是：PARTITION BY 为窗口函数划分独立分区。判断 SQL 时应结合语句类型与数据语义。

#### 题目 15

题型：SINGLE_CHOICE
题干：在真实项目中应用“PARTITION BY”时，哪一种做法最稳妥？
难度：HARD
分值：10
知识点：PARTITION BY、边界分析
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：场景判断

选项：
- A. 先明确数据范围与结果语义，并验证“每个分区可重新开始排名” [正确]
- B. 不看数据结构，直接复制任意 SQL 到生产环境执行
- C. 为了缩短 SQL，删除所有过滤条件和连接条件
- D. 只要返回了数据，就无需检查重复、NULL 或统计粒度

解析：
可靠 SQL 需要同时考虑业务语义与数据边界。本课特别需要记住：每个分区可重新开始排名。

---

## 课时 6：窗口聚合

课时简介：学习窗口聚合的核心概念、SQL 写法和常见边界。

预计学习时间：20 分钟

### 正文

[标题]
窗口聚合的核心思路

[文本]
SUM、AVG 等聚合函数也可作为窗口函数，适合计算分组平均、累计值等，同时保留每条明细。

[代码 language=sql]
SELECT user_id, created_at, amount, SUM(amount) OVER (PARTITION BY user_id ORDER BY created_at) AS running_total FROM orders;
[/代码]

[标题]
从结果语义理解 SQL

[文本]
学习这一部分时，不要只记住关键字。应先说明查询或约束希望解决什么问题，再检查输入数据范围、结果粒度以及 NULL、重复行和排序等边界。对于“窗口聚合”，核心判断是：窗口聚合可以计算累计值。

[示例 title=窗口聚合示例]
说明：使用一个最小 SQL 示例观察语句结构，不连接或修改生产数据库。
语言：sql
SELECT user_id, created_at, amount, SUM(amount) OVER (PARTITION BY user_id ORDER BY created_at) AS running_total FROM orders;
[/示例]

[提示 title=窗口聚合学习提示]
ORDER BY 会影响累计窗口的顺序。先预测结果，再阅读 SQL，会比机械背语法更容易形成稳定理解。

[警告 title=注意 SQL 方言与数据边界]
不同数据库在函数、分页、日期处理等细节上可能不同。课程以通用关系型 SQL 思想为主，涉及写操作的示例仅用于学习，不应直接对生产数据库执行。

### 课时题目

#### 题目 16

题型：SINGLE_CHOICE
题干：关于“窗口聚合”，下列哪项说法正确？
难度：EASY
分值：10
知识点：窗口聚合
是否用于 Battle：否

选项：
- A. 窗口聚合可以计算累计值 [正确]
- B. SQL 的所有语句都会自动修改原表数据
- C. 只要语法能够执行，结果就一定符合业务需求
- D. NULL、重复行和排序永远不会影响查询结果

解析：
窗口聚合可以计算累计值。其余说法把 SQL 的查询、写入或结果语义绝对化了。

#### 题目 17

题型：SINGLE_CHOICE
题干：阅读下面 SQL：`SELECT user_id, created_at, amount, SUM(amount) OVER (PARTITION BY user_id ORDER BY created_at) AS running_total FROM orders;`。结合“窗口聚合”的知识，最合理的理解是什么？
难度：MEDIUM
分值：10
知识点：窗口聚合、SQL 阅读
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：执行流程

选项：
- A. 该语句体现了“窗口聚合可以计算累计值” [正确]
- B. 该语句一定会删除数据库中的全部记录
- C. 该语句的结果与表中数据完全无关
- D. 该语句可以忽略字段类型、约束和 NULL 语义

解析：
示例围绕“窗口聚合”展开，正确理解是：窗口聚合可以计算累计值。判断 SQL 时应结合语句类型与数据语义。

#### 题目 18

题型：CODE_FILL
题干：补全下面 SQL 中的 `____`，使语句能够表达本课“窗口聚合”示例的原意。请填写缺失的 SQL 片段。
难度：HARD
分值：10
知识点：窗口聚合、SQL 代码填空
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码:
```sql
SELECT user_id, created_at, amount, SUM(amount) OVER (____ user_id ORDER BY created_at) AS running_total FROM orders;
```

可接受答案:
```sql
PARTITION BY
```

判题设置：
- 区分大小写：否
- 忽略首尾空格：是
- 保留代码内部空格：否
- 统一 Windows 和 Unix 换行：是

解析：
缺失部分是 `PARTITION BY`。补全后语句恢复为本课示例，体现：窗口聚合可以计算累计值。

标准完整代码:
```sql
SELECT user_id, created_at, amount, SUM(amount) OVER (PARTITION BY user_id ORDER BY created_at) AS running_total FROM orders;
```

---
