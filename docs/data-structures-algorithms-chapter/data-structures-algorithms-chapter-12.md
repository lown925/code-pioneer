# 第十二章：查找、排序与综合算法训练

章节简介：本章作为课程收尾，系统整理顺序查找、二分查找和基础排序算法，并引入快速排序的分治思想。最后通过学习成绩分析案例，把数组、哈希、堆、查找、排序和复杂度分析组合起来。学习完成后，能够比较不同查找和排序方法的适用场景，并形成“根据数据特点选择算法”的整体思维。
预计学习时间：120 分钟

章节学习目标：
- 能够实现和分析顺序查找
- 能够理解二分查找的有序前提和 O(log n) 特点
- 能够解释冒泡、选择和插入排序的基本思想
- 能够理解快速排序的分治思路
- 能够比较不同算法的复杂度与适用场景
- 能够综合使用哈希、堆、排序和查找完成基础数据分析任务

---

## 课时 1：顺序查找

课时简介：学习最直接的查找方式，并理解其优势、限制和最坏 O(n) 复杂度。

预计学习时间：20 分钟

### 正文

[标题]
从头到尾逐个比较

[文本]
如果数据没有特殊顺序，最直接的查找方式是：从第一个元素开始，依次与目标比较，找到就结束；遍历完仍未找到就返回失败。

[代码 language=python]
numbers = [8, 3, 10, 6, 2]
target = 6

position = -1

for index in range(len(numbers)):
    if numbers[index] == target:
        position = index
        break

print(position)
[/代码]

[文本]
目标 6 位于索引 3。

[标题]
顺序查找的特点

[文本]
优点是实现简单、不要求数据提前排序，适用于小数据或一次性查找。

缺点是数据很大时，最坏可能检查全部 n 个元素，因此最坏时间复杂度为 O(n)。

[标题]
提前 break 的作用

[文本]
如果只找第一个匹配位置，一旦找到就可以 break。这会改善某些输入的实际执行次数，但最坏复杂度仍然是 O(n)。

[示例 title=查找第一个及格成绩]
说明：从左到右找第一个大于等于 60 的位置。
语言：python
scores = [45, 58, 72, 90]

position = -1

for index in range(len(scores)):
    if scores[index] >= 60:
        position = index
        break

print(position)
[/示例]

[提示 title=数据无序时顺序查找最通用]
没有排序或索引结构时，不要假设能够直接排除一半数据。

[警告 title=break 不会改变最坏情况]
如果目标在最后或不存在，仍然可能检查全部元素。

### 课时题目

#### 题目 1

题型：SINGLE_CHOICE
题干：顺序查找是否要求列表提前有序？
难度：EASY
分值：10
知识点：顺序查找
是否用于 Battle：否

选项：
- A. 不要求 [正确]
- B. 必须升序
- C. 必须降序
- D. 必须是树

解析：
顺序查找只是逐个比较，不依赖数据是否有序。

#### 题目 2

题型：SINGLE_CHOICE
题干：列表 `[4, 9, 2, 7]` 顺序查找目标 7，返回第一个匹配索引，结果是什么？
难度：MEDIUM
分值：10
知识点：顺序查找、索引
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：执行流程

选项：
- A. 1
- B. 2
- C. 3 [正确]
- D. -1

解析：
7 位于索引 3，因此返回 3。

#### 题目 3

题型：SINGLE_CHOICE
题干：顺序查找目标不存在时，长度 n 的列表最坏需要检查多少量级的元素？
难度：HARD
分值：10
知识点：顺序查找、复杂度
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码分析

选项：
- A. O(1)
- B. O(log n)
- C. O(n) [正确]
- D. O(n²)

解析：
目标不存在时必须检查全部 n 个元素才能确认失败，因此最坏为 O(n)。

---

## 课时 2：二分查找

课时简介：学习在有序数据上不断折半搜索，并理解它为什么是 O(log n)。

预计学习时间：20 分钟

### 正文

[标题]
二分查找的重要前提：有序

[文本]
如果列表已经从小到大排列，就可以利用大小关系排除一半候选范围。

例如在 `[2, 5, 8, 12, 16, 20, 25]` 中查找 20，先检查中间值 12。因为 20 > 12，左半部分可以全部排除。

[标题]
left、right 和 mid

[代码 language=python]
numbers = [2, 5, 8, 12, 16, 20, 25]
target = 20

left = 0
right = len(numbers) - 1
position = -1

