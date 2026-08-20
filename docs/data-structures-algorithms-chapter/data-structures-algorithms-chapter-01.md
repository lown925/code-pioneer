# 第一章：认识算法与复杂度

章节简介：本章从简单的程序问题出发，认识数据结构与算法的基本含义，理解为什么同一个问题可以有不同的解决方法，并建立时间复杂度和空间复杂度的基础概念。学习完成后，能够初步判断一段程序的执行效率，并使用 O(1)、O(log n)、O(n) 和 O(n²) 描述常见算法的增长趋势。
预计学习时间：120 分钟

章节学习目标：
- 能够解释数据结构与算法分别解决什么问题
- 能够把一个简单问题拆解成明确、有限、可执行的算法步骤
- 能够理解算法效率为什么会随着数据规模变化
- 能够识别 O(1)、O(log n)、O(n) 和 O(n²) 的基础程序结构
- 能够理解时间复杂度与空间复杂度的区别
- 能够对简单 Python 程序进行初步的算法分析

---

## 课时 1：数据结构与算法到底是什么

课时简介：从学生成绩查找问题出发，认识数据、数据结构和算法之间的关系。

预计学习时间：20 分钟

### 正文

[标题]
程序不仅要保存数据，还要处理数据

[文本]
编写程序时，我们经常面对两个基本问题。

第一个问题是“数据应该怎样保存”。例如，一个班级有多名学生，每名学生都有成绩，我们需要选择合适的方式保存这些成绩。

第二个问题是“保存以后应该怎样处理”。例如，从全部成绩中找到最高分、计算平均分，或者查找某名学生的成绩。

前一个问题主要与数据结构有关，后一个问题主要与算法有关。

[代码 language=python]
scores = [78, 92, 85, 66, 90]
print(scores)
[/代码]

[文本]
这里使用 Python 列表保存多个成绩。列表就是一种组织数据的方式。

如果我们想找到最高分，还需要设计处理这些数据的步骤。

[标题]
算法是一组解决问题的明确步骤

[文本]
下面的程序通过逐个比较寻找最高分。

[代码 language=python]
scores = [78, 92, 85, 66, 90]

max_score = scores[0]

for score in scores[1:]:
    if score > max_score:
        max_score = score

print(max_score)
[/代码]

[文本]
程序首先把第一个成绩作为当前最高分，然后依次查看后面的成绩。

如果发现更大的成绩，就更新当前最高分。

所有元素检查结束以后，max_score 中保存的就是最终结果。

算法并不等于某一段固定代码。算法描述的是解决问题的方法，而代码是算法在具体编程语言中的实现。

[标题]
数据结构和算法为什么总是一起出现

[文本]
数据结构决定数据怎样组织，算法决定怎样操作这些数据。

例如，要保存大量学生成绩，可以使用列表；要寻找最高成绩，可以使用逐个比较算法。

以后学习栈、队列、树、哈希表和图时，也会不断看到同样的关系：先选择合适的数据结构，再选择适合这种结构的算法。

[示例 title=寻找列表中的最小值]
说明：先把第一个元素作为当前最小值，再逐个比较后续元素。
语言：python
numbers = [8, 3, 12, 5, 1]

min_value = numbers[0]

for number in numbers[1:]:
    if number < min_value:
        min_value = number

print(min_value)
[/示例]

[提示 title=先区分两个问题]
看到一个程序问题时，可以先问自己：数据应该怎样保存？保存以后需要进行什么操作？

[警告 title=不要把数据结构和算法混为一谈]
列表是一种数据组织方式，而“遍历列表寻找最大值”是一种处理数据的方法。两者有关，但不是同一个概念。

### 课时题目

#### 题目 1

题型：SINGLE_CHOICE
题干：下面哪一项最符合“算法”的含义？
难度：EASY
分值：10
知识点：算法、基本概念
是否用于 Battle：否

选项：
- A. 保存多个数据的一种固定格式
- B. 解决某个问题的一组明确、可执行的步骤 [正确]
- C. Python 中所有变量的集合
- D. 计算机中保存文件的位置

解析：
算法描述解决问题的步骤，这些步骤应当明确并且能够执行。数据结构主要解决数据如何组织和保存的问题，因此 A 不符合算法的含义；C 和 D 分别描述变量集合和文件位置，也不是算法。

