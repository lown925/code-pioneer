# 第三章：键值 RDD 与聚合

章节简介：掌握 pair RDD、reduceByKey、groupByKey、join 与分区。

预计学习时间：120 分钟

章节学习目标：
- 理解并能够应用“Pair RDD”
- 理解并能够应用“reduceByKey”
- 理解并能够应用“groupByKey”
- 理解并能够应用“aggregateByKey”
- 理解并能够应用“join”
- 理解并能够应用“Partitioner 与数据分布”

---

## 课时 1：Pair RDD

课时简介：学习 Pair RDD 的核心概念、Spark API 与执行机制。

预计学习时间：20 分钟

### 正文

[标题]
Pair RDD

[文本]
掌握 pair RDD、reduceByKey、groupByKey、join 与分区。 本课围绕“Pair RDD”展开。学习 Spark 时应把 API、执行计划和分布式数据流联系起来：同一段代码是否高效，往往取决于分区、Shuffle、数据倾斜、缓存和资源配置。

[示例 title=Pair RDD示例]
语言：python
# PySpark 风格示意
data = [1, 2, 3]
result = [x * 2 for x in data]
print(result)
[/示例]

[提示 title=学习方法]
先判断操作是否会改变分区或触发 Shuffle，再判断是否需要缓存、重分区或调整数据模型。不要只背 API 名称。

[警告 title=执行环境边界]
课程代码以 PySpark / Spark SQL 思路为主。教学示例不会连接真实集群；生产任务还需考虑 Spark 版本、集群资源、序列化、数据规模和故障恢复。

### 课时题目

#### 题目 37

题型：SINGLE_CHOICE
题干：关于“Pair RDD”，下列哪种理解更符合 Spark 数据处理原则？
难度：EASY
分值：10
知识点：Pair RDD
是否用于 Battle：否

选项：
- A. 应同时理解 API 语义、分区和执行计划 [正确]
- B. Spark 的所有操作都会立即执行
- C. 分区数量永远越多越好
- D. DataFrame 与底层执行计划完全无关

解析：
Spark 的使用不仅是调用 API，还要理解惰性执行、分区和物理执行过程。

#### 题目 38

题型：SINGLE_CHOICE
题干：某 Spark 作业在“Pair RDD”相关阶段明显变慢，哪种排查方式最合理？
难度：MEDIUM
分值：10
知识点：Pair RDD、Spark 性能
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：场景判断

选项：
- A. 查看执行计划和 Stage 指标，检查 Shuffle、倾斜、分区与资源 [正确]
- B. 不看指标，直接把 Executor 数量无限增加
- C. 删除所有过滤条件让代码更短
- D. 将所有数据 collect 到 Driver 再处理

解析：
Spark 性能问题需要结合执行计划与 Stage 指标定位，不能盲目扩容。

#### 题目 39

题型：SINGLE_CHOICE
题干：某 Spark 作业在“Pair RDD”环节出现数据倾斜和长尾 Task，最合理的处理是什么？
难度：HARD
分值：10
知识点：Pair RDD、分布式优化
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：工程判断

选项：
- A. 先确认热点 Key 和分区分布，再考虑重分区、预聚合或数据模型调整 [正确]
- B. 只增加 Driver 内存
- C. 把所有分区合并为一个
- D. 关闭失败重试和监控

解析：
长尾 Task 常与数据分布或 Shuffle 有关，优化需要先确定实际倾斜位置。


---

## 课时 2：reduceByKey

课时简介：学习 reduceByKey 的核心概念、Spark API 与执行机制。

预计学习时间：20 分钟

### 正文

[标题]
reduceByKey

[文本]
掌握 pair RDD、reduceByKey、groupByKey、join 与分区。 本课围绕“reduceByKey”展开。学习 Spark 时应把 API、执行计划和分布式数据流联系起来：同一段代码是否高效，往往取决于分区、Shuffle、数据倾斜、缓存和资源配置。

[示例 title=reduceByKey示例]
语言：python
# PySpark 风格示意
data = [1, 2, 3]
result = [x * 2 for x in data]
print(result)
[/示例]

[提示 title=学习方法]
先判断操作是否会改变分区或触发 Shuffle，再判断是否需要缓存、重分区或调整数据模型。不要只背 API 名称。

[警告 title=执行环境边界]
课程代码以 PySpark / Spark SQL 思路为主。教学示例不会连接真实集群；生产任务还需考虑 Spark 版本、集群资源、序列化、数据规模和故障恢复。

