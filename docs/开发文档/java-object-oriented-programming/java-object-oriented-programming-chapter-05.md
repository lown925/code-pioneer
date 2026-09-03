# 第5章：常用类、字符串与包装类型

章节简介：从String不可变到包装类、标准工具和null安全，补齐Java日常编程最常遇到的基础类。
预计学习时间：90 分钟

章节学习目标：
- 理解并能应用String 不可变性
- 理解并能应用字符串比较 equals
- 理解并能应用StringBuilder 处理大量拼接
- 理解并能应用包装类型与自动装箱
- 理解并能应用常用 Math 与 Objects
- 理解并能应用避免空指针的基础习惯

[标题]
本章统一场景

[文本]
本章围绕字符串姓名、成绩Integer和基础工具方法。

---

## 课时 1：String 不可变性

课时简介：理解“修改字符串”通常创建新对象/结果。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
String在Java中不可变：对象内容创建后不会被原地改写。`toUpperCase`、`replace`等返回新String。

[标题]
先建立一个能看见的模型

[文本]
`String name="java"; name.toUpperCase();`后name仍是"java"，因为返回值没接住。写`name=name.toUpperCase()`才让变量引用新字符串。

[代码 language=java]
String name = "java";
name.toUpperCase();
System.out.println(name); // java
name = name.toUpperCase();
System.out.println(name); // JAVA
[/代码]

[文本]
不可变让String安全地共享、缓存hash等，但频繁拼接会产生许多中间对象。

[示例 title=最小可验证示例]
说明：用最小输入观察本课核心规则。
语言：java

String name = "java";
name.toUpperCase();
System.out.println(name); // java
name = name.toUpperCase();
System.out.println(name); // JAVA
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数字、名称或输入换掉，再独立推导一次。如果还能解释每一步，说明你理解的是规则而不是答案。

[警告 title=常见错误]
以为调用replace/toUpperCase会原地改变原String。

[标题]
本课小结

[文本]
能根据不可变性判断结果。

### 课时题目

#### 题目 1

题型：SINGLE_CHOICE
题干：调用`name.toUpperCase()`但不赋值，原name会怎样？

难度：EASY
分值：10
知识点：String
是否用于 Battle：否

选项：
- A. 保持原值 [正确]
- B. 自动变大写
- C. 变null
- D. 编译失败

解析：
String方法返回新结果。

#### 题目 2

题型：SINGLE_CHOICE
题干：让name真正引用大写结果应怎样？

难度：MEDIUM
分值：10
知识点：String
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码阅读

选项：
- A. name = name.toUpperCase(); [正确]
- B. name.toUpperCase = true;
- C. new int(name);
- D. static name;

解析：
接收返回值。

#### 题目 3

题型：SINGLE_CHOICE
题干：String不可变的直观含义是？

难度：HARD
分值：10
知识点：String不可变
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码阅读

选项：
- A. 已有String对象的字符内容不会被普通方法原地修改 [正确]
- B. String变量不能重新赋值
- C. String不能比较
- D. String不能创建

解析：
变量可指向新对象，对象内容不可变。


---

## 课时 2：字符串比较 equals

课时简介：避免用`==`比较内容。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
对引用类型，`==`通常比较引用是否指向同一对象；String内容相等应使用`equals`。字符串常量池有时让==“碰巧true”，更危险。

[标题]
先建立一个能看见的模型

[文本]
`new String("Java")`两次产生不同对象，`a==b`通常false，但`a.equals(b)`true。业务上比较用户名等内容应equals。

[代码 language=java]
String a = new String("Java");
String b = new String("Java");
System.out.println(a == b);      // false
System.out.println(a.equals(b)); // true
[/代码]

[文本]
`Objects.equals(a,b)`还能安全处理null。

[示例 title=最小可验证示例]
说明：用最小输入观察本课核心规则。
语言：java

