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

# 第十章：函数

章节简介：学习定义和调用函数，掌握参数、返回值、默认参数、关键字参数和变量作用域，并能够将重复代码封装成可复用功能。
预计学习时间：100 分钟

章节学习目标：
- 理解函数用于封装和复用代码
- 能使用 def 定义函数
- 能正确调用函数
- 能使用位置参数和关键字参数
- 能设置默认参数
- 能使用 return 返回结果
- 能区分 return 和 print()
- 能理解局部变量与全局变量的基本区别
- 能编写职责清晰的小函数
- 能阅读函数调用代码并判断执行结果
- 能使用函数重构重复逻辑

---

## 课时 1：为什么需要函数

课时简介：理解函数的用途，学习定义并调用最简单的函数。
预计学习时间：15 分钟

### 正文

[标题]
函数可以把一段代码包装起来

[文本]
程序中经常会重复执行相同任务，例如显示欢迎语、计算得分或检查资格。

如果每次都重复写相同代码，程序会变得冗长，也不方便修改。

[代码 language=python]
print("欢迎来到码站先锋")
print("请选择学习或 Battle")

print("欢迎来到码站先锋")
print("请选择学习或 Battle")
[/代码]

[文本]
可以把这段重复代码封装成函数。

[代码 language=python]
def show_welcome():
    print("欢迎来到码站先锋")
    print("请选择学习或 Battle")
[/代码]

[文本]
def 用于定义函数，show_welcome 是函数名，括号用于放置参数，冒号后面是函数代码块。

定义函数不会立即执行其中代码。要运行函数，需要调用它。

[代码 language=python]
show_welcome()
show_welcome()
[/代码]

[文本]
每调用一次，函数中的代码就执行一次。

[标题]
函数命名应表达用途

[文本]
推荐使用小写字母和下划线命名函数，例如：

- show_welcome
- calculate_score
- check_permission
- format_course_title

[示例 title=封装开始提示]
说明：定义并调用一个显示对局开始提示的函数。
语言：python

def show_battle_start():
    print("匹配成功")
    print("对局即将开始")

show_battle_start()
[/示例]

[提示 title=先定义，再调用]
程序执行到函数调用时，函数通常必须已经完成定义。

[警告 title=不要忘记括号]
show_welcome 表示函数对象本身，show_welcome() 才表示调用函数。

### 课时题目

#### 题目 1

题型：SINGLE_CHOICE
题干：下面哪段代码正确定义了一个名为 show_message 的函数？

难度：EASY
分值：10
知识点：def、函数定义、语法
是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：代码纠错

选项：
- A. def show_message(): [正确]
- B. function show_message():
- C. show_message def():
- D. def = show_message()

解析：
Python 使用 def 关键字定义函数，后面依次写函数名、括号和冒号，因此 A 正确。

#### 题目 2

题型：FILL_BLANK
题干：Python 中用于定义函数的关键字是 ______。

难度：EASY
分值：10
知识点：def、函数定义
是否用于 Battle：否

可接受答案：
- def

判题设置：
- 忽略大小写：否
- 忽略首尾空格：是
- 合并连续空格：是
- 最长字符数：20

解析：
Python 使用 def 关键字定义函数。

#### 题目 3

题型：CODE_FILL
题干：系统需要多次显示“开始答题”。请补全代码，调用已经定义好的函数。

难度：EASY
分值：10
知识点：函数调用、括号
是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：代码填空

题目代码：
```python
def show_start():
    print("开始答题")

__________
```

可接受答案：
```python
show_start()
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
调用函数时需要写函数名和括号，因此应使用 show_start()。

标准完整代码：
```python
def show_start():
    print("开始答题")