### 课时题目

#### 题目 40

题型：SINGLE_CHOICE
题干：关于“reduceByKey”，下列哪种理解更符合 Spark 数据处理原则？
难度：EASY
分值：10
知识点：reduceByKey
是否用于 Battle：否

选项：
- A. 应同时理解 API 语义、分区和执行计划 [正确]
- B. Spark 的所有操作都会立即执行
- C. 分区数量永远越多越好
- D. DataFrame 与底层执行计划完全无关

解析：
Spark 的使用不仅是调用 API，还要理解惰性执行、分区和物理执行过程。

#### 题目 41

题型：SINGLE_CHOICE
题干：某 Spark 作业在“reduceByKey”相关阶段明显变慢，哪种排查方式最合理？
难度：MEDIUM
分值：10
知识点：reduceByKey、Spark 性能
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：场景判断

选项：
- A. 查看执行计划和 Stage 指标，检查 Shuffle、倾斜、分区与资源 [正确]
- B. 不看指标，直接把 Executor 数量无限增加
- C. 删除所有过滤条件让代码更短
- D. 将所有数据 collect 到 Driver 再处理

解析：
Spark 性能问题需要结合执行计划与 Stage 指标定位，不能盲目扩容。

#### 题目 42

题型：CODE_FILL
题干：补全下面与“reduceByKey”相关的 PySpark/Spark 代码，使表达成立。填写 `____`。
难度：HARD
分值：10
知识点：reduceByKey、Spark API
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码:
```python
totals = pairs.____(lambda a,b: a+b)
```

