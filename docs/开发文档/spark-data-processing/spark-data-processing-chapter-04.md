# 第四章：Spark SQL 与 DataFrame

章节简介：学习结构化数据、Schema、DataFrame API 与 SQL 查询。

预计学习时间：120 分钟

章节学习目标：
- 理解并能够应用“DataFrame 与 Schema”
- 理解并能够应用“创建 DataFrame”
- 理解并能够应用“select 与 filter”
- 理解并能够应用“groupBy 与聚合”
- 理解并能够应用“join 与多表处理”
- 理解并能够应用“Spark SQL”

---

## 课时 1：DataFrame 与 Schema

课时简介：学习 DataFrame 与 Schema 的核心概念、Spark API 与执行机制。

预计学习时间：20 分钟

### 正文

[标题]
DataFrame 与 Schema

[文本]
学习结构化数据、Schema、DataFrame API 与 SQL 查询。 本课围绕“DataFrame 与 Schema”展开。学习 Spark 时应把 API、执行计划和分布式数据流联系起来：同一段代码是否高效，往往取决于分区、Shuffle、数据倾斜、缓存和资源配置。

[示例 title=DataFrame 与 Schema示例]
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

#### 题目 55

题型：SINGLE_CHOICE
题干：关于“DataFrame 与 Schema”，下列哪种理解更符合 Spark 数据处理原则？
难度：EASY
分值：10
知识点：DataFrame 与 Schema
是否用于 Battle：否

选项：
- A. 应同时理解 API 语义、分区和执行计划 [正确]
- B. Spark 的所有操作都会立即执行
- C. 分区数量永远越多越好
- D. DataFrame 与底层执行计划完全无关

解析：
Spark 的使用不仅是调用 API，还要理解惰性执行、分区和物理执行过程。

#### 题目 56

题型：SINGLE_CHOICE
题干：某 Spark 作业在“DataFrame 与 Schema”相关阶段明显变慢，哪种排查方式最合理？
难度：MEDIUM
分值：10
知识点：DataFrame 与 Schema、Spark 性能
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

#### 题目 57

题型：SINGLE_CHOICE
题干：某 Spark 作业在“DataFrame 与 Schema”环节出现数据倾斜和长尾 Task，最合理的处理是什么？
难度：HARD
分值：10
知识点：DataFrame 与 Schema、分布式优化
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

## 课时 2：创建 DataFrame

课时简介：学习 创建 DataFrame 的核心概念、Spark API 与执行机制。

预计学习时间：20 分钟

### 正文

[标题]
创建 DataFrame

[文本]
学习结构化数据、Schema、DataFrame API 与 SQL 查询。 本课围绕“创建 DataFrame”展开。学习 Spark 时应把 API、执行计划和分布式数据流联系起来：同一段代码是否高效，往往取决于分区、Shuffle、数据倾斜、缓存和资源配置。

[示例 title=创建 DataFrame示例]
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

#### 题目 58

题型：SINGLE_CHOICE
题干：关于“创建 DataFrame”，下列哪种理解更符合 Spark 数据处理原则？
难度：EASY
分值：10
知识点：创建 DataFrame
是否用于 Battle：否

选项：
- A. 应同时理解 API 语义、分区和执行计划 [正确]
- B. Spark 的所有操作都会立即执行
- C. 分区数量永远越多越好
- D. DataFrame 与底层执行计划完全无关

解析：
Spark 的使用不仅是调用 API，还要理解惰性执行、分区和物理执行过程。

#### 题目 59

题型：SINGLE_CHOICE
题干：某 Spark 作业在“创建 DataFrame”相关阶段明显变慢，哪种排查方式最合理？
难度：MEDIUM
分值：10
知识点：创建 DataFrame、Spark 性能
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

#### 题目 60

题型：CODE_FILL
题干：补全下面与“创建 DataFrame”相关的 PySpark/Spark 代码，使表达成立。填写 `____`。
难度：HARD
分值：10
知识点：创建 DataFrame、Spark API
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码:
```python
df = spark.____(rows)
```

