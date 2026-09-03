# 第4章：从一行行数据得到统计结论

章节简介：掌握COUNT、SUM、AVG、MIN/MAX、GROUP BY和HAVING。
预计学习时间：90 分钟

章节学习目标：
- 理解并能应用COUNT 先回答“有多少行”
- 理解并能应用SUM 和 AVG 统计总量与平均值
- 理解并能应用MIN 和 MAX 找边界值
- 理解并能应用GROUP BY 按专业分别统计
- 理解并能应用HAVING 过滤“分组后的结果”
- 理解并能应用WHERE → GROUP BY → HAVING → ORDER BY 串起来

[标题]
本章统一场景

[文本]
仍使用5名学生的固定分数，要求先手算再和SQL结果对照。

---

## 课时 1：COUNT 先回答“有多少行”

课时简介：从查看每条记录进入汇总统计。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
管理页面经常只需要人数而不是所有学生行。聚合函数把多行压成一个统计值。

[标题]
先建立一个能看见的模型

[文本]
`COUNT(*)`统计查询范围内的行数；加WHERE后只统计筛选后的行。

[代码 language=sql]
SELECT COUNT(*) AS student_count
FROM students;
[/代码]

[文本]
当前students有5行，所以结果是student_count=5。若加`WHERE major='大数据'`则得到2。

[示例 title=最小可验证示例]
说明：围绕本章统一数据，执行一条可以直接验证结果的 SQL。
语言：sql

SELECT COUNT(*) AS student_count
FROM students;
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数据值换掉，先在纸上预测结果，再执行 SQL 验证。能解释每一行为什么留下或被排除，才算真正理解。

[警告 title=常见错误]
把`COUNT(email)`和`COUNT(*)`当完全相同。COUNT(column)通常不统计该列为NULL的行。

[标题]
本课小结

[文本]
能区分COUNT(*)和COUNT(column)。

### 课时题目

#### 题目 1

题型：SINGLE_CHOICE
题干：当前students的COUNT(*)是多少？

难度：EASY
分值：10
知识点：COUNT
是否用于 Battle：否

选项：
- A. 5 [正确]
- B. 3
- C. 1
- D. 180

解析：
5条记录。

#### 题目 2

题型：SINGLE_CHOICE
题干：`COUNT(email)`对email=NULL的行通常怎样？

难度：MEDIUM
分值：10
知识点：COUNT
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：结果预测

选项：
- A. 不计入该行的email计数 [正确]
- B. 一定计入
- C. 自动变0
- D. 删除行

解析：
COUNT(column)忽略NULL。

#### 题目 3

题型：SINGLE_CHOICE
题干：`WHERE major='大数据'`后COUNT(*)是多少？

难度：HARD
分值：10
知识点：聚合过滤
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：结果预测

选项：
- A. 2 [正确]
- B. 5
- C. 1
- D. 3

解析：
小陈和小王两行。


---

## 课时 2：SUM 和 AVG 统计总量与平均值

课时简介：从一个个分数得到班级总体指标。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
SUM把数值相加，AVG求平均。它们都在WHERE筛选后的行上工作。

[标题]
先建立一个能看见的模型

[文本]
当前分数92+85+88+76+95=436，AVG=436/5=87.2。

[代码 language=sql]
SELECT SUM(score) AS total_score,
       AVG(score) AS avg_score
FROM students;
[/代码]

[文本]
查询返回一行统计结果：total_score=436，avg_score=87.2。

[示例 title=最小可验证示例]
说明：围绕本章统一数据，执行一条可以直接验证结果的 SQL。
语言：sql

SELECT SUM(score) AS total_score,
       AVG(score) AS avg_score
FROM students;
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数据值换掉，先在纸上预测结果，再执行 SQL 验证。能解释每一行为什么留下或被排除，才算真正理解。

[警告 title=常见错误]
直接用`SUM(score)/COUNT(*)`代替AVG但忽略score可能NULL，分母语义可能不同。初学时先理解内置AVG对NULL的处理规则。