while left <= right:
    mid = (left + right) // 2

    if numbers[mid] == target:
        position = mid
        break
    elif numbers[mid] < target:
        left = mid + 1
    else:
        right = mid - 1

print(position)
[/代码]

[文本]
每次比较后，候选范围大约缩小一半。

[标题]
为什么是 O(log n)

[文本]
如果规模 32 → 16 → 8 → 4 → 2 → 1，只需要少量折半步骤，因此二分查找时间复杂度为 O(log n)。

[标题]
无序数据不能直接二分

[文本]
如果中间值比目标小，却不能保证左侧都更小，就无法安全排除一半。因此二分查找必须建立在有序规则上。

[示例 title=查找有序成绩]
说明：在升序列表中使用二分查找定位 85。
语言：python
scores = [60, 70, 75, 80, 85, 90, 95]
target = 85

left = 0
right = len(scores) - 1
position = -1

while left <= right:
    mid = (left + right) // 2

    if scores[mid] == target:
        position = mid
        break
    elif scores[mid] < target:
        left = mid + 1
    else:
        right = mid - 1

print(position)
[/示例]

[提示 title=比较后一定排除 mid]
目标更大时用 left = mid + 1，更小时用 right = mid - 1，否则范围可能无法缩小。

[警告 title=不要对无序列表直接套二分]
没有有序前提，比较中间值不能证明另一半不含目标。

### 课时题目

#### 题目 4

题型：SINGLE_CHOICE
题干：二分查找最重要的数据前提是什么？
难度：EASY
分值：10
知识点：二分查找、有序
是否用于 Battle：否

选项：
- A. 数据按照可比较规则有序 [正确]
- B. 数据必须全部相同
- C. 列表只能有两个元素
- D. 必须使用递归

解析：
二分查找依赖有序性，才能根据中间值排除一半范围。

#### 题目 5

题型：SINGLE_CHOICE
题干：升序列表中 `numbers[mid] < target` 时，下一步应该怎样缩小范围？
难度：MEDIUM
分值：10
知识点：二分查找、边界
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：执行流程

选项：
- A. `left = mid + 1` [正确]
- B. `right = mid - 1`
- C. 把 left 重置为 0
- D. 删除整个列表

解析：
中间值小于目标，目标如果存在只能在右半部分，因此 left 移到 mid 后面。

#### 题目 6

题型：CODE_FILL
题干：补全中间索引计算表达式。请填写赋值号右侧表达式。
难度：HARD
分值：10
知识点：二分查找、mid
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码：

```python
left = 0
right = len(numbers) - 1

while left <= right:
    mid = ____
    print(mid)
    break
```

可接受答案：

```python
left = 0
right = len(numbers) - 1

while left <= right:
    mid = (left + right) // 2
    print(mid)
    break
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
基础二分查找可使用 `(left + right) // 2` 得到当前范围中间索引。

标准完整代码：

```python
left = 0
right = len(numbers) - 1

while left <= right:
    mid = (left + right) // 2
    print(mid)
    break
```

---

## 课时 3：冒泡排序

课时简介：通过相邻元素比较理解排序过程，并分析双层循环带来的 O(n²)。

预计学习时间：20 分钟

### 正文

[标题]
相邻元素比较与交换

[文本]
冒泡排序的基础思想是比较相邻元素，顺序错误就交换。一轮结束后，一个较大的元素会逐步移动到右侧。

[代码 language=python]
numbers = [5, 2, 4, 1]

n = len(numbers)

for end in range(n - 1, 0, -1):
    for i in range(end):
        if numbers[i] > numbers[i + 1]:
            numbers[i], numbers[i + 1] = numbers[i + 1], numbers[i]

print(numbers)
[/代码]

[文本]
最终得到 [1, 2, 4, 5]。

[标题]
为什么是 O(n²)

[文本]
外层进行多轮，内层每轮比较多个相邻元素，比较总次数与 n² 同级，因此基础冒泡排序时间复杂度为 O(n²)。

[标题]
学习价值在过程

[文本]
Python 实际开发通常直接使用成熟排序函数。学习冒泡排序主要是理解比较、交换、循环边界和复杂度。

[示例 title=单轮冒泡]
说明：只执行一轮相邻比较，把较大值逐步推到右侧。
语言：python
numbers = [4, 3, 1, 2]

for i in range(len(numbers) - 1):
    if numbers[i] > numbers[i + 1]:
        numbers[i], numbers[i + 1] = numbers[i + 1], numbers[i]

print(numbers)
[/示例]

