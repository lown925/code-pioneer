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

# 第七章：字符串

章节简介：学习字符串的创建、索引、切片、长度、拼接、遍历和常用方法，并理解字符串不可变的特点。
预计学习时间：90 分钟

章节学习目标：
- 能正确创建和输出字符串
- 能使用索引读取单个字符
- 能使用切片提取字符串的一部分
- 能使用 len() 获取字符串长度
- 能使用 + 和 * 处理字符串
- 能使用 for 遍历字符串
- 能使用 strip()、lower()、upper()、replace() 和 split()
- 能理解字符串不可变
- 能阅读字符串代码并判断输出结果
- 能处理常见的索引越界与方法使用错误

---

## 课时 1：创建与读取字符串

课时简介：复习字符串的基本写法，学习使用索引读取指定字符。
预计学习时间：14 分钟

### 正文

[标题]
字符串用于保存文本

[文本]
字符串用于保存昵称、课程名称、提示信息和邀请码等文本内容。

Python 可以使用英文单引号或英文双引号创建字符串。

[代码 language=python]
nickname = "新手玩家"
course_name = 'Python 基础入门'

print(nickname)
print(course_name)
[/代码]

[标题]
使用索引读取字符

[文本]
字符串中的每个字符都有位置编号，这个编号叫索引。

Python 的索引从 0 开始。

[代码 language=python]
language = "Python"

print(language[0])
print(language[1])
[/代码]

[文本]
language[0] 是第一个字符 P，language[1] 是第二个字符 y。

[标题]
使用负数索引从末尾读取

[代码 language=python]
language = "Python"

print(language[-1])
print(language[-2])
[/代码]

[文本]
-1 表示最后一个字符 n，-2 表示倒数第二个字符 o。

[示例 title=读取邀请码首尾字符]
说明：读取邀请码的第一个和最后一个字符。
语言：python

room_code = "A7K9Q2"

print(room_code[0])
print(room_code[-1])
[/示例]

[警告 title=索引不能超过字符串范围]
字符串 "Python" 只有 6 个字符，有效正索引是 0 到 5。访问 language[6] 会产生索引越界错误。

### 课时题目

#### 题目 1

题型：SINGLE_CHOICE
题干：下面程序会输出什么？

```python
language = "Python"
print(language[0])
```

难度：EASY
分值：10
知识点：字符串、索引、首字符
是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：输出预测

选项：
- A. P [正确]
- B. y
- C. Python
- D. n

解析：
Python 的字符串索引从 0 开始，因此 language[0] 表示第一个字符 P。

#### 题目 2

题型：FILL_BLANK
题干：Python 字符串的第一个字符索引是 ______。

难度：EASY
分值：10
知识点：字符串索引
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
Python 使用从 0 开始的索引，因此第一个字符的索引是 0。

#### 题目 3

题型：CODE_FILL
题干：好友房邀请码保存在 room_code 中。请补全代码，输出邀请码的最后一个字符。

难度：EASY
分值：10
知识点：字符串、负数索引
是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：代码填空

题目代码：
```python
room_code = "A7K9Q2"
print(room_code[____])
```

可接受答案：
```python
-1
```

```python
5
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
负数索引 -1 表示最后一个字符。字符串长度为 6，因此正索引 5 也表示最后一个字符。

标准完整代码：
```python
room_code = "A7K9Q2"
print(room_code[-1])
```

---

## 课时 2：字符串切片

课时简介：学习提取字符串中的连续一部分。
预计学习时间：15 分钟

### 正文

[标题]
切片用于获取一段字符

[文本]
索引一次只能读取一个字符。切片可以获取字符串中连续的一部分。

基本写法：

[代码 language=python]
字符串[开始索引:结束索引]
[/代码]

[文本]
切片包含开始索引，但不包含结束索引。

[代码 language=python]
language = "Python"

print(language[0:3])
[/代码]

[文本]
输出 Pyt，因为索引 0、1、2 被包含，索引 3 不包含。

[标题]
省略开始或结束位置

[代码 language=python]
language = "Python"

print(language[:3])
print(language[3:])
[/代码]

[文本]
language[:3] 从开头取到索引 3 之前，结果是 Pyt。

language[3:] 从索引 3 取到末尾，结果是 hon。

[标题]
使用步长

[代码 language=python]
text = "abcdef"

print(text[0:6:2])
[/代码]

[文本]
第三个数字 2 表示每隔一个字符取一次，结果是 ace。

[示例 title=隐藏昵称的一部分]
说明：只显示昵称前两个字符。
语言：python

nickname = "先锋学员"
short_name = nickname[:2]

print(short_name)
[/示例]

[警告 title=切片结束位置不包含]
text[1:4] 只包含索引 1、2、3，不包含索引 4。

### 课时题目

#### 题目 4

题型：SINGLE_CHOICE
题干：下面程序会输出什么？

```python
language = "Python"
print(language[1:4])
```

难度：MEDIUM
分值：10
知识点：字符串切片、结束位置
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：输出预测

选项：
- A. Pyt
- B. yth [正确]
- C. ytho
- D. tho

解析：
索引 1、2、3 对应 y、t、h。切片结束索引 4 不包含，因此输出 yth。

#### 题目 5

题型：FILL_BLANK
题干：请填写切片表达式，使下面程序输出字符串前 3 个字符。

```python
text = "Battle"
print(text[______])
```

难度：MEDIUM
分值：10
知识点：字符串切片
是否用于 Battle：否

可接受答案：
- :3
- 0:3

判题设置：
- 忽略大小写：是
- 忽略首尾空格：是
- 合并连续空格：否
- 最长字符数：20

解析：
text[:3] 或 text[0:3] 都会取得索引 0、1、2，也就是前三个字符 Bat。

#### 题目 6

题型：CODE_FILL
题干：邀请码格式为“CP-2026”。系统需要提取年份部分“2026”。请补全切片。

难度：MEDIUM
分值：10
知识点：字符串切片、索引
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码填空

题目代码：
```python
invite_code = "CP-2026"
year = invite_code[__________]

