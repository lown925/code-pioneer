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

# 第十四章：面向对象基础

章节简介：学习类与对象的基本概念，掌握属性、方法、构造函数、实例方法和简单继承，并能够用面向对象方式组织用户、课程和 Battle 数据。
预计学习时间：105 分钟

章节学习目标：
- 理解类和对象的基本关系
- 能使用 class 定义类
- 能创建对象
- 能使用 __init__() 初始化对象
- 能通过 self 访问实例属性
- 能定义并调用实例方法
- 能修改对象属性
- 能理解不同对象拥有独立状态
- 能使用继承复用父类功能
- 能重写父类方法
- 能判断何时适合使用类
- 能阅读基础面向对象代码并判断执行结果

---

## 课时 1：认识类与对象

课时简介：理解类是模板，对象是根据模板创建的具体实例。
预计学习时间：16 分钟

### 正文

[标题]
类用于描述一类事物

[文本]
在程序中，很多数据和行为经常属于同一个整体。

例如一个玩家通常包含：

- 昵称
- Rating
- 等级
- 是否在线
- 显示资料的方法
- 更新 Rating 的方法

如果只使用多个独立变量，数据关系不够清晰。

[代码 language=python]
nickname = "新手玩家"
rating = 1000
level = 8
[/代码]

[文本]
可以使用类把相关属性和行为组织在一起。

[代码 language=python]
class Player:
    pass
[/代码]

[文本]
class 用于定义类。

Player 是类名。

pass 表示暂时不编写具体内容，保持代码结构合法。

[标题]
对象是类创建出的具体实例

[代码 language=python]
class Player:
    pass

player_a = Player()
player_b = Player()
[/代码]

[文本]
Player 是类。

player_a 和 player_b 是根据 Player 类创建的两个对象。

可以把类理解为图纸，把对象理解为根据图纸生产出的具体产品。

[标题]
类名通常使用大驼峰命名

[文本]
类名通常每个单词首字母大写，例如：

- Player
- Course
- BattleRoom
- LearningRecord

函数和变量通常使用小写加下划线，而类名通常使用大驼峰。

[示例 title=定义课程类]
说明：创建 Course 类并生成两个课程对象。
语言：python

class Course:
    pass

python_course = Course()
git_course = Course()

print(type(python_course))
print(type(git_course))
[/示例]

[提示 title=同一个类可以创建多个对象]
每个对象都可以保存自己的数据，不会自动与其他对象共享实例状态。

### 课时题目

#### 题目 1

题型：SINGLE_CHOICE
题干：Python 中用于定义类的关键字是什么？

难度：EASY
分值：10
知识点：class、类定义
是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：代码用途

选项：
- A. class [正确]
- B. def
- C. import
- D. object

解析：
Python 使用 class 关键字定义类。def 用于定义函数或方法。

#### 题目 2

题型：FILL_BLANK
题干：根据类创建出来的具体实例通常称为 ______。

难度：EASY
分值：10
知识点：对象、实例
是否用于 Battle：否

可接受答案：
- 对象
- 实例
- object
- instance

判题设置：
- 忽略大小写：是
- 忽略首尾空格：是
- 合并连续空格：是
- 最长字符数：30

解析：
类是模板，根据类创建出的具体实例称为对象或实例。

#### 题目 3

题型：CODE_FILL
题干：下面已经定义 Player 类。请补全代码，创建一个 Player 对象并保存到 player 变量。

难度：EASY
分值：10
知识点：对象创建、类实例化
是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：代码填空

题目代码：
```python
class Player:
    pass

player = __________
```

可接受答案：
```python
Player()
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
创建对象时需要调用类，因此应写 Player()。

标准完整代码：
```python
class Player:
    pass

