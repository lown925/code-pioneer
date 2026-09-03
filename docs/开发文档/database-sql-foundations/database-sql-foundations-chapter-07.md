# 第7章：安全地新增、修改和删除数据

章节简介：从INSERT/UPDATE/DELETE进入约束和事务，建立“写入前验证、数据库守规则”的习惯。
预计学习时间：90 分钟

章节学习目标：
- 理解并能应用INSERT 新增一条完整记录
- 理解并能应用UPDATE 前先把 WHERE 当成安全边界
- 理解并能应用DELETE 删除行而不是“清空字段”
- 理解并能应用主键和 UNIQUE 阻止“身份重复”
- 理解并能应用NOT NULL、CHECK 和外键守住字段与关系
- 理解并能应用用事务包住“必须一起成功”的多步写入

[标题]
本章统一场景

[文本]
继续使用students/enrollments，并假设主键id、score范围0~100、选课外键存在。

---

## 课时 1：INSERT 新增一条完整记录

课时简介：从只读进入写数据，并理解列和值必须一一对应。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
新增学生时要明确“往哪些列写什么值”。显式列名让SQL对表结构变化更安全，也让阅读者知道每个值含义。

[标题]
先建立一个能看见的模型

[文本]
`INSERT INTO students(id,name,age,major,score) VALUES (...)`中列顺序和VALUES顺序一一对应。

[代码 language=sql]
INSERT INTO students (id, name, age, major, score)
VALUES (6, '小赵', 18, '软件工程', 90);
[/代码]

[文本]
执行成功后新增一行id=6。查询`WHERE id=6`应能看到小赵。

[示例 title=最小可验证示例]
说明：围绕本章统一数据，执行一条可以直接验证结果的 SQL。
语言：sql

INSERT INTO students (id, name, age, major, score)
VALUES (6, '小赵', 18, '软件工程', 90);
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数据值换掉，先在纸上预测结果，再执行 SQL 验证。能解释每一行为什么留下或被排除，才算真正理解。

[警告 title=常见错误]
省略列名并依赖表物理顺序，后续新增列或记错顺序时更容易写错值。

[标题]
本课小结

[文本]
能安全写出单行INSERT并验证结果。

### 课时题目

#### 题目 1

题型：SINGLE_CHOICE
题干：INSERT列名列表与VALUES有什么关系？

难度：EASY
分值：10
知识点：INSERT
是否用于 Battle：否

选项：
- A. 位置一一对应 [正确]
- B. 可以完全无关
- C. VALUES自动按类型猜列
- D. 只看字母顺序

解析：
按位置映射。

#### 题目 2

题型：SINGLE_CHOICE
题干：示例新增记录id是多少？

难度：MEDIUM
分值：10
知识点：INSERT
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：结果预测

选项：
- A. 6 [正确]
- B. 5
- C. 90
- D. 18

解析：
VALUES第一项对应id。

#### 题目 3

题型：SINGLE_CHOICE
题干：写入后最可靠的验证方式？

难度：HARD
分值：10
知识点：写入验证
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：结果预测

选项：
- A. 用唯一id SELECT检查新增行 [正确]
- B. 只看客户端显示成功就不查
- C. 重启系统
- D. 删除表

解析：
读回验证。


---

## 课时 2：UPDATE 前先把 WHERE 当成安全边界

课时简介：理解“改一行”和“改整表”只差一个条件。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
UPDATE会修改所有满足WHERE的行。如果漏掉WHERE，可能全表都被改成同一个值。因此安全习惯是先用同样WHERE跑SELECT确认目标行。

[标题]
先建立一个能看见的模型

[文本]
先`SELECT * FROM students WHERE id=2`确认小周，再UPDATE score=89。

[代码 language=sql]
UPDATE students
SET score = 89
WHERE id = 2;
[/代码]

[文本]
只有id=2的小周从85改为89。`WHERE id=2`利用唯一主键把修改范围限制为一行。

[示例 title=最小可验证示例]
说明：围绕本章统一数据，执行一条可以直接验证结果的 SQL。
语言：sql

UPDATE students
SET score = 89
WHERE id = 2;
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数据值换掉，先在纸上预测结果，再执行 SQL 验证。能解释每一行为什么留下或被排除，才算真正理解。

