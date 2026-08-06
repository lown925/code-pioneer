## 章节4：字典、哈希表与集合

### 章节简介

本章节讲解 Python 中两种基于哈希表的高效数据结构：字典（dict）与集合（set）。字典以"键值对"方式存储数据，能在 O(1) 时间内完成增删改查；集合用于存储不重复元素，并支持交集、并集等集合运算。掌握字典与集合后，你可以轻松完成词频统计、去重、两数之和等常见任务。

### 预计学习时间

60 分钟

### 正文

**字典的定义与本质**

字典是一种以"键值对（Key-Value）"形式存储数据的容器。每个键唯一对应一个值，通过键就能快速找到值。Python 的 dict 在底层是基于哈希表实现的，因此查找、插入、删除的平均时间复杂度都是 O(1)。

```python
# 创建字典的常见方式
student_score = {"Alice": 90, "Bob": 85, "Charlie": 78}
print(student_score["Alice"])  # 输出: 90

# 也可以用构造函数创建
empty_dict = dict()
print(empty_dict)  # 输出: {}
```

**哈希表的工作原理**

哈希表的核心思想是：用一个"数组 + 哈希函数"把键映射到存储位置。过程是先对键调用 hash(key) 得到一个整数，再用 `hash(key) % capacity` 计算出该键在数组中的索引（capacity 是数组容量），从而实现 O(1) 定位。

```python
# 演示哈希函数如何把键映射到索引
capacity = 8
for name in ["Alice", "Bob", "Charlie", "David"]:
    index = hash(name) % capacity
    print(name, "->", index)
# 输出类似（具体数值随 Python 版本可能不同）:
# Alice -> 5
# Bob -> 2
# Charlie -> 7
# David -> 3
```

**哈希冲突**

当两个不同的键经过哈希计算后得到相同的索引时，就发生了"哈希冲突"。Python 的 dict 采用"开放寻址法"来解决冲突：当目标位置已被占用且键不同时，会按一定规则寻找下一个空闲位置存放。这一切对使用者是透明的，你无需手动处理冲突。

**字典的基本操作**

字典的增、改、查、删都是 O(1) 操作。用 `d[key] = value` 可以新增或修改；用 `d[key]` 查询；用 `del d[key]` 删除；用 `key in d` 判断键是否存在。

```python
score_dict = {"Alice": 90, "Bob": 85}

# 增 / 改: O(1)
score_dict["David"] = 88      # 新增
score_dict["Alice"] = 95      # 修改

# 查: O(1)
print(score_dict["Alice"])    # 输出: 95

# 判斷键是否存在: O(1)
print("Bob" in score_dict)    # 输出: True

# 删: O(1)
del score_dict["Bob"]
print(score_dict)             # 输出: {'Alice': 95, 'David': 88}
```

**安全取值：get 方法**

直接用 `d[key]` 取值时，如果键不存在会抛出 KeyError。更安全的做法是用 `d.get(key)`：键不存在时返回 None；也可以用 `d.get(key, default)` 指定一个默认值。这样能避免程序因缺键而中断。

```python
score_dict = {"Alice": 90, "Bob": 85}

print(score_dict.get("Charlie"))        # 输出: None（键不存在）
print(score_dict.get("Charlie", 0))     # 输出: 0（指定默认值）

# 对比: 直接取值会报错
# print(score_dict["Charlie"])         # 抛出 KeyError
```

**字典的遍历**

遍历字典有三种常用方式：`d.items()` 返回键值对，`d.keys()` 返回所有键，`d.values()` 返回所有值。最常用的是 `items()`，可以同时拿到键和值。

```python
score_dict = {"Alice": 90, "Bob": 85, "Charlie": 78}

# 遍历键值对
for name, score in score_dict.items():
    print(name, score)

# 遍历键
for name in score_dict.keys():
    print(name)

# 遍历值
for score in score_dict.values():
    print(score)
```

**集合的定义**

集合（set）是一个无序、不重复元素的容器，底层同样基于哈希表实现。因为基于哈希表，集合的添加、删除、成员判断都是 O(1)。集合最适合用来去重和做成员判断。

```python
# 创建集合
fruit_set = {"apple", "banana", "cherry"}
print(fruit_set)  # 输出（顺序不固定）: {'apple', 'banana', 'cherry'}

# 从列表创建集合（自动去重）
number_list = [1, 2, 2, 3, 3, 3]
unique_numbers = set(number_list)
print(unique_numbers)  # 输出: {1, 2, 3}
```

