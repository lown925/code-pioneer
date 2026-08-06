## 章节2：文件与目录操作

### 章节简介

本章节讲解 Linux 文件系统中的路径概念与特殊路径符号，并介绍文件与目录的创建、复制、移动、删除等核心操作命令，包括 mkdir、touch、cp、mv、rm，以及通配符的使用、find 命令的基础用法和 FHS 目录结构规范。

### 预计学习时间

50 分钟

### 绝对路径与相对路径

Linux 文件系统采用树形目录结构，根目录为 `/`。路径分为两种：

- **绝对路径**：从根目录 `/` 开始的完整路径，如 `/home/student/documents`。
- **相对路径**：相对于当前工作目录的路径，如 `documents/report.txt`。

```bash
# 假设当前在 /home/student 目录
# 绝对路径访问
cd /home/student/documents

# 相对路径访问
cd documents
```

### 特殊路径符号

路径中常用的特殊符号：

| 符号 | 含义 |
|------|------|
| `.` | 当前目录 |
| `..` | 上一级目录 |
| `~` | 当前用户的家目录 |
| `-` | 上一次所在的目录 |

```bash
# 从 /home/student/projects 切换到 /home/student
cd ..

# 引用当前目录下的文件
cp ./config.ini /backup/
```

### mkdir 命令

`mkdir` 是 Make Directory 的缩写，用于创建目录。常用选项：

- `-p`：递归创建多级目录，如果父目录不存在会自动创建。
- `-m`：创建时直接指定权限。

```bash
# 创建单级目录
mkdir /home/student/projects

# 递归创建多级目录
mkdir -p /home/student/projects/web/src

# 创建目录并指定权限为 700
mkdir -m 700 /home/student/secret
```

### touch 命令

`touch` 命令用于创建空文件，或更新已有文件的时间戳（访问时间和修改时间）。需要注意，`touch` 不会清空已有文件的内容。

```bash
# 创建空文件
touch /home/student/notes.txt

# 文件已存在时，仅更新时间戳，内容不变
touch /home/student/notes.txt
```

### cp 命令

`cp` 是 Copy 的缩写，用于复制文件或目录。语法为 `cp [选项] 源文件 目标`。常用选项：

- `-r`：递归复制目录及其内容（复制目录时必须使用）。
- `-a`：归档模式，保留所有属性（权限、时间戳等），且递归复制。
- `-i`：目标已存在时提示确认。

```bash
# 复制文件
cp /home/student/report.txt /backup/

# 递归复制目录
cp -r /home/student/projects /backup/

# 保持属性复制
cp -a /home/student/config /backup/
```

### mv 命令

`mv` 是 Move 的缩写，用于移动文件或重命名。`mv` 的行为取决于目标：

- 目标不存在：将源重命名为目标名。
- 目标是目录：将源移动到该目录中。
- 目标是已存在的文件：覆盖目标文件。

```bash
# 重命名文件（目标不存在）
mv /home/student/old_report.txt /home/student/new_report.txt

# 移动文件到目录
mv /home/student/report.txt /home/student/archive/

# 移动并重命名
mv /home/student/report.txt /home/student/archive/weekly_report.txt
```

### rm 命令

`rm` 是 Remove 的缩写，用于删除文件或目录。常用选项：

- `-r`：递归删除目录及其内容。
- `-f`：强制删除，不提示确认。
- `-i`：删除前逐个确认。

`rmdir` 命令只能删除空目录，非空目录需要使用 `rm -r`。

```bash
# 删除文件
rm /home/student/temp.txt

# 递归删除目录
rm -r /home/student/old_projects

# 强制递归删除（不提示）
rm -rf /home/student/temp_cache
```

### 通配符

通配符用于匹配文件名，常与 ls、cp、rm 等命令配合使用：

| 通配符 | 含义 | 示例 |
|--------|------|------|
| `*` | 匹配任意长度的任意字符 | `*.txt` 匹配所有 txt 文件 |
| `?` | 匹配单个任意字符 | `file?.txt` 匹配 file1.txt 但不匹配 file12.txt |
| `[]` | 匹配方括号内的任意一个字符 | `file[13].txt` 匹配 file1.txt 和 file3.txt |

```bash
# 列出所有 .log 文件
ls /var/log/*.log

# 删除所有以 temp 开头的文件
rm /home/student/temp*

# 复制所有以 report 开头且后跟单个字符的文件
cp /home/student/report?.txt /backup/
```

