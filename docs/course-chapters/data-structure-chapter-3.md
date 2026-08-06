## 章节3：链表

### 章节简介

本章节讲解链表这种基于链式存储的数据结构。内容包括链表节点的结构、单链表的实现与基本操作、链表与数组的对比、双向链表与循环链表的概念，以及链表的常见应用场景。

### 预计学习时间

35 分钟

### 正文

#### 链表定义

链表是通过指针（引用）连接的分散节点组成的数据结构。链表中的节点不需要在内存中连续存放，每个节点通过指针指向下一个节点，从而串联成一条链。

```python
# 链表与数组的存储方式对比
# 数组：连续内存 [10][20][30][40]
# 链表：分散内存，通过指针连接
#   [10] -> [20] -> [30] -> [40] -> None

# 链表不需要连续内存，插入删除只需修改指针
print("数组：连续内存，通过索引直接访问")
print("链表：分散内存，通过指针逐个访问")
```

#### 节点结构

链表的基本单元是节点（Node）。每个节点包含两个部分：数据域（data）存储数据，指针域（next）指向下一个节点。链表最后一个节点（尾节点）的 next 指向 None，表示链表结束。

```python
class Node:
    def __init__(self, data):
        self.data = data      # 数据域：存储数据
        self.next = None      # 指针域：指向下一个节点，默认为 None

# 创建两个节点并连接
first_node = Node("张三")
second_node = Node("李四")
first_node.next = second_node    # first_node 指向 second_node

print(first_node.data)           # 张三
print(first_node.next.data)      # 李四
print(second_node.next)          # None，尾节点的 next 为 None
```

#### 链表与数组对比

链表和数组各有优劣。数组内存连续、支持 O(1) 随机访问，但头部增删为 O(n)；链表内存分散、不支持随机访问（查找为 O(n)），但头部增删为 O(1)。应根据操作特点选择合适的数据结构。

```python
# 对比总结
# 操作              数组(列表)       链表
# 索引访问           O(1)            O(n)
# 头部插入           O(n)            O(1)
# 头部删除           O(n)            O(1)
# 尾部追加           O(1)均摊        O(n)需遍历到尾部
# 按值查找           O(n)            O(n)

print("频繁随机访问 -> 用数组（列表）")
print("频繁头部增删 -> 用链表")
```

#### 单链表实现

单链表由 Node 类和 SingleLinkedList 类组成。SingleLinkedList 维护一个头指针 head，指向链表的第一个节点。head 为 None 表示空链表。

```python
class Node:
    def __init__(self, data):
        self.data = data
        self.next = None

class SingleLinkedList:
    def __init__(self):
        self.head = None      # 头指针，初始为空

    def is_empty(self):
        return self.head is None

    def add(self, data):
        """头插法：在链表头部插入节点，O(1)"""
        new_node = Node(data)
        new_node.next = self.head
        self.head = new_node

    def travel(self):
        """遍历链表，打印所有节点数据"""
        current = self.head
        while current is not None:
            print(current.data, end=" -> ")
            current = current.next
        print("None")
```

#### 基本操作：append 尾插

尾插法将新节点添加到链表末尾。需要从头节点开始遍历到最后一个节点，然后将新节点连接到尾部，时间复杂度为 O(n)。

```python
def append(self, data):
    """尾插法：在链表尾部插入节点，O(n)"""
    new_node = Node(data)
    if self.head is None:
        # 空链表，新节点成为头节点
        self.head = new_node
    else:
        # 遍历到最后一个节点
        current = self.head
        while current.next is not None:
            current = current.next
        current.next = new_node
```

#### 基本操作：search 查找

查找操作从头节点开始逐个比较，直到找到目标值或到达链表末尾。由于需要逐个遍历，时间复杂度为 O(n)。

```python
def search(self, data):
    """查找链表中是否存在指定值，O(n)"""
    current = self.head
    while current is not None:
        if current.data == data:
            return True
        current = current.next
    return False

# 使用示例
name_list = SingleLinkedList()
name_list.add("王五")
name_list.add("李四")
name_list.add("张三")
print(name_list.search("李四"))    # True
print(name_list.search("赵六"))    # False
```

#### 基本操作：remove 删除

删除操作需要找到待删除节点的前一个节点，将其 next 指针跳过待删除节点，直接指向待删除节点的下一个节点。需要注意头节点的特殊情况。

