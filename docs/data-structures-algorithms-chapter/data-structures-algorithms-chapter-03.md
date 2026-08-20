# 第三章：链表

章节简介：本章学习链表这一经典线性数据结构。通过 Python 类构造节点，理解节点之间通过引用建立连接的方式，并掌握单链表的遍历、头部插入、指定位置后插入和删除等基本操作。学习完成后，能够解释链表与顺序表的主要差异，读懂基础链表代码，并根据访问、插入和删除需求选择更合适的数据结构。
预计学习时间：120 分钟

章节学习目标：
- 能够解释链表、节点、头节点和 next 引用的基本含义
- 能够使用 Python 类创建单链表节点并手动连接节点
- 能够使用 current 指针完成单链表遍历
- 能够实现链表头部插入和指定节点后的插入
- 能够理解并实现单链表节点删除的基本过程
- 能够比较顺序表与链表在访问、插入、删除和存储方式上的差异

---

## 课时 1：为什么需要链表

课时简介：从顺序表中间插入和删除的成本出发，认识链表的基本思想，并理解“节点通过连接关系形成顺序”。

预计学习时间：20 分钟

### 正文

[标题]
顺序表的“位置连续”既是优势也是限制

[文本]
上一章学习了顺序表。

顺序表中的元素具有明确的位置，因此按索引访问非常方便。

例如：

[代码 language=python]
scores = [78, 92, 85, 66]

print(scores[2])
[/代码]

[文本]
如果已经知道索引 2，就可以直接读取对应元素 85。

但当程序经常需要在中间插入或删除元素时，顺序结构通常需要调整后续元素的位置。

例如，在索引 1 插入新元素：

[代码 language=python]
scores = [78, 92, 85, 66]

scores.insert(1, 88)

print(scores)
[/代码]

[文本]
插入后，原来位于索引 1 及其后面的元素都要向后移动。

链表提供了另一种组织线性数据的思路。

[标题]
链表不依赖连续的位置关系

[文本]
链表由一个个节点组成。

每个节点通常包含两部分：

一部分保存数据；
另一部分保存“下一个节点在哪里”的连接信息。

可以先把单链表想象成：

A → B → C → D

其中每个字母都是一个节点。

节点 A 知道下一个节点是 B；
节点 B 知道下一个节点是 C；
节点 C 知道下一个节点是 D；
节点 D 后面没有节点。

[标题]
顺序由连接关系决定

[文本]
链表中的先后顺序不是由“索引 0、索引 1、索引 2”直接决定，而是由节点之间的 next 连接决定。

如果我们修改连接关系：

A → C → D

那么 B 就不再属于这条链。

这也是链表插入和删除的核心：

不是大规模移动元素，而是修改节点之间的连接。

[示例 title=用字符串理解节点连接]
说明：先不用真正的 Node 类，而是用简单文本理解节点之间“指向下一个节点”的关系。
语言：python
first = "A"
second = "B"
third = "C"

print(first, "->", second, "->", third)
[/示例]

[提示 title=先抓住“节点”和“连接”]
学习链表时最重要的不是记方法名，而是理解：数据存放在节点中，节点之间通过 next 建立顺序关系。

[警告 title=链表不是“没有顺序”]
链表同样是线性结构。它有明确先后关系，只是这种关系由节点之间的连接维护，而不是主要依赖连续索引。

### 课时题目

#### 题目 1

题型：SINGLE_CHOICE
题干：单链表中，节点之间的先后关系主要由什么决定？
难度：EASY
分值：10
知识点：链表、节点、next
是否用于 Battle：否

选项：
- A. 节点之间的 next 连接 [正确]
- B. 每个节点必须拥有连续整数索引
- C. 节点名称必须按字母顺序排列
- D. 节点中的数据值必须从小到大排列

解析：
单链表通过每个节点中的 next 引用连接到下一个节点，因此节点之间的顺序主要由连接关系决定，而不是依赖连续索引或数据值大小。

#### 题目 2

题型：SINGLE_CHOICE
题干：下面哪一项最能说明链表与顺序表在组织方式上的主要区别？
难度：MEDIUM
分值：10
知识点：链表、顺序表、存储方式
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码用途

选项：
- A. 链表通过节点连接维护顺序，顺序表更强调按位置组织元素 [正确]
- B. 链表中的数据不能被读取
- C. 顺序表中不能保存多个元素
- D. 链表中的每个节点必须保存相同数值

