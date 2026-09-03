# 第10章：面向对象设计与综合实践

章节简介：把前九章能力放进一个能保存、更新和排行的学生成绩项目，重点检查职责边界而不是代码行数。
预计学习时间：90 分钟

章节学习目标：
- 理解并能应用从需求识别对象
- 理解并能应用单一职责
- 理解并能应用组合优于盲目继承
- 理解并能应用接口隔离变化
- 理解并能应用分层组织代码
- 理解并能应用完成学生成绩管理小项目

[标题]
本章统一场景

[文本]
最终项目使用CLI + Service + Domain + Repository分层，不引入大型框架。

---

## 课时 1：从需求识别对象

课时简介：先找业务名词和行为，而不是看到需求就建Controller。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
“学生选课后可以提交测验，系统计算成绩并生成报告”里有Student、Course、Enrollment/QuizAttempt等概念。对象边界来自业务职责。

[标题]
先建立一个能看见的模型

[文本]
Student保存身份；Course描述课程；Enrollment连接学生与课程进度；QuizAttempt保存一次作答和得分。不要让Student对象直接负责保存所有课程题目。

[代码 language=text]
Student ──< Enrollment >── Course
                    |
                    └── QuizAttempt
[/代码]

[文本]
识别对象后继续问“谁应该拥有这条规则”。规则应尽量靠近它维护的数据。

[示例 title=最小可验证示例]
说明：用最小输入观察本课核心规则。
语言：text

Student ──< Enrollment >── Course
                    |
                    └── QuizAttempt
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数字、名称或输入换掉，再独立推导一次。如果还能解释每一步，说明你理解的是规则而不是答案。

[警告 title=常见错误]
把每个数据库表机械一一映射成“领域设计正确”的类，或反过来把整个系统塞进App类。

[标题]
本课小结

[文本]
能从需求识别核心对象和关系。

### 课时题目

#### 题目 1

题型：SINGLE_CHOICE
题干：学生和课程之间的“选课进度”更适合由什么概念表达？

难度：EASY
分值：10
知识点：对象建模
是否用于 Battle：否

选项：
- A. Enrollment/选课关系对象 [正确]
- B. Student.name字段
- C. StringBuilder
- D. 异常类

解析：
关系本身有状态。

#### 题目 2

题型：SINGLE_CHOICE
题干：为什么不让Student直接保存所有Course内部题目逻辑？

难度：MEDIUM
分值：10
知识点：领域设计
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码阅读

选项：
- A. 职责会过大、耦合课程实现 [正确]
- B. Java语法禁止
- C. 对象不能引用对象
- D. Student没有内存

解析：
保持职责边界。

#### 题目 3

题型：SINGLE_CHOICE
题干：识别对象后下一步重要问题是什么？

难度：HARD
分值：10
知识点：对象设计
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码阅读

选项：
- A. 哪些状态和规则应该由哪个对象负责 [正确]
- B. 类名越长越好
- C. 全部做static
- D. 先写继承树再看需求

解析：
职责分配。


---

## 课时 2：单一职责

课时简介：让一个类只有一个主要变化原因。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
如果StudentService同时发邮件、生成PDF、算成绩、写数据库，任何需求变化都修改同一大类。

[标题]
先建立一个能看见的模型

[文本]
可以把成绩计算交GradeCalculator、通知交NotificationService、持久化交Repository。StudentService协调流程而非自己实现所有细节。

[代码 language=text]
EnrollmentService
 ├→ GradeCalculator
 ├→ StudentRepository
 └→ NotificationService
[/代码]

[文本]
单一职责不是“每个类只能一个方法”。它关注变化原因和概念职责。

[示例 title=最小可验证示例]
说明：用最小输入观察本课核心规则。
语言：text

EnrollmentService
 ├→ GradeCalculator
 ├→ StudentRepository
 └→ NotificationService
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数字、名称或输入换掉，再独立推导一次。如果还能解释每一步，说明你理解的是规则而不是答案。