[提示 title=内层只访问到 end-1]
因为要比较 i 和 i+1，所以 i+1 必须仍在有效范围内。

[警告 title=冒泡排序主要用于教学]
不要因为会手写冒泡排序，就在实际大型项目中替代语言自带的高质量排序实现。

### 课时题目

#### 题目 7

题型：SINGLE_CHOICE
题干：冒泡排序每次最基本的比较发生在哪里？
难度：EASY
分值：10
知识点：冒泡排序
是否用于 Battle：否

选项：
- A. 相邻元素之间 [正确]
- B. 只比较第一个和最后一个
- C. 随机两个元素
- D. 不进行比较

解析：
冒泡排序通过不断比较相邻元素，并在顺序错误时交换。

#### 题目 8

题型：SINGLE_CHOICE
题干：对 `[3, 1, 2]` 从左到右执行一轮升序冒泡比较后，结果是什么？
难度：MEDIUM
分值：10
知识点：冒泡排序、执行流程
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：执行流程

选项：
- A. [1, 2, 3] [正确]
- B. [3, 2, 1]
- C. [2, 3, 1]
- D. [1, 3, 2]

解析：
先比较 3 和 1，交换为 [1,3,2]；再比较 3 和 2，交换为 [1,2,3]。

#### 题目 9

题型：SINGLE_CHOICE
题干：基础冒泡排序使用两层循环，时间复杂度通常是什么？
难度：HARD
分值：10
知识点：冒泡排序、复杂度
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码分析

选项：
- A. O(1)
- B. O(log n)
- C. O(n)
- D. O(n²) [正确]

解析：
比较次数与 n² 同级，因此基础冒泡排序是 O(n²)。

---

## 课时 4：选择排序与插入排序

课时简介：比较“每轮选择最小值”和“把新元素插入已排序部分”的两种基础排序思路。

预计学习时间：20 分钟

### 正文

[标题]
选择排序

[文本]
选择排序把列表分成前面已排序和后面未排序。每一轮从未排序部分找到最小值，放到当前起始位置。

[代码 language=python]
numbers = [5, 2, 4, 1]

for start in range(len(numbers)):
    min_index = start

    for i in range(start + 1, len(numbers)):
        if numbers[i] < numbers[min_index]:
            min_index = i

    numbers[start], numbers[min_index] = numbers[min_index], numbers[start]

print(numbers)
[/代码]

[标题]
插入排序

[文本]
插入排序把前面部分看作已经有序。每次拿一个新元素，向左寻找适合位置，把它插入进去。

[代码 language=python]
numbers = [5, 2, 4, 1]

for i in range(1, len(numbers)):
    value = numbers[i]
    j = i - 1

    while j >= 0 and numbers[j] > value:
        numbers[j + 1] = numbers[j]
        j -= 1

    numbers[j + 1] = value

print(numbers)
[/代码]

[标题]
基础最坏复杂度

[文本]
选择排序会重复扫描未排序区间；插入排序在最坏情况下需要不断向左移动大量元素，所以基础版本最坏都属于 O(n²)。

[示例 title=选择当前最小值]
说明：在一个区间中找出最小元素索引。
语言：python
numbers = [8, 3, 6, 2]
min_index = 0

for i in range(1, len(numbers)):
    if numbers[i] < numbers[min_index]:
        min_index = i

print(min_index)
[/示例]

[提示 title=学习排序重点是理解不变量]
选择排序维护“前面已经放好最小值”；插入排序维护“前面始终有序”。

[警告 title=不同 O(n²) 算法也有行为差异]
复杂度相同不代表所有输入下运行过程完全相同。

### 课时题目

#### 题目 10

题型：SINGLE_CHOICE
题干：选择排序每一轮主要做什么？
难度：EASY
分值：10
知识点：选择排序
是否用于 Battle：否

选项：
- A. 从未排序部分选出最小值放到前面 [正确]
- B. 只比较相邻一个元素
- C. 每次随机删除一个值
- D. 直接二分查找

解析：
选择排序每轮寻找未排序部分最小值，并放到当前起始位置。

#### 题目 11

题型：SINGLE_CHOICE
题干：插入排序最核心的思想是什么？
难度：MEDIUM
分值：10
知识点：插入排序
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码用途

选项：
- A. 把当前元素插入前面已经有序的部分 [正确]
- B. 每轮都清空列表
- C. 只比较第一个和最后一个
- D. 使用图的 BFS

解析：
插入排序维护前面有序区间，把新元素移动到正确位置。

