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

# 第四章：运算符与表达式

章节简介：学习使用算术运算符完成计算，使用比较运算符判断大小关系，并使用逻辑运算符组合多个条件。
预计学习时间：75 分钟

章节学习目标：
- 能使用加、减、乘、除完成基础计算
- 能理解整除、取余和幂运算
- 能使用复合赋值运算符更新变量
- 能理解常见运算优先级
- 能使用比较运算符得到布尔结果
- 能使用 and、or、not 组合或反转条件
- 能阅读包含多个运算符的简单表达式

---

## 课时 1：基础算术运算

课时简介：学习加、减、乘、除四种常用算术运算符。
预计学习时间：10 分钟

### 正文

[标题]
使用 Python 完成计算

[文本]
Python 可以直接完成常见数学计算。基础算术运算符包括：

- +：加法
- -：减法
- *：乘法
- /：除法

[代码 language=python]
a = 12
b = 4

print(a + b)
print(a - b)
print(a * b)
print(a / b)
[/代码]

[文本]
程序依次输出 16、8、48 和 3.0。使用 / 进行除法时，结果通常是浮点数。

[示例 title=计算 Battle 得分]
说明：每答对一题获得 2 分，计算 7 道正确题的总得分。
语言：python

correct_count = 7
score_per_question = 2
total_score = correct_count * score_per_question

print(total_score)
[/示例]

[提示 title=变量让计算更容易修改]
相比直接写 7 * 2，使用有意义的变量可以让代码更容易理解和调整。

### 课时题目

#### 题目 1

题型：SINGLE_CHOICE
题干：一场 Battle 中，玩家答对 8 道题，每题获得 2 分。下面哪个表达式可以计算总分？

难度：EASY
分值：10
知识点：乘法、变量、表达式
是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：代码用途

选项：
- A. 8 + 2
- B. 8 - 2
- C. 8 * 2 [正确]
- D. 8 / 2

解析：
总分等于答对题数乘以每题分数，因此应使用 8 * 2。加法只能得到 10，减法和除法也不符合计算规则。

#### 题目 2

题型：FILL_BLANK
题干：阅读代码，填写最终输出结果。

```python
question_count = 18
finished_count = 7
print(question_count - finished_count)
```

输出：______

难度：EASY
分值：10
知识点：减法、变量、程序输出
是否用于 Battle：否

可接受答案：
- 11

判题设置：
- 忽略大小写：是
- 忽略首尾空格：是
- 合并连续空格：是
- 最长字符数：20

解析：
18 - 7 等于 11，因此程序输出 11。

#### 题目 3

题型：CODE_FILL
题干：课程共有 12 个章节，用户已经完成 5 个。请补全代码，计算还剩多少章节未完成。

难度：EASY
分值：10
知识点：减法、变量、print
是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：代码填空

题目代码：
```python
total_chapters = 12
completed_chapters = 5

remaining_chapters = ______________________
print(remaining_chapters)
```

可接受答案：
```python
total_chapters - completed_chapters
```

```python
12 - 5
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
剩余章节数等于总章节数减去已完成章节数，因此应计算 total_chapters - completed_chapters。使用变量比直接写 12 - 5 更便于后续修改数据。

标准完整代码：
```python
total_chapters = 12
completed_chapters = 5

