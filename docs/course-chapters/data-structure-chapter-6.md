## 章节6：排序与查找算法基础

### 章节简介

本章节讲解三种基础排序算法（冒泡、选择、插入）和两种查找算法（线性查找、二分查找）。重点理解每种排序的时间复杂度与稳定性差异，以及二分查找"必须有序"的前提和 O(log n) 的高效原理。排序与查找是算法入门的核心，也是面试与笔试的高频考点。

### 预计学习时间

70 分钟

### 正文

**排序的稳定性概念**

排序的"稳定性"指：当两个元素值相等时，排序后它们的相对顺序是否保持不变。稳定排序能保证相等元素的原始先后顺序不变；不稳定排序则不保证。稳定性在按多个关键字排序时很重要。

**冒泡排序**

冒泡排序通过反复比较相邻元素并交换，让每一轮的最大值"冒泡"到末尾。每完成一轮，待排序部分就缩短一个。它的时间复杂度是 O(n²)，是稳定排序，并且可以通过"某一轮没有发生交换"来提前终止。

```python
def bubble_sort(arr):
    length = len(arr)
    for i in range(length - 1):
        swapped = False
        for j in range(length - 1 - i):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                swapped = True
        if not swapped:        # 本轮无交换，说明已有序，提前终止
            break
    return arr

print(bubble_sort([5, 3, 8, 1, 2]))  # 输出: [1, 2, 3, 5, 8]
```

**选择排序**

选择排序每一轮从未排序部分选出最小值，与未排序部分的第一个元素交换，从而逐步把最小值放到前部。它的时间复杂度是 O(n²)，且是不稳定排序（交换可能改变相等元素的相对顺序）。

```python
def selection_sort(arr):
    length = len(arr)
    for i in range(length - 1):
        min_index = i
        for j in range(i + 1, length):
            if arr[j] < arr[min_index]:
                min_index = j
        arr[i], arr[min_index] = arr[min_index], arr[i]
    return arr

print(selection_sort([5, 3, 8, 1, 2]))  # 输出: [1, 2, 3, 5, 8]
```

**插入排序**

插入排序把数组分为"已排序"和"未排序"两部分，每次从未排序部分取出一个元素，插入到已排序部分的正确位置。它的时间复杂度是 O(n²)，但当数组已基本有序时，最好情况可达 O(n)，并且它是稳定排序。

```python
def insertion_sort(arr):
    for i in range(1, len(arr)):
        current = arr[i]
        position = i - 1
        while position >= 0 and arr[position] > current:
            arr[position + 1] = arr[position]
            position -= 1
        arr[position + 1] = current
    return arr

print(insertion_sort([5, 3, 8, 1, 2]))  # 输出: [1, 2, 3, 5, 8]
```

**三种排序对比**

三种排序的平均时间复杂度都是 O(n²)，但各有特点：冒泡排序稳定且可提前终止；选择排序不稳定但交换次数少；插入排序在近乎有序时接近 O(n)，适合小规模或基本有序的数据。

| 排序算法 | 平均时间复杂度 | 最好情况 | 稳定性 |
|---------|--------------|---------|-------|
| 冒泡排序 | O(n²) | O(n) | 稳定 |
| 选择排序 | O(n²) | O(n²) | 不稳定 |
| 插入排序 | O(n²) | O(n) | 稳定 |

**线性查找（顺序查找）**

线性查找从头到尾逐个比较，找到目标就返回其位置。它的时间复杂度是 O(n)，对无序列表和有序列表都适用，是最简单的查找方式。

```python
def linear_search(arr, target):
    for index in range(len(arr)):
        if arr[index] == target:
            return index
    return -1

print(linear_search([5, 3, 8, 1], 8))  # 输出: 2
print(linear_search([5, 3, 8, 1], 9))  # 输出: -1
```

**二分查找（折半查找）**

二分查找每次比较中间元素，如果目标小于中间值就在左半边继续找，大于就在右半边继续找，每一步把搜索范围缩小一半。它的时间复杂度是 O(log n)，效率远高于线性查找，但前提是列表必须有序。

