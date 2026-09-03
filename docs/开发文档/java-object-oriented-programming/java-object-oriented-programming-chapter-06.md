# 第6章：异常处理与调试思维

章节简介：从异常传播到堆栈阅读，学习“失败要有明确语义和处理边界”。
预计学习时间：90 分钟

章节学习目标：
- 理解并能应用异常是什么
- 理解并能应用try / catch 捕获可恢复问题
- 理解并能应用finally 与资源清理
- 理解并能应用throw 主动拒绝非法状态
- 理解并能应用自定义异常表达业务错误
- 理解并能应用根据堆栈定位问题

[标题]
本章统一场景

[文本]
本章以用户输入成绩和课程容量错误为例。

---

## 课时 1：异常是什么

课时简介：区分“正常返回”和“程序无法按原路径继续”。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
文件不存在、输入非法、网络失败都不是普通业务结果。Java用异常对象携带错误类型和调用栈，让控制流跳到可处理位置。

[标题]
先建立一个能看见的模型

[文本]
`Integer.parseInt("abc")`会抛NumberFormatException。若没有捕获，异常沿调用栈向上传播，最终可能终止线程并打印堆栈。

[代码 language=java]
int score = Integer.parseInt("abc"); // NumberFormatException
[/代码]

[文本]
异常不是“程序出现任何bug”的同义词。它是一种错误/异常条件传播机制；某些bug也会表现为异常。

[示例 title=最小可验证示例]
说明：用最小输入观察本课核心规则。
语言：java

int score = Integer.parseInt("abc"); // NumberFormatException
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数字、名称或输入换掉，再独立推导一次。如果还能解释每一步，说明你理解的是规则而不是答案。

[警告 title=常见错误]
用异常代替普通if分支控制一切，例如循环退出也throw，会让流程难读。

[标题]
本课小结

[文本]
能解释异常传播的基本概念。

### 课时题目

#### 题目 1

题型：SINGLE_CHOICE
题干：parseInt("abc")更可能抛什么？

难度：EASY
分值：10
知识点：异常
是否用于 Battle：否

选项：
- A. NumberFormatException [正确]
- B. IOException一定
- C. SQLException一定
- D. 没有任何问题

解析：
abc不是整数文本。

#### 题目 2

题型：SINGLE_CHOICE
题干：未捕获异常通常会怎样？

难度：MEDIUM
分值：10
知识点：异常传播
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码阅读

选项：
- A. 沿调用栈传播，可能终止当前线程 [正确]
- B. 自动变成false
- C. 自动忽略
- D. 改成日志后继续原行

解析：
异常改变控制流。

#### 题目 3

题型：SINGLE_CHOICE
题干：为什么“分数不及格”通常不应通过抛异常表达？

难度：HARD
分值：10
知识点：异常设计
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码阅读

选项：
- A. 它是正常业务结果，不是异常控制条件 [正确]
- B. Java禁止抛异常
- C. 异常只能用于文件
- D. 分数不是int

解析：
正常分支更合适。


---

## 课时 2：try / catch 捕获可恢复问题

课时简介：只在知道如何处理时捕获。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
如果用户输入可能不是数字，我们可以捕获NumberFormatException并提示重新输入，而不是整个程序退出。

[标题]
先建立一个能看见的模型

[文本]
try放可能失败代码；catch匹配异常类型。catch后程序从catch之后继续，而不是自动回到出错那一行。

[代码 language=java]
try {
    int score = Integer.parseInt(input);
    System.out.println(score);
} catch (NumberFormatException e) {
    System.out.println("请输入整数");
}
[/代码]

[文本]
catch应尽量具体。`catch(Exception e)`虽然方便，但可能把本来应该暴露的程序bug一起吞掉。

[示例 title=最小可验证示例]
说明：用最小输入观察本课核心规则。
语言：java

try {
    int score = Integer.parseInt(input);
    System.out.println(score);
} catch (NumberFormatException e) {
    System.out.println("请输入整数");
}
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数字、名称或输入换掉，再独立推导一次。如果还能解释每一步，说明你理解的是规则而不是答案。

