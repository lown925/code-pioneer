# 第五章：队列

章节简介：本章学习队列这种典型的线性数据结构。通过“排队处理任务”的场景理解先进先出规则，掌握入队、出队、查看队首和判空等基本操作，并进一步认识 Python `collections.deque`、循环队列思想以及任务调度等实际应用。学习完成后，能够判断哪些问题适合使用队列，并理解队列为什么经常用于保存“先到先处理”的任务。
预计学习时间：120 分钟

章节学习目标：
- 能够解释队列的先进先出原则
- 能够区分队首、队尾、入队和出队操作
- 能够理解使用 Python 列表头部删除元素的效率问题
- 能够使用 `collections.deque` 完成基础队列操作
- 能够理解循环队列中 front、rear 和空间复用的基本思想
- 能够使用队列解决简单任务调度和按到达顺序处理的问题

---

## 课时 1：认识队列与先进先出

课时简介：通过排队场景认识队列，理解“先进入的数据先被处理”的先进先出规则。

预计学习时间：20 分钟

### 正文

[标题]
什么是队列

[文本]
队列是一种常见的线性数据结构。

它最重要的规则是：

先进入队列的数据，先被取出。

这种规则称为“先进先出”，英文常写作 FIFO，即 First In, First Out。

日常生活中的排队就是最直观的例子。

先到服务窗口的人通常先办理业务，后到的人排在后面等待。

[标题]
队首和队尾

[文本]
队列通常有两个重要位置：

队首：最早进入、下一次应该被取出的元素；

队尾：新元素加入的位置。

如果数据依次进入：

A、B、C

那么队列可以理解为：

队首 → A、B、C ← 队尾

下一次出队的应该是 A，而不是最后加入的 C。

[代码 language=python]
queue = []

queue.append("A")
queue.append("B")
queue.append("C")

print(queue)
[/代码]

[文本]
这里先使用 Python 列表帮助理解队列顺序。

append() 把新元素加入列表末尾，因此可以把列表末尾看作队尾。

[标题]
队列和栈的核心区别

[文本]
上一章学习的栈是后进先出。

队列则是先进先出。

例如数据依次进入 A、B、C：

栈首先取出 C；

队列首先取出 A。

这两种结构都保存有顺序的数据，但取出数据的规则不同，因此适用场景也不同。

[示例 title=排队处理学习任务]
说明：三个任务按照到达顺序进入队列，最早进入的任务应该最先处理。
语言：python
queue = []

queue.append("提交作业")
queue.append("批改测验")
queue.append("生成学习报告")

print(queue[0])
[/示例]

[提示 title=看到“先到先处理”就想到队列]
如果问题强调报名顺序、任务到达顺序、请求先后等，可以优先考虑是否符合先进先出的队列思想。

[警告 title=队列不是按重要程度自动排序]
普通队列只看进入先后。若任务需要“优先级高的先处理”，后面学习优先队列时会使用不同的数据结构。

### 课时题目

#### 题目 1

题型：SINGLE_CHOICE
题干：队列最典型的数据访问规则是什么？
难度：EASY
分值：10
知识点：队列、FIFO、基本概念
是否用于 Battle：否

选项：
- A. 后进先出
- B. 先进先出 [正确]
- C. 按数值从大到小取出
- D. 每次随机取出一个元素

解析：
普通队列遵循先进先出原则，也就是最早进入队列的元素通常最先被取出。

#### 题目 2

题型：SINGLE_CHOICE
题干：任务 A、B、C 按照这个顺序依次进入普通队列。第一次出队时应该取出哪个任务？
难度：MEDIUM
分值：10
知识点：队列、FIFO、执行顺序
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：执行流程

选项：
- A. A [正确]
- B. B
- C. C
- D. 无法确定

解析：
A 最先进入队列。普通队列遵循先进先出，因此 A 应当最先被取出。

#### 题目 3

题型：SINGLE_CHOICE
题干：数据依次为 A、B、C。下面哪项正确描述了栈和队列第一次取出的元素？
难度：HARD
分值：10
知识点：栈、队列、LIFO、FIFO
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码分析

选项：
- A. 栈取 A，队列取 C
- B. 栈取 C，队列取 A [正确]
- C. 栈和队列都取 B
- D. 栈和队列都必须随机取一个

解析：
栈遵循后进先出，因此最后进入的 C 最先被取出；队列遵循先进先出，因此最早进入的 A 最先被取出。

---

## 课时 2：队列的基本操作

