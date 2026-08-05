# 课程信息

课程名称：Python 基础入门
课程标识：python-basic
课程分类：BACKEND
编程语言：Python
难度：BEGINNER
预计学习时间：720 分钟
课程简介：面向零基础学习者的 Python 基础课程，通过短小讲解、可运行示例和场景化题目，帮助学习者掌握基础语法并服务于后续 Battle 学习。
适合人群：没有编程基础、希望从零开始学习 Python 的学生。
课程封面：
发布状态：PUBLISHED

学习目标：
- 理解变量的作用
- 能区分 int、float、str、bool
- 能正确创建、读取和更新变量
- 能使用 type() 查看数据类型
- 能阅读简单代码并判断最终结果

---

# 第二章：变量与基础数据类型

章节简介：进一步理解变量的作用，学习变量命名、重新赋值，以及整数、浮点数、字符串和布尔值四种基础数据类型。
预计学习时间：60 分钟

---

## 课时 1：变量用于保存数据

课时简介：理解变量的基本作用，学习赋值和读取变量。
预计学习时间：10 分钟

### 正文

[标题]
变量像一个带标签的盒子

[文本]
程序经常需要保存数据，例如课程名称、当前分数或是否在线。变量就是用于保存这些数据的名称。变量名像盒子的标签，变量值像盒子中的内容。

[代码 language=python]
nickname = "小码"
print(nickname)
[/代码]

[文本]
第一行把字符串“小码”保存到变量 nickname 中，第二行读取 nickname 当前保存的值并输出。等号 = 在这里表示赋值，即把右侧的数据保存到左侧变量中。

[示例 title=保存课程名称]
说明：把课程名称保存到变量中，再输出变量。
语言：python

course_name = "Python 基础入门"
print(course_name)
[/示例]

[提示 title=变量名应表达用途]
nickname 比 a 更容易理解，course_name 比 x 更能说明数据用途。

### 课时题目

#### 题目 1

题型：SINGLE_CHOICE
题干：学习页面需要保存当前课程名称。下面哪段代码最合适？
难度：EASY
分值：10
知识点：变量、赋值、字符串
是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：代码用途

选项：
- A. course_name = "Python 基础入门" [正确]
- B. "Python 基础入门" = course_name
- C. print = "Python 基础入门"
- D. course-name = "Python 基础入门"

解析：
赋值语句应把变量名写在等号左侧，把数据写在右侧，因此 A 正确。B 的赋值方向错误；C 会覆盖内置函数名 print；D 中的减号会被当作运算符。

#### 题目 2

题型：FILL_BLANK
题干：课程页面需要保存章节标题“变量与基础数据类型”。请补全变量保存的数据。

```python
chapter_title = ______
```

难度：EASY
分值：10
知识点：变量、字符串、赋值
是否用于 Battle：否

可接受答案：
- "变量与基础数据类型"
- '变量与基础数据类型'

判题设置：
- 忽略大小写：否
- 忽略首尾空格：是
- 合并连续空格：否

解析：
章节标题属于文本，应使用英文单引号或双引号包裹，保存为字符串。

#### 题目 3

题型：CODE_FILL
题干：学习页面需要显示当前课程名称。请补全代码，将“Python 基础入门”保存到变量 course_name，并输出该变量。
难度：EASY
分值：10
知识点：变量、赋值、print、字符串
是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：代码填空

题目代码：
```python
course_name = __________
print(course_name)
```

可接受答案：
```python
"Python 基础入门"
```

