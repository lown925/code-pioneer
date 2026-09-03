# 第8章：从业务对象设计出不会轻易乱掉的表结构

章节简介：学习CREATE TABLE、主键、外键、一对多/多对多和规范化直觉。
预计学习时间：90 分钟

章节学习目标：
- 理解并能应用CREATE TABLE 把数据结构写成规则
- 理解并能应用主键回答“这一行到底是谁”
- 理解并能应用外键把“ID”变成有意义的关系
- 理解并能应用一对多与多对多决定表怎么拆
- 理解并能应用重复数据为什么会产生更新异常
- 理解并能应用用“一个事实只放在最合适的位置”检查模型

[标题]
本章统一场景

[文本]
把学生-课程-选课系统从一张重复大表拆成students/courses/enrollments。

---

## 课时 1：CREATE TABLE 把数据结构写成规则

课时简介：从“有一张表”进入“为什么表长这样”。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
建表不是随便起五个列名，而是在声明每个字段的含义、类型和约束。结构决定后续哪些错误能被数据库提前拒绝。

[标题]
先建立一个能看见的模型

[文本]
定义students时用整数id、字符串name/major、整数score，并加主键/NOT NULL/CHECK。

[代码 language=sql]
CREATE TABLE students (
  id INTEGER PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  major VARCHAR(50) NOT NULL,
  score INTEGER CHECK (score BETWEEN 0 AND 100)
);
[/代码]

[文本]
这张表允许score暂时NULL（因为没NOT NULL），但只要非NULL就必须在0~100。name/major必须有值。

[示例 title=最小可验证示例]
说明：围绕本章统一数据，执行一条可以直接验证结果的 SQL。
语言：sql

CREATE TABLE students (
  id INTEGER PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  major VARCHAR(50) NOT NULL,
  score INTEGER CHECK (score BETWEEN 0 AND 100)
);
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数据值换掉，先在纸上预测结果，再执行 SQL 验证。能解释每一行为什么留下或被排除，才算真正理解。

[警告 title=常见错误]
把所有列都定义成VARCHAR“省事”。这会失去数值范围、日期运算和类型检查等数据库能力。

[标题]
本课小结

[文本]
能根据数据语义选择基础类型与约束。

### 课时题目

#### 题目 1

题型：SINGLE_CHOICE
题干：score更适合整数还是把所有值都存VARCHAR？

难度：EASY
分值：10
知识点：建表
是否用于 Battle：否

选项：
- A. 整数类型更符合数值语义 [正确]
- B. VARCHAR永远更好
- C. BLOB
- D. 表名类型

解析：
类型应匹配语义。

#### 题目 2

题型：SINGLE_CHOICE
题干：示例score能否为NULL？

难度：MEDIUM
分值：10
知识点：约束组合
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：结果预测

选项：
- A. 可以，因为只有CHECK没有NOT NULL [正确]
- B. 绝不可以
- C. 只在id=1可以
- D. SQL没有NULL

解析：
缺少NOT NULL。

#### 题目 3

题型：SINGLE_CHOICE
题干：name为什么加NOT NULL？

难度：HARD
分值：10
知识点：NOT NULL
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：结果预测

选项：
- A. 业务要求每名学生必须有姓名值 [正确]
- B. 为了自动排序
- C. 为了唯一
- D. 为了索引必定更快

解析：
必填字段。


---

## 课时 2：主键回答“这一行到底是谁”

课时简介：理解自然键和代理ID的基本取舍。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
姓名会重复、专业会变化，都不适合作为稳定身份。主键需要唯一且稳定。常见做法是独立id作为代理主键，学号另加UNIQUE。

[标题]
先建立一个能看见的模型

[文本]
`id`用于表间引用；`student_no`承载业务学号且唯一；name只是属性。

[代码 language=sql]
CREATE TABLE students (
 id BIGINT PRIMARY KEY,
 student_no VARCHAR(20) UNIQUE NOT NULL,
 name VARCHAR(50) NOT NULL
);
[/代码]

[文本]
即使学生改名，其他表仍通过不变的id关联，不需要同步修改所有外键。

