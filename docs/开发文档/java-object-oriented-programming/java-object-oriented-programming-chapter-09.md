# 第9章：Lambda、Stream 与现代 Java

章节简介：用函数式接口理解Lambda，再用filter/map/sorted构建清晰的数据处理流水线，同时知道什么时候别用。
预计学习时间：90 分钟

章节学习目标：
- 理解并能应用函数式接口
- 理解并能应用Lambda 基本语法
- 理解并能应用stream filter
- 理解并能应用map 转换
- 理解并能应用sorted 与 collect/toList
- 理解并能应用避免滥用 Stream

[标题]
本章统一场景

[文本]
本章对学生列表做及格筛选、姓名提取和成绩排行。

---

## 课时 1：函数式接口

课时简介：理解Lambda为什么能“像值一样传一段行为”。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
Java的Lambda并不是无类型函数。它需要目标函数式接口——只有一个抽象方法的接口，例如Predicate<T>的test。

[标题]
先建立一个能看见的模型

[文本]
`Predicate<Integer> passed = score -> score >= 60;` 实际提供了一个test(Integer)实现。可把passed传给filter等API。

[代码 language=java]
Predicate<Integer> passed = score -> score >= 60;
System.out.println(passed.test(85)); // true
[/代码]

[文本]
函数式接口让行为也能作为参数。`@FunctionalInterface`可帮助编译器检查接口结构。

[示例 title=最小可验证示例]
说明：用最小输入观察本课核心规则。
语言：java

Predicate<Integer> passed = score -> score >= 60;
System.out.println(passed.test(85)); // true
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数字、名称或输入换掉，再独立推导一次。如果还能解释每一步，说明你理解的是规则而不是答案。

[警告 title=常见错误]
看到任何有两个抽象方法的接口也尝试Lambda实现，会编译失败。

[标题]
本课小结

[文本]
能解释Lambda与函数式接口关系。

### 课时题目

#### 题目 1

题型：SINGLE_CHOICE
题干：Predicate<Integer>的Lambda主要实现哪个抽象行为？

难度：EASY
分值：10
知识点：函数式接口
是否用于 Battle：否

选项：
- A. test一个值并返回boolean [正确]
- B. 把整数写磁盘
- C. 创建线程必定
- D. 返回StringBuilder

解析：
Predicate是条件。

#### 题目 2

题型：SINGLE_CHOICE
题干：`score -> score>=60`的返回类型是什么语义？

难度：MEDIUM
分值：10
知识点：Lambda
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码阅读

选项：
- A. boolean判断结果 [正确]
- B. Student对象
- C. void必定
- D. 文件路径

解析：
比较产生boolean。

#### 题目 3

题型：SINGLE_CHOICE
题干：为什么Lambda需要目标接口类型？

难度：HARD
分值：10
知识点：Lambda类型
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码阅读

选项：
- A. 编译器需要知道参数和返回契约 [正确]
- B. Java没有类型系统
- C. 为了提高网络带宽
- D. Lambda会直接变机器码文件

解析：
目标类型定义签名。


---

## 课时 2：Lambda 基本语法

课时简介：从匿名类噪声中提取“输入→行为/结果”。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
单参数可省括号，单表达式可省花括号和return；复杂逻辑用块并显式return。

[标题]
先建立一个能看见的模型

[文本]
`x -> x*2`；`(a,b)->a+b`；`s -> { int v=...; return v>=60; }`。语法简洁但仍应保持可读性。

[代码 language=java]
Function<Integer, Integer> doubleIt = x -> x * 2;
System.out.println(doubleIt.apply(5)); // 10
[/代码]

[文本]
Lambda可以捕获外部“有效final”局部变量，但不能随意修改捕获的局部变量。

[示例 title=最小可验证示例]
说明：用最小输入观察本课核心规则。
语言：java

Function<Integer, Integer> doubleIt = x -> x * 2;
System.out.println(doubleIt.apply(5)); // 10
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数字、名称或输入换掉，再独立推导一次。如果还能解释每一步，说明你理解的是规则而不是答案。

[警告 title=常见错误]
为了炫技把十几行业务塞进一个Lambda，反而比命名方法难读。

[标题]
本课小结

[文本]
能读写简单Lambda。

### 课时题目

#### 题目 4

题型：SINGLE_CHOICE
题干：`x -> x * 2`输入5得到？

难度：EASY
分值：10
知识点：Lambda
是否用于 Battle：否

选项：
- A. 10 [正确]
- B. 5
- C. 7
- D. 25

解析：
表达式返回2倍。

#### 题目 5

题型：SINGLE_CHOICE
题干：Lambda过长时更好的做法常是什么？

难度：MEDIUM
分值：10
知识点：Lambda设计
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码阅读

选项：
- A. 提取成有名字的方法 [正确]
- B. 继续压成一行
- C. 改变量名单字母
- D. 删除类型

解析：
可读性优先。

#### 题目 6

题型：CODE_FILL
题干：补全Lambda。

难度：HARD
分值：10
知识点：Lambda
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码：
```java
Function<Integer,Integer> doubleIt = x -> x ____ 2;
```

