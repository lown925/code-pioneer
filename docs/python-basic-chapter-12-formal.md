# 课程信息

课程名称：Python 基础入门
课程标识：python-basic
课程分类：BACKEND
编程语言：Python
难度：BEGINNER
预计学习时间：720 分钟
课程简介：面向零基础学习者的 Python 基础课程。课程通过短小的知识讲解、可运行示例、常见错误分析和 Battle 精选题，帮助学习者逐步掌握 Python 基础语法，并具备阅读简单程序、判断运行结果和定位基础错误的能力。
适合人群：没有编程基础、希望从零开始学习 Python，并通过练习和对战巩固知识的学生。
课程封面：
发布状态：PUBLISHED

---

# 第十二章：文件操作与 JSON

章节简介：学习使用 Python 读取、写入和追加文本文件，掌握 with 语句、文件路径和常见文件异常，并使用 JSON 保存和读取结构化数据。
预计学习时间：100 分钟

章节学习目标：
- 理解文件用于持久保存数据
- 能使用 open() 打开文件
- 能区分 r、w、a 等常用文件模式
- 能使用 read()、readline() 和 readlines() 读取文本
- 能使用 write() 和 writelines() 写入内容
- 能使用 with 自动管理文件关闭
- 能正确指定 UTF-8 编码
- 能理解相对路径和绝对路径的基础区别
- 能处理 FileNotFoundError
- 能理解 JSON 与 Python 字典、列表的关系
- 能使用 json.dump() 和 json.load()
- 能使用 json.dumps() 和 json.loads()
- 能完成简单的学习记录持久化

---

## 课时 1：认识文件与 open()

课时简介：理解文件为什么能够长期保存数据，并学习打开与关闭文件。
预计学习时间：15 分钟

### 正文

[标题]
变量中的数据不会永久保存

[文本]
程序运行时，变量可以保存昵称、学习进度和 Battle 分数。

但是程序结束后，普通变量中的数据通常会消失。

如果希望下次运行程序时仍然能够读取这些数据，就需要把数据保存到文件或数据库中。

[代码 language=python]
nickname = "新手玩家"
progress = 60
[/代码]

[文本]
上面的数据只存在于当前程序运行过程中。把它们写入文件后，程序关闭再启动时仍然可以读取。

[标题]
使用 open() 打开文件

[代码 language=python]
file = open("message.txt", "r", encoding="utf-8")
[/代码]

[文本]
open() 常见参数包括：

- 第一个参数：文件路径
- 第二个参数：打开模式
- encoding：文本编码

"r" 表示读取模式。

encoding="utf-8" 可以正确处理中文等 Unicode 文本。

[标题]
使用 close() 关闭文件

[代码 language=python]
file = open("message.txt", "r", encoding="utf-8")
content = file.read()
file.close()

print(content)
[/代码]

[文本]
文件使用完成后应关闭，避免资源长期占用。

后续会学习更推荐的 with 写法，它可以自动关闭文件。

[标题]
常见打开模式

[文本]
常用文本文件模式包括：

- r：读取
- w：写入并覆盖原内容
- a：追加到文件末尾
- x：创建新文件；文件已存在时失败

[示例 title=读取课程说明]
说明：打开 course-note.txt，读取全部内容后关闭文件。
语言：python

file = open("course-note.txt", "r", encoding="utf-8")
content = file.read()
file.close()

print(content)
[/示例]

[警告 title=读取模式要求文件已存在]
使用 r 模式打开不存在的文件时，会产生 FileNotFoundError。

[提示 title=文本文件优先明确指定 UTF-8]
在不同操作系统上运行时，明确写 encoding="utf-8" 可以减少中文乱码问题。

### 课时题目

#### 题目 1

题型：SINGLE_CHOICE
题干：下面哪个函数用于打开文件？

难度：EASY
分值：10
知识点：open、文件基础
是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：代码用途

