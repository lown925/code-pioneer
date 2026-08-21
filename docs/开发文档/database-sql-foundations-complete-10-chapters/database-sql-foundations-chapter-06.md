# 第六章：子查询、集合与 CTE

章节简介：使用子查询、EXISTS、集合运算和 CTE 组织更复杂的查询，并理解不同写法的适用场景。 学习完成后，能够把本章 SQL 能力应用到清晰、可验证的数据库查询或设计任务中。

预计学习时间：120 分钟

章节学习目标：
- 理解并能够应用“标量与单列子查询”的核心规则
- 理解并能够应用“IN 子查询”的核心规则
- 理解并能够应用“EXISTS 与相关子查询”的核心规则
- 理解并能够应用“UNION 与 UNION ALL”的核心规则
- 理解并能够应用“CTE 公共表表达式”的核心规则
- 理解并能够应用“复杂查询拆解”的核心规则

---

## 课时 1：标量与单列子查询

课时简介：学习标量与单列子查询的核心概念、SQL 写法和常见边界。

预计学习时间：20 分钟

### 正文

[标题]
标量与单列子查询的核心思路

[文本]
子查询可以产生一个标量或一列值供外层查询使用。标量子查询若返回多行通常会报错。

[代码 language=sql]
SELECT name FROM products WHERE price > (SELECT AVG(price) FROM products);
[/代码]

[标题]
从结果语义理解 SQL

[文本]
学习这一部分时，不要只记住关键字。应先说明查询或约束希望解决什么问题，再检查输入数据范围、结果粒度以及 NULL、重复行和排序等边界。对于“标量与单列子查询”，核心判断是：标量子查询应返回单个值。

[示例 title=标量与单列子查询示例]
说明：使用一个最小 SQL 示例观察语句结构，不连接或修改生产数据库。
语言：sql
SELECT name FROM products WHERE price > (SELECT AVG(price) FROM products);
[/示例]

[提示 title=标量与单列子查询学习提示]
子查询可以嵌入 WHERE 条件。先预测结果，再阅读 SQL，会比机械背语法更容易形成稳定理解。

[警告 title=注意 SQL 方言与数据边界]
不同数据库在函数、分页、日期处理等细节上可能不同。课程以通用关系型 SQL 思想为主，涉及写操作的示例仅用于学习，不应直接对生产数据库执行。

### 课时题目

#### 题目 1

题型：SINGLE_CHOICE
题干：关于“标量与单列子查询”，下列哪项说法正确？
难度：EASY
分值：10
知识点：标量与单列子查询
是否用于 Battle：否

选项：
- A. 标量子查询应返回单个值 [正确]
- B. SQL 的所有语句都会自动修改原表数据
- C. 只要语法能够执行，结果就一定符合业务需求
- D. NULL、重复行和排序永远不会影响查询结果

解析：
标量子查询应返回单个值。其余说法把 SQL 的查询、写入或结果语义绝对化了。

#### 题目 2

题型：SINGLE_CHOICE
题干：阅读下面 SQL：`SELECT name FROM products WHERE price > (SELECT AVG(price) FROM products);`。结合“标量与单列子查询”的知识，最合理的理解是什么？
难度：MEDIUM
分值：10
知识点：标量与单列子查询、SQL 阅读
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：执行流程

选项：
- A. 该语句体现了“标量子查询应返回单个值” [正确]
- B. 该语句一定会删除数据库中的全部记录
- C. 该语句的结果与表中数据完全无关
- D. 该语句可以忽略字段类型、约束和 NULL 语义

解析：
示例围绕“标量与单列子查询”展开，正确理解是：标量子查询应返回单个值。判断 SQL 时应结合语句类型与数据语义。

#### 题目 3

题型：SINGLE_CHOICE
题干：在真实项目中应用“标量与单列子查询”时，哪一种做法最稳妥？
难度：HARD
分值：10
知识点：标量与单列子查询、边界分析
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：场景判断