[警告 title=常见错误]
过度拆分成几十个只有一行的类，同样降低可读性。

[标题]
本课小结

[文本]
能发现上帝类并按职责拆分。

### 课时题目

#### 题目 4

题型：SINGLE_CHOICE
题干：一个类同时负责PDF、邮件、数据库、成绩规则，最可能的问题是？

难度：EASY
分值：10
知识点：单一职责
是否用于 Battle：否

选项：
- A. 职责过多、耦合多种变化 [正确]
- B. 方法太少
- C. Java不允许Service
- D. 继承不够

解析：
SRP问题。

#### 题目 5

题型：SINGLE_CHOICE
题干：单一职责是否等于每类只能一个方法？

难度：MEDIUM
分值：10
知识点：SRP
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码阅读

选项：
- A. 不是 [正确]
- B. 是
- C. 只对接口适用
- D. 只对static适用

解析：
关注责任/变化原因。

#### 题目 6

题型：CODE_FILL
题干：补全职责分离。

难度：HARD
分值：10
知识点：职责设计
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码：
```text
成绩计算 → ____Calculator
```

可接受答案：
```text
Grade
```

判题设置：
- 区分大小写：否
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
用专门组件承载规则。

标准完整代码：
```text
成绩计算 → GradeCalculator
```


---

## 课时 3：组合优于盲目继承

课时简介：用对象协作代替不真实is-a层次。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
很多复用并不是类型关系。Car有Engine，不是Car是一种Engine；StudentService有Repository，也不是StudentService是一种Repository。

[标题]
先建立一个能看见的模型

[文本]
构造器注入`StudentRepository repository`，Service调用它保存数据。这种组合让实现可替换，也更容易测试。

[代码 language=java]
class StudentService {
    private final StudentRepository repository;

    StudentService(StudentRepository repository) {
        this.repository = repository;
    }
}
[/代码]

[文本]
组合把依赖显式化；继承则把父类实现和子类绑定。对“has-a/uses-a”关系优先考虑组合。

[示例 title=最小可验证示例]
说明：用最小输入观察本课核心规则。
语言：java

class StudentService {
    private final StudentRepository repository;

    StudentService(StudentRepository repository) {
        this.repository = repository;
    }
}
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数字、名称或输入换掉，再独立推导一次。如果还能解释每一步，说明你理解的是规则而不是答案。

[警告 title=常见错误]
为了复用repository方法让Service extends JdbcRepository，产生错误类型关系。

[标题]
本课小结

[文本]
能判断组合与继承。

### 课时题目

#### 题目 7

题型：SINGLE_CHOICE
题干：StudentService使用Repository更自然的关系是？

难度：EASY
分值：10
知识点：组合
是否用于 Battle：否

选项：
- A. 组合/依赖 [正确]
- B. 继承is-a
- C. 接口常量
- D. 静态全局变量

解析：
service uses repository。

#### 题目 8

题型：SINGLE_CHOICE
题干：组合的优势之一是？

难度：MEDIUM
分值：10
知识点：组合
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码阅读

选项：
- A. 依赖实现更容易替换/测试 [正确]
- B. 永远无需接口
- C. 对象数量减少到1
- D. 禁止多态

解析：
松耦合。

#### 题目 9

题型：SINGLE_CHOICE
题干：什么时候继承更合理？

难度：HARD
分值：10
知识点：继承设计
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码阅读

选项：
- A. 存在稳定且真实的is-a类型关系 [正确]
- B. 只要想复用三行代码
- C. 任何两个类有共同字段
- D. 为了避免构造器

解析：
继承表达类型。


---

## 课时 4：接口隔离变化

课时简介：让业务依赖“能力契约”，而不是某个数据库具体类。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
如果Service直接new JdbcStudentRepository，测试时很难替换成内存版本。依赖`StudentRepository`接口可以把存储变化隔离。

[标题]
先建立一个能看见的模型

[文本]
接口声明`findById/save`。生产注入Jdbc实现，测试注入InMemory实现。Service代码不用知道SQL细节。

