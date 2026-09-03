# 课程信息

课程名称：Java 面向对象程序设计
课程标识：java-object-oriented-programming
课程分类：程序设计
编程语言：Java
难度：BEGINNER
预计学习时间：1200 分钟
课程简介：用“做一个学生成绩管理小系统”贯穿 Java 语法与面向对象思想。每个概念都先解释为什么需要，再用可运行代码展示对象状态、集合和控制流怎样变化。
适合人群：已经接触过变量、条件、循环等基础编程概念，希望系统学习 Java 和面向对象设计的初学者。
课程封面：
发布状态：PUBLISHED

学习目标：
- 能阅读并编写基础Java程序
- 能用类和对象组织状态与行为
- 能理解继承、多态、接口和封装
- 能使用异常、集合、IO、Lambda和Stream完成常见任务
- 能把需求拆成可维护的面向对象结构

---

# 第1章：Java 与面向对象程序设计入门

章节简介：从Java运行机制进入类、对象和引用，为后续面向对象设计建立真正可运行的基础。
预计学习时间：90 分钟

章节学习目标：
- 理解并能应用Java 程序从源码到运行
- 理解并能应用class 与 main 的角色
- 理解并能应用变量与基本类型复习
- 理解并能应用引用类型的第一印象
- 理解并能应用创建第一个对象
- 理解并能应用用对象组织学生信息

[标题]
本章统一场景

[文本]
本章统一使用Student学生对象，字段为name和score。

---

## 课时 1：Java 程序从源码到运行

课时简介：先解释JDK、编译和JVM在做什么。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
Java源码不是CPU直接执行的机器指令。理解编译到字节码、JVM再执行，有助于看懂“跨平台”和运行环境错误。

[标题]
先建立一个能看见的模型

[文本]
`javac Hello.java`把源码编译成`.class`字节码；`java Hello`启动JVM加载类并执行`main`。同一份字节码可以在不同平台的JVM上运行。

[代码 language=text]
Hello.java
  ↓ javac
Hello.class (bytecode)
  ↓ java / JVM
JVM解释/JIT → 本机机器指令
[/代码]

[文本]
JVM不是Java源码编辑器，它是运行字节码的虚拟机。JDK包含编译器等开发工具，JRE/运行环境关注运行所需组件。

[示例 title=最小可验证示例]
说明：用最小输入观察本课核心规则。
语言：text

Hello.java
  ↓ javac
Hello.class (bytecode)
  ↓ java / JVM
JVM解释/JIT → 本机机器指令
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数字、名称或输入换掉，再独立推导一次。如果还能解释每一步，说明你理解的是规则而不是答案。

[警告 title=常见错误]
把“Java跨平台”理解成CPU直接认识.class。实际是每个平台提供对应JVM。

[标题]
本课小结

[文本]
能说出源码、字节码、JVM三者关系。

### 课时题目

#### 题目 1

题型：SINGLE_CHOICE
题干：`javac` 的主要作用是什么？

难度：EASY
分值：10
知识点：Java运行
是否用于 Battle：否

选项：
- A. 把.java源码编译成.class字节码 [正确]
- B. 运行网页
- C. 创建数据库表
- D. 启动TCP服务器

解析：
javac是Java编译器。

#### 题目 2

题型：SINGLE_CHOICE
题干：为什么同一份.class可以在不同操作系统运行？

难度：MEDIUM
分值：10
知识点：JVM
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码阅读

选项：
- A. 不同平台有实现JVM来执行统一字节码 [正确]
- B. CPU都直接理解Java语法
- C. class文件是图片
- D. 操作系统忽略机器指令

解析：
JVM提供平台适配。

#### 题目 3

题型：SINGLE_CHOICE
题干：出现“找不到或无法加载主类”时，更可能与哪一阶段有关？

难度：HARD
分值：10
知识点：Java运行
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码阅读

选项：
- A. JVM启动/类路径和类加载 [正确]
- B. 数据库索引
- C. 网络ARP
- D. 文件字符编码一定错误

解析：
这是Java运行环境和类加载问题。


---

## 课时 2：class 与 main 的角色

课时简介：理解为什么第一段Java代码看起来比Python长。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
Java把代码组织在类中。独立运行一个普通Java应用时，JVM需要一个约定入口：`public static void main(String[] args)`。