可接受答案:
```text
createDataFrame
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：否
- 统一 Windows 和 Unix 换行：是

解析：
缺失部分应为 `createDataFrame`。补全后代码符合本课 Spark API 或执行语义。

标准完整代码:
```python
df = spark.createDataFrame(rows)
```


---

## 课时 3：select 与 filter

课时简介：学习 select 与 filter 的核心概念、Spark API 与执行机制。

预计学习时间：20 分钟

### 正文

[标题]
select 与 filter

[文本]
学习结构化数据、Schema、DataFrame API 与 SQL 查询。 本课围绕“select 与 filter”展开。学习 Spark 时应把 API、执行计划和分布式数据流联系起来：同一段代码是否高效，往往取决于分区、Shuffle、数据倾斜、缓存和资源配置。

[示例 title=select 与 filter示例]
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

#### 题目 61

题型：SINGLE_CHOICE
题干：关于“select 与 filter”，下列哪种理解更符合 Spark 数据处理原则？
难度：EASY
分值：10
知识点：select 与 filter
是否用于 Battle：否

选项：
- A. 应同时理解 API 语义、分区和执行计划 [正确]
- B. Spark 的所有操作都会立即执行
- C. 分区数量永远越多越好
- D. DataFrame 与底层执行计划完全无关

解析：
Spark 的使用不仅是调用 API，还要理解惰性执行、分区和物理执行过程。

#### 题目 62

题型：SINGLE_CHOICE
题干：某 Spark 作业在“select 与 filter”相关阶段明显变慢，哪种排查方式最合理？
难度：MEDIUM
分值：10
知识点：select 与 filter、Spark 性能
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

#### 题目 63

题型：SINGLE_CHOICE
题干：某 Spark 作业在“select 与 filter”环节出现数据倾斜和长尾 Task，最合理的处理是什么？
难度：HARD
分值：10
知识点：select 与 filter、分布式优化
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

## 课时 4：groupBy 与聚合

课时简介：学习 groupBy 与聚合 的核心概念、Spark API 与执行机制。

预计学习时间：20 分钟

### 正文

[标题]
groupBy 与聚合

[文本]
学习结构化数据、Schema、DataFrame API 与 SQL 查询。 本课围绕“groupBy 与聚合”展开。学习 Spark 时应把 API、执行计划和分布式数据流联系起来：同一段代码是否高效，往往取决于分区、Shuffle、数据倾斜、缓存和资源配置。

[示例 title=groupBy 与聚合示例]
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

#### 题目 64

题型：SINGLE_CHOICE
题干：关于“groupBy 与聚合”，下列哪种理解更符合 Spark 数据处理原则？
难度：EASY
分值：10
知识点：groupBy 与聚合
是否用于 Battle：否

选项：
- A. 应同时理解 API 语义、分区和执行计划 [正确]
- B. Spark 的所有操作都会立即执行
- C. 分区数量永远越多越好
- D. DataFrame 与底层执行计划完全无关

解析：
Spark 的使用不仅是调用 API，还要理解惰性执行、分区和物理执行过程。

#### 题目 65

题型：SINGLE_CHOICE
题干：某 Spark 作业在“groupBy 与聚合”相关阶段明显变慢，哪种排查方式最合理？
难度：MEDIUM
分值：10
知识点：groupBy 与聚合、Spark 性能
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

#### 题目 66

题型：CODE_FILL
题干：补全下面与“groupBy 与聚合”相关的 PySpark/Spark 代码，使表达成立。填写 `____`。
难度：HARD
分值：10
知识点：groupBy 与聚合、Spark API
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码:
```python
result = df.groupBy("dept").____({"salary":"avg"})
```

可接受答案:
```text
agg
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：否
- 统一 Windows 和 Unix 换行：是

解析：
缺失部分应为 `agg`。补全后代码符合本课 Spark API 或执行语义。

标准完整代码:
```python
result = df.groupBy("dept").agg({"salary":"avg"})
```


---

## 课时 5：join 与多表处理

课时简介：学习 join 与多表处理 的核心概念、Spark API 与执行机制。

预计学习时间：20 分钟

### 正文

[标题]
join 与多表处理

[文本]
学习结构化数据、Schema、DataFrame API 与 SQL 查询。 本课围绕“join 与多表处理”展开。学习 Spark 时应把 API、执行计划和分布式数据流联系起来：同一段代码是否高效，往往取决于分区、Shuffle、数据倾斜、缓存和资源配置。

[示例 title=join 与多表处理示例]
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

#### 题目 67

题型：SINGLE_CHOICE
题干：关于“join 与多表处理”，下列哪种理解更符合 Spark 数据处理原则？
难度：EASY
分值：10
知识点：join 与多表处理
是否用于 Battle：否

选项：
- A. 应同时理解 API 语义、分区和执行计划 [正确]
- B. Spark 的所有操作都会立即执行
- C. 分区数量永远越多越好
- D. DataFrame 与底层执行计划完全无关

解析：
Spark 的使用不仅是调用 API，还要理解惰性执行、分区和物理执行过程。

#### 题目 68

题型：SINGLE_CHOICE
题干：某 Spark 作业在“join 与多表处理”相关阶段明显变慢，哪种排查方式最合理？
难度：MEDIUM
分值：10
知识点：join 与多表处理、Spark 性能
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

#### 题目 69

题型：SINGLE_CHOICE
题干：某 Spark 作业在“join 与多表处理”环节出现数据倾斜和长尾 Task，最合理的处理是什么？
难度：HARD
分值：10
知识点：join 与多表处理、分布式优化
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

## 课时 6：Spark SQL

课时简介：学习 Spark SQL 的核心概念、Spark API 与执行机制。

预计学习时间：20 分钟

### 正文

[标题]
Spark SQL

[文本]
学习结构化数据、Schema、DataFrame API 与 SQL 查询。 本课围绕“Spark SQL”展开。学习 Spark 时应把 API、执行计划和分布式数据流联系起来：同一段代码是否高效，往往取决于分区、Shuffle、数据倾斜、缓存和资源配置。

[示例 title=Spark SQL示例]
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

#### 题目 70

题型：SINGLE_CHOICE
题干：关于“Spark SQL”，下列哪种理解更符合 Spark 数据处理原则？
难度：EASY
分值：10
知识点：Spark SQL
是否用于 Battle：否

选项：
- A. 应同时理解 API 语义、分区和执行计划 [正确]
- B. Spark 的所有操作都会立即执行
- C. 分区数量永远越多越好
- D. DataFrame 与底层执行计划完全无关

解析：
Spark 的使用不仅是调用 API，还要理解惰性执行、分区和物理执行过程。

#### 题目 71

题型：SINGLE_CHOICE
题干：某 Spark 作业在“Spark SQL”相关阶段明显变慢，哪种排查方式最合理？
难度：MEDIUM
分值：10
知识点：Spark SQL、Spark 性能
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

#### 题目 72

题型：CODE_FILL
题干：补全下面与“Spark SQL”相关的 PySpark/Spark 代码，使表达成立。填写 `____`。
难度：HARD
分值：10
知识点：Spark SQL、Spark API
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码:
```python
df.createOrReplaceTempView(____)
```

可接受答案:
```text
"events"
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：否
- 统一 Windows 和 Unix 换行：是

解析：
缺失部分应为 `"events"`。补全后代码符合本课 Spark API 或执行语义。

标准完整代码:
```python
df.createOrReplaceTempView("events")
```


---

