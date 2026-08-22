# 第五章：数据读写与常见格式

章节简介：掌握 CSV、JSON、Parquet、分区目录和读写选项。

预计学习时间：120 分钟

章节学习目标：
- 理解并能够应用“CSV 数据读写”
- 理解并能够应用“JSON 数据读写”
- 理解并能够应用“Parquet 与列式存储”
- 理解并能够应用“Schema 推断与显式 Schema”
- 理解并能够应用“分区写入”
- 理解并能够应用“数据源读写策略”

---

## 课时 1：CSV 数据读写

课时简介：学习 CSV 数据读写 的核心概念、Spark API 与执行机制。

预计学习时间：20 分钟

### 正文

[标题]
CSV 数据读写

[文本]
掌握 CSV、JSON、Parquet、分区目录和读写选项。 本课围绕“CSV 数据读写”展开。学习 Spark 时应把 API、执行计划和分布式数据流联系起来：同一段代码是否高效，往往取决于分区、Shuffle、数据倾斜、缓存和资源配置。

[示例 title=CSV 数据读写示例]
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

#### 题目 73

题型：SINGLE_CHOICE
题干：关于“CSV 数据读写”，下列哪种理解更符合 Spark 数据处理原则？
难度：EASY
分值：10
知识点：CSV 数据读写
是否用于 Battle：否

选项：
- A. 应同时理解 API 语义、分区和执行计划 [正确]
- B. Spark 的所有操作都会立即执行
- C. 分区数量永远越多越好
- D. DataFrame 与底层执行计划完全无关

解析：
Spark 的使用不仅是调用 API，还要理解惰性执行、分区和物理执行过程。

#### 题目 74

题型：SINGLE_CHOICE
题干：某 Spark 作业在“CSV 数据读写”相关阶段明显变慢，哪种排查方式最合理？
难度：MEDIUM
分值：10
知识点：CSV 数据读写、Spark 性能
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

#### 题目 75

题型：SINGLE_CHOICE
题干：某 Spark 作业在“CSV 数据读写”环节出现数据倾斜和长尾 Task，最合理的处理是什么？
难度：HARD
分值：10
知识点：CSV 数据读写、分布式优化
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

## 课时 2：JSON 数据读写

课时简介：学习 JSON 数据读写 的核心概念、Spark API 与执行机制。

预计学习时间：20 分钟

### 正文

[标题]
JSON 数据读写

[文本]
掌握 CSV、JSON、Parquet、分区目录和读写选项。 本课围绕“JSON 数据读写”展开。学习 Spark 时应把 API、执行计划和分布式数据流联系起来：同一段代码是否高效，往往取决于分区、Shuffle、数据倾斜、缓存和资源配置。

[示例 title=JSON 数据读写示例]
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

#### 题目 76

题型：SINGLE_CHOICE
题干：关于“JSON 数据读写”，下列哪种理解更符合 Spark 数据处理原则？
难度：EASY
分值：10
知识点：JSON 数据读写
是否用于 Battle：否

选项：
- A. 应同时理解 API 语义、分区和执行计划 [正确]
- B. Spark 的所有操作都会立即执行
- C. 分区数量永远越多越好
- D. DataFrame 与底层执行计划完全无关

解析：
Spark 的使用不仅是调用 API，还要理解惰性执行、分区和物理执行过程。

#### 题目 77

题型：SINGLE_CHOICE
题干：某 Spark 作业在“JSON 数据读写”相关阶段明显变慢，哪种排查方式最合理？
难度：MEDIUM
分值：10
知识点：JSON 数据读写、Spark 性能
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

#### 题目 78

题型：CODE_FILL
题干：补全下面与“JSON 数据读写”相关的 PySpark/Spark 代码，使表达成立。填写 `____`。
难度：HARD
分值：10
知识点：JSON 数据读写、Spark API
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码:
```python
df = spark.read.____("data.json")
```

