# 课程信息

课程名称：Python 基础入门
课程标识：python-basic
课程分类：BACKEND
编程语言：Python
难度：BEGINNER
预计学习时间：720 分钟
课程简介：面向零基础学习者的 Python 基础课程。课程通过短小的知识讲解、可运行示例、常见错误分析和 Battle 精选题，帮助学习者逐步掌握 Python 基础语法，并具备阅读简单程序、判断运行结果和定位基础错误的能力。
适合人群：没有编程基础、希望从零开始学习 Python，并通过练习和对战巩固知识的学生。
课程封面：
发布状态：PUBLISHED

---

# 第八章：列表与元组

章节简介：学习使用列表和元组保存一组有顺序的数据，掌握索引、切片、增删改查、遍历、排序和不可变特性。
预计学习时间：95 分钟

章节学习目标：
- 能创建列表和元组
- 能使用索引和切片读取元素
- 能使用 append()、insert() 添加列表元素
- 能使用 remove()、pop()、del 删除列表元素
- 能修改列表中的指定元素
- 能使用 len()、in 和 not in 判断列表内容
- 能使用 for 遍历列表
- 能使用 sort()、sorted() 和 reverse() 调整顺序
- 能理解元组不可变
- 能根据使用场景选择列表或元组
- 能阅读列表与元组代码并判断运行结果

---

## 课时 1：创建列表并读取元素

课时简介：学习使用列表保存多个数据，并通过索引读取指定元素。
预计学习时间：15 分钟

### 正文

[标题]
列表用于保存一组有顺序的数据

[文本]
如果需要保存多个课程名称，分别创建多个变量并不方便。

[代码 language=python]
course_1 = "Python"
course_2 = "JavaScript"
course_3 = "Git"
[/代码]

[文本]
列表可以把多个相关数据保存在同一个变量中。

[代码 language=python]
courses = ["Python", "JavaScript", "Git"]
print(courses)
[/代码]

[文本]
列表使用英文中括号创建，元素之间使用英文逗号分隔。

[标题]
使用索引读取元素

[代码 language=python]
courses = ["Python", "JavaScript", "Git"]

print(courses[0])
print(courses[1])
print(courses[-1])
[/代码]

[文本]
列表索引同样从 0 开始。courses[0] 是 Python，courses[-1] 是最后一个元素 Git。

[标题]
列表可以保存不同类型的数据

[代码 language=python]
player = ["新手玩家", 1000, 82.5, True]
print(player)
[/代码]

[文本]
Python 列表可以同时保存字符串、整数、浮点数和布尔值。不过实际开发中，通常建议同一列表保存含义相近的数据。

[示例 title=保存课程章节]
说明：使用列表保存三个章节名称并读取第二章。
语言：python

chapters = ["变量", "条件判断", "循环"]

print(chapters[1])
[/示例]

[警告 title=注意索引范围]
列表有 3 个元素时，有效正索引是 0、1、2。访问索引 3 会产生越界错误。

### 课时题目

#### 题目 1

题型：SINGLE_CHOICE
题干：下面程序会输出什么？

```python
courses = ["Python", "JavaScript", "Git"]
print(courses[1])
```

难度：EASY
分值：10
知识点：列表、索引、元素读取
是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：输出预测

选项：
- A. Python
- B. JavaScript [正确]
- C. Git
- D. 1

解析：
列表索引从 0 开始，因此索引 1 表示第二个元素 JavaScript。

#### 题目 2

题型：FILL_BLANK
题干：Python 列表使用英文 ______ 创建。

难度：EASY
分值：10
知识点：列表语法
是否用于 Battle：否

可接受答案：
- 中括号
- 方括号
- []
- 中括号[]

判题设置：
- 忽略大小写：是
- 忽略首尾空格：是
- 合并连续空格：是
- 最长字符数：30

解析：
Python 使用英文中括号 [] 创建列表，元素之间使用英文逗号分隔。

#### 题目 3

题型：CODE_FILL
题干：课程列表中最后一门课程是 Git。请补全代码，使用负数索引输出最后一个元素。

难度：EASY
分值：10
知识点：列表、负数索引
是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：代码填空

题目代码：
```python
courses = ["Python", "JavaScript", "Git"]
print(courses[____])
```

可接受答案：
```python
-1
```

