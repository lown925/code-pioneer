# 第九章：数据清洗与特征处理

章节简介：使用 Spark 完成缺失值、异常值、字段转换和数据质量处理。

预计学习时间：120 分钟

章节学习目标：
- 理解并能够应用“缺失值处理”
- 理解并能够应用“重复数据处理”
- 理解并能够应用“字段类型转换”
- 理解并能够应用“字符串清洗”
- 理解并能够应用“异常值处理”
- 理解并能够应用“数据质量校验”

---

## 课时 1：缺失值处理

课时简介：学习 缺失值处理 的核心概念、Spark API 与执行机制。

预计学习时间：20 分钟

### 正文

[标题]
缺失值处理

[文本]
使用 Spark 完成缺失值、异常值、字段转换和数据质量处理。 本课围绕“缺失值处理”展开。学习 Spark 时应把 API、执行计划和分布式数据流联系起来：同一段代码是否高效，往往取决于分区、Shuffle、数据倾斜、缓存和资源配置。

[示例 title=缺失值处理示例]
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

#### 题目 145

题型：SINGLE_CHOICE
题干：关于“缺失值处理”，下列哪种理解更符合 Spark 数据处理原则？
难度：EASY
分值：10
知识点：缺失值处理
是否用于 Battle：否

选项：
- A. 应同时理解 API 语义、分区和执行计划 [正确]
- B. Spark 的所有操作都会立即执行
- C. 分区数量永远越多越好
- D. DataFrame 与底层执行计划完全无关

解析：
Spark 的使用不仅是调用 API，还要理解惰性执行、分区和物理执行过程。

#### 题目 146

题型：SINGLE_CHOICE
题干：某 Spark 作业在“缺失值处理”相关阶段明显变慢，哪种排查方式最合理？
难度：MEDIUM
分值：10
知识点：缺失值处理、Spark 性能
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

#### 题目 147

题型：SINGLE_CHOICE
题干：某 Spark 作业在“缺失值处理”环节出现数据倾斜和长尾 Task，最合理的处理是什么？
难度：HARD
分值：10
知识点：缺失值处理、分布式优化
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

## 课时 2：重复数据处理

课时简介：学习 重复数据处理 的核心概念、Spark API 与执行机制。

预计学习时间：20 分钟

### 正文

[标题]
重复数据处理

[文本]
使用 Spark 完成缺失值、异常值、字段转换和数据质量处理。 本课围绕“重复数据处理”展开。学习 Spark 时应把 API、执行计划和分布式数据流联系起来：同一段代码是否高效，往往取决于分区、Shuffle、数据倾斜、缓存和资源配置。

[示例 title=重复数据处理示例]
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

#### 题目 148

题型：SINGLE_CHOICE
题干：关于“重复数据处理”，下列哪种理解更符合 Spark 数据处理原则？
难度：EASY
分值：10
知识点：重复数据处理
是否用于 Battle：否

选项：
- A. 应同时理解 API 语义、分区和执行计划 [正确]
- B. Spark 的所有操作都会立即执行
- C. 分区数量永远越多越好
- D. DataFrame 与底层执行计划完全无关

解析：
Spark 的使用不仅是调用 API，还要理解惰性执行、分区和物理执行过程。

#### 题目 149

题型：SINGLE_CHOICE
题干：某 Spark 作业在“重复数据处理”相关阶段明显变慢，哪种排查方式最合理？
难度：MEDIUM
分值：10
知识点：重复数据处理、Spark 性能
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

#### 题目 150

题型：CODE_FILL
题干：补全下面与“重复数据处理”相关的 PySpark/Spark 代码，使表达成立。填写 `____`。
难度：HARD
分值：10
知识点：重复数据处理、Spark API
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码:
```python
clean = df.____(["event_id"])
```

