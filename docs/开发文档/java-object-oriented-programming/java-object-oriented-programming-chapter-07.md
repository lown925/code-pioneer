# 第7章：集合框架与泛型

章节简介：从动态列表、唯一集合到键值索引和泛型，学习“数据怎样被访问”决定容器选择。
预计学习时间：90 分钟

章节学习目标：
- 理解并能应用List 处理有序集合
- 理解并能应用Set 保证唯一性
- 理解并能应用Map 用键找到值
- 理解并能应用遍历集合
- 理解并能应用泛型保证类型安全
- 理解并能应用根据需求选择集合

[标题]
本章统一场景

[文本]
本章继续使用Student和studentId，分别构造列表、签到集合和ID索引。

---

## 课时 1：List 处理有序集合

课时简介：数组长度固定，学生列表需要动态增删。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
List按顺序保存元素，可按索引访问，也可追加/删除。ArrayList是最常用实现之一。

[标题]
先建立一个能看见的模型

[文本]
`List<String> names=new ArrayList<>(); names.add("小林"); names.add("小周");`，get(0)为小林，size为2。

[代码 language=java]
List<String> names = new ArrayList<>();
names.add("小林");
names.add("小周");
System.out.println(names.get(0)); // 小林
[/代码]

[文本]
List允许重复元素；按索引访问前要保证0<=index<size。

[示例 title=最小可验证示例]
说明：用最小输入观察本课核心规则。
语言：java

List<String> names = new ArrayList<>();
names.add("小林");
names.add("小周");
System.out.println(names.get(0)); // 小林
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数字、名称或输入换掉，再独立推导一次。如果还能解释每一步，说明你理解的是规则而不是答案。

[警告 title=常见错误]
把List当成自动防重复集合。需要唯一性应考虑Set或业务校验。

[标题]
本课小结

[文本]
能用List动态保存有序数据。

### 课时题目

#### 题目 1

题型：SINGLE_CHOICE
题干：List最典型特点之一是？

难度：EASY
分值：10
知识点：List
是否用于 Battle：否

选项：
- A. 有顺序并可按索引访问 [正确]
- B. 自动保证唯一
- C. 只能存整数
- D. 长度永远固定

解析：
List有序。

#### 题目 2

题型：SINGLE_CHOICE
题干：空List add两个元素后size是？

难度：MEDIUM
分值：10
知识点：List
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码阅读

选项：
- A. 2 [正确]
- B. 1
- C. 0
- D. 3

解析：
添加两次。

#### 题目 3

题型：SINGLE_CHOICE
题干：需要保留插入顺序且允许同名学生时优先哪类？

难度：HARD
分值：10
知识点：集合选择
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码阅读

选项：
- A. List [正确]
- B. Set必定
- C. Map键集合
- D. 数组永远更好

解析：
需求匹配List。


---

## 课时 2：Set 保证唯一性

课时简介：当“同一个ID只能出现一次”时，用集合语义表达。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
Set不允许按equals/hash定义重复元素。HashSet不保证你依赖的遍历顺序。

[标题]
先建立一个能看见的模型

[文本]
`Set<String> ids=new HashSet<>(); add("S001")`两次，第二次add返回false，size仍1。

[代码 language=java]
Set<String> ids = new HashSet<>();
System.out.println(ids.add("S001")); // true
System.out.println(ids.add("S001")); // false
System.out.println(ids.size()); // 1
[/代码]

[文本]
自定义对象放HashSet时，equals/hashCode语义决定“是否重复”。

[示例 title=最小可验证示例]
说明：用最小输入观察本课核心规则。
语言：java

Set<String> ids = new HashSet<>();
System.out.println(ids.add("S001")); // true
System.out.println(ids.add("S001")); // false
System.out.println(ids.size()); // 1
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数字、名称或输入换掉，再独立推导一次。如果还能解释每一步，说明你理解的是规则而不是答案。

[警告 title=常见错误]
认为Set会自动知道“Student同ID即相同”，但Student没正确实现equals/hashCode。

[标题]
本课小结

[文本]
能用Set表示唯一集合。

### 课时题目

#### 题目 4

题型：SINGLE_CHOICE
题干：HashSet重复add同一字符串后size？

难度：EASY
分值：10
知识点：Set
是否用于 Battle：否

选项：
- A. 1 [正确]
- B. 2
- C. 0
- D. 随机

解析：
Set去重。

#### 题目 5

题型：SINGLE_CHOICE
题干：第二次add相同元素常返回？

难度：MEDIUM
分值：10
知识点：Set
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码阅读

选项：
- A. false [正确]
- B. true
- C. null
- D. 抛异常

解析：
元素已存在。

#### 题目 6

题型：CODE_FILL
题干：补全声明。

难度：HARD
分值：10
知识点：Set
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码：
```java
Set<String> ids = new ____<>();
```

可接受答案：
```java
HashSet
```

判题设置：
- 区分大小写：否
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
HashSet是Set常见实现。

标准完整代码：
```java
Set<String> ids = new HashSet<>();
```


---

