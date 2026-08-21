# 第八章：表设计、约束与索引

章节简介：从查询走向数据库设计，掌握主键、外键、唯一约束、范式基础和索引的核心作用。 学习完成后，能够把本章 SQL 能力应用到清晰、可验证的数据库查询或设计任务中。

预计学习时间：120 分钟

章节学习目标：
- 理解并能够应用“CREATE TABLE”的核心规则
- 理解并能够应用“主键与唯一约束”的核心规则
- 理解并能够应用“外键与参照完整性”的核心规则
- 理解并能够应用“NOT NULL CHECK DEFAULT”的核心规则
- 理解并能够应用“范式与表拆分”的核心规则
- 理解并能够应用“索引基础”的核心规则

---

## 课时 1：CREATE TABLE

课时简介：学习CREATE TABLE的核心概念、SQL 写法和常见边界。

预计学习时间：20 分钟

### 正文

[标题]
CREATE TABLE的核心思路

[文本]
CREATE TABLE 定义表结构。设计时应先明确实体、字段、类型和约束，而不是只追求把数据存进去。

[代码 language=sql]
CREATE TABLE departments (id INTEGER PRIMARY KEY, name VARCHAR(100) NOT NULL);
[/代码]

[标题]
从结果语义理解 SQL

[文本]
学习这一部分时，不要只记住关键字。应先说明查询或约束希望解决什么问题，再检查输入数据范围、结果粒度以及 NULL、重复行和排序等边界。对于“CREATE TABLE”，核心判断是：建表时应同时考虑类型与约束。

[示例 title=CREATE TABLE示例]
说明：使用一个最小 SQL 示例观察语句结构，不连接或修改生产数据库。
语言：sql
CREATE TABLE departments (id INTEGER PRIMARY KEY, name VARCHAR(100) NOT NULL);
[/示例]

[提示 title=CREATE TABLE学习提示]
表结构表达业务数据模型。先预测结果，再阅读 SQL，会比机械背语法更容易形成稳定理解。

[警告 title=注意 SQL 方言与数据边界]
不同数据库在函数、分页、日期处理等细节上可能不同。课程以通用关系型 SQL 思想为主，涉及写操作的示例仅用于学习，不应直接对生产数据库执行。

### 课时题目

#### 题目 1

题型：SINGLE_CHOICE
题干：关于“CREATE TABLE”，下列哪项说法正确？
难度：EASY
分值：10
知识点：CREATE TABLE
是否用于 Battle：否

选项：
- A. 建表时应同时考虑类型与约束 [正确]
- B. SQL 的所有语句都会自动修改原表数据
- C. 只要语法能够执行，结果就一定符合业务需求
- D. NULL、重复行和排序永远不会影响查询结果

解析：
建表时应同时考虑类型与约束。其余说法把 SQL 的查询、写入或结果语义绝对化了。

#### 题目 2

题型：SINGLE_CHOICE
题干：阅读下面 SQL：`CREATE TABLE departments (id INTEGER PRIMARY KEY, name VARCHAR(100) NOT NULL);`。结合“CREATE TABLE”的知识，最合理的理解是什么？
难度：MEDIUM
分值：10
知识点：CREATE TABLE、SQL 阅读
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：执行流程

选项：
- A. 该语句体现了“建表时应同时考虑类型与约束” [正确]
- B. 该语句一定会删除数据库中的全部记录
- C. 该语句的结果与表中数据完全无关
- D. 该语句可以忽略字段类型、约束和 NULL 语义

解析：
示例围绕“CREATE TABLE”展开，正确理解是：建表时应同时考虑类型与约束。判断 SQL 时应结合语句类型与数据语义。

#### 题目 3

题型：SINGLE_CHOICE
题干：在真实项目中应用“CREATE TABLE”时，哪一种做法最稳妥？
难度：HARD
分值：10
知识点：CREATE TABLE、边界分析
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：场景判断