#### 题目 2

题型：SINGLE_CHOICE
题干：下面程序运行后输出什么？

```python
scores = [72, 88, 81, 95]
max_score = scores[0]

for score in scores[1:]:
    if score > max_score:
        max_score = score

print(max_score)
```

难度：MEDIUM
分值：10
知识点：列表、遍历、比较、最大值算法
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：输出预测

选项：
- A. 72
- B. 81
- C. 88
- D. 95 [正确]

解析：
max_score 初始为 72。遍历过程中依次与 88、81、95 比较，遇到更大值时更新，因此最终 max_score 为 95。

#### 题目 3

题型：CODE_FILL
题干：补全下面 if 语句中的比较表达式，使程序能够正确找到全部负数中的最大值。请填写一个表达式，不要填写 if 关键字。
难度：HARD
分值：10
知识点：最大值算法、初始化、比较、边界数据
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码：

```python
scores = [-8, -3, -15, -1]
max_score = scores[0]

for score in scores[1:]:
    if ____:
        max_score = score

print(max_score)
```

可接受答案：

```python
scores = [-8, -3, -15, -1]
max_score = scores[0]

for score in scores[1:]:
    if score > max_score:
        max_score = score

print(max_score)
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
当前元素只有在大于 max_score 时才应该替换最大值，因此条件应为 score > max_score。程序使用第一个真实元素初始化最大值，所以即使所有数据都是负数也能正确工作。

标准完整代码：

```python
scores = [-8, -3, -15, -1]
max_score = scores[0]

for score in scores[1:]:
    if score > max_score:
        max_score = score

print(max_score)
```

---

## 课时 2：把问题变成可以执行的步骤

课时简介：学习如何把自然语言中的问题拆解成明确的算法步骤，并理解算法结果为什么必须可确定。

预计学习时间：20 分钟

### 正文

[标题]
先理解问题，再开始写代码

[文本]
一个常见错误是看到题目以后立即开始写代码，却没有先想清楚程序到底需要完成哪些步骤。

例如，要求“计算列表中所有正数的平均值”，可以先把任务拆成几个步骤：

第一步，准备总和 total 和正数数量 count。

第二步，依次检查列表中的每个数字。

第三步，只处理大于 0 的数字。

第四步，把正数加入 total，并增加 count。

第五步，如果 count 不为 0，再计算平均值。

[代码 language=python]
numbers = [4, -2, 7, 0, 3]

total = 0
count = 0

for number in numbers:
    if number > 0:
        total += number
        count += 1

if count > 0:
    average = total / count
else:
    average = 0

print(average)
[/代码]

[文本]
这个算法不会因为列表中存在负数或 0 而把它们错误地计入平均值。

同时，它也处理了“没有任何正数”的情况，从而避免除以 0。

[标题]
一个好算法的步骤应该明确

[文本]
“不断处理数据直到差不多完成”不是一个明确算法，因为“差不多”没有准确标准。

相比之下，“从第一个元素开始，每次处理一个元素，直到列表中的所有元素都处理完成”就是明确的执行规则。

[标题]
结果应该能够确定

[文本]
在输入和执行规则都确定时，算法的结果也应该可以确定。

学习算法时，我们会尽量避免依赖随机数、网络状态、当前时间或隐藏输入，因为这些因素会让结果难以直接分析。

[示例 title=统计及格人数]
说明：把问题拆成“遍历成绩、判断是否及格、更新计数”三个明确步骤。
语言：python
scores = [58, 61, 75, 49, 90]

passed = 0

for score in scores:
    if score >= 60:
        passed += 1

print(passed)
[/示例]

[提示 title=先写步骤再写代码]
遇到稍复杂的问题时，可以先用自然语言列出输入、处理步骤和输出，再把每一步转换成代码。

[警告 title=边界条件也是算法的一部分]
如果算法中存在除法、索引访问或删除操作，要提前考虑“数量为 0”“列表为空”等边界情况，而不是只考虑最常见输入。

### 课时题目

#### 题目 4

题型：SINGLE_CHOICE
题干：要计算一个列表中所有正数的平均值，下面哪一步是必要的？
难度：EASY
分值：10
知识点：算法步骤、平均值、条件判断
是否用于 Battle：否

选项：
- A. 统计满足条件的正数数量 [正确]
- B. 删除列表中的第一个元素
- C. 把全部数字修改为字符串
- D. 每次循环都把总和清零

解析：
平均值等于满足条件的数据总和除以满足条件的数据数量，因此除了累加正数，还必须统计正数的数量。其他操作都不是计算正数平均值所必需的。

#### 题目 5

题型：SINGLE_CHOICE
题干：下面程序运行后会输出什么？

```python
numbers = [5, -1, 3, 0, -4, 2]