解析：
链表通过节点之间的连接维护先后关系，而顺序表通过位置和索引组织元素。其他选项都不是两者的真实区别。

#### 题目 3

题型：SINGLE_CHOICE
题干：假设有一条单链表 `A → B → C → D`。如果把 A 的 next 改为 C，并且没有其他节点再指向 B，那么从 A 开始遍历时会看到什么顺序？
难度：HARD
分值：10
知识点：链表连接、next、结构变化
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：执行流程

选项：
- A. A → B → C → D
- B. A → C → D [正确]
- C. B → C → D
- D. A → D → C

解析：
链表遍历按照 next 连接前进。A 的 next 被改为 C 后，从 A 出发会直接到 C，再到 D。由于没有节点再从这条链中连接到 B，所以 B 不会出现在从 A 开始的遍历结果中。

---

## 课时 2：创建节点并连接链表

课时简介：使用 Python 类创建单链表节点，理解 value 和 next 两个基本字段，并手动连接多个节点。

预计学习时间：20 分钟

### 正文

[标题]
节点需要保存数据和连接

[文本]
单链表节点最基本的结构可以使用 Python 类表示。

[代码 language=python]
class Node:
    def __init__(self, value):
        self.value = value
        self.next = None
[/代码]

[文本]
这里：

self.value 用来保存节点数据；

self.next 用来保存下一个节点的引用。

创建节点时，暂时没有下一个节点，所以 next 初始设置为 None。

[标题]
创建三个独立节点

[代码 language=python]
class Node:
    def __init__(self, value):
        self.value = value
        self.next = None

node_a = Node("A")
node_b = Node("B")
node_c = Node("C")

print(node_a.value)
print(node_b.value)
print(node_c.value)
[/代码]

[文本]
此时虽然创建了三个 Node 对象，但它们还没有形成链表。

三个节点之间没有 next 连接。

[标题]
通过 next 建立连接

[代码 language=python]
class Node:
    def __init__(self, value):
        self.value = value
        self.next = None

node_a = Node("A")
node_b = Node("B")
node_c = Node("C")

node_a.next = node_b
node_b.next = node_c

print(node_a.value)
print(node_a.next.value)
print(node_a.next.next.value)
[/代码]

[文本]
现在形成了：

A → B → C

node_a.next 是 node_b；

node_b.next 是 node_c；

node_c.next 保持 None，表示链表结束。

[标题]
head 表示链表的起点

[文本]
为了从链表开头开始访问，通常会保存一个 head 变量。

[代码 language=python]
head = node_a
[/代码]

[文本]
head 不代表一个特殊类型，它只是保存第一个节点的引用。

只要能够找到 head，就可以沿着 next 一直找到后续节点。

如果 head 为 None，通常表示当前链表为空。

[示例 title=建立三个数字节点]
说明：创建三个节点，依次保存 10、20、30，并使用 next 把它们连接成单链表。
语言：python
class Node:
    def __init__(self, value):
        self.value = value
        self.next = None

first = Node(10)
second = Node(20)
third = Node(30)

first.next = second
second.next = third

head = first

print(head.value)
print(head.next.value)
print(head.next.next.value)
[/示例]

[提示 title=head 只是入口]
head 保存链表第一个节点的引用。只要 head 没有丢失，就可以沿着 next 找到整条链。

[警告 title=创建节点不等于已经连接]
Node("A")、Node("B") 只是创建对象。只有正确设置 next 后，它们才真正形成链表结构。

### 课时题目

#### 题目 4

题型：SINGLE_CHOICE
题干：在基础单链表节点中，`next` 通常用于保存什么？
难度：EASY
分值：10
知识点：Node、next、节点结构
是否用于 Battle：否

选项：
- A. 下一个节点的引用 [正确]
- B. 当前节点必须使用的索引
- C. 链表全部节点的数量
- D. 当前节点数据的平方

解析：
单链表节点中的 next 用于保存下一个节点的引用。当前节点的数据通常由 value 等字段保存。

#### 题目 5

题型：SINGLE_CHOICE
题干：下面程序运行后输出什么？

```python
class Node:
    def __init__(self, value):
        self.value = value
        self.next = None

a = Node(10)
b = Node(20)
c = Node(30)

a.next = b
b.next = c

print(a.next.value)
```

难度：MEDIUM
分值：10
知识点：Node、next、对象引用
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：输出预测