```python
2
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
负数索引 -1 表示列表最后一个元素。该列表长度为 3，因此正索引 2 也表示最后一个元素。

标准完整代码：
```python
courses = ["Python", "JavaScript", "Git"]
print(courses[-1])
```

---

## 课时 2：列表切片与长度

课时简介：学习获取列表中的一部分，并使用 len() 获取元素数量。
预计学习时间：14 分钟

### 正文

[标题]
列表也支持切片

[代码 language=python]
scores = [70, 80, 90, 100]

print(scores[1:3])
[/代码]

[文本]
切片包含开始索引，但不包含结束索引，因此结果是 [80, 90]。

[标题]
省略切片边界

[代码 language=python]
scores = [70, 80, 90, 100]

print(scores[:2])
print(scores[2:])
[/代码]

[文本]
scores[:2] 获取前两个元素，scores[2:] 从索引 2 获取到列表末尾。

[标题]
使用 len() 获取列表长度

[代码 language=python]
questions = ["题目1", "题目2", "题目3"]

print(len(questions))
[/代码]

[文本]
len() 返回列表元素数量，因此输出 3。

[示例 title=显示前两门推荐课程]
说明：通过切片获取列表前两个元素。
语言：python

recommended_courses = ["Python", "Git", "MySQL", "Linux"]
top_two = recommended_courses[:2]

print(top_two)
[/示例]

[提示 title=切片通常不会因为越界而报错]
切片结束位置超过列表长度时，Python 通常会返回已有部分，而不是产生索引越界错误。

### 课时题目

#### 题目 4

题型：SINGLE_CHOICE
题干：下面程序会输出什么？

```python
scores = [60, 70, 80, 90]
print(scores[1:3])
```

难度：MEDIUM
分值：10
知识点：列表切片
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：输出预测

选项：
- A. [60, 70]
- B. [70, 80] [正确]
- C. [70, 80, 90]
- D. [80, 90]

解析：
切片 scores[1:3] 包含索引 1 和 2，不包含索引 3，因此结果是 [70, 80]。

#### 题目 5

题型：FILL_BLANK
题干：阅读代码，填写最终输出结果。

```python
courses = ["Python", "Git", "MySQL", "Linux"]
print(len(courses))
```

输出：______

难度：EASY
分值：10
知识点：len、列表长度
是否用于 Battle：否

可接受答案：
- 4
- 四

判题设置：
- 忽略大小写：是
- 忽略首尾空格：是
- 合并连续空格：是
- 最长字符数：20

解析：
列表 courses 中有 4 个元素，因此 len(courses) 返回 4。

#### 题目 6

题型：CODE_FILL
题干：系统需要获取课程列表中的前 3 门课程。请补全切片。

难度：MEDIUM
分值：10
知识点：列表切片、前若干元素
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码填空

题目代码：
```python
courses = ["Python", "Git", "MySQL", "Linux", "Java"]
first_three = courses[______]

print(first_three)
```

可接受答案：
```python
:3
```

```python
0:3
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
courses[:3] 或 courses[0:3] 会获取索引 0、1、2，也就是前三个元素。

标准完整代码：
```python
courses = ["Python", "Git", "MySQL", "Linux", "Java"]
first_three = courses[:3]

print(first_three)
```

---

## 课时 3：添加与修改列表元素

课时简介：学习 append()、insert() 和索引赋值。
预计学习时间：16 分钟

### 正文

[标题]
append() 在列表末尾添加元素

[代码 language=python]
courses = ["Python", "Git"]
courses.append("MySQL")

print(courses)
[/代码]

[文本]
append() 会把新元素添加到列表末尾。

[标题]
insert() 在指定位置插入元素

[代码 language=python]
courses = ["Python", "MySQL"]
courses.insert(1, "Git")

print(courses)
[/代码]

[文本]
insert(1, "Git") 会在索引 1 的位置插入 Git，原有元素向后移动。

[标题]
通过索引修改元素

[代码 language=python]
courses = ["Python", "Git", "MySQL"]
courses[1] = "JavaScript"

print(courses)
[/代码]

[文本]
列表是可变对象，可以直接修改指定索引位置的元素。

[示例 title=更新题目状态]
说明：把第二道题的状态从“未作答”改为“已作答”。
语言：python

statuses = ["已作答", "未作答", "未作答"]
statuses[1] = "已作答"

print(statuses)
[/示例]

