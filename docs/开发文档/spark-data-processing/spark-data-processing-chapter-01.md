# 第一章：Spark 与分布式数据处理入门

章节简介：建立 Spark、Driver、Executor、Cluster Manager 与分布式计算整体认识。

预计学习时间：120 分钟

章节学习目标：
- 理解并能够应用“Spark 的定位与优势”
- 理解并能够应用“Spark 应用架构”
- 理解并能够应用“Driver 与 Executor”
- 理解并能够应用“任务、Stage 与 Job”
- 理解并能够应用“惰性计算”
- 理解并能够应用“Spark 适用场景”

---

## 课时 1：Spark 的定位与优势

课时简介：学习 Spark 的定位与优势 的核心概念、Spark API 与执行机制。

预计学习时间：20 分钟

### 正文

[标题]
Spark 的定位与优势

[文本]
建立 Spark、Driver、Executor、Cluster Manager 与分布式计算整体认识。 本课围绕“Spark 的定位与优势”展开。学习 Spark 时应把 API、执行计划和分布式数据流联系起来：同一段代码是否高效，往往取决于分区、Shuffle、数据倾斜、缓存和资源配置。

[示例 title=Spark 的定位与优势示例]
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

#### 题目 1

题型：SINGLE_CHOICE
题干：关于“Spark 的定位与优势”，下列哪种理解更符合 Spark 数据处理原则？
难度：EASY
分值：10
知识点：Spark 的定位与优势
是否用于 Battle：否

选项：
- A. 应同时理解 API 语义、分区和执行计划 [正确]
- B. Spark 的所有操作都会立即执行
- C. 分区数量永远越多越好
- D. DataFrame 与底层执行计划完全无关

解析：
Spark 的使用不仅是调用 API，还要理解惰性执行、分区和物理执行过程。

#### 题目 2

题型：SINGLE_CHOICE
题干：某 Spark 作业在“Spark 的定位与优势”相关阶段明显变慢，哪种排查方式最合理？
难度：MEDIUM
分值：10
知识点：Spark 的定位与优势、Spark 性能
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

#### 题目 3

题型：SINGLE_CHOICE
题干：某 Spark 作业在“Spark 的定位与优势”环节出现数据倾斜和长尾 Task，最合理的处理是什么？
难度：HARD
分值：10
知识点：Spark 的定位与优势、分布式优化
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

## 课时 2：Spark 应用架构

课时简介：学习 Spark 应用架构 的核心概念、Spark API 与执行机制。

预计学习时间：20 分钟

### 正文

[标题]
Spark 应用架构

[文本]
建立 Spark、Driver、Executor、Cluster Manager 与分布式计算整体认识。 本课围绕“Spark 应用架构”展开。学习 Spark 时应把 API、执行计划和分布式数据流联系起来：同一段代码是否高效，往往取决于分区、Shuffle、数据倾斜、缓存和资源配置。

[示例 title=Spark 应用架构示例]
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

#### 题目 4

题型：SINGLE_CHOICE
题干：关于“Spark 应用架构”，下列哪种理解更符合 Spark 数据处理原则？
难度：EASY
分值：10
知识点：Spark 应用架构
是否用于 Battle：否

选项：
- A. 应同时理解 API 语义、分区和执行计划 [正确]
- B. Spark 的所有操作都会立即执行
- C. 分区数量永远越多越好
- D. DataFrame 与底层执行计划完全无关

解析：
Spark 的使用不仅是调用 API，还要理解惰性执行、分区和物理执行过程。

#### 题目 5

题型：SINGLE_CHOICE
题干：某 Spark 作业在“Spark 应用架构”相关阶段明显变慢，哪种排查方式最合理？
难度：MEDIUM
分值：10
知识点：Spark 应用架构、Spark 性能
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

#### 题目 6

