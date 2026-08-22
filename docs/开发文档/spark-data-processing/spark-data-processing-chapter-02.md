# 第二章：RDD 基础与转换操作

章节简介：理解 RDD、分区、Transformation 与 Action 的基本模型。

预计学习时间：120 分钟

章节学习目标：
- 理解并能够应用“RDD 概念”
- 理解并能够应用“创建 RDD”
- 理解并能够应用“map 与 flatMap”
- 理解并能够应用“filter 与 distinct”
- 理解并能够应用“union 与 intersection”
- 理解并能够应用“Transformation 与 Action”

---

## 课时 1：RDD 概念

课时简介：学习 RDD 概念 的核心概念、Spark API 与执行机制。

预计学习时间：20 分钟

### 正文

[标题]
RDD 概念

[文本]
理解 RDD、分区、Transformation 与 Action 的基本模型。 本课围绕“RDD 概念”展开。学习 Spark 时应把 API、执行计划和分布式数据流联系起来：同一段代码是否高效，往往取决于分区、Shuffle、数据倾斜、缓存和资源配置。

[示例 title=RDD 概念示例]
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

#### 题目 19

题型：SINGLE_CHOICE
题干：关于“RDD 概念”，下列哪种理解更符合 Spark 数据处理原则？
难度：EASY
分值：10
知识点：RDD 概念
是否用于 Battle：否

选项：
- A. 应同时理解 API 语义、分区和执行计划 [正确]
- B. Spark 的所有操作都会立即执行
- C. 分区数量永远越多越好
- D. DataFrame 与底层执行计划完全无关

解析：
Spark 的使用不仅是调用 API，还要理解惰性执行、分区和物理执行过程。

#### 题目 20

题型：SINGLE_CHOICE
题干：某 Spark 作业在“RDD 概念”相关阶段明显变慢，哪种排查方式最合理？
难度：MEDIUM
分值：10
知识点：RDD 概念、Spark 性能
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

#### 题目 21

题型：SINGLE_CHOICE
题干：某 Spark 作业在“RDD 概念”环节出现数据倾斜和长尾 Task，最合理的处理是什么？
难度：HARD
分值：10
知识点：RDD 概念、分布式优化
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

## 课时 2：创建 RDD

课时简介：学习 创建 RDD 的核心概念、Spark API 与执行机制。

预计学习时间：20 分钟

### 正文

[标题]
创建 RDD

[文本]
理解 RDD、分区、Transformation 与 Action 的基本模型。 本课围绕“创建 RDD”展开。学习 Spark 时应把 API、执行计划和分布式数据流联系起来：同一段代码是否高效，往往取决于分区、Shuffle、数据倾斜、缓存和资源配置。

[示例 title=创建 RDD示例]
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

#### 题目 22

题型：SINGLE_CHOICE
题干：关于“创建 RDD”，下列哪种理解更符合 Spark 数据处理原则？
难度：EASY
分值：10
知识点：创建 RDD
是否用于 Battle：否

选项：
- A. 应同时理解 API 语义、分区和执行计划 [正确]
- B. Spark 的所有操作都会立即执行
- C. 分区数量永远越多越好
- D. DataFrame 与底层执行计划完全无关

解析：
Spark 的使用不仅是调用 API，还要理解惰性执行、分区和物理执行过程。

#### 题目 23

题型：SINGLE_CHOICE
题干：某 Spark 作业在“创建 RDD”相关阶段明显变慢，哪种排查方式最合理？
难度：MEDIUM
分值：10
知识点：创建 RDD、Spark 性能
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

#### 题目 24

题型：CODE_FILL
题干：补全下面与“创建 RDD”相关的 PySpark/Spark 代码，使表达成立。填写 `____`。
难度：HARD
分值：10
知识点：创建 RDD、Spark API
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码:
```python
rdd = sc.____([1,2,3])
```

