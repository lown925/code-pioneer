# 第二章：数组与顺序表

章节简介：本章学习最常见的线性数据组织方式——数组与顺序表。通过 Python 列表理解按位置存储、索引访问、遍历、插入、删除、查找和更新等基本操作，并从算法角度分析不同操作的效率。学习完成后，能够根据操作特点判断顺序结构是否适合当前问题，并能完成一个简单的成绩管理案例。
预计学习时间：120 分钟

章节学习目标：
- 能够解释数组、顺序表和 Python 列表之间的教学关系
- 能够使用索引正确访问和修改线性数据
- 能够理解遍历、插入、删除、查找和更新的基本过程
- 能够分析常见顺序表操作的大致时间复杂度
- 能够理解为什么中间插入和删除通常需要移动后续元素
- 能够在简单业务场景中选择合适的列表操作并避免常见边界错误

---

## 课时 1：认识数组与顺序存储

课时简介：从“按位置保存一组数据”出发，认识数组、顺序表和索引，并理解为什么按索引访问元素通常很高效。

预计学习时间：20 分钟

### 正文

[标题]
一组有顺序的数据应该怎样保存

[文本]
在很多程序中，我们需要保存一组有明确先后位置的数据。

例如，一个学习小组有 5 名学生，他们的成绩依次为：

78、92、85、66、90

如果分别创建 5 个变量，数据数量一多就很难管理。

更自然的做法是把它们放进一个有顺序的容器中。

[代码 language=python]
scores = [78, 92, 85, 66, 90]

print(scores)
[/代码]

[文本]
在后续学习中，我们会使用 Python 的 list 来练习顺序表的主要操作。

从算法学习角度，可以把它理解为：

数据按照明确的位置顺序排列，每个元素都有对应的索引。

需要注意的是，Python list 是动态列表类型，内部实现比最基础的“固定数组”更复杂。本课程主要利用它方便地学习顺序结构的操作和算法思想，而不是把 Python list 的所有底层细节都等同于传统数组。

[标题]
索引从 0 开始

[文本]
Python 列表中的第一个元素索引是 0。

因此：

索引 0 对应第 1 个元素；
索引 1 对应第 2 个元素；
索引 2 对应第 3 个元素。

[代码 language=python]
scores = [78, 92, 85, 66, 90]

print(scores[0])
print(scores[2])
print(scores[4])
[/代码]

[文本]
程序依次输出：

78
85
90

这说明索引描述的是元素所在的位置，而不是元素本身的值。

[标题]
为什么按索引访问通常很快

[文本]
顺序结构的重要特点之一，是每个元素都有明确的位置。

当程序已经知道目标索引时，可以直接访问对应位置，而不需要从第一个元素开始逐个比较。

因此，按有效索引读取一个元素通常可以看作 O(1) 操作。

这和后面要学习的“按值查找”不同。

如果只知道要找的值，却不知道它在哪个位置，程序往往需要逐个检查元素。

[示例 title=根据位置读取课程成绩]
说明：通过索引读取列表中指定位置的成绩，并计算两个位置上的成绩差。
语言：python
scores = [78, 92, 85, 66, 90]

first_score = scores[0]
third_score = scores[2]

difference = third_score - first_score

print(first_score)
print(third_score)
print(difference)
[/示例]

[提示 title=先区分“索引”和“值”]
scores[2] 中的 2 是位置索引，不代表要查找数值 2。索引描述位置，列表元素才是真正保存的数据。

[警告 title=索引必须在有效范围内]
如果列表长度为 5，那么常用的非负索引是 0 到 4。访问 scores[5] 会超出范围并产生 IndexError。

### 课时题目

#### 题目 1

题型：SINGLE_CHOICE
题干：对于列表 `scores = [78, 92, 85, 66]`，哪个表达式可以访问第 3 个元素？
难度：EASY
分值：10
知识点：列表、索引、顺序存储
是否用于 Battle：否

选项：
- A. scores[0]
- B. scores[1]
- C. scores[2] [正确]
- D. scores[3]

