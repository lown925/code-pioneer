# 第8章：文件、IO 与序列化基础

章节简介：从字节/字符到逐行读写和持久化，理解Java对象怎样和文件世界交换数据。
预计学习时间：90 分钟

章节学习目标：
- 理解并能应用字节流与字符流
- 理解并能应用Path / Files 简化文件操作
- 理解并能应用BufferedReader 逐行读取
- 理解并能应用BufferedWriter 写文本
- 理解并能应用try-with-resources 自动关闭
- 理解并能应用简单对象持久化思路

[标题]
本章统一场景

[文本]
本章把Student记录保存为UTF-8文本。

---

## 课时 1：字节流与字符流

课时简介：理解文件里最终是字节，但文本需要字符编码。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
InputStream/OutputStream面向原始字节，适合图片、压缩包等；Reader/Writer面向字符，适合文本并结合编码。

[标题]
先建立一个能看见的模型

[文本]
读取UTF-8文本若直接把每个byte强转char，中文会乱码。应使用带Charset的Reader把字节序列解码成字符。

[代码 language=text]
文件 bytes --UTF-8 decode--> Java chars/String

二进制图片 bytes → InputStream
文本 .txt → Reader
[/代码]

[文本]
“字符流”底层仍从字节来源读取，只是多了编码/解码层。

[示例 title=最小可验证示例]
说明：用最小输入观察本课核心规则。
语言：text

文件 bytes --UTF-8 decode--> Java chars/String

二进制图片 bytes → InputStream
文本 .txt → Reader
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数字、名称或输入换掉，再独立推导一次。如果还能解释每一步，说明你理解的是规则而不是答案。

[警告 title=常见错误]
依赖系统默认编码，开发机正常，部署环境乱码。重要文本应明确UTF-8等Charset。

[标题]
本课小结

[文本]
能根据文本/二进制选择流并解释编码。

### 课时题目

#### 题目 1

题型：SINGLE_CHOICE
题干：读取PNG图片更直接使用哪类？

难度：EASY
分值：10
知识点：IO
是否用于 Battle：否

选项：
- A. InputStream字节流 [正确]
- B. Reader字符流
- C. StringBuilder
- D. Scanner只能

解析：
二进制按字节。

#### 题目 2

题型：SINGLE_CHOICE
题干：读取UTF-8中文文本为什么需要正确Charset？

难度：MEDIUM
分值：10
知识点：字符编码
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码阅读

选项：
- A. 字节必须按正确编码解码成字符 [正确]
- B. 为了增加文件大小
- C. 为了创建线程
- D. Java不能读英文

解析：
编码不匹配会乱码。

#### 题目 3

题型：SINGLE_CHOICE
题干：把每个UTF-8 byte直接强转char为什么可能乱码？

难度：HARD
分值：10
知识点：文本IO
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码阅读

选项：
- A. 一个字符可能由多个字节编码，必须按Charset解码 [正确]
- B. byte不能存0
- C. char只用于数字
- D. UTF-8没有中文

解析：
编码边界。


---

## 课时 2：Path / Files 简化文件操作

课时简介：使用现代NIO API完成常见小文件任务。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
Java的`Path`表示路径，`Files`提供exists/readString/writeString/readAllLines等便利方法。小配置或教学文件不必手动搭复杂流。

[标题]
先建立一个能看见的模型

[文本]
`Path p=Path.of("scores.txt"); Files.writeString(p,"92
85",UTF_8); String text=Files.readString(p,UTF_8);`。

[代码 language=java]
Path path = Path.of("scores.txt");
Files.writeString(path, "92\n85", StandardCharsets.UTF_8);
String text = Files.readString(path, StandardCharsets.UTF_8);
[/代码]

[文本]
对于超大文件，readString会一次加载全部内容，不合适；应流式读取。

[示例 title=最小可验证示例]
说明：用最小输入观察本课核心规则。
语言：java

Path path = Path.of("scores.txt");
Files.writeString(path, "92\n85", StandardCharsets.UTF_8);
String text = Files.readString(path, StandardCharsets.UTF_8);
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数字、名称或输入换掉，再独立推导一次。如果还能解释每一步，说明你理解的是规则而不是答案。