total = 0

for number in numbers:
    if number > 0:
        total += number

print(total)
```

难度：MEDIUM
分值：10
知识点：条件判断、循环、累加
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：执行流程

选项：
- A. 5
- B. 8
- C. 10 [正确]
- D. 14

解析：
程序只累加大于 0 的数字，因此参与计算的是 5、3 和 2，总和为 10。-1、0 和 -4 都不会执行 total += number。

#### 题目 6

题型：SINGLE_CHOICE
题干：下面程序用于计算正数平均值。如果 numbers 中没有任何正数，为什么程序仍然能够正常运行？

```python
numbers = [-4, -2, 0]

total = 0
count = 0

for number in numbers:
    if number > 0:
        total += number
        count += 1

if count > 0:
    average = total / count
else:
    average = 0

print(average)
```

难度：HARD
分值：10
知识点：算法边界、条件判断、除零错误、执行流程
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码分析

选项：
- A. 因为 Python 会自动把除以 0 的结果改成 0
- B. 因为 count 为 0 时程序不会执行 total / count [正确]
- C. 因为 total 会自动变成 1
- D. 因为列表中的 0 会被当成一个正数

解析：
没有正数时 count 保持为 0，因此 count > 0 条件不成立，程序进入 else 分支，直接把 average 设为 0。这样就不会执行 total / count，也就不会发生除以 0 的错误。

---

## 课时 3：为什么不同算法会有快慢

课时简介：理解算法效率会随着数据规模变化，并通过“逐个检查”和“不断缩小范围”建立效率差异的直觉。

预计学习时间：20 分钟

### 正文

[标题]
数据很少时，算法差异可能不明显

[文本]
如果一个列表中只有 5 个数字，即使从头到尾逐个检查，也不会花费太多时间。

但是，当数据增加到几千、几万甚至更多时，不同算法的差距会越来越明显。

下面的程序使用逐个检查的方法查找目标值。

[代码 language=python]
numbers = [3, 6, 9, 12, 15]
target = 12

found = False

for number in numbers:
    if number == target:
        found = True
        break

print(found)
[/代码]

[文本]
最坏情况下，如果目标不存在，程序需要检查列表中的每一个元素。

如果列表有 n 个元素，那么最坏情况下就需要进行大约 n 次检查。

[标题]
有序数据可以利用更多信息

[文本]
如果数据已经按照从小到大排列，我们就不一定需要逐个检查。

例如，现在有 16 个有序元素。如果每次都能排除当前范围的一半，那么范围会发生这样的变化：

16 → 8 → 4 → 2 → 1

数据有 16 个，却只需要进行少量的“缩小范围”操作。

这种不断减半的增长规律以后会用 O(log n) 描述。

[代码 language=python]
size = 16
steps = 0

while size > 1:
    size //= 2
    steps += 1

print(steps)
[/代码]

[文本]
程序输出 4。

这里还没有正式实现二分查找，我们只是利用这个例子理解：“每次只减少一个元素”和“每次减少一半元素”在数据规模变大以后会产生非常明显的效率差异。

[示例 title=比较逐步减少和减半]
说明：两个变量从相同规模开始，一个每次减 1，另一个每次减半，可以直观看出操作次数差异。
语言：python
linear_size = 16
linear_steps = 0

while linear_size > 1:
    linear_size -= 1
    linear_steps += 1

half_size = 16
half_steps = 0

while half_size > 1:
    half_size //= 2
    half_steps += 1

print(linear_steps)
print(half_steps)
[/示例]

[提示 title=关注数据规模变大以后会发生什么]
分析算法效率时，不要只看 n=5 时谁更快，要思考当 n 变成 1000、10000 或更大时，操作次数怎样增长。

[警告 title=有序是利用“减半思想”的重要前提]
后面学习二分查找时会看到，只有能够根据比较结果排除一半候选范围时，减半策略才成立，不能对任意无序列表直接套用。

### 课时题目

#### 题目 7

题型：SINGLE_CHOICE
题干：一个算法需要从头到尾依次检查列表中的元素。在最坏情况下，列表元素数量增加时，检查次数通常会怎样变化？
难度：EASY
分值：10
知识点：算法效率、线性增长
是否用于 Battle：否

选项：
- A. 与元素数量大致同步增加 [正确]
- B. 元素越多检查次数反而越少
- C. 无论多少元素都只检查一次
- D. 检查次数始终为 0

解析：
逐个检查时，最坏情况下需要访问全部元素，因此数据数量增加，检查次数也会近似按相同比例增加。

#### 题目 8

题型：SINGLE_CHOICE
题干：下面程序会输出多少？

```python
size = 32
steps = 0

