# 第四章：栈

章节简介：本章学习栈这种典型的线性数据结构。通过 Python 列表理解“后进先出”的访问规则，掌握入栈、出栈、查看栈顶和判空等基本操作，并进一步学习括号匹配、撤销操作和表达式符号检查等实际应用。学习完成后，能够识别适合使用栈的问题，读懂基础栈代码，并理解栈为什么经常用于保存“最近发生、需要最先处理”的信息。
预计学习时间：120 分钟

章节学习目标：
- 能够解释栈的后进先出原则
- 能够使用 Python 列表完成基础入栈、出栈和查看栈顶操作
- 能够正确处理空栈边界情况
- 能够使用栈完成括号匹配
- 能够理解栈在撤销、函数调用和历史记录等场景中的作用
- 能够综合使用栈、字符串遍历和条件判断解决基础问题

---

## 课时 1：认识栈与后进先出

课时简介：通过叠放物品和操作历史建立栈的直观认识，理解“后进入的数据先被取出”的规则。

预计学习时间：20 分钟

### 正文

[标题]
什么是栈

[文本]
栈是一种只能从同一端进行主要插入和删除操作的线性数据结构。

这一端通常叫作栈顶。

栈最重要的规则是：

后进入的数据，先被取出。

这种规则称为“后进先出”，英文常写作 LIFO，即 Last In, First Out。

[标题]
从叠盘子理解栈

[文本]
想象把盘子一个一个叠起来。

先放进去的盘子在下面，最后放进去的盘子在最上面。

如果现在要拿走一个盘子，通常会先拿最上面的那个。

这就是典型的后进先出。

[代码 language=python]
stack = []

stack.append("盘子A")
stack.append("盘子B")
stack.append("盘子C")

print(stack)
[/代码]

[文本]
此时列表内容为：

["盘子A", "盘子B", "盘子C"]

如果把列表末尾看作栈顶，那么最后加入的 "盘子C" 位于栈顶。

[标题]
入栈和出栈

[文本]
向栈顶加入元素称为入栈。

从栈顶移除元素称为出栈。

在 Python 列表中，可以使用 append() 模拟入栈，使用 pop() 模拟从末尾出栈。

[代码 language=python]
stack = []

stack.append("A")
stack.append("B")
stack.append("C")

removed = stack.pop()

print(removed)
print(stack)
[/代码]

[文本]
程序先依次入栈 A、B、C。

最后进入的是 C，因此第一次 pop() 会取出 C。

剩余栈为：

["A", "B"]

[示例 title=记录最近访问的页面]
说明：把访问过的页面依次压入栈，离开当前页面时取出最近进入的页面。
语言：python
history = []

history.append("首页")
history.append("课程页")
history.append("章节页")

current = history.pop()

print(current)
print(history)
[/示例]

[提示 title=把列表末尾当作栈顶]
本课程使用 Python 列表实现基础栈时，统一把列表末尾作为栈顶。append() 入栈，pop() 出栈。

[警告 title=栈不是随便从中间取数据]
如果频繁从中间位置读取和删除，就不再符合栈的核心操作模型。栈强调从同一端进行主要的加入和移除。

### 课时题目

#### 题目 1

题型：SINGLE_CHOICE
题干：栈最典型的数据访问规则是什么？
难度：EASY
分值：10
知识点：栈、LIFO、基本概念
是否用于 Battle：否

选项：
- A. 先进先出
- B. 后进先出 [正确]
- C. 按数值大小自动排序
- D. 随机取出任意元素

解析：
栈遵循后进先出原则，也就是最后进入栈的元素通常最先被移除。

#### 题目 2

题型：SINGLE_CHOICE
题干：下面程序运行后输出什么？

```python
stack = []

stack.append("A")
stack.append("B")
stack.append("C")

print(stack.pop())
```

难度：MEDIUM
分值：10
知识点：栈、append、pop
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：输出预测

选项：
- A. A
- B. B
- C. C [正确]
- D. []

解析：
A、B、C 依次入栈，C 最后进入，因此位于栈顶。pop() 从列表末尾取出栈顶元素，所以输出 C。

#### 题目 3

题型：SINGLE_CHOICE
题干：下面操作依次执行后，哪一个元素最终位于栈顶？

