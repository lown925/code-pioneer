# 第十章：SQL 综合实践与查询优化

章节简介：综合建模、查询、事务和性能知识，学习 EXPLAIN、索引判断及真实业务查询的排错流程。 学习完成后，能够把本章 SQL 能力应用到清晰、可验证的数据库查询或设计任务中。

预计学习时间：120 分钟

章节学习目标：
- 理解并能够应用“需求到表结构”的核心规则
- 理解并能够应用“综合报表查询”的核心规则
- 理解并能够应用“EXPLAIN 执行计划”的核心规则
- 理解并能够应用“索引与查询优化”的核心规则
- 理解并能够应用“事务场景排错”的核心规则
- 理解并能够应用“综合 SQL 实战”的核心规则

---

## 课时 1：需求到表结构

课时简介：学习需求到表结构的核心概念、SQL 写法和常见边界。

预计学习时间：20 分钟

### 正文

[标题]
需求到表结构的核心思路

[文本]
综合设计先从业务实体、关系和约束出发，再确定表、键和索引。不要直接从页面字段机械生成数据库结构。

[代码 language=sql]
CREATE TABLE courses (id INTEGER PRIMARY KEY, title VARCHAR(200) NOT NULL);
[/代码]

[标题]
从结果语义理解 SQL

[文本]
学习这一部分时，不要只记住关键字。应先说明查询或约束希望解决什么问题，再检查输入数据范围、结果粒度以及 NULL、重复行和排序等边界。对于“需求到表结构”，核心判断是：数据模型应反映业务实体与关系。

[示例 title=需求到表结构示例]
说明：使用一个最小 SQL 示例观察语句结构，不连接或修改生产数据库。
语言：sql
CREATE TABLE courses (id INTEGER PRIMARY KEY, title VARCHAR(200) NOT NULL);
[/示例]

[提示 title=需求到表结构学习提示]
约束是模型的一部分。先预测结果，再阅读 SQL，会比机械背语法更容易形成稳定理解。

[警告 title=注意 SQL 方言与数据边界]
不同数据库在函数、分页、日期处理等细节上可能不同。课程以通用关系型 SQL 思想为主，涉及写操作的示例仅用于学习，不应直接对生产数据库执行。

### 课时题目

#### 题目 1

题型：SINGLE_CHOICE
题干：关于“需求到表结构”，下列哪项说法正确？
难度：EASY
分值：10
知识点：需求到表结构
是否用于 Battle：否

选项：
- A. 数据模型应反映业务实体与关系 [正确]
- B. SQL 的所有语句都会自动修改原表数据
- C. 只要语法能够执行，结果就一定符合业务需求
- D. NULL、重复行和排序永远不会影响查询结果

解析：
数据模型应反映业务实体与关系。其余说法把 SQL 的查询、写入或结果语义绝对化了。

#### 题目 2

题型：SINGLE_CHOICE
题干：阅读下面 SQL：`CREATE TABLE courses (id INTEGER PRIMARY KEY, title VARCHAR(200) NOT NULL);`。结合“需求到表结构”的知识，最合理的理解是什么？
难度：MEDIUM
分值：10
知识点：需求到表结构、SQL 阅读
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：执行流程

选项：
- A. 该语句体现了“数据模型应反映业务实体与关系” [正确]
- B. 该语句一定会删除数据库中的全部记录
- C. 该语句的结果与表中数据完全无关
- D. 该语句可以忽略字段类型、约束和 NULL 语义

解析：
示例围绕“需求到表结构”展开，正确理解是：数据模型应反映业务实体与关系。判断 SQL 时应结合语句类型与数据语义。

#### 题目 3

题型：SINGLE_CHOICE
题干：在真实项目中应用“需求到表结构”时，哪一种做法最稳妥？
难度：HARD
分值：10
知识点：需求到表结构、边界分析
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：场景判断