选项：
- A. 先明确数据范围与结果语义，并验证“表结构表达业务数据模型” [正确]
- B. 不看数据结构，直接复制任意 SQL 到生产环境执行
- C. 为了缩短 SQL，删除所有过滤条件和连接条件
- D. 只要返回了数据，就无需检查重复、NULL 或统计粒度

解析：
可靠 SQL 需要同时考虑业务语义与数据边界。本课特别需要记住：表结构表达业务数据模型。

---

## 课时 2：主键与唯一约束

课时简介：学习主键与唯一约束的核心概念、SQL 写法和常见边界。

预计学习时间：20 分钟

### 正文

[标题]
主键与唯一约束的核心思路

[文本]
PRIMARY KEY 用于行身份，UNIQUE 用于保证候选业务值不重复。两者目的相关但语义并不完全相同。

[代码 language=sql]
CREATE TABLE users (id INTEGER PRIMARY KEY, email VARCHAR(200) UNIQUE);
[/代码]

[标题]
从结果语义理解 SQL

[文本]
学习这一部分时，不要只记住关键字。应先说明查询或约束希望解决什么问题，再检查输入数据范围、结果粒度以及 NULL、重复行和排序等边界。对于“主键与唯一约束”，核心判断是：UNIQUE 可限制业务列重复。

[示例 title=主键与唯一约束示例]
说明：使用一个最小 SQL 示例观察语句结构，不连接或修改生产数据库。
语言：sql
CREATE TABLE users (id INTEGER PRIMARY KEY, email VARCHAR(200) UNIQUE);
[/示例]

[提示 title=主键与唯一约束学习提示]
主键承担稳定行身份。先预测结果，再阅读 SQL，会比机械背语法更容易形成稳定理解。

[警告 title=注意 SQL 方言与数据边界]
不同数据库在函数、分页、日期处理等细节上可能不同。课程以通用关系型 SQL 思想为主，涉及写操作的示例仅用于学习，不应直接对生产数据库执行。

### 课时题目

#### 题目 4

题型：SINGLE_CHOICE
题干：关于“主键与唯一约束”，下列哪项说法正确？
难度：EASY
分值：10
知识点：主键与唯一约束
是否用于 Battle：否

选项：
- A. UNIQUE 可限制业务列重复 [正确]
- B. SQL 的所有语句都会自动修改原表数据
- C. 只要语法能够执行，结果就一定符合业务需求
- D. NULL、重复行和排序永远不会影响查询结果

解析：
UNIQUE 可限制业务列重复。其余说法把 SQL 的查询、写入或结果语义绝对化了。

#### 题目 5

题型：SINGLE_CHOICE
题干：阅读下面 SQL：`CREATE TABLE users (id INTEGER PRIMARY KEY, email VARCHAR(200) UNIQUE);`。结合“主键与唯一约束”的知识，最合理的理解是什么？
难度：MEDIUM
分值：10
知识点：主键与唯一约束、SQL 阅读
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：执行流程

选项：
- A. 该语句体现了“UNIQUE 可限制业务列重复” [正确]
- B. 该语句一定会删除数据库中的全部记录
- C. 该语句的结果与表中数据完全无关
- D. 该语句可以忽略字段类型、约束和 NULL 语义

解析：
示例围绕“主键与唯一约束”展开，正确理解是：UNIQUE 可限制业务列重复。判断 SQL 时应结合语句类型与数据语义。

#### 题目 6

题型：CODE_FILL
题干：补全下面 SQL 中的 `____`，使语句能够表达本课“主键与唯一约束”示例的原意。请填写缺失的 SQL 片段。
难度：HARD
分值：10
知识点：主键与唯一约束、SQL 代码填空
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码:
```sql
____ users (id INTEGER PRIMARY KEY, email VARCHAR(200) UNIQUE);
```

可接受答案:
```sql
CREATE TABLE
```

