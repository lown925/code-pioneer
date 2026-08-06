# 数据结构基础课程

## 课程信息

- **课程名称**：数据结构基础
- **课程难度**：BEGINNER
- **适用人群**：具备基本编程语法基础、希望系统学习数据结构的初学者
- **前置知识**：掌握变量、条件判断、循环、函数等基本编程语法
- **编程语言**：Python
- **课程简介**：本课程系统讲解数据结构的基础概念与常见结构，涵盖数组列表、栈、队列、链表、树、图等内容，帮助学习者建立数据组织的核心思维，为后续算法学习与实践打下坚实基础。

## 章节信息

- **章节名称**：线性结构与链式结构
- **章节难度**：BEGINNER
- **章节简介**：本章节从数据结构的基本概念出发，依次讲解数组列表、栈、队列与链表，覆盖顺序存储与链式存储两大方式，帮助学习者建立线性数据结构的完整认知体系。
- **章节安排**：
  - 章节1：数据结构基本概念与数组列表
  - 章节2：栈与队列
  - 章节3：链表

## 学习目标

1. 理解数据结构的基本概念，能够区分逻辑结构与物理存储结构
2. 掌握大O记号表示时间复杂度的方法，能分析简单代码的时间复杂度
3. 熟练使用 Python 列表，理解各核心操作的时间复杂度
4. 掌握栈的后进先出特性，能用栈解决括号匹配等实际问题
5. 掌握队列的先进先出特性，能用 collections.deque 实现高效队列
6. 理解链表的节点结构与指针操作，能实现单链表的基本增删改查
7. 能够对比数组与链表在不同场景下的优劣，合理选择数据结构

---

## 章节1：数据结构基本概念与数组列表

### 章节简介

本章节讲解数据结构的基本概念，包括逻辑结构与存储结构的分类、时间复杂度与空间复杂度的分析方法，并深入介绍 Python 列表作为动态数组的使用方式与各操作的时间复杂度。

### 预计学习时间

30 分钟

### 正文

#### 什么是数据结构

数据结构是计算机中存储、组织数据的方式。它包含两个基本要素：数据元素本身，以及数据元素之间的关系。选择合适的数据结构，可以让数据的存储和操作更加高效。

```python
# 用不同方式存储同一组学生成绩
# 方式一：散乱的变量，不便于管理和操作
score_first = 90
score_second = 85
score_third = 78

# 方式二：用列表组织数据，体现数据结构的作用
student_scores = [90, 85, 78]
print("平均分：", sum(student_scores) / len(student_scores))
```

#### 逻辑结构分类

数据的逻辑结构描述数据元素之间的逻辑关系，分为四类：集合（元素间无关系）、线性结构（一对一）、树形结构（一对多）、图形结构（多对多）。

```python
# 线性结构示例：学生成绩列表，元素一对一排列
linear_scores = [90, 85, 78, 92]
print("线性结构：", linear_scores)

# 树形结构示例：用嵌套列表表示部门层级
company_tree = ["总经理", ["技术部", "测试部"], ["财务部", "人事部"]]
print("树形结构：", company_tree)
```

#### 物理/存储结构分类

物理存储结构是数据在内存中的实际存放方式，主要分为两类：顺序存储（数据存放在连续的内存空间中）和链式存储（数据分散存放，通过指针连接）。

```python
# 顺序存储：Python 列表在内存中连续存放
sequential_data = [10, 20, 30, 40]
print("顺序存储（连续内存）：", sequential_data)

# 链式存储：节点分散存放，通过指针连接（后续章节详细讲解）
print("链式存储：节点通过 next 指针连接，内存不连续")
```

#### 时间复杂度

时间复杂度用大O记号表示，衡量算法运行时间随数据规模增长的变化趋势。常见时间复杂度从低到高为：O(1) < O(log n) < O(n) < O(n²)。单层循环为 O(n)，嵌套循环为 O(n²)。

```python
# 单层循环：时间复杂度 O(n)
def print_scores(scores):
    for score in scores:       # 执行 n 次
        print(score)

# 嵌套循环：时间复杂度 O(n²)
def print_pairs(scores):
    for outer in scores:       # 执行 n 次
        for inner in scores:   # 每次再执行 n 次
            print(outer, inner)
```

#### 空间复杂度概念

空间复杂度衡量算法在运行过程中额外占用的内存空间，同样用大O记号表示。如果算法只使用固定数量的变量，空间复杂度为 O(1)；如果需要创建与输入规模成正比的额外空间，则为 O(n)。