player = Player()
```

---

## 课时 2：使用 __init__() 初始化对象

课时简介：学习在创建对象时保存初始数据。
预计学习时间：18 分钟

### 正文

[标题]
对象创建时通常需要初始数据

[文本]
一个玩家对象创建时，通常需要昵称和初始 Rating。

Python 常使用 __init__() 方法完成初始化。

[代码 language=python]
class Player:
    def __init__(self, nickname, rating):
        self.nickname = nickname
        self.rating = rating
[/代码]

[文本]
__init__() 会在创建对象时自动执行。

self 表示当前正在创建或操作的对象。

self.nickname 和 self.rating 是对象属性。

nickname 和 rating 是创建对象时传入的参数。

[标题]
创建对象时传入数据

[代码 language=python]
class Player:
    def __init__(self, nickname, rating):
        self.nickname = nickname
        self.rating = rating

player = Player("新手玩家", 1000)

print(player.nickname)
print(player.rating)
[/代码]

[文本]
Player("新手玩家", 1000) 创建对象时，会自动调用 __init__()。

"新手玩家" 传给 nickname。

1000 传给 rating。

[标题]
self 不需要由调用者手动传入

[文本]
定义方法时需要写 self，但创建对象或调用实例方法时，通常不手动传入 self。

正确：

[代码 language=python]
player = Player("新手玩家", 1000)
[/代码]

不正确：

[代码 language=python]
player = Player(player, "新手玩家", 1000)
[/代码]

[示例 title=初始化课程对象]
说明：创建课程时保存名称和章节数量。
语言：python

class Course:
    def __init__(self, name, chapter_count):
        self.name = name
        self.chapter_count = chapter_count

course = Course("Python 基础入门", 15)

print(course.name)
print(course.chapter_count)
[/示例]

[警告 title=__init__ 两侧都有双下划线]
应写 __init__，不能写成 _init_、init 或 __int__。

### 课时题目

#### 题目 4

题型：SINGLE_CHOICE
题干：创建对象时，通常用于初始化属性的方法是什么？

难度：EASY
分值：10
知识点：__init__、构造初始化
是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：代码用途

选项：
- A. __init__() [正确]
- B. __main__()
- C. start()
- D. build()

解析：
__init__() 会在对象创建时自动执行，常用于初始化对象属性。

#### 题目 5

题型：FILL_BLANK
题干：实例方法中的第一个参数通常写作 ______，表示当前对象。

难度：EASY
分值：10
知识点：self、实例方法
是否用于 Battle：否

可接受答案：
- self

判题设置：
- 忽略大小写：否
- 忽略首尾空格：是
- 合并连续空格：是
- 最长字符数：20

解析：
self 表示当前对象，实例方法通常把它作为第一个参数。

#### 题目 6

题型：CODE_FILL
题干：请补全 __init__() 中的代码，把传入的 nickname 保存为对象属性。

难度：MEDIUM
分值：10
知识点：__init__、self、实例属性
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码填空

题目代码：
```python
class Player:
    def __init__(self, nickname):
        __________________________
```

可接受答案：
```python
self.nickname = nickname
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
self.nickname 表示当前对象的 nickname 属性，右侧 nickname 是传入的参数。

标准完整代码：
```python
class Player:
    def __init__(self, nickname):
        self.nickname = nickname
```

---

## 课时 3：实例属性与对象独立状态

课时简介：学习读取、修改属性，并理解不同对象保存独立数据。
预计学习时间：17 分钟

### 正文

[标题]
使用点号读取对象属性

[代码 language=python]
class Player:
    def __init__(self, nickname, rating):
        self.nickname = nickname
        self.rating = rating

player = Player("新手玩家", 1000)

print(player.nickname)
print(player.rating)
[/代码]

[标题]
对象属性可以修改

[代码 language=python]
player.rating = 1025

print(player.rating)
[/代码]

[文本]
点号不仅可以读取属性，也可以修改属性。

[标题]
不同对象拥有独立状态

[代码 language=python]
player_a = Player("玩家A", 1000)
player_b = Player("玩家B", 1200)

player_a.rating += 20

print(player_a.rating)
print(player_b.rating)
[/代码]

[文本]
修改 player_a.rating 不会自动修改 player_b.rating。

每个对象都保存自己的实例属性。

[标题]
可以动态添加属性，但不推荐随意使用

[代码 language=python]
player = Player("新手玩家", 1000)
player.online = True
[/代码]

[文本]
Python 允许在对象创建后添加新属性。

但为了保持结构清晰，常用属性通常应统一在 __init__() 中初始化。

[示例 title=维护课程进度]
说明：两个课程对象拥有独立进度。
语言：python

class CourseProgress:
    def __init__(self, course_name, progress):
        self.course_name = course_name
        self.progress = progress

python_progress = CourseProgress("Python", 60)
git_progress = CourseProgress("Git", 20)

python_progress.progress = 80

print(python_progress.progress)
print(git_progress.progress)
[/示例]

[提示 title=属性名应准确表达含义]
使用 rating、progress、completed 比 a、b、c 更容易维护。

### 课时题目

#### 题目 7

题型：SINGLE_CHOICE
题干：下面程序会依次输出什么？

