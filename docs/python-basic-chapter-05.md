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
- 为后续学习循环、函数和容器类型建立基础

---

# 第五章：条件判断

章节简介：学习使用 if、elif 和 else，让程序根据不同条件执行不同代码，并掌握缩进、多条件判断和嵌套判断。
预计学习时间：80 分钟

章节学习目标：
- 能使用 if 编写单分支判断
- 能使用 if...else 编写二选一逻辑
- 能使用 if...elif...else 处理多个区间
- 能正确书写冒号和缩进
- 能结合比较运算符与逻辑运算符编写条件
- 能阅读条件代码并判断程序最终执行分支
- 能识别常见条件判断错误
- 能完成一个简单的 Battle 资格判断程序

---

## 课时 1：使用 if 执行条件代码

课时简介：学习最基本的单分支条件判断。
预计学习时间：12 分钟

### 正文

[标题]
程序可以根据条件决定是否执行代码

[文本]
前面的程序通常从上到下执行每一行代码。现实应用中，很多操作只有在条件满足时才应该执行。

例如，只有测验分数达到 60 分时，才显示“测验通过”。

Python 使用 if 编写条件判断。

[代码 language=python]
score = 75

if score >= 60:
    print("测验通过")
[/代码]

[文本]
if 后面是条件 score >= 60。条件成立时，缩进的 print() 会执行；条件不成立时，这行代码会被跳过。

[标题]
if 语句的基本结构

[代码 language=python]
if 条件:
    条件成立时执行的代码
[/代码]

[文本]
if 条件后面必须写英文冒号。需要在条件成立时执行的代码必须缩进。

[示例 title=检查是否达到 Battle 解锁条件]
说明：Rating 达到 1000 时输出解锁提示。
语言：python

rating = 1050

if rating >= 1000:
    print("已解锁排位 Battle")
[/示例]

[提示 title=条件结果必须能判断真假]
比较表达式通常会得到 True 或 False，例如 score >= 60、rating == 1000。

### 课时题目

#### 题目 1

题型：SINGLE_CHOICE
题干：用户的测验分数为 72。下面哪段代码会在分数达到 60 时输出“测验通过”？

难度：EASY
分值：10
知识点：if、大于等于、单分支
是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：代码用途

选项：
- A. if score >= 60: print("测验通过") [正确]
- B. if score = 60: print("测验通过")
- C. if score <= 60: print("测验通过")
- D. if score >== 60: print("测验通过")

解析：
达到及格线应判断 score >= 60。= 是赋值符号，<= 表示小于等于，>== 不是合法运算符。

#### 题目 2

题型：FILL_BLANK
题干：Python 的 if 条件后面必须填写英文符号 ______。

难度：EASY
分值：10
知识点：if、冒号、语法
是否用于 Battle：否

可接受答案：
- :
- 冒号
- 英文冒号

判题设置：
- 忽略大小写：是
- 忽略首尾空格：是
- 合并连续空格：是
- 最长字符数：20

解析：
Python 的 if 条件后必须使用英文冒号 :，用于表示接下来开始条件代码块。

#### 题目 3

题型：CODE_FILL
题干：课程要求学习进度达到 100% 时显示“课程已完成”。请补全条件表达式。

难度：EASY
分值：10
知识点：if、相等比较、变量
是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：代码填空

题目代码：
```python
progress = 100

if __________________:
    print("课程已完成")
```

可接受答案：
```python
progress == 100
```

```python
progress >= 100
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
当 progress 等于 100 时课程完成，因此可以使用 progress == 100。使用 progress >= 100 也能避免进度异常超过 100 时漏判。

标准完整代码：
```python
progress = 100

if progress == 100:
    print("课程已完成")