可接受答案:
```text
dropDuplicates
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：否
- 统一 Windows 和 Unix 换行：是

解析：
缺失部分应为 `dropDuplicates`。补全后代码符合本课 Spark API 或执行语义。

标准完整代码:
```python
clean = df.dropDuplicates(["event_id"])
```


---

## 课时 3：字段类型转换

课时简介：学习 字段类型转换 的核心概念、Spark API 与执行机制。

预计学习时间：20 分钟

### 正文

[标题]
字段类型转换

[文本]
使用 Spark 完成缺失值、异常值、字段转换和数据质量处理。 本课围绕“字段类型转换”展开。学习 Spark 时应把 API、执行计划和分布式数据流联系起来：同一段代码是否高效，往往取决于分区、Shuffle、数据倾斜、缓存和资源配置。

[示例 title=字段类型转换示例]
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

#### 题目 151

题型：SINGLE_CHOICE
题干：关于“字段类型转换”，下列哪种理解更符合 Spark 数据处理原则？
难度：EASY
分值：10
知识点：字段类型转换
是否用于 Battle：否

选项：
- A. 应同时理解 API 语义、分区和执行计划 [正确]
- B. Spark 的所有操作都会立即执行
- C. 分区数量永远越多越好
- D. DataFrame 与底层执行计划完全无关

解析：
Spark 的使用不仅是调用 API，还要理解惰性执行、分区和物理执行过程。

#### 题目 152

题型：SINGLE_CHOICE
题干：某 Spark 作业在“字段类型转换”相关阶段明显变慢，哪种排查方式最合理？
难度：MEDIUM
分值：10
知识点：字段类型转换、Spark 性能
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

#### 题目 153

题型：SINGLE_CHOICE
题干：某 Spark 作业在“字段类型转换”环节出现数据倾斜和长尾 Task，最合理的处理是什么？
难度：HARD
分值：10
知识点：字段类型转换、分布式优化
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

## 课时 4：字符串清洗

课时简介：学习 字符串清洗 的核心概念、Spark API 与执行机制。

预计学习时间：20 分钟

### 正文

[标题]
字符串清洗

[文本]
使用 Spark 完成缺失值、异常值、字段转换和数据质量处理。 本课围绕“字符串清洗”展开。学习 Spark 时应把 API、执行计划和分布式数据流联系起来：同一段代码是否高效，往往取决于分区、Shuffle、数据倾斜、缓存和资源配置。

[示例 title=字符串清洗示例]
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

#### 题目 154

题型：SINGLE_CHOICE
题干：关于“字符串清洗”，下列哪种理解更符合 Spark 数据处理原则？
难度：EASY
分值：10
知识点：字符串清洗
是否用于 Battle：否

选项：
- A. 应同时理解 API 语义、分区和执行计划 [正确]
- B. Spark 的所有操作都会立即执行
- C. 分区数量永远越多越好
- D. DataFrame 与底层执行计划完全无关

解析：
Spark 的使用不仅是调用 API，还要理解惰性执行、分区和物理执行过程。

#### 题目 155

题型：SINGLE_CHOICE
题干：某 Spark 作业在“字符串清洗”相关阶段明显变慢，哪种排查方式最合理？
难度：MEDIUM
分值：10
知识点：字符串清洗、Spark 性能
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

#### 题目 156

题型：CODE_FILL
题干：补全下面与“字符串清洗”相关的 PySpark/Spark 代码，使表达成立。填写 `____`。
难度：HARD
分值：10
知识点：字符串清洗、Spark API
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码:
```python
df = df.withColumn("name", trim(col(____)))
```

可接受答案:
```text
"name"
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：否
- 统一 Windows 和 Unix 换行：是

解析：
缺失部分应为 `"name"`。补全后代码符合本课 Spark API 或执行语义。

标准完整代码:
```python
df = df.withColumn("name", trim(col("name")))
```


---

## 课时 5：异常值处理

课时简介：学习 异常值处理 的核心概念、Spark API 与执行机制。

预计学习时间：20 分钟

### 正文

[标题]
异常值处理

[文本]
使用 Spark 完成缺失值、异常值、字段转换和数据质量处理。 本课围绕“异常值处理”展开。学习 Spark 时应把 API、执行计划和分布式数据流联系起来：同一段代码是否高效，往往取决于分区、Shuffle、数据倾斜、缓存和资源配置。

[示例 title=异常值处理示例]
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

#### 题目 157

题型：SINGLE_CHOICE
题干：关于“异常值处理”，下列哪种理解更符合 Spark 数据处理原则？
难度：EASY
分值：10
知识点：异常值处理
是否用于 Battle：否

选项：
- A. 应同时理解 API 语义、分区和执行计划 [正确]
- B. Spark 的所有操作都会立即执行
- C. 分区数量永远越多越好
- D. DataFrame 与底层执行计划完全无关

解析：
Spark 的使用不仅是调用 API，还要理解惰性执行、分区和物理执行过程。

#### 题目 158

题型：SINGLE_CHOICE
题干：某 Spark 作业在“异常值处理”相关阶段明显变慢，哪种排查方式最合理？
难度：MEDIUM
分值：10
知识点：异常值处理、Spark 性能
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

#### 题目 159

题型：SINGLE_CHOICE
题干：某 Spark 作业在“异常值处理”环节出现数据倾斜和长尾 Task，最合理的处理是什么？
难度：HARD
分值：10
知识点：异常值处理、分布式优化
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

## 课时 6：数据质量校验

课时简介：学习 数据质量校验 的核心概念、Spark API 与执行机制。

预计学习时间：20 分钟

### 正文

[标题]
数据质量校验

[文本]
使用 Spark 完成缺失值、异常值、字段转换和数据质量处理。 本课围绕“数据质量校验”展开。学习 Spark 时应把 API、执行计划和分布式数据流联系起来：同一段代码是否高效，往往取决于分区、Shuffle、数据倾斜、缓存和资源配置。

[示例 title=数据质量校验示例]
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

#### 题目 160

题型：SINGLE_CHOICE
题干：关于“数据质量校验”，下列哪种理解更符合 Spark 数据处理原则？
难度：EASY
分值：10
知识点：数据质量校验
是否用于 Battle：否

选项：
- A. 应同时理解 API 语义、分区和执行计划 [正确]
- B. Spark 的所有操作都会立即执行
- C. 分区数量永远越多越好
- D. DataFrame 与底层执行计划完全无关

解析：
Spark 的使用不仅是调用 API，还要理解惰性执行、分区和物理执行过程。

#### 题目 161

题型：SINGLE_CHOICE
题干：某 Spark 作业在“数据质量校验”相关阶段明显变慢，哪种排查方式最合理？
难度：MEDIUM
分值：10
知识点：数据质量校验、Spark 性能
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

#### 题目 162

题型：CODE_FILL
题干：补全下面与“数据质量校验”相关的 PySpark/Spark 代码，使表达成立。填写 `____`。
难度：HARD
分值：10
知识点：数据质量校验、Spark API
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码:
```python
valid = df.filter(col("id").____())
```

可接受答案:
```text
isNotNull
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：否
- 统一 Windows 和 Unix 换行：是

解析：
缺失部分应为 `isNotNull`。补全后代码符合本课 Spark API 或执行语义。

标准完整代码:
```python
valid = df.filter(col("id").isNotNull())
```


---