选项：
- A. open() [正确]
- B. read()
- C. write()
- D. close()

解析：
open() 用于打开文件并返回文件对象。read() 和 write() 需要通过文件对象调用，close() 用于关闭文件。

#### 题目 2

题型：FILL_BLANK
题干：以只读方式打开文本文件时，常用的文件模式是 ______。

难度：EASY
分值：10
知识点：文件模式、r
是否用于 Battle：否

可接受答案：
- r
- "r"
- 'r'
- 读取模式

判题设置：
- 忽略大小写：是
- 忽略首尾空格：是
- 合并连续空格：是
- 最长字符数：20

解析：
r 表示 read，也就是读取模式。使用该模式时，文件通常必须已经存在。

#### 题目 3

题型：CODE_FILL
题干：程序需要以只读模式打开 learning.txt，并正确读取中文。请补全 open() 的参数。

难度：EASY
分值：10
知识点：open、r、UTF-8
是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：代码填空

题目代码：
```python
file = open("learning.txt", ______, encoding="utf-8")
content = file.read()
file.close()

print(content)
```

可接受答案：
```python
"r"
```

```python
'r'
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
读取现有文本文件应使用 r 模式，因此第二个参数应填写 "r" 或 'r'。

标准完整代码：
```python
file = open("learning.txt", "r", encoding="utf-8")
content = file.read()
file.close()

print(content)
```

---

## 课时 2：读取文本文件

课时简介：学习 read()、readline()、readlines() 和文件遍历。
预计学习时间：17 分钟

### 正文

[标题]
read() 读取全部内容

[代码 language=python]
with open("message.txt", "r", encoding="utf-8") as file:
    content = file.read()

print(content)
[/代码]

[文本]
read() 会从当前位置读取文件内容。未传参数时，通常读取到文件末尾。

如果文件很大，一次读取全部内容可能占用较多内存。

[标题]
readline() 每次读取一行

[代码 language=python]
with open("message.txt", "r", encoding="utf-8") as file:
    first_line = file.readline()
    second_line = file.readline()

print(first_line)
print(second_line)
[/代码]

[文本]
readline() 每次读取一行，通常会保留行末换行符。

[标题]
readlines() 读取为字符串列表

[代码 language=python]
with open("message.txt", "r", encoding="utf-8") as file:
    lines = file.readlines()

print(lines)
[/代码]

[文本]
readlines() 会返回列表，其中每个元素对应文件中的一行。

[标题]
直接遍历文件对象

[代码 language=python]
with open("message.txt", "r", encoding="utf-8") as file:
    for line in file:
        print(line.strip())
[/代码]

[文本]
逐行遍历通常更适合较大文本文件。

strip() 可以去除行首和行尾的空白，包括换行符。

[示例 title=逐行读取课程章节]
说明：读取 chapters.txt 中的每一行并编号输出。
语言：python

with open("chapters.txt", "r", encoding="utf-8") as file:
    chapter_number = 1

    for line in file:
        chapter_name = line.strip()

        if chapter_name:
            print(f"第 {chapter_number} 章：{chapter_name}")
            chapter_number += 1
[/示例]

[警告 title=文件指针会移动]
读取过一次后，文件当前位置会移动。再次调用 read() 可能只得到剩余内容，甚至得到空字符串。

### 课时题目

#### 题目 4

题型：SINGLE_CHOICE
题干：下面哪个方法会一次读取文件剩余的全部文本内容？

难度：EASY
分值：10
知识点：read、文件读取
是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：代码用途

选项：
- A. read() [正确]
- B. write()
- C. append()
- D. close()

解析：
read() 用于读取文件内容。未传参数时，通常从当前位置读取到文件末尾。

#### 题目 5

题型：FILL_BLANK
题干：每次读取文件一行内容的方法是 ______。

难度：EASY
分值：10
知识点：readline、逐行读取
是否用于 Battle：否

可接受答案：
- readline
- readline()

判题设置：
- 忽略大小写：否
- 忽略首尾空格：是
- 合并连续空格：是
- 最长字符数：30

解析：
readline() 每次读取一行。readlines() 则把多行读取为列表。

#### 题目 6

题型：CODE_FILL
题干：程序需要读取文件中的全部行，并把结果保存为列表。请补全方法调用。

难度：MEDIUM
分值：10
知识点：readlines、列表、文件读取
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码填空

题目代码：
```python
with open("chapters.txt", "r", encoding="utf-8") as file:
    lines = file.__________

