# 第七章：Spark 分区与资源管理

章节简介：理解分区数量、并行度、Executor 资源与任务调度。

预计学习时间：120 分钟

章节学习目标：
- 理解并能够应用“分区与并行度”
- 理解并能够应用“repartition 与 coalesce”
- 理解并能够应用“Executor 资源”
- 理解并能够应用“任务调度”
- 理解并能够应用“数据本地性”
- 理解并能够应用“资源配置与容量”

---

## 课时 1：分区与并行度

课时简介：学习 分区与并行度 的核心概念、Spark API 与执行机制。

预计学习时间：20 分钟

### 正文

[标题]
分区与并行度

[文本]
理解分区数量、并行度、Executor 资源与任务调度。 本课围绕“分区与并行度”展开。学习 Spark 时应把 API、执行计划和分布式数据流联系起来：同一段代码是否高效，往往取决于分区、Shuffle、数据倾斜、缓存和资源配置。

[示例 title=分区与并行度示例]
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

#### 题目 109

题型：SINGLE_CHOICE
题干：关于“分区与并行度”，下列哪种理解更符合 Spark 数据处理原则？
难度：EASY
分值：10
知识点：分区与并行度
是否用于 Battle：否

选项：
- A. 应同时理解 API 语义、分区和执行计划 [正确]
- B. Spark 的所有操作都会立即执行
- C. 分区数量永远越多越好
- D. DataFrame 与底层执行计划完全无关

解析：
Spark 的使用不仅是调用 API，还要理解惰性执行、分区和物理执行过程。

#### 题目 110

题型：SINGLE_CHOICE
题干：某 Spark 作业在“分区与并行度”相关阶段明显变慢，哪种排查方式最合理？
难度：MEDIUM
分值：10
知识点：分区与并行度、Spark 性能
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

#### 题目 111

题型：SINGLE_CHOICE
题干：某 Spark 作业在“分区与并行度”环节出现数据倾斜和长尾 Task，最合理的处理是什么？
难度：HARD
分值：10
知识点：分区与并行度、分布式优化
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

## 课时 2：repartition 与 coalesce

课时简介：学习 repartition 与 coalesce 的核心概念、Spark API 与执行机制。

预计学习时间：20 分钟

### 正文

[标题]
repartition 与 coalesce

[文本]
理解分区数量、并行度、Executor 资源与任务调度。 本课围绕“repartition 与 coalesce”展开。学习 Spark 时应把 API、执行计划和分布式数据流联系起来：同一段代码是否高效，往往取决于分区、Shuffle、数据倾斜、缓存和资源配置。

[示例 title=repartition 与 coalesce示例]
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

#### 题目 112

题型：SINGLE_CHOICE
题干：关于“repartition 与 coalesce”，下列哪种理解更符合 Spark 数据处理原则？
难度：EASY
分值：10
知识点：repartition 与 coalesce
是否用于 Battle：否

选项：
- A. 应同时理解 API 语义、分区和执行计划 [正确]
- B. Spark 的所有操作都会立即执行
- C. 分区数量永远越多越好
- D. DataFrame 与底层执行计划完全无关

解析：
Spark 的使用不仅是调用 API，还要理解惰性执行、分区和物理执行过程。

#### 题目 113

题型：SINGLE_CHOICE
题干：某 Spark 作业在“repartition 与 coalesce”相关阶段明显变慢，哪种排查方式最合理？
难度：MEDIUM
分值：10
知识点：repartition 与 coalesce、Spark 性能
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

#### 题目 114

题型：CODE_FILL
题干：补全下面与“repartition 与 coalesce”相关的 PySpark/Spark 代码，使表达成立。填写 `____`。
难度：HARD
分值：10
知识点：repartition 与 coalesce、Spark API
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码:
```python
df2 = df.____(8)
```

