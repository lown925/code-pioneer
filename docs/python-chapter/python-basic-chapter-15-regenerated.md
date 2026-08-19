# 课程信息

课程名称：Python 基础入门
课程标识：python-basic
课程分类：BACKEND
编程语言：Python
难度：BEGINNER
预计学习时间：720 分钟
课程简介：面向零基础学习者的 Python 基础课程。通过讲解、示例、练习和 Battle 题目，帮助学习者掌握 Python 基础语法，并具备完成简单项目的能力。
适合人群：没有编程基础、希望从零开始学习 Python 的学生。
课程封面：
发布状态：PUBLISHED

---

# 第十五章：Python 基础综合实战

章节简介：综合使用变量、条件判断、循环、函数、列表、字典、文件、JSON、异常处理和面向对象知识，完成一个可保存数据的命令行学习与 Battle 记录管理器。
预计学习时间：120 分钟

章节学习目标：
- 能把需求拆分为数据、功能和流程
- 能设计适合项目的数据结构
- 能使用类封装用户、学习记录和 Battle 记录
- 能使用函数拆分输入、校验、统计和展示逻辑
- 能使用列表与字典管理多条记录
- 能使用 JSON 文件保存和恢复数据
- 能使用异常处理应对非法输入与文件问题
- 能实现菜单循环与基础交互
- 能实现学习进度统计和 Battle 战绩统计
- 能完成一个可运行、可保存、可扩展的小项目

---

## 课时 1：分析需求并设计数据

课时简介：学习在写代码前梳理功能、数据和操作流程。
预计学习时间：18 分钟

### 正文

[标题]
先明确项目要解决什么问题

[文本]
本章将制作一个命令行版“学习与 Battle 记录管理器”。

程序需要完成：
1. 创建和显示用户资料
2. 添加课程学习记录
3. 更新课程进度
4. 添加 Battle 结果
5. 查看学习统计
6. 查看 Battle 统计
7. 保存为 JSON
8. 下次启动时恢复数据

[标题]
设计初始数据结构

[代码 language=python]
user_data = {
    "nickname": "新手玩家",
    "rating": 1000,
    "learning_records": [],
    "battle_records": []
}
[/代码]

[文本]
字典适合保存具有明确字段名的数据，列表适合保存多条记录。

[标题]
把需求拆成函数

[代码 language=python]
def add_learning_record():
    pass

def update_learning_progress():
    pass

def add_battle_record():
    pass

def save_data():
    pass

def load_data():
    pass
[/代码]

[提示 title=先做最小可运行版本]
先完成核心流程，再增加搜索、排序和更多统计。


### 课时题目

#### 题目 1

题型：SINGLE_CHOICE
题干：开始编写综合项目之前，最合理的第一步是什么？

难度：EASY
分值：10
知识点：需求分析、项目设计
是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：综合项目题


选项：
- A. 先明确功能需求和需要保存的数据 [正确]
- B. 立即把所有代码写进一个 while 循环
- C. 随机创建大量变量
- D. 删除所有异常处理


解析：
先分析需求、数据和流程，能减少后续返工。

---


### 课时题目

#### 题目 2

题型：FILL_BLANK
题干：把一个大项目拆分为多个较小功能，这个过程通常称为任务 ______。

难度：EASY
分值：10
知识点：任务拆分
是否用于 Battle：否
Battle 难度：EASY
Battle 展示类型：综合项目题


可接受答案：
- `拆分`
- `分解`
- `decomposition`


判题设置：
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是


解析：
复杂项目应先拆分为清晰的小任务。

---


### 课时题目

#### 题目 3

题型：CODE_FILL
题干：请补全下面代码中的字典字段。这里需要填写完整的字段语句，不是只填写字段值。

难度：MEDIUM
分值：10
知识点：字典、列表、数据设计
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：综合项目题


[代码 language=python]
user = {
    "nickname": "新手玩家",
    ____
}
[/代码]


