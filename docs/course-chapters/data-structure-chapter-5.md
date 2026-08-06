## 章节5：树与二叉树

### 章节简介

本章节从线性结构走向非线性结构，介绍树、二叉树的基本概念与术语，重点讲解二叉树的三种遍历方式（前序、中序、后序），并引入二叉搜索树、堆、优先队列以及图、BFS/DFS 的概念。这些是后续学习算法与复杂数据结构的基础。

### 预计学习时间

70 分钟

### 正文

**树的定义与基本术语**

树是一种分层（非线性）数据结构，由若干节点和连接边组成，形如倒置的树。最顶端的节点叫"根节点（root）"；没有子节点的节点叫"叶子节点（leaf）"；一个节点的下一层节点叫它的"子节点"，上一层节点叫它的"父节点"。节点的深度指从根到该节点的边数；节点的度指它拥有的子节点个数。

```
        根节点(root)
       /     \
   子节点    子节点
   /   \       \
叶子  叶子     叶子
```

**二叉树定义**

二叉树是每个节点最多有两个子节点的树，分别称为"左子节点"和"右子节点"。二叉树是有序的，左右子节点的位置不能随意交换。很多高效数据结构（如二叉搜索树、堆）都建立在二叉树之上。

**二叉树节点结构**

在 Python 中，通常用一个类来表示二叉树节点：包含一个值 `val`、一个左指针 `left` 和一个右指针 `right`。左右指针指向各自的子节点，没有子节点时为 None。

```python
class TreeNode:
    def __init__(self, val=0):
        self.val = val
        self.left = None
        self.right = None
```

**二叉树的构建**

构建二叉树就是创建若干节点，再用 left、right 指针把它们连接起来。下面构建一棵简单的二叉树。

```python
# 构建如下二叉树:
#       1
#      / \
#     2   3
#    /
#   4
root = TreeNode(1)
root.left = TreeNode(2)
root.right = TreeNode(3)
root.left.left = TreeNode(4)
```

**前序遍历（根-左-右）**

前序遍历的顺序是：先访问根节点，再递归遍历左子树，最后递归遍历右子树。常用于"复制一棵树"或"把树结构序列化"。

```python
def preorder_traversal(root):
    if root is None:
        return
    print(root.val)              # 先访问根
    preorder_traversal(root.left)   # 再遍历左子树
    preorder_traversal(root.right)  # 最后遍历右子树

# 对上面的树前序遍历，输出: 1 2 4 3
```

**中序遍历（左-根-右）**

中序遍历的顺序是：先递归遍历左子树，再访问根节点，最后递归遍历右子树。对于二叉搜索树，中序遍历会得到一个升序序列，这是它的重要性质。

```python
def inorder_traversal(root):
    if root is None:
        return
    inorder_traversal(root.left)    # 先遍历左子树
    print(root.val)              # 再访问根
    inorder_traversal(root.right)   # 最后遍历右子树

# 对上面的树中序遍历，输出: 4 2 1 3
```

**后序遍历（左-右-根）**

后序遍历的顺序是：先递归遍历左子树，再递归遍历右子树，最后访问根节点。常用于"先处理子节点再处理父节点"的场景，如计算目录大小、释放树内存。

```python
def postorder_traversal(root):
    if root is None:
        return
    postorder_traversal(root.left)   # 先遍历左子树
    postorder_traversal(root.right)  # 再遍历右子树
    print(root.val)              # 最后访问根

# 对上面的树后序遍历，输出: 4 2 3 1
```

**二叉搜索树 BST 概念**

二叉搜索树是一种特殊的二叉树，满足：左子树所有节点的值都小于根节点的值，右子树所有节点的值都大于根节点的值，且左右子树也分别是二叉搜索树。BST 的关键性质是：对它做中序遍历，会得到一个升序序列，因此查找、插入、删除在平衡情况下都能达到 O(log n)。

```
        8
       / \
      3   10
     / \    \
    1   6    14
# 中序遍历: 1 3 6 8 10 14（升序）
```

**堆的概念**

