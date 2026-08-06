## 章节 4：文本处理与 Shell 脚本基础

### 章节简介

本章节聚焦两类核心能力：一是用 `cat`、`head`、`tail`、`less`、`grep` 查看与检索文本，结合管道符与重定向灵活组织命令；二是掌握 `vim` 编辑器的基本操作，并学会编写 Shell 脚本，使用变量、条件判断与循环完成自动化任务。学完本章节，你能独立编写小型运维脚本处理日志与配置文件。

### 预计学习时间

90 分钟

### 文本查看：cat

`cat` 用于一次性输出文件全部内容，常配合 `-n` 显示行号、`-b` 仅给非空行编号，也可用来合并多个文件。由于 `cat` 会把整个文件读入内存，不适合查看大文件。

```bash
# 查看 hosts 文件并显示行号
cat -n /etc/hosts

# 合并两个配置文件为新文件
cat /home/student/base.conf /home/student/extra.conf > /home/student/merged.conf
```

### head 与 tail

`head` 默认显示文件开头 10 行，`tail` 显示末尾 10 行，均可用 `-n` 指定行数。`tail -f` 能实时追踪日志新增内容，按 `Ctrl+C` 退出，是运维排查问题的利器。

```bash
# 查看日志前 20 行
head -n 20 /var/log/syslog

# 实时监控访问日志
tail -f /var/log/nginx/access.log
```

### less 分页查看大文件

`less` 把大文件分页加载，支持上下翻页与搜索，内存占用小。按 `/` 向下搜索关键词，`n` 跳到下一个匹配，`q` 退出。

```bash
# 分页查看大型日志文件
less /var/log/syslog

# 在 less 中输入以下按键操作
# /error    向下搜索 error
# n        下一个匹配
# q        退出
```

### grep 文本搜索

`grep` 按模式在文本中搜索匹配行。常用选项：`-n` 显示行号、`-i` 忽略大小写、`-v` 反向匹配（输出不包含模式的行）、`-r` 递归搜索目录、`-c` 统计匹配行数、`-E` 启用扩展正则。

```bash
# 在日志中搜索包含 error 的行并显示行号
grep -n "error" /var/log/syslog

# 递归搜索配置目录中的 server 关键词，忽略大小写
grep -rin "server" /etc/nginx/

# 统计登录失败次数
grep -c "Failed password" /var/log/auth.log
```

### 管道符 |

管道符 `|` 把前一个命令的标准输出作为后一个命令的标准输入，可将简单命令组合成强大的处理流水线。

```bash
# 查找正在运行的 nginx 进程
ps aux | grep nginx

# 统计 /etc 目录下 conf 文件数量
ls /etc/*.conf | wc -l
```

### 重定向

重定向用于改变命令输出的去向。`>` 覆盖写入文件，`>>` 追加写入，`2>` 重定向错误输出，`&>` 同时重定向标准输出与错误输出，`/dev/null` 是丢弃数据的"黑洞"设备。

```bash
# 把命令正常输出追加到日志文件
echo "部署开始" >> /home/student/deploy.log

# 丢弃错误信息只保留正常输出
grep "ok" /home/student/data.txt 2> /dev/null

# 同时保存正常与错误输出
make build &> /home/student/build_all.log
```

### vim 编辑器基础

`vim` 有三种模式：命令模式（打开即进入，用于移动复制）、插入模式（按 `i`/`a`/`o` 进入，用于输入文本）、末行模式（按 `:` 进入，用于保存退出）。常用操作：`dd` 删除整行、`yy` 复制整行、`p` 粘贴、`/` 搜索、`:wq` 保存退出、`:q!` 强制不保存退出。

```bash
# 编辑脚本文件
vim /home/student/deploy.sh

# 进入后常用按键
# i        在光标前进入插入模式
# Esc      回到命令模式
# :wq      保存并退出
# :q!      强制退出不保存
# /start   向下搜索 start
```

### Shell 脚本基础

Shell 脚本第一行的 `#!/bin/bash` 称为 shebang，告诉系统用哪个解释器执行脚本。脚本可通过 `bash script.sh` 直接运行，或赋予执行权限后用 `./script.sh` 运行。

