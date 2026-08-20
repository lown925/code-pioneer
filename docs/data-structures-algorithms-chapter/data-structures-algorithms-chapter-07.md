# 第七章：树与二叉树

章节简介：本章从文件目录和组织结构出发，认识树这种非线性数据结构，掌握根节点、父节点、子节点、叶子节点、深度和高度等基本术语，并使用 Python 类构造二叉树节点。学习完成后，能够读懂基础树结构，理解二叉树中 left 和 right 的含义，并为下一章的树遍历和二叉搜索树打下基础。
预计学习时间：120 分钟

章节学习目标：
- 能够解释树和线性结构的主要区别
- 能够识别根节点、父节点、子节点和叶子节点
- 能够理解深度和高度的基础含义
- 能够解释二叉树“每个节点最多两个孩子”的规则
- 能够使用 Python 类创建并连接二叉树节点
- 能够理解递归访问树结构的基本思想

---

## 课时 1：为什么需要树

课时简介：从层次关系出发认识树，并理解树与数组、链表等线性结构的区别。

预计学习时间：20 分钟

### 正文

[标题]
有些数据不是一条直线

[文本]
前面学习的数组、链表、栈和队列都属于线性结构。它们主要描述前一个、后一个、先进入、后进入等关系。

但现实中很多数据具有层次关系，例如文件目录、组织结构和课程目录。这类结构会从一个起点不断向下分支，更适合用树表示。

[标题]
树用来表示层次关系

[文本]
树由节点和节点之间的连接组成。最上面的起始节点通常叫根节点，一个节点可以拥有若干子节点，子节点还可以继续拥有自己的子节点。

树非常适合表示文件目录、组织结构、课程章节、分类系统和表达式结构。

[代码 language=python]
course = {
    "name": "数据结构",
    "chapters": ["栈", "队列", "树"]
}

print(course["name"])
print(course["chapters"])
[/代码]

[文本]
这个字典还不是真正的树类，只是帮助理解“一个对象下面还有多个子对象”的层次关系。

[标题]
树没有单一的“下一个”

[文本]
链表中的一个节点通常只有一个 next。树中的一个节点可能有多个孩子，因此从一个节点出发可能存在多条向下路径，这也是树属于非线性结构的原因。

[示例 title=课程目录的层次关系]
说明：使用嵌套结构表示课程下面包含多个章节。
语言：python
course = {
    "name": "算法基础",
    "children": [
        {"name": "数组"},
        {"name": "链表"},
        {"name": "树"}
    ]
}

print(course["children"][2]["name"])
[/示例]

[提示 title=看到“层次”和“分支”时想到树]
如果数据中存在“上级—下级”“父级—子级”“目录—子目录”的关系，树往往比线性结构更自然。

[警告 title=树不要求节点值按大小排列]
普通树只描述结构关系。只有二叉搜索树等特殊树才会对节点值的相对大小提出额外要求。

### 课时题目

#### 题目 1

题型：SINGLE_CHOICE
题干：下面哪个场景最适合用树表示？
难度：EASY
分值：10
知识点：树、层次结构
是否用于 Battle：否

选项：
- A. 文件目录层次 [正确]
- B. 单纯按到达顺序排队
- C. 只记录最近一次操作
- D. 随机打乱一组数字

解析：
文件目录具有明显的父目录和子目录层次关系，非常适合用树表示。

#### 题目 2

题型：SINGLE_CHOICE
题干：树结构与单链表相比，最明显的结构差异是什么？
难度：MEDIUM
分值：10
知识点：树、链表、非线性结构
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码分析

选项：
- A. 树中的节点可能向下连接多个子节点 [正确]
- B. 树不能保存数据
- C. 单链表中的节点必须有两个 next
- D. 树只能保存字符串

解析：
单链表通常沿单一 next 方向形成线性顺序，而树节点可能拥有多个子节点，因此会产生分支和层次结构。

#### 题目 3

题型：SINGLE_CHOICE
题干：下面哪项描述最准确？
难度：HARD
分值：10
知识点：树、层次关系
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码用途