可接受答案:
```text
parallelize
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：否
- 统一 Windows 和 Unix 换行：是

解析：
缺失部分应为 `parallelize`。补全后代码符合本课 Spark API 或执行语义。

标准完整代码:
```python
rdd = sc.parallelize([1,2,3])
```


---

## 课时 3：map 与 flatMap

课时简介：学习 map 与 flatMap 的核心概念、Spark API 与执行机制。

预计学习时间：20 分钟

### 正文

[标题]
map 与 flatMap

[文本]
理解 RDD、分区、Transformation 与 Action 的基本模型。 本课围绕“map 与 flatMap”展开。学习 Spark 时应把 API、执行计划和分布式数据流联系起来：同一段代码是否高效，往往取决于分区、Shuffle、数据倾斜、缓存和资源配置。

[示例 title=map 与 flatMap示例]
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

#### 题目 25

题型：SINGLE_CHOICE
题干：关于“map 与 flatMap”，下列哪种理解更符合 Spark 数据处理原则？
难度：EASY
分值：10
知识点：map 与 flatMap
是否用于 Battle：否

选项：
- A. 应同时理解 API 语义、分区和执行计划 [正确]
- B. Spark 的所有操作都会立即执行
- C. 分区数量永远越多越好
- D. DataFrame 与底层执行计划完全无关

解析：
Spark 的使用不仅是调用 API，还要理解惰性执行、分区和物理执行过程。

#### 题目 26

题型：SINGLE_CHOICE
题干：某 Spark 作业在“map 与 flatMap”相关阶段明显变慢，哪种排查方式最合理？
难度：MEDIUM
分值：10
知识点：map 与 flatMap、Spark 性能
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

#### 题目 27

题型：SINGLE_CHOICE
题干：某 Spark 作业在“map 与 flatMap”环节出现数据倾斜和长尾 Task，最合理的处理是什么？
难度：HARD
分值：10
知识点：map 与 flatMap、分布式优化
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

## 课时 4：filter 与 distinct

课时简介：学习 filter 与 distinct 的核心概念、Spark API 与执行机制。

预计学习时间：20 分钟

### 正文

[标题]
filter 与 distinct

[文本]
理解 RDD、分区、Transformation 与 Action 的基本模型。 本课围绕“filter 与 distinct”展开。学习 Spark 时应把 API、执行计划和分布式数据流联系起来：同一段代码是否高效，往往取决于分区、Shuffle、数据倾斜、缓存和资源配置。

[示例 title=filter 与 distinct示例]
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

#### 题目 28

题型：SINGLE_CHOICE
题干：关于“filter 与 distinct”，下列哪种理解更符合 Spark 数据处理原则？
难度：EASY
分值：10
知识点：filter 与 distinct
是否用于 Battle：否

选项：
- A. 应同时理解 API 语义、分区和执行计划 [正确]
- B. Spark 的所有操作都会立即执行
- C. 分区数量永远越多越好
- D. DataFrame 与底层执行计划完全无关

解析：
Spark 的使用不仅是调用 API，还要理解惰性执行、分区和物理执行过程。

#### 题目 29

题型：SINGLE_CHOICE
题干：某 Spark 作业在“filter 与 distinct”相关阶段明显变慢，哪种排查方式最合理？
难度：MEDIUM
分值：10
知识点：filter 与 distinct、Spark 性能
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

#### 题目 30

题型：CODE_FILL
题干：补全下面与“filter 与 distinct”相关的 PySpark/Spark 代码，使表达成立。填写 `____`。
难度：HARD
分值：10
知识点：filter 与 distinct、Spark API
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码:
```python
clean = rdd.filter(lambda x: x > 0).____()
```

可接受答案:
```text
distinct
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：否
- 统一 Windows 和 Unix 换行：是

解析：
缺失部分应为 `distinct`。补全后代码符合本课 Spark API 或执行语义。

标准完整代码:
```python
clean = rdd.filter(lambda x: x > 0).distinct()
```


---

## 课时 5：union 与 intersection

课时简介：学习 union 与 intersection 的核心概念、Spark API 与执行机制。

预计学习时间：20 分钟

### 正文

[标题]
union 与 intersection

[文本]
理解 RDD、分区、Transformation 与 Action 的基本模型。 本课围绕“union 与 intersection”展开。学习 Spark 时应把 API、执行计划和分布式数据流联系起来：同一段代码是否高效，往往取决于分区、Shuffle、数据倾斜、缓存和资源配置。

[示例 title=union 与 intersection示例]
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

#### 题目 31

题型：SINGLE_CHOICE
题干：关于“union 与 intersection”，下列哪种理解更符合 Spark 数据处理原则？
难度：EASY
分值：10
知识点：union 与 intersection
是否用于 Battle：否

选项：
- A. 应同时理解 API 语义、分区和执行计划 [正确]
- B. Spark 的所有操作都会立即执行
- C. 分区数量永远越多越好
- D. DataFrame 与底层执行计划完全无关

解析：
Spark 的使用不仅是调用 API，还要理解惰性执行、分区和物理执行过程。

#### 题目 32

题型：SINGLE_CHOICE
题干：某 Spark 作业在“union 与 intersection”相关阶段明显变慢，哪种排查方式最合理？
难度：MEDIUM
分值：10
知识点：union 与 intersection、Spark 性能
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

#### 题目 33

题型：SINGLE_CHOICE
题干：某 Spark 作业在“union 与 intersection”环节出现数据倾斜和长尾 Task，最合理的处理是什么？
难度：HARD
分值：10
知识点：union 与 intersection、分布式优化
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

## 课时 6：Transformation 与 Action

课时简介：学习 Transformation 与 Action 的核心概念、Spark API 与执行机制。

预计学习时间：20 分钟

### 正文

[标题]
Transformation 与 Action

[文本]
理解 RDD、分区、Transformation 与 Action 的基本模型。 本课围绕“Transformation 与 Action”展开。学习 Spark 时应把 API、执行计划和分布式数据流联系起来：同一段代码是否高效，往往取决于分区、Shuffle、数据倾斜、缓存和资源配置。

[示例 title=Transformation 与 Action示例]
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

#### 题目 34

题型：SINGLE_CHOICE
题干：关于“Transformation 与 Action”，下列哪种理解更符合 Spark 数据处理原则？
难度：EASY
分值：10
知识点：Transformation 与 Action
是否用于 Battle：否

选项：
- A. 应同时理解 API 语义、分区和执行计划 [正确]
- B. Spark 的所有操作都会立即执行
- C. 分区数量永远越多越好
- D. DataFrame 与底层执行计划完全无关

解析：
Spark 的使用不仅是调用 API，还要理解惰性执行、分区和物理执行过程。

#### 题目 35

题型：SINGLE_CHOICE
题干：某 Spark 作业在“Transformation 与 Action”相关阶段明显变慢，哪种排查方式最合理？
难度：MEDIUM
分值：10
知识点：Transformation 与 Action、Spark 性能
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

#### 题目 36

题型：CODE_FILL
题干：补全下面与“Transformation 与 Action”相关的 PySpark/Spark 代码，使表达成立。填写 `____`。
难度：HARD
分值：10
知识点：Transformation 与 Action、Spark API
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码:
```python
count = rdd.filter(cond).____()
```

可接受答案:
```text
count
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：否
- 统一 Windows 和 Unix 换行：是

解析：
缺失部分应为 `count`。补全后代码符合本课 Spark API 或执行语义。

标准完整代码:
```python
count = rdd.filter(cond).count()
```


---