```python
def binary_search(sorted_list, target):
    left = 0
    right = len(sorted_list) - 1
    while left <= right:
        mid = (left + right) // 2
        if sorted_list[mid] == target:
            return mid
        elif sorted_list[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1

print(binary_search([1, 2, 3, 5, 8], 5))  # 输出: 3
print(binary_search([1, 2, 3, 5, 8], 4))  # 输出: -1
```

**二分查找的指针更新**

二分查找中，`mid` 的计算用整除 `(left + right) // 2`；当目标大于中间值时，`left` 更新为 `mid + 1`；当目标小于中间值时，`right` 更新为 `mid - 1`。这里的 +1 和 -1 很关键，因为 mid 已经比较过，不需要再纳入下一轮范围。

[警告 title="二分查找的前提是列表必须有序"]

二分查找依赖"有序"这一前提来决定向左还是向右缩小范围。如果对一个无序列表使用二分查找，结果完全不可靠，可能返回错误的下标或 -1。在使用二分查找前，必须先确认列表已排序，或先对列表排序。

[提示 title="插入排序适合小规模或基本有序数据"]

虽然插入排序平均是 O(n²)，但当数据几乎有序时，内层 while 循环几乎不执行，整体接近 O(n)。因此在小规模数据或"几乎已排好序"的场景下，插入排序往往比冒泡和选择更快。

[示例 title="排序后用二分查找"]

```python
def insertion_sort(arr):
    for i in range(1, len(arr)):
        current = arr[i]
        position = i - 1
        while position >= 0 and arr[position] > current:
            arr[position + 1] = arr[position]
            position -= 1
        arr[position + 1] = current
    return arr

def binary_search(sorted_list, target):
    left = 0
    right = len(sorted_list) - 1
    while left <= right:
        mid = (left + right) // 2
        if sorted_list[mid] == target:
            return mid
        elif sorted_list[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1

# 先排序，再查找
score_list = [78, 92, 55, 88, 67]
sorted_list = insertion_sort(score_list)
print("排序结果:", sorted_list)        # 输出: [55, 67, 78, 88, 92]
index = binary_search(sorted_list, 88)
print("88 的下标:", index)             # 输出: 3
```

### 章节题目

#### 题目 1（SINGLE_CHOICE）

题干：冒泡排序的平均时间复杂度是？

- A. O(1)
- B. O(log n)
- C. O(n)
- D. O(n²)

正确答案：D

解析：冒泡排序使用双重循环，外层 n-1 轮、内层每轮最多比较 n-1-i 次，总的比较次数约为 n²/2，因此平均时间复杂度为 O(n²)。加上"提前终止"优化后，最好情况（已有序）可降到 O(n)。

是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：text

#### 题目 2（SINGLE_CHOICE）

题干：下列三种排序算法中，哪一个是"不稳定"的排序？

- A. 冒泡排序
- B. 插入排序
- C. 选择排序
- D. 以上都稳定

正确答案：C

解析：选择排序在交换最小值到前部时，可能跨越其他相等元素，从而改变相等元素的相对顺序，因此是不稳定的。冒泡排序和插入排序在比较交换时不会跨越相等元素，都是稳定排序。

是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：text

#### 题目 3（SINGLE_CHOICE）

题干：使用二分查找的前提条件是？

- A. 列表元素必须互不相同
- B. 列表必须是有序的
- C. 列表长度必须是偶数
- D. 列表必须用链表存储

正确答案：B

解析：二分查找通过比较中间元素来决定向左或向右缩小范围，这一逻辑只有在列表有序时才成立。如果列表无序，"目标比中间值小就往左找"的判断就失去了依据，结果不可靠。

是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：text

#### 题目 4（SINGLE_CHOICE）

题干：二分查找的平均时间复杂度是？

- A. O(1)
- B. O(log n)
- C. O(n)
- D. O(n²)

正确答案：B

解析：二分查找每一步把搜索范围缩小一半，n 个元素最多需要 log₂(n) 步即可定位，因此时间复杂度为 O(log n)。这比线性查找的 O(n) 高效得多，尤其在数据量大时优势明显。

是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：text

#### 题目 5（SINGLE_CHOICE）

