# 第七章：数据写入与事务

章节简介：学习 INSERT、UPDATE、DELETE 和事务的基本原则，重点建立有条件更新与可回滚操作意识。 学习完成后，能够把本章 SQL 能力应用到清晰、可验证的数据库查询或设计任务中。

预计学习时间：120 分钟

章节学习目标：
- 理解并能够应用“INSERT 新增数据”的核心规则
- 理解并能够应用“批量 INSERT”的核心规则
- 理解并能够应用“UPDATE 安全更新”的核心规则
- 理解并能够应用“DELETE 安全删除”的核心规则
- 理解并能够应用“事务与 COMMIT ROLLBACK”的核心规则
- 理解并能够应用“原子性与一致性”的核心规则

---

## 课时 1：INSERT 新增数据

课时简介：学习INSERT 新增数据的核心概念、SQL 写法和常见边界。

预计学习时间：20 分钟

### 正文

[标题]
INSERT 新增数据的核心思路

[文本]
INSERT 用于新增记录。显式列出目标列能降低表结构变化带来的风险，并让语句意图更清晰。

[代码 language=sql]
INSERT INTO students (id, name, major) VALUES (101, '小林', '计算机');
[/代码]

[标题]
从结果语义理解 SQL

[文本]
学习这一部分时，不要只记住关键字。应先说明查询或约束希望解决什么问题，再检查输入数据范围、结果粒度以及 NULL、重复行和排序等边界。对于“INSERT 新增数据”，核心判断是：INSERT 新增行。

[示例 title=INSERT 新增数据示例]
说明：使用一个最小 SQL 示例观察语句结构，不连接或修改生产数据库。
语言：sql
INSERT INTO students (id, name, major) VALUES (101, '小林', '计算机');
[/示例]

[提示 title=INSERT 新增数据学习提示]
显式列名比依赖整表列顺序更稳健。先预测结果，再阅读 SQL，会比机械背语法更容易形成稳定理解。

[警告 title=注意 SQL 方言与数据边界]
不同数据库在函数、分页、日期处理等细节上可能不同。课程以通用关系型 SQL 思想为主，涉及写操作的示例仅用于学习，不应直接对生产数据库执行。

### 课时题目

#### 题目 1

题型：SINGLE_CHOICE
题干：关于“INSERT 新增数据”，下列哪项说法正确？
难度：EASY
分值：10
知识点：INSERT 新增数据
是否用于 Battle：否

选项：
- A. INSERT 新增行 [正确]
- B. SQL 的所有语句都会自动修改原表数据
- C. 只要语法能够执行，结果就一定符合业务需求
- D. NULL、重复行和排序永远不会影响查询结果

解析：
INSERT 新增行。其余说法把 SQL 的查询、写入或结果语义绝对化了。

#### 题目 2

题型：SINGLE_CHOICE
题干：阅读下面 SQL：`INSERT INTO students (id, name, major) VALUES (101, '小林', '计算机');`。结合“INSERT 新增数据”的知识，最合理的理解是什么？
难度：MEDIUM
分值：10
知识点：INSERT 新增数据、SQL 阅读
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：执行流程

选项：
- A. 该语句体现了“INSERT 新增行” [正确]
- B. 该语句一定会删除数据库中的全部记录
- C. 该语句的结果与表中数据完全无关
- D. 该语句可以忽略字段类型、约束和 NULL 语义

解析：
示例围绕“INSERT 新增数据”展开，正确理解是：INSERT 新增行。判断 SQL 时应结合语句类型与数据语义。

#### 题目 3

题型：SINGLE_CHOICE
题干：在真实项目中应用“INSERT 新增数据”时，哪一种做法最稳妥？
难度：HARD
分值：10
知识点：INSERT 新增数据、边界分析
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：场景判断

