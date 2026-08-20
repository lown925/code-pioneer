# 第八章：二叉树遍历与二叉搜索树

章节简介：本章学习二叉树最重要的访问方式，包括前序、中序、后序和层序遍历，并进一步认识二叉搜索树的有序性质、查找和插入。课程会把前面学过的递归和队列重新应用到树结构中。学习完成后，能够根据遍历规则推导节点访问顺序，并理解二叉搜索树为什么能够利用大小关系缩小查找范围。
预计学习时间：120 分钟

章节学习目标：
- 能够区分前序、中序和后序遍历
- 能够根据给定二叉树推导遍历结果
- 能够使用队列理解层序遍历
- 能够解释二叉搜索树的基本有序规则
- 能够实现二叉搜索树的基础查找
- 能够理解二叉搜索树插入时如何选择左右分支

---

## 课时 1：前序遍历

课时简介：学习“根—左—右”的前序遍历规则，并用递归代码实现。

预计学习时间：20 分钟

### 正文

[标题]
前序遍历先访问根

[文本]
前序遍历的顺序是：根 → 左 → 右。

对于根 A，左子树根 B，右孩子 C，而 B 的左右孩子分别是 D、E，前序结果为：

A、B、D、E、C。

[代码 language=python]
def preorder(node):
    if node is None:
        return

    print(node.value)
    preorder(node.left)
    preorder(node.right)
[/代码]

[文本]
先处理当前节点，再递归左子树，最后递归右子树。

[标题]
代码和规则是一一对应的

[文本]
三行核心操作：

print(node.value)
preorder(node.left)
preorder(node.right)

刚好对应根、左、右。理解树遍历时，可以观察“处理当前节点”的代码位于两个递归调用的什么位置。

[示例 title=前序遍历一棵小树]
说明：构造 A-B-C 三节点树并执行前序遍历。
语言：python
class TreeNode:
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None

root = TreeNode("A")
root.left = TreeNode("B")
root.right = TreeNode("C")

def preorder(node):
    if node is None:
        return
    print(node.value)
    preorder(node.left)
    preorder(node.right)

preorder(root)
[/示例]

[提示 title=记住“前”指根在前]
前序遍历中，根节点在左右子树之前被访问。

[警告 title=不要把左右顺序颠倒]
本课程统一使用根—左—右。如果代码先递归 right 再 left，结果会不同。

### 课时题目

#### 题目 1

题型：SINGLE_CHOICE
题干：前序遍历的标准顺序是什么？
难度：EASY
分值：10
知识点：二叉树、前序遍历
是否用于 Battle：否

选项：
- A. 根、左、右 [正确]
- B. 左、根、右
- C. 左、右、根
- D. 右、根、左

解析：
前序遍历先访问根节点，再左子树，最后右子树。

#### 题目 2

题型：SINGLE_CHOICE
题干：二叉树根 A，左孩子 B，右孩子 C。前序遍历结果是什么？
难度：MEDIUM
分值：10
知识点：前序遍历、执行顺序
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：执行流程

选项：
- A. B、A、C
- B. B、C、A
- C. A、B、C [正确]
- D. C、B、A

解析：
前序规则是根—左—右，因此先 A，再 B，再 C。

#### 题目 3

题型：SINGLE_CHOICE
题干：树结构为 A 的左孩子 B、右孩子 C，B 的左孩子 D、右孩子 E。前序遍历结果是什么？
难度：HARD
分值：10
知识点：前序遍历、递归
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：执行流程

选项：
- A. D、B、E、A、C
- B. A、B、D、E、C [正确]
- C. D、E、B、C、A
- D. A、C、B、E、D

解析：
先访问 A，再完整遍历左子树 B：B、D、E，最后访问右子树 C，因此为 A、B、D、E、C。

---

## 课时 2：中序遍历

课时简介：学习“左—根—右”的中序遍历，并观察它在二叉搜索树中的特殊意义。