**集合的基本操作**

集合用 `add` 添加元素，用 `remove` 删除元素（元素不存在会抛出 KeyError，用 `discard` 则不会），用 `in` 判断成员关系，这些都是 O(1)。

```python
color_set = {"red", "green"}

color_set.add("blue")         # 添加
print("red" in color_set)     # 成员判断: True

color_set.remove("green")     # 删除
color_set.discard("yellow")   # 删除（不存在也不报错）
print(color_set)              # 输出: {'red', 'blue'}
```

**集合运算**

集合支持数学上的集合运算：交集 `&`、并集 `|`、差集 `-`、对称差集 `^`。这些运算让处理"两组数据的公共/合并/差异部分"非常直观。

```python
group_a = {"Alice", "Bob", "Charlie"}
group_b = {"Bob", "Charlie", "David"}

print(group_a & group_b)  # 交集: {'Bob', 'Charlie'}
print(group_a | group_b)  # 并集: {'Alice', 'Bob', 'Charlie', 'David'}
print(group_a - group_b)  # 差集（a 有 b 没有）: {'Alice'}
print(group_a ^ group_b)  # 对称差集（只在一个集合中）: {'Alice', 'David'}
```

**集合应用：去重与成员判断**

把列表转成集合可以快速去重：`list(set(arr))`。当需要频繁判断"某个元素是否在一批数据里"时，用集合比用列表快得多（集合 O(1)，列表 O(n)）。

```python
name_list = ["Alice", "Bob", "Alice", "Charlie", "Bob", "David"]

# 去重
unique_names = list(set(name_list))
print(unique_names)  # 输出（顺序不固定）: ['Bob', 'Alice', 'Charlie', 'David']

# 成员判断：集合比列表快
name_set = set(name_list)
print("Alice" in name_set)  # O(1)，True
```

[警告 title="字典的键必须是不可变类型"]

字典的键和集合的元素都必须是"可哈希"的不可变类型，例如 int、str、tuple。如果把 list、dict、set 作为键，会抛出 TypeError，因为它们是可变类型，内容变化后哈希值会改变，导致无法正确定位。

```python
# 正确: 不可变类型可以做键
location_map = {(0, 0): "origin", (1, 2): "point_a"}

# 错误: list 不能做键
# bad_dict = {[1, 2]: "value"}  # 抛出 TypeError: unhashable type: 'list'
```

[提示 title="用 get 做词频统计更简洁"]

统计词频时，如果用 `if word in dict` 判断再赋值，代码会多写几行。更简洁的写法是 `word_count[word] = word_count.get(word, 0) + 1`，一行搞定"不存在则当作 0，再加 1"。

[示例 title="词频统计与两数之和"]

```python
# 1. 词频统计：统计每个单词出现的次数
text = "apple banana apple cherry banana apple"
word_count = {}
for word in text.split():
    word_count[word] = word_count.get(word, 0) + 1
print(word_count)  # 输出: {'apple': 3, 'banana': 2, 'cherry': 1}

# 2. 两数之和：在列表中找两个数，使其和等于目标值，返回下标
number_list = [2, 7, 11, 15]
target_sum = 9
index_map = {}
for index, value in enumerate(number_list):
    complement = target_sum - value
    if complement in index_map:
        print(index_map[complement], index)  # 输出: 0 1
        break
    index_map[value] = index
```

### 章节题目

#### 题目 1（SINGLE_CHOICE）

题干：Python 中的 dict（字典）在底层是基于哪种数据结构实现的？

- A. 链表
- B. 二叉树
- C. 哈希表
- D. 数组直接顺序存储

正确答案：C

解析：Python 的字典在底层基于哈希表实现，通过哈希函数把键映射到存储位置，从而实现 O(1) 的增删改查。链表和二叉树都不具备这种平均 O(1) 的查找能力，而"数组直接顺序存储"无法支撑任意键的快速定位。

是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：text

#### 题目 2（SINGLE_CHOICE）

题干：在平均情况下，对字典执行 `score_dict["Alice"]`（按键查值）的时间复杂度是？

- A. O(1)
- B. O(log n)
- C. O(n)
- D. O(n²)

正确答案：A