解析：
Python 列表索引从 0 开始，因此第 1 个元素索引为 0，第 2 个元素索引为 1，第 3 个元素索引为 2，所以应使用 scores[2]。

#### 题目 2

题型：SINGLE_CHOICE
题干：下面程序运行后会输出什么？

```python
scores = [70, 80, 90, 100]

index = 2
print(scores[index])
```

难度：MEDIUM
分值：10
知识点：列表、索引、变量
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：输出预测

选项：
- A. 70
- B. 80
- C. 90 [正确]
- D. 100

解析：
index 的值为 2，因此表达式 scores[index] 等价于 scores[2]。列表索引从 0 开始，索引 2 对应第 3 个元素 90。

#### 题目 3

题型：CODE_FILL
题干：补全索引表达式，使程序输出列表中的最后一个元素。题目已知列表非空，请填写方括号中的表达式。
难度：HARD
分值：10
知识点：列表、索引、len、边界位置
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码：

```python
scores = [78, 92, 85, 66, 90]

last_score = scores[____]

print(last_score)
```

可接受答案：

```python
scores = [78, 92, 85, 66, 90]

last_score = scores[len(scores) - 1]

print(last_score)
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
长度为 n 的列表，最后一个元素的非负索引是 n - 1，因此可以使用 len(scores) - 1。这里列表长度为 5，最终索引为 4，对应元素 90。

标准完整代码：

```python
scores = [78, 92, 85, 66, 90]

last_score = scores[len(scores) - 1]

print(last_score)
```

---

## 课时 2：遍历顺序表

课时简介：学习如何按顺序访问列表中的全部元素，并区分“按值遍历”和“按索引遍历”的使用场景。

预计学习时间：20 分钟

### 正文

[标题]
很多任务都需要访问全部元素

[文本]
如果任务是计算总分、统计及格人数、寻找最大值或者修改符合条件的数据，程序通常需要依次查看列表中的元素。

这种按照一定顺序访问数据结构中元素的过程叫作遍历。

最直接的方式是按元素值遍历。

[代码 language=python]
scores = [78, 92, 85, 66, 90]

for score in scores:
    print(score)
[/代码]

[文本]
循环会按照列表中的顺序依次把每个元素赋给 score。

如果列表中有 n 个元素，需要访问全部元素一次，那么主要操作次数会随着 n 线性增加，因此通常可以看作 O(n)。

[标题]
什么时候需要索引

[文本]
如果只需要读取每个元素的值，直接使用 `for value in list` 通常最简单。

但有些任务还需要知道元素的位置。

例如，输出“第几名学生的成绩”，就可以按索引遍历。

[代码 language=python]
scores = [78, 92, 85]

for index in range(len(scores)):
    print(index, scores[index])
[/代码]

[文本]
index 会依次取 0、1、2。

通过 scores[index] 可以根据当前索引读取对应元素。

[标题]
遍历时进行统计

[文本]
遍历常常会和条件判断、累加、计数一起使用。

下面的程序统计及格人数。

[代码 language=python]
scores = [58, 61, 75, 49, 90]

passed = 0

for score in scores:
    if score >= 60:
        passed += 1

print(passed)
[/代码]

[文本]
程序对每个成绩只检查一次，因此当成绩数量为 n 时，主要时间复杂度为 O(n)。

[示例 title=统计高于平均线的成绩]
说明：遍历全部成绩，统计大于等于 80 的元素数量。
语言：python
scores = [78, 92, 85, 66, 90]

count = 0

for score in scores:
    if score >= 80:
        count += 1

print(count)
[/示例]

[提示 title=能直接按值遍历时不要强行使用索引]
如果任务只关心元素值，`for score in scores` 通常比手动维护索引更清晰。

[警告 title=不要在没有需要时修改循环索引]
使用 `for index in range(...)` 时，index 由循环结构控制。初学阶段不要在循环体内随意修改 index 并期待改变下一次循环位置。

### 课时题目

#### 题目 4

题型：SINGLE_CHOICE
题干：如果要依次读取列表中的每一个成绩，并且不需要知道元素索引，下面哪种写法最直接？
难度：EASY
分值：10
知识点：列表遍历、for 循环
是否用于 Battle：否

选项：
- A. `for score in scores:` [正确]
- B. `if score in scores:`
- C. `while scores == 0:`
- D. `scores = scores[0]`

解析：
当只需要依次读取每个元素的值时，直接使用 `for score in scores:` 最清晰。其他写法不能完成正常的顺序遍历。

#### 题目 5

题型：SINGLE_CHOICE
题干：下面程序运行后输出什么？

```python
scores = [55, 80, 91, 60]
count = 0