show_start()
```

---

## 课时 2：参数让函数处理不同数据

课时简介：学习定义参数并向函数传入不同数据。
预计学习时间：17 分钟

### 正文

[标题]
没有参数的函数只能处理固定内容

[代码 language=python]
def greet():
    print("你好，新手玩家")
[/代码]

[文本]
如果需要向不同用户问好，不应为每个昵称分别写一个函数。可以通过参数把数据传入函数。

[代码 language=python]
def greet(nickname):
    print(f"你好，{nickname}")

greet("新手玩家")
greet("Python 学员")
[/代码]

[文本]
nickname 是形参，表示函数定义时预留的数据位置。

调用函数时传入的 "新手玩家" 和 "Python 学员" 是实参。

[标题]
函数可以接收多个参数

[代码 language=python]
def show_result(correct_count, wrong_count):
    print(f"正确：{correct_count}")
    print(f"错误：{wrong_count}")

show_result(8, 2)
[/代码]

[文本]
多个参数之间使用英文逗号分隔。调用时，实参默认按位置依次对应参数。

[示例 title=显示课程进度]
说明：把课程名称和进度传入函数。
语言：python

def show_progress(course_name, progress):
    print(f"{course_name}：{progress}%")

show_progress("Python 基础入门", 60)
[/示例]

[警告 title=参数数量需要匹配]
函数定义两个必填参数时，调用时通常也需要提供两个实参，否则会报错。

### 课时题目

#### 题目 4

题型：SINGLE_CHOICE
题干：下面程序会输出什么？

```python
def greet(name):
    print(f"你好，{name}")

greet("Python 学员")
```

难度：EASY
分值：10
知识点：参数、函数调用、f-string
是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：输出预测

选项：
- A. 你好，name
- B. 你好，Python 学员 [正确]
- C. Python 学员
- D. 程序没有输出

解析：
调用 greet() 时传入字符串 "Python 学员"，它会赋给参数 name，因此输出“你好，Python 学员”。

#### 题目 5

题型：FILL_BLANK
题干：函数定义时括号中的 nickname，在函数术语中通常称为 ______。

难度：EASY
分值：10
知识点：形参、函数参数
是否用于 Battle：否

可接受答案：
- 形参
- 参数
- formal parameter
- parameter

判题设置：
- 忽略大小写：是
- 忽略首尾空格：是
- 合并连续空格：是
- 最长字符数：30

解析：
函数定义时写出的参数通常称为形式参数，简称形参。

#### 题目 6

题型：CODE_FILL
题干：函数 show_score 需要接收答对题数和每题分数。请补全调用代码，使函数输出 12。

难度：MEDIUM
分值：10
知识点：函数参数、位置参数、乘法
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码填空

题目代码：
```python
def show_score(correct_count, score_per_question):
    print(correct_count * score_per_question)

show_score(______, ______)
```

可接受答案：
```python
6, 2
```

```python
6,2
```

```python
4, 3
```

```python
4,3
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
只要两个实参相乘等于 12 即可。示例 6 和 2 会分别赋给 correct_count 和 score_per_question。

标准完整代码：
```python
def show_score(correct_count, score_per_question):
    print(correct_count * score_per_question)

show_score(6, 2)
```

---

## 课时 3：使用 return 返回结果

课时简介：学习让函数把计算结果交给调用者。
预计学习时间：18 分钟

### 正文

[标题]
print() 只负责显示，return 负责返回结果

[代码 language=python]
def calculate_score(correct_count, score_per_question):
    total_score = correct_count * score_per_question
    print(total_score)
[/代码]

[文本]
这个函数可以显示得分，但调用者不能方便地把结果保存下来继续计算。

使用 return 可以把结果返回。

[代码 language=python]
def calculate_score(correct_count, score_per_question):
    total_score = correct_count * score_per_question
    return total_score

score = calculate_score(6, 2)
print(score)
[/代码]

[文本]
函数执行到 return 时，会把 total_score 的值返回给调用位置。返回值被保存到变量 score 中。

[标题]
return 会结束当前函数

[代码 language=python]
def check_score(score):
    if score < 0:
        return "无效分数"

    return "有效分数"
