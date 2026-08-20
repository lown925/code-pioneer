# 第十一章：图与图的遍历

章节简介：本章学习图这种能够表示复杂网络关系的数据结构。通过城市道路、好友关系和网页链接理解顶点与边，掌握邻接表表示方法，并学习深度优先搜索 DFS 与广度优先搜索 BFS。课程会重新使用栈、递归、队列和 visited 集合，把前面多个章节知识连接起来。
预计学习时间：120 分钟

章节学习目标：
- 能够解释图中的顶点和边
- 能够区分有向图和无向图
- 能够使用字典与列表构造邻接表
- 能够理解 DFS 的深入再回退思想
- 能够理解 BFS 的逐层扩展思想
- 能够使用 visited 避免重复访问并判断节点连通性

---

## 课时 1：什么是图

课时简介：从城市道路和好友关系认识图，理解图比树更灵活的连接关系。

预计学习时间：20 分钟

### 正文

[标题]
现实关系不总是层次结构

[文本]
树适合父子层次，但城市道路、社交关系、网页链接往往不是一棵树。

例如 A 城市可以连接 B 和 C，B 还可以连接 C，C 又可能连接 D。节点之间存在更自由的网络关系，这时可以使用图。

[标题]
顶点和边

[文本]
图由顶点和边组成。

顶点表示对象；

边表示对象之间的关系。

例如城市图中，城市是顶点，道路是边。

[代码 language=python]
vertices = ["A", "B", "C"]
edges = [
    ("A", "B"),
    ("B", "C")
]

print(vertices)
print(edges)
[/代码]

[标题]
图不要求只有一个根

[文本]
普通图没有树那样唯一的根，一个顶点也可能与很多其他顶点相连。

图甚至可能存在环：

A → B → C → A

这也是图遍历必须使用 visited 记录的重要原因。

[示例 title=表示好友连接]
说明：用边列表表示用户之间的连接。
语言：python
users = ["小明", "小码", "小云"]
friend_edges = [
    ("小明", "小码"),
    ("小码", "小云")
]

for edge in friend_edges:
    print(edge)
[/示例]

[提示 title=对象是顶点，关系是边]
看到复杂关系网络时，先判断有哪些对象，以及对象之间有哪些连接。

[警告 title=图可以有环]
不能像树那样假设沿连接一直走就一定不会回到旧节点。

### 课时题目

#### 题目 1

题型：SINGLE_CHOICE
题干：图结构中表示对象本身的元素通常叫什么？
难度：EASY
分值：10
知识点：图、顶点
是否用于 Battle：否

选项：
- A. 顶点 [正确]
- B. 栈顶
- C. 哈希桶
- D. 队尾

解析：
图由顶点和边组成，顶点表示对象，边表示对象之间的关系。

#### 题目 2

题型：SINGLE_CHOICE
题干：在城市道路图中，最自然的“边”表示什么？
难度：MEDIUM
分值：10
知识点：图、边、建模
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码用途

选项：
- A. 城市之间的道路连接 [正确]
- B. 城市名称本身
- C. Python 变量名
- D. 只能表示人口

解析：
城市作为顶点，道路作为连接两个城市的关系，因此道路最适合作为边。

#### 题目 3

题型：SINGLE_CHOICE
题干：为什么遍历一般图时常常需要记录 visited？
难度：HARD
分值：10
知识点：图、环、visited
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码分析

选项：
- A. 因为图可能存在环，重复沿边会再次回到旧顶点 [正确]
- B. 因为图中不能保存字符串
- C. 因为 visited 用来排序所有边
- D. 因为顶点必须删除

解析：
图可能有环。如果不记录已访问顶点，遍历可能不断重复访问同一节点，甚至无法结束。

---

## 课时 2：有向图、无向图与邻接表

课时简介：区分边是否具有方向，并使用邻接表保存每个顶点的直接邻居。

预计学习时间：20 分钟

### 正文

[标题]
无向图

[文本]
如果 A 和 B 之间的关系是双向的，可以使用无向边，例如普通双向道路 A — B，意味着 A 可以到 B，B 也可以到 A。

[标题]
有向图

[文本]
如果关系有方向，A → B 只表示从 A 指向 B，不自动表示 B 指向 A。网页链接、关注关系、任务依赖都可能使用有向图。