### find 命令基础

`find` 命令用于在指定目录下查找文件。基本语法为 `find 查找路径 查找条件`。常用查找条件：

- `-name`：按文件名匹配（支持通配符）。
- `-type`：按文件类型查找（`f` 为普通文件，`d` 为目录）。
- `-mtime`：按修改时间查找（`-mtime -1` 表示 1 天内修改的文件）。

```bash
# 在 /home 下查找名为 notes.txt 的文件
find /home -name "notes.txt"

# 查找所有 .log 文件
find /var/log -name "*.log"

# 查找 /home 下所有目录
find /home -type d

# 查找 7 天内修改过的文件
find /home -mtime -7
```

### FHS 目录结构基础

FHS（Filesystem Hierarchy Standard）定义了 Linux 目录结构的标准。常见顶层目录：

| 目录 | 用途 |
|------|------|
| `/` | 根目录，所有目录的起点 |
| `/home` | 普通用户的家目录 |
| `/root` | root 用户的家目录 |
| `/etc` | 系统配置文件 |
| `/var` | 经常变化的数据（日志、缓存等） |
| `/usr` | 用户程序和文件 |
| `/tmp` | 临时文件 |
| `/dev` | 设备文件 |
| `/bin` | 基本命令的可执行文件 |
| `/sbin` | 系统管理命令 |

```bash
# 查看系统日志目录
ls /var/log

# 查看系统配置文件
ls /etc
```

[示例 title="文件与目录操作综合演示"]

```bash
# 递归创建项目目录结构
mkdir -p /home/student/projects/web/src
mkdir -p /home/student/projects/web/assets

# 创建配置文件
touch /home/student/projects/web/config.ini

# 复制整个项目目录到备份位置
cp -r /home/student/projects /home/student/backup_projects

# 将配置文件移动到 src 目录
mv /home/student/projects/web/config.ini /home/student/projects/web/src/

# 查找项目中所有 .ini 文件
find /home/student/projects -name "*.ini"

# 清理临时目录
rm -rf /home/student/temp
```

[提示 title="cp 与 mv 的源→目标顺序"]

`cp` 和 `mv` 命令的参数顺序始终是"源在前、目标在后"，即 `cp 源文件 目标位置`。记忆方法可以联想"从源复制到目标"。如果顺序写反，可能会导致非预期的结果。

[提示 title="通配符需要加引号的场景"]

在 `find` 命令中使用通配符时，建议将模式用引号包裹，如 `find /home -name "*.log"`。如果不加引号，Shell 会先尝试展开通配符，可能导致查找结果不符合预期。

[警告 title="rm -rf 的危险性"]

`rm` 命令删除的文件不会进入回收站，而是直接永久删除。`rm -rf /` 会递归强制删除整个文件系统的所有文件，导致系统完全损坏且无法恢复。执行 `rm -rf` 前务必确认路径正确，尤其要注意路径开头是否有多余的空格。在生产环境中，建议先用 `ls` 确认要删除的内容，再执行删除。

### 章节题目

#### 题目 1（SINGLE_CHOICE）

题干：下列哪个路径是绝对路径？

- A. ../home
- B. ./documents
- C. /home/student
- D. ~/downloads

正确答案：C

解析：绝对路径是从根目录 `/` 开始的完整路径。`/home/student` 以 `/` 开头，是绝对路径。`../home` 和 `./documents` 是相对路径，分别基于上一级目录和当前目录。`~/downloads` 中 `~` 会被 Shell 展开为家目录路径，但它本身是以 `~` 开头的简写形式，严格来说不是以 `/` 开头的绝对路径写法。因此选项 C 正确。

是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：text

#### 题目 2（SINGLE_CHOICE）

题干：`mkdir -p /home/student/projects/web` 命令的作用是什么？

- A. 仅创建 web 目录，如果父目录不存在则报错
- B. 递归创建 projects 及其子目录 web，如果父目录不存在会自动创建
- C. 删除 projects 目录
- D. 创建一个名为 -p 的目录

正确答案：B

解析：`mkdir` 的 `-p` 选项表示递归创建目录，当父目录不存在时会自动创建所有缺失的父目录。因此 `mkdir -p /home/student/projects/web` 会依次创建 projects 和 web 两级目录。如果不加 `-p`，当 projects 目录不存在时会报错。因此选项 B 正确。

