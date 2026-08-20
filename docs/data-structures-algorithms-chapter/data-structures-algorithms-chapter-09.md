# 第九章：堆与优先队列

章节简介：本章学习“不是先到先服务，而是优先级高的先处理”的数据组织思想。通过完全二叉树认识堆，理解最大堆、最小堆、向上调整和向下调整，并使用 Python `heapq` 体验最小堆和优先队列。学习完成后，能够解释堆的核心性质，理解优先队列与普通队列的区别，并解决基础 Top K 和任务优先级问题。
预计学习时间：120 分钟

章节学习目标：
- 能够解释普通队列与优先队列的区别
- 能够理解完全二叉树的基础结构
- 能够区分最大堆和最小堆
- 能够理解堆插入后的向上调整
- 能够理解堆顶删除后的向下调整
- 能够使用 heapq 完成基础最小堆和优先级任务处理

---

## 课时 1：从普通队列到优先队列

课时简介：理解为什么某些任务不能只按到达顺序处理，并认识优先队列。

预计学习时间：20 分钟

### 正文

[标题]
普通队列看先后顺序

[文本]
普通队列遵循先进先出。任务 A 先到，任务 B 后到，那么通常先处理 A。

这种规则适合排队叫号、打印任务和消息按到达顺序处理。

[标题]
有些场景更看重优先级

[文本]
例如急诊系统中，普通咨询先到，但严重急症后到。如果只严格按到达顺序，严重急症可能等待很久。

这时需要让优先级更高的任务先处理，这就是优先队列的思想。

[代码 language=python]
tasks = [
    (3, "普通任务"),
    (1, "紧急任务"),
    (2, "重要任务")
]

print(tasks)
[/代码]

[文本]
这里约定数字越小优先级越高。真正取任务时，不是简单拿最早加入的，而是选择当前优先级最高的任务。

[标题]
优先队列关注“谁更重要”

[文本]
普通队列重点是“谁先来”，优先队列重点是“谁应该先处理”。堆是实现优先队列的经典数据结构之一。

[示例 title=任务优先级]
说明：用二元组表示优先级和任务名称，为后续 heapq 做准备。
语言：python
tasks = [
    (2, "生成报告"),
    (1, "处理错误"),
    (3, "整理日志")
]

for task in tasks:
    print(task)
[/示例]

[提示 title=优先级规则必须明确]
数字越大越优先还是越小越优先，应在系统设计时统一。本章使用 heapq 时默认较小值优先。

[警告 title=优先队列不是自动排序整个列表]
它主要保证能够高效取得当前最高优先级元素，不代表内部所有元素始终完整有序。

### 课时题目

#### 题目 1

题型：SINGLE_CHOICE
题干：优先队列与普通 FIFO 队列最主要的区别是什么？
难度：EASY
分值：10
知识点：优先队列、FIFO
是否用于 Battle：否

选项：
- A. 优先队列根据优先级决定处理顺序 [正确]
- B. 优先队列不能保存数据
- C. 普通队列会自动排序
- D. 两者完全相同

解析：
普通队列主要按到达顺序处理，优先队列根据任务优先级决定谁先被取出。

#### 题目 2

题型：SINGLE_CHOICE
题干：若约定数字越小优先级越高，任务优先级分别为 3、1、2，哪个任务应最先处理？
难度：MEDIUM
分值：10
知识点：优先级、任务调度
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：执行流程

选项：
- A. 优先级 1 [正确]
- B. 优先级 2
- C. 优先级 3
- D. 随机选择

解析：
题目明确数字越小优先级越高，因此优先级 1 最先处理。

#### 题目 3

题型：SINGLE_CHOICE
题干：下面哪个场景更适合优先队列而不是普通 FIFO 队列？
难度：HARD
分值：10
知识点：优先队列、应用
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码用途

选项：
- A. 所有任务严格按到达顺序处理
- B. 紧急故障需要优先于普通后台任务处理 [正确]
- C. 只保存一个固定整数
- D. 判断字符串是否回文

解析：
紧急故障需要根据优先级插队处理，符合优先队列而不是普通 FIFO。