[警告 title=常见错误]
直接执行`UPDATE students SET score=89;`，这会把所有学生都改成89。

[标题]
本课小结

[文本]
能在UPDATE前验证WHERE影响范围。

### 课时题目

#### 题目 4

题型：SINGLE_CHOICE
题干：漏掉UPDATE的WHERE可能导致？

难度：EASY
分值：10
知识点：UPDATE安全
是否用于 Battle：否

选项：
- A. 所有行都被修改 [正确]
- B. 只改第一行
- C. 自动回滚
- D. 语法一定失败

解析：
无WHERE作用全表。

#### 题目 5

题型：SINGLE_CHOICE
题干：更新id=2前推荐先做？

难度：MEDIUM
分值：10
知识点：UPDATE
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：结果预测

选项：
- A. SELECT ... WHERE id=2确认目标 [正确]
- B. DELETE id=2
- C. DROP表
- D. 加DISTINCT

解析：
先读后写。

#### 题目 6

题型：CODE_FILL
题干：补全条件，只更新id=2。

难度：HARD
分值：10
知识点：UPDATE
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码：
```sql
UPDATE students SET score=89
____ id = 2;
```

可接受答案：
```sql
WHERE
```

```sql
where
```

判题设置：
- 区分大小写：否
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
WHERE限制修改范围。

标准完整代码：
```sql
UPDATE students SET score=89
WHERE id = 2;
```


---

## 课时 3：DELETE 删除行而不是“清空字段”

课时简介：分清删除记录与把某列设NULL。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
DELETE删除满足条件的整行；UPDATE ... SET email=NULL只是保留记录并清空一个字段。两种业务语义完全不同。

[标题]
先建立一个能看见的模型

[文本]
删除id=6测试学生后，SELECT id=6应返回0行。

[代码 language=sql]
DELETE FROM students
WHERE id = 6;
[/代码]

[文本]
整条小赵记录被删除，id/name/age/major/score不再存在。

[示例 title=最小可验证示例]
说明：围绕本章统一数据，执行一条可以直接验证结果的 SQL。
语言：sql

DELETE FROM students
WHERE id = 6;
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数据值换掉，先在纸上预测结果，再执行 SQL 验证。能解释每一行为什么留下或被排除，才算真正理解。

[警告 title=常见错误]
把DELETE当成“删除score这个值”。DELETE没有SET列，它处理整行。

[标题]
本课小结

[文本]
能区分DELETE与UPDATE清空字段。

### 课时题目

#### 题目 7

题型：SINGLE_CHOICE
题干：DELETE FROM students WHERE id=6会？

难度：EASY
分值：10
知识点：DELETE
是否用于 Battle：否

选项：
- A. 删除id=6整行 [正确]
- B. 只删除id字段
- C. 把score设0
- D. 删除students列

解析：
DELETE处理行。

#### 题目 8

题型：SINGLE_CHOICE
题干：只想清空email但保留学生应更适合？

难度：MEDIUM
分值：10
知识点：DELETE vs UPDATE
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：结果预测

选项：
- A. UPDATE SET email=NULL [正确]
- B. DELETE该学生
- C. DROP email
- D. TRUNCATE

解析：
更新列值。

#### 题目 9

题型：SINGLE_CHOICE
题干：执行DELETE前安全习惯仍是？

难度：HARD
分值：10
知识点：写入安全
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：结果预测

选项：
- A. 先SELECT相同WHERE确认范围 [正确]
- B. 先关闭数据库
- C. 删除索引
- D. 改成OR 1=1

解析：
确认目标行。


---

## 课时 4：主键和 UNIQUE 阻止“身份重复”

课时简介：让数据库帮助维护你无法靠记忆保证的规则。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
应用代码可以有Bug或并发请求。主键/唯一约束把“不允许重复”放到数据库最后一道防线。

[标题]
先建立一个能看见的模型

[文本]
students.id作为PRIMARY KEY不能重复；如果student_no定义UNIQUE，相同学号的第二条INSERT会失败。