选项：
- A. 先明确数据范围与结果语义，并验证“约束是模型的一部分” [正确]
- B. 不看数据结构，直接复制任意 SQL 到生产环境执行
- C. 为了缩短 SQL，删除所有过滤条件和连接条件
- D. 只要返回了数据，就无需检查重复、NULL 或统计粒度

解析：
可靠 SQL 需要同时考虑业务语义与数据边界。本课特别需要记住：约束是模型的一部分。

---

## 课时 2：综合报表查询

课时简介：学习综合报表查询的核心概念、SQL 写法和常见边界。

预计学习时间：20 分钟

### 正文

[标题]
综合报表查询的核心思路

[文本]
报表查询常同时使用 JOIN、WHERE、GROUP BY、HAVING 和 ORDER BY。应先定义统计口径，再写 SQL。

[代码 language=sql]
SELECT u.major, COUNT(o.id) AS orders FROM users u LEFT JOIN orders o ON o.user_id=u.id GROUP BY u.major ORDER BY orders DESC;
[/代码]

[标题]
从结果语义理解 SQL

[文本]
学习这一部分时，不要只记住关键字。应先说明查询或约束希望解决什么问题，再检查输入数据范围、结果粒度以及 NULL、重复行和排序等边界。对于“综合报表查询”，核心判断是：报表首先要明确统计口径。

[示例 title=综合报表查询示例]
说明：使用一个最小 SQL 示例观察语句结构，不连接或修改生产数据库。
语言：sql
SELECT u.major, COUNT(o.id) AS orders FROM users u LEFT JOIN orders o ON o.user_id=u.id GROUP BY u.major ORDER BY orders DESC;
[/示例]

[提示 title=综合报表查询学习提示]
JOIN 基数会影响聚合结果。先预测结果，再阅读 SQL，会比机械背语法更容易形成稳定理解。

[警告 title=注意 SQL 方言与数据边界]
不同数据库在函数、分页、日期处理等细节上可能不同。课程以通用关系型 SQL 思想为主，涉及写操作的示例仅用于学习，不应直接对生产数据库执行。

### 课时题目

#### 题目 4

题型：SINGLE_CHOICE
题干：关于“综合报表查询”，下列哪项说法正确？
难度：EASY
分值：10
知识点：综合报表查询
是否用于 Battle：否

选项：
- A. 报表首先要明确统计口径 [正确]
- B. SQL 的所有语句都会自动修改原表数据
- C. 只要语法能够执行，结果就一定符合业务需求
- D. NULL、重复行和排序永远不会影响查询结果

解析：
报表首先要明确统计口径。其余说法把 SQL 的查询、写入或结果语义绝对化了。

#### 题目 5

题型：SINGLE_CHOICE
题干：阅读下面 SQL：`SELECT u.major, COUNT(o.id) AS orders FROM users u LEFT JOIN orders o ON o.user_id=u.id GROUP BY u.major ORDER BY orders DESC;`。结合“综合报表查询”的知识，最合理的理解是什么？
难度：MEDIUM
分值：10
知识点：综合报表查询、SQL 阅读
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：执行流程

选项：
- A. 该语句体现了“报表首先要明确统计口径” [正确]
- B. 该语句一定会删除数据库中的全部记录
- C. 该语句的结果与表中数据完全无关
- D. 该语句可以忽略字段类型、约束和 NULL 语义

解析：
示例围绕“综合报表查询”展开，正确理解是：报表首先要明确统计口径。判断 SQL 时应结合语句类型与数据语义。

#### 题目 6

题型：CODE_FILL
题干：补全下面 SQL 中的 `____`，使语句能够表达本课“综合报表查询”示例的原意。请填写缺失的 SQL 片段。
难度：HARD
分值：10
知识点：综合报表查询、SQL 代码填空
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码:
```sql
SELECT u.major, COUNT(o.id) AS orders FROM users u ____ orders o ON o.user_id=u.id GROUP BY u.major ORDER BY orders DESC;
```

可接受答案:
```sql
LEFT JOIN
```

判题设置：
- 区分大小写：否
- 忽略首尾空格：是
- 保留代码内部空格：否
- 统一 Windows 和 Unix 换行：是

