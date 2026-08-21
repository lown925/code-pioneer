# 第四章：聚合、分组与统计

章节简介：使用聚合函数、GROUP BY 和 HAVING 完成业务统计，并理解分组查询的执行逻辑。 学习完成后，能够把本章 SQL 能力应用到清晰、可验证的数据库查询或设计任务中。

预计学习时间：120 分钟

章节学习目标：
- 理解并能够应用“COUNT SUM AVG”的核心规则
- 理解并能够应用“MIN MAX 与 NULL”的核心规则
- 理解并能够应用“GROUP BY 基础”的核心规则
- 理解并能够应用“多列分组”的核心规则
- 理解并能够应用“HAVING 分组过滤”的核心规则
- 理解并能够应用“综合聚合分析”的核心规则

---

## 课时 1：COUNT SUM AVG

课时简介：学习COUNT SUM AVG的核心概念、SQL 写法和常见边界。

预计学习时间：20 分钟

### 正文

[标题]
COUNT SUM AVG的核心思路

[文本]
COUNT 用于计数，SUM 求和，AVG 求平均。COUNT(*) 统计行，而 COUNT(column) 通常忽略该列中的 NULL。

[代码 language=sql]
SELECT COUNT(*) AS total, AVG(score) AS avg_score FROM exams;
[/代码]

[标题]
从结果语义理解 SQL

[文本]
学习这一部分时，不要只记住关键字。应先说明查询或约束希望解决什么问题，再检查输入数据范围、结果粒度以及 NULL、重复行和排序等边界。对于“COUNT SUM AVG”，核心判断是：COUNT(*) 统计结果行数。

[示例 title=COUNT SUM AVG示例]
说明：使用一个最小 SQL 示例观察语句结构，不连接或修改生产数据库。
语言：sql
SELECT COUNT(*) AS total, AVG(score) AS avg_score FROM exams;
[/示例]

[提示 title=COUNT SUM AVG学习提示]
AVG 通常忽略 NULL 输入。先预测结果，再阅读 SQL，会比机械背语法更容易形成稳定理解。

[警告 title=注意 SQL 方言与数据边界]
不同数据库在函数、分页、日期处理等细节上可能不同。课程以通用关系型 SQL 思想为主，涉及写操作的示例仅用于学习，不应直接对生产数据库执行。

### 课时题目

#### 题目 1

题型：SINGLE_CHOICE
题干：关于“COUNT SUM AVG”，下列哪项说法正确？
难度：EASY
分值：10
知识点：COUNT SUM AVG
是否用于 Battle：否

选项：
- A. COUNT(*) 统计结果行数 [正确]
- B. SQL 的所有语句都会自动修改原表数据
- C. 只要语法能够执行，结果就一定符合业务需求
- D. NULL、重复行和排序永远不会影响查询结果

解析：
COUNT(*) 统计结果行数。其余说法把 SQL 的查询、写入或结果语义绝对化了。

#### 题目 2

题型：SINGLE_CHOICE
题干：阅读下面 SQL：`SELECT COUNT(*) AS total, AVG(score) AS avg_score FROM exams;`。结合“COUNT SUM AVG”的知识，最合理的理解是什么？
难度：MEDIUM
分值：10
知识点：COUNT SUM AVG、SQL 阅读
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：执行流程

选项：
- A. 该语句体现了“COUNT(*) 统计结果行数” [正确]
- B. 该语句一定会删除数据库中的全部记录
- C. 该语句的结果与表中数据完全无关
- D. 该语句可以忽略字段类型、约束和 NULL 语义

解析：
示例围绕“COUNT SUM AVG”展开，正确理解是：COUNT(*) 统计结果行数。判断 SQL 时应结合语句类型与数据语义。

#### 题目 3

题型：SINGLE_CHOICE
题干：在真实项目中应用“COUNT SUM AVG”时，哪一种做法最稳妥？
难度：HARD
分值：10
知识点：COUNT SUM AVG、边界分析
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：场景判断