print(year)
```

可接受答案：
```python
3:
```

```python
3:7
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
索引 3 开始的内容是 2026，因此 invite_code[3:] 可以提取到末尾。invite_code[3:7] 也正确。

标准完整代码：
```python
invite_code = "CP-2026"
year = invite_code[3:]

print(year)
```

---

## 课时 3：字符串长度、拼接与重复

课时简介：学习 len()、字符串拼接和重复。
预计学习时间：14 分钟

### 正文

[标题]
使用 len() 获取字符串长度

[代码 language=python]
nickname = "新手玩家"
print(len(nickname))
[/代码]

[文本]
len() 会返回字符串包含的字符数量。

[标题]
使用 + 拼接字符串

[代码 language=python]
first_name = "Python"
last_name = "课程"

title = first_name + last_name
print(title)
[/代码]

[文本]
字符串之间可以使用 + 进行拼接。

[标题]
使用 * 重复字符串

[代码 language=python]
divider = "-" * 10
print(divider)
[/代码]

[文本]
字符串乘以整数会重复对应次数。

[示例 title=生成课程标题]
说明：拼接课程名称和章节名称。
语言：python

course_name = "Python 基础入门"
chapter_name = "字符串"

title = course_name + " - " + chapter_name
print(title)
[/示例]

[警告 title=字符串不能直接和整数拼接]
"当前得分：" + 100 会报错。可以使用 str(100) 转换，或使用 f-string。

### 课时题目

#### 题目 7

题型：SINGLE_CHOICE
题干：下面程序会输出什么？

```python
text = "Python"
print(len(text))
```

难度：EASY
分值：10
知识点：len、字符串长度
是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：输出预测

选项：
- A. 5
- B. 6 [正确]
- C. 7
- D. Python

解析：
Python 由 P、y、t、h、o、n 六个字符组成，因此 len(text) 返回 6。

#### 题目 8

题型：FILL_BLANK
题干：Python 中，用于获取字符串长度的内置函数是 ______。

难度：EASY
分值：10
知识点：len、字符串长度
是否用于 Battle：否

可接受答案：
- len
- len()

判题设置：
- 忽略大小写：否
- 忽略首尾空格：是
- 合并连续空格：是
- 最长字符数：20

解析：
len() 用于获取字符串、列表等对象的长度。

#### 题目 9

题型：CODE_FILL
题干：系统需要生成 8 个等号作为分隔线。请补全代码。

难度：EASY
分值：10
知识点：字符串重复、乘法
是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：代码填空

题目代码：
```python
divider = "=" * ______
print(divider)
```

可接受答案：
```python
8
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
字符串乘以整数会重复对应次数，因此 "=" * 8 会生成 8 个等号。

标准完整代码：
```python
divider = "=" * 8
print(divider)
```

---

## 课时 4：遍历字符串

课时简介：学习使用 for 逐个读取字符串字符。
预计学习时间：13 分钟

### 正文

[标题]
字符串可以逐字符遍历

[代码 language=python]
word = "Code"

for char in word:
    print(char)
[/代码]

[文本]
for 循环会依次把 C、o、d、e 保存到变量 char 中，并逐个输出。

[标题]
统计指定字符出现次数

[代码 language=python]
text = "banana"
count = 0

for char in text:
    if char == "a":
        count += 1

print(count)
[/代码]

[文本]
程序遍历每个字符，并统计 a 出现的次数，最终结果是 3。

[示例 title=检查邀请码字符]
说明：逐个输出邀请码中的字符。
语言：python

room_code = "A7K9"

for char in room_code:
    print(char)
[/示例]

[提示 title=遍历时变量名应清晰]
char、letter 比 i 更能表达当前变量保存的是字符。

### 课时题目

#### 题目 10

题型：SINGLE_CHOICE
题干：下面程序会输出几行内容？

```python
word = "Code"