题干：当数组已经是有序的情况下，插入排序的最好时间复杂度接近？

- A. O(1)
- B. O(log n)
- C. O(n)
- D. O(n²)

正确答案：C

解析：插入排序在已有序时，内层 while 循环每次都不执行（因为已排序部分末尾元素不大于当前元素），只需外层 n-1 次比较，因此最好情况为 O(n)。这是插入排序相对于冒泡和选择的一个优势。

是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：text

#### 题目 6（FILL_BLANK）

题干：冒泡排序每一轮都会把当前未排序部分的__________值冒泡到末尾。

acceptedAnswers：
- 最大
- 最大值
- 最大的
- 最大元素
- 大的

判题设置：忽略大小写，去除首尾空格，任一答案匹配即正确。

解析：冒泡排序通过相邻元素比较交换，每一轮把未排序部分的最大值逐步"冒泡"到该部分末尾。如果改成从小到大排序且每轮选最小值放前面，那是选择排序的思路。

是否用于 Battle：否
Battle 难度：EASY
Battle 展示类型：text

#### 题目 7（FILL_BLANK）

题干：二分查找（折半查找）的平均时间复杂度是__________。

acceptedAnswers：
- O(log n)
- O(logn)
- O(log_n)
- log n
- logn

判题设置：忽略大小写，去除首尾空格，任一答案匹配即正确。

解析：二分查找每次将查找范围减半，因此时间复杂度为 O(log n)。但要记住它的前提是列表必须有序，否则无法正确折半。

是否用于 Battle：否
Battle 难度：EASY
Battle 展示类型：text

#### 题目 8（FILL_BLANK）

题干：选择排序是__________的排序（填"稳定"或"不稳定"）。

acceptedAnswers：
- 不稳定
- 不稳定的
- 非稳定

判题设置：忽略大小写，去除首尾空格，任一答案匹配即正确。

解析：选择排序在把最小值交换到前部时，可能跨越与之相等的其他元素，导致相等元素的相对顺序改变，因此是不稳定排序。冒泡排序和插入排序则是稳定的。

是否用于 Battle：否
Battle 难度：MEDIUM
Battle 展示类型：text

#### 题目 9（FILL_BLANK）

题干：线性查找（顺序查找）的时间复杂度是__________。

acceptedAnswers：
- O(n)
- On
- O n
- 线性
- n

判题设置：忽略大小写，去除首尾空格，任一答案匹配即正确。

解析：线性查找需要从头到尾逐个比较，最坏情况下要比较 n 次，因此时间复杂度为 O(n)。它的优点是对有序和无序列表都适用，且实现简单。

是否用于 Battle：否
Battle 难度：EASY
Battle 展示类型：text

#### 题目 10（FILL_BLANK）

题干：插入排序在数据已经有序的情况下，最好时间复杂度为__________。

acceptedAnswers：
- O(n)
- On
- 线性
- O n

判题设置：忽略大小写，去除首尾空格，任一答案匹配即正确。

解析：当数据已有序时，插入排序内层 while 循环不执行，只需外层 n-1 次比较，最好情况为 O(n)。这使它特别适合处理小规模或基本有序的数据。

是否用于 Battle：否
Battle 难度：MEDIUM
Battle 展示类型：text

#### 题目 11（CODE_FILL）

考查点：冒泡排序中相邻元素不相邻时交换的语句。

题目代码：

```python
def bubble_sort(arr):
    length = len(arr)
    for i in range(length - 1):
        for j in range(length - 1 - i):
            if arr[j] > arr[j + 1]:
                __________
    return arr
```

标准答案：arr[j], arr[j + 1] = arr[j + 1], arr[j]

完整代码：

```python
def bubble_sort(arr):
    length = len(arr)
    for i in range(length - 1):
        for j in range(length - 1 - i):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr
```

解析：当左边元素大于右边相邻元素时，需要把两者交换，使较大值向右"冒泡"。Python 支持用 `a, b = b, a` 直接交换两个变量，无需临时变量。缺少这一步，数组不会被排序。

是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：code

#### 题目 12（CODE_FILL）