判题设置：
- 区分大小写：否
- 忽略首尾空格：是
- 保留代码内部空格：否
- 统一 Windows 和 Unix 换行：是

解析：
缺失部分是 `CREATE TABLE`。补全后语句恢复为本课示例，体现：UNIQUE 可限制业务列重复。

标准完整代码:
```sql
CREATE TABLE users (id INTEGER PRIMARY KEY, email VARCHAR(200) UNIQUE);
```

---

## 课时 3：外键与参照完整性

课时简介：学习外键与参照完整性的核心概念、SQL 写法和常见边界。

预计学习时间：20 分钟

### 正文

[标题]
外键与参照完整性的核心思路

[文本]
FOREIGN KEY 防止产生指向不存在父记录的引用。删除父记录时的行为应按业务明确选择 RESTRICT、CASCADE 等策略。

[代码 language=sql]
CREATE TABLE orders (id INTEGER PRIMARY KEY, user_id INTEGER REFERENCES users(id));
[/代码]

[标题]
从结果语义理解 SQL

[文本]
学习这一部分时，不要只记住关键字。应先说明查询或约束希望解决什么问题，再检查输入数据范围、结果粒度以及 NULL、重复行和排序等边界。对于“外键与参照完整性”，核心判断是：外键维护引用完整性。

[示例 title=外键与参照完整性示例]
说明：使用一个最小 SQL 示例观察语句结构，不连接或修改生产数据库。
语言：sql
CREATE TABLE orders (id INTEGER PRIMARY KEY, user_id INTEGER REFERENCES users(id));
[/示例]

[提示 title=外键与参照完整性学习提示]
级联策略必须结合业务生命周期设计。先预测结果，再阅读 SQL，会比机械背语法更容易形成稳定理解。

[警告 title=注意 SQL 方言与数据边界]
不同数据库在函数、分页、日期处理等细节上可能不同。课程以通用关系型 SQL 思想为主，涉及写操作的示例仅用于学习，不应直接对生产数据库执行。

### 课时题目

#### 题目 7

题型：SINGLE_CHOICE
题干：关于“外键与参照完整性”，下列哪项说法正确？
难度：EASY
分值：10
知识点：外键与参照完整性
是否用于 Battle：否

选项：
- A. 外键维护引用完整性 [正确]
- B. SQL 的所有语句都会自动修改原表数据
- C. 只要语法能够执行，结果就一定符合业务需求
- D. NULL、重复行和排序永远不会影响查询结果

解析：
外键维护引用完整性。其余说法把 SQL 的查询、写入或结果语义绝对化了。

#### 题目 8

题型：SINGLE_CHOICE
题干：阅读下面 SQL：`CREATE TABLE orders (id INTEGER PRIMARY KEY, user_id INTEGER REFERENCES users(id));`。结合“外键与参照完整性”的知识，最合理的理解是什么？
难度：MEDIUM
分值：10
知识点：外键与参照完整性、SQL 阅读
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：执行流程

选项：
- A. 该语句体现了“外键维护引用完整性” [正确]
- B. 该语句一定会删除数据库中的全部记录
- C. 该语句的结果与表中数据完全无关
- D. 该语句可以忽略字段类型、约束和 NULL 语义

解析：
示例围绕“外键与参照完整性”展开，正确理解是：外键维护引用完整性。判断 SQL 时应结合语句类型与数据语义。

#### 题目 9

题型：SINGLE_CHOICE
题干：在真实项目中应用“外键与参照完整性”时，哪一种做法最稳妥？
难度：HARD
分值：10
知识点：外键与参照完整性、边界分析
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：场景判断

选项：
- A. 先明确数据范围与结果语义，并验证“级联策略必须结合业务生命周期设计” [正确]
- B. 不看数据结构，直接复制任意 SQL 到生产环境执行
- C. 为了缩短 SQL，删除所有过滤条件和连接条件
- D. 只要返回了数据，就无需检查重复、NULL 或统计粒度

