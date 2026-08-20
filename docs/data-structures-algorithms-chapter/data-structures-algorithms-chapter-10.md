# 第十章：哈希表

章节简介：本章从 Python 字典的快速查找体验出发，认识哈希表、哈希函数和哈希冲突，理解为什么哈希表平均情况下能够快速完成查找、插入和更新。课程还会介绍链地址法和开放寻址的基础思想，并通过重复元素检测和频率统计完成综合应用。
预计学习时间：120 分钟

章节学习目标：
- 能够解释哈希表中 key、hash 和桶位置的关系
- 能够理解哈希函数的作用
- 能够解释为什么会出现哈希冲突
- 能够描述链地址法和开放寻址的基本思想
- 能够理解平均 O(1) 与最坏 O(n) 的区别
- 能够使用字典和集合解决重复检测、频率统计等问题

---

## 课时 1：为什么字典查找很方便

课时简介：从“根据学号查成绩”出发，理解键值映射和哈希表的基本使用价值。

预计学习时间：20 分钟

### 正文

[标题]
有些问题天然是“根据 key 找 value”

[文本]
例如根据学号找成绩、根据用户名找用户信息、根据课程编号找课程。如果使用列表逐个查找，可能需要遍历；字典则可以通过 key 直接访问对应 value。

[代码 language=python]
scores = {
    "S001": 88,
    "S002": 95,
    "S003": 76
}

print(scores["S002"])
[/代码]

[文本]
通过 key "S002" 可以直接取得 value 95。Python dict 的底层实现使用哈希表思想。

[标题]
键值映射

[代码 language=python]
user = {
    "name": "小码",
    "level": 3,
    "score": 1200
}

print(user["score"])
[/代码]

[文本]
哈希表保存的是 key 到 value 的映射。key 用于定位，value 是对应业务数据。

[标题]
平均查找很快

[文本]
在合理哈希实现和负载情况下，按 key 查找平均通常可以看作 O(1)。这不表示绝对永远只执行一步，内部仍需要计算哈希值并处理可能的冲突。

[示例 title=根据课程编号查名称]
说明：使用字典直接从课程编号获得课程名称。
语言：python
courses = {
    "C01": "Python",
    "C02": "数据结构",
    "C03": "数据库"
}

print(courses["C02"])
[/示例]

[提示 title=哈希表适合“按 key 找数据”]
如果问题经常出现“根据唯一标识找对象”，可以考虑哈希表。

[警告 title=key 不存在时直接索引可能报错]
如果不能保证 key 存在，可以先使用 `in` 判断，或使用 `dict.get()`。

### 课时题目

#### 题目 1

题型：SINGLE_CHOICE
题干：哈希表最典型的使用模式是什么？
难度：EASY
分值：10
知识点：哈希表、键值映射
是否用于 Battle：否

选项：
- A. 根据 key 查找对应 value [正确]
- B. 只能按索引从左到右访问
- C. 只能保存一个元素
- D. 自动执行递归

解析：
哈希表的核心是把 key 映射到对应 value，从而支持高效的键值访问。

#### 题目 2

题型：SINGLE_CHOICE
题干：下面程序输出什么？

```python
scores = {
    "A": 80,
    "B": 95,
    "C": 70
}

print(scores["B"])
```

难度：MEDIUM
分值：10
知识点：字典、key、value
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：输出预测

选项：
- A. A
- B. B
- C. 80
- D. 95 [正确]

解析：
key "B" 对应的 value 是 95，因此输出 95。

#### 题目 3

题型：SINGLE_CHOICE
题干：为什么不能简单说“哈希表任何情况下查找都严格只执行一步”？
难度：HARD
分值：10
知识点：哈希表、复杂度、冲突
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码分析

选项：
- A. 因为哈希表还需要计算哈希值，并可能处理冲突 [正确]
- B. 因为哈希表不能查找
- C. 因为所有 key 都必须排序
- D. 因为字典只能保存字符串

