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

# 第六章：循环

章节简介：学习使用 for 和 while 重复执行任务，掌握 range()、累加、计数、break、continue 和简单嵌套循环。
预计学习时间：85 分钟

章节学习目标：
- 理解循环适合解决重复任务
- 能使用 for 遍历一组数字
- 能使用 range() 控制循环次数
- 能使用 while 在条件成立时重复执行
- 能使用累加变量统计总数
- 能使用 break 提前结束循环
- 能使用 continue 跳过当前一轮
- 能阅读简单嵌套循环并判断执行次数
- 能避免常见死循环问题

---

## 课时 1：为什么需要循环

课时简介：理解重复代码的问题，并认识循环的基本用途。
预计学习时间：10 分钟

### 正文

[标题]
重复任务不应该重复写代码

[文本]
如果需要连续输出五次“开始答题”，最直接的写法是重复写五行 print()。

[代码 language=python]
print("开始答题")
print("开始答题")
print("开始答题")
print("开始答题")
print("开始答题")
[/代码]

[文本]
这种写法可以运行，但不容易修改。如果需要输出一百次，就需要写一百行代码。

循环可以让一段代码重复执行。

[代码 language=python]
for i in range(5):
    print("开始答题")
[/代码]

[文本]
这段代码同样会输出五次“开始答题”，但结构更短，也更容易调整次数。

[示例 title=重复显示准备提示]
说明：使用循环连续显示三次准备提示。
语言：python

for i in range(3):
    print("对局准备中")
[/示例]

[提示 title=循环适合处理规则相同的重复任务]
如果每次执行的操作相似，只是次数或数据不同，通常可以考虑使用循环。

### 课时题目

#### 题目 1

题型：SINGLE_CHOICE
题干：系统需要连续输出 20 道题的序号。相比重复写 20 行 print()，更适合使用什么结构？

难度：EASY
分值：10
知识点：循环、重复任务
是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：代码用途

选项：
- A. 循环 [正确]
- B. 注释
- C. 字符串
- D. 布尔值

解析：
循环适合重复执行相同或相似的任务。使用循环可以减少重复代码，也方便修改次数。

#### 题目 2

题型：FILL_BLANK
题干：需要让一段代码重复执行时，通常可以使用 ______ 结构。

难度：EASY
分值：10
知识点：循环、程序结构
是否用于 Battle：否

可接受答案：
- 循环
- loop

判题设置：
- 忽略大小写：是
- 忽略首尾空格：是
- 合并连续空格：是
- 最长字符数：20

解析：
循环结构用于重复执行一段代码，常见形式包括 for 循环和 while 循环。

#### 题目 3

题型：CODE_FILL
题干：系统需要连续显示三次“正在匹配”。请补全 range() 中的次数。

难度：EASY
分值：10
知识点：for、range、循环次数
是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：代码填空

题目代码：
```python
for i in range(____):
    print("正在匹配")
```

可接受答案：
```python
3
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
range(3) 会产生三次循环，因此 print() 会执行三次。

标准完整代码：
```python
for i in range(3):
    print("正在匹配")
```

---

## 课时 2：使用 for 和 range()

课时简介：学习按固定次数执行循环，并理解 range() 的常见形式。
预计学习时间：14 分钟

### 正文

[标题]
for 循环的基本结构

[代码 language=python]
for i in range(5):
    print(i)
[/代码]

[文本]
range(5) 会产生 0、1、2、3、4，共五个数字。每次循环时，变量 i 依次保存其中一个数字。

[标题]
设置开始值和结束值

[代码 language=python]
for i in range(1, 6):
    print(i)
[/代码]

[文本]
range(1, 6) 从 1 开始，到 6 之前结束，因此输出 1、2、3、4、5。

[标题]
设置步长

[代码 language=python]
for i in range(2, 11, 2):
    print(i)
[/代码]

[文本]
第三个参数 2 表示每次增加 2，因此输出 2、4、6、8、10。

[示例 title=显示题号]
说明：依次显示第 1 题到第 5 题。
语言：python

for question_number in range(1, 6):
    print(f"第 {question_number} 题")
[/示例]

[警告 title=range() 不包含结束值]
range(1, 6) 不会生成 6。结束值只是边界，不包含在结果中。

### 课时题目

#### 题目 4

题型：SINGLE_CHOICE
题干：下面程序会输出哪些数字？

```python
for i in range(3):
    print(i)