[警告 title=常见错误]
catch后空着不记录也不处理，造成“失败但没人知道”。

[标题]
本课小结

[文本]
能用具体catch处理可恢复输入错误。

### 课时题目

#### 题目 4

题型：SINGLE_CHOICE
题干：catch块何时执行？

难度：EASY
分值：10
知识点：try catch
是否用于 Battle：否

选项：
- A. try中抛出匹配异常时 [正确]
- B. 每次都执行
- C. 只有编译时
- D. JVM启动前

解析：
catch处理匹配异常。

#### 题目 5

题型：SINGLE_CHOICE
题干：为什么不建议无脑`catch(Exception e){}`？

难度：MEDIUM
分值：10
知识点：异常处理
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码阅读

选项：
- A. 可能吞掉未知错误且没有处理证据 [正确]
- B. Exception不能捕获
- C. 会自动重启系统
- D. 只影响字符串

解析：
过宽且静默。

#### 题目 6

题型：CODE_FILL
题干：补全异常类型。

难度：HARD
分值：10
知识点：catch
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码：
```java
try {
  Integer.parseInt(input);
} catch (____ e) {
  System.out.println("bad number");
}
```

可接受答案：
```java
NumberFormatException
```

判题设置：
- 区分大小写：否
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
parseInt非法格式对应NumberFormatException。

标准完整代码：
```java
try {
  Integer.parseInt(input);
} catch (NumberFormatException e) {
  System.out.println("bad number");
}
```


---

## 课时 3：finally 与资源清理

课时简介：理解无论成功或异常都可能要释放资源。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
打开文件、锁、连接后，如果中途异常直接跳走却没释放，会泄漏资源。finally会在try/catch离开前执行（极端终止情况除外），适合清理。

[标题]
先建立一个能看见的模型

[文本]
传统写法在finally里close资源，但close本身也可能异常。现代Java更推荐try-with-resources管理AutoCloseable。

[代码 language=java]
Resource r = open();
try {
    use(r);
} finally {
    r.close();
}
[/代码]

[文本]
finally不是“错误处理块”，它的核心是收尾。return也可能在finally执行后才真正返回。

[示例 title=最小可验证示例]
说明：用最小输入观察本课核心规则。
语言：java

Resource r = open();
try {
    use(r);
} finally {
    r.close();
}
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数字、名称或输入换掉，再独立推导一次。如果还能解释每一步，说明你理解的是规则而不是答案。

[警告 title=常见错误]
在finally中直接return覆盖try的返回/异常，容易制造难懂行为。

[标题]
本课小结

[文本]
能解释finally的清理职责。

### 课时题目

#### 题目 7

题型：SINGLE_CHOICE
题干：finally最常见用途之一是？

难度：EASY
分值：10
知识点：finally
是否用于 Battle：否

选项：
- A. 释放必须清理的资源 [正确]
- B. 只处理语法错误
- C. 创建线程
- D. 比较String

解析：
finally保证收尾路径。

#### 题目 8

题型：SINGLE_CHOICE
题干：try成功时finally通常是否执行？

难度：MEDIUM
分值：10
知识点：finally
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码阅读

选项：
- A. 通常执行 [正确]
- B. 绝不执行
- C. 只有catch后执行
- D. 只在main执行

解析：
finally独立于是否异常。

#### 题目 9

题型：SINGLE_CHOICE
题干：为什么不建议在finally里随意return？

难度：HARD
分值：10
知识点：finally设计
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码阅读

选项：
- A. 可能覆盖原返回值或异常，隐藏问题 [正确]
- B. Java不允许return
- C. 会让文件变大
- D. 只影响网络

解析：
控制流更难理解。


---

## 课时 4：throw 主动拒绝非法状态

课时简介：让对象在边界立刻告诉调用者“这个输入不合法”。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
封装时如果newScore=-1，继续保存会破坏不变量。方法可以主动`throw new IllegalArgumentException(...)`拒绝。

[标题]
先建立一个能看见的模型

[文本]
`updateScore`检查范围，不合法立即抛异常，合法才赋值。这样后续代码可以信任Student.score始终0~100。