解析：
哈希表平均查找很快，但内部仍有哈希计算和冲突处理，极端情况下性能可能下降。

---

## 课时 2：哈希函数

课时简介：理解哈希函数如何把 key 转换为可用于定位的位置，并认识“相同 key 必须稳定映射”的要求。

预计学习时间：20 分钟

### 正文

[标题]
key 如何变成存储位置

[文本]
哈希表不会直接拿一个长字符串当数组索引，而会先通过哈希函数把 key 转换成哈希值，再映射到有限的桶位置。

概念流程是：

key → hash → bucket index。

[标题]
一个教学用简单例子

[代码 language=python]
table_size = 10
key = 27

index = key % table_size

print(index)
[/代码]

[文本]
27 % 10 = 7，因此可以把位置 7 作为候选桶。这只是教学上的简单哈希方式，真实语言中的字符串哈希会复杂得多。

[标题]
哈希函数应尽量分散数据

[文本]
如果大量不同 key 都集中到同一个位置，哈希表性能会变差。好的哈希函数希望不同 key 尽可能均匀分布。

同一个 key 在同一个哈希规则下，也需要得到一致结果，否则下一次查找无法回到对应位置。

[示例 title=整数取模映射]
说明：使用取模把多个整数 key 映射到 0-4 的桶。
语言：python
table_size = 5
keys = [7, 12, 18]

for key in keys:
    print(key, key % table_size)
[/示例]

[提示 title=哈希值不是最终 value]
哈希计算的作用是帮助定位存储位置，真正业务数据仍然是 key 对应的 value。

[警告 title=简单取模只是教学模型]
不要把本课整数取模误认为 Python dict 的真实完整实现。

### 课时题目

#### 题目 4

题型：SINGLE_CHOICE
题干：哈希函数的主要作用是什么？
难度：EASY
分值：10
知识点：哈希函数、定位
是否用于 Battle：否

选项：
- A. 把 key 转换为用于定位的数据 [正确]
- B. 自动排序所有 value
- C. 删除重复 key
- D. 把列表变成树

解析：
哈希函数根据 key 计算哈希值，并进一步帮助确定存储桶位置。

#### 题目 5

题型：SINGLE_CHOICE
题干：教学模型中 `table_size = 10`，key 为 37，使用 `key % table_size` 得到哪个桶？
难度：MEDIUM
分值：10
知识点：哈希、取模
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：输出预测

选项：
- A. 3
- B. 7 [正确]
- C. 10
- D. 37

解析：
37 % 10 等于 7。

#### 题目 6

题型：CODE_FILL
题干：补全哈希桶索引表达式，把整数 key 映射到 0 到 table_size-1 的范围。请填写赋值号右侧表达式。
难度：HARD
分值：10
知识点：哈希函数、取模、桶
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码：

```python
table_size = 8
key = 21

index = ____

print(index)
```

可接受答案：

```python
table_size = 8
key = 21

index = key % table_size

print(index)
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
取模 `key % table_size` 会把整数结果限制在 0 到 table_size - 1 的范围。

标准完整代码：

```python
table_size = 8
key = 21

index = key % table_size

