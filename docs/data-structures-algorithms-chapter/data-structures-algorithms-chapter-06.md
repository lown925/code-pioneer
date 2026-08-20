# 第六章：字符串与基础算法技巧

章节简介：本章把字符串作为算法训练的重要载体，学习索引、遍历、频率统计、双指针和基础模式查找等方法。字符串问题看似简单，却非常适合训练“如何把需求拆成可执行步骤”的能力。学习完成后，能够使用列表、字典、循环和双指针解决常见字符串问题，并为后续哈希、查找和算法综合训练打下基础。
预计学习时间：120 分钟

章节学习目标：
- 能够使用索引和循环遍历字符串
- 能够统计字符出现次数并理解字典在频率统计中的作用
- 能够使用双指针判断回文字符串
- 能够理解基础子串查找的逐位置比较思想
- 能够分析常见字符串算法的时间复杂度
- 能够综合使用字符串、字典和循环解决简单文本处理问题

---

## 课时 1：字符串、索引与遍历

课时简介：认识字符串的顺序结构特点，掌握按索引读取字符和逐字符遍历。

预计学习时间：20 分钟

### 正文

[标题]
字符串也是有顺序的数据

[文本]
字符串由一组按照顺序排列的字符组成。例如 "Python" 可以看成 P、y、t、h、o、n，这些字符都有自己的位置。Python 字符串索引同样从 0 开始。

[代码 language=python]
text = "Python"

print(text[0])
print(text[2])
print(text[5])
[/代码]

[文本]
程序依次输出 P、t、n。字符串可以按索引读取，但字符串本身是不可变对象，不能像列表那样直接写 `text[0] = "J"` 修改某个字符。

[标题]
逐字符遍历

[文本]
很多字符串算法都从遍历开始。

[代码 language=python]
text = "code"

for char in text:
    print(char)
[/代码]

[文本]
如果字符串长度为 n，从头到尾访问每个字符一次，时间复杂度通常是 O(n)。

[标题]
按索引遍历

[文本]
如果算法还需要字符的位置，可以使用 range(len(text))。

[代码 language=python]
text = "data"

for index in range(len(text)):
    print(index, text[index])
[/代码]

[示例 title=统计数字字符数量]
说明：逐个检查字符串中的字符，统计其中数字字符的数量。
语言：python
text = "A1B23C"

count = 0

for char in text:
    if char.isdigit():
        count += 1

print(count)
[/示例]

[提示 title=只需要字符时直接遍历]
如果不需要索引，`for char in text` 通常比手动管理位置更清晰。

[警告 title=字符串不能按索引直接修改]
可以读取 `text[0]`，但不能直接给它赋新值。如果需要修改字符串，通常需要构造新的字符串。

### 课时题目

#### 题目 1

题型：SINGLE_CHOICE
题干：对于字符串 `text = "Python"`，表达式 `text[1]` 的结果是什么？
难度：EASY
分值：10
知识点：字符串、索引
是否用于 Battle：否

选项：
- A. P
- B. y [正确]
- C. t
- D. h

解析：
字符串索引从 0 开始，索引 0 是 P，索引 1 是 y。

#### 题目 2

题型：SINGLE_CHOICE
题干：下面程序运行后输出什么？

```python
text = "A1B23"

count = 0

for char in text:
    if char.isdigit():
        count += 1

print(count)
```

难度：MEDIUM
分值：10
知识点：字符串遍历、isdigit、计数
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：输出预测

选项：
- A. 2
- B. 3 [正确]
- C. 4
- D. 5

解析：
字符串中的数字字符是 1、2、3，共 3 个，因此输出 3。

#### 题目 3

题型：CODE_FILL
题干：补全索引表达式，使程序输出字符串最后一个字符。题目已知字符串非空，请填写方括号中的表达式。
难度：HARD
分值：10
知识点：字符串、索引、len
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码：

```python
text = "algorithm"

last_char = text[____]

print(last_char)
```

可接受答案：

```python
text = "algorithm"

last_char = text[len(text) - 1]

print(last_char)
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
长度为 n 的字符串最后一个字符的非负索引是 n - 1，因此应使用 len(text) - 1。

标准完整代码：

```python
text = "algorithm"

last_char = text[len(text) - 1]

