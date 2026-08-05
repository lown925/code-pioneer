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

# 第九章：字典与集合

章节简介：学习使用字典保存键值对数据，使用集合完成去重、成员判断和集合运算，并能够处理用户资料、课程信息、题目标签和对战数据。
预计学习时间：95 分钟

章节学习目标：
- 能创建字典并读取指定键对应的值
- 能新增、修改和删除字典中的键值对
- 能使用 get() 安全读取可能不存在的键
- 能使用 keys()、values() 和 items() 遍历字典
- 能创建集合并理解元素唯一性
- 能使用 add()、remove()、discard() 管理集合元素
- 能使用 in 和 not in 完成成员判断
- 能理解并使用交集、并集和差集
- 能根据业务场景选择字典或集合
- 能阅读字典与集合代码并判断运行结果

---

## 课时 1：认识字典与键值对

课时简介：学习使用字典保存具有明确名称的数据。
预计学习时间：15 分钟

### 正文

[标题]
字典用于保存“名称与数据”的对应关系

[文本]
列表适合保存一组有顺序的数据，但如果需要保存玩家昵称、Rating、等级等不同含义的信息，仅靠索引不容易理解。

[代码 language=python]
player = ["新手玩家", 1000, 8]
[/代码]

[文本]
看到 player[1] 时，很难立刻知道 1000 表示什么。

字典使用“键”和“值”保存数据。键描述数据含义，值保存具体内容。

[代码 language=python]
player = {
    "nickname": "新手玩家",
    "rating": 1000,
    "level": 8
}
[/代码]

[文本]
nickname、rating 和 level 是键；“新手玩家”、1000 和 8 是对应的值。

[标题]
使用键读取数据

[代码 language=python]
player = {
    "nickname": "新手玩家",
    "rating": 1000
}

print(player["nickname"])
print(player["rating"])
[/代码]

[文本]
字典通过键读取对应的值。player["nickname"] 得到“新手玩家”，player["rating"] 得到 1000。

[标题]
字典使用花括号创建

[文本]
字典使用英文花括号 {} 创建，每一项写成“键: 值”，多项之间使用英文逗号分隔。

[示例 title=保存课程信息]
说明：使用字典保存课程名称、章节数量和发布状态。
语言：python

course = {
    "name": "Python 基础入门",
    "chapter_count": 15,
    "published": True
}

print(course["name"])
print(course["chapter_count"])
[/示例]

[提示 title=键应准确描述数据含义]
相比使用 "a"、"b" 作为键，使用 "nickname"、"rating"、"chapter_count" 更容易理解。

[警告 title=读取不存在的键会报错]
如果字典中没有 "score" 键，直接使用 player["score"] 会产生 KeyError。后面会学习使用 get() 安全读取。

### 课时题目

#### 题目 1

题型：SINGLE_CHOICE
题干：下面程序会输出什么？

```python
player = {
    "nickname": "新手玩家",
    "rating": 1000
}

print(player["rating"])
```

难度：EASY
分值：10
知识点：字典、键值对、读取数据
是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：输出预测

选项：
- A. nickname
- B. rating
- C. 1000 [正确]
- D. 新手玩家

解析：
player["rating"] 会读取键 rating 对应的值 1000，因此程序输出 1000。

#### 题目 2

题型：FILL_BLANK
题干：Python 字典保存的是“______”与“值”的对应关系。

难度：EASY
分值：10
知识点：字典、键值对
是否用于 Battle：否

可接受答案：
- 键
- key
- Key

判题设置：
- 忽略大小写：是
- 忽略首尾空格：是
- 合并连续空格：是
- 最长字符数：20

解析：
字典中的每一项由键和值组成。键用于描述或定位数据，值保存具体内容。

#### 题目 3

题型：CODE_FILL
题干：课程信息字典中保存了课程名称和章节数量。请补全代码，输出课程名称。

难度：EASY
分值：10
知识点：字典、键读取
是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：代码填空

题目代码：
```python
course = {
    "name": "Python 基础入门",
    "chapter_count": 15
}

print(course[________])
```

可接受答案：
```python
"name"
```

```python
'name'
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
课程名称保存在键 "name" 对应的值中，因此应使用 course["name"] 读取。

标准完整代码：
```python
course = {
    "name": "Python 基础入门",
    "chapter_count": 15
}

