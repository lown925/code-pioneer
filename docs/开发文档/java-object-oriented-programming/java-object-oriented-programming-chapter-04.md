# 第4章：继承、多态与抽象

章节简介：从is-a关系到动态分派和接口，理解复用代码只是结果，多态抽象才是核心设计价值。
预计学习时间：90 分钟

章节学习目标：
- 理解并能应用继承复用共同结构
- 理解并能应用super 与父类构造
- 理解并能应用方法重写
- 理解并能应用父类型引用指向子对象
- 理解并能应用抽象类表达共同约束
- 理解并能应用接口表达能力而不是身份

[标题]
本章统一场景

[文本]
本章使用Person、Student、Teacher和CanLogin能力接口。

---

## 课时 1：继承复用共同结构

课时简介：从Student/Teacher都有name开始，但先问“真的是is-a吗”。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
继承适合表达稳定的“是一个”关系，而不只是为了少写几行。Student和Teacher都可以是Person，继承Person的name字段/通用行为。

[标题]
先建立一个能看见的模型

[文本]
父类Person定义name和`describe()`；Student extends Person增加score。子类对象包含父类定义的那部分状态。

[代码 language=java]
class Person {
    protected String name;
}

class Student extends Person {
    private int score;
}
[/代码]

[文本]
继承会形成强耦合。若关系只是“有一个”，例如Student有Address，应优先组合而不是Student extends Address。

[示例 title=最小可验证示例]
说明：用最小输入观察本课核心规则。
语言：java

class Person {
    protected String name;
}

class Student extends Person {
    private int score;
}
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数字、名称或输入换掉，再独立推导一次。如果还能解释每一步，说明你理解的是规则而不是答案。

[警告 title=常见错误]
为了代码复用让Student继承DatabaseUtil，这不符合is-a关系。

[标题]
本课小结

[文本]
能判断基础is-a继承关系。

### 课时题目

#### 题目 1

题型：SINGLE_CHOICE
题干：Student extends Person最合理的语义是？

难度：EASY
分值：10
知识点：继承
是否用于 Battle：否

选项：
- A. Student是一种Person [正确]
- B. Student拥有一个Person工具
- C. Person是一张数据库表
- D. Student只是为了少写代码

解析：
继承表达is-a。

#### 题目 2

题型：SINGLE_CHOICE
题干：Student有Address更自然用？

难度：MEDIUM
分值：10
知识点：组合与继承
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码阅读

选项：
- A. 组合字段Address [正确]
- B. Student extends Address
- C. static继承
- D. main继承

解析：
has-a用组合。

#### 题目 3

题型：SINGLE_CHOICE
题干：为什么“为了复用代码就继承”可能有问题？

难度：HARD
分值：10
知识点：继承设计
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码阅读

选项：
- A. 会制造不真实的类型关系和强耦合 [正确]
- B. 继承不能复用代码
- C. Java禁止多类
- D. 对象会变null

解析：
继承首先是类型语义。


---

## 课时 2：super 与父类构造

课时简介：理解子类创建时父类部分也必须初始化。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
Student继承Person的name，如果Person要求构造时提供name，Student构造器需要调用父类构造器。

[标题]
先建立一个能看见的模型

[文本]
`Student(String name,int score){ super(name); this.score=score; }`。`super(name)`必须在构造器第一条语句位置（显式调用时）。

[代码 language=java]
class Person {
    Person(String name) { this.name = name; }
}
class Student extends Person {
    Student(String name, int score) {
        super(name);
        this.score = score;
    }
}
[/代码]

[文本]
先完成父类初始化，再完成子类新增状态。若父类没有无参构造且子类不显式super参数，编译会失败。

[示例 title=最小可验证示例]
说明：用最小输入观察本课核心规则。
语言：java

class Person {
    Person(String name) { this.name = name; }
}
class Student extends Person {
    Student(String name, int score) {
        super(name);
        this.score = score;
    }
}
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数字、名称或输入换掉，再独立推导一次。如果还能解释每一步，说明你理解的是规则而不是答案。