可接受答案:
```text
reduceByKey
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：否
- 统一 Windows 和 Unix 换行：是

解析：
缺失部分应为 `reduceByKey`。补全后代码符合本课 Spark API 或执行语义。

标准完整代码:
```python
totals = pairs.reduceByKey(lambda a,b: a+b)
```


---

## 课时 3：groupByKey

课时简介：学习 groupByKey 的核心概念、Spark API 与执行机制。

预计学习时间：20 分钟

### 正文

[标题]
groupByKey

[文本]
掌握 pair RDD、reduceByKey、groupByKey、join 与分区。 本课围绕“groupByKey”展开。学习 Spark 时应把 API、执行计划和分布式数据流联系起来：同一段代码是否高效，往往取决于分区、Shuffle、数据倾斜、缓存和资源配置。

[示例 title=groupByKey示例]
语言：python
# PySpark 风格示意
data = [1, 2, 3]
result = [x * 2 for x in data]
print(result)
[/示例]

[提示 title=学习方法]
先判断操作是否会改变分区或触发 Shuffle，再判断是否需要缓存、重分区或调整数据模型。不要只背 API 名称。

[警告 title=执行环境边界]
课程代码以 PySpark / Spark SQL 思路为主。教学示例不会连接真实集群；生产任务还需考虑 Spark 版本、集群资源、序列化、数据规模和故障恢复。

### 课时题目

#### 题目 43

题型：SINGLE_CHOICE
题干：关于“groupByKey”，下列哪种理解更符合 Spark 数据处理原则？
难度：EASY
分值：10
知识点：groupByKey
是否用于 Battle：否

选项：
- A. 应同时理解 API 语义、分区和执行计划 [正确]
- B. Spark 的所有操作都会立即执行
- C. 分区数量永远越多越好
- D. DataFrame 与底层执行计划完全无关

解析：
Spark 的使用不仅是调用 API，还要理解惰性执行、分区和物理执行过程。

#### 题目 44

题型：SINGLE_CHOICE
题干：某 Spark 作业在“groupByKey”相关阶段明显变慢，哪种排查方式最合理？
难度：MEDIUM
分值：10
知识点：groupByKey、Spark 性能
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：场景判断

选项：
- A. 查看执行计划和 Stage 指标，检查 Shuffle、倾斜、分区与资源 [正确]
- B. 不看指标，直接把 Executor 数量无限增加
- C. 删除所有过滤条件让代码更短
- D. 将所有数据 collect 到 Driver 再处理

解析：
Spark 性能问题需要结合执行计划与 Stage 指标定位，不能盲目扩容。

#### 题目 45

题型：SINGLE_CHOICE
题干：某 Spark 作业在“groupByKey”环节出现数据倾斜和长尾 Task，最合理的处理是什么？
难度：HARD
分值：10
知识点：groupByKey、分布式优化
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：工程判断

选项：
- A. 先确认热点 Key 和分区分布，再考虑重分区、预聚合或数据模型调整 [正确]
- B. 只增加 Driver 内存
- C. 把所有分区合并为一个
- D. 关闭失败重试和监控

解析：
长尾 Task 常与数据分布或 Shuffle 有关，优化需要先确定实际倾斜位置。


---

## 课时 4：aggregateByKey

课时简介：学习 aggregateByKey 的核心概念、Spark API 与执行机制。

预计学习时间：20 分钟

### 正文

[标题]
aggregateByKey

[文本]
掌握 pair RDD、reduceByKey、groupByKey、join 与分区。 本课围绕“aggregateByKey”展开。学习 Spark 时应把 API、执行计划和分布式数据流联系起来：同一段代码是否高效，往往取决于分区、Shuffle、数据倾斜、缓存和资源配置。

[示例 title=aggregateByKey示例]
语言：python
# PySpark 风格示意
data = [1, 2, 3]
result = [x * 2 for x in data]
print(result)
[/示例]

[提示 title=学习方法]
先判断操作是否会改变分区或触发 Shuffle，再判断是否需要缓存、重分区或调整数据模型。不要只背 API 名称。

[警告 title=执行环境边界]
课程代码以 PySpark / Spark SQL 思路为主。教学示例不会连接真实集群；生产任务还需考虑 Spark 版本、集群资源、序列化、数据规模和故障恢复。

### 课时题目

#### 题目 46

题型：SINGLE_CHOICE
题干：关于“aggregateByKey”，下列哪种理解更符合 Spark 数据处理原则？
难度：EASY
分值：10
知识点：aggregateByKey
是否用于 Battle：否

选项：
- A. 应同时理解 API 语义、分区和执行计划 [正确]
- B. Spark 的所有操作都会立即执行
- C. 分区数量永远越多越好
- D. DataFrame 与底层执行计划完全无关

解析：
Spark 的使用不仅是调用 API，还要理解惰性执行、分区和物理执行过程。

#### 题目 47

题型：SINGLE_CHOICE
题干：某 Spark 作业在“aggregateByKey”相关阶段明显变慢，哪种排查方式最合理？
难度：MEDIUM
分值：10
知识点：aggregateByKey、Spark 性能
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：场景判断

选项：
- A. 查看执行计划和 Stage 指标，检查 Shuffle、倾斜、分区与资源 [正确]
- B. 不看指标，直接把 Executor 数量无限增加
- C. 删除所有过滤条件让代码更短
- D. 将所有数据 collect 到 Driver 再处理

解析：
Spark 性能问题需要结合执行计划与 Stage 指标定位，不能盲目扩容。

#### 题目 48

题型：CODE_FILL
题干：补全下面与“aggregateByKey”相关的 PySpark/Spark 代码，使表达成立。填写 `____`。
难度：HARD
分值：10
知识点：aggregateByKey、Spark API
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码:
```python
result = pairs.aggregateByKey(0, seqOp, ____)
```

可接受答案:
```text
combOp
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：否
- 统一 Windows 和 Unix 换行：是

解析：
缺失部分应为 `combOp`。补全后代码符合本课 Spark API 或执行语义。

标准完整代码:
```python
result = pairs.aggregateByKey(0, seqOp, combOp)
```


---

## 课时 5：join

课时简介：学习 join 的核心概念、Spark API 与执行机制。

预计学习时间：20 分钟

### 正文

[标题]
join

[文本]
掌握 pair RDD、reduceByKey、groupByKey、join 与分区。 本课围绕“join”展开。学习 Spark 时应把 API、执行计划和分布式数据流联系起来：同一段代码是否高效，往往取决于分区、Shuffle、数据倾斜、缓存和资源配置。

[示例 title=join示例]
语言：python
# PySpark 风格示意
data = [1, 2, 3]
result = [x * 2 for x in data]
print(result)
[/示例]

[提示 title=学习方法]
先判断操作是否会改变分区或触发 Shuffle，再判断是否需要缓存、重分区或调整数据模型。不要只背 API 名称。

[警告 title=执行环境边界]
课程代码以 PySpark / Spark SQL 思路为主。教学示例不会连接真实集群；生产任务还需考虑 Spark 版本、集群资源、序列化、数据规模和故障恢复。

### 课时题目

#### 题目 49

题型：SINGLE_CHOICE
题干：关于“join”，下列哪种理解更符合 Spark 数据处理原则？
难度：EASY
分值：10
知识点：join
是否用于 Battle：否