是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：text

#### 题目 3（SINGLE_CHOICE）

题干：使用 `cp` 命令复制一个目录及其所有内容时，必须使用哪个选项？

- A. -f
- B. -i
- C. -r
- D. -v

正确答案：C

解析：`cp` 命令默认只能复制文件，复制目录时必须加 `-r`（recursive）选项进行递归复制，否则会报错提示"cp: omitting directory"。`-f` 是强制覆盖，`-i` 是交互确认，`-v` 是显示详细过程，都不能实现目录的递归复制。因此选项 C 正确。

是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：text

#### 题目 4（SINGLE_CHOICE）

题干：执行 `mv report.txt /tmp` 后，如果 `/tmp` 是一个已存在的目录，会发生什么？

- A. 报错，因为目标已存在
- B. 将 report.txt 移动到 /tmp 目录中
- C. 将 report.txt 重命名为 /tmp 文件
- D. 删除 report.txt

正确答案：B

解析：`mv` 命令在目标是已存在的目录时，会将源文件移动到该目录内部，即 report.txt 会被移动到 /tmp/report.txt。只有当目标不存在或是已存在的文件时，`mv` 才会执行重命名或覆盖操作。因此选项 B 正确。

是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：text

#### 题目 5（SINGLE_CHOICE）

题干：`find /var/log -name "*.log"` 命令的作用是什么？

- A. 删除 /var/log 下所有以 .log 结尾的文件
- B. 在 /var/log 目录下查找文件名以 .log 结尾的文件
- C. 在 /var/log 下查找文件名包含 log 的所有文件
- D. 列出 /var/log 目录的详细内容

正确答案：B

解析：`find` 命令用于查找文件，`/var/log` 是查找路径，`-name "*.log"` 是按文件名匹配条件，`*.log` 表示以 `.log` 结尾的文件名。该命令的作用是在 /var/log 目录及其子目录中查找所有扩展名为 .log 的文件，不会删除文件。`*log`（不含点）才会匹配文件名中包含 log 的文件。因此选项 B 正确。

是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：text

#### 题目 6（FILL_BLANK）

题干：在 Shell 通配符中，__________ 可以匹配任意长度的任意字符（包括空字符串）。

acceptedAnswers：
- *
- 星号
- *

判题设置：忽略大小写，去除首尾空格，任一答案匹配即正确。

解析：`*` 是通配符中最常用的一个，可以匹配任意长度（包括零个）的任意字符。例如 `*.txt` 匹配所有以 .txt 结尾的文件，`file*` 匹配所有以 file 开头的文件。与之相对，`?` 只能匹配单个字符。

是否用于 Battle：否
Battle 难度：EASY
Battle 展示类型：text

#### 题目 7（FILL_BLANK）

题干：`touch` 命令除了可以创建空文件外，还可以用来更新已有文件的 __________ 。

acceptedAnswers：
- 时间戳
- 访问时间和修改时间
- 修改时间
- 时间

判题设置：忽略大小写，去除首尾空格，任一答案匹配即正确。

解析：`touch` 命令有两个主要功能：创建空文件和更新已有文件的时间戳。当目标文件已存在时，`touch` 不会修改文件内容，而是更新文件的访问时间（atime）和修改时间（mtime）为当前时间。这一点与 `>` 重定向不同，后者会清空文件内容。

是否用于 Battle：否
Battle 难度：EASY
Battle 展示类型：text

#### 题目 8（FILL_BLANK）

题干：`rmdir` 命令只能删除 __________ 目录，如果要删除非空目录需要使用 `rm -r`。

acceptedAnswers：
- 空
- 空的
- 空目录

判题设置：忽略大小写，去除首尾空格，任一答案匹配即正确。

解析：`rmdir`（remove directory）只能删除空目录，如果目录中有文件或子目录会报错。这一设计是一种安全机制，防止意外删除目录中的内容。要删除非空目录，需要使用 `rm -r` 命令递归删除。

是否用于 Battle：否
Battle 难度：EASY
Battle 展示类型：text

#### 题目 9（FILL_BLANK）

题干：在路径表示中，`..` 表示 __________ 目录。

acceptedAnswers：
- 上一级
- 父
- 上级
- 上一级的
- 父级

判题设置：忽略大小写，去除首尾空格，任一答案匹配即正确。