[警告 title=常见错误]
以为子类构造器会自动“复制父类所有构造参数逻辑”而无需匹配构造器。

[标题]
本课小结

[文本]
能正确使用super调用父类构造。

### 课时题目

#### 题目 4

题型：SINGLE_CHOICE
题干：`super(name)`在子类构造器中作用是？

难度：EASY
分值：10
知识点：super
是否用于 Battle：否

选项：
- A. 调用父类构造器初始化父类部分 [正确]
- B. 创建第二个父对象
- C. 调用当前类方法
- D. 删除父字段

解析：
super构造父类状态。

#### 题目 5

题型：SINGLE_CHOICE
题干：父类只有`Person(String name)`时，子类构造器不提供合适super调用可能？

难度：MEDIUM
分值：10
知识点：构造链
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码阅读

选项：
- A. 编译失败 [正确]
- B. 自动传空字符串
- C. 运行后随机
- D. 忽略父类构造

解析：
不存在无参父构造可隐式调用。

#### 题目 6

题型：CODE_FILL
题干：补全。

难度：HARD
分值：10
知识点：super
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码：
```java
Student(String name,int score){
    ____(name);
    this.score = score;
}
```

可接受答案：
```java
super
```

判题设置：
- 区分大小写：否
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
super调用父类构造器。

标准完整代码：
```java
Student(String name,int score){
    super(name);
    this.score = score;
}
```


---

## 课时 3：方法重写

课时简介：让子类在共同接口下提供不同实现。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
Person可以定义`role()`，Student和Teacher都需要回答角色，但结果不同。子类重写同签名方法。

[标题]
先建立一个能看见的模型

[文本]
使用`@Override`让编译器检查是否真的覆盖父类方法。Student.role返回“学生”，Teacher.role返回“教师”。

[代码 language=java]
class Person { String role(){ return "人员"; } }
class Student extends Person {
    @Override String role(){ return "学生"; }
}
[/代码]

[文本]
重写发生在运行时动态分派的基础上。方法签名要匹配；若只是参数不同，那叫重载overload，不是override。

[示例 title=最小可验证示例]
说明：用最小输入观察本课核心规则。
语言：java

class Person { String role(){ return "人员"; } }
class Student extends Person {
    @Override String role(){ return "学生"; }
}
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数字、名称或输入换掉，再独立推导一次。如果还能解释每一步，说明你理解的是规则而不是答案。

[警告 title=常见错误]
拼错方法名却没写@Override，误以为成功重写。

[标题]
本课小结

[文本]
能区分override和overload。

### 课时题目

#### 题目 7

题型：SINGLE_CHOICE
题干：`@Override`主要帮助什么？

难度：EASY
分值：10
知识点：方法重写
是否用于 Battle：否

选项：
- A. 让编译器检查是否正确重写父类方法 [正确]
- B. 让方法运行两次
- C. 自动变static
- D. 创建接口

解析：
编译检查。

#### 题目 8

题型：SINGLE_CHOICE
题干：同名但参数列表不同通常属于？

难度：MEDIUM
分值：10
知识点：重载重写
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码阅读

选项：
- A. 重载overload [正确]
- B. 重写override
- C. 继承删除
- D. 封装

解析：
重载根据参数区分。

#### 题目 9

题型：SINGLE_CHOICE
题干：父类引用指向Student并调用被重写role时，实际通常执行谁的实现？

难度：HARD
分值：10
知识点：重写
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码阅读

选项：
- A. Student的实现 [正确]
- B. 永远父类
- C. 随机
- D. 编译器源码位置

解析：
动态分派。


---

## 课时 4：父类型引用指向子对象

课时简介：理解多态为什么让调用者不必写一堆instanceof。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
如果打印所有人员信息，调用者只需要知道Person公共接口，不必分别维护Student/Teacher分支。

[标题]
先建立一个能看见的模型