```python
# 空间复杂度 O(1)：只用了固定变量，不随输入规模增长
def get_max(scores):
    max_score = scores[0]
    for score in scores:
        if score > max_score:
            max_score = score
    return max_score

# 空间复杂度 O(n)：创建了与输入等大的新列表
def copy_scores(scores):
    new_scores = []           # 新列表大小为 n
    for score in scores:
        new_scores.append(score)
    return new_scores
```

#### Python 列表是动态数组

Python 列表本质上是一个动态数组，元素在内存中连续存放，因此支持 O(1) 的随机访问。当容量不足时，列表会自动扩容并复制元素。

```python
student_scores = [90, 85, 78, 92, 88]

# 索引访问：O(1)，直接通过下标定位内存地址
print(student_scores[0])     # 90
print(student_scores[4])     # 88
print(student_scores[-1])    # 88，负索引从末尾开始
```

#### 列表基本操作与时间复杂度

列表的常用操作包括 append（尾部追加）、insert（指定位置插入）、pop（弹出）、remove（按值删除）和索引访问。不同操作的时间复杂度差异很大，理解这些差异是高效编程的关键。

```python
student_scores = [90, 85, 78]

student_scores.append(92)       # 尾部追加，O(1) 均摊
student_scores.insert(0, 100)   # 头部插入，O(n)，需移动元素
student_scores.pop()            # 弹出尾部元素，O(1)
student_scores.pop(0)           # 弹出头部元素，O(n)，需移动元素
student_scores.remove(85)       # 按值删除，O(n)，需查找再移动
print(78 in student_scores)     # 按值查找，O(n)，需逐个比较
```

#### 切片操作

切片语法为 `[start:end:step]`，遵循左闭右开原则，即包含 start 但不包含 end。步长 step 可以为负数，`[::-1]` 可以快速反转列表。

```python
student_scores = [90, 85, 78, 92, 88]

print(student_scores[1:4])      # [85, 78, 92]，索引1到3，左闭右开
print(student_scores[:3])       # [90, 85, 78]，省略start默认从0开始
print(student_scores[3:])       # [92, 88]，省略end默认到末尾
print(student_scores[::2])      # [90, 78, 88]，步长为2
print(student_scores[::-1])     # [88, 92, 78, 85, 90]，步长-1实现反转
```

### 示例

[示例 title="用列表管理学生成绩"]

```python
student_scores = [90, 85, 78, 92, 88]

# 计算最高分和最低分
max_score = max(student_scores)
min_score = min(student_scores)
print("最高分：", max_score)
print("最低分：", min_score)

# 添加新成绩
student_scores.append(95)
print("添加后：", student_scores)

# 按分数从高到低排序
student_scores.sort(reverse=True)
print("排序后：", student_scores)

# 取前3名成绩
top_three = student_scores[:3]
print("前3名：", top_three)
```

### 提示

[提示 title="记忆列表操作时间复杂度的方法"]

判断列表操作是否为 O(1) 的关键看是否需要移动元素。涉及尾部操作（append、pop()）不需要移动其他元素，为 O(1)；涉及头部或中间操作（insert(0)、pop(0)、remove）需要移动后续所有元素，为 O(n)。按值查找（in 运算符）需要逐个比较，也是 O(n)。

### 警告

[警告 title="[[]] * n 创建嵌套列表的陷阱"]

使用 `[[]] * n` 创建嵌套列表时，所有子列表引用的是同一个对象。修改其中一个子列表，其他子列表也会跟着变化。

```python
# 错误写法：三个子列表引用同一对象
wrong_matrix = [[]] * 3
wrong_matrix[0].append(1)
print(wrong_matrix)    # [[1], [1], [1]]，全部被修改！

# 正确写法：用列表推导式创建独立子列表
correct_matrix = [[] for _ in range(3)]
correct_matrix[0].append(1)
print(correct_matrix)  # [[1], [], []]，只有第一个被修改
```

[警告 title="遍历列表时删除元素导致索引错乱"]

在正向遍历列表时同时删除元素，会导致索引跳跃，漏掉某些元素。应在遍历时不要修改列表长度，或使用反向遍历删除。

```python
# 错误写法：正向遍历时删除，会跳过元素
student_scores = [90, 85, 78, 60, 55]
for score in student_scores:
    if score < 70:
        student_scores.remove(score)
print(student_scores)  # [90, 85, 60]，漏删了60！

# 正确写法：用新列表存储结果
student_scores = [90, 85, 78, 60, 55]
passed_scores = [score for score in student_scores if score >= 70]
print(passed_scores)   # [90, 85, 78]
```