选项：
- A. 10
- B. 20 [正确]
- C. 30
- D. None

解析：
a.next 被设置为 b，因此 a.next.value 就是 b.value，也就是 20。

#### 题目 6

题型：CODE_FILL
题干：补全连接语句，使三个节点形成 `A → B → C` 的单链表。请填写一条完整赋值语句。
难度：HARD
分值：10
知识点：Node、next、链表连接
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码：

```python
class Node:
    def __init__(self, value):
        self.value = value
        self.next = None

a = Node("A")
b = Node("B")
c = Node("C")

a.next = b
____

head = a

print(head.next.next.value)
```

可接受答案：

```python
class Node:
    def __init__(self, value):
        self.value = value
        self.next = None

a = Node("A")
b = Node("B")
c = Node("C")

a.next = b
b.next = c

head = a

print(head.next.next.value)
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
a 已经连接到 b。要得到 A → B → C，还需要让 b.next 指向 c，因此应填写 `b.next = c`。这样 head.next.next 就会得到 c，最终输出 C。

标准完整代码：

```python
class Node:
    def __init__(self, value):
        self.value = value
        self.next = None

a = Node("A")
b = Node("B")
c = Node("C")

a.next = b
b.next = c

head = a

print(head.next.next.value)
```

---

## 课时 3：遍历单链表

课时简介：学习使用 current 指针从 head 开始逐个访问节点，并理解为什么链表不能像顺序表那样直接按任意索引访问。

预计学习时间：20 分钟

### 正文

[标题]
链表访问依赖 next

[文本]
顺序表可以通过索引直接访问：

[代码 language=python]
numbers = [10, 20, 30]
print(numbers[2])
[/代码]

[文本]
但单链表通常没有这种直接的索引访问方式。

如果想访问第 3 个节点，需要从 head 开始：

第 1 个节点；
沿 next 到第 2 个节点；
再沿 next 到第 3 个节点。

因此，链表遍历的核心就是不断执行：

current = current.next

[标题]
使用 current 遍历

[代码 language=python]
class Node:
    def __init__(self, value):
        self.value = value
        self.next = None

a = Node(10)
b = Node(20)
c = Node(30)

a.next = b
b.next = c

head = a
current = head

while current is not None:
    print(current.value)
    current = current.next
[/代码]

[文本]
程序依次输出：

10
20
30

current 一开始指向 head。

每次循环：

先处理当前节点；
再把 current 移到下一个节点。

当 current 变为 None 时，说明已经越过最后一个节点，遍历结束。

[标题]
遍历时间复杂度是 O(n)

[文本]
如果链表中有 n 个节点，并且需要访问全部节点，那么 current 需要沿 next 前进 n 次左右。

因此完整遍历通常是 O(n)。

如果要寻找某个值，也通常需要从 head 开始逐个比较。

[标题]
不要丢失 head

[文本]
遍历时通常让 current 移动，而不是直接不断修改 head。

[代码 language=python]
current = head

while current is not None:
    print(current.value)
    current = current.next
[/代码]

[文本]
这样遍历结束后，head 仍然保存链表起点。

如果直接反复执行 `head = head.next`，最终 head 会变成 None，程序就失去了原来的入口引用。

[示例 title=统计链表节点数量]
说明：从 head 开始遍历，每访问一个节点就把 count 加 1。
语言：python
class Node:
    def __init__(self, value):
        self.value = value
        self.next = None

a = Node(5)
b = Node(8)
c = Node(13)

a.next = b
b.next = c

head = a
current = head
count = 0

while current is not None:
    count += 1
    current = current.next

print(count)
[/示例]

[提示 title=遍历时让 current 移动]
把 head 当作固定入口，把 current 当作“正在访问哪个节点”的指针，会更容易理解和调试。

[警告 title=忘记移动 current 会造成死循环]
如果 while 条件依赖 current，但循环体中从不执行 `current = current.next`，current 会一直停在同一个节点，循环可能无法结束。

### 课时题目

#### 题目 7

题型：SINGLE_CHOICE
题干：遍历单链表时，通常使用哪个操作前进到下一个节点？
难度：EASY
分值：10
知识点：链表遍历、current、next
是否用于 Battle：否

选项：
- A. `current = current.next` [正确]
- B. `current = head.value`
- C. `current = 0`
- D. `head = len(head)`

解析：
单链表通过 next 连接后续节点，因此遍历时通常使用 `current = current.next` 移动到下一个节点。

#### 题目 8

题型：SINGLE_CHOICE
题干：下面程序运行后输出什么？

```python
class Node:
    def __init__(self, value):
        self.value = value
        self.next = None