[警告 title=常见错误]
无论文件多大都`readAllBytes`，导致内存压力。

[标题]
本课小结

[文本]
能用Path/Files处理小文本并知道边界。

### 课时题目

#### 题目 4

题型：SINGLE_CHOICE
题干：Java现代路径抽象常用哪个类型？

难度：EASY
分值：10
知识点：Files API
是否用于 Battle：否

选项：
- A. Path [正确]
- B. Thread
- C. Map.Entry
- D. Integer

解析：
Path表示文件系统路径。

#### 题目 5

题型：SINGLE_CHOICE
题干：读取10GB日志更适合避免哪种方式？

难度：MEDIUM
分值：10
知识点：文件读取
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码阅读

选项：
- A. 一次性readString/readAllBytes到内存 [正确]
- B. BufferedReader逐行
- C. 流式处理
- D. 按块读取

解析：
大文件不宜整体加载。

#### 题目 6

题型：CODE_FILL
题干：补全创建Path。

难度：HARD
分值：10
知识点：Path
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码：
```java
Path p = Path.____("scores.txt");
```

可接受答案：
```java
of
```

判题设置：
- 区分大小写：否
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
Path.of创建路径对象。

标准完整代码：
```java
Path p = Path.of("scores.txt");
```


---

## 课时 3：BufferedReader 逐行读取

课时简介：学习不把整个大文本一次塞进内存。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
日志和CSV可能很大。BufferedReader可以一行一行读取，程序只保留当前处理需要的数据。

[标题]
先建立一个能看见的模型

[文本]
`while((line=reader.readLine())!=null)`直到EOF。每轮解析一行并更新统计，不必保存所有行。

[代码 language=java]
try (BufferedReader reader = Files.newBufferedReader(path, StandardCharsets.UTF_8)) {
    String line;
    while ((line = reader.readLine()) != null) {
        System.out.println(line);
    }
}
[/代码]

[文本]
readLine返回不带行结束符的文本，EOF时返回null。

[示例 title=最小可验证示例]
说明：用最小输入观察本课核心规则。
语言：java

try (BufferedReader reader = Files.newBufferedReader(path, StandardCharsets.UTF_8)) {
    String line;
    while ((line = reader.readLine()) != null) {
        System.out.println(line);
    }
}
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数字、名称或输入换掉，再独立推导一次。如果还能解释每一步，说明你理解的是规则而不是答案。

[警告 title=常见错误]
写成`while(reader.readLine()!=null){ print(reader.readLine()); }`会每轮读两行并跳过数据。

[标题]
本课小结

[文本]
能正确写逐行读取循环。

### 课时题目

#### 题目 7

题型：SINGLE_CHOICE
题干：readLine到文件末尾通常返回？

难度：EASY
分值：10
知识点：BufferedReader
是否用于 Battle：否

选项：
- A. null [正确]
- B. 空字符串必定
- C. -1整数
- D. 异常必定

解析：
EOF用null。

#### 题目 8

题型：SINGLE_CHOICE
题干：为什么不能在while条件和循环体各调用一次readLine？

难度：MEDIUM
分值：10
知识点：文件读取
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码阅读

选项：
- A. 每次调用都会消费下一行，导致跳行 [正确]
- B. readLine没有返回值
- C. 会自动重复同一行
- D. Java不允许while

解析：
读取有副作用。

#### 题目 9

题型：SINGLE_CHOICE
题干：逐行处理大日志相比readString主要优势是什么？

难度：HARD
分值：10
知识点：IO性能
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码阅读

选项：
- A. 内存占用可保持较低 [正确]
- B. 磁盘一定更快100倍
- C. 不需要关闭文件
- D. 自动多线程

解析：
流式处理。


---

## 课时 4：BufferedWriter 写文本

课时简介：理解write和newLine、flush的作用。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
写文本时可以多次write到缓冲区，减少频繁底层I/O；newLine写平台合适换行；close会刷新并关闭资源。