[标题]
先建立一个能看见的模型

[文本]
类是代码和对象结构的组织单位；main只是程序入口方法，不代表“所有代码必须写main里”。随着程序增长，我们会把业务行为拆到其他类和方法。

[代码 language=java]
public class Hello {
    public static void main(String[] args) {
        System.out.println("Hello Java");
    }
}
[/代码]

[文本]
JVM找到Hello类并调用main，main再执行println。`System.out.println`输出后自动换行。

[示例 title=最小可验证示例]
说明：用最小输入观察本课核心规则。
语言：java

public class Hello {
    public static void main(String[] args) {
        System.out.println("Hello Java");
    }
}
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数字、名称或输入换掉，再独立推导一次。如果还能解释每一步，说明你理解的是规则而不是答案。

[警告 title=常见错误]
把所有业务逻辑永久堆进main。main适合作为启动入口，而不是万能函数。

[标题]
本课小结

[文本]
能写出一个可运行的Java入口类。

### 课时题目

#### 题目 4

题型：SINGLE_CHOICE
题干：普通Java应用的常见入口方法是？

难度：EASY
分值：10
知识点：main
是否用于 Battle：否

选项：
- A. public static void main(String[] args) [正确]
- B. void startServer()
- C. SELECT main
- D. public class only

解析：
JVM按约定查找main。

#### 题目 5

题型：SINGLE_CHOICE
题干：`System.out.println` 与 `print` 的直观区别之一是？

难度：MEDIUM
分值：10
知识点：输出
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码阅读

选项：
- A. println输出后换行 [正确]
- B. println只能输出数字
- C. print一定报错
- D. 两者都创建对象

解析：
println常自动换行。

#### 题目 6

题型：CODE_FILL
题干：补全入口方法名。

难度：HARD
分值：10
知识点：main
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码：
```java
public static void ____(String[] args) {
    System.out.println("Hi");
}
```

可接受答案：
```java
main
```

判题设置：
- 区分大小写：否
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
标准入口方法名是main。

标准完整代码：
```java
public static void main(String[] args) {
    System.out.println("Hi");
}
```


---

## 课时 3：变量与基本类型复习

课时简介：把Java类型和变量状态建立起来。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
Java是静态类型语言，变量声明时要有类型。类型限制了变量可保存的值，也让编译器提前发现部分错误。

[标题]
先建立一个能看见的模型

[文本]
`int score=92`保存整数；`double price=19.9`保存小数；`boolean passed=true`保存布尔；`char level=单引号A`保存单个字符。String不是基本类型，而是类。

[代码 language=java]
int score = 92;
double price = 19.9;
boolean passed = true;
char level = 'A';
String name = "小林";
[/代码]

[文本]
变量重新赋值必须仍符合类型，例如`score=95`可以，但`score="95"`会编译失败，因为String不能直接赋给int。

[示例 title=最小可验证示例]
说明：用最小输入观察本课核心规则。
语言：java

int score = 92;
double price = 19.9;
boolean passed = true;
char level = 'A';
String name = "小林";
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数字、名称或输入换掉，再独立推导一次。如果还能解释每一步，说明你理解的是规则而不是答案。

[警告 title=常见错误]
把`"A"`和`'A'`混用：前者String，后者char。

[标题]
本课小结

[文本]
能区分常见基本类型和String。

### 课时题目

#### 题目 7

题型：SINGLE_CHOICE
题干：下面哪个声明保存布尔值？

难度：EASY
分值：10
知识点：基本类型
是否用于 Battle：否

选项：
- A. boolean passed = true; [正确]
- B. int passed = true;
- C. char passed = "true";
- D. String passed = 1;

解析：
boolean保存true/false。

#### 题目 8

题型：SINGLE_CHOICE
题干：`char grade = 'A';` 中为什么用单引号？

难度：MEDIUM
分值：10
知识点：char
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码阅读

选项：
- A. char表示单个字符 [正确]
- B. 单引号表示整数
- C. String必须单引号
- D. Java不支持双引号

解析：
char字面量用单引号。

#### 题目 9

题型：SINGLE_CHOICE
题干：为什么 `int score = "92";` 不能直接编译？

难度：HARD
分值：10
知识点：类型检查
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码阅读