print(last_char)
```

---

## 课时 2：字符频率统计

课时简介：学习用字典统计每个字符出现次数，并理解“键到计数”的映射思想。

预计学习时间：20 分钟

### 正文

[标题]
统计问题不只是总数

[文本]
有时我们不只想知道“有多少字符”，而是想知道每一种字符分别出现了多少次。例如字符串 "banana" 中，b 出现 1 次，a 出现 3 次，n 出现 2 次。

[标题]
使用字典保存频率

[代码 language=python]
text = "banana"
counts = {}

for char in text:
    if char in counts:
        counts[char] += 1
    else:
        counts[char] = 1

print(counts)
[/代码]

[文本]
字典中的 key 是字符，value 是出现次数。每读取一个字符，如果已经统计过，就把次数加 1；如果第一次出现，就从 1 开始。

[标题]
使用 get 简化代码

[代码 language=python]
text = "abac"
counts = {}

for char in text:
    counts[char] = counts.get(char, 0) + 1

print(counts)
[/代码]

[文本]
`get(char, 0)` 表示：如果 char 已经存在，取得原来的次数；如果不存在，就使用默认值 0。

[示例 title=统计单词首字母]
说明：对一组单词的首字母进行频率统计。
语言：python
words = ["apple", "ant", "book", "banana"]

counts = {}

for word in words:
    first = word[0]
    counts[first] = counts.get(first, 0) + 1

print(counts)
[/示例]

[提示 title=把“对象”和“次数”分开]
字典 key 保存正在统计的对象，value 保存这个对象对应的次数。

[警告 title=频率统计不要每次都把值重置为 1]
如果字符已经出现过，应在原次数基础上加 1，而不是重新赋值为 1。

### 课时题目

#### 题目 4

题型：SINGLE_CHOICE
题干：在字符频率字典中，通常用什么作为 key？
难度：EASY
分值：10
知识点：字典、频率统计
是否用于 Battle：否

选项：
- A. 被统计的字符 [正确]
- B. 整个程序文件
- C. 循环执行次数的固定字符串
- D. 随机数

解析：
频率统计需要把每个字符映射到它的出现次数，因此字符通常作为 key，次数作为 value。

#### 题目 5

题型：SINGLE_CHOICE
题干：下面程序运行后 `counts["a"]` 的值是多少？

```python
text = "abaca"
counts = {}

for char in text:
    counts[char] = counts.get(char, 0) + 1

print(counts["a"])
```

难度：MEDIUM
分值：10
知识点：字典、get、频率统计
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：执行流程

选项：
- A. 1
- B. 2
- C. 3 [正确]
- D. 5

解析：
字符串中的 a 出现在第 1、3、5 个位置，共 3 次，因此 counts["a"] 等于 3。

#### 题目 6

题型：SINGLE_CHOICE
题干：下面代码中，如果把累计逻辑错误写成固定赋值 `counts[char] = 1`，会造成什么结果？

难度：HARD
分值：10
知识点：字典、频率统计、Bug 定位
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：Bug 定位

选项：
- A. 每个出现过的字符最终都只会记录为 1 [正确]
- B. 每个字符会自动记录真实次数
- C. 字典会自动变成列表
- D. 程序一定进入无限循环

解析：
每次遇到字符都把对应 value 重新设置为 1，因此即使一个字符出现多次，之前累计的次数也会被覆盖。

---

## 课时 3：双指针与回文判断

课时简介：学习从字符串两端同时向中间移动的双指针思想，并使用它判断回文字符串。

预计学习时间：20 分钟

### 正文

[标题]
什么是回文字符串

[文本]
回文字符串从左向右读和从右向左读相同，例如 "level" 和 "radar"。可以依次比较第一与最后、第二与倒数第二个字符。

[代码 language=python]
text = "level"

left = 0
right = len(text) - 1
is_palindrome = True

while left < right:
    if text[left] != text[right]:
        is_palindrome = False
        break

    left += 1
    right -= 1

print(is_palindrome)
[/代码]

[标题]
为什么只需要走到中间

[文本]
每次循环同时检查两个位置。当 left 和 right 相遇或交错时，所有需要比较的字符对已经处理完成。比较次数与 n 同级，因此时间复杂度通常为 O(n)。

[示例 title=判断数字文本是否回文]
说明：使用左右指针比较字符串两端字符。
语言：python
text = "12321"

left = 0
right = len(text) - 1
valid = True

while left < right:
    if text[left] != text[right]:
        valid = False
        break
    left += 1
    right -= 1

print(valid)
[/示例]

[提示 title=双指针适合两端有对应关系的问题]
如果一个问题需要同时观察序列左端和右端，可以考虑两个索引从不同方向移动。

[警告 title=比较后必须移动两个指针]
如果字符相同但 left 和 right 都不变化，while 条件可能一直成立，形成死循环。

### 课时题目

#### 题目 7

题型：SINGLE_CHOICE
题干：判断回文字符串时，双指针通常从哪里开始？
难度：EASY
分值：10
知识点：双指针、回文
是否用于 Battle：否

选项：
- A. 一个从开头，一个从末尾 [正确]
- B. 两个都固定在开头
- C. 两个都固定在末尾
- D. 每次随机选择位置

解析：
回文判断需要比较字符串两端对应字符，因此通常使用 left 从开头、right 从末尾向中间移动。

#### 题目 8

题型：SINGLE_CHOICE
题干：下面程序输出什么？

```python
text = "abca"
left = 0
right = len(text) - 1
valid = True

