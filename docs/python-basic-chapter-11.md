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

# 第十一章：模块、包与常用标准库

章节简介：学习使用 import 导入模块，理解模块与包的作用，并掌握 math、random、datetime 等常用标准库的基础用法。
预计学习时间：100 分钟

章节学习目标：
- 理解模块用于组织和复用代码
- 能使用 import 导入模块
- 能使用 from...import 导入指定内容
- 能使用 as 设置别名
- 能创建并导入自己的模块
- 理解包用于组织多个模块
- 能使用 math 完成常见数学计算
- 能使用 random 生成随机结果
- 能使用 datetime 处理基础日期和时间
- 能避免常见导入错误和命名冲突
- 能阅读包含模块调用的代码并判断运行结果

---

## 课时 1：认识模块与 import

课时简介：理解模块的作用，并学习导入整个模块。
预计学习时间：15 分钟

### 正文

[标题]
模块是一个 Python 文件

[文本]
当程序越来越大时，把所有函数和变量都写在同一个文件中会变得难以维护。

Python 可以把相关代码放进不同文件。一个以 .py 结尾的 Python 文件通常就可以作为一个模块。

例如：

- score_utils.py：保存得分计算函数
- user_utils.py：保存用户相关函数
- course_utils.py：保存课程相关函数

[标题]
使用 import 导入模块

[代码 language=python]
import math

print(math.sqrt(16))
[/代码]

[文本]
import math 导入 Python 标准库中的 math 模块。

调用模块中的功能时，通常写成“模块名.功能名”。

math.sqrt(16) 表示调用 math 模块中的 sqrt() 函数，计算 16 的平方根。

[标题]
模块名可以帮助说明功能来源

[代码 language=python]
import math

result = math.ceil(3.2)
print(result)
[/代码]

[文本]
看到 math.ceil() 时，可以立刻知道 ceil() 来自 math 模块。

[示例 title=计算题目数量的平方根]
说明：导入 math 模块并使用 sqrt()。
语言：python

import math

question_count = 25
result = math.sqrt(question_count)

print(result)
[/示例]

[提示 title=标准库不需要额外安装]
math、random 和 datetime 都属于 Python 标准库，安装 Python 后通常可以直接使用。

[警告 title=不要忘记模块名前缀]
使用 import math 后，调用 sqrt() 时需要写 math.sqrt()，直接写 sqrt() 通常会报错。

### 课时题目

#### 题目 1

题型：SINGLE_CHOICE
题干：下面哪行代码可以正确导入 Python 的 math 模块？

难度：EASY
分值：10
知识点：import、模块导入
是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：代码纠错

选项：
- A. import math [正确]
- B. include math
- C. using math
- D. load math

解析：
Python 使用 import 关键字导入模块，因此 import math 是正确写法。

#### 题目 2

题型：FILL_BLANK
题干：Python 中用于导入模块的关键字是 ______。

难度：EASY
分值：10
知识点：import、模块
是否用于 Battle：否

可接受答案：
- import

判题设置：
- 忽略大小写：否
- 忽略首尾空格：是
- 合并连续空格：是
- 最长字符数：20

解析：
Python 使用 import 导入模块。

#### 题目 3

题型：CODE_FILL
题干：程序已经导入 math 模块。请补全代码，计算 81 的平方根。

难度：EASY
分值：10
知识点：math、sqrt、模块调用
是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：代码填空

题目代码：
```python
import math

result = __________________
print(result)
```

可接受答案：
```python
math.sqrt(81)
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
使用 import math 导入模块后，应通过 math.sqrt(81) 调用平方根函数，结果为 9.0。

标准完整代码：
```python
import math