选项：
- A. 先明确数据范围与结果语义，并验证“AVG 通常忽略 NULL 输入” [正确]
- B. 不看数据结构，直接复制任意 SQL 到生产环境执行
- C. 为了缩短 SQL，删除所有过滤条件和连接条件
- D. 只要返回了数据，就无需检查重复、NULL 或统计粒度

解析：
可靠 SQL 需要同时考虑业务语义与数据边界。本课特别需要记住：AVG 通常忽略 NULL 输入。

---

## 课时 2：MIN MAX 与 NULL

课时简介：学习MIN MAX 与 NULL的核心概念、SQL 写法和常见边界。

预计学习时间：20 分钟

### 正文

[标题]
MIN MAX 与 NULL的核心思路

[文本]
MIN 和 MAX 找到最小、最大非 NULL 值。聚合函数面对空集合或 NULL 时的结果需要结合函数语义判断。

[代码 language=sql]
SELECT MIN(score) AS min_score, MAX(score) AS max_score FROM exams;
[/代码]

[标题]
从结果语义理解 SQL

[文本]
学习这一部分时，不要只记住关键字。应先说明查询或约束希望解决什么问题，再检查输入数据范围、结果粒度以及 NULL、重复行和排序等边界。对于“MIN MAX 与 NULL”，核心判断是：MIN/MAX 可提取范围端点。

[示例 title=MIN MAX 与 NULL示例]
说明：使用一个最小 SQL 示例观察语句结构，不连接或修改生产数据库。
语言：sql
SELECT MIN(score) AS min_score, MAX(score) AS max_score FROM exams;
[/示例]

[提示 title=MIN MAX 与 NULL学习提示]
多数常用聚合会忽略 NULL 值。先预测结果，再阅读 SQL，会比机械背语法更容易形成稳定理解。

[警告 title=注意 SQL 方言与数据边界]
不同数据库在函数、分页、日期处理等细节上可能不同。课程以通用关系型 SQL 思想为主，涉及写操作的示例仅用于学习，不应直接对生产数据库执行。

### 课时题目

#### 题目 4

题型：SINGLE_CHOICE
题干：关于“MIN MAX 与 NULL”，下列哪项说法正确？
难度：EASY
分值：10
知识点：MIN MAX 与 NULL
是否用于 Battle：否

选项：
- A. MIN/MAX 可提取范围端点 [正确]
- B. SQL 的所有语句都会自动修改原表数据
- C. 只要语法能够执行，结果就一定符合业务需求
- D. NULL、重复行和排序永远不会影响查询结果

解析：
MIN/MAX 可提取范围端点。其余说法把 SQL 的查询、写入或结果语义绝对化了。

#### 题目 5

题型：SINGLE_CHOICE
题干：阅读下面 SQL：`SELECT MIN(score) AS min_score, MAX(score) AS max_score FROM exams;`。结合“MIN MAX 与 NULL”的知识，最合理的理解是什么？
难度：MEDIUM
分值：10
知识点：MIN MAX 与 NULL、SQL 阅读
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：执行流程

选项：
- A. 该语句体现了“MIN/MAX 可提取范围端点” [正确]
- B. 该语句一定会删除数据库中的全部记录
- C. 该语句的结果与表中数据完全无关
- D. 该语句可以忽略字段类型、约束和 NULL 语义

解析：
示例围绕“MIN MAX 与 NULL”展开，正确理解是：MIN/MAX 可提取范围端点。判断 SQL 时应结合语句类型与数据语义。

#### 题目 6

题型：CODE_FILL
题干：补全下面 SQL 中的 `____`，使语句能够表达本课“MIN MAX 与 NULL”示例的原意。请填写缺失的 SQL 片段。
难度：HARD
分值：10
知识点：MIN MAX 与 NULL、SQL 代码填空
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码:
```sql
____ MIN(score) AS min_score, MAX(score) AS max_score FROM exams;
```