解析：
可靠 SQL 需要同时考虑业务语义与数据边界。本课特别需要记住：级联策略必须结合业务生命周期设计。

---

## 课时 4：NOT NULL CHECK DEFAULT

课时简介：学习NOT NULL CHECK DEFAULT的核心概念、SQL 写法和常见边界。

预计学习时间：20 分钟

### 正文

[标题]
NOT NULL CHECK DEFAULT的核心思路

[文本]
NOT NULL 防缺失，CHECK 限制合法范围，DEFAULT 提供省略值时的默认值；约束应尽量靠近数据保存层。

[代码 language=sql]
CREATE TABLE exams (id INTEGER PRIMARY KEY, score INTEGER CHECK (score BETWEEN 0 AND 100), status VARCHAR(20) DEFAULT 'NEW');
[/代码]

[标题]
从结果语义理解 SQL

[文本]
学习这一部分时，不要只记住关键字。应先说明查询或约束希望解决什么问题，再检查输入数据范围、结果粒度以及 NULL、重复行和排序等边界。对于“NOT NULL CHECK DEFAULT”，核心判断是：CHECK 可以限制字段合法范围。

[示例 title=NOT NULL CHECK DEFAULT示例]
说明：使用一个最小 SQL 示例观察语句结构，不连接或修改生产数据库。
语言：sql
CREATE TABLE exams (id INTEGER PRIMARY KEY, score INTEGER CHECK (score BETWEEN 0 AND 100), status VARCHAR(20) DEFAULT 'NEW');
[/示例]

[提示 title=NOT NULL CHECK DEFAULT学习提示]
DEFAULT 不等于允许所有非法输入。先预测结果，再阅读 SQL，会比机械背语法更容易形成稳定理解。

[警告 title=注意 SQL 方言与数据边界]
不同数据库在函数、分页、日期处理等细节上可能不同。课程以通用关系型 SQL 思想为主，涉及写操作的示例仅用于学习，不应直接对生产数据库执行。

### 课时题目

#### 题目 10

题型：SINGLE_CHOICE
题干：关于“NOT NULL CHECK DEFAULT”，下列哪项说法正确？
难度：EASY
分值：10
知识点：NOT NULL CHECK DEFAULT
是否用于 Battle：否

选项：
- A. CHECK 可以限制字段合法范围 [正确]
- B. SQL 的所有语句都会自动修改原表数据
- C. 只要语法能够执行，结果就一定符合业务需求
- D. NULL、重复行和排序永远不会影响查询结果

解析：
CHECK 可以限制字段合法范围。其余说法把 SQL 的查询、写入或结果语义绝对化了。

#### 题目 11

题型：SINGLE_CHOICE
题干：阅读下面 SQL：`CREATE TABLE exams (id INTEGER PRIMARY KEY, score INTEGER CHECK (score BETWEEN 0 AND 100), status VARCHAR(20) DEFAULT 'NEW');`。结合“NOT NULL CHECK DEFAULT”的知识，最合理的理解是什么？
难度：MEDIUM
分值：10
知识点：NOT NULL CHECK DEFAULT、SQL 阅读
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：执行流程

选项：
- A. 该语句体现了“CHECK 可以限制字段合法范围” [正确]
- B. 该语句一定会删除数据库中的全部记录
- C. 该语句的结果与表中数据完全无关
- D. 该语句可以忽略字段类型、约束和 NULL 语义

解析：
示例围绕“NOT NULL CHECK DEFAULT”展开，正确理解是：CHECK 可以限制字段合法范围。判断 SQL 时应结合语句类型与数据语义。

#### 题目 12

题型：CODE_FILL
题干：补全下面 SQL 中的 `____`，使语句能够表达本课“NOT NULL CHECK DEFAULT”示例的原意。请填写缺失的 SQL 片段。
难度：HARD
分值：10
知识点：NOT NULL CHECK DEFAULT、SQL 代码填空
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码:
```sql
____ exams (id INTEGER PRIMARY KEY, score INTEGER CHECK (score BETWEEN 0 AND 100), status VARCHAR(20) DEFAULT 'NEW');
```