---

## 课时 2：完全二叉树与堆结构

课时简介：认识堆常用的完全二叉树形状，并理解为什么它适合用数组存储。

预计学习时间：20 分钟

### 正文

[标题]
堆通常是一棵完全二叉树

[文本]
完全二叉树可以理解为：除最后一层外，上面的层都尽量填满；最后一层节点从左向右连续出现，中间不随意留空。

这种紧凑形状非常适合按层放入数组。

[标题]
数组中的父子关系

[文本]
如果使用从 0 开始的索引，对于索引 i：

左孩子索引常用 `2 * i + 1`；

右孩子索引常用 `2 * i + 2`；

父节点索引常用 `(i - 1) // 2`。

[代码 language=python]
i = 1

left = 2 * i + 1
right = 2 * i + 2
parent = (i - 1) // 2

print(left)
print(right)
print(parent)
[/代码]

[文本]
索引 1 的左右孩子是 3、4，父节点是 0。

[示例 title=计算堆节点关系]
说明：给定索引 2，计算左右孩子位置。
语言：python
i = 2

left = 2 * i + 1
right = 2 * i + 2

print(left)
print(right)
[/示例]

[提示 title=公式建立在数组从 0 开始]
本章所有堆索引公式统一使用 0-based 索引。

[警告 title=计算出孩子索引不代表孩子一定存在]
得到 left 或 right 后，还必须判断索引是否小于堆长度。

### 课时题目

#### 题目 4

题型：SINGLE_CHOICE
题干：经典二叉堆通常使用哪种树形状？
难度：EASY
分值：10
知识点：堆、完全二叉树
是否用于 Battle：否

选项：
- A. 完全二叉树 [正确]
- B. 任意多叉图
- C. 单链表
- D. 只能是空树

解析：
经典二叉堆通常建立在完全二叉树结构上。

#### 题目 5

题型：SINGLE_CHOICE
题干：0-based 堆数组中，节点索引 i=2 的左孩子索引是多少？
难度：MEDIUM
分值：10
知识点：堆、数组索引
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：输出预测

选项：
- A. 3
- B. 4
- C. 5 [正确]
- D. 6

解析：
左孩子索引是 `2 * i + 1`，代入 i=2 得到 5。

#### 题目 6

题型：CODE_FILL
题干：补全表达式，计算 0-based 堆数组中索引 i 的父节点索引。请填写赋值号右侧表达式。
难度：HARD
分值：10
知识点：堆、父节点、索引
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码：

```python
i = 5

parent = ____

print(parent)
```

可接受答案：

```python
i = 5

parent = (i - 1) // 2

print(parent)
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
0-based 二叉堆中，非根节点 i 的父节点索引可以用 `(i - 1) // 2` 计算。

标准完整代码：

```python
i = 5

parent = (i - 1) // 2

print(parent)
```

---

## 课时 3：最大堆与最小堆

课时简介：理解堆序性质以及堆顶为什么能快速给出最大值或最小值。

预计学习时间：20 分钟

### 正文

[标题]
最大堆

[文本]
最大堆要求每个父节点的值都不小于它的孩子，因此整个堆的最大值一定在根节点，也就是数组索引 0。

[代码 language=python]
heap = [90, 70, 80, 40, 60, 50]

print(heap[0])
[/代码]

[标题]
最小堆

[文本]
最小堆要求每个父节点值都不大于它的孩子，因此整个堆的最小值在根节点。

[代码 language=python]
heap = [10, 20, 15, 40, 30]

print(heap[0])
[/代码]

[标题]
堆不是完整排序

[文本]
最大堆只保证父节点不小于孩子，不保证数组整体从大到小排列。最小堆也只保证父节点不大于孩子，不代表全部元素已经升序。

[示例 title=检查最小堆根节点]
说明：最小堆中根节点应不大于其直接孩子。
语言：python
heap = [5, 10, 8, 20, 15]

root = heap[0]
left = heap[1]
right = heap[2]

print(root <= left and root <= right)
[/示例]