选项：
- A. 右侧是String，类型不兼容 [正确]
- B. 92太大
- C. int不能赋初值
- D. 变量名score保留字

解析：
静态类型检查。


---

## 课时 4：引用类型的第一印象

课时简介：理解对象变量通常保存“引用”，不是把整个对象复制进变量。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
Java中对象通过`new`创建，变量如`Student s`保存对对象的引用。两个变量可以指向同一个对象，因此通过一个引用修改对象，另一个引用也能观察到。

[标题]
先建立一个能看见的模型

[文本]
`Student a=new Student(); Student b=a;` 后a和b引用同一对象。`b.score=100`后读取`a.score`也是100。

[代码 language=java]
Student a = new Student();
a.score = 80;
Student b = a;
b.score = 100;
System.out.println(a.score); // 100
[/代码]

[文本]
`b=a`复制的是引用值，不会自动克隆对象。这个直觉对后面集合、方法参数和对象共享非常重要。

[示例 title=最小可验证示例]
说明：用最小输入观察本课核心规则。
语言：java

Student a = new Student();
a.score = 80;
Student b = a;
b.score = 100;
System.out.println(a.score); // 100
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数字、名称或输入换掉，再独立推导一次。如果还能解释每一步，说明你理解的是规则而不是答案。

[警告 title=常见错误]
把`b=a`理解为“创建一个完全独立副本”。如果需要深复制要显式实现。

[标题]
本课小结

[文本]
能根据引用别名判断对象状态。

### 课时题目

#### 题目 10

题型：SINGLE_CHOICE
题干：执行 `Student b = a;` 后通常发生什么？

难度：EASY
分值：10
知识点：引用类型
是否用于 Battle：否

选项：
- A. b和a指向同一个Student对象 [正确]
- B. 自动复制出独立对象
- C. a变成null
- D. 两个对象互相删除

解析：
引用赋值不克隆。

#### 题目 11

题型：SINGLE_CHOICE
题干：若b和a指向同一对象，`b.score=100`后`a.score`通常是？

难度：MEDIUM
分值：10
知识点：引用别名
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码阅读

选项：
- A. 100 [正确]
- B. 原值永远不变
- C. null
- D. 编译失败

解析：
两引用观察同一对象。

#### 题目 12

题型：CODE_FILL
题干：补全对象创建关键字。

难度：HARD
分值：10
知识点：对象创建
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码：
```java
Student s = ____ Student();
```

可接受答案：
```java
new
```

判题设置：
- 区分大小写：否
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
new创建对象实例。

标准完整代码：
```java
Student s = new Student();
```


---

## 课时 5：创建第一个对象

课时简介：从数据散落转向“一个对象代表一个学生”。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
只用独立变量`name1,score1,name2,score2`会随着人数增加迅速失控。类让同一实体的相关数据聚在一起。

[标题]
先建立一个能看见的模型

[文本]
定义Student含name和score字段，再创建两个对象。每个对象有自己的字段状态，但共享同一类定义。

[代码 language=java]
class Student {
    String name;
    int score;
}

Student s1 = new Student();
s1.name = "小林";
s1.score = 92;

Student s2 = new Student();
s2.name = "小周";
s2.score = 85;
[/代码]

[文本]
类像结构说明，对象是具体实例。`s1.score`和`s2.score`分别属于不同对象。

[示例 title=最小可验证示例]
说明：用最小输入观察本课核心规则。
语言：java

class Student {
    String name;
    int score;
}

Student s1 = new Student();
s1.name = "小林";
s1.score = 92;

Student s2 = new Student();
s2.name = "小周";
s2.score = 85;
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数字、名称或输入换掉，再独立推导一次。如果还能解释每一步，说明你理解的是规则而不是答案。

[警告 title=常见错误]
把class定义和对象实例当成同一件事。定义类不会自动创建学生对象。

[标题]
本课小结

[文本]
能定义简单类并创建多个实例。

### 课时题目

#### 题目 13

题型：SINGLE_CHOICE
题干：class Student 的作用更接近什么？

难度：EASY
分值：10
知识点：类与对象
是否用于 Battle：否

选项：
- A. 定义Student对象的结构/行为 [正确]
- B. 直接创建一万个对象
- C. 启动JVM
- D. 连接数据库

解析：
类是类型模板。

#### 题目 14