```python
stack = []

stack.append(10)
stack.append(20)
stack.append(30)
stack.pop()
stack.append(40)
```

难度：HARD
分值：10
知识点：栈、执行流程、栈顶
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：执行流程

选项：
- A. 10
- B. 20
- C. 30
- D. 40 [正确]

解析：
入栈 10、20、30 后栈为 [10, 20, 30]。pop() 删除 30，栈变为 [10, 20]。随后 40 入栈，最终栈为 [10, 20, 40]，因此栈顶是 40。

---

## 课时 2：栈的基本操作

课时简介：掌握入栈、出栈、查看栈顶和判空，并理解为什么空栈操作必须进行边界检查。

预计学习时间：20 分钟

### 正文

[标题]
四个最常见的栈操作

[文本]
基础栈通常会涉及四类操作：

入栈：加入一个新元素；

出栈：移除并取得栈顶元素；

查看栈顶：读取栈顶元素但不删除；

判空：判断栈中是否还有元素。

使用 Python 列表时，可以这样对应：

append(value)：入栈；

pop()：出栈；

stack[-1]：查看栈顶；

len(stack) == 0：判断空栈。

[代码 language=python]
stack = []

stack.append(10)
stack.append(20)

print(stack[-1])

removed = stack.pop()

print(removed)
print(len(stack) == 0)
[/代码]

[文本]
stack[-1] 读取最后一个元素，但不会删除它。

pop() 会真正把最后一个元素移出列表。

[标题]
查看栈顶和出栈不是一回事

[文本]
下面程序连续两次查看栈顶：

[代码 language=python]
stack = [10, 20, 30]

print(stack[-1])
print(stack[-1])
print(stack)
[/代码]

[文本]
两次都会输出 30，原栈仍然是 [10, 20, 30]。

因为读取 stack[-1] 并不会修改列表。

如果使用两次 pop()，结果就不同：

第一次取出 30；

第二次取出 20。

[标题]
空栈必须小心处理

[文本]
如果列表为空：

[代码 language=python]
stack = []
[/代码]

[文本]
此时直接执行 stack.pop() 会产生 IndexError。

直接访问 stack[-1] 同样会越界。

因此在不确定栈是否为空时，应先判断：

[代码 language=python]
stack = []

if len(stack) > 0:
    print(stack.pop())
else:
    print("栈为空")
[/代码]

[标题]
栈操作通常只发生在顶部

[文本]
当使用动态数组末尾作为栈顶时，append() 和末尾 pop() 通常都非常高效。

连续执行大量入栈和出栈时，这种实现非常适合基础栈场景。

[示例 title=安全查看栈顶]
说明：只有在栈非空时才访问最后一个元素，避免空栈越界。
语言：python
stack = [5, 8, 13]

if len(stack) > 0:
    top = stack[-1]
    print(top)
else:
    print("栈为空")
[/示例]

[提示 title=查看和删除要分清]
只想看栈顶时使用 stack[-1]；既想得到栈顶又要把它删除时使用 pop()。

[警告 title=不要对空栈直接 pop]
在实际程序里，如果无法保证栈一定有数据，要在出栈前先判空，否则可能发生 IndexError。

### 课时题目

#### 题目 4

题型：SINGLE_CHOICE
题干：使用 Python 列表模拟栈时，哪个表达式可以在不删除元素的情况下查看栈顶？
难度：EASY
分值：10
知识点：栈顶、列表索引
是否用于 Battle：否

选项：
- A. `stack[-1]` [正确]
- B. `stack.clear()`
- C. `stack.pop(0)`
- D. `stack.remove(-1)`

解析：
本课程把列表末尾作为栈顶，`stack[-1]` 可以读取最后一个元素但不会删除它。

#### 题目 5

题型：SINGLE_CHOICE
题干：下面程序运行后会输出什么？

```python
stack = [10, 20, 30]

first = stack.pop()
second = stack[-1]

print(first)
print(second)
```

难度：MEDIUM
分值：10
知识点：栈、pop、栈顶
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：执行流程

选项：
- A. 30 和 20 [正确]
- B. 30 和 30
- C. 20 和 10
- D. 10 和 20

