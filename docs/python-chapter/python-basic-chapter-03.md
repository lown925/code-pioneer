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

学习目标：
- 能阅读并编写基础 Python 程序
- 能使用变量、常见数据类型和基础运算符
- 能完成输入、输出和简单数据处理
- 能阅读代码并判断程序的运行结果
- 能识别常见的 Python 基础语法错误
- 为后续学习条件判断、循环、函数和容器类型建立基础

---

# 第三章：输入、类型转换与格式化输出

章节简介：学习如何接收用户输入，将字符串转换为可计算的数字，并使用多种方式输出清晰、完整的信息。
预计学习时间：70 分钟

章节学习目标：
- 能使用 input() 接收用户输入
- 理解 input() 返回字符串
- 能使用 int()、float() 和 str() 完成基础类型转换
- 能识别常见类型错误
- 能使用 print() 输出多个值
- 能使用 f-string 生成清晰的格式化文本
- 能完成一个简单的交互式信息卡程序

---

## 课时 1：使用 input() 接收用户输入

课时简介：让程序不再只执行固定内容，而是能够接收用户输入。
预计学习时间：10 分钟

### 正文

[标题]
让程序和用户发生互动

[文本]
前两章中的程序大多使用提前写好的数据。现实应用通常需要接收用户输入，例如昵称、课程名称或计划学习时长。

Python 使用 input() 接收用户输入。

[代码 language=python]
nickname = input("请输入昵称：")
print(nickname)
[/代码]

[文本]
程序运行到 input() 时会暂停，显示提示文字并等待用户输入。用户输入的内容会被保存到变量 nickname 中。

[示例 title=接收课程名称]
说明：接收用户想学习的课程，再输出确认信息。
语言：python

course_name = input("请输入课程名称：")
print("你选择的课程是：", course_name)
[/示例]

[提示 title=提示文字不是必需的]
input() 可以不写提示文字，但实际程序中通常建议加入清楚的提示，帮助用户理解应该输入什么。

[警告 title=input() 只接收一行内容]
用户按下回车后，本次输入结束。后续如需继续输入，需要再次调用 input()。

### 课时题目

#### 题目 1

题型：SINGLE_CHOICE
题干：学习页面需要让用户输入想学习的课程名称。下面哪段代码可以正确完成该任务？

难度：EASY
分值：10
知识点：input、变量、字符串
是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：代码用途

选项：
- A. course_name = input("请输入课程名称：") [正确]
- B. course_name = print("请输入课程名称：")
- C. input = course_name
- D. course_name = "input"

解析：
input() 会等待用户输入，并把输入结果返回。将返回值赋给 course_name 后，程序才能保存用户输入。print() 只能输出内容，不会接收输入。

#### 题目 2

题型：FILL_BLANK
题干：程序需要接收用户输入的昵称。请补全函数名。

```python
nickname = ______("请输入昵称：")
```

难度：EASY
分值：10
知识点：input
是否用于 Battle：否

可接受答案：
- input

判题设置：
- 忽略大小写：否
- 忽略首尾空格：是
- 合并连续空格：是
- 最长字符数：20

解析：
Python 使用 input() 接收用户输入。函数名必须小写，不能写成 Input 或 INPUT。

#### 题目 3

题型：CODE_FILL
题干：课程页需要询问用户本次准备学习多少分钟，并先把输入内容保存到 study_minutes。请补全代码。

难度：EASY
分值：10
知识点：input、变量
是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：代码填空

题目代码：
```python
study_minutes = ______________________
print(study_minutes)
```

可接受答案：
```python
input("请输入学习分钟数：")
```

```python
input('请输入学习分钟数：')
```

