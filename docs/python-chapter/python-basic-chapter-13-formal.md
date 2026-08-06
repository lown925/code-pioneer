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

# 第十三章：异常处理

章节简介：学习使用 try、except、else 和 finally 处理运行时错误，掌握常见异常类型、主动抛出异常和输入校验，让程序在出现问题时给出清晰提示，而不是直接终止。
预计学习时间：95 分钟

章节学习目标：
- 理解异常与语法错误的区别
- 能使用 try...except 捕获运行时异常
- 能识别 ValueError、ZeroDivisionError、KeyError、IndexError 和 FileNotFoundError
- 能针对不同异常编写不同处理逻辑
- 能使用 else 处理无异常时的成功逻辑
- 能使用 finally 执行无论是否异常都要完成的清理逻辑
- 能使用 raise 主动抛出异常
- 能为函数编写基础参数校验
- 能避免过于宽泛的异常捕获
- 能把技术错误转换成用户可理解的提示

---

## 课时 1：认识异常

课时简介：理解程序为什么会在运行时出错，以及异常处理的作用。
预计学习时间：14 分钟

### 正文

[标题]
异常是程序运行过程中出现的问题

[文本]
有些代码语法正确，但在运行时仍可能出错。

例如：

[代码 language=python]
number = int("Python")
[/代码]

[文本]
这段代码语法没有问题，但字符串 "Python" 不能转换为整数，因此会产生 ValueError。

再例如：

[代码 language=python]
result = 10 / 0
[/代码]

[文本]
除数不能为 0，因此会产生 ZeroDivisionError。

[标题]
语法错误和异常不完全相同

[文本]
语法错误表示代码结构不符合 Python 规则，例如缺少冒号、括号不配对或缩进错误。

异常通常发生在代码已经开始运行之后，例如输入内容不合法、文件不存在或列表索引越界。

[标题]
异常如果不处理，程序可能直接停止

[代码 language=python]
score_text = input("请输入分数：")
score = int(score_text)

print(score + 10)
[/代码]

[文本]
如果用户输入 80，程序正常执行。

如果用户输入“八十”，int() 会抛出 ValueError，程序会停止，后面的代码不会继续执行。

[示例 title=输入转换异常]
说明：错误输入会导致程序停止。
语言：python

rating_text = input("请输入 Rating：")
rating = int(rating_text)

print(f"新的 Rating：{rating + 20}")
[/示例]

[提示 title=异常处理不是隐藏所有错误]
异常处理的目的不是假装程序没有问题，而是识别可预期错误，并给出合理处理方式。

### 课时题目

#### 题目 1

题型：SINGLE_CHOICE
题干：下面代码最可能产生哪种异常？

```python
number = int("Python")
```

难度：EASY
分值：10
知识点：ValueError、类型转换、异常
是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：异常识别

选项：
- A. ValueError [正确]
- B. ZeroDivisionError
- C. KeyError
- D. FileNotFoundError

解析：
字符串 "Python" 不是合法整数文本，int("Python") 无法完成转换，因此会产生 ValueError。

#### 题目 2

题型：FILL_BLANK
题干：程序运行过程中出现、并可能导致程序中断的问题，通常称为 ______。

难度：EASY
分值：10
知识点：异常、程序运行
是否用于 Battle：否

可接受答案：
- 异常
- exception
- Exception

判题设置：
- 忽略大小写：是
- 忽略首尾空格：是
- 合并连续空格：是
- 最长字符数：30

解析：
异常是程序运行过程中出现的问题，例如类型转换失败、除以 0 或文件不存在。

#### 题目 3

题型：CODE_FILL
题干：下面程序会在除数为 0 时产生异常。请补全会触发异常的值。

难度：EASY
分值：10
知识点：ZeroDivisionError、除法
是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：代码填空

题目代码：
```python
divisor = ______
result = 10 / divisor

print(result)
```

可接受答案：
```python
0
```