[提示 title=堆只保证局部父子关系]
不要把堆误认为已经全部排序的数组。

[警告 title=根是极值不代表第二个元素是第二极值]
堆只保证父子关系，第二小或第二大元素不一定固定在某个简单位置。

### 课时题目

#### 题目 7

题型：SINGLE_CHOICE
题干：最小堆的根节点保存什么性质的值？
难度：EASY
分值：10
知识点：最小堆、堆顶
是否用于 Battle：否

选项：
- A. 当前最小值 [正确]
- B. 当前最大值
- C. 随机值
- D. 一定是平均值

解析：
最小堆要求父节点不大于孩子，因此根节点是整个堆的最小值。

#### 题目 8

题型：SINGLE_CHOICE
题干：下面哪项关于最大堆的描述正确？
难度：MEDIUM
分值：10
知识点：最大堆、堆序
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码分析

选项：
- A. 每个父节点都不小于自己的孩子 [正确]
- B. 数组必须完整从大到小排序
- C. 根节点一定最小
- D. 所有叶子必须相等

解析：
最大堆只要求局部父子满足父节点不小于孩子，并不要求数组整体有序。

#### 题目 9

题型：SINGLE_CHOICE
题干：为什么满足最大堆性质的数组不能直接认为“已经完整降序”？
难度：HARD
分值：10
知识点：堆序、排序
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码分析

选项：
- A. 因为堆只保证父节点和孩子之间的局部关系，不保证所有数组位置整体有序 [正确]
- B. 因为最大堆不能保存数字
- C. 因为根节点不是最大值
- D. 因为叶子节点不能比较

解析：
最大堆是部分有序结构，保证父子关系，但并不要求整个数组按降序排列。

---

## 课时 4：堆插入与向上调整

课时简介：理解新元素先放到末尾，再通过与父节点比较恢复堆序的过程。

预计学习时间：20 分钟

### 正文

[标题]
插入先保持完全二叉树形状

[文本]
堆插入新元素时，先把新值放到数组末尾，从而保持完全二叉树形状。但新值可能破坏堆序。

例如最小堆 [10, 20, 15, 30] 插入 5 后成为 [10, 20, 15, 30, 5]，5 比父节点 20 小，需要调整。

[标题]
向上调整

[代码 language=python]
heap = [10, 20, 15, 30]
heap.append(5)

i = len(heap) - 1

while i > 0:
    parent = (i - 1) // 2

    if heap[parent] <= heap[i]:
        break

    heap[parent], heap[i] = heap[i], heap[parent]
    i = parent

print(heap)
[/代码]

[文本]
新元素不断和父节点比较。如果最小堆中子节点更小，就交换，并继续向上，直到父子关系正确或到达根。

[示例 title=最小堆向上调整]
说明：插入新值后不断与父节点比较并交换。
语言：python
heap = [4, 10, 7, 15]
heap.append(2)

i = len(heap) - 1

while i > 0:
    parent = (i - 1) // 2
    if heap[parent] <= heap[i]:
        break
    heap[parent], heap[i] = heap[i], heap[parent]
    i = parent

print(heap)
[/示例]

[提示 title=插入从末尾开始]
先保证树形状，再通过向上调整恢复堆序。

[警告 title=交换后索引也要跟着移动]
交换完后，新值的位置已经变成 parent，因此必须更新 `i = parent`。

### 课时题目

#### 题目 10

题型：SINGLE_CHOICE
题干：二叉堆插入新元素时，通常先把新元素放在哪里？
难度：EASY
分值：10
知识点：堆插入、完全二叉树
是否用于 Battle：否

选项：
- A. 数组末尾 [正确]
- B. 随机位置
- C. 永远替换根
- D. 删除父节点

解析：
把新元素放到数组末尾能够保持完全二叉树形状，然后再进行向上调整。

#### 题目 11

题型：SINGLE_CHOICE
题干：在最小堆向上调整中，什么时候需要把子节点与父节点交换？
难度：MEDIUM
分值：10
知识点：最小堆、向上调整
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：执行流程