可接受答案:
```sql
SELECT
```

判题设置：
- 区分大小写：否
- 忽略首尾空格：是
- 保留代码内部空格：否
- 统一 Windows 和 Unix 换行：是

解析：
缺失部分是 `SELECT`。补全后语句恢复为本课示例，体现：MIN/MAX 可提取范围端点。

标准完整代码:
```sql
SELECT MIN(score) AS min_score, MAX(score) AS max_score FROM exams;
```

---

## 课时 3：GROUP BY 基础

课时简介：学习GROUP BY 基础的核心概念、SQL 写法和常见边界。

预计学习时间：20 分钟

### 正文

[标题]
GROUP BY 基础的核心思路

[文本]
GROUP BY 把具有相同分组键的行放在一起，再对每组执行聚合。SELECT 中的非聚合列通常应属于分组键。

[代码 language=sql]
SELECT major, COUNT(*) AS total FROM students GROUP BY major;
[/代码]

[标题]
从结果语义理解 SQL

[文本]
学习这一部分时，不要只记住关键字。应先说明查询或约束希望解决什么问题，再检查输入数据范围、结果粒度以及 NULL、重复行和排序等边界。对于“GROUP BY 基础”，核心判断是：GROUP BY 先形成组再做聚合。

[示例 title=GROUP BY 基础示例]
说明：使用一个最小 SQL 示例观察语句结构，不连接或修改生产数据库。
语言：sql
SELECT major, COUNT(*) AS total FROM students GROUP BY major;
[/示例]

[提示 title=GROUP BY 基础学习提示]
分组键决定统计粒度。先预测结果，再阅读 SQL，会比机械背语法更容易形成稳定理解。

[警告 title=注意 SQL 方言与数据边界]
不同数据库在函数、分页、日期处理等细节上可能不同。课程以通用关系型 SQL 思想为主，涉及写操作的示例仅用于学习，不应直接对生产数据库执行。

### 课时题目

#### 题目 7

题型：SINGLE_CHOICE
题干：关于“GROUP BY 基础”，下列哪项说法正确？
难度：EASY
分值：10
知识点：GROUP BY 基础
是否用于 Battle：否

选项：
- A. GROUP BY 先形成组再做聚合 [正确]
- B. SQL 的所有语句都会自动修改原表数据
- C. 只要语法能够执行，结果就一定符合业务需求
- D. NULL、重复行和排序永远不会影响查询结果

解析：
GROUP BY 先形成组再做聚合。其余说法把 SQL 的查询、写入或结果语义绝对化了。

#### 题目 8

题型：SINGLE_CHOICE
题干：阅读下面 SQL：`SELECT major, COUNT(*) AS total FROM students GROUP BY major;`。结合“GROUP BY 基础”的知识，最合理的理解是什么？
难度：MEDIUM
分值：10
知识点：GROUP BY 基础、SQL 阅读
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：执行流程

选项：
- A. 该语句体现了“GROUP BY 先形成组再做聚合” [正确]
- B. 该语句一定会删除数据库中的全部记录
- C. 该语句的结果与表中数据完全无关
- D. 该语句可以忽略字段类型、约束和 NULL 语义

解析：
示例围绕“GROUP BY 基础”展开，正确理解是：GROUP BY 先形成组再做聚合。判断 SQL 时应结合语句类型与数据语义。

#### 题目 9

题型：SINGLE_CHOICE
题干：在真实项目中应用“GROUP BY 基础”时，哪一种做法最稳妥？
难度：HARD
分值：10
知识点：GROUP BY 基础、边界分析
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：场景判断

选项：
- A. 先明确数据范围与结果语义，并验证“分组键决定统计粒度” [正确]
- B. 不看数据结构，直接复制任意 SQL 到生产环境执行
- C. 为了缩短 SQL，删除所有过滤条件和连接条件
- D. 只要返回了数据，就无需检查重复、NULL 或统计粒度