### 章节题目

**一、选择题**

#### 题目 1（SINGLE_CHOICE）

题干：数据结构的两个基本要素是什么？

- A. 算法和程序
- B. 数据元素和元素之间的关系
- C. 变量和函数
- D. 数组和指针

正确答案：B

解析：数据结构研究的是数据元素本身以及数据元素之间的相互关系，这两个方面共同构成了数据结构的定义。算法和程序是操作数据的方式，不属于数据结构本身的组成要素。

是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：text

#### 题目 2（SINGLE_CHOICE）

题干：下列哪种逻辑结构中，数据元素之间存在"一对一"的关系？

- A. 集合
- B. 线性结构
- C. 树形结构
- D. 图形结构

正确答案：B

解析：线性结构中数据元素按顺序排列，存在一对一的前驱后继关系，如列表、栈、队列。集合中元素之间没有关系，树形结构是一对多关系，图形结构是多对多关系。

是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：text

#### 题目 3（SINGLE_CHOICE）

题干：在 Python 列表中，以下哪个操作的时间复杂度是 O(1)？

- A. 在头部插入元素 insert(0, item)
- B. 按值查找元素（item in list）
- C. 通过索引访问元素 list[index]
- D. 删除头部元素 pop(0)

正确答案：C

解析：Python 列表是动态数组，元素在内存中连续存放，通过索引可以直接计算内存地址进行访问，时间复杂度为 O(1)。头部插入、按值查找和删除头部元素都需要移动或遍历元素，时间复杂度为 O(n)。

是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：text

#### 题目 4（SINGLE_CHOICE）

题干：对于以下代码片段，时间复杂度是多少？

```python
for i in range(n):
    for j in range(n):
        print(i, j)
```

- A. O(1)
- B. O(n)
- C. O(n²)
- D. O(log n)

正确答案：C

解析：外层循环执行 n 次，每次外层循环中内层循环又执行 n 次，总执行次数为 n × n = n²，因此时间复杂度为 O(n²)。单层循环的时间复杂度才是 O(n)。

是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：text

#### 题目 5（SINGLE_CHOICE）

题干：执行 `grid = [[]] * 3` 后，再执行 `grid[0].append(1)`，grid 的结果是什么？

- A. [[1], [], []]
- B. [[1], [1], [1]]
- C. [[], [], []]
- D. [[], [], [1]]

正确答案：B

解析：`[[]] * 3` 创建的三个子列表引用的是同一个列表对象，修改其中任何一个，其他两个也会同步变化。因此 append(1) 后三个子列表都变为 [1]。若需要独立的子列表，应使用列表推导式 `[[] for _ in range(3)]`。

是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：text

**二、填空题**

#### 题目 6（FILL_BLANK）

题干：数据结构包含数据元素和元素之间的__________两个基本要素。

acceptedAnswers：
- 关系
- 联系
- 关系结构

判题设置：忽略大小写，去除首尾空格，任一答案匹配即正确。

解析：数据结构的定义包含两个层面：一是数据元素本身，二是数据元素之间的关系。组织方式不同就形成了不同的数据结构，如线性结构、树形结构等。

是否用于 Battle：否
Battle 难度：EASY
Battle 展示类型：text

#### 题目 7（FILL_BLANK）

题干：数据的逻辑结构分为集合、线性结构、树形结构和__________结构四类。

acceptedAnswers：
- 图形
- 图
- 图状

判题设置：忽略大小写，去除首尾空格，任一答案匹配即正确。

解析：逻辑结构按元素间关系分为四类：集合（无关系）、线性结构（一对一）、树形结构（一对多）和图形结构（多对多）。图形结构是最复杂的逻辑结构，元素之间可以任意连接。

是否用于 Battle：否
Battle 难度：EASY
Battle 展示类型：text

#### 题目 8（FILL_BLANK）

题干：Python 列表在内存中采用__________存储方式，元素存放在连续的内存空间中。

acceptedAnswers：
- 顺序
- 顺序存储
- 连续

判题设置：忽略大小写，去除首尾空格，任一答案匹配即正确。

解析：Python 列表是动态数组，采用顺序存储方式，元素在内存中连续存放。这使得索引访问可以通过计算偏移量直接定位，时间复杂度为 O(1)，但插入和删除中间元素需要移动后续元素。

