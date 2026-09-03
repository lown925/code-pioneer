# 第9章：让数据库既找得快，也在并发下保持一致

章节简介：建立索引、EXPLAIN、事务和并发的第一层工程直觉。
预计学习时间：90 分钟

章节学习目标：
- 理解并能应用索引像“按某种顺序准备好的查找入口”
- 理解并能应用复合索引的列顺序会影响可用方式
- 理解并能应用EXPLAIN 先看数据库准备怎么执行
- 理解并能应用COMMIT 和 ROLLBACK 决定事务最终结果
- 理解并能应用并发事务为什么会“互相看见不同世界”
- 理解并能应用把正确性和性能一起验证

[标题]
本章统一场景

[文本]
假设students已经增长到数百万行，并出现多个用户同时抢课程名额的场景。

---

## 课时 1：索引像“按某种顺序准备好的查找入口”

课时简介：理解为什么100万行不能每次都从头扫。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
没有可用索引时，数据库可能需要检查大量行找到student_no=S001。索引维护键到行位置的结构，使很多等值/范围查询能更快定位。

[标题]
先建立一个能看见的模型

[文本]
给student_no建立索引后，数据库可通过索引树等结构缩小候选行，而不是概念上扫描全部学生。

[代码 language=sql]
CREATE INDEX idx_students_student_no
ON students(student_no);
[/代码]

[文本]
索引会占空间，INSERT/UPDATE/DELETE还需要维护它，所以不是“越多越好”。要为真实查询模式服务。

[示例 title=最小可验证示例]
说明：围绕本章统一数据，执行一条可以直接验证结果的 SQL。
语言：sql

CREATE INDEX idx_students_student_no
ON students(student_no);
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数据值换掉，先在纸上预测结果，再执行 SQL 验证。能解释每一行为什么留下或被排除，才算真正理解。

[警告 title=常见错误]
给每个列都建索引，忽略写入成本和低选择性；或把索引当成保证查询一定走它的命令。优化器会根据代价选择计划。

[标题]
本课小结

[文本]
能解释索引的读写权衡。

### 课时题目

#### 题目 1

题型：SINGLE_CHOICE
题干：索引主要帮助哪类问题？

难度：EASY
分值：10
知识点：索引
是否用于 Battle：否

选项：
- A. 减少某些查询需要检查的数据范围 [正确]
- B. 让所有INSERT更快
- C. 替代备份
- D. 保证没有NULL

解析：
加速定位。

#### 题目 2

题型：SINGLE_CHOICE
题干：索引为什么不是越多越好？

难度：MEDIUM
分值：10
知识点：索引权衡
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：结果预测

选项：
- A. 占空间且写入要维护 [正确]
- B. 数据库限制只能1个
- C. 索引会删除数据
- D. 只支持字符串

解析：
有维护成本。

#### 题目 3

题型：SINGLE_CHOICE
题干：student_no经常等值查询且唯一，建索引是否合理？

难度：HARD
分值：10
知识点：索引设计
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：结果预测

选项：
- A. 通常合理 [正确]
- B. 永远不合理
- C. 只能给score建
- D. 索引不能用于等值

解析：
高选择性查找适合。


---

## 课时 2：复合索引的列顺序会影响可用方式

课时简介：从单列进入“查询最常按什么前缀过滤”。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
索引`(major, score)`通常更适合先按major，再在专业内按score范围查。只按score查时能否有效使用取决于数据库和计划，不能把复合索引当两个独立索引。

[标题]
先建立一个能看见的模型

[文本]
查询`WHERE major='大数据' AND score>=90`与(major,score)前缀吻合。

[代码 language=sql]
CREATE INDEX idx_students_major_score
ON students(major, score);
[/代码]

[文本]
索引先按major组织，再在同major中按score。把高频查询条件顺序与索引设计联系起来。

[示例 title=最小可验证示例]
说明：围绕本章统一数据，执行一条可以直接验证结果的 SQL。
语言：sql

CREATE INDEX idx_students_major_score
ON students(major, score);
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数据值换掉，先在纸上预测结果，再执行 SQL 验证。能解释每一行为什么留下或被排除，才算真正理解。

[警告 title=常见错误]
看到WHERE里有两个列就随便建(a,b)，却不分析实际查询是只按b还是总先按a。