a = Node(2)
b = Node(4)
c = Node(6)

a.next = b
b.next = c

current = a
total = 0

while current is not None:
    total += current.value
    current = current.next

print(total)
```

难度：MEDIUM
分值：10
知识点：链表遍历、累加、next
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：执行流程

选项：
- A. 2
- B. 6
- C. 10
- D. 12 [正确]

解析：
current 会依次访问值为 2、4、6 的三个节点，total 最终为 2 + 4 + 6 = 12。

#### 题目 9

题型：SINGLE_CHOICE
题干：下面哪项最准确地解释了为什么在单链表中访问第 n 个节点通常需要 O(n) 时间？
难度：HARD
分值：10
知识点：链表访问、时间复杂度、顺序访问
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码分析

选项：
- A. 因为节点值必须先排序
- B. 因为通常需要从 head 沿 next 逐个前进到目标位置 [正确]
- C. 因为每个节点都要复制整个链表
- D. 因为 Python 不允许节点保存整数

解析：
单链表通常不能像顺序表那样直接通过任意索引定位节点。要访问靠后的节点，需要从 head 开始沿 next 逐个前进，因此最坏情况下访问第 n 个节点需要经过约 n 个节点，时间复杂度为 O(n)。

---

## 课时 4：向链表中插入节点

课时简介：学习头部插入和指定节点后的插入，并理解为什么修改连接顺序时必须避免丢失原有链表。

预计学习时间：20 分钟

### 正文

[标题]
头部插入只需要修改少量连接

[文本]
假设当前链表为：

A → B → C

head 指向 A。

现在希望把新节点 X 插入到最前面，目标结构是：

X → A → B → C

需要两个步骤：

第一，让 X.next 指向原来的 head；

第二，让 head 改为 X。

[代码 language=python]
class Node:
    def __init__(self, value):
        self.value = value
        self.next = None

a = Node("A")
b = Node("B")
c = Node("C")

a.next = b
b.next = c

head = a

new_node = Node("X")
new_node.next = head
head = new_node

print(head.value)
print(head.next.value)
[/代码]

[文本]
现在 head 指向 X，而 X.next 指向原来的 A。

头部插入只需要修改固定数量的引用，因此如果已经拥有 head，操作本身通常可以看作 O(1)。

[标题]
在指定节点后插入

[文本]
假设当前链表：

A → B → C

现在要在 B 后面插入 X：

A → B → X → C

如果已经拿到节点 B，可以这样做：

[代码 language=python]
new_node.next = b.next
b.next = new_node
[/代码]

[文本]
第一步先让 X 指向原来的 C。

第二步再让 B 指向 X。

这样原有后半部分链表不会丢失。

[标题]
连接顺序非常重要

[文本]
如果错误地先执行：

b.next = new_node

然后才尝试读取原来的 b.next，就已经无法通过 b.next 找到原来的 C。

因此链表操作中经常需要先保存旧连接，再修改当前连接。

[示例 title=在第二个节点后插入新节点]
说明：当前链表为 10 → 20 → 30，在节点 20 后插入 25。
语言：python
class Node:
    def __init__(self, value):
        self.value = value
        self.next = None

a = Node(10)
b = Node(20)
c = Node(30)

a.next = b
b.next = c

new_node = Node(25)
new_node.next = b.next
b.next = new_node

current = a
while current is not None:
    print(current.value)
    current = current.next
[/示例]

[提示 title=先接后面，再改前面]
在已有节点后插入时，可以记住：先让新节点接住原来的后续节点，再让前一个节点指向新节点。

[警告 title=不要先覆盖旧的 next]
如果先覆盖前一个节点的 next，又没有保存原来的后续节点引用，可能导致后半条链表无法继续访问。

### 课时题目

#### 题目 10

题型：SINGLE_CHOICE
题干：要把新节点 `new_node` 插入到链表头部，下面哪组操作顺序正确？
难度：EASY
分值：10
知识点：链表插入、head、next
是否用于 Battle：否

选项：
- A. `new_node.next = head`，然后 `head = new_node` [正确]
- B. `head = None`，然后 `new_node = None`
- C. `head.next = head`，然后删除 new_node
- D. 只执行 `new_node = head`

解析：
头部插入需要让新节点先指向原来的 head，再把 head 更新为新节点，这样才能形成 `new_node → 原链表`。

#### 题目 11

题型：SINGLE_CHOICE
题干：当前链表为 `A → B → C`，并且变量 `b` 指向节点 B。下面代码执行后，链表变成什么？

```python
new_node = Node("X")
new_node.next = b.next
b.next = new_node
```

难度：MEDIUM
分值：10
知识点：链表插入、next、连接顺序
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：执行流程

选项：
- A. A → X → B → C
- B. A → B → X → C [正确]
- C. X → A → B → C
- D. A → B → C → X

解析：
b.next 原本指向 C，因此先让 new_node.next 指向 C，再让 b.next 指向 new_node。最终连接为 A → B → X → C。

#### 题目 12

题型：CODE_FILL
题干：当前链表为 `10 → 20 → 30`，变量 `second` 指向值为 20 的节点。补全一条赋值语句，使新节点 25 在插入后仍然连接原来的 30。请填写完整语句。
难度：HARD
分值：10
知识点：链表插入、连接保护、next
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码：

```python
class Node:
    def __init__(self, value):
        self.value = value
        self.next = None