```python
class Player:
    def __init__(self, rating):
        self.rating = rating

player_a = Player(1000)
player_b = Player(1200)

player_a.rating += 50

print(player_a.rating)
print(player_b.rating)
```

难度：MEDIUM
分值：10
知识点：实例属性、对象独立状态
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：输出预测

选项：
- A. 1050、1200 [正确]
- B. 1050、1250
- C. 1000、1200
- D. 1200、1050

解析：
player_a 和 player_b 是不同对象。修改 player_a.rating 不会影响 player_b.rating，因此输出 1050 和 1200。

#### 题目 8

题型：FILL_BLANK
题干：通过对象读取属性时，通常使用“对象名.______”的形式。

难度：EASY
分值：10
知识点：属性访问、点号
是否用于 Battle：否

可接受答案：
- 属性名
- attribute
- 属性

判题设置：
- 忽略大小写：是
- 忽略首尾空格：是
- 合并连续空格：是
- 最长字符数：30

解析：
对象属性通常通过点号访问，例如 player.rating。

#### 题目 9

题型：CODE_FILL
题干：课程对象当前进度为 40。请补全代码，把进度修改为 60。

难度：MEDIUM
分值：10
知识点：实例属性、属性修改
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码填空

题目代码：
```python
class CourseProgress:
    def __init__(self, progress):
        self.progress = progress

record = CourseProgress(40)
______________________

print(record.progress)
```

可接受答案：
```python
record.progress = 60
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
应通过对象名和属性名修改值，因此写 record.progress = 60。

标准完整代码：
```python
class CourseProgress:
    def __init__(self, progress):
        self.progress = progress

record = CourseProgress(40)
record.progress = 60

print(record.progress)
```

---

## 课时 4：定义实例方法

课时简介：学习把与对象相关的行为写进类中。
预计学习时间：18 分钟

### 正文

[标题]
方法是定义在类中的函数

[代码 language=python]
class Player:
    def __init__(self, nickname, rating):
        self.nickname = nickname
        self.rating = rating

    def show_profile(self):
        print(f"昵称：{self.nickname}")
        print(f"Rating：{self.rating}")
[/代码]

[文本]
show_profile() 定义在 Player 类中，因此它是实例方法。

实例方法通常通过 self 访问当前对象属性。

[标题]
调用实例方法

[代码 language=python]
player = Player("新手玩家", 1000)
player.show_profile()
[/代码]

[文本]
调用时写对象名.方法名()。

不需要手动传入 self，Python 会自动把 player 作为 self。

[标题]
方法可以修改对象状态

[代码 language=python]
class Player:
    def __init__(self, rating):
        self.rating = rating

    def add_rating(self, amount):
        self.rating += amount

player = Player(1000)
player.add_rating(25)

print(player.rating)
[/代码]

[标题]
方法可以返回结果

[代码 language=python]
class Player:
    def __init__(self, nickname, rating):
        self.nickname = nickname
        self.rating = rating

    def build_summary(self):
        return f"{self.nickname}：{self.rating}"

player = Player("新手玩家", 1000)
summary = player.build_summary()

print(summary)
[/代码]

[示例 title=课程进度方法]
说明：使用方法更新并显示课程进度。
语言：python

class CourseProgress:
    def __init__(self, course_name, progress=0):
        self.course_name = course_name
        self.progress = progress

    def update_progress(self, progress):
        self.progress = progress

    def show_progress(self):
        print(f"{self.course_name}：{self.progress}%")

record = CourseProgress("Python 基础入门")
record.update_progress(60)
record.show_progress()
[/示例]

[警告 title=实例方法定义时不要遗漏 self]
如果实例方法没有 self 参数，使用对象调用时通常会产生参数数量错误。

### 课时题目

#### 题目 10

题型：SINGLE_CHOICE
题干：下面哪种写法可以调用 player 对象的 show_profile() 方法？

难度：EASY
分值：10
知识点：实例方法、方法调用
是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：代码用途

选项：
- A. player.show_profile() [正确]
- B. Player->show_profile()
- C. show_profile.player()
- D. player.show_profile

解析：
实例方法通过“对象名.方法名()”调用，因此应写 player.show_profile()。不写括号只会取得方法对象，不会执行。

#### 题目 11

题型：FILL_BLANK
题干：定义在类中、用于描述对象行为的函数通常称为 ______。

难度：EASY
分值：10
知识点：方法、类
是否用于 Battle：否

可接受答案：
- 方法
- 实例方法
- method
- instance method

判题设置：
- 忽略大小写：是
- 忽略首尾空格：是
- 合并连续空格：是
- 最长字符数：30

解析：
定义在类中的函数通常称为方法。通过对象调用的方法称为实例方法。

#### 题目 12

题型：CODE_FILL
题干：add_rating() 应把传入的 amount 加到当前对象的 rating 上。请补全方法体。

难度：MEDIUM
分值：10
知识点：实例方法、self、属性修改
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码填空

题目代码：
```python
class Player:
    def __init__(self, rating):
        self.rating = rating

    def add_rating(self, amount):
        ______________________