```

难度：EASY
分值：10
知识点：for、range、循环变量
是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：输出预测

选项：
- A. 0、1、2 [正确]
- B. 1、2、3
- C. 0、1、2、3
- D. 3、2、1

解析：
range(3) 从 0 开始，到 3 之前结束，因此产生 0、1、2。

#### 题目 5

题型：FILL_BLANK
题干：要让下面程序依次输出 1、2、3、4、5，range() 的第二个参数应填写 ______。

```python
for i in range(1, ______):
    print(i)
```

难度：MEDIUM
分值：10
知识点：range、结束值
是否用于 Battle：否

可接受答案：
- 6

判题设置：
- 忽略大小写：是
- 忽略首尾空格：是
- 合并连续空格：是
- 最长字符数：20

解析：
range() 不包含结束值，因此要输出到 5，结束值应写 6。

#### 题目 6

题型：CODE_FILL
题干：题库页面需要显示第 1 题到第 10 题。请补全 range()。

难度：MEDIUM
分值：10
知识点：for、range、题号
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码填空

题目代码：
```python
for question_number in range(__________):
    print(f"第 {question_number} 题")
```

可接受答案：
```python
1, 11
```

```python
1,11
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
range(1, 11) 从 1 开始，到 11 之前结束，因此依次生成 1 到 10。

标准完整代码：
```python
for question_number in range(1, 11):
    print(f"第 {question_number} 题")
```

---

## 课时 3：使用 while 循环

课时简介：学习在条件成立时重复执行代码。
预计学习时间：14 分钟

### 正文

[标题]
while 根据条件决定是否继续

[文本]
for 循环适合已知次数的任务。while 循环适合“只要条件成立就继续”的任务。

[代码 language=python]
count = 1

while count <= 3:
    print(count)
    count += 1
[/代码]

[文本]
程序会输出 1、2、3。每次循环后 count 增加 1，最终 count 变成 4，条件 count <= 3 不再成立，循环结束。

[标题]
while 的基本结构

[代码 language=python]
while 条件:
    条件成立时重复执行的代码
[/代码]

[警告 title=注意更新循环条件]
如果循环中的变量一直不变化，条件可能永远为 True，程序就会一直运行，形成死循环。

[示例 title=匹配等待倒计时]
说明：从 3 倒数到 1。
语言：python

seconds = 3

while seconds > 0:
    print(seconds)
    seconds -= 1

print("开始对局")
[/示例]

### 课时题目

#### 题目 7

题型：SINGLE_CHOICE
题干：下面程序会输出几次“等待中”？

```python
count = 1

while count <= 4:
    print("等待中")
    count += 1
```

难度：MEDIUM
分值：10
知识点：while、循环次数、变量更新
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码阅读

选项：
- A. 3 次
- B. 4 次 [正确]
- C. 5 次
- D. 无限次

解析：
count 依次为 1、2、3、4 时条件成立，因此循环执行四次。count 增加到 5 后条件不成立。

#### 题目 8

题型：FILL_BLANK
题干：while 循环中，如果条件始终为 True，并且没有退出逻辑，可能形成 ______。

难度：EASY
分值：10
知识点：while、死循环
是否用于 Battle：否

可接受答案：
- 死循环
- 无限循环

判题设置：
- 忽略大小写：是
- 忽略首尾空格：是
- 合并连续空格：是
- 最长字符数：30

解析：
条件一直成立时，while 会不断重复执行，形成死循环或无限循环。

#### 题目 9

题型：CODE_FILL
题干：系统需要从 3 倒数到 1。请补全变量更新语句，确保循环可以结束。

难度：MEDIUM
分值：10
知识点：while、复合赋值、倒计时
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码填空

题目代码：
```python
seconds = 3

while seconds > 0:
    print(seconds)
    __________

print("开始对局")
```

可接受答案：
```python
seconds -= 1
```

```python
seconds = seconds - 1
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
每次循环后需要让 seconds 减少 1。否则 seconds 会一直保持 3，条件永远成立，形成死循环。

标准完整代码：
```python
seconds = 3

while seconds > 0:
    print(seconds)
    seconds -= 1

print("开始对局")
```

---

## 课时 4：使用循环进行累加和计数

课时简介：学习在循环中统计总数和累计结果。
预计学习时间：15 分钟

### 正文

[标题]
使用变量保存累计结果

[文本]
循环经常与累加变量配合使用。例如计算 1 到 5 的总和。

[代码 language=python]
total = 0

for number in range(1, 6):
    total += number

print(total)
[/代码]

[文本]
total 初始为 0。每次循环都把当前 number 加到 total 中，最终结果是 15。

[标题]
使用计数器统计次数

[代码 language=python]
correct_count = 0

for answer in range(5):
    correct_count += 1

print(correct_count)
[/代码]

[文本]
每次循环让 correct_count 增加 1，因此五次循环后结果为 5。

[示例 title=计算 Battle 总分]
说明：假设连续答对 6 题，每题 2 分，通过循环累计总分。
语言：python

total_score = 0

for question_number in range(1, 7):
    total_score += 2

print(total_score)
[/示例]

[提示 title=累加变量通常在循环前初始化]
如果需要保存循环产生的总结果，应在循环开始前先设置初始值，例如 total = 0。

### 课时题目

#### 题目 10

题型：SINGLE_CHOICE
题干：下面程序最终会输出什么？

```python
total = 0