## 课时 3：Map 用键找到值

课时简介：当需求是“通过studentId快速找到Student”。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
Map保存key→value映射。key通常唯一，再put同key会替换旧value。

[标题]
先建立一个能看见的模型

[文本]
`Map<String,Student> byId`把S001映射到小林。`get("S001")`直接获得对象；`containsKey`检查存在。

[代码 language=java]
Map<String, Integer> scoreById = new HashMap<>();
scoreById.put("S001", 92);
scoreById.put("S002", 85);
System.out.println(scoreById.get("S001")); // 92
[/代码]

[文本]
Map不是“两列List”。它表达明确索引关系。

[示例 title=最小可验证示例]
说明：用最小输入观察本课核心规则。
语言：java

Map<String, Integer> scoreById = new HashMap<>();
scoreById.put("S001", 92);
scoreById.put("S002", 85);
System.out.println(scoreById.get("S001")); // 92
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数字、名称或输入换掉，再独立推导一次。如果还能解释每一步，说明你理解的是规则而不是答案。

[警告 title=常见错误]
用可变对象作为HashMap key且修改参与hashCode的字段，可能导致以后找不到键。

[标题]
本课小结

[文本]
能用Map按键组织数据。

### 课时题目

#### 题目 7

题型：SINGLE_CHOICE
题干：通过学号快速查分数最适合哪类集合？

难度：EASY
分值：10
知识点：Map
是否用于 Battle：否

选项：
- A. Map [正确]
- B. 只用Set
- C. StringBuilder
- D. 异常

解析：
key→value。

#### 题目 8

题型：SINGLE_CHOICE
题干：同key再次put新值通常会？

难度：MEDIUM
分值：10
知识点：Map
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码阅读

选项：
- A. 替换该key对应旧值 [正确]
- B. 新增第二个同key条目
- C. 抛异常一定
- D. 清空Map

解析：
Map key唯一。

#### 题目 9

题型：SINGLE_CHOICE
题干：Map的key为什么需要稳定的equals/hashCode语义？

难度：HARD
分值：10
知识点：Map键
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码阅读

选项：
- A. 查找位置依赖键的相等和哈希规则 [正确]
- B. 为了输出更漂亮
- C. Map不使用key
- D. 只影响List

解析：
哈希映射需要稳定键。


---

## 课时 4：遍历集合

课时简介：根据需求选择遍历values、keys或entries。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
Map遍历时如果同时需要key和value，entrySet比先key再get更直接。List/Set可增强for。

[标题]
先建立一个能看见的模型

[文本]
`for(Map.Entry<String,Integer> e: map.entrySet())`一次获得ID和score。

[代码 language=java]
for (Map.Entry<String, Integer> e : scoreById.entrySet()) {
    System.out.println(e.getKey() + ":" + e.getValue());
}
[/代码]

[文本]
遍历时直接结构性修改某些集合可能触发ConcurrentModificationException。需要按规则用Iterator.remove或收集后再改。

[示例 title=最小可验证示例]
说明：用最小输入观察本课核心规则。
语言：java

for (Map.Entry<String, Integer> e : scoreById.entrySet()) {
    System.out.println(e.getKey() + ":" + e.getValue());
}
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数字、名称或输入换掉，再独立推导一次。如果还能解释每一步，说明你理解的是规则而不是答案。

[警告 title=常见错误]
在增强for里直接`list.remove(...)`，误以为所有实现都安全。

[标题]
本课小结

[文本]
能选择合适集合遍历方式。

### 课时题目

#### 题目 10

题型：SINGLE_CHOICE
题干：同时需要Map的key和value时常遍历？

难度：EASY
分值：10
知识点：Map遍历
是否用于 Battle：否

选项：
- A. entrySet [正确]
- B. 只遍历size
- C. String chars
- D. StackTrace

解析：
entry直接提供键值。

#### 题目 11

题型：SINGLE_CHOICE
题干：增强for遍历ArrayList时直接remove元素可能？

难度：MEDIUM
分值：10
知识点：集合修改
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码阅读

选项：
- A. 触发ConcurrentModificationException等问题 [正确]
- B. 一定安全
- C. 自动复制列表
- D. 把元素变null而不修改

解析：
结构修改需合适方式。

#### 题目 12

题型：CODE_FILL
题干：补全Map条目类型。

难度：HARD
分值：10
知识点：Map遍历
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码：
```java
for (Map.____<String,Integer> e : map.entrySet()) { }
```

可接受答案：
```java
Entry
```

判题设置：
- 区分大小写：否
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
Map.Entry表示键值对。

标准完整代码：
```java
for (Map.Entry<String,Integer> e : map.entrySet()) { }
```


---

## 课时 5：泛型保证类型安全

课时简介：理解`List<Student>`为什么比原始List更可靠。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
泛型把“这个容器只能放什么类型”交给编译器检查，减少运行时强制转换错误。

[标题]
先建立一个能看见的模型

[文本]
`List<Student>`不能add一个String。取出元素直接是Student，无需手动`(Student)`。