```python
def remove(self, data):
    """删除链表中第一个值为 data 的节点"""
    current = self.head
    previous = None
    while current is not None:
        if current.data == data:
            if previous is None:
                # 删除的是头节点
                self.head = current.next
            else:
                # 删除中间或尾部节点，跳过当前节点
                previous.next = current.next
            return
        previous = current
        current = current.next
```

#### 警告：插入删除时指针顺序

在链表中插入或删除节点时，指针操作的顺序至关重要。必须遵循"先连后断"原则：先将新节点连接到链表中，再断开原有连接。如果先断开原有连接，后续节点将无法访问，导致链表断裂丢失节点。

```python
# 正确的头插法：先连后断
new_node = Node(data)
new_node.next = self.head    # 第一步：新节点先连上原头节点（先连）
self.head = new_node         # 第二步：头指针指向新节点（后断）

# 错误的头插法：先断后连（会导致原链表丢失）
# self.head = new_node       # 头指针已指向新节点，原链表丢失！
# new_node.next = self.head  # 此时 self.head 是 new_node 自身，形成自环！
```

#### 双向链表概念

双向链表的每个节点除了 next 指针外，还有一个 prev 指针指向前驱节点。这使得双向遍历成为可能，从任意节点既可以向前也可以向后移动，但需要额外维护一个指针，空间开销更大。

```python
class DoubleNode:
    def __init__(self, data):
        self.data = data
        self.next = None      # 指向后继节点
        self.prev = None      # 指向前驱节点

# 双向链表示意：None <- [A] <-> [B] <-> [C] -> None
node_a = DoubleNode("A")
node_b = DoubleNode("B")
node_a.next = node_b         # A 的后继是 B
node_b.prev = node_a         # B 的前驱是 A
print(node_b.prev.data)      # A，可以向前访问
print(node_a.next.data)      # B，可以向后访问
```

#### 循环链表概念

循环链表中，尾节点的 next 指针不指向 None，而是指向头节点，形成首尾相连的环。这种结构适合需要循环遍历的场景，如轮转调度、约瑟夫环问题等。

```python
# 循环链表示意：[A] -> [B] -> [C] -> [A]（回到头节点）
node_a = Node("A")
node_b = Node("B")
node_c = Node("C")
node_a.next = node_b
node_b.next = node_c
node_c.next = node_a         # 尾节点指向头节点，形成环

# 从任意节点出发都能遍历整个链表
current = node_a
for _ in range(6):           # 遍历两圈
    print(current.data, end=" ")
    current = current.next
# 输出：A B C A B C
```

#### 链表应用场景

链表常用于实现栈和队列的底层结构、浏览器历史记录管理、内存管理（空闲块链表）、哈希表的拉链法解决冲突等。在需要频繁头部增删且不需要随机访问的场景中，链表比数组更合适。

```python
# 用链表实现栈（头插头删，均为 O(1)）
class LinkedStack:
    def __init__(self):
        self.head = None

    def push(self, data):
        new_node = Node(data)
        new_node.next = self.head    # 头插
        self.head = new_node

    def pop(self):
        if self.head is None:
            return None
        value = self.head.data
        self.head = self.head.next   # 头删
        return value

    def is_empty(self):
        return self.head is None
```

### 示例

[示例 title="单链表的基本使用"]

```python
class Node:
    def __init__(self, data):
        self.data = data
        self.next = None

class SingleLinkedList:
    def __init__(self):
        self.head = None

    def add(self, data):
        new_node = Node(data)
        new_node.next = self.head
        self.head = new_node

    def travel(self):
        current = self.head
        while current is not None:
            print(current.data, end=" -> ")
            current = current.next
        print("None")

name_list = SingleLinkedList()
name_list.add("王五")
name_list.add("李四")
name_list.add("张三")
name_list.travel()
```

### 提示

[提示 title="链表操作的核心：指针走向要清晰"]

处理链表问题时，建议先画图理清指针走向。关键技巧：保存需要访问的下一个节点引用，避免修改指针后找不到后续节点。头插法记住"先连后断"四字口诀：先将新节点的 next 指向当前头节点，再将 head 指向新节点。

### 警告

[警告 title="插入删除时指针顺序错误导致链表断裂"]

在链表插入节点时，如果先修改了原有指针再设置新节点的指针，会导致后续节点丢失。例如头插时若先执行 `self.head = new_node`，原链表的头节点引用就被覆盖了，再执行 `new_node.next = self.head` 会形成自环。务必先执行 `new_node.next = self.head`（先连），再执行 `self.head = new_node`（后断）。