选项：
- A. 先明确数据范围与结果语义，并验证“子查询可以嵌入 WHERE 条件” [正确]
- B. 不看数据结构，直接复制任意 SQL 到生产环境执行
- C. 为了缩短 SQL，删除所有过滤条件和连接条件
- D. 只要返回了数据，就无需检查重复、NULL 或统计粒度

解析：
可靠 SQL 需要同时考虑业务语义与数据边界。本课特别需要记住：子查询可以嵌入 WHERE 条件。

---

## 课时 2：IN 子查询

课时简介：学习IN 子查询的核心概念、SQL 写法和常见边界。

预计学习时间：20 分钟

### 正文

[标题]
IN 子查询的核心思路

[文本]
IN 子查询适合判断某值是否属于子查询结果集合。应注意 NULL 对 NOT IN 语义的影响。

[代码 language=sql]
SELECT name FROM users WHERE id IN (SELECT user_id FROM orders);
[/代码]

[标题]
从结果语义理解 SQL

[文本]
学习这一部分时，不要只记住关键字。应先说明查询或约束希望解决什么问题，再检查输入数据范围、结果粒度以及 NULL、重复行和排序等边界。对于“IN 子查询”，核心判断是：IN 可以消费单列子查询结果。

[示例 title=IN 子查询示例]
说明：使用一个最小 SQL 示例观察语句结构，不连接或修改生产数据库。
语言：sql
SELECT name FROM users WHERE id IN (SELECT user_id FROM orders);
[/示例]

[提示 title=IN 子查询学习提示]
NOT IN 遇到 NULL 时需格外谨慎。先预测结果，再阅读 SQL，会比机械背语法更容易形成稳定理解。

[警告 title=注意 SQL 方言与数据边界]
不同数据库在函数、分页、日期处理等细节上可能不同。课程以通用关系型 SQL 思想为主，涉及写操作的示例仅用于学习，不应直接对生产数据库执行。

### 课时题目

#### 题目 4

题型：SINGLE_CHOICE
题干：关于“IN 子查询”，下列哪项说法正确？
难度：EASY
分值：10
知识点：IN 子查询
是否用于 Battle：否

选项：
- A. IN 可以消费单列子查询结果 [正确]
- B. SQL 的所有语句都会自动修改原表数据
- C. 只要语法能够执行，结果就一定符合业务需求
- D. NULL、重复行和排序永远不会影响查询结果

解析：
IN 可以消费单列子查询结果。其余说法把 SQL 的查询、写入或结果语义绝对化了。

#### 题目 5

题型：SINGLE_CHOICE
题干：阅读下面 SQL：`SELECT name FROM users WHERE id IN (SELECT user_id FROM orders);`。结合“IN 子查询”的知识，最合理的理解是什么？
难度：MEDIUM
分值：10
知识点：IN 子查询、SQL 阅读
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：执行流程

选项：
- A. 该语句体现了“IN 可以消费单列子查询结果” [正确]
- B. 该语句一定会删除数据库中的全部记录
- C. 该语句的结果与表中数据完全无关
- D. 该语句可以忽略字段类型、约束和 NULL 语义

解析：
示例围绕“IN 子查询”展开，正确理解是：IN 可以消费单列子查询结果。判断 SQL 时应结合语句类型与数据语义。

#### 题目 6