选项：
- A. 所有树都必须按节点值从小到大排列
- B. 树主要用于表达节点之间的层次和分支关系 [正确]
- C. 树中的每个节点都只能有一个孩子
- D. 树与列表完全相同，只是名字不同

解析：
普通树的核心是层次和分支关系，不要求节点值自动有序，也不限制每个节点只能有一个孩子。

---

## 课时 2：树的基本术语

课时简介：掌握根、父、子、兄弟、叶子等基本术语，并能够根据树结构判断节点关系。

预计学习时间：20 分钟

### 正文

[标题]
根节点

[文本]
树最上面的起始节点称为根节点。一棵非空树通常只有一个根。

例如 A 的直接子节点是 B 和 C，那么 A 是根节点，B 和 C 都位于它下面。

[标题]
父节点和子节点

[文本]
如果节点 A 直接连接到 B，那么 A 是 B 的父节点，B 是 A 的子节点。

如果 B 再直接连接到 D，那么 B 是 D 的父节点，A 则是 D 的祖先，但不是 D 的直接父节点。

[标题]
兄弟节点和叶子节点

[文本]
拥有同一个父节点的节点互为兄弟。没有子节点的节点称为叶子节点。

[代码 language=python]
tree = {
    "A": ["B", "C"],
    "B": ["D"],
    "C": [],
    "D": []
}

for node in tree:
    if len(tree[node]) == 0:
        print(node)
[/代码]

[文本]
程序输出 C 和 D，因为它们没有任何子节点。

[示例 title=识别叶子节点]
说明：用字典记录每个节点的直接子节点，并找出没有孩子的节点。
语言：python
children = {
    "课程": ["第一章", "第二章"],
    "第一章": ["课时1"],
    "第二章": [],
    "课时1": []
}

for node in children:
    if len(children[node]) == 0:
        print(node)
[/示例]

[提示 title=判断关系时只看直接连接]
父子关系通常指直接连接。祖先和后代则可以跨越多层。

[警告 title=叶子和“最后一个节点”不是一回事]
树可以有多个叶子节点。叶子只表示没有子节点，不表示它一定出现在图形最右边或最后。

### 课时题目

#### 题目 4

题型：SINGLE_CHOICE
题干：树中没有任何子节点的节点通常叫什么？
难度：EASY
分值：10
知识点：树、叶子节点
是否用于 Battle：否

选项：
- A. 根节点
- B. 叶子节点 [正确]
- C. 队首
- D. 栈顶

解析：
没有子节点的节点称为叶子节点。

#### 题目 5

题型：SINGLE_CHOICE
题干：A 的直接子节点是 B 和 C，B 的直接子节点是 D。下面哪项正确？
难度：MEDIUM
分值：10
知识点：父节点、子节点、兄弟节点
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码分析

选项：
- A. B 和 C 是兄弟节点 [正确]
- B. A 和 D 是兄弟节点
- C. D 是 A 的直接子节点
- D. C 是 B 的父节点

解析：
B 和 C 拥有同一个父节点 A，因此是兄弟节点。D 的直接父节点是 B。

#### 题目 6

题型：CODE_FILL
题干：补全条件，使程序输出所有没有子节点的节点。请填写 if 后面的条件表达式。
难度：HARD
分值：10
知识点：树、叶子、字典
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码：

```python
children = {
    "A": ["B", "C"],
    "B": ["D"],
    "C": [],
    "D": []
}

for node in children:
    if ____:
        print(node)
```

可接受答案：

```python
children = {
    "A": ["B", "C"],
    "B": ["D"],
    "C": [],
    "D": []
}

for node in children:
    if len(children[node]) == 0:
        print(node)
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
叶子节点没有任何子节点，因此对应的子节点列表长度为 0。

标准完整代码：

```python
children = {
    "A": ["B", "C"],
    "B": ["D"],
    "C": [],
    "D": []
}

for node in children:
    if len(children[node]) == 0:
        print(node)