```bash
# 创建第一个脚本
cat > /home/student/hello.sh <<'EOF'
#!/bin/bash
echo "欢迎学习 Linux"
echo "当前用户: $(whoami)"
EOF

# 赋予执行权限并运行
chmod +x /home/student/hello.sh
/home/student/hello.sh
```

### 变量

自定义变量用 `变量名=值` 定义（等号两侧不能有空格），引用时加 `$`。`export` 可把变量导出为环境变量供子进程使用。位置参数 `$1`、`$2` 代表脚本参数，`$#` 是参数个数，`$@` 是所有参数，`$?` 是上一条命令的退出状态码，`read` 用于读取用户输入。

```bash
#!/bin/bash
# 变量与参数演示
app_name="nginx"
export DEPLOY_ENV="production"

echo "应用: $app_name, 环境: $DEPLOY_ENV"
echo "参数个数: $#, 全部参数: $@"
echo "第一个参数: $1"

read -p "请输入端口号: " port
echo "你输入的端口是: $port"
```

### 条件判断

`if...then...fi` 实现分支判断，条件可用 `test` 命令或方括号 `[ ]`。文件测试常用 `-f`（存在且为普通文件）、`-d`（存在且为目录）、`-e`（存在即可）。

```bash
#!/bin/bash
# 判断配置文件是否存在
config_file="/home/student/app.conf"
if [ -f "$config_file" ]; then
    echo "配置文件存在，开始加载"
else
    echo "配置文件缺失，请检查"
fi
```

### 循环

`for` 循环用于遍历列表，`while` 循环在条件为真时反复执行，常用于批量处理文件或持续监控。

```bash
#!/bin/bash
# for 循环批量创建目录
for dir in project docs tests logs; do
    mkdir -p "/home/student/workspace/$dir"
    echo "已创建目录: $dir"
done

# while 循环倒计时
count=3
while [ $count -gt 0 ]; do
    echo "剩余 $count 秒"
    count=$((count - 1))
done
echo "开始执行"
```

### 示例

[示例 title="日志错误统计脚本"]

编写一个脚本，从系统日志中提取最近的错误记录，统计数量并写入报告文件。

```bash
#!/bin/bash
# 统计系统日志中的错误数量并生成报告
log_file="/var/log/syslog"
report="/home/student/error_report.txt"

error_count=$(grep -ci "error" "$log_file")
echo "错误记录统计报告" > "$report"
echo "生成时间: $(date)" >> "$report"
echo "错误条数: $error_count" >> "$report"
grep -i "error" "$log_file" | tail -n 5 >> "$report"
echo "报告已保存到 $report"
```

### 提示

[提示 title="用管道组合命令更高效"]

遇到"查看 + 过滤 + 统计"这类需求时，优先用管道把多个简单命令串起来，例如 `cat file | grep -v "#" | wc -l` 统计非注释行数，比写脚本更简洁。

[提示 title="脚本调试用 bash -x"]

运行 `bash -x script.sh` 可以逐行打印脚本执行过程，方便定位变量赋值与条件分支的问题。

### 警告

[警告 title="cat 不适合查看大文件"]

`cat` 会把整个文件读入内存一次性输出，查看几百 MB 的日志会造成卡顿甚至撑爆终端。大文件请用 `less` 或 `tail` 分段查看。

[警告 title="变量赋值等号两侧不能有空格"]

Shell 中 `name="tom"` 是赋值，而 `name = "tom"` 会被解释为执行命令 `name`，导致报错，这是初学者最常踩的坑。

### 章节题目

#### 题目 1（SINGLE_CHOICE）

题干：想要实时监控日志文件新增的内容，应使用以下哪个命令？

- A. tail -n 20 /var/log/syslog
- B. tail -f /var/log/syslog
- C. head -f /var/log/syslog
- D. cat -f /var/log/syslog

正确答案：B

解析：`tail -f` 会持续追踪文件末尾新增的内容，是实时监控日志的标准做法，按 Ctrl+C 退出。`tail -n 20` 只显示最后 20 行后即退出，`head` 查看的是文件开头且不支持 `-f` 追踪，`cat` 没有 `-f` 选项。