选项：
- A. 先明确数据范围与结果语义，并验证“显式列名比依赖整表列顺序更稳健” [正确]
- B. 不看数据结构，直接复制任意 SQL 到生产环境执行
- C. 为了缩短 SQL，删除所有过滤条件和连接条件
- D. 只要返回了数据，就无需检查重复、NULL 或统计粒度

解析：
可靠 SQL 需要同时考虑业务语义与数据边界。本课特别需要记住：显式列名比依赖整表列顺序更稳健。

---

## 课时 2：批量 INSERT

课时简介：学习批量 INSERT的核心概念、SQL 写法和常见边界。

预计学习时间：20 分钟

### 正文

[标题]
批量 INSERT的核心思路

[文本]
一条 INSERT 可以提供多组 VALUES 完成批量新增。批量写入前仍应考虑唯一约束、事务和失败处理。

[代码 language=sql]
INSERT INTO tags (id, name) VALUES (1,'SQL'), (2,'Linux');
[/代码]

[标题]
从结果语义理解 SQL

[文本]
学习这一部分时，不要只记住关键字。应先说明查询或约束希望解决什么问题，再检查输入数据范围、结果粒度以及 NULL、重复行和排序等边界。对于“批量 INSERT”，核心判断是：多组 VALUES 可以一次插入多行。

[示例 title=批量 INSERT示例]
说明：使用一个最小 SQL 示例观察语句结构，不连接或修改生产数据库。
语言：sql
INSERT INTO tags (id, name) VALUES (1,'SQL'), (2,'Linux');
[/示例]

[提示 title=批量 INSERT学习提示]
批量写入仍受约束检查。先预测结果，再阅读 SQL，会比机械背语法更容易形成稳定理解。

[警告 title=注意 SQL 方言与数据边界]
不同数据库在函数、分页、日期处理等细节上可能不同。课程以通用关系型 SQL 思想为主，涉及写操作的示例仅用于学习，不应直接对生产数据库执行。

### 课时题目

#### 题目 4

题型：SINGLE_CHOICE
题干：关于“批量 INSERT”，下列哪项说法正确？
难度：EASY
分值：10
知识点：批量 INSERT
是否用于 Battle：否

选项：
- A. 多组 VALUES 可以一次插入多行 [正确]
- B. SQL 的所有语句都会自动修改原表数据
- C. 只要语法能够执行，结果就一定符合业务需求
- D. NULL、重复行和排序永远不会影响查询结果

解析：
多组 VALUES 可以一次插入多行。其余说法把 SQL 的查询、写入或结果语义绝对化了。

#### 题目 5

题型：SINGLE_CHOICE
题干：阅读下面 SQL：`INSERT INTO tags (id, name) VALUES (1,'SQL'), (2,'Linux');`。结合“批量 INSERT”的知识，最合理的理解是什么？
难度：MEDIUM
分值：10
知识点：批量 INSERT、SQL 阅读
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：执行流程

选项：
- A. 该语句体现了“多组 VALUES 可以一次插入多行” [正确]
- B. 该语句一定会删除数据库中的全部记录
- C. 该语句的结果与表中数据完全无关
- D. 该语句可以忽略字段类型、约束和 NULL 语义

解析：
示例围绕“批量 INSERT”展开，正确理解是：多组 VALUES 可以一次插入多行。判断 SQL 时应结合语句类型与数据语义。

#### 题目 6

题型：CODE_FILL
题干：补全下面 SQL 中的 `____`，使语句能够表达本课“批量 INSERT”示例的原意。请填写缺失的 SQL 片段。
难度：HARD
分值：10
知识点：批量 INSERT、SQL 代码填空
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码:
```sql
____ tags (id, name) VALUES (1,'SQL'), (2,'Linux');
```

可接受答案:
```sql
INSERT INTO
```

判题设置：
- 区分大小写：否
- 忽略首尾空格：是
- 保留代码内部空格：否
- 统一 Windows 和 Unix 换行：是

解析：
缺失部分是 `INSERT INTO`。补全后语句恢复为本课示例，体现：多组 VALUES 可以一次插入多行。