[代码 language=java]
interface StudentRepository {
    Student findById(String id);
    void save(Student student);
}
[/代码]

[文本]
接口不是为了“每个类都配一个Ixxx”。只有当存在替换边界、测试替身或稳定契约时价值明显。

[示例 title=最小可验证示例]
说明：用最小输入观察本课核心规则。
语言：java

interface StudentRepository {
    Student findById(String id);
    void save(Student student);
}
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数字、名称或输入换掉，再独立推导一次。如果还能解释每一步，说明你理解的是规则而不是答案。

[警告 title=常见错误]
没有任何替换需求也创建大量一对一空接口，增加导航成本。

[标题]
本课小结

[文本]
能用接口隔离可替换依赖。

### 课时题目

#### 题目 10

题型：SINGLE_CHOICE
题干：Service依赖Repository接口的主要好处是？

难度：EASY
分值：10
知识点：接口设计
是否用于 Battle：否

选项：
- A. 可替换具体存储实现并便于测试 [正确]
- B. 接口自动连接数据库
- C. 运行速度翻倍
- D. 无需对象

解析：
依赖倒置/隔离实现。

#### 题目 11

题型：SINGLE_CHOICE
题干：测试时可注入什么替代真实DB？

难度：MEDIUM
分值：10
知识点：可测试性
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码阅读

选项：
- A. InMemoryStudentRepository [正确]
- B. JVM字节码
- C. StringBuilder
- D. Thread.sleep

解析：
测试替身实现同接口。

#### 题目 12

题型：CODE_FILL
题干：补全接口实现关键字。

难度：HARD
分值：10
知识点：接口
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码：
```java
class InMemoryRepo ____ StudentRepository { }
```

可接受答案：
```java
implements
```

判题设置：
- 区分大小写：否
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
实现接口用implements。

标准完整代码：
```java
class InMemoryRepo implements StudentRepository { }
```


---

## 课时 5：分层组织代码

课时简介：理解Controller/Service/Repository不是为了目录好看。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
分层让HTTP输入、业务规则和数据访问各自有边界。Controller解析请求并返回响应；Service执行用例和业务规则；Repository负责持久化。

[标题]
先建立一个能看见的模型

[文本]
“更新分数”：Controller验证请求格式→Service调用Student.recordExamScore并决定流程→Repository保存→Controller转换响应。

[代码 language=text]
HTTP Request
  ↓ Controller
Use case / rules
  ↓ Service + Domain
Persistence
  ↓ Repository
Database
[/代码]

[文本]
层之间不应把数据库实体细节随意泄漏到所有地方。设计DTO/领域模型边界要结合项目规模。

[示例 title=最小可验证示例]
说明：用最小输入观察本课核心规则。
语言：text

HTTP Request
  ↓ Controller
Use case / rules
  ↓ Service + Domain
Persistence
  ↓ Repository
Database
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数字、名称或输入换掉，再独立推导一次。如果还能解释每一步，说明你理解的是规则而不是答案。

[警告 title=常见错误]
Service只是把Controller参数原样转给Repository，没有任何业务意义，形成“形式分层”。

[标题]
本课小结

[文本]
能解释基础三层职责和一次请求路径。

### 课时题目

#### 题目 13

题型：SINGLE_CHOICE
题干：Repository主要负责什么？

难度：EASY
分值：10
知识点：分层
是否用于 Battle：否

选项：
- A. 数据持久化访问 [正确]
- B. HTTP路由解析
- C. CSS渲染
- D. 线程调度

解析：
持久层抽象。

#### 题目 14

题型：SINGLE_CHOICE
题干：业务规则“分数必须0~100”最不应该只放在哪里？

难度：MEDIUM
分值：10
知识点：分层规则
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码阅读

选项：
- A. 仅Controller里 [正确]
- B. 领域对象/Service可维护
- C. 构造方法可维护
- D. 业务方法可维护

解析：
只在入口校验会被其他调用绕过。