[示例 title=最小可验证示例]
说明：围绕本章统一数据，执行一条可以直接验证结果的 SQL。
语言：sql

CREATE TABLE students (
 id BIGINT PRIMARY KEY,
 student_no VARCHAR(20) UNIQUE NOT NULL,
 name VARCHAR(50) NOT NULL
);
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数据值换掉，先在纸上预测结果，再执行 SQL 验证。能解释每一行为什么留下或被排除，才算真正理解。

[警告 title=常见错误]
用name做主键：同名无法插入，改名会牵动关系，语义不稳定。

[标题]
本课小结

[文本]
能为实体选择稳定身份键。

### 课时题目

#### 题目 4

题型：SINGLE_CHOICE
题干：姓名为什么通常不适合作主键？

难度：EASY
分值：10
知识点：主键设计
是否用于 Battle：否

选项：
- A. 可能重复且可能变化 [正确]
- B. 字符不能做主键
- C. 姓名一定NULL
- D. 数据库不支持中文

解析：
身份键应稳定唯一。

#### 题目 5

题型：SINGLE_CHOICE
题干：student_no若业务保证唯一可加？

难度：MEDIUM
分值：10
知识点：候选键
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：结果预测

选项：
- A. UNIQUE [正确]
- B. AVG
- C. LIMIT
- D. HAVING

解析：
唯一业务键。

#### 题目 6

题型：CODE_FILL
题干：补全主键约束。

难度：HARD
分值：10
知识点：主键
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码：
```sql
id BIGINT ____
```

可接受答案：
```sql
PRIMARY KEY
```

```sql
primary key
```

判题设置：
- 区分大小写：否
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
PRIMARY KEY定义主键。

标准完整代码：
```sql
id BIGINT PRIMARY KEY
```


---

## 课时 3：外键把“ID”变成有意义的关系

课时简介：没有外键的student_id只是一个数字。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
enrollments.student_id=1只有在它被定义为引用students.id时，数据库才能知道这个数字代表学生，并阻止引用不存在的学生。

[标题]
先建立一个能看见的模型

[文本]
外键建立父子关系：学生是父记录，选课是子记录。删除父记录时要考虑已有子记录怎么办。

[代码 language=sql]
CREATE TABLE enrollments (
 student_id BIGINT REFERENCES students(id),
 course_id BIGINT REFERENCES courses(id),
 score INTEGER
);
[/代码]

[文本]
插入student_id=999但students没有999时会违反外键。外键不仅为了JOIN，更重要的是维护关系完整性。

[示例 title=最小可验证示例]
说明：围绕本章统一数据，执行一条可以直接验证结果的 SQL。
语言：sql

CREATE TABLE enrollments (
 student_id BIGINT REFERENCES students(id),
 course_id BIGINT REFERENCES courses(id),
 score INTEGER
);
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数据值换掉，先在纸上预测结果，再执行 SQL 验证。能解释每一行为什么留下或被排除，才算真正理解。

[警告 title=常见错误]
为了“方便删除”把外键全部去掉，结果可能留下指向不存在学生/课程的孤儿记录。

[标题]
本课小结

[文本]
能解释外键的完整性作用。

### 课时题目

#### 题目 7

题型：SINGLE_CHOICE
题干：外键最主要保证什么？

难度：EASY
分值：10
知识点：外键
是否用于 Battle：否

选项：
- A. 引用的父记录存在 [正确]
- B. 列一定唯一
- C. 查询一定最快
- D. 自动备份

解析：
引用完整性。

#### 题目 8

题型：SINGLE_CHOICE
题干：enrollments.student_id引用？

难度：MEDIUM
分值：10
知识点：外键
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：结果预测

选项：
- A. students.id [正确]
- B. students.score
- C. courses.title
- D. 自己score

解析：
学生主键。

#### 题目 9

题型：SINGLE_CHOICE
题干：没有外键时student_id=999可能造成？

难度：HARD
分值：10
知识点：引用完整性
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：结果预测

选项：
- A. 孤儿选课记录 [正确]
- B. 自动创建学生999
- C. 自动变NULL一定
- D. SQL拒绝任何整数