解析：`..` 表示当前目录的上一级（父）目录。例如当前在 `/home/student/projects`，执行 `cd ..` 后会切换到 `/home/student`。`..` 可以连续使用，如 `cd ../..` 表示切换到上两级目录。

是否用于 Battle：否
Battle 难度：EASY
Battle 展示类型：text

#### 题目 10（FILL_BLANK）

题干：`find` 命令使用 __________ 选项可以按文件类型进行查找，其中 f 表示普通文件，d 表示目录。

acceptedAnswers：
- -type
- type
- --type

判题设置：忽略大小写，去除首尾空格，任一答案匹配即正确。

解析：`find` 命令的 `-type` 选项用于按文件类型查找。常用的类型参数有 `f`（普通文件）、`d`（目录）、`l`（符号链接）。例如 `find /home -type d` 查找 /home 下所有目录，`find /home -type f -name "*.conf"` 查找所有 .conf 配置文件。

是否用于 Battle：否
Battle 难度：EASY
Battle 展示类型：text

#### 题目 11（CODE_FILL）

考查点：使用 mkdir -p 递归创建多级目录。

题目代码：

```bash
# 递归创建 /home/student/logs/nginx 目录
mkdir __________ /home/student/logs/nginx
```

标准答案：-p

完整代码：

```bash
# 递归创建 /home/student/logs/nginx 目录
mkdir -p /home/student/logs/nginx
```

解析：`mkdir` 的 `-p` 选项表示递归创建目录。当要创建的目录的父目录不存在时，`-p` 会自动创建所有缺失的父目录。如果不加 `-p`，当 logs 目录不存在时会报错 "No such file or directory"。这在创建深层嵌套的目录结构时非常常用。

是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：code

#### 题目 12（CODE_FILL）

考查点：使用 cp -r 递归复制目录。

题目代码：

```bash
# 将 /home/student/config 目录递归复制到 /backup
cp __________ /home/student/config /backup
```

标准答案：-r

完整代码：

```bash
# 将 /home/student/config 目录递归复制到 /backup
cp -r /home/student/config /backup
```

解析：`cp` 命令复制目录时必须使用 `-r`（recursive）选项，否则会报错提示省略目录。`-r` 会递归复制目录及其下所有子目录和文件。如果还需要保留权限、时间戳等属性，可以使用 `-a` 选项，它等价于 `-r` 加上保留属性的选项组合。

是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：code

#### 题目 13（CODE_FILL）

考查点：使用 mv 命令对文件进行重命名。

题目代码：

```bash
# 将当前目录下的 old_report.txt 重命名为 new_report.txt
mv old_report.txt __________
```

标准答案：new_report.txt

完整代码：

```bash
# 将当前目录下的 old_report.txt 重命名为 new_report.txt
mv old_report.txt new_report.txt
```

解析：`mv` 命令在目标参数不存在时执行重命名操作。`mv old_report.txt new_report.txt` 将文件 old_report.txt 重命名为 new_report.txt。如果 new_report.txt 已存在，会被覆盖。`mv` 的参数顺序是"源在前、目标在后"。

是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：code

#### 题目 14（CODE_FILL）

考查点：使用 find 命令按文件名查找文件。

题目代码：

```bash
# 在 /var/log 目录下查找名为 syslog 的文件
find /var/log __________ "syslog"
```

标准答案：-name

完整代码：

```bash
# 在 /var/log 目录下查找名为 syslog 的文件
find /var/log -name "syslog"
```

解析：`find` 命令的 `-name` 选项用于按文件名匹配查找。`-name "syslog"` 表示精确匹配文件名为 syslog 的文件。如果使用通配符如 `-name "*.log"`，则可以匹配所有以 .log 结尾的文件。注意通配符模式建议用引号包裹，防止 Shell 提前展开。

是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：code

#### 题目 15（CODE_FILL）

考查点：使用 touch 命令创建空文件。

题目代码：

```bash
# 在 /home/student 目录下创建空文件 notes.txt
__________ /home/student/notes.txt
```

标准答案：touch

完整代码：

```bash
# 在 /home/student 目录下创建空文件 notes.txt
touch /home/student/notes.txt
```

解析：`touch` 命令用于创建空文件。如果指定的文件不存在，`touch` 会创建一个大小为 0 的空文件；如果文件已存在，则更新其时间戳而不修改内容。`touch` 后面跟的是文件的路径，可以是绝对路径也可以是相对路径。

是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：code