[标题]
本课小结

[文本]
能手算SUM/AVG并理解筛选范围。

### 课时题目

#### 题目 4

题型：SINGLE_CHOICE
题干：当前五人score总和？

难度：EASY
分值：10
知识点：SUM
是否用于 Battle：否

选项：
- A. 436 [正确]
- B. 440
- C. 87.2
- D. 5

解析：
逐项相加。

#### 题目 5

题型：SINGLE_CHOICE
题干：当前平均分？

难度：MEDIUM
分值：10
知识点：AVG
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：结果预测

选项：
- A. 87.2 [正确]
- B. 436
- C. 92
- D. 85

解析：
436/5。

#### 题目 6

题型：CODE_FILL
题干：补全函数，求平均分。

难度：HARD
分值：10
知识点：AVG
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码：
```sql
SELECT ____(score) AS avg_score
FROM students;
```

可接受答案：
```sql
AVG
```

```sql
avg
```

判题设置：
- 区分大小写：否
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
AVG求平均。

标准完整代码：
```sql
SELECT AVG(score) AS avg_score
FROM students;
```


---

## 课时 3：MIN 和 MAX 找边界值

课时简介：快速得到最高/最低，而不是手工排序。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
当只关心一个字段的最小或最大值，MIN/MAX直接返回边界。它们不会自动告诉你“对应哪一名学生”。

[标题]
先建立一个能看见的模型

[文本]
`MAX(score)`得到95，`MIN(score)`得到76。要找最高分学生整行，需要后续排序LIMIT或子查询。

[代码 language=sql]
SELECT MIN(score) AS min_score, MAX(score) AS max_score
FROM students;
[/代码]

[文本]
返回76和95。注意这只是两个数，没有name。

[示例 title=最小可验证示例]
说明：围绕本章统一数据，执行一条可以直接验证结果的 SQL。
语言：sql

SELECT MIN(score) AS min_score, MAX(score) AS max_score
FROM students;
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数据值换掉，先在纸上预测结果，再执行 SQL 验证。能解释每一行为什么留下或被排除，才算真正理解。

[警告 title=常见错误]
写`SELECT name, MAX(score)`却没有明确分组，期望数据库自动把name配到最高分那一行。标准SQL语义并不这样保证。

[标题]
本课小结

[文本]
能区分边界值与对应记录。

### 课时题目

#### 题目 7

题型：SINGLE_CHOICE
题干：当前MAX(score)是多少？

难度：EASY
分值：10
知识点：MAX
是否用于 Battle：否

选项：
- A. 95 [正确]
- B. 92
- C. 76
- D. 436

解析：
小王95最高。

#### 题目 8

题型：SINGLE_CHOICE
题干：MIN(score)返回？

难度：MEDIUM
分值：10
知识点：MIN
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：结果预测

选项：
- A. 76 [正确]
- B. 85
- C. 0
- D. 5

解析：
小吴76最低。

#### 题目 9

题型：SINGLE_CHOICE
题干：只得到MAX(score)=95后，是否已经知道返回哪名学生的完整行？

难度：HARD
分值：10
知识点：聚合语义
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：结果预测

选项：
- A. 没有，MAX只给聚合值 [正确]
- B. 一定是第一行
- C. 数据库自动返回小王整行
- D. MIN也会返回姓名

解析：
聚合值与行身份不同。


---

## 课时 4：GROUP BY 按专业分别统计

课时简介：让一个总体平均值拆成“每个专业各是多少”。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
如果只用AVG，全表只得到一个平均分。GROUP BY会先把拥有相同分组键的行放在一组，再对每组分别聚合。

[标题]
先建立一个能看见的模型

[文本]
计算机组有92和76，平均84；大数据88和95，平均91.5；软件工程只有85，平均85。