first = Node(10)
second = Node(20)
third = Node(30)

first.next = second
second.next = third

new_node = Node(25)

____
second.next = new_node

current = first
while current is not None:
    print(current.value)
    current = current.next
```

可接受答案：

```python
class Node:
    def __init__(self, value):
        self.value = value
        self.next = None

first = Node(10)
second = Node(20)
third = Node(30)

first.next = second
second.next = third

new_node = Node(25)

new_node.next = second.next
second.next = new_node

current = first
while current is not None:
    print(current.value)
    current = current.next
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
插入前 second.next 指向 third。为了保留后续节点，需要先让 `new_node.next = second.next`，使新节点接住原来的 30，然后再让 second.next 指向 new_node。

标准完整代码：

```python
class Node:
    def __init__(self, value):
        self.value = value
        self.next = None

first = Node(10)
second = Node(20)
third = Node(30)

first.next = second
second.next = third

new_node = Node(25)

new_node.next = second.next
second.next = new_node

current = first
while current is not None:
    print(current.value)
    current = current.next
```

---

## 课时 5：从链表中删除节点

课时简介：学习删除头节点和删除中间节点的基本方法，理解“让前一个节点跳过目标节点”的核心思想。

预计学习时间：20 分钟

### 正文

[标题]
删除头节点

[文本]
假设链表是：

A → B → C

head 指向 A。

如果要删除头节点 A，只需要让 head 改为原来的第二个节点：

[代码 language=python]
head = head.next
[/代码]

[文本]
执行后，新的链表入口就是 B：

B → C

如果没有其他变量继续引用 A，那么 A 就不再属于这条链。

[标题]
删除中间节点需要找到前一个节点

[文本]
假设链表：

A → B → C → D

现在要删除 C。

如果变量 previous 指向 B，current 指向 C，那么可以执行：

[代码 language=python]
previous.next = current.next
[/代码]

[文本]
current.next 原本指向 D。

让 previous.next 直接指向 D 后，链表变成：

A → B → D

也可以把这个过程理解成：

让前一个节点“跳过”目标节点。

[标题]
按值删除时通常需要遍历

[文本]
如果只知道要删除的值，却不知道目标节点在哪里，就需要从 head 开始查找。

在单链表中，我们常常同时保存：

previous：前一个节点；
current：当前节点。

[代码 language=python]
class Node:
    def __init__(self, value):
        self.value = value
        self.next = None

a = Node(10)
b = Node(20)
c = Node(30)

a.next = b
b.next = c

head = a
target = 20

previous = None
current = head

while current is not None:
    if current.value == target:
        if previous is None:
            head = current.next
        else:
            previous.next = current.next
        break

    previous = current
    current = current.next
[/代码]

[文本]
如果 previous 为 None，说明 current 就是头节点。

这时不能执行 previous.next，而应直接更新 head。

如果 previous 不为 None，就让 previous.next 跳过 current。

[标题]
删除操作本身和“找到目标”是两件事

[文本]
如果已经拿到目标节点和它的前一个节点，修改 next 只需要固定数量的操作。

但是，如果只知道目标值，需要先从头遍历寻找，最坏情况下仍然是 O(n)。