[代码 language=java]
void updateScore(int newScore) {
    if (newScore < 0 || newScore > 100) {
        throw new IllegalArgumentException("score out of range");
    }
    score = newScore;
}
[/代码]

[文本]
throw是“产生并抛出一个异常对象”；throws出现在方法签名，表示方法可能传播某些受检异常，二者不要混淆。

[示例 title=最小可验证示例]
说明：用最小输入观察本课核心规则。
语言：java

void updateScore(int newScore) {
    if (newScore < 0 || newScore > 100) {
        throw new IllegalArgumentException("score out of range");
    }
    score = newScore;
}
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数字、名称或输入换掉，再独立推导一次。如果还能解释每一步，说明你理解的是规则而不是答案。

[警告 title=常见错误]
先写入非法score再throw，导致对象已经被破坏。校验应在修改状态之前。

[标题]
本课小结

[文本]
能主动抛出参数异常维护不变量。

### 课时题目

#### 题目 10

题型：SINGLE_CHOICE
题干：非法参数最常用的运行时异常之一是？

难度：EASY
分值：10
知识点：throw
是否用于 Battle：否

选项：
- A. IllegalArgumentException [正确]
- B. StackOverflowError只能
- C. FileNotFoundException必定
- D. NoClassDefFoundError

解析：
参数值非法可用IllegalArgumentException。

#### 题目 11

题型：SINGLE_CHOICE
题干：校验和赋值顺序应怎样？

难度：MEDIUM
分值：10
知识点：异常安全
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码阅读

选项：
- A. 先校验，合法后再修改状态 [正确]
- B. 先写非法值再throw
- C. 随机
- D. 只校验不赋值

解析：
避免半更新。

#### 题目 12

题型：CODE_FILL
题干：补全抛出关键字。

难度：HARD
分值：10
知识点：throw
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码：
```java
if (newScore < 0) {
    ____ new IllegalArgumentException();
}
```

可接受答案：
```java
throw
```

判题设置：
- 区分大小写：否
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
主动抛异常用throw。

标准完整代码：
```java
if (newScore < 0) {
    throw new IllegalArgumentException();
}
```


---

## 课时 5：自定义异常表达业务错误

课时简介：当标准异常不能清楚表达领域问题时，用类型承载语义。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
“课程已满”“余额不足”等业务错误可以定义专门异常，让上层按类型处理，而不是解析字符串。

[标题]
先建立一个能看见的模型

[文本]
`class CourseFullException extends RuntimeException { ... }`。选checked还是runtime要结合API约定，本课先强调“异常类型应表达问题含义”。

[代码 language=java]
class CourseFullException extends RuntimeException {
    CourseFullException(String message) {
        super(message);
    }
}
[/代码]

[文本]
自定义异常不是越多越好。只有调用者真的需要区分处理时，专门类型才有价值。

[示例 title=最小可验证示例]
说明：用最小输入观察本课核心规则。
语言：java

class CourseFullException extends RuntimeException {
    CourseFullException(String message) {
        super(message);
    }
}
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数字、名称或输入换掉，再独立推导一次。如果还能解释每一步，说明你理解的是规则而不是答案。

[警告 title=常见错误]
给每条错误消息创建一个新异常类，导致类型爆炸。

[标题]
本课小结

[文本]
能判断何时值得定义业务异常。

### 课时题目

#### 题目 13

题型：SINGLE_CHOICE
题干：自定义异常最主要的价值是？

难度：EASY
分值：10
知识点：自定义异常
是否用于 Battle：否

选项：
- A. 用类型清晰表达可区分的业务失败 [正确]
- B. 提高CPU速度
- C. 自动回滚数据库
- D. 替代所有返回值

解析：
类型传递错误语义。

#### 题目 14

题型：SINGLE_CHOICE
题干：“课程已满”若上层需要专门处理，适合怎样？

难度：MEDIUM
分值：10
知识点：业务异常
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码阅读

选项：
- A. 可定义CourseFullException [正确]
- B. 用NullPointerException
- C. 返回随机数
- D. 忽略

解析：
领域异常更清晰。

#### 题目 15

