# 第5章：用 JOIN 把分散在多张表的数据重新连起来

章节简介：从为什么分表开始，逐步掌握INNER、LEFT、多表连接和一对多统计。
预计学习时间：90 分钟

章节学习目标：
- 理解并能应用为什么要把数据拆成多张表
- 理解并能应用INNER JOIN 只保留双方能匹配的行
- 理解并能应用表别名让多表查询可读
- 理解并能应用LEFT JOIN 保留左表“没有匹配”的行
- 理解并能应用一对多 JOIN 为什么会让行数增加
- 理解并能应用用 JOIN + GROUP BY 做真正的跨表报表

[标题]
本章统一场景

[文本]
students(id,name)，courses(id,title)，enrollments(student_id,course_id,score)。小林选数据库92和网络88，小周选数据库85，小陈暂未选课。

---

## 课时 1：为什么要把数据拆成多张表

课时简介：理解JOIN不是为了让SQL变难，而是为了避免重复数据。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
如果每条选课记录都重复保存学生姓名、课程名称，一旦课程改名就要修改成百上千行。关系数据库通常把实体分表，再通过ID建立关系。

[标题]
先建立一个能看见的模型

[文本]
students保存学生；courses保存课程；enrollments只保存student_id、course_id、score。查询展示时再JOIN。

[代码 language=sql]
-- students: (1,'小林'), (2,'小周')
-- courses:  (10,'数据库'), (20,'网络')
-- enrollments: (1,10,92), (2,10,85), (1,20,88)
[/代码]

[文本]
小林名字只在students出现一次，数据库课程名只在courses出现一次；enrollments用ID引用它们。课程改名时只改courses对应一行。

[示例 title=最小可验证示例]
说明：围绕本章统一数据，执行一条可以直接验证结果的 SQL。
语言：sql

-- students: (1,'小林'), (2,'小周')
-- courses:  (10,'数据库'), (20,'网络')
-- enrollments: (1,10,92), (2,10,85), (1,20,88)
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数据值换掉，先在纸上预测结果，再执行 SQL 验证。能解释每一行为什么留下或被排除，才算真正理解。

[警告 title=常见错误]
把所有文字都复制到enrollments，导致同一事实多份副本互相不一致。

[标题]
本课小结

[文本]
能解释分表和ID关联的价值。

### 课时题目

#### 题目 1

题型：SINGLE_CHOICE
题干：enrollments里更适合保存课程名还是course_id？

难度：EASY
分值：10
知识点：关系建模
是否用于 Battle：否

选项：
- A. course_id [正确]
- B. 每次复制完整课程简介
- C. 只存学生姓名
- D. 什么都不存

解析：
ID引用减少重复。

#### 题目 2

题型：SINGLE_CHOICE
题干：课程改名时分表设计通常改几处课程名？

难度：MEDIUM
分值：10
知识点：关系
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：结果预测

选项：
- A. courses中的对应课程一处 [正确]
- B. 所有enrollments行
- C. 每个学生表都改
- D. 不能改

解析：
事实单一来源。

#### 题目 3

题型：SINGLE_CHOICE
题干：JOIN的核心用途之一是？

难度：HARD
分值：10
知识点：JOIN
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：结果预测

选项：
- A. 根据关联键把多表信息组合到查询结果 [正确]
- B. 永久合并所有表
- C. 删除外键
- D. 给CPU超频

解析：
查询时恢复关联信息。


---

## 课时 2：INNER JOIN 只保留双方能匹配的行

课时简介：第一次真正把学生和选课记录拼起来。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
INNER JOIN会从左表拿一行，用ON条件去右表找匹配；没有匹配的行不会出现在结果。

[标题]
先建立一个能看见的模型

[文本]
students.id与enrollments.student_id相等时代表“这条选课属于这个学生”。

[代码 language=sql]
SELECT s.name, e.course_id, e.score
FROM students s
JOIN enrollments e ON s.id = e.student_id;
[/代码]

[文本]
小林有两条enrollments，所以会出现两行；小周一条；如果小陈没有任何选课记录，INNER JOIN结果里不会出现小陈。

[示例 title=最小可验证示例]
说明：围绕本章统一数据，执行一条可以直接验证结果的 SQL。
语言：sql

SELECT s.name, e.course_id, e.score
FROM students s
JOIN enrollments e ON s.id = e.student_id;
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数据值换掉，先在纸上预测结果，再执行 SQL 验证。能解释每一行为什么留下或被排除，才算真正理解。