课时简介：掌握入队、出队、查看队首和判空，并使用简单代码理解队列状态变化。

预计学习时间：20 分钟

### 正文

[标题]
四个常见队列操作

[文本]
基础队列通常包含这些操作：

入队：把新元素加入队尾；

出队：移除并取得队首元素；

查看队首：读取最早进入的元素但不删除；

判空：判断队列中是否还有元素。

为了先理解行为，可以使用 Python 列表表示队列。

[代码 language=python]
queue = []

queue.append(10)
queue.append(20)
queue.append(30)

front = queue[0]
removed = queue.pop(0)

print(front)
print(removed)
print(queue)
[/代码]

[文本]
queue[0] 查看队首但不删除。

queue.pop(0) 删除索引 0 的元素，也就是当前队首。

程序中 front 和 removed 都是 10，删除以后队列剩余 [20, 30]。

[标题]
入队发生在队尾

[代码 language=python]
queue = [10, 20]

queue.append(30)

print(queue)
[/代码]

[文本]
append(30) 会把 30 加到末尾。

此时：

队首是 10；

队尾是 30。

[标题]
空队列需要边界判断

[文本]
当队列为空时：

[代码 language=python]
queue = []
[/代码]

[文本]
直接访问 queue[0] 或执行 queue.pop(0) 都会产生 IndexError。

因此不确定队列是否为空时，应先检查。

[代码 language=python]
queue = []

if len(queue) > 0:
    value = queue.pop(0)
    print(value)
else:
    print("队列为空")
[/代码]

[示例 title=依次处理两个任务]
说明：把任务依次入队，然后按照到达先后取出。
语言：python
queue = []

queue.append("任务A")
queue.append("任务B")

first = queue.pop(0)
second = queue.pop(0)

print(first)
print(second)
[/示例]

[提示 title=队首和队尾不要混淆]
本课先用列表理解：索引 0 是队首，列表末尾是队尾；新元素从队尾加入，旧元素从队首取出。

[警告 title=列表 pop(0) 能表达队列，但效率并不理想]
使用 list.pop(0) 删除第一个元素时，后续元素通常需要移动。下一课会专门讨论这个问题，并介绍更适合实现队列的 deque。

### 课时题目

#### 题目 4

题型：SINGLE_CHOICE
题干：使用本课的 Python 列表方式表示普通队列时，新元素通常加入哪个位置？
难度：EASY
分值：10
知识点：队列、入队、队尾
是否用于 Battle：否

选项：
- A. 队尾 [正确]
- B. 队首前面的不存在位置
- C. 随机位置
- D. 每次都覆盖第一个元素

解析：
普通队列的新元素从队尾加入，最早进入的元素位于队首并最先被取出。

#### 题目 5

题型：SINGLE_CHOICE
题干：下面程序运行后依次输出什么？

```python
queue = []

queue.append(5)
queue.append(8)
queue.append(13)

print(queue.pop(0))
print(queue[0])
```

难度：MEDIUM
分值：10
知识点：队列、出队、队首
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：输出预测

选项：
- A. 5 和 8 [正确]
- B. 13 和 8
- C. 5 和 13
- D. 8 和 13

解析：
第一次 pop(0) 删除并返回队首 5。队列变成 [8, 13]，此时新的队首 queue[0] 是 8。

#### 题目 6

题型：CODE_FILL
题干：补全条件，使程序只有在队列非空时才执行出队。请填写 if 后面的条件表达式。
难度：HARD
分值：10
知识点：队列、判空、边界处理
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码：

```python
queue = ["任务A", "任务B"]

if ____:
    task = queue.pop(0)
    print(task)
else:
    print("队列为空")
```

可接受答案：

```python
queue = ["任务A", "任务B"]

if len(queue) > 0:
    task = queue.pop(0)
    print(task)
else:
    print("队列为空")
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
只有队列中存在元素时才能安全执行 pop(0)。使用 `len(queue) > 0` 可以明确判断队列非空。

标准完整代码：

```python
queue = ["任务A", "任务B"]

if len(queue) > 0:
    task = queue.pop(0)
    print(task)
else:
    print("队列为空")