### 章节题目

**一、选择题**

#### 题目 1（SINGLE_CHOICE）

题干：单链表中，每个节点包含几个域？

- A. 1 个（仅数据域）
- B. 2 个（数据域和指针域）
- C. 3 个（数据域和两个指针域）
- D. 4 个

正确答案：B

解析：单链表的每个节点包含两个域：数据域（data）存储数据，指针域（next）指向下一个节点。双向链表的节点才有三个域（数据域、next 指针、prev 指针）。

是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：text

#### 题目 2（SINGLE_CHOICE）

题干：与数组相比，链表的主要优势在于？

- A. 随机访问速度快
- B. 头部插入和删除效率高
- C. 内存连续存放
- D. 支持 O(1) 索引访问

正确答案：B

解析：链表头部插入和删除只需修改指针，时间复杂度为 O(1)，而数组需要移动元素，为 O(n)。但链表不支持随机访问，按索引访问需从头遍历，为 O(n)，内存也不连续。因此 A、C、D 都是数组的优势而非链表。

是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：text

#### 题目 3（SINGLE_CHOICE）

题干：单链表在头部插入节点（头插法）的时间复杂度是？

- A. O(1)
- B. O(log n)
- C. O(n)
- D. O(n²)

正确答案：A

解析：头插法只需创建新节点，将新节点的 next 指向当前头节点，再将头指针指向新节点，共三步固定操作，不随链表长度变化，时间复杂度为 O(1)。而尾插法需要遍历到链表末尾，时间复杂度为 O(n)。

是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：text

#### 题目 4（SINGLE_CHOICE）

题干：单链表的尾节点（最后一个节点）的 next 指针指向什么？

- A. 头节点
- B. 自身
- C. None
- D. 前一个节点

正确答案：C

解析：单链表尾节点的 next 指针指向 None，表示链表的结束。在遍历链表时，通过判断 current is None 或 current.next is None 来确定是否到达链表末尾。循环链表的尾节点才指向头节点。

是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：text

#### 题目 5（SINGLE_CHOICE）

题干：在单链表中按值查找某个元素，时间复杂度是？

- A. O(1)
- B. O(log n)
- C. O(n)
- D. O(n²)

正确答案：C

解析：链表不支持随机访问，按值查找需要从头节点开始逐个遍历比较，最坏情况下需要遍历所有 n 个节点，时间复杂度为 O(n)。这也是链表相比数组的主要劣势之一，数组虽然按值查找也是 O(n)，但至少支持 O(1) 的索引访问。

是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：text

**二、填空题**

#### 题目 6（FILL_BLANK）

题干：单链表节点的指针域用于指向__________节点。

acceptedAnswers：
- 下一个
- 后继
- next

判题设置：忽略大小写，去除首尾空格，任一答案匹配即正确。

解析：单链表节点的指针域（next）存储下一个节点（后继节点）的引用，通过指针将分散的节点串联成链。尾节点的指针域指向 None，表示链表结束。

是否用于 Battle：否
Battle 难度：EASY
Battle 展示类型：text

#### 题目 7（FILL_BLANK）

题干：单链表的尾节点的 next 指针指向__________，表示链表结束。

acceptedAnswers：
- None
- 空
- NULL

判题设置：忽略大小写，去除首尾空格，任一答案匹配即正确。

解析：单链表的尾节点是链表中最后一个节点，其 next 指针指向 None（空），标志链表到此结束。遍历链表时通常以 current is None 或 current.next is None 作为终止条件。

是否用于 Battle：否
Battle 难度：EASY
Battle 展示类型：text

#### 题目 8（FILL_BLANK）

题干：双向链表的每个节点除 next 指针外，还有__________指针指向前驱节点。

acceptedAnswers：
- prev
- previous
- 前驱

判题设置：忽略大小写，去除首尾空格，任一答案匹配即正确。

解析：双向链表的节点包含两个指针：next 指向后继节点，prev（或 previous）指向前驱节点。这使得从任意节点既可以向前也可以向后遍历，比单链表更灵活，但每个节点需要额外存储一个指针。

是否用于 Battle：否
Battle 难度：EASY
Battle 展示类型：text

#### 题目 9（FILL_BLANK）

题干：在链表插入节点时，必须遵循"先__________后断"的原则，否则会丢失节点。

acceptedAnswers：
- 连
- 连接

判题设置：忽略大小写，去除首尾空格，任一答案匹配即正确。