解析：
缺失部分是 `LEFT JOIN`。补全后语句恢复为本课示例，体现：报表首先要明确统计口径。

标准完整代码:
```sql
SELECT u.major, COUNT(o.id) AS orders FROM users u LEFT JOIN orders o ON o.user_id=u.id GROUP BY u.major ORDER BY orders DESC;
```

---

## 课时 3：EXPLAIN 执行计划

课时简介：学习EXPLAIN 执行计划的核心概念、SQL 写法和常见边界。

预计学习时间：20 分钟

### 正文

[标题]
EXPLAIN 执行计划的核心思路

[文本]
EXPLAIN 用于观察优化器计划，例如扫描方式、连接顺序和估算行数。不同数据库输出格式不同。

[代码 language=sql]
EXPLAIN SELECT * FROM orders WHERE user_id = 1001;
[/代码]

[标题]
从结果语义理解 SQL

[文本]
学习这一部分时，不要只记住关键字。应先说明查询或约束希望解决什么问题，再检查输入数据范围、结果粒度以及 NULL、重复行和排序等边界。对于“EXPLAIN 执行计划”，核心判断是：EXPLAIN 帮助理解查询执行策略。

[示例 title=EXPLAIN 执行计划示例]
说明：使用一个最小 SQL 示例观察语句结构，不连接或修改生产数据库。
语言：sql
EXPLAIN SELECT * FROM orders WHERE user_id = 1001;
[/示例]

[提示 title=EXPLAIN 执行计划学习提示]
不能只凭 SQL 文本猜测真实执行计划。先预测结果，再阅读 SQL，会比机械背语法更容易形成稳定理解。

[警告 title=注意 SQL 方言与数据边界]
不同数据库在函数、分页、日期处理等细节上可能不同。课程以通用关系型 SQL 思想为主，涉及写操作的示例仅用于学习，不应直接对生产数据库执行。

### 课时题目

#### 题目 7

题型：SINGLE_CHOICE
题干：关于“EXPLAIN 执行计划”，下列哪项说法正确？
难度：EASY
分值：10
知识点：EXPLAIN 执行计划
是否用于 Battle：否

选项：
- A. EXPLAIN 帮助理解查询执行策略 [正确]
- B. SQL 的所有语句都会自动修改原表数据
- C. 只要语法能够执行，结果就一定符合业务需求
- D. NULL、重复行和排序永远不会影响查询结果

解析：
EXPLAIN 帮助理解查询执行策略。其余说法把 SQL 的查询、写入或结果语义绝对化了。

#### 题目 8

题型：SINGLE_CHOICE
题干：阅读下面 SQL：`EXPLAIN SELECT * FROM orders WHERE user_id = 1001;`。结合“EXPLAIN 执行计划”的知识，最合理的理解是什么？
难度：MEDIUM
分值：10
知识点：EXPLAIN 执行计划、SQL 阅读
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：执行流程

选项：
- A. 该语句体现了“EXPLAIN 帮助理解查询执行策略” [正确]
- B. 该语句一定会删除数据库中的全部记录
- C. 该语句的结果与表中数据完全无关
- D. 该语句可以忽略字段类型、约束和 NULL 语义

解析：
示例围绕“EXPLAIN 执行计划”展开，正确理解是：EXPLAIN 帮助理解查询执行策略。判断 SQL 时应结合语句类型与数据语义。

#### 题目 9

题型：SINGLE_CHOICE
题干：在真实项目中应用“EXPLAIN 执行计划”时，哪一种做法最稳妥？
难度：HARD
分值：10
知识点：EXPLAIN 执行计划、边界分析
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：场景判断

选项：
- A. 先明确数据范围与结果语义，并验证“不能只凭 SQL 文本猜测真实执行计划” [正确]
- B. 不看数据结构，直接复制任意 SQL 到生产环境执行
- C. 为了缩短 SQL，删除所有过滤条件和连接条件
- D. 只要返回了数据，就无需检查重复、NULL 或统计粒度