可接受答案：
- `"battle_records": []`
- `'battle_records': []`


判题设置：
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是


解析：
多条 Battle 记录适合保存在列表中。

---


## 课时 2：设计项目类

课时简介：使用类封装学习记录、Battle 记录和用户资料。
预计学习时间：22 分钟

### 正文

[标题]
定义学习记录类

[代码 language=python]
class LearningRecord:
    def __init__(self, course_name, chapter_number=1, progress=0):
        self.course_name = course_name
        self.chapter_number = chapter_number
        self.progress = progress
        self.completed = progress == 100
[/代码]

[标题]
定义 Battle 记录类

[代码 language=python]
class BattleRecord:
    def __init__(self, mode, result, score, opponent_score, rating_delta=0):
        self.mode = mode
        self.result = result
        self.score = score
        self.opponent_score = opponent_score
        self.rating_delta = rating_delta
[/代码]

[标题]
定义用户资料类

[代码 language=python]
class UserProfile:
    def __init__(self, nickname, rating=1000):
        self.nickname = nickname
        self.rating = rating
        self.learning_records = []
        self.battle_records = []

    def add_learning_record(self, record):
        self.learning_records.append(record)

    def add_battle_record(self, record):
        self.battle_records.append(record)
        self.rating += record.rating_delta
[/代码]

[文本]
每个类只负责一类清晰数据和行为，项目结构会更容易维护。


### 课时题目

#### 题目 4

题型：SINGLE_CHOICE
题干：哪个类最适合保存一场 Battle 的模式、结果、双方分数和 Rating 变化？

难度：EASY
分值：10
知识点：类设计、职责划分
是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：综合项目题


选项：
- A. BattleRecord [正确]
- B. LearningRecord
- C. String
- D. File


解析：
BattleRecord 的职责与这些数据最匹配。

---


### 课时题目

#### 题目 5

题型：FILL_BLANK
题干：UserProfile 中保存多条学习记录时，最适合使用 ______。

难度：EASY
分值：10
知识点：列表、对象集合
是否用于 Battle：否
Battle 难度：EASY
Battle 展示类型：综合项目题


可接受答案：
- `列表`
- `list`


判题设置：
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是


解析：
列表适合保存多条有顺序的记录。

---


### 课时题目

#### 题目 6

题型：CODE_FILL
题干：请补全下面函数中的完整语句，把 record 加入 battle_records 列表。

难度：MEDIUM
分值：10
知识点：类、列表、append
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：综合项目题


[代码 language=python]
class UserProfile:
    def __init__(self):
        self.battle_records = []

    def add_battle_record(self, record):
        ____
[/代码]


可接受答案：
- `self.battle_records.append(record)`


判题设置：
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是


解析：
append() 用于向列表末尾添加记录。

---


## 课时 3：实现学习记录功能

课时简介：添加、更新、查询和统计学习记录。
预计学习时间：20 分钟

### 正文

[标题]
查找课程记录

[代码 language=python]
def find_learning_record(user, course_name):
    for record in user.learning_records:
        if record.course_name == course_name:
            return record
    return None
[/代码]

[标题]
更新课程进度

[代码 language=python]
def update_learning_progress(user, course_name, chapter_number, progress):
    record = find_learning_record(user, course_name)

    if record is None:
        raise ValueError("未找到该课程学习记录")

    if chapter_number < 1:
        raise ValueError("章节编号必须大于等于 1")

    if progress < 0 or progress > 100:
        raise ValueError("学习进度必须在 0 到 100 之间")

    record.chapter_number = chapter_number
    record.progress = progress
    record.completed = progress == 100
[/代码]

[标题]
统计学习数据

[代码 language=python]
def count_completed_courses(user):
    count = 0
    for record in user.learning_records:
        if record.completed:
            count += 1
    return count

def calculate_average_progress(user):
    if not user.learning_records:
        return 0

    total = 0
    for record in user.learning_records:
        total += record.progress

    return total / len(user.learning_records)