print(course["name"])
```

---

## 课时 2：新增、修改与删除键值对

课时简介：学习更新字典内容并删除不再需要的数据。
预计学习时间：16 分钟

### 正文

[标题]
给不存在的键赋值会新增数据

[代码 language=python]
player = {
    "nickname": "新手玩家",
    "rating": 1000
}

player["level"] = 8

print(player)
[/代码]

[文本]
原字典中没有 level 键，因此 player["level"] = 8 会新增一个键值对。

[标题]
给已有的键赋值会修改数据

[代码 language=python]
player = {
    "nickname": "新手玩家",
    "rating": 1000
}

player["rating"] = 1030

print(player["rating"])
[/代码]

[文本]
原字典中已经存在 rating 键，因此新赋值会把旧值 1000 更新为 1030。

[标题]
使用 del 删除键值对

[代码 language=python]
player = {
    "nickname": "新手玩家",
    "rating": 1000,
    "temporary_status": "测试中"
}

del player["temporary_status"]

print(player)
[/代码]

[标题]
使用 pop() 删除并取得值

[代码 language=python]
player = {
    "nickname": "新手玩家",
    "rating": 1000
}

removed_rating = player.pop("rating")

print(removed_rating)
print(player)
[/代码]

[文本]
pop("rating") 会删除 rating 键，并返回它原来的值 1000。

[示例 title=更新课程进度]
说明：新增 progress 键，再把进度从 20 修改为 40。
语言：python

learning_record = {
    "course": "Python 基础入门"
}

learning_record["progress"] = 20
learning_record["progress"] = 40

print(learning_record)
[/示例]

[警告 title=删除不存在的键可能报错]
del dictionary["missing"] 和 dictionary.pop("missing") 默认都会报错。使用 pop("missing", 默认值) 可以避免该问题。

### 课时题目

#### 题目 4

题型：SINGLE_CHOICE
题干：下面程序执行后，player["rating"] 的值是什么？

```python
player = {
    "nickname": "新手玩家",
    "rating": 1000
}

player["rating"] = 1050
```

难度：EASY
分值：10
知识点：字典修改、赋值
是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：代码阅读

选项：
- A. 1000
- B. 1050 [正确]
- C. rating
- D. 程序报错

解析：
rating 键原本已经存在，重新赋值会把旧值 1000 修改为 1050。

#### 题目 5

题型：FILL_BLANK
题干：Python 中，可以使用关键字 ______ 删除字典中的指定键值对。

难度：EASY
分值：10
知识点：del、字典删除
是否用于 Battle：否

可接受答案：
- del

判题设置：
- 忽略大小写：否
- 忽略首尾空格：是
- 合并连续空格：是
- 最长字符数：20

解析：
del dictionary[key] 可以删除指定键以及它对应的值。

#### 题目 6

题型：CODE_FILL
题干：课程记录中暂时缺少学习进度。请补全代码，新增 progress 键并保存数值 60。

难度：MEDIUM
分值：10
知识点：字典新增、赋值
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码填空

题目代码：
```python
learning_record = {
    "course": "Python 基础入门"
}

learning_record[________] = 60

print(learning_record)
```

可接受答案：
```python
"progress"
```

```python
'progress'
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
原字典中没有 progress 键，给 learning_record["progress"] 赋值会新增该键值对。

标准完整代码：
```python
learning_record = {
    "course": "Python 基础入门"
}

learning_record["progress"] = 60

print(learning_record)
```

---

## 课时 3：使用 get() 安全读取

课时简介：学习在键可能不存在时避免程序报错。
预计学习时间：14 分钟

### 正文

[标题]
直接读取不存在的键会报错

[代码 language=python]
player = {
    "nickname": "新手玩家"
}

print(player["rating"])
[/代码]

[文本]
因为字典中没有 rating 键，程序会产生 KeyError。

[标题]
get() 在键不存在时返回默认结果

[代码 language=python]
player = {
    "nickname": "新手玩家"
}

rating = player.get("rating")
print(rating)
[/代码]

[文本]
键不存在时，get() 默认返回 None，而不会直接报错。

[标题]
为 get() 设置默认值

[代码 language=python]
player = {
    "nickname": "新手玩家"
}

rating = player.get("rating", 1000)
print(rating)
[/代码]

[文本]
当 rating 键不存在时，get("rating", 1000) 会返回默认值 1000。

如果键存在，get() 会返回字典中真实保存的值，而不是默认值。

[示例 title=读取帖子点赞数]
说明：旧数据可能没有 like_count 键，默认按 0 处理。
语言：python

post = {
    "title": "如何学习 Python"
}

like_count = post.get("like_count", 0)

print(like_count)
[/示例]