for number in range(1, 5):
    total += number

print(total)
```

难度：MEDIUM
分值：10
知识点：for、累加、range
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：输出预测

选项：
- A. 4
- B. 10 [正确]
- C. 15
- D. 0

解析：
range(1, 5) 产生 1、2、3、4，累加结果是 1 + 2 + 3 + 4 = 10。

#### 题目 11

题型：FILL_BLANK
题干：进行数值累加时，累计变量通常可以先初始化为 ______。

难度：EASY
分值：10
知识点：累加、初始化
是否用于 Battle：否

可接受答案：
- 0
- 零

判题设置：
- 忽略大小写：是
- 忽略首尾空格：是
- 合并连续空格：是
- 最长字符数：20

解析：
数值累加通常从 0 开始，因此常写 total = 0。

#### 题目 12

题型：CODE_FILL
题干：玩家连续答对 5 题，每题获得 2 分。请补全循环中的累计语句，使最终得分为 10。

难度：MEDIUM
分值：10
知识点：for、累加、复合赋值
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码填空

题目代码：
```python
total_score = 0

for i in range(5):
    __________________

print(total_score)
```

可接受答案：
```python
total_score += 2
```

```python
total_score = total_score + 2
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
循环执行五次，每次增加 2 分，最终 total_score 等于 10。

标准完整代码：
```python
total_score = 0

for i in range(5):
    total_score += 2

print(total_score)
```

---

## 课时 5：使用 break 和 continue

课时简介：学习提前结束循环和跳过当前一轮。
预计学习时间：16 分钟

### 正文

[标题]
break 提前结束整个循环

[文本]
当程序已经找到目标或满足退出条件时，可以使用 break 立即结束循环。

[代码 language=python]
for number in range(1, 6):
    if number == 3:
        break
    print(number)
[/代码]

[文本]
程序输出 1 和 2。当 number 等于 3 时执行 break，整个循环立即结束。

[标题]
continue 跳过当前一轮

[代码 language=python]
for number in range(1, 6):
    if number == 3:
        continue
    print(number)
[/代码]

[文本]
程序输出 1、2、4、5。number 等于 3 时只跳过当前一轮，之后的循环仍会继续。

[示例 title=跳过未作答题目]
说明：题号 3 未作答，统计时暂时跳过。
语言：python

for question_number in range(1, 6):
    if question_number == 3:
        continue

    print(f"统计第 {question_number} 题")
[/示例]

[警告 title=break 和 continue 作用不同]
break 结束整个循环；continue 只结束当前一轮，随后继续下一轮。

### 课时题目

#### 题目 13

题型：SINGLE_CHOICE
题干：下面程序会输出什么？

```python
for number in range(1, 6):
    if number == 3:
        break
    print(number)
```

难度：MEDIUM
分值：10
知识点：break、for、执行流程
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：输出预测

选项：
- A. 1、2 [正确]
- B. 1、2、4、5
- C. 3、4、5
- D. 1、2、3、4、5

解析：
number 等于 3 时执行 break，循环立即结束，因此只输出此前的 1 和 2。

#### 题目 14

题型：SINGLE_CHOICE
题干：系统需要跳过未作答题目，但继续处理后面的题目。应使用哪个关键字？

难度：EASY
分值：10
知识点：continue、循环控制
是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：代码用途

选项：
- A. break
- B. continue [正确]
- C. return
- D. pass

解析：
continue 会跳过当前一轮并继续下一轮。break 会结束整个循环，不符合要求。

#### 题目 15

题型：CODE_FILL
题干：程序遍历第 1 到第 5 题，其中第 3 题未作答。请补全代码，使程序跳过第 3 题，但继续处理第 4、5 题。

难度：MEDIUM
分值：10
知识点：continue、if、for
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码填空

题目代码：
```python
for question_number in range(1, 6):
    if question_number == 3:
        __________

    print(f"处理第 {question_number} 题")
```