String a = new String("Java");
String b = new String("Java");
System.out.println(a == b);      // false
System.out.println(a.equals(b)); // true
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数字、名称或输入换掉，再独立推导一次。如果还能解释每一步，说明你理解的是规则而不是答案。

[警告 title=常见错误]
测试时常量`"x"=="x"`碰巧true，于是误以为==可比较字符串内容。

[标题]
本课小结

[文本]
能正确比较String内容。

### 课时题目

#### 题目 4

题型：SINGLE_CHOICE
题干：比较两个String内容通常用？

难度：EASY
分值：10
知识点：String比较
是否用于 Battle：否

选项：
- A. equals [正确]
- B. ==永远
- C. <=
- D. instanceof

解析：
equals比较内容。

#### 题目 5

题型：SINGLE_CHOICE
题干：两个new String("Java")的equals结果通常？

难度：MEDIUM
分值：10
知识点：equals
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码阅读

选项：
- A. true [正确]
- B. false
- C. 编译失败
- D. null

解析：
字符内容相同。

#### 题目 6

题型：CODE_FILL
题干：补全内容比较。

难度：HARD
分值：10
知识点：equals
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码：
```java
if (name.____("admin")) {
    // ...
}
```

可接受答案：
```java
equals
```

判题设置：
- 区分大小写：否
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
String内容用equals。

标准完整代码：
```java
if (name.equals("admin")) {
    // ...
}
```


---

## 课时 3：StringBuilder 处理大量拼接

课时简介：理解循环里`+`为什么可能产生很多中间String。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
少量字符串拼接直接`+`清晰即可；大量循环构建文本时，String不可变会产生中间对象，StringBuilder用可变缓冲累积更合适。

[标题]
先建立一个能看见的模型

[文本]
循环1000次`builder.append(i).append(",")`，最后`toString()`一次生成最终字符串。

[代码 language=java]
StringBuilder builder = new StringBuilder();
for (int i = 0; i < 3; i++) {
    builder.append(i).append(",");
}
System.out.println(builder.toString()); // 0,1,2,
[/代码]

[文本]
StringBuilder自身内容可变，每次append在同一个builder上累积。最终需要String时再toString。

[示例 title=最小可验证示例]
说明：用最小输入观察本课核心规则。
语言：java

StringBuilder builder = new StringBuilder();
for (int i = 0; i < 3; i++) {
    builder.append(i).append(",");
}
System.out.println(builder.toString()); // 0,1,2,
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数字、名称或输入换掉，再独立推导一次。如果还能解释每一步，说明你理解的是规则而不是答案。

[警告 title=常见错误]
任何字符串拼接都改用StringBuilder会让简单代码变复杂。优化要针对大量重复拼接。

[标题]
本课小结

[文本]
能在循环构建文本时使用StringBuilder。

### 课时题目

#### 题目 7

题型：SINGLE_CHOICE
题干：大量循环拼接字符串时更适合考虑？

难度：EASY
分值：10
知识点：StringBuilder
是否用于 Battle：否

选项：
- A. StringBuilder [正确]
- B. 每轮new File
- C. ==比较
- D. Thread.sleep

解析：
可变builder减少中间String。

#### 题目 8

题型：SINGLE_CHOICE
题干：`append` 的效果是什么？

难度：MEDIUM
分值：10
知识点：StringBuilder
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码阅读

选项：
- A. 把内容追加到builder当前末尾 [正确]
- B. 清空builder
- C. 比较两个字符串
- D. 把String变int

解析：
append累积内容。

#### 题目 9

题型：SINGLE_CHOICE
题干：为什么少量`"a" + name`不必机械改StringBuilder？

难度：HARD
分值：10
知识点：字符串性能
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码阅读

选项：
- A. 可读性更重要，编译器也会优化简单拼接 [正确]
- B. Java禁止+
- C. StringBuilder不能拼接
- D. +一定导致内存泄漏

解析：
优化要结合场景。


---

## 课时 4：包装类型与自动装箱