堆是一棵"完全二叉树"，且满足堆序性质：大顶堆中每个父节点的值都大于等于它的子节点；小顶堆中每个父节点的值都小于等于它的子节点。堆常用于实现优先队列，Python 标准库 heapq 提供了小顶堆的实现。堆的根节点总是整个堆的最大值（大顶堆）或最小值（小顶堆）。

**优先队列概念**

优先队列是一种"按优先级出队"的队列：优先级最高的元素先出队，而不是先入先出。它通常用堆来实现，每次出队取出堆顶（最大或最小）元素，时间复杂度 O(log n)。

**图的概念简介**

图由"顶点（vertex）"和"边（edge）"组成，用来表示事物之间的关系。边有方向的图叫"有向图"，边无方向的图叫"无向图"。树可以看作一种特殊的、没有环的连通图。

**图的表示**

图常用的两种表示方式：邻接矩阵用一个 n×n 的二维数组表示顶点之间的连接关系，查边快但空间开销大；邻接表为每个顶点维护一个邻居列表，节省空间，是更常用的方式。

```python
# 用邻接表表示无向图: 顶点 0-1-2 相连，2-3 相连
graph = {
    0: [1],
    1: [0, 2],
    2: [1, 3],
    3: [2]
}
```

**BFS 和 DFS 概念**

遍历图（或树）有两种基本策略：广度优先搜索（BFS）和深度优先搜索（DFS）。BFS 用"队列"实现，一层一层地向外扩展；DFS 用"栈"或"递归"实现，沿着一条路径一直走到底再回退。BFS 适合求最短路径（无权图），DFS 适合连通性判断和路径搜索。

```python
# BFS 概念示意（用队列）
from collections import deque

def bfs(graph, start):
    visited = set()
    queue = deque([start])
    visited.add(start)
    while queue:
        node = queue.popleft()
        print(node)
        for neighbor in graph[node]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)
```

[警告 title="二叉树遍历的左右顺序不能颠倒"]

前序、中序、后序的区别在于"根"的访问时机不同，但"先左后右"的相对顺序是固定的。如果把左右子树的递归调用顺序写反，遍历结果就会出错，且对二叉搜索树做中序遍历也不会再得到升序序列。

[提示 title="记住三种遍历的口诀"]

三种遍历的名称就是"根"在序列中的位置：前序=根在前（根左右），中序=根在中（左根右），后序=根在后（左右根）。只要确定根的位置，左右子树的相对顺序始终是"先左后右"。

[示例 title="二叉树的三种遍历"]

```python
class TreeNode:
    def __init__(self, val=0):
        self.val = val
        self.left = None
        self.right = None

# 构建二叉树:
#       1
#      / \
#     2   3
#    / \
#   4   5
root = TreeNode(1)
root.left = TreeNode(2)
root.right = TreeNode(3)
root.left.left = TreeNode(4)
root.left.right = TreeNode(5)

def preorder(node):
    if node is None:
        return
    print(node.val, end=" ")
    preorder(node.left)
    preorder(node.right)

def inorder(node):
    if node is None:
        return
    inorder(node.left)
    print(node.val, end=" ")
    inorder(node.right)

def postorder(node):
    if node is None:
        return
    postorder(node.left)
    postorder(node.right)
    print(node.val, end=" ")

preorder(root)   # 输出: 1 2 4 5 3
print()
inorder(root)    # 输出: 4 2 5 1 3
print()
postorder(root)  # 输出: 4 5 2 3 1
```

### 章节题目

#### 题目 1（SINGLE_CHOICE）

题干：二叉树中，每个节点最多有几个子节点？

- A. 1 个
- B. 2 个
- C. 3 个
- D. 任意多个

正确答案：B

解析：二叉树的定义就是每个节点最多有两个子节点，分别称为左子节点和右子节点。如果允许任意多个子节点，那属于一般树（多叉树），不再是二叉树。

是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：text

#### 题目 2（SINGLE_CHOICE）

题干：二叉树的"前序遍历"的访问顺序是？

- A. 左-根-右
- B. 左-右-根
- C. 根-左-右
- D. 右-根-左

正确答案：C

