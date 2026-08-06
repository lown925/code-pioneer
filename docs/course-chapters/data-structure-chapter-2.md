## 章节2：栈与队列

### 章节简介

本章节讲解两种经典的线性数据结构：栈与队列。栈遵循后进先出原则，队列遵循先进先出原则。本章节将介绍它们的定义、基本操作、Python 实现方式及常见应用场景。

### 预计学习时间

25 分钟

### 正文

#### 栈的定义

栈是一种后进先出（LIFO, Last In First Out）的线性数据结构。只能在一端（栈顶）进行插入和删除操作，最后放入的元素最先被取出。

```python
# 栈的生活类比：一叠盘子
# 最后放上去的盘子，最先被拿走
plate_stack = []
plate_stack.append("白盘子")    # 放入第一个盘子
plate_stack.append("蓝盘子")    # 放入第二个盘子
plate_stack.append("红盘子")    # 放入第三个盘子（栈顶）
print(plate_stack.pop())        # 取出红盘子（最后放入的）
print(plate_stack.pop())        # 取出蓝盘子
```

#### 栈的生活类比

栈在生活中的类比包括一叠盘子（最后放的先拿）、浏览器后退按钮（最后访问的页面先退回）、函数调用栈（最后调用的函数先返回）。这些场景都体现了后进先出的特点。

```python
# 浏览器后退功能模拟
browser_history = []
browser_history.append("首页")
browser_history.append("商品列表")
browser_history.append("商品详情")

# 点击后退，回到上一个页面
print("后退到：", browser_history.pop())   # 商品详情
print("后退到：", browser_history.pop())   # 商品列表
```

#### 栈的基本操作

栈的基本操作包括：push（入栈/压栈）、pop（出栈/弹栈）、peek（查看栈顶元素但不删除）、is_empty（判断是否为空）、size（获取元素个数）。

```python
book_stack = []

book_stack.append("语文")     # push 入栈
book_stack.append("数学")     # push 入栈
book_stack.append("英语")     # push 入栈

print(book_stack[-1])         # peek 查看栈顶：英语
print(book_stack.pop())       # pop 出栈：英语
print(len(book_stack))        # size 元素个数：2
print(len(book_stack) == 0)   # is_empty 是否为空：False
```

#### 栈的时间复杂度

栈的 push、pop、peek 操作都只涉及栈顶元素，不需要移动其他元素，时间复杂度均为 O(1)。这使得栈在需要后进先出场景下非常高效。

```python
# 基于列表实现的栈，所有核心操作均为 O(1)
book_stack = []
book_stack.append("语文")          # push，O(1)
top = book_stack[-1]               # peek，O(1)
removed = book_stack.pop()         # pop，O(1)
is_empty = len(book_stack) == 0    # is_empty，O(1)
print("栈顶：", top, "出栈：", removed, "是否为空：", is_empty)
```

#### 栈的 Python 实现

基于 Python 列表实现栈时，将列表尾部作为栈顶。因为列表的 append 和 pop 方法操作尾部元素的时间复杂度为 O(1)，正好满足栈的需求。

```python
class Stack:
    def __init__(self):
        self.items = []

    def push(self, item):
        self.items.append(item)        # 尾部入栈，O(1)

    def pop(self):
        return self.items.pop()        # 尾部出栈，O(1)

    def peek(self):
        return self.items[-1]          # 查看栈顶，O(1)

    def is_empty(self):
        return len(self.items) == 0

    def size(self):
        return len(self.items)
```

#### 栈的应用：括号匹配

括号匹配是栈的经典应用。遍历字符串时，遇到左括号入栈，遇到右括号则弹栈检查是否匹配。最终栈为空说明所有括号都正确匹配。

```python
def is_balanced(text):
    stack = []
    pairs = {")": "(", "]": "[", "}": "{"}
    for char in text:
        if char in "([{":
            stack.append(char)
        elif char in ")]}":
            if len(stack) == 0 or stack.pop() != pairs[char]:
                return False
    return len(stack) == 0

print(is_balanced("(a[b]c)"))     # True
print(is_balanced("(a[b)c]"))     # False
```

#### 队列的定义

队列是一种先进先出（FIFO, First In First Out）的线性数据结构。在一端（队尾）插入元素，在另一端（队头）删除元素，最先入队的元素最先出队。

```python
# 队列的生活类比：排队买票
# 先排队的人先买到票
from collections import deque
ticket_queue = deque()
ticket_queue.append("顾客A")     # 入队
ticket_queue.append("顾客B")     # 入队
ticket_queue.append("顾客C")     # 入队
print(ticket_queue.popleft())    # 顾客A先出队（最先入队的）
print(ticket_queue.popleft())    # 顾客B出队
```