result = math.sqrt(81)
print(result)
```

---

## 课时 2：from...import 与 as 别名

课时简介：学习导入模块中的指定功能，并使用别名简化名称。
预计学习时间：16 分钟

### 正文

[标题]
只导入需要的功能

[代码 language=python]
from math import sqrt

print(sqrt(25))
[/代码]

[文本]
from math import sqrt 表示只从 math 模块中导入 sqrt。

这种写法导入后，可以直接调用 sqrt()，不再写 math.sqrt()。

[标题]
一次导入多个功能

[代码 language=python]
from math import sqrt, ceil

print(sqrt(36))
print(ceil(3.2))
[/代码]

[标题]
使用 as 设置别名

[代码 language=python]
import datetime as dt

current_time = dt.datetime.now()
print(current_time)
[/代码]

[文本]
as 可以给模块或导入内容设置别名。

别名通常用于：

- 缩短过长名称
- 避免命名冲突
- 遵循常见编程习惯

[代码 language=python]
from math import sqrt as square_root

print(square_root(49))
[/代码]

[示例 title=使用别名生成当前日期]
说明：把 datetime 模块命名为 dt。
语言：python

import datetime as dt

today = dt.date.today()
print(today)
[/示例]

[警告 title=不要导入过多同名内容]
如果不同模块中存在相同名称，直接导入可能产生冲突。使用模块前缀或别名通常更安全。

### 课时题目

#### 题目 4

题型：SINGLE_CHOICE
题干：执行下面代码后，应该如何调用 sqrt()？

```python
from math import sqrt
```

难度：EASY
分值：10
知识点：from import、函数导入
是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：代码用途

选项：
- A. math.sqrt(16)
- B. sqrt(16) [正确]
- C. import.sqrt(16)
- D. math->sqrt(16)

解析：
from math import sqrt 会把 sqrt 直接导入当前文件，因此可以直接调用 sqrt(16)。

#### 题目 5

题型：FILL_BLANK
题干：Python 中用于给模块或函数设置别名的关键字是 ______。

难度：EASY
分值：10
知识点：as、别名
是否用于 Battle：否

可接受答案：
- as

判题设置：
- 忽略大小写：否
- 忽略首尾空格：是
- 合并连续空格：是
- 最长字符数：20

解析：
as 用于设置别名，例如 import datetime as dt。

#### 题目 6

题型：CODE_FILL
题干：程序需要把 datetime 模块设置为别名 dt。请补全导入语句。

难度：MEDIUM
分值：10
知识点：import、as、模块别名
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码填空

题目代码：
```python
import datetime ______ dt

today = dt.date.today()
print(today)
```

可接受答案：
```python
as
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
完整写法是 import datetime as dt，其中 as 用于指定别名。

标准完整代码：
```python
import datetime as dt

today = dt.date.today()
print(today)
```

---

## 课时 3：创建自己的模块

课时简介：学习把函数放到独立文件中并在其他文件里导入。
预计学习时间：18 分钟

### 正文

[标题]
把重复功能放入独立文件

[文本]
假设项目中多处都需要计算 Battle 得分，可以创建 score_utils.py。

score_utils.py：

[代码 language=python]
def calculate_score(correct_count, wrong_count):
    return correct_count * 2 - wrong_count
[/代码]

主程序 main.py：

[代码 language=python]
import score_utils

score = score_utils.calculate_score(8, 2)
print(score)
[/代码]

[文本]
main.py 导入 score_utils 后，就能复用其中的函数。

[标题]
从自己的模块导入指定函数

[代码 language=python]
from score_utils import calculate_score

score = calculate_score(8, 2)
print(score)
[/代码]

[标题]
模块文件名应符合命名规则

[文本]
推荐模块文件名使用小写字母和下划线，例如：

- score_utils.py
- battle_rules.py
- course_helpers.py

不要使用：

- 2score.py
- score-utils.py
- math.py

[文本]
最后一个例子虽然语法上可能可以创建，但会与标准库 math 发生名称冲突，不建议使用。

[标题]
使用特殊变量判断是否直接运行

[代码 language=python]
def calculate_score(correct_count, wrong_count):
    return correct_count * 2 - wrong_count

if __name__ == "__main__":
    print(calculate_score(8, 2))
[/代码]

[文本]
当文件被直接运行时，__name__ 的值通常是 "__main__"。

当文件被其他模块导入时，这个测试代码块不会自动执行。

[示例 title=创建课程工具模块]
说明：course_utils.py 中提供格式化课程标题的函数。
语言：python

# course_utils.py
def build_course_title(course_name, chapter_name):
    return f"{course_name} - {chapter_name}"
[/示例]

[警告 title=模块必须位于可导入位置]
自己的模块通常需要和主程序位于同一目录，或处于 Python 能找到的模块路径中。

### 课时题目

#### 题目 7

题型：SINGLE_CHOICE
题干：项目中有一个 score_utils.py 文件，下面哪种写法可以导入它？