解析：
可靠 SQL 需要同时考虑业务语义与数据边界。本课特别需要记住：不能只凭 SQL 文本猜测真实执行计划。

---

## 课时 4：索引与查询优化

课时简介：学习索引与查询优化的核心概念、SQL 写法和常见边界。

预计学习时间：20 分钟

### 正文

[标题]
索引与查询优化的核心思路

[文本]
优化应先定位真实瓶颈，再检查过滤选择性、连接键、排序和索引。避免为了“可能更快”盲目创建大量索引。

[代码 language=sql]
CREATE INDEX idx_orders_status_created ON orders(status, created_at);
[/代码]

[标题]
从结果语义理解 SQL

[文本]
学习这一部分时，不要只记住关键字。应先说明查询或约束希望解决什么问题，再检查输入数据范围、结果粒度以及 NULL、重复行和排序等边界。对于“索引与查询优化”，核心判断是：复合索引列顺序应结合查询模式。

[示例 title=索引与查询优化示例]
说明：使用一个最小 SQL 示例观察语句结构，不连接或修改生产数据库。
语言：sql
CREATE INDEX idx_orders_status_created ON orders(status, created_at);
[/示例]

[提示 title=索引与查询优化学习提示]
索引会增加写入和存储成本。先预测结果，再阅读 SQL，会比机械背语法更容易形成稳定理解。

[警告 title=注意 SQL 方言与数据边界]
不同数据库在函数、分页、日期处理等细节上可能不同。课程以通用关系型 SQL 思想为主，涉及写操作的示例仅用于学习，不应直接对生产数据库执行。

### 课时题目

#### 题目 10

题型：SINGLE_CHOICE
题干：关于“索引与查询优化”，下列哪项说法正确？
难度：EASY
分值：10
知识点：索引与查询优化
是否用于 Battle：否

选项：
- A. 复合索引列顺序应结合查询模式 [正确]
- B. SQL 的所有语句都会自动修改原表数据
- C. 只要语法能够执行，结果就一定符合业务需求
- D. NULL、重复行和排序永远不会影响查询结果

解析：
复合索引列顺序应结合查询模式。其余说法把 SQL 的查询、写入或结果语义绝对化了。

#### 题目 11

题型：SINGLE_CHOICE
题干：阅读下面 SQL：`CREATE INDEX idx_orders_status_created ON orders(status, created_at);`。结合“索引与查询优化”的知识，最合理的理解是什么？
难度：MEDIUM
分值：10
知识点：索引与查询优化、SQL 阅读
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：执行流程

选项：
- A. 该语句体现了“复合索引列顺序应结合查询模式” [正确]
- B. 该语句一定会删除数据库中的全部记录
- C. 该语句的结果与表中数据完全无关
- D. 该语句可以忽略字段类型、约束和 NULL 语义

解析：
示例围绕“索引与查询优化”展开，正确理解是：复合索引列顺序应结合查询模式。判断 SQL 时应结合语句类型与数据语义。

#### 题目 12

题型：CODE_FILL
题干：补全下面 SQL 中的 `____`，使语句能够表达本课“索引与查询优化”示例的原意。请填写缺失的 SQL 片段。
难度：HARD
分值：10
知识点：索引与查询优化、SQL 代码填空
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码:
```sql
____ idx_orders_status_created ON orders(status, created_at);
```

可接受答案:
```sql
CREATE INDEX
```

判题设置：
- 区分大小写：否
- 忽略首尾空格：是
- 保留代码内部空格：否
- 统一 Windows 和 Unix 换行：是

解析：
缺失部分是 `CREATE INDEX`。补全后语句恢复为本课示例，体现：复合索引列顺序应结合查询模式。

标准完整代码:
```sql
CREATE INDEX idx_orders_status_created ON orders(status, created_at);
```

---

## 课时 5：事务场景排错

课时简介：学习事务场景排错的核心概念、SQL 写法和常见边界。

预计学习时间：20 分钟

### 正文