[标题]
本课小结

[文本]
能解释复合索引前缀直觉。

### 课时题目

#### 题目 4

题型：SINGLE_CHOICE
题干：索引(major,score)最直观匹配？

难度：EASY
分值：10
知识点：复合索引
是否用于 Battle：否

选项：
- A. WHERE major='大数据' AND score>=90 [正确]
- B. 只WHERE name LIKE任何值
- C. 只SELECT *无条件
- D. DELETE表

解析：
先major后score。

#### 题目 5

题型：SINGLE_CHOICE
题干：复合索引是否简单等于两个独立单列索引？

难度：MEDIUM
分值：10
知识点：复合索引
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：结果预测

选项：
- A. 不是 [正确]
- B. 是完全等价
- C. 只在NULL时等价
- D. SQL无复合索引

解析：
结构顺序有意义。

#### 题目 6

题型：CODE_FILL
题干：补全第二个索引列。

难度：HARD
分值：10
知识点：复合索引
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码：
```sql
CREATE INDEX idx_ms ON students(major, ____);
```

可接受答案：
```sql
score
```

判题设置：
- 区分大小写：否
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
复合键按major,score。

标准完整代码：
```sql
CREATE INDEX idx_ms ON students(major, score);
```


---

## 课时 3：EXPLAIN 先看数据库准备怎么执行

课时简介：避免只凭感觉判断“这条SQL很慢”。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
数据库优化器会选择扫描、索引、JOIN顺序等执行计划。EXPLAIN让你看到计划线索，再结合真实数据量和耗时判断。

[标题]
先建立一个能看见的模型

[文本]
同一WHERE在5行教学表和500万行生产表上的最佳策略可能不同。执行计划是诊断证据，不是装饰。

[代码 language=sql]
EXPLAIN
SELECT * FROM students
WHERE student_no = 'S001';
[/代码]

[文本]
如果存在合适索引，计划可能显示索引查找；没有时可能显示全表扫描。不同数据库EXPLAIN输出字段不同，本课重点是“先看计划再优化”。

[示例 title=最小可验证示例]
说明：围绕本章统一数据，执行一条可以直接验证结果的 SQL。
语言：sql

EXPLAIN
SELECT * FROM students
WHERE student_no = 'S001';
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数据值换掉，先在纸上预测结果，再执行 SQL 验证。能解释每一行为什么留下或被排除，才算真正理解。

[警告 title=常见错误]
看到“全表扫描”四个字就一定判错。小表全扫可能比走索引更便宜，优化要结合规模。

[标题]
本课小结

[文本]
能用EXPLAIN作为性能分析起点。

### 课时题目

#### 题目 7

题型：SINGLE_CHOICE
题干：EXPLAIN主要用来观察？

难度：EASY
分值：10
知识点：EXPLAIN
是否用于 Battle：否

选项：
- A. 查询执行计划 [正确]
- B. 永久修改数据
- C. 创建事务
- D. 导出文件

解析：
计划诊断。

#### 题目 8

题型：SINGLE_CHOICE
题干：小表出现全表扫描一定是性能Bug吗？

难度：MEDIUM
分值：10
知识点：执行计划
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：结果预测

选项：
- A. 不一定，可能是最便宜计划 [正确]
- B. 一定
- C. SQL禁止扫描
- D. 只在JOIN允许

解析：
成本与规模有关。

#### 题目 9

题型：SINGLE_CHOICE
题干：优化慢SQL前更可靠的证据包括？

难度：HARD
分值：10
知识点：性能分析
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：结果预测

选项：
- A. 实际耗时、数据量、执行计划 [正确]
- B. 只看SQL长度
- C. 只看关键字数量
- D. 猜测数据库版本

解析：
基于证据。


---

## 课时 4：COMMIT 和 ROLLBACK 决定事务最终结果

课时简介：把事务从概念变成可观察状态。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
BEGIN后的修改属于当前事务。COMMIT把它作为完成结果提交；ROLLBACK撤销本事务未提交修改。

[标题]
先建立一个能看见的模型

[文本]
修改小周score=89后在同事务内自己能看到89；ROLLBACK后再查回到原值（假设无其他事务修改）。