for char in word:
    print(char)
```

难度：EASY
分值：10
知识点：字符串遍历、for
是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：代码分析

选项：
- A. 1 行
- B. 2 行
- C. 4 行 [正确]
- D. 5 行

解析：
字符串 "Code" 有 4 个字符，for 循环会对每个字符执行一次 print()，因此输出 4 行。

#### 题目 11

题型：FILL_BLANK
题干：阅读代码，填写最终输出结果。

```python
text = "level"
count = 0

for char in text:
    if char == "e":
        count += 1

print(count)
```

输出：______

难度：MEDIUM
分值：10
知识点：字符串遍历、计数
是否用于 Battle：否

可接受答案：
- 2
- 二

判题设置：
- 忽略大小写：是
- 忽略首尾空格：是
- 合并连续空格：是
- 最长字符数：20

解析：
字符串 level 中字符 e 出现两次，因此 count 最终为 2。

#### 题目 12

题型：CODE_FILL
题干：程序需要统计邀请码中数字字符“7”出现的次数。请补全判断条件。

难度：MEDIUM
分值：10
知识点：字符串遍历、if、计数
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码填空

题目代码：
```python
room_code = "A77K7"
count = 0

for char in room_code:
    if ______________:
        count += 1

print(count)
```

可接受答案：
```python
char == "7"
```

```python
char == '7'
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
char 每次保存当前字符。要统计字符 7，应判断 char == "7"。数字字符必须加引号，因为 char 是字符串。

标准完整代码：
```python
room_code = "A77K7"
count = 0

for char in room_code:
    if char == "7":
        count += 1

print(count)
```

---

## 课时 5：常用字符串方法

课时简介：学习清理、统一和替换字符串内容。
预计学习时间：18 分钟

### 正文

[标题]
strip() 去除首尾空白

[代码 language=python]
nickname = "  新手玩家  "
clean_name = nickname.strip()

print(clean_name)
[/代码]

[文本]
strip() 会删除字符串首尾的空格、换行和制表符，但不会删除中间空格。

[标题]
lower() 和 upper() 转换大小写

[代码 language=python]
language = "Python"

print(language.lower())
print(language.upper())
[/代码]

[文本]
lower() 返回小写字符串 python，upper() 返回大写字符串 PYTHON。

[标题]
replace() 替换内容

[代码 language=python]
message = "学习 Java"
new_message = message.replace("Java", "Python")

print(new_message)
[/代码]

[标题]
split() 拆分字符串

[代码 language=python]
tags = "Python,Battle,学习"
items = tags.split(",")

print(items)
[/代码]

[文本]
split(",") 会按逗号拆分字符串，结果是由多个字符串组成的列表。列表会在后续章节详细学习。

[示例 title=规范化用户输入]
说明：去除首尾空格，并统一转换为小写。
语言：python

language = input("请输入编程语言：")
normalized_language = language.strip().lower()

print(normalized_language)
[/示例]

[警告 title=字符串方法通常返回新字符串]
strip()、lower()、upper() 和 replace() 不会直接修改原字符串，而是返回处理后的新字符串。

### 课时题目

#### 题目 13

题型：SINGLE_CHOICE
题干：用户输入的昵称两侧可能包含多余空格。应使用哪个字符串方法清理首尾空格？

难度：EASY
分值：10
知识点：strip、字符串清理
是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：代码用途

选项：
- A. strip() [正确]
- B. split()
- C. upper()
- D. replace()

解析：
strip() 用于移除字符串首尾的空白字符。split() 用于拆分，upper() 用于转大写，replace() 用于替换内容。

#### 题目 14

题型：SINGLE_CHOICE
题干：下面程序会输出什么？

```python
language = "PyThOn"
print(language.lower())
```

难度：EASY
分值：10
知识点：lower、大小写转换
是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：输出预测

选项：
- A. PYTHON
- B. python [正确]
- C. PyThOn
- D. 程序报错

解析：
lower() 会返回全部转换为小写的新字符串，因此输出 python。

#### 题目 15

题型：CODE_FILL
题干：用户输入课程名称时可能带有首尾空格。请补全代码，得到清理后的课程名称。

难度：MEDIUM
分值：10
知识点：strip、方法调用、变量
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码填空

题目代码：
```python
course_name = "  Python 基础入门  "
clean_course_name = course_name.__________

print(clean_course_name)
```

可接受答案：
```python
strip()
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
course_name.strip() 会返回去除首尾空白后的新字符串。

标准完整代码：
```python
course_name = "  Python 基础入门  "
clean_course_name = course_name.strip()