可接受答案：
```python
continue
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
continue 会跳过第 3 题当前这一轮，随后循环继续处理第 4 题和第 5 题。

标准完整代码：
```python
for question_number in range(1, 6):
    if question_number == 3:
        continue

    print(f"处理第 {question_number} 题")
```

---

## 课时 6：简单嵌套循环

课时简介：认识循环内部继续使用循环的基本结构。
预计学习时间：16 分钟

### 正文

[标题]
循环中还可以包含另一个循环

[文本]
当任务包含“多组数据，每组又有多个项目”时，可以使用嵌套循环。

例如两轮练习，每轮有三道题：

[代码 language=python]
for round_number in range(1, 3):
    for question_number in range(1, 4):
        print(round_number, question_number)
[/代码]

[文本]
外层循环执行两次。每次外层循环中，内层循环都会完整执行三次，因此 print() 一共执行 2 × 3 = 6 次。

[示例 title=显示章节与题目]
说明：两章内容，每章包含三道题。
语言：python

for chapter_number in range(1, 3):
    for question_number in range(1, 4):
        print(f"第 {chapter_number} 章，第 {question_number} 题")
[/示例]

[警告 title=嵌套层级不要过多]
嵌套循环层级过多会让代码难以理解，也可能导致执行次数快速增加。

[提示 title=先看外层，再看内层]
阅读嵌套循环时，可以先确认外层循环执行几次，再确认每次外层循环中内层执行几次。

### 课时题目

#### 题目 16

题型：SINGLE_CHOICE
题干：下面程序中的 print() 一共执行多少次？

```python
for chapter in range(2):
    for question in range(3):
        print(chapter, question)
```

难度：MEDIUM
分值：10
知识点：嵌套循环、执行次数
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码分析

选项：
- A. 2 次
- B. 3 次
- C. 5 次
- D. 6 次 [正确]

解析：
外层循环执行 2 次，每次外层循环中内层执行 3 次，因此总执行次数为 2 × 3 = 6。

#### 题目 17

题型：FILL_BLANK
题干：外层循环执行 4 次，每次内层循环执行 5 次，则内层代码总共执行 ______ 次。

难度：EASY
分值：10
知识点：嵌套循环、执行次数
是否用于 Battle：否

可接受答案：
- 20
- 二十

判题设置：
- 忽略大小写：是
- 忽略首尾空格：是
- 合并连续空格：是
- 最长字符数：20

解析：
总执行次数等于外层次数乘以内层次数，即 4 × 5 = 20。

#### 题目 18

题型：CODE_FILL
题干：系统需要显示 2 个章节，每个章节有 3 道题。请补全内层 range()，让每章依次显示第 1、2、3 题。

难度：MEDIUM
分值：10
知识点：嵌套循环、range、题号
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码填空

题目代码：
```python
for chapter_number in range(1, 3):
    for question_number in range(__________):
        print(f"第 {chapter_number} 章，第 {question_number} 题")
```

可接受答案：
```python
1, 4
```

```python
1,4
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
range(1, 4) 依次产生 1、2、3，因此每个章节都会显示三道题。

标准完整代码：
```python
for chapter_number in range(1, 3):
    for question_number in range(1, 4):
        print(f"第 {chapter_number} 章，第 {question_number} 题")
```

---

## 第六章总结

[标题]
你已经能够让程序重复执行任务

[文本]
本章学习了：

- 使用 for 处理已知次数的重复任务
- 使用 range() 控制开始值、结束值和步长
- 使用 while 在条件成立时持续循环
- 在循环中更新条件，避免死循环
- 使用累加变量统计总数和分数
- 使用 break 提前结束整个循环
- 使用 continue 跳过当前一轮
- 使用简单嵌套循环处理多组重复任务

下一章将学习字符串，包括索引、切片、长度、拼接和常用字符串方法。

---

## 第六章综合挑战（不计分）

[标题]
制作简化版 Battle 答题统计程序

[文本]
请编写一个程序，模拟 5 道题的答题统计。

规则：

1. 第 3 题未作答，使用 continue 跳过
2. 第 5 题发现对局提前结束，使用 break 结束循环
3. 每处理一道有效题，计数器增加 1
4. 每道有效题获得 2 分
5. 最后输出有效作答数量和总分

参考代码：

[代码 language=python]
answered_count = 0
total_score = 0

for question_number in range(1, 6):
    if question_number == 3:
        continue

    if question_number == 5:
        break

    answered_count += 1
    total_score += 2

    print(f"已处理第 {question_number} 题")

print(f"有效作答数量：{answered_count}")
print(f"总分：{total_score}")
[/代码]

[文本]
尝试修改 continue 和 break 对应的题号，观察最终统计结果如何变化。
