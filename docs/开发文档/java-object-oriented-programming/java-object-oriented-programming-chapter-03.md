# 第3章：类、对象与封装

章节简介：从实体建模到private和业务方法，学习“对象怎样保证自己始终处于合法状态”。
预计学习时间：90 分钟

章节学习目标：
- 理解并能应用从数据记录抽象成类
- 理解并能应用字段保存对象状态
- 理解并能应用构造方法建立合法对象
- 理解并能应用实例方法描述行为
- 理解并能应用private 保护内部状态
- 理解并能应用getter/setter 与业务规则

[标题]
本章统一场景

[文本]
Student分数必须保持0~100，这是本章贯穿的不变量。

---

## 课时 1：从数据记录抽象成类

课时简介：识别“哪些字段属于同一个实体”。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
对象设计的第一步不是先写getter，而是从需求找实体和职责。学生成绩场景中，name、score、studentId属于同一个学生。

[标题]
先建立一个能看见的模型

[文本]
把这些字段放入Student，外部可以通过一个变量传递整名学生，而不是多个参数总是成组出现。

[代码 language=java]
class Student {
    String studentId;
    String name;
    int score;
}
[/代码]

[文本]
如果函数总是接收`id,name,score`三件套，常提示它们应被一个对象聚合。

[示例 title=最小可验证示例]
说明：用最小输入观察本课核心规则。
语言：java

class Student {
    String studentId;
    String name;
    int score;
}
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数字、名称或输入换掉，再独立推导一次。如果还能解释每一步，说明你理解的是规则而不是答案。

[警告 title=常见错误]
类划分过细，把每个字段都建成一个类，会增加无意义复杂度。

[标题]
本课小结

[文本]
能从简单需求识别类与字段。

### 课时题目

#### 题目 1

题型：SINGLE_CHOICE
题干：studentId/name/score经常一起传递，最自然的改进之一是？

难度：EASY
分值：10
知识点：类设计
是否用于 Battle：否

选项：
- A. 封装成Student对象 [正确]
- B. 把变量名都改成x
- C. 删除类型
- D. 全部设static

解析：
相关数据聚合。

#### 题目 2

题型：SINGLE_CHOICE
题干：Student对象代表什么？

难度：MEDIUM
分值：10
知识点：对象
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码阅读

选项：
- A. 一个学生实体及其状态 [正确]
- B. 所有学生共享唯一变量
- C. JVM本身
- D. 数据库连接

解析：
对象建模实体。

#### 题目 3

题型：SINGLE_CHOICE
题干：判断“是否该建类”更重要的依据是什么？

难度：HARD
分值：10
知识点：对象建模
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码阅读

选项：
- A. 是否有一组相关状态和行为需要一起管理 [正确]
- B. 字段数量必须大于10
- C. 必须继承另一个类
- D. 只有数据库表能建类

解析：
类用于建模职责。


---

## 课时 2：字段保存对象状态

课时简介：理解实例字段属于每个对象，而static字段属于类。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
Student.score是每个学生不同的状态；如果错误地把score声明static，所有对象会共享同一份值。

[标题]
先建立一个能看见的模型

[文本]
实例字段`s1.score=92`不会影响`s2.score=85`。而`static int count`适合表示所有Student共享的“已创建数量”等类级信息。

[代码 language=java]
class Student {
    String name;
    int score;
    static int count;
}
[/代码]

[文本]
创建对象时实例字段各有一份，static字段按类共享。不要因为“访问方便”就把业务状态都设static。

[示例 title=最小可验证示例]
说明：用最小输入观察本课核心规则。
语言：java

class Student {
    String name;
    int score;
    static int count;
}
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数字、名称或输入换掉，再独立推导一次。如果还能解释每一步，说明你理解的是规则而不是答案。

[警告 title=常见错误]
把学生分数设static会导致改一个对象时其他对象看见同一值。

[标题]
本课小结

[文本]
能区分实例状态与类级共享状态。

### 课时题目

#### 题目 4

题型：SINGLE_CHOICE
题干：每个学生分数不同，score应优先设计成？

难度：EASY
分值：10
知识点：字段
是否用于 Battle：否

选项：
- A. 实例字段 [正确]
- B. static字段
- C. final class名
- D. main参数

解析：
每个对象独立状态。

#### 题目 5

题型：SINGLE_CHOICE
题干：所有Student共享的创建数量更适合？

难度：MEDIUM
分值：10
知识点：static
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码阅读

选项：
- A. static count [正确]
- B. 每个对象独立count且互不相关
- C. 局部变量永远保存
- D. 接口常量

解析：
类级统计可static。

#### 题目 6

题型：CODE_FILL
题干：补全类级字段关键字。

难度：HARD
分值：10
知识点：static
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码：
```java
class Student {
    ____ int count = 0;
}
```

可接受答案：
```java
static
```

判题设置：
- 区分大小写：否
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
static表示类级共享成员。

标准完整代码：
```java
class Student {
    static int count = 0;
}
```


---

## 课时 3：构造方法建立合法对象

课时简介：避免对象创建后处于“名字null、分数未设置”的半成品状态。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
如果Student必须有name和score，构造方法可以强制创建时提供这些数据。