remaining_chapters = total_chapters - completed_chapters
print(remaining_chapters)
```

---

## 课时 2：整除、取余与幂运算

课时简介：学习 //、% 和 ** 三种常用算术运算符。
预计学习时间：12 分钟

### 正文

[标题]
整除 //

[文本]
整除运算符 // 会保留除法结果中的整数部分。

[代码 language=python]
print(17 // 5)
[/代码]

[文本]
17 除以 5 等于 3.4，整除结果是 3。

[标题]
取余 %

[文本]
取余运算符 % 会得到除法后的余数。

[代码 language=python]
print(17 % 5)
[/代码]

[文本]
17 除以 5 商 3 余 2，因此结果是 2。

[标题]
幂运算 **

[代码 language=python]
print(2 ** 3)
[/代码]

[文本]
2 ** 3 表示 2 的 3 次方，结果是 8。

[示例 title=计算完整页数和剩余题目]
说明：每页显示 5 道题，计算 17 道题能组成多少完整页，以及最后剩余多少题。
语言：python

question_count = 17
page_size = 5

full_pages = question_count // page_size
remaining_questions = question_count % page_size

print(full_pages)
print(remaining_questions)
[/示例]

[警告 title=不要混淆 / 和 //]
/ 表示普通除法，结果通常是浮点数；// 表示整除，只保留整数商。

### 课时题目

#### 题目 4

题型：SINGLE_CHOICE
题干：题库中有 23 道题，每页显示 5 道。下面哪个表达式可以计算完整页数？

难度：MEDIUM
分值：10
知识点：整除、分页
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码用途

选项：
- A. 23 / 5
- B. 23 // 5 [正确]
- C. 23 % 5
- D. 23 ** 5

解析：
完整页数只需要整数商，因此应使用整除 23 // 5，结果为 4。23 % 5 得到的是剩余题目数量 3。

#### 题目 5

题型：FILL_BLANK
题干：阅读代码，填写最终输出结果。

```python
question_count = 23
page_size = 5
print(question_count % page_size)
```

输出：______

难度：MEDIUM
分值：10
知识点：取余、分页
是否用于 Battle：否

可接受答案：
- 3

判题设置：
- 忽略大小写：是
- 忽略首尾空格：是
- 合并连续空格：是
- 最长字符数：20

解析：
23 除以 5 商 4 余 3，因此取余结果是 3。

#### 题目 6

题型：CODE_FILL
题干：系统需要计算 3 的 4 次方。请补全代码，使程序输出 81。

难度：MEDIUM
分值：10
知识点：幂运算、表达式
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码填空

题目代码：
```python
result = __________
print(result)
```

可接受答案：
```python
3 ** 4
```

```python
3*3*3*3
```

```python
3 * 3 * 3 * 3
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
Python 使用 ** 表示幂运算，3 ** 4 等于 81。连续相乘也能得到相同结果，但幂运算更清晰。

标准完整代码：
```python
result = 3 ** 4
print(result)
```

---

## 课时 3：复合赋值运算符

课时简介：学习用 +=、-=、*= 和 /= 简化变量更新。
预计学习时间：10 分钟

### 正文

[标题]
在原有值的基础上更新变量

[文本]
程序经常需要根据变量当前值进行更新。例如玩家答对一道题后增加 2 分。

普通写法：

[代码 language=python]
score = 10
score = score + 2
[/代码]

简化写法：

[代码 language=python]
score = 10
score += 2
[/代码]

[文本]
score += 2 等价于 score = score + 2。

常见复合赋值运算符：

- +=：增加后重新赋值
- -=：减少后重新赋值
- *=：相乘后重新赋值
- /=：相除后重新赋值

[示例 title=更新 Rating]
说明：玩家获胜后增加 25 Rating。
语言：python

rating = 1000
rating += 25

print(rating)
[/示例]

[警告 title=变量必须先有值]
执行 score += 2 之前，score 必须已经被赋值。

### 课时题目

#### 题目 7

题型：SINGLE_CHOICE
题干：下面哪行代码与 score = score + 2 的作用相同？

难度：EASY
分值：10
知识点：复合赋值、加法
是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：代码用途

选项：
- A. score += 2 [正确]
- B. score -= 2
- C. score *= 2
- D. score /= 2

解析：
+= 表示在变量原值基础上增加指定数值，并把结果重新保存到变量中。

#### 题目 8

题型：FILL_BLANK
题干：阅读代码，填写最终输出结果。

```python
rating = 1000
rating += 30
rating -= 10
print(rating)
```

输出：______

难度：MEDIUM
分值：10
知识点：复合赋值、程序执行顺序
是否用于 Battle：否

可接受答案：
- 1020

判题设置：
- 忽略大小写：是
- 忽略首尾空格：是
- 合并连续空格：是
- 最长字符数：20

解析：
rating 先从 1000 增加到 1030，再减少 10，最终结果是 1020。

#### 题目 9

题型：CODE_FILL
题干：玩家当前得分为 6，答对一道题后应增加 2 分。请补全代码，使用复合赋值更新分数。

难度：MEDIUM
分值：10
知识点：复合赋值、变量更新
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码填空

题目代码：
```python
score = 6
__________
print(score)
```

可接受答案：
```python
score += 2
```

