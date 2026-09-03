# 第3章：写出更精确、更不容易出错的筛选条件

章节简介：学习BETWEEN、IN、LIKE、NULL和逻辑括号，把搜索需求准确翻译成WHERE。
预计学习时间：90 分钟

章节学习目标：
- 理解并能应用BETWEEN 表达一个闭区间
- 理解并能应用IN 判断“是不是这些值之一”
- 理解并能应用LIKE 用模式匹配文字
- 理解并能应用IS NULL 正确寻找缺失值
- 理解并能应用括号决定 AND / OR 的逻辑分组
- 理解并能应用把搜索条件拆成可验证步骤

[标题]
本章统一场景

[文本]
继续使用students和student_profiles，重点手算每个条件会保留哪些行。

---

## 课时 1：BETWEEN 表达一个闭区间

课时简介：让“80到90分之间”不必重复写两次列名。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
范围条件非常常见。`BETWEEN a AND b`表示包含两端的区间，等价于`>=a AND <=b`。

[标题]
先建立一个能看见的模型

[文本]
对数字、日期等可比较值都能形成范围判断，但要先确认边界是否包含。

[代码 language=sql]
SELECT name, score
FROM students
WHERE score BETWEEN 85 AND 92;
[/代码]

[文本]
分数85、88、92都会保留；76和95排除。BETWEEN包含85和92两个端点。

[示例 title=最小可验证示例]
说明：围绕本章统一数据，执行一条可以直接验证结果的 SQL。
语言：sql

SELECT name, score
FROM students
WHERE score BETWEEN 85 AND 92;
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数据值换掉，先在纸上预测结果，再执行 SQL 验证。能解释每一行为什么留下或被排除，才算真正理解。

[警告 title=常见错误]
以为BETWEEN是开区间，错误排除边界值。需求如果写“高于85且低于92”，应明确用`>85 AND <92`。

[标题]
本课小结

[文本]
能判断BETWEEN的边界。

### 课时题目

#### 题目 1

题型：SINGLE_CHOICE
题干：`BETWEEN 85 AND 92`是否包含85？

难度：EASY
分值：10
知识点：BETWEEN
是否用于 Battle：否

选项：
- A. 包含 [正确]
- B. 不包含
- C. 只包含92
- D. 随机

解析：
BETWEEN通常闭区间。

#### 题目 2

题型：SINGLE_CHOICE
题干：本章students中该条件会保留几人？

难度：MEDIUM
分值：10
知识点：BETWEEN
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：结果预测

选项：
- A. 3 [正确]
- B. 2
- C. 4
- D. 5

解析：
85/88/92三人。

#### 题目 3

题型：SINGLE_CHOICE
题干：若要求严格大于85且小于92应写？

难度：HARD
分值：10
知识点：范围
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：结果预测

选项：
- A. score > 85 AND score < 92 [正确]
- B. score BETWEEN 85 AND 92
- C. score >=85 OR score<=92
- D. score = 85

解析：
严格边界用>和<。


---

## 课时 2：IN 判断“是不是这些值之一”

课时简介：把一串OR条件写得更接近业务列表。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
专业允许“计算机、大数据”时，可以写两个OR，也可以使用IN列表。IN强调“值属于这个集合”。

[标题]
先建立一个能看见的模型

[文本]
`major IN ('计算机','大数据')`等价于`major='计算机' OR major='大数据'`。

[代码 language=sql]
SELECT name, major
FROM students
WHERE major IN ('计算机', '大数据');
[/代码]

[文本]
小林、小陈、小吴、小王保留；小周的软件工程不在列表里。

[示例 title=最小可验证示例]
说明：围绕本章统一数据，执行一条可以直接验证结果的 SQL。
语言：sql

SELECT name, major
FROM students
WHERE major IN ('计算机', '大数据');
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数据值换掉，先在纸上预测结果，再执行 SQL 验证。能解释每一行为什么留下或被排除，才算真正理解。