```

---

## 课时 2：使用 if...else 处理两种结果

课时简介：学习条件成立和不成立时分别执行不同代码。
预计学习时间：12 分钟

### 正文

[标题]
二选一的程序逻辑

[文本]
如果程序需要在两个结果中选择一个，可以使用 if...else。

[代码 language=python]
score = 55

if score >= 60:
    print("测验通过")
else:
    print("测验未通过")
[/代码]

[文本]
条件成立时执行 if 代码块；条件不成立时执行 else 代码块。两部分只会执行其中一个。

[示例 title=判断好友房是否可加入]
说明：房间未满时允许加入，已满时显示提示。
语言：python

is_full = False

if not is_full:
    print("可以加入房间")
else:
    print("房间已满")
[/示例]

[警告 title=else 后面不能再写条件]
else 表示前面条件不成立时的其余情况，因此 else 后面直接写冒号，不写比较表达式。

### 课时题目

#### 题目 4

题型：SINGLE_CHOICE
题干：下面程序会输出什么？

```python
score = 58

if score >= 60:
    print("通过")
else:
    print("未通过")
```

难度：EASY
分值：10
知识点：if、else、分支执行
是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：输出预测

选项：
- A. 通过
- B. 未通过 [正确]
- C. 通过和未通过
- D. 程序没有输出

解析：
58 小于 60，if 条件不成立，因此执行 else 代码块并输出“未通过”。

#### 题目 5

题型：FILL_BLANK
题干：当 if 条件不成立时，可以使用关键字 ______ 执行另一段代码。

难度：EASY
分值：10
知识点：else、分支
是否用于 Battle：否

可接受答案：
- else

判题设置：
- 忽略大小写：否
- 忽略首尾空格：是
- 合并连续空格：是
- 最长字符数：20

解析：
else 用于处理 if 条件不成立时的情况。

#### 题目 6

题型：CODE_FILL
题干：玩家当前没有被禁赛。请补全 else 分支，使被禁赛时输出“暂时无法参加对战”。

难度：MEDIUM
分值：10
知识点：if、else、bool
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码填空

题目代码：
```python
is_banned = False

if not is_banned:
    print("可以参加对战")
else:
    __________________________
```

可接受答案：
```python
print("暂时无法参加对战")
```

```python
print('暂时无法参加对战')
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
else 分支在 is_banned 为 True 时执行，因此应输出“暂时无法参加对战”。

标准完整代码：
```python
is_banned = False

if not is_banned:
    print("可以参加对战")
else:
    print("暂时无法参加对战")
```

---

## 课时 3：使用 elif 处理多个区间

课时简介：学习按顺序检查多个条件。
预计学习时间：14 分钟

### 正文

[标题]
不止两种结果时使用 elif

[文本]
当程序需要处理多个互斥结果时，可以在 if 和 else 之间加入 elif。

[代码 language=python]
score = 85

if score >= 90:
    print("优秀")
elif score >= 60:
    print("通过")
else:
    print("未通过")
[/代码]

[文本]
Python 会从上到下检查条件。一旦某个条件成立，就执行对应代码块，并跳过后面的其他分支。

85 不满足 score >= 90，但满足 score >= 60，因此输出“通过”。

[标题]
条件顺序非常重要

[文本]
范围更严格的条件通常应该写在前面。

错误顺序：

[代码 language=python]
score = 95

if score >= 60:
    print("通过")
elif score >= 90:
    print("优秀")
[/代码]

[文本]
95 先满足 score >= 60，所以程序直接输出“通过”，后面的“优秀”永远没有机会执行。

[示例 title=根据 Rating 显示等级]
说明：从高到低判断玩家等级。
语言：python

rating = 1350

if rating >= 1500:
    print("黄金")
elif rating >= 1200:
    print("白银")
elif rating >= 1000:
    print("青铜")
else:
    print("新手")
[/示例]

### 课时题目

#### 题目 7

题型：SINGLE_CHOICE
题干：下面程序会输出什么？

```python
score = 92

if score >= 90:
    print("优秀")
elif score >= 60:
    print("通过")
else:
    print("未通过")
```

难度：EASY
分值：10
知识点：elif、分支顺序
是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：输出预测

选项：
- A. 优秀 [正确]
- B. 通过
- C. 未通过
- D. 优秀和通过

解析：
92 首先满足 score >= 90，因此执行第一个分支并输出“优秀”。命中后不会继续执行 elif。

#### 题目 8

题型：SINGLE_CHOICE
题干：为了正确区分“优秀、通过、未通过”，下面哪种条件顺序更合理？