```python
score = score + 2
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
score += 2 会在原值 6 的基础上增加 2，并把结果 8 重新保存到 score 中。普通赋值写法 score = score + 2 也等价。

标准完整代码：
```python
score = 6
score += 2
print(score)
```

---

## 课时 4：运算优先级与括号

课时简介：理解乘除优先于加减，并学习使用括号明确计算顺序。
预计学习时间：12 分钟

### 正文

[标题]
表达式不是总从左到右简单计算

[文本]
Python 会按照运算优先级处理表达式。乘法和除法通常先于加法和减法。

[代码 language=python]
result = 2 + 3 * 4
print(result)
[/代码]

[文本]
程序先计算 3 * 4，再加 2，因此结果是 14。

[标题]
括号可以改变计算顺序

[代码 language=python]
result = (2 + 3) * 4
print(result)
[/代码]

[文本]
括号中的 2 + 3 会先计算，因此结果是 20。

[示例 title=计算总奖励]
说明：基础奖励和额外奖励相加后，再乘以活动倍数。
语言：python

base_reward = 10
bonus_reward = 5
multiplier = 2

total_reward = (base_reward + bonus_reward) * multiplier
print(total_reward)
[/示例]

[提示 title=复杂表达式主动使用括号]
即使不加括号也能得到正确结果，适当使用括号仍能让代码更容易阅读。

### 课时题目

#### 题目 10

题型：SINGLE_CHOICE
题干：下面程序会输出什么？

```python
result = 5 + 2 * 3
print(result)
```

难度：MEDIUM
分值：10
知识点：运算优先级、乘法、加法
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：输出预测

选项：
- A. 21
- B. 11 [正确]
- C. 7
- D. 15

解析：
乘法优先于加法，先计算 2 * 3 得到 6，再计算 5 + 6，结果为 11。

#### 题目 11

题型：SINGLE_CHOICE
题干：系统需要先把基础奖励 10 和额外奖励 5 相加，再乘以 2。下面哪个表达式正确？

难度：MEDIUM
分值：10
知识点：括号、运算优先级
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码用途

选项：
- A. 10 + 5 * 2
- B. (10 + 5) * 2 [正确]
- C. 10 + (5 / 2)
- D. 10 * 5 + 2

解析：
题目要求先相加，再相乘，因此必须用括号明确先计算 10 + 5，之后再乘以 2。

#### 题目 12

题型：CODE_FILL
题干：课程总分由“平时分 60”和“测验分 20”相加后，再乘以 1.1 的奖励系数。请补全表达式，确保先做加法。

难度：MEDIUM
分值：10
知识点：括号、乘法、加法
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码填空

题目代码：
```python
regular_score = 60
quiz_score = 20
bonus_rate = 1.1

final_score = ______________________________
print(final_score)
```

可接受答案：
```python
(regular_score + quiz_score) * bonus_rate
```

```python
(60 + 20) * 1.1
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
题目要求先把 regular_score 和 quiz_score 相加，再乘以奖励系数，因此应使用括号控制计算顺序。

标准完整代码：
```python
regular_score = 60
quiz_score = 20
bonus_rate = 1.1

final_score = (regular_score + quiz_score) * bonus_rate
print(final_score)
```

---

## 课时 5：比较运算符

课时简介：学习比较两个值，并得到 True 或 False。
预计学习时间：14 分钟

### 正文

[标题]
比较结果是布尔值

[文本]
比较运算符用于判断两个值之间的关系，结果只有 True 或 False。

常见比较运算符：

- ==：等于
- !=：不等于
- >：大于
- <：小于
- >=：大于等于
- <=：小于等于

[代码 language=python]
score = 80

print(score >= 60)
print(score == 100)
[/代码]

[文本]
80 大于等于 60，因此第一个结果为 True；80 不等于 100，因此第二个结果为 False。

[警告 title=不要混淆 = 和 ==]
= 用于赋值，== 用于比较两个值是否相等。

[示例 title=检查是否达到及格线]
说明：比较测验分数是否大于等于 60。
语言：python

quiz_score = 75
passed = quiz_score >= 60

print(passed)
[/示例]

### 课时题目

#### 题目 13

题型：SINGLE_CHOICE
题干：下面哪个表达式用于判断 score 是否大于等于 60？

难度：EASY
分值：10
知识点：比较运算符、大于等于
是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：代码用途

选项：
- A. score = 60
- B. score >= 60 [正确]
- C. score => 60
- D. score >== 60

解析：
Python 使用 >= 表示大于等于。= 是赋值运算符，=> 和 >== 都不是合法写法。

#### 题目 14

题型：FILL_BLANK
题干：阅读代码，填写最终输出结果。

```python
rating = 1000
print(rating == 1000)
```

输出：______

难度：EASY
分值：10
知识点：相等比较、bool
是否用于 Battle：否

可接受答案：
- True

判题设置：
- 忽略大小写：否
- 忽略首尾空格：是
- 合并连续空格：是
- 最长字符数：20

解析：
rating 当前值就是 1000，使用 == 比较后条件成立，因此结果为 True。

#### 题目 15

题型：CODE_FILL
题干：章节测验分数为 72，及格线为 60。请补全代码，判断用户是否通过测验。

难度：MEDIUM
分值：10
知识点：比较运算符、大于等于、bool
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码填空