while size > 1:
    size //= 2
    steps += 1

print(steps)
```

难度：MEDIUM
分值：10
知识点：循环、整数除法、范围减半
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：输出预测

选项：
- A. 4
- B. 5 [正确]
- C. 16
- D. 32

解析：
size 的变化依次为 32→16→8→4→2→1，共执行 5 次循环，因此 steps 最终为 5。

#### 题目 9

题型：SINGLE_CHOICE
题干：算法 A 在最坏情况下每次只能排除一个候选元素；算法 B 在每一步都能排除当前候选范围的一半。当数据规模持续增大时，下面哪项判断最合理？
难度：HARD
分值：10
知识点：线性查找思想、减半思想、算法增长趋势
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码分析

选项：
- A. 两种算法的操作次数一定始终完全相同
- B. 算法 A 的优势会随着数据规模增大而越来越明显
- C. 算法 B 通常会随着数据规模增大表现出更明显的效率优势 [正确]
- D. 只要数据有序，任何算法都只需要执行一次

解析：
算法 A 每次只排除一个候选，因此操作次数通常随数据规模近似线性增加；算法 B 每次可以把范围缩小一半，因此增长速度明显更慢。数据规模越大，这种差距通常越明显。

---

## 课时 4：时间复杂度入门

课时简介：学习使用 O(1)、O(log n)、O(n) 和 O(n²) 描述常见算法的执行次数增长趋势。

预计学习时间：20 分钟

### 正文

[标题]
复杂度关注的是增长趋势

[文本]
时间复杂度不是在计算一段程序准确运行多少毫秒。

不同电脑、不同运行环境都会影响实际运行时间。

算法分析更关心的是：当输入规模 n 增大时，程序中的主要操作次数会怎样增长。

[标题]
O(1)：操作次数基本不随 n 增长

[代码 language=python]
numbers = [10, 20, 30, 40]
first = numbers[0]
print(first)
[/代码]

[文本]
不管列表有 4 个元素还是 4000 个元素，读取第一个元素都只需要一次索引访问。

这种复杂度通常记作 O(1)。

[标题]
O(n)：操作次数随 n 线性增加

[代码 language=python]
numbers = [10, 20, 30, 40]

total = 0

for number in numbers:
    total += number

print(total)
[/代码]

[文本]
如果列表有 n 个元素，循环就需要处理大约 n 次，因此这种结构通常属于 O(n)。

[标题]
O(n²)：常见于双层遍历

[代码 language=python]
numbers = [1, 2, 3, 4]

for left in numbers:
    for right in numbers:
        print(left, right)
[/代码]

[文本]
外层循环执行 n 次，每一次外层循环又执行 n 次内层循环，因此主要操作数量约为 n × n，也就是 n²。

这种复杂度通常写作 O(n²)。

[标题]
O(log n)：每次大幅缩小问题规模

[代码 language=python]
n = 32

while n > 1:
    n //= 2
[/代码]

[文本]
每次循环都把 n 缩小一半，因此即使 n 增长很多，循环次数增加得也比较慢。

这种模式通常属于 O(log n)。

[示例 title=观察不同增长趋势]
说明：下面分别构造一次固定操作、一次线性循环和一次双层循环，帮助理解操作次数如何随 n 变化。
语言：python
n = 4

constant_steps = 1

linear_steps = 0
for _ in range(n):
    linear_steps += 1

square_steps = 0
for _ in range(n):
    for _ in range(n):
        square_steps += 1

print(constant_steps)
print(linear_steps)
print(square_steps)
[/示例]

[提示 title=先找最核心的循环结构]
初学复杂度分析时，可以先观察：有没有循环？循环几层？每次循环是否会大幅缩小数据规模？

[警告 title=不要把 O(n²) 理解成一定很慢]
复杂度描述的是增长趋势。数据量很小时，O(n²) 程序也可能运行很快；但数据规模持续增大时，它通常比 O(n) 增长得更快。

### 课时题目

#### 题目 10

题型：SINGLE_CHOICE
题干：下面哪种操作最符合 O(1) 的特征？
难度：EASY
分值：10
知识点：时间复杂度、O(1)
是否用于 Battle：否

选项：
- A. 访问列表中指定索引的一个元素 [正确]
- B. 遍历整个列表
- C. 使用双层循环访问全部元素组合
- D. 从头到尾查找一个不存在的值

解析：
按已知索引访问一个列表元素时，操作次数基本不会随着列表长度增加，因此可视为 O(1)。其他操作都需要随着数据数量增加执行更多步骤。

#### 题目 11

题型：SINGLE_CHOICE
题干：下面程序的时间复杂度最符合哪一项？设列表长度为 n。

```python
numbers = [1, 2, 3, 4, 5]