```python
input()
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
input() 会接收用户输入，并把结果返回给变量 study_minutes。提示文字可以省略，因此 input() 也可接受。

标准完整代码：
```python
study_minutes = input("请输入学习分钟数：")
print(study_minutes)
```

---

## 课时 2：理解 input() 返回字符串

课时简介：理解为什么输入数字后仍然不能直接参与数学运算。
预计学习时间：10 分钟

### 正文

[标题]
输入数字，不代表得到数字类型

[文本]
用户在输入框中输入 20，看起来像整数，但 input() 返回的始终是字符串。

[代码 language=python]
age = input("请输入年龄：")
print(type(age))
[/代码]

[文本]
即使用户输入 18，age 的类型仍然是 str。

[标题]
字符串不能直接和整数相加

[代码 language=python]
score = input("请输入当前分数：")
print(score + 10)
[/代码]

[文本]
如果用户输入 90，这段程序会报错，因为 score 是字符串，而 10 是整数。Python 不知道应该把它们当作文字拼接，还是进行数学加法。

[警告 title=类型错误是初学阶段常见问题]
看到 TypeError 时，先检查参与运算的数据类型是否一致。

[示例 title=检查输入类型]
说明：先接收输入，再使用 type() 查看类型。
语言：python

question_count = input("请输入题目数量：")
print(type(question_count))
[/示例]

### 课时题目

#### 题目 4

题型：SINGLE_CHOICE
题干：用户在程序中输入 15。下面代码执行后，count 的类型是什么？

```python
count = input("请输入题目数量：")
```

难度：EASY
分值：10
知识点：input、str、数据类型
是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：代码阅读

选项：
- A. int
- B. float
- C. str [正确]
- D. bool

解析：
input() 返回的始终是字符串，因此即使用户输入 15，count 仍然是 str。

#### 题目 5

题型：SINGLE_CHOICE
题干：下面代码为什么可能报错？

```python
score = input("请输入分数：")
print(score + 10)
```

难度：MEDIUM
分值：10
知识点：input、类型错误、str、int
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：Bug 定位

选项：
- A. input() 不能显示提示文字
- B. score 是字符串，不能直接和整数 10 相加 [正确]
- C. print() 不能输出变量
- D. 变量名 score 不合法

解析：
input() 返回字符串，10 是整数。字符串和整数不能直接使用 + 运算，因此需要先把 score 转换为整数。

#### 题目 6

题型：FILL_BLANK
题干：用户输入 80 后，下面变量 score 的数据类型是 ______。

```python
score = input("请输入分数：")
```

难度：EASY
分值：10
知识点：input、str
是否用于 Battle：否

可接受答案：
- str
- 字符串

判题设置：
- 忽略大小写：是
- 忽略首尾空格：是
- 合并连续空格：是
- 最长字符数：30

解析：
input() 返回字符串，因此 score 的类型是 str，而不是 int。

---

## 课时 3：使用 int() 转换整数

课时简介：把数字字符串转换为整数，使输入数据能够参与计算。
预计学习时间：12 分钟

### 正文

[标题]
把数字字符串转换为整数

[文本]
如果用户输入的是整数内容，可以使用 int() 将字符串转换为整数。

[代码 language=python]
score_text = input("请输入分数：")
score = int(score_text)

print(score + 10)
[/代码]

[文本]
如果用户输入 90，score_text 是字符串 "90"，经过 int() 转换后，score 变成整数 90，因此可以进行数学运算。

[标题]
也可以直接转换输入结果

[代码 language=python]
question_count = int(input("请输入题目数量："))
print(question_count + 5)
[/代码]

[提示 title=先分两步写更适合初学者]
刚开始学习时，可以先保存输入字符串，再单独转换。这样更容易观察每一步的数据变化。

[警告 title=不能把任意文字转换为整数]
int("20") 可以成功，但 int("二十") 和 int("20.5") 会失败，因为它们不是标准整数字符串。

[示例 title=计算总分]
说明：接收答对题数，将其转换为整数，再计算得分。
语言：python

correct_text = input("请输入答对题数：")
correct_count = int(correct_text)
total_score = correct_count * 2

print(total_score)
[/示例]

### 课时题目

#### 题目 7

题型：SINGLE_CHOICE
题干：用户输入答对题数后，程序需要将其用于乘法计算。下面哪段代码正确？

难度：MEDIUM
分值：10
知识点：int、input、类型转换
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码用途

选项：
- A. correct_count = int(input("请输入答对题数：")) [正确]
- B. correct_count = str(input("请输入答对题数："))
- C. correct_count = print(input("请输入答对题数："))
- D. correct_count = bool(input("请输入答对题数："))

解析：
input() 返回字符串，int() 可以把标准整数字符串转换为整数，使 correct_count 能参与数学计算。

#### 题目 8

题型：CODE_FILL
题干：用户输入当前 Rating 后，程序需要将输入结果转换为整数，再增加 20 分。请补全转换代码。

难度：MEDIUM
分值：10
知识点：input、int、变量、加法
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码填空

题目代码：
```python
rating_text = input("请输入当前 Rating：")
rating = _____________