解析：前序遍历是"根-左-右"，即先访问根节点，再递归遍历左子树，最后递归遍历右子树。中序遍历是"左-根-右"，后序遍历是"左-右-根"，名称反映的是根的访问位置。

是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：text

#### 题目 3（SINGLE_CHOICE）

题干：对一棵二叉搜索树（BST）进行中序遍历，得到的结果序列有什么特点？

- A. 降序排列
- B. 升序排列
- C. 无序
- D. 与插入顺序一致

正确答案：B

解析：二叉搜索树满足左子树值 < 根值 < 右子树值，因此中序遍历（左-根-右）会按从小到大访问每个节点，得到升序序列。这是 BST 最重要的性质之一，也是判断一棵树是否为 BST 的常用方法。

是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：text

#### 题目 4（SINGLE_CHOICE）

题干：关于"大顶堆"，下列说法正确的是？

- A. 父节点的值小于等于子节点的值
- B. 父节点的值大于等于子节点的值
- C. 左子节点一定大于右子节点
- D. 堆必须是一棵满二叉树

正确答案：B

解析：大顶堆中每个父节点的值都大于等于它的子节点的值，因此堆顶（根节点）是整个堆的最大值。大顶堆要求的是"完全二叉树"而非满二叉树，且左右子节点之间没有固定的大小关系。

是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：text

#### 题目 5（SINGLE_CHOICE）

题干：广度优先搜索（BFS）在实现时通常借助哪种数据结构？

- A. 栈
- B. 队列
- C. 哈希表
- D. 二叉树

正确答案：B

解析：BFS 一层一层地扩展节点，先访问的节点的邻居也先被访问，符合"先进先出"的特点，因此用队列实现。DFS 则常用栈或递归（递归本质也利用了调用栈）来实现。

是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：text

#### 题目 6（FILL_BLANK）

题干：二叉树前序遍历的访问顺序是__________（用"根""左""右"组合表示，如"根左右"）。

acceptedAnswers：
- 根左右
- 根-左-右
- 根 左 右
- 根左 右
- 根、左、右

判题设置：忽略大小写，去除首尾空格，任一答案匹配即正确。

解析：前序遍历是"根-左-右"，根节点最先被访问，然后递归遍历左子树和右子树。名称中的"前"指的就是根在前面（最先访问）。

是否用于 Battle：否
Battle 难度：EASY
Battle 展示类型：text

#### 题目 7（FILL_BLANK）

题干：对二叉搜索树进行中序遍历，会得到一个__________序列（从小到大排列）。

acceptedAnswers：
- 升序
- 有序
- 从小到大
- 递增
- 排好序

判题设置：忽略大小写，去除首尾空格，任一答案匹配即正确。

解析：二叉搜索树满足左子树 < 根 < 右子树，中序遍历按"左-根-右"访问，恰好得到升序序列。这一性质常用于排序、判断 BST 合法性等场景。

是否用于 Battle：否
Battle 难度：EASY
Battle 展示类型：text

#### 题目 8（FILL_BLANK）

题干：在大顶堆中，父节点的值__________子节点的值（填"大于等于"或"小于等于"）。

acceptedAnswers：
- 大于等于
- >=
- 大于或等于
- 不小于
- 大于等于

判题设置：忽略大小写，去除首尾空格，任一答案匹配即正确。

解析：大顶堆的堆序性质是父节点值大于等于子节点值，所以堆顶是最大值。小顶堆则相反，父节点值小于等于子节点值，堆顶是最小值。

是否用于 Battle：否
Battle 难度：EASY
Battle 展示类型：text

#### 题目 9（FILL_BLANK）

题干：广度优先搜索（BFS）在实现时借助__________这种数据结构来完成逐层扩展。

acceptedAnswers：
- 队列
- queue
- 队列queue
- Queue

判题设置：忽略大小写，去除首尾空格，任一答案匹配即正确。

解析：BFS 需要"先进先出"的特性，因此用队列实现：每次从队首取出节点，把它的邻居加入队尾，从而实现一层一层地访问。深度优先搜索则用栈或递归。