player = Player(1000)
player.add_rating(25)

print(player.rating)
```

可接受答案：
```python
self.rating += amount
```

```python
self.rating = self.rating + amount
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
当前对象的 rating 通过 self.rating 访问，因此应在原值基础上加 amount。

标准完整代码：
```python
class Player:
    def __init__(self, rating):
        self.rating = rating

    def add_rating(self, amount):
        self.rating += amount

player = Player(1000)
player.add_rating(25)

print(player.rating)
```

---

## 课时 5：继承与方法重写

课时简介：学习通过继承复用已有类，并根据子类需求修改行为。
预计学习时间：19 分钟

### 正文

[标题]
继承可以复用父类内容

[文本]
不同用户类型可能都拥有昵称和资料展示功能。

可以先定义一个基础用户类。

[代码 language=python]
class User:
    def __init__(self, nickname):
        self.nickname = nickname

    def show_identity(self):
        print(f"用户：{self.nickname}")
[/代码]

[文本]
再定义 Player 类继承 User。

[代码 language=python]
class Player(User):
    pass
[/代码]

[文本]
Player 会继承 User 的 __init__() 和 show_identity()。

[代码 language=python]
player = Player("新手玩家")
player.show_identity()
[/代码]

[标题]
子类可以增加自己的属性和方法

[代码 language=python]
class Player(User):
    def __init__(self, nickname, rating):
        super().__init__(nickname)
        self.rating = rating

    def show_rating(self):
        print(f"Rating：{self.rating}")
[/代码]

[文本]
super().__init__(nickname) 调用父类的初始化方法，复用 nickname 初始化逻辑。

[标题]
子类可以重写父类方法

[代码 language=python]
class User:
    def show_identity(self):
        print("普通用户")

class Player(User):
    def show_identity(self):
        print("Battle 玩家")
[/代码]

[文本]
Player 中重新定义 show_identity() 后，Player 对象会使用子类版本。

[示例 title=管理员继承用户]
说明：管理员复用昵称属性，并增加管理权限。
语言：python

class User:
    def __init__(self, nickname):
        self.nickname = nickname

    def show_profile(self):
        print(f"昵称：{self.nickname}")

class Admin(User):
    def __init__(self, nickname, permission_level):
        super().__init__(nickname)
        self.permission_level = permission_level

    def show_profile(self):
        print(f"管理员：{self.nickname}")
        print(f"权限等级：{self.permission_level}")

admin = Admin("系统管理员", 3)
admin.show_profile()
[/示例]

[提示 title=继承表示“是一种”关系]
Player 是一种 User，Admin 也是一种 User，因此继承较合适。

[警告 title=不要为了少写几行代码而滥用继承]
如果两个类没有清晰的“是一种”关系，组合对象通常比继承更合适。

### 课时题目

#### 题目 13

题型：SINGLE_CHOICE
题干：下面哪种写法表示 Player 继承 User？

难度：EASY
分值：10
知识点：继承、父类、子类
是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：代码纠错

选项：
- A. class Player(User): [正确]
- B. class Player -> User:
- C. class Player inherit User:
- D. class User(Player):

解析：
Python 在子类名后的括号中写父类，因此 class Player(User): 表示 Player 继承 User。

#### 题目 14

题型：FILL_BLANK
题干：在子类中调用父类方法时，常用内置函数 ______。

难度：MEDIUM
分值：10
知识点：super、父类调用
是否用于 Battle：否

可接受答案：
- super
- super()

判题设置：
- 忽略大小写：否
- 忽略首尾空格：是
- 合并连续空格：是
- 最长字符数：20

解析：
super() 常用于在子类中调用父类方法，例如 super().__init__(nickname)。

#### 题目 15

题型：CODE_FILL
题干：Player 子类需要复用 User 父类的 nickname 初始化。请补全代码。

难度：MEDIUM
分值：10
知识点：继承、super、__init__
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码填空

