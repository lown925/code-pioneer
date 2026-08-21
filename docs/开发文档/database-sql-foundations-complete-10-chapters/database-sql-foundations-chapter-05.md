# 第五章：多表查询与 JOIN

章节简介：理解表之间的关系，掌握 INNER JOIN、LEFT JOIN 和多表连接，避免常见连接错误。 学习完成后，能够把本章 SQL 能力应用到清晰、可验证的数据库查询或设计任务中。

预计学习时间：120 分钟

章节学习目标：
- 理解并能够应用“外键与表关系”的核心规则
- 理解并能够应用“INNER JOIN”的核心规则
- 理解并能够应用“LEFT JOIN”的核心规则
- 理解并能够应用“多条件 JOIN”的核心规则
- 理解并能够应用“多表 JOIN”的核心规则
- 理解并能够应用“JOIN 重复行与排错”的核心规则

---

## 课时 1：外键与表关系

课时简介：学习外键与表关系的核心概念、SQL 写法和常见边界。

预计学习时间：20 分钟

### 正文

[标题]
外键与表关系的核心思路

[文本]
一对多关系常把外键放在“多”的一侧，例如 orders.user_id 指向 users.id。外键用于维护引用完整性。

[代码 language=sql]
SELECT o.id, o.user_id FROM orders AS o;
[/代码]

[标题]
从结果语义理解 SQL

[文本]
学习这一部分时，不要只记住关键字。应先说明查询或约束希望解决什么问题，再检查输入数据范围、结果粒度以及 NULL、重复行和排序等边界。对于“外键与表关系”，核心判断是：外键表达记录之间的引用关系。

[示例 title=外键与表关系示例]
说明：使用一个最小 SQL 示例观察语句结构，不连接或修改生产数据库。
语言：sql
SELECT o.id, o.user_id FROM orders AS o;
[/示例]

[提示 title=外键与表关系学习提示]
外键列通常保存被引用表的键值。先预测结果，再阅读 SQL，会比机械背语法更容易形成稳定理解。

[警告 title=注意 SQL 方言与数据边界]
不同数据库在函数、分页、日期处理等细节上可能不同。课程以通用关系型 SQL 思想为主，涉及写操作的示例仅用于学习，不应直接对生产数据库执行。

### 课时题目

#### 题目 1

题型：SINGLE_CHOICE
题干：关于“外键与表关系”，下列哪项说法正确？
难度：EASY
分值：10
知识点：外键与表关系
是否用于 Battle：否

选项：
- A. 外键表达记录之间的引用关系 [正确]
- B. SQL 的所有语句都会自动修改原表数据
- C. 只要语法能够执行，结果就一定符合业务需求
- D. NULL、重复行和排序永远不会影响查询结果

解析：
外键表达记录之间的引用关系。其余说法把 SQL 的查询、写入或结果语义绝对化了。

#### 题目 2

题型：SINGLE_CHOICE
题干：阅读下面 SQL：`SELECT o.id, o.user_id FROM orders AS o;`。结合“外键与表关系”的知识，最合理的理解是什么？
难度：MEDIUM
分值：10
知识点：外键与表关系、SQL 阅读
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：执行流程

选项：
- A. 该语句体现了“外键表达记录之间的引用关系” [正确]
- B. 该语句一定会删除数据库中的全部记录
- C. 该语句的结果与表中数据完全无关
- D. 该语句可以忽略字段类型、约束和 NULL 语义

解析：
示例围绕“外键与表关系”展开，正确理解是：外键表达记录之间的引用关系。判断 SQL 时应结合语句类型与数据语义。

#### 题目 3

题型：SINGLE_CHOICE
题干：在真实项目中应用“外键与表关系”时，哪一种做法最稳妥？
难度：HARD
分值：10
知识点：外键与表关系、边界分析
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：场景判断

选项：
- A. 先明确数据范围与结果语义，并验证“外键列通常保存被引用表的键值” [正确]
- B. 不看数据结构，直接复制任意 SQL 到生产环境执行
- C. 为了缩短 SQL，删除所有过滤条件和连接条件
- D. 只要返回了数据，就无需检查重复、NULL 或统计粒度

解析：
可靠 SQL 需要同时考虑业务语义与数据边界。本课特别需要记住：外键列通常保存被引用表的键值。

---

## 课时 2：INNER JOIN

课时简介：学习INNER JOIN的核心概念、SQL 写法和常见边界。

预计学习时间：20 分钟

### 正文

[标题]
INNER JOIN的核心思路

[文本]
INNER JOIN 只保留连接条件匹配成功的组合。ON 应描述表之间的关联条件，而不是依赖同名列自动推断。