预计学习时间：20 分钟

### 正文

[标题]
中序遍历把根放在中间

[文本]
中序遍历顺序是：左 → 根 → 右。

对于 A 的左子树根 B、右孩子 C，而 B 的左右孩子是 D、E，中序结果为：

D、B、E、A、C。

[代码 language=python]
def inorder(node):
    if node is None:
        return

    inorder(node.left)
    print(node.value)
    inorder(node.right)
[/代码]

[标题]
中序遍历和二叉搜索树

[文本]
二叉搜索树常使用“左子树值更小、右子树值更大”的规则。对于符合规则且没有重复值的 BST，中序遍历通常能够得到从小到大的有序结果。

[示例 title=中序遍历数字树]
说明：构造根 10、左 5、右 15，并输出中序结果。
语言：python
class TreeNode:
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None

root = TreeNode(10)
root.left = TreeNode(5)
root.right = TreeNode(15)

def inorder(node):
    if node is None:
        return
    inorder(node.left)
    print(node.value)
    inorder(node.right)

inorder(root)
[/示例]

[提示 title=“中”表示根在左右之间]
中序的核心是先左子树，再根，再右子树。

[警告 title=普通二叉树中序结果不一定有序]
只有树本身满足二叉搜索树的大小规则时，中序结果才具有排序意义。

### 课时题目

#### 题目 4

题型：SINGLE_CHOICE
题干：中序遍历的顺序是什么？
难度：EASY
分值：10
知识点：中序遍历
是否用于 Battle：否

选项：
- A. 根、左、右
- B. 左、根、右 [正确]
- C. 左、右、根
- D. 右、左、根

解析：
中序遍历先左子树，再根节点，再右子树。

#### 题目 5

题型：SINGLE_CHOICE
题干：根节点为 10，左孩子 5，右孩子 15。中序遍历结果是什么？
难度：MEDIUM
分值：10
知识点：中序遍历、BST
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：输出预测

选项：
- A. 10、5、15
- B. 5、10、15 [正确]
- C. 5、15、10
- D. 15、10、5

解析：
中序顺序为左—根—右，因此得到 5、10、15。

#### 题目 6

题型：CODE_FILL
题干：补全递归调用，使函数按照中序“左—根—右”访问。请填写 print 之前缺失的一条完整语句。
难度：HARD
分值：10
知识点：中序遍历、递归
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码：

```python
def inorder(node):
    if node is None:
        return

    ____
    print(node.value)
    inorder(node.right)
```

可接受答案：

```python
def inorder(node):
    if node is None:
        return

    inorder(node.left)
    print(node.value)
    inorder(node.right)
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
中序遍历必须先处理左子树，因此 print 当前节点之前应执行 `inorder(node.left)`。

标准完整代码：

```python
def inorder(node):
    if node is None:
        return

    inorder(node.left)
    print(node.value)
    inorder(node.right)
