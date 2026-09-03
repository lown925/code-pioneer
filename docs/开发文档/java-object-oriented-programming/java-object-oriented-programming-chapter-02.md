# 第2章：流程控制、数组与方法

章节简介：用成绩数据学习分支、循环、数组与方法，把“会写语句”升级为“能组织重复逻辑”。
预计学习时间：90 分钟

章节学习目标：
- 理解并能应用if / else 表达分支
- 理解并能应用for 与 while 循环
- 理解并能应用数组保存同类数据
- 理解并能应用遍历数组
- 理解并能应用方法封装重复逻辑
- 理解并能应用参数、返回值与作用域

[标题]
本章统一场景

[文本]
本章统一处理成绩数组{92,85,88}。

---

## 课时 1：if / else 表达分支

课时简介：让程序根据数据做不同决定。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
成绩系统不能给所有人同一结果。条件分支把“规则”写成可执行判断。

[标题]
先建立一个能看见的模型

[文本]
`if(score>=60)`时条件为true执行通过分支，否则执行else。多个区间可用else if，但顺序会影响结果。

[代码 language=java]
int score = 85;
if (score >= 60) {
    System.out.println("通过");
} else {
    System.out.println("未通过");
}
[/代码]

[文本]
85>=60为true，所以输出“通过”。Java条件必须是boolean表达式，不会像某些语言把任意数字自动当真假。

[示例 title=最小可验证示例]
说明：用最小输入观察本课核心规则。
语言：java

int score = 85;
if (score >= 60) {
    System.out.println("通过");
} else {
    System.out.println("未通过");
}
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数字、名称或输入换掉，再独立推导一次。如果还能解释每一步，说明你理解的是规则而不是答案。

[警告 title=常见错误]
区间判断顺序写错，例如先`score>=60`再`score>=90`，95会先进入及格分支，后面的优秀分支永远到不了。

[标题]
本课小结

[文本]
能根据条件顺序判断执行分支。

### 课时题目

#### 题目 1

题型：SINGLE_CHOICE
题干：score=85时`score>=60`结果是？

难度：EASY
分值：10
知识点：if
是否用于 Battle：否

选项：
- A. true [正确]
- B. false
- C. 85
- D. null

解析：
比较表达式产生boolean。

#### 题目 2

题型：SINGLE_CHOICE
题干：为什么判断优秀/及格时常先判断`>=90`再`>=60`？

难度：MEDIUM
分值：10
知识点：分支顺序
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码阅读

选项：
- A. 避免高分先被更宽的>=60分支截获 [正确]
- B. Java只允许从大到小
- C. 为了节省内存
- D. 否则main消失

解析：
else-if按顺序匹配。

#### 题目 3

题型：SINGLE_CHOICE
题干：score=95，先写if(score>=60)后else if(score>=90)，会进入哪个？

难度：HARD
分值：10
知识点：控制流
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码阅读

选项：
- A. 第一个>=60分支 [正确]
- B. 第二个>=90分支
- C. 两个都执行
- D. 都不执行

解析：
if命中后else-if不再判断。


---

## 课时 2：for 与 while 循环

课时简介：避免重复写同一逻辑。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
有100个成绩时，不应复制100行println。循环把“重复什么”和“何时停止”表达出来。

[标题]
先建立一个能看见的模型

[文本]
for适合次数/索引明确；while适合条件驱动。`for(int i=0;i<3;i++)`中初始化一次，每轮检查条件，执行body后更新i。

[代码 language=java]
for (int i = 0; i < 3; i++) {
    System.out.println(i);
}
[/代码]

[文本]
输出0、1、2。i变成3时`i<3`为false停止。理解循环必须跟踪“检查→执行→更新”。

[示例 title=最小可验证示例]
说明：用最小输入观察本课核心规则。
语言：java

for (int i = 0; i < 3; i++) {
    System.out.println(i);
}
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数字、名称或输入换掉，再独立推导一次。如果还能解释每一步，说明你理解的是规则而不是答案。

[警告 title=常见错误]
把`i<=3`误写成`i<3`或相反导致多/少一次，是典型off-by-one错误。

[标题]
本课小结

[文本]
能手算简单for循环次数。

### 课时题目

#### 题目 4

题型：SINGLE_CHOICE
题干：`for(int i=0;i<3;i++)`循环体执行几次？

难度：EASY
分值：10
知识点：for
是否用于 Battle：否

选项：
- A. 3次 [正确]
- B. 2次
- C. 4次
- D. 无限

解析：
i取0,1,2。

#### 题目 5

题型：SINGLE_CHOICE
题干：输出值依次是什么？

难度：MEDIUM
分值：10
知识点：循环
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：输出预测

选项：
- A. 0,1,2 [正确]
- B. 1,2,3
- C. 0,1,2,3
- D. 3,2,1

解析：
先用i=0。

#### 题目 6

题型：CODE_FILL
题干：补全条件，使循环打印0到4共5次。

难度：HARD
分值：10
知识点：for循环
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码：
```java
for (int i = 0; i ____ 5; i++) {
    System.out.println(i);
}
```