[警告 title=append() 一次添加一个完整元素]
courses.append(["Git", "Linux"]) 会把整个列表作为一个元素加入，而不是分别加入 Git 和 Linux。

### 课时题目

#### 题目 7

题型：SINGLE_CHOICE
题干：下面程序最终会输出什么？

```python
courses = ["Python", "Git"]
courses.append("MySQL")
print(courses)
```

难度：EASY
分值：10
知识点：append、列表添加
是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：输出预测

选项：
- A. ["Python", "Git"]
- B. ["MySQL", "Python", "Git"]
- C. ["Python", "Git", "MySQL"] [正确]
- D. 程序报错

解析：
append() 会在列表末尾添加一个元素，因此 MySQL 被添加到最后。

#### 题目 8

题型：FILL_BLANK
题干：Python 列表中，用于在末尾添加一个元素的方法是 ______。

难度：EASY
分值：10
知识点：append、列表方法
是否用于 Battle：否

可接受答案：
- append
- append()

判题设置：
- 忽略大小写：否
- 忽略首尾空格：是
- 合并连续空格：是
- 最长字符数：30

解析：
append() 用于在列表末尾添加一个完整元素。

#### 题目 9

题型：CODE_FILL
题干：课程列表原本有 Python 和 MySQL。系统需要把 Git 插入到它们之间。请补全代码。

难度：MEDIUM
分值：10
知识点：insert、列表索引、元素插入
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码填空

题目代码：
```python
courses = ["Python", "MySQL"]
courses.____________________

print(courses)
```

可接受答案：
```python
insert(1, "Git")
```

```python
insert(1,'Git')
```

```python
insert(1, 'Git')
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
索引 1 位于 Python 和 MySQL 之间，因此 insert(1, "Git") 会把 Git 插入到正确位置。

标准完整代码：
```python
courses = ["Python", "MySQL"]
courses.insert(1, "Git")

print(courses)
```

---

## 课时 4：删除列表元素

课时简介：学习 remove()、pop() 和 del 的使用区别。
预计学习时间：17 分钟

### 正文

[标题]
remove() 按元素值删除

[代码 language=python]
courses = ["Python", "Git", "MySQL"]
courses.remove("Git")

print(courses)
[/代码]

[文本]
remove("Git") 会删除列表中第一个值为 Git 的元素。

[标题]
pop() 按索引删除并返回元素

[代码 language=python]
courses = ["Python", "Git", "MySQL"]
removed_course = courses.pop(1)

print(removed_course)
print(courses)
[/代码]

[文本]
pop(1) 删除索引 1 的元素，并把被删除元素返回给 removed_course。

如果不传索引，pop() 默认删除最后一个元素。

[标题]
del 删除指定位置或切片

[代码 language=python]
courses = ["Python", "Git", "MySQL"]
del courses[0]

print(courses)
[/代码]

[示例 title=移除失效题目]
说明：删除列表中指定的失效题目。
语言：python

questions = ["有效题目", "失效题目", "有效题目"]
questions.remove("失效题目")

print(questions)
[/示例]

[警告 title=remove() 删除不存在的值会报错]
在调用 remove() 前，可以先使用 in 判断元素是否存在。

### 课时题目

#### 题目 10

题型：SINGLE_CHOICE
题干：下面哪种方法会删除列表最后一个元素，并返回被删除的值？

难度：MEDIUM
分值：10
知识点：pop、列表删除
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码用途

选项：
- A. append()
- B. remove()
- C. pop() [正确]
- D. insert()

解析：
不传参数的 pop() 会删除列表最后一个元素，并返回被删除的值。

#### 题目 11

题型：FILL_BLANK
题干：要按元素值删除列表中的第一个匹配项，应使用方法 ______。

难度：EASY
分值：10
知识点：remove、列表删除
是否用于 Battle：否

可接受答案：
- remove
- remove()

判题设置：
- 忽略大小写：否
- 忽略首尾空格：是
- 合并连续空格：是
- 最长字符数：30

解析：
remove(value) 会删除列表中第一个等于 value 的元素。

#### 题目 12

题型：CODE_FILL
题干：待学习列表中最后一门课程已经完成。请补全代码，删除并返回最后一个元素。

难度：MEDIUM
分值：10
知识点：pop、返回值、列表删除
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码填空

题目代码：
```python
pending_courses = ["Python", "Git", "MySQL"]
completed_course = pending_courses.________

