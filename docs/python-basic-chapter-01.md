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

# 第一章：Python 初体验

章节简介：认识 Python 程序的基本结构，学习输出、注释、变量、基础数据类型、输入和简单运算，并完成第一个可以与用户交互的小程序。
预计学习时间：60 分钟

章节学习目标：
- 理解 Python 程序按顺序执行的基本特点
- 能使用 print() 输出文字和变量
- 能使用注释说明代码用途
- 理解变量用于保存和更新数据
- 能区分字符串、整数、浮点数和布尔值
- 能使用 input() 接收用户输入
- 能使用加、减、乘、除完成简单计算
- 能阅读基础代码并判断输出结果

---

## 课时 1：运行第一段 Python 程序

课时简介：认识 Python 程序，学习使用 print() 输出内容，并理解代码从上到下执行。
预计学习时间：10 分钟

### 正文

[标题]
什么是 Python

[文本]
Python 是一种编程语言。人可以使用 Python 编写一组明确的指令，让计算机按照顺序完成任务。

在本课程中，你不需要先记住复杂概念。第一步只是让计算机按照你的要求显示一段文字。

[标题]
第一行 Python 代码

[代码 language=python]
print("Hello, Code Pioneer!")
[/代码]

[文本]
运行这段代码后，程序会显示：

[代码 language=text]
Hello, Code Pioneer!
[/代码]

[文本]
print() 是 Python 内置的输出函数。括号中的内容会被输出到运行窗口。

字符串需要使用英文单引号或英文双引号包裹。下面两种写法都可以正常运行：

[代码 language=python]
print("Python")
print('Python')
[/代码]

[提示 title=先理解作用，不急着记术语]
当前只需要记住：print() 用来输出内容。后续课程会进一步解释“函数”和“字符串”。

[标题]
程序按顺序执行

[代码 language=python]
print("第一行")
print("第二行")
print("第三行")
[/代码]

[文本]
Python 默认从上到下逐行执行代码，因此输出顺序也是“第一行、第二行、第三行”。

[示例 title=输出个人学习目标]
说明：连续使用 print() 输出三行信息。
语言：python

print("课程：Python 基础入门")
print("目标：学会阅读简单代码")
print("方式：学习、练习、Battle")
[/示例]

[警告 title=注意英文符号]
代码中的括号和引号应使用英文符号。中文引号“ ”不能直接代替英文引号。

### 课时题目

#### 题目 1

题型：SINGLE_CHOICE
题干：下面程序运行后会输出什么？

```python
print("Code Pioneer")
```

难度：EASY
分值：10
知识点：print、字符串、程序输出
是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：输出预测

选项：
- A. Code Pioneer [正确]
- B. "Code Pioneer"
- C. print
- D. 程序报错

解析：
print() 会输出括号中字符串的内容，但字符串两侧的引号只是语法标记，不会显示在结果中，因此输出是 Code Pioneer。选项 B 错在把代码中的引号也当成了输出内容。

#### 题目 2

题型：SINGLE_CHOICE
题干：下面程序的输出顺序是哪一个？

```python
print("A")
print("B")
print("C")
```

难度：EASY
分值：10
知识点：程序执行顺序、print
是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：输出预测

选项：
- A. A、B、C [正确]
- B. C、B、A
- C. A、C、B
- D. 输出顺序随机

解析：
Python 默认从上到下逐行执行代码，所以先输出 A，再输出 B，最后输出 C。程序不会随机调整语句顺序。

#### 题目 3

题型：CODE_FILL
题干：补全代码，使程序输出“欢迎来到码站先锋”。

难度：EASY
分值：10
知识点：print、字符串
是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：代码填空

题目代码：
```python
# 在下一行填写代码
```

可接受答案：
```python
print("欢迎来到码站先锋")
```