[/代码]

[文本]
执行 return 后，函数立即结束，后面的代码不会继续执行。

[标题]
没有 return 时默认返回 None

[代码 language=python]
def show_message():
    print("学习中")

result = show_message()
print(result)
[/代码]

[文本]
函数只执行了 print()，没有 return，因此 result 的值是 None。

[示例 title=计算 Battle 最终分]
说明：根据正确数和错误数返回最终分数。
语言：python

def calculate_battle_score(correct_count, wrong_count):
    return correct_count * 2 - wrong_count

final_score = calculate_battle_score(8, 3)
print(final_score)
[/示例]

[提示 title=计算型函数通常更适合 return]
如果函数的结果还需要用于比较、保存或进一步计算，应该优先返回结果，而不是只打印。

### 课时题目

#### 题目 7

题型：SINGLE_CHOICE
题干：下面程序最终会输出什么？

```python
def add(a, b):
    return a + b

result = add(3, 5)
print(result)
```

难度：EASY
分值：10
知识点：return、返回值、函数调用
是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：输出预测

选项：
- A. 3
- B. 5
- C. 8 [正确]
- D. None

解析：
add(3, 5) 返回 3 + 5 的结果 8，变量 result 保存 8，因此最终输出 8。

#### 题目 8

题型：FILL_BLANK
题干：函数使用关键字 ______ 把结果返回给调用者。

难度：EASY
分值：10
知识点：return、返回值
是否用于 Battle：否

可接受答案：
- return

判题设置：
- 忽略大小写：否
- 忽略首尾空格：是
- 合并连续空格：是
- 最长字符数：20

解析：
return 用于结束当前函数并把指定结果返回给调用位置。

#### 题目 9

题型：CODE_FILL
题干：函数需要计算答对 7 题、每题 2 分的总分，并把结果返回。请补全 return 语句。

难度：MEDIUM
分值：10
知识点：return、函数计算、参数
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码填空

题目代码：
```python
def calculate_score(correct_count, score_per_question):
    return __________________________________

score = calculate_score(7, 2)
print(score)
```

可接受答案：
```python
correct_count * score_per_question
```

```python
score_per_question * correct_count
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
总分等于答对题数乘以每题分数，因此应返回两个参数的乘积。

标准完整代码：
```python
def calculate_score(correct_count, score_per_question):
    return correct_count * score_per_question

score = calculate_score(7, 2)
print(score)
```

---

## 课时 4：默认参数与关键字参数

课时简介：学习为参数设置默认值，并在调用时明确指定参数名称。
预计学习时间：17 分钟

### 正文

[标题]
默认参数可以减少重复传值

[代码 language=python]
def calculate_score(correct_count, score_per_question=2):
    return correct_count * score_per_question

print(calculate_score(6))
print(calculate_score(6, 3))
[/代码]

[文本]
score_per_question 默认值为 2。调用时如果只传 correct_count，就使用默认值；如果传入第二个实参，则覆盖默认值。

[标题]
有默认值的参数通常放在后面

[代码 language=python]
def show_course(course_name, progress=0):
    print(f"{course_name}：{progress}%")
[/代码]

[文本]
必填参数 course_name 放在前面，默认参数 progress 放在后面。

[标题]
关键字参数可以明确指定含义

[代码 language=python]
def show_result(correct_count, wrong_count):
    print(correct_count, wrong_count)

show_result(wrong_count=2, correct_count=8)
[/代码]

[文本]
使用参数名传值时，顺序可以调整，也更容易看懂每个数据的含义。

[示例 title=生成课程摘要]
说明：学习进度默认从 0 开始。
语言：python

def build_course_summary(course_name, progress=0):
    return f"{course_name}：{progress}%"

print(build_course_summary("Python 基础入门"))
print(build_course_summary("Python 基础入门", progress=60))
[/示例]

[警告 title=默认参数应放在必填参数之后]
像 def func(a=1, b): 这样的定义是不合法的，因为必填参数 b 出现在默认参数之后。

### 课时题目

#### 题目 10

题型：SINGLE_CHOICE
题干：下面程序会输出什么？

```python
def calculate_score(correct_count, score_per_question=2):
    return correct_count * score_per_question