课时简介：理解集合为什么用Integer而不能写List<int>。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
Java泛型参数需要引用类型，因此基本类型int对应包装类Integer。编译器可自动在int与Integer间装箱/拆箱。

[标题]
先建立一个能看见的模型

[文本]
`List<Integer> scores=List.of(92,85)`。`Integer x=92`发生装箱；`int y=x`拆箱。若x为null，拆箱时会抛NullPointerException。

[代码 language=java]
Integer boxed = 92; // autoboxing
int value = boxed;  // unboxing
List<Integer> scores = List.of(92, 85);
[/代码]

[文本]
包装类还能提供parseInt等工具。不要依赖`Integer ==`比较数值，因为对象缓存范围会造成“有时true有时false”的陷阱，应equals或拆箱。

[示例 title=最小可验证示例]
说明：用最小输入观察本课核心规则。
语言：java

Integer boxed = 92; // autoboxing
int value = boxed;  // unboxing
List<Integer> scores = List.of(92, 85);
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数字、名称或输入换掉，再独立推导一次。如果还能解释每一步，说明你理解的是规则而不是答案。

[警告 title=常见错误]
对可能为null的Integer直接自动拆箱成int。

[标题]
本课小结

[文本]
能安全使用包装类型和自动装箱。

### 课时题目

#### 题目 10

题型：SINGLE_CHOICE
题干：为什么`List<int>`不合法而常用`List<Integer>`？

难度：EASY
分值：10
知识点：包装类型
是否用于 Battle：否

选项：
- A. 泛型参数需要引用类型 [正确]
- B. int太大
- C. List只能存字符串
- D. Integer更快

解析：
包装类用于泛型。

#### 题目 11

题型：SINGLE_CHOICE
题干：`Integer x=null; int y=x;` 可能怎样？

难度：MEDIUM
分值：10
知识点：自动拆箱
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码阅读

选项：
- A. 抛NullPointerException [正确]
- B. y自动为0
- C. 编译时必定阻止
- D. y为-1

解析：
null拆箱失败。

#### 题目 12

题型：CODE_FILL
题干：补全字符串转整数。

难度：HARD
分值：10
知识点：Integer
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码：
```java
int score = Integer.____("92");
```

可接受答案：
```java
parseInt
```

判题设置：
- 区分大小写：否
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
parseInt解析整数文本。

标准完整代码：
```java
int score = Integer.parseInt("92");
```


---

## 课时 5：常用 Math 与 Objects

课时简介：使用标准库而不是重复造基础轮子。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
Java标准库提供常见数学和对象工具。Math.max/min/abs适合基础数值；Objects.equals可安全比较可能为null的对象。

[标题]
先建立一个能看见的模型

[文本]
`Math.max(92,85)`返回92；`Objects.equals(a,b)`即使a为null也不会像`a.equals(b)`那样直接NPE。

[代码 language=java]
int best = Math.max(92, 85);
String a = null;
String b = "Java";
boolean same = java.util.Objects.equals(a, b);
[/代码]

[文本]
标准库方法有明确语义和测试基础，优先复用比手写重复逻辑更可靠。

[示例 title=最小可验证示例]
说明：用最小输入观察本课核心规则。
语言：java

int best = Math.max(92, 85);
String a = null;
String b = "Java";
boolean same = java.util.Objects.equals(a, b);
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数字、名称或输入换掉，再独立推导一次。如果还能解释每一步，说明你理解的是规则而不是答案。

[警告 title=常见错误]
为了“一行都自己写”重新实现复杂标准功能，增加bug；或没看API语义就乱用。

[标题]
本课小结

[文本]
能使用少量常见标准库工具。

### 课时题目

#### 题目 13

题型：SINGLE_CHOICE
题干：`Math.max(92,85)`返回？

难度：EASY
分值：10
知识点：Math
是否用于 Battle：否

选项：
- A. 92 [正确]
- B. 85
- C. 177
- D. 7

解析：
max取较大值。

#### 题目 14

题型：SINGLE_CHOICE
题干：Objects.equals(a,b) 的一个优点是？