[标题]
事务场景排错的核心思路

[文本]
事务问题要检查事务边界、锁等待、隔离级别和异常处理。长事务会长期占用资源并扩大冲突窗口。

[代码 language=sql]
BEGIN; SELECT id FROM accounts WHERE id=1; ROLLBACK;
[/代码]

[标题]
从结果语义理解 SQL

[文本]
学习这一部分时，不要只记住关键字。应先说明查询或约束希望解决什么问题，再检查输入数据范围、结果粒度以及 NULL、重复行和排序等边界。对于“事务场景排错”，核心判断是：事务应尽量保持必要且清晰的边界。

[示例 title=事务场景排错示例]
说明：使用一个最小 SQL 示例观察语句结构，不连接或修改生产数据库。
语言：sql
BEGIN; SELECT id FROM accounts WHERE id=1; ROLLBACK;
[/示例]

[提示 title=事务场景排错学习提示]
排错时要区分锁等待和慢查询。先预测结果，再阅读 SQL，会比机械背语法更容易形成稳定理解。

[警告 title=注意 SQL 方言与数据边界]
不同数据库在函数、分页、日期处理等细节上可能不同。课程以通用关系型 SQL 思想为主，涉及写操作的示例仅用于学习，不应直接对生产数据库执行。

### 课时题目

#### 题目 13

题型：SINGLE_CHOICE
题干：关于“事务场景排错”，下列哪项说法正确？
难度：EASY
分值：10
知识点：事务场景排错
是否用于 Battle：否

选项：
- A. 事务应尽量保持必要且清晰的边界 [正确]
- B. SQL 的所有语句都会自动修改原表数据
- C. 只要语法能够执行，结果就一定符合业务需求
- D. NULL、重复行和排序永远不会影响查询结果

解析：
事务应尽量保持必要且清晰的边界。其余说法把 SQL 的查询、写入或结果语义绝对化了。

#### 题目 14

题型：SINGLE_CHOICE
题干：阅读下面 SQL：`BEGIN; SELECT id FROM accounts WHERE id=1; ROLLBACK;`。结合“事务场景排错”的知识，最合理的理解是什么？
难度：MEDIUM
分值：10
知识点：事务场景排错、SQL 阅读
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：执行流程

选项：
- A. 该语句体现了“事务应尽量保持必要且清晰的边界” [正确]
- B. 该语句一定会删除数据库中的全部记录
- C. 该语句的结果与表中数据完全无关
- D. 该语句可以忽略字段类型、约束和 NULL 语义

解析：
示例围绕“事务场景排错”展开，正确理解是：事务应尽量保持必要且清晰的边界。判断 SQL 时应结合语句类型与数据语义。

#### 题目 15

题型：SINGLE_CHOICE
题干：在真实项目中应用“事务场景排错”时，哪一种做法最稳妥？
难度：HARD
分值：10
知识点：事务场景排错、边界分析
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：场景判断

选项：
- A. 先明确数据范围与结果语义，并验证“排错时要区分锁等待和慢查询” [正确]
- B. 不看数据结构，直接复制任意 SQL 到生产环境执行
- C. 为了缩短 SQL，删除所有过滤条件和连接条件
- D. 只要返回了数据，就无需检查重复、NULL 或统计粒度

解析：
可靠 SQL 需要同时考虑业务语义与数据边界。本课特别需要记住：排错时要区分锁等待和慢查询。

---

## 课时 6：综合 SQL 实战

课时简介：学习综合 SQL 实战的核心概念、SQL 写法和常见边界。

预计学习时间：20 分钟

### 正文

[标题]
综合 SQL 实战的核心思路

[文本]
综合 SQL 的核心不是堆语法，而是把需求翻译成可靠的数据范围、连接关系、统计粒度和可验证结果。

[代码 language=sql]
WITH totals AS (SELECT user_id, SUM(amount) total FROM orders WHERE status='PAID' GROUP BY user_id) SELECT u.name, t.total FROM totals t JOIN users u ON u.id=t.user_id ORDER BY t.total DESC;
[/代码]