for score in scores:
    if score >= 60:
        count += 1

print(count)
```

难度：MEDIUM
分值：10
知识点：遍历、条件判断、计数
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：执行流程

选项：
- A. 1
- B. 2
- C. 3 [正确]
- D. 4

解析：
满足 score >= 60 的成绩是 80、91 和 60，共 3 个，因此 count 最终为 3。

#### 题目 6

题型：SINGLE_CHOICE
题干：设 scores 中有 n 个元素。下面程序的时间复杂度最符合哪一项？

```python
total = 0

for index in range(len(scores)):
    total += scores[index]
```

难度：HARD
分值：10
知识点：遍历、索引、时间复杂度、O(n)
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码分析

选项：
- A. O(1)
- B. O(log n)
- C. O(n) [正确]
- D. O(n²)

解析：
循环会访问 scores 中的每个位置一次，共进行 n 次主要累加操作。单次索引读取可以看作 O(1)，因此整体时间复杂度为 O(n)。

---

## 课时 3：插入元素与位置移动

课时简介：学习在顺序结构中追加和插入元素，并理解为什么在中间位置插入通常比尾部追加需要更多工作。

预计学习时间：20 分钟

### 正文

[标题]
在末尾增加元素

[文本]
列表经常需要增加新数据。

最常见的操作之一是把新元素追加到末尾。

[代码 language=python]
scores = [78, 92, 85]

scores.append(88)

print(scores)
[/代码]

[文本]
程序输出：

[78, 92, 85, 88]

append() 表示把新元素添加到当前列表末尾。

在动态数组式的顺序结构中，末尾追加通常是非常常见且高效的操作。由于底层存储可能偶尔需要扩容，因此严格分析时会涉及“摊还复杂度”，但在本课程基础阶段可以先记住：连续进行大量尾部 append 时，平均每次通常可以看作 O(1) 级别。

[标题]
在中间插入元素

[文本]
如果希望把新元素放到某个指定位置，可以使用 insert()。

[代码 language=python]
scores = [78, 92, 85, 66]

scores.insert(1, 88)

print(scores)
[/代码]

[文本]
程序输出：

[78, 88, 92, 85, 66]

原来位于索引 1 及其后面的元素，需要为新元素让出位置。

从顺序结构的算法模型看，中间插入往往意味着移动一批后续元素。

[标题]
插入位置越靠前，可能移动的元素越多

[文本]
假设列表中有 n 个元素。

如果总是在最前面插入新元素，那么原有元素通常都需要向后移动。

因此，在顺序表的中间或前部插入元素，最坏情况下通常具有 O(n) 的时间复杂度。

这也是后面学习链表时需要重点比较的地方。

[代码 language=python]
tasks = ["学习", "练习", "复习"]

tasks.insert(0, "预习")

print(tasks)
[/代码]

[示例 title=按顺序插入新的学习任务]
说明：把新的任务插入到索引 1，使它成为列表中的第 2 个任务。
语言：python
tasks = ["课程学习", "章节测验", "错题复习"]

tasks.insert(1, "知识练习")

print(tasks)
[/示例]

[提示 title=先明确“位置”再插入]
insert(index, value) 的第一个参数是插入位置，第二个参数是要加入的值。插入后，新元素占据 index 位置。

[警告 title=不要把 append 和 insert 混为一谈]
append(value) 只表示追加到末尾；insert(index, value) 表示插入指定位置。两者都能增加元素，但位置和成本并不相同。

### 课时题目

#### 题目 7

题型：SINGLE_CHOICE
题干：下面哪个方法用于把元素追加到 Python 列表末尾？
难度：EASY
分值：10
知识点：列表、append、插入
是否用于 Battle：否

选项：
- A. append() [正确]
- B. remove()
- C. index()
- D. clear()

解析：
append(value) 会把新元素添加到列表末尾。remove() 用于按值删除，index() 用于查找位置，clear() 会清空列表。

#### 题目 8

题型：SINGLE_CHOICE
题干：下面程序运行后输出什么？

```python
numbers = [10, 20, 30, 40]
numbers.insert(2, 25)

