# 第2章：让查询结果更像一张真正的报表

章节简介：学习别名、去重、表达式和NULL，让SELECT不仅“拿数据”，还能生成清晰结果。
预计学习时间：90 分钟

章节学习目标：
- 理解并能应用用 AS 给结果列起一个更清楚的名字
- 理解并能应用用 DISTINCT 去掉重复值
- 理解并能应用在 SELECT 中做算术计算
- 理解并能应用字符串拼接让结果更像报表
- 理解并能应用NULL 不是空字符串，也不是数字 0
- 理解并能应用把表达式、别名、去重和 NULL 放进同一张报表

[标题]
本章统一场景

[文本]
继续使用students，并增加student_profiles(id,name,nickname,email,score)来观察NULL。

---

## 课时 1：用 AS 给结果列起一个更清楚的名字

课时简介：理解查询结果不仅要正确，还要让人看得懂。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
如果直接查询`score * 2`，数据库通常会把表达式本身当作列标题。报表给用户看时，这个标题不友好，所以需要别名。

[标题]
先建立一个能看见的模型

[文本]
`AS`只改变本次查询结果的显示名称，不会改掉表中真正的列名。别名可以给普通列或计算表达式使用。

[代码 language=sql]
SELECT name, score, score * 2 AS double_score
FROM students;
[/代码]

[文本]
小林的score是92，所以double_score为184；小周85对应170。原表里不会凭空多出double_score列，它只是查询结果中的名字。

[示例 title=最小可验证示例]
说明：围绕本章统一数据，执行一条可以直接验证结果的 SQL。
语言：sql

SELECT name, score, score * 2 AS double_score
FROM students;
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数据值换掉，先在纸上预测结果，再执行 SQL 验证。能解释每一行为什么留下或被排除，才算真正理解。

[警告 title=常见错误]
把`AS`理解成修改数据库字段。执行SELECT不会把score列重命名，也不会保存double_score。

[标题]
本课小结

[文本]
能用别名让计算列含义清楚。

### 课时题目

#### 题目 1

题型：SINGLE_CHOICE
题干：`score * 2 AS double_score`中的AS做什么？

难度：EASY
分值：10
知识点：AS
是否用于 Battle：否

选项：
- A. 给结果表达式起别名 [正确]
- B. 把score永久改名
- C. 把score乘两次
- D. 创建新表

解析：
AS定义结果列别名。

#### 题目 2

题型：SINGLE_CHOICE
题干：score=88时double_score结果是多少？

难度：MEDIUM
分值：10
知识点：表达式
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：结果预测

选项：
- A. 176 [正确]
- B. 88
- C. 90
- D. 44

解析：
88×2=176。

#### 题目 3

题型：SINGLE_CHOICE
题干：查询结束后原students表是否新增double_score列？

难度：HARD
分值：10
知识点：别名
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：结果预测

选项：
- A. 不会，别名只属于查询结果 [正确]
- B. 会永久新增
- C. 只在score>=90时新增
- D. 取决于ORDER BY

解析：
SELECT别名不改变表结构。


---

## 课时 2：用 DISTINCT 去掉重复值

课时简介：从“学生有几行”切换到“有哪些不同专业”。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
students里可能有多人属于同一个专业。如果问题是“系统里出现过哪些专业”，重复的“计算机”“大数据”没有必要重复显示。

[标题]
先建立一个能看见的模型

[文本]
`DISTINCT`作用在SELECT结果组合上。`SELECT DISTINCT major`按major去重；如果选两列，则按两列组合去重。

[代码 language=sql]
SELECT DISTINCT major
FROM students;
[/代码]

[文本]
原表专业依次为计算机、软件工程、大数据、计算机、大数据。去重后只剩三种：计算机、软件工程、大数据。

[示例 title=最小可验证示例]
说明：围绕本章统一数据，执行一条可以直接验证结果的 SQL。
语言：sql

SELECT DISTINCT major
FROM students;
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数据值换掉，先在纸上预测结果，再执行 SQL 验证。能解释每一行为什么留下或被排除，才算真正理解。