```

---

## 课时 3：为什么不能总用 list.pop(0)

课时简介：从顺序表删除第一个元素的移动成本出发，理解为什么 Python 列表虽然能模拟队列，却不适合高频队首删除。

预计学习时间：20 分钟

### 正文

[标题]
功能正确不等于结构选择合适

[文本]
使用 Python 列表可以写出正确的队列：

[代码 language=python]
queue = []

queue.append("A")
queue.append("B")
queue.append("C")

first = queue.pop(0)

print(first)
[/代码]

[文本]
这段程序在功能上没有问题。

但是，如果队列中有大量元素，并且频繁执行 pop(0)，就需要考虑效率。

[标题]
删除第一个元素会发生什么

[文本]
列表是顺序结构。

假设当前列表：

[A, B, C, D]

删除索引 0 的 A 后，剩余元素需要形成：

[B, C, D]

从顺序结构角度看，B、C、D 的位置都需要向前调整。

数据越多，需要处理的后续元素可能越多。

因此，list.pop(0) 在最坏情况下通常属于 O(n) 操作。

[标题]
尾部 pop() 为什么不同

[文本]
如果删除列表末尾：

[代码 language=python]
values = [10, 20, 30, 40]

values.pop()

print(values)
[/代码]

[文本]
末尾元素后面没有其他元素，不需要把大量后续数据向前移动。

因此，末尾 pop() 通常比 pop(0) 更适合高频操作。

这也是上一章使用列表末尾实现栈比较自然的原因。

[标题]
数据结构选择会影响算法效率

[文本]
如果一个程序只有三五个元素，pop(0) 的性能差异很难被察觉。

但是对于长期运行、频繁处理大量任务的队列，应该选择更加适合“队首删除”的结构。

Python 标准库中的 `collections.deque` 就是常见选择之一。

下一课会学习它。

[示例 title=观察队首与队尾删除]
说明：两个操作都能删除元素，但它们在顺序结构中的移动需求不同。
语言：python
values = [10, 20, 30, 40]

front_removed = values.pop(0)
print(front_removed)
print(values)

back_removed = values.pop()
print(back_removed)
print(values)
[/示例]

[提示 title=不要只看 API 是否能完成任务]
一个方法“能做”某件事，并不代表它就是这个场景最合适的结构。数据规模和操作频率会影响选择。

[警告 title=复杂度讨论的是增长趋势]
并不是说 pop(0) 一执行就一定“很慢”。当数据规模很小时，它完全可能足够快；这里讨论的是大量数据和高频操作下的增长趋势。

### 课时题目

#### 题目 7

题型：SINGLE_CHOICE
题干：为什么频繁使用 `list.pop(0)` 实现大型队列通常不够理想？
难度：EASY
分值：10
知识点：列表、队首删除、时间复杂度
是否用于 Battle：否

选项：
- A. 删除队首后，后续元素通常需要调整位置 [正确]
- B. Python 不允许删除索引 0
- C. pop(0) 会自动清空整个列表
- D. pop(0) 只能用于字符串

解析：
列表是顺序结构，删除第一个元素后，后续元素通常需要向前移动，因此高频队首删除的成本会随着数据规模增大。

#### 题目 8

题型：SINGLE_CHOICE
题干：设列表长度为 n。下面哪项最符合 `values.pop(0)` 的最坏时间复杂度？
难度：MEDIUM
分值：10
知识点：列表删除、复杂度、O(n)
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码分析

选项：
- A. O(1)
- B. O(log n)
- C. O(n) [正确]
- D. O(n²)

解析：
删除索引 0 后，后面的元素通常需要向前移动，因此移动数量可能与 n 同级，最坏时间复杂度通常为 O(n)。

#### 题目 9

题型：SINGLE_CHOICE
题干：程序需要长期维护大量排队任务，并且最频繁的操作是“队尾加入、队首取出”。下面哪种设计思路更合理？
难度：HARD
分值：10
知识点：队列、列表、数据结构选择、复杂度
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码用途

选项：
- A. 始终使用列表并频繁 pop(0)，完全不考虑数据规模
- B. 选择对队尾加入和队首取出都更适合的数据结构，例如 deque [正确]
- C. 每处理一个任务就重新排序所有任务
- D. 把所有任务转换成同一个字符串

解析：
队列的核心操作是队尾加入和队首取出。如果操作频繁且数据量大，应选择能高效支持这两个端点操作的数据结构。Python 的 deque 正适合这种需求。

---

## 课时 4：使用 deque 实现队列

课时简介：学习 Python `collections.deque` 的基本队列操作，并理解 append、popleft 与队列语义之间的对应关系。

预计学习时间：20 分钟

### 正文

[标题]
deque 是双端队列

[文本]
Python 标准库提供了 `collections.deque`。

deque 的名称来自 double-ended queue，也就是双端队列。

它能够高效地在两端加入或删除元素。

对于普通先进先出队列，我们最常使用：

append(value)：从右侧，也就是队尾加入；

popleft()：从左侧，也就是队首取出。

[代码 language=python]
from collections import deque

queue = deque()

queue.append("A")
queue.append("B")
queue.append("C")

print(queue.popleft())
print(queue)
[/代码]

[文本]
第一次 popleft() 会取出 A。

剩余队列中是 B、C。

这和普通队列的先进先出规则完全一致。

[标题]
查看队首

[文本]
如果只想查看队首而不删除，可以使用：

[代码 language=python]
from collections import deque

queue = deque(["A", "B", "C"])

print(queue[0])
[/代码]

[文本]
输出 A。

和列表一样，如果 deque 为空，直接访问 queue[0] 也会越界，所以仍然需要根据程序场景进行判空。

[标题]
为什么 deque 更适合基础队列

[文本]
deque 专门支持两端操作。

队尾 append 和队首 popleft 通常都可以看作 O(1) 级别的操作。

因此，在 Python 中需要频繁进行先进先出处理时，deque 通常比 list + pop(0) 更自然。

[标题]
不要因为名字叫双端队列就忘记普通队列规则

[文本]
deque 还支持 appendleft()、pop() 等另一端操作。

但如果当前问题是普通 FIFO 队列，就应该保持一致的操作规则：

队尾 append；

队首 popleft。

这样代码语义最清晰。

[示例 title=使用 deque 处理消息]
说明：消息按到达顺序入队，并按相同顺序被处理。
语言：python
from collections import deque

messages = deque()

messages.append("消息1")
messages.append("消息2")
messages.append("消息3")

while len(messages) > 0:
    current = messages.popleft()
    print("处理：", current)
[/示例]

[提示 title=普通队列固定一套方向]
本课程统一使用右侧 append 入队、左侧 popleft 出队。固定方向能够减少混乱。

[警告 title=不要无意间把 FIFO 写成 LIFO]
如果使用 append() 加入，却使用 pop() 从右侧取出，就变成了“最后加入的最先取出”，行为更像栈，而不是普通队列。

### 课时题目

#### 题目 10

题型：SINGLE_CHOICE
题干：使用 `collections.deque` 实现普通 FIFO 队列时，哪个方法最适合从队首取出元素？
难度：EASY
分值：10
知识点：deque、popleft、队列
是否用于 Battle：否

选项：
- A. popleft() [正确]
- B. append()
- C. appendleft()
- D. clear()

解析：
本课程使用右侧 append() 入队，因此队首位于左侧，应使用 popleft() 取出最早加入的元素。

#### 题目 11

题型：SINGLE_CHOICE
题干：下面程序运行后依次输出什么？

```python
from collections import deque