[提示 title=get() 适合处理不完整数据]
读取接口数据、配置项或旧数据时，get() 可以减少因缺少字段产生的错误。

### 课时题目

#### 题目 7

题型：SINGLE_CHOICE
题干：下面程序会输出什么？

```python
player = {
    "nickname": "新手玩家"
}

rating = player.get("rating", 1000)
print(rating)
```

难度：EASY
分值：10
知识点：get、默认值、安全读取
是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：输出预测

选项：
- A. None
- B. 0
- C. 1000 [正确]
- D. 程序报错

解析：
字典中不存在 rating 键，因此 get("rating", 1000) 返回默认值 1000。

#### 题目 8

题型：FILL_BLANK
题干：字典中用于安全读取键，并可设置默认值的方法是 ______。

难度：EASY
分值：10
知识点：get、字典方法
是否用于 Battle：否

可接受答案：
- get
- get()

判题设置：
- 忽略大小写：否
- 忽略首尾空格：是
- 合并连续空格：是
- 最长字符数：20

解析：
dictionary.get(key, default) 可以读取键；键不存在时返回默认值，而不是产生 KeyError。

#### 题目 9

题型：CODE_FILL
题干：旧帖子数据可能没有收藏数。请补全代码，在 favorite_count 不存在时返回 0。

难度：MEDIUM
分值：10
知识点：get、默认值、字典
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码填空

题目代码：
```python
post = {
    "title": "Python 学习记录"
}

favorite_count = post.get(_________________)
print(favorite_count)
```

可接受答案：
```python
"favorite_count", 0
```

```python
'favorite_count', 0
```

```python
"favorite_count",0
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
get() 的第一个参数是键，第二个参数是键不存在时使用的默认值，因此应写 post.get("favorite_count", 0)。

标准完整代码：
```python
post = {
    "title": "Python 学习记录"
}

favorite_count = post.get("favorite_count", 0)
print(favorite_count)
```

---

## 课时 4：遍历字典

课时简介：学习遍历字典中的键、值和键值对。
预计学习时间：17 分钟

### 正文

[标题]
使用 keys() 获取所有键

[代码 language=python]
player = {
    "nickname": "新手玩家",
    "rating": 1000,
    "level": 8
}

for key in player.keys():
    print(key)
[/代码]

[文本]
程序会依次输出 nickname、rating 和 level。

直接遍历字典时，默认也是遍历键。

[代码 language=python]
for key in player:
    print(key)
[/代码]

[标题]
使用 values() 获取所有值

[代码 language=python]
for value in player.values():
    print(value)
[/代码]

[标题]
使用 items() 同时获取键和值

[代码 language=python]
for key, value in player.items():
    print(key, value)
[/代码]

[文本]
items() 每次提供一组键和值，适合完整展示字典内容。

[示例 title=输出课程统计]
说明：遍历课程名称与题目数量。
语言：python

question_counts = {
    "Python": 120,
    "Git": 40,
    "MySQL": 80
}

for course_name, question_count in question_counts.items():
    print(f"{course_name}：{question_count} 题")
[/示例]

[提示 title=根据需要选择遍历方式]
只需要键时用 keys()，只需要值时用 values()，键和值都需要时用 items()。

### 课时题目

#### 题目 10

题型：SINGLE_CHOICE
题干：下面哪个方法适合同时遍历字典的键和值？

难度：EASY
分值：10
知识点：items、字典遍历
是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：代码用途

选项：
- A. keys()
- B. values()
- C. items() [正确]
- D. append()

解析：
items() 会提供字典中的键值对，因此适合同时获取键和值。

#### 题目 11

题型：FILL_BLANK
题干：字典中，用于获取全部值的方法是 ______。

难度：EASY
分值：10
知识点：values、字典遍历
是否用于 Battle：否

可接受答案：
- values
- values()

判题设置：
- 忽略大小写：否
- 忽略首尾空格：是
- 合并连续空格：是
- 最长字符数：30

解析：
dictionary.values() 返回字典中的全部值。

#### 题目 12

题型：CODE_FILL
题干：系统需要同时输出课程名称和对应题目数量。请补全字典遍历方法。

难度：MEDIUM
分值：10
知识点：items、for、字典遍历
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码填空

题目代码：
```python
question_counts = {
    "Python": 120,
    "Git": 40
}

for course_name, question_count in question_counts.__________:
    print(course_name, question_count)
```

可接受答案：
```python
items()
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
items() 每次返回一组键和值，因此可以分别赋给 course_name 和 question_count。