[标题]
邻接表

[文本]
邻接表记录每个顶点直接连接哪些邻居。

[代码 language=python]
graph = {
    "A": ["B", "C"],
    "B": ["A", "D"],
    "C": ["A"],
    "D": ["B"]
}

print(graph["A"])
[/代码]

[文本]
A 的邻居是 B、C。对于无向图，如果 A 与 B 相连，通常需要 A 的邻接表包含 B，同时 B 的邻接表也包含 A。

[示例 title=建立小型无向图]
说明：A 与 B、C 相连，同时在 B、C 的邻接表中记录 A。
语言：python
graph = {
    "A": ["B", "C"],
    "B": ["A"],
    "C": ["A"]
}

for vertex in graph:
    print(vertex, graph[vertex])
[/示例]

[提示 title=无向边要双向记录]
如果使用邻接表表达无向图，别忘了两个顶点都要把对方列为邻居。

[警告 title=有向图不要擅自补反向边]
A → B 不代表 B → A。是否双向必须根据业务关系决定。

### 课时题目

#### 题目 4

题型：SINGLE_CHOICE
题干：有向边 `A → B` 最准确表示什么？
难度：EASY
分值：10
知识点：有向图、边
是否用于 Battle：否

选项：
- A. 存在从 A 指向 B 的关系 [正确]
- B. 一定同时存在 B 指向 A
- C. A 和 B 必须数值相等
- D. A 是根节点

解析：
有向边具有方向，A → B 只说明从 A 到 B 的方向关系。

#### 题目 5

题型：SINGLE_CHOICE
题干：邻接表 `graph["A"] = ["B", "C"]` 表示什么？
难度：MEDIUM
分值：10
知识点：邻接表、邻居
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码分析

选项：
- A. A 的直接邻居包含 B 和 C [正确]
- B. A 一定是叶子
- C. B 和 C 一定没有其他邻居
- D. A 的值等于两个字符串相加

解析：
邻接表中 A 对应的列表记录 A 直接连接到哪些顶点。

#### 题目 6

题型：CODE_FILL
题干：这是无向图，A 与 B 相连。已写 `graph["A"].append("B")`，补全另一条语句记录反向邻接。请填写完整语句。
难度：HARD
分值：10
知识点：无向图、邻接表
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码：

```python
graph = {
    "A": [],
    "B": []
}

graph["A"].append("B")
____

print(graph)
```

可接受答案：

```python
graph = {
    "A": [],
    "B": []
}

graph["A"].append("B")
graph["B"].append("A")

print(graph)
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
无向边需要两个方向都能找到对方，因此还要把 A 加入 B 的邻居列表。

标准完整代码：

```python
graph = {
    "A": [],
    "B": []
}

graph["A"].append("B")
graph["B"].append("A")