[代码 language=sql]
SELECT o.id, u.name FROM orders o INNER JOIN users u ON o.user_id = u.id;
[/代码]

[标题]
从结果语义理解 SQL

[文本]
学习这一部分时，不要只记住关键字。应先说明查询或约束希望解决什么问题，再检查输入数据范围、结果粒度以及 NULL、重复行和排序等边界。对于“INNER JOIN”，核心判断是：INNER JOIN 返回双方匹配的行。

[示例 title=INNER JOIN示例]
说明：使用一个最小 SQL 示例观察语句结构，不连接或修改生产数据库。
语言：sql
SELECT o.id, u.name FROM orders o INNER JOIN users u ON o.user_id = u.id;
[/示例]

[提示 title=INNER JOIN学习提示]
ON 明确连接键。先预测结果，再阅读 SQL，会比机械背语法更容易形成稳定理解。

[警告 title=注意 SQL 方言与数据边界]
不同数据库在函数、分页、日期处理等细节上可能不同。课程以通用关系型 SQL 思想为主，涉及写操作的示例仅用于学习，不应直接对生产数据库执行。

### 课时题目

#### 题目 4

题型：SINGLE_CHOICE
题干：关于“INNER JOIN”，下列哪项说法正确？
难度：EASY
分值：10
知识点：INNER JOIN
是否用于 Battle：否

选项：
- A. INNER JOIN 返回双方匹配的行 [正确]
- B. SQL 的所有语句都会自动修改原表数据
- C. 只要语法能够执行，结果就一定符合业务需求
- D. NULL、重复行和排序永远不会影响查询结果

解析：
INNER JOIN 返回双方匹配的行。其余说法把 SQL 的查询、写入或结果语义绝对化了。

#### 题目 5

题型：SINGLE_CHOICE
题干：阅读下面 SQL：`SELECT o.id, u.name FROM orders o INNER JOIN users u ON o.user_id = u.id;`。结合“INNER JOIN”的知识，最合理的理解是什么？
难度：MEDIUM
分值：10
知识点：INNER JOIN、SQL 阅读
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：执行流程

选项：
- A. 该语句体现了“INNER JOIN 返回双方匹配的行” [正确]
- B. 该语句一定会删除数据库中的全部记录
- C. 该语句的结果与表中数据完全无关
- D. 该语句可以忽略字段类型、约束和 NULL 语义

解析：
示例围绕“INNER JOIN”展开，正确理解是：INNER JOIN 返回双方匹配的行。判断 SQL 时应结合语句类型与数据语义。

#### 题目 6