print(lines)
```

可接受答案：
```python
readlines()
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
readlines() 会读取文件中的多行内容，并返回字符串列表。

标准完整代码：
```python
with open("chapters.txt", "r", encoding="utf-8") as file:
    lines = file.readlines()

print(lines)
```

---

## 课时 3：写入与追加文本

课时简介：学习 write()、writelines()、w 模式和 a 模式。
预计学习时间：18 分钟

### 正文

[标题]
w 模式会写入并覆盖原内容

[代码 language=python]
with open("progress.txt", "w", encoding="utf-8") as file:
    file.write("Python 学习进度：60%")
[/代码]

[文本]
如果 progress.txt 不存在，w 模式通常会创建它。

如果文件已经存在，w 模式会先清空原有内容，再写入新内容。

[标题]
write() 不会自动添加换行

[代码 language=python]
with open("result.txt", "w", encoding="utf-8") as file:
    file.write("正确：8\n")
    file.write("错误：2\n")
[/代码]

[文本]
需要换行时，应在字符串中写 \n。

[标题]
a 模式追加内容

[代码 language=python]
with open("history.txt", "a", encoding="utf-8") as file:
    file.write("完成 Python 第十二章\n")
[/代码]

[文本]
a 模式会把内容追加到文件末尾，不会清空原内容。

[标题]
writelines() 写入多个字符串

[代码 language=python]
lines = [
    "Python\n",
    "Git\n",
    "MySQL\n"
]

with open("courses.txt", "w", encoding="utf-8") as file:
    file.writelines(lines)
[/代码]

[文本]
writelines() 不会自动在元素之间添加换行，因此列表元素本身需要包含 \n。

[示例 title=追加学习历史]
说明：每完成一章就追加一行记录。
语言：python

record = "已完成：文件操作与 JSON\n"

with open("learning-history.txt", "a", encoding="utf-8") as file:
    file.write(record)
[/示例]

[警告 title=w 模式可能造成数据丢失]
需要保留历史内容时，不要误用 w 模式。应根据需求选择 a 模式或先读取旧数据再重新写入。

### 课时题目

#### 题目 7

题型：SINGLE_CHOICE
题干：需要在文件末尾增加一条学习记录，并保留原内容，应该使用哪种模式？

难度：EASY
分值：10
知识点：a、文件追加
是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：代码用途

选项：
- A. r
- B. w
- C. a [正确]
- D. x

解析：
a 表示追加模式，会在文件末尾写入新内容，并保留原有内容。

#### 题目 8

题型：FILL_BLANK
题干：以覆盖方式写入文本文件时，常用模式是 ______。

难度：EASY
分值：10
知识点：w、覆盖写入
是否用于 Battle：否

可接受答案：
- w
- "w"
- 'w'
- 写入模式

判题设置：
- 忽略大小写：是
- 忽略首尾空格：是
- 合并连续空格：是
- 最长字符数：20

解析：
w 表示写入模式。文件存在时，原有内容通常会被清空。

#### 题目 9

题型：CODE_FILL
题干：程序需要把新的 Battle 结果追加到 history.txt 末尾。请补全文件模式。

难度：MEDIUM
分值：10
知识点：a、write、历史记录
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码填空

题目代码：
```python
result = "胜利，得分 14\n"

with open("history.txt", ______, encoding="utf-8") as file:
    file.write(result)
```