print(index)
```

---

## 课时 3：哈希冲突

课时简介：理解不同 key 可能映射到同一个桶，并认识冲突是哈希表必须处理的正常问题。

预计学习时间：20 分钟

### 正文

[标题]
不同 key 可能得到同一个位置

[文本]
使用简单规则 `index = key % 5` 时，key 7 得到 2，key 12 也得到 2。两个不同 key 都落到桶 2，这就是哈希冲突。

[代码 language=python]
table_size = 5
keys = [7, 12]

for key in keys:
    print(key % table_size)
[/代码]

[标题]
冲突不是哈希表失效

[文本]
哈希表必须提前考虑冲突。桶数量有限，而可能的 key 数量非常多，不可能保证永远没有两个 key 映射到同一位置。

重要的是发生冲突后，仍然能够保存和查找正确的 key-value。

[标题]
冲突过多会影响效率

[文本]
如果大量 key 都挤在同一个位置，查找时需要额外比较更多候选，这会让哈希表失去平均效率优势。

[示例 title=找出简单冲突]
说明：计算一组整数在 5 个桶中的位置。
语言：python
table_size = 5
keys = [2, 7, 12, 18]

for key in keys:
    index = key % table_size
    print(key, index)
[/示例]

[提示 title=冲突看“不同 key 是否落到同一桶”]
不是 value 相同就叫哈希冲突，而是不同 key 的定位结果发生重合。

[警告 title=不要用覆盖旧值假装解决冲突]
如果不同 key 冲突时直接覆盖原数据，会导致旧 key 丢失。

### 课时题目

#### 题目 7

题型：SINGLE_CHOICE
题干：什么叫哈希冲突？
难度：EASY
分值：10
知识点：哈希冲突
是否用于 Battle：否

选项：
- A. 不同 key 映射到同一个桶位置 [正确]
- B. 两个变量名称相同
- C. 列表为空
- D. 树没有根

解析：
哈希冲突指不同 key 经过哈希定位后落到同一个候选位置。

#### 题目 8

题型：SINGLE_CHOICE
题干：table_size=5，key 7 和 12 都使用 `key % 5`，结果是什么？
难度：MEDIUM
分值：10
知识点：哈希冲突、取模
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：执行流程

选项：
- A. 分别是 2 和 2，因此发生冲突 [正确]
- B. 分别是 7 和 12
- C. 分别是 0 和 1
- D. 一定报错

解析：
7 % 5 和 12 % 5 都等于 2，因此两个不同 key 落到同一桶，形成冲突。

#### 题目 9

题型：SINGLE_CHOICE
题干：为什么哈希表必须设计冲突处理机制？
难度：HARD
分值：10
知识点：哈希冲突、有限桶
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码分析

选项：
- A. 因为不同 key 可能映射到相同有限桶位置 [正确]
- B. 因为哈希表永远只能保存一个 key
- C. 因为 value 不能重复
- D. 因为数组索引必须是字符串

解析：
桶数量有限而 key 空间很大，冲突不可完全避免，因此实现必须有正确的冲突处理方案。

---

## 课时 4：链地址法与开放寻址

课时简介：了解两种经典冲突处理思想，并理解它们如何在冲突后继续保存不同 key。

预计学习时间：20 分钟

### 正文

[标题]
链地址法

[文本]
链地址法的思路是：每个桶不只保存一个元素，而是保存一组发生同桶冲突的 key-value。

[代码 language=python]
table = [
    [],
    [],
    []
]

table[1].append(("A", 10))
table[1].append(("B", 20))

print(table[1])
[/代码]

[文本]
A 和 B 即使落到同一个桶，也能同时保留。查找时先定位桶，再在桶内比较真实 key。

[标题]
开放寻址

[文本]
开放寻址会在冲突后继续寻找其他空位置。最简单的线性探测就是当前位置被占用后，依次尝试下一个位置，并在表尾循环回开头。

[代码 language=python]
table_size = 5
start = 3

for step in range(table_size):
    index = (start + step) % table_size
    print(index)
[/代码]

[文本]
会依次尝试 3、4、0、1、2。

[示例 title=线性探测位置顺序]
说明：从冲突位置 4 开始，在容量 6 的表中循环寻找后续位置。
语言：python
table_size = 6
start = 4

for step in range(4):
    index = (start + step) % table_size
    print(index)
[/示例]

[提示 title=理解思想即可]
本课不要求手写完整工业哈希表，重点是知道冲突后可以桶内继续存，或寻找其他位置。

[警告 title=真实 key 仍然要比较]
哈希定位只是缩小范围，真正确认目标仍需要比较实际 key。

### 课时题目

#### 题目 10

题型：SINGLE_CHOICE
题干：链地址法处理冲突的基本思想是什么？
难度：EASY
分值：10
知识点：链地址法、冲突
是否用于 Battle：否

选项：
- A. 同一桶可以保存多个冲突项 [正确]
- B. 冲突后直接删除旧数据
- C. 永远重新排序全部 key
- D. 只允许一个 key

解析：
链地址法允许同一桶维护多个发生冲突的 key-value，再在桶内进一步比较。

#### 题目 11

题型：SINGLE_CHOICE
题干：容量 5，从索引 4 开始做线性探测，下一位置使用 `(index + 1) % 5`。4 的下一位置是什么？
难度：MEDIUM
分值：10
知识点：开放寻址、循环索引
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：输出预测

选项：
- A. 0 [正确]
- B. 1
- C. 4
- D. 5

解析：
(4 + 1) % 5 等于 0，因此从表末尾循环回到开头。

#### 题目 12

题型：CODE_FILL
题干：补全线性探测索引表达式，使搜索位置在容量 table_size 内循环。请填写赋值号右侧表达式。
难度：HARD
分值：10
知识点：开放寻址、取模
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码：

```python
table_size = 5
start = 4
step = 2