#### 队列的生活类比

队列的生活类比包括排队买票（先来的先服务）、打印机任务队列（先提交的先打印）。这些场景都体现了先进先出的公平服务原则。

```python
# 打印机任务队列模拟
from collections import deque
print_queue = deque()
print_queue.append("文档1")      # 提交打印任务
print_queue.append("文档2")
print_queue.append("文档3")

# 按提交顺序依次打印
while len(print_queue) > 0:
    print("正在打印：", print_queue.popleft())
```

#### 队列的基本操作

队列的基本操作包括：enqueue（入队/从队尾添加）、dequeue（出队/从队头移除）、peek 或 front（查看队头元素）、is_empty（判断是否为空）。

```python
from collections import deque
task_queue = deque()

task_queue.append("任务A")       # enqueue 入队
task_queue.append("任务B")       # enqueue 入队
task_queue.append("任务C")       # enqueue 入队

print(task_queue[0])             # peek 查看队头：任务A
print(task_queue.popleft())      # dequeue 出队：任务A
print(len(task_queue))           # size 元素个数：2
```

#### 警告：list.pop(0) 是 O(n)

使用列表的 pop(0) 实现出队操作时，需要将后续所有元素向前移动一位，时间复杂度为 O(n)。实现队列必须使用 collections.deque，其 popleft 方法为 O(1)。

```python
from collections import deque

# 错误做法：用 list.pop(0) 出队，O(n)，数据量大时很慢
slow_queue = [1, 2, 3]
slow_queue.pop(0)        # 需要移动2和3，O(n)

# 正确做法：用 deque.popleft 出队，O(1)
fast_queue = deque([1, 2, 3])
fast_queue.popleft()     # 直接移动指针，O(1)
```

#### 队列的 Python 实现

使用 collections.deque 实现队列，append 方法入队（O(1)），popleft 方法出队（O(1)）。deque 是双端队列，两端操作均为 O(1)，是实现队列的理想选择。

```python
from collections import deque

class Queue:
    def __init__(self):
        self.items = deque()

    def enqueue(self, item):
        self.items.append(item)        # 队尾入队，O(1)

    def dequeue(self):
        return self.items.popleft()    # 队头出队，O(1)

    def peek(self):
        return self.items[0]           # 查看队头，O(1)

    def is_empty(self):
        return len(self.items) == 0

    def size(self):
        return len(self.items)
```

#### 循环队列概念

顺序队列在使用中可能出现"假溢出"问题：队尾指针已到数组末尾，但队头之前还有空闲空间。循环队列将数组首尾相接，逻辑上形成环状，从而复用空闲空间，解决假溢出问题。

```python
# 循环队列概念示意（非完整实现，仅说明原理）
# 队头 front 和队尾 rear 指针在环形空间中移动
# rear = (rear + 1) % capacity  实现循环
capacity = 5
front = 0
rear = 3
# 入队时 rear 向前移动，到达末尾后回到开头
rear = (rear + 1) % capacity
print("队尾指针：", rear)    # 4
rear = (rear + 1) % capacity
print("队尾指针：", rear)    # 0，回到开头，复用空间
```

#### 队列应用场景

队列的先进先出特性使其适合需要按顺序处理的场景，如 BFS 广度优先搜索（逐层访问节点）、任务调度（按提交顺序执行任务）、消息缓冲等。

```python
from collections import deque

# 简单的任务调度：按入队顺序依次执行
task_queue = deque()
task_queue.append("发送邮件")
task_queue.append("生成报表")
task_queue.append("清理缓存")

print("待处理任务数：", len(task_queue))
while len(task_queue) > 0:
    current_task = task_queue.popleft()
    print("正在执行：", current_task)
print("所有任务处理完毕")
```

### 示例

[示例 title="用栈实现括号匹配检查"]

```python
def check_brackets(expression):
    stack = []
    pairs = {")": "(", "]": "[", "}": "{"}
    for char in expression:
        if char in "([{":
            stack.append(char)
        elif char in ")]}":
            if len(stack) == 0:
                return False
            if stack.pop() != pairs[char]:
                return False
    return len(stack) == 0

print(check_brackets("{[()]}"))     # True
print(check_brackets("{[(])}"))     # False
print(check_brackets("((()))"))     # True
print(check_brackets("(()"))        # False
```

### 提示

[提示 title="选择栈还是队列的判断方法"]

如果问题需要"反过来处理"（最后处理的先用到），用栈；如果问题需要"按顺序处理"（先来的先处理），用队列。例如撤销操作用栈（最后做的先撤销），打印排队用队列（先提交的先打印）。