考查点：选择排序中更新最小值下标。

题目代码：

```python
def selection_sort(arr):
    length = len(arr)
    for i in range(length - 1):
        min_index = i
        for j in range(i + 1, length):
            if arr[j] < arr[min_index]:
                __________
        arr[i], arr[min_index] = arr[min_index], arr[i]
    return arr
```

标准答案：min_index = j

完整代码：

```python
def selection_sort(arr):
    length = len(arr)
    for i in range(length - 1):
        min_index = i
        for j in range(i + 1, length):
            if arr[j] < arr[min_index]:
                min_index = j
        arr[i], arr[min_index] = arr[min_index], arr[i]
    return arr
```

解析：选择排序在未排序部分寻找最小值，当发现更小的元素时，需要更新 `min_index` 为当前下标 j，以便循环结束后能把这个最小值交换到位置 i。若漏掉更新，min_index 始终为 i，排序就失效了。

是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：code

#### 题目 13（CODE_FILL）

考查点：插入排序中把已排序部分元素后移一位。

题目代码：

```python
def insertion_sort(arr):
    for i in range(1, len(arr)):
        current = arr[i]
        position = i - 1
        while position >= 0 and arr[position] > current:
            __________
            position -= 1
        arr[position + 1] = current
    return arr
```

标准答案：arr[position + 1] = arr[position]

完整代码：

```python
def insertion_sort(arr):
    for i in range(1, len(arr)):
        current = arr[i]
        position = i - 1
        while position >= 0 and arr[position] > current:
            arr[position + 1] = arr[position]
            position -= 1
        arr[position + 1] = current
    return arr
```

解析：插入排序在寻找插入位置时，需要把比 current 大的元素逐个后移一位，腾出空位。空行处就是把 `arr[position]` 复制到 `arr[position + 1]`，实现后移。最后把 current 放到正确位置。

是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：code

#### 题目 14（CODE_FILL）

考查点：二分查找中计算中间下标 mid。

题目代码：

```python
def binary_search(sorted_list, target):
    left = 0
    right = len(sorted_list) - 1
    while left <= right:
        __________
        if sorted_list[mid] == target:
            return mid
        elif sorted_list[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1
```

标准答案：mid = (left + right) // 2

完整代码：

```python
def binary_search(sorted_list, target):
    left = 0
    right = len(sorted_list) - 1
    while left <= right:
        mid = (left + right) // 2
        if sorted_list[mid] == target:
            return mid
        elif sorted_list[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1
```

解析：二分查找用 `mid = (left + right) // 2` 取中间下标（整除保证得到整数索引）。通过比较 sorted_list[mid] 与 target 决定向左或向右缩小范围，每一步把搜索区间减半。

是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：code

#### 题目 15（CODE_FILL）

考查点：二分查找中目标小于中间值时更新右边界。

题目代码：

```python
def binary_search(sorted_list, target):
    left = 0
    right = len(sorted_list) - 1
    while left <= right:
        mid = (left + right) // 2
        if sorted_list[mid] == target:
            return mid
        elif sorted_list[mid] < target:
            left = mid + 1
        else:
            __________
    return -1
```

标准答案：right = mid - 1

完整代码：

```python
def binary_search(sorted_list, target):
    left = 0
    right = len(sorted_list) - 1
    while left <= right:
        mid = (left + right) // 2
        if sorted_list[mid] == target:
            return mid
        elif sorted_list[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1
```

解析：当目标小于中间值时，说明目标在左半边，应把右边界收缩到 mid - 1（mid 已比较过，排除在外）。用 `mid - 1` 而非 `mid` 能避免死循环并正确缩小范围。

是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：code

---

---

## 章节总结

本章节用 6 个章节系统讲解了数据结构基础，覆盖了线性结构、哈希结构、树形结构、图论概念以及排序与查找算法共 12 个知识领域。下面汇总各部分的核心知识点、时间复杂度对比与适用场景建议。

### 各章节核心知识点回顾

**章节1：数组与列表（领域1）**
数组/列表是最基础的线性结构，支持下标随机访问，访问 O(1)，但中间插入和删除需要移动元素，为 O(n)。适合需要按下标频繁访问、元素数量不大的场景。