print(calculate_score(5))
```

难度：MEDIUM
分值：10
知识点：默认参数、返回值
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：输出预测

选项：
- A. 2
- B. 5
- C. 7
- D. 10 [正确]

解析：
调用时没有传入 score_per_question，因此使用默认值 2，结果是 5 × 2 = 10。

#### 题目 11

题型：FILL_BLANK
题干：调用函数时使用“参数名=值”的方式传参，这种参数通常称为 ______ 参数。

难度：EASY
分值：10
知识点：关键字参数
是否用于 Battle：否

可接受答案：
- 关键字
- 关键字参数
- keyword
- keyword argument

判题设置：
- 忽略大小写：是
- 忽略首尾空格：是
- 合并连续空格：是
- 最长字符数：30

解析：
使用参数名明确传值的方式称为关键字参数。

#### 题目 12

题型：CODE_FILL
题干：函数中的 progress 默认值应为 0。请补全参数定义。

难度：MEDIUM
分值：10
知识点：默认参数、函数定义
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码填空

题目代码：
```python
def show_progress(course_name, progress=____):
    print(f"{course_name}：{progress}%")

show_progress("Python 基础入门")
```

可接受答案：
```python
0
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
progress=0 表示调用函数时未传入 progress，就使用默认值 0。

标准完整代码：
```python
def show_progress(course_name, progress=0):
    print(f"{course_name}：{progress}%")

show_progress("Python 基础入门")
```

---

## 课时 5：局部变量与作用域

课时简介：理解函数内部变量和函数外部变量的可见范围。
预计学习时间：17 分钟

### 正文

[标题]
函数内部创建的变量通常是局部变量

[代码 language=python]
def calculate_score():
    total_score = 20
    print(total_score)

calculate_score()
[/代码]

[文本]
total_score 在函数内部创建，通常只能在该函数内部使用。

下面的代码会报错：

[代码 language=python]
def calculate_score():
    total_score = 20

calculate_score()
print(total_score)
[/代码]

[文本]
函数外部无法直接访问局部变量 total_score。

[标题]
函数外部创建的变量是全局变量

[代码 language=python]
score_per_question = 2

def calculate_score(correct_count):
    return correct_count * score_per_question

print(calculate_score(6))
[/代码]

[文本]
函数可以读取外部变量。但为了让函数更清晰、更容易测试，通常更推荐把所需数据作为参数传入。

[标题]
局部变量可以和外部变量同名

[代码 language=python]
score = 100

def show_score():
    score = 20
    print(score)

show_score()
print(score)
[/代码]

[文本]
函数内部的 score 是局部变量，函数外部的 score 是另一个变量，因此输出 20 和 100。

[示例 title=通过参数减少全局依赖]
说明：把每题分数作为参数传入函数。
语言：python

def calculate_score(correct_count, score_per_question):
    total_score = correct_count * score_per_question
    return total_score

print(calculate_score(8, 2))
[/示例]

[提示 title=优先使用参数和返回值]
初学阶段应尽量避免在函数中随意修改全局变量。参数和返回值能让数据流更清楚。

### 课时题目

#### 题目 13

题型：SINGLE_CHOICE
题干：下面程序会依次输出什么？

```python
score = 100

def show_score():
    score = 20
    print(score)

show_score()
print(score)
```

难度：MEDIUM
分值：10
知识点：局部变量、全局变量、作用域
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：输出预测

选项：
- A. 20、100 [正确]
- B. 100、20
- C. 20、20
- D. 100、100