难度：MEDIUM
分值：10
知识点：elif、条件顺序、区间判断
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：Bug 定位

选项：
- A. 先判断 score >= 90，再判断 score >= 60 [正确]
- B. 先判断 score >= 60，再判断 score >= 90
- C. 两个条件顺序完全没有影响
- D. 只需要判断 score == 60

解析：
更严格的高分条件应放在前面。如果先判断 score >= 60，那么所有 90 分以上的成绩也会提前进入“通过”分支。

#### 题目 9

题型：CODE_FILL
题干：系统根据 Rating 显示玩家段位。Rating 达到 1200 但不足 1500 时显示“白银”。请补全 elif 条件。

难度：MEDIUM
分值：10
知识点：elif、比较运算、条件顺序
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码填空

题目代码：
```python
rating = 1300

if rating >= 1500:
    print("黄金")
elif __________________:
    print("白银")
else:
    print("青铜")
```

可接受答案：
```python
rating >= 1200
```

```python
1200 <= rating < 1500
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
第一个 if 已经排除了 rating >= 1500 的情况，因此 elif 只需判断 rating >= 1200。链式比较 1200 <= rating < 1500 也正确。

标准完整代码：
```python
rating = 1300

if rating >= 1500:
    print("黄金")
elif rating >= 1200:
    print("白银")
else:
    print("青铜")
```

---

## 课时 4：缩进决定代码属于哪个分支

课时简介：理解 Python 使用缩进组织代码块。
预计学习时间：12 分钟

### 正文

[标题]
Python 用缩进表示代码层级

[文本]
在 Python 中，缩进不是装饰，而是语法的一部分。缩进代码属于 if、elif 或 else 对应的代码块。

[代码 language=python]
score = 80

if score >= 60:
    print("测验通过")
    print("章节进度已更新")

print("程序结束")
[/代码]

[文本]
前两条缩进语句只在条件成立时执行；最后一条没有缩进，因此无论条件是否成立都会执行。

[警告 title=同一代码块缩进应保持一致]
不要在同一代码块中混用不同数量的空格。通常推荐每一级缩进使用 4 个空格。

[示例 title=条件内执行多条语句]
说明：通过测验后同时显示提示并更新状态。
语言：python

score = 75

if score >= 60:
    status = "已完成"
    print("测验通过")
    print(status)
[/示例]

### 课时题目

#### 题目 10

题型：SINGLE_CHOICE
题干：下面程序中，哪条语句无论 score 是否达到 60 都会执行？

```python
score = 50

if score >= 60:
    print("通过")
    print("更新进度")

print("返回课程页")
```

难度：MEDIUM
分值：10
知识点：缩进、代码块
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码阅读

选项：
- A. print("通过")
- B. print("更新进度")
- C. print("返回课程页") [正确]
- D. 三条都会执行

解析：
“返回课程页”没有缩进，不属于 if 代码块，因此无论条件真假都会执行。前两条只有条件成立时执行。

#### 题目 11

题型：FILL_BLANK
题干：Python 通常推荐每一级代码块使用 ______ 个空格缩进。

难度：EASY
分值：10
知识点：缩进、代码风格
是否用于 Battle：否

可接受答案：
- 4
- 四
- 4个
- 四个

判题设置：
- 忽略大小写：是
- 忽略首尾空格：是
- 合并连续空格：是
- 最长字符数：20

解析：
Python 官方风格通常建议每一级缩进使用 4 个空格。

#### 题目 12

题型：CODE_FILL
题干：测验通过后，系统需要同时输出“测验通过”和“进度已更新”。请补全缺少的缩进代码。

难度：MEDIUM
分值：10
知识点：if、缩进、多条语句
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码填空

题目代码：
```python
score = 80

if score >= 60:
    print("测验通过")
    ____________________

print("程序结束")
```

可接受答案：
```python
print("进度已更新")
```

```python
print('进度已更新')
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
第二条提示必须与 print("测验通过") 保持相同缩进，才能在条件成立时一起执行。