可接受答案：
```python
"a"
```

```python
'a'
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
需要保留原历史并在末尾追加新记录，因此应使用 a 模式。

标准完整代码：
```python
result = "胜利，得分 14\n"

with open("history.txt", "a", encoding="utf-8") as file:
    file.write(result)
```

---

## 课时 4：with、路径与文件异常

课时简介：学习自动关闭文件、理解基础路径，并处理文件不存在异常。
预计学习时间：18 分钟

### 正文

[标题]
with 会自动关闭文件

[代码 language=python]
with open("message.txt", "r", encoding="utf-8") as file:
    content = file.read()

print(content)
[/代码]

[文本]
离开 with 代码块后，文件会自动关闭。

这种写法比手动调用 close() 更安全，也更推荐。

[标题]
相对路径

[代码 language=python]
with open("data/player.json", "r", encoding="utf-8") as file:
    content = file.read()
[/代码]

[文本]
相对路径通常以当前工作目录为基础。

如果程序从不同目录启动，相对路径的实际位置可能发生变化。

[标题]
绝对路径

[文本]
绝对路径从磁盘或系统根目录开始，明确指向完整位置。

绝对路径不便于跨电脑和跨操作系统迁移，因此项目中通常更推荐基于项目目录构造路径。

[标题]
处理文件不存在

[代码 language=python]
try:
    with open("settings.txt", "r", encoding="utf-8") as file:
        content = file.read()
except FileNotFoundError:
    print("配置文件不存在")
[/代码]

[文本]
使用 r 模式读取不存在的文件时，会产生 FileNotFoundError。

[标题]
使用 pathlib 构造路径

[代码 language=python]
from pathlib import Path

data_file = Path("data") / "player.json"

print(data_file)
[/代码]

[文本]
Path 可以更清晰地拼接路径，并提升跨平台可读性。

[示例 title=安全读取学习记录]
说明：文件不存在时给出可理解提示。
语言：python

from pathlib import Path

record_file = Path("data") / "learning-record.txt"

try:
    with record_file.open("r", encoding="utf-8") as file:
        content = file.read()
except FileNotFoundError:
    print("暂无学习记录")
else:
    print(content)
[/示例]

[警告 title=不要把路径字符串直接交给用户修改]
真实项目需要校验路径来源，避免读取或覆盖不应该访问的文件。

### 课时题目

#### 题目 10

题型：SINGLE_CHOICE
题干：使用 with 打开文件的主要优点是什么？

难度：EASY
分值：10
知识点：with、自动关闭文件
是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：代码用途

选项：
- A. 离开代码块后自动关闭文件 [正确]
- B. 自动把文本转换为整数
- C. 自动创建数据库
- D. 自动修复所有文件错误

解析：
with 会在离开代码块时自动管理文件关闭，即使过程中发生异常也更安全。

#### 题目 11

题型：FILL_BLANK
题干：读取不存在的文件时，常见异常类型是 ______。

难度：EASY
分值：10
知识点：FileNotFoundError、文件异常
是否用于 Battle：否

可接受答案：
- FileNotFoundError
- file not found error
- 文件不存在异常

判题设置：
- 忽略大小写：是
- 忽略首尾空格：是
- 合并连续空格：是
- 最长字符数：40

解析：
使用读取模式打开不存在的文件时，通常会产生 FileNotFoundError。

#### 题目 12

题型：CODE_FILL
题干：程序需要在文件不存在时输出“暂无记录”。请补全异常类型。

难度：MEDIUM
分值：10
知识点：FileNotFoundError、try except、文件读取
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码填空

题目代码：
```python
try:
    with open("history.txt", "r", encoding="utf-8") as file:
        content = file.read()
except __________________:
    print("暂无记录")
```

可接受答案：
```python
FileNotFoundError
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
文件不存在时会产生 FileNotFoundError，因此应捕获该异常并显示友好提示。