是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：text

#### 题目 2（SINGLE_CHOICE）

题干：在 `grep` 命令中，`-v` 选项的作用是什么？

- A. 显示匹配行的行号
- B. 忽略大小写进行匹配
- C. 反向匹配，输出不包含模式的行
- D. 递归搜索子目录

正确答案：C

解析：`-v` 表示反向匹配（invert match），会输出所有不包含指定模式的行，常用于过滤掉注释或空行。显示行号是 `-n`，忽略大小写是 `-i`，递归搜索是 `-r`。

是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：text

#### 题目 3（SINGLE_CHOICE）

题干：以下哪个重定向符号表示"追加写入"而不会覆盖原有内容？

- A. >
- B. >>
- C. 2>
- D. &>

正确答案：B

解析：`>>` 表示追加写入，在文件末尾继续添加内容而不清空原文件。`>` 会覆盖原有内容，`2>` 只重定向错误输出，`&>` 同时重定向标准输出和错误输出且为覆盖方式。

是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：text

#### 题目 4（SINGLE_CHOICE）

题干：在 vim 中，保存文件并退出的末行模式命令是？

- A. :q
- B. :q!
- C. :wq
- D. :w

正确答案：C

解析：`:wq` 表示写入（write）并退出（quit），是保存退出的标准命令。`:q` 仅退出但不保存，若文件有修改会报错；`:q!` 强制不保存退出；`:w` 只保存不退出。

是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：text

#### 题目 5（SINGLE_CHOICE）

题干：Shell 脚本中，`$#` 表示的含义是？

- A. 所有位置参数组成的列表
- B. 位置参数的个数
- C. 脚本自身的文件名
- D. 上一条命令的退出状态码

正确答案：B

解析：`$#` 表示传给脚本的位置参数个数，常用于参数校验。`$@` 才是所有位置参数列表，`$0` 是脚本名，`$?` 是上一条命令的退出状态码。

是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：text

#### 题目 6（FILL_BLANK）

题干：Bash 脚本第一行通常写作 __________，它告诉系统使用 /bin/bash 解释器执行脚本。

acceptedAnswers：
- #!/bin/bash
- #! /bin/bash

判题设置：忽略大小写，去除首尾空格，任一答案匹配即正确。

解析：这行称为 shebang，以 `#!` 开头后跟解释器绝对路径，系统据此选择正确的解释器运行脚本。缺少 shebang 时脚本可能被默认 shell 误解析，导致语法不一致。

是否用于 Battle：否
Battle 难度：EASY
Battle 展示类型：text

#### 题目 7（FILL_BLANK）

题干：在 `less` 中，向下搜索关键词所使用的按键是 __________。

acceptedAnswers：
- /
- 正斜杠

判题设置：忽略大小写，去除首尾空格，任一答案匹配即正确。

解析：在 less 的浏览界面按 `/` 进入搜索模式，输入关键词回车即可向下查找，按 `n` 跳到下一个匹配。这与 vim 中的搜索操作一致。

是否用于 Battle：否
Battle 难度：EASY
Battle 展示类型：text

#### 题目 8（FILL_BLANK）

题干：将自定义变量导出为环境变量，使其能被子进程继承，使用的命令是 __________。

acceptedAnswers：
- export

判题设置：忽略大小写，去除首尾空格，任一答案匹配即正确。

解析：`export 变量名=值` 可把变量放入环境变量表，子进程通过继承环境变量获取该值。未 export 的普通变量仅在当前 Shell 进程内有效，无法传递给子进程。

是否用于 Battle：否
Battle 难度：EASY
Battle 展示类型：text

#### 题目 9（FILL_BLANK）

题干：若要丢弃命令的所有输出（包括正常输出和错误信息），可以将其重定向到特殊设备文件 __________。

acceptedAnswers：
- /dev/null

判题设置：忽略大小写，去除首尾空格，任一答案匹配即正确。

解析：`/dev/null` 是 Linux 的"黑洞"设备，写入它的数据会被直接丢弃，常配合 `2> /dev/null` 或 `&> /dev/null` 来屏蔽不需要的输出，让脚本界面更干净。