[文本]
`List<Person>`里放Student和Teacher；循环调用`p.role()`，JVM根据对象真实类型执行各自重写方法。变量静态类型Person限制“能调用哪些公开成员”，实际对象类型决定被重写方法实现。

[代码 language=java]
List<Person> people = List.of(
    new Student("小林", 92),
    new Teacher("王老师")
);
for (Person p : people) {
    System.out.println(p.role());
}
[/代码]

[文本]
这就是多态的实用价值：调用端面向共同抽象，新子类加入时原循环通常不用修改。

[示例 title=最小可验证示例]
说明：用最小输入观察本课核心规则。
语言：java

List<Person> people = List.of(
    new Student("小林", 92),
    new Teacher("王老师")
);
for (Person p : people) {
    System.out.println(p.role());
}
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数字、名称或输入换掉，再独立推导一次。如果还能解释每一步，说明你理解的是规则而不是答案。

[警告 title=常见错误]
把父类型引用理解为子对象“被裁剪成父对象”。对象本身仍是Student，只是引用视角受Person接口限制。

[标题]
本课小结

[文本]
能根据运行时类型判断重写调用结果。

### 课时题目

#### 题目 10

题型：SINGLE_CHOICE
题干：`Person p = new Student(...)`是否合法（Student extends Person）？

难度：EASY
分值：10
知识点：多态
是否用于 Battle：否

选项：
- A. 合法 [正确]
- B. 不合法
- C. 只在接口中合法
- D. 必须强转为Object

解析：
向上转型。

#### 题目 11

题型：SINGLE_CHOICE
题干：调用`p.role()`时若Student重写role，通常输出？

难度：MEDIUM
分值：10
知识点：多态
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码阅读

选项：
- A. Student实现结果 [正确]
- B. 永远Person结果
- C. 编译错误
- D. 两个结果拼接

解析：
动态分派。

#### 题目 12

题型：CODE_FILL
题干：补全容器类型以存放多种Person子类。

难度：HARD
分值：10
知识点：多态集合
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码：
```java
List<____> people = List.of(new Student(...), new Teacher(...));
```

可接受答案：
```java
Person
```

判题设置：
- 区分大小写：否
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
共同父类型作为抽象。

标准完整代码：
```java
List<Person> people = List.of(new Student(...), new Teacher(...));
```


---

## 课时 5：抽象类表达共同约束

课时简介：当父类不应该有一个“默认实现”时，用abstract明确要求子类完成。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
如果每种人员都必须计算权限级别，但Person本身无法给合理通用答案，可以把方法声明abstract。

[标题]
先建立一个能看见的模型

[文本]
抽象类不能直接new，子类必须实现抽象方法（除非子类也抽象）。抽象类仍可包含字段、构造器和已实现方法。

[代码 language=java]
abstract class Person {
    abstract int permissionLevel();
}
class Student extends Person {
    @Override int permissionLevel(){ return 1; }
}
[/代码]

[文本]
抽象类表达“共同身份+部分共同实现+未完成约束”。

[示例 title=最小可验证示例]
说明：用最小输入观察本课核心规则。
语言：java

abstract class Person {
    abstract int permissionLevel();
}
class Student extends Person {
    @Override int permissionLevel(){ return 1; }
}
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数字、名称或输入换掉，再独立推导一次。如果还能解释每一步，说明你理解的是规则而不是答案。

[警告 title=常见错误]
认为abstract class不能有任何普通方法或构造器。它可以。

[标题]
本课小结

[文本]
能用抽象类定义必须实现的行为。

### 课时题目

#### 题目 13

题型：SINGLE_CHOICE
题干：抽象类可以直接`new Person()`吗？

难度：EASY
分值：10
知识点：抽象类
是否用于 Battle：否

选项：
- A. 通常不能 [正确]
- B. 一定能
- C. 只有main中能
- D. 只要字段为空能

解析：
抽象类不可实例化。

#### 题目 14

题型：SINGLE_CHOICE
题干：抽象类能否包含已实现普通方法？