index = ____

print(index)
```

可接受答案：

```python
table_size = 5
start = 4
step = 2

index = (start + step) % table_size

print(index)
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
`(start + step) % table_size` 可以让探测位置在达到表尾后循环回开头。

标准完整代码：

```python
table_size = 5
start = 4
step = 2

index = (start + step) % table_size

print(index)
```

---

## 课时 5：复杂度与负载

课时简介：理解哈希表平均 O(1) 的含义，并认识冲突和装载程度对性能的影响。

预计学习时间：20 分钟

### 正文

[标题]
平均 O(1) 是什么含义

[文本]
理想情况下，哈希函数把 key 比较均匀地分散到桶。查找时计算哈希、定位少量候选并很快确认 key，因此平均查找、插入和更新常被描述为 O(1)。

[标题]
最坏情况可能退化

[文本]
如果大量 key 都冲突到同一桶，查找可能需要逐个比较很多元素，极端情况下最坏性能可能接近 O(n)。

所以平均 O(1) 不等于最坏永远 O(1)。

[标题]
表太满也会增加冲突

[文本]
如果桶数量很少，却塞入大量 key，发生冲突的机会通常会增加。实际哈希表往往会在装载程度较高时扩容和重新分布。

[示例 title=观察一个过小的桶空间]
说明：多个 key 使用很小的 table_size 进行取模，容易出现重复桶。
语言：python
table_size = 2
keys = [1, 3, 5, 7]

for key in keys:
    print(key, key % table_size)
[/示例]

[提示 title=复杂度要区分平均和最坏]
看到哈希表 O(1) 时，应理解它通常指合理条件下的平均情况。

[警告 title=不要把哈希表当作绝对无冲突结构]
冲突是正常问题，优秀实现依赖合理的哈希函数、容量管理和冲突处理。

### 课时题目

#### 题目 13

题型：SINGLE_CHOICE
题干：通常说哈希表查找 O(1)，更准确的理解是什么？
难度：EASY
分值：10
知识点：哈希表、平均复杂度
是否用于 Battle：否

选项：
- A. 合理条件下平均查找接近常数级 [正确]
- B. 任何情况下严格只比较一次
- C. 最坏一定是 O(log n)
- D. 哈希表没有冲突

解析：
哈希表常见 O(1) 描述通常指平均情况，最坏情况下可能因冲突退化。

#### 题目 14

题型：SINGLE_CHOICE
题干：如果大量 key 都落在同一个桶，最直接的性能影响是什么？
难度：MEDIUM
分值：10
知识点：哈希冲突、复杂度
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码分析

选项：
- A. 查找时可能需要比较更多候选 [正确]
- B. 查找一定更快
- C. 所有 value 自动相等
- D. 树高度自动下降

解析：
冲突集中会让同一桶内候选增多，查找需要更多比较，性能下降。

#### 题目 15

题型：SINGLE_CHOICE
题干：为什么哈希表的最坏查找可能达到 O(n)？
难度：HARD
分值：10
知识点：哈希表、最坏复杂度
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码分析