题目代码：
```python
class User:
    def __init__(self, nickname):
        self.nickname = nickname

class Player(User):
    def __init__(self, nickname, rating):
        __________________________
        self.rating = rating
```

可接受答案：
```python
super().__init__(nickname)
```

```python
User.__init__(self, nickname)
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
推荐使用 super().__init__(nickname) 调用父类初始化方法，从而复用 nickname 属性设置逻辑。

标准完整代码：
```python
class User:
    def __init__(self, nickname):
        self.nickname = nickname

class Player(User):
    def __init__(self, nickname, rating):
        super().__init__(nickname)
        self.rating = rating
```

---

## 课时 6：合理设计类与综合应用

课时简介：学习判断何时使用类，并把数据与行为组织成清晰对象。
预计学习时间：19 分钟

### 正文

[标题]
不是所有代码都需要写成类

[文本]
如果任务只是完成一次简单计算，普通函数通常更直接。

[代码 language=python]
def calculate_score(correct_count, wrong_count):
    return correct_count * 2 - wrong_count
[/代码]

[文本]
如果需要长期保存一组相关状态，并围绕这些状态执行多个操作，类更合适。

[代码 language=python]
class BattleRecord:
    def __init__(self, correct_count, wrong_count):
        self.correct_count = correct_count
        self.wrong_count = wrong_count

    def calculate_score(self):
        return self.correct_count * 2 - self.wrong_count
[/代码]

[标题]
类应该表达清晰实体

[文本]
适合定义为类的对象：

- Player
- Course
- LearningRecord
- BattleRoom
- Post

不一定需要定义为类的内容：

- 一个临时加法
- 一次字符串格式化
- 简单数据转换

[标题]
避免一个类承担太多职责

[文本]
不推荐让 Player 类同时处理：

- 登录
- 数据库存储
- 文件上传
- Battle 结算
- 帖子推荐

更合理的做法是拆分多个类或服务。

[标题]
使用对象列表管理多条数据

[代码 language=python]
class Player:
    def __init__(self, nickname, rating):
        self.nickname = nickname
        self.rating = rating

players = [
    Player("玩家A", 1200),
    Player("玩家B", 1000),
    Player("玩家C", 1350)
]

for player in players:
    print(player.nickname, player.rating)
[/代码]

[标题]
对象可以与列表、字典配合

[代码 language=python]
class Course:
    def __init__(self, name, progress=0):
        self.name = name
        self.progress = progress

    def is_completed(self):
        return self.progress == 100

courses = {
    "python": Course("Python 基础入门", 80),
    "git": Course("Git 入门", 100)
}

print(courses["git"].is_completed())
[/代码]

[示例 title=Battle 记录对象]
说明：封装得分、正确率和结果判断。
语言：python

class BattleRecord:
    def __init__(
        self,
        nickname,
        correct_count,
        wrong_count,
        opponent_score
    ):
        self.nickname = nickname
        self.correct_count = correct_count
        self.wrong_count = wrong_count
        self.opponent_score = opponent_score

    def calculate_score(self):
        return self.correct_count * 2 - self.wrong_count

    def calculate_accuracy(self):
        answered_count = self.correct_count + self.wrong_count

        if answered_count == 0:
            return 0

        return self.correct_count / answered_count * 100

    def determine_result(self):
        my_score = self.calculate_score()

        if my_score > self.opponent_score:
            return "胜利"

        if my_score < self.opponent_score:
            return "失败"

        return "平局"

    def build_summary(self):
        return (
            f"玩家：{self.nickname}\n"
            f"得分：{self.calculate_score()}\n"
            f"正确率：{self.calculate_accuracy():.1f}%\n"
            f"结果：{self.determine_result()}"
        )

record = BattleRecord(
    nickname="新手玩家",
    correct_count=8,
    wrong_count=2,
    opponent_score=12
)

print(record.build_summary())
[/示例]

[提示 title=类名、属性名和方法名要贴近业务]
清晰命名比复杂技巧更重要。

### 课时题目

#### 题目 16

题型：SINGLE_CHOICE
题干：下面哪种场景更适合使用类？

难度：MEDIUM
分值：10
知识点：类设计、使用场景
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码分析

选项：
- A. 需要保存玩家多个属性，并提供更新 Rating、显示资料等行为 [正确]
- B. 只计算一次 2 + 3
- C. 只输出一行固定文字
- D. 只把字符串转成整数

解析：
当数据和行为长期属于同一个实体时，使用类更合适。简单的一次性操作通常使用表达式或函数即可。

#### 题目 17

题型：FILL_BLANK
题干：面向对象设计中，类通常用于同时组织相关的“数据”和“______”。

难度：EASY
分值：10
知识点：数据与行为、类设计
是否用于 Battle：否

可接受答案：
- 行为
- 方法
- 功能
- behavior
- methods

判题设置：
- 忽略大小写：是
- 忽略首尾空格：是
- 合并连续空格：是
- 最长字符数：30

解析：
类通常把相关数据保存为属性，把相关行为实现为方法。

#### 题目 18

题型：CODE_FILL
题干：BattleRecord 的 calculate_score() 应返回“答对数乘 2，再减去答错数”。请补全返回表达式。

难度：MEDIUM
分值：10
知识点：实例方法、self、返回值
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码填空

题目代码：
```python
class BattleRecord:
    def __init__(self, correct_count, wrong_count):
        self.correct_count = correct_count
        self.wrong_count = wrong_count

    def calculate_score(self):
        return ______________________________________