```

---

## 课时 3：深度与高度

课时简介：理解节点深度和树高度，用层级数量描述节点距离根的位置和树的纵向规模。

预计学习时间：20 分钟

### 正文

[标题]
深度描述节点离根有多远

[文本]
本课程约定根节点深度为 0，根的直接子节点深度为 1，再下一层深度为 2。

例如 A→B→C 中，A 深度 0，B 深度 1，C 深度 2。

[标题]
高度描述向下最远路径

[文本]
本课程使用“边数”定义高度：叶子节点高度为 0，一个节点的高度是从它向下到最远叶子经过的边数。

整棵树的高度就是根节点的高度。

[代码 language=python]
levels = [
    ["A"],
    ["B", "C"],
    ["D"]
]

height = len(levels) - 1

print(height)
[/代码]

[文本]
这里共有 3 层，以根深度为 0 的约定计算，高度为 2。

[示例 title=根据层级计算高度]
说明：已知树按层保存，层数减 1 得到以边数计的高度。
语言：python
levels = [
    ["root"],
    ["left", "right"],
    ["leaf1", "leaf2"]
]

print(len(levels) - 1)
[/示例]

[提示 title=先统一约定]
不同教材可能用节点数或边数定义高度。本课程统一采用边数：根深度为 0，叶子高度为 0。

[警告 title=不要混淆深度和高度]
深度从根向当前节点看，高度从当前节点向最远叶子看，两者方向不同。

### 课时题目

#### 题目 7

题型：SINGLE_CHOICE
题干：按照本课程约定，根节点的深度是多少？
难度：EASY
分值：10
知识点：树、深度
是否用于 Battle：否

选项：
- A. 0 [正确]
- B. 1
- C. -1
- D. 由节点值决定

解析：
本课程统一约定根节点深度为 0。

#### 题目 8

题型：SINGLE_CHOICE
题干：树结构为 A→B→C，A 是根，C 的深度是多少？
难度：MEDIUM
分值：10
知识点：树、深度、层级
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：执行流程

选项：
- A. 0
- B. 1
- C. 2 [正确]
- D. 3

解析：
根 A 深度为 0，B 深度为 1，C 深度为 2。

#### 题目 9

题型：SINGLE_CHOICE
题干：一棵树共有根层、第二层、第三层和第四层，最深叶子位于第四层。按本课程约定，树高是多少？
难度：HARD
分值：10
知识点：树、高度、深度
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码分析

选项：
- A. 2
- B. 3 [正确]
- C. 4
- D. 5

解析：
共有 4 层时，根到最深叶子经过 3 条边，因此高度为 3。

---

## 课时 4：认识二叉树

课时简介：理解二叉树的左右孩子结构，并区分“最多两个孩子”和“必须有两个孩子”。

预计学习时间：20 分钟

### 正文

[标题]
二叉树是什么

[文本]
二叉树的基本规则是：每个节点最多有两个子节点，分别称为左孩子和右孩子。

“最多两个”意味着节点可以有 0、1 或 2 个孩子，并不是每个节点都必须拥有两个孩子。

[标题]
左和右是有区别的

[文本]
在二叉树中，只有左孩子和只有右孩子是两种不同结构。后面的遍历和二叉搜索树规则都会利用 left 和 right 的区别。

[代码 language=python]
class TreeNode:
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None
[/代码]

[文本]
TreeNode 用 value 保存数据，left 和 right 分别保存左右孩子引用。

[示例 title=创建一个根和两个孩子]
说明：建立根节点 A，并分别连接左孩子 B 和右孩子 C。
语言：python
class TreeNode:
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None

root = TreeNode("A")
root.left = TreeNode("B")
root.right = TreeNode("C")

print(root.left.value)
print(root.right.value)
[/示例]

[提示 title=“最多两个”不是“正好两个”]
叶子节点可以没有孩子，某些节点也可能只有左孩子或只有右孩子。

[警告 title=左右位置不能随意忽略]
left 和 right 是不同结构位置，不能在没有规则的情况下互换。

### 课时题目

#### 题目 10

题型：SINGLE_CHOICE
题干：二叉树中每个节点最多有多少个子节点？
难度：EASY
分值：10
知识点：二叉树、基本概念
是否用于 Battle：否

选项：
- A. 1
- B. 2 [正确]
- C. 3
- D. 没有限制

解析：
二叉树定义中，每个节点最多拥有两个子节点，通常称为左孩子和右孩子。

#### 题目 11

题型：SINGLE_CHOICE
题干：基础二叉树节点最常见的三个字段组合是什么？
难度：MEDIUM
分值：10
知识点：二叉树、节点字段
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码用途

选项：
- A. value、left、right [正确]
- B. value、ten_next、queue
- C. root、hash、random
- D. 只有一个固定整数

解析：
基础二叉树节点通常保存节点值以及 left、right 两个孩子引用。

#### 题目 12

题型：CODE_FILL
题干：补全连接语句，使节点 B 成为根节点 A 的左孩子。请填写完整赋值语句。
难度：HARD
分值：10
知识点：二叉树、left、节点连接
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码：

```python
class TreeNode:
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None