题目代码：
```python
quiz_score = 72
pass_score = 60

passed = ______________________
print(passed)
```

可接受答案：
```python
quiz_score >= pass_score
```

```python
72 >= 60
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
通过条件是测验分数大于等于及格线，因此应使用 quiz_score >= pass_score。结果为 True。

标准完整代码：
```python
quiz_score = 72
pass_score = 60

passed = quiz_score >= pass_score
print(passed)
```

---

## 课时 6：逻辑运算符

课时简介：学习使用 and、or 和 not 组合或反转条件。
预计学习时间：17 分钟

### 正文

[标题]
and：多个条件都要成立

[文本]
and 用于连接多个条件，只有所有条件都为 True，最终结果才是 True。

[代码 language=python]
is_logged_in = True
has_ticket = True

can_enter = is_logged_in and has_ticket
print(can_enter)
[/代码]

[标题]
or：至少一个条件成立

[文本]
or 连接的条件中，只要至少一个为 True，结果就是 True。

[代码 language=python]
is_owner = False
is_admin = True

can_delete = is_owner or is_admin
print(can_delete)
[/代码]

[标题]
not：反转布尔值

[代码 language=python]
battle_finished = False
print(not battle_finished)
[/代码]

[文本]
battle_finished 是 False，not 会把它反转为 True。

[示例 title=判断能否开始对局]
说明：只有两名玩家都已准备，才能开始对局。
语言：python

player_a_ready = True
player_b_ready = True

can_start = player_a_ready and player_b_ready
print(can_start)
[/示例]

[警告 title=逻辑运算符必须使用英文小写]
Python 使用 and、or、not，不能写成 &&、|| 或 !。

### 课时题目

#### 题目 16

题型：SINGLE_CHOICE
题干：只有玩家 A 和玩家 B 都准备完成，对局才能开始。下面哪个表达式符合要求？

难度：MEDIUM
分值：10
知识点：and、布尔表达式
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码用途

选项：
- A. player_a_ready or player_b_ready
- B. player_a_ready and player_b_ready [正确]
- C. not player_a_ready
- D. player_a_ready + player_b_ready

解析：
题目要求两个条件同时成立，因此应使用 and。or 只要求至少一个条件成立，不符合要求。

#### 题目 17

题型：FILL_BLANK
题干：系统允许“帖子作者”或“管理员”删除帖子。应使用逻辑运算符 ______ 连接两个条件。

难度：EASY
分值：10
知识点：or、逻辑表达式
是否用于 Battle：否

可接受答案：
- or

判题设置：
- 忽略大小写：否
- 忽略首尾空格：是
- 合并连续空格：是
- 最长字符数：20

解析：
只要作者身份或管理员身份中至少一个成立，就允许删除，因此应使用 or。

#### 题目 18

题型：CODE_FILL
题干：房间尚未满员时，系统允许新玩家加入。变量 is_full 表示房间是否已满。请补全代码，判断是否允许加入。

难度：MEDIUM
分值：10
知识点：not、bool、逻辑表达式
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码填空

题目代码：
```python
is_full = False

can_join = __________
print(can_join)
```

可接受答案：
```python
not is_full
```

```python
is_full == False
```

```python
is_full is False
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
is_full 为 False 表示房间没有满。not is_full 会把 False 反转为 True，因此 can_join 为 True。直接使用 not 更简洁。

标准完整代码：
```python
is_full = False

can_join = not is_full
print(can_join)
```

---

## 第四章总结

[标题]
你已经能够编写有计算和判断能力的表达式

[文本]
本章学习了：

- +、-、*、/ 基础算术运算
- // 整除
- % 取余
- ** 幂运算
- +=、-=、*=、/= 复合赋值
- 运算优先级和括号
- ==、!=、>、<、>=、<= 比较运算
- and、or、not 逻辑运算

这些运算符是条件判断和循环的基础。下一章将学习 if、elif 和 else，让程序能够根据不同条件执行不同代码。

---

## 第四章综合挑战（不计分）

[标题]
制作 Battle 资格检查程序

[文本]
请创建以下变量：

- 当前 Rating
- 已完成课程数量
- 是否被禁赛

满足以下条件时允许参加排位 Battle：

1. Rating 大于等于 1000
2. 已完成课程数量大于等于 1
3. 当前没有被禁赛

参考代码：

[代码 language=python]
rating = 1050
completed_courses = 2
is_banned = False

can_join_ranked = (
    rating >= 1000
    and completed_courses >= 1
    and not is_banned
)

print(f"是否可以参加排位 Battle：{can_join_ranked}")
[/代码]

[文本]
尝试修改三个变量的值，观察 can_join_ranked 的结果如何变化。