print(numbers)
```

难度：MEDIUM
分值：10
知识点：列表、insert、索引位置
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：输出预测

选项：
- A. [10, 20, 25, 30, 40] [正确]
- B. [10, 25, 20, 30, 40]
- C. [10, 20, 30, 25, 40]
- D. [25, 10, 20, 30, 40]

解析：
insert(2, 25) 会让新元素 25 占据索引 2，也就是第 3 个位置。原来索引 2 及其后的元素向后移动，因此结果是 [10, 20, 25, 30, 40]。

#### 题目 9

题型：CODE_FILL
题干：补全插入语句，使 `88` 被插入到列表开头，原有元素整体后移。请填写完整的方法调用语句。
难度：HARD
分值：10
知识点：列表、insert、头部插入、位置移动
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码：

```python
scores = [78, 92, 85]

____

print(scores)
```

可接受答案：

```python
scores = [78, 92, 85]

scores.insert(0, 88)

print(scores)
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
要把 88 放到列表开头，需要在索引 0 处插入，因此使用 scores.insert(0, 88)。插入后原来的 78、92、85 会整体向后移动一个位置。

标准完整代码：

```python
scores = [78, 92, 85]

scores.insert(0, 88)

print(scores)
```

---

## 课时 4：删除元素与边界影响

课时简介：学习按位置和按值删除元素，并理解顺序结构删除后为什么通常需要保持剩余元素的连续顺序。

预计学习时间：20 分钟

### 正文

[标题]
按位置删除：pop()

[文本]
如果已经知道要删除元素的位置，可以使用 pop(index)。

[代码 language=python]
scores = [78, 92, 85, 66]

removed = scores.pop(1)

print(removed)
print(scores)
[/代码]

[文本]
程序输出被删除的 92，并把列表变成：

[78, 85, 66]

pop() 不仅会删除元素，还会返回被删除的值。

[标题]
按值删除：remove()

[文本]
如果不知道索引，但知道要删除的具体值，可以使用 remove(value)。

[代码 language=python]
scores = [78, 92, 85, 66]

scores.remove(85)

print(scores)
[/代码]

[文本]
remove() 会删除列表中第一次出现的匹配值。

如果目标值不存在，程序会产生 ValueError。

[标题]
中间删除为什么通常需要移动元素

[文本]
顺序结构希望剩余元素继续保持连续的位置关系。

当删除中间元素后，后面的元素通常需要向前移动来填补空位。

因此，中间删除在最坏情况下通常具有 O(n) 级别的时间复杂度。

而删除最后一个元素通常不需要移动后续元素。

[标题]
删除之前先确认条件

[文本]
很多真实程序不能直接假设某个值一定存在。

可以先进行成员判断，再决定是否删除。

[代码 language=python]
scores = [78, 92, 85]

target = 70

if target in scores:
    scores.remove(target)

print(scores)
[/代码]

[文本]
因为 70 不在列表中，所以不会调用 remove()，程序能够正常结束。

[示例 title=删除指定位置的待办任务]
说明：先判断索引是否处于有效范围，再使用 pop() 删除并保存被删除的任务。
语言：python
tasks = ["预习", "学习", "练习", "复习"]
index = 2

if 0 <= index < len(tasks):
    removed = tasks.pop(index)
    print(removed)

print(tasks)
[/示例]

[提示 title=按位置和按值是两个不同问题]
知道位置时可以使用 pop(index)；知道具体值时可以考虑 remove(value)。先明确“我知道的是位置还是值”。