题型：CODE_FILL
题干：补全下面 SQL 中的 `____`，使语句能够表达本课“INNER JOIN”示例的原意。请填写缺失的 SQL 片段。
难度：HARD
分值：10
知识点：INNER JOIN、SQL 代码填空
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码:
```sql
____ o.id, u.name FROM orders o INNER JOIN users u ON o.user_id = u.id;
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
缺失部分是 `SELECT`。补全后语句恢复为本课示例，体现：INNER JOIN 返回双方匹配的行。

标准完整代码:
```sql
SELECT o.id, u.name FROM orders o INNER JOIN users u ON o.user_id = u.id;
```

---

## 课时 3：LEFT JOIN

课时简介：学习LEFT JOIN的核心概念、SQL 写法和常见边界。

预计学习时间：20 分钟

### 正文

[标题]
LEFT JOIN的核心思路

[文本]
LEFT JOIN 保留左表全部行，右表匹配不到时对应列为 NULL。它常用于寻找“没有关联记录”的对象。

[代码 language=sql]
SELECT u.id, u.name, o.id AS order_id FROM users u LEFT JOIN orders o ON o.user_id = u.id;
[/代码]

[标题]
从结果语义理解 SQL

[文本]
学习这一部分时，不要只记住关键字。应先说明查询或约束希望解决什么问题，再检查输入数据范围、结果粒度以及 NULL、重复行和排序等边界。对于“LEFT JOIN”，核心判断是：LEFT JOIN 保留左表全部记录。

[示例 title=LEFT JOIN示例]
说明：使用一个最小 SQL 示例观察语句结构，不连接或修改生产数据库。
语言：sql
SELECT u.id, u.name, o.id AS order_id FROM users u LEFT JOIN orders o ON o.user_id = u.id;
[/示例]

[提示 title=LEFT JOIN学习提示]
未匹配的右表列会表现为 NULL。先预测结果，再阅读 SQL，会比机械背语法更容易形成稳定理解。

[警告 title=注意 SQL 方言与数据边界]
不同数据库在函数、分页、日期处理等细节上可能不同。课程以通用关系型 SQL 思想为主，涉及写操作的示例仅用于学习，不应直接对生产数据库执行。

### 课时题目

#### 题目 7

题型：SINGLE_CHOICE
题干：关于“LEFT JOIN”，下列哪项说法正确？
难度：EASY
分值：10
知识点：LEFT JOIN
是否用于 Battle：否

选项：
- A. LEFT JOIN 保留左表全部记录 [正确]
- B. SQL 的所有语句都会自动修改原表数据
- C. 只要语法能够执行，结果就一定符合业务需求
- D. NULL、重复行和排序永远不会影响查询结果

解析：
LEFT JOIN 保留左表全部记录。其余说法把 SQL 的查询、写入或结果语义绝对化了。

#### 题目 8

题型：SINGLE_CHOICE
题干：阅读下面 SQL：`SELECT u.id, u.name, o.id AS order_id FROM users u LEFT JOIN orders o ON o.user_id = u.id;`。结合“LEFT JOIN”的知识，最合理的理解是什么？
难度：MEDIUM
分值：10
知识点：LEFT JOIN、SQL 阅读
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：执行流程

选项：
- A. 该语句体现了“LEFT JOIN 保留左表全部记录” [正确]
- B. 该语句一定会删除数据库中的全部记录
- C. 该语句的结果与表中数据完全无关
- D. 该语句可以忽略字段类型、约束和 NULL 语义

解析：
示例围绕“LEFT JOIN”展开，正确理解是：LEFT JOIN 保留左表全部记录。判断 SQL 时应结合语句类型与数据语义。

#### 题目 9

题型：SINGLE_CHOICE
题干：在真实项目中应用“LEFT JOIN”时，哪一种做法最稳妥？
难度：HARD
分值：10
知识点：LEFT JOIN、边界分析
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：场景判断

选项：
- A. 先明确数据范围与结果语义，并验证“未匹配的右表列会表现为 NULL” [正确]
- B. 不看数据结构，直接复制任意 SQL 到生产环境执行
- C. 为了缩短 SQL，删除所有过滤条件和连接条件
- D. 只要返回了数据，就无需检查重复、NULL 或统计粒度

解析：
可靠 SQL 需要同时考虑业务语义与数据边界。本课特别需要记住：未匹配的右表列会表现为 NULL。

---

## 课时 4：多条件 JOIN

课时简介：学习多条件 JOIN的核心概念、SQL 写法和常见边界。

预计学习时间：20 分钟

### 正文

[标题]
多条件 JOIN的核心思路

[文本]
连接条件可以同时包含多个键，例如租户 ID 与业务 ID，避免不同业务范围中的相同编号被错误连接。

[代码 language=sql]
SELECT a.id, b.status FROM a JOIN b ON a.tenant_id = b.tenant_id AND a.id = b.a_id;
[/代码]

[标题]
从结果语义理解 SQL

[文本]
学习这一部分时，不要只记住关键字。应先说明查询或约束希望解决什么问题，再检查输入数据范围、结果粒度以及 NULL、重复行和排序等边界。对于“多条件 JOIN”，核心判断是：复合连接条件可以约束连接范围。

[示例 title=多条件 JOIN示例]
说明：使用一个最小 SQL 示例观察语句结构，不连接或修改生产数据库。
语言：sql
SELECT a.id, b.status FROM a JOIN b ON a.tenant_id = b.tenant_id AND a.id = b.a_id;
[/示例]

[提示 title=多条件 JOIN学习提示]
缺少必要连接键可能产生错误匹配。先预测结果，再阅读 SQL，会比机械背语法更容易形成稳定理解。

[警告 title=注意 SQL 方言与数据边界]
不同数据库在函数、分页、日期处理等细节上可能不同。课程以通用关系型 SQL 思想为主，涉及写操作的示例仅用于学习，不应直接对生产数据库执行。

### 课时题目

#### 题目 10

题型：SINGLE_CHOICE
题干：关于“多条件 JOIN”，下列哪项说法正确？
难度：EASY
分值：10
知识点：多条件 JOIN
是否用于 Battle：否

选项：
- A. 复合连接条件可以约束连接范围 [正确]
- B. SQL 的所有语句都会自动修改原表数据
- C. 只要语法能够执行，结果就一定符合业务需求
- D. NULL、重复行和排序永远不会影响查询结果

解析：
复合连接条件可以约束连接范围。其余说法把 SQL 的查询、写入或结果语义绝对化了。

#### 题目 11

题型：SINGLE_CHOICE
题干：阅读下面 SQL：`SELECT a.id, b.status FROM a JOIN b ON a.tenant_id = b.tenant_id AND a.id = b.a_id;`。结合“多条件 JOIN”的知识，最合理的理解是什么？
难度：MEDIUM
分值：10
知识点：多条件 JOIN、SQL 阅读
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：执行流程

选项：
- A. 该语句体现了“复合连接条件可以约束连接范围” [正确]
- B. 该语句一定会删除数据库中的全部记录
- C. 该语句的结果与表中数据完全无关
- D. 该语句可以忽略字段类型、约束和 NULL 语义

解析：
示例围绕“多条件 JOIN”展开，正确理解是：复合连接条件可以约束连接范围。判断 SQL 时应结合语句类型与数据语义。

#### 题目 12

题型：CODE_FILL
题干：补全下面 SQL 中的 `____`，使语句能够表达本课“多条件 JOIN”示例的原意。请填写缺失的 SQL 片段。
难度：HARD
分值：10
知识点：多条件 JOIN、SQL 代码填空
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码:
```sql
____ a.id, b.status FROM a JOIN b ON a.tenant_id = b.tenant_id AND a.id = b.a_id;
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
缺失部分是 `SELECT`。补全后语句恢复为本课示例，体现：复合连接条件可以约束连接范围。