**章节2：栈与队列（领域2、领域3）**
栈是"后进先出（LIFO）"结构，队列是"先进先出（FIFO）"结构。栈适合函数调用、括号匹配、撤销操作；队列适合任务排队、广度优先搜索。两者的入栈/出栈、入队/出队都是 O(1)。

**章节3：链表（领域4、领域5）**
链表通过指针连接节点，插入和删除（已知节点位置）是 O(1)，但按下标访问是 O(n)。单链表只能单向遍历，双向链表可双向遍历。适合频繁增删、不常随机访问的场景。

**章节4：字典、哈希表与集合（领域6、领域12）**
字典以键值对存储，集合存储不重复元素，二者都基于哈希表，增删改查和成员判断平均都是 O(1)。字典适合映射关系（如词频统计、两数之和），集合适合去重和集合运算。注意键/元素必须是不可变类型。

**章节5：树与二叉树（领域7、领域8、领域9）**
树是非线性分层结构。二叉树每个节点最多两个子节点，三种遍历（前序、中序、后序）是核心考点。二叉搜索树中序遍历得升序序列；堆是完全二叉树，用于优先队列；图由顶点和边组成，用邻接矩阵或邻接表表示，BFS 用队列、DFS 用栈/递归。

**章节6：排序与查找算法（领域10、领域11）**
冒泡、选择、插入排序平均都是 O(n²)，冒泡和插入稳定、选择不稳定，插入在近乎有序时接近 O(n)。线性查找 O(n) 适用任意列表；二分查找 O(log n) 仅适用有序列表。排序常与查找配合：先排序再用二分查找。

### 时间复杂度对比表

| 数据结构/算法 | 访问/查找 | 插入 | 删除 | 关键特点 |
|-------------|---------|------|------|---------|
| 数组/列表 | 访问 O(1)，查找 O(n) | O(n) | O(n) | 随机访问快，增删慢 |
| 栈 | 仅栈顶 O(1) | 入栈 O(1) | 出栈 O(1) | 后进先出 LIFO |
| 队列 | 仅队首 O(1) | 入队 O(1) | 出队 O(1) | 先进先出 FIFO |
| 链表 | O(n) | 已知位置 O(1) | 已知位置 O(1) | 增删快，访问慢 |
| 字典/哈希表 | O(1) | O(1) | O(1) | 键值映射，键需可哈希 |
| 集合 | 成员判断 O(1) | O(1) | O(1) | 元素不重复 |
| 二叉搜索树 | 平均 O(log n) | 平均 O(log n) | 平均 O(log n) | 中序遍历有序，最坏 O(n) |
| 堆 | 取顶 O(1) | O(log n) | 删顶 O(log n) | 完全二叉树，堆顶最值 |
| 冒泡排序 | — | — | — | O(n²)，稳定，可提前终止 |
| 选择排序 | — | — | — | O(n²)，不稳定 |
| 插入排序 | — | — | — | O(n²)，稳定，近乎有序 O(n) |
| 线性查找 | O(n) | — | — | 适用任意列表 |
| 二分查找 | O(log n) | — | — | 仅适用有序列表 |

### 适用场景选择建议

- 需要按下标快速访问、数据量不大 → 用**数组/列表**。
- 需要后进先出（撤销、回溯、括号匹配） → 用**栈**。
- 需要先进先出（排队、BFS） → 用**队列**。
- 频繁在中间增删、不需随机访问 → 用**链表**。
- 需要键到值的映射或 O(1) 查找 → 用**字典**。
- 需要去重或集合运算（交并差） → 用**集合**。
- 需要有序存储与范围查找 → 用**二叉搜索树**。
- 需要随时取最值或按优先级处理 → 用**堆/优先队列**。
- 表示事物间关系、求最短路径或连通性 → 用**图**（BFS/DFS）。
- 数据量小或近乎有序的排序 → 用**插入排序**。
- 需要在有序数据中快速定位 → 用**二分查找**（先排序再查找）。