#### 题目 12

题型：CODE_FILL
题干：补全条件，使插入排序在左侧元素大于待插入 value 时继续右移元素。请填写 while 中缺失的比较表达式。
难度：HARD
分值：10
知识点：插入排序、循环
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码：

```python
value = numbers[i]
j = i - 1

while j >= 0 and ____:
    numbers[j + 1] = numbers[j]
    j -= 1

numbers[j + 1] = value
```

可接受答案：

```python
value = numbers[i]
j = i - 1

while j >= 0 and numbers[j] > value:
    numbers[j + 1] = numbers[j]
    j -= 1

numbers[j + 1] = value
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
升序插入排序中，如果左侧元素比待插入值大，就需要把它向右移动，为 value 腾出位置。

标准完整代码：

```python
value = numbers[i]
j = i - 1

while j >= 0 and numbers[j] > value:
    numbers[j + 1] = numbers[j]
    j -= 1

numbers[j + 1] = value
```

---

## 课时 5：快速排序的分治思想

课时简介：理解选择基准、划分左右部分、递归处理的分治思路，不深入复杂原地 partition 优化。

预计学习时间：20 分钟

### 正文

[标题]
把大问题拆成更小问题

[文本]
快速排序体现分治思想：

选择一个基准 pivot；

把较小元素放一边；

较大或相等元素放另一边；

分别排序两个更小部分；

最后组合结果。

[代码 language=python]
def quick_sort(numbers):
    if len(numbers) <= 1:
        return numbers

    pivot = numbers[0]
    smaller = []
    larger_or_equal = []

    for number in numbers[1:]:
        if number < pivot:
            smaller.append(number)
        else:
            larger_or_equal.append(number)

    return quick_sort(smaller) + [pivot] + quick_sort(larger_or_equal)

print(quick_sort([5, 2, 8, 1, 4]))
[/代码]

[文本]
这是为了教学清晰写出的非原地版本。

[标题]
平均与最坏复杂度不同

[文本]
如果每次划分比较均衡，快速排序平均通常是 O(n log n)。但如果每次 pivot 都造成极度不平衡划分，最坏可能达到 O(n²)。

[标题]
分治思想比背代码更重要

[文本]
核心是把原问题拆成若干规模更小的同类问题，递归解决，再组合。

[示例 title=按 pivot 划分数据]
说明：把小于 pivot 的放 smaller，其余放 larger。
语言：python
numbers = [5, 2, 8, 1, 4]
pivot = 5
smaller = []
larger = []

for number in numbers[1:]:
    if number < pivot:
        smaller.append(number)
    else:
        larger.append(number)

print(smaller)
print(larger)
[/示例]

[提示 title=递归一定要让问题变小]
快速排序的子列表必须比原问题规模小，并且要有长度 <= 1 的结束条件。

[警告 title=平均 O(n log n) 不等于最坏永远如此]
pivot 选择和数据分布可能导致极端不平衡，最坏退化到 O(n²)。

### 课时题目

#### 题目 13

题型：SINGLE_CHOICE
题干：快速排序体现的核心算法思想是什么？
难度：EASY
分值：10
知识点：快速排序、分治
是否用于 Battle：否

选项：
- A. 分治 [正确]
- B. 先进先出
- C. 哈希冲突
- D. 只使用一个固定变量

解析：
快速排序把数据围绕 pivot 划分为更小子问题，再递归排序并组合，是典型分治思想。

#### 题目 14

题型：SINGLE_CHOICE
题干：教学版快速排序中，pivot=5，元素 2 应进入哪个部分？
难度：MEDIUM
分值：10
知识点：快速排序、pivot
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：执行流程

选项：
- A. smaller [正确]
- B. larger
- C. 必须删除
- D. 无法比较

解析：
2 < 5，因此进入 smaller 部分。

#### 题目 15

题型：SINGLE_CHOICE
题干：为什么快速排序最坏可能达到 O(n²)？
难度：HARD
分值：10
知识点：快速排序、复杂度
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码分析

选项：
- A. 如果每次划分都极度不平衡，递归规模只减少很少 [正确]
- B. 因为快速排序一定使用双重固定循环
- C. 因为 pivot 不能比较
- D. 因为列表必须为空

解析：
极端不平衡划分会形成类似 n、n-1、n-2 的递归规模，累计工作可能达到 O(n²)。

---

## 课时 6：综合项目——学习成绩分析器

课时简介：综合使用排序、查找、哈希统计和堆思想完成一个小型成绩分析任务，并回顾整门课程的数据结构选择。

预计学习时间：20 分钟

### 正文

[标题]
任务设计

[文本]
给定一组学习成绩，需要完成：

计算平均分；

统计每个分数段人数；

找出最高的 3 个成绩；

按升序查看全部成绩；

查找某个目标成绩。

[代码 language=python]
import heapq

scores = [78, 92, 85, 66, 90, 95, 88]

average = sum(scores) / len(scores)

ranges = {
    "60-69": 0,
    "70-79": 0,
    "80-89": 0,
    "90-100": 0
}

for score in scores:
    if 60 <= score <= 69:
        ranges["60-69"] += 1
    elif 70 <= score <= 79:
        ranges["70-79"] += 1
    elif 80 <= score <= 89:
        ranges["80-89"] += 1
    elif 90 <= score <= 100:
        ranges["90-100"] += 1

sorted_scores = sorted(scores)
top_three = heapq.nlargest(3, scores)

print(average)
print(ranges)
print(sorted_scores)
print(top_three)
[/代码]

[标题]
根据需求选结构

[文本]
顺序遍历适合统计和平均值；

字典适合保存“分数段 → 人数”；

排序用于查看整体顺序；

堆适合 Top K；

有序数据上的重复查找可以考虑二分查找。

[标题]
课程最终目标不是背结构名称

[文本]
真正需要形成的问题解决流程是：

数据是什么？

最常见操作是什么？

是否需要按位置访问？

是否需要快速 key 查找？

是否需要先进先出或后进先出？

是否存在层次关系或网络关系？

数据是否有序？

是否只需要 Top K？

根据这些问题选择合适结构和算法。

[示例 title=二分查找已排序成绩]
说明：排序后查找目标分数 90。
语言：python
scores = [66, 78, 85, 88, 90, 92, 95]
target = 90

left = 0
right = len(scores) - 1
found = False

while left <= right:
    mid = (left + right) // 2

    if scores[mid] == target:
        found = True
        break
    elif scores[mid] < target:
        left = mid + 1
    else:
        right = mid - 1

print(found)
[/示例]

[提示 title=先解决正确性，再优化]
先用清晰方法得到正确结果，再根据真实数据规模和性能需求选择是否需要更高效的数据结构。

[警告 title=不要为了使用某个数据结构而强行使用]
数据结构是解决问题的工具，不是展示知识点的装饰。简单问题可能用列表就足够。

### 课时题目

#### 题目 16

题型：SINGLE_CHOICE
题干：如果要统计“每个分数段有多少人”，下面哪个结构最适合保存“分数段 → 人数”？
难度：EASY
分值：10
知识点：字典、综合应用
是否用于 Battle：否

选项：
- A. 字典 [正确]
- B. 只用一个布尔值
- C. 只用一个树节点
- D. 空集合且不添加数据

解析：
每个分数段需要对应一个计数，字典最适合保存这种键值映射。

#### 题目 17

题型：SINGLE_CHOICE
题干：如果一组成绩已经升序排列，并且需要多次查找具体分数，下面哪种算法通常比顺序查找更合适？
难度：MEDIUM
分值：10
知识点：二分查找、综合选择
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码用途

选项：
- A. 二分查找 [正确]
- B. 每次先打乱数据
- C. 只检查第一个元素
- D. 冒泡排序后不查找

解析：
数据已经有序时，二分查找能够通过折半缩小范围，通常是 O(log n)。

#### 题目 18

题型：CODE_FILL
题干：补全二分查找的右边界更新语句。当 `scores[mid] > target` 时，应排除 mid 及其右侧。请填写完整语句。
难度：HARD
分值：10
知识点：二分查找、边界、综合算法
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码：

```python
while left <= right:
    mid = (left + right) // 2

    if scores[mid] == target:
        found = True
        break
    elif scores[mid] < target:
        left = mid + 1
    else:
        ____
```

可接受答案：

```python
while left <= right:
    mid = (left + right) // 2

    if scores[mid] == target:
        found = True
        break
    elif scores[mid] < target:
        left = mid + 1
    else:
        right = mid - 1
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
当中间值大于目标时，目标如果存在只能位于左半部分，因此右边界应该移动到 mid 左边，即 `right = mid - 1`。

标准完整代码：

```python
while left <= right:
    mid = (left + right) // 2

    if scores[mid] == target:
        found = True
        break
    elif scores[mid] < target:
        left = mid + 1
    else:
        right = mid - 1
```

---