选项：
- A. 子节点小于父节点时 [正确]
- B. 子节点大于父节点时一定交换
- C. 无论大小都交换
- D. 只在根节点时交换

解析：
最小堆要求父节点不大于孩子。如果子节点更小，就违反规则，需要交换。

#### 题目 12

题型：CODE_FILL
题干：补全父节点索引计算，使最小堆插入能够向上调整。请填写赋值号右侧表达式。
难度：HARD
分值：10
知识点：堆、父节点、向上调整
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码：

```python
i = len(heap) - 1

while i > 0:
    parent = ____

    if heap[parent] <= heap[i]:
        break

    heap[parent], heap[i] = heap[i], heap[parent]
    i = parent
```

可接受答案：

```python
i = len(heap) - 1

while i > 0:
    parent = (i - 1) // 2

    if heap[parent] <= heap[i]:
        break

    heap[parent], heap[i] = heap[i], heap[parent]
    i = parent
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
0-based 堆中索引 i 的父节点为 `(i - 1) // 2`。

标准完整代码：

```python
i = len(heap) - 1

while i > 0:
    parent = (i - 1) // 2

    if heap[parent] <= heap[i]:
        break

    heap[parent], heap[i] = heap[i], heap[parent]
    i = parent
```

---

## 课时 5：删除堆顶与向下调整

课时简介：理解取出堆顶极值后如何用末尾元素补位，并向下调整恢复堆序。

预计学习时间：20 分钟

### 正文

[标题]
堆最常删除的是堆顶

[文本]
优先队列最关心当前最高优先级元素，因此堆中最常见的删除操作是取出根节点。在最小堆中就是取最小值。

[标题]
末尾元素补到根

[文本]
为了保持完全二叉树形状，可以先保存根值，把最后一个元素移动到根，删除数组末尾，再进行向下调整。

[代码 language=python]
heap = [5, 10, 8, 20, 15]

heap[0] = heap[-1]
heap.pop()

i = 0

while True:
    left = 2 * i + 1
    right = 2 * i + 2
    smallest = i

    if left < len(heap) and heap[left] < heap[smallest]:
        smallest = left

    if right < len(heap) and heap[right] < heap[smallest]:
        smallest = right

    if smallest == i:
        break

    heap[i], heap[smallest] = heap[smallest], heap[i]
    i = smallest

print(heap)
[/代码]

[文本]
最小堆向下时，如果孩子中存在更小值，就与更小的那个交换并继续向下。

[示例 title=选择更小孩子]
说明：比较当前节点与左右孩子，找出最小位置。
语言：python
heap = [20, 8, 10]
i = 0

left = 1
right = 2
smallest = i

if heap[left] < heap[smallest]:
    smallest = left

if heap[right] < heap[smallest]:
    smallest = right

print(smallest)
[/示例]

[提示 title=最小堆向下时选择更小的孩子]
如果两个孩子都比父节点小，应与更小的孩子交换。

[警告 title=访问孩子前先判断索引存在]
最后一层节点可能只有左孩子，没有右孩子，所以先检查索引是否小于堆长度。

### 课时题目

#### 题目 13

题型：SINGLE_CHOICE
题干：最小堆删除堆顶后，通常用哪个元素先补到根位置？
难度：EASY
分值：10
知识点：堆删除、堆顶
是否用于 Battle：否

选项：
- A. 最后一个元素 [正确]
- B. 随机新元素
- C. 永远用 0
- D. 左孩子一定直接删除

解析：
用最后一个元素补到根后再缩短数组，可以保持完全二叉树形状。

#### 题目 14

题型：SINGLE_CHOICE
题干：最小堆向下调整时，如果当前节点比两个孩子都大，通常应该优先与哪个孩子交换？
难度：MEDIUM
分值：10
知识点：最小堆、向下调整
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：执行流程

选项：
- A. 更小的孩子 [正确]
- B. 更大的孩子
- C. 随机孩子
- D. 不需要交换

解析：
最小堆需要让父节点不大于孩子，与更小的孩子交换才能正确恢复局部堆序。

#### 题目 15