print(completed_course)
print(pending_courses)
```

可接受答案：
```python
pop()
```

```python
pop(-1)
```

```python
pop(2)
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
pop() 默认删除并返回列表最后一个元素 MySQL。pop(-1) 和 pop(2) 在当前列表中效果相同。

标准完整代码：
```python
pending_courses = ["Python", "Git", "MySQL"]
completed_course = pending_courses.pop()

print(completed_course)
print(pending_courses)
```

---

## 课时 5：查找、判断与遍历列表

课时简介：学习使用 in、not in、index()、count() 和 for。
预计学习时间：17 分钟

### 正文

[标题]
使用 in 判断元素是否存在

[代码 language=python]
courses = ["Python", "Git", "MySQL"]

print("Git" in courses)
print("Java" not in courses)
[/代码]

[文本]
in 判断元素是否存在，not in 判断元素是否不存在，结果都是布尔值。

[标题]
index() 查找元素位置

[代码 language=python]
courses = ["Python", "Git", "MySQL"]
position = courses.index("Git")

print(position)
[/代码]

[文本]
Git 位于索引 1，因此输出 1。

[标题]
count() 统计出现次数

[代码 language=python]
results = ["正确", "错误", "正确", "正确"]
print(results.count("正确"))
[/代码]

[文本]
正确出现 3 次，因此结果是 3。

[标题]
使用 for 遍历列表

[代码 language=python]
courses = ["Python", "Git", "MySQL"]

for course in courses:
    print(course)
[/代码]

[示例 title=统计正确答案数量]
说明：遍历答题结果并累计正确数量。
语言：python

results = ["正确", "错误", "正确", "未作答"]
correct_count = 0

for result in results:
    if result == "正确":
        correct_count += 1

print(correct_count)
[/示例]

### 课时题目

#### 题目 13

题型：SINGLE_CHOICE
题干：下面程序会输出什么？

```python
courses = ["Python", "Git", "MySQL"]
print("Git" in courses)
```

难度：EASY
分值：10
知识点：in、列表成员判断
是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：输出预测

选项：
- A. True [正确]
- B. False
- C. Git
- D. 1

解析：
Git 确实存在于列表 courses 中，因此成员判断结果为 True。

#### 题目 14

题型：FILL_BLANK
题干：用于统计某个元素在列表中出现次数的方法是 ______。

难度：EASY
分值：10
知识点：count、列表统计
是否用于 Battle：否

可接受答案：
- count
- count()

判题设置：
- 忽略大小写：否
- 忽略首尾空格：是
- 合并连续空格：是
- 最长字符数：30

解析：
list.count(value) 返回指定元素在列表中出现的次数。

#### 题目 15

题型：CODE_FILL
题干：系统需要统计答题结果中“正确”出现的次数。请补全判断条件。

难度：MEDIUM
分值：10
知识点：列表遍历、if、计数
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码填空

题目代码：
```python
results = ["正确", "错误", "正确", "未作答"]
correct_count = 0

for result in results:
    if __________________:
        correct_count += 1

print(correct_count)
```

可接受答案：
```python
result == "正确"
```

```python
result == '正确'
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
循环变量 result 每次保存一个答题结果。只有 result 等于“正确”时，correct_count 才应增加 1。

标准完整代码：
```python
results = ["正确", "错误", "正确", "未作答"]
correct_count = 0

for result in results:
    if result == "正确":
        correct_count += 1