[标题]
先建立一个能看见的模型

[文本]
循环写三名学生，每行`name,score`，最后try-with-resources自动close。

[代码 language=java]
try (BufferedWriter w = Files.newBufferedWriter(path, StandardCharsets.UTF_8)) {
    w.write("小林,92");
    w.newLine();
    w.write("小周,85");
}
[/代码]

[文本]
缓冲意味着write调用成功后数据可能仍在用户态/库缓冲，flush/close推进到底层；操作系统还可能有页缓存。

[示例 title=最小可验证示例]
说明：用最小输入观察本课核心规则。
语言：java

try (BufferedWriter w = Files.newBufferedWriter(path, StandardCharsets.UTF_8)) {
    w.write("小林,92");
    w.newLine();
    w.write("小周,85");
}
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数字、名称或输入换掉，再独立推导一次。如果还能解释每一步，说明你理解的是规则而不是答案。

[警告 title=常见错误]
每写一小段就flush，可能抵消缓冲收益；但交互协议等场景又可能需要及时flush。

[标题]
本课小结

[文本]
能使用BufferedWriter写多行文本。

### 课时题目

#### 题目 10

题型：SINGLE_CHOICE
题干：BufferedWriter的缓冲主要想减少什么？

难度：EASY
分值：10
知识点：BufferedWriter
是否用于 Battle：否

选项：
- A. 大量细小底层写操作 [正确]
- B. Java对象数量为0
- C. 文件路径长度
- D. CPU类型检查

解析：
批量写更高效。

#### 题目 11

题型：SINGLE_CHOICE
题干：try-with-resources结束时会怎样？

难度：MEDIUM
分值：10
知识点：资源管理
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码阅读

选项：
- A. 自动close资源 [正确]
- B. 自动删除文件
- C. 自动上传云端
- D. 不执行任何操作

解析：
AutoCloseable自动关闭。

#### 题目 12

题型：CODE_FILL
题干：补全换行方法。

难度：HARD
分值：10
知识点：文本写入
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码：
```java
w.write("小林,92");
w.____();
```

可接受答案：
```java
newLine
```

判题设置：
- 区分大小写：否
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
BufferedWriter提供newLine。

标准完整代码：
```java
w.write("小林,92");
w.newLine();
```


---

## 课时 5：try-with-resources 自动关闭

课时简介：让“成功/异常都关闭”成为语法结构。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
手写finally close容易遗漏和覆盖异常。实现AutoCloseable的资源可以声明在try括号中，离开作用域自动close。

[标题]
先建立一个能看见的模型

[文本]
`try(BufferedReader r=...){...}`即使readLine抛IOException也会关闭r。多个资源按相反顺序关闭。

[代码 language=java]
try (BufferedReader reader = Files.newBufferedReader(path, StandardCharsets.UTF_8)) {
    System.out.println(reader.readLine());
}
[/代码]

[文本]
这不是“catch异常”。若你不catch，异常仍会向上抛，只是资源会正确关闭。

[示例 title=最小可验证示例]
说明：用最小输入观察本课核心规则。
语言：java

try (BufferedReader reader = Files.newBufferedReader(path, StandardCharsets.UTF_8)) {
    System.out.println(reader.readLine());
}
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数字、名称或输入换掉，再独立推导一次。如果还能解释每一步，说明你理解的是规则而不是答案。

[警告 title=常见错误]
认为用了try-with-resources就不需要处理IOException。它只管理资源生命周期。

[标题]
本课小结

[文本]
能区分资源关闭和异常处理。

### 课时题目

#### 题目 13

题型：SINGLE_CHOICE
题干：try-with-resources最直接保证什么？

难度：EASY
分值：10
知识点：资源管理
是否用于 Battle：否

选项：
- A. 资源离开try时自动关闭 [正确]
- B. 所有异常自动消失
- C. 文件永远存在
- D. 内容自动备份

解析：
自动close。

#### 题目 14

题型：SINGLE_CHOICE
题干：若try中抛异常但没有catch，资源会？