难度：EASY
分值：10
知识点：自定义模块、import
是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：代码用途

选项：
- A. import score_utils [正确]
- B. import score_utils.py
- C. include score_utils
- D. load "score_utils.py"

解析：
导入 Python 模块时通常不写 .py 后缀，因此应使用 import score_utils。

#### 题目 8

题型：FILL_BLANK
题干：Python 文件被直接运行时，特殊变量 __name__ 的值通常是 ______。

难度：MEDIUM
分值：10
知识点：__name__、__main__
是否用于 Battle：否

可接受答案：
- __main__
- "__main__"
- '__main__'

判题设置：
- 忽略大小写：否
- 忽略首尾空格：是
- 合并连续空格：是
- 最长字符数：30

解析：
文件被直接运行时，__name__ 通常等于 "__main__"。

#### 题目 9

题型：CODE_FILL
题干：score_utils.py 中已经定义 calculate_score()。请补全代码，从模块中导入该函数。

难度：MEDIUM
分值：10
知识点：自定义模块、from import
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码填空

题目代码：
```python
from score_utils import __________________

score = calculate_score(8, 2)
print(score)
```

可接受答案：
```python
calculate_score
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
要直接调用 calculate_score()，应从 score_utils 中导入同名函数。

标准完整代码：
```python
from score_utils import calculate_score

score = calculate_score(8, 2)
print(score)
```

---

## 课时 4：使用 math 标准库

课时简介：学习常见数学函数和常量。
预计学习时间：17 分钟

### 正文

[标题]
math 提供常见数学功能

[代码 language=python]
import math
[/代码]

[标题]
sqrt() 计算平方根

[代码 language=python]
print(math.sqrt(64))
[/代码]

[标题]
ceil() 向上取整

[代码 language=python]
print(math.ceil(3.2))
[/代码]

[文本]
3.2 向上取整得到 4。

[标题]
floor() 向下取整

[代码 language=python]
print(math.floor(3.8))
[/代码]

[文本]
3.8 向下取整得到 3。

[标题]
pow() 计算幂

[代码 language=python]
print(math.pow(2, 3))
[/代码]

[文本]
math.pow(2, 3) 结果是 8.0。

[标题]
使用 pi 常量

[代码 language=python]
radius = 2
area = math.pi * radius ** 2

print(area)
[/代码]

[示例 title=计算分页总页数]
说明：总题目数除以每页数量后向上取整。
语言：python

import math

question_count = 23
page_size = 5

total_pages = math.ceil(question_count / page_size)

print(total_pages)
[/示例]

[提示 title=分页总页数适合向上取整]
即使最后一页只有少量数据，也仍然占一页，因此常使用 ceil()。

### 课时题目

#### 题目 10

题型：SINGLE_CHOICE
题干：题库有 23 道题，每页显示 5 道。下面哪个函数适合计算总页数？

难度：MEDIUM
分值：10
知识点：math.ceil、分页
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码用途

选项：
- A. math.floor()
- B. math.ceil() [正确]
- C. math.sqrt()
- D. math.pi()

解析：
23 / 5 等于 4.6，但仍需要 5 页，因此应使用 math.ceil() 向上取整。

#### 题目 11

题型：FILL_BLANK
题干：math 模块中，用于计算平方根的函数是 ______。

难度：EASY
分值：10
知识点：math.sqrt
是否用于 Battle：否

可接受答案：
- sqrt
- sqrt()
- math.sqrt
- math.sqrt()

判题设置：
- 忽略大小写：否
- 忽略首尾空格：是
- 合并连续空格：是
- 最长字符数：30

解析：
math.sqrt(value) 用于计算平方根。

#### 题目 12

题型：CODE_FILL
题干：题库共有 41 道题，每页显示 10 道。请补全代码，向上取整得到总页数 5。

难度：MEDIUM
分值：10
知识点：math.ceil、除法、分页
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码填空

题目代码：
```python
import math

question_count = 41
page_size = 10

total_pages = ______________________________
print(total_pages)
```

可接受答案：
```python
math.ceil(question_count / page_size)
```

```python
math.ceil(41 / 10)
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
41 / 10 等于 4.1，需要向上取整为 5，因此使用 math.ceil()。

标准完整代码：
```python
import math

question_count = 41
page_size = 10

total_pages = math.ceil(question_count / page_size)
print(total_pages)
```