```python
print('欢迎来到码站先锋')
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
print() 用于输出内容，字符串既可以使用英文双引号，也可以使用英文单引号包裹。两种写法的输出结果相同。

标准完整代码：
```python
print("欢迎来到码站先锋")
```

---

## 课时 2：使用注释说明代码

课时简介：学习单行注释的写法，并理解注释不会作为程序指令执行。
预计学习时间：8 分钟

### 正文

[标题]
注释是写给人看的说明

[文本]
当代码越来越多时，仅靠代码本身可能很难快速看懂用途。注释可以解释代码在做什么，帮助自己和其他人阅读程序。

Python 使用井号 # 开始单行注释。

[代码 language=python]
# 输出欢迎语
print("欢迎学习 Python")
[/代码]

[文本]
运行上面的程序时，只会输出“欢迎学习 Python”。井号后面的注释不会作为程序指令执行。

[示例 title=为多段代码增加说明]
说明：注释可以单独占一行，也可以写在代码末尾。
语言：python

# 保存课程名称
course = "Python 基础入门"

print(course)  # 输出课程名称
[/示例]

[提示 title=注释应解释原因或用途]
好的注释通常说明代码的用途或容易误解的地方，而不是把代码逐字翻译一遍。

[警告 title=不要把重要代码写进注释]
被 # 注释掉的代码不会执行。如果输出语句前加了 #，程序将不会显示相应内容。

### 课时题目

#### 题目 4

题型：SINGLE_CHOICE
题干：下面程序运行后的输出是什么？

```python
# print("A")
print("B")
```

难度：EASY
分值：10
知识点：注释、程序输出
是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：输出预测

选项：
- A. A
- B. B [正确]
- C. A 和 B
- D. 程序报错

解析：
第一行以 # 开头，是注释，不会执行；第二行正常执行并输出 B。因此只有 B 会显示。选项 C 错在把注释也当成了可执行代码。

#### 题目 5

题型：FILL_BLANK
题干：Python 中，单行注释通常以符号 ______ 开始。

难度：EASY
分值：10
知识点：注释
是否用于 Battle：否

可接受答案：
- #
- 井号
- 井号符号

判题设置：
- 忽略大小写：是
- 忽略首尾空格：是
- 合并连续空格：是
- 最长字符数：20

解析：
Python 使用 # 开始单行注释。从 # 到该行末尾的内容通常不会作为程序指令执行。

---

## 课时 3：用变量保存数据

课时简介：理解变量的作用，学习赋值、读取变量和重新赋值。
预计学习时间：12 分钟

### 正文

[标题]
变量像一个带标签的盒子

[文本]
变量用于保存后续还会使用的数据。可以把变量理解为一个贴有名称标签的盒子：变量名是标签，变量值是盒子中的内容。

[代码 language=python]
name = "小码"
print(name)
[/代码]

[文本]
第一行把字符串“小码”保存到变量 name 中；第二行读取 name 保存的值并输出，因此结果是“小码”。

等号 = 在这里表示“把右边的值保存到左边的变量中”，不是数学中的“左右相等”。

[标题]
变量可以重新赋值

[代码 language=python]
score = 10
score = 20
print(score)
[/代码]

[文本]
同一个变量可以被重新赋值。第二次赋值会更新 score 保存的值，所以最终输出 20。

[示例 title=保存用户信息]
说明：使用不同变量保存不同类型的信息。
语言：python

nickname = "先锋学员"
level = 1

print(nickname)
print(level)
[/示例]

[标题]
变量命名的基础规则

[文本]
变量名可以包含英文字母、数字和下划线，但不能以数字开头，也不能使用 Python 关键字。

下面是合法变量名：

[代码 language=python]
name = "小码"
user_name = "先锋学员"
score2 = 80
[/代码]

下面的写法不合法：

[代码 language=python]
# 不能以数字开头
2score = 80

# 不能使用减号连接
user-name = "小码"
[/代码]

[提示 title=使用有意义的变量名]
相比 a、b、x，name、score、course_title 更容易让人理解变量保存的内容。

### 课时题目

#### 题目 6

题型：SINGLE_CHOICE
题干：下面程序运行后会输出什么？

```python
score = 10
score = 25
print(score)
```

难度：EASY
分值：10
知识点：变量、重新赋值、程序输出
是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：输出预测

选项：
- A. 10
- B. 25 [正确]
- C. 10 和 25
- D. score

解析：
score 先保存 10，随后又被重新赋值为 25。print(score) 读取的是变量当前保存的最终值，因此输出 25。选项 A 忽略了第二次赋值。

#### 题目 7

题型：SINGLE_CHOICE
题干：下面哪个变量名可以在 Python 中正常使用？

难度：MEDIUM
分值：10
知识点：变量命名
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码纠错

选项：
- A. user_name [正确]
- B. 1user
- C. user-name
- D. class

解析：
user_name 由字母和下划线组成，符合变量命名规则。1user 以数字开头；user-name 中的减号会被当作运算符；class 是 Python 关键字，不能直接作为普通变量名。

#### 题目 8

题型：FILL_BLANK
题干：阅读代码，填写最终输出结果。

```python
name = "Python"
name = "Code Pioneer"
print(name)
```

输出：______

难度：EASY
分值：10
知识点：变量、重新赋值、程序输出
是否用于 Battle：否

可接受答案：
- Code Pioneer
- code pioneer

判题设置：
- 忽略大小写：是
- 忽略首尾空格：是
- 合并连续空格：是
- 最长字符数：100

解析：
变量 name 最初保存 Python，随后被更新为 Code Pioneer。程序输出变量当前保存的值，因此结果为 Code Pioneer。

#### 题目 9

题型：CODE_FILL
题干：补全代码，将字符串“先锋学员”保存到变量 nickname 中，然后输出该变量。

难度：MEDIUM
分值：10
知识点：变量、赋值、print
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码填空

题目代码：
```python
# 第 1 行：把“先锋学员”保存到 nickname
# 第 2 行：输出 nickname
```

可接受答案：
```python
nickname = "先锋学员"
print(nickname)
```

```python
nickname = '先锋学员'
print(nickname)
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
第一行使用赋值语句将字符串保存到变量 nickname；第二行使用 print(nickname) 读取并输出变量的值。变量名大小写必须保持一致。