解析：链表插入节点时必须"先连后断"：先将新节点的指针连接到链表中的目标位置，再修改原有指针断开旧连接。如果先断开原有连接，后续节点的引用会丢失，导致链表断裂。

是否用于 Battle：否
Battle 难度：MEDIUM
Battle 展示类型：text

#### 题目 10（FILL_BLANK）

题干：循环链表中，尾节点的 next 指针指向__________节点。

acceptedAnswers：
- 头
- 头节点
- 第一个
- 第一个节点

判题设置：忽略大小写，去除首尾空格，任一答案匹配即正确。

解析：循环链表的尾节点 next 指针不指向 None，而是指回头节点，形成首尾相连的环。这种结构使得从任意节点出发都可以遍历整个链表，适合轮转调度等需要循环处理的场景。

是否用于 Battle：否
Battle 难度：EASY
Battle 展示类型：text

**三、代码填空题**

#### 题目 11（CODE_FILL）

考查点：定义链表节点的 next 指针初始化

题目代码：

```python
class Node:
    def __init__(self, data):
        self.data = data
        # next 指针初始化为 None
        __________
```

标准答案：self.next = None

完整代码：

```python
class Node:
    def __init__(self, data):
        self.data = data
        # next 指针初始化为 None
        self.next = None
```

解析：Node 类的构造函数中，self.data 存储数据，self.next 初始化为 None 表示该节点暂时没有后继节点。新创建的节点默认是独立的，后续通过赋值 next 来连接其他节点形成链表。

是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：code

#### 题目 12（CODE_FILL）

考查点：链表头插法（add 方法中的指针连接）

题目代码：

```python
class SingleLinkedList:
    def __init__(self):
        self.head = None
    def add(self, data):
        new_node = Node(data)
        # 新节点的 next 指向当前头节点（先连）
        __________
        self.head = new_node
```

标准答案：new_node.next = self.head

完整代码：

```python
class SingleLinkedList:
    def __init__(self):
        self.head = None
    def add(self, data):
        new_node = Node(data)
        # 新节点的 next 指向当前头节点（先连）
        new_node.next = self.head
        self.head = new_node
```

解析：头插法遵循"先连后断"原则。第一步 new_node.next = self.head 将新节点连接到原链表头部（先连），第二步 self.head = new_node 将头指针指向新节点（后断）。如果顺序颠倒，原链表会丢失。

是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：code

#### 题目 13（CODE_FILL）

考查点：链表遍历时移动 current 指针

题目代码：

```python
def travel(self):
    current = self.head
    while current is not None:
        print(current.data)
        # current 移动到下一个节点
        __________
```

标准答案：current = current.next

完整代码：

```python
def travel(self):
    current = self.head
    while current is not None:
        print(current.data)
        # current 移动到下一个节点
        current = current.next
```

解析：遍历链表时，current 从头节点开始，每次循环打印当前节点数据后，通过 current = current.next 将 current 移动到下一个节点。当 current 变为 None 时说明已到达链表末尾，循环结束。

是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：code

#### 题目 14（CODE_FILL）

考查点：判断链表是否为空

题目代码：

```python
def is_empty(self):
    # 头节点为 None 表示空链表
    return __________
```

标准答案：self.head is None

完整代码：

```python
def is_empty(self):
    # 头节点为 None 表示空链表
    return self.head is None
```

解析：链表的头指针 head 为 None 时表示链表中没有任何节点，即为空链表。使用 is None 判断比 == None 更规范。该操作时间复杂度为 O(1)，只需检查头指针即可。

是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：code

#### 题目 15（CODE_FILL）

考查点：链表尾插法中找到最后一个节点

题目代码：

```python
def append(self, data):
    new_node = Node(data)
    if self.head is None:
        self.head = new_node
    else:
        current = self.head
        # 遍历直到 current 是最后一个节点
        while __________:
            current = current.next
        current.next = new_node
```

标准答案：current.next is not None

完整代码：

```python
def append(self, data):
    new_node = Node(data)
    if self.head is None:
        self.head = new_node
    else:
        current = self.head
        # 遍历直到 current 是最后一个节点
        while current.next is not None:
            current = current.next
        current.next = new_node
```

解析：尾插法需要找到链表的最后一个节点。循环条件 current.next is not None 表示当前节点还有后继节点，继续向后移动。当循环结束时，current 就是尾节点（其 next 为 None），此时将 current.next 指向新节点即可完成尾插。该操作时间复杂度为 O(n)。

是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：code

---