total = 0

for number in numbers:
    total += number

print(total)
```

难度：MEDIUM
分值：10
知识点：时间复杂度、循环、O(n)
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码分析

选项：
- A. O(1)
- B. O(log n)
- C. O(n) [正确]
- D. O(n²)

解析：
循环会依次访问列表中的每个元素。列表长度为 n 时，循环主要执行 n 次，因此时间复杂度为 O(n)。

#### 题目 12

题型：CODE_FILL
题干：补全循环中的表达式，使每次循环都把问题规模缩小为原来的一半。请填写赋值号右侧的表达式。
难度：HARD
分值：10
知识点：O(log n)、整数除法、问题规模缩小
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码：

```python
n = 64
steps = 0

while n > 1:
    n = ____
    steps += 1

print(steps)
```

可接受答案：

```python
n = 64
steps = 0

while n > 1:
    n = n // 2
    steps += 1

print(steps)
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
使用 n // 2 会让 n 每次变为原来的一半。64 会依次变为 32、16、8、4、2、1，因此循环次数随 n 的增长呈对数级增长趋势。

标准完整代码：

```python
n = 64
steps = 0

while n > 1:
    n = n // 2
    steps += 1

print(steps)
```

---

## 课时 5：空间复杂度与额外内存

课时简介：认识算法除了运行时间还会占用内存，并比较“创建新数据”和“原地修改”的空间差异。

预计学习时间：20 分钟

### 正文

[标题]
算法不仅消耗时间，也会占用空间

[文本]
运行程序时，变量、列表、字典等数据都需要占用内存。

空间复杂度描述的是：随着输入规模增大，算法额外需要的存储空间怎样增长。

[标题]
创建一个同样大小的新列表

[代码 language=python]
numbers = [1, 2, 3, 4]

squares = []

for number in numbers:
    squares.append(number * number)

print(squares)
[/代码]

[文本]
numbers 有多少个元素，squares 最终通常也会保存相同数量的元素。

如果输入规模为 n，那么额外列表的大小也会随着 n 增长，因此额外空间可以看作 O(n)。

[标题]
直接修改原列表

[代码 language=python]
numbers = [1, 2, 3, 4]

for index in range(len(numbers)):
    numbers[index] = numbers[index] * numbers[index]

print(numbers)
[/代码]

[文本]
这个版本没有再创建一个与输入同样大小的新列表，而是直接修改已有列表中的元素。

忽略少量固定变量后，它使用的额外空间可以看作 O(1)。

[标题]
时间和空间需要一起考虑

[文本]
一个算法可能运行得更快，却需要更多额外内存。

另一个算法可能节省内存，却需要更多计算。

因此评价算法时不能只看一个指标。

以后学习各种数据结构时，我们会经常比较执行效率、额外空间、实现复杂度以及实际使用场景。