```python
0.0
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
除数为 0 或 0.0 时，Python 会产生 ZeroDivisionError。

标准完整代码：
```python
divisor = 0
result = 10 / divisor

print(result)
```

---

## 课时 2：使用 try...except

课时简介：学习捕获异常并给出友好提示。
预计学习时间：16 分钟

### 正文

[标题]
try 中放可能出错的代码

[代码 language=python]
try:
    score = int(input("请输入分数："))
    print(score)
except ValueError:
    print("请输入有效整数")
[/代码]

[文本]
程序先执行 try 代码块。

如果没有异常，except 不执行。

如果产生 ValueError，程序会跳到 except 代码块，输出提示，而不是直接崩溃。

[标题]
try...except 的基本结构

[代码 language=python]
try:
    可能产生异常的代码
except 异常类型:
    异常发生时执行的代码
[/代码]

[标题]
只捕获预期的异常

[文本]
输入转换失败时，应捕获 ValueError。

除法除以 0 时，应捕获 ZeroDivisionError。

针对具体异常处理，比直接捕获所有异常更容易发现真实问题。

[示例 title=安全读取 Rating]
说明：用户输入不合法时显示中文提示。
语言：python

try:
    rating = int(input("请输入 Rating："))
    print(f"当前 Rating：{rating}")
except ValueError:
    print("Rating 必须是整数")
[/示例]

[警告 title=except 后同样需要冒号和缩进]
except ValueError 后必须使用英文冒号，处理代码需要缩进。

### 课时题目

#### 题目 4

题型：SINGLE_CHOICE
题干：下面程序中，用户输入“abc”时会输出什么？

```python
try:
    score = int(input("请输入分数："))
    print(score)
except ValueError:
    print("输入格式错误")
```

难度：EASY
分值：10
知识点：try、except、ValueError
是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：执行流程

选项：
- A. abc
- B. 输入格式错误 [正确]
- C. 0
- D. 程序没有任何反应

解析：
int("abc") 会产生 ValueError，因此程序进入 except ValueError 分支并输出“输入格式错误”。

#### 题目 5

题型：FILL_BLANK
题干：try 代码块发生指定异常时，Python 会执行 ______ 代码块。

难度：EASY
分值：10
知识点：except、异常处理
是否用于 Battle：否

可接受答案：
- except
- except块
- except 代码块

判题设置：
- 忽略大小写：否
- 忽略首尾空格：是
- 合并连续空格：是
- 最长字符数：30

解析：
except 用于接收并处理 try 中产生的指定异常。

#### 题目 6

题型：CODE_FILL
题干：用户输入的题目数量必须是整数。请补全异常类型，使输入文字时显示提示。

难度：MEDIUM
分值：10
知识点：try、except、ValueError、input
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码填空

题目代码：
```python
try:
    question_count = int(input("请输入题目数量："))
    print(question_count)
except ______________:
    print("题目数量必须是整数")
```

可接受答案：
```python
ValueError
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
int() 转换非法文本时会产生 ValueError，因此应捕获 ValueError。

标准完整代码：
```python
try:
    question_count = int(input("请输入题目数量："))
    print(question_count)
except ValueError:
    print("题目数量必须是整数")
```

---

## 课时 3：处理不同异常类型

课时简介：学习针对不同错误给出不同处理逻辑。
预计学习时间：18 分钟

### 正文

[标题]
不同异常应给出不同提示

[代码 language=python]
try:
    total_score = int(input("请输入总分："))
    player_count = int(input("请输入玩家数量："))

    average_score = total_score / player_count
    print(average_score)
except ValueError:
    print("请输入有效整数")
except ZeroDivisionError:
    print("玩家数量不能为 0")
[/代码]

[文本]
如果输入无法转换为整数，执行 ValueError 分支。

如果玩家数量为 0，执行 ZeroDivisionError 分支。

[标题]
常见异常类型

[文本]
ValueError：值格式不符合要求。

ZeroDivisionError：除数为 0。

KeyError：读取字典中不存在的键。

IndexError：访问列表或字符串中不存在的索引。