new_rating = rating + 20
print(new_rating)
```

可接受答案：
```python
int(rating_text)
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
rating_text 是字符串，必须使用 int(rating_text) 转换为整数后，才能与整数 20 相加。

标准完整代码：
```python
rating_text = input("请输入当前 Rating：")
rating = int(rating_text)

new_rating = rating + 20
print(new_rating)
```

#### 题目 9

题型：FILL_BLANK
题干：请填写把字符串 "25" 转换为整数的完整表达式。

```python
number = ______
```

难度：EASY
分值：10
知识点：int、类型转换
是否用于 Battle：否

可接受答案：
- int("25")
- int('25')

判题设置：
- 忽略大小写：否
- 忽略首尾空格：是
- 合并连续空格：否
- 最长字符数：50

解析：
int() 可以把标准整数字符串转换为整数，因此 int("25") 的结果是整数 25。

---

## 课时 4：使用 float() 和 str()

课时简介：学习浮点数转换和数字转字符串。
预计学习时间：12 分钟

### 正文

[标题]
使用 float() 转换小数

[文本]
当用户输入的数据可能包含小数时，应使用 float() 转换。

[代码 language=python]
accuracy_text = input("请输入正确率：")
accuracy = float(accuracy_text)

print(accuracy)
[/代码]

[文本]
如果用户输入 87.5，float() 会得到浮点数 87.5。

[标题]
使用 str() 转换为字符串

[文本]
str() 可以把整数、浮点数或布尔值转换为字符串。

[代码 language=python]
rating = 1000
rating_text = str(rating)

print(type(rating_text))
[/代码]

[文本]
转换后 rating_text 是字符串，可以用于文本拼接。

[示例 title=拼接课程进度]
说明：把整数进度转换为字符串，再与文字拼接。
语言：python

progress = 80
message = "当前进度：" + str(progress) + "%"

print(message)
[/示例]

[警告 title=字符串拼接要求参与者都是字符串]
"当前得分：" + 100 会报错，应写成 "当前得分：" + str(100)。

### 课时题目

#### 题目 10

题型：SINGLE_CHOICE
题干：用户输入正确率 92.5，程序需要保留小数。应该使用哪个转换函数？

难度：EASY
分值：10
知识点：float、类型转换
是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：代码用途

选项：
- A. int()
- B. float() [正确]
- C. bool()
- D. print()

解析：
92.5 含有小数部分，应使用 float() 转换。int() 适合标准整数字符串。

#### 题目 11

题型：CODE_FILL
题干：课程页面需要把整数进度 75 拼接到提示文字中。请补全代码，使程序输出“当前进度：75%”。

难度：MEDIUM
分值：10
知识点：str、字符串拼接、变量
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码填空

题目代码：
```python
progress = 75
message = "当前进度：" + __________ + "%"

print(message)
```