难度：MEDIUM
分值：10
知识点：try-with-resources
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码阅读

选项：
- A. 仍尝试自动关闭，然后异常继续传播 [正确]
- B. 永远不关闭
- C. 异常被吞掉
- D. JVM关机

解析：
关闭与传播独立。

#### 题目 15

题型：SINGLE_CHOICE
题干：为什么它比手写finally close通常更安全？

难度：HARD
分值：10
知识点：资源管理
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码阅读

选项：
- A. 语法直接绑定资源生命周期，并处理关闭异常细节 [正确]
- B. 运行速度无限快
- C. 不需要Charset
- D. 禁止IOException

解析：
减少遗漏。


---

## 课时 6：简单对象持久化思路

课时简介：理解“内存对象”与“持久化格式”需要转换。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
程序结束后Student对象本身不会留在内存。要持久化，需要把必要字段编码成文件/JSON/数据库记录，下次再反向恢复。

[标题]
先建立一个能看见的模型

[文本]
本课用CSV示意：`S001,小林,92`。保存时Student→一行文本；加载时split并parseInt→new Student。真实项目更推荐成熟JSON库/数据库而不是手写复杂CSV。

[代码 language=java]
String line = "S001,小林,92";
String[] parts = line.split(",");
String id = parts[0];
String name = parts[1];
int score = Integer.parseInt(parts[2]);
[/代码]

[文本]
序列化格式要考虑逗号转义、版本变化、编码等。教学示例只用于理解“对象↔持久数据”的过程。

[示例 title=最小可验证示例]
说明：用最小输入观察本课核心规则。
语言：java

String line = "S001,小林,92";
String[] parts = line.split(",");
String id = parts[0];
String name = parts[1];
int score = Integer.parseInt(parts[2]);
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数字、名称或输入换掉，再独立推导一次。如果还能解释每一步，说明你理解的是规则而不是答案。

[警告 title=常见错误]
把Java对象直接“写到文件”当成不需要格式和版本的魔法。

[标题]
本课小结

[文本]
能说明对象持久化需要明确数据格式。

### 课时题目

#### 题目 16

题型：SINGLE_CHOICE
题干：程序退出后普通Student内存对象会怎样？

难度：EASY
分值：10
知识点：持久化
是否用于 Battle：否

选项：
- A. 随进程内存消失，需要持久化才能下次恢复 [正确]
- B. 自动保存为Java源码
- C. 永久存在CPU
- D. 变成DNS记录

解析：
内存不是持久存储。

#### 题目 17

题型：SINGLE_CHOICE
题干：CSV/JSON在这里主要扮演什么？

难度：MEDIUM
分值：10
知识点：持久化
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码阅读

选项：
- A. 对象状态的持久化表示格式 [正确]
- B. Java线程
- C. TCP窗口
- D. 继承父类

解析：
编码对象字段。

#### 题目 18

题型：CODE_FILL
题干：补全分数解析。

难度：HARD
分值：10
知识点：数据加载
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码：
```java
int score = Integer.____(parts[2]);
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
文本字段需转int。

标准完整代码：
```java
int score = Integer.parseInt(parts[2]);
```


---

## 第8章总结

[标题]
这一章真正学会了什么

[文本]
你已经能选择字节/字符API、流式读写大文本、自动关闭资源，并理解对象持久化的格式转换。

现在你应该能够：

- 能根据文本/二进制选择流并解释编码。
- 能用Path/Files处理小文本并知道边界。
- 能正确写逐行读取循环。
- 能使用BufferedWriter写多行文本。
- 能区分资源关闭和异常处理。
- 能说明对象持久化需要明确数据格式。

[提示 title=复习方式]
不要只重新看定义。盖住答案，用本章统一场景重新推一遍数据、代码或状态变化；能自己推出结果，才算掌握。

---

## 第8章综合挑战（不计分）

[标题]
保存和加载学生列表

[文本]
把3个Student写成UTF-8 CSV，每行id,name,score；再逐行读回并重建对象。额外说明如果name包含逗号，当前简化格式会出什么问题。