FileNotFoundError：尝试读取不存在的文件。

TypeError：对不兼容类型执行操作。

[代码 language=python]
player = {"nickname": "新手玩家"}

try:
    print(player["rating"])
except KeyError:
    print("玩家数据中没有 Rating")
[/代码]

[标题]
可以使用元组同时捕获多个异常

[代码 language=python]
try:
    value = int(input("请输入数字："))
    result = 100 / value
except (ValueError, ZeroDivisionError):
    print("请输入非零整数")
[/代码]

[文本]
这种写法适合多个异常采用相同处理方式的场景。

[示例 title=安全访问题目列表]
说明：索引不存在时显示提示。
语言：python

questions = ["题目1", "题目2"]

try:
    print(questions[5])
except IndexError:
    print("题目索引超出范围")
[/示例]

### 课时题目

#### 题目 7

题型：SINGLE_CHOICE
题干：访问列表中不存在的索引时，通常会产生哪种异常？

难度：EASY
分值：10
知识点：IndexError、列表索引
是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：异常识别

选项：
- A. IndexError [正确]
- B. KeyError
- C. ValueError
- D. FileNotFoundError

解析：
列表和字符串索引超出有效范围时，通常会产生 IndexError。

#### 题目 8

题型：FILL_BLANK
题干：读取字典中不存在的键时，通常会产生 ______。

难度：EASY
分值：10
知识点：KeyError、字典
是否用于 Battle：否

可接受答案：
- KeyError
- key error
- 键错误

判题设置：
- 忽略大小写：是
- 忽略首尾空格：是
- 合并连续空格：是
- 最长字符数：30

解析：
使用 dictionary[key] 读取不存在的键时，Python 会产生 KeyError。

#### 题目 9

题型：CODE_FILL
题干：程序需要分别处理输入格式错误和除数为 0。请补全第二个异常类型。

难度：MEDIUM
分值：10
知识点：多异常处理、ZeroDivisionError
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码填空

题目代码：
```python
try:
    total_score = int(input("请输入总分："))
    player_count = int(input("请输入玩家数量："))

    print(total_score / player_count)
except ValueError:
    print("请输入有效整数")
except ____________________:
    print("玩家数量不能为 0")
```

可接受答案：
```python
ZeroDivisionError
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
玩家数量为 0 时，total_score / player_count 会产生 ZeroDivisionError。

标准完整代码：
```python
try:
    total_score = int(input("请输入总分："))
    player_count = int(input("请输入玩家数量："))

    print(total_score / player_count)
except ValueError:
    print("请输入有效整数")
except ZeroDivisionError:
    print("玩家数量不能为 0")
```

---

## 课时 4：使用 else 与 finally

课时简介：学习区分成功逻辑和清理逻辑。
预计学习时间：16 分钟

### 正文

[标题]
else 在没有异常时执行

[代码 language=python]
try:
    score = int(input("请输入分数："))
except ValueError:
    print("请输入有效整数")
else:
    print(f"分数保存成功：{score}")
[/代码]

[文本]
只有 try 没有产生异常时，else 才会执行。

把成功后的逻辑放到 else 中，可以让 try 代码块只保留可能出错的部分。

[标题]
finally 无论是否异常都会执行

[代码 language=python]
try:
    score = int(input("请输入分数："))
except ValueError:
    print("输入格式错误")
finally:
    print("本次输入处理结束")
[/代码]

[文本]
无论输入是否正确，finally 都会执行。

finally 常用于：

- 关闭文件
- 释放资源
- 停止计时器
- 输出结束日志

[标题]
完整结构

[代码 language=python]
try:
    可能出错的代码
except ValueError:
    处理异常
else:
    没有异常时执行
finally:
    无论如何都执行
[/代码]

[示例 title=保存学习进度]
说明：成功和结束提示分开处理。
语言：python

try:
    progress = int(input("请输入学习进度："))
except ValueError:
    print("进度必须是整数")
else:
    print(f"进度已保存：{progress}%")
finally:
    print("进度处理完成")
[/示例]

[提示 title=else 不是必须的]
可以只使用 try...except，也可以根据需要添加 else 和 finally。

### 课时题目

#### 题目 10

题型：SINGLE_CHOICE
题干：try 中没有产生异常时，哪个代码块会执行？

难度：EASY
分值：10
知识点：else、异常流程
是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：代码用途

选项：
- A. else [正确]
- B. except
- C. raise
- D. import

解析：
try 没有异常时，else 代码块会执行。except 只在匹配异常发生时执行。

#### 题目 11

题型：FILL_BLANK
题干：无论 try 是否产生异常，通常都会执行的代码块是 ______。

难度：EASY
分值：10
知识点：finally、清理逻辑
是否用于 Battle：否

可接受答案：
- finally
- finally块
- finally 代码块

判题设置：
- 忽略大小写：否
- 忽略首尾空格：是
- 合并连续空格：是
- 最长字符数：30

解析：
finally 无论是否发生异常都会执行，适合放置清理资源等逻辑。

#### 题目 12

题型：CODE_FILL
题干：无论输入是否成功，程序都需要输出“处理结束”。请补全关键字。

难度：MEDIUM
分值：10
知识点：finally、异常流程
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码填空

题目代码：
```python
try:
    score = int(input("请输入分数："))