print(correct_count)
```

---

## 课时 6：排序、反转与元组

课时简介：学习调整列表顺序，并认识不可变的元组。
预计学习时间：16 分钟

### 正文

[标题]
sort() 原地排序列表

[代码 language=python]
scores = [80, 60, 100, 90]
scores.sort()

print(scores)
[/代码]

[文本]
sort() 会直接修改原列表，默认按从小到大排序。

[标题]
sorted() 返回新列表

[代码 language=python]
scores = [80, 60, 100, 90]
new_scores = sorted(scores)

print(scores)
print(new_scores)
[/代码]

[文本]
sorted() 返回排序后的新列表，不直接修改原列表。

[标题]
reverse() 反转当前顺序

[代码 language=python]
courses = ["Python", "Git", "MySQL"]
courses.reverse()

print(courses)
[/代码]

[标题]
元组使用圆括号创建

[代码 language=python]
battle_rules = (20, 180, 2, -1)
print(battle_rules)
[/代码]

[文本]
元组和列表一样有顺序，也支持索引和切片，但元组不可变，创建后不能直接修改元素。

适合元组的场景包括固定坐标、固定配置和不希望被修改的数据。

[示例 title=保存固定对战规则]
说明：使用元组保存题目数量、时间和计分规则。
语言：python

battle_rule = (20, 180, 2, -1)

print(battle_rule[0])
print(battle_rule[1])
[/示例]

[警告 title=单元素元组需要逗号]
single_value = (1000,) 才是单元素元组；single_value = (1000) 只是整数。

### 课时题目

#### 题目 16

题型：SINGLE_CHOICE
题干：下面哪项描述正确？

```python
scores = [80, 60, 100]
new_scores = sorted(scores)
```

难度：MEDIUM
分值：10
知识点：sorted、列表排序
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码分析

选项：
- A. sorted() 会返回排序后的新列表 [正确]
- B. sorted() 只能处理字符串
- C. scores 一定会被清空
- D. new_scores 一定与 scores 顺序相同

解析：
sorted(scores) 返回排序后的新列表，并不会直接清空或强制修改原列表。

#### 题目 17

题型：FILL_BLANK
题干：Python 元组通常使用英文 ______ 创建。

难度：EASY
分值：10
知识点：元组语法
是否用于 Battle：否

可接受答案：
- 圆括号
- 小括号
- ()
- 圆括号()

判题设置：
- 忽略大小写：是
- 忽略首尾空格：是
- 合并连续空格：是
- 最长字符数：30

解析：
元组通常使用英文圆括号 () 创建，元素之间使用英文逗号分隔。

#### 题目 18

题型：CODE_FILL
题干：系统需要保存不可修改的 Battle 计分规则：答对加 2 分，答错扣 1 分。请补全元组内容。

难度：MEDIUM
分值：10
知识点：元组、不可变数据、规则配置
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码填空

题目代码：
```python
score_rule = (__________)
print(score_rule)
```

可接受答案：
```python
2, -1
```

```python
2,-1
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
元组元素之间使用逗号分隔，因此 (2, -1) 可以保存“答对加 2 分、答错扣 1 分”的固定规则。

标准完整代码：
```python
score_rule = (2, -1)
print(score_rule)
```

---

## 第八章总结

[标题]
你已经能够管理一组有顺序的数据

[文本]
本章学习了：

- 使用列表保存多个相关数据
- 使用索引和切片读取列表元素
- 使用 len() 获取列表长度
- 使用 append() 和 insert() 添加元素
- 通过索引修改列表元素
- 使用 remove()、pop() 和 del 删除元素
- 使用 in 和 not in 判断元素是否存在
- 使用 index() 查找元素位置
- 使用 count() 统计元素数量
- 使用 for 遍历列表
- 使用 sort()、sorted() 和 reverse() 调整顺序
- 使用元组保存有顺序但不希望被修改的数据
- 理解列表可变、元组不可变

下一章将学习字典与集合，用键值对保存结构化数据，并使用集合完成去重和成员运算。

---

## 第八章综合挑战（不计分）

[标题]
制作简化版题目结果统计程序

[文本]
请编写一个程序，完成以下任务：

1. 使用列表保存一场对局的答题结果
2. 统计“正确”“错误”“未作答”的数量
3. 删除列表中所有“未作答”记录，得到有效作答列表
4. 使用元组保存固定计分规则：答对加 2 分、答错扣 1 分
5. 根据有效作答结果计算最终得分
6. 输出统计结果和最终分数

参考代码：

[代码 language=python]
results = ["正确", "错误", "正确", "未作答", "正确"]

correct_count = results.count("正确")
wrong_count = results.count("错误")
unanswered_count = results.count("未作答")

valid_results = []

for result in results:
    if result != "未作答":
        valid_results.append(result)

score_rule = (2, -1)
total_score = 0

for result in valid_results:
    if result == "正确":
        total_score += score_rule[0]
    else:
        total_score += score_rule[1]

print(f"正确：{correct_count}")
print(f"错误：{wrong_count}")
print(f"未作答：{unanswered_count}")
print(f"有效作答：{valid_results}")
print(f"最终得分：{total_score}")
[/代码]

[文本]
尝试修改 results 中的内容，观察各项统计和最终分数如何变化。