```

---

## 课时 3：后序遍历

课时简介：学习“左—右—根”的后序遍历，并理解为什么它适合先处理子树再处理父节点。

预计学习时间：20 分钟

### 正文

[标题]
后序遍历最后访问根

[文本]
后序顺序是：左 → 右 → 根。

对于同一棵 A-B-C-D-E 的树，后序结果为：

D、E、B、C、A。

[代码 language=python]
def postorder(node):
    if node is None:
        return

    postorder(node.left)
    postorder(node.right)
    print(node.value)
[/代码]

[标题]
什么时候先孩子后父节点很有用

[文本]
如果父节点的处理依赖子节点已经完成，后序很自然。例如计算目录总大小、删除树结构、计算表达式树等场景。

[示例 title=后序访问小树]
说明：输出根 A、左 B、右 C 的后序结果。
语言：python
class TreeNode:
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None

root = TreeNode("A")
root.left = TreeNode("B")
root.right = TreeNode("C")

def postorder(node):
    if node is None:
        return
    postorder(node.left)
    postorder(node.right)
    print(node.value)

postorder(root)
[/示例]

[提示 title=后序把根放最后]
先完整处理左右子树，再处理当前节点。

[警告 title=“后序”不是从右到左]
“后”指根节点最后访问，不代表一定先右子树。本课程顺序仍是左、右、根。

### 课时题目

#### 题目 7

题型：SINGLE_CHOICE
题干：后序遍历的顺序是什么？
难度：EASY
分值：10
知识点：后序遍历
是否用于 Battle：否

选项：
- A. 根、左、右
- B. 左、根、右
- C. 左、右、根 [正确]
- D. 根、右、左

解析：
后序遍历先左子树，再右子树，最后访问根。

#### 题目 8

题型：SINGLE_CHOICE
题干：根 A，左 B，右 C。后序遍历结果是什么？
难度：MEDIUM
分值：10
知识点：后序遍历
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：输出预测

选项：
- A. A、B、C
- B. B、A、C
- C. B、C、A [正确]
- D. C、A、B

解析：
按照左—右—根，先 B，再 C，最后 A。

#### 题目 9

题型：SINGLE_CHOICE
题干：如果需要“先处理完一个节点的两个子树，再汇总当前节点结果”，哪种遍历思想最自然？
难度：HARD
分值：10
知识点：后序遍历、应用
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码用途

选项：
- A. 后序遍历 [正确]
- B. 只访问根节点
- C. 随机遍历
- D. 只访问右孩子

解析：
后序会先处理左右子树，再处理当前节点，因此适合父节点依赖子树结果的场景。

---

## 课时 4：层序遍历与队列

课时简介：重新使用队列知识，实现从上到下、从左到右逐层访问二叉树。

预计学习时间：20 分钟

### 正文

[标题]
层序遍历是一层一层访问

[文本]
对于 A 的下一层 B、C，再下一层 D、E，层序结果是：

A、B、C、D、E。

它先访问根层，再访问第二层，再访问第三层。

[标题]
为什么需要队列

[文本]
访问 A 后，把 B、C 加入等待队列。接下来先处理更早加入的 B，再处理 C，这正好符合先进先出。

[代码 language=python]
from collections import deque

def level_order(root):
    if root is None:
        return

    queue = deque([root])

    while len(queue) > 0:
        node = queue.popleft()
        print(node.value)

        if node.left is not None:
            queue.append(node.left)

        if node.right is not None:
            queue.append(node.right)
[/代码]

[示例 title=层序遍历三节点树]
说明：把根放入 deque，每次取队首并加入孩子。
语言：python
from collections import deque

class TreeNode:
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None

root = TreeNode("A")
root.left = TreeNode("B")
root.right = TreeNode("C")

queue = deque([root])

while len(queue) > 0:
    node = queue.popleft()
    print(node.value)

    if node.left is not None:
        queue.append(node.left)
    if node.right is not None:
        queue.append(node.right)
[/示例]

[提示 title=队列中保存等待访问的节点]
每次从队首取一个节点，再把它的孩子加入队尾，就会自然形成逐层访问。

[警告 title=不要用栈替代队列后还期待相同层序]
栈是后进先出，会改变节点处理顺序。

### 课时题目

#### 题目 10

题型：SINGLE_CHOICE
题干：标准层序遍历通常借助哪种数据结构？
难度：EASY
分值：10
知识点：层序遍历、队列
是否用于 Battle：否

选项：
- A. 队列 [正确]
- B. 只能使用字符串
- C. 只能使用哈希函数
- D. 不能使用任何辅助结构

解析：
层序遍历需要按发现先后处理节点，先进先出的队列非常适合。

#### 题目 11

题型：SINGLE_CHOICE
题干：A 的左孩子 B、右孩子 C，B 的两个孩子 D、E。层序结果是什么？
难度：MEDIUM
分值：10
知识点：层序遍历、队列
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：执行流程

选项：
- A. A、B、D、E、C
- B. D、B、E、A、C
- C. A、B、C、D、E [正确]
- D. D、E、B、C、A

解析：
层序先访问根 A，再同层 B、C，最后下一层 D、E。

#### 题目 12

题型：CODE_FILL
题干：补全队列取出语句，使层序遍历每次从最早等待的节点开始处理。请填写完整赋值语句。
难度：HARD
分值：10
知识点：层序遍历、deque、FIFO
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码：

```python
from collections import deque