### 警告

[警告 title="用 list 实现队列的性能陷阱"]

不要用 list 的 pop(0) 来实现队列出队操作。每次 pop(0) 都要把后面所有元素向前移动一位，时间复杂度为 O(n)。当队列中有大量元素时，性能会急剧下降。务必使用 collections.deque 的 popleft 方法，它的时间复杂度为 O(1)。

### 章节题目

**一、选择题**

#### 题目 1（SINGLE_CHOICE）

题干：栈的特点是什么？

- A. 先进先出 FIFO
- B. 后进先出 LIFO
- C. 随机访问
- D. 双端访问

正确答案：B

解析：栈是一种后进先出（LIFO, Last In First Out）的数据结构，最后压入栈的元素最先被弹出。先进先出是队列的特点，随机访问是数组的特点。

是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：text

#### 题目 2（SINGLE_CHOICE）

题干：在基于 Python 列表实现的栈中，以下哪个操作对应"入栈"？

- A. insert(0, item)
- B. append(item)
- C. pop(0)
- D. remove(item)

正确答案：B

解析：基于列表实现栈时，将列表尾部作为栈顶，append(item) 在尾部添加元素即为入栈操作，时间复杂度为 O(1)。insert(0, item) 在头部插入，pop(0) 从头部删除，时间复杂度均为 O(n)，不适合用于栈操作。

是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：text

#### 题目 3（SINGLE_CHOICE）

题干：使用 list.pop(0) 实现队列出队操作，时间复杂度是多少？

- A. O(1)
- B. O(log n)
- C. O(n)
- D. O(n²)

正确答案：C

解析：list.pop(0) 删除列表第一个元素后，需要将后续所有元素向前移动一位，因此时间复杂度为 O(n)。实现队列应使用 collections.deque 的 popleft 方法，时间复杂度为 O(1)。

是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：text

#### 题目 4（SINGLE_CHOICE）

题干：队列的特点是什么？

- A. 后进先出 LIFO
- B. 先进先出 FIFO
- C. 随机访问
- D. 双端优先

正确答案：B

解析：队列是一种先进先出（FIFO, First In First Out）的数据结构，最先入队的元素最先出队。后进先出是栈的特点。队列在生活中常见于排队场景，如排队买票、打印机任务队列。

是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：text

#### 题目 5（SINGLE_CHOICE）

题干：下列哪种数据结构最适合用 collections.deque 来实现高效操作？

- A. 栈
- B. 队列
- C. 二叉树
- D. 哈希表

正确答案：B

解析：collections.deque 是双端队列，两端操作均为 O(1)，特别适合实现队列的入队（append）和出队（popleft）。虽然 deque 也可以用来实现栈，但队列才是 deque 最典型的应用场景。二叉树和哈希表与 deque 无关。

是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：text

**二、填空题**

#### 题目 6（FILL_BLANK）

题干：栈遵循__________原则，即最后入栈的元素最先出栈。

acceptedAnswers：
- 后进先出
- LIFO
- Last In First Out

判题设置：忽略大小写，去除首尾空格，任一答案匹配即正确。

解析：栈的核心特性是后进先出（LIFO, Last In First Out），最后压入栈的元素位于栈顶，会被最先弹出。这一特性使栈适合撤销操作、函数调用管理、括号匹配等场景。

是否用于 Battle：否
Battle 难度：EASY
Battle 展示类型：text

#### 题目 7（FILL_BLANK）

题干：队列遵循__________原则，即最先入队的元素最先出队。

acceptedAnswers：
- 先进先出
- FIFO
- First In First Out

判题设置：忽略大小写，去除首尾空格，任一答案匹配即正确。

解析：队列的核心特性是先进先出（FIFO, First In First Out），最先进入队列的元素位于队头，会被最先取出。这一特性使队列适合排队服务、任务调度、广度优先搜索等场景。

是否用于 Battle：否
Battle 难度：EASY
Battle 展示类型：text

#### 题目 8（FILL_BLANK）

题干：查看栈顶元素但不将其删除的操作称为__________。

acceptedAnswers：
- peek
- top
- 查看栈顶

判题设置：忽略大小写，去除首尾空格，任一答案匹配即正确。

解析：peek 操作返回栈顶元素的值但不将其从栈中移除，时间复杂度为 O(1)。与之相对，pop 操作会移除并返回栈顶元素。在基于列表实现的栈中，peek 通过访问列表最后一个元素实现。

是否用于 Battle：否
Battle 难度：EASY
Battle 展示类型：text