解析：
应用语义失真。


---

## 课时 4：一对多与多对多决定表怎么拆

课时简介：把业务关系翻译成表结构。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
一个专业有多个学生是一对多；一个学生能选多门课程，同时一门课程有多名学生，是多对多。关系类型决定外键放哪里、是否需要中间表。

[标题]
先建立一个能看见的模型

[文本]
多对多使用enrollments中间表，每行表示一个student-course关系，还可附带score、created_at等关系属性。

[代码 language=sql]
students 1 ----< enrollments >---- 1 courses

student_id | course_id | score
1          | 10        | 92
1          | 20        | 88
[/代码]

[文本]
两条enrollments表示同一个学生与两门课程的关系。若只在students放一个course_id，就无法自然表示多门课程。

[示例 title=最小可验证示例]
说明：围绕本章统一数据，执行一条可以直接验证结果的 SQL。
语言：sql

students 1 ----< enrollments >---- 1 courses

student_id | course_id | score
1          | 10        | 92
1          | 20        | 88
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数据值换掉，先在纸上预测结果，再执行 SQL 验证。能解释每一行为什么留下或被排除，才算真正理解。

[警告 title=常见错误]
在students里创建course1_id、course2_id、course3_id列。课程数量不固定时这种结构很快失控。

[标题]
本课小结

[文本]
能为多对多关系设计中间表。

### 课时题目

#### 题目 10

题型：SINGLE_CHOICE
题干：学生与课程通常是什么关系？

难度：EASY
分值：10
知识点：多对多
是否用于 Battle：否

选项：
- A. 多对多 [正确]
- B. 一对一固定
- C. 无关系
- D. 每学生只能一门

解析：
两边都可多个。

#### 题目 11

题型：SINGLE_CHOICE
题干：多对多最常见建模方式？

难度：MEDIUM
分值：10
知识点：关系表
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：结果预测

选项：
- A. 中间关系表 [正确]
- B. 在学生表无限加courseN列
- C. 把所有ID放一个逗号字符串
- D. 复制整张课程表

解析：
关系表可扩展。

#### 题目 12

题型：CODE_FILL
题干：补全关系表中指向学生的列名。

难度：HARD
分值：10
知识点：多对多
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码：
```sql
enrollments(____, course_id, score)
```

可接受答案：
```sql
student_id
```

判题设置：
- 区分大小写：否
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
student_id引用学生。

标准完整代码：
```sql
enrollments(student_id, course_id, score)
```


---

## 课时 5：重复数据为什么会产生更新异常

课时简介：从“能存”进一步到“改一次就一致”。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
如果选课表每行都重复course_title，同一课程有1000条选课就复制1000次标题。改名若漏改一行，数据库同时存在两个课程名。

[标题]
先建立一个能看见的模型

[文本]
把课程名称放courses一处，enrollments只存course_id，把“课程名”事实归到课程实体。

[代码 language=sql]
-- 坏结构
student_id | course_id | course_title
1          | 10        | 数据库基础
2          | 10        | 数据库基础
3          | 10        | 数据库基础
[/代码]

[文本]
课程10改名时坏结构要改3行（真实可能上千）；分表后只改courses.id=10那一行。JOIN时仍能显示最新标题。

[示例 title=最小可验证示例]
说明：围绕本章统一数据，执行一条可以直接验证结果的 SQL。
语言：sql

-- 坏结构
student_id | course_id | course_title
1          | 10        | 数据库基础
2          | 10        | 数据库基础
3          | 10        | 数据库基础
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数据值换掉，先在纸上预测结果，再执行 SQL 验证。能解释每一行为什么留下或被排除，才算真正理解。

[警告 title=常见错误]
把“为了少写JOIN”当作无限复制数据的理由。适度反规范化有场景，但初学设计先确保事实来源清楚。

[标题]
本课小结

[文本]
能识别典型更新异常。

### 课时题目

#### 题目 13

题型：SINGLE_CHOICE
题干：重复保存course_title最直接风险？

难度：EASY
分值：10
知识点：规范化
是否用于 Battle：否