[警告 title=remove 不是删除所有相同元素]
remove(value) 默认只删除第一次出现的匹配值。如果列表中有多个相同元素，剩余相同值仍会保留。

### 课时题目

#### 题目 10

题型：SINGLE_CHOICE
题干：`pop(index)` 和 `remove(value)` 的主要区别是什么？
难度：EASY
分值：10
知识点：列表删除、pop、remove
是否用于 Battle：否

选项：
- A. pop 主要按位置删除，remove 主要按值删除 [正确]
- B. pop 只能增加元素，remove 只能排序元素
- C. 两者都只能清空整个列表
- D. 两者都只能读取元素而不能修改列表

解析：
pop(index) 主要根据索引位置删除元素，并返回被删除的值；remove(value) 根据值删除第一次出现的匹配元素。

#### 题目 11

题型：SINGLE_CHOICE
题干：下面程序运行后输出什么？

```python
numbers = [10, 20, 30, 40]

removed = numbers.pop(2)

print(removed)
print(numbers)
```

难度：MEDIUM
分值：10
知识点：pop、索引、列表删除
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：输出预测

选项：
- A. 20 和 [10, 30, 40]
- B. 30 和 [10, 20, 40] [正确]
- C. 40 和 [10, 20, 30]
- D. 2 和 [10, 20, 30, 40]

解析：
索引 2 对应第 3 个元素 30，因此 pop(2) 删除并返回 30。删除后列表剩余 [10, 20, 40]。

#### 题目 12

题型：SINGLE_CHOICE
题干：下面程序为什么不会在 target 不存在时触发 `ValueError`？

```python
scores = [78, 92, 85]
target = 70

if target in scores:
    scores.remove(target)

print(scores)
```

难度：HARD
分值：10
知识点：remove、成员判断、边界处理
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码分析

选项：
- A. 因为 remove() 会自动忽略任何不存在的值
- B. 因为只有 target 存在于 scores 时才会调用 remove() [正确]
- C. 因为 70 会自动加入 scores
- D. 因为 if 会把 target 修改成第一个元素

解析：
`if target in scores:` 会先判断目标值是否存在。target 为 70，而 scores 中没有 70，因此条件为 False，remove() 不会执行，所以不会产生因删除不存在值导致的 ValueError。

---

## 课时 5：查找与更新元素

课时简介：学习“按值查找”和“按位置更新”的区别，并分析顺序查找的效率。

预计学习时间：20 分钟

### 正文

[标题]
知道位置时可以直接更新

[文本]
如果已经知道元素所在的索引，可以直接通过索引修改该位置的数据。

[代码 language=python]
scores = [78, 92, 85]

scores[1] = 95

print(scores)
[/代码]

[文本]
程序把索引 1 对应的成绩从 92 修改为 95。

因为目标位置已经明确，这类按有效索引访问和修改通常可以看作 O(1)。

[标题]
只知道值时需要查找

[文本]
如果只知道目标值，不知道它在哪个位置，就需要查找。

最直接的办法是从头开始逐个比较。

[代码 language=python]
scores = [78, 92, 85, 66, 90]
target = 66

found_index = -1

for index in range(len(scores)):
    if scores[index] == target:
        found_index = index
        break

print(found_index)
[/代码]

[文本]
程序会输出 3。

如果目标很靠前，可能很快就找到。

如果目标位于最后，或者根本不存在，最坏情况下就需要检查全部 n 个元素，因此顺序查找通常是 O(n)。

[标题]
查找到以后再更新

[文本]
很多实际任务是“先找到，再修改”。

例如，把第一个等于 66 的成绩改成 70。

[代码 language=python]
scores = [78, 92, 85, 66, 90]
target = 66

for index in range(len(scores)):
    if scores[index] == target:
        scores[index] = 70
        break

print(scores)
[/代码]

[文本]
这里 break 的作用是只修改第一次找到的匹配元素。

如果任务要求修改所有匹配元素，就不能在第一次修改后立即 break。

[示例 title=把所有不及格成绩调整为 60]
说明：遍历全部索引，检查每个位置上的值，并修改所有小于 60 的成绩。
语言：python
scores = [58, 75, 49, 90, 55]