[代码 language=sql]
CREATE TABLE demo_students (
  id INTEGER PRIMARY KEY,
  student_no VARCHAR(20) UNIQUE,
  name VARCHAR(50) NOT NULL
);
[/代码]

[文本]
PRIMARY KEY同时表达唯一身份且不能NULL；UNIQUE表达候选唯一值。不同数据库对NULL+UNIQUE细节可能不同，核心仍是阻止重复非空业务标识。

[示例 title=最小可验证示例]
说明：围绕本章统一数据，执行一条可以直接验证结果的 SQL。
语言：sql

CREATE TABLE demo_students (
  id INTEGER PRIMARY KEY,
  student_no VARCHAR(20) UNIQUE,
  name VARCHAR(50) NOT NULL
);
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数据值换掉，先在纸上预测结果，再执行 SQL 验证。能解释每一行为什么留下或被排除，才算真正理解。

[警告 title=常见错误]
只在前端判断“学号是否已存在”，两个并发请求可能同时通过检查后写入重复。数据库唯一约束必须保留。

[标题]
本课小结

[文本]
能解释主键/唯一约束的保护作用。

### 课时题目

#### 题目 10

题型：SINGLE_CHOICE
题干：PRIMARY KEY最核心约束之一？

难度：EASY
分值：10
知识点：主键
是否用于 Battle：否

选项：
- A. 唯一标识每行且不能NULL [正确]
- B. 允许任意重复
- C. 只控制排序
- D. 只用于显示

解析：
主键身份唯一。

#### 题目 11

题型：SINGLE_CHOICE
题干：两个请求同时插入同一UNIQUE学号时数据库约束能做什么？

难度：MEDIUM
分值：10
知识点：UNIQUE
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：结果预测

选项：
- A. 阻止至少一个违反唯一性的写入 [正确]
- B. 保证两条都成功
- C. 自动合并姓名
- D. 删除表

解析：
唯一约束是最终防线。

#### 题目 12

题型：CODE_FILL
题干：补全唯一约束。

难度：HARD
分值：10
知识点：UNIQUE
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码：
```sql
student_no VARCHAR(20) ____
```

可接受答案：
```sql
UNIQUE
```

```sql
unique
```

判题设置：
- 区分大小写：否
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
UNIQUE限制重复。

标准完整代码：
```sql
student_no VARCHAR(20) UNIQUE
```


---

## 课时 5：NOT NULL、CHECK 和外键守住字段与关系

课时简介：从“值存在”到“值合理、关系存在”。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
NOT NULL要求有值；CHECK可限制score在0~100；FOREIGN KEY确保enrollments.student_id必须指向已有学生。

[标题]
先建立一个能看见的模型

[文本]
这些规则让无效数据在写入边界被拒绝，而不是流入系统后到处加if修补。

[代码 language=sql]
score INTEGER NOT NULL CHECK (score BETWEEN 0 AND 100),
student_id INTEGER REFERENCES students(id)
[/代码]

[文本]
写score=120会违反CHECK；写不存在student_id=999会违反外键（在启用并支持外键的数据库中）。

[示例 title=最小可验证示例]
说明：围绕本章统一数据，执行一条可以直接验证结果的 SQL。
语言：sql

score INTEGER NOT NULL CHECK (score BETWEEN 0 AND 100),
student_id INTEGER REFERENCES students(id)
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数据值换掉，先在纸上预测结果，再执行 SQL 验证。能解释每一行为什么留下或被排除，才算真正理解。

[警告 title=常见错误]
为了“先让数据进去”关闭约束，后续报表会面对负分、幽灵学生等难以修复的数据。

[标题]
本课小结

[文本]
能根据业务规则选择基础约束。

### 课时题目

#### 题目 13

题型：SINGLE_CHOICE
题干：限制score必须0~100更适合？

难度：EASY
分值：10
知识点：CHECK
是否用于 Battle：否

选项：
- A. CHECK [正确]
- B. ORDER BY
- C. DISTINCT
- D. LIMIT

解析：
CHECK验证值条件。

#### 题目 14

题型：SINGLE_CHOICE
题干：保证选课student_id指向已有学生更适合？

难度：MEDIUM
分值：10
知识点：外键
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：结果预测