标准完整代码:
```sql
INSERT INTO tags (id, name) VALUES (1,'SQL'), (2,'Linux');
```

---

## 课时 3：UPDATE 安全更新

课时简介：学习UPDATE 安全更新的核心概念、SQL 写法和常见边界。

预计学习时间：20 分钟

### 正文

[标题]
UPDATE 安全更新的核心思路

[文本]
UPDATE 会修改已有行。执行前应先用同样 WHERE 做 SELECT 核对范围；遗漏 WHERE 可能修改整表。

[代码 language=sql]
UPDATE students SET major='软件工程' WHERE id=101;
[/代码]

[标题]
从结果语义理解 SQL

[文本]
学习这一部分时，不要只记住关键字。应先说明查询或约束希望解决什么问题，再检查输入数据范围、结果粒度以及 NULL、重复行和排序等边界。对于“UPDATE 安全更新”，核心判断是：UPDATE 的 WHERE 决定修改范围。

[示例 title=UPDATE 安全更新示例]
说明：使用一个最小 SQL 示例观察语句结构，不连接或修改生产数据库。
语言：sql
UPDATE students SET major='软件工程' WHERE id=101;
[/示例]

[提示 title=UPDATE 安全更新学习提示]
高风险更新前应先核对命中记录。先预测结果，再阅读 SQL，会比机械背语法更容易形成稳定理解。

[警告 title=注意 SQL 方言与数据边界]
不同数据库在函数、分页、日期处理等细节上可能不同。课程以通用关系型 SQL 思想为主，涉及写操作的示例仅用于学习，不应直接对生产数据库执行。

### 课时题目

#### 题目 7

题型：SINGLE_CHOICE
题干：关于“UPDATE 安全更新”，下列哪项说法正确？
难度：EASY
分值：10
知识点：UPDATE 安全更新
是否用于 Battle：否

选项：
- A. UPDATE 的 WHERE 决定修改范围 [正确]
- B. SQL 的所有语句都会自动修改原表数据
- C. 只要语法能够执行，结果就一定符合业务需求
- D. NULL、重复行和排序永远不会影响查询结果

解析：
UPDATE 的 WHERE 决定修改范围。其余说法把 SQL 的查询、写入或结果语义绝对化了。

#### 题目 8

题型：SINGLE_CHOICE
题干：阅读下面 SQL：`UPDATE students SET major='软件工程' WHERE id=101;`。结合“UPDATE 安全更新”的知识，最合理的理解是什么？
难度：MEDIUM
分值：10
知识点：UPDATE 安全更新、SQL 阅读
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：执行流程

选项：
- A. 该语句体现了“UPDATE 的 WHERE 决定修改范围” [正确]
- B. 该语句一定会删除数据库中的全部记录
- C. 该语句的结果与表中数据完全无关
- D. 该语句可以忽略字段类型、约束和 NULL 语义

解析：
示例围绕“UPDATE 安全更新”展开，正确理解是：UPDATE 的 WHERE 决定修改范围。判断 SQL 时应结合语句类型与数据语义。

#### 题目 9

题型：SINGLE_CHOICE
题干：在真实项目中应用“UPDATE 安全更新”时，哪一种做法最稳妥？
难度：HARD
分值：10
知识点：UPDATE 安全更新、边界分析
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：场景判断

选项：
- A. 先明确数据范围与结果语义，并验证“高风险更新前应先核对命中记录” [正确]
- B. 不看数据结构，直接复制任意 SQL 到生产环境执行
- C. 为了缩短 SQL，删除所有过滤条件和连接条件
- D. 只要返回了数据，就无需检查重复、NULL 或统计粒度

解析：
可靠 SQL 需要同时考虑业务语义与数据边界。本课特别需要记住：高风险更新前应先核对命中记录。

---

## 课时 4：DELETE 安全删除

课时简介：学习DELETE 安全删除的核心概念、SQL 写法和常见边界。