解析：
函数内部的 score 是局部变量，值为 20；函数外部的 score 保持 100。因此先输出 20，再输出 100。

#### 题目 14

题型：FILL_BLANK
题干：在函数内部创建、通常只能在该函数内部使用的变量称为 ______ 变量。

难度：EASY
分值：10
知识点：局部变量、作用域
是否用于 Battle：否

可接受答案：
- 局部
- 局部变量
- local
- local variable

判题设置：
- 忽略大小写：是
- 忽略首尾空格：是
- 合并连续空格：是
- 最长字符数：30

解析：
函数内部创建且只在函数内部有效的变量称为局部变量。

#### 题目 15

题型：CODE_FILL
题干：为了避免依赖外部变量，请把每题分数作为参数传入函数。补全参数列表。

难度：MEDIUM
分值：10
知识点：参数、作用域、函数设计
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码填空

题目代码：
```python
def calculate_score(correct_count, __________________):
    return correct_count * score_per_question

print(calculate_score(6, 2))
```

可接受答案：
```python
score_per_question
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
函数体中使用了 score_per_question，因此应把它放入参数列表，由调用者传入。

标准完整代码：
```python
def calculate_score(correct_count, score_per_question):
    return correct_count * score_per_question

print(calculate_score(6, 2))
```

---

## 课时 6：拆分职责与综合应用

课时简介：学习把较长流程拆分成多个职责单一的函数。
预计学习时间：16 分钟

### 正文

[标题]
一个函数尽量只做一件清楚的事

[文本]
下面的代码同时计算得分、判断结果并输出信息，功能都挤在一起。

[代码 language=python]
correct_count = 8
wrong_count = 2
score = correct_count * 2 - wrong_count

if score >= 10:
    result = "胜利"
else:
    result = "失败"

print(score)
print(result)
[/代码]

[文本]
可以把不同职责拆成函数。

[代码 language=python]
def calculate_score(correct_count, wrong_count):
    return correct_count * 2 - wrong_count

def determine_result(score):
    if score >= 10:
        return "胜利"
    return "失败"

def show_result(score, result):
    print(f"最终得分：{score}")
    print(f"对局结果：{result}")
[/代码]

[文本]
拆分后，每个函数职责更明确，也更容易单独测试和复用。

[标题]
函数可以调用其他函数

[代码 language=python]
def build_battle_summary(correct_count, wrong_count):
    score = calculate_score(correct_count, wrong_count)
    result = determine_result(score)
    return f"得分：{score}，结果：{result}"
[/代码]

[示例 title=生成 Battle 结算摘要]
说明：组合多个函数完成完整流程。
语言：python

def calculate_score(correct_count, wrong_count):
    return correct_count * 2 - wrong_count

def determine_result(my_score, opponent_score):
    if my_score > opponent_score:
        return "胜利"
    if my_score < opponent_score:
        return "失败"
    return "平局"

def build_summary(correct_count, wrong_count, opponent_score):
    my_score = calculate_score(correct_count, wrong_count)
    result = determine_result(my_score, opponent_score)
    return f"我的得分：{my_score}，对局结果：{result}"

print(build_summary(8, 2, 12))
[/示例]

[提示 title=函数名应说明它做什么]
calculate_score 比 process 更明确，determine_result 比 handle 更容易理解。

[警告 title=不要把所有代码塞进一个超长函数]
函数过长时，应检查是否可以按计算、判断、格式化等职责拆分。

### 课时题目

#### 题目 16

题型：SINGLE_CHOICE
题干：把“计算得分”和“判断胜负”拆成两个函数，主要有什么好处？

难度：MEDIUM
分值：10
知识点：函数职责、代码复用、可维护性
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码分析

选项：
- A. 让每个函数职责更清晰，也更容易复用和测试 [正确]
- B. 让程序一定运行得更快
- C. 可以取消所有变量
- D. 可以不再使用 return

解析：
拆分函数的主要价值是职责清晰、便于阅读、测试和复用，并不保证程序一定更快。

#### 题目 17

题型：FILL_BLANK
题干：一个设计良好的小函数通常应尽量只承担一个清晰的 ______。

难度：EASY
分值：10
知识点：单一职责、函数设计
是否用于 Battle：否

可接受答案：
- 职责
- 功能
- 任务
- responsibility

判题设置：
- 忽略大小写：是
- 忽略首尾空格：是
- 合并连续空格：是
- 最长字符数：30

解析：
函数职责越单一，代码通常越容易理解、测试和复用。

#### 题目 18

题型：CODE_FILL
题干：函数 determine_result 根据双方得分返回胜负结果。请补全“平局”分支的返回语句。

难度：MEDIUM
分值：10
知识点：函数、return、条件判断
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码填空

题目代码：
```python
def determine_result(my_score, opponent_score):
    if my_score > opponent_score:
        return "胜利"

    if my_score < opponent_score:
        return "失败"

    __________________