root = TreeNode("A")
b = TreeNode("B")

____

print(root.left.value)
```

可接受答案：

```python
class TreeNode:
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None

root = TreeNode("A")
b = TreeNode("B")

root.left = b

print(root.left.value)
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
要让 b 成为根节点的左孩子，需要把 root.left 指向 b。

标准完整代码：

```python
class TreeNode:
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None

root = TreeNode("A")
b = TreeNode("B")

root.left = b

print(root.left.value)
```

---

## 课时 5：手动构造一棵二叉树

课时简介：使用多个 TreeNode 对象建立完整的二叉树，并根据 left/right 关系读取节点。

预计学习时间：20 分钟

### 正文

[标题]
先创建节点，再建立关系

[代码 language=python]
class TreeNode:
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None

a = TreeNode("A")
b = TreeNode("B")
c = TreeNode("C")
d = TreeNode("D")
e = TreeNode("E")

a.left = b
a.right = c
b.left = d
b.right = e

root = a
[/代码]

[文本]
这棵树结构是：A 的左右孩子为 B、C，B 的左右孩子为 D、E。C、D、E 都是叶子。

[标题]
通过路径读取节点

[代码 language=python]
print(root.value)
print(root.left.value)
print(root.left.right.value)
[/代码]

[文本]
分别输出 A、B、E。表达式 `root.left.right` 表示从根先到左孩子 B，再到 B 的右孩子 E。

[标题]
空孩子用 None 表示

[文本]
如果某个孩子不存在，对应属性就是 None。访问孩子的 value 前，需要确认孩子不是 None。

[代码 language=python]
if root.right.left is None:
    print("C 没有左孩子")
[/代码]

[示例 title=判断根节点是否拥有两个孩子]
说明：同时检查 left 和 right 是否非空。
语言：python
class TreeNode:
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None

root = TreeNode(10)
root.left = TreeNode(5)
root.right = TreeNode(15)

if root.left is not None and root.right is not None:
    print("根节点有两个孩子")
[/示例]

[提示 title=把属性访问看成路径]
`root.left.right` 就是在树中沿“左、右”两步移动。

[警告 title=不要对 None 继续访问 value]
如果某个孩子不存在，对 `None.value` 进行访问会报错，应先判断节点是否存在。

### 课时题目

#### 题目 13

题型：SINGLE_CHOICE
题干：在二叉树中，`root.left.right` 表示怎样的路径？
难度：EASY
分值：10
知识点：二叉树、路径
是否用于 Battle：否

选项：
- A. 根 → 左孩子 → 右孩子 [正确]
- B. 根 → 右孩子 → 左孩子
- C. 根 → 根
- D. 随机选择节点

解析：
属性读取顺序就是路径顺序，先从 root 到 left，再到该节点的 right。

#### 题目 14

题型：SINGLE_CHOICE
题干：树结构为 A 的左孩子 B、右孩子 C，B 的右孩子 E。表达式 `root.left.right.value` 输出什么？
难度：MEDIUM
分值：10
知识点：二叉树、路径、属性访问
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：输出预测

选项：
- A. A
- B. B
- C. C
- D. E [正确]