解析：
可靠 SQL 需要同时考虑业务语义与数据边界。本课特别需要记住：分组键决定统计粒度。

---

## 课时 4：多列分组

课时简介：学习多列分组的核心概念、SQL 写法和常见边界。

预计学习时间：20 分钟

### 正文

[标题]
多列分组的核心思路

[文本]
多个分组列共同决定统计粒度，例如按专业和年级统计人数。增加分组列通常会让结果粒度更细。

[代码 language=sql]
SELECT major, grade, COUNT(*) AS total FROM students GROUP BY major, grade;
[/代码]

[标题]
从结果语义理解 SQL

[文本]
学习这一部分时，不要只记住关键字。应先说明查询或约束希望解决什么问题，再检查输入数据范围、结果粒度以及 NULL、重复行和排序等边界。对于“多列分组”，核心判断是：多列共同定义一个分组。

[示例 title=多列分组示例]
说明：使用一个最小 SQL 示例观察语句结构，不连接或修改生产数据库。
语言：sql
SELECT major, grade, COUNT(*) AS total FROM students GROUP BY major, grade;
[/示例]

[提示 title=多列分组学习提示]
增加分组维度通常产生更细粒度结果。先预测结果，再阅读 SQL，会比机械背语法更容易形成稳定理解。

[警告 title=注意 SQL 方言与数据边界]
不同数据库在函数、分页、日期处理等细节上可能不同。课程以通用关系型 SQL 思想为主，涉及写操作的示例仅用于学习，不应直接对生产数据库执行。

### 课时题目

#### 题目 10

题型：SINGLE_CHOICE
题干：关于“多列分组”，下列哪项说法正确？
难度：EASY
分值：10
知识点：多列分组
是否用于 Battle：否

选项：
- A. 多列共同定义一个分组 [正确]
- B. SQL 的所有语句都会自动修改原表数据
- C. 只要语法能够执行，结果就一定符合业务需求
- D. NULL、重复行和排序永远不会影响查询结果

解析：
多列共同定义一个分组。其余说法把 SQL 的查询、写入或结果语义绝对化了。

#### 题目 11

题型：SINGLE_CHOICE
题干：阅读下面 SQL：`SELECT major, grade, COUNT(*) AS total FROM students GROUP BY major, grade;`。结合“多列分组”的知识，最合理的理解是什么？
难度：MEDIUM
分值：10
知识点：多列分组、SQL 阅读
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：执行流程

选项：
- A. 该语句体现了“多列共同定义一个分组” [正确]
- B. 该语句一定会删除数据库中的全部记录
- C. 该语句的结果与表中数据完全无关
- D. 该语句可以忽略字段类型、约束和 NULL 语义

解析：
示例围绕“多列分组”展开，正确理解是：多列共同定义一个分组。判断 SQL 时应结合语句类型与数据语义。

#### 题目 12

题型：CODE_FILL
题干：补全下面 SQL 中的 `____`，使语句能够表达本课“多列分组”示例的原意。请填写缺失的 SQL 片段。
难度：HARD
分值：10
知识点：多列分组、SQL 代码填空
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码:
```sql
SELECT major, grade, COUNT(*) AS total FROM students ____ major, grade;
```

可接受答案:
```sql
GROUP BY
```

判题设置：
- 区分大小写：否
- 忽略首尾空格：是
- 保留代码内部空格：否
- 统一 Windows 和 Unix 换行：是

解析：
缺失部分是 `GROUP BY`。补全后语句恢复为本课示例，体现：多列共同定义一个分组。

标准完整代码:
```sql
SELECT major, grade, COUNT(*) AS total FROM students GROUP BY major, grade;
```

---

## 课时 5：HAVING 分组过滤

课时简介：学习HAVING 分组过滤的核心概念、SQL 写法和常见边界。

预计学习时间：20 分钟

### 正文