[代码 language=sql]
BEGIN;
UPDATE students SET score=89 WHERE id=2;
ROLLBACK;
[/代码]

[文本]
这段最终不会把89作为已提交结果保留下来。若把ROLLBACK换COMMIT，修改才提交。

[示例 title=最小可验证示例]
说明：围绕本章统一数据，执行一条可以直接验证结果的 SQL。
语言：sql

BEGIN;
UPDATE students SET score=89 WHERE id=2;
ROLLBACK;
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数据值换掉，先在纸上预测结果，再执行 SQL 验证。能解释每一行为什么留下或被排除，才算真正理解。

[警告 title=常见错误]
把ROLLBACK当“恢复任何历史版本”。它只撤销当前事务尚未提交的工作，不是备份系统。

[标题]
本课小结

[文本]
能预测提交与回滚后的值。

### 课时题目

#### 题目 10

题型：SINGLE_CHOICE
题干：示例ROLLBACK后id=2的89会？

难度：EASY
分值：10
知识点：ROLLBACK
是否用于 Battle：否

选项：
- A. 被撤销 [正确]
- B. 永久提交
- C. 变NULL
- D. 复制两份

解析：
回滚未提交修改。

#### 题目 11

题型：SINGLE_CHOICE
题干：要确认事务成功完成使用？

难度：MEDIUM
分值：10
知识点：COMMIT
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：结果预测

选项：
- A. COMMIT [正确]
- B. HAVING
- C. EXPLAIN
- D. AS

解析：
提交。

#### 题目 12

题型：CODE_FILL
题干：补全撤销关键字。

难度：HARD
分值：10
知识点：ROLLBACK
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码：
```sql
BEGIN;
UPDATE students SET score=89 WHERE id=2;
____;
```

可接受答案：
```sql
ROLLBACK
```

```sql
rollback
```

判题设置：
- 区分大小写：否
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
ROLLBACK撤销。

标准完整代码：
```sql
BEGIN;
UPDATE students SET score=89 WHERE id=2;
ROLLBACK;
```


---

## 课时 5：并发事务为什么会“互相看见不同世界”

课时简介：第一次理解隔离问题来自同时读写。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
两个请求可能同时读同一余额/名额，再各自更新。如果逻辑是“先读10，再减1写9”，两个事务都读10，最终可能只减掉一次却完成两次操作，这叫丢失更新的一类风险。

[标题]
先建立一个能看见的模型

[文本]
事务A读remaining=1，事务B也读1；二者都认为可选课。若没有正确原子更新/锁/约束，两人都可能成功，名额规则被破坏。

[代码 language=sql]
-- 更安全的思路
UPDATE course_capacity
SET remaining = remaining - 1
WHERE course_id=10 AND remaining > 0;
[/代码]

[文本]
把“检查remaining>0”和“减1”放进同一条条件更新，可减少读-改-写竞态；应用还必须检查受影响行数是否为1，并把相关写入放在事务。

[示例 title=最小可验证示例]
说明：围绕本章统一数据，执行一条可以直接验证结果的 SQL。
语言：sql

-- 更安全的思路
UPDATE course_capacity
SET remaining = remaining - 1
WHERE course_id=10 AND remaining > 0;
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数据值换掉，先在纸上预测结果，再执行 SQL 验证。能解释每一行为什么留下或被排除，才算真正理解。

[警告 title=常见错误]
先SELECT remaining，在应用里判断，再过很久UPDATE，却认为事务天然解决所有竞态。隔离级别和锁定策略仍需设计。

[标题]
本课小结

[文本]
能用时间线解释一个并发竞态。

### 课时题目

#### 题目 13

题型：SINGLE_CHOICE
题干：两事务同时先读remaining=1的风险？

难度：EASY
分值：10
知识点：并发事务
是否用于 Battle：否

选项：
- A. 都以为有名额并产生竞态 [正确]
- B. 数据库自动变2
- C. SELECT会删除行
- D. 事务不能并发

解析：
读改写竞争。

#### 题目 14

题型：SINGLE_CHOICE
题干：条件UPDATE后还应检查什么？

难度：MEDIUM
分值：10
知识点：并发控制
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：结果预测

选项：
- A. 实际影响行数是否为1 [正确]
- B. SQL长度
- C. 列名首字母
- D. 是否用了DISTINCT