题型：CODE_FILL
题干：补全下面 SQL 中的 `____`，使语句能够表达本课“IN 子查询”示例的原意。请填写缺失的 SQL 片段。
难度：HARD
分值：10
知识点：IN 子查询、SQL 代码填空
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码:
```sql
____ name FROM users WHERE id IN (SELECT user_id FROM orders);
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
缺失部分是 `SELECT`。补全后语句恢复为本课示例，体现：IN 可以消费单列子查询结果。

标准完整代码:
```sql
SELECT name FROM users WHERE id IN (SELECT user_id FROM orders);
```

---

## 课时 3：EXISTS 与相关子查询

课时简介：学习EXISTS 与相关子查询的核心概念、SQL 写法和常见边界。

预计学习时间：20 分钟

### 正文

[标题]
EXISTS 与相关子查询的核心思路

[文本]
EXISTS 关注子查询是否至少返回一行，相关子查询会引用外层当前行，常用于表达“是否存在关联记录”。

[代码 language=sql]
SELECT u.name FROM users u WHERE EXISTS (SELECT 1 FROM orders o WHERE o.user_id=u.id);
[/代码]

[标题]
从结果语义理解 SQL

[文本]
学习这一部分时，不要只记住关键字。应先说明查询或约束希望解决什么问题，再检查输入数据范围、结果粒度以及 NULL、重复行和排序等边界。对于“EXISTS 与相关子查询”，核心判断是：EXISTS 判断是否存在匹配行。

[示例 title=EXISTS 与相关子查询示例]
说明：使用一个最小 SQL 示例观察语句结构，不连接或修改生产数据库。
语言：sql
SELECT u.name FROM users u WHERE EXISTS (SELECT 1 FROM orders o WHERE o.user_id=u.id);
[/示例]

[提示 title=EXISTS 与相关子查询学习提示]
相关子查询可以引用外层查询列。先预测结果，再阅读 SQL，会比机械背语法更容易形成稳定理解。

[警告 title=注意 SQL 方言与数据边界]
不同数据库在函数、分页、日期处理等细节上可能不同。课程以通用关系型 SQL 思想为主，涉及写操作的示例仅用于学习，不应直接对生产数据库执行。

### 课时题目

#### 题目 7

题型：SINGLE_CHOICE
题干：关于“EXISTS 与相关子查询”，下列哪项说法正确？
难度：EASY
分值：10
知识点：EXISTS 与相关子查询
是否用于 Battle：否

选项：
- A. EXISTS 判断是否存在匹配行 [正确]
- B. SQL 的所有语句都会自动修改原表数据
- C. 只要语法能够执行，结果就一定符合业务需求
- D. NULL、重复行和排序永远不会影响查询结果

解析：
EXISTS 判断是否存在匹配行。其余说法把 SQL 的查询、写入或结果语义绝对化了。

#### 题目 8

题型：SINGLE_CHOICE
题干：阅读下面 SQL：`SELECT u.name FROM users u WHERE EXISTS (SELECT 1 FROM orders o WHERE o.user_id=u.id);`。结合“EXISTS 与相关子查询”的知识，最合理的理解是什么？
难度：MEDIUM
分值：10
知识点：EXISTS 与相关子查询、SQL 阅读
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：执行流程

选项：
- A. 该语句体现了“EXISTS 判断是否存在匹配行” [正确]
- B. 该语句一定会删除数据库中的全部记录
- C. 该语句的结果与表中数据完全无关
- D. 该语句可以忽略字段类型、约束和 NULL 语义

解析：
示例围绕“EXISTS 与相关子查询”展开，正确理解是：EXISTS 判断是否存在匹配行。判断 SQL 时应结合语句类型与数据语义。

#### 题目 9

题型：SINGLE_CHOICE
题干：在真实项目中应用“EXISTS 与相关子查询”时，哪一种做法最稳妥？
难度：HARD
分值：10
知识点：EXISTS 与相关子查询、边界分析
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：场景判断

选项：
- A. 先明确数据范围与结果语义，并验证“相关子查询可以引用外层查询列” [正确]
- B. 不看数据结构，直接复制任意 SQL 到生产环境执行
- C. 为了缩短 SQL，删除所有过滤条件和连接条件
- D. 只要返回了数据，就无需检查重复、NULL 或统计粒度

解析：
可靠 SQL 需要同时考虑业务语义与数据边界。本课特别需要记住：相关子查询可以引用外层查询列。

---

## 课时 4：UNION 与 UNION ALL

课时简介：学习UNION 与 UNION ALL的核心概念、SQL 写法和常见边界。

预计学习时间：20 分钟

### 正文

[标题]
UNION 与 UNION ALL的核心思路

[文本]
UNION 合并结构兼容的结果并去重，UNION ALL 保留重复行，通常也避免额外去重成本。

[代码 language=sql]
SELECT email FROM customers UNION ALL SELECT email FROM leads;
[/代码]

[标题]
从结果语义理解 SQL

[文本]
学习这一部分时，不要只记住关键字。应先说明查询或约束希望解决什么问题，再检查输入数据范围、结果粒度以及 NULL、重复行和排序等边界。对于“UNION 与 UNION ALL”，核心判断是：UNION ALL 保留重复行。

[示例 title=UNION 与 UNION ALL示例]
说明：使用一个最小 SQL 示例观察语句结构，不连接或修改生产数据库。
语言：sql
SELECT email FROM customers UNION ALL SELECT email FROM leads;
[/示例]

[提示 title=UNION 与 UNION ALL学习提示]
集合两侧列数与兼容类型应对应。先预测结果，再阅读 SQL，会比机械背语法更容易形成稳定理解。

[警告 title=注意 SQL 方言与数据边界]
不同数据库在函数、分页、日期处理等细节上可能不同。课程以通用关系型 SQL 思想为主，涉及写操作的示例仅用于学习，不应直接对生产数据库执行。

### 课时题目

#### 题目 10

题型：SINGLE_CHOICE
题干：关于“UNION 与 UNION ALL”，下列哪项说法正确？
难度：EASY
分值：10
知识点：UNION 与 UNION ALL
是否用于 Battle：否

选项：
- A. UNION ALL 保留重复行 [正确]
- B. SQL 的所有语句都会自动修改原表数据
- C. 只要语法能够执行，结果就一定符合业务需求
- D. NULL、重复行和排序永远不会影响查询结果

解析：
UNION ALL 保留重复行。其余说法把 SQL 的查询、写入或结果语义绝对化了。

#### 题目 11

题型：SINGLE_CHOICE
题干：阅读下面 SQL：`SELECT email FROM customers UNION ALL SELECT email FROM leads;`。结合“UNION 与 UNION ALL”的知识，最合理的理解是什么？
难度：MEDIUM
分值：10
知识点：UNION 与 UNION ALL、SQL 阅读
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：执行流程

选项：
- A. 该语句体现了“UNION ALL 保留重复行” [正确]
- B. 该语句一定会删除数据库中的全部记录
- C. 该语句的结果与表中数据完全无关
- D. 该语句可以忽略字段类型、约束和 NULL 语义

解析：
示例围绕“UNION 与 UNION ALL”展开，正确理解是：UNION ALL 保留重复行。判断 SQL 时应结合语句类型与数据语义。

#### 题目 12

题型：CODE_FILL
题干：补全下面 SQL 中的 `____`，使语句能够表达本课“UNION 与 UNION ALL”示例的原意。请填写缺失的 SQL 片段。
难度：HARD
分值：10
知识点：UNION 与 UNION ALL、SQL 代码填空
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码:
```sql
SELECT email FROM customers ____ SELECT email FROM leads;
```

可接受答案:
```sql
UNION ALL
```

判题设置：
- 区分大小写：否
- 忽略首尾空格：是
- 保留代码内部空格：否
- 统一 Windows 和 Unix 换行：是

解析：
缺失部分是 `UNION ALL`。补全后语句恢复为本课示例，体现：UNION ALL 保留重复行。

标准完整代码:
```sql
SELECT email FROM customers UNION ALL SELECT email FROM leads;
```

---

## 课时 5：CTE 公共表表达式

课时简介：学习CTE 公共表表达式的核心概念、SQL 写法和常见边界。

预计学习时间：20 分钟

### 正文

[标题]
CTE 公共表表达式的核心思路

[文本]
WITH 定义 CTE，可把复杂查询拆成命名步骤，提高可读性。CTE 是否物化取决于数据库和优化器。

[代码 language=sql]
WITH totals AS (SELECT user_id, SUM(amount) AS total FROM orders GROUP BY user_id) SELECT * FROM totals WHERE total > 1000;
[/代码]

[标题]
从结果语义理解 SQL

[文本]
学习这一部分时，不要只记住关键字。应先说明查询或约束希望解决什么问题，再检查输入数据范围、结果粒度以及 NULL、重复行和排序等边界。对于“CTE 公共表表达式”，核心判断是：CTE 可以为中间结果命名。

[示例 title=CTE 公共表表达式示例]
说明：使用一个最小 SQL 示例观察语句结构，不连接或修改生产数据库。
语言：sql
WITH totals AS (SELECT user_id, SUM(amount) AS total FROM orders GROUP BY user_id) SELECT * FROM totals WHERE total > 1000;
[/示例]

[提示 title=CTE 公共表表达式学习提示]
CTE 有助于拆解复杂查询。先预测结果，再阅读 SQL，会比机械背语法更容易形成稳定理解。

[警告 title=注意 SQL 方言与数据边界]
不同数据库在函数、分页、日期处理等细节上可能不同。课程以通用关系型 SQL 思想为主，涉及写操作的示例仅用于学习，不应直接对生产数据库执行。

### 课时题目

#### 题目 13

题型：SINGLE_CHOICE
题干：关于“CTE 公共表表达式”，下列哪项说法正确？
难度：EASY
分值：10
知识点：CTE 公共表表达式
是否用于 Battle：否

选项：
- A. CTE 可以为中间结果命名 [正确]
- B. SQL 的所有语句都会自动修改原表数据
- C. 只要语法能够执行，结果就一定符合业务需求
- D. NULL、重复行和排序永远不会影响查询结果

解析：
CTE 可以为中间结果命名。其余说法把 SQL 的查询、写入或结果语义绝对化了。

#### 题目 14

题型：SINGLE_CHOICE
题干：阅读下面 SQL：`WITH totals AS (SELECT user_id, SUM(amount) AS total FROM orders GROUP BY user_id) SELECT * FROM totals WHERE total > 1000;`。结合“CTE 公共表表达式”的知识，最合理的理解是什么？
难度：MEDIUM
分值：10
知识点：CTE 公共表表达式、SQL 阅读
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：执行流程

选项：
- A. 该语句体现了“CTE 可以为中间结果命名” [正确]
- B. 该语句一定会删除数据库中的全部记录
- C. 该语句的结果与表中数据完全无关
- D. 该语句可以忽略字段类型、约束和 NULL 语义

解析：
示例围绕“CTE 公共表表达式”展开，正确理解是：CTE 可以为中间结果命名。判断 SQL 时应结合语句类型与数据语义。

#### 题目 15

题型：SINGLE_CHOICE
题干：在真实项目中应用“CTE 公共表表达式”时，哪一种做法最稳妥？
难度：HARD
分值：10
知识点：CTE 公共表表达式、边界分析
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：场景判断

选项：
- A. 先明确数据范围与结果语义，并验证“CTE 有助于拆解复杂查询” [正确]
- B. 不看数据结构，直接复制任意 SQL 到生产环境执行
- C. 为了缩短 SQL，删除所有过滤条件和连接条件
- D. 只要返回了数据，就无需检查重复、NULL 或统计粒度

解析：
可靠 SQL 需要同时考虑业务语义与数据边界。本课特别需要记住：CTE 有助于拆解复杂查询。

---

## 课时 6：复杂查询拆解

课时简介：学习复杂查询拆解的核心概念、SQL 写法和常见边界。

预计学习时间：20 分钟

### 正文

[标题]
复杂查询拆解的核心思路

[文本]
复杂 SQL 应先明确输入、过滤、连接、聚合和最终输出，再逐层构造并验证中间结果，避免一次写出难以排错的长语句。

[代码 language=sql]
WITH paid AS (SELECT * FROM orders WHERE status='PAID') SELECT user_id, COUNT(*) FROM paid GROUP BY user_id;
[/代码]

[标题]
从结果语义理解 SQL

[文本]
学习这一部分时，不要只记住关键字。应先说明查询或约束希望解决什么问题，再检查输入数据范围、结果粒度以及 NULL、重复行和排序等边界。对于“复杂查询拆解”，核心判断是：分阶段验证能降低复杂查询排错成本。

[示例 title=复杂查询拆解示例]
说明：使用一个最小 SQL 示例观察语句结构，不连接或修改生产数据库。
语言：sql
WITH paid AS (SELECT * FROM orders WHERE status='PAID') SELECT user_id, COUNT(*) FROM paid GROUP BY user_id;
[/示例]

[提示 title=复杂查询拆解学习提示]
可读性是 SQL 可维护性的重要组成。先预测结果，再阅读 SQL，会比机械背语法更容易形成稳定理解。

[警告 title=注意 SQL 方言与数据边界]
不同数据库在函数、分页、日期处理等细节上可能不同。课程以通用关系型 SQL 思想为主，涉及写操作的示例仅用于学习，不应直接对生产数据库执行。

### 课时题目

#### 题目 16

题型：SINGLE_CHOICE
题干：关于“复杂查询拆解”，下列哪项说法正确？
难度：EASY
分值：10
知识点：复杂查询拆解
是否用于 Battle：否

选项：
- A. 分阶段验证能降低复杂查询排错成本 [正确]
- B. SQL 的所有语句都会自动修改原表数据
- C. 只要语法能够执行，结果就一定符合业务需求
- D. NULL、重复行和排序永远不会影响查询结果

解析：
分阶段验证能降低复杂查询排错成本。其余说法把 SQL 的查询、写入或结果语义绝对化了。

#### 题目 17

题型：SINGLE_CHOICE
题干：阅读下面 SQL：`WITH paid AS (SELECT * FROM orders WHERE status='PAID') SELECT user_id, COUNT(*) FROM paid GROUP BY user_id;`。结合“复杂查询拆解”的知识，最合理的理解是什么？
难度：MEDIUM
分值：10
知识点：复杂查询拆解、SQL 阅读
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：执行流程

选项：
- A. 该语句体现了“分阶段验证能降低复杂查询排错成本” [正确]
- B. 该语句一定会删除数据库中的全部记录
- C. 该语句的结果与表中数据完全无关
- D. 该语句可以忽略字段类型、约束和 NULL 语义

解析：
示例围绕“复杂查询拆解”展开，正确理解是：分阶段验证能降低复杂查询排错成本。判断 SQL 时应结合语句类型与数据语义。

#### 题目 18

题型：CODE_FILL
题干：补全下面 SQL 中的 `____`，使语句能够表达本课“复杂查询拆解”示例的原意。请填写缺失的 SQL 片段。
难度：HARD
分值：10
知识点：复杂查询拆解、SQL 代码填空
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码:
```sql
WITH paid AS (SELECT * FROM orders WHERE status='PAID') SELECT user_id, COUNT(*) FROM paid ____ user_id;
```

可接受答案:
```sql
GROUP BY
```

判题设置：
- 区分大小写：否
- 忽略首尾空格：是
- 保留代码内部空格：否
- 统一 Windows 和 Unix 换行：是

解析：
缺失部分是 `GROUP BY`。补全后语句恢复为本课示例，体现：分阶段验证能降低复杂查询排错成本。

标准完整代码:
```sql
WITH paid AS (SELECT * FROM orders WHERE status='PAID') SELECT user_id, COUNT(*) FROM paid GROUP BY user_id;
```

---