for index in range(len(scores)):
    if scores[index] < 60:
        scores[index] = 60

print(scores)
[/示例]

[提示 title=查找条件决定是否可以提前结束]
如果只需要找到第一个匹配项，可以在找到后 break；如果需要处理所有匹配项，就必须继续遍历。

[警告 title=不要把“值”等同于“位置”]
目标成绩 66 不代表索引 66。按值查找时，需要比较元素内容；按索引访问时，已经知道位置。

### 课时题目

#### 题目 13

题型：SINGLE_CHOICE
题干：如果已经知道要修改的元素索引，下面哪种操作最直接？
难度：EASY
分值：10
知识点：列表更新、索引
是否用于 Battle：否

选项：
- A. `scores[index] = new_value` [正确]
- B. `scores.append(index)`
- C. `scores.clear()`
- D. `scores.remove(new_value)`

解析：
已知位置时，可以直接通过 `scores[index] = new_value` 修改对应元素。其他操作分别是追加、清空或按值删除，并不能完成指定位置更新。

#### 题目 14

题型：SINGLE_CHOICE
题干：下面程序运行后输出什么？

```python
numbers = [4, 7, 9, 7, 2]
target = 7
found_index = -1

for index in range(len(numbers)):
    if numbers[index] == target:
        found_index = index
        break

print(found_index)
```

难度：MEDIUM
分值：10
知识点：顺序查找、索引、break
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：执行流程

选项：
- A. -1
- B. 0
- C. 1 [正确]
- D. 3

解析：
程序从索引 0 开始查找。索引 1 的元素第一次等于 7，于是 found_index 被设为 1 并执行 break，因此不会继续找到索引 3 的第二个 7。

#### 题目 15

题型：CODE_FILL
题干：补全条件表达式，使程序把列表中所有小于 60 的成绩都修改为 60。请填写 if 后面的比较表达式。
难度：HARD
分值：10
知识点：列表更新、索引遍历、条件判断
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码：

```python
scores = [58, 75, 49, 90, 55]

for index in range(len(scores)):
    if ____:
        scores[index] = 60

print(scores)
```

可接受答案：

```python
scores = [58, 75, 49, 90, 55]

for index in range(len(scores)):
    if scores[index] < 60:
        scores[index] = 60

print(scores)
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
任务要求处理所有小于 60 的成绩，因此需要判断当前位置的值 `scores[index] < 60`。条件成立时，把该位置修改为 60。循环没有 break，所以所有不及格成绩都会被检查并更新。

标准完整代码：

```python
scores = [58, 75, 49, 90, 55]

for index in range(len(scores)):
    if scores[index] < 60:
        scores[index] = 60