[/代码]


### 课时题目

#### 题目 7

题型：SINGLE_CHOICE
题干：find_learning_record() 没有找到课程时，返回什么更合理？

难度：MEDIUM
分值：10
知识点：函数返回值、None
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：综合项目题


选项：
- A. None [正确]
- B. 自动删除所有记录
- C. 固定返回 100
- D. 修改 Rating


解析：
返回 None 可让调用者明确判断未找到。

---


### 课时题目

#### 题目 8

题型：FILL_BLANK
题干：学习进度达到 ______ 时，可以把 completed 设置为 True。

难度：EASY
分值：10
知识点：学习进度、完成状态
是否用于 Battle：否
Battle 难度：EASY
Battle 展示类型：综合项目题


可接受答案：
- `100`
- `100%`


判题设置：
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是


解析：
本项目约定进度达到 100 即完成。

---


### 课时题目

#### 题目 9

题型：CODE_FILL
题干：请补全下面 return 语句中的表达式，不要填写 return 关键字。

难度：MEDIUM
分值：10
知识点：平均值、列表长度
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：综合项目题


[代码 language=python]
def calculate_average_progress(user, total_progress):
    if not user.learning_records:
        return 0
    return ____
[/代码]


可接受答案：
- `total_progress / len(user.learning_records)`


判题设置：
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是


解析：
平均值等于总进度除以记录数量。

---


## 课时 4：实现 Battle 记录与统计

课时简介：保存对战结果并计算胜率、总场次和 Rating。
预计学习时间：20 分钟

### 正文

[标题]
校验 Battle 数据

[代码 language=python]
VALID_MODES = {"RANKED", "FRIEND"}
VALID_RESULTS = {"WIN", "LOSS", "DRAW"}

def validate_battle_data(mode, result):
    if mode not in VALID_MODES:
        raise ValueError("对战模式无效")

    if result not in VALID_RESULTS:
        raise ValueError("对战结果无效")
[/代码]

[标题]
统计胜率

[代码 language=python]
def count_wins(user):
    count = 0
    for record in user.battle_records:
        if record.result == "WIN":
            count += 1
    return count

def calculate_win_rate(user):
    total = len(user.battle_records)
    if total == 0:
        return 0
    return count_wins(user) / total * 100
[/代码]

[标题]
统计胜负平

[代码 language=python]
def count_battle_results(user):
    statistics = {"WIN": 0, "LOSS": 0, "DRAW": 0}

    for record in user.battle_records:
        statistics[record.result] += 1

    return statistics
[/代码]

[提示 title=真实对战结果应由服务端计算]
本章只用于练习本地项目结构，真实多人对战不能信任客户端自行结算。


### 课时题目

#### 题目 10

题型：SINGLE_CHOICE
题干：没有 Battle 记录时胜率返回 0，主要是为了什么？

难度：MEDIUM
分值：10
知识点：除零保护、胜率统计
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：综合项目题


选项：
- A. 避免除以 0 [正确]
- B. 自动判定失败
- C. 清空 Rating
- D. 删除资料


解析：
总场次为 0 时直接相除会产生 ZeroDivisionError。

---


### 课时题目

#### 题目 11

题型：FILL_BLANK
题干：本项目中表示平局结果的字符串是 ______。

难度：EASY
分值：10
知识点：Battle 结果枚举
是否用于 Battle：否
Battle 难度：EASY
Battle 展示类型：综合项目题


可接受答案：
- `DRAW`
- `draw`
- `平局`


判题设置：
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是


解析：
WIN、LOSS、DRAW 分别表示胜、负、平。

---


### 课时题目

#### 题目 12

题型：CODE_FILL
题干：请补全下面 return 语句中的表达式，不要填写 return 关键字。

难度：MEDIUM
分值：10
知识点：胜率、百分比
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：综合项目题