解析：
判断是否抢到名额。

#### 题目 15

题型：SINGLE_CHOICE
题干：事务是否自动消除所有并发逻辑错误？

难度：HARD
分值：10
知识点：隔离
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：结果预测

选项：
- A. 不会，还要正确隔离/锁/原子操作 [正确]
- B. 会绝对消除
- C. 只要BEGIN即可
- D. 只有SELECT会

解析：
并发策略仍重要。


---

## 课时 6：把正确性和性能一起验证

课时简介：建立“先正确、再测量、再优化”的数据库习惯。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
索引和事务分别关注性能与一致性，但都不能靠背规则。先写正确查询和约束，再用测试数据验证结果；性能问题用EXPLAIN和测量；并发问题用并发场景验证。

[标题]
先建立一个能看见的模型

[文本]
一个按student_no查学生并更新资料的接口：UNIQUE保证身份；索引加速查询；UPDATE用主键/唯一键限定；事务包住多步关系写入。

[代码 language=sql]
BEGIN;
UPDATE students SET name='小林新' WHERE student_no='S001';
INSERT INTO audit_log(entity_id, action) VALUES ('S001','rename');
COMMIT;
[/代码]

[文本]
如果第二步失败而改名和审计必须一致，事务应回滚两步。student_no索引帮助定位，但不改变事务语义。

[示例 title=最小可验证示例]
说明：围绕本章统一数据，执行一条可以直接验证结果的 SQL。
语言：sql

BEGIN;
UPDATE students SET name='小林新' WHERE student_no='S001';
INSERT INTO audit_log(entity_id, action) VALUES ('S001','rename');
COMMIT;
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数据值换掉，先在纸上预测结果，再执行 SQL 验证。能解释每一行为什么留下或被排除，才算真正理解。

[警告 title=常见错误]
为了速度删除约束/事务，或为了“安全”给所有查询加锁。正确性和性能都应由具体需求与测量决定。

[标题]
本课小结

[文本]
能把索引、约束、事务放进一个实际接口思考。

### 课时题目

#### 题目 16

题型：SINGLE_CHOICE
题干：索引与事务解决的是完全同一问题吗？

难度：EASY
分值：10
知识点：综合
是否用于 Battle：否

选项：
- A. 不是，索引偏查找性能，事务偏一致性 [正确]
- B. 是
- C. 都只用于排序
- D. 都只用于建表

解析：
职责不同。

#### 题目 17

题型：SINGLE_CHOICE
题干：第二步审计失败且两步必须一致时应？

难度：MEDIUM
分值：10
知识点：事务
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：结果预测

选项：
- A. ROLLBACK整个事务 [正确]
- B. 只忽略审计
- C. 自动DROP索引
- D. 改SELECT

解析：
原子业务。

#### 题目 18

题型：CODE_FILL
题干：补全查询计划关键字。

难度：HARD
分值：10
知识点：性能分析
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码：
```sql
____ SELECT * FROM students WHERE student_no='S001';
```

可接受答案：
```sql
EXPLAIN
```

```sql
explain
```

判题设置：
- 区分大小写：否
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
EXPLAIN查看计划。

标准完整代码：
```sql
EXPLAIN SELECT * FROM students WHERE student_no='S001';
```


---

## 第9章总结

[标题]
这一章真正学会了什么

[文本]
你已经知道索引为何能加速、为什么要看执行计划，以及事务/并发控制如何保护多步业务。

现在你应该能够：

- 能解释索引的读写权衡。
- 能解释复合索引前缀直觉。
- 能用EXPLAIN作为性能分析起点。
- 能预测提交与回滚后的值。
- 能用时间线解释一个并发竞态。
- 能把索引、约束、事务放进一个实际接口思考。

[提示 title=复习方式]
不要只重新看定义。盖住答案，用本章统一场景重新推一遍数据、代码或状态变化；能自己推出结果，才算掌握。

---

## 第9章综合挑战（不计分）

[标题]
设计一个“抢最后一个名额”的安全流程

[文本]
给出remaining=1、两个请求同时到达的时间线。设计条件UPDATE、受影响行数判断、enrollment插入和事务边界；再说明course_id/学生ID哪些查询可能需要索引。