while left < right:
    if text[left] != text[right]:
        valid = False
        break
    left += 1
    right -= 1

print(valid)
```

难度：MEDIUM
分值：10
知识点：双指针、回文、执行流程
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：输出预测

选项：
- A. True
- B. False [正确]
- C. abca
- D. 4

解析：
第一对 a 和 a 相同，指针向中间移动；第二对 b 和 c 不同，于是 valid 变为 False。

#### 题目 9

题型：SINGLE_CHOICE
题干：长度为 n 的字符串使用双指针从两端向中间判断回文，时间复杂度最符合哪一项？
难度：HARD
分值：10
知识点：双指针、复杂度
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码分析

选项：
- A. O(1)
- B. O(log n)
- C. O(n) [正确]
- D. O(n²)

解析：
虽然每次比较两个字符，只需要走到中间，但比较次数仍然与 n 成正比，因此整体时间复杂度为 O(n)。

---

## 课时 4：基础子串查找

课时简介：理解“从每个可能起点尝试匹配”的朴素字符串查找方法。

预计学习时间：20 分钟

### 正文

[标题]
什么是子串查找

[文本]
给定主字符串 "datastructure"，希望判断其中是否包含 "structure"，就是子串查找问题。本课不直接依赖内置 `in`，而是学习最基础的逐位置比较方法。

[代码 language=python]
text = "abcabc"
pattern = "cab"

found = False

for start in range(len(text) - len(pattern) + 1):
    match = True

    for offset in range(len(pattern)):
        if text[start + offset] != pattern[offset]:
            match = False
            break

    if match:
        found = True
        break

print(found)
[/代码]

[标题]
为什么是朴素方法

[文本]
某个起点失败后，算法简单把起点后移一位，再重新比较。它没有利用之前比较信息进行高级优化，最坏时间复杂度常写作 O(nm)。

[示例 title=查找短模式]
说明：判断 text 中是否存在 pattern，并在匹配时保存起始索引。
语言：python
text = "algorithm"
pattern = "go"

position = -1

for start in range(len(text) - len(pattern) + 1):
    match = True

    for offset in range(len(pattern)):
        if text[start + offset] != pattern[offset]:
            match = False
            break

    if match:
        position = start
        break

print(position)
[/示例]

[提示 title=先确保起点不会越界]
外层范围使用 `len(text) - len(pattern) + 1`，保证从每个起点开始都有足够位置容纳完整 pattern。

[警告 title=本课不提前引入 KMP]
更高效的字符串匹配算法属于进阶内容，本课重点是理解最基础的匹配过程。

### 课时题目

#### 题目 10

题型：SINGLE_CHOICE
题干：朴素子串查找的外层循环主要负责什么？
难度：EASY
分值：10
知识点：字符串查找、起点
是否用于 Battle：否

选项：
- A. 选择模式串可能的匹配起点 [正确]
- B. 自动把字符串排序
- C. 删除所有不匹配字符
- D. 统计字典长度

解析：
朴素查找会从主串中的多个可能起点开始尝试，因此外层循环负责选择当前匹配起点。

#### 题目 11

题型：SINGLE_CHOICE
题干：如果 `text = "abcdef"`、`pattern = "cd"`，朴素查找得到的起始索引 position 是多少？
难度：MEDIUM
分值：10
知识点：子串查找、索引、执行流程
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：执行流程

选项：
- A. 1
- B. 2 [正确]
- C. 3
- D. -1

解析：
"cd" 从主串索引 2 开始，因此 position 为 2。

#### 题目 12

题型：CODE_FILL
题干：补全外层 range() 的结束表达式，使程序只尝试能够容纳完整 pattern 的起点。请填写 range() 中的表达式。
难度：HARD
分值：10
知识点：子串查找、边界、索引
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码：

```python
text = "abcabc"
pattern = "cab"