选择数据结构的关键是认清"主要操作是什么"：以随机访问为主选数组，以映射查找为主选字典，以增删为主选链表，以最值/优先级为主选堆，以有序范围查找为主选二叉搜索树配合二分查找。

---


---

## 综合挑战

### 挑战任务：学生成绩管理与查询系统

设计并实现一个"学生成绩管理与查询系统"，综合运用本章节 6 个章节所学的全部数据结构与算法。系统需要支持学生录入、撤销录入、按顺序通知、按学号快速查找、班级去重统计、按成绩排序、按成绩二分查找等功能。

### 功能要求（对应各章节知识点）

1. **数组/列表（章节1）**：用列表存储所有学生的基本记录，支持按下标遍历。
2. **栈（章节2）**：实现"撤销最近一次录入"功能，每次录入压栈，撤销时弹栈恢复。
3. **队列（章节2）**：用队列维护"待通知学生"的顺序，按先进先出逐个处理通知。
4. **链表（章节3）**：用链表按录入顺序保存成绩记录，支持顺序遍历输出。
5. **字典/集合（章节4）**：用字典实现按学号 O(1) 查找；用集合统计不重复的班级。
6. **二叉搜索树（章节5）**：用二叉搜索树按学号有序存储学生，中序遍历可得学号升序列表。
7. **排序与查找（章节6）**：用插入排序按成绩排序，再用二分查找定位指定成绩的学生。

### 参考实现

```python
from collections import deque


# ---------- 章节3：链表节点 ----------
class ScoreNode:
    def __init__(self, student_id, name, score, class_name):
        self.student_id = student_id
        self.name = name
        self.score = score
        self.class_name = class_name
        self.next = None


# ---------- 章节5：二叉搜索树节点 ----------
class StudentTreeNode:
    def __init__(self, student_id, name, score, class_name):
        self.student_id = student_id
        self.name = name
        self.score = score
        self.class_name = class_name
        self.left = None
        self.right = None


class ScoreSystem:
    def __init__(self):
        # 章节1: 用列表存储所有学生记录
        self.record_list = []
        # 章节2: 用栈实现撤销
        self.undo_stack = []
        # 章节2: 用队列实现通知
        self.notify_queue = deque()
        # 章节3: 链表头节点
        self.link_head = None
        self.link_tail = None
        # 章节4: 字典按学号查找 + 集合统计班级
        self.student_map = {}
        self.class_set = set()
        # 章节5: 二叉搜索树根节点
        self.bst_root = None

    def add_student(self, student_id, name, score, class_name):
        """录入一名学生"""
        record = {"student_id": student_id, "name": name,
                  "score": score, "class_name": class_name}

        # 章节1: 列表存储
        self.record_list.append(record)
        # 章节2: 压入撤销栈
        self.undo_stack.append(student_id)
        # 章节2: 加入通知队列
        self.notify_queue.append(name)
        # 章节4: 字典与集合
        self.student_map[student_id] = record
        self.class_set.add(class_name)

        # 章节3: 链表尾插
        new_node = ScoreNode(student_id, name, score, class_name)
        if self.link_head is None:
            self.link_head = new_node
            self.link_tail = new_node
        else:
            self.link_tail.next = new_node
            self.link_tail = new_node

        # 章节5: 插入二叉搜索树（按学号）
        self.bst_root = self._bst_insert(self.bst_root, student_id,
                                         name, score, class_name)

    def undo_last(self):
        """章节2: 撤销最近一次录入"""
        if not self.undo_stack:
            print("没有可撤销的录入")
            return
        student_id = self.undo_stack.pop()
        record = self.student_map.get(student_id)
        if record is not None:
            print("撤销录入:", record["name"], record["student_id"])

    def find_by_id(self, student_id):
        """章节4: 按学号 O(1) 查找"""
        return self.student_map.get(student_id)

    def unique_classes(self):
        """章节4: 集合统计不重复班级"""
        return self.class_set

    def list_by_insert_order(self):
        """章节3: 链表顺序遍历"""
        result = []
        current = self.link_head
        while current is not None:
            result.append((current.student_id, current.name, current.score))
            current = current.next
        return result

    def list_by_id_order(self):
        """章节5: 二叉搜索树中序遍历得学号升序"""
        result = []
        self._bst_inorder(self.bst_root, result)
        return result

    def process_notifications(self):
        """章节2: 队列按顺序通知"""
        while self.notify_queue:
            name = self.notify_queue.popleft()
            print("已通知:", name)

    def sort_by_score(self):
        """章节6: 插入排序按成绩升序"""
        arr = list(self.record_list)
        for i in range(1, len(arr)):
            current = arr[i]
            position = i - 1
            while position >= 0 and arr[position]["score"] > current["score"]:
                arr[position + 1] = arr[position]
                position -= 1
            arr[position + 1] = current
        return arr

    def search_by_score(self, sorted_records, target_score):
        """章节6: 二分查找按成绩定位"""
        left = 0
        right = len(sorted_records) - 1
        while left <= right:
            mid = (left + right) // 2
            if sorted_records[mid]["score"] == target_score:
                return sorted_records[mid]
            elif sorted_records[mid]["score"] < target_score:
                left = mid + 1
            else:
                right = mid - 1
        return None

    # ---- 二叉搜索树辅助方法 ----
    def _bst_insert(self, node, student_id, name, score, class_name):
        if node is None:
            return StudentTreeNode(student_id, name, score, class_name)
        if student_id < node.student_id:
            node.left = self._bst_insert(node.left, student_id,
                                         name, score, class_name)
        else:
            node.right = self._bst_insert(node.right, student_id,
                                          name, score, class_name)
        return node

    def _bst_inorder(self, node, result):
        if node is None:
            return
        self._bst_inorder(node.left, result)
        result.append((node.student_id, node.name, node.score))
        self._bst_inorder(node.right, result)


# ---------- 演示运行 ----------
system = ScoreSystem()
system.add_student(103, "Charlie", 78, "ClassA")
system.add_student(101, "Alice", 92, "ClassA")
system.add_student(104, "David", 88, "ClassB")
system.add_student(102, "Bob", 88, "ClassB")

# 章节4: 按学号查找
print("学号 102:", system.find_by_id(102))

# 章节4: 不重复班级
print("不重复班级:", system.unique_classes())

# 章节3: 按录入顺序输出
print("录入顺序:", system.list_by_insert_order())

# 章节5: 按学号升序输出
print("学号升序:", system.list_by_id_order())

# 章节2: 撤销最近一次
system.undo_last()

# 章节2: 处理通知
system.process_notifications()

# 章节6: 按成绩排序后二分查找
sorted_records = system.sort_by_score()
print("按成绩排序:", [(r["name"], r["score"]) for r in sorted_records])
found = system.search_by_score(sorted_records, 88)
print("成绩 88 的学生:", found["name"] if found else "未找到")
```