选项：
- A. FOREIGN KEY [正确]
- B. AVG
- C. LIKE
- D. AS

解析：
外键维护引用完整性。

#### 题目 15

题型：SINGLE_CHOICE
题干：NOT NULL主要阻止什么？

难度：HARD
分值：10
知识点：NOT NULL
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：结果预测

选项：
- A. 该列写入NULL [正确]
- B. 重复值
- C. 排序错误
- D. 慢查询

解析：
不能为空。


---

## 课时 6：用事务包住“必须一起成功”的多步写入

课时简介：第一次理解为什么写数据不能只看单条SQL成功。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
创建订单、扣库存，或创建选课+扣名额，如果第一步成功第二步失败，系统会进入半完成状态。事务让一组操作要么全部提交，要么失败时回滚。

[标题]
先建立一个能看见的模型

[文本]
BEGIN后执行两条更新，检查都成功再COMMIT；任何关键步骤失败则ROLLBACK。

[代码 language=sql]
BEGIN;
UPDATE course_capacity SET remaining = remaining - 1 WHERE course_id=10 AND remaining>0;
INSERT INTO enrollments(student_id,course_id,score) VALUES(3,10,NULL);
COMMIT;
[/代码]

[文本]
概念上这两步属于同一业务动作。真正生产还要检查第一条是否实际更新到1行、处理并发，这将在事务章节继续。

[示例 title=最小可验证示例]
说明：围绕本章统一数据，执行一条可以直接验证结果的 SQL。
语言：sql

BEGIN;
UPDATE course_capacity SET remaining = remaining - 1 WHERE course_id=10 AND remaining>0;
INSERT INTO enrollments(student_id,course_id,score) VALUES(3,10,NULL);
COMMIT;
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数据值换掉，先在纸上预测结果，再执行 SQL 验证。能解释每一行为什么留下或被排除，才算真正理解。

[警告 title=常见错误]
每条SQL自动独立提交，第一步成功后第二步失败，产生“名额少了但学生没选上”。

[标题]
本课小结

[文本]
能说明多步原子性的必要性。

### 课时题目

#### 题目 16

题型：SINGLE_CHOICE
题干：事务最核心目标之一是？

难度：EASY
分值：10
知识点：事务
是否用于 Battle：否

选项：
- A. 让相关多步写入保持整体一致 [正确]
- B. 让SELECT自动更快
- C. 替代索引
- D. 让NULL变0

解析：
保证原子业务动作。

#### 题目 17

题型：SINGLE_CHOICE
题干：中途失败希望撤销已做修改使用？

难度：MEDIUM
分值：10
知识点：ROLLBACK
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：结果预测

选项：
- A. ROLLBACK [正确]
- B. ORDER BY
- C. DISTINCT
- D. HAVING

解析：
回滚事务。

#### 题目 18

题型：CODE_FILL
题干：补全提交关键字。

难度：HARD
分值：10
知识点：COMMIT
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码：
```sql
BEGIN;
-- 多步写入
____;
```

可接受答案：
```sql
COMMIT
```

```sql
commit
```

判题设置：
- 区分大小写：否
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
COMMIT提交事务。

标准完整代码：
```sql
BEGIN;
-- 多步写入
COMMIT;
```


---

## 第7章总结

[标题]
这一章真正学会了什么

[文本]
你已经能执行基础DML，并知道WHERE、约束与事务为什么是数据安全边界。

现在你应该能够：

- 能安全写出单行INSERT并验证结果。
- 能在UPDATE前验证WHERE影响范围。
- 能区分DELETE与UPDATE清空字段。
- 能解释主键/唯一约束的保护作用。
- 能根据业务规则选择基础约束。
- 能说明多步原子性的必要性。

[提示 title=复习方式]
不要只重新看定义。盖住答案，用本章统一场景重新推一遍数据、代码或状态变化；能自己推出结果，才算掌握。

---

## 第7章综合挑战（不计分）

[标题]
安全完成一次补录成绩

[文本]
新增一名学生、建立选课、更新成绩。每一步先写验证SELECT；设计UNIQUE/CHECK/FK；把必须一起成功的两步放入事务，说明失败时应ROLLBACK什么。