[警告 title=常见错误]
以为`DISTINCT major, age`只按major去重。实际上会按`major+age`这一整组结果列判断重复。

[标题]
本课小结

[文本]
能根据查询列判断DISTINCT的去重单位。

### 课时题目

#### 题目 4

题型：SINGLE_CHOICE
题干：本章5名学生共有多少种不同major？

难度：EASY
分值：10
知识点：DISTINCT
是否用于 Battle：否

选项：
- A. 3 [正确]
- B. 5
- C. 2
- D. 4

解析：
计算机、软件工程、大数据共3种。

#### 题目 5

题型：SINGLE_CHOICE
题干：`SELECT DISTINCT major FROM students`会返回什么？

难度：MEDIUM
分值：10
知识点：DISTINCT
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：结果预测

选项：
- A. 每种专业只出现一次 [正确]
- B. 只返回第一名学生
- C. 删除表中重复学生
- D. 按专业排序

解析：
DISTINCT只去重结果。

#### 题目 6

题型：CODE_FILL
题干：补全关键字，查询不同专业。

难度：HARD
分值：10
知识点：DISTINCT
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码：
```sql
SELECT ____ major
FROM students;
```

可接受答案：
```sql
DISTINCT
```

```sql
distinct
```

判题设置：
- 区分大小写：否
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
DISTINCT去重。

标准完整代码：
```sql
SELECT DISTINCT major
FROM students;
```


---

## 课时 3：在 SELECT 中做算术计算

课时简介：让数据库直接生成报表需要的派生值。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
很多业务值不必单独存列，例如“与及格线相差多少分”可以由score实时计算。这样源数据只有一个score，不会因为重复保存而不一致。

[标题]
先建立一个能看见的模型

[文本]
SELECT后的表达式对每一行独立计算。可以使用`+ - * /`和括号控制计算顺序。

[代码 language=sql]
SELECT name, score, score - 60 AS above_pass
FROM students;
[/代码]

[文本]
小林92→32，小周85→25，小吴76→16。每一行都用自己的score参与计算。

[示例 title=最小可验证示例]
说明：围绕本章统一数据，执行一条可以直接验证结果的 SQL。
语言：sql

SELECT name, score, score - 60 AS above_pass
FROM students;
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数据值换掉，先在纸上预测结果，再执行 SQL 验证。能解释每一行为什么留下或被排除，才算真正理解。

[警告 title=常见错误]
把派生值和源值都长期保存却没有同步规则，可能出现score改了但派生列没改。基础报表优先现算。

[标题]
本课小结

[文本]
能根据每行数据计算派生列。

### 课时题目

#### 题目 7

题型：SINGLE_CHOICE
题干：小王score=95时`score-60`是多少？

难度：EASY
分值：10
知识点：算术表达式
是否用于 Battle：否

选项：
- A. 35 [正确]
- B. 155
- C. 60
- D. 95

解析：
95-60=35。

#### 题目 8

题型：SINGLE_CHOICE
题干：`score + 5 * 2`按通常优先级先算什么？

难度：MEDIUM
分值：10
知识点：表达式优先级
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：结果预测

选项：
- A. 5*2 [正确]
- B. score+5
- C. 全部随机
- D. 先除以2

解析：
乘法优先于加法。

#### 题目 9

题型：SINGLE_CHOICE
题干：若希望先给score加5再乘2，应写？

难度：HARD
分值：10
知识点：括号
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：结果预测

选项：
- A. (score + 5) * 2 [正确]
- B. score + 5 * 2
- C. score + (5 / 2)
- D. score * 2 + 5 * 0

解析：
括号明确先算加法。


---

## 课时 4：字符串拼接让结果更像报表

课时简介：把多个字段组合成用户可读文本。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
页面有时需要“姓名（专业）”这种展示文本。不同数据库拼接函数略有差异，本课程统一用常见的`CONCAT()`理解概念。

[标题]
先建立一个能看见的模型

[文本]
`CONCAT(name, '（', major, '）')`把多个字符串和值依次连接。这里重点是“结果可以由多列计算得到”，不是死记某一家数据库函数差异。