可接受答案：
```java
*
```

判题设置：
- 区分大小写：否
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
乘2。

标准完整代码：
```java
Function<Integer,Integer> doubleIt = x -> x * 2;
```


---

## 课时 3：stream filter

课时简介：用声明式方式表达“只保留符合条件元素”。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
传统循环当然能筛选，但Stream把“数据来源→筛选→后续操作”串成流水线。

[标题]
先建立一个能看见的模型

[文本]
`scores.stream().filter(s->s>=60)`不会立刻生成List，它创建惰性流水线；到`toList()`等终止操作才执行。

[代码 language=java]
List<Integer> passed = scores.stream()
    .filter(s -> s >= 60)
    .toList();
[/代码]

[文本]
filter的Predicate返回true时保留元素。不要在Predicate里做大量副作用。

[示例 title=最小可验证示例]
说明：用最小输入观察本课核心规则。
语言：java

List<Integer> passed = scores.stream()
    .filter(s -> s >= 60)
    .toList();
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数字、名称或输入换掉，再独立推导一次。如果还能解释每一步，说明你理解的是规则而不是答案。

[警告 title=常见错误]
误以为filter会修改原List。Stream操作通常产生新的流/结果，原集合不自动改变。

[标题]
本课小结

[文本]
能使用filter筛选数据。

### 课时题目

#### 题目 7

题型：SINGLE_CHOICE
题干：filter条件返回true的元素会？

难度：EASY
分值：10
知识点：Stream filter
是否用于 Battle：否

选项：
- A. 被保留进入下游 [正确]
- B. 被删除
- C. 自动变null
- D. 排序到最后

解析：
Predicate true保留。

#### 题目 8

题型：SINGLE_CHOICE
题干：filter是否自动修改原List删除不及格元素？

难度：MEDIUM
分值：10
知识点：Stream
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码阅读

选项：
- A. 不会 [正确]
- B. 会
- C. 只在ArrayList会
- D. 只在并行流会

解析：
流结果独立。

#### 题目 9

题型：SINGLE_CHOICE
题干：Stream的中间操作常具有哪种执行特性？

难度：HARD
分值：10
知识点：Stream执行
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码阅读

选项：
- A. 惰性，通常等终止操作触发 [正确]
- B. 创建时立刻处理所有数据
- C. 永远不执行
- D. 必须多线程

解析：
lazy pipeline。


---

## 课时 4：map 转换

课时简介：区分“筛选元素”和“把每个元素变成另一个值”。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
filter决定留不留，map决定每个留下的元素转换成什么。

[标题]
先建立一个能看见的模型

[文本]
Student流可`map(Student::getName)`得到姓名流；整数流`map(s->s+5)`得到加分后的值，但原对象/原List是否改变取决于映射内容。

[代码 language=java]
List<String> names = students.stream()
    .map(Student::getName)
    .toList();
[/代码]

[文本]
map允许类型变化，例如Stream<Student>→Stream<String>。

[示例 title=最小可验证示例]
说明：用最小输入观察本课核心规则。
语言：java

List<String> names = students.stream()
    .map(Student::getName)
    .toList();
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数字、名称或输入换掉，再独立推导一次。如果还能解释每一步，说明你理解的是规则而不是答案。

[警告 title=常见错误]
用map做纯副作用然后返回原值，通常可读性差；副作用应谨慎。

[标题]
本课小结

[文本]
能区分map和filter。

### 课时题目

#### 题目 10

题型：SINGLE_CHOICE
题干：从Student列表得到姓名列表最适合哪个Stream操作？

难度：EASY
分值：10
知识点：Stream map
是否用于 Battle：否

选项：
- A. map [正确]
- B. filter
- C. sorted只
- D. count

解析：
map转换元素类型。

#### 题目 11

题型：SINGLE_CHOICE
题干：filter与map区别最准确的是？

难度：MEDIUM
分值：10
知识点：Stream
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码阅读

选项：
- A. filter决定保留，map转换元素 [正确]
- B. 二者完全相同
- C. map只能排序
- D. filter只能求和

解析：
职责不同。

#### 题目 12

题型：CODE_FILL
题干：补全获取姓名。

难度：HARD
分值：10
知识点：Stream map
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码：
```java
students.stream()
    .____(Student::getName)
    .toList();
```

可接受答案：
```java
map
```

判题设置：
- 区分大小写：否
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
map把Student转name。

标准完整代码：
```java
students.stream()
    .map(Student::getName)
    .toList();
```


---

## 课时 5：sorted 与 collect/toList

课时简介：把筛选后的数据按规则排序并收集。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
Stream可以组合Comparator。成绩排行榜希望分数降序，需要明确比较方向。

[标题]
先建立一个能看见的模型

[文本]
`sorted(Comparator.comparingInt(Student::getScore).reversed())`后按高到低，再`toList()`得到新列表。

[代码 language=java]
List<Student> ranking = students.stream()
    .sorted(Comparator.comparingInt(Student::getScore).reversed())
    .toList();