可接受答案：
```python
str(progress)
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
progress 是整数，不能直接和字符串使用 + 拼接。str(progress) 会把整数 75 转换为字符串 "75"。

标准完整代码：
```python
progress = 75
message = "当前进度：" + str(progress) + "%"

print(message)
```

#### 题目 12

题型：FILL_BLANK
题干：把浮点数字符串 "88.5" 转换为浮点数，应使用表达式 ______。

难度：EASY
分值：10
知识点：float、类型转换
是否用于 Battle：否

可接受答案：
- float("88.5")
- float('88.5')

判题设置：
- 忽略大小写：否
- 忽略首尾空格：是
- 合并连续空格：否
- 最长字符数：50

解析：
float() 可以把标准小数字符串转换为浮点数。

---

## 课时 5：使用 print() 输出多个值

课时简介：学习避免复杂拼接，直接输出多个变量。
预计学习时间：10 分钟

### 正文

[标题]
print() 可以一次输出多个内容

[文本]
print() 的括号中可以放多个值，值之间使用逗号分隔。

[代码 language=python]
nickname = "新手玩家"
rating = 1000

print("昵称：", nickname)
print("Rating：", rating)
[/代码]

[文本]
print() 会自动把多个值显示出来，并在它们之间加入空格。

[示例 title=输出学习记录]
说明：使用多个参数输出课程名称和学习分钟数。
语言：python

course_name = "Python 基础入门"
study_minutes = 30

print("课程：", course_name)
print("学习时长：", study_minutes, "分钟")
[/示例]

[提示 title=多个值输出不要求手动转换]
使用逗号分隔时，print() 可以同时输出字符串和整数，因此不必先使用 str()。

### 课时题目

#### 题目 13

题型：SINGLE_CHOICE
题干：下面哪段代码可以直接输出字符串和整数，而不需要先调用 str()？

难度：MEDIUM
分值：10
知识点：print、多参数输出
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码阅读

选项：
- A. print("得分：", 100) [正确]
- B. "得分：" + 100
- C. print + 100
- D. output("得分：", 100)

解析：
print() 可以接收多个参数，并自动显示不同类型的数据。B 会因为字符串和整数直接相加而报错。

#### 题目 14

题型：CODE_FILL
题干：学习记录页需要输出“学习时长：30 分钟”。请补全 print() 中缺少的变量。

难度：EASY
分值：10
知识点：print、多参数输出、变量
是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：代码填空

题目代码：
```python
study_minutes = 30
print("学习时长：", __________, "分钟")
```

可接受答案：
```python
study_minutes
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
变量 study_minutes 已保存整数 30。print() 支持输出多个不同类型的值，因此直接写变量名即可。

标准完整代码：
```python
study_minutes = 30
print("学习时长：", study_minutes, "分钟")
```

---

## 课时 6：使用 f-string 格式化输出

课时简介：学习用更清晰的方式把变量嵌入字符串。
预计学习时间：16 分钟

### 正文

[标题]
让输出语句更容易阅读

[文本]
当一条输出需要包含多个变量时，f-string 通常比字符串拼接更清晰。

[代码 language=python]
nickname = "新手玩家"
rating = 1000

print(f"玩家 {nickname} 的 Rating 是 {rating}")
[/代码]

[文本]
字符串前面的 f 表示这是一个格式化字符串。大括号中的变量会被替换成变量当前保存的值。

[示例 title=输出学习进度]
说明：把课程名称和进度放入同一条字符串。
语言：python

course_name = "Python 基础入门"
progress = 60

print(f"课程：{course_name}，当前进度：{progress}%")
[/示例]

[标题]
大括号中也可以放简单表达式

[代码 language=python]
correct_count = 6
score_per_question = 2

print(f"本场得分：{correct_count * score_per_question}")
[/代码]

[文本]
程序会先计算大括号中的表达式，再把结果放入字符串。