[代码 language=sql]
SELECT major, COUNT(*) AS cnt, AVG(score) AS avg_score
FROM students
GROUP BY major;
[/代码]

[文本]
最终每个major一行。GROUP BY不是排序，它改变了统计粒度：从“每个学生”变成“每个专业”。

[示例 title=最小可验证示例]
说明：围绕本章统一数据，执行一条可以直接验证结果的 SQL。
语言：sql

SELECT major, COUNT(*) AS cnt, AVG(score) AS avg_score
FROM students
GROUP BY major;
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数据值换掉，先在纸上预测结果，再执行 SQL 验证。能解释每一行为什么留下或被排除，才算真正理解。

[警告 title=常见错误]
在GROUP BY查询里随意SELECT一个既不分组也不聚合的列，例如name，会产生不明确语义或被数据库拒绝。

[标题]
本课小结

[文本]
能按分组键计算每组统计。

### 课时题目

#### 题目 10

题型：SINGLE_CHOICE
题干：计算机专业平均分？

难度：EASY
分值：10
知识点：GROUP BY
是否用于 Battle：否

选项：
- A. 84 [正确]
- B. 92
- C. 76
- D. 168

解析：
(92+76)/2=84。

#### 题目 11

题型：SINGLE_CHOICE
题干：大数据专业COUNT(*)？

难度：MEDIUM
分值：10
知识点：GROUP BY
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：结果预测

选项：
- A. 2 [正确]
- B. 1
- C. 3
- D. 5

解析：
小陈、小王。

#### 题目 12

题型：CODE_FILL
题干：补全分组列。

难度：HARD
分值：10
知识点：GROUP BY
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码：
```sql
SELECT major, AVG(score)
FROM students
GROUP BY ____;
```

可接受答案：
```sql
major
```

判题设置：
- 区分大小写：否
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
按major分组。

标准完整代码：
```sql
SELECT major, AVG(score)
FROM students
GROUP BY major;
```


---

## 课时 5：HAVING 过滤“分组后的结果”

课时简介：区分筛行的WHERE与筛组的HAVING。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
如果需求是“只看平均分>=90的专业”，条件依赖AVG(score)，必须先形成专业组并计算平均，再决定保留哪组。

[标题]
先建立一个能看见的模型

[文本]
WHERE在分组前过滤原始行；HAVING在GROUP BY和聚合之后过滤组。

[代码 language=sql]
SELECT major, AVG(score) AS avg_score
FROM students
GROUP BY major
HAVING AVG(score) >= 90;
[/代码]

[文本]
计算机84不保留，软件工程85不保留，大数据91.5保留，所以结果只有大数据。

[示例 title=最小可验证示例]
说明：围绕本章统一数据，执行一条可以直接验证结果的 SQL。
语言：sql

SELECT major, AVG(score) AS avg_score
FROM students
GROUP BY major
HAVING AVG(score) >= 90;
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数据值换掉，先在纸上预测结果，再执行 SQL 验证。能解释每一行为什么留下或被排除，才算真正理解。

[警告 title=常见错误]
写`WHERE AVG(score)>=90`。WHERE阶段还没有每组AVG，聚合条件应放HAVING。

[标题]
本课小结

[文本]
能判断条件应放WHERE还是HAVING。

### 课时题目

#### 题目 13

题型：SINGLE_CHOICE
题干：筛“score>=90的学生行”用？

难度：EASY
分值：10
知识点：WHERE HAVING
是否用于 Battle：否

选项：
- A. WHERE [正确]
- B. HAVING一定
- C. ORDER BY
- D. LIMIT

解析：
这是分组前行条件。

#### 题目 14

题型：SINGLE_CHOICE
题干：筛“平均分>=90的专业”用？

难度：MEDIUM
分值：10
知识点：HAVING
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：结果预测

选项：
- A. HAVING [正确]
- B. WHERE AVG
- C. FROM
- D. DISTINCT

解析：
这是聚合后组条件。

#### 题目 15