queue = deque()

queue.append(10)
queue.append(20)
queue.append(30)

print(queue.popleft())
print(queue.popleft())
```

难度：MEDIUM
分值：10
知识点：deque、FIFO、执行流程
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：输出预测

选项：
- A. 30、20
- B. 10、20 [正确]
- C. 10、30
- D. 20、30

解析：
元素按照 10、20、30 的顺序入队。popleft() 每次从队首取出，所以第一次得到 10，第二次得到 20。

#### 题目 12

题型：CODE_FILL
题干：补全出队语句，使程序按照先进先出顺序从 deque 队首取出最早加入的任务。请填写完整赋值语句。
难度：HARD
分值：10
知识点：deque、popleft、FIFO
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码：

```python
from collections import deque

queue = deque()

queue.append("任务A")
queue.append("任务B")
queue.append("任务C")

____

print(task)
```

可接受答案：

```python
from collections import deque

queue = deque()

queue.append("任务A")
queue.append("任务B")
queue.append("任务C")

task = queue.popleft()

print(task)
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
普通队列要求最早进入的元素最先取出。任务A最早通过 append() 加入，因此应使用 `queue.popleft()` 从左侧队首取出，并赋值给 task。

标准完整代码：

```python
from collections import deque

queue = deque()

queue.append("任务A")
queue.append("任务B")
queue.append("任务C")

task = queue.popleft()

print(task)
```

---

## 课时 5：循环队列的基本思想

课时简介：理解固定容量顺序存储中的空间浪费问题，认识 front、rear 和循环利用数组空间的基本思想。

预计学习时间：20 分钟

### 正文

[标题]
固定数组实现队列会遇到什么问题

[文本]
为了理解循环队列，可以先想象使用一个固定长度数组保存队列。

假设容量为 5。

开始时数据依次放入：