#### 题目 9（FILL_BLANK）

题干：Python 标准库 collections 模块中的__________类提供了双端队列实现，popleft 操作为 O(1)。

acceptedAnswers：
- deque
- collections.deque

判题设置：忽略大小写，去除首尾空格，任一答案匹配即正确。

解析：collections.deque 是 Python 标准库提供的双端队列实现，两端添加和删除元素的时间复杂度均为 O(1)。使用 deque 的 append 和 popleft 方法可以高效实现队列的入队和出队操作。

是否用于 Battle：否
Battle 难度：EASY
Battle 展示类型：text

#### 题目 10（FILL_BLANK）

题干：循环队列的提出主要是为了解决顺序队列的__________问题。

acceptedAnswers：
- 假溢出
- 假满

判题设置：忽略大小写，去除首尾空格，任一答案匹配即正确。

解析：顺序队列在反复入队出队后，队尾指针可能已到达数组末尾，但队头之前仍有空闲空间，此时无法继续入队，这种现象称为假溢出。循环队列将数组首尾相连形成环状，复用空闲空间，解决了假溢出问题。

是否用于 Battle：否
Battle 难度：MEDIUM
Battle 展示类型：text

**三、代码填空题**

#### 题目 11（CODE_FILL）

考查点：栈的入栈操作（push）

题目代码：

```python
book_stack = []
# 将"语文"压入栈顶
__________
print(book_stack)
```

标准答案：book_stack.append("语文")

完整代码：

```python
book_stack = []
# 将"语文"压入栈顶
book_stack.append("语文")
print(book_stack)
```

解析：基于列表实现的栈，使用 append 方法在列表尾部（栈顶）添加元素，即入栈操作，时间复杂度为 O(1)。执行后 book_stack 为 ["语文"]。

是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：code

#### 题目 12（CODE_FILL）

考查点：栈的出栈操作（pop）

题目代码：

```python
book_stack = ["数学", "语文", "英语"]
# 弹出栈顶元素
top_book = __________
print(top_book)
```

标准答案：book_stack.pop()

完整代码：

```python
book_stack = ["数学", "语文", "英语"]
# 弹出栈顶元素
top_book = book_stack.pop()
print(top_book)
```

解析：列表的 pop 方法移除并返回最后一个元素（栈顶），时间复杂度为 O(1)。执行后 top_book 为 "英语"，book_stack 变为 ["数学", "语文"]。注意不要与 pop(0) 混淆，pop(0) 是 O(n) 操作。

是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：code

#### 题目 13（CODE_FILL）

考查点：判断栈是否为空

题目代码：

```python
book_stack = []
# 判断栈是否为空，结果应为 True
is_empty = __________
print(is_empty)
```

标准答案：len(book_stack) == 0

完整代码：

```python
book_stack = []
# 判断栈是否为空，结果应为 True
is_empty = len(book_stack) == 0
print(is_empty)
```

解析：通过 len(book_stack) == 0 判断栈中是否有元素，当栈为空时返回 True。也可以使用 not book_stack 来判断，空列表的布尔值为 False。这一操作的时间复杂度为 O(1)。

是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：code

#### 题目 14（CODE_FILL）

考查点：使用 deque 的 popleft 实现队列出队

题目代码：

```python
from collections import deque
task_queue = deque(["任务A", "任务B", "任务C"])
# 从队头出队一个元素
first_task = __________
print(first_task)
```

标准答案：task_queue.popleft()

完整代码：

```python
from collections import deque
task_queue = deque(["任务A", "任务B", "任务C"])
# 从队头出队一个元素
first_task = task_queue.popleft()
print(first_task)
```

解析：deque 的 popleft 方法移除并返回队头元素，时间复杂度为 O(1)。执行后 first_task 为 "任务A"（最先入队的元素最先出队），task_queue 变为 deque(["任务B", "任务C"])。

是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：code

#### 题目 15（CODE_FILL）

考查点：使用 deque 的 append 实现队列入队

题目代码：

```python
from collections import deque
task_queue = deque(["任务A", "任务B"])
# 将"任务C"加入队尾
__________
print(task_queue)
```

标准答案：task_queue.append("任务C")

完整代码：

```python
from collections import deque
task_queue = deque(["任务A", "任务B"])
# 将"任务C"加入队尾
task_queue.append("任务C")
print(task_queue)
```

解析：deque 的 append 方法在队尾添加元素，即入队操作，时间复杂度为 O(1)。执行后 task_queue 变为 deque(["任务A", "任务B", "任务C"])。新元素添加在队尾，等待后续依次出队处理。

是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：code

---