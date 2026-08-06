## 章节 5：进程管理与系统服务

### 章节简介

本章节讲解如何查看与控制正在运行的程序。你将理解进程、PID、前台后台与守护进程的概念，掌握 `ps`、`top`、`kill` 等进程管理命令，学会用 `nohup` 让任务在终端关闭后继续运行，并通过 `systemctl`、`journalctl` 管理系统服务与日志，最后了解 `cron` 定时任务基础。

### 预计学习时间

90 分钟

### 进程概念

进程是正在运行的程序实例。每个进程拥有唯一的进程 ID（PID），其创建者称为父进程，父进程的 ID 记为 PPID。系统启动后由 init/systemd（PID 为 1）派生出各类进程，形成进程树。

```bash
# 查看当前 Shell 的进程号
echo "当前 Shell PID: $$"

# 查看父进程号
echo "父进程 PPID: $PPID"
```

### 进程三种类型

进程按运行方式分为三类：前台进程占用终端、需要交互；后台进程不占用终端、在后台运行；守护进程（daemon）是系统启动时自动运行的特殊后台进程，如 sshd、nginx，脱离终端长期提供服务。

```bash
# 前台运行：占用终端，结束才返回提示符
sleep 10

# 后台运行：命令末尾加 & 立即返回提示符
sleep 30 &
```

### ps 查看进程

`ps` 用于查看进程快照。`ps aux` 列出系统所有进程的详细信息，`ps -ef` 能显示进程的父子关系（PPID 列），配合 `grep` 可按名称查找特定进程。

```bash
# 查看所有进程详细信息
ps aux

# 查看进程父子关系
ps -ef

# 查找 nginx 进程
ps aux | grep nginx
```

### top 实时监控

`top` 以动态刷新方式实时展示进程资源占用。运行时按 `P` 按 CPU 排序、`M` 按内存排序、`k` 输入 PID 终止进程、`1` 展开各 CPU 核心占用、`q` 退出。

```bash
# 启动实时监控
top

# 交互操作说明
# P  按 CPU 占用排序
# M  按内存占用排序
# k  终止指定进程
# 1  展开每个 CPU 核心
# q  退出
```

### kill 终止进程

`kill` 通过发送信号控制进程。默认发送 15 号信号 SIGTERM，请求进程优雅退出；`kill -9` 发送 SIGKILL 强制终止，进程无法捕获会被立即杀掉。优先用默认 15，无效时再用 9。

```bash
# 优雅终止进程
kill 2345

# 强制终止无响应进程
kill -9 2345

# 查看所有可用信号
kill -l
```

### killall 与 pkill

`killall` 和 `pkill` 按进程名而非 PID 终止进程，可一次结束多个同名进程。`pkill` 支持更灵活的模式匹配，使用时需谨慎避免误杀。

```bash
# 终止所有名为 nginx 的进程
killall nginx

# 按名称模式终止进程
pkill -f "backup.sh"
```

### 前后台任务管理

命令末尾加 `&` 放到后台运行；`Ctrl+Z` 将前台任务挂起（暂停）；`bg` 让挂起的任务在后台继续运行；`fg` 把后台任务调回前台；`jobs` 查看当前终端的后台任务列表。

```bash
# 后台运行备份任务
tar -czf /home/student/backup.tar.gz /home/student/data &

# 查看后台任务
jobs

# 把 1 号任务调回前台
fg %1
```

### nohup 挂断不退出

`nohup` 让命令忽略挂断信号（SIGHUP），即使关闭终端进程也不会退出，输出默认写入 `nohup.out`。常与 `&` 配合让长时间任务脱离终端运行。

```bash
# 关闭终端后脚本仍继续运行
nohup /home/student/backup.sh &

# 指定日志输出文件
nohup /home/student/backup.sh > /home/student/backup.log 2>&1 &
```

### systemctl 服务管理

`systemctl` 是 systemd 的管理工具，用于控制系统服务。常用子命令：`start` 启动、`stop` 停止、`restart` 重启、`status` 查看状态、`enable` 设置开机自启、`disable` 取消开机自启。

```bash
# 启动 nginx 服务
sudo systemctl start nginx

# 查看服务状态
sudo systemctl status nginx

# 设置开机自启
sudo systemctl enable nginx
```

### service 命令

`service` 是旧式的服务管理命令，在基于 SysVinit 的老系统中使用，现代系统仍保留作为兼容。语法为 `service 服务名 动作`，功能与 systemctl 类似但能力较弱。

```bash
# 旧式方式重启服务
sudo service nginx restart

# 查看服务状态
sudo service nginx status
```

### journalctl 日志查看

`journalctl` 是 systemd 的日志查询工具，集中收集系统与服务日志。`-u` 按服务过滤、`-f` 实时追踪、`--since` 按时间过滤，便于定位服务启动失败的原因。

```bash
# 查看 nginx 服务日志
journalctl -u nginx

# 实时追踪服务日志
journalctl -u nginx -f

# 查看今天的系统日志
journalctl --since today
```

### cron 定时任务