题型：SINGLE_CHOICE
题干：为什么不应为每条文字错误都建异常类？

难度：HARD
分值：10
知识点：异常设计
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码阅读

选项：
- A. 类型应服务可区分处理，否则增加复杂度 [正确]
- B. Java异常类数量有限
- C. 异常不能带消息
- D. 类越多运行越快

解析：
设计要有语义价值。


---

## 课时 6：根据堆栈定位问题

课时简介：学会从“异常类型+消息+第一处业务栈帧”开始读。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
堆栈信息从异常发生位置向调用者展开。面对几十行堆栈，不要随机搜，而是先看异常类型，再找自己项目中最靠近顶部的栈帧和对应行号。

[标题]
先建立一个能看见的模型

[文本]
例如`NumberFormatException`顶部指向`ScoreParser.parse(ScoreParser.java:18)`，说明第18行解析非法文本；再看是谁调用parse，追输入来源。

[代码 language=text]
NumberFormatException: For input string: "abc"
 at java.lang.Integer.parseInt(...)
 at app.ScoreParser.parse(ScoreParser.java:18)
 at app.Main.main(Main.java:7)
[/代码]

[文本]
根因可能在更早的输入验证，而不是只修第18行。堆栈给你路径，不会自动给最终设计答案。

[示例 title=最小可验证示例]
说明：用最小输入观察本课核心规则。
语言：text

NumberFormatException: For input string: "abc"
 at java.lang.Integer.parseInt(...)
 at app.ScoreParser.parse(ScoreParser.java:18)
 at app.Main.main(Main.java:7)
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数字、名称或输入换掉，再独立推导一次。如果还能解释每一步，说明你理解的是规则而不是答案。

[警告 title=常见错误]
只看最后一行main:7就认定错误发生在main。更靠近异常源的栈帧通常更关键。

[标题]
本课小结

[文本]
能从简化堆栈定位第一处业务代码。

### 课时题目

#### 题目 16

题型：SINGLE_CHOICE
题干：读堆栈第一步最有价值的信息之一是？

难度：EASY
分值：10
知识点：堆栈
是否用于 Battle：否

选项：
- A. 异常类型和消息 [正确]
- B. 文件总行数
- C. JVM窗口大小
- D. CPU核心数

解析：
类型说明失败类别。

#### 题目 17

题型：SINGLE_CHOICE
题干：堆栈中最靠近顶部的项目业务栈帧通常帮助什么？

难度：MEDIUM
分值：10
知识点：调试
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码阅读

选项：
- A. 定位异常直接发生的业务代码位置 [正确]
- B. 选择网络路由
- C. 创建数组
- D. 比较字符串

解析：
栈帧含文件行号。

#### 题目 18

题型：CODE_FILL
题干：补全定位结论。

难度：HARD
分值：10
知识点：堆栈调试
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码：
```text
at app.ScoreParser.parse(ScoreParser.java:18)
优先检查文件中的第 ____ 行
```

可接受答案：
```text
18
```

判题设置：
- 区分大小写：否
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
栈帧给出行号。

标准完整代码：
```text
at app.ScoreParser.parse(ScoreParser.java:18)
优先检查文件中的第 18 行
```


---

## 第6章总结

[标题]
这一章真正学会了什么

[文本]
你已经能区分正常分支和异常、正确使用try/catch/finally/throw，并能从堆栈开始定位问题。

现在你应该能够：

- 能解释异常传播的基本概念。
- 能用具体catch处理可恢复输入错误。
- 能解释finally的清理职责。
- 能主动抛出参数异常维护不变量。
- 能判断何时值得定义业务异常。
- 能从简化堆栈定位第一处业务代码。

[提示 title=复习方式]
不要只重新看定义。盖住答案，用本章统一场景重新推一遍数据、代码或状态变化；能自己推出结果，才算掌握。

---

## 第6章综合挑战（不计分）

[标题]
设计一个健壮的成绩输入器

[文本]
输入字符串转0~100分。分别处理非数字、数字越界；非法输入给清晰消息，合法则创建Student。写出异常从哪里产生、在哪里处理最合理。