print(graph)
```

---

## 课时 3：深度优先搜索 DFS

课时简介：学习“一条路尽量走深，再回退”的 DFS 思想，并使用递归实现。

预计学习时间：20 分钟

### 正文

[标题]
DFS 的直觉

[文本]
深度优先搜索可以理解为：从起点出发，选择一个还没访问的邻居继续深入，走不下去时再回退，像在迷宫中沿一条路尽量走到底。

[代码 language=python]
graph = {
    "A": ["B", "C"],
    "B": ["D"],
    "C": [],
    "D": []
}

visited = set()

def dfs(vertex):
    if vertex in visited:
        return

    visited.add(vertex)
    print(vertex)

    for neighbor in graph[vertex]:
        dfs(neighbor)

dfs("A")
[/代码]

[文本]
visited 防止同一个顶点被重复处理。

[标题]
DFS 和栈

[文本]
递归调用本身具有调用栈，也可以显式使用 stack 实现 DFS。因此 DFS 和前面学习的栈思想密切相关。

[示例 title=递归遍历有环图]
说明：从 A 开始深度优先访问，已访问节点加入集合。
语言：python
graph = {
    "A": ["B"],
    "B": ["C"],
    "C": ["A"]
}

visited = set()

def dfs(vertex):
    if vertex in visited:
        return

    visited.add(vertex)
    print(vertex)

    for neighbor in graph[vertex]:
        dfs(neighbor)

dfs("A")
[/示例]

[提示 title=进入节点后尽早标记 visited]
通常在真正展开邻居前就把当前节点标记为已访问，避免环导致重复递归。

[警告 title=有环图没有 visited 可能无限往返]
例如 A→B、B→A，如果没有访问记录，递归可能反复调用。

### 课时题目

#### 题目 7

题型：SINGLE_CHOICE
题干：DFS 最典型的访问策略是什么？
难度：EASY
分值：10
知识点：DFS、深度优先
是否用于 Battle：否

选项：
- A. 沿一个方向尽量深入，再回退 [正确]
- B. 永远只访问起点
- C. 按数值排序所有顶点
- D. 每次必须访问全部同层节点后才深入

解析：
DFS 强调深度优先，通常沿未访问邻居不断深入，无法继续时回退。

#### 题目 8

题型：SINGLE_CHOICE
题干：DFS 中 visited 集合的主要作用是什么？
难度：MEDIUM
分值：10
知识点：DFS、visited、环
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码用途

选项：
- A. 防止重复访问已经处理过的顶点 [正确]
- B. 自动给顶点排序
- C. 保存所有边的权重
- D. 删除图

解析：
visited 记录已经访问过的顶点，避免环和多路径造成重复处理。

#### 题目 9

题型：SINGLE_CHOICE
题干：图中存在 A→B、B→A。如果递归 DFS 完全不记录 visited，最可能发生什么？
难度：HARD
分值：10
知识点：DFS、环、递归
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：异常识别

选项：
- A. A 和 B 之间可能不断递归往返 [正确]
- B. 图会自动变成树
- C. B 会被自动删除
- D. 算法一定只执行两次

解析：
A 调用 B，B 又调用 A，没有 visited 终止重复访问，就可能持续递归。

---

## 课时 4：广度优先搜索 BFS

课时简介：学习“一层一层向外扩展”的 BFS，并重新使用 deque 队列。

预计学习时间：20 分钟

### 正文

[标题]
BFS 的直觉

[文本]
广度优先搜索先访问距离起点更近的顶点，再逐步向外扩展。它先访问起点的直接邻居，再访问这些邻居尚未访问的邻居。

[代码 language=python]
from collections import deque

graph = {
    "A": ["B", "C"],
    "B": ["D"],
    "C": ["E"],
    "D": [],
    "E": []
}

visited = {"A"}
queue = deque(["A"])

while len(queue) > 0:
    vertex = queue.popleft()
    print(vertex)

    for neighbor in graph[vertex]:
        if neighbor not in visited:
            visited.add(neighbor)
            queue.append(neighbor)
[/代码]

[文本]
队列保证更早发现的节点先被处理。

[标题]
为什么入队时就标记 visited

[文本]
一个顶点可能被多个邻居发现。如果等出队时才标记，同一个顶点可能被重复加入队列。因此常见做法是第一次发现并入队时立即加入 visited。

[示例 title=BFS 访问小图]
说明：从 A 开始逐层访问 B、C，再访问更远节点。
语言：python
from collections import deque

graph = {
    "A": ["B", "C"],
    "B": ["D"],
    "C": [],
    "D": []
}

visited = {"A"}
queue = deque(["A"])

while queue:
    vertex = queue.popleft()
    print(vertex)

    for neighbor in graph[vertex]:
        if neighbor not in visited:
            visited.add(neighbor)
            queue.append(neighbor)
[/示例]

[提示 title=BFS 看到队列]
如果算法描述“一层一层扩散”“按距离层次展开”，通常应该想到队列。

[警告 title=不要把 popleft 写成 pop]
append + pop 会变成后进先出的栈行为，从而更接近 DFS，而不是标准 BFS。

### 课时题目

#### 题目 10

题型：SINGLE_CHOICE
题干：BFS 通常使用哪种数据结构保存等待访问的顶点？
难度：EASY
分值：10
知识点：BFS、队列
是否用于 Battle：否

选项：
- A. 队列 [正确]
- B. 只能使用数组排序
- C. 只能使用递归返回值
- D. 不需要保存任何顶点

解析：
BFS 需要先发现的顶点先处理，因此使用先进先出队列。

#### 题目 11

题型：SINGLE_CHOICE
题干：从 A 开始，A 的邻居依次是 B、C，B 有邻居 D。按给定邻接顺序执行 BFS，前四个访问顶点是什么？
难度：MEDIUM
分值：10
知识点：BFS、队列、执行流程
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：执行流程

选项：
- A. A、B、C、D [正确]
- B. A、B、D、C
- C. D、B、C、A
- D. A、C、D、B

解析：
A 首先访问并把 B、C 入队，之后依次处理 B、C。D 在处理 B 时加入队尾，因此排在 C 后面。

#### 题目 12

题型：CODE_FILL
题干：补全 BFS 出队语句，使程序取出最早等待的顶点。请填写完整赋值语句。
难度：HARD
分值：10
知识点：BFS、deque、FIFO
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码：

```python
from collections import deque