解析：
第一次 pop() 取出 30，栈变为 [10, 20]。此时 stack[-1] 是 20，因此依次输出 30 和 20。

#### 题目 6

题型：CODE_FILL
题干：补全条件，使程序只有在栈非空时才执行出栈。请填写 if 后面的条件表达式。
难度：HARD
分值：10
知识点：栈、判空、边界处理
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码：

```python
stack = [10, 20]

if ____:
    value = stack.pop()
    print(value)
else:
    print("栈为空")
```

可接受答案：

```python
stack = [10, 20]

if len(stack) > 0:
    value = stack.pop()
    print(value)
else:
    print("栈为空")
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
只有当栈中至少有一个元素时才能安全执行 pop()。`len(stack) > 0` 可以明确判断栈非空。

标准完整代码：

```python
stack = [10, 20]

if len(stack) > 0:
    value = stack.pop()
    print(value)
else:
    print("栈为空")
```

---

## 课时 3：栈与“最近一次操作”

课时简介：理解为什么栈特别适合处理撤销、返回和操作历史等“最近发生的事情优先处理”的问题。

预计学习时间：20 分钟

### 正文

[标题]
为什么撤销操作适合栈

[文本]
在文本编辑器中，用户可能依次进行：

输入标题；

修改标题；

删除一段文字。

如果用户点击一次“撤销”，通常应该先撤销最后执行的“删除文字”。

再点击一次撤销，才处理更早的“修改标题”。

这种顺序正好符合：

最后发生的操作，最先被撤销。

也就是后进先出。

[代码 language=python]
actions = []

actions.append("输入标题")
actions.append("修改标题")
actions.append("删除文字")

last_action = actions.pop()

print(last_action)
[/代码]

[文本]
程序输出：

删除文字

这就是使用栈保存操作历史的基本思想。

[标题]
浏览历史中的返回思想

[文本]
很多“返回上一层”的功能也可以借助栈来理解。

例如依次进入：

首页 → 课程列表 → 课程详情 → 章节详情

如果返回一次，应该回到最近访问的“课程详情”。

这种“回到最近一个位置”的模式也具有栈的特点。

[标题]
保存的是历史，不一定是字符串

[文本]
栈中的元素可以是数字、字符串，也可以是表示状态的数据。

例如保存一组旧分数：

[代码 language=python]
score_history = []

current_score = 80

score_history.append(current_score)
current_score = 90

score_history.append(current_score)
current_score = 75

previous_score = score_history.pop()

print(previous_score)
[/代码]

[文本]
这里的关键不是数据类型，而是“最近保存的状态优先恢复”。

[示例 title=模拟两次撤销]
说明：把操作依次压入栈，再连续出栈两次，观察撤销顺序。
语言：python
actions = []

actions.append("输入 A")
actions.append("输入 B")
actions.append("删除 B")

print(actions.pop())
print(actions.pop())
[/示例]

[提示 title=判断是否适合栈的一个问题]
如果问题中经常出现“最近一次”“上一步”“最后加入”“撤销”等词，可以考虑它是否具有后进先出的特点。

[警告 title=不是所有历史记录都只用一个栈]
真实编辑器可能需要更复杂的撤销/重做设计。本课只学习栈在“最近操作优先处理”中的基础思想。

### 课时题目

#### 题目 7

题型：SINGLE_CHOICE
题干：下面哪个场景最符合栈的后进先出特点？
难度：EASY
分值：10
知识点：栈、应用场景、LIFO
是否用于 Battle：否

选项：
- A. 撤销最近一次编辑操作 [正确]
- B. 按报名先后依次叫号
- C. 每次随机选一个用户
- D. 按成绩从高到低排序

解析：
撤销通常先处理最近发生的操作，符合后进先出。按报名顺序叫号更接近先进先出的队列。

#### 题目 8

题型：SINGLE_CHOICE
题干：下面程序运行后依次输出什么？

```python
actions = []

actions.append("打开课程")
actions.append("进入章节")
actions.append("开始测验")