[示例 title=原地把负数改为零]
说明：程序直接修改原列表，不创建与输入规模相同的新列表。
语言：python
numbers = [3, -2, 7, -5, 1]

for index in range(len(numbers)):
    if numbers[index] < 0:
        numbers[index] = 0

print(numbers)
[/示例]

[提示 title=注意“额外空间”]
分析空间复杂度时，通常重点关注算法为了完成任务额外创建了多少随 n 增长的数据，而不是简单统计程序中有几个变量。

[警告 title=原地修改会改变原始数据]
节省额外空间并不意味着永远更好。如果后续还需要原始数据，就不能随意把输入直接改掉。

### 课时题目

#### 题目 13

题型：SINGLE_CHOICE
题干：空间复杂度主要用于描述什么？
难度：EASY
分值：10
知识点：空间复杂度、内存
是否用于 Battle：否

选项：
- A. 算法额外存储空间随输入规模增长的趋势 [正确]
- B. 程序文件在磁盘上的文件名
- C. 显示器能够显示多少行代码
- D. Python 源文件有多少个字符

解析：
空间复杂度关注算法运行过程中额外存储需求随输入规模的增长趋势。其他选项都不是算法空间复杂度描述的对象。

#### 题目 14

题型：SINGLE_CHOICE
题干：设 numbers 中有 n 个元素。下面程序为了保存计算结果创建了一个新列表 squares。额外空间复杂度最符合哪一项？

```python
numbers = [1, 2, 3, 4]
squares = []

for number in numbers:
    squares.append(number * number)
```

难度：MEDIUM
分值：10
知识点：空间复杂度、列表、O(n)
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码分析

选项：
- A. O(1)
- B. O(log n)
- C. O(n) [正确]
- D. O(n²)

解析：
squares 最终会保存与 numbers 数量相同的 n 个结果，因此额外存储空间会随着 n 线性增长，空间复杂度为 O(n)。

#### 题目 15

题型：SINGLE_CHOICE
题干：下面两个算法都把列表中的每个数字变成其平方。忽略输入列表本身占用的空间和少量固定变量，哪项分析正确？

算法 A：

```python
numbers = [1, 2, 3, 4]
result = []

for number in numbers:
    result.append(number * number)
```

算法 B：

```python
numbers = [1, 2, 3, 4]

for index in range(len(numbers)):
    numbers[index] = numbers[index] * numbers[index]
```

难度：HARD
分值：10
知识点：时间复杂度、空间复杂度、原地修改
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码分析

选项：
- A. A 和 B 都需要 O(n²) 时间
- B. A 的时间复杂度约为 O(n)，额外空间约为 O(n)；B 的时间复杂度约为 O(n)，额外空间约为 O(1) [正确]
- C. A 不需要任何额外空间，B 一定需要 O(n²) 空间
- D. B 因为修改原列表，所以不需要执行循环

解析：
两个算法都需要遍历 n 个元素，因此主要时间复杂度都是 O(n)。算法 A 创建了随 n 增长的新列表 result，因此额外空间是 O(n)；算法 B 直接修改原列表，只使用少量固定变量，因此额外空间可以视为 O(1)。

---

## 课时 6：第一次完整分析一个算法

课时简介：综合使用循环、条件判断、时间复杂度和空间复杂度，完成第一次基础算法分析。

预计学习时间：20 分钟

### 正文

[标题]
分析算法可以按照固定步骤进行

[文本]
面对一段算法代码，可以依次回答几个问题：

第一，输入规模 n 表示什么？

第二，最主要的重复操作在哪里？

第三，循环执行多少次？

第四，有没有嵌套循环？

第五，每次循环是否会大幅缩小问题规模？

第六，算法是否创建了随 n 增长的新数据结构？

通过这些问题，就可以对简单算法进行初步分析。

[标题]
例子一：判断列表中是否存在重复元素

[代码 language=python]
numbers = [4, 7, 2, 4]
found = False

for i in range(len(numbers)):
    for j in range(i + 1, len(numbers)):
        if numbers[i] == numbers[j]:
            found = True
            break

    if found:
        break

print(found)
[/代码]

[文本]
程序会比较不同位置上的元素。

外层循环选择第一个位置，内层循环检查它后面的元素。

使用 j = i + 1 开始，可以避免把某个元素和自己比较，也可以避免重复比较同一对位置。