预计学习时间：20 分钟

### 正文

[标题]
DELETE 安全删除的核心思路

[文本]
DELETE 删除满足条件的行。生产操作应确认 WHERE、关联约束、备份和事务策略，课程示例不执行真实删除。

[代码 language=sql]
DELETE FROM temp_students WHERE id=101;
[/代码]

[标题]
从结果语义理解 SQL

[文本]
学习这一部分时，不要只记住关键字。应先说明查询或约束希望解决什么问题，再检查输入数据范围、结果粒度以及 NULL、重复行和排序等边界。对于“DELETE 安全删除”，核心判断是：DELETE 的 WHERE 决定删除范围。

[示例 title=DELETE 安全删除示例]
说明：使用一个最小 SQL 示例观察语句结构，不连接或修改生产数据库。
语言：sql
DELETE FROM temp_students WHERE id=101;
[/示例]

[提示 title=DELETE 安全删除学习提示]
删除前应确认关联数据与恢复方案。先预测结果，再阅读 SQL，会比机械背语法更容易形成稳定理解。

[警告 title=注意 SQL 方言与数据边界]
不同数据库在函数、分页、日期处理等细节上可能不同。课程以通用关系型 SQL 思想为主，涉及写操作的示例仅用于学习，不应直接对生产数据库执行。

### 课时题目

#### 题目 10

题型：SINGLE_CHOICE
题干：关于“DELETE 安全删除”，下列哪项说法正确？
难度：EASY
分值：10
知识点：DELETE 安全删除
是否用于 Battle：否

选项：
- A. DELETE 的 WHERE 决定删除范围 [正确]
- B. SQL 的所有语句都会自动修改原表数据
- C. 只要语法能够执行，结果就一定符合业务需求
- D. NULL、重复行和排序永远不会影响查询结果

解析：
DELETE 的 WHERE 决定删除范围。其余说法把 SQL 的查询、写入或结果语义绝对化了。

#### 题目 11

题型：SINGLE_CHOICE
题干：阅读下面 SQL：`DELETE FROM temp_students WHERE id=101;`。结合“DELETE 安全删除”的知识，最合理的理解是什么？
难度：MEDIUM
分值：10
知识点：DELETE 安全删除、SQL 阅读
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：执行流程

选项：
- A. 该语句体现了“DELETE 的 WHERE 决定删除范围” [正确]
- B. 该语句一定会删除数据库中的全部记录
- C. 该语句的结果与表中数据完全无关
- D. 该语句可以忽略字段类型、约束和 NULL 语义

解析：
示例围绕“DELETE 安全删除”展开，正确理解是：DELETE 的 WHERE 决定删除范围。判断 SQL 时应结合语句类型与数据语义。

#### 题目 12

题型：CODE_FILL
题干：补全下面 SQL 中的 `____`，使语句能够表达本课“DELETE 安全删除”示例的原意。请填写缺失的 SQL 片段。
难度：HARD
分值：10
知识点：DELETE 安全删除、SQL 代码填空
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码:
```sql
____ temp_students WHERE id=101;
```

可接受答案:
```sql
DELETE FROM
```

判题设置：
- 区分大小写：否
- 忽略首尾空格：是
- 保留代码内部空格：否
- 统一 Windows 和 Unix 换行：是

解析：
缺失部分是 `DELETE FROM`。补全后语句恢复为本课示例，体现：DELETE 的 WHERE 决定删除范围。

标准完整代码:
```sql
DELETE FROM temp_students WHERE id=101;
```

---

## 课时 5：事务与 COMMIT ROLLBACK

课时简介：学习事务与 COMMIT ROLLBACK的核心概念、SQL 写法和常见边界。

预计学习时间：20 分钟

### 正文

[标题]
事务与 COMMIT ROLLBACK的核心思路

[文本]
事务把一组操作作为整体处理。COMMIT 提交，ROLLBACK 放弃尚未提交的更改；具体隔离行为由数据库决定。