解析：字典基于哈希表，按键查找时先通过哈希函数计算出索引，再直接访问对应位置，平均时间复杂度为 O(1)。只有在发生大量哈希冲突的极端情况下才会退化，但平均性能仍是 O(1)。

是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：text

#### 题目 3（SINGLE_CHOICE）

题干：下列哪个类型可以作为字典的键使用，而不会抛出 TypeError？

- A. list
- B. dict
- C. set
- D. tuple

正确答案：D

解析：字典的键必须是不可变（可哈希）类型。tuple 是不可变的，可以用作键；而 list、dict、set 都是可变类型，不可哈希，用作键会抛出 TypeError。这是使用字典时常踩的坑。

是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：text

#### 题目 4（SINGLE_CHOICE）

题干：对于字典 `score_dict = {"Alice": 90}`，执行 `score_dict.get("Bob")` 的返回值是？

- A. 抛出 KeyError
- B. 返回 "Bob"
- C. 返回 None
- D. 返回 0

正确答案：C

解析：`get` 方法在键不存在时默认返回 None，不会抛出异常。如果想指定默认值，可以写成 `score_dict.get("Bob", 0)`，这样键不存在时就返回 0。直接用 `score_dict["Bob"]` 才会抛出 KeyError。

是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：text

#### 题目 5（SINGLE_CHOICE）

题干：集合 `group_a` 和 `group_b`，下列哪个运算符表示"求两个集合的并集"？

- A. &
- B. |
- C. -
- D. ^

正确答案：B

解析：`|` 表示并集（两个集合的所有元素去重合并）；`&` 表示交集；`-` 表示差集；`^` 表示对称差集。并集对应数学上的"或"关系，记作竖线 `|`。

是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：text

#### 题目 6（FILL_BLANK）

题干：Python 的 dict 在底层是基于__________表实现的，因此它的增删改查平均时间复杂度为 O(1)。

acceptedAnswers：
- 哈希
- 哈希表
- hash
- hashtable
- hash table

判题设置：忽略大小写，去除首尾空格，任一答案匹配即正确。

解析：字典底层是哈希表，通过哈希函数把键映射到数组索引，实现平均 O(1) 的访问。理解这一点有助于明白为什么字典的键必须是可哈希的不可变类型。

是否用于 Battle：否
Battle 难度：EASY
Battle 展示类型：text

#### 题目 7（FILL_BLANK）

题干：集合求交集使用的运算符是__________。

acceptedAnswers：
- &
- &&
- 交集
- and

判题设置：忽略大小写，去除首尾空格，任一答案匹配即正确。

解析：集合的交集运算符是 `&`，表示取两个集合共有的元素。例如 `group_a & group_b` 返回同时属于两个集合的元素。注意它是位运算符，但在集合语境下表示交集。

是否用于 Battle：否
Battle 难度：EASY
Battle 展示类型：text

#### 题目 8（FILL_BLANK）

题干：把列表 `name_list` 去重，可以使用 `list(set(name_list))`，这是因为集合中的元素是__________的（不会出现重复）。

acceptedAnswers：
- 不重复
- 唯一
- 无重复
- 不重复
- 互不相同

判题设置：忽略大小写，去除首尾空格，任一答案匹配即正确。

解析：集合是一个不重复元素的容器，把列表转成集合会自动去掉重复元素，再转回列表即可完成去重。这是集合最常见的应用之一。

是否用于 Battle：否
Battle 难度：EASY
Battle 展示类型：text

#### 题目 9（FILL_BLANK）

题干：当不同键经哈希计算得到相同索引时会发生哈希冲突，Python 的 dict 使用__________法来解决这一问题。

acceptedAnswers：
- 开放寻址
- 开放寻址法
- 开放定址
- 开放定址法
- open addressing

判题设置：忽略大小写，去除首尾空格，任一答案匹配即正确。

解析：Python 的 dict 采用开放寻址法解决哈希冲突，当目标位置已被占用且键不同时，会按探测规则寻找下一个空闲位置。这一过程对使用者透明，无需手动处理。

是否用于 Battle：否
Battle 难度：MEDIUM
Battle 展示类型：text

#### 题目 10（FILL_BLANK）

题干：遍历字典时，若想同时拿到键和值，应调用字典的__________方法。

acceptedAnswers：
- items
- items()
- .items()
- d.items()