标准完整代码：
```python
nickname = "先锋学员"
print(nickname)
```

---

## 课时 4：认识基础数据类型

课时简介：认识字符串、整数、浮点数和布尔值，并学习使用 type() 查看数据类型。
预计学习时间：10 分钟

### 正文

[标题]
不同数据有不同类型

[文本]
程序处理的数据并不完全相同。姓名属于文字，年龄通常是整数，身高可能带有小数，而“是否完成”只有是或否两种状态。

Python 常见基础数据类型包括：

- str：字符串，用于表示文字
- int：整数
- float：浮点数，也就是带小数的数据
- bool：布尔值，只有 True 和 False

[代码 language=python]
name = "Python 学员"
age = 18
height = 168.5
is_student = True
[/代码]

[文本]
字符串需要使用引号包裹。整数和浮点数不能随意加引号，否则它们会变成字符串。

[标题]
使用 type() 查看类型

[代码 language=python]
age = 18
print(type(age))
[/代码]

[文本]
程序会显示 age 对应的数据类型。当前阶段不要求记住完整输出格式，只需要理解 type() 可以帮助我们确认变量保存的数据类型。

[示例 title=同样的字符可能属于不同类型]
说明：18 和 "18" 看起来相似，但类型不同。
语言：python

number_age = 18
text_age = "18"

print(type(number_age))
print(type(text_age))
[/示例]

[警告 title=True 和 False 首字母必须大写]
Python 中的布尔值写作 True 和 False。写成 true 或 false 会被当作未定义的变量名。

### 课时题目

#### 题目 10

题型：SINGLE_CHOICE
题干：阅读下面代码，变量 price 保存的数据类型是什么？

```python
price = 19.9
```

难度：EASY
分值：10
知识点：float、数据类型
是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：代码用途

选项：
- A. str
- B. int
- C. float [正确]
- D. bool

解析：
19.9 含有小数点，因此属于浮点数 float。字符串需要使用引号包裹，整数不含小数部分，布尔值只有 True 和 False。

#### 题目 11

题型：SINGLE_CHOICE
题干：下面哪个变量保存的是字符串，而不是整数？

难度：MEDIUM
分值：10
知识点：str、int、引号
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码阅读

选项：
- A. age = 18
- B. age = "18" [正确]
- C. age = 18.0
- D. age = True