标准完整代码:
```sql
SELECT a.id, b.status FROM a JOIN b ON a.tenant_id = b.tenant_id AND a.id = b.a_id;
```

---

## 课时 5：多表 JOIN

课时简介：学习多表 JOIN的核心概念、SQL 写法和常见边界。

预计学习时间：20 分钟

### 正文

[标题]
多表 JOIN的核心思路

[文本]
多表连接应逐步明确每一条关系。别名能减少歧义，尤其多个表都包含 id、name 等列时。

[代码 language=sql]
SELECT o.id, u.name, p.name FROM orders o JOIN users u ON o.user_id=u.id JOIN products p ON o.product_id=p.id;
[/代码]

[标题]
从结果语义理解 SQL

[文本]
学习这一部分时，不要只记住关键字。应先说明查询或约束希望解决什么问题，再检查输入数据范围、结果粒度以及 NULL、重复行和排序等边界。对于“多表 JOIN”，核心判断是：多表 JOIN 应逐条写清关系。

[示例 title=多表 JOIN示例]
说明：使用一个最小 SQL 示例观察语句结构，不连接或修改生产数据库。
语言：sql
SELECT o.id, u.name, p.name FROM orders o JOIN users u ON o.user_id=u.id JOIN products p ON o.product_id=p.id;
[/示例]

[提示 title=多表 JOIN学习提示]
列名冲突时应使用表别名限定。先预测结果，再阅读 SQL，会比机械背语法更容易形成稳定理解。

[警告 title=注意 SQL 方言与数据边界]
不同数据库在函数、分页、日期处理等细节上可能不同。课程以通用关系型 SQL 思想为主，涉及写操作的示例仅用于学习，不应直接对生产数据库执行。

### 课时题目

#### 题目 13

题型：SINGLE_CHOICE
题干：关于“多表 JOIN”，下列哪项说法正确？
难度：EASY
分值：10
知识点：多表 JOIN
是否用于 Battle：否

选项：
- A. 多表 JOIN 应逐条写清关系 [正确]
- B. SQL 的所有语句都会自动修改原表数据
- C. 只要语法能够执行，结果就一定符合业务需求
- D. NULL、重复行和排序永远不会影响查询结果

解析：
多表 JOIN 应逐条写清关系。其余说法把 SQL 的查询、写入或结果语义绝对化了。

#### 题目 14

题型：SINGLE_CHOICE
题干：阅读下面 SQL：`SELECT o.id, u.name, p.name FROM orders o JOIN users u ON o.user_id=u.id JOIN products p ON o.product_id=p.id;`。结合“多表 JOIN”的知识，最合理的理解是什么？
难度：MEDIUM
分值：10
知识点：多表 JOIN、SQL 阅读
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：执行流程

选项：
- A. 该语句体现了“多表 JOIN 应逐条写清关系” [正确]
- B. 该语句一定会删除数据库中的全部记录
- C. 该语句的结果与表中数据完全无关
- D. 该语句可以忽略字段类型、约束和 NULL 语义

解析：
示例围绕“多表 JOIN”展开，正确理解是：多表 JOIN 应逐条写清关系。判断 SQL 时应结合语句类型与数据语义。

#### 题目 15