[代码 language=sql]
SELECT CONCAT(name, '（', major, '）') AS label
FROM students;
[/代码]

[文本]
小林这一行得到“小林（计算机）”，小王得到“小王（大数据）”。原始name和major列没有被修改。

[示例 title=最小可验证示例]
说明：围绕本章统一数据，执行一条可以直接验证结果的 SQL。
语言：sql

SELECT CONCAT(name, '（', major, '）') AS label
FROM students;
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数据值换掉，先在纸上预测结果，再执行 SQL 验证。能解释每一行为什么留下或被排除，才算真正理解。

[警告 title=常见错误]
把显示拼接当作数据模型本身。如果后续还要分别筛选姓名和专业，源列仍应分开保存。

[标题]
本课小结

[文本]
能理解字符串表达式的逐行计算。

### 课时题目

#### 题目 10

题型：SINGLE_CHOICE
题干：小林/计算机经过示例CONCAT得到？

难度：EASY
分值：10
知识点：字符串函数
是否用于 Battle：否

选项：
- A. 小林（计算机） [正确]
- B. 计算机小林无括号
- C. 只剩小林
- D. NULL一定

解析：
按参数顺序拼接。

#### 题目 11

题型：SINGLE_CHOICE
题干：拼接结果会永久改name列吗？

难度：MEDIUM
分值：10
知识点：查询表达式
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：结果预测

选项：
- A. 不会 [正确]
- B. 会
- C. 只改第一行
- D. 只在事务里改

解析：
SELECT表达式不修改源表。

#### 题目 12

题型：CODE_FILL
题干：补全函数名。

难度：HARD
分值：10
知识点：字符串函数
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码：
```sql
SELECT ____(name, '-', major) AS label
FROM students;
```

可接受答案：
```sql
CONCAT
```

```sql
concat
```

判题设置：
- 区分大小写：否
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
CONCAT连接参数。

标准完整代码：
```sql
SELECT CONCAT(name, '-', major) AS label
FROM students;
```


---

## 课时 5：NULL 不是空字符串，也不是数字 0

课时简介：建立数据库里“未知/缺失”的正确直觉。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
有些学生暂时没有填写邮箱。数据库用NULL表示“没有一个确定值”。它不等于空字符串`''`，也不等于0。

[标题]
先建立一个能看见的模型

[文本]
和NULL做普通`= NULL`比较不会得到你直觉中的true。判断缺失值要用`IS NULL`；判断非空用`IS NOT NULL`。

[代码 language=sql]
SELECT name
FROM student_profiles
WHERE email IS NULL;
[/代码]

[文本]
假设小陈email为NULL、小吴email为空字符串。这个查询只返回小陈，因为空字符串是一个已知字符串值，不是NULL。

[示例 title=最小可验证示例]
说明：围绕本章统一数据，执行一条可以直接验证结果的 SQL。
语言：sql

SELECT name
FROM student_profiles
WHERE email IS NULL;
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数据值换掉，先在纸上预测结果，再执行 SQL 验证。能解释每一行为什么留下或被排除，才算真正理解。

[警告 title=常见错误]
写`WHERE email = NULL`。SQL的NULL参与普通比较会产生UNKNOWN，不能用等号判断缺失。

[标题]
本课小结

[文本]
能区分NULL、空字符串和0。

### 课时题目

#### 题目 13

题型：SINGLE_CHOICE
题干：判断email缺失应写？

难度：EASY
分值：10
知识点：NULL
是否用于 Battle：否

选项：
- A. email IS NULL [正确]
- B. email = NULL
- C. email == NULL
- D. NULL(email)

解析：
NULL用IS NULL。

#### 题目 14

题型：SINGLE_CHOICE
题干：空字符串`''`和NULL是否相同？

难度：MEDIUM
分值：10
知识点：NULL
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：结果预测

选项：
- A. 不相同 [正确]
- B. 完全相同
- C. 只在数字列相同
- D. 只在SELECT *相同

解析：
NULL表示未知/缺失，空字符串是已知值。