`cron` 是 Linux 的定时任务服务，通过 `crontab -e` 编辑当前用户的定时任务。每条任务由 5 个时间字段加命令组成，分别表示分、时、日、月、周，可实现周期性自动执行。

```bash
# 编辑当前用户的定时任务
crontab -e

# 每天凌晨 2 点执行备份脚本
# 分 时 日 月 周 命令
0 2 * * * /home/student/backup.sh

# 查看已设置的定时任务
crontab -l
```

### 示例

[示例 title="服务重启与日志排查"]

模拟 nginx 服务启动失败后的排查流程：重启服务，查看状态，定位错误日志。

```bash
#!/bin/bash
# 重启 nginx 并排查启动问题
sudo systemctl restart nginx
if [ $? -ne 0 ]; then
    echo "重启失败，查看最近日志"
    journalctl -u nginx --since "5 min ago" --no-pager | tail -n 15
else
    echo "nginx 重启成功"
    sudo systemctl status nginx --no-pager | head -n 5
fi
```

### 提示

[提示 title="先用 ps 定位再用 kill 终止"]

终止进程前先执行 `ps aux | grep 名称` 确认目标 PID，避免误杀同名或无关进程，确认后再用 `kill PID` 操作，操作更安全可控。

### 警告

[警告 title="kill -9 慎用"]

`kill -9` 强制终止进程，进程无法进行资源清理和保存现场，可能导致数据损坏或临时文件残留。应优先尝试默认的 `kill -15`，让程序优雅退出，确实无响应时再使用 -9。

[警告 title="systemctl 需要 root 权限"]

管理系统服务属于特权操作，普通用户执行 `systemctl start` 会提示权限不足，需在命令前加 `sudo` 或切换到 root 用户执行。

### 章节题目

#### 题目 1（SINGLE_CHOICE）

题干：查看系统中所有进程详细信息的命令是？

- A. ps aux
- B. ps -p
- C. top -p
- D. kill -l

正确答案：A

解析：`ps aux` 以 BSD 风格列出系统所有进程的详细信息，包括 CPU、内存占用等，是最常用的进程快照查看方式。`ps -p` 指定 PID 查看，`top -p` 是动态监控指定进程，`kill -l` 列出信号而非进程。

是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：text

#### 题目 2（SINGLE_CHOICE）

题干：在 `top` 交互界面中，按 CPU 占用率排序的按键是？

- A. M
- B. P
- C. k
- D. 1

正确答案：B

解析：在 top 运行界面按 `P`（大写）会按 CPU 占用率从高到低排序，便于快速定位消耗 CPU 的进程。`M` 按内存排序，`k` 用于终止进程，`1` 展开各 CPU 核心的使用情况。

是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：text

#### 题目 3（SINGLE_CHOICE）

题干：`kill -9` 向进程发送的信号是？

- A. SIGTERM
- B. SIGKILL
- C. SIGHUP
- D. SIGINT

正确答案：B

解析：`kill -9` 发送 SIGKILL 信号，内核直接终止进程且进程无法捕获或忽略，属于强制杀死。SIGTERM 是默认的 15 号信号用于优雅退出，SIGHUP 常用于重载配置，SIGINT 由 Ctrl+C 产生。

是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：text

#### 题目 4（SINGLE_CHOICE）

题干：让命令在关闭终端后仍然继续运行，应使用哪个命令？

- A. bg
- B. fg
- C. nohup
- D. jobs

正确答案：C

解析：`nohup` 使进程忽略挂断信号 SIGHUP，关闭终端后进程不会被终止，常配合 `&` 后台运行长任务。`bg`/`fg`/`jobs` 只在当前终端会话内管理前后台任务，终端关闭后任务仍会随之结束。

是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：text

#### 题目 5（SINGLE_CHOICE）

题干：设置服务开机自启动的 systemctl 子命令是？

- A. start
- B. enable
- C. status
- D. restart

正确答案：B

解析：`systemctl enable 服务名` 会建立开机自启链接，使服务随系统启动而启动。`start` 只是当前启动一次，`status` 查看状态，`restart` 重启服务，都不会影响开机自启设置。

是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：text

#### 题目 6（FILL_BLANK）

题干：每个进程在系统中的唯一数字标识称为 __________（英文缩写）。

acceptedAnswers：
- PID
- pid

判题设置：忽略大小写，去除首尾空格，任一答案匹配即正确。

解析：PID（Process ID）是内核为每个进程分配的唯一标识，通过 PID 才能对进程执行 kill 等操作。进程终止后 PID 会被回收并可能分配给新进程。

是否用于 Battle：否
Battle 难度：EASY
Battle 展示类型：text

#### 题目 7（FILL_BLANK）

题干：将正在前台运行的任务挂起（暂停）到后台，使用的快捷键是 __________。

acceptedAnswers：
- Ctrl+Z
- ctrl+z
- Ctrl Z

判题设置：忽略大小写，去除首尾空格，任一答案匹配即正确。

解析：`Ctrl+Z` 向前台进程发送 SIGTSTP 信号使其暂停并放入后台，随后可用 `bg` 让它在后台继续运行，或用 `fg` 调回前台。这与 `Ctrl+C` 终止进程不同。