```

可接受答案：
```python
self.correct_count * 2 - self.wrong_count
```

```python
2 * self.correct_count - self.wrong_count
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
实例属性需要通过 self 访问，因此应计算 self.correct_count * 2 - self.wrong_count。

标准完整代码：
```python
class BattleRecord:
    def __init__(self, correct_count, wrong_count):
        self.correct_count = correct_count
        self.wrong_count = wrong_count

    def calculate_score(self):
        return self.correct_count * 2 - self.wrong_count
```

---

## 第十四章总结

[标题]
你已经能够使用类组织数据和行为

[文本]
本章学习了：

- 理解类是模板，对象是具体实例
- 使用 class 定义类
- 使用类名加括号创建对象
- 使用 __init__() 初始化对象
- 使用 self 表示当前对象
- 使用实例属性保存对象状态
- 通过点号读取和修改属性
- 理解不同对象拥有独立状态
- 在类中定义实例方法
- 通过对象调用方法
- 使用方法修改对象状态
- 使用方法返回计算结果
- 使用继承复用父类功能
- 使用 super() 调用父类方法
- 在子类中增加新属性和方法
- 重写父类方法
- 判断何时适合使用类
- 避免类承担过多职责
- 使用对象列表和对象字典管理多条数据

下一章将进行 Python 基础综合实战，把函数、文件、JSON、异常和面向对象知识组合成一个完整的小项目。

---

## 第十四章综合挑战（不计分）

[标题]
制作面向对象的学习记录管理器

[文本]
请使用类实现一个学习记录管理器。

要求：

1. 定义 LearningRecord 类
2. 属性包括课程名称、章节编号、学习进度和是否完成
3. 使用 __init__() 初始化属性
4. 使用 update_progress() 更新进度
5. 进度必须在 0 到 100 之间，否则抛出 ValueError
6. 进度达到 100 时，completed 自动变为 True
7. 使用 build_summary() 返回学习摘要
8. 创建两个不同课程对象
9. 修改其中一个对象时，不影响另一个对象
10. 遍历对象列表并输出摘要

参考代码：

[代码 language=python]
class LearningRecord:
    def __init__(
        self,
        course_name,
        chapter_number=1,
        progress=0
    ):
        self.course_name = course_name
        self.chapter_number = chapter_number
        self.progress = 0
        self.completed = False

        self.update_progress(progress)

    def update_progress(self, progress):
        if progress < 0 or progress > 100:
            raise ValueError("学习进度必须在 0 到 100 之间")

        self.progress = progress
        self.completed = progress == 100

    def update_chapter(self, chapter_number):
        if chapter_number < 1:
            raise ValueError("章节编号必须大于等于 1")

        self.chapter_number = chapter_number

    def build_summary(self):
        status = "已完成" if self.completed else "学习中"

        return (
            f"课程：{self.course_name}\n"
            f"章节：第 {self.chapter_number} 章\n"
            f"进度：{self.progress}%\n"
            f"状态：{status}"
        )

records = [
    LearningRecord(
        course_name="Python 基础入门",
        chapter_number=14,
        progress=90
    ),
    LearningRecord(
        course_name="Git 入门",
        chapter_number=3,
        progress=100
    )
]

try:
    records[0].update_progress(100)
except ValueError as error:
    print(f"更新失败：{error}")

for record in records:
    print(record.build_summary())
    print("-" * 20)
[/代码]

[文本]
尝试创建第三个学习记录对象，并测试非法进度和非法章节编号。观察不同对象的状态是否保持独立。