[代码 language=sql]
BEGIN; UPDATE accounts SET balance=balance-100 WHERE id=1; ROLLBACK;
[/代码]

[标题]
从结果语义理解 SQL

[文本]
学习这一部分时，不要只记住关键字。应先说明查询或约束希望解决什么问题，再检查输入数据范围、结果粒度以及 NULL、重复行和排序等边界。对于“事务与 COMMIT ROLLBACK”，核心判断是：ROLLBACK 可撤销当前未提交事务中的更改。

[示例 title=事务与 COMMIT ROLLBACK示例]
说明：使用一个最小 SQL 示例观察语句结构，不连接或修改生产数据库。
语言：sql
BEGIN; UPDATE accounts SET balance=balance-100 WHERE id=1; ROLLBACK;
[/示例]

[提示 title=事务与 COMMIT ROLLBACK学习提示]
事务边界应覆盖需要保持一致的一组操作。先预测结果，再阅读 SQL，会比机械背语法更容易形成稳定理解。

[警告 title=注意 SQL 方言与数据边界]
不同数据库在函数、分页、日期处理等细节上可能不同。课程以通用关系型 SQL 思想为主，涉及写操作的示例仅用于学习，不应直接对生产数据库执行。

### 课时题目

#### 题目 13

题型：SINGLE_CHOICE
题干：关于“事务与 COMMIT ROLLBACK”，下列哪项说法正确？
难度：EASY
分值：10
知识点：事务与 COMMIT ROLLBACK
是否用于 Battle：否

选项：
- A. ROLLBACK 可撤销当前未提交事务中的更改 [正确]
- B. SQL 的所有语句都会自动修改原表数据
- C. 只要语法能够执行，结果就一定符合业务需求
- D. NULL、重复行和排序永远不会影响查询结果

解析：
ROLLBACK 可撤销当前未提交事务中的更改。其余说法把 SQL 的查询、写入或结果语义绝对化了。

#### 题目 14

题型：SINGLE_CHOICE
题干：阅读下面 SQL：`BEGIN; UPDATE accounts SET balance=balance-100 WHERE id=1; ROLLBACK;`。结合“事务与 COMMIT ROLLBACK”的知识，最合理的理解是什么？
难度：MEDIUM
分值：10
知识点：事务与 COMMIT ROLLBACK、SQL 阅读
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：执行流程

选项：
- A. 该语句体现了“ROLLBACK 可撤销当前未提交事务中的更改” [正确]
- B. 该语句一定会删除数据库中的全部记录
- C. 该语句的结果与表中数据完全无关
- D. 该语句可以忽略字段类型、约束和 NULL 语义

解析：
示例围绕“事务与 COMMIT ROLLBACK”展开，正确理解是：ROLLBACK 可撤销当前未提交事务中的更改。判断 SQL 时应结合语句类型与数据语义。

#### 题目 15

题型：SINGLE_CHOICE
题干：在真实项目中应用“事务与 COMMIT ROLLBACK”时，哪一种做法最稳妥？
难度：HARD
分值：10
知识点：事务与 COMMIT ROLLBACK、边界分析
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：场景判断

选项：
- A. 先明确数据范围与结果语义，并验证“事务边界应覆盖需要保持一致的一组操作” [正确]
- B. 不看数据结构，直接复制任意 SQL 到生产环境执行
- C. 为了缩短 SQL，删除所有过滤条件和连接条件
- D. 只要返回了数据，就无需检查重复、NULL 或统计粒度

解析：
可靠 SQL 需要同时考虑业务语义与数据边界。本课特别需要记住：事务边界应覆盖需要保持一致的一组操作。

---

## 课时 6：原子性与一致性

课时简介：学习原子性与一致性的核心概念、SQL 写法和常见边界。

预计学习时间：20 分钟

### 正文

[标题]
原子性与一致性的核心思路