可接受答案:
```sql
CREATE TABLE
```

判题设置：
- 区分大小写：否
- 忽略首尾空格：是
- 保留代码内部空格：否
- 统一 Windows 和 Unix 换行：是

解析：
缺失部分是 `CREATE TABLE`。补全后语句恢复为本课示例，体现：CHECK 可以限制字段合法范围。

标准完整代码:
```sql
CREATE TABLE exams (id INTEGER PRIMARY KEY, score INTEGER CHECK (score BETWEEN 0 AND 100), status VARCHAR(20) DEFAULT 'NEW');
```

---

## 课时 5：范式与表拆分

课时简介：学习范式与表拆分的核心概念、SQL 写法和常见边界。

预计学习时间：20 分钟

### 正文

[标题]
范式与表拆分的核心思路

[文本]
规范化用于减少重复和更新异常。把可独立维护的实体拆表，再通过键建立关系，通常比在一列中塞入多个值更可靠。

[代码 language=sql]
SELECT s.name, m.name AS major_name FROM students s JOIN majors m ON s.major_id=m.id;
[/代码]

[标题]
从结果语义理解 SQL

[文本]
学习这一部分时，不要只记住关键字。应先说明查询或约束希望解决什么问题，再检查输入数据范围、结果粒度以及 NULL、重复行和排序等边界。对于“范式与表拆分”，核心判断是：拆分重复实体可减少更新异常。

[示例 title=范式与表拆分示例]
说明：使用一个最小 SQL 示例观察语句结构，不连接或修改生产数据库。
语言：sql
SELECT s.name, m.name AS major_name FROM students s JOIN majors m ON s.major_id=m.id;
[/示例]

[提示 title=范式与表拆分学习提示]
规范化与查询便利之间需要合理权衡。先预测结果，再阅读 SQL，会比机械背语法更容易形成稳定理解。

[警告 title=注意 SQL 方言与数据边界]
不同数据库在函数、分页、日期处理等细节上可能不同。课程以通用关系型 SQL 思想为主，涉及写操作的示例仅用于学习，不应直接对生产数据库执行。

### 课时题目

#### 题目 13

题型：SINGLE_CHOICE
题干：关于“范式与表拆分”，下列哪项说法正确？
难度：EASY
分值：10
知识点：范式与表拆分
是否用于 Battle：否

选项：
- A. 拆分重复实体可减少更新异常 [正确]
- B. SQL 的所有语句都会自动修改原表数据
- C. 只要语法能够执行，结果就一定符合业务需求
- D. NULL、重复行和排序永远不会影响查询结果

解析：
拆分重复实体可减少更新异常。其余说法把 SQL 的查询、写入或结果语义绝对化了。

#### 题目 14

题型：SINGLE_CHOICE
题干：阅读下面 SQL：`SELECT s.name, m.name AS major_name FROM students s JOIN majors m ON s.major_id=m.id;`。结合“范式与表拆分”的知识，最合理的理解是什么？
难度：MEDIUM
分值：10
知识点：范式与表拆分、SQL 阅读
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：执行流程

选项：
- A. 该语句体现了“拆分重复实体可减少更新异常” [正确]
- B. 该语句一定会删除数据库中的全部记录
- C. 该语句的结果与表中数据完全无关
- D. 该语句可以忽略字段类型、约束和 NULL 语义

解析：
示例围绕“范式与表拆分”展开，正确理解是：拆分重复实体可减少更新异常。判断 SQL 时应结合语句类型与数据语义。

#### 题目 15

题型：SINGLE_CHOICE
题干：在真实项目中应用“范式与表拆分”时，哪一种做法最稳妥？
难度：HARD
分值：10
知识点：范式与表拆分、边界分析
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：场景判断