[警告 title=常见错误]
把IN列表写成一个长字符串`IN ('计算机,大数据')`。那只是一个值，不是两个值。

[标题]
本课小结

[文本]
能用IN表达离散集合条件。

### 课时题目

#### 题目 4

题型：SINGLE_CHOICE
题干：IN更适合表达哪类条件？

难度：EASY
分值：10
知识点：IN
是否用于 Battle：否

选项：
- A. 值属于若干离散选项之一 [正确]
- B. 连续数值区间
- C. 排序方向
- D. 表连接

解析：
IN是集合成员判断。

#### 题目 5

题型：SINGLE_CHOICE
题干：示例会排除谁？

难度：MEDIUM
分值：10
知识点：IN
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：结果预测

选项：
- A. 小周 [正确]
- B. 小林
- C. 小陈
- D. 小王

解析：
只有软件工程不在列表。

#### 题目 6

题型：CODE_FILL
题干：补全关键字。

难度：HARD
分值：10
知识点：IN
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码：
```sql
WHERE major ____ ('计算机','大数据')
```

可接受答案：
```sql
IN
```

```sql
in
```

判题设置：
- 区分大小写：否
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
IN判断集合成员。

标准完整代码：
```sql
WHERE major IN ('计算机','大数据')
```


---

## 课时 3：LIKE 用模式匹配文字

课时简介：从“完全相等”升级到“名字以什么开头/包含什么”。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
`=`要求字符串整体相等。搜索框常需要部分匹配，LIKE通过通配符表达模式。`%`代表任意长度字符，`_`代表恰好一个字符。

[标题]
先建立一个能看见的模型

[文本]
`name LIKE '小%'`匹配所有以“小”开头的名字；`name LIKE '%林%'`匹配包含“林”的值。

[代码 language=sql]
SELECT name
FROM students
WHERE name LIKE '小%';
[/代码]

[文本]
当前五个名字都以“小”开头，所以全返回。如果模式改成`%王`，只有小王。

[示例 title=最小可验证示例]
说明：围绕本章统一数据，执行一条可以直接验证结果的 SQL。
语言：sql

SELECT name
FROM students
WHERE name LIKE '小%';
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数据值换掉，先在纸上预测结果，再执行 SQL 验证。能解释每一行为什么留下或被排除，才算真正理解。

[警告 title=常见错误]
把`%`当普通百分号或忘记引号。LIKE模式本身是字符串，需要放在引号里。

[标题]
本课小结

[文本]
能根据%和_预测匹配结果。

### 课时题目

#### 题目 7

题型：SINGLE_CHOICE
题干：模式`'小%'`表示？

难度：EASY
分值：10
知识点：LIKE
是否用于 Battle：否

选项：
- A. 以“小”开头，后面可有任意字符 [正确]
- B. 只等于“小%”
- C. 以%开头
- D. 恰好两个字符

解析：
%匹配任意长度。

#### 题目 8

题型：SINGLE_CHOICE
题干：`'%王'`在当前姓名中匹配？

难度：MEDIUM
分值：10
知识点：LIKE
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：结果预测

选项：
- A. 小王 [正确]
- B. 小林
- C. 全部五人
- D. 无人

解析：
以王结尾。

#### 题目 9

题型：SINGLE_CHOICE
题干：模式`'小_'`中的下划线代表？

难度：HARD
分值：10
知识点：LIKE
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：结果预测

选项：
- A. 恰好一个任意字符 [正确]
- B. 任意长度字符
- C. 数字0
- D. 空值

解析：
_匹配一个字符。


---

## 课时 4：IS NULL 正确寻找缺失值

课时简介：把上一章NULL知识真正放进过滤条件。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
“未填写邮箱”不是字符串比较，而是值不存在。使用IS NULL可以明确筛出缺失记录。

[标题]
先建立一个能看见的模型