[A, B, C, D, _]

如果 A、B 依次出队，前两个位置就空了：

[_, _, C, D, _]

如果只让 rear 一直向右移动，而永远不回到前面，那么当 rear 到达数组末尾以后，程序可能认为“没有位置了”。

但实际上数组前面已经出现空位。

[标题]
把数组想象成一个环

[文本]
循环队列的核心思想是：

走到数组末尾以后，可以重新回到数组开头继续使用空位置。

也就是把固定数组想象成首尾相连的环。

例如索引：

0 → 1 → 2 → 3 → 4 → 再回到 0

[标题]
front 和 rear

[文本]
循环队列通常使用两个位置变量：

front：表示当前队首附近的位置；

rear：表示下一次入队或队尾附近的位置。

具体定义在不同实现中可能略有差异，所以实际编程时必须先明确约定。

本课程使用一个简单思想来理解循环移动：

[代码 language=python]
capacity = 5
index = 4

next_index = (index + 1) % capacity

print(next_index)
[/代码]

[文本]
程序输出 0。

因为：

(4 + 1) % 5 = 0

这正好表示索引从末尾 4 回到开头 0。

[标题]
取模实现循环位置

[文本]
如果容量是 capacity，可以使用：

(index + 1) % capacity

计算下一个循环位置。

例如 capacity = 5：

0 → 1
1 → 2
2 → 3
3 → 4
4 → 0

这就是循环队列中常见的索引移动方法。

[示例 title=观察循环索引]
说明：从索引 3 开始连续移动 4 次，观察它如何在容量为 5 的空间中回到开头。
语言：python
capacity = 5
index = 3

for _ in range(4):
    index = (index + 1) % capacity
    print(index)
[/示例]

[提示 title=这一课先理解循环，不急着写完整队列类]
循环队列容易在“队空”和“队满”的判断上产生细节问题。本课重点先掌握首尾复用和取模移动思想。

[警告 title=front 和 rear 的定义必须统一]
不同教材可能让 rear 表示“最后一个元素位置”或“下一个可写位置”。两种设计都可能成立，但同一个实现中不能混用规则。

### 课时题目

#### 题目 13

题型：SINGLE_CHOICE
题干：循环队列最主要想解决固定顺序存储中的哪类问题？
难度：EASY
分值：10
知识点：循环队列、空间复用
是否用于 Battle：否

选项：
- A. 让已经空出的前部位置可以被再次利用 [正确]
- B. 自动把所有元素按大小排序
- C. 让队列只能保存一个元素
- D. 完全取消队首和队尾

解析：
循环队列通过让索引在到达末尾后回到开头，使已经空出的前部位置能够重新参与存储，从而更充分利用固定容量空间。

#### 题目 14

题型：SINGLE_CHOICE
题干：容量 `capacity = 5`，当前索引 `index = 4`。下面表达式的结果是什么？

```python
(index + 1) % capacity
```

难度：MEDIUM
分值：10
知识点：循环队列、取模、循环索引
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：输出预测

选项：
- A. 0 [正确]
- B. 1
- C. 4
- D. 5

解析：
(4 + 1) % 5 等于 5 % 5，结果为 0，因此索引从数组末尾回到开头。

#### 题目 15

题型：SINGLE_CHOICE
题干：一个容量为 6 的循环空间中，当前位置 index 为 5。连续执行两次 `index = (index + 1) % 6` 后，index 的值是多少？
难度：HARD
分值：10
知识点：循环队列、取模、执行流程
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：执行流程

选项：
- A. 0
- B. 1 [正确]
- C. 5
- D. 7

解析：
第一次执行：(5 + 1) % 6 = 0。第二次执行：(0 + 1) % 6 = 1。因此最终 index 为 1。

---

## 课时 6：队列综合应用——任务调度

课时简介：综合使用 deque、循环和条件判断实现一个基础任务处理器，并分析队列在请求、打印任务和消息处理中的应用。

预计学习时间：20 分钟

### 正文

[标题]
很多系统都需要保存“等待处理的任务”

[文本]
现实软件中经常存在这样的情况：

任务到达的速度和处理速度不同。

例如：

打印机收到多个打印任务；

服务器收到多个请求；

程序收到多条待处理消息；

学习系统生成多份待分析报告。

如果这些任务需要按照到达顺序处理，就可以使用队列保存等待任务。

[标题]
建立任务队列

[代码 language=python]
from collections import deque

tasks = deque()

tasks.append("生成学习报告")
tasks.append("统计章节成绩")
tasks.append("整理错题记录")
[/代码]