分析链表效率时，要区分：

查找目标的成本；
真正修改连接的成本。

[示例 title=删除第一个值为 20 的节点]
说明：遍历链表并维护 previous 和 current，找到目标后修改连接。
语言：python
class Node:
    def __init__(self, value):
        self.value = value
        self.next = None

a = Node(10)
b = Node(20)
c = Node(20)
d = Node(30)

a.next = b
b.next = c
c.next = d

head = a
target = 20

previous = None
current = head

while current is not None:
    if current.value == target:
        if previous is None:
            head = current.next
        else:
            previous.next = current.next
        break

    previous = current
    current = current.next

current = head
while current is not None:
    print(current.value)
    current = current.next
[/示例]

[提示 title=删除中间节点的核心是“跳过”]
如果 previous 指向目标前一个节点，current 指向目标节点，那么 `previous.next = current.next` 就能把目标从链中绕过去。

[警告 title=头节点需要单独处理]
删除头节点时 previous 还是 None，不能访问 previous.next。此时应直接更新 head。

### 课时题目

#### 题目 13

题型：SINGLE_CHOICE
题干：单链表为 `A → B → C`，head 指向 A。要删除头节点 A，最核心的操作是什么？
难度：EASY
分值：10
知识点：链表删除、头节点、head
是否用于 Battle：否

选项：
- A. `head = head.next` [正确]
- B. `head.next = head`
- C. `head = None`，无论后面是否还有节点
- D. `head.value = head.next`

解析：
删除头节点时，需要让 head 指向原头节点的下一个节点。对于 A → B → C，执行 `head = head.next` 后，head 会指向 B。

#### 题目 14

题型：SINGLE_CHOICE
题干：当前链表为 `10 → 20 → 30 → 40`，previous 指向节点 20，current 指向节点 30。执行下面语句后，链表变成什么？

```python
previous.next = current.next
```

难度：MEDIUM
分值：10
知识点：链表删除、next、连接修改
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：执行流程

选项：
- A. 10 → 20 → 40 [正确]
- B. 10 → 30 → 40
- C. 20 → 30 → 40
- D. 10 → 20 → 30

解析：
current.next 指向 40。把 previous.next 改为 current.next 后，20 会直接连接到 40，因此节点 30 被跳过，链表变成 10 → 20 → 40。

#### 题目 15

题型：SINGLE_CHOICE
题干：只知道目标值 target，需要从一个有 n 个节点的单链表中删除第一个等于 target 的节点。最坏情况下，整体时间复杂度最符合哪一项？
难度：HARD
分值：10
知识点：链表查找、删除、时间复杂度
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码分析

选项：
- A. O(1)
- B. O(log n)
- C. O(n) [正确]
- D. O(n²)

解析：
如果只知道目标值，最坏情况下需要从 head 开始遍历全部 n 个节点才能找到目标或确认目标不存在，因此查找部分是 O(n)。找到目标后修改连接只需要固定数量操作，所以总体仍为 O(n)。

---

## 课时 6：顺序表和链表怎么选

课时简介：综合比较顺序表和链表的访问、查找、插入、删除与存储特点，并通过实际场景建立数据结构选择意识。

预计学习时间：20 分钟

### 正文

[标题]
没有一种数据结构在所有场景中都最好

[文本]
学习数据结构的目的不是找到“永远最快”的结构。

真正重要的是根据程序最常见的操作选择合适的数据组织方式。

顺序表和链表都是线性结构，但它们擅长的操作并不完全相同。

[标题]
按位置访问

[文本]
顺序表具有明确索引。

如果已经知道目标位置，通常可以直接读取：

[代码 language=python]
scores = [70, 80, 90, 100]

print(scores[2])
[/代码]

[文本]
这种按索引访问通常可以看作 O(1)。

而单链表要访问第 3 个、第 100 个节点时，通常需要从 head 开始沿 next 前进，因此访问任意靠后位置通常是 O(n)。

所以：

经常按索引随机访问 → 顺序表通常更合适。

[标题]
插入和删除

[文本]
在顺序表中，中间插入和删除通常可能移动后续元素。

在链表中，如果已经拿到正确的前驱节点，可以通过修改少量 next 连接完成插入或删除。

例如插入：

[代码 language=python]
new_node.next = previous.next
previous.next = new_node
[/代码]

[文本]
但要注意：