print(actions.pop())
print(actions.pop())
```

难度：MEDIUM
分值：10
知识点：栈、历史记录、执行流程
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：输出预测

选项：
- A. 打开课程、进入章节
- B. 开始测验、进入章节 [正确]
- C. 进入章节、开始测验
- D. 开始测验、打开课程

解析：
最后入栈的是“开始测验”，所以第一次 pop() 取出它。剩余栈顶是“进入章节”，第二次 pop() 取出“进入章节”。

#### 题目 9

题型：SINGLE_CHOICE
题干：一个撤销系统把每次操作都压入栈。操作顺序是 A、B、C、D。用户连续撤销三次，最合理的撤销顺序是什么？
难度：HARD
分值：10
知识点：栈、撤销、LIFO
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：执行流程

选项：
- A. A、B、C
- B. D、C、B [正确]
- C. B、C、D
- D. A、D、B

解析：
栈遵循后进先出。D 最后执行，因此先撤销 D；接着撤销 C；再撤销 B。

---

## 课时 4：括号匹配

课时简介：学习使用栈检查圆括号、方括号和花括号是否正确配对，并理解为什么遇到右括号时要检查最近出现的左括号。

预计学习时间：20 分钟

### 正文

[标题]
括号为什么适合用栈处理

[文本]
考虑下面的括号：

({[]})

最先出现的是左圆括号 `(`，接着是左花括号 `{`，然后是左方括号 `[`。

当遇到第一个右括号 `]` 时，它应该和最近出现、还没有匹配的 `[` 配对。

接下来 `}` 应该和 `{` 配对。

最后 `)` 和 `(` 配对。

也就是说：

最近出现但还没有匹配的左括号，应该最先被处理。

这正是后进先出。

[标题]
遇到左括号就入栈

[文本]
扫描字符串时：

如果遇到 `(`、`[`、`{`，就把它压入栈。

[代码 language=python]
text = "({[]})"
stack = []

for char in text:
    if char in "([{":
        stack.append(char)
[/代码]

[标题]
遇到右括号就检查栈顶

[文本]
右括号必须和当前栈顶的左括号匹配。

可以建立对应关系：

[代码 language=python]
pairs = {
    ")": "(",
    "]": "[",
    "}": "{"
}
[/代码]

[文本]
当遇到右括号时，需要检查两件事：

第一，栈不能是空的；

第二，栈顶必须等于它需要的左括号。

如果不满足，就说明括号不合法。

[代码 language=python]
text = "([])"
stack = []
pairs = {
    ")": "(",
    "]": "[",
    "}": "{"
}

valid = True

for char in text:
    if char in "([{":
        stack.append(char)
    elif char in pairs:
        if len(stack) == 0 or stack[-1] != pairs[char]:
            valid = False
            break
        stack.pop()

if len(stack) != 0:
    valid = False

print(valid)
[/代码]

[文本]
最后还要检查栈是否为空。

如果扫描结束后还有左括号留在栈中，也说明存在没有匹配的括号。

[示例 title=检查一组括号]
说明：使用栈保存未匹配的左括号，遇到右括号时检查最近的左括号。
语言：python
text = "{[()]}"
stack = []
pairs = {
    ")": "(",
    "]": "[",
    "}": "{"
}

valid = True

for char in text:
    if char in "([{":
        stack.append(char)
    elif char in pairs:
        if len(stack) == 0 or stack[-1] != pairs[char]:
            valid = False
            break
        stack.pop()

if len(stack) != 0:
    valid = False

print(valid)
[/示例]

[提示 title=右括号只和最近未匹配的左括号比较]
遇到 `]` 时，不是去整个字符串里随便找一个 `[`，而是必须检查当前栈顶是不是 `[`。

[警告 title=最后非空也算不匹配]
像 `((` 这样的字符串扫描过程中没有遇到错误右括号，但结束时栈里仍有左括号，因此也不是合法匹配。

### 课时题目

#### 题目 10

题型：SINGLE_CHOICE
题干：使用栈检查括号匹配时，遇到左括号通常应该执行什么操作？
难度：EASY
分值：10
知识点：栈、括号匹配、入栈
是否用于 Battle：否

选项：
- A. 入栈 [正确]
- B. 清空整个栈
- C. 删除字符串
- D. 随机移除一个元素

解析：
左括号表示出现了一个尚未匹配的开始符号，因此应把它压入栈，等待后续对应的右括号来匹配。

#### 题目 11

题型：SINGLE_CHOICE
题干：扫描字符串 `([)]` 时，当程序读到字符 `)`，当前栈顶是什么？
难度：MEDIUM
分值：10
知识点：括号匹配、栈顶、执行流程
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：执行流程

选项：
- A. (
- B. [ [正确]
- C. )
- D. 栈为空

解析：
扫描 `(` 时入栈，扫描 `[` 时再次入栈，因此栈为 ['(', '[']。接下来读到 `)` 时，栈顶仍是最近压入的 `[`，它和 `)` 不匹配。

#### 题目 12

题型：CODE_FILL
题干：补全条件表达式，使程序在“栈为空”或“栈顶左括号与当前右括号不匹配”时判定失败。请填写 if 后面的完整条件表达式。
难度：HARD
分值：10
知识点：栈、括号匹配、短路判断、边界处理
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码：

```python
text = "([])"
stack = []
pairs = {
    ")": "(",
    "]": "[",
    "}": "{"
}

valid = True

for char in text:
    if char in "([{":
        stack.append(char)
    elif char in pairs:
        if ____:
            valid = False
            break
        stack.pop()

if len(stack) != 0:
    valid = False

print(valid)
```

可接受答案：

```python
text = "([])"
stack = []
pairs = {
    ")": "(",
    "]": "[",
    "}": "{"
}

valid = True

for char in text:
    if char in "([{":
        stack.append(char)
    elif char in pairs:
        if len(stack) == 0 or stack[-1] != pairs[char]:
            valid = False
            break
        stack.pop()

if len(stack) != 0:
    valid = False

print(valid)
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
右括号到来时，如果栈为空，就没有左括号可匹配；如果栈非空但栈顶不是 pairs[char] 对应的左括号，也说明顺序错误。使用 `or` 可以把这两种失败条件组合起来。

标准完整代码：

```python
text = "([])"
stack = []
pairs = {
    ")": "(",
    "]": "[",
    "}": "{"
}

valid = True

for char in text:
    if char in "([{":
        stack.append(char)
    elif char in pairs:
        if len(stack) == 0 or stack[-1] != pairs[char]:
            valid = False
            break
        stack.pop()

if len(stack) != 0:
    valid = False

print(valid)
```

---

## 课时 5：栈与函数调用思想

课时简介：从“暂时离开当前任务，完成子任务后再返回”的角度理解调用栈思想，不深入解释器底层实现。

预计学习时间：20 分钟

### 正文

[标题]
函数调用为什么需要记住“返回哪里”

[文本]
假设函数 main() 正在执行。

main() 调用了函数 calculate()。

calculate() 又调用了函数 check()。

当 check() 完成以后，程序需要回到 calculate() 原来的位置继续执行。

calculate() 完成以后，还要再回到 main()。

这具有明显的后进先出特点：

最后进入的 check() 最先完成并返回；

然后是 calculate()；

最后回到 main()。

[标题]
用栈模拟调用顺序

[代码 language=python]
call_stack = []

call_stack.append("main")
call_stack.append("calculate")
call_stack.append("check")

print(call_stack.pop())
print(call_stack.pop())
print(call_stack.pop())
[/代码]

[文本]
程序依次输出：

check
calculate
main

这正好表示最后进入的函数先退出。

[标题]
递归也会不断产生新的调用

[文本]
一个函数调用自己时，也会产生新的函数调用层次。

例如：

[代码 language=python]
def countdown(n):
    if n == 0:
        print("结束")
        return

    print(n)
    countdown(n - 1)

countdown(3)
[/代码]

[文本]
可以把调用过程理解为：

countdown(3)
→ countdown(2)
→ countdown(1)
→ countdown(0)

最深层调用先结束，再一层一层返回。

这一章不要求深入解释 Python 解释器内部实现，只需要建立一个重要认识：

函数调用的进入和返回顺序具有栈的特征。

[标题]
为什么无限递归会出问题

[文本]
如果递归函数永远没有结束条件，就会不断产生新的调用层。

调用层数不能无限增加，因此最终会发生错误。

所以递归必须有能够停止的基础情况。

[示例 title=观察递归进入顺序]
说明：递归函数每次把 n 减 1，直到 n 为 0，从而保证调用可以结束。
语言：python
def show(n):
    if n == 0:
        return

    print("进入", n)
    show(n - 1)

show(3)
[/示例]

[提示 title=把函数调用想成“暂存当前任务”]
调用新函数时，当前函数还没有彻底结束；程序需要记住它之后从哪里继续。这种“最近暂停的任务最先恢复”具有栈的特点。

[警告 title=递归必须能到达结束条件]
如果参数变化不能让递归逐渐接近基础情况，函数可能不断调用自己，最终导致递归深度错误。

### 课时题目

#### 题目 13

题型：SINGLE_CHOICE
题干：函数 A 调用 B，B 又调用 C。按照正常返回顺序，哪个函数最先返回？
难度：EASY
分值：10
知识点：调用栈、后进先出
是否用于 Battle：否

选项：
- A. A
- B. B
- C. C [正确]
- D. 三个函数必须同时返回

解析：
C 最后被调用，因此会最先完成并返回，然后回到 B，最后再回到 A。这符合后进先出的栈特征。

#### 题目 14

题型：SINGLE_CHOICE
题干：下面程序依次输出什么？

```python
call_stack = []

call_stack.append("main")
call_stack.append("load")
call_stack.append("parse")

print(call_stack.pop())
print(call_stack.pop())
```

难度：MEDIUM
分值：10
知识点：调用栈、pop、执行流程
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：输出预测

选项：
- A. main、load
- B. parse、load [正确]
- C. load、parse
- D. parse、main

解析：
parse 最后入栈，因此先被 pop()；接着栈顶是 load，所以第二次输出 load。

#### 题目 15

题型：SINGLE_CHOICE
题干：下面递归函数为什么能够结束？

```python
def countdown(n):
    if n == 0:
        return

    countdown(n - 1)

countdown(3)
```

难度：HARD
分值：10
知识点：递归、调用栈、结束条件
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码分析

选项：
- A. 因为每次调用都会让 n 增加
- B. 因为 n 每次减 1，并最终到达 n == 0 的结束条件 [正确]
- C. 因为 Python 会随机停止递归
- D. 因为递归函数最多只能执行一次

解析：
第一次调用 n 为 3，后续依次传入 2、1、0。当 n 到达 0 时满足基础情况并 return，因此不会继续递归调用。

---

## 课时 6：栈综合应用——符号检查器

课时简介：综合使用字符串遍历、条件判断、字典和栈，完成一个能够检查多种括号是否合法配对的小程序。

预计学习时间：20 分钟

### 正文

[标题]
把前面的知识组合起来

[文本]
本章已经学习了：

栈的后进先出；

入栈和出栈；

查看栈顶；

空栈判断；

括号匹配。

现在把这些内容组合起来，完成一个完整的符号检查器。

任务是判断一个字符串中的三种括号：

()
[]
{}

是否按照正确顺序配对。

[标题]
第一步：准备栈和匹配表

[代码 language=python]
stack = []

pairs = {
    ")": "(",
    "]": "[",
    "}": "{"
}
[/代码]

[文本]
pairs 的 key 是右括号，value 是它对应的左括号。

例如：

pairs[")"] 的结果是 "("。

[标题]
第二步：扫描每个字符

[代码 language=python]
text = "func(a[0] + {b})"

stack = []
pairs = {
    ")": "(",
    "]": "[",
    "}": "{"
}

valid = True

for char in text:
    if char in "([{":
        stack.append(char)
    elif char in pairs:
        if len(stack) == 0 or stack[-1] != pairs[char]:
            valid = False
            break

        stack.pop()
[/代码]

[文本]
普通字母、数字和运算符不会进入任何一个括号分支，因此被直接跳过。

只有括号参与匹配。

[标题]
第三步：检查是否还有剩余左括号

[代码 language=python]
if len(stack) != 0:
    valid = False

print(valid)
[/代码]

[文本]
即使扫描过程中没有发现错误，如果最终栈不为空，也表示存在未配对的左括号。

例如：

((a + b)

最后还会剩下一个 `(`。

[标题]
分析复杂度

[文本]
假设字符串长度为 n。

程序从头到尾扫描每个字符一次。

每个括号只进行固定数量的入栈、查看栈顶或出栈操作。

因此整体时间复杂度通常为 O(n)。

最坏情况下，如果字符串包含大量左括号，这些左括号都需要暂存在栈中，所以额外空间可能达到 O(n)。

[示例 title=完整符号检查器]
说明：检查字符串中的圆括号、方括号和花括号是否正确嵌套。
语言：python
text = "{value: [10, 20, (30)]}"

stack = []
pairs = {
    ")": "(",
    "]": "[",
    "}": "{"
}

valid = True

for char in text:
    if char in "([{":
        stack.append(char)
    elif char in pairs:
        if len(stack) == 0 or stack[-1] != pairs[char]:
            valid = False
            break
        stack.pop()

if len(stack) != 0:
    valid = False

print(valid)
[/示例]

[提示 title=综合题要分阶段分析]
先判断遇到的是左括号、右括号还是普通字符，再分别决定入栈、匹配或忽略，不要把所有情况混在一个条件里。

[警告 title=短路判断顺序很重要]
条件 `len(stack) == 0 or stack[-1] != pairs[char]` 先检查空栈。由于 Python 的 or 会短路，当栈为空时不会继续访问 stack[-1]，从而避免越界。

### 课时题目

#### 题目 16

题型：SINGLE_CHOICE
题干：使用栈完成括号匹配时，扫描结束后为什么还要检查栈是否为空？
难度：EASY
分值：10
知识点：括号匹配、空栈、完整性
是否用于 Battle：否

选项：
- A. 为了确认没有剩余未匹配的左括号 [正确]
- B. 为了把所有普通字符加入栈
- C. 为了重新执行整个字符串
- D. 为了把右括号改成左括号

解析：
如果扫描结束后栈中仍有左括号，说明这些左括号没有找到对应的右括号，因此字符串仍然不是合法匹配。

#### 题目 17

题型：SINGLE_CHOICE
题干：设待检查字符串长度为 n。使用本章的栈算法从头到尾扫描一次字符串，整体时间复杂度最符合哪一项？
难度：MEDIUM
分值：10
知识点：栈、括号匹配、时间复杂度
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码分析

选项：
- A. O(1)
- B. O(log n)
- C. O(n) [正确]
- D. O(n²)

解析：
程序对字符串中的每个字符最多处理一次，每次只进行固定数量的判断和栈操作，因此主要操作次数随 n 线性增长，整体时间复杂度为 O(n)。

#### 题目 18

题型：CODE_FILL
题干：补全最后的判断语句，使程序在扫描结束后如果栈中仍有未匹配左括号，就把 valid 设置为 False。请填写完整 if 语句中的条件表达式。
难度：HARD
分值：10
知识点：栈、括号匹配、最终状态、边界检查
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码：

```python
text = "(()"
stack = []
pairs = {
    ")": "(",
    "]": "[",
    "}": "{"
}

valid = True

for char in text:
    if char in "([{":
        stack.append(char)
    elif char in pairs:
        if len(stack) == 0 or stack[-1] != pairs[char]:
            valid = False
            break
        stack.pop()

if ____:
    valid = False

print(valid)
```

可接受答案：

```python
text = "(()"
stack = []
pairs = {
    ")": "(",
    "]": "[",
    "}": "{"
}

valid = True

for char in text:
    if char in "([{":
        stack.append(char)
    elif char in pairs:
        if len(stack) == 0 or stack[-1] != pairs[char]:
            valid = False
            break
        stack.pop()

if len(stack) != 0:
    valid = False

print(valid)
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
字符串 "(()" 扫描结束后仍会有一个左括号留在栈中，因此需要在 `len(stack) != 0` 时把 valid 设为 False。这样才能识别“右括号不足”的情况。

标准完整代码：

```python
text = "(()"
stack = []
pairs = {
    ")": "(",
    "]": "[",
    "}": "{"
}

valid = True

for char in text:
    if char in "([{":
        stack.append(char)
    elif char in pairs:
        if len(stack) == 0 or stack[-1] != pairs[char]:
            valid = False
            break
        stack.pop()

if len(stack) != 0:
    valid = False

print(valid)
```

---