标准完整代码：
```python
try:
    with open("history.txt", "r", encoding="utf-8") as file:
        content = file.read()
except FileNotFoundError:
    print("暂无记录")
```

---

## 课时 5：认识 JSON 与字符串转换

课时简介：学习 JSON 基础，并使用 dumps() 和 loads() 在 Python 对象与 JSON 字符串之间转换。
预计学习时间：18 分钟

### 正文

[标题]
JSON 用于保存结构化数据

[文本]
纯文本适合保存简单内容。

当数据包含昵称、Rating、课程和进度等多个字段时，JSON 更适合表达结构。

JSON 示例：

[代码 language=json]
{
  "nickname": "新手玩家",
  "rating": 1000,
  "courses": ["Python", "Git"],
  "online": true
}
[/代码]

[文本]
JSON 与 Python 字典和列表看起来相似，但它是一种独立的数据格式。

常见对应关系：

- JSON object 对应 Python dict
- JSON array 对应 Python list
- JSON string 对应 Python str
- JSON number 对应 Python int 或 float
- JSON true / false 对应 Python True / False
- JSON null 对应 Python None

[标题]
使用 json.dumps() 转成 JSON 字符串

[代码 language=python]
import json

player = {
    "nickname": "新手玩家",
    "rating": 1000
}

json_text = json.dumps(
    player,
    ensure_ascii=False,
    indent=2
)

print(json_text)
[/代码]

[文本]
ensure_ascii=False 可以让中文直接显示，而不是转成 Unicode 转义序列。

indent=2 可以让输出格式更易读。

[标题]
使用 json.loads() 解析 JSON 字符串

[代码 language=python]
import json

json_text = '{"nickname": "新手玩家", "rating": 1000}'
player = json.loads(json_text)

print(player["nickname"])
[/代码]

[文本]
loads() 中的 s 可以理解为 string，表示处理 JSON 字符串。

[示例 title=转换课程信息]
说明：把课程字典转换成格式化 JSON 文本。
语言：python

import json

course = {
    "name": "Python 基础入门",
    "progress": 60,
    "completed": False
}

json_text = json.dumps(
    course,
    ensure_ascii=False,
    indent=2
)

print(json_text)
[/示例]

[警告 title=JSON 字符串格式必须合法]
JSON 属性名和字符串通常使用双引号。缺少逗号、括号或引号时，json.loads() 会解析失败。

### 课时题目

#### 题目 13

题型：SINGLE_CHOICE
题干：哪个函数可以把 Python 字典转换为 JSON 字符串？

难度：EASY
分值：10
知识点：json.dumps、JSON 字符串
是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：代码用途

选项：
- A. json.dumps() [正确]
- B. json.loads()
- C. json.load()
- D. file.read()

解析：
json.dumps() 把 Python 对象转换为 JSON 字符串。json.loads() 则把 JSON 字符串解析为 Python 对象。

#### 题目 14

题型：FILL_BLANK
题干：把 JSON 字符串解析为 Python 对象时，应使用 ______。

难度：EASY
分值：10
知识点：json.loads、JSON 解析
是否用于 Battle：否

可接受答案：
- json.loads
- json.loads()
- loads
- loads()

判题设置：
- 忽略大小写：否
- 忽略首尾空格：是
- 合并连续空格：是
- 最长字符数：30

解析：
json.loads(json_text) 用于解析 JSON 字符串，并返回对应的 Python 对象。

#### 题目 15

题型：CODE_FILL
题干：程序需要把 player 字典转换为可读的中文 JSON 字符串。请补全函数名。

难度：MEDIUM
分值：10
知识点：json.dumps、ensure_ascii、indent
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码填空

题目代码：
```python
import json

player = {
    "nickname": "新手玩家",
    "rating": 1000
}

json_text = json.________(
    player,
    ensure_ascii=False,
    indent=2
)

print(json_text)
```