[文本]
`IS NOT NULL`则反过来筛有值记录。它们不需要也不能写成`IS = NULL`。

[代码 language=sql]
SELECT id, name
FROM student_profiles
WHERE email IS NULL;
[/代码]

[文本]
如果小陈email=NULL，小吴email=''，结果只含小陈。空字符串虽然没字符，但仍是一个值。

[示例 title=最小可验证示例]
说明：围绕本章统一数据，执行一条可以直接验证结果的 SQL。
语言：sql

SELECT id, name
FROM student_profiles
WHERE email IS NULL;
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数据值换掉，先在纸上预测结果，再执行 SQL 验证。能解释每一行为什么留下或被排除，才算真正理解。

[警告 title=常见错误]
把NULL、空字符串、字符串`'NULL'`当成一回事。这三种数据语义完全不同。

[标题]
本课小结

[文本]
能用IS NULL/IS NOT NULL过滤缺失值。

### 课时题目

#### 题目 10

题型：SINGLE_CHOICE
题干：筛未填邮箱应写？

难度：EASY
分值：10
知识点：IS NULL
是否用于 Battle：否

选项：
- A. email IS NULL [正确]
- B. email = NULL
- C. email = 'NULL'
- D. email = 0

解析：
NULL用IS。

#### 题目 11

题型：SINGLE_CHOICE
题干：email=''是否一定被IS NULL选中？

难度：MEDIUM
分值：10
知识点：NULL
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：结果预测

选项：
- A. 不会 [正确]
- B. 一定
- C. 只在MySQL所有版本
- D. 只有ORDER BY时

解析：
空字符串不是NULL。

#### 题目 12

题型：CODE_FILL
题干：补全条件，筛选有邮箱的学生。

难度：HARD
分值：10
知识点：IS NOT NULL
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码：
```sql
WHERE email ____ NULL
```

可接受答案：
```sql
IS NOT
```

```sql
is not
```

判题设置：
- 区分大小写：否
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
IS NOT NULL筛非NULL。

标准完整代码：
```sql
WHERE email IS NOT NULL
```


---

## 课时 5：括号决定 AND / OR 的逻辑分组

课时简介：防止一条看似正确的WHERE筛出意外结果。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
AND通常比OR优先。如果业务是“专业为计算机或大数据，并且分数>=90”，必须让两个专业条件先组成一组。

[标题]
先建立一个能看见的模型

[文本]
括号让逻辑结构直接对应中文需求，也降低读者误解。

[代码 language=sql]
SELECT name, major, score
FROM students
WHERE (major='计算机' OR major='大数据')
  AND score >= 90;
[/代码]

[文本]
先确定专业属于两者之一，再要求分数>=90。当前只保留小林92和小王95。

[示例 title=最小可验证示例]
说明：围绕本章统一数据，执行一条可以直接验证结果的 SQL。
语言：sql

SELECT name, major, score
FROM students
WHERE (major='计算机' OR major='大数据')
  AND score >= 90;
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数据值换掉，先在纸上预测结果，再执行 SQL 验证。能解释每一行为什么留下或被排除，才算真正理解。

[警告 title=常见错误]
省略括号写`major=计算机 OR major=大数据 AND score>=90`，会按AND优先，计算机专业的小吴76也可能被保留。

[标题]
本课小结

[文本]
能根据括号推导复杂条件。

### 课时题目

#### 题目 13

题型：SINGLE_CHOICE
题干：示例最终返回几人？

难度：EASY
分值：10
知识点：逻辑分组
是否用于 Battle：否

选项：
- A. 2 [正确]
- B. 3
- C. 4
- D. 1

解析：
小林和小王。

#### 题目 14

题型：SINGLE_CHOICE
题干：为什么这里建议加括号？

难度：MEDIUM
分值：10
知识点：AND OR
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：结果预测

选项：
- A. 明确OR作为一组再与分数条件AND [正确]
- B. 为了SQL更快一定
- C. 括号创建表
- D. 否则SELECT无效