### 验收标准

1. **录入与撤销**：连续录入 4 名学生后，调用 `undo_last()` 能正确撤销最后一名；撤销栈为空时调用不报错并给出提示。
2. **字典查找**：`find_by_id(学号)` 能在 O(1) 时间内返回对应学生记录，不存在的学号返回 None。
3. **集合去重**：`unique_classes()` 能正确返回所有不重复的班级（如 {"ClassA", "ClassB"}）。
4. **链表顺序**：`list_by_insert_order()` 按录入顺序输出全部学生，顺序与录入顺序一致。
5. **二叉搜索树中序**：`list_by_id_order()` 输出的学号序列严格升序，验证 BST 性质。
6. **队列通知**：`process_notifications()` 按先进先出顺序逐个输出学生姓名，输出后队列清空。
7. **插入排序**：`sort_by_score()` 返回的列表按成绩严格升序，且相等成绩的元素保持稳定（相对顺序不变）。
8. **二分查找**：对排序后的列表，`search_by_score(88)` 能正确定位成绩为 88 的学生；查找不存在的成绩时返回 None。
9. **代码规范**：不使用 lambda、装饰器、生成器、yield 等高级语法；不使用第三方库；变量名语义清晰（如 student_id、sorted_records、target_score）。
10. **可运行性**：整体代码可直接运行，无语法错误，演示部分的输出符合预期。