[文本]
任务依次进入队列。

最先进入的是“生成学习报告”，因此它应该最先被处理。

[标题]
循环处理直到队列为空

[代码 language=python]
from collections import deque

tasks = deque()

tasks.append("生成学习报告")
tasks.append("统计章节成绩")
tasks.append("整理错题记录")

while len(tasks) > 0:
    current = tasks.popleft()
    print("正在处理：", current)
[/代码]

[文本]
每次循环：

从队首取一个任务；

处理当前任务；

继续处理下一项。

直到队列为空。

[标题]
处理中也可以加入新任务

[文本]
队列并不是只能在开始时加入数据。

程序运行过程中也可能有新任务到达。

[代码 language=python]
from collections import deque

tasks = deque(["任务A", "任务B"])

current = tasks.popleft()
print("处理：", current)

tasks.append("任务C")

while len(tasks) > 0:
    print("处理：", tasks.popleft())
[/代码]

[文本]
执行顺序是：

任务A
任务B
任务C

因为任务C虽然在处理中途加入，但它进入的是队尾，不会插到更早的任务B前面。

[标题]
分析复杂度

[文本]
如果共有 n 个任务，每个任务只入队一次、出队一次，并且每次 deque 的端点操作都按 O(1) 看待，那么处理全部任务的队列操作总量通常是 O(n)。

当然，真实任务本身可能需要更复杂的计算。

这里分析的是队列管理任务的部分，不是任务内部所有业务逻辑。

[示例 title=处理学习平台消息队列]
说明：消息按照进入顺序依次处理，中途加入的新消息排到队尾。
语言：python
from collections import deque

messages = deque(["课程完成", "测验提交"])

first = messages.popleft()
print("处理：", first)

messages.append("生成成长分析")

while len(messages) > 0:
    current = messages.popleft()
    print("处理：", current)
[/示例]

[提示 title=先区分“排队顺序”和“任务处理时间”]
队列负责决定谁先得到处理机会，但每个任务内部执行多久是另一个问题。

[警告 title=普通队列不处理优先级]
如果一个紧急任务必须越过普通任务优先执行，就不再是纯粹的 FIFO 规则，后面学习优先队列时会专门处理这种需求。

### 课时题目

#### 题目 16

题型：SINGLE_CHOICE
题干：下面哪个场景最适合使用普通先进先出队列？
难度：EASY
分值：10
知识点：队列、应用场景、FIFO
是否用于 Battle：否

选项：
- A. 按到达顺序处理打印任务 [正确]
- B. 每次必须找出最大数字
- C. 按最近一次操作进行撤销
- D. 根据随机数决定下一项任务

解析：
打印任务通常需要按照进入队列的先后顺序处理，符合先进先出。撤销更符合栈的后进先出，最大值优先则更接近优先队列。

#### 题目 17

题型：SINGLE_CHOICE
题干：下面程序的处理顺序是什么？

```python
from collections import deque

tasks = deque(["A", "B"])

current = tasks.popleft()
print(current)

tasks.append("C")

while len(tasks) > 0:
    print(tasks.popleft())
```

难度：MEDIUM
分值：10
知识点：队列、deque、动态入队、执行流程
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：执行流程

选项：
- A. A、B、C [正确]
- B. A、C、B
- C. B、A、C
- D. C、B、A

解析：
首先 popleft() 取出 A。剩余 B，然后 C 加到队尾，队列变成 B、C。后续依次取出 B 和 C，所以处理顺序为 A、B、C。

#### 题目 18

题型：CODE_FILL
题干：补全循环中的出队表达式，使程序每次都从队首取出最早到达的任务。请填写赋值号右侧的表达式。
难度：HARD
分值：10
知识点：队列、deque、任务调度、FIFO
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码：

```python
from collections import deque

tasks = deque(["任务A", "任务B", "任务C"])

while len(tasks) > 0:
    current = ____
    print("处理：", current)
```

可接受答案：

```python
from collections import deque

tasks = deque(["任务A", "任务B", "任务C"])

while len(tasks) > 0:
    current = tasks.popleft()
    print("处理：", current)
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
任务按照 A、B、C 的顺序进入 deque。普通队列要求从队首处理最早进入的任务，因此循环中应使用 `tasks.popleft()`。

标准完整代码：

```python
from collections import deque

tasks = deque(["任务A", "任务B", "任务C"])

while len(tasks) > 0:
    current = tasks.popleft()
    print("处理：", current)
```

---