可接受答案：
```python
dumps
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
json.dumps() 用于把 Python 对象转换为 JSON 字符串。ensure_ascii=False 保留中文，indent=2 提升可读性。

标准完整代码：
```python
import json

player = {
    "nickname": "新手玩家",
    "rating": 1000
}

json_text = json.dumps(
    player,
    ensure_ascii=False,
    indent=2
)

print(json_text)
```

---

## 课时 6：使用 JSON 文件保存结构化数据

课时简介：学习 json.dump()、json.load()，并完成数据持久化。
预计学习时间：17 分钟

### 正文

[标题]
json.dump() 把数据写入文件

[代码 language=python]
import json

player = {
    "nickname": "新手玩家",
    "rating": 1000
}

with open("player.json", "w", encoding="utf-8") as file:
    json.dump(
        player,
        file,
        ensure_ascii=False,
        indent=2
    )
[/代码]

[文本]
dump() 直接把 Python 对象序列化并写入文件。

它与 dumps() 的区别：

- dump()：写入文件对象
- dumps()：返回字符串

[标题]
json.load() 从文件读取数据

[代码 language=python]
import json

with open("player.json", "r", encoding="utf-8") as file:
    player = json.load(file)

print(player["nickname"])
print(player["rating"])
[/代码]

[文本]
load() 会读取 JSON 文件，并返回 Python 字典、列表等对象。

它与 loads() 的区别：

- load()：读取文件对象
- loads()：解析字符串

[标题]
更新 JSON 数据

[代码 language=python]
import json

with open("player.json", "r", encoding="utf-8") as file:
    player = json.load(file)

player["rating"] += 25

with open("player.json", "w", encoding="utf-8") as file:
    json.dump(
        player,
        file,
        ensure_ascii=False,
        indent=2
    )
[/代码]

[文本]
常见更新流程是：

1. 读取文件
2. 修改 Python 对象
3. 重新写回文件

[标题]
处理文件不存在和 JSON 格式错误

[代码 language=python]
import json

try:
    with open("player.json", "r", encoding="utf-8") as file:
        player = json.load(file)
except FileNotFoundError:
    player = {
        "nickname": "新手玩家",
        "rating": 1000
    }
except json.JSONDecodeError:
    print("JSON 文件格式错误")
[/代码]

[示例 title=保存学习记录]
说明：把课程进度写入 learning-record.json。
语言：python

import json

learning_record = {
    "course": "Python 基础入门",
    "chapter": 12,
    "progress": 80,
    "completed": False
}

with open(
    "learning-record.json",
    "w",
    encoding="utf-8"
) as file:
    json.dump(
        learning_record,
        file,
        ensure_ascii=False,
        indent=2
    )
[/示例]

[警告 title=JSON 文件不适合多人并发数据库场景]
JSON 文件适合学习、小工具和本地配置。真实多人平台通常需要数据库处理并发、查询、权限和一致性。

### 课时题目

#### 题目 16

题型：SINGLE_CHOICE
题干：下面哪个函数用于从已经打开的 JSON 文件对象中读取数据？

难度：EASY
分值：10
知识点：json.load、JSON 文件
是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：代码用途

选项：
- A. json.load() [正确]
- B. json.loads()
- C. json.dumps()
- D. file.write()

解析：
json.load(file) 从文件对象读取 JSON 并转换为 Python 对象。json.loads() 处理的是字符串。

#### 题目 17

题型：FILL_BLANK
题干：把 Python 对象直接写入 JSON 文件时，应使用函数 ______。

难度：EASY
分值：10
知识点：json.dump、JSON 写入
是否用于 Battle：否

可接受答案：
- json.dump
- json.dump()
- dump
- dump()

判题设置：
- 忽略大小写：否
- 忽略首尾空格：是
- 合并连续空格：是
- 最长字符数：30

解析：
json.dump(data, file) 会把 Python 对象序列化并写入打开的文件对象。

#### 题目 18

题型：CODE_FILL
题干：程序需要从 player.json 中读取玩家数据。请补全 JSON 读取函数。

难度：MEDIUM
分值：10
知识点：json.load、with、JSON 文件
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码填空

题目代码：
```python
import json