[代码 language=python]
def calculate_win_rate(user, total_battles):
    if total_battles == 0:
        return 0
    return ____
[/代码]


可接受答案：
- `count_wins(user) / total_battles * 100`
- `100 * count_wins(user) / total_battles`


判题设置：
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是


解析：
胜率为胜场数除以总场次再乘以 100。

---


## 课时 5：保存与恢复 JSON 数据

课时简介：把对象转换为字典，保存到文件并在启动时恢复。
预计学习时间：22 分钟

### 正文

[标题]
对象转换为字典

[代码 language=python]
class LearningRecord:
    def to_dict(self):
        return {
            "course_name": self.course_name,
            "chapter_number": self.chapter_number,
            "progress": self.progress,
            "completed": self.completed
        }
[/代码]

[标题]
保存用户数据

[代码 language=python]
import json
from pathlib import Path

DATA_FILE = Path("code-pioneer-data.json")

def save_user(user):
    with DATA_FILE.open("w", encoding="utf-8") as file:
        json.dump(
            user.to_dict(),
            file,
            ensure_ascii=False,
            indent=2
        )
[/代码]

[标题]
加载用户数据

[代码 language=python]
def load_user():
    if not DATA_FILE.exists():
        return UserProfile("新手玩家")

    try:
        with DATA_FILE.open("r", encoding="utf-8") as file:
            data = json.load(file)
    except json.JSONDecodeError:
        print("数据文件格式错误，使用默认用户")
        return UserProfile("新手玩家")

    return UserProfile.from_dict(data)
[/代码]

[文本]
JSON 默认不能直接保存普通自定义对象，因此需要先转换为字典和列表。


### 课时题目

#### 题目 13

题型：SINGLE_CHOICE
题干：为什么保存自定义对象前通常先转换为字典？

难度：MEDIUM
分值：10
知识点：JSON、对象序列化
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：综合项目题


选项：
- A. JSON 默认不能直接序列化普通自定义对象 [正确]
- B. 字典不能保存字符串
- C. 对象不能有属性
- D. JSON 只能保存整数


解析：
json.dump() 默认支持基础类型、列表和字典。

---


### 课时题目

#### 题目 14

题型：FILL_BLANK
题干：把对象转换为字典的方法常命名为 ______。

难度：EASY
分值：10
知识点：to_dict、序列化
是否用于 Battle：否
Battle 难度：EASY
Battle 展示类型：综合项目题


可接受答案：
- `to_dict`
- `to_dict()`


判题设置：
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是


解析：
to_dict() 是常见序列化辅助方法名。

---


### 课时题目

#### 题目 15

题型：CODE_FILL
题干：请补全下面调用中的第一个参数。这里需要填写一个表达式，不要填写整条 json.dump() 语句。

难度：MEDIUM
分值：10
知识点：json.dump、to_dict
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：综合项目题


[代码 language=python]
def save_user(user, file):
    json.dump(
        ____,
        file,
        ensure_ascii=False,
        indent=2
    )
[/代码]


可接受答案：
- `user.to_dict()`


判题设置：
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是


解析：
应先把对象转换为 JSON 可序列化的字典。

---


## 课时 6：实现菜单循环与项目收口

课时简介：组合前面功能，完成可运行的命令行应用。
预计学习时间：18 分钟

### 正文

[标题]
显示菜单

[代码 language=python]
def show_menu():
    print()
    print("1. 查看个人资料")
    print("2. 添加学习记录")
    print("3. 更新学习进度")
    print("4. 添加 Battle 记录")
    print("5. 查看学习统计")
    print("6. 查看 Battle 统计")
    print("0. 保存并退出")
[/代码]

[标题]
主程序循环