```python
'Python 基础入门'
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是

解析：
课程名称是文本，因此应使用引号包裹并保存为字符串。print(course_name) 会输出变量保存的内容。

标准完整代码：
```python
course_name = "Python 基础入门"
print(course_name)
```

---

## 课时 2：变量可以重新赋值

课时简介：学习更新变量值，并理解程序使用变量当前保存的数据。
预计学习时间：10 分钟

### 正文

[标题]
变量中的数据可以更新

[文本]
程序运行过程中，数据可能发生变化。例如玩家完成一场对局后，积分可能增加；用户切换课程后，当前课程名称也会变化。

[代码 language=python]
rating = 1000
rating = 1020
print(rating)
[/代码]

[文本]
rating 先保存 1000，随后被更新为 1020。print(rating) 输出变量当前保存的最终值，因此结果是 1020。

[示例 title=更新章节进度]
说明：变量 progress 先保存旧进度，再更新为新进度。
语言：python

progress = 20
progress = 40
print(progress)
[/示例]

[警告 title=变量只保存当前值]
普通变量重新赋值后，后续读取的是新值，不会同时输出旧值和新值。

### 课时题目

#### 题目 4

题型：SINGLE_CHOICE
题干：课程进度更新后，下面程序会输出什么？

```python
progress = 25
progress = 50
print(progress)
```

难度：EASY
分值：10
知识点：变量、重新赋值、程序输出
是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：输出预测

选项：
- A. 25
- B. 50 [正确]
- C. 25 和 50
- D. progress

解析：
progress 第二次被赋值为 50，旧值 25 被替换，因此最终输出 50。

#### 题目 5

题型：FILL_BLANK
题干：阅读代码，填写最终输出结果。

```python
status = "学习中"
status = "已完成"
print(status)
```

输出：______

难度：EASY
分值：10
知识点：变量、重新赋值、字符串
是否用于 Battle：否

可接受答案：
- 已完成

解析：
status 最后一次被赋值为“已完成”，因此 print(status) 输出“已完成”。

#### 题目 6

题型：CODE_FILL
题干：玩家当前积分为 1000，完成对局后积分更新为 1025。请补全代码，使程序最终输出 1025。
难度：MEDIUM
分值：10
知识点：变量、重新赋值、print
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码填空

题目代码：
```python
rating = 1000
rating = ______
print(rating)
```

可接受答案：
```python
1025
```

解析：
第二次赋值会更新 rating 当前保存的数据。把 1025 赋给 rating 后，print(rating) 输出 1025。

标准完整代码：
```python
rating = 1000
rating = 1025
print(rating)
```

---

## 课时 3：变量命名规则

课时简介：学习合法变量名、常见错误和有意义的命名方式。
预计学习时间：10 分钟

### 正文

[标题]
变量名不能随意书写

[文本]
变量名可以包含英文字母、数字和下划线，但不能以数字开头，也不能包含减号、空格等特殊符号。

[代码 language=python]
player_name = "小码"
score2 = 80
course_title = "Python"
[/代码]

[文本]
下面的写法不合法：

[代码 language=python]
2score = 80
player-name = "小码"
course title = "Python"
[/代码]

[标题]
不要使用 Python 关键字

[文本]
class、if、for 等词在 Python 中具有特殊作用，不能直接作为普通变量名。

[提示 title=推荐命名风格]
Python 常用小写字母和下划线组成变量名，例如 player_name、battle_score、course_title。

### 课时题目

#### 题目 7

题型：SINGLE_CHOICE
题干：系统需要保存当前章节编号。下面哪个变量名可以正常使用？
难度：MEDIUM
分值：10
知识点：变量命名
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码纠错

选项：
- A. chapter_number [正确]
- B. 2chapter
- C. chapter-number
- D. chapter number

解析：
chapter_number 由字母和下划线组成，符合规则。其他选项分别存在数字开头、减号或空格问题。

#### 题目 8

题型：FILL_BLANK
题干：为了保存玩家总得分，请写出一个清晰、符合 Python 命名习惯的变量名。
难度：MEDIUM
分值：10
知识点：变量命名、snake_case
是否用于 Battle：否

可接受答案：
- total_score
- battle_score
- player_score

解析：
变量名应表达实际用途。以上名称都能清楚说明变量保存的是得分。

---

## 课时 4：整数与浮点数

课时简介：认识 int 和 float，并区分整数与带小数的数据。
预计学习时间：10 分钟

### 正文

[标题]
整数 int

[文本]
没有小数部分的数字属于整数 int，例如题目数量、章节编号和玩家积分。

[代码 language=python]
question_count = 20
chapter_number = 2
rating = 1000
[/代码]

[标题]
浮点数 float

[文本]
带小数部分的数字属于浮点数 float，例如正确率、平均分和课程时长。

[代码 language=python]
accuracy = 87.5
average_score = 76.25
study_hours = 1.5
[/代码]

[警告 title=引号会改变类型]
1000 是整数，而 "1000" 是字符串。是否使用引号会影响数据类型。

### 课时题目

#### 题目 9

题型：SINGLE_CHOICE
题干：系统需要保存一场对局的正确率 87.5。下面哪种类型最合适？
难度：EASY
分值：10
知识点：float、数据类型
是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：代码用途

选项：
- A. int
- B. float [正确]
- C. bool
- D. str

解析：
87.5 包含小数部分，应使用 float。

#### 题目 10

题型：SINGLE_CHOICE
题干：下面哪个变量保存的是整数，而不是字符串或浮点数？
难度：MEDIUM
分值：10
知识点：int、str、float
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码阅读

选项：
- A. score = 100 [正确]
- B. score = "100"
- C. score = 100.0
- D. score = True

解析：
100 没有引号也没有小数点，因此是整数 int。

#### 题目 11

题型：CODE_FILL
题干：课程页面需要保存预计学习时间 1.5 小时。请补全代码并输出该值。
难度：EASY
分值：10
知识点：float、变量、print
是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：代码填空

题目代码：
```python
study_hours = ______
print(study_hours)
```

可接受答案：
```python
1.5
```

解析：
1.5 带有小数部分，应直接以浮点数形式保存，不需要引号。

标准完整代码：
```python
study_hours = 1.5
print(study_hours)
```

---

## 课时 5：字符串与布尔值

课时简介：认识 str 和 bool，并理解文本与真假状态的区别。
预计学习时间：10 分钟

### 正文

[标题]
字符串 str

[文本]
字符串用于保存文字内容，需要使用英文单引号或双引号包裹。

[代码 language=python]
nickname = "小码"
course_name = "Python 基础入门"
room_code = "A7K9Q2"
[/代码]

[标题]
布尔值 bool

[文本]
布尔值用于表示真假状态，只有 True 和 False 两个值。

[代码 language=python]
is_online = True
battle_finished = False
[/代码]

[警告 title=布尔值不要加引号]
True 是布尔值，而 "True" 是字符串。两者含义不同。

### 课时题目

#### 题目 12

题型：SINGLE_CHOICE
题干：系统需要记录“对局是否已经结束”。下面哪种写法最合适？
难度：EASY
分值：10
知识点：bool、True、False
是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：代码用途

选项：
- A. battle_finished = False [正确]
- B. battle_finished = "False"
- C. battle_finished = 0.0
- D. battle_finished = "未结束"

解析：
“是否结束”只有真或假两种状态，适合使用 bool。False 表示尚未结束。

#### 题目 13

题型：FILL_BLANK
题干：用户当前处于在线状态。请填写合适的 Python 布尔值。

```python
is_online = ______
```

难度：EASY
分值：10
知识点：bool、True
是否用于 Battle：否

可接受答案：
- True

解析：
在线状态为真，因此应填写 Python 布尔值 True。首字母必须大写，也不能添加引号。

#### 题目 14

题型：CODE_FILL
题干：好友房当前还没有满员。请补全代码，将房间满员状态保存为布尔值并输出。
难度：EASY
分值：10
知识点：bool、False、变量、print
是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：代码填空

题目代码：
```python
is_full = ______
print(is_full)
```

可接受答案：
```python
False
```

解析：
房间没有满员，因此该状态为假，应使用布尔值 False。不能写成 "False"，否则会变成字符串。

标准完整代码：
```python
is_full = False
print(is_full)
```

---

## 课时 6：使用 type() 查看数据类型

课时简介：学习使用 type() 检查变量保存的数据类型。
预计学习时间：10 分钟

### 正文

[标题]
为什么要查看数据类型

[文本]
当程序出现计算或拼接错误时，确认数据类型通常能帮助定位问题。Python 使用 type() 查看一个值或变量的数据类型。

[代码 language=python]
rating = 1000
print(type(rating))
[/代码]

[代码 language=python]
nickname = "小码"
print(type(nickname))
[/代码]

[提示 title=type() 适合调试]
不确定变量类型时，可以临时使用 print(type(variable)) 检查。

### 课时题目

#### 题目 15

题型：SINGLE_CHOICE
题干：下面程序中的 course_name 属于什么类型？

```python
course_name = "Python 基础入门"
print(type(course_name))
```

难度：EASY
分值：10
知识点：type、str
是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：代码阅读

选项：
- A. int
- B. float
- C. str [正确]
- D. bool

解析：
course_name 的值被引号包裹，因此是字符串 str。

#### 题目 16

题型：FILL_BLANK
题干：Python 中用于查看变量数据类型的内置函数是 ______。
难度：EASY
分值：10
知识点：type
是否用于 Battle：否

可接受答案：
- type
- type()

解析：
type() 用于查看值或变量的数据类型。

#### 题目 17

题型：CODE_FILL
题干：调试学习进度程序时，需要查看 progress 的数据类型。请补全代码，使程序输出 progress 的类型信息。
难度：MEDIUM
分值：10
知识点：type、print、变量
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码填空

题目代码：
```python
progress = 75
print(____________)
```

可接受答案：
```python
type(progress)
```

解析：
type(progress) 会返回变量 progress 当前保存的数据类型，再由 print() 输出该类型信息。

标准完整代码：
```python
progress = 75
print(type(progress))
```

#### 题目 18

题型：SINGLE_CHOICE
题干：阅读代码，下面哪项描述正确？

```python
value = 100
value = "Python"
print(type(value))
```

难度：MEDIUM
分值：10
知识点：动态类型、重新赋值、type
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码分析

选项：
- A. value 最终是 int
- B. value 最终是 str [正确]
- C. 第二次赋值一定报错
- D. value 同时是 int 和 str

解析：
Python 允许同一个变量重新保存不同类型的数据。第二次赋值后，value 当前保存字符串 "Python"，因此最终类型是 str。

---

## 第二章总结

[标题]
你已经能够正确保存不同类型的数据

[文本]
本章学习了变量保存和更新数据的方式，以及四种常见基础数据类型：

- int：整数
- float：浮点数
- str：字符串
- bool：布尔值

你还学习了合法变量名、重新赋值和 type() 类型检查。

下一章将学习 input()、类型转换和格式化输出，让程序能够把用户输入的文字转换成可计算的数据。

---

## 第二章综合挑战（不计分）

[标题]
制作玩家资料卡

[文本]
请创建四个变量，分别保存玩家昵称、当前 Rating、对局正确率和是否在线，然后依次输出这些变量及其数据类型。

[代码 language=python]
nickname = "新手玩家"
rating = 1000
accuracy = 82.5
is_online = True

print(nickname, type(nickname))
print(rating, type(rating))
print(accuracy, type(accuracy))
print(is_online, type(is_online))
[/代码]

[文本]
尝试修改其中一个变量的值，并再次运行程序，观察输出结果是否随之变化。