#### 题目 15

题型：SINGLE_CHOICE
题干：`WHERE email IS NOT NULL`会保留什么？

难度：HARD
分值：10
知识点：NULL
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：结果预测

选项：
- A. email有确定非NULL值的行 [正确]
- B. 只保留空字符串以外但排除普通邮箱
- C. 删除NULL
- D. 把NULL变空串

解析：
IS NOT NULL筛非NULL。


---

## 课时 6：把表达式、别名、去重和 NULL 放进同一张报表

课时简介：把本章零散能力组合成一次真实输出。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
真实查询往往同时包含多个结果列、计算列和缺失值处理。组合时先逐列问“这个结果列从哪里来”，再考虑筛选。

[标题]
先建立一个能看见的模型

[文本]
假设profiles有nickname可能NULL。使用`COALESCE(nickname, name)`表示nickname缺失时退回name；同时计算等级文本。

[代码 language=sql]
SELECT id,
       COALESCE(nickname, name) AS display_name,
       score,
       score - 60 AS above_pass
FROM student_profiles
WHERE score >= 60;
[/代码]

[文本]
每行先通过WHERE保留及格学生，再计算结果列。nickname为NULL时display_name使用name，否则用nickname。above_pass仍是逐行score-60。

[示例 title=最小可验证示例]
说明：围绕本章统一数据，执行一条可以直接验证结果的 SQL。
语言：sql

SELECT id,
       COALESCE(nickname, name) AS display_name,
       score,
       score - 60 AS above_pass
FROM student_profiles
WHERE score >= 60;
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数据值换掉，先在纸上预测结果，再执行 SQL 验证。能解释每一行为什么留下或被排除，才算真正理解。

[警告 title=常见错误]
在没弄清NULL语义前用大量`= NULL`或把所有NULL一律替成0，会混淆“未知”和真实0。

[标题]
本课小结

[文本]
能把计算列、别名和NULL处理组合成可读报表。

### 课时题目

#### 题目 16

题型：SINGLE_CHOICE
题干：COALESCE(nickname,name)最直接含义？

难度：EASY
分值：10
知识点：COALESCE
是否用于 Battle：否

选项：
- A. 优先取第一个非NULL值 [正确]
- B. 把两个字符串永久合并
- C. 删除nickname
- D. 按字母排序

解析：
COALESCE返回第一个非NULL参数。

#### 题目 17

题型：SINGLE_CHOICE
题干：score=76时above_pass是多少？

难度：MEDIUM
分值：10
知识点：计算列
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：结果预测

选项：
- A. 16 [正确]
- B. 136
- C. 60
- D. 0

解析：
76-60=16。

#### 题目 18

题型：CODE_FILL
题干：补全函数，使nickname为空时使用name。

难度：HARD
分值：10
知识点：NULL处理
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码：
```sql
SELECT ____(nickname, name) AS display_name
FROM student_profiles;
```

可接受答案：
```sql
COALESCE
```

```sql
coalesce
```

判题设置：
- 区分大小写：否
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
COALESCE选第一个非NULL值。

标准完整代码：
```sql
SELECT COALESCE(nickname, name) AS display_name
FROM student_profiles;
```


---

## 第2章总结

[标题]
这一章真正学会了什么

[文本]
你已经能控制结果列的名字、去重方式、派生值和缺失值处理。

现在你应该能够：

- 能用别名让计算列含义清楚。
- 能根据查询列判断DISTINCT的去重单位。
- 能根据每行数据计算派生列。
- 能理解字符串表达式的逐行计算。
- 能区分NULL、空字符串和0。
- 能把计算列、别名和NULL处理组合成可读报表。

[提示 title=复习方式]
不要只重新看定义。盖住答案，用本章统一场景重新推一遍数据、代码或状态变化；能自己推出结果，才算掌握。

---

## 第2章综合挑战（不计分）

[标题]
生成学生展示报表

[文本]
输出display_name、专业、score和距及格线差值；nickname缺失时使用name，并只显示不重复的专业组合。手工写出3条输入记录对应的结果。