[标题]
HAVING 分组过滤的核心思路

[文本]
WHERE 过滤原始行，HAVING 过滤分组后的结果。需要根据 COUNT、AVG 等聚合结果筛选时通常使用 HAVING。

[代码 language=sql]
SELECT major, COUNT(*) AS total FROM students GROUP BY major HAVING COUNT(*) >= 10;
[/代码]

[标题]
从结果语义理解 SQL

[文本]
学习这一部分时，不要只记住关键字。应先说明查询或约束希望解决什么问题，再检查输入数据范围、结果粒度以及 NULL、重复行和排序等边界。对于“HAVING 分组过滤”，核心判断是：HAVING 可按聚合结果过滤组。

[示例 title=HAVING 分组过滤示例]
说明：使用一个最小 SQL 示例观察语句结构，不连接或修改生产数据库。
语言：sql
SELECT major, COUNT(*) AS total FROM students GROUP BY major HAVING COUNT(*) >= 10;
[/示例]

[提示 title=HAVING 分组过滤学习提示]
WHERE 与 HAVING 所处阶段不同。先预测结果，再阅读 SQL，会比机械背语法更容易形成稳定理解。

[警告 title=注意 SQL 方言与数据边界]
不同数据库在函数、分页、日期处理等细节上可能不同。课程以通用关系型 SQL 思想为主，涉及写操作的示例仅用于学习，不应直接对生产数据库执行。

### 课时题目

#### 题目 13

题型：SINGLE_CHOICE
题干：关于“HAVING 分组过滤”，下列哪项说法正确？
难度：EASY
分值：10
知识点：HAVING 分组过滤
是否用于 Battle：否

选项：
- A. HAVING 可按聚合结果过滤组 [正确]
- B. SQL 的所有语句都会自动修改原表数据
- C. 只要语法能够执行，结果就一定符合业务需求
- D. NULL、重复行和排序永远不会影响查询结果

解析：
HAVING 可按聚合结果过滤组。其余说法把 SQL 的查询、写入或结果语义绝对化了。

#### 题目 14

题型：SINGLE_CHOICE
题干：阅读下面 SQL：`SELECT major, COUNT(*) AS total FROM students GROUP BY major HAVING COUNT(*) >= 10;`。结合“HAVING 分组过滤”的知识，最合理的理解是什么？
难度：MEDIUM
分值：10
知识点：HAVING 分组过滤、SQL 阅读
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：执行流程

选项：
- A. 该语句体现了“HAVING 可按聚合结果过滤组” [正确]
- B. 该语句一定会删除数据库中的全部记录
- C. 该语句的结果与表中数据完全无关
- D. 该语句可以忽略字段类型、约束和 NULL 语义

解析：
示例围绕“HAVING 分组过滤”展开，正确理解是：HAVING 可按聚合结果过滤组。判断 SQL 时应结合语句类型与数据语义。

#### 题目 15

题型：SINGLE_CHOICE
题干：在真实项目中应用“HAVING 分组过滤”时，哪一种做法最稳妥？
难度：HARD
分值：10
知识点：HAVING 分组过滤、边界分析
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：场景判断

选项：
- A. 先明确数据范围与结果语义，并验证“WHERE 与 HAVING 所处阶段不同” [正确]
- B. 不看数据结构，直接复制任意 SQL 到生产环境执行
- C. 为了缩短 SQL，删除所有过滤条件和连接条件
- D. 只要返回了数据，就无需检查重复、NULL 或统计粒度

解析：
可靠 SQL 需要同时考虑业务语义与数据边界。本课特别需要记住：WHERE 与 HAVING 所处阶段不同。

---

## 课时 6：综合聚合分析

课时简介：学习综合聚合分析的核心概念、SQL 写法和常见边界。

预计学习时间：20 分钟

### 正文

[标题]
综合聚合分析的核心思路