print(clean_course_name)
```

---

## 课时 6：字符串不可变与综合处理

课时简介：理解字符串不能直接修改单个字符，并综合使用索引、切片和方法。
预计学习时间：16 分钟

### 正文

[标题]
字符串是不可变对象

[文本]
字符串创建后，不能直接修改其中某个字符。

下面的代码会报错：

[代码 language=python]
word = "Python"
word[0] = "J"
[/代码]

[文本]
如果需要改变字符串内容，应创建一个新字符串。

[代码 language=python]
word = "Python"
new_word = "J" + word[1:]

print(new_word)
[/代码]

[文本]
word[1:] 取得 ython，再和 "J" 拼接，得到 Jython。

[标题]
组合多个字符串操作

[代码 language=python]
raw_name = "  PYTHON 学员  "
clean_name = raw_name.strip().lower()

print(clean_name)
[/代码]

[文本]
方法可以连续调用。程序先去除首尾空格，再把结果转为小写。

[示例 title=规范化邀请码]
说明：去除空格并转为大写，避免用户输入格式不一致。
语言：python

raw_code = "  a7k9q2  "
room_code = raw_code.strip().upper()

print(room_code)
[/示例]

[警告 title=不要尝试直接修改字符]
如果需要修改字符串的一部分，应通过切片、拼接或 replace() 创建新字符串。

### 课时题目

#### 题目 16

题型：SINGLE_CHOICE
题干：为什么下面代码会报错？

```python
word = "Python"
word[0] = "J"
```

难度：MEDIUM
分值：10
知识点：字符串不可变、索引
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：Bug 定位

选项：
- A. 字符串不能直接修改单个字符 [正确]
- B. 索引必须从 1 开始
- C. 字符串不能使用双引号
- D. J 必须是数字

解析：
Python 字符串是不可变对象，创建后不能直接给某个索引位置重新赋值。应创建一个新字符串。

#### 题目 17

题型：FILL_BLANK
题干：Python 字符串创建后不能直接修改其中某个字符，这种特点称为字符串是 ______ 的。

难度：EASY
分值：10
知识点：字符串不可变
是否用于 Battle：否

可接受答案：
- 不可变
- immutable
- 不可修改

判题设置：
- 忽略大小写：是
- 忽略首尾空格：是
- 合并连续空格：是
- 最长字符数：30

解析：
字符串是不可变对象。任何看起来像“修改字符串”的操作，通常都会返回一个新字符串。

#### 题目 18

题型：CODE_FILL
题干：用户输入的邀请码可能包含首尾空格和小写字母。请补全代码，将邀请码清理后统一转换为大写。

难度：MEDIUM
分值：10
知识点：strip、upper、方法链
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码填空

题目代码：
```python
raw_code = "  a7k9q2  "
room_code = raw_code.____________________

print(room_code)
```

可接受答案：
```python
strip().upper()
```

```python
upper().strip()
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
strip() 去除首尾空白，upper() 将字母转换为大写。两种方法的调用顺序在本题中都能得到 A7K9Q2。

标准完整代码：
```python
raw_code = "  a7k9q2  "
room_code = raw_code.strip().upper()

print(room_code)
```

---

## 第七章总结

[标题]
你已经能够处理文本数据

[文本]
本章学习了：

- 使用单引号或双引号创建字符串
- 使用正索引和负索引读取字符
- 使用切片提取字符串的一部分
- 使用 len() 获取字符串长度
- 使用 + 拼接字符串
- 使用 * 重复字符串
- 使用 for 遍历字符串
- 使用 strip() 清理首尾空白
- 使用 lower() 和 upper() 转换大小写
- 使用 replace() 替换内容
- 使用 split() 拆分字符串
- 理解字符串不可变
- 使用切片、拼接和方法创建新字符串

下一章将学习列表与元组，用于保存一组有顺序的数据。

---

## 第七章综合挑战（不计分）

[标题]
制作邀请码检查与展示程序

[文本]
请编写一个程序，完成以下任务：

1. 接收用户输入的邀请码
2. 去除首尾空格
3. 转换为大写
4. 检查邀请码长度是否为 6
5. 输出邀请码首字符和末字符
6. 逐个输出邀请码中的字符

参考代码：

[代码 language=python]
raw_code = input("请输入 6 位邀请码：")
room_code = raw_code.strip().upper()

if len(room_code) == 6:
    print("邀请码格式正确")
    print(f"首字符：{room_code[0]}")
    print(f"末字符：{room_code[-1]}")

    for char in room_code:
        print(char)
else:
    print("邀请码长度不正确")
[/代码]

[文本]
尝试输入包含空格或小写字母的邀请码，观察程序如何进行规范化处理。