可接受答案：
```java
<
```

判题设置：
- 区分大小写：否
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
i取0~4。

标准完整代码：
```java
for (int i = 0; i < 5; i++) {
    System.out.println(i);
}
```


---

## 课时 3：数组保存同类数据

课时简介：把一组成绩从多个变量变成可索引容器。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
`score1,score2,score3`数量固定且难遍历。数组一次保存固定长度、同一类型的数据。

[标题]
先建立一个能看见的模型

[文本]
`int[] scores={92,85,88}`，索引从0开始：scores[0]=92，scores[2]=88，length=3。最后合法索引是length-1。

[代码 language=java]
int[] scores = {92, 85, 88};
System.out.println(scores[0]); // 92
System.out.println(scores.length); // 3
[/代码]

[文本]
数组长度创建后固定。访问scores[3]会越界，因为3是长度，不是最后索引。

[示例 title=最小可验证示例]
说明：用最小输入观察本课核心规则。
语言：java

int[] scores = {92, 85, 88};
System.out.println(scores[0]); // 92
System.out.println(scores.length); // 3
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数字、名称或输入换掉，再独立推导一次。如果还能解释每一步，说明你理解的是规则而不是答案。

[警告 title=常见错误]
把人类“第1个”直接对应索引1，导致整体偏一。

[标题]
本课小结

[文本]
能使用数组索引和length。

### 课时题目

#### 题目 7

题型：SINGLE_CHOICE
题干：长度3数组最后合法索引是？

难度：EASY
分值：10
知识点：数组
是否用于 Battle：否

选项：
- A. 2 [正确]
- B. 3
- C. 1
- D. 4

解析：
索引0~2。

#### 题目 8

题型：SINGLE_CHOICE
题干：scores={92,85,88}时scores[1]是多少？

难度：MEDIUM
分值：10
知识点：数组
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：结果预测

选项：
- A. 85 [正确]
- B. 92
- C. 88
- D. 1

解析：
索引1是第二个元素。

#### 题目 9

题型：SINGLE_CHOICE
题干：访问scores[3]最可能发生什么？

难度：HARD
分值：10
知识点：数组越界
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码阅读

选项：
- A. 数组越界异常 [正确]
- B. 返回0
- C. 自动扩容
- D. 返回length

解析：
索引3超出0~2。


---

## 课时 4：遍历数组

课时简介：把循环和数组组合。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
数组的价值不只在“装多个数”，而在于可以统一处理每个元素，例如求和、找最大值。

[标题]
先建立一个能看见的模型

[文本]
用`for(int i=0;i<scores.length;i++)`访问scores[i]；也可用增强for `for(int score:scores)`直接取值。

[代码 language=java]
int[] scores = {92, 85, 88};
int total = 0;
for (int score : scores) {
    total += score;
}
System.out.println(total); // 265
[/代码]

[文本]
total初始0，依次加92→177→265。求和题要维护累加器每轮状态。

[示例 title=最小可验证示例]
说明：用最小输入观察本课核心规则。
语言：java

int[] scores = {92, 85, 88};
int total = 0;
for (int score : scores) {
    total += score;
}
System.out.println(total); // 265
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数字、名称或输入换掉，再独立推导一次。如果还能解释每一步，说明你理解的是规则而不是答案。

[警告 title=常见错误]
忘记初始化total，或把`total=score`写在循环里导致只保留最后一个值。

[标题]
本课小结

[文本]
能用循环求数组总和。

### 课时题目

#### 题目 10

题型：SINGLE_CHOICE
题干：上面三项成绩总和是多少？

难度：EASY
分值：10
知识点：数组遍历
是否用于 Battle：否

选项：
- A. 265 [正确]
- B. 92
- C. 88
- D. 3

解析：
92+85+88。

#### 题目 11

题型：SINGLE_CHOICE
题干：增强for中的`score`每轮表示什么？

难度：MEDIUM
分值：10
知识点：增强for
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码阅读

选项：
- A. 当前数组元素值 [正确]
- B. 数组长度
- C. 固定索引
- D. 总和

解析：
enhanced for直接取元素。

#### 题目 12

题型：CODE_FILL
题干：补全累加。

难度：HARD
分值：10
知识点：数组求和
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码：
```java
int total = 0;
for (int score : scores) {
    total ____ score;
}
```

可接受答案：
```java
+=
```

```java
= total +
```

判题设置：
- 区分大小写：否
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
+=把当前score累加。

标准完整代码：
```java
int total = 0;
for (int score : scores) {
    total += score;
}
```


---

## 课时 5：方法封装重复逻辑

课时简介：把“求平均分”从main里抽成可复用方法。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
如果多个页面/流程都要计算平均分，复制同一循环会产生重复和修改不一致。方法让一段逻辑有名字、输入和输出。

[标题]
先建立一个能看见的模型

[文本]
`average(int[] scores)`接收数组，计算total并return `total/(double)scores.length`。调用者只关心结果，不需要重复实现。