“修改连接是 O(1)”不代表“按值找到插入位置也是 O(1)”。

如果需要先遍历很久才能找到位置，总体操作仍然可能是 O(n)。

[标题]
内存和实现复杂度也要考虑

[文本]
链表中的每个节点除了保存数据，还需要保存 next 引用。

顺序表主要按照位置组织元素。

因此两者在额外存储和实现复杂度上也有不同。

实际开发中不能只看某一个复杂度结论。

[标题]
用操作模式做选择

[文本]
可以先形成这样的基础判断：

如果需要频繁按索引读取数据，优先考虑顺序结构。

如果已经能直接拿到某个节点，并且经常需要在该位置附近插入或删除，可以考虑链表结构。

如果主要任务是按值查找，那么普通顺序表和普通单链表都可能需要 O(n) 遍历，后面学习哈希表等结构时还会看到其他选择。

[示例 title=根据场景判断结构]
说明：下面用文字变量表示两个典型需求，帮助建立“先看操作，再选结构”的思路。
语言：python
scenario_a = "经常根据第几个位置读取数据"
scenario_b = "已经拿到节点，经常在节点后插入数据"

print("场景 A 更偏向顺序表：", scenario_a)
print("场景 B 可以考虑链表：", scenario_b)
[/示例]

[提示 title=不要只背复杂度表格]
真正做题或写程序时，先判断“我最常做什么操作”，再根据访问、查找、插入和删除特点选择结构。

[警告 title=链表插入快有前提]
只有已经拥有正确插入位置或前驱节点时，修改连接本身才是固定操作。如果还需要先从头查找位置，总体成本可能仍然是 O(n)。

### 课时题目

#### 题目 16

题型：SINGLE_CHOICE
题干：如果程序最常见的操作是“已知索引后立即读取对应元素”，下面哪种结构通常更有优势？
难度：EASY
分值：10
知识点：顺序表、链表、结构选择
是否用于 Battle：否

选项：
- A. 顺序表 [正确]
- B. 单链表一定更快
- C. 两者都无法保存数据
- D. 只能使用字符串

解析：
顺序表支持按有效索引直接访问元素，通常可以视为 O(1)。单链表访问靠后位置通常需要从 head 沿 next 逐个前进。

#### 题目 17

题型：SINGLE_CHOICE
题干：下面哪项关于单链表插入的描述最准确？
难度：MEDIUM
分值：10
知识点：链表插入、复杂度、前驱节点
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码分析

选项：
- A. 只要是链表，任何插入从开始到结束都一定是 O(1)
- B. 如果已经拥有正确的前驱节点，修改连接完成插入通常只需要固定数量操作 [正确]
- C. 链表插入必须移动所有后续节点的数据
- D. 链表不能在中间插入节点

解析：
链表插入的连接修改本身可以只涉及少量 next 赋值，因此在已经拥有正确前驱节点时通常是 O(1)。但如果还需要先遍历查找位置，完整操作可能达到 O(n)，所以不能笼统地说所有插入都一定是 O(1)。

#### 题目 18

题型：CODE_FILL
题干：当前链表为 `A → B → C`，变量 `previous` 指向 A，`current` 指向 B。补全一条语句，使链表删除 B 后变成 `A → C`。请填写完整赋值语句。
难度：HARD
分值：10
知识点：链表删除、前驱节点、next、结构选择
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码：

```python
class Node:
    def __init__(self, value):
        self.value = value
        self.next = None

a = Node("A")
b = Node("B")
c = Node("C")

a.next = b
b.next = c

head = a
previous = a
current = b

____

node = head
while node is not None:
    print(node.value)
    node = node.next
```

可接受答案：

```python
class Node:
    def __init__(self, value):
        self.value = value
        self.next = None

a = Node("A")
b = Node("B")
c = Node("C")

a.next = b
b.next = c

head = a
previous = a
current = b

previous.next = current.next

node = head
while node is not None:
    print(node.value)
    node = node.next
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
current.next 指向 C。让 `previous.next = current.next` 后，A 会直接指向 C，从而跳过 B，链表变成 A → C。

标准完整代码：

```python
class Node:
    def __init__(self, value):
        self.value = value
        self.next = None

a = Node("A")
b = Node("B")
c = Node("C")

a.next = b
b.next = c

head = a
previous = a
current = b

previous.next = current.next

node = head
while node is not None:
    print(node.value)
    node = node.next
```

---