queue = deque([root])

while len(queue) > 0:
    ____
    print(node.value)

    if node.left is not None:
        queue.append(node.left)

    if node.right is not None:
        queue.append(node.right)
```

可接受答案：

```python
from collections import deque

queue = deque([root])

while len(queue) > 0:
    node = queue.popleft()
    print(node.value)

    if node.left is not None:
        queue.append(node.left)

    if node.right is not None:
        queue.append(node.right)
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
层序遍历需要先进先出，因此应使用 `queue.popleft()` 取得最早进入队列的节点。

标准完整代码：

```python
from collections import deque

queue = deque([root])

while len(queue) > 0:
    node = queue.popleft()
    print(node.value)

    if node.left is not None:
        queue.append(node.left)

    if node.right is not None:
        queue.append(node.right)
```

---

## 课时 5：认识二叉搜索树

课时简介：理解二叉搜索树的大小关系，并观察它如何帮助查找。

预计学习时间：20 分钟

### 正文

[标题]
二叉搜索树增加了大小规则

[文本]
本课程使用无重复值简化规则：

左子树中的值小于当前节点；

右子树中的值大于当前节点。

例如根 10，左孩子 5，右孩子 15，15 的左孩子可以是 12。

[标题]
为什么规则有利于查找

[文本]
查找 12 时先和 10 比较。12 > 10，所以只看右子树；来到 15 后，12 < 15，所以只看左子树；最终找到 12。

[代码 language=python]
def search(node, target):
    while node is not None:
        if target == node.value:
            return True
        elif target < node.value:
            node = node.left
        else:
            node = node.right

    return False
[/代码]

[标题]
树形状影响效率

[文本]
如果树比较平衡，查找可能接近 O(log n)。如果节点不断只向一边增长，树会退化得像链表，最坏查找可能达到 O(n)。所以不能简单说所有 BST 查找永远是 O(log n)。

[示例 title=在 BST 中查找目标]
说明：根据目标和当前节点值比较，决定进入左子树还是右子树。
语言：python
def search(node, target):
    while node is not None:
        if target == node.value:
            return True
        if target < node.value:
            node = node.left
        else:
            node = node.right
    return False
[/示例]

[提示 title=每次比较决定一个方向]
target 小于当前值向左，大于当前值向右，相等则找到。

[警告 title=BST 高效依赖树形状]
严重倾斜的 BST 可能退化成近似链表，最坏查找不再是对数级。

### 课时题目

#### 题目 13

题型：SINGLE_CHOICE
题干：按本课程无重复值规则，在二叉搜索树中，小于当前节点的值通常放在哪一侧？
难度：EASY
分值：10
知识点：BST、大小关系
是否用于 Battle：否

选项：
- A. 左侧 [正确]
- B. 右侧
- C. 任意一侧
- D. 必须删除

解析：
本课程使用左小右大的二叉搜索树规则。

#### 题目 14

题型：SINGLE_CHOICE
题干：BST 当前节点值为 20，要查找目标 13。下一步应该进入哪棵子树？
难度：MEDIUM
分值：10
知识点：BST、查找
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：执行流程

选项：
- A. 左子树 [正确]
- B. 右子树
- C. 两边同时随机查
- D. 立即返回找到

解析：
13 小于 20，根据 BST 规则，目标如果存在应位于左子树。

#### 题目 15