[代码 language=java]
static double average(int[] scores) {
    int total = 0;
    for (int s : scores) total += s;
    return total / (double) scores.length;
}
[/代码]

[文本]
强制转double避免整数除法截断。例如5/2若两个操作数都是int结果为2，而不是2.5。

[示例 title=最小可验证示例]
说明：用最小输入观察本课核心规则。
语言：java

static double average(int[] scores) {
    int total = 0;
    for (int s : scores) total += s;
    return total / (double) scores.length;
}
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数字、名称或输入换掉，再独立推导一次。如果还能解释每一步，说明你理解的是规则而不是答案。

[警告 title=常见错误]
方法名叫average但内部使用整数除法，结果悄悄丢小数。

[标题]
本课小结

[文本]
能定义带参数和返回值的静态方法。

### 课时题目

#### 题目 13

题型：SINGLE_CHOICE
题干：方法参数`int[] scores`表示什么？

难度：EASY
分值：10
知识点：方法
是否用于 Battle：否

选项：
- A. 调用者传入的整数数组 [正确]
- B. 返回类型
- C. 类名
- D. 异常类型

解析：
参数是输入。

#### 题目 14

题型：SINGLE_CHOICE
题干：为什么除法前转为double？

难度：MEDIUM
分值：10
知识点：类型转换
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码阅读

选项：
- A. 避免整数除法截断小数 [正确]
- B. Java只支持double数组
- C. 为了创建对象
- D. 为了排序

解析：
至少一侧double得到浮点除法。

#### 题目 15

题型：SINGLE_CHOICE
题干：方法封装重复逻辑的主要价值是什么？

难度：HARD
分值：10
知识点：方法设计
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码阅读

选项：
- A. 一处实现、多处复用且更易维护 [正确]
- B. 运行时不占任何时间
- C. 自动连接数据库
- D. 禁止参数变化

解析：
减少重复。


---

## 课时 6：参数、返回值与作用域

课时简介：理解方法内部变量为什么不能在外面直接访问。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
方法的局部变量只在自己的作用域内存在；参数是调用时传入的局部名字；return把一个结果显式交回调用者。

[标题]
先建立一个能看见的模型

[文本]
`max(a,b)`内部变量result只在方法中。调用处`int bigger=max(3,5)`得到5，但不能在main里直接访问max内部的result。

[代码 language=java]
static int max(int a, int b) {
    int result = a > b ? a : b;
    return result;
}

int bigger = max(3, 5); // 5
[/代码]

[文本]
作用域限制减少名字冲突，也让方法内部实现可以改变而不暴露细节。

[示例 title=最小可验证示例]
说明：用最小输入观察本课核心规则。
语言：java

static int max(int a, int b) {
    int result = a > b ? a : b;
    return result;
}

int bigger = max(3, 5); // 5
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数字、名称或输入换掉，再独立推导一次。如果还能解释每一步，说明你理解的是规则而不是答案。

[警告 title=常见错误]
把参数修改理解为一定能改调用者所有变量。基本类型参数按值传递，方法里改a不会直接改外部int。

[标题]
本课小结

[文本]
能区分局部变量、参数和返回值。

### 课时题目

#### 题目 16

题型：SINGLE_CHOICE
题干：max方法内部的局部变量result能否在main里直接按名字访问？

难度：EASY
分值：10
知识点：作用域
是否用于 Battle：否

选项：
- A. 不能 [正确]
- B. 能且必须
- C. 只要static就能
- D. 只在Windows不能

解析：
局部作用域限制。

#### 题目 17

题型：SINGLE_CHOICE
题干：`int bigger=max(3,5)`中bigger得到什么？

难度：MEDIUM
分值：10
知识点：返回值
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码阅读

选项：
- A. 5 [正确]
- B. 3
- C. 8
- D. null

解析：
返回较大值。

#### 题目 18

题型：CODE_FILL
题干：补全关键字。

难度：HARD
分值：10
知识点：方法返回
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码：
```java
static int max(int a,int b){
    ____ a > b ? a : b;
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
return交回结果。

标准完整代码：
```java
static int max(int a,int b){
    return a > b ? a : b;
}
```


---

## 第2章总结

[标题]
这一章真正学会了什么

[文本]
你已经能让程序根据条件做决定、遍历一组数据、计算结果并把逻辑封装到方法。

现在你应该能够：

- 能根据条件顺序判断执行分支。
- 能手算简单for循环次数。
- 能使用数组索引和length。
- 能用循环求数组总和。
- 能定义带参数和返回值的静态方法。
- 能区分局部变量、参数和返回值。

[提示 title=复习方式]
不要只重新看定义。盖住答案，用本章统一场景重新推一遍数据、代码或状态变化；能自己推出结果，才算掌握。

---

## 第2章综合挑战（不计分）

[标题]
实现成绩统计方法

[文本]
写`countPassed(int[] scores)`和`average(int[] scores)`，输入{92,55,88,60}，输出通过人数3和平均分73.75；解释循环每轮如何更新状态。