except ValueError:
    print("输入格式错误")
________:
    print("处理结束")
```

可接受答案：
```python
finally
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
finally 代码块无论 try 是否成功都会执行，因此适合输出统一结束提示。

标准完整代码：
```python
try:
    score = int(input("请输入分数："))
except ValueError:
    print("输入格式错误")
finally:
    print("处理结束")
```

---

## 课时 5：使用 raise 主动抛出异常

课时简介：学习在数据不符合业务规则时主动阻止程序继续执行。
预计学习时间：16 分钟

### 正文

[标题]
有些错误需要程序主动判断

[文本]
Python 不会认为负数 Rating 是语法错误，但业务规则可能规定 Rating 不能小于 0。

可以使用 raise 主动抛出异常。

[代码 language=python]
rating = -10

if rating < 0:
    raise ValueError("Rating 不能小于 0")
[/代码]

[文本]
当条件成立时，程序主动产生 ValueError，并附带错误说明。

[标题]
在函数中校验参数

[代码 language=python]
def calculate_accuracy(correct_count, answered_count):
    if answered_count <= 0:
        raise ValueError("作答数量必须大于 0")

    if correct_count < 0:
        raise ValueError("正确数量不能小于 0")

    return correct_count / answered_count * 100
[/代码]

[文本]
函数先检查参数是否符合规则，只有合法时才继续计算。

[标题]
调用者可以捕获主动抛出的异常

[代码 language=python]
try:
    accuracy = calculate_accuracy(5, 0)
except ValueError as error:
    print(error)
[/代码]

[文本]
except ValueError as error 会把异常对象保存到变量 error 中，可以输出异常说明。

[示例 title=校验题目数量]
说明：题目数量必须在 1 到 100 之间。
语言：python

def validate_question_count(question_count):
    if question_count < 1 or question_count > 100:
        raise ValueError("题目数量必须在 1 到 100 之间")

    return question_count
[/示例]

[警告 title=不要用 raise 处理正常分支]
用户未登录、房间等待中等正常业务状态，未必都需要通过异常表达。应根据项目设计选择返回值、状态或异常。

### 课时题目

#### 题目 13

题型：SINGLE_CHOICE
题干：Python 中用于主动抛出异常的关键字是什么？

难度：EASY
分值：10
知识点：raise、主动异常
是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：代码用途

选项：
- A. raise [正确]
- B. except
- C. finally
- D. return

解析：
raise 用于主动抛出异常。return 用于返回函数结果，except 用于捕获异常。

#### 题目 14

题型：FILL_BLANK
题干：捕获异常时，使用 `except ValueError as error` 可以把异常对象保存到变量 ______ 中。