标准完整代码：
```python
question_counts = {
    "Python": 120,
    "Git": 40
}

for course_name, question_count in question_counts.items():
    print(course_name, question_count)
```

---

## 课时 5：认识集合与去重

课时简介：学习使用集合保存唯一元素并完成成员判断。
预计学习时间：17 分钟

### 正文

[标题]
集合中的元素不会重复

[代码 language=python]
tags = {"Python", "Git", "Python", "Battle"}

print(tags)
[/代码]

[文本]
集合会自动去除重复元素，因此最终只保留一个 Python。

集合也使用花括号创建，但集合中只有值，没有“键: 值”结构。

[标题]
使用 set() 把列表转换为集合

[代码 language=python]
courses = ["Python", "Git", "Python", "MySQL"]
unique_courses = set(courses)

print(unique_courses)
[/代码]

[文本]
set() 常用于去重。

[标题]
使用 add() 添加元素

[代码 language=python]
tags = {"Python", "Git"}
tags.add("Battle")

print(tags)
[/代码]

[标题]
使用 remove() 和 discard() 删除元素

[代码 language=python]
tags = {"Python", "Git", "Battle"}

tags.remove("Git")
tags.discard("Java")
[/代码]

[文本]
remove() 删除不存在的元素会报错；discard() 删除不存在的元素不会报错。

[标题]
使用 in 判断成员

[代码 language=python]
tags = {"Python", "Git", "Battle"}

print("Python" in tags)
[/代码]

[示例 title=对课程标签去重]
说明：把重复标签转换为唯一集合。
语言：python

raw_tags = ["Python", "入门", "Battle", "Python", "入门"]
unique_tags = set(raw_tags)

print(unique_tags)
[/示例]

[警告 title=空集合不能写成 {}]
{} 表示空字典。创建空集合应使用 set()。

### 课时题目

#### 题目 13

题型：SINGLE_CHOICE
题干：下面程序中，集合最终包含几个不同元素？

```python
tags = {"Python", "Git", "Python", "Battle"}
```

难度：EASY
分值：10
知识点：集合、去重、唯一性
是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：代码分析

选项：
- A. 2 个
- B. 3 个 [正确]
- C. 4 个
- D. 5 个

解析：
集合会自动去重。两个 Python 只保留一个，因此共有 Python、Git、Battle 三个不同元素。

#### 题目 14

题型：FILL_BLANK
题干：Python 中，创建空集合应使用表达式 ______。

难度：EASY
分值：10
知识点：set、空集合
是否用于 Battle：否

可接受答案：
- set()
- set

判题设置：
- 忽略大小写：否
- 忽略首尾空格：是
- 合并连续空格：是
- 最长字符数：20

解析：
{} 创建的是空字典，不是空集合。空集合应使用 set()。

#### 题目 15

题型：CODE_FILL
题干：课程标签集合中需要添加“Battle”标签。请补全代码。

难度：EASY
分值：10
知识点：集合、add、元素添加
是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：代码填空

题目代码：
```python
tags = {"Python", "入门"}
tags.______________

print(tags)
```

可接受答案：
```python
add("Battle")
```

```python
add('Battle')
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
集合使用 add(value) 添加单个元素，因此应写 tags.add("Battle")。

标准完整代码：
```python
tags = {"Python", "入门"}
tags.add("Battle")