选项：
- A. 先明确数据范围与结果语义，并验证“规范化与查询便利之间需要合理权衡” [正确]
- B. 不看数据结构，直接复制任意 SQL 到生产环境执行
- C. 为了缩短 SQL，删除所有过滤条件和连接条件
- D. 只要返回了数据，就无需检查重复、NULL 或统计粒度

解析：
可靠 SQL 需要同时考虑业务语义与数据边界。本课特别需要记住：规范化与查询便利之间需要合理权衡。

---

## 课时 6：索引基础

课时简介：学习索引基础的核心概念、SQL 写法和常见边界。

预计学习时间：20 分钟

### 正文

[标题]
索引基础的核心思路

[文本]
索引帮助数据库更快定位数据，但会占空间并增加写入维护成本。应围绕真实过滤、连接和排序模式设计。

[代码 language=sql]
CREATE INDEX idx_orders_user_id ON orders(user_id);
[/代码]

[标题]
从结果语义理解 SQL

[文本]
学习这一部分时，不要只记住关键字。应先说明查询或约束希望解决什么问题，再检查输入数据范围、结果粒度以及 NULL、重复行和排序等边界。对于“索引基础”，核心判断是：索引可以加速合适的查找。

[示例 title=索引基础示例]
说明：使用一个最小 SQL 示例观察语句结构，不连接或修改生产数据库。
语言：sql
CREATE INDEX idx_orders_user_id ON orders(user_id);
[/示例]

[提示 title=索引基础学习提示]
索引并非越多越好。先预测结果，再阅读 SQL，会比机械背语法更容易形成稳定理解。

[警告 title=注意 SQL 方言与数据边界]
不同数据库在函数、分页、日期处理等细节上可能不同。课程以通用关系型 SQL 思想为主，涉及写操作的示例仅用于学习，不应直接对生产数据库执行。

### 课时题目

#### 题目 16

题型：SINGLE_CHOICE
题干：关于“索引基础”，下列哪项说法正确？
难度：EASY
分值：10
知识点：索引基础
是否用于 Battle：否

选项：
- A. 索引可以加速合适的查找 [正确]
- B. SQL 的所有语句都会自动修改原表数据
- C. 只要语法能够执行，结果就一定符合业务需求
- D. NULL、重复行和排序永远不会影响查询结果

解析：
索引可以加速合适的查找。其余说法把 SQL 的查询、写入或结果语义绝对化了。

#### 题目 17

题型：SINGLE_CHOICE
题干：阅读下面 SQL：`CREATE INDEX idx_orders_user_id ON orders(user_id);`。结合“索引基础”的知识，最合理的理解是什么？
难度：MEDIUM
分值：10
知识点：索引基础、SQL 阅读
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：执行流程

选项：
- A. 该语句体现了“索引可以加速合适的查找” [正确]
- B. 该语句一定会删除数据库中的全部记录
- C. 该语句的结果与表中数据完全无关
- D. 该语句可以忽略字段类型、约束和 NULL 语义

解析：
示例围绕“索引基础”展开，正确理解是：索引可以加速合适的查找。判断 SQL 时应结合语句类型与数据语义。

#### 题目 18

题型：CODE_FILL
题干：补全下面 SQL 中的 `____`，使语句能够表达本课“索引基础”示例的原意。请填写缺失的 SQL 片段。
难度：HARD
分值：10
知识点：索引基础、SQL 代码填空
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码:
```sql
____ idx_orders_user_id ON orders(user_id);
```

可接受答案:
```sql
CREATE INDEX
```

判题设置：
- 区分大小写：否
- 忽略首尾空格：是
- 保留代码内部空格：否
- 统一 Windows 和 Unix 换行：是

解析：
缺失部分是 `CREATE INDEX`。补全后语句恢复为本课示例，体现：索引可以加速合适的查找。

标准完整代码:
```sql
CREATE INDEX idx_orders_user_id ON orders(user_id);
```

---