标准完整代码：
```python
score = 80

if score >= 60:
    print("测验通过")
    print("进度已更新")

print("程序结束")
```

---

## 课时 5：组合多个条件

课时简介：在条件判断中使用 and、or 和 not。
预计学习时间：15 分钟

### 正文

[标题]
多个条件同时成立

[文本]
and 适合“多个要求必须全部满足”的情况。

[代码 language=python]
rating = 1100
completed_courses = 2

if rating >= 1000 and completed_courses >= 1:
    print("可以参加排位 Battle")
[/代码]

[标题]
至少满足一个条件

[文本]
or 适合“多个条件中满足任意一个即可”的情况。

[代码 language=python]
is_owner = False
is_admin = True

if is_owner or is_admin:
    print("允许删除帖子")
[/代码]

[标题]
反转条件

[代码 language=python]
is_banned = False

if not is_banned:
    print("账号状态正常")
[/代码]

[示例 title=好友房加入条件]
说明：房间未满并且对局尚未开始时允许加入。
语言：python

is_full = False
battle_started = False

if not is_full and not battle_started:
    print("可以加入好友房")
else:
    print("当前无法加入")
[/示例]

### 课时题目

#### 题目 13

题型：SINGLE_CHOICE
题干：只有 Rating 达到 1000，并且至少完成 1 门课程，用户才能参加排位 Battle。下面哪个条件正确？

难度：MEDIUM
分值：10
知识点：and、比较运算、多条件判断
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码用途

选项：
- A. rating >= 1000 or completed_courses >= 1
- B. rating >= 1000 and completed_courses >= 1 [正确]
- C. not rating >= 1000
- D. rating == completed_courses

解析：
题目要求两个条件同时满足，因此应使用 and。or 只要求至少一个条件成立。

#### 题目 14

题型：FILL_BLANK
题干：房间未满并且对局尚未开始时允许加入。两个条件需要使用逻辑运算符 ______ 连接。

难度：EASY
分值：10
知识点：and、条件组合
是否用于 Battle：否

可接受答案：
- and

判题设置：
- 忽略大小写：否
- 忽略首尾空格：是
- 合并连续空格：是
- 最长字符数：20

解析：
两个要求都必须成立，因此使用 and。

#### 题目 15

题型：CODE_FILL
题干：系统规定帖子作者或管理员都可以删除帖子。请补全 if 条件。

难度：MEDIUM
分值：10
知识点：or、权限判断
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码填空

题目代码：
```python
is_author = False
is_admin = True

if __________________________:
    print("允许删除帖子")
else:
    print("没有删除权限")
```

可接受答案：
```python
is_author or is_admin
```

```python
is_admin or is_author
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
作者身份和管理员身份只需满足其中一个，因此应使用 or 连接。

标准完整代码：
```python
is_author = False
is_admin = True

if is_author or is_admin:
    print("允许删除帖子")
else:
    print("没有删除权限")
```

---

## 课时 6：嵌套条件判断

课时简介：在一个条件分支内部继续进行判断。
预计学习时间：17 分钟

### 正文

[标题]
条件内部还可以继续判断

[文本]
当第二个条件只在第一个条件成立后才有意义时，可以使用嵌套 if。

[代码 language=python]
is_logged_in = True
rating = 1100

if is_logged_in:
    if rating >= 1000:
        print("可以参加排位 Battle")
    else:
        print("Rating 暂未达到要求")
else:
    print("请先登录")
[/代码]

[文本]
程序先判断是否登录。只有登录后，才继续检查 Rating。

[标题]
不要过度嵌套

[文本]
嵌套层级过多会让代码难以阅读。能够使用 and 合并的简单条件，可以优先使用 and。

下面两种写法在当前场景下效果相近：

[代码 language=python]
if is_logged_in:
    if rating >= 1000:
        print("允许参加")
[/代码]

[代码 language=python]
if is_logged_in and rating >= 1000:
    print("允许参加")
[/代码]

[示例 title=检查课程与测验状态]
说明：只有课程已开始后，才继续判断测验是否通过。
语言：python

course_started = True
quiz_passed = False

if course_started:
    if quiz_passed:
        print("章节已完成")
    else:
        print("请先通过章节测验")
else:
    print("请先开始课程")
[/示例]

[提示 title=嵌套适合表达先后依赖]
如果第二个判断依赖第一个判断的结果，嵌套结构通常更容易表达业务流程。

### 课时题目

#### 题目 16

题型：SINGLE_CHOICE
题干：下面程序会输出什么？

```python
is_logged_in = True
rating = 950