print(tags)
```

---

## 课时 6：集合运算与综合应用

课时简介：学习交集、并集和差集，并结合字典管理结构化数据。
预计学习时间：16 分钟

### 正文

[标题]
交集：找出共同元素

[代码 language=python]
learned_courses = {"Python", "Git", "MySQL"}
battle_courses = {"Python", "JavaScript", "Git"}

common_courses = learned_courses & battle_courses
print(common_courses)
[/代码]

[文本]
& 表示交集，结果包含两个集合中共同存在的 Python 和 Git。

[标题]
并集：合并所有不同元素

[代码 language=python]
all_courses = learned_courses | battle_courses
print(all_courses)
[/代码]

[文本]
| 表示并集，结果包含两个集合中出现过的所有不同元素。

[标题]
差集：找出只在一个集合中的元素

[代码 language=python]
not_learned = battle_courses - learned_courses
print(not_learned)
[/代码]

[文本]
差集 battle_courses - learned_courses 表示在 battle_courses 中、但不在 learned_courses 中的元素。

[标题]
字典与集合配合使用

[代码 language=python]
course_info = {
    "Python": 120,
    "Git": 40,
    "MySQL": 80
}

learned_courses = {"Python", "Git"}

for course_name, question_count in course_info.items():
    if course_name in learned_courses:
        print(f"{course_name} 已学习，共 {question_count} 题")
[/代码]

[示例 title=找出尚未学习的 Battle 课程]
说明：使用集合差集找出可以对战但尚未学习的课程。
语言：python

battle_courses = {"Python", "Git", "MySQL", "Linux"}
learned_courses = {"Python", "Git"}

pending_courses = battle_courses - learned_courses

print(pending_courses)
[/示例]

[提示 title=集合结果顺序不固定]
集合主要关注元素是否存在，不保证像列表一样按固定索引顺序存放。

### 课时题目

#### 题目 16

题型：SINGLE_CHOICE
题干：下面哪个运算符可以得到两个集合的共同元素？

难度：MEDIUM
分值：10
知识点：集合交集、集合运算
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码用途

选项：
- A. &
- B. |
- C. -
- D. +

正确答案：A

解析：
& 表示集合交集，用于找出两个集合中共同存在的元素。| 表示并集，- 表示差集。

#### 题目 17

题型：FILL_BLANK
题干：集合 A 中存在、但集合 B 中不存在的元素，可以使用 ______ 运算得到。

难度：MEDIUM
分值：10
知识点：集合差集
是否用于 Battle：否

可接受答案：
- 差集
- -
- 减法
- 集合差

判题设置：
- 忽略大小写：是
- 忽略首尾空格：是
- 合并连续空格：是
- 最长字符数：30

解析：
A - B 表示集合差集，结果保留只存在于 A、但不存在于 B 的元素。

#### 题目 18

题型：CODE_FILL
题干：系统需要找出“可以参加 Battle、但用户尚未学习”的课程。请补全集合运算。

难度：MEDIUM
分值：10
知识点：集合差集、成员管理
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码填空

题目代码：
```python
battle_courses = {"Python", "Git", "MySQL", "Linux"}
learned_courses = {"Python", "Git"}

pending_courses = ______________________________

print(pending_courses)
```

可接受答案：
```python
battle_courses - learned_courses
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
目标是保留 battle_courses 中存在、但 learned_courses 中不存在的课程，因此应计算 battle_courses - learned_courses。

标准完整代码：
```python
battle_courses = {"Python", "Git", "MySQL", "Linux"}
learned_courses = {"Python", "Git"}

pending_courses = battle_courses - learned_courses

print(pending_courses)
```

---

## 第九章总结

[标题]
你已经能够保存结构化数据并处理唯一元素

[文本]
本章学习了：

- 使用字典保存键值对数据
- 使用键读取对应的值
- 新增和修改字典键值对
- 使用 del 和 pop() 删除数据
- 使用 get() 安全读取可能不存在的键
- 使用 keys()、values() 和 items() 遍历字典
- 使用集合保存唯一元素
- 使用 set() 对列表内容去重
- 使用 add() 添加集合元素
- 使用 remove() 和 discard() 删除集合元素
- 使用 in 判断元素是否存在
- 使用 & 计算交集
- 使用 | 计算并集
- 使用 - 计算差集
- 配合字典与集合处理课程、题目和用户数据

下一章将学习函数，包括定义函数、参数、返回值、默认参数和变量作用域。

---

## 第九章综合挑战（不计分）

[标题]
制作课程学习状态统计程序

[文本]
请编写一个程序，完成以下任务：

1. 使用字典保存课程名称和题目数量
2. 使用集合保存用户已经学习的课程
3. 使用集合保存支持 Battle 的课程
4. 找出“已学习且支持 Battle”的课程
5. 找出“支持 Battle 但尚未学习”的课程
6. 遍历课程字典，输出每门课程的题目数量
7. 对缺少题目数量的课程使用 get() 返回默认值 0

参考代码：

[代码 language=python]
course_questions = {
    "Python": 120,
    "Git": 40,
    "MySQL": 80
}

learned_courses = {"Python", "Git"}
battle_courses = {"Python", "Git", "MySQL", "Linux"}

ready_courses = learned_courses & battle_courses
pending_courses = battle_courses - learned_courses

print(f"已学习且可 Battle：{ready_courses}")
print(f"尚未学习的 Battle 课程：{pending_courses}")

for course_name in battle_courses:
    question_count = course_questions.get(course_name, 0)
    print(f"{course_name}：{question_count} 题")
[/代码]

[文本]
尝试向 course_questions、learned_courses 和 battle_courses 中加入新课程，观察交集、差集和默认题目数量如何变化。