解析：
root.left 到 B，B.right 到 E，因此最终 value 是 E。

#### 题目 15

题型：SINGLE_CHOICE
题干：如果 `root.right.left` 为 None，直接执行 `root.right.left.value` 最可能发生什么？
难度：HARD
分值：10
知识点：二叉树、None、异常识别
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：异常识别

选项：
- A. 自动得到 0
- B. 因为对 None 访问 value 而报错 [正确]
- C. 自动创建一个新节点
- D. 自动返回根节点值

解析：
None 不是 TreeNode，没有 value 属性，因此继续访问 `.value` 会产生属性访问错误。

---

## 课时 6：递归访问树的思想

课时简介：建立“处理当前节点，再处理子树”的递归思维，为下一章正式学习遍历顺序做准备。

预计学习时间：20 分钟

### 正文

[标题]
树天然包含更小的树

[文本]
一棵二叉树可以看成一个根节点、一棵左子树和一棵右子树。左子树和右子树本身仍然是树，因此非常适合递归思考。

[代码 language=python]
class TreeNode:
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None

def show(node):
    if node is None:
        return

    print(node.value)
    show(node.left)
    show(node.right)
[/代码]

[文本]
函数先处理当前节点，再递归处理左右子树。当遇到 None 时立即 return，这就是递归结束条件。

[标题]
递归不等于神奇跳转

[文本]
每次递归调用只是把一个更小的子树当作新的输入，再执行相同规则。下一章会进一步区分前序、中序、后序和层序。

[示例 title=统计二叉树节点数量]
说明：空树返回 0，非空节点数量等于 1 加左右子树节点数量。
语言：python
class TreeNode:
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None

def count_nodes(node):
    if node is None:
        return 0

    return 1 + count_nodes(node.left) + count_nodes(node.right)

root = TreeNode("A")
root.left = TreeNode("B")
root.right = TreeNode("C")

print(count_nodes(root))
[/示例]

[提示 title=递归先找结束条件]
写树递归时，先明确遇到空节点怎么办，再考虑当前节点和左右子树如何组合。

[警告 title=忘记结束条件会不断递归]
如果递归函数在 None 时仍继续调用自己，就无法正确停止。

### 课时题目

#### 题目 16

题型：SINGLE_CHOICE
题干：二叉树递归函数中，常见的基础结束条件是什么？
难度：EASY
分值：10
知识点：树、递归、None
是否用于 Battle：否

选项：
- A. 节点为 None 时返回 [正确]
- B. 节点值必须变成字符串
- C. 每次都删除根节点
- D. 永远不返回

解析：
树递归最终会遇到不存在的孩子，因此常用 `node is None` 作为结束条件。

#### 题目 17

题型：SINGLE_CHOICE
题干：下面函数对只有 A、B、C 三个节点的树执行 `count_nodes(root)`，其中 A 的左右孩子分别是 B、C。结果是多少？

```python
def count_nodes(node):
    if node is None:
        return 0
    return 1 + count_nodes(node.left) + count_nodes(node.right)
```

难度：MEDIUM
分值：10
知识点：树、递归、节点计数
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码分析

选项：
- A. 1
- B. 2
- C. 3 [正确]
- D. 4

解析：
函数会为 A、B、C 三个非空节点各贡献 1，因此总数为 3。

#### 题目 18

题型：CODE_FILL
题干：补全递归函数的结束条件，使空节点返回 0。请填写 if 后面的条件表达式。
难度：HARD
分值：10
知识点：树、递归、结束条件
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码：

```python
def count_nodes(node):
    if ____:
        return 0

    return 1 + count_nodes(node.left) + count_nodes(node.right)
```

可接受答案：

```python
def count_nodes(node):
    if node is None:
        return 0

    return 1 + count_nodes(node.left) + count_nodes(node.right)
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
递归到不存在的孩子时，node 会是 None。此时应立即返回 0，不再继续访问 left 或 right。

标准完整代码：

```python
def count_nodes(node):
    if node is None:
        return 0

    return 1 + count_nodes(node.left) + count_nodes(node.right)
```

---