难度：EASY
分值：10
知识点：异常对象、as
是否用于 Battle：否

可接受答案：
- error

判题设置：
- 忽略大小写：否
- 忽略首尾空格：是
- 合并连续空格：是
- 最长字符数：20

解析：
as error 会把捕获到的异常对象保存到变量 error 中。

#### 题目 15

题型：CODE_FILL
题干：函数规定题目数量必须大于 0。请补全主动抛出异常的代码。

难度：MEDIUM
分值：10
知识点：raise、ValueError、参数校验
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码填空

题目代码：
```python
def validate_question_count(question_count):
    if question_count <= 0:
        __________________________________________

    return question_count
```

可接受答案：
```python
raise ValueError("题目数量必须大于 0")
```

```python
raise ValueError('题目数量必须大于 0')
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
当 question_count 小于等于 0 时，参数不符合要求，应使用 raise ValueError(...) 主动抛出异常。

标准完整代码：
```python
def validate_question_count(question_count):
    if question_count <= 0:
        raise ValueError("题目数量必须大于 0")

    return question_count
```

---

## 课时 6：编写清晰可靠的异常处理

课时简介：学习避免隐藏错误，并把技术异常转换为用户可理解的提示。
预计学习时间：17 分钟

### 正文

[标题]
不要随意捕获所有异常

[代码 language=python]
try:
    score = int(input("请输入分数："))
except:
    print("发生错误")
[/代码]

[文本]
裸 except 会捕获几乎所有异常，包括本来没有预料到的程序缺陷。

这样可能掩盖真实问题，不利于调试。

更推荐：

[代码 language=python]
try:
    score = int(input("请输入分数："))
except ValueError:
    print("分数必须是整数")
[/代码]

[标题]
错误提示应告诉用户如何修正

[文本]
不好的提示：

[代码 language=text]
发生异常
[/代码]

更好的提示：

[代码 language=text]
题目数量必须是 1 到 100 之间的整数，请重新输入。
[/代码]

[标题]
技术日志和用户提示可以不同

[文本]
开发日志可以记录异常类型和详细信息。

用户界面应显示简洁、明确、可操作的提示，不应直接暴露完整堆栈或敏感配置。

[代码 language=python]
def parse_question_count(raw_value):
    try:
        question_count = int(raw_value)
    except ValueError:
        return None, "题目数量必须是整数"

    if question_count < 1 or question_count > 100:
        return None, "题目数量必须在 1 到 100 之间"

    return question_count, None
[/代码]

[标题]
把异常处理放在合适层级

[文本]
底层函数可以抛出具体异常。

接近用户界面的代码负责捕获异常，并转换成可理解提示。

[示例 title=安全处理 Battle 题目数量]
说明：函数负责校验，调用处负责显示提示。
语言：python

def validate_question_count(question_count):
    if question_count < 1 or question_count > 100:
        raise ValueError("题目数量必须在 1 到 100 之间")

    return question_count

try:
    raw_value = input("请输入题目数量：")
    question_count = int(raw_value)
    valid_count = validate_question_count(question_count)
except ValueError as error:
    print(f"无法开始练习：{error}")
else:
    print(f"练习已创建，共 {valid_count} 题")
[/示例]

[提示 title=只处理自己能够处理的异常]
如果当前代码不知道如何恢复或提示，盲目捕获异常反而会让问题更难发现。

### 课时题目

#### 题目 16

题型：SINGLE_CHOICE
题干：下面哪种异常处理方式更合适？

难度：MEDIUM
分值：10
知识点：具体异常、用户提示、最佳实践
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码分析

选项：
- A. 捕获具体异常，并给出用户可以理解的修正提示 [正确]
- B. 所有代码都使用空的 except
- C. 发生异常时完全不显示任何信息
- D. 把数据库密码和完整堆栈显示给用户

解析：
应捕获能够处理的具体异常，并提供明确、可操作的提示。不能向用户暴露敏感信息。

#### 题目 17

题型：FILL_BLANK
题干：直接写 `except:` 会捕获范围过广，这种写法通常称为 ______ except。

难度：MEDIUM
分值：10
知识点：裸 except、异常最佳实践
是否用于 Battle：否

可接受答案：
- 裸
- bare
- 空
- 宽泛

判题设置：
- 忽略大小写：是
- 忽略首尾空格：是
- 合并连续空格：是
- 最长字符数：30

解析：
不指定异常类型的 except: 常被称为裸 except，容易掩盖未预期的问题。

#### 题目 18

题型：CODE_FILL
题干：调用 validate_question_count() 时，需要捕获它抛出的 ValueError，并显示异常信息。请补全 except 语句。

难度：MEDIUM
分值：10
知识点：异常对象、ValueError、用户提示
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码填空

题目代码：
```python
try:
    valid_count = validate_question_count(0)