[警告 title=不要忘记字符串前的 f]
如果没有 f，字符串中的 {rating} 不会自动替换为变量值。

### 课时题目

#### 题目 15

题型：SINGLE_CHOICE
题干：下面哪段代码可以输出“当前 Rating：1000”？

难度：MEDIUM
分值：10
知识点：f-string、变量、格式化输出
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码阅读

选项：
- A. rating = 1000; print(f"当前 Rating：{rating}") [正确]
- B. rating = 1000; print("当前 Rating：{rating}")
- C. rating = 1000; print("当前 Rating：" + rating)
- D. rating = 1000; output(f"当前 Rating：{rating}")

解析：
f-string 需要在字符串前加 f，并使用大括号包裹变量。B 缺少 f；C 直接拼接字符串和整数会报错。

#### 题目 16

题型：FILL_BLANK
题干：f-string 中，用于放置变量或表达式的是 ______。

难度：EASY
分值：10
知识点：f-string、大括号
是否用于 Battle：否

可接受答案：
- 大括号
- {}
- 花括号

判题设置：
- 忽略大小写：是
- 忽略首尾空格：是
- 合并连续空格：是
- 最长字符数：30

解析：
f-string 使用大括号 {} 包裹变量或表达式，运行时会把它们替换为实际值。

#### 题目 17

题型：CODE_FILL
题干：对局结束后，需要显示玩家答对题数。请补全 f-string，使程序输出“答对题数：8”。

难度：MEDIUM
分值：10
知识点：f-string、变量、格式化输出
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码填空

题目代码：
```python
correct_count = 8
print(f"答对题数：{____________}")
```

可接受答案：
```python
correct_count
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
f-string 的大括号中应填写变量名 correct_count，程序会将它替换为变量当前值 8。

标准完整代码：
```python
correct_count = 8
print(f"答对题数：{correct_count}")
```

#### 题目 18

题型：SINGLE_CHOICE
题干：阅读代码，程序会输出什么？

```python
correct_count = 5
score_per_question = 2
print(f"最终得分：{correct_count * score_per_question}")
```

难度：MEDIUM
分值：10
知识点：f-string、表达式、乘法
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：输出预测

选项：
- A. 最终得分：5
- B. 最终得分：2
- C. 最终得分：10 [正确]
- D. 最终得分：correct_count * score_per_question

解析：
f-string 会先计算大括号中的表达式。5 × 2 等于 10，因此输出“最终得分：10”。

---

## 第三章总结

[标题]
你已经能够处理用户输入

[文本]
本章学习了程序与用户交互时最重要的几个基础能力：

- 使用 input() 接收输入
- 理解 input() 返回字符串
- 使用 int() 把整数字符串转换为整数
- 使用 float() 把小数字符串转换为浮点数
- 使用 str() 把其他类型转换为字符串
- 使用 print() 输出多个值
- 使用 f-string 将变量和表达式嵌入文本

下一章将学习运算符与表达式，包括更多算术运算、比较运算和逻辑运算，为条件判断做好准备。

---

## 第三章综合挑战（不计分）

[标题]
制作交互式 Battle 结算卡

[文本]
请编写一个程序：

1. 输入玩家昵称
2. 输入答对题数
3. 将答对题数转换为整数
4. 按每题 2 分计算总分
5. 使用 f-string 输出结算信息

参考效果：

[代码 language=text]
请输入昵称：新手玩家
请输入答对题数：6
玩家：新手玩家
答对题数：6
最终得分：12
[/代码]

参考代码：

[代码 language=python]
nickname = input("请输入昵称：")
correct_text = input("请输入答对题数：")
correct_count = int(correct_text)

score_per_question = 2
total_score = correct_count * score_per_question

print(f"玩家：{nickname}")
print(f"答对题数：{correct_count}")
print(f"最终得分：{total_score}")
[/代码]

[文本]
尝试修改每题分数，并观察最终得分是否随之改变。