解析：
括号控制逻辑结合。

#### 题目 15

题型：SINGLE_CHOICE
题干：不加括号且AND优先时，小吴76为什么可能被保留？

难度：HARD
分值：10
知识点：运算优先级
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：结果预测

选项：
- A. 他满足左侧“计算机”这一整个OR分支 [正确]
- B. 76>=90
- C. 他是大数据
- D. ORDER BY改变WHERE

解析：
OR左支已为true。


---

## 课时 6：把搜索条件拆成可验证步骤

课时简介：建立调试复杂WHERE的习惯。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
当查询结果不对，最糟糕的方法是一次乱改五个条件。更可靠的方法是先跑单个条件，再逐个组合并记录每一步剩几行。

[标题]
先建立一个能看见的模型

[文本]
复杂筛选可以像数学推导一样逐层验证：专业集合→分数范围→邮箱非空。每一步都应该能解释哪几行被排除。

[代码 language=sql]
SELECT name, major, score
FROM students
WHERE major IN ('计算机','大数据')
  AND score BETWEEN 80 AND 95
  AND name LIKE '小%';
[/代码]

[文本]
专业条件先排除小周；分数80~95再排除小吴76；姓名条件当前剩余者都通过，最终小林、小陈、小王。

[示例 title=最小可验证示例]
说明：围绕本章统一数据，执行一条可以直接验证结果的 SQL。
语言：sql

SELECT name, major, score
FROM students
WHERE major IN ('计算机','大数据')
  AND score BETWEEN 80 AND 95
  AND name LIKE '小%';
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数据值换掉，先在纸上预测结果，再执行 SQL 验证。能解释每一行为什么留下或被排除，才算真正理解。

[警告 title=常见错误]
结果错时直接加`OR 1=1`之类让结果“看起来有数据”，反而掩盖条件错误。

[标题]
本课小结

[文本]
能用逐条件验证排查WHERE。

### 课时题目

#### 题目 16

题型：SINGLE_CHOICE
题干：示例第一步IN会先排除谁？

难度：EASY
分值：10
知识点：条件调试
是否用于 Battle：否

选项：
- A. 小周 [正确]
- B. 小林
- C. 小陈
- D. 小王

解析：
软件工程不在集合。

#### 题目 17

题型：SINGLE_CHOICE
题干：之后BETWEEN 80 AND 95会再排除谁？

难度：MEDIUM
分值：10
知识点：范围
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：结果预测

选项：
- A. 小吴 [正确]
- B. 小林
- C. 小陈
- D. 小王

解析：
小吴76不在范围。

#### 题目 18

题型：CODE_FILL
题干：补全范围，使80和95都包含。

难度：HARD
分值：10
知识点：综合过滤
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码：
```sql
AND score ____ 80 AND 95
```

可接受答案：
```sql
BETWEEN
```

```sql
between
```

判题设置：
- 区分大小写：否
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
BETWEEN包含两端。

标准完整代码：
```sql
AND score BETWEEN 80 AND 95
```


---

## 第3章总结

[标题]
这一章真正学会了什么

[文本]
你已经能处理范围、集合、模糊匹配、缺失值和复杂AND/OR组合。

现在你应该能够：

- 能判断BETWEEN的边界。
- 能用IN表达离散集合条件。
- 能根据%和_预测匹配结果。
- 能用IS NULL/IS NOT NULL过滤缺失值。
- 能根据括号推导复杂条件。
- 能用逐条件验证排查WHERE。

[提示 title=复习方式]
不要只重新看定义。盖住答案，用本章统一场景重新推一遍数据、代码或状态变化；能自己推出结果，才算掌握。

---

## 第3章综合挑战（不计分）

[标题]
实现课程后台搜索条件

[文本]
找计算机或大数据专业、80~95分、姓名以“小”开头且邮箱已填写的学生。先分四步手算每个条件，再写完整SQL。