题型：SINGLE_CHOICE
题干：在真实项目中应用“多表 JOIN”时，哪一种做法最稳妥？
难度：HARD
分值：10
知识点：多表 JOIN、边界分析
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：场景判断

选项：
- A. 先明确数据范围与结果语义，并验证“列名冲突时应使用表别名限定” [正确]
- B. 不看数据结构，直接复制任意 SQL 到生产环境执行
- C. 为了缩短 SQL，删除所有过滤条件和连接条件
- D. 只要返回了数据，就无需检查重复、NULL 或统计粒度

解析：
可靠 SQL 需要同时考虑业务语义与数据边界。本课特别需要记住：列名冲突时应使用表别名限定。

---

## 课时 6：JOIN 重复行与排错

课时简介：学习JOIN 重复行与排错的核心概念、SQL 写法和常见边界。

预计学习时间：20 分钟

### 正文

[标题]
JOIN 重复行与排错的核心思路

[文本]
一对多 JOIN 会自然复制“一”侧信息，这是关系展开的结果，不等于数据库重复。排错时先检查基数和 ON 条件。

[代码 language=sql]
SELECT u.id, COUNT(o.id) FROM users u LEFT JOIN orders o ON o.user_id=u.id GROUP BY u.id;
[/代码]

[标题]
从结果语义理解 SQL

[文本]
学习这一部分时，不要只记住关键字。应先说明查询或约束希望解决什么问题，再检查输入数据范围、结果粒度以及 NULL、重复行和排序等边界。对于“JOIN 重复行与排错”，核心判断是：JOIN 后行数增加可能来自一对多关系。

[示例 title=JOIN 重复行与排错示例]
说明：使用一个最小 SQL 示例观察语句结构，不连接或修改生产数据库。
语言：sql
SELECT u.id, COUNT(o.id) FROM users u LEFT JOIN orders o ON o.user_id=u.id GROUP BY u.id;
[/示例]

[提示 title=JOIN 重复行与排错学习提示]
不要用 DISTINCT 掩盖错误连接条件。先预测结果，再阅读 SQL，会比机械背语法更容易形成稳定理解。

[警告 title=注意 SQL 方言与数据边界]
不同数据库在函数、分页、日期处理等细节上可能不同。课程以通用关系型 SQL 思想为主，涉及写操作的示例仅用于学习，不应直接对生产数据库执行。

### 课时题目

#### 题目 16

题型：SINGLE_CHOICE
题干：关于“JOIN 重复行与排错”，下列哪项说法正确？
难度：EASY
分值：10
知识点：JOIN 重复行与排错
是否用于 Battle：否

选项：
- A. JOIN 后行数增加可能来自一对多关系 [正确]
- B. SQL 的所有语句都会自动修改原表数据
- C. 只要语法能够执行，结果就一定符合业务需求
- D. NULL、重复行和排序永远不会影响查询结果

解析：
JOIN 后行数增加可能来自一对多关系。其余说法把 SQL 的查询、写入或结果语义绝对化了。

#### 题目 17

题型：SINGLE_CHOICE
题干：阅读下面 SQL：`SELECT u.id, COUNT(o.id) FROM users u LEFT JOIN orders o ON o.user_id=u.id GROUP BY u.id;`。结合“JOIN 重复行与排错”的知识，最合理的理解是什么？
难度：MEDIUM
分值：10
知识点：JOIN 重复行与排错、SQL 阅读
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：执行流程

选项：
- A. 该语句体现了“JOIN 后行数增加可能来自一对多关系” [正确]
- B. 该语句一定会删除数据库中的全部记录
- C. 该语句的结果与表中数据完全无关
- D. 该语句可以忽略字段类型、约束和 NULL 语义

解析：
示例围绕“JOIN 重复行与排错”展开，正确理解是：JOIN 后行数增加可能来自一对多关系。判断 SQL 时应结合语句类型与数据语义。

#### 题目 18

题型：CODE_FILL
题干：补全下面 SQL 中的 `____`，使语句能够表达本课“JOIN 重复行与排错”示例的原意。请填写缺失的 SQL 片段。
难度：HARD
分值：10
知识点：JOIN 重复行与排错、SQL 代码填空
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码:
```sql
SELECT u.id, COUNT(o.id) FROM users u ____ orders o ON o.user_id=u.id GROUP BY u.id;
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
缺失部分是 `LEFT JOIN`。补全后语句恢复为本课示例，体现：JOIN 后行数增加可能来自一对多关系。

标准完整代码:
```sql
SELECT u.id, COUNT(o.id) FROM users u LEFT JOIN orders o ON o.user_id=u.id GROUP BY u.id;
```

---