---

## 课时 5：使用 random 标准库

课时简介：学习生成随机整数、随机选择和随机打乱。
预计学习时间：18 分钟

### 正文

[标题]
random 用于生成随机结果

[代码 language=python]
import random
[/代码]

[标题]
randint() 生成指定范围内的随机整数

[代码 language=python]
number = random.randint(1, 10)
print(number)
[/代码]

[文本]
randint(1, 10) 可能返回 1 到 10 之间的任意整数，并且包含 1 和 10。

[标题]
choice() 随机选择一个元素

[代码 language=python]
courses = ["Python", "Git", "MySQL"]
selected_course = random.choice(courses)

print(selected_course)
[/代码]

[标题]
shuffle() 原地打乱列表

[代码 language=python]
questions = [1, 2, 3, 4, 5]
random.shuffle(questions)

print(questions)
[/代码]

[文本]
shuffle() 会直接修改原列表顺序，不返回新的打乱列表。

[示例 title=随机抽取 Battle 题目]
说明：从题目编号列表中随机选择一道题。
语言：python

import random

question_ids = [101, 102, 103, 104, 105]
selected_question_id = random.choice(question_ids)

print(selected_question_id)
[/示例]

[警告 title=随机不等于安全]
random 适合普通教学、游戏和抽题，不适合密码、密钥等安全场景。

[提示 title=测试时随机结果可能不同]
每次运行 random 代码时，结果可能变化，这是正常现象。

### 课时题目

#### 题目 13

题型：SINGLE_CHOICE
题干：下面哪个函数可以从课程列表中随机选择一个元素？

难度：EASY
分值：10
知识点：random.choice、随机选择
是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：代码用途

选项：
- A. random.choice() [正确]
- B. random.ceil()
- C. random.sqrt()
- D. random.today()

解析：
random.choice(sequence) 可以从列表等序列中随机选择一个元素。

#### 题目 14

题型：FILL_BLANK
题干：random 模块中，用于原地打乱列表顺序的方法是 ______。

难度：EASY
分值：10
知识点：random.shuffle
是否用于 Battle：否

可接受答案：
- shuffle
- shuffle()
- random.shuffle
- random.shuffle()

判题设置：
- 忽略大小写：否
- 忽略首尾空格：是
- 合并连续空格：是
- 最长字符数：30

解析：
random.shuffle(list) 会直接打乱原列表顺序。

#### 题目 15

题型：CODE_FILL
题干：系统需要生成 1 到 100 之间的随机整数作为临时题目编号。请补全代码。

难度：MEDIUM
分值：10
知识点：random.randint、随机整数
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码填空

题目代码：
```python
import random

question_number = random.________________
print(question_number)
```

可接受答案：
```python
randint(1, 100)
```

```python
randint(1,100)
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
random.randint(1, 100) 会返回包含 1 和 100 在内的随机整数。

标准完整代码：
```python
import random