[标题]
先建立一个能看见的模型

[文本]
构造方法与类同名、无返回类型。`new Student("小林",92)`时执行构造方法，把参数赋给字段。`this.name`表示当前对象字段，右侧name是参数。

[代码 language=java]
class Student {
    String name;
    int score;

    Student(String name, int score) {
        this.name = name;
        this.score = score;
    }
}
[/代码]

[文本]
`this`解决字段与参数同名时的区分。构造方法目标是建立对象初始不变量。

[示例 title=最小可验证示例]
说明：用最小输入观察本课核心规则。
语言：java

class Student {
    String name;
    int score;

    Student(String name, int score) {
        this.name = name;
        this.score = score;
    }
}
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数字、名称或输入换掉，再独立推导一次。如果还能解释每一步，说明你理解的是规则而不是答案。

[警告 title=常见错误]
给构造方法写`void Student(...)`，那会变成普通方法，不是构造器。

[标题]
本课小结

[文本]
能定义并调用构造方法。

### 课时题目

#### 题目 7

题型：SINGLE_CHOICE
题干：构造方法是否写返回类型void？

难度：EASY
分值：10
知识点：构造方法
是否用于 Battle：否

选项：
- A. 不写 [正确]
- B. 必须void
- C. 必须int
- D. 必须Student类型

解析：
构造器无返回类型声明。

#### 题目 8

题型：SINGLE_CHOICE
题干：`this.name = name`左边表示？

难度：MEDIUM
分值：10
知识点：this
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码阅读

选项：
- A. 当前对象字段name [正确]
- B. 类名
- C. 父类字段一定
- D. JVM变量

解析：
this指当前对象。

#### 题目 9

题型：SINGLE_CHOICE
题干：构造方法能提升对象设计质量的一个原因是？

难度：HARD
分值：10
知识点：对象初始化
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码阅读

选项：
- A. 可以强制对象创建时获得必要初始状态 [正确]
- B. 让对象不占内存
- C. 自动生成数据库
- D. 避免所有异常

解析：
建立合法初值。


---

## 课时 4：实例方法描述行为

课时简介：让“修改分数”成为Student自己的行为，而不是外部随意写字段。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
对象不仅保存数据，还应该承担和自身状态紧密相关的规则。

[标题]
先建立一个能看见的模型

[文本]
加入`updateScore(int newScore)`，方法在Student内部更新score。外部调用`s.updateScore(95)`表达意图比直接`s.score=95`更清晰，也为后面校验留位置。

[代码 language=java]
class Student {
    private int score;

    void updateScore(int newScore) {
        score = newScore;
    }
}
[/代码]

[文本]
实例方法有隐含的当前对象this，因此不同Student调用同一方法会修改各自状态。

[示例 title=最小可验证示例]
说明：用最小输入观察本课核心规则。
语言：java

class Student {
    private int score;

    void updateScore(int newScore) {
        score = newScore;
    }
}
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数字、名称或输入换掉，再独立推导一次。如果还能解释每一步，说明你理解的是规则而不是答案。

[警告 title=常见错误]
把所有行为都做成static工具方法，然后传入Student，会削弱对象封装。

[标题]
本课小结

[文本]
能把与状态相关规则放入实例方法。

### 课时题目

#### 题目 10

题型：SINGLE_CHOICE
题干：调用`s.updateScore(95)`时修改的是谁的状态？

难度：EASY
分值：10
知识点：实例方法
是否用于 Battle：否

选项：
- A. s对象 [正确]
- B. 所有Student必定
- C. JVM全局
- D. 另一个随机对象

解析：
实例方法作用于当前对象。

#### 题目 11

题型：SINGLE_CHOICE
题干：把更新逻辑放方法里的优势是？

难度：MEDIUM
分值：10
知识点：封装
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码阅读

选项：
- A. 可以集中表达和校验业务规则 [正确]
- B. 能绕过所有类型检查
- C. 自动多线程安全
- D. 自动保存磁盘

解析：
行为封装。

#### 题目 12

题型：CODE_FILL
题干：补全调用。

难度：HARD
分值：10
知识点：方法调用
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码：
```java
Student s = new Student("小林", 92);
s.____(95);
```

可接受答案：
```java
updateScore
```

判题设置：
- 区分大小写：否
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
通过实例方法更新。

标准完整代码：
```java
Student s = new Student("小林", 92);
s.updateScore(95);
```


---

## 课时 5：private 保护内部状态

课时简介：理解封装不是“隐藏一切”，而是控制合法修改入口。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
如果score公开，任何代码都能写`s.score=-999`。private让外部不能直接修改，类自己可以通过方法维护规则。

[标题]
先建立一个能看见的模型

[文本]
`private int score;`配合`updateScore`检查0~100。非法值抛异常或拒绝，从而保证任何可观察Student都满足分数范围。

[代码 language=java]
void updateScore(int newScore) {
    if (newScore < 0 || newScore > 100) {
        throw new IllegalArgumentException("score 0..100");
    }
    this.score = newScore;
}
[/代码]