[代码 language=python]
def main():
    user = load_user()

    while True:
        show_menu()
        choice = input("请选择操作：").strip()

        if choice == "1":
            show_profile(user)
        elif choice == "2":
            handle_add_learning_record(user)
            save_user(user)
        elif choice == "3":
            handle_update_learning_progress(user)
            save_user(user)
        elif choice == "4":
            handle_add_battle_record(user)
            save_user(user)
        elif choice == "5":
            show_learning_statistics(user)
        elif choice == "6":
            show_battle_statistics(user)
        elif choice == "0":
            save_user(user)
            print("数据已保存，再见")
            break
        else:
            print("无效选项，请重新输入")

if __name__ == "__main__":
    main()
[/代码]

[标题]
完成后进行验收

[文本]
至少测试：
- 首次启动没有数据文件
- 添加学习记录
- 重复课程
- 非法进度
- 添加 WIN、LOSS、DRAW
- FRIEND 不改变 Rating
- 退出后重新启动
- JSON 文件损坏
- 没有对局时胜率为 0


### 课时题目

#### 题目 16

题型：SINGLE_CHOICE
题干：命令行菜单持续接收操作直到退出，适合使用什么结构？

难度：EASY
分值：10
知识点：while、菜单循环
是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：综合项目题


选项：
- A. while 循环 [正确]
- B. 一条 print()
- C. 一个字符串
- D. 删除所有函数


解析：
菜单需要重复执行，直到用户选择退出。

---


### 课时题目

#### 题目 17

题型：FILL_BLANK
题干：主程序入口常写作 `if __name__ == "______":`。

难度：MEDIUM
分值：10
知识点：__main__、程序入口
是否用于 Battle：否
Battle 难度：MEDIUM
Battle 展示类型：综合项目题


可接受答案：
- `__main__`
- `"__main__"`
- `'__main__'`


判题设置：
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是


解析：
文件直接运行时 __name__ 通常为 __main__。

---


### 课时题目

#### 题目 18

题型：CODE_FILL
题干：用户选择 0 后需要退出菜单循环，请补全下面 if 代码块中的完整语句。

难度：MEDIUM
分值：10
知识点：break、菜单循环
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：综合项目题


[代码 language=python]
while True:
    choice = input("请选择：")
    if choice == "0":
        ____
[/代码]


可接受答案：
- `break`


判题设置：
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是


解析：
break 用于结束当前 while 循环。

---


## 第十五章总结

[标题]
你已经完成 Python 基础阶段的综合项目

[文本]
本章综合使用了需求分析、字典与列表、类与对象、函数拆分、条件判断、循环、异常处理、文件路径、JSON 保存与读取、学习记录统计和 Battle 战绩统计。

完成本章后，你已经具备把一个需求拆成数据、函数、类和流程，并完成可运行程序的基础能力。

---

## 第十五章综合挑战（不计分）

[标题]
完成完整的学习与 Battle 记录管理器

[文本]
推荐项目结构：

```text
python-record-manager/
├── main.py
├── models.py
├── services.py
├── storage.py
└── data/
    └── code-pioneer-data.json
```

要求：

1. models.py
   - LearningRecord
   - BattleRecord
   - UserProfile
   - to_dict()
   - from_dict()

2. services.py
   - 查找学习记录
   - 更新学习进度
   - 统计学习数据
   - 添加 Battle 记录
   - 统计 Battle 数据
   - 输入校验

3. storage.py
   - DATA_FILE
   - save_user()
   - load_user()
   - 文件异常处理
   - JSON 格式异常处理

4. main.py
   - show_menu()
   - 菜单处理函数
   - main()
   - `if __name__ == "__main__":`

5. 自测清单
   - 学习进度只能为 0 到 100
   - 章节编号不能小于 1
   - Battle 模式只能为 RANKED 或 FRIEND
   - Battle 结果只能为 WIN、LOSS 或 DRAW
   - 没有对局时胜率为 0
   - FRIEND 默认 rating_delta 为 0
   - 数据文件不存在时不会崩溃
   - JSON 文件损坏时不会暴露堆栈
   - 退出后数据能够恢复