题型：SINGLE_CHOICE
题干：为什么不能说“任意二叉搜索树查找一定是 O(log n)”？
难度：HARD
分值：10
知识点：BST、复杂度、退化
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码分析

选项：
- A. 因为 BST 不能查找
- B. 因为严重倾斜的 BST 可能退化为近似链表，最坏达到 O(n) [正确]
- C. 因为所有 BST 都必须遍历所有节点
- D. 因为节点值必须是字符串

解析：
如果树高度接近 n，每次只能向下一层前进一个节点，查找最坏需要访问 O(n) 个节点。

---

## 课时 6：二叉搜索树插入

课时简介：根据大小关系找到插入位置，并保持二叉搜索树规则不被破坏。

预计学习时间：20 分钟

### 正文

[标题]
插入和查找走相同方向

[文本]
向 BST 插入新值时，也从根开始比较。新值更小向左，新值更大向右，直到遇到一个空孩子位置，把新节点放进去。

[代码 language=python]
def insert(root, value):
    if root is None:
        return TreeNode(value)

    current = root

    while True:
        if value < current.value:
            if current.left is None:
                current.left = TreeNode(value)
                break
            current = current.left
        else:
            if current.right is None:
                current.right = TreeNode(value)
                break
            current = current.right

    return root
[/代码]

[文本]
为了保持题目规则唯一，本课默认不会插入重复值。

[标题]
插入后仍要保持规则

[文本]
每次插入都必须保持左小右大。如果错误地把较小值放到右侧，后续查找可能根据错误方向错过目标。

[示例 title=连续插入多个值]
说明：从根 10 开始，建立左 5、右 15 的基础 BST。
语言：python
class TreeNode:
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None

root = TreeNode(10)
root.left = TreeNode(5)
root.right = TreeNode(15)

print(root.left.value)
print(root.right.value)
[/示例]

[提示 title=插入位置一定是某个空孩子]
不断比较并向左或向右，最终找到一个 None 位置，再创建新节点。

[警告 title=重复值规则必须提前定义]
不同 BST 实现对重复值处理不同。本课程基础题默认不插入重复值。

### 课时题目

#### 题目 16

题型：SINGLE_CHOICE
题干：BST 根为 10，要插入 6，根的左孩子为空。6 应插到哪里？
难度：EASY
分值：10
知识点：BST、插入
是否用于 Battle：否

选项：
- A. 根的左孩子 [正确]
- B. 根的右孩子
- C. 删除根
- D. 随机位置

解析：
6 小于 10，因此应进入左侧；左孩子为空，所以直接插入该位置。

#### 题目 17

题型：SINGLE_CHOICE
题干：BST 中已有根 10、右孩子 15。要插入 12，正确路径是什么？
难度：MEDIUM
分值：10
知识点：BST、插入、比较
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：执行流程

选项：
- A. 12 < 10，放到 10 左侧
- B. 12 > 10 进入右侧，12 < 15 放到 15 左侧 [正确]
- C. 直接替换 15
- D. 放到任意叶子下面

解析：
先与 10 比较向右，再与 15 比较向左，因此插到 15 的左孩子位置。

#### 题目 18

题型：CODE_FILL
题干：补全判断条件，使目标值小于当前节点值时进入左子树。请填写 if 后面的条件表达式。
难度：HARD
分值：10
知识点：BST、查找、比较
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码：

```python
def search(node, target):
    while node is not None:
        if target == node.value:
            return True

        if ____:
            node = node.left
        else:
            node = node.right

    return False
```

可接受答案：

```python
def search(node, target):
    while node is not None:
        if target == node.value:
            return True

        if target < node.value:
            node = node.left
        else:
            node = node.right

    return False
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
BST 使用左小右大的规则，因此 target 小于当前节点值时应该进入左子树。

标准完整代码：

```python
def search(node, target):
    while node is not None:
        if target == node.value:
            return True

        if target < node.value:
            node = node.left
        else:
            node = node.right

    return False
```

---