queue = deque(["A"])

while len(queue) > 0:
    ____
    print(vertex)
```

可接受答案：

```python
from collections import deque

queue = deque(["A"])

while len(queue) > 0:
    vertex = queue.popleft()
    print(vertex)
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
BFS 使用先进先出队列，因此要通过 `queue.popleft()` 取出最早进入队列的顶点。

标准完整代码：

```python
from collections import deque

queue = deque(["A"])

while len(queue) > 0:
    vertex = queue.popleft()
    print(vertex)
```

---

## 课时 5：DFS 与 BFS 怎么选

课时简介：比较两种遍历方式的访问顺序和典型用途，并理解它们都能完成连通区域遍历。

预计学习时间：20 分钟

### 正文

[标题]
两者都可以遍历可达节点

[文本]
如果只是想从起点访问所有能到达的顶点，DFS 和 BFS 通常都能完成。区别主要在访问顺序和问题需求。

[标题]
DFS 更偏向深入

[文本]
DFS 适合探索一条路径、递归结构、回溯思想和连通性检查等问题。

[标题]
BFS 更偏向距离层次

[文本]
BFS 一层层扩展。在无权图中，如果要找从起点到目标的最少边数路径，BFS 很自然，因为它会先访问距离 1 的点，再距离 2，再距离 3。

[标题]
复杂度

[文本]
使用邻接表并避免重复访问时，DFS 和 BFS 都会处理每个可达顶点并检查相关边，常见复杂度写作 O(V + E)。

V 是顶点数，E 是边数。

[示例 title=同一图的两个访问策略]
说明：用文字说明 DFS 深入和 BFS 分层的差异。
语言：python
strategy_dfs = "优先深入未访问邻居"
strategy_bfs = "优先处理更早发现的邻居"

print(strategy_dfs)
print(strategy_bfs)
[/示例]

[提示 title=最少边数路径优先想到 BFS]
在无权图中，按层扩展意味着第一次到达目标时通常经过的边数最少。

[警告 title=不要说 DFS 永远比 BFS 快]
两者复杂度常常同阶，实际选择取决于访问顺序、空间、路径需求和图结构。

### 课时题目

#### 题目 13

题型：SINGLE_CHOICE
题干：在无权图中寻找从起点到目标的最少边数路径，通常优先考虑哪种遍历？
难度：EASY
分值：10
知识点：BFS、最短边数
是否用于 Battle：否

选项：
- A. BFS [正确]
- B. 只用排序
- C. 只用哈希冲突
- D. 任意删除顶点

解析：
BFS 按距离层次扩展，在无权图中第一次到达目标时对应最少边数路径。

#### 题目 14

题型：SINGLE_CHOICE
题干：使用邻接表完整遍历一个连通图，DFS 和 BFS 的常见时间复杂度都是什么？
难度：MEDIUM
分值：10
知识点：DFS、BFS、复杂度
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码分析

选项：
- A. O(1)
- B. O(log V)
- C. O(V + E) [正确]
- D. O(V!)

解析：
正常实现会访问每个顶点并检查相关边，常见复杂度为 O(V + E)。

#### 题目 15

题型：SINGLE_CHOICE
题干：下面哪项描述最准确？
难度：HARD
分值：10
知识点：DFS、BFS、选择
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码分析

