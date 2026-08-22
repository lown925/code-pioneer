# 第六章：Spark 执行计划与性能优化

章节简介：理解 Catalyst、物理计划、Shuffle、缓存与数据倾斜。

预计学习时间：120 分钟

章节学习目标：
- 理解并能够应用“逻辑计划与物理计划”
- 理解并能够应用“explain 与执行计划”
- 理解并能够应用“Shuffle”
- 理解并能够应用“缓存与 persist”
- 理解并能够应用“数据倾斜”
- 理解并能够应用“常见性能优化方法”

---

## 课时 1：逻辑计划与物理计划

课时简介：学习 逻辑计划与物理计划 的核心概念、Spark API 与执行机制。

预计学习时间：20 分钟

### 正文

[标题]
逻辑计划与物理计划

[文本]
理解 Catalyst、物理计划、Shuffle、缓存与数据倾斜。 本课围绕“逻辑计划与物理计划”展开。学习 Spark 时应把 API、执行计划和分布式数据流联系起来：同一段代码是否高效，往往取决于分区、Shuffle、数据倾斜、缓存和资源配置。

[示例 title=逻辑计划与物理计划示例]
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

#### 题目 91

题型：SINGLE_CHOICE
题干：关于“逻辑计划与物理计划”，下列哪种理解更符合 Spark 数据处理原则？
难度：EASY
分值：10
知识点：逻辑计划与物理计划
是否用于 Battle：否

选项：
- A. 应同时理解 API 语义、分区和执行计划 [正确]
- B. Spark 的所有操作都会立即执行
- C. 分区数量永远越多越好
- D. DataFrame 与底层执行计划完全无关

解析：
Spark 的使用不仅是调用 API，还要理解惰性执行、分区和物理执行过程。

#### 题目 92

题型：SINGLE_CHOICE
题干：某 Spark 作业在“逻辑计划与物理计划”相关阶段明显变慢，哪种排查方式最合理？
难度：MEDIUM
分值：10
知识点：逻辑计划与物理计划、Spark 性能
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

#### 题目 93

题型：SINGLE_CHOICE
题干：某 Spark 作业在“逻辑计划与物理计划”环节出现数据倾斜和长尾 Task，最合理的处理是什么？
难度：HARD
分值：10
知识点：逻辑计划与物理计划、分布式优化
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

## 课时 2：explain 与执行计划

课时简介：学习 explain 与执行计划 的核心概念、Spark API 与执行机制。

预计学习时间：20 分钟

### 正文

[标题]
explain 与执行计划

[文本]
理解 Catalyst、物理计划、Shuffle、缓存与数据倾斜。 本课围绕“explain 与执行计划”展开。学习 Spark 时应把 API、执行计划和分布式数据流联系起来：同一段代码是否高效，往往取决于分区、Shuffle、数据倾斜、缓存和资源配置。

[示例 title=explain 与执行计划示例]
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

#### 题目 94

题型：SINGLE_CHOICE
题干：关于“explain 与执行计划”，下列哪种理解更符合 Spark 数据处理原则？
难度：EASY
分值：10
知识点：explain 与执行计划
是否用于 Battle：否

选项：
- A. 应同时理解 API 语义、分区和执行计划 [正确]
- B. Spark 的所有操作都会立即执行
- C. 分区数量永远越多越好
- D. DataFrame 与底层执行计划完全无关

解析：
Spark 的使用不仅是调用 API，还要理解惰性执行、分区和物理执行过程。

#### 题目 95

题型：SINGLE_CHOICE
题干：某 Spark 作业在“explain 与执行计划”相关阶段明显变慢，哪种排查方式最合理？
难度：MEDIUM
分值：10
知识点：explain 与执行计划、Spark 性能
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

#### 题目 96

题型：CODE_FILL
题干：补全下面与“explain 与执行计划”相关的 PySpark/Spark 代码，使表达成立。填写 `____`。
难度：HARD
分值：10
知识点：explain 与执行计划、Spark API
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码:
```python
df.____(True)
```