题型：CODE_FILL
题干：补全下面与“Spark 应用架构”相关的 PySpark/Spark 代码，使表达成立。填写 `____`。
难度：HARD
分值：10
知识点：Spark 应用架构、Spark API
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码:
```python
app = {"driver": driver, "executors": ____}
```

可接受答案:
```text
executors
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：否
- 统一 Windows 和 Unix 换行：是

解析：
缺失部分应为 `executors`。补全后代码符合本课 Spark API 或执行语义。

标准完整代码:
```python
app = {"driver": driver, "executors": executors}
```


---

## 课时 3：Driver 与 Executor

课时简介：学习 Driver 与 Executor 的核心概念、Spark API 与执行机制。

预计学习时间：20 分钟

### 正文

[标题]
Driver 与 Executor

[文本]
建立 Spark、Driver、Executor、Cluster Manager 与分布式计算整体认识。 本课围绕“Driver 与 Executor”展开。学习 Spark 时应把 API、执行计划和分布式数据流联系起来：同一段代码是否高效，往往取决于分区、Shuffle、数据倾斜、缓存和资源配置。

[示例 title=Driver 与 Executor示例]
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

#### 题目 7

题型：SINGLE_CHOICE
题干：关于“Driver 与 Executor”，下列哪种理解更符合 Spark 数据处理原则？
难度：EASY
分值：10
知识点：Driver 与 Executor
是否用于 Battle：否

选项：
- A. 应同时理解 API 语义、分区和执行计划 [正确]
- B. Spark 的所有操作都会立即执行
- C. 分区数量永远越多越好
- D. DataFrame 与底层执行计划完全无关

解析：
Spark 的使用不仅是调用 API，还要理解惰性执行、分区和物理执行过程。

#### 题目 8

题型：SINGLE_CHOICE
题干：某 Spark 作业在“Driver 与 Executor”相关阶段明显变慢，哪种排查方式最合理？
难度：MEDIUM
分值：10
知识点：Driver 与 Executor、Spark 性能
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

#### 题目 9

题型：SINGLE_CHOICE
题干：某 Spark 作业在“Driver 与 Executor”环节出现数据倾斜和长尾 Task，最合理的处理是什么？
难度：HARD
分值：10
知识点：Driver 与 Executor、分布式优化
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

## 课时 4：任务、Stage 与 Job

课时简介：学习 任务、Stage 与 Job 的核心概念、Spark API 与执行机制。

预计学习时间：20 分钟

### 正文

[标题]
任务、Stage 与 Job

[文本]
建立 Spark、Driver、Executor、Cluster Manager 与分布式计算整体认识。 本课围绕“任务、Stage 与 Job”展开。学习 Spark 时应把 API、执行计划和分布式数据流联系起来：同一段代码是否高效，往往取决于分区、Shuffle、数据倾斜、缓存和资源配置。

[示例 title=任务、Stage 与 Job示例]
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

#### 题目 10

题型：SINGLE_CHOICE
题干：关于“任务、Stage 与 Job”，下列哪种理解更符合 Spark 数据处理原则？
难度：EASY
分值：10
知识点：任务、Stage 与 Job
是否用于 Battle：否

选项：
- A. 应同时理解 API 语义、分区和执行计划 [正确]
- B. Spark 的所有操作都会立即执行
- C. 分区数量永远越多越好
- D. DataFrame 与底层执行计划完全无关

解析：
Spark 的使用不仅是调用 API，还要理解惰性执行、分区和物理执行过程。

#### 题目 11

题型：SINGLE_CHOICE
题干：某 Spark 作业在“任务、Stage 与 Job”相关阶段明显变慢，哪种排查方式最合理？
难度：MEDIUM
分值：10
知识点：任务、Stage 与 Job、Spark 性能
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

#### 题目 12

题型：CODE_FILL
题干：补全下面与“任务、Stage 与 Job”相关的 PySpark/Spark 代码，使表达成立。填写 `____`。
难度：HARD
分值：10
知识点：任务、Stage 与 Job、Spark API
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码:
```python
job = [stage1, stage2, ____]
```

可接受答案:
```text
stage3
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：否
- 统一 Windows 和 Unix 换行：是