[警告 title=常见错误]
忘记ON条件会形成笛卡尔积或语义错误：每个学生可能与每条选课组合。

[标题]
本课小结

[文本]
能根据ON键手工匹配两表。

### 课时题目

#### 题目 4

题型：SINGLE_CHOICE
题干：ON `s.id=e.student_id`表达什么？

难度：EASY
分值：10
知识点：JOIN ON
是否用于 Battle：否

选项：
- A. 学生主键与选课外键匹配 [正确]
- B. 比较两个分数
- C. 按姓名排序
- D. 删除重复

解析：
关联同一学生。

#### 题目 5

题型：SINGLE_CHOICE
题干：没有选课记录的小陈在INNER JOIN中？

难度：MEDIUM
分值：10
知识点：INNER JOIN
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：结果预测

选项：
- A. 通常不会出现 [正确]
- B. 一定出现NULL行
- C. 出现两次
- D. 自动创建选课

解析：
内连接只保留匹配。

#### 题目 6

题型：CODE_FILL
题干：补全关联条件。

难度：HARD
分值：10
知识点：JOIN
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码：
```sql
FROM students s
JOIN enrollments e ON s.id = e.____
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
选课表用student_id指向学生。

标准完整代码：
```sql
FROM students s
JOIN enrollments e ON s.id = e.student_id
```


---

## 课时 3：表别名让多表查询可读

课时简介：避免id、name到底来自哪张表的歧义。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
多张表往往都有id列。写`s.id`、`c.id`明确来源，比只写id更清晰，也避免数据库提示列名歧义。

[标题]
先建立一个能看见的模型

[文本]
`students s`给students起短别名s；之后SELECT、ON都用s引用。

[代码 language=sql]
SELECT s.name, c.title, e.score
FROM enrollments e
JOIN students s ON e.student_id = s.id
JOIN courses c ON e.course_id = c.id;
[/代码]

[文本]
三表连接后，每条选课同时得到学生姓名和课程标题。e保存关联与成绩，s补学生信息，c补课程信息。

[示例 title=最小可验证示例]
说明：围绕本章统一数据，执行一条可以直接验证结果的 SQL。
语言：sql

SELECT s.name, c.title, e.score
FROM enrollments e
JOIN students s ON e.student_id = s.id
JOIN courses c ON e.course_id = c.id;
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数据值换掉，先在纸上预测结果，再执行 SQL 验证。能解释每一行为什么留下或被排除，才算真正理解。

[警告 title=常见错误]
别名定义后又混用原表名，或两个表都起相同别名，导致不可读/报错。

[标题]
本课小结

[文本]
能读懂三表JOIN中每个别名的角色。

### 课时题目

#### 题目 7

题型：SINGLE_CHOICE
题干：示例中`s`代表？

难度：EASY
分值：10
知识点：表别名
是否用于 Battle：否

选项：
- A. students [正确]
- B. score
- C. SELECT
- D. schema

解析：
别名来自students s。

#### 题目 8

题型：SINGLE_CHOICE
题干：`c.title`来自哪张表？

难度：MEDIUM
分值：10
知识点：表别名
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：结果预测

选项：
- A. courses [正确]
- B. students
- C. enrollments
- D. 临时变量

解析：
c是courses别名。

#### 题目 9

题型：SINGLE_CHOICE
题干：为什么多表都有id时推荐写`s.id`？

难度：HARD
分值：10
知识点：列限定
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：结果预测

选项：
- A. 明确列来源并避免歧义 [正确]
- B. 让id变字符串
- C. 自动建索引
- D. 减少表行数

解析：
限定列所属表。


---

## 课时 4：LEFT JOIN 保留左表“没有匹配”的行

课时简介：解决“还没有选课的学生也要显示”这一类需求。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
INNER JOIN会丢掉无匹配学生。但管理后台常要列出所有学生，包括0门课的人。LEFT JOIN保证左表每行至少出现一次，右侧无匹配则为NULL。

[标题]
先建立一个能看见的模型

[文本]
以students为左表LEFT JOIN enrollments。小陈无选课时仍出现，e.course_id/e.score为NULL。

[代码 language=sql]
SELECT s.name, e.course_id, e.score
FROM students s
LEFT JOIN enrollments e ON s.id = e.student_id;
[/代码]

[文本]
有选课的人按匹配数展开；无选课的小陈也保留一行，右侧字段NULL。

[示例 title=最小可验证示例]
说明：围绕本章统一数据，执行一条可以直接验证结果的 SQL。
语言：sql

SELECT s.name, e.course_id, e.score
FROM students s
LEFT JOIN enrollments e ON s.id = e.student_id;
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数据值换掉，先在纸上预测结果，再执行 SQL 验证。能解释每一行为什么留下或被排除，才算真正理解。

[警告 title=常见错误]
LEFT JOIN之后在WHERE写`e.score>=60`，会把右侧NULL行过滤掉，结果可能又像INNER JOIN。要先想清楚是否需要保留“无匹配”。

[标题]
本课小结

[文本]
能根据需求选择INNER或LEFT JOIN。

### 课时题目

#### 题目 10

题型：SINGLE_CHOICE
题干：要显示所有学生包括未选课者，更适合？

难度：EASY
分值：10
知识点：LEFT JOIN
是否用于 Battle：否

选项：
- A. LEFT JOIN [正确]
- B. INNER JOIN
- C. CROSS JOIN
- D. 只SELECT enrollments

解析：
左连接保留左表。

#### 题目 11

题型：SINGLE_CHOICE
题干：右表无匹配时其列通常显示？

难度：MEDIUM
分值：10
知识点：LEFT JOIN
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：结果预测

选项：
- A. NULL [正确]
- B. 自动0
- C. 复制左表值
- D. 随机

解析：
左连接用NULL补齐。

#### 题目 12

题型：CODE_FILL
题干：补全连接类型，保留全部students。

难度：HARD
分值：10
知识点：LEFT JOIN
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码：
```sql
FROM students s
____ JOIN enrollments e ON s.id=e.student_id
```

可接受答案：
```sql
LEFT
```

```sql
left
```

判题设置：
- 区分大小写：否
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
LEFT JOIN保留左表。

标准完整代码：
```sql
FROM students s
LEFT JOIN enrollments e ON s.id=e.student_id
```


---

## 课时 5：一对多 JOIN 为什么会让行数增加

课时简介：建立“JOIN不是一行对一行”的正确直觉。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
一个学生可以有多条选课记录。一对多连接时，左表一行会复制成多行，每个匹配右表记录一行。这不是重复Bug，而是关系展开。

[标题]
先建立一个能看见的模型

[文本]
小林id=1有数据库92和网络88两条选课，JOIN后小林出现两行。

[代码 language=sql]
SELECT s.name, c.title, e.score
FROM students s
JOIN enrollments e ON s.id=e.student_id
JOIN courses c ON c.id=e.course_id
WHERE s.id=1;
[/代码]

[文本]
结果是“小林 数据库 92”和“小林 网络 88”两行。学生信息重复显示，是因为两条关系记录都需要一个完整结果行。

[示例 title=最小可验证示例]
说明：围绕本章统一数据，执行一条可以直接验证结果的 SQL。
语言：sql

SELECT s.name, c.title, e.score
FROM students s
JOIN enrollments e ON s.id=e.student_id
JOIN courses c ON c.id=e.course_id
WHERE s.id=1;
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数据值换掉，先在纸上预测结果，再执行 SQL 验证。能解释每一行为什么留下或被排除，才算真正理解。

[警告 title=常见错误]
看到name重复就急着DISTINCT，可能把真实的一对多明细隐藏掉。先确认业务粒度是“学生”还是“选课”。

[标题]
本课小结

[文本]
能解释一对多JOIN的结果粒度。

### 课时题目

#### 题目 13

题型：SINGLE_CHOICE
题干：小林有2条选课，JOIN后通常出现几行？

难度：EASY
分值：10
知识点：一对多
是否用于 Battle：否

选项：
- A. 2 [正确]
- B. 1
- C. 0
- D. 5

解析：
每个匹配关系一行。

#### 题目 14

题型：SINGLE_CHOICE
题干：看到同一name重复出现应先判断什么？

难度：MEDIUM
分值：10
知识点：JOIN粒度
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：结果预测

选项：
- A. 是否存在一对多关系且结果粒度是选课 [正确]
- B. 立即DISTINCT
- C. 删除重复学生
- D. 关闭外键

解析：
重复可能是正确展开。

#### 题目 15

题型：SINGLE_CHOICE
题干：若想每个学生只一行并显示选课数，下一步更适合？

难度：HARD
分值：10
知识点：JOIN+聚合
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：结果预测

选项：
- A. GROUP BY学生并COUNT选课 [正确]
- B. 盲目DISTINCT所有列
- C. 删除选课表
- D. CROSS JOIN

解析：
聚合把选课明细收回学生粒度。


---

## 课时 6：用 JOIN + GROUP BY 做真正的跨表报表

课时简介：把“关系展开”和“分组统计”组合。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
真实报表常要显示每个学生选了几门课、平均成绩多少。先LEFT JOIN保留所有学生，再按学生分组聚合。

[标题]
先建立一个能看见的模型

[文本]
`COUNT(e.course_id)`不会统计未选课行中的NULL，因此未选课学生得到0门。AVG没有成绩时为NULL。

[代码 language=sql]
SELECT s.id, s.name,
       COUNT(e.course_id) AS course_count,
       AVG(e.score) AS avg_score
FROM students s
LEFT JOIN enrollments e ON s.id=e.student_id
GROUP BY s.id, s.name;
[/代码]

[文本]
小林2门→course_count=2、avg=90；小周1门→1、85；未选课小陈→0、NULL。

[示例 title=最小可验证示例]
说明：围绕本章统一数据，执行一条可以直接验证结果的 SQL。
语言：sql

SELECT s.id, s.name,
       COUNT(e.course_id) AS course_count,
       AVG(e.score) AS avg_score
FROM students s
LEFT JOIN enrollments e ON s.id=e.student_id
GROUP BY s.id, s.name;
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数据值换掉，先在纸上预测结果，再执行 SQL 验证。能解释每一行为什么留下或被排除，才算真正理解。

[警告 title=常见错误]
用COUNT(*)统计LEFT JOIN结果时，未选课学生也有那一条NULL补齐行，可能得到1而不是0。这里应COUNT右表实际非NULL键。

[标题]
本课小结

[文本]
能用LEFT JOIN与COUNT(column)正确统计0关系。

### 课时题目

#### 题目 16

题型：SINGLE_CHOICE
题干：未选课学生使用COUNT(e.course_id)得到？

难度：EASY
分值：10
知识点：JOIN聚合
是否用于 Battle：否

选项：
- A. 0 [正确]
- B. 1
- C. NULL
- D. 报错

解析：
NULL的course_id不计数。

#### 题目 17

题型：SINGLE_CHOICE
题干：小林92和88两门平均？

难度：MEDIUM
分值：10
知识点：JOIN聚合
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：结果预测

选项：
- A. 90 [正确]
- B. 180
- C. 92
- D. 88

解析：
(92+88)/2=90。

#### 题目 18

题型：CODE_FILL
题干：补全聚合函数，统计实际选课数。

难度：HARD
分值：10
知识点：JOIN聚合
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码：
```sql
SELECT s.name, ____(e.course_id) AS course_count
FROM students s LEFT JOIN enrollments e ON s.id=e.student_id
GROUP BY s.name;
```

可接受答案：
```sql
COUNT
```

```sql
count
```

判题设置：
- 区分大小写：否
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
COUNT右表非NULL键可得到未选课0。

标准完整代码：
```sql
SELECT s.name, COUNT(e.course_id) AS course_count
FROM students s LEFT JOIN enrollments e ON s.id=e.student_id
GROUP BY s.name;
```


---

## 第5章总结

[标题]
这一章真正学会了什么

[文本]
你已经能根据关联键连接多表，并能解释匹配、无匹配和一对多展开后的结果。

现在你应该能够：

- 能解释分表和ID关联的价值。
- 能根据ON键手工匹配两表。
- 能读懂三表JOIN中每个别名的角色。
- 能根据需求选择INNER或LEFT JOIN。
- 能解释一对多JOIN的结果粒度。
- 能用LEFT JOIN与COUNT(column)正确统计0关系。

[提示 title=复习方式]
不要只重新看定义。盖住答案，用本章统一场景重新推一遍数据、代码或状态变化；能自己推出结果，才算掌握。

---

## 第5章综合挑战（不计分）

[标题]
生成学生选课总览

[文本]
列出所有学生、选课数、平均分；未选课学生也必须出现且course_count=0。再找出至少选2门课的学生。说明为什么用LEFT JOIN和COUNT(e.course_id)。