[标题]
从结果语义理解 SQL

[文本]
学习这一部分时，不要只记住关键字。应先说明查询或约束希望解决什么问题，再检查输入数据范围、结果粒度以及 NULL、重复行和排序等边界。对于“综合 SQL 实战”，核心判断是：复杂查询应能解释每一步的数据语义。

[示例 title=综合 SQL 实战示例]
说明：使用一个最小 SQL 示例观察语句结构，不连接或修改生产数据库。
语言：sql
WITH totals AS (SELECT user_id, SUM(amount) total FROM orders WHERE status='PAID' GROUP BY user_id) SELECT u.name, t.total FROM totals t JOIN users u ON u.id=t.user_id ORDER BY t.total DESC;
[/示例]

[提示 title=综合 SQL 实战学习提示]
最终结果必须能回到业务需求验证。先预测结果，再阅读 SQL，会比机械背语法更容易形成稳定理解。

[警告 title=注意 SQL 方言与数据边界]
不同数据库在函数、分页、日期处理等细节上可能不同。课程以通用关系型 SQL 思想为主，涉及写操作的示例仅用于学习，不应直接对生产数据库执行。

### 课时题目

#### 题目 16

题型：SINGLE_CHOICE
题干：关于“综合 SQL 实战”，下列哪项说法正确？
难度：EASY
分值：10
知识点：综合 SQL 实战
是否用于 Battle：否

选项：
- A. 复杂查询应能解释每一步的数据语义 [正确]
- B. SQL 的所有语句都会自动修改原表数据
- C. 只要语法能够执行，结果就一定符合业务需求
- D. NULL、重复行和排序永远不会影响查询结果

解析：
复杂查询应能解释每一步的数据语义。其余说法把 SQL 的查询、写入或结果语义绝对化了。

#### 题目 17

题型：SINGLE_CHOICE
题干：阅读下面 SQL：`WITH totals AS (SELECT user_id, SUM(amount) total FROM orders WHERE status='PAID' GROUP BY user_id) SELECT u.name, t.total FROM totals t JOIN users u ON u.id=t.user_id ORDER BY t.total DESC;`。结合“综合 SQL 实战”的知识，最合理的理解是什么？
难度：MEDIUM
分值：10
知识点：综合 SQL 实战、SQL 阅读
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：执行流程

选项：
- A. 该语句体现了“复杂查询应能解释每一步的数据语义” [正确]
- B. 该语句一定会删除数据库中的全部记录
- C. 该语句的结果与表中数据完全无关
- D. 该语句可以忽略字段类型、约束和 NULL 语义

解析：
示例围绕“综合 SQL 实战”展开，正确理解是：复杂查询应能解释每一步的数据语义。判断 SQL 时应结合语句类型与数据语义。

#### 题目 18

题型：CODE_FILL
题干：补全下面 SQL 中的 `____`，使语句能够表达本课“综合 SQL 实战”示例的原意。请填写缺失的 SQL 片段。
难度：HARD
分值：10
知识点：综合 SQL 实战、SQL 代码填空
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码:
```sql
WITH totals AS (SELECT user_id, SUM(amount) total FROM orders WHERE status='PAID' GROUP BY user_id) SELECT u.name, t.total FROM totals t JOIN users u ON u.id=t.user_id ____ t.total DESC;
```

可接受答案:
```sql
ORDER BY
```

判题设置：
- 区分大小写：否
- 忽略首尾空格：是
- 保留代码内部空格：否
- 统一 Windows 和 Unix 换行：是

解析：
缺失部分是 `ORDER BY`。补全后语句恢复为本课示例，体现：复杂查询应能解释每一步的数据语义。

标准完整代码:
```sql
WITH totals AS (SELECT user_id, SUM(amount) total FROM orders WHERE status='PAID' GROUP BY user_id) SELECT u.name, t.total FROM totals t JOIN users u ON u.id=t.user_id ORDER BY t.total DESC;
```

---