found = False

for start in range(____):
    match = True

    for offset in range(len(pattern)):
        if text[start + offset] != pattern[offset]:
            match = False
            break

    if match:
        found = True
        break

print(found)
```

可接受答案：

```python
text = "abcabc"
pattern = "cab"

found = False

for start in range(len(text) - len(pattern) + 1):
    match = True

    for offset in range(len(pattern)):
        if text[start + offset] != pattern[offset]:
            match = False
            break

    if match:
        found = True
        break

print(found)
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
最后一个合法起点是 n-m，而 range 的结束值不包含自身，因此应写成 `len(text) - len(pattern) + 1`。

标准完整代码：

```python
text = "abcabc"
pattern = "cab"

found = False

for start in range(len(text) - len(pattern) + 1):
    match = True

    for offset in range(len(pattern)):
        if text[start + offset] != pattern[offset]:
            match = False
            break

    if match:
        found = True
        break

print(found)
```

---

## 课时 5：找出出现次数最多的字符

课时简介：综合使用频率字典和遍历，找出字符串中的高频字符并处理简单边界情况。

预计学习时间：20 分钟

### 正文

[标题]
先统计，再找最大值

[文本]
如果要找字符串中出现次数最多的字符，可以先统计每个字符频率，再遍历统计结果找出最大次数。

[代码 language=python]
text = "banana"
counts = {}

for char in text:
    counts[char] = counts.get(char, 0) + 1

best_char = None
best_count = 0

for char in counts:
    if counts[char] > best_count:
        best_char = char
        best_count = counts[char]

print(best_char)
print(best_count)
[/代码]

[文本]
程序得到 a 和 3。若多个字符次数相同，本课规则是保留最先成为最大值的字符。

[标题]
复杂度分析

[文本]
第一次遍历字符串是 O(n)，第二次遍历不同字符最多也是 O(n)，因此整体仍是 O(n)。频率字典最坏保存 n 个不同字符，所以额外空间最坏 O(n)。

[示例 title=统计最高频字母]
说明：忽略空格后统计字符频率，并找出最常见字符。
语言：python
text = "data science"
counts = {}

for char in text:
    if char != " ":
        counts[char] = counts.get(char, 0) + 1

best_char = None
best_count = 0

for char in counts:
    if counts[char] > best_count:
        best_char = char
        best_count = counts[char]

print(best_char, best_count)
[/示例]

[提示 title=先定义并列规则]
当题目可能出现多个同样最优答案时，一定要先规定选择规则，否则算法输出可能不唯一。

[警告 title=空字符串需要单独理解]
如果输入为空，best_char 会保持 None。实际业务中应根据需求决定返回方式。

### 课时题目

#### 题目 13

题型：SINGLE_CHOICE
题干：寻找最高频字符时，为什么通常先建立频率字典？
难度：EASY
分值：10
知识点：字符串、字典、频率
是否用于 Battle：否

选项：
- A. 为每个字符保存出现次数 [正确]
- B. 为字符串自动排序
- C. 删除所有重复字符
- D. 把字符转换成浮点数

解析：
频率字典可以把每个字符映射到它的出现次数，便于后续比较哪个字符次数最大。

#### 题目 14

题型：SINGLE_CHOICE
题干：对于 `text = "mississippi"`，字符 `"i"` 出现多少次？
难度：MEDIUM
分值：10
知识点：字符频率、计数
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码分析

选项：
- A. 2
- B. 3
- C. 4 [正确]
- D. 5

解析：
"mississippi" 中 i 共出现 4 次。

#### 题目 15

题型：SINGLE_CHOICE
题干：字符串长度为 n，先 O(n) 统计频率，再最多 O(n) 遍历频率表找最大值。整体时间复杂度是什么？
难度：HARD
分值：10
知识点：复杂度、顺序执行
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码分析