解析：
"18" 被引号包裹，因此是字符串 str。18 是整数 int，18.0 是浮点数 float，True 是布尔值 bool。

#### 题目 12

题型：FILL_BLANK
题干：Python 中，表示“假”的布尔值写作 ______。

难度：EASY
分值：10
知识点：bool、False
是否用于 Battle：否

可接受答案：
- False

判题设置：
- 忽略大小写：否
- 忽略首尾空格：是
- 合并连续空格：是
- 最长字符数：20

解析：
Python 的两个布尔值分别是 True 和 False，首字母必须大写。小写 false 不是 Python 的布尔值写法。

---

## 课时 5：使用 input() 接收输入

课时简介：学习接收用户输入，并理解 input() 返回字符串。
预计学习时间：10 分钟

### 正文

[标题]
让程序接收用户输入

[文本]
print() 负责把内容输出给用户，input() 可以暂停程序并等待用户输入内容。

[代码 language=python]
name = input("请输入你的名字：")
print("你好，", name)
[/代码]

[文本]
程序先显示提示文字，用户输入名字后，input() 会把输入内容保存到变量 name 中，随后程序输出问候语。

[标题]
input() 返回字符串

[代码 language=python]
age = input("请输入年龄：")
print(type(age))
[/代码]

[文本]
即使用户输入 18，input() 得到的仍然是字符串 "18"，而不是整数 18。

这一区别会影响数学运算。类型转换将在后续章节详细学习。

[示例 title=制作简单自我介绍程序]
说明：接收昵称和学习目标，再输出组合信息。
语言：python

nickname = input("请输入昵称：")
goal = input("请输入学习目标：")

print("你好，", nickname)
print("你的目标是：", goal)
[/示例]

[警告 title=输入的数字暂时不能直接参与加法]
input() 返回字符串。如果直接把输入结果和整数相加，程序可能报错。后续会学习 int() 和 float() 类型转换。

### 课时题目

#### 题目 13

题型：SINGLE_CHOICE
题干：用户在程序中输入 20，变量 age 的数据类型是什么？

```python
age = input("请输入年龄：")
```

难度：MEDIUM
分值：10
知识点：input、str、数据类型
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码阅读

选项：
- A. int
- B. float
- C. str [正确]
- D. bool

解析：
input() 返回的结果始终是字符串 str，即使用户输入的内容看起来是数字。若要把 "20" 作为整数计算，需要在后续使用 int() 转换。

#### 题目 14

题型：CODE_FILL
题干：补全代码，接收用户输入的课程名称，并将其输出。

难度：MEDIUM
分值：10
知识点：input、变量、print
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码填空

题目代码：
```python
course = ______________________
print(course)
```

可接受答案：
```python
input("请输入课程名称：")
```