题型：SINGLE_CHOICE
题干：示例最终保留哪个专业？

难度：HARD
分值：10
知识点：HAVING
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：结果预测

选项：
- A. 大数据 [正确]
- B. 计算机
- C. 软件工程
- D. 全部

解析：
平均91.5满足>=90。


---

## 课时 6：WHERE → GROUP BY → HAVING → ORDER BY 串起来

课时简介：理解统计查询真正的处理阶段。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
复杂报表常同时要求“先排除某些行，再按组统计，再排除不达标组，最后排序”。记住每个关键字处理的对象不同。

[标题]
先建立一个能看见的模型

[文本]
先用WHERE保留score>=80的学生，再按major分组，统计人数和平均分，HAVING要求至少2人，最后按平均分降序。

[代码 language=sql]
SELECT major, COUNT(*) AS cnt, AVG(score) AS avg_score
FROM students
WHERE score >= 80
GROUP BY major
HAVING COUNT(*) >= 2
ORDER BY avg_score DESC;
[/代码]

[文本]
WHERE先排除小吴76。大数据仍2人，计算机只剩小林1人，软件工程1人。HAVING后只有大数据组，avg=91.5。

[示例 title=最小可验证示例]
说明：围绕本章统一数据，执行一条可以直接验证结果的 SQL。
语言：sql

SELECT major, COUNT(*) AS cnt, AVG(score) AS avg_score
FROM students
WHERE score >= 80
GROUP BY major
HAVING COUNT(*) >= 2
ORDER BY avg_score DESC;
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数据值换掉，先在纸上预测结果，再执行 SQL 验证。能解释每一行为什么留下或被排除，才算真正理解。

[警告 title=常见错误]
看到结果不对就先改ORDER BY。排序只改变顺序，不会修复WHERE/GROUP BY/HAVING留下了哪些组。

[标题]
本课小结

[文本]
能按阶段手算聚合查询。

### 课时题目

#### 题目 16

题型：SINGLE_CHOICE
题干：示例WHERE首先排除谁？

难度：EASY
分值：10
知识点：聚合流程
是否用于 Battle：否

选项：
- A. 小吴 [正确]
- B. 小王
- C. 小陈
- D. 小林

解析：
76<80。

#### 题目 17

题型：SINGLE_CHOICE
题干：HAVING COUNT(*)>=2后留下哪个组？

难度：MEDIUM
分值：10
知识点：HAVING
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：结果预测

选项：
- A. 大数据 [正确]
- B. 计算机
- C. 软件工程
- D. 全部

解析：
过滤后只有大数据2人。

#### 题目 18

题型：CODE_FILL
题干：补全关键字，筛每组至少2人。

难度：HARD
分值：10
知识点：聚合综合
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码：
```sql
GROUP BY major
____ COUNT(*) >= 2
```

可接受答案：
```sql
HAVING
```

```sql
having
```

判题设置：
- 区分大小写：否
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
组条件用HAVING。

标准完整代码：
```sql
GROUP BY major
HAVING COUNT(*) >= 2
```


---

## 第4章总结

[标题]
这一章真正学会了什么

[文本]
你已经能从明细行得到整体统计和分组统计，并知道WHERE与HAVING作用阶段不同。

现在你应该能够：

- 能区分COUNT(*)和COUNT(column)。
- 能手算SUM/AVG并理解筛选范围。
- 能区分边界值与对应记录。
- 能按分组键计算每组统计。
- 能判断条件应放WHERE还是HAVING。
- 能按阶段手算聚合查询。

[提示 title=复习方式]
不要只重新看定义。盖住答案，用本章统一场景重新推一遍数据、代码或状态变化；能自己推出结果，才算掌握。

---

## 第4章综合挑战（不计分）

[标题]
做一张专业成绩统计榜

[文本]
排除80分以下学生，按专业统计人数/平均/最高分，只保留人数>=2的专业，按平均分降序。逐步写出每阶段剩余数据。