[代码 language=java]
List<Student> students = new ArrayList<>();
students.add(new Student("小林", 92));
Student s = students.get(0);
[/代码]

[文本]
泛型信息让API调用更清晰。如果使用原始`List`，编译器会丢失大量类型检查，错误可能拖到运行时。

[示例 title=最小可验证示例]
说明：用最小输入观察本课核心规则。
语言：java

List<Student> students = new ArrayList<>();
students.add(new Student("小林", 92));
Student s = students.get(0);
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数字、名称或输入换掉，再独立推导一次。如果还能解释每一步，说明你理解的是规则而不是答案。

[警告 title=常见错误]
为了省字把所有集合写成raw type `List`，再到处强转。

[标题]
本课小结

[文本]
能说明泛型的编译期类型安全价值。

### 课时题目

#### 题目 13

题型：SINGLE_CHOICE
题干：`List<Student>`能直接add一个String吗？

难度：EASY
分值：10
知识点：泛型
是否用于 Battle：否

选项：
- A. 不能，编译器会拒绝 [正确]
- B. 能且自动转Student
- C. 只能运行时失败
- D. 取决于String长度

解析：
泛型限制元素类型。

#### 题目 14

题型：SINGLE_CHOICE
题干：从`List<Student>` get元素通常得到什么静态类型？

难度：MEDIUM
分值：10
知识点：泛型
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码阅读

选项：
- A. Student [正确]
- B. Object必须强转
- C. String
- D. int

解析：
泛型保留类型。

#### 题目 15

题型：SINGLE_CHOICE
题干：原始类型`List`相比`List<Student>`的主要问题之一是？

难度：HARD
分值：10
知识点：泛型安全
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码阅读

选项：
- A. 丢失编译期元素类型检查 [正确]
- B. 容量更小
- C. 不能add对象
- D. 只能存null

解析：
raw type降低类型安全。


---

## 课时 6：根据需求选择集合

课时简介：把List/Set/Map从“API记忆”变成数据结构决策。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
集合选择先看访问模式：要顺序和重复→List；要唯一集合→Set；要通过键快速查值→Map。不要只因为“我最熟ArrayList”就一律使用。

[标题]
先建立一个能看见的模型

[文本]
学生课程顺序列表用List；已签到学号唯一集合用Set；学号→Student索引用Map。

[代码 language=text]
课程展示顺序 → List<Course>
已签到ID唯一 → Set<String>
按ID查学生 → Map<String,Student>
[/代码]

[文本]
真实选择还涉及排序、并发和复杂度，但需求语义是第一步。

[示例 title=最小可验证示例]
说明：用最小输入观察本课核心规则。
语言：text

课程展示顺序 → List<Course>
已签到ID唯一 → Set<String>
按ID查学生 → Map<String,Student>
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数字、名称或输入换掉，再独立推导一次。如果还能解释每一步，说明你理解的是规则而不是答案。

[警告 title=常见错误]
为了防重复使用List后每次线性contains，数据很大时可能比Set语义和性能都差。

[标题]
本课小结

[文本]
能根据访问模式选择集合。

### 课时题目

#### 题目 16

题型：SINGLE_CHOICE
题干：需要通过学号查Student最直接选择？

难度：EASY
分值：10
知识点：集合选择
是否用于 Battle：否

选项：
- A. Map<String,Student> [正确]
- B. List<Character>
- C. StringBuilder
- D. Throwable

解析：
键值映射。

#### 题目 17

题型：SINGLE_CHOICE
题干：需要记录“不重复的已签到ID”更自然选择？

难度：MEDIUM
分值：10
知识点：集合选择
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：代码阅读

选项：
- A. Set<String> [正确]
- B. List一定最好
- C. Map<Integer,Integer>必定
- D. 数组长度1

解析：
Set表达唯一。

#### 题目 18

题型：CODE_FILL
题干：补全最合适类型。

难度：HARD
分值：10
知识点：集合选择
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码：
```java
____<String> checkedInIds = new HashSet<>();
```

可接受答案：
```java
Set
```

判题设置：
- 区分大小写：否
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
唯一ID集合使用Set。

标准完整代码：
```java
Set<String> checkedInIds = new HashSet<>();
```


---

## 第7章总结

[标题]
这一章真正学会了什么

[文本]
你已经能用List/Set/Map表达不同访问模式，并知道泛型如何让错误在编译期暴露。

现在你应该能够：

- 能用List动态保存有序数据。
- 能用Set表示唯一集合。
- 能用Map按键组织数据。
- 能选择合适集合遍历方式。
- 能说明泛型的编译期类型安全价值。
- 能根据访问模式选择集合。

[提示 title=复习方式]
不要只重新看定义。盖住答案，用本章统一场景重新推一遍数据、代码或状态变化；能自己推出结果，才算掌握。

---

## 第7章综合挑战（不计分）

[标题]
建立学生索引与签到系统

[文本]
用List保持学生展示顺序，用Map按ID查Student，用Set记录签到。设计三个操作：新增学生、签到、按ID查分，并说明为什么三个容器职责不同。