是否用于 Battle：否
Battle 难度：EASY
Battle 展示类型：text

#### 题目 10（FILL_BLANK）

题干：Shell 中用于遍历列表执行批量操作的关键字是 __________（英文小写）。

acceptedAnswers：
- for

判题设置：忽略大小写，去除首尾空格，任一答案匹配即正确。

解析：`for 变量 in 列表; do ...; done` 用于遍历固定列表批量执行命令，是脚本中最常用的循环结构。与之配合的还有 `while` 循环，用于条件为真时持续执行。

是否用于 Battle：否
Battle 难度：EASY
Battle 展示类型：text

#### 题目 11（CODE_FILL）

考查点：管道符结合 tail 与 grep 提取日志中最近的错误记录。

题目代码：

```bash
#!/bin/bash
# 查找系统日志中最近包含 error 的记录
__________ /var/log/syslog | grep -i error
```

标准答案：tail -n 20

完整代码：

```bash
#!/bin/bash
# 查找系统日志中最近包含 error 的记录
tail -n 20 /var/log/syslog | grep -i error
```

解析：先用 `tail -n 20` 取日志最后 20 行，再通过管道交给 `grep -i error` 过滤出包含 error 的行（忽略大小写）。管道符把前命令输出作为后命令输入，体现了 Linux 命令组合的精髓。

是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：code

#### 题目 12（CODE_FILL）

考查点：重定向符将统计结果写入文件。

题目代码：

```bash
#!/bin/bash
# 统计登录失败次数并写入文件
grep -c "Failed password" /var/log/auth.log __________ /home/student/fail_count.txt
```

标准答案：>

完整代码：

```bash
#!/bin/bash
# 统计登录失败次数并写入文件
grep -c "Failed password" /var/log/auth.log > /home/student/fail_count.txt
```

解析：`grep -c` 统计匹配行数，`>` 把该数字覆盖写入目标文件。若需保留历史记录应改用 `>>` 追加，避免每次运行覆盖之前的数据。

是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：code

#### 题目 13（CODE_FILL）

考查点：if 条件判断中的文件测试运算符。

题目代码：

```bash
#!/bin/bash
# 判断配置文件是否存在且为普通文件
config_file="/home/student/app.conf"
if [ __________ "$config_file" ]; then
    echo "配置文件存在，开始加载"
fi
```

标准答案：-f

完整代码：

```bash
#!/bin/bash
# 判断配置文件是否存在且为普通文件
config_file="/home/student/app.conf"
if [ -f "$config_file" ]; then
    echo "配置文件存在，开始加载"
fi
```

解析：`-f` 测试路径存在且为普通文件，是配置文件校验的常用选项。`-e` 仅判断存在不区分类型，`-d` 判断是否为目录，根据场景选择合适的测试运算符。

是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：code

#### 题目 14（CODE_FILL）

考查点：for 循环批量创建目录。

题目代码：

```bash
#!/bin/bash
# 批量创建项目目录
for dir in project docs tests; do
    __________ "/home/student/workspace/$dir"
done
```

标准答案：mkdir -p

完整代码：

```bash
#!/bin/bash
# 批量创建项目目录
for dir in project docs tests; do
    mkdir -p "/home/student/workspace/$dir"
done
```

解析：`for` 遍历目录名列表，`mkdir -p` 递归创建目录且已存在时不报错。`-p` 还能一并创建父目录，是脚本中创建目录的推荐写法。

是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：code

#### 题目 15（CODE_FILL）

考查点：read 命令读取用户输入并存入变量。

题目代码：

```bash
#!/bin/bash
# 读取用户名并问候
__________ -p "请输入你的名字: " username
echo "你好, $username"
```

标准答案：read

完整代码：

```bash
#!/bin/bash
# 读取用户名并问候
read -p "请输入你的名字: " username
echo "你好, $username"
```

解析：`read -p` 显示提示信息并等待用户输入，输入内容存入变量 `username`。`-p` 选项用于指定提示文字，使交互更友好；不加 `-p` 则需另用 echo 打印提示。

是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：code