# 第八章：Spark Structured Streaming

章节简介：掌握结构化流处理、微批、事件时间、窗口和状态。

预计学习时间：120 分钟

章节学习目标：
- 理解并能够应用“Structured Streaming 基础”
- 理解并能够应用“流式 DataFrame”
- 理解并能够应用“Trigger 与微批”
- 理解并能够应用“事件时间”
- 理解并能够应用“窗口聚合”
- 理解并能够应用“Checkpoint 与容错”

---

## 课时 1：Structured Streaming 基础

课时简介：学习 Structured Streaming 基础 的核心概念、Spark API 与执行机制。

预计学习时间：20 分钟

### 正文

[标题]
Structured Streaming 基础

[文本]
掌握结构化流处理、微批、事件时间、窗口和状态。 本课围绕“Structured Streaming 基础”展开。学习 Spark 时应把 API、执行计划和分布式数据流联系起来：同一段代码是否高效，往往取决于分区、Shuffle、数据倾斜、缓存和资源配置。

[示例 title=Structured Streaming 基础示例]
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

#### 题目 127

题型：SINGLE_CHOICE
题干：关于“Structured Streaming 基础”，下列哪种理解更符合 Spark 数据处理原则？
难度：EASY
分值：10
知识点：Structured Streaming 基础
是否用于 Battle：否

选项：
- A. 应同时理解 API 语义、分区和执行计划 [正确]
- B. Spark 的所有操作都会立即执行
- C. 分区数量永远越多越好
- D. DataFrame 与底层执行计划完全无关

解析：
Spark 的使用不仅是调用 API，还要理解惰性执行、分区和物理执行过程。

#### 题目 128

题型：SINGLE_CHOICE
题干：某 Spark 作业在“Structured Streaming 基础”相关阶段明显变慢，哪种排查方式最合理？
难度：MEDIUM
分值：10
知识点：Structured Streaming 基础、Spark 性能
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

#### 题目 129

题型：SINGLE_CHOICE
题干：某 Spark 作业在“Structured Streaming 基础”环节出现数据倾斜和长尾 Task，最合理的处理是什么？
难度：HARD
分值：10
知识点：Structured Streaming 基础、分布式优化
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

## 课时 2：流式 DataFrame

课时简介：学习 流式 DataFrame 的核心概念、Spark API 与执行机制。

预计学习时间：20 分钟

### 正文

[标题]
流式 DataFrame

[文本]
掌握结构化流处理、微批、事件时间、窗口和状态。 本课围绕“流式 DataFrame”展开。学习 Spark 时应把 API、执行计划和分布式数据流联系起来：同一段代码是否高效，往往取决于分区、Shuffle、数据倾斜、缓存和资源配置。

[示例 title=流式 DataFrame示例]
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

#### 题目 130

题型：SINGLE_CHOICE
题干：关于“流式 DataFrame”，下列哪种理解更符合 Spark 数据处理原则？
难度：EASY
分值：10
知识点：流式 DataFrame
是否用于 Battle：否

选项：
- A. 应同时理解 API 语义、分区和执行计划 [正确]
- B. Spark 的所有操作都会立即执行
- C. 分区数量永远越多越好
- D. DataFrame 与底层执行计划完全无关

解析：
Spark 的使用不仅是调用 API，还要理解惰性执行、分区和物理执行过程。

#### 题目 131

题型：SINGLE_CHOICE
题干：某 Spark 作业在“流式 DataFrame”相关阶段明显变慢，哪种排查方式最合理？
难度：MEDIUM
分值：10
知识点：流式 DataFrame、Spark 性能
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

#### 题目 132

题型：CODE_FILL
题干：补全下面与“流式 DataFrame”相关的 PySpark/Spark 代码，使表达成立。填写 `____`。
难度：HARD
分值：10
知识点：流式 DataFrame、Spark API
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码:
```python
events = spark.____.json(path)
```