#### 题目 15

题型：SINGLE_CHOICE
题干：分层设计真正目的是什么？

难度：HARD
分值：10
知识点：架构
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码阅读

选项：
- A. 控制职责和依赖边界，降低变化扩散 [正确]
- B. 增加文件数量
- C. 让方法都只有一行
- D. 自动提升数据库速度

解析：
边界管理。


---

## 课时 6：完成学生成绩管理小项目

课时简介：把对象、集合、异常、IO和Stream组合到一条业务路径。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
综合项目不是再学新API，而是检查前面能力能否协同：数据必须合法、能保存、能查询、能排行、错误有明确处理。

[标题]
先建立一个能看见的模型

[文本]
设计Student（不变量）、StudentRepository（接口）、FileStudentRepository（文件实现）、StudentService（用例）、main/CLI（输入输出）。排行榜用Stream，文件IO用try-with-resources，非法分数抛明确异常。

[代码 language=text]
CLI → StudentService → Student
          |
          +→ StudentRepository(interface)
                 ↓
           FileStudentRepository

ranking: List<Student> → Stream → top3
[/代码]

[文本]
先做最小闭环：新增学生→保存→重启加载→更新分数→排行。不要一开始加GUI、网络和数据库，把核心规则淹没。

[示例 title=最小可验证示例]
说明：用最小输入观察本课核心规则。
语言：text

CLI → StudentService → Student
          |
          +→ StudentRepository(interface)
                 ↓
           FileStudentRepository

ranking: List<Student> → Stream → top3
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数字、名称或输入换掉，再独立推导一次。如果还能解释每一步，说明你理解的是规则而不是答案。

[警告 title=常见错误]
项目综合时把所有代码又塞回一个Main.java，前面对象设计全部失效。

[标题]
本课小结

[文本]
能规划一个小型Java项目的类职责。

### 课时题目

#### 题目 16

题型：SINGLE_CHOICE
题干：综合项目第一版最重要的目标是什么？

难度：EASY
分值：10
知识点：综合设计
是否用于 Battle：否

选项：
- A. 核心业务闭环可运行且规则清晰 [正确]
- B. 文件数量越多越好
- C. 先接所有外部框架
- D. 先写100个接口

解析：
MVP闭环。

#### 题目 17

题型：SINGLE_CHOICE
题干：排行榜逻辑更适合输入什么？

难度：MEDIUM
分值：10
知识点：项目设计
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码阅读

选项：
- A. Student集合 [正确]
- B. 文件名字符串本身
- C. 异常堆栈
- D. JVM参数

解析：
对学生数据处理。

#### 题目 18

题型：CODE_FILL
题干：补全依赖方向。

难度：HARD
分值：10
知识点：项目结构
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码：
```text
StudentService → Student____ 接口 → FileStudentRepository
```

可接受答案：
```text
Repository
```

判题设置：
- 区分大小写：否
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
业务层依赖抽象存储。

标准完整代码：
```text
StudentService → StudentRepository 接口 → FileStudentRepository
```


---

## 第10章总结

[标题]
这一章真正学会了什么

[文本]
你已经从Java语法走到能设计一个小型可维护系统：对象守住规则，集合组织数据，异常表达失败，IO负责持久化，Stream完成数据处理。

现在你应该能够：

- 能从需求识别核心对象和关系。
- 能发现上帝类并按职责拆分。
- 能判断组合与继承。
- 能用接口隔离可替换依赖。
- 能解释基础三层职责和一次请求路径。
- 能规划一个小型Java项目的类职责。

[提示 title=复习方式]
不要只重新看定义。盖住答案，用本章统一场景重新推一遍数据、代码或状态变化；能自己推出结果，才算掌握。

---

## 第10章综合挑战（不计分）

[标题]
完成可重启的成绩管理CLI

[文本]
实现新增/更新/查询/Top3四个命令。程序退出前保存，启动时加载。要求非法分数不能进入对象、存储实现可替换、业务层不直接操作文件路径。