选项：
- A. 极端冲突下可能需要逐个检查大量元素 [正确]
- B. 因为哈希表必须先排序
- C. 因为 key 不能比较
- D. 因为所有查找都要访问磁盘

解析：
当大量元素集中在同一冲突结构中时，确认目标 key 可能退化为线性扫描。

---

## 课时 6：哈希表综合应用

课时简介：使用集合和字典解决重复元素检测、频率统计和首次重复值问题。

预计学习时间：20 分钟

### 正文

[标题]
检测重复元素

[文本]
如果要判断列表中是否出现重复值，可以使用集合保存已经看过的元素。

[代码 language=python]
numbers = [4, 7, 2, 4]
seen = set()
duplicate = None

for number in numbers:
    if number in seen:
        duplicate = number
        break

    seen.add(number)

print(duplicate)
[/代码]

[文本]
遍历到第二个 4 时，它已经在 seen 中，因此找到首次重复值。

[标题]
为什么比双层比较更自然

[文本]
朴素方法让每个元素和后面的元素比较，最坏 O(n²)。使用哈希集合时，平均成员判断和插入接近 O(1)，遍历 n 个元素总体平均 O(n)。

[标题]
频率统计仍然是典型哈希应用

[代码 language=python]
numbers = [1, 2, 1, 3, 2, 1]
counts = {}

for number in numbers:
    counts[number] = counts.get(number, 0) + 1

print(counts)
[/代码]

[示例 title=找到第一个重复学号]
说明：依次检查学号，使用集合记录已经出现过的值。
语言：python
student_ids = ["S01", "S02", "S03", "S02"]

seen = set()
duplicate = None

for student_id in student_ids:
    if student_id in seen:
        duplicate = student_id
        break
    seen.add(student_id)

print(duplicate)
[/示例]

[提示 title=成员判断和频率统计用途不同]
只关心“是否见过”时集合足够；还要知道次数时使用字典。

[警告 title=额外空间也需要考虑]
集合和字典能够提高平均查找效率，但会使用额外 O(n) 级存储空间。

### 课时题目

#### 题目 16

题型：SINGLE_CHOICE
题干：只需要判断元素是否已经出现过，下面哪个结构最自然？
难度：EASY
分值：10
知识点：集合、哈希、去重
是否用于 Battle：否

选项：
- A. set [正确]
- B. 只用一个固定字符串
- C. 二叉树根节点
- D. 栈顶索引

解析：
集合非常适合保存“已经出现过哪些值”并进行成员判断。

#### 题目 17

题型：SINGLE_CHOICE
题干：使用集合 seen 检测重复，平均情况下遍历 n 个元素一次，整体时间复杂度通常是什么？
难度：MEDIUM
分值：10
知识点：集合、复杂度、重复检测
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码分析

选项：
- A. O(1)
- B. O(log n)
- C. O(n) [正确]
- D. O(n²)

解析：
平均每次集合判断和插入接近 O(1)，一共处理 n 个元素，因此总体平均 O(n)。

#### 题目 18

题型：CODE_FILL
题干：补全语句，把当前 number 加入已经访问过的集合 seen。请填写完整语句。
难度：HARD
分值：10
知识点：集合、重复检测
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码：

```python
numbers = [4, 7, 2, 4]
seen = set()
duplicate = None

for number in numbers:
    if number in seen:
        duplicate = number
        break

    ____

print(duplicate)
```

可接受答案：

```python
numbers = [4, 7, 2, 4]
seen = set()
duplicate = None

for number in numbers:
    if number in seen:
        duplicate = number
        break

    seen.add(number)

print(duplicate)
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
当前元素第一次出现时，需要使用 `seen.add(number)` 保存，后续再次遇到时才能被成员判断识别为重复。

标准完整代码：

```python
numbers = [4, 7, 2, 4]
seen = set()
duplicate = None

for number in numbers:
    if number in seen:
        duplicate = number
        break

    seen.add(number)

print(duplicate)
```

---