选项：
- A. O(1)
- B. O(n) [正确]
- C. O(n²)
- D. O(2ⁿ)

解析：
两个 O(n) 阶段先后执行，相加后忽略常数仍然是 O(n)。

---

## 课时 6：字符串算法综合训练

课时简介：综合使用遍历、字典、双指针和条件判断完成一个基础文本分析任务。

预计学习时间：20 分钟

### 正文

[标题]
综合问题需要拆成多个小步骤

[文本]
假设要分析一个由小写字母和数字组成的字符串，并完成：统计数字数量、统计字符频率、判断去掉数字后的字母部分是否回文。

[代码 language=python]
text = "a1b2b3a"

digit_count = 0
letters = ""
counts = {}

for char in text:
    counts[char] = counts.get(char, 0) + 1

    if char.isdigit():
        digit_count += 1
    else:
        letters += char

left = 0
right = len(letters) - 1
palindrome = True

while left < right:
    if letters[left] != letters[right]:
        palindrome = False
        break

    left += 1
    right -= 1

print(digit_count)
print(counts)
print(palindrome)
[/代码]

[文本]
数字为 1、2、3，共 3 个；去掉数字后 letters 是 "abba"，它是回文字符串。

[标题]
算法组合不一定意味着复杂度相乘

[文本]
第一段循环遍历 text 一次，是 O(n)。第二段双指针也是 O(n) 级。两个阶段先后执行，因此整体仍是 O(n)，不是 O(n²)。

[示例 title=分析课程编码]
说明：统计编码中的数字数量和字母数量，并保存字符频率。
语言：python
code = "CS2026A"

digits = 0
letters = 0
counts = {}

for char in code:
    counts[char] = counts.get(char, 0) + 1

    if char.isdigit():
        digits += 1
    elif char.isalpha():
        letters += 1

print(digits)
print(letters)
print(counts)
[/示例]

[提示 title=先拆阶段，再分析复杂度]
综合题先把任务拆成统计、查找、判断等阶段，再分别确认每个阶段是否嵌套。

[警告 title=不要为了“一次循环”强行塞所有逻辑]
代码正确、清晰、容易验证通常比为了减少一小段循环而制造复杂逻辑更重要。

### 课时题目

#### 题目 16

题型：SINGLE_CHOICE
题干：当问题要求“统计每个字符分别出现多少次”时，下面哪种结构最自然？
难度：EASY
分值：10
知识点：字符串、字典、算法选择
是否用于 Battle：否

选项：
- A. 字典 [正确]
- B. 只使用一个布尔变量
- C. 只使用一个固定整数
- D. 删除所有字符

解析：
需要把多个不同字符分别映射到各自计数时，字典最自然。

#### 题目 17

题型：SINGLE_CHOICE
题干：一个算法先遍历长度为 n 的字符串一次，再使用双指针最多比较 n/2 次。整体时间复杂度最符合哪一项？
难度：MEDIUM
分值：10
知识点：复杂度、字符串、双指针
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码分析

选项：
- A. O(1)
- B. O(log n)
- C. O(n) [正确]
- D. O(n²)

解析：
两个阶段都是线性级别并且先后执行，因此整体仍然是 O(n)。

#### 题目 18

题型：CODE_FILL
题干：补全双指针循环中的右指针更新语句，使两个指针在每轮匹配成功后向中间靠近。请填写完整语句。
难度：HARD
分值：10
知识点：双指针、回文、循环
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码：

```python
text = "level"

left = 0
right = len(text) - 1
valid = True

while left < right:
    if text[left] != text[right]:
        valid = False
        break

    left += 1
    ____

print(valid)
```

可接受答案：

```python
text = "level"

left = 0
right = len(text) - 1
valid = True

while left < right:
    if text[left] != text[right]:
        valid = False
        break

    left += 1
    right -= 1

print(valid)
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
left 从左侧向右移动，因此 right 需要从右侧向左移动，使用 `right -= 1` 才能让两个指针逐步靠近。

标准完整代码：

```python
text = "level"

left = 0
right = len(text) - 1
valid = True

while left < right:
    if text[left] != text[right]:
        valid = False
        break

    left += 1
    right -= 1

print(valid)
```

---