[/代码]

[文本]
排序不会自动修改原students；如果要限制前三名可再`limit(3)`。

[示例 title=最小可验证示例]
说明：用最小输入观察本课核心规则。
语言：java

List<Student> ranking = students.stream()
    .sorted(Comparator.comparingInt(Student::getScore).reversed())
    .toList();
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数字、名称或输入换掉，再独立推导一次。如果还能解释每一步，说明你理解的是规则而不是答案。

[警告 title=常见错误]
忘记reversed得到低分在前，却因为数据少没注意。

[标题]
本课小结

[文本]
能构建基础Stream排序链。

### 课时题目

#### 题目 13

题型：SINGLE_CHOICE
题干：按分数从高到低排序需要什么方向？

难度：EASY
分值：10
知识点：Stream排序
是否用于 Battle：否

选项：
- A. 比较器reversed/降序 [正确]
- B. 默认升序一定高到低
- C. filter
- D. map到String

解析：
降序。

#### 题目 14

题型：SINGLE_CHOICE
题干：Stream `toList()`结果是否等于原List原地排序？

难度：MEDIUM
分值：10
知识点：Stream结果
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码阅读

选项：
- A. 不一定，通常返回新的结果列表 [正确]
- B. 一定原地修改
- C. 会删除原List
- D. 只能返回Set

解析：
流操作不等于List.sort。

#### 题目 15

题型：SINGLE_CHOICE
题干：排行榜只取前三名，在降序sorted后可接什么？

难度：HARD
分值：10
知识点：Stream综合
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码阅读

选项：
- A. limit(3) [正确]
- B. skip(100)
- C. filter(x->false)
- D. map(null)

解析：
limit限制数量。


---

## 课时 6：避免滥用 Stream

课时简介：知道什么时候普通for反而更清楚。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
Stream擅长无副作用的数据转换链。复杂状态机、频繁break/continue、多步骤异常处理，有时普通循环更直观。

[标题]
先建立一个能看见的模型

[文本]
求“第一个不及格学生并记录此前累计总分”用Stream也能写，但如果团队很难读，清晰for循环可能更好。性能也不能只凭“Stream高级”下结论。

[代码 language=text]
适合Stream：filter → map → sort → aggregate
可能更适合for：复杂状态修改、多个早退出、细粒度调试
[/代码]

[文本]
并行流尤其不能随便使用，共享副作用可能产生并发问题，任务规模小还可能更慢。

[示例 title=最小可验证示例]
说明：用最小输入观察本课核心规则。
语言：text

适合Stream：filter → map → sort → aggregate
可能更适合for：复杂状态修改、多个早退出、细粒度调试
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数字、名称或输入换掉，再独立推导一次。如果还能解释每一步，说明你理解的是规则而不是答案。

[警告 title=常见错误]
为了“现代Java”把所有循环改成stream，导致代码难调试。

[标题]
本课小结

[文本]
能基于可读性和数据流选择Stream。

### 课时题目

#### 题目 16

题型：SINGLE_CHOICE
题干：什么场景最适合Stream？

难度：EASY
分值：10
知识点：Stream设计
是否用于 Battle：否

选项：
- A. 清晰的数据筛选/转换/聚合流水线 [正确]
- B. 复杂多状态goto式流程
- C. 每步都修改共享全局变量
- D. 必须按索引反复跳转

解析：
Stream擅长数据管道。

#### 题目 17

题型：SINGLE_CHOICE
题干：parallelStream是否一定更快？

难度：MEDIUM
分值：10
知识点：并行流
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码阅读

选项：
- A. 不一定 [正确]
- B. 一定
- C. 只要CPU双核就一定
- D. 永远更慢

解析：
并行有分割/调度/合并成本。

#### 题目 18

题型：CODE_FILL
题干：补全限制前三名。

难度：HARD
分值：10
知识点：Stream综合
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码：
```java
ranking = students.stream()
    .sorted(comparator)
    .____(3)
    .toList();
```

可接受答案：
```java
limit
```

判题设置：
- 区分大小写：否
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
limit保留前N个。

标准完整代码：
```java
ranking = students.stream()
    .sorted(comparator)
    .limit(3)
    .toList();
```


---

## 第9章总结

[标题]
这一章真正学会了什么

[文本]
你已经能读写基础Lambda并组合Stream操作，也知道惰性执行、原集合不自动修改和副作用风险。

现在你应该能够：

- 能解释Lambda与函数式接口关系。
- 能读写简单Lambda。
- 能使用filter筛选数据。
- 能区分map和filter。
- 能构建基础Stream排序链。
- 能基于可读性和数据流选择Stream。

[提示 title=复习方式]
不要只重新看定义。盖住答案，用本章统一场景重新推一遍数据、代码或状态变化；能自己推出结果，才算掌握。

---

## 第9章综合挑战（不计分）

[标题]
生成前三名及格学生姓名

[文本]
Student列表先filter分数>=60，再按分数降序，limit(3)，map成姓名，toList。写出完整链并解释每一步流中元素类型/数量如何变化。