是否用于 Battle：否
Battle 难度：EASY
Battle 展示类型：text

#### 题目 10（FILL_BLANK）

题干：图常用的两种表示方法是邻接矩阵和__________表。

acceptedAnswers：
- 邻接
- 邻接表
- adjacency list
- adjacency
- 邻接 表

判题设置：忽略大小写，去除首尾空格，任一答案匹配即正确。

解析：邻接表为每个顶点维护一个邻居列表，相比邻接矩阵更节省空间，是表示稀疏图的常用方式。邻接矩阵用二维数组表示，查边快但空间开销为 O(n²)。

是否用于 Battle：否
Battle 难度：MEDIUM
Battle 展示类型：text

#### 题目 11（CODE_FILL）

考查点：TreeNode 类中初始化左子节点指针。

题目代码：

```python
class TreeNode:
    def __init__(self, val=0):
        self.val = val
        __________
        self.right = None
```

标准答案：self.left = None

完整代码：

```python
class TreeNode:
    def __init__(self, val=0):
        self.val = val
        self.left = None
        self.right = None
```

解析：二叉树节点需要存储值以及左右两个子节点指针。构造时把 `self.left` 和 `self.right` 都初始化为 None，表示新建节点暂时没有子节点。缺少左指针会导致后续无法挂载左子树。

是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：code

#### 题目 12（CODE_FILL）

考查点：前序遍历中"先访问根，再遍历左子树"的递归结构。

题目代码：

```python
def preorder_traversal(root):
    if root is None:
        return
    print(root.val)
    __________
    preorder_traversal(root.right)
```

标准答案：preorder_traversal(root.left)

完整代码：

```python
def preorder_traversal(root):
    if root is None:
        return
    print(root.val)
    preorder_traversal(root.left)
    preorder_traversal(root.right)
```

解析：前序遍历顺序是"根-左-右"：先打印根的值，再递归遍历左子树，最后递归遍历右子树。空行处应填入对左子树的递归调用，否则左子树不会被访问。

是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：code

#### 题目 13（CODE_FILL）

考查点：中序遍历中"访问根节点"的位置。

题目代码：

```python
def inorder_traversal(root):
    if root is None:
        return
    inorder_traversal(root.left)
    __________
    inorder_traversal(root.right)
```

标准答案：print(root.val)

完整代码：

```python
def inorder_traversal(root):
    if root is None:
        return
    inorder_traversal(root.left)
    print(root.val)
    inorder_traversal(root.right)
```

解析：中序遍历顺序是"左-根-右"：先递归遍历左子树，再访问（打印）根节点，最后递归遍历右子树。空行处正是"访问根"这一步，缺少它节点值就不会被输出。

是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：code

#### 题目 14（CODE_FILL）

考查点：构建二叉树时挂载右子节点。

题目代码：

```python
root = TreeNode(1)
root.left = TreeNode(2)
__________
# 期望的树结构: 1 为根，左子节点 2，右子节点 3
```

标准答案：root.right = TreeNode(3)

完整代码：

```python
root = TreeNode(1)
root.left = TreeNode(2)
root.right = TreeNode(3)
# 期望的树结构: 1 为根，左子节点 2，右子节点 3
```

解析：给节点挂载子节点时，左子节点用 `left` 指针，右子节点用 `right` 指针。这里需要把值为 3 的新节点赋给 `root.right`，从而形成完整的左右子树结构。

是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：code

#### 题目 15（CODE_FILL）

考查点：后序遍历中"最后访问根节点"。

题目代码：

```python
def postorder_traversal(root):
    if root is None:
        return
    postorder_traversal(root.left)
    postorder_traversal(root.right)
    __________
```

标准答案：print(root.val)

完整代码：

```python
def postorder_traversal(root):
    if root is None:
        return
    postorder_traversal(root.left)
    postorder_traversal(root.right)
    print(root.val)
```

解析：后序遍历顺序是"左-右-根"：先递归遍历左子树，再递归遍历右子树，最后才访问根节点。空行处是"访问根"的步骤，必须放在两次递归调用之后，这正是"后序"的含义。

是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：code

---