[文本]
转账等业务通常需要多条写入共同成功或共同失败。事务原子性避免只完成一半造成业务状态不一致。

[代码 language=sql]
BEGIN; UPDATE accounts SET balance=balance-100 WHERE id=1; UPDATE accounts SET balance=balance+100 WHERE id=2; COMMIT;
[/代码]

[标题]
从结果语义理解 SQL

[文本]
学习这一部分时，不要只记住关键字。应先说明查询或约束希望解决什么问题，再检查输入数据范围、结果粒度以及 NULL、重复行和排序等边界。对于“原子性与一致性”，核心判断是：原子性要求事务操作整体成功或整体失败。

[示例 title=原子性与一致性示例]
说明：使用一个最小 SQL 示例观察语句结构，不连接或修改生产数据库。
语言：sql
BEGIN; UPDATE accounts SET balance=balance-100 WHERE id=1; UPDATE accounts SET balance=balance+100 WHERE id=2; COMMIT;
[/示例]

[提示 title=原子性与一致性学习提示]
业务一致性还依赖正确约束和应用规则。先预测结果，再阅读 SQL，会比机械背语法更容易形成稳定理解。

[警告 title=注意 SQL 方言与数据边界]
不同数据库在函数、分页、日期处理等细节上可能不同。课程以通用关系型 SQL 思想为主，涉及写操作的示例仅用于学习，不应直接对生产数据库执行。

### 课时题目

#### 题目 16

题型：SINGLE_CHOICE
题干：关于“原子性与一致性”，下列哪项说法正确？
难度：EASY
分值：10
知识点：原子性与一致性
是否用于 Battle：否

选项：
- A. 原子性要求事务操作整体成功或整体失败 [正确]
- B. SQL 的所有语句都会自动修改原表数据
- C. 只要语法能够执行，结果就一定符合业务需求
- D. NULL、重复行和排序永远不会影响查询结果

解析：
原子性要求事务操作整体成功或整体失败。其余说法把 SQL 的查询、写入或结果语义绝对化了。

#### 题目 17

题型：SINGLE_CHOICE
题干：阅读下面 SQL：`BEGIN; UPDATE accounts SET balance=balance-100 WHERE id=1; UPDATE accounts SET balance=balance+100 WHERE id=2; COMMIT;`。结合“原子性与一致性”的知识，最合理的理解是什么？
难度：MEDIUM
分值：10
知识点：原子性与一致性、SQL 阅读
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：执行流程

选项：
- A. 该语句体现了“原子性要求事务操作整体成功或整体失败” [正确]
- B. 该语句一定会删除数据库中的全部记录
- C. 该语句的结果与表中数据完全无关
- D. 该语句可以忽略字段类型、约束和 NULL 语义

解析：
示例围绕“原子性与一致性”展开，正确理解是：原子性要求事务操作整体成功或整体失败。判断 SQL 时应结合语句类型与数据语义。

#### 题目 18

题型：CODE_FILL
题干：补全下面 SQL 中的 `____`，使语句能够表达本课“原子性与一致性”示例的原意。请填写缺失的 SQL 片段。
难度：HARD
分值：10
知识点：原子性与一致性、SQL 代码填空
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码:
```sql
BEGIN; ____ accounts SET balance=balance-100 WHERE id=1; UPDATE accounts SET balance=balance+100 WHERE id=2; COMMIT;
```

可接受答案:
```sql
UPDATE
```

判题设置：
- 区分大小写：否
- 忽略首尾空格：是
- 保留代码内部空格：否
- 统一 Windows 和 Unix 换行：是

解析：
缺失部分是 `UPDATE`。补全后语句恢复为本课示例，体现：原子性要求事务操作整体成功或整体失败。

标准完整代码:
```sql
BEGIN; UPDATE accounts SET balance=balance-100 WHERE id=1; UPDATE accounts SET balance=balance+100 WHERE id=2; COMMIT;
```

---