print(scores)
```

---

## 课时 6：顺序表综合应用——成绩管理

课时简介：综合使用追加、插入、删除、查找、更新和遍历，实现一个小型成绩管理流程，并判断不同操作的效率特点。

预计学习时间：20 分钟

### 正文

[标题]
把多个基本操作组合起来

[文本]
真实程序很少只做一次访问或一次插入。

一个简单的成绩管理程序可能需要：

添加成绩；
删除成绩；
修改成绩；
查找成绩；
统计平均值；
寻找最高分。

这些操作可以组合成一个完整的数据处理流程。

[代码 language=python]
scores = [78, 92, 85]

scores.append(88)

scores[0] = 80

if 92 in scores:
    scores.remove(92)

total = 0
for score in scores:
    total += score

average = total / len(scores)

print(scores)
print(average)
[/代码]

[文本]
这段程序依次完成：

1. 末尾追加 88；
2. 把第一个成绩从 78 修改为 80；
3. 删除值 92；
4. 遍历剩余成绩计算总和；
5. 计算平均值。

最终列表为：

[80, 85, 88]

平均值约为 84.33。

[标题]
不同操作的效率并不一样

[文本]
在顺序结构中，常见操作可以先建立以下基础认识：

按有效索引读取：通常 O(1)

按有效索引修改：通常 O(1)

遍历全部元素：O(n)

按值顺序查找：最坏 O(n)

在中间插入：最坏 O(n)

在中间删除：最坏 O(n)

这些结论并不是让我们机械背诵，而是帮助判断数据结构是否适合当前任务。

[标题]
什么时候顺序结构很合适

[文本]
如果程序经常需要：

按照位置访问元素；
从头到尾遍历；
保持明确的先后顺序；
在末尾持续追加数据；

那么顺序结构通常非常自然。

但如果程序需要非常频繁地在中间位置插入和删除大量数据，后面学习链表时就会发现另一种思路。

[标题]
先保证边界安全

[文本]
综合程序中最容易出现的问题，往往不是语法本身，而是边界情况。

例如：

列表为空时不能直接访问第一个元素；

删除一个不存在的值可能报错；

索引超过有效范围会报错；

计算平均值前需要避免元素数量为 0。

[代码 language=python]
scores = []

if len(scores) > 0:
    average = sum(scores) / len(scores)
    print(average)
else:
    print("暂无成绩")
[/代码]

[示例 title=安全地更新指定位置的成绩]
说明：先判断索引是否有效，再修改对应位置，避免越界。
语言：python
scores = [78, 92, 85]
index = 1
new_score = 95

if 0 <= index < len(scores):
    scores[index] = new_score

print(scores)
[/示例]

[提示 title=把操作和复杂度联系起来]
每写一个列表操作，都可以问自己：我已经知道位置吗？需要遍历吗？后面的元素需要移动吗？这些问题能帮助判断复杂度。

[警告 title=不要只因为 Python 提供了方法就忽略算法成本]
insert()、remove() 等方法写起来只有一行，但一行代码内部仍然可能需要移动或查找很多元素。代码短不代表操作一定是 O(1)。

### 课时题目

#### 题目 16

题型：SINGLE_CHOICE
题干：下面哪种操作最符合顺序结构的优势？
难度：EASY
分值：10
知识点：顺序表、索引访问、适用场景
是否用于 Battle：否

选项：
- A. 已知索引时快速访问对应元素 [正确]
- B. 任意中间位置插入都保证不移动元素
- C. 删除任意元素都保证只执行一次操作
- D. 不需要保存任何先后顺序

解析：
顺序结构的重要优势之一是元素具有明确位置，已知有效索引时可以直接访问对应元素。中间插入和删除通常可能涉及元素移动，因此 B 和 C 不成立。

#### 题目 17

题型：SINGLE_CHOICE
题干：下面程序运行后，`scores` 的最终值是什么？

```python
scores = [70, 80, 90]

scores.append(100)
scores.insert(1, 75)
scores.pop(2)

print(scores)
```

难度：MEDIUM
分值：10
知识点：append、insert、pop、执行流程
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：执行流程

选项：
- A. [70, 75, 90, 100] [正确]
- B. [70, 80, 90, 100]
- C. [75, 70, 90, 100]
- D. [70, 75, 80, 90]

解析：
初始为 [70, 80, 90]。append(100) 后为 [70, 80, 90, 100]；insert(1, 75) 后为 [70, 75, 80, 90, 100]；pop(2) 删除索引 2 的 80，最终得到 [70, 75, 90, 100]。

#### 题目 18

题型：SINGLE_CHOICE
题干：设列表长度为 n。下面程序先顺序查找 target，找到后在该位置删除元素。最坏情况下，整体时间复杂度最符合哪一项？

```python
index = -1

for i in range(len(numbers)):
    if numbers[i] == target:
        index = i
        break

if index != -1:
    numbers.pop(index)
```

难度：HARD
分值：10
知识点：顺序查找、删除、时间复杂度、O(n)
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码分析

选项：
- A. O(1)
- B. O(log n)
- C. O(n) [正确]
- D. O(n²)

解析：
最坏情况下，顺序查找需要检查 n 个元素，属于 O(n)。找到目标后，若删除位置靠前，pop(index) 还可能移动后续元素，也属于 O(n)。两个 O(n) 操作先后执行时相加仍为 O(n)，不是 O(n²)。

---