可接受答案:
```text
json
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：否
- 统一 Windows 和 Unix 换行：是

解析：
缺失部分应为 `json`。补全后代码符合本课 Spark API 或执行语义。

标准完整代码:
```python
df = spark.read.json("data.json")
```


---

## 课时 3：Parquet 与列式存储

课时简介：学习 Parquet 与列式存储 的核心概念、Spark API 与执行机制。

预计学习时间：20 分钟

### 正文

[标题]
Parquet 与列式存储

[文本]
掌握 CSV、JSON、Parquet、分区目录和读写选项。 本课围绕“Parquet 与列式存储”展开。学习 Spark 时应把 API、执行计划和分布式数据流联系起来：同一段代码是否高效，往往取决于分区、Shuffle、数据倾斜、缓存和资源配置。

[示例 title=Parquet 与列式存储示例]
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

#### 题目 79

题型：SINGLE_CHOICE
题干：关于“Parquet 与列式存储”，下列哪种理解更符合 Spark 数据处理原则？
难度：EASY
分值：10
知识点：Parquet 与列式存储
是否用于 Battle：否

选项：
- A. 应同时理解 API 语义、分区和执行计划 [正确]
- B. Spark 的所有操作都会立即执行
- C. 分区数量永远越多越好
- D. DataFrame 与底层执行计划完全无关

解析：
Spark 的使用不仅是调用 API，还要理解惰性执行、分区和物理执行过程。

#### 题目 80

题型：SINGLE_CHOICE
题干：某 Spark 作业在“Parquet 与列式存储”相关阶段明显变慢，哪种排查方式最合理？
难度：MEDIUM
分值：10
知识点：Parquet 与列式存储、Spark 性能
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

#### 题目 81

题型：SINGLE_CHOICE
题干：某 Spark 作业在“Parquet 与列式存储”环节出现数据倾斜和长尾 Task，最合理的处理是什么？
难度：HARD
分值：10
知识点：Parquet 与列式存储、分布式优化
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

## 课时 4：Schema 推断与显式 Schema

课时简介：学习 Schema 推断与显式 Schema 的核心概念、Spark API 与执行机制。

预计学习时间：20 分钟

### 正文

[标题]
Schema 推断与显式 Schema

[文本]
掌握 CSV、JSON、Parquet、分区目录和读写选项。 本课围绕“Schema 推断与显式 Schema”展开。学习 Spark 时应把 API、执行计划和分布式数据流联系起来：同一段代码是否高效，往往取决于分区、Shuffle、数据倾斜、缓存和资源配置。

[示例 title=Schema 推断与显式 Schema示例]
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

#### 题目 82

题型：SINGLE_CHOICE
题干：关于“Schema 推断与显式 Schema”，下列哪种理解更符合 Spark 数据处理原则？
难度：EASY
分值：10
知识点：Schema 推断与显式 Schema
是否用于 Battle：否

选项：
- A. 应同时理解 API 语义、分区和执行计划 [正确]
- B. Spark 的所有操作都会立即执行
- C. 分区数量永远越多越好
- D. DataFrame 与底层执行计划完全无关

解析：
Spark 的使用不仅是调用 API，还要理解惰性执行、分区和物理执行过程。

#### 题目 83

题型：SINGLE_CHOICE
题干：某 Spark 作业在“Schema 推断与显式 Schema”相关阶段明显变慢，哪种排查方式最合理？
难度：MEDIUM
分值：10
知识点：Schema 推断与显式 Schema、Spark 性能
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

#### 题目 84

题型：CODE_FILL
题干：补全下面与“Schema 推断与显式 Schema”相关的 PySpark/Spark 代码，使表达成立。填写 `____`。
难度：HARD
分值：10
知识点：Schema 推断与显式 Schema、Spark API
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码:
```python
df = spark.read.schema(____).csv(path)
```

可接受答案:
```text
schema
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：否
- 统一 Windows 和 Unix 换行：是

解析：
缺失部分应为 `schema`。补全后代码符合本课 Spark API 或执行语义。

标准完整代码:
```python
df = spark.read.schema(schema).csv(path)
```


---

## 课时 5：分区写入

课时简介：学习 分区写入 的核心概念、Spark API 与执行机制。

预计学习时间：20 分钟

### 正文

[标题]
分区写入

[文本]
掌握 CSV、JSON、Parquet、分区目录和读写选项。 本课围绕“分区写入”展开。学习 Spark 时应把 API、执行计划和分布式数据流联系起来：同一段代码是否高效，往往取决于分区、Shuffle、数据倾斜、缓存和资源配置。

[示例 title=分区写入示例]
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

#### 题目 85

题型：SINGLE_CHOICE
题干：关于“分区写入”，下列哪种理解更符合 Spark 数据处理原则？
难度：EASY
分值：10
知识点：分区写入
是否用于 Battle：否

选项：
- A. 应同时理解 API 语义、分区和执行计划 [正确]
- B. Spark 的所有操作都会立即执行
- C. 分区数量永远越多越好
- D. DataFrame 与底层执行计划完全无关

解析：
Spark 的使用不仅是调用 API，还要理解惰性执行、分区和物理执行过程。

#### 题目 86

题型：SINGLE_CHOICE
题干：某 Spark 作业在“分区写入”相关阶段明显变慢，哪种排查方式最合理？
难度：MEDIUM
分值：10
知识点：分区写入、Spark 性能
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

#### 题目 87

题型：SINGLE_CHOICE
题干：某 Spark 作业在“分区写入”环节出现数据倾斜和长尾 Task，最合理的处理是什么？
难度：HARD
分值：10
知识点：分区写入、分布式优化
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

## 课时 6：数据源读写策略

课时简介：学习 数据源读写策略 的核心概念、Spark API 与执行机制。

预计学习时间：20 分钟

### 正文

[标题]
数据源读写策略

[文本]
掌握 CSV、JSON、Parquet、分区目录和读写选项。 本课围绕“数据源读写策略”展开。学习 Spark 时应把 API、执行计划和分布式数据流联系起来：同一段代码是否高效，往往取决于分区、Shuffle、数据倾斜、缓存和资源配置。

[示例 title=数据源读写策略示例]
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

#### 题目 88

题型：SINGLE_CHOICE
题干：关于“数据源读写策略”，下列哪种理解更符合 Spark 数据处理原则？
难度：EASY
分值：10
知识点：数据源读写策略
是否用于 Battle：否

选项：
- A. 应同时理解 API 语义、分区和执行计划 [正确]
- B. Spark 的所有操作都会立即执行
- C. 分区数量永远越多越好
- D. DataFrame 与底层执行计划完全无关

解析：
Spark 的使用不仅是调用 API，还要理解惰性执行、分区和物理执行过程。

#### 题目 89

题型：SINGLE_CHOICE
题干：某 Spark 作业在“数据源读写策略”相关阶段明显变慢，哪种排查方式最合理？
难度：MEDIUM
分值：10
知识点：数据源读写策略、Spark 性能
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

#### 题目 90

题型：CODE_FILL
题干：补全下面与“数据源读写策略”相关的 PySpark/Spark 代码，使表达成立。填写 `____`。
难度：HARD
分值：10
知识点：数据源读写策略、Spark API
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码:
```python
mode = "____"
```

可接受答案:
```text
"overwrite"
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：否
- 统一 Windows 和 Unix 换行：是

解析：
缺失部分应为 `"overwrite"`。补全后代码符合本课 Spark API 或执行语义。

标准完整代码:
```python
mode = ""overwrite""
```


---