是否用于 Battle：否
Battle 难度：EASY
Battle 展示类型：text

#### 题目 9（FILL_BLANK）

题干：切片 student_scores[1:4] 遵循左闭右开原则，取出的元素索引从 1 到__________。

acceptedAnswers：
- 3
- 三

判题设置：忽略大小写，去除首尾空格，任一答案匹配即正确。

解析：Python 切片采用左闭右开原则，[1:4] 包含索引 1、2、3 的元素，不包含索引 4 的元素。这种设计使得 end - start 恰好等于取出的元素个数。

是否用于 Battle：否
Battle 难度：EASY
Battle 展示类型：text

#### 题目 10（FILL_BLANK）

题干：使用 [[]] * 3 创建嵌套列表时，三个子列表实际上引用__________对象。

acceptedAnswers：
- 同一个
- 同一个对象
- 同一
- 相同

判题设置：忽略大小写，去除首尾空格，任一答案匹配即正确。

解析：`[[]] * 3` 中的乘法操作会将同一个列表对象的引用复制三次，因此三个子列表指向同一块内存。修改任意一个子列表，其他两个也会受到影响。应使用列表推导式创建独立的子列表。

是否用于 Battle：否
Battle 难度：MEDIUM
Battle 展示类型：text

**三、代码填空题**

#### 题目 11（CODE_FILL）

考查点：通过索引访问列表指定位置的元素

题目代码：

```python
student_scores = [90, 85, 78, 92, 88]
# 访问第三个元素（索引为2）
third_score = __________
print(third_score)
```

标准答案：student_scores[2]

完整代码：

```python
student_scores = [90, 85, 78, 92, 88]
# 访问第三个元素（索引为2）
third_score = student_scores[2]
print(third_score)
```

解析：Python 列表的索引从 0 开始，第三个元素的索引为 2。通过 student_scores[2] 可以在 O(1) 时间内直接访问该元素，这是顺序存储结构的优势。

是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：code

#### 题目 12（CODE_FILL）

考查点：使用 append 方法在列表尾部追加元素

题目代码：

```python
student_scores = [90, 85, 78]
# 在列表尾部追加 95
__________
print(student_scores)
```

标准答案：student_scores.append(95)

完整代码：

```python
student_scores = [90, 85, 78]
# 在列表尾部追加 95
student_scores.append(95)
print(student_scores)
```

解析：append 方法将元素添加到列表末尾，时间复杂度为 O(1) 均摊。追加后列表变为 [90, 85, 78, 95]。尾部追加不需要移动已有元素，因此效率很高。

是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：code

#### 题目 13（CODE_FILL）

考查点：使用切片反转列表

题目代码：

```python
student_scores = [90, 85, 78, 92, 88]
# 使用切片将列表反转
reversed_scores = __________
print(reversed_scores)
```

标准答案：student_scores[::-1]

完整代码：

```python
student_scores = [90, 85, 78, 92, 88]
# 使用切片将列表反转
reversed_scores = student_scores[::-1]
print(reversed_scores)
```

解析：切片 [::-1] 中省略了 start 和 end，步长设为 -1，表示从末尾向开头逐个取元素，从而实现列表反转。结果为 [88, 92, 78, 85, 90]。这是一种简洁高效的列表反转写法。

是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：code

#### 题目 14（CODE_FILL）

考查点：遍历列表并累加求和

题目代码：

```python
student_scores = [90, 85, 78, 92, 88]
total = 0
for score in student_scores:
    __________
print(total)
```

标准答案：total += score

完整代码：

```python
student_scores = [90, 85, 78, 92, 88]
total = 0
for score in student_scores:
    total += score
print(total)
```

解析：遍历列表时，每次循环将当前元素 score 累加到变量 total 中。循环结束后 total 的值为 433，即所有成绩的总和。该循环执行 n 次，时间复杂度为 O(n)。

是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：code

#### 题目 15（CODE_FILL）

考查点：使用 len 函数获取列表长度

题目代码：

```python
student_scores = [90, 85, 78, 92, 88]
# 获取列表中元素的个数
count = __________
print(count)
```

标准答案：len(student_scores)

完整代码：

```python
student_scores = [90, 85, 78, 92, 88]
# 获取列表中元素的个数
count = len(student_scores)
print(count)
```

解析：len 函数返回列表中元素的个数，时间复杂度为 O(1)，因为 Python 列表内部维护了长度信息，不需要逐个计数。输出结果为 5。

是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：code

---