[文本]
真实统计常把 WHERE、GROUP BY、HAVING 和 ORDER BY 组合使用：先筛行，再分组聚合，再筛组，最后排序展示。

[代码 language=sql]
SELECT major, AVG(score) AS avg_score FROM exams WHERE score IS NOT NULL GROUP BY major HAVING COUNT(*) >= 5 ORDER BY avg_score DESC;
[/代码]

[标题]
从结果语义理解 SQL

[文本]
学习这一部分时，不要只记住关键字。应先说明查询或约束希望解决什么问题，再检查输入数据范围、结果粒度以及 NULL、重复行和排序等边界。对于“综合聚合分析”，核心判断是：聚合查询需要明确统计口径。

[示例 title=综合聚合分析示例]
说明：使用一个最小 SQL 示例观察语句结构，不连接或修改生产数据库。
语言：sql
SELECT major, AVG(score) AS avg_score FROM exams WHERE score IS NOT NULL GROUP BY major HAVING COUNT(*) >= 5 ORDER BY avg_score DESC;
[/示例]

[提示 title=综合聚合分析学习提示]
过滤位置会影响最终统计结果。先预测结果，再阅读 SQL，会比机械背语法更容易形成稳定理解。

[警告 title=注意 SQL 方言与数据边界]
不同数据库在函数、分页、日期处理等细节上可能不同。课程以通用关系型 SQL 思想为主，涉及写操作的示例仅用于学习，不应直接对生产数据库执行。

### 课时题目

#### 题目 16

题型：SINGLE_CHOICE
题干：关于“综合聚合分析”，下列哪项说法正确？
难度：EASY
分值：10
知识点：综合聚合分析
是否用于 Battle：否

选项：
- A. 聚合查询需要明确统计口径 [正确]
- B. SQL 的所有语句都会自动修改原表数据
- C. 只要语法能够执行，结果就一定符合业务需求
- D. NULL、重复行和排序永远不会影响查询结果

解析：
聚合查询需要明确统计口径。其余说法把 SQL 的查询、写入或结果语义绝对化了。

#### 题目 17

题型：SINGLE_CHOICE
题干：阅读下面 SQL：`SELECT major, AVG(score) AS avg_score FROM exams WHERE score IS NOT NULL GROUP BY major HAVING COUNT(*) >= 5 ORDER BY avg_score DESC;`。结合“综合聚合分析”的知识，最合理的理解是什么？
难度：MEDIUM
分值：10
知识点：综合聚合分析、SQL 阅读
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：执行流程

选项：
- A. 该语句体现了“聚合查询需要明确统计口径” [正确]
- B. 该语句一定会删除数据库中的全部记录
- C. 该语句的结果与表中数据完全无关
- D. 该语句可以忽略字段类型、约束和 NULL 语义

解析：
示例围绕“综合聚合分析”展开，正确理解是：聚合查询需要明确统计口径。判断 SQL 时应结合语句类型与数据语义。

#### 题目 18

题型：CODE_FILL
题干：补全下面 SQL 中的 `____`，使语句能够表达本课“综合聚合分析”示例的原意。请填写缺失的 SQL 片段。
难度：HARD
分值：10
知识点：综合聚合分析、SQL 代码填空
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码:
```sql
SELECT major, AVG(score) AS avg_score FROM exams WHERE score IS NOT NULL GROUP BY major HAVING COUNT(*) >= 5 ____ avg_score DESC;
```

可接受答案:
```sql
ORDER BY
```

判题设置：
- 区分大小写：否
- 忽略首尾空格：是
- 保留代码内部空格：否
- 统一 Windows 和 Unix 换行：是

解析：
缺失部分是 `ORDER BY`。补全后语句恢复为本课示例，体现：聚合查询需要明确统计口径。

标准完整代码:
```sql
SELECT major, AVG(score) AS avg_score FROM exams WHERE score IS NOT NULL GROUP BY major HAVING COUNT(*) >= 5 ORDER BY avg_score DESC;
```

---