except __________________________:
    print(f"创建失败：{error}")
```

可接受答案：
```python
ValueError as error
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
validate_question_count() 会抛出 ValueError。使用 except ValueError as error 可以捕获异常并读取其中的提示信息。

标准完整代码：
```python
try:
    valid_count = validate_question_count(0)
except ValueError as error:
    print(f"创建失败：{error}")
```

---

## 第十三章总结

[标题]
你已经能够让程序更可靠地处理错误

[文本]
本章学习了：

- 理解异常和语法错误的区别
- 使用 try 包裹可能出错的代码
- 使用 except 捕获指定异常
- 识别 ValueError
- 识别 ZeroDivisionError
- 识别 KeyError
- 识别 IndexError
- 识别 FileNotFoundError
- 针对不同异常提供不同处理逻辑
- 使用 else 处理无异常时的成功逻辑
- 使用 finally 执行清理或结束逻辑
- 使用 raise 主动抛出异常
- 在函数中校验参数
- 使用 except ... as error 读取异常信息
- 避免裸 except
- 把技术错误转换为用户可理解的提示
- 避免向用户暴露堆栈和敏感信息

下一章将学习面向对象基础，包括类、对象、属性、方法和构造函数。

---

## 第十三章综合挑战（不计分）

[标题]
制作可靠的 Battle 训练配置程序

[文本]
请编写一个程序，安全地创建 Battle 训练配置。

规则：

1. 题目数量必须是 1 到 100 之间的整数
2. 每题分数必须大于 0
3. 训练时长必须是 1 到 60 分钟
4. 输入格式错误时提示用户重新检查
5. 业务数值不合法时由函数主动抛出 ValueError
6. 创建成功后输出训练配置
7. 无论成功或失败，最后输出“配置处理结束”

参考代码：

[代码 language=python]
def validate_question_count(question_count):
    if question_count < 1 or question_count > 100:
        raise ValueError("题目数量必须在 1 到 100 之间")

    return question_count

def validate_score_per_question(score_per_question):
    if score_per_question <= 0:
        raise ValueError("每题分数必须大于 0")

    return score_per_question

def validate_duration(duration_minutes):
    if duration_minutes < 1 or duration_minutes > 60:
        raise ValueError("训练时长必须在 1 到 60 分钟之间")

    return duration_minutes

try:
    question_count = int(input("请输入题目数量："))
    score_per_question = int(input("请输入每题分数："))
    duration_minutes = int(input("请输入训练时长："))

    valid_question_count = validate_question_count(question_count)
    valid_score = validate_score_per_question(score_per_question)
    valid_duration = validate_duration(duration_minutes)
except ValueError as error:
    print(f"无法创建训练：{error}")
else:
    max_score = valid_question_count * valid_score

    print("训练创建成功")
    print(f"题目数量：{valid_question_count}")
    print(f"每题分数：{valid_score}")
    print(f"最高得分：{max_score}")
    print(f"训练时长：{valid_duration} 分钟")
finally:
    print("配置处理结束")
[/代码]

[文本]
尝试输入文字、0、负数或超过范围的数值，观察程序如何进入不同异常处理流程。