if is_logged_in:
    if rating >= 1000:
        print("可以参加排位 Battle")
    else:
        print("Rating 暂未达到要求")
else:
    print("请先登录")
```

难度：MEDIUM
分值：10
知识点：嵌套 if、分支执行
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：输出预测

选项：
- A. 可以参加排位 Battle
- B. Rating 暂未达到要求 [正确]
- C. 请先登录
- D. 程序没有输出

解析：
is_logged_in 为 True，因此进入外层 if。rating 为 950，不满足 rating >= 1000，所以执行内层 else。

#### 题目 17

题型：SINGLE_CHOICE
题干：在“先判断是否登录，再判断 Rating”这一场景中，嵌套 if 的主要作用是什么？

难度：MEDIUM
分值：10
知识点：嵌套判断、业务流程
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码用途

选项：
- A. 让第二个判断只在登录后执行 [正确]
- B. 让程序同时执行所有分支
- C. 取消缩进要求
- D. 把布尔值转换为字符串

解析：
嵌套 if 可以表达判断之间的先后依赖：只有登录成功后，检查 Rating 才有意义。

#### 题目 18

题型：CODE_FILL
题干：用户已经开始课程。系统需要继续判断是否通过章节测验；通过时输出“章节已完成”，否则输出“请先通过章节测验”。请补全内层判断。

难度：MEDIUM
分值：10
知识点：嵌套 if、bool、else
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码填空

题目代码：
```python
course_started = True
quiz_passed = False

if course_started:
    if __________:
        print("章节已完成")
    else:
        print("请先通过章节测验")
else:
    print("请先开始课程")
```

可接受答案：
```python
quiz_passed
```

```python
quiz_passed == True
```

```python
quiz_passed is True
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
quiz_passed 本身就是布尔值，可以直接作为 if 条件。当前值为 False，因此程序会输出“请先通过章节测验”。

标准完整代码：
```python
course_started = True
quiz_passed = False

if course_started:
    if quiz_passed:
        print("章节已完成")
    else:
        print("请先通过章节测验")
else:
    print("请先开始课程")
```

---

## 第五章总结

[标题]
你已经能够让程序根据条件作出选择

[文本]
本章学习了：

- 使用 if 编写单分支判断
- 使用 if...else 处理两个结果
- 使用 if...elif...else 处理多个区间
- 使用缩进组织条件代码块
- 使用 and、or、not 组合条件
- 使用嵌套 if 表达有先后依赖的判断流程
- 按从严格到宽松的顺序安排多个条件

下一章将学习 for、while、range()、break 和 continue，让程序能够重复执行任务。

---

## 第五章综合挑战（不计分）

[标题]
制作 Battle 参赛资格判断程序

[文本]
请编写一个程序，根据以下规则判断用户能否参加排位 Battle：

1. 用户必须已经登录
2. Rating 必须大于等于 1000
3. 至少完成 1 门课程
4. 账号不能处于禁赛状态

如果全部满足，输出“可以参加排位 Battle”。

否则根据实际情况输出：

- “请先登录”
- “Rating 暂未达到要求”
- “请先完成至少一门课程”
- “账号当前处于禁赛状态”

参考代码：

[代码 language=python]
is_logged_in = True
rating = 1080
completed_courses = 2
is_banned = False

if not is_logged_in:
    print("请先登录")
elif rating < 1000:
    print("Rating 暂未达到要求")
elif completed_courses < 1:
    print("请先完成至少一门课程")
elif is_banned:
    print("账号当前处于禁赛状态")
else:
    print("可以参加排位 Battle")
[/代码]

[文本]
尝试修改四个变量，观察程序会进入哪个分支。思考为什么这些条件的检查顺序能够让提示更加明确。