[文本]
封装的价值是维护“不变量”。private本身不是安全系统；通过反射等还有复杂情况，但普通设计层面能减少错误入口。

[示例 title=最小可验证示例]
说明：用最小输入观察本课核心规则。
语言：java

void updateScore(int newScore) {
    if (newScore < 0 || newScore > 100) {
        throw new IllegalArgumentException("score 0..100");
    }
    this.score = newScore;
}
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数字、名称或输入换掉，再独立推导一次。如果还能解释每一步，说明你理解的是规则而不是答案。

[警告 title=常见错误]
给字段private后又写一个不校验、任意set的setter，形式上封装但规则仍没保护。

[标题]
本课小结

[文本]
能用private+方法维护分数范围。

### 课时题目

#### 题目 13

题型：SINGLE_CHOICE
题干：score设为private主要带来什么？

难度：EASY
分值：10
知识点：private
是否用于 Battle：否

选项：
- A. 外部必须通过受控接口访问/修改 [正确]
- B. 字段自动加密
- C. 线程自动安全
- D. 永远不能读取

解析：
限制直接访问。

#### 题目 14

题型：SINGLE_CHOICE
题干：updateScore为什么要检查0~100？

难度：MEDIUM
分值：10
知识点：封装
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码阅读

选项：
- A. 维护Student对象合法状态 [正确]
- B. 为了提高CPU主频
- C. Java语法强制分数范围
- D. 为了创建数组

解析：
业务不变量。

#### 题目 15

题型：SINGLE_CHOICE
题干：“private + 无条件setter”为什么可能仍封装不足？

难度：HARD
分值：10
知识点：封装设计
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码阅读

选项：
- A. 外部仍可通过setter写入任何非法值 [正确]
- B. setter无法编译
- C. private会自动阻止方法
- D. Java禁止校验

解析：
关键是规则，不只是关键字。


---

## 课时 6：getter/setter 与业务规则

课时简介：避免机械地“每字段都生成getter/setter”。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
封装不是IDE自动生成访问器。应该根据业务允许哪些读取、哪些修改来设计方法。

[标题]
先建立一个能看见的模型

[文本]
score可以有`getScore()`读取，但修改可能叫`recordExamScore()`并校验考试存在、分数范围，甚至某些字段只在构造时设定不提供setter。

[代码 language=java]
public int getScore() {
    return score;
}

public void recordExamScore(int newScore) {
    if (newScore < 0 || newScore > 100) throw new IllegalArgumentException();
    score = newScore;
}
[/代码]

[文本]
方法名表达业务意图比`setScore`更有信息量。只读字段不必为了“完整”提供setter。

[示例 title=最小可验证示例]
说明：用最小输入观察本课核心规则。
语言：java

public int getScore() {
    return score;
}

public void recordExamScore(int newScore) {
    if (newScore < 0 || newScore > 100) throw new IllegalArgumentException();
    score = newScore;
}
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数字、名称或输入换掉，再独立推导一次。如果还能解释每一步，说明你理解的是规则而不是答案。

[警告 title=常见错误]
把getter/setter数量当成面向对象质量指标。

[标题]
本课小结

[文本]
能根据业务规则选择访问接口。

### 课时题目

#### 题目 16

题型：SINGLE_CHOICE
题干：所有private字段都必须提供setter吗？

难度：EASY
分值：10
知识点：getter setter
是否用于 Battle：否

选项：
- A. 不必须 [正确]
- B. 必须，否则Java报错
- C. 只有static必须
- D. 只有int必须

解析：
接口应按业务需要。

#### 题目 17

题型：SINGLE_CHOICE
题干：相比`setScore`，`recordExamScore`可能更好的原因是？

难度：MEDIUM
分值：10
知识点：业务方法
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码阅读

选项：
- A. 更明确表达业务意图和规则 [正确]
- B. 名字更长所以更快
- C. Java只允许record开头
- D. 自动持久化

解析：
命名传达行为。

#### 题目 18

题型：CODE_FILL
题干：补全getter返回字段。

难度：HARD
分值：10
知识点：getter
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码：
```java
public int getScore() {
    ____ score;
}
```

可接受答案：
```java
return
```

判题设置：
- 区分大小写：否
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
getter通过return返回状态。

标准完整代码：
```java
public int getScore() {
    return score;
}
```


---

## 第3章总结

[标题]
这一章真正学会了什么

[文本]
你已经从“公开数据盒子”走到能用构造方法和业务方法维护合法状态的对象。

现在你应该能够：

- 能从简单需求识别类与字段。
- 能区分实例状态与类级共享状态。
- 能定义并调用构造方法。
- 能把与状态相关规则放入实例方法。
- 能用private+方法维护分数范围。
- 能根据业务规则选择访问接口。

[提示 title=复习方式]
不要只重新看定义。盖住答案，用本章统一场景重新推一遍数据、代码或状态变化；能自己推出结果，才算掌握。

---

## 第3章综合挑战（不计分）

[标题]
设计不可随意破坏的Student

[文本]
要求name创建后不可为空、score始终0~100。设计字段、构造方法、getter和更新方法；列出三种非法调用并说明对象如何阻止。