选项：
- A. 课程改名时多处副本不一致 [正确]
- B. SELECT不能运行
- C. id不能是整数
- D. JOIN被禁止

解析：
更新异常。

#### 题目 14

题型：SINGLE_CHOICE
题干：课程标题这个事实更自然属于？

难度：MEDIUM
分值：10
知识点：实体归属
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：结果预测

选项：
- A. courses表 [正确]
- B. 每条enrollments
- C. students表
- D. 事务日志

解析：
课程实体属性。

#### 题目 15

题型：SINGLE_CHOICE
题干：分表后查看标题怎么办？

难度：HARD
分值：10
知识点：规范化
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：结果预测

选项：
- A. 按course_id JOIN courses [正确]
- B. 复制标题回每行
- C. 删除course_id
- D. 只靠缓存永不更新

解析：
查询时关联。


---

## 课时 6：用“一个事实只放在最合适的位置”检查模型

课时简介：把主键、外键、关系表和重复数据收束成建模方法。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
面对一张宽表，逐列问：这列描述的是学生、课程，还是“学生选某课程”这段关系？把不同实体事实拆到对应表，再用ID关联。

[标题]
先建立一个能看见的模型

[文本]
name/major属于students；title属于courses；score属于选课关系enrollments，因为同一学生不同课程的score不同。

[代码 language=sql]
students(id,name,major)
courses(id,title)
enrollments(student_id,course_id,score)
[/代码]

[文本]
如果把score放students，就只能保存一个总分，无法表示“数据库92、网络88”。score依赖student+course组合，因此放关系表。

[示例 title=最小可验证示例]
说明：围绕本章统一数据，执行一条可以直接验证结果的 SQL。
语言：sql

students(id,name,major)
courses(id,title)
enrollments(student_id,course_id,score)
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数据值换掉，先在纸上预测结果，再执行 SQL 验证。能解释每一行为什么留下或被排除，才算真正理解。

[警告 title=常见错误]
机械追求“表越多越规范”而不看业务依赖。建模目标是让事实归属稳定、约束清晰、查询可理解。

[标题]
本课小结

[文本]
能按事实归属拆分简单业务模型。

### 课时题目

#### 题目 16

题型：SINGLE_CHOICE
题干：单门课程成绩score更适合放？

难度：EASY
分值：10
知识点：数据建模
是否用于 Battle：否

选项：
- A. enrollments关系表 [正确]
- B. students只存一个score
- C. courses全局score
- D. 数据库名

解析：
成绩依赖学生和课程。

#### 题目 17

题型：SINGLE_CHOICE
题干：课程title更适合放？

难度：MEDIUM
分值：10
知识点：实体
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：结果预测

选项：
- A. courses [正确]
- B. 每条enrollments重复
- C. students
- D. 索引元数据

解析：
课程实体属性。

#### 题目 18

题型：CODE_FILL
题干：补全三表模型中的关系表。

难度：HARD
分值：10
知识点：关系建模
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码：
```sql
students(id,name)
courses(id,title)
____(student_id,course_id,score)
```

可接受答案：
```sql
enrollments
```

判题设置：
- 区分大小写：否
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
选课关系承载两端外键和成绩。

标准完整代码：
```sql
students(id,name)
courses(id,title)
enrollments(student_id,course_id,score)
```


---

## 第8章总结

[标题]
这一章真正学会了什么

[文本]
你已经能判断一个字段属于哪个实体，并用主键/外键/关系表表达稳定关系。

现在你应该能够：

- 能根据数据语义选择基础类型与约束。
- 能为实体选择稳定身份键。
- 能解释外键的完整性作用。
- 能为多对多关系设计中间表。
- 能识别典型更新异常。
- 能按事实归属拆分简单业务模型。

[提示 title=复习方式]
不要只重新看定义。盖住答案，用本章统一场景重新推一遍数据、代码或状态变化；能自己推出结果，才算掌握。

---

## 第8章综合挑战（不计分）

[标题]
设计学习平台最小数据模型

[文本]
设计users、courses、enrollments三表：明确主键、唯一用户名、课程标题、选课时间和成绩；解释每列为什么放在那张表，指出一个错误宽表会产生的更新异常。