在最坏情况下，程序需要检查大量元素组合，因此时间复杂度属于 O(n²) 级别。

[标题]
为什么实际执行次数和 Big O 不是一回事

[文本]
程序中存在 break，所以如果很早就找到重复元素，实际执行次数会比较少。

但复杂度通常需要考虑输入规模增大时的增长趋势，以及常见的最坏情况。

如果列表中完全没有重复元素，两层循环仍然需要检查大量元素对，因此总体增长趋势仍然是 O(n²)。

[标题]
复杂度只是评价算法的一部分

[文本]
一个算法是不是“好”，不能只看 Big O。

我们还需要考虑代码是否正确、是否容易理解、数据规模有多大、是否需要节省内存，以及是否存在更合适的数据结构。

后面的课程会逐步学习数组、链表、栈、队列、树、堆、哈希表和图，并理解为什么选择不同的数据结构会改变算法的设计方式和效率。

[示例 title=分析一个线性统计算法]
说明：程序只遍历一次列表，并使用两个固定计数变量，因此时间复杂度为 O(n)，额外空间为 O(1)。
语言：python
numbers = [4, -2, 7, 0, -3, 5]

positive_count = 0
negative_count = 0

for number in numbers:
    if number > 0:
        positive_count += 1
    elif number < 0:
        negative_count += 1

print(positive_count)
print(negative_count)
[/示例]

[提示 title=先保证正确，再分析效率]
复杂度分析不能代替正确性。一个 O(1) 但计算结果错误的程序没有实际价值。

[警告 title=不要只根据代码长短判断效率]
代码行数少不等于复杂度低。一个只有几行的双层循环也可能具有 O(n²) 的增长趋势。

### 课时题目

#### 题目 16

题型：SINGLE_CHOICE
题干：分析一个简单算法的时间复杂度时，下面哪一项通常最值得优先观察？
难度：EASY
分值：10
知识点：算法分析、循环结构
是否用于 Battle：否

选项：
- A. 主要循环及其执行次数 [正确]
- B. 变量名称是否足够长
- C. 源文件使用什么字体
- D. print() 输出使用什么颜色

解析：
简单算法的时间复杂度通常与主要重复操作的执行次数密切相关，因此应优先观察循环结构、循环次数和问题规模变化。

#### 题目 17

题型：SINGLE_CHOICE
题干：设 numbers 长度为 n，且列表中不存在 target。下面程序的时间复杂度最符合哪一项？

```python
found = False

for number in numbers:
    if number == target:
        found = True
        break
```

难度：MEDIUM
分值：10
知识点：顺序查找、最坏情况、O(n)
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码分析

选项：
- A. O(1)
- B. O(log n)
- C. O(n) [正确]
- D. O(n²)

解析：
题目已经明确 target 不存在，因此 break 不会提前执行，程序必须检查全部 n 个元素。主要操作次数随 n 线性增长，所以时间复杂度为 O(n)。

#### 题目 18

题型：CODE_FILL
题干：补全内层 range() 的起始表达式，使程序只比较不同位置的元素，并避免把 numbers[i] 与自己比较。请填写 range() 的第一个参数表达式。
难度：HARD
分值：10
知识点：嵌套循环、索引、重复元素检测、O(n²)
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码：

```python
numbers = [4, 7, 2, 4]
found = False

for i in range(len(numbers)):
    for j in range(____, len(numbers)):
        if numbers[i] == numbers[j]:
            found = True
            break

    if found:
        break

print(found)
```

可接受答案：

```python
numbers = [4, 7, 2, 4]
found = False

for i in range(len(numbers)):
    for j in range(i + 1, len(numbers)):
        if numbers[i] == numbers[j]:
            found = True
            break

    if found:
        break

print(found)
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
内层循环应该从 i 后面的第一个位置开始，因此起始位置是 i + 1。如果从 i 开始，numbers[i] 会首先与自己比较，从而错误地立即判断存在重复元素。从 i + 1 开始还可以避免重复比较之前已经检查过的元素对。

标准完整代码：

```python
numbers = [4, 7, 2, 4]
found = False

for i in range(len(numbers)):
    for j in range(i + 1, len(numbers)):
        if numbers[i] == numbers[j]:
            found = True
            break

    if found:
        break

print(found)
```