是否用于 Battle：否
Battle 难度：EASY
Battle 展示类型：text

#### 题目 8（FILL_BLANK）

题干：使用 journalctl 按服务名称过滤日志时，应加上的选项是 __________（带短横线）。

acceptedAnswers：
- -u

判题设置：忽略大小写，去除首尾空格，任一答案匹配即正确。

解析：`journalctl -u 服务名` 只显示指定 systemd 服务的日志，便于针对性排查。还可配合 `-f` 实时追踪、`--since` 按时间过滤，快速定位服务故障。

是否用于 Battle：否
Battle 难度：EASY
Battle 展示类型：text

#### 题目 9（FILL_BLANK）

题干：`kill` 命令默认发送的信号编号是 __________。

acceptedAnswers：
- 15
- SIGTERM
- sigterm

判题设置：忽略大小写，去除首尾空格，任一答案匹配即正确。

解析：`kill PID` 不指定信号时默认发送 15 号信号 SIGTERM，请求进程优雅退出并进行资源清理。只有当进程无响应时才使用 `kill -9`（SIGKILL）强制终止。

是否用于 Battle：否
Battle 难度：EASY
Battle 展示类型：text

#### 题目 10（FILL_BLANK）

题干：查看 TCP 端口监听情况时，netstat 常用的选项组合是 __________（带短横线，四个字母）。

acceptedAnswers：
- -tlnp
- tlnp

判题设置：忽略大小写，去除首尾空格，任一答案匹配即正确。

解析：`netstat -tlnp` 中 `-t` 表示 TCP、`-l` 仅显示监听端口、`-n` 用数字显示地址端口、`-p` 显示占用进程，组合后能清晰列出服务监听端口与对应进程。现代系统也常用 `ss -tlnp` 替代。

是否用于 Battle：否
Battle 难度：EASY
Battle 展示类型：text

#### 题目 11（CODE_FILL）

考查点：ps 与 grep 通过管道查找指定进程。

题目代码：

```bash
#!/bin/bash
# 查找 nginx 相关进程
__________ | grep nginx
```

标准答案：ps aux

完整代码：

```bash
#!/bin/bash
# 查找 nginx 相关进程
ps aux | grep nginx
```

解析：`ps aux` 列出所有进程，通过管道交给 `grep nginx` 过滤出包含 nginx 的行，快速定位目标进程及其 PID。注意结果中通常会包含 grep 自身进程，属于正常现象。

是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：code

#### 题目 12（CODE_FILL）

考查点：kill 发送强制终止信号。

题目代码：

```bash
#!/bin/bash
# 强制终止指定 PID 的无响应进程
PID=2345
kill __________ "$PID"
```

标准答案：-9

完整代码：

```bash
#!/bin/bash
# 强制终止指定 PID 的无响应进程
PID=2345
kill -9 "$PID"
```

解析：`kill -9` 发送 SIGKILL 信号强制终止进程，进程无法拦截会被内核直接杀死。应优先用 `kill -15` 优雅退出，确认进程无响应后再使用 -9。

是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：code

#### 题目 13（CODE_FILL）

考查点：systemctl 重启服务。

题目代码：

```bash
#!/bin/bash
# 重启 nginx 服务后查看状态
sudo systemctl __________ nginx
sudo systemctl status nginx
```

标准答案：restart

完整代码：

```bash
#!/bin/bash
# 重启 nginx 服务后查看状态
sudo systemctl restart nginx
sudo systemctl status nginx
```

解析：`systemctl restart` 会先停止再启动服务，常用于让修改后的配置生效。`reload` 只重载配置不中断服务，更适合不希望断开的场景，根据需要选择。

是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：code

#### 题目 14（CODE_FILL）

考查点：nohup 让任务脱离终端运行。

题目代码：

```bash
#!/bin/bash
# 后台运行备份脚本，关闭终端也不退出
__________ /home/student/backup.sh > /home/student/backup.log 2>&1 &
```

标准答案：nohup

完整代码：

```bash
#!/bin/bash
# 后台运行备份脚本，关闭终端也不退出
nohup /home/student/backup.sh > /home/student/backup.log 2>&1 &
```

解析：`nohup` 让进程忽略 SIGHUP 挂断信号，配合 `&` 放到后台，关闭终端后任务继续运行。`> log 2>&1` 把标准输出和错误输出都写入日志文件，便于事后查看。

是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：code

#### 题目 15（CODE_FILL）

考查点：journalctl 按服务实时查看日志。

题目代码：

```bash
#!/bin/bash
# 实时追踪 nginx 服务日志
journalctl __________ nginx -f
```

标准答案：-u

完整代码：

```bash
#!/bin/bash
# 实时追踪 nginx 服务日志
journalctl -u nginx -f
```

解析：`-u nginx` 指定只看 nginx 服务的日志，`-f` 类似 tail -f 实时输出新增内容，组合后可专注监控单一服务的运行状态，排查问题更高效。

是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：code