难度：MEDIUM
分值：10
知识点：Objects
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码阅读

选项：
- A. 能安全处理a或b为null [正确]
- B. 自动把不同内容判相同
- C. 比较对象内存大小
- D. 创建新对象

解析：
null安全比较。

#### 题目 15

题型：SINGLE_CHOICE
题干：选择标准库方法而不是重复手写的主要理由之一是？

难度：HARD
分值：10
知识点：标准库
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码阅读

选项：
- A. 语义清晰、复用成熟实现并减少重复bug [正确]
- B. 标准库不需要内存
- C. 标准库总是O(1)
- D. Java禁止自定义方法

解析：
复用降低维护成本。


---

## 课时 6：避免空指针的基础习惯

课时简介：理解null表示“没有对象”，调用方法前要明确是否允许为空。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
引用变量可以是null。对null调用方法或访问字段会抛NullPointerException。设计时应尽量让“不应该为空”的值在构造时就保证非空，并在边界明确处理可选值。

[标题]
先建立一个能看见的模型

[文本]
`String name=null; name.length()`会NPE。可以在输入边界检查`if(name==null)`，或使用`Objects.requireNonNull(name,"name")`快速失败。

[代码 language=java]
String name = null;
if (name != null) {
    System.out.println(name.length());
}
[/代码]

[文本]
真正有效的策略不是到处加`if(x!=null)`，而是设计清晰的不变量：哪些字段永不null、哪些返回值允许缺失。

[示例 title=最小可验证示例]
说明：用最小输入观察本课核心规则。
语言：java

String name = null;
if (name != null) {
    System.out.println(name.length());
}
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数字、名称或输入换掉，再独立推导一次。如果还能解释每一步，说明你理解的是规则而不是答案。

[警告 title=常见错误]
捕获NullPointerException后什么都不做，把设计问题隐藏起来。

[标题]
本课小结

[文本]
能识别null风险并在边界处理。

### 课时题目

#### 题目 16

题型：SINGLE_CHOICE
题干：对null引用调用方法通常会怎样？

难度：EASY
分值：10
知识点：null
是否用于 Battle：否

选项：
- A. 抛NullPointerException [正确]
- B. 返回0
- C. 自动创建对象
- D. 编译器永远禁止

解析：
null没有对象可调用。

#### 题目 17

题型：SINGLE_CHOICE
题干：不应为null的构造参数可用什么快速校验？

难度：MEDIUM
分值：10
知识点：null检查
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码阅读

选项：
- A. Objects.requireNonNull [正确]
- B. Math.max
- C. StringBuilder.append
- D. Integer.parseInt必定

解析：
requireNonNull表达不变量。

#### 题目 18

题型：CODE_FILL
题干：补全空值判断。

难度：HARD
分值：10
知识点：null
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码：
```java
if (name ____ null) {
    System.out.println(name.length());
}
```

可接受答案：
```java
!=
```

判题设置：
- 区分大小写：否
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
非null才能安全调用。

标准完整代码：
```java
if (name != null) {
    System.out.println(name.length());
}
```


---

## 第5章总结

[标题]
这一章真正学会了什么

[文本]
你已经能正确比较和构建字符串、理解包装类型/拆箱风险，并能更有意识地处理null。

现在你应该能够：

- 能根据不可变性判断结果。
- 能正确比较String内容。
- 能在循环构建文本时使用StringBuilder。
- 能安全使用包装类型和自动装箱。
- 能使用少量常见标准库工具。
- 能识别null风险并在边界处理。

[提示 title=复习方式]
不要只重新看定义。盖住答案，用本章统一场景重新推一遍数据、代码或状态变化；能自己推出结果，才算掌握。

---

## 第5章综合挑战（不计分）

[标题]
生成成绩摘要文本

[文本]
给List<Integer>{92,85,88}和学生名，使用StringBuilder生成“姓名:分数”多行文本，求最高分；再设计一个name=null输入并说明在哪里拒绝最合理。