解析：
缺失部分应为 `stage3`。补全后代码符合本课 Spark API 或执行语义。

标准完整代码:
```python
job = [stage1, stage2, stage3]
```


---

## 课时 5：惰性计算

课时简介：学习 惰性计算 的核心概念、Spark API 与执行机制。

预计学习时间：20 分钟

### 正文

[标题]
惰性计算

[文本]
建立 Spark、Driver、Executor、Cluster Manager 与分布式计算整体认识。 本课围绕“惰性计算”展开。学习 Spark 时应把 API、执行计划和分布式数据流联系起来：同一段代码是否高效，往往取决于分区、Shuffle、数据倾斜、缓存和资源配置。

[示例 title=惰性计算示例]
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

#### 题目 13

题型：SINGLE_CHOICE
题干：关于“惰性计算”，下列哪种理解更符合 Spark 数据处理原则？
难度：EASY
分值：10
知识点：惰性计算
是否用于 Battle：否

选项：
- A. 应同时理解 API 语义、分区和执行计划 [正确]
- B. Spark 的所有操作都会立即执行
- C. 分区数量永远越多越好
- D. DataFrame 与底层执行计划完全无关

解析：
Spark 的使用不仅是调用 API，还要理解惰性执行、分区和物理执行过程。

#### 题目 14

题型：SINGLE_CHOICE
题干：某 Spark 作业在“惰性计算”相关阶段明显变慢，哪种排查方式最合理？
难度：MEDIUM
分值：10
知识点：惰性计算、Spark 性能
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

#### 题目 15

题型：SINGLE_CHOICE
题干：某 Spark 作业在“惰性计算”环节出现数据倾斜和长尾 Task，最合理的处理是什么？
难度：HARD
分值：10
知识点：惰性计算、分布式优化
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

## 课时 6：Spark 适用场景

课时简介：学习 Spark 适用场景 的核心概念、Spark API 与执行机制。

预计学习时间：20 分钟

### 正文

[标题]
Spark 适用场景

[文本]
建立 Spark、Driver、Executor、Cluster Manager 与分布式计算整体认识。 本课围绕“Spark 适用场景”展开。学习 Spark 时应把 API、执行计划和分布式数据流联系起来：同一段代码是否高效，往往取决于分区、Shuffle、数据倾斜、缓存和资源配置。

[示例 title=Spark 适用场景示例]
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

#### 题目 16

题型：SINGLE_CHOICE
题干：关于“Spark 适用场景”，下列哪种理解更符合 Spark 数据处理原则？
难度：EASY
分值：10
知识点：Spark 适用场景
是否用于 Battle：否

选项：
- A. 应同时理解 API 语义、分区和执行计划 [正确]
- B. Spark 的所有操作都会立即执行
- C. 分区数量永远越多越好
- D. DataFrame 与底层执行计划完全无关

解析：
Spark 的使用不仅是调用 API，还要理解惰性执行、分区和物理执行过程。

#### 题目 17

题型：SINGLE_CHOICE
题干：某 Spark 作业在“Spark 适用场景”相关阶段明显变慢，哪种排查方式最合理？
难度：MEDIUM
分值：10
知识点：Spark 适用场景、Spark 性能
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

#### 题目 18

题型：CODE_FILL
题干：补全下面与“Spark 适用场景”相关的 PySpark/Spark 代码，使表达成立。填写 `____`。
难度：HARD
分值：10
知识点：Spark 适用场景、Spark API
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码:
```python
use_spark = data_size > ____
```

可接受答案:
```text
single_node_capacity
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：否
- 统一 Windows 和 Unix 换行：是

解析：
缺失部分应为 `single_node_capacity`。补全后代码符合本课 Spark API 或执行语义。

标准完整代码:
```python
use_spark = data_size > single_node_capacity
```


---