选项：
- A. 应同时理解 API 语义、分区和执行计划 [正确]
- B. Spark 的所有操作都会立即执行
- C. 分区数量永远越多越好
- D. DataFrame 与底层执行计划完全无关

解析：
Spark 的使用不仅是调用 API，还要理解惰性执行、分区和物理执行过程。

#### 题目 50

题型：SINGLE_CHOICE
题干：某 Spark 作业在“join”相关阶段明显变慢，哪种排查方式最合理？
难度：MEDIUM
分值：10
知识点：join、Spark 性能
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：场景判断

选项：
- A. 查看执行计划和 Stage 指标，检查 Shuffle、倾斜、分区与资源 [正确]
- B. 不看指标，直接把 Executor 数量无限增加
- C. 删除所有过滤条件让代码更短
- D. 将所有数据 collect 到 Driver 再处理

解析：
Spark 性能问题需要结合执行计划与 Stage 指标定位，不能盲目扩容。

#### 题目 51

题型：SINGLE_CHOICE
题干：某 Spark 作业在“join”环节出现数据倾斜和长尾 Task，最合理的处理是什么？
难度：HARD
分值：10
知识点：join、分布式优化
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：工程判断

选项：
- A. 先确认热点 Key 和分区分布，再考虑重分区、预聚合或数据模型调整 [正确]
- B. 只增加 Driver 内存
- C. 把所有分区合并为一个
- D. 关闭失败重试和监控

解析：
长尾 Task 常与数据分布或 Shuffle 有关，优化需要先确定实际倾斜位置。


---

## 课时 6：Partitioner 与数据分布

课时简介：学习 Partitioner 与数据分布 的核心概念、Spark API 与执行机制。

预计学习时间：20 分钟

### 正文

[标题]
Partitioner 与数据分布

[文本]
掌握 pair RDD、reduceByKey、groupByKey、join 与分区。 本课围绕“Partitioner 与数据分布”展开。学习 Spark 时应把 API、执行计划和分布式数据流联系起来：同一段代码是否高效，往往取决于分区、Shuffle、数据倾斜、缓存和资源配置。

[示例 title=Partitioner 与数据分布示例]
语言：python
# PySpark 风格示意
data = [1, 2, 3]
result = [x * 2 for x in data]
print(result)
[/示例]

[提示 title=学习方法]
先判断操作是否会改变分区或触发 Shuffle，再判断是否需要缓存、重分区或调整数据模型。不要只背 API 名称。

[警告 title=执行环境边界]
课程代码以 PySpark / Spark SQL 思路为主。教学示例不会连接真实集群；生产任务还需考虑 Spark 版本、集群资源、序列化、数据规模和故障恢复。

### 课时题目

#### 题目 52

题型：SINGLE_CHOICE
题干：关于“Partitioner 与数据分布”，下列哪种理解更符合 Spark 数据处理原则？
难度：EASY
分值：10
知识点：Partitioner 与数据分布
是否用于 Battle：否

选项：
- A. 应同时理解 API 语义、分区和执行计划 [正确]
- B. Spark 的所有操作都会立即执行
- C. 分区数量永远越多越好
- D. DataFrame 与底层执行计划完全无关

解析：
Spark 的使用不仅是调用 API，还要理解惰性执行、分区和物理执行过程。

#### 题目 53

题型：SINGLE_CHOICE
题干：某 Spark 作业在“Partitioner 与数据分布”相关阶段明显变慢，哪种排查方式最合理？
难度：MEDIUM
分值：10
知识点：Partitioner 与数据分布、Spark 性能
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：场景判断

选项：
- A. 查看执行计划和 Stage 指标，检查 Shuffle、倾斜、分区与资源 [正确]
- B. 不看指标，直接把 Executor 数量无限增加
- C. 删除所有过滤条件让代码更短
- D. 将所有数据 collect 到 Driver 再处理

解析：
Spark 性能问题需要结合执行计划与 Stage 指标定位，不能盲目扩容。

#### 题目 54

题型：CODE_FILL
题干：补全下面与“Partitioner 与数据分布”相关的 PySpark/Spark 代码，使表达成立。填写 `____`。
难度：HARD
分值：10
知识点：Partitioner 与数据分布、Spark API
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码:
```python
partition = hash(key) % ____
```

可接受答案:
```text
num_partitions
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：否
- 统一 Windows 和 Unix 换行：是

解析：
缺失部分应为 `num_partitions`。补全后代码符合本课 Spark API 或执行语义。

标准完整代码:
```python
partition = hash(key) % num_partitions
```


---