```python
input('请输入课程名称：')
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
input() 会等待用户输入并返回字符串。将它的返回结果赋值给 course 后，print(course) 就能输出用户输入的课程名称。提示文字不是必需的，因此 input() 也可接受。

标准完整代码：
```python
course = input("请输入课程名称：")
print(course)
```

---

## 课时 6：完成简单运算

课时简介：使用变量和基础运算符完成加、减、乘、除。
预计学习时间：10 分钟

### 正文

[标题]
使用 Python 计算

[文本]
Python 可以直接完成常见数学运算。本章先学习四个基础运算符：

- + 加法
- - 减法
- * 乘法
- / 除法

[代码 language=python]
a = 10
b = 5

print(a + b)
print(a - b)
print(a * b)
print(a / b)
[/代码]

[文本]
上面的程序依次输出 15、5、50 和 2.0。

使用 / 进行除法时，即使能够整除，Python 通常也会得到浮点数结果。

[标题]
先计算，再保存结果

[代码 language=python]
price = 12
count = 3
total = price * count

print(total)
[/代码]

[文本]
程序先计算 price * count，再把结果保存到 total 中。变量可以保存计算结果，方便后续继续使用。

[示例 title=计算 Battle 得分]
说明：假设答对 6 题，每题获得 2 分，计算总得分。
语言：python

correct_count = 6
score_per_question = 2
total_score = correct_count * score_per_question

print(total_score)
[/示例]

[提示 title=先关注简单表达式]
本章只学习 +、-、*、/。整除、取余、幂运算和运算优先级将在后续章节继续学习。

### 课时题目

#### 题目 15

题型：SINGLE_CHOICE
题干：下面程序运行后会输出什么？

```python
a = 8
b = 3
result = a + b
print(result)
```

难度：EASY
分值：10
知识点：变量、加法、程序输出
是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：输出预测

选项：
- A. 5
- B. 11 [正确]
- C. 24
- D. a + b

解析：
a 保存 8，b 保存 3，a + b 的结果是 11，并被保存到 result 中，因此程序输出 11。

#### 题目 16

题型：SINGLE_CHOICE
题干：下面程序运行后会输出什么？

```python
price = 6
count = 4
print(price * count)
```

难度：EASY
分值：10
知识点：乘法、变量、程序输出
是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：输出预测

选项：
- A. 10
- B. 24 [正确]
- C. 64
- D. pricecount

解析：
星号 * 表示乘法。price * count 等于 6 × 4，因此输出 24。选项 A 将乘法误认为加法。

#### 题目 17

题型：FILL_BLANK
题干：阅读代码并填写最终输出结果。

```python
x = 20
y = 5
print(x / y)
```

输出：______

难度：MEDIUM
分值：10
知识点：除法、float、程序输出
是否用于 Battle：否

可接受答案：
- 4.0

判题设置：
- 忽略大小写：是
- 忽略首尾空格：是
- 合并连续空格：是
- 最长字符数：30

解析：
20 除以 5 等于 4。Python 使用 / 运算符进行除法时会返回浮点数，因此输出为 4.0，而不是整数 4。

#### 题目 18

题型：CODE_FILL
题干：补全代码，计算 4 道答对题目的得分。每答对一题获得 2 分，最后输出总得分。

难度：MEDIUM
分值：10
知识点：变量、乘法、print
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码填空

题目代码：
```python
correct_count = 4
score_per_question = 2

total_score = __________________
print(total_score)
```

可接受答案：
```python
correct_count * score_per_question
```

```python
score_per_question * correct_count
```

```python
4 * 2
```

```python
2 * 4
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
总得分等于答对题目数量乘以每题分数，因此应计算 correct_count * score_per_question。乘法交换顺序不会改变结果，因此 score_per_question * correct_count 也正确。直接写 4 * 2 虽然可运行，但复用变量的写法更便于后续修改数据。

标准完整代码：
```python
correct_count = 4
score_per_question = 2

total_score = correct_count * score_per_question
print(total_score)
```

---

## 第一章总结

[标题]
你已经完成了第一个 Python 学习闭环

[文本]
本章从第一行 Python 代码开始，学习了输出、注释、变量、基础数据类型、用户输入和简单运算。

现在你已经能够：

- 使用 print() 输出文字和变量
- 使用 # 编写单行注释
- 创建变量并更新变量保存的值
- 区分 str、int、float 和 bool
- 使用 input() 接收用户输入
- 使用 +、-、*、/ 完成简单计算
- 阅读基础代码并判断输出结果
- 识别变量命名、引号和布尔值大小写等常见错误

下一章将继续学习输入结果的类型转换、更多运算符和表达式，让程序能够真正处理用户输入的数字。

[提示 title=本章 Battle 能力]
本章 Battle 题重点考察输出预测、变量更新、数据类型、input() 返回值和简单运算，而不是学习态度或无意义常识。

---

## 第一章综合挑战（不计分）

[标题]
制作个人学习名片

[文本]
请尝试编写一个程序：

1. 询问用户昵称
2. 询问用户正在学习的课程
3. 保存用户当前的 Battle 得分
4. 输出一张简单学习名片

参考效果：

[代码 language=text]
请输入昵称：小码
请输入课程：Python
昵称：小码
课程：Python
Battle 得分：20
[/代码]

参考代码：

[代码 language=python]
nickname = input("请输入昵称：")
course = input("请输入课程：")
battle_score = 20

print("昵称：", nickname)
print("课程：", course)
print("Battle 得分：", battle_score)
[/代码]

[文本]
如果你能够理解这段程序每一行的作用，就已经掌握了本章的核心内容。