```

可接受答案：
```python
return "平局"
```

```python
return '平局'
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
前两个条件已经处理我方得分大于和小于对手的情况。剩余情况只能是双方得分相等，因此应返回“平局”。

标准完整代码：
```python
def determine_result(my_score, opponent_score):
    if my_score > opponent_score:
        return "胜利"

    if my_score < opponent_score:
        return "失败"

    return "平局"
```

---

## 第十章总结

[标题]
你已经能够封装和复用程序逻辑

[文本]
本章学习了：

- 使用 def 定义函数
- 使用函数名和括号调用函数
- 使用参数让函数处理不同数据
- 区分形参和实参
- 使用 return 返回计算结果
- 区分 return 和 print()
- 理解没有 return 的函数默认返回 None
- 使用默认参数减少重复传值
- 使用关键字参数明确数据含义
- 理解局部变量与全局变量的基本区别
- 通过参数和返回值保持清晰的数据流
- 把复杂流程拆成多个职责单一的函数
- 让一个函数调用其他函数完成完整任务

下一章将学习模块、包与常用标准库，了解如何复用其他文件和 Python 已经提供的功能。

---

## 第十章综合挑战（不计分）

[标题]
制作模块化 Battle 结算程序

[文本]
请把 Battle 结算流程拆分成多个函数。

要求：

1. calculate_score() 根据正确数和错误数计算分数
2. determine_result() 根据双方分数判断胜利、失败或平局
3. calculate_accuracy() 计算作答正确率
4. build_summary() 组合前面函数并返回结算摘要
5. 主程序调用 build_summary() 并输出结果

参考代码：

[代码 language=python]
def calculate_score(correct_count, wrong_count):
    return correct_count * 2 - wrong_count

def determine_result(my_score, opponent_score):
    if my_score > opponent_score:
        return "胜利"

    if my_score < opponent_score:
        return "失败"

    return "平局"

def calculate_accuracy(correct_count, wrong_count):
    answered_count = correct_count + wrong_count

    if answered_count == 0:
        return 0

    return correct_count / answered_count * 100

def build_summary(
    correct_count,
    wrong_count,
    opponent_score,
    nickname="新手玩家"
):
    my_score = calculate_score(correct_count, wrong_count)
    result = determine_result(my_score, opponent_score)
    accuracy = calculate_accuracy(correct_count, wrong_count)

    return (
        f"玩家：{nickname}\n"
        f"我的得分：{my_score}\n"
        f"对手得分：{opponent_score}\n"
        f"正确率：{accuracy:.1f}%\n"
        f"对局结果：{result}"
    )

summary = build_summary(
    correct_count=8,
    wrong_count=2,
    opponent_score=12
)

print(summary)
[/代码]

[文本]
尝试修改正确数、错误数和对手得分，观察最终结算摘要如何变化。也可以增加一个 unanswered_count 参数，让函数同时显示未作答数量。