选项：
- A. DFS 和 BFS 访问顺序不同，但都可用于遍历可达节点 [正确]
- B. DFS 只能用于树，不能用于图
- C. BFS 不需要 visited
- D. 两者都必须得到完全相同访问顺序

解析：
DFS 偏深入、BFS 偏分层，两者访问顺序不同，但都能遍历从起点可达的区域。

---

## 课时 6：图综合应用——判断是否连通

课时简介：使用 BFS 判断两个顶点之间是否存在路径，并综合 visited、邻接表与队列。

预计学习时间：20 分钟

### 正文

[标题]
问题：A 能否到达目标 D

[文本]
给定邻接表后，可以从 A 开始 BFS。只要访问到 D 就返回 True；如果队列耗尽仍没找到，则返回 False。

[代码 language=python]
from collections import deque

graph = {
    "A": ["B", "C"],
    "B": ["D"],
    "C": ["E"],
    "D": [],
    "E": []
}

start = "A"
target = "D"

visited = {start}
queue = deque([start])
found = False

while queue:
    vertex = queue.popleft()

    if vertex == target:
        found = True
        break

    for neighbor in graph[vertex]:
        if neighbor not in visited:
            visited.add(neighbor)
            queue.append(neighbor)

print(found)
[/代码]

[文本]
visited 防止重复加入旧节点，也让每个顶点只被正常展开有限次数。

[标题]
多种数据结构组合

[文本]
这个程序同时使用字典表示邻接表、集合保存 visited、队列实现 BFS，再配合循环和条件完成流程。

数据结构课程的核心不是孤立背诵，而是知道不同结构如何组合解决问题。

[示例 title=判断两个节点是否可达]
说明：从 start 开始 BFS，如果访问 target 就提前结束。
语言：python
from collections import deque

graph = {
    "A": ["B"],
    "B": ["C"],
    "C": []
}

start = "A"
target = "C"

visited = {start}
queue = deque([start])
found = False

while queue:
    vertex = queue.popleft()

    if vertex == target:
        found = True
        break

    for neighbor in graph[vertex]:
        if neighbor not in visited:
            visited.add(neighbor)
            queue.append(neighbor)

print(found)
[/示例]

[提示 title=连通性就是“能不能沿边走到”]
把问题转成从起点搜索所有可达节点，看目标是否会被访问。

[警告 title=不要假设目标一定在图中]
真实实现可在开始前检查 start、target 是否存在于邻接表，避免访问不存在的 key。

### 课时题目

#### 题目 16

题型：SINGLE_CHOICE
题干：判断图中从 A 是否能到达 D，本质上要检查什么？
难度：EASY
分值：10
知识点：图、连通性
是否用于 Battle：否

选项：
- A. 是否存在一条沿边从 A 到 D 的路径 [正确]
- B. A 和 D 的名字是否相同长度
- C. D 是否数值最大
- D. 图是否能排序成列表

解析：
可达性问题关注是否能够沿图中的边从起点走到目标。

#### 题目 17

题型：SINGLE_CHOICE
题干：BFS 找目标时，如果目标已经出队并确认匹配，为什么可以提前 break？
难度：MEDIUM
分值：10
知识点：BFS、提前结束
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码分析

选项：
- A. 因为目标已经找到，不需要继续遍历无关节点 [正确]
- B. 因为 break 会删除整张图
- C. 因为队列一定为空
- D. 因为 visited 必须清零

解析：
当前任务只是判断是否可达，目标已经访问到后答案确定，可以提前结束搜索。

#### 题目 18

题型：CODE_FILL
题干：补全 visited 更新语句，使邻居第一次加入 BFS 队列时立即标记为已访问。请填写完整语句。
难度：HARD
分值：10
知识点：BFS、visited、集合
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码：

```python
for neighbor in graph[vertex]:
    if neighbor not in visited:
        ____
        queue.append(neighbor)
```

可接受答案：

```python
for neighbor in graph[vertex]:
    if neighbor not in visited:
        visited.add(neighbor)
        queue.append(neighbor)
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
邻居第一次被发现时应立即加入 visited，防止其他路径再次把同一节点重复加入队列。

标准完整代码：

```python
for neighbor in graph[vertex]:
    if neighbor not in visited:
        visited.add(neighbor)
        queue.append(neighbor)
```

---