可接受答案:
```text
readStream
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：否
- 统一 Windows 和 Unix 换行：是

解析：
缺失部分应为 `readStream`。补全后代码符合本课 Spark API 或执行语义。

标准完整代码:
```python
events = spark.readStream.json(path)
```


---

## 课时 3：Trigger 与微批

课时简介：学习 Trigger 与微批 的核心概念、Spark API 与执行机制。

预计学习时间：20 分钟

### 正文

[标题]
Trigger 与微批

[文本]
掌握结构化流处理、微批、事件时间、窗口和状态。 本课围绕“Trigger 与微批”展开。学习 Spark 时应把 API、执行计划和分布式数据流联系起来：同一段代码是否高效，往往取决于分区、Shuffle、数据倾斜、缓存和资源配置。

[示例 title=Trigger 与微批示例]
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

#### 题目 133

题型：SINGLE_CHOICE
题干：关于“Trigger 与微批”，下列哪种理解更符合 Spark 数据处理原则？
难度：EASY
分值：10
知识点：Trigger 与微批
是否用于 Battle：否

选项：
- A. 应同时理解 API 语义、分区和执行计划 [正确]
- B. Spark 的所有操作都会立即执行
- C. 分区数量永远越多越好
- D. DataFrame 与底层执行计划完全无关

解析：
Spark 的使用不仅是调用 API，还要理解惰性执行、分区和物理执行过程。

#### 题目 134

题型：SINGLE_CHOICE
题干：某 Spark 作业在“Trigger 与微批”相关阶段明显变慢，哪种排查方式最合理？
难度：MEDIUM
分值：10
知识点：Trigger 与微批、Spark 性能
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

#### 题目 135

题型：SINGLE_CHOICE
题干：某 Spark 作业在“Trigger 与微批”环节出现数据倾斜和长尾 Task，最合理的处理是什么？
难度：HARD
分值：10
知识点：Trigger 与微批、分布式优化
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

## 课时 4：事件时间

课时简介：学习 事件时间 的核心概念、Spark API 与执行机制。

预计学习时间：20 分钟

### 正文

[标题]
事件时间

[文本]
掌握结构化流处理、微批、事件时间、窗口和状态。 本课围绕“事件时间”展开。学习 Spark 时应把 API、执行计划和分布式数据流联系起来：同一段代码是否高效，往往取决于分区、Shuffle、数据倾斜、缓存和资源配置。

[示例 title=事件时间示例]
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

#### 题目 136

题型：SINGLE_CHOICE
题干：关于“事件时间”，下列哪种理解更符合 Spark 数据处理原则？
难度：EASY
分值：10
知识点：事件时间
是否用于 Battle：否

选项：
- A. 应同时理解 API 语义、分区和执行计划 [正确]
- B. Spark 的所有操作都会立即执行
- C. 分区数量永远越多越好
- D. DataFrame 与底层执行计划完全无关

解析：
Spark 的使用不仅是调用 API，还要理解惰性执行、分区和物理执行过程。

#### 题目 137

题型：SINGLE_CHOICE
题干：某 Spark 作业在“事件时间”相关阶段明显变慢，哪种排查方式最合理？
难度：MEDIUM
分值：10
知识点：事件时间、Spark 性能
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

#### 题目 138

题型：CODE_FILL
题干：补全下面与“事件时间”相关的 PySpark/Spark 代码，使表达成立。填写 `____`。
难度：HARD
分值：10
知识点：事件时间、Spark API
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码:
```python
event_time = col(____)
```

可接受答案:
```text
"event_time"
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：否
- 统一 Windows 和 Unix 换行：是

解析：
缺失部分应为 `"event_time"`。补全后代码符合本课 Spark API 或执行语义。

标准完整代码:
```python
event_time = col("event_time")
```


---

## 课时 5：窗口聚合

课时简介：学习 窗口聚合 的核心概念、Spark API 与执行机制。

预计学习时间：20 分钟

### 正文

[标题]
窗口聚合

[文本]
掌握结构化流处理、微批、事件时间、窗口和状态。 本课围绕“窗口聚合”展开。学习 Spark 时应把 API、执行计划和分布式数据流联系起来：同一段代码是否高效，往往取决于分区、Shuffle、数据倾斜、缓存和资源配置。

[示例 title=窗口聚合示例]
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

#### 题目 139

题型：SINGLE_CHOICE
题干：关于“窗口聚合”，下列哪种理解更符合 Spark 数据处理原则？
难度：EASY
分值：10
知识点：窗口聚合
是否用于 Battle：否

选项：
- A. 应同时理解 API 语义、分区和执行计划 [正确]
- B. Spark 的所有操作都会立即执行
- C. 分区数量永远越多越好
- D. DataFrame 与底层执行计划完全无关

解析：
Spark 的使用不仅是调用 API，还要理解惰性执行、分区和物理执行过程。

#### 题目 140

题型：SINGLE_CHOICE
题干：某 Spark 作业在“窗口聚合”相关阶段明显变慢，哪种排查方式最合理？
难度：MEDIUM
分值：10
知识点：窗口聚合、Spark 性能
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

#### 题目 141

题型：SINGLE_CHOICE
题干：某 Spark 作业在“窗口聚合”环节出现数据倾斜和长尾 Task，最合理的处理是什么？
难度：HARD
分值：10
知识点：窗口聚合、分布式优化
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

## 课时 6：Checkpoint 与容错

课时简介：学习 Checkpoint 与容错 的核心概念、Spark API 与执行机制。

预计学习时间：20 分钟

### 正文

[标题]
Checkpoint 与容错

[文本]
掌握结构化流处理、微批、事件时间、窗口和状态。 本课围绕“Checkpoint 与容错”展开。学习 Spark 时应把 API、执行计划和分布式数据流联系起来：同一段代码是否高效，往往取决于分区、Shuffle、数据倾斜、缓存和资源配置。

[示例 title=Checkpoint 与容错示例]
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

#### 题目 142

题型：SINGLE_CHOICE
题干：关于“Checkpoint 与容错”，下列哪种理解更符合 Spark 数据处理原则？
难度：EASY
分值：10
知识点：Checkpoint 与容错
是否用于 Battle：否

选项：
- A. 应同时理解 API 语义、分区和执行计划 [正确]
- B. Spark 的所有操作都会立即执行
- C. 分区数量永远越多越好
- D. DataFrame 与底层执行计划完全无关

解析：
Spark 的使用不仅是调用 API，还要理解惰性执行、分区和物理执行过程。

#### 题目 143

题型：SINGLE_CHOICE
题干：某 Spark 作业在“Checkpoint 与容错”相关阶段明显变慢，哪种排查方式最合理？
难度：MEDIUM
分值：10
知识点：Checkpoint 与容错、Spark 性能
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

#### 题目 144

题型：CODE_FILL
题干：补全下面与“Checkpoint 与容错”相关的 PySpark/Spark 代码，使表达成立。填写 `____`。
难度：HARD
分值：10
知识点：Checkpoint 与容错、Spark API
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码:
```python
query.option("checkpointLocation", ____)
```

可接受答案:
```text
"/tmp/checkpoint"
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：否
- 统一 Windows 和 Unix 换行：是

解析：
缺失部分应为 `"/tmp/checkpoint"`。补全后代码符合本课 Spark API 或执行语义。

标准完整代码:
```python
query.option("checkpointLocation", "/tmp/checkpoint")
```


---