可接受答案:
```text
explain
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：否
- 统一 Windows 和 Unix 换行：是

解析：
缺失部分应为 `explain`。补全后代码符合本课 Spark API 或执行语义。

标准完整代码:
```python
df.explain(True)
```


---

## 课时 3：Shuffle

课时简介：学习 Shuffle 的核心概念、Spark API 与执行机制。

预计学习时间：20 分钟

### 正文

[标题]
Shuffle

[文本]
理解 Catalyst、物理计划、Shuffle、缓存与数据倾斜。 本课围绕“Shuffle”展开。学习 Spark 时应把 API、执行计划和分布式数据流联系起来：同一段代码是否高效，往往取决于分区、Shuffle、数据倾斜、缓存和资源配置。

[示例 title=Shuffle示例]
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

#### 题目 97

题型：SINGLE_CHOICE
题干：关于“Shuffle”，下列哪种理解更符合 Spark 数据处理原则？
难度：EASY
分值：10
知识点：Shuffle
是否用于 Battle：否

选项：
- A. 应同时理解 API 语义、分区和执行计划 [正确]
- B. Spark 的所有操作都会立即执行
- C. 分区数量永远越多越好
- D. DataFrame 与底层执行计划完全无关

解析：
Spark 的使用不仅是调用 API，还要理解惰性执行、分区和物理执行过程。

#### 题目 98

题型：SINGLE_CHOICE
题干：某 Spark 作业在“Shuffle”相关阶段明显变慢，哪种排查方式最合理？
难度：MEDIUM
分值：10
知识点：Shuffle、Spark 性能
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

#### 题目 99

题型：SINGLE_CHOICE
题干：某 Spark 作业在“Shuffle”环节出现数据倾斜和长尾 Task，最合理的处理是什么？
难度：HARD
分值：10
知识点：Shuffle、分布式优化
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

## 课时 4：缓存与 persist

课时简介：学习 缓存与 persist 的核心概念、Spark API 与执行机制。

预计学习时间：20 分钟

### 正文

[标题]
缓存与 persist

[文本]
理解 Catalyst、物理计划、Shuffle、缓存与数据倾斜。 本课围绕“缓存与 persist”展开。学习 Spark 时应把 API、执行计划和分布式数据流联系起来：同一段代码是否高效，往往取决于分区、Shuffle、数据倾斜、缓存和资源配置。

[示例 title=缓存与 persist示例]
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

#### 题目 100

题型：SINGLE_CHOICE
题干：关于“缓存与 persist”，下列哪种理解更符合 Spark 数据处理原则？
难度：EASY
分值：10
知识点：缓存与 persist
是否用于 Battle：否

选项：
- A. 应同时理解 API 语义、分区和执行计划 [正确]
- B. Spark 的所有操作都会立即执行
- C. 分区数量永远越多越好
- D. DataFrame 与底层执行计划完全无关

解析：
Spark 的使用不仅是调用 API，还要理解惰性执行、分区和物理执行过程。

#### 题目 101

题型：SINGLE_CHOICE
题干：某 Spark 作业在“缓存与 persist”相关阶段明显变慢，哪种排查方式最合理？
难度：MEDIUM
分值：10
知识点：缓存与 persist、Spark 性能
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

#### 题目 102

题型：CODE_FILL
题干：补全下面与“缓存与 persist”相关的 PySpark/Spark 代码，使表达成立。填写 `____`。
难度：HARD
分值：10
知识点：缓存与 persist、Spark API
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码:
```python
cached = df.____()
```

可接受答案:
```text
cache
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：否
- 统一 Windows 和 Unix 换行：是

解析：
缺失部分应为 `cache`。补全后代码符合本课 Spark API 或执行语义。

标准完整代码:
```python
cached = df.cache()
```


---

## 课时 5：数据倾斜

课时简介：学习 数据倾斜 的核心概念、Spark API 与执行机制。

预计学习时间：20 分钟

### 正文

[标题]
数据倾斜

[文本]
理解 Catalyst、物理计划、Shuffle、缓存与数据倾斜。 本课围绕“数据倾斜”展开。学习 Spark 时应把 API、执行计划和分布式数据流联系起来：同一段代码是否高效，往往取决于分区、Shuffle、数据倾斜、缓存和资源配置。

[示例 title=数据倾斜示例]
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

#### 题目 103

题型：SINGLE_CHOICE
题干：关于“数据倾斜”，下列哪种理解更符合 Spark 数据处理原则？
难度：EASY
分值：10
知识点：数据倾斜
是否用于 Battle：否

选项：
- A. 应同时理解 API 语义、分区和执行计划 [正确]
- B. Spark 的所有操作都会立即执行
- C. 分区数量永远越多越好
- D. DataFrame 与底层执行计划完全无关

解析：
Spark 的使用不仅是调用 API，还要理解惰性执行、分区和物理执行过程。

#### 题目 104

题型：SINGLE_CHOICE
题干：某 Spark 作业在“数据倾斜”相关阶段明显变慢，哪种排查方式最合理？
难度：MEDIUM
分值：10
知识点：数据倾斜、Spark 性能
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

#### 题目 105

题型：SINGLE_CHOICE
题干：某 Spark 作业在“数据倾斜”环节出现数据倾斜和长尾 Task，最合理的处理是什么？
难度：HARD
分值：10
知识点：数据倾斜、分布式优化
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

## 课时 6：常见性能优化方法

课时简介：学习 常见性能优化方法 的核心概念、Spark API 与执行机制。

预计学习时间：20 分钟

### 正文

[标题]
常见性能优化方法

[文本]
理解 Catalyst、物理计划、Shuffle、缓存与数据倾斜。 本课围绕“常见性能优化方法”展开。学习 Spark 时应把 API、执行计划和分布式数据流联系起来：同一段代码是否高效，往往取决于分区、Shuffle、数据倾斜、缓存和资源配置。

[示例 title=常见性能优化方法示例]
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

#### 题目 106

题型：SINGLE_CHOICE
题干：关于“常见性能优化方法”，下列哪种理解更符合 Spark 数据处理原则？
难度：EASY
分值：10
知识点：常见性能优化方法
是否用于 Battle：否

选项：
- A. 应同时理解 API 语义、分区和执行计划 [正确]
- B. Spark 的所有操作都会立即执行
- C. 分区数量永远越多越好
- D. DataFrame 与底层执行计划完全无关

解析：
Spark 的使用不仅是调用 API，还要理解惰性执行、分区和物理执行过程。

#### 题目 107

题型：SINGLE_CHOICE
题干：某 Spark 作业在“常见性能优化方法”相关阶段明显变慢，哪种排查方式最合理？
难度：MEDIUM
分值：10
知识点：常见性能优化方法、Spark 性能
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

#### 题目 108

题型：CODE_FILL
题干：补全下面与“常见性能优化方法”相关的 PySpark/Spark 代码，使表达成立。填写 `____`。
难度：HARD
分值：10
知识点：常见性能优化方法、Spark API
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码:
```python
optimized = select_needed_columns(df).filter(____)
```

可接受答案:
```text
predicate
```

判题设置：
- 区分大小写：是
- 忽略首尾空格：是
- 保留代码内部空格：否
- 统一 Windows 和 Unix 换行：是

解析：
缺失部分应为 `predicate`。补全后代码符合本课 Spark API 或执行语义。

标准完整代码:
```python
optimized = select_needed_columns(df).filter(predicate)
```


---