判题设置：忽略大小写，去除首尾空格，任一答案匹配即正确。

解析：`items()` 方法返回字典中所有键值对，可在 for 循环中同时解包出键和值。`keys()` 只返回键，`values()` 只返回值，无法同时获取两者。

是否用于 Battle：否
Battle 难度：EASY
Battle 展示类型：text

#### 题目 11（CODE_FILL）

考查点：用 `get` 方法配合默认值实现词频统计。

题目代码：

```python
text = "apple banana apple cherry banana apple"
word_count = {}
for word in text.split():
    __________
print(word_count)
```

标准答案：word_count[word] = word_count.get(word, 0) + 1

完整代码：

```python
text = "apple banana apple cherry banana apple"
word_count = {}
for word in text.split():
    word_count[word] = word_count.get(word, 0) + 1
print(word_count)
```

解析：`get(word, 0)` 在键不存在时返回 0，再加 1 后写回，实现了"首次出现记 1、再次出现累加"的词频统计逻辑。相比先用 `if word in word_count` 判断，这种写法更简洁。

是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：code

#### 题目 12（CODE_FILL）

考查点：两数之和中用字典记录已遍历元素的下标。

题目代码：

```python
number_list = [2, 7, 11, 15]
target_sum = 9
index_map = {}
result = []
for index, value in enumerate(number_list):
    complement = target_sum - value
    if complement in index_map:
        result = [index_map[complement], index]
        break
    __________
print(result)
```

标准答案：index_map[value] = index

完整代码：

```python
number_list = [2, 7, 11, 15]
target_sum = 9
index_map = {}
result = []
for index, value in enumerate(number_list):
    complement = target_sum - value
    if complement in index_map:
        result = [index_map[complement], index]
        break
    index_map[value] = index
print(result)
```

解析：每次遍历后把当前值及其下标存入字典，这样后续元素的"互补数"就能在字典里 O(1) 查到对应下标。如果漏掉这行，字典始终为空，永远找不到互补数，两数之和算法就无法工作。

是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：code

#### 题目 13（CODE_FILL）

考查点：用 `get` 指定默认值，安全取值避免 KeyError。

题目代码：

```python
score_dict = {"Alice": 90, "Bob": 85}
# 安全获取 David 的成绩，键不存在时返回 0
david_score = __________
print(david_score)
```

标准答案：score_dict.get("David", 0)

完整代码：

```python
score_dict = {"Alice": 90, "Bob": 85}
# 安全获取 David 的成绩，键不存在时返回 0
david_score = score_dict.get("David", 0)
print(david_score)
```

解析：`get("David", 0)` 在键不存在时返回指定的默认值 0，而不会抛出 KeyError。若直接用 `score_dict["David"]` 则会因为键不存在而报错，导致程序中断。

是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：code

#### 题目 14（CODE_FILL）

考查点：集合的交集运算符。

题目代码：

```python
group_a = {"Alice", "Bob", "Charlie"}
group_b = {"Bob", "Charlie", "David"}
# 求两个集合都包含的同学
common_members = __________
print(common_members)
```

标准答案：group_a & group_b

完整代码：

```python
group_a = {"Alice", "Bob", "Charlie"}
group_b = {"Bob", "Charlie", "David"}
# 求两个集合都包含的同学
common_members = group_a & group_b
print(common_members)
```

解析：`&` 是集合的交集运算符，返回同时属于两个集合的元素，结果为 `{'Bob', 'Charlie'}`。并集用 `|`，差集用 `-`，对称差集用 `^`，需要根据需求选择正确的运算符。

是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：code

#### 题目 15（CODE_FILL）

考查点：用 `items()` 遍历字典并累加所有值。

题目代码：

```python
score_dict = {"Alice": 90, "Bob": 85, "Charlie": 78}
total_score = 0
for name, score in __________:
    total_score += score
print(total_score)
```

标准答案：score_dict.items()

完整代码：

```python
score_dict = {"Alice": 90, "Bob": 85, "Charlie": 78}
total_score = 0
for name, score in score_dict.items():
    total_score += score
print(total_score)
```

解析：`items()` 返回键值对序列，配合 for 循环可以同时解包出 name 和 score 进行累加。若改用 `keys()` 或 `values()`，则只能拿到键或值，无法同时获得两者来求总分。

是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：code

---