可接受答案:
```text
repartition
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：否
- 统一 Windows 和 Unix 换行：是

解析：
缺失部分应为 `repartition`。补全后代码符合本课 Spark API 或执行语义。

标准完整代码:
```python
df2 = df.repartition(8)
```


---

## 课时 3：Executor 资源

课时简介：学习 Executor 资源 的核心概念、Spark API 与执行机制。

预计学习时间：20 分钟

### 正文

[标题]
Executor 资源

[文本]
理解分区数量、并行度、Executor 资源与任务调度。 本课围绕“Executor 资源”展开。学习 Spark 时应把 API、执行计划和分布式数据流联系起来：同一段代码是否高效，往往取决于分区、Shuffle、数据倾斜、缓存和资源配置。

[示例 title=Executor 资源示例]
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

#### 题目 115

题型：SINGLE_CHOICE
题干：关于“Executor 资源”，下列哪种理解更符合 Spark 数据处理原则？
难度：EASY
分值：10
知识点：Executor 资源
是否用于 Battle：否

选项：
- A. 应同时理解 API 语义、分区和执行计划 [正确]
- B. Spark 的所有操作都会立即执行
- C. 分区数量永远越多越好
- D. DataFrame 与底层执行计划完全无关

解析：
Spark 的使用不仅是调用 API，还要理解惰性执行、分区和物理执行过程。

#### 题目 116

题型：SINGLE_CHOICE
题干：某 Spark 作业在“Executor 资源”相关阶段明显变慢，哪种排查方式最合理？
难度：MEDIUM
分值：10
知识点：Executor 资源、Spark 性能
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

#### 题目 117

题型：SINGLE_CHOICE
题干：某 Spark 作业在“Executor 资源”环节出现数据倾斜和长尾 Task，最合理的处理是什么？
难度：HARD
分值：10
知识点：Executor 资源、分布式优化
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

## 课时 4：任务调度

课时简介：学习 任务调度 的核心概念、Spark API 与执行机制。

预计学习时间：20 分钟

### 正文

[标题]
任务调度

[文本]
理解分区数量、并行度、Executor 资源与任务调度。 本课围绕“任务调度”展开。学习 Spark 时应把 API、执行计划和分布式数据流联系起来：同一段代码是否高效，往往取决于分区、Shuffle、数据倾斜、缓存和资源配置。

[示例 title=任务调度示例]
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

#### 题目 118

题型：SINGLE_CHOICE
题干：关于“任务调度”，下列哪种理解更符合 Spark 数据处理原则？
难度：EASY
分值：10
知识点：任务调度
是否用于 Battle：否

选项：
- A. 应同时理解 API 语义、分区和执行计划 [正确]
- B. Spark 的所有操作都会立即执行
- C. 分区数量永远越多越好
- D. DataFrame 与底层执行计划完全无关

解析：
Spark 的使用不仅是调用 API，还要理解惰性执行、分区和物理执行过程。

#### 题目 119

题型：SINGLE_CHOICE
题干：某 Spark 作业在“任务调度”相关阶段明显变慢，哪种排查方式最合理？
难度：MEDIUM
分值：10
知识点：任务调度、Spark 性能
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

#### 题目 120

题型：CODE_FILL
题干：补全下面与“任务调度”相关的 PySpark/Spark 代码，使表达成立。填写 `____`。
难度：HARD
分值：10
知识点：任务调度、Spark API
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码:
```python
scheduler.submit(____)
```

可接受答案:
```text
stage
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：否
- 统一 Windows 和 Unix 换行：是

解析：
缺失部分应为 `stage`。补全后代码符合本课 Spark API 或执行语义。

标准完整代码:
```python
scheduler.submit(stage)
```


---

## 课时 5：数据本地性

课时简介：学习 数据本地性 的核心概念、Spark API 与执行机制。

预计学习时间：20 分钟

### 正文

[标题]
数据本地性

[文本]
理解分区数量、并行度、Executor 资源与任务调度。 本课围绕“数据本地性”展开。学习 Spark 时应把 API、执行计划和分布式数据流联系起来：同一段代码是否高效，往往取决于分区、Shuffle、数据倾斜、缓存和资源配置。

[示例 title=数据本地性示例]
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

#### 题目 121

题型：SINGLE_CHOICE
题干：关于“数据本地性”，下列哪种理解更符合 Spark 数据处理原则？
难度：EASY
分值：10
知识点：数据本地性
是否用于 Battle：否

选项：
- A. 应同时理解 API 语义、分区和执行计划 [正确]
- B. Spark 的所有操作都会立即执行
- C. 分区数量永远越多越好
- D. DataFrame 与底层执行计划完全无关

解析：
Spark 的使用不仅是调用 API，还要理解惰性执行、分区和物理执行过程。

#### 题目 122

题型：SINGLE_CHOICE
题干：某 Spark 作业在“数据本地性”相关阶段明显变慢，哪种排查方式最合理？
难度：MEDIUM
分值：10
知识点：数据本地性、Spark 性能
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

#### 题目 123

题型：SINGLE_CHOICE
题干：某 Spark 作业在“数据本地性”环节出现数据倾斜和长尾 Task，最合理的处理是什么？
难度：HARD
分值：10
知识点：数据本地性、分布式优化
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

## 课时 6：资源配置与容量

课时简介：学习 资源配置与容量 的核心概念、Spark API 与执行机制。

预计学习时间：20 分钟

### 正文

[标题]
资源配置与容量

[文本]
理解分区数量、并行度、Executor 资源与任务调度。 本课围绕“资源配置与容量”展开。学习 Spark 时应把 API、执行计划和分布式数据流联系起来：同一段代码是否高效，往往取决于分区、Shuffle、数据倾斜、缓存和资源配置。

[示例 title=资源配置与容量示例]
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

#### 题目 124

题型：SINGLE_CHOICE
题干：关于“资源配置与容量”，下列哪种理解更符合 Spark 数据处理原则？
难度：EASY
分值：10
知识点：资源配置与容量
是否用于 Battle：否

选项：
- A. 应同时理解 API 语义、分区和执行计划 [正确]
- B. Spark 的所有操作都会立即执行
- C. 分区数量永远越多越好
- D. DataFrame 与底层执行计划完全无关

解析：
Spark 的使用不仅是调用 API，还要理解惰性执行、分区和物理执行过程。

#### 题目 125

题型：SINGLE_CHOICE
题干：某 Spark 作业在“资源配置与容量”相关阶段明显变慢，哪种排查方式最合理？
难度：MEDIUM
分值：10
知识点：资源配置与容量、Spark 性能
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

#### 题目 126

题型：CODE_FILL
题干：补全下面与“资源配置与容量”相关的 PySpark/Spark 代码，使表达成立。填写 `____`。
难度：HARD
分值：10
知识点：资源配置与容量、Spark API
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码:
```python
capacity = peak * ____
```

可接受答案:
```text
safety_factor
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：否
- 统一 Windows 和 Unix 换行：是

解析：
缺失部分应为 `safety_factor`。补全后代码符合本课 Spark API 或执行语义。

标准完整代码:
```python
capacity = peak * safety_factor
```


---