题型：SINGLE_CHOICE
题干：s1和s2由同一类创建，它们的score是否必须相同？

难度：MEDIUM
分值：10
知识点：对象状态
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码阅读

选项：
- A. 不必须，每个对象有自己的实例字段 [正确]
- B. 必须
- C. 只有static字段才不同
- D. Java不允许两个对象

解析：
实例状态独立。

#### 题目 15

题型：SINGLE_CHOICE
题干：为什么用Student对象比name1/score1/name2/score2更易扩展？

难度：HARD
分值：10
知识点：面向对象
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码阅读

选项：
- A. 相关状态按实体组织，人数增加不需新增变量命名模式 [正确]
- B. 对象不占内存
- C. 对象自动存数据库
- D. class会自动生成UI

解析：
对象模型更可维护。


---

## 课时 6：用对象组织学生信息

课时简介：把章节知识收束成一个最小模型。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
现在把姓名、分数和输出行为放到Student，让main只负责创建对象并调用行为。

[标题]
先建立一个能看见的模型

[文本]
给Student加入`printInfo()`方法。方法能直接访问当前对象字段，通过`s1.printInfo()`对s1执行行为。

[代码 language=java]
class Student {
    String name;
    int score;

    void printInfo() {
        System.out.println(name + ": " + score);
    }
}

Student s = new Student();
s.name = "小林";
s.score = 92;
s.printInfo();
[/代码]

[文本]
输出为`小林: 92`。方法属于类定义，每个对象调用时操作自己的字段。

[示例 title=最小可验证示例]
说明：用最小输入观察本课核心规则。
语言：java

class Student {
    String name;
    int score;

    void printInfo() {
        System.out.println(name + ": " + score);
    }
}

Student s = new Student();
s.name = "小林";
s.score = 92;
s.printInfo();
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数字、名称或输入换掉，再独立推导一次。如果还能解释每一步，说明你理解的是规则而不是答案。

[警告 title=常见错误]
继续让main直接拼接每个对象内部字段，错过把行为放到对象内的机会。

[标题]
本课小结

[文本]
能理解对象=状态+行为的最初模型。

### 课时题目

#### 题目 16

题型：SINGLE_CHOICE
题干：实例方法`printInfo()`直接访问name时，name属于谁？

难度：EASY
分值：10
知识点：实例方法
是否用于 Battle：否

选项：
- A. 当前调用该方法的对象 [正确]
- B. 所有进程共享唯一name
- C. JVM类路径
- D. 数据库列

解析：
实例方法操作当前对象状态。

#### 题目 17

题型：SINGLE_CHOICE
题干：s.score=92后调用s.printInfo()，方法读取到的score是？

难度：MEDIUM
分值：10
知识点：对象行为
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码阅读

选项：
- A. 92 [正确]
- B. 0一定
- C. 另一个对象分数
- D. 编译器版本

解析：
读取当前对象字段。

#### 题目 18

题型：CODE_FILL
题干：补全方法调用。

难度：HARD
分值：10
知识点：方法调用
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码：
```java
Student s = new Student();
s.name = "小林";
s.score = 92;
s.____();
```

可接受答案：
```java
printInfo
```

判题设置：
- 区分大小写：否
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
调用对象方法使用点号。

标准完整代码：
```java
Student s = new Student();
s.name = "小林";
s.score = 92;
s.printInfo();
```


---

## 第1章总结

[标题]
这一章真正学会了什么

[文本]
你已经能运行Java程序，理解类型、引用、类与对象，并能把学生数据和行为组织到一个对象中。

现在你应该能够：

- 能说出源码、字节码、JVM三者关系。
- 能写出一个可运行的Java入口类。
- 能区分常见基本类型和String。
- 能根据引用别名判断对象状态。
- 能定义简单类并创建多个实例。
- 能理解对象=状态+行为的最初模型。

[提示 title=复习方式]
不要只重新看定义。盖住答案，用本章统一场景重新推一遍数据、代码或状态变化；能自己推出结果，才算掌握。

---

## 第1章综合挑战（不计分）

[标题]
建立两个Student对象并比较成绩

[文本]
创建小林92分和小周85分两个对象，各调用printInfo；再写一段if输出分数更高学生姓名，并解释两个对象的字段为什么互不覆盖。