题型：SINGLE_CHOICE
题干：为什么堆顶删除后不能只把根直接删除而不补位？
难度：HARD
分值：10
知识点：完全二叉树、堆删除
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码分析

选项：
- A. 会破坏完全二叉树紧凑形状 [正确]
- B. Python 不允许删除数字
- C. 根节点永远不能变化
- D. 堆中不能有空数组

解析：
堆需要保持完全二叉树形状。直接在根留下空位会破坏结构，因此常用末尾元素补到根，再向下调整。

---

## 课时 6：heapq 与 Top K

课时简介：使用 Python 标准库 heapq 完成最小堆操作，并认识优先任务和 Top K 场景。

预计学习时间：20 分钟

### 正文

[标题]
Python 的 heapq 默认是最小堆

[代码 language=python]
import heapq

heap = []

heapq.heappush(heap, 20)
heapq.heappush(heap, 5)
heapq.heappush(heap, 10)

print(heapq.heappop(heap))
[/代码]

[文本]
输出 5。heappush 负责插入并维护堆，heappop 取出当前最小值并维护剩余堆。

[标题]
优先任务

[代码 language=python]
import heapq

tasks = []

heapq.heappush(tasks, (2, "生成报告"))
heapq.heappush(tasks, (1, "处理故障"))
heapq.heappush(tasks, (3, "整理日志"))

while len(tasks) > 0:
    priority, name = heapq.heappop(tasks)
    print(priority, name)
[/代码]

[文本]
二元组先比较第一个元素，因此优先级 1 最先取出。

[标题]
Top K 思想

[文本]
如果只需要大量数据中的前 K 个最大或最小元素，不一定要把全部数据完整排序。堆可以维护有限数量的候选。

[示例 title=取得三个最小值]
说明：把数字放入 heapq，再连续弹出三个最小值。
语言：python
import heapq

numbers = [8, 3, 10, 1, 6]
heapq.heapify(numbers)

for _ in range(3):
    print(heapq.heappop(numbers))
[/示例]

[提示 title=heapq 默认小值优先]
如果业务定义数字越小优先级越高，heapq 可以直接使用。

[警告 title=不要依赖 heap 列表整体有序]
heapq 只保证堆性质。若要按顺序取得所有元素，应反复 heappop。

### 课时题目

#### 题目 16

题型：SINGLE_CHOICE
题干：Python `heapq` 默认实现哪种堆？
难度：EASY
分值：10
知识点：heapq、最小堆
是否用于 Battle：否

选项：
- A. 最小堆 [正确]
- B. 最大堆
- C. 单链表
- D. 普通栈

解析：
Python heapq 默认使用最小堆语义，堆顶是当前最小元素。

#### 题目 17

题型：SINGLE_CHOICE
题干：下面程序第一次 `heappop` 输出什么？

```python
import heapq

heap = []
heapq.heappush(heap, 9)
heapq.heappush(heap, 4)
heapq.heappush(heap, 7)

print(heapq.heappop(heap))
```

难度：MEDIUM
分值：10
知识点：heapq、最小堆
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：输出预测

选项：
- A. 9
- B. 7
- C. 4 [正确]
- D. 0

解析：
heapq 是最小堆，当前最小元素 4 位于逻辑堆顶，因此第一次弹出 4。

#### 题目 18

题型：CODE_FILL
题干：补全取出语句，使程序从 heapq 中取得当前最小元素并赋值给 value。请填写完整赋值语句。
难度：HARD
分值：10
知识点：heapq、heappop、优先队列
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码：

```python
import heapq

heap = [8, 3, 10, 1, 6]
heapq.heapify(heap)

____

print(value)
```

可接受答案：

```python
import heapq

heap = [8, 3, 10, 1, 6]
heapq.heapify(heap)

value = heapq.heappop(heap)

print(value)
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
heapq.heappop(heap) 会取出并返回最小堆堆顶，也就是当前最小元素。

标准完整代码：

```python
import heapq

heap = [8, 3, 10, 1, 6]
heapq.heapify(heap)

value = heapq.heappop(heap)

print(value)
```

---