with open("player.json", "r", encoding="utf-8") as file:
    player = json.________(file)

print(player["nickname"])
```

可接受答案：
```python
load
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
从文件对象读取 JSON 时，应使用 json.load(file)。

标准完整代码：
```python
import json

with open("player.json", "r", encoding="utf-8") as file:
    player = json.load(file)

print(player["nickname"])
```

---

## 第十二章总结

[标题]
你已经能够把程序数据保存下来

[文本]
本章学习了：

- 理解文件持久化的作用
- 使用 open() 打开文件
- 使用 r 模式读取文件
- 使用 w 模式覆盖写入
- 使用 a 模式追加内容
- 使用 read() 读取全部文本
- 使用 readline() 读取一行
- 使用 readlines() 读取多行列表
- 直接遍历文件对象
- 使用 write() 写入字符串
- 使用 writelines() 写入多个字符串
- 使用 with 自动关闭文件
- 理解相对路径和绝对路径
- 使用 pathlib.Path 构造路径
- 捕获 FileNotFoundError
- 理解 JSON 与字典、列表之间的对应关系
- 使用 json.dumps() 生成 JSON 字符串
- 使用 json.loads() 解析 JSON 字符串
- 使用 json.dump() 写入 JSON 文件
- 使用 json.load() 读取 JSON 文件
- 捕获 json.JSONDecodeError
- 理解 JSON 文件与真实数据库的适用边界

下一章将学习异常处理，包括 try、except、else、finally 和 raise，让程序能够更可靠地处理错误。

---

## 第十二章综合挑战（不计分）

[标题]
制作本地学习记录管理器

[文本]
请编写一个程序，把 Python 学习记录保存到 JSON 文件中。

要求：

1. 文件名为 learning-record.json
2. 文件不存在时创建默认记录
3. 文件存在时读取已有记录
4. 用户可以输入新的章节编号和学习进度
5. 章节编号和进度必须转换为整数
6. 进度必须在 0 到 100 之间
7. 更新后重新写入 JSON 文件
8. 中文内容不能转成 Unicode 转义序列
9. JSON 文件使用 2 个空格缩进
10. 最后输出保存后的学习记录

参考代码：

[代码 language=python]
import json
from pathlib import Path

record_file = Path("learning-record.json")

default_record = {
    "course": "Python 基础入门",
    "chapter": 1,
    "progress": 0,
    "completed": False
}

try:
    with record_file.open(
        "r",
        encoding="utf-8"
    ) as file:
        learning_record = json.load(file)
except FileNotFoundError:
    learning_record = default_record.copy()
except json.JSONDecodeError:
    print("学习记录文件格式错误，使用默认记录")
    learning_record = default_record.copy()

try:
    chapter = int(input("请输入当前章节："))
    progress = int(input("请输入学习进度："))
except ValueError:
    print("章节和进度必须是整数")
else:
    if progress < 0 or progress > 100:
        print("学习进度必须在 0 到 100 之间")
    else:
        learning_record["chapter"] = chapter
        learning_record["progress"] = progress
        learning_record["completed"] = progress == 100

        with record_file.open(
            "w",
            encoding="utf-8"
        ) as file:
            json.dump(
                learning_record,
                file,
                ensure_ascii=False,
                indent=2
            )

        print("学习记录保存成功")
        print(
            json.dumps(
                learning_record,
                ensure_ascii=False,
                indent=2
            )
        )
[/代码]

[文本]
尝试删除 learning-record.json 后重新运行程序，观察默认记录如何创建。也可以手动破坏 JSON 格式，观察 json.JSONDecodeError 的处理结果。