question_number = random.randint(1, 100)
print(question_number)
```

---

## 课时 6：使用 datetime 处理日期与时间

课时简介：学习获取当前日期时间并进行简单格式化。
预计学习时间：16 分钟

### 正文

[标题]
datetime 用于处理日期和时间

[代码 language=python]
import datetime
[/代码]

[标题]
获取当前日期

[代码 language=python]
today = datetime.date.today()
print(today)
[/代码]

[标题]
获取当前日期和时间

[代码 language=python]
now = datetime.datetime.now()
print(now)
[/代码]

[标题]
格式化日期时间

[代码 language=python]
now = datetime.datetime.now()
formatted_time = now.strftime("%Y-%m-%d %H:%M:%S")

print(formatted_time)
[/代码]

[文本]
strftime() 可以按照指定格式生成字符串。

常用格式：

- %Y：四位年份
- %m：两位月份
- %d：两位日期
- %H：小时
- %M：分钟
- %S：秒

[标题]
计算时间差

[代码 language=python]
start_time = datetime.datetime.now()
end_time = start_time + datetime.timedelta(minutes=3)

print(end_time)
[/代码]

[文本]
timedelta() 用于表示一段时间，例如 3 分钟、2 天或 10 秒。

[示例 title=计算 Battle 结束时间]
说明：对局时长为 3 分钟。
语言：python

import datetime

started_at = datetime.datetime.now()
expires_at = started_at + datetime.timedelta(minutes=3)

print(started_at)
print(expires_at)
[/示例]

[提示 title=实际服务端应使用统一时间来源]
在真实多人对战中，客户端时间可能不准确，通常应以服务端时间为准。本节只学习 Python 日期时间基础。

### 课时题目

#### 题目 16

题型：SINGLE_CHOICE
题干：下面哪个表达式可以获取当前日期？

难度：EASY
分值：10
知识点：datetime.date.today、当前日期
是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：代码用途

选项：
- A. datetime.date.today() [正确]
- B. datetime.random()
- C. math.today()
- D. datetime.sqrt()

解析：
datetime.date.today() 用于获取当前日期。

#### 题目 17

题型：FILL_BLANK
题干：datetime 中，用于表示一段时间长度的类型是 ______。

难度：MEDIUM
分值：10
知识点：timedelta、时间差
是否用于 Battle：否

可接受答案：
- timedelta
- datetime.timedelta
- timedelta()

判题设置：
- 忽略大小写：否
- 忽略首尾空格：是
- 合并连续空格：是
- 最长字符数：30

解析：
datetime.timedelta 用于表示时间差或持续时间。

#### 题目 18

题型：CODE_FILL
题干：Battle 从当前时间开始，持续 3 分钟。请补全代码计算结束时间。

难度：MEDIUM
分值：10
知识点：datetime、timedelta、时间计算
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码填空

题目代码：
```python
import datetime

started_at = datetime.datetime.now()
expires_at = started_at + ______________________________

print(expires_at)
```

可接受答案：
```python
datetime.timedelta(minutes=3)
```

```python
datetime.timedelta(seconds=180)
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
3 分钟可以使用 datetime.timedelta(minutes=3) 表示，也可以使用 180 秒表示。

标准完整代码：
```python
import datetime

started_at = datetime.datetime.now()
expires_at = started_at + datetime.timedelta(minutes=3)

print(expires_at)
```

---

## 第十一章总结

[标题]
你已经能够复用模块和标准库功能

[文本]
本章学习了：

- 理解模块就是可复用的 Python 文件
- 使用 import 导入整个模块
- 使用 from...import 导入指定功能
- 使用 as 设置别名
- 创建并导入自己的模块
- 使用 __name__ == "__main__" 区分直接运行和被导入
- 使用 math.sqrt() 计算平方根
- 使用 math.ceil() 和 math.floor() 取整
- 使用 math.pi 和 math.pow()
- 使用 random.randint() 生成随机整数
- 使用 random.choice() 随机选择元素
- 使用 random.shuffle() 打乱列表
- 使用 datetime.date.today() 获取当前日期
- 使用 datetime.datetime.now() 获取当前时间
- 使用 strftime() 格式化时间
- 使用 timedelta() 表示时间长度

下一章将学习文件操作，包括读取、写入、追加、with 语句和 JSON 数据基础。

---

## 第十一章综合挑战（不计分）

[标题]
制作随机 Battle 训练计划生成器

[文本]
请编写一个程序，完成以下任务：

1. 使用自定义函数 calculate_end_time() 计算训练结束时间
2. 使用 random.choice() 随机选择一门课程
3. 使用 random.randint() 随机生成 10 到 20 的题目数量
4. 使用 math.ceil() 计算每页 5 题时所需页数
5. 使用 datetime 获取开始时间
6. 使用 f-string 输出完整训练计划

参考代码：

[代码 language=python]
import datetime
import math
import random

def calculate_end_time(started_at, minutes):
    return started_at + datetime.timedelta(minutes=minutes)

courses = ["Python", "Git", "MySQL", "Linux"]

selected_course = random.choice(courses)
question_count = random.randint(10, 20)
page_size = 5
total_pages = math.ceil(question_count / page_size)

started_at = datetime.datetime.now()
expires_at = calculate_end_time(started_at, 15)

print(f"训练课程：{selected_course}")
print(f"题目数量：{question_count}")
print(f"练习页数：{total_pages}")
print(f"开始时间：{started_at.strftime('%Y-%m-%d %H:%M:%S')}")
print(f"结束时间：{expires_at.strftime('%Y-%m-%d %H:%M:%S')}")
[/代码]

[文本]
尝试修改训练时长、课程列表和每页题目数量，观察生成的训练计划如何变化。