难度：MEDIUM
分值：10
知识点：抽象类
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码阅读

选项：
- A. 能 [正确]
- B. 不能
- C. 只在接口能
- D. Java没有普通方法

解析：
抽象类可混合实现。

#### 题目 15

题型：SINGLE_CHOICE
题干：把permissionLevel声明abstract最直接表达什么？

难度：HARD
分值：10
知识点：抽象方法
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码阅读

选项：
- A. 每个具体子类必须提供自己的实现 [正确]
- B. 权限永远为0
- C. 方法自动private
- D. 父类被删除

解析：
抽象约束。


---

## 课时 6：接口表达能力而不是身份

课时简介：区分“是什么”与“能做什么”。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
一个类只有单继承，但对象可能具备多种独立能力，例如CanLogin、Exportable。接口适合表达这种行为契约。

[标题]
先建立一个能看见的模型

[文本]
Student implements CanLogin，Admin也implements CanLogin；调用者只依赖`CanLogin.login()`，无需知道它们继承自哪个父类。

[代码 language=java]
interface CanLogin {
    boolean login(String password);
}
class Student extends Person implements CanLogin {
    public boolean login(String password) {
        return password.length() >= 8;
    }
}
[/代码]

[文本]
接口支持一个类实现多个能力契约。现代Java接口也能有default/static方法，但核心仍是面向行为抽象。

[示例 title=最小可验证示例]
说明：用最小输入观察本课核心规则。
语言：java

interface CanLogin {
    boolean login(String password);
}
class Student extends Person implements CanLogin {
    public boolean login(String password) {
        return password.length() >= 8;
    }
}
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数字、名称或输入换掉，再独立推导一次。如果还能解释每一步，说明你理解的是规则而不是答案。

[警告 title=常见错误]
把所有类层次都改成接口，忽略共享状态和共同实现需求；或把接口命名成模糊“Manager”不表达能力。

[标题]
本课小结

[文本]
能选择抽象类和接口的基本场景。

### 课时题目

#### 题目 16

题型：SINGLE_CHOICE
题干：接口更适合表达哪种关系？

难度：EASY
分值：10
知识点：接口
是否用于 Battle：否

选项：
- A. 对象具备某种能力/契约 [正确]
- B. 对象一定共享同一实例字段
- C. 磁盘分区关系
- D. JVM线程数量

解析：
接口表达行为契约。

#### 题目 17

题型：SINGLE_CHOICE
题干：Java类能否实现多个接口？

难度：MEDIUM
分值：10
知识点：接口
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码阅读

选项：
- A. 能 [正确]
- B. 不能
- C. 最多一个
- D. 只有abstract类能

解析：
Java支持多接口。

#### 题目 18

题型：CODE_FILL
题干：补全关键字。

难度：HARD
分值：10
知识点：接口
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码：
```java
class Student extends Person ____ CanLogin {
    // ...
}
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
类实现接口用implements。

标准完整代码：
```java
class Student extends Person implements CanLogin {
    // ...
}
```


---

## 第4章总结

[标题]
这一章真正学会了什么

[文本]
你已经能用继承表达稳定类型关系、用重写实现多态、用抽象类和接口定义共同契约。

现在你应该能够：

- 能判断基础is-a继承关系。
- 能正确使用super调用父类构造。
- 能区分override和overload。
- 能根据运行时类型判断重写调用结果。
- 能用抽象类定义必须实现的行为。
- 能选择抽象类和接口的基本场景。

[提示 title=复习方式]
不要只重新看定义。盖住答案，用本章统一场景重新推一遍数据、代码或状态变化；能自己推出结果，才算掌握。

---

## 第4章综合挑战（不计分）

[标题]
扩展人员系统而不改遍历代码

[文本]
新增Admin类，让Student/Teacher/Admin都继承Person并重写role；Student/Admin实现CanLogin。写一个List<Person>输出role，再写方法只接收CanLogin执行登录。
