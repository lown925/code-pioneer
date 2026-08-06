## 章节 6：软件包管理、网络与磁盘基础

### 章节简介

本章节覆盖运维三大基础领域：软件安装、网络配置与磁盘管理。你将学会用 `apt`/`yum` 安装软件，用 `ping`、`ss`、`curl` 排查网络问题，用 `ssh`/`scp` 远程操作服务器，并用 `df`、`du`、`ln`、`mount` 管理磁盘与文件链接，理解 inode 的作用。

### 预计学习时间

100 分钟

### 软件包管理概念

Linux 软件以"包"形式分发，由包管理器负责安装、升级与卸载。Debian 系（Ubuntu、Debian）使用高层工具 `apt` 与底层工具 `dpkg`；RedHat 系（CentOS、RHEL）使用 `yum`/`dnf` 与底层工具 `rpm`。高层工具会自动处理依赖关系，底层工具只操作单个包。

```bash
# 查看系统属于哪个发行版（判断用 apt 还是 yum）
cat /etc/os-release
```

### apt 包管理

`apt` 是 Debian 系的高层包管理器。`apt update` 更新软件包列表（不安装）、`apt upgrade` 升级已安装的包、`apt install` 安装、`apt remove` 卸载、`apt search` 搜索。安装前通常先 `update` 刷新列表。

```bash
# 更新软件包列表
sudo apt update

# 安装 nginx
sudo apt install nginx

# 搜索关键词相关的包
apt search text editor
```

### yum 与 dnf

`yum` 是 RedHat/CentOS 系的包管理器，`dnf` 是其新一代替代。常用 `install` 安装、`update` 升级、`remove` 卸载、`list` 列出包信息，用法与 apt 类似但命令不同。

```bash
# 安装 httpd（CentOS 上的 Apache）
sudo yum install httpd

# 使用 dnf 升级所有包
sudo dnf update

# 列出已安装的包
yum list installed | grep httpd
```

### dpkg 与 rpm

`dpkg` 和 `rpm` 是底层包管理工具，直接操作 `.deb` 和 `.rpm` 包文件，不自动解决依赖。适合安装本地下载好的包，或在高层工具不可用时使用。

```bash
# 安装本地 deb 包
sudo dpkg -i /home/student/package.deb

# 查看 rpm 包信息
rpm -qpi /home/student/package.rpm
```

### 网络接口查看

`ifconfig` 是传统命令查看网卡 IP 地址等信息，部分新系统已不预装。`ip addr` 是现代替代命令，功能更强，推荐使用。

```bash
# 现代方式查看网卡 IP
ip addr

# 传统方式查看网络接口
ifconfig
```

### ping 连通性测试

`ping` 通过发送 ICMP 包测试本机与目标主机之间的网络连通性，会持续发送直到按 `Ctrl+C` 中断。常用于排查网络是否可达及延迟情况。

```bash
# 测试与网关的连通性（限 4 次）
ping -c 4 192.168.1.1

# 测试外网连通性
ping -c 4 8.8.8.8
```

### netstat 与 ss

`netstat` 和 `ss` 用于查看网络连接与端口监听。`ss` 是 netstat 的现代替代，速度更快。常用 `ss -tlnp` 查看 TCP 监听端口及占用进程，是排查服务是否正常监听的关键命令。

```bash
# 查看所有 TCP 监听端口及进程
sudo ss -tlnp

# 传统方式查看监听端口
sudo netstat -tlnp
```

### curl 与 wget

`curl` 用于发起 HTTP 请求并显示响应，适合调试接口；`wget` 侧重于下载文件，支持断点续传。两者都是命令行下访问网络的常用工具。

```bash
# 测试 Web 服务是否正常响应
curl -I http://localhost

# 下载远程文件
wget -O /home/student/installer.tar.gz https://example.com/file.tar.gz
```

### ssh 远程连接

`ssh` 用于安全地远程登录和管理服务器，默认端口 22，用 `-p` 指定其他端口。`scp` 基于 ssh 协议在本地与远程之间复制文件，是远程传输的常用方式。

```bash
# 远程登录服务器
ssh student@192.168.1.10

# 指定端口连接
ssh -p 2222 student@192.168.1.10

# 把本地文件传到远程服务器
scp /home/student/report.txt student@192.168.1.10:/home/student/
```

### df 磁盘使用情况

`df` 显示各文件系统的磁盘使用情况。`-h` 以人类可读的单位（KB/MB/GB）显示容量，是日常查看磁盘空间是否充足的首选命令。

```bash
# 人性化显示磁盘使用情况
df -h

# 只看特定分区
df -h /home
```

### du 目录占用

`du` 统计目录或文件占用的磁盘空间。`-h` 人性化显示，`-s` 只显示汇总大小不列出子目录，组合 `-sh` 常用于查看某个目录的总占用。

```bash
# 查看项目目录总占用
du -sh /home/student/project

# 列出各子目录大小并排序
du -h /home/student/project | sort -h
```

### 软硬链接 ln

`ln -s 源文件 链接名` 创建软链接（符号链接），类似快捷方式，可跨分区、可链接目录，但源文件删除后链接失效。`ln 源文件 链接名` 创建硬链接，与源文件共享同一个 inode，不可跨分区、不可链接目录，但删除源文件后硬链接仍能访问数据。

```bash
# 创建软链接（源删后失效）
ln -s /home/student/app.conf /home/student/link.conf

# 创建硬链接（源删后仍可访问）
ln /home/student/data.txt /home/student/data_hard.txt

# 查看文件 inode 验证硬链接共享
ls -i /home/student/data.txt /home/student/data_hard.txt
```

### mount 与 umount

`mount` 把外部设备（如 U 盘、新硬盘）挂载到目录树某个挂载点才能访问，`umount` 卸载。挂载是 Linux 访问新文件系统的前提，操作前需创建挂载点目录。

```bash
# 创建挂载点并挂载 U 盘
sudo mkdir -p /mnt/usb
sudo mount /dev/sdb1 /mnt/usb

# 使用完毕后卸载
sudo umount /mnt/usb
```

### inode 概念

inode（索引节点）是文件系统中存储文件元数据的数据结构，记录文件大小、权限、时间戳及数据块位置，但不包含文件名。每个文件对应一个 inode 编号，硬链接正是通过指向同一 inode 实现数据共享。inode 数量有限，耗尽后即使磁盘有空间也无法创建新文件。

```bash
# 查看文件的 inode 编号
ls -i /home/student/data.txt

# 查看文件系统 inode 使用情况
df -i
```

### 示例

[示例 title="部署并验证 Web 服务端口"]

安装 nginx 后，验证服务是否正常监听端口并能响应请求。

```bash
#!/bin/bash
# 安装、启动并验证 Web 服务
sudo apt update && sudo apt install -y nginx
sudo systemctl start nginx

echo "=== 端口监听情况 ==="
sudo ss -tlnp | grep ':80'

echo "=== HTTP 响应测试 ==="
curl -I http://localhost

echo "=== 磁盘占用 ==="
du -sh /var/log/nginx
```

### 提示

[提示 title="用 ss 替代 netstat"]

`ss` 命令比 `netstat` 速度快、信息全，且多数现代发行版默认预装，排查端口监听时优先使用 `ss -tlnp`，netstat 仅作兼容备用。

[提示 title="df -i 检查 inode 耗尽"]

当磁盘空间充足却无法创建文件时，可能是 inode 耗尽，用 `df -i` 查看各分区 inode 使用率，找出小文件过多的目录清理即可。

### 警告

[警告 title="软链接源文件删除会失效"]

软链接只保存源文件路径，一旦源文件被删除或移动，软链接即变成无效的"断链"，访问会报错。使用软链接时务必保证源路径稳定，建议用绝对路径创建。

[警告 title="卸载设备前不要在挂载目录内操作"]

执行 `umount` 时若当前正处于挂载目录内，系统会报 "device is busy" 错误。需先 `cd` 离开挂载目录，确认无进程占用后再卸载。

### 章节题目

#### 题目 1（SINGLE_CHOICE）

题干：Debian/Ubuntu 系统中用于高层软件包管理的命令是？

- A. yum
- B. apt
- C. rpm
- D. dnf

正确答案：B

解析：`apt` 是 Debian 系的高层包管理器，能自动处理依赖关系，用于 install/update/upgrade/remove 等操作。`yum`/`dnf` 属于 RedHat 系，`rpm` 是 RedHat 系的底层工具，不自动解决依赖。

是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：text

#### 题目 2（SINGLE_CHOICE）

题干：`df -h` 命令中 `-h` 选项的作用是？

- A. 显示帮助信息
- B. 以人类可读的单位显示容量
- C. 隐藏挂载点
- D. 汇总所有分区

正确答案：B

解析：`-h`（human-readable）把容量转换为 KB、MB、GB 等易读单位显示，便于直观判断磁盘使用情况。不加 `-h` 时容量以 1K 字节块为单位显示，不直观。

是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：text

#### 题目 3（SINGLE_CHOICE）

题干：创建软链接（符号链接）的命令是？

- A. ln /home/student/a.conf /home/student/b.conf
- B. ln -s /home/student/a.conf /home/student/b.conf
- C. cp -s /home/student/a.conf /home/student/b.conf
- D. link -s /home/student/a.conf /home/student/b.conf

正确答案：B

解析：`ln -s 源 链接` 创建软链接，`-s` 表示 symbolic（符号链接）。不带 `-s` 的 `ln` 创建的是硬链接。`cp -s` 也能创建符号链接副本但语义不同，`link` 不是标准命令。

是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：text

#### 题目 4（SINGLE_CHOICE）

题干：测试本机与远程主机之间网络连通性的命令是？

- A. curl
- B. ping
- C. ssh
- D. ss

正确答案：B

解析：`ping` 通过发送 ICMP 回显请求包测试网络是否可达及延迟，是连通性诊断的基础命令。`curl` 测试 HTTP 服务，`ssh` 远程登录，`ss` 查看端口监听，都不直接测试网络层连通性。

是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：text

#### 题目 5（SINGLE_CHOICE）

题干：关于软链接的描述，正确的是？

- A. 与源文件共享同一个 inode
- B. 不能跨分区创建
- C. 不能链接目录
- D. 类似快捷方式，可跨分区，源文件删除后链接失效

正确答案：D

解析：软链接（符号链接）是一个独立文件，存储源文件路径，类似快捷方式，可跨分区、可链接目录，但源文件删除后链接失效。共享 inode、不可跨分区、不可链接目录这些都是硬链接的特征，不是软链接。

是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：text

#### 题目 6（FILL_BLANK）

题干：统计某个目录总占用磁盘空间的命令是 __________（两个字母）。

acceptedAnswers：
- du

判题设置：忽略大小写，去除首尾空格，任一答案匹配即正确。

解析：`du`（disk usage）统计目录或文件占用的磁盘空间，配合 `-sh` 可只显示汇总大小。`df` 显示的是整个文件系统的使用情况，二者侧重点不同。

是否用于 Battle：否
Battle 难度：EASY
Battle 展示类型：text

#### 题目 7（FILL_BLANK）

题干：远程安全登录到服务器的命令是 __________（三个字母）。

acceptedAnswers：
- ssh
- SSH

判题设置：忽略大小写，去除首尾空格，任一答案匹配即正确。

解析：`ssh 用户名@IP` 通过加密通道远程登录和管理服务器，默认端口 22，用 `-p` 可指定其他端口。它是运维远程操作服务器的核心工具，配合 scp 可安全传输文件。

是否用于 Battle：否
Battle 难度：EASY
Battle 展示类型：text

#### 题目 8（FILL_BLANK）

题干：netstat 的新一代替代命令，用于查看网络连接与端口监听的是 __________（两个字母）。

acceptedAnswers：
- ss
- SS

判题设置：忽略大小写，去除首尾空格，任一答案匹配即正确。

解析：`ss` 是 socket statistics 的缩写，速度比 netstat 快且信息更全，多数现代发行版默认预装。常用 `ss -tlnp` 查看 TCP 监听端口及对应进程，是排查服务监听状态的利器。

是否用于 Battle：否
Battle 难度：EASY
Battle 展示类型：text

#### 题目 9（FILL_BLANK）

题干：硬链接与源文件共享的底层数据结构称为 __________（英文单词）。

acceptedAnswers：
- inode
- inode节点
- 索引节点

判题设置：忽略大小写，去除首尾空格，任一答案匹配即正确。

解析：inode（索引节点）存储文件元数据与数据块位置，每个文件对应一个 inode 编号。硬链接正是多个文件名指向同一 inode，所以删除源文件后数据仍可通过硬链接访问。

是否用于 Battle：否
Battle 难度：EASY
Battle 展示类型：text

#### 题目 10（FILL_BLANK）

题干：在 apt 安装软件前，刷新本地软件包列表所用的子命令是 apt __________。

acceptedAnswers：
- update

判题设置：忽略大小写，去除首尾空格，任一答案匹配即正确。

解析：`apt update` 从配置的软件源下载最新的包索引列表，本身不安装任何软件，但能让后续 install 获取到最新版本。注意 `update` 与 `upgrade` 的区别：前者刷新列表，后者执行升级。

是否用于 Battle：否
Battle 难度：EASY
Battle 展示类型：text

#### 题目 11（CODE_FILL）

考查点：apt 安装指定软件包。

题目代码：

```bash
#!/bin/bash
# 安装 nginx Web 服务器
sudo apt __________ nginx
```

标准答案：install

完整代码：

```bash
#!/bin/bash
# 安装 nginx Web 服务器
sudo apt install nginx
```

解析：`apt install 包名` 从软件源安装指定包并自动处理依赖。安装前建议先执行 `apt update` 刷新包列表，确保获取到最新版本，避免因索引过期导致找不到包。

是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：code

#### 题目 12（CODE_FILL）

考查点：ssh 指定端口远程连接。

题目代码：

```bash
#!/bin/bash
# 以非默认端口连接远程服务器
ssh __________ 2222 student@192.168.1.10
```

标准答案：-p

完整代码：

```bash
#!/bin/bash
# 以非默认端口连接远程服务器
ssh -p 2222 student@192.168.1.10
```

解析：`-p` 指定 ssh 连接的端口号，当服务器 sshd 监听非 22 端口时必须使用。注意 scp 指定端口的选项是大写 `-P`，两者容易混淆。

是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：code

#### 题目 13（CODE_FILL）

考查点：du 汇总目录占用大小。

题目代码：

```bash
#!/bin/bash
# 查看项目目录总占用空间
du __________ /home/student/project
```

标准答案：-sh

完整代码：

```bash
#!/bin/bash
# 查看项目目录总占用空间
du -sh /home/student/project
```

解析：`-s` 只显示汇总大小不列出子目录明细，`-h` 以人类可读单位显示，组合 `-sh` 是查看目录总占用的最常用写法。若需定位大文件可去掉 `-s` 配合 `sort -h` 排序。

是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：code

#### 题目 14（CODE_FILL）

考查点：ln 创建软链接。

题目代码：

```bash
#!/bin/bash
# 为配置文件创建软链接
ln __________ /home/student/app.conf /home/student/link.conf
```

标准答案：-s

完整代码：

```bash
#!/bin/bash
# 为配置文件创建软链接
ln -s /home/student/app.conf /home/student/link.conf
```

解析：`-s` 创建符号链接（软链接），类似快捷方式，可跨分区链接。注意第一个参数是源文件、第二个是链接名顺序，写反会导致链接指向错误；建议源路径使用绝对路径以保证稳定。

是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：code

#### 题目 15（CODE_FILL）

考查点：df 人性化查看磁盘使用。

题目代码：

```bash
#!/bin/bash
# 以人类可读方式查看磁盘使用情况
df __________
```

标准答案：-h

完整代码：

```bash
#!/bin/bash
# 以人类可读方式查看磁盘使用情况
df -h
```

解析：`-h` 把容量转为 KB/MB/GB 显示，直观判断各分区剩余空间。排查"磁盘满"问题时还可配合 `df -i` 检查 inode 是否耗尽，二者结合能定位大多数空间异常。

是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：code

---

## 章节总结

本章节通过 6 个章节系统讲解了 Linux 基础运维知识，覆盖 12 个核心知识领域。以下是各领域要点的整体回顾。

### 1. Linux 系统概览与基础命令

Linux 是多用户多任务的开源操作系统，以命令行为核心交互方式。掌握了终端基本操作、命令格式（命令 + 选项 + 参数）、联机帮助 `man`、`--help`，以及关机重启等基础命令，为后续学习奠定操作基础。

### 2. 文件与目录操作

Linux 采用单根目录树结构，一切皆文件。重点掌握路径概念（绝对路径与相对路径）、`pwd`/`cd` 切换目录、`ls` 查看内容、`mkdir`/`touch` 创建、`cp`/`mv`/`rm` 复制移动删除、`find` 按条件查找文件。理解 `.`、`..`、`~` 等特殊路径的含义。

### 3. 用户与用户组管理

Linux 通过用户和用户组实现多用户隔离。掌握 `useradd`/`userdel`/`passwd` 管理用户，`groupadd`/`gpasswd` 管理用户组，`su`/`sudo` 切换身份与提权，`id`/`whoami` 查看身份信息，理解 root 超级用户与普通用户的区别。

### 4. 文件权限管理

每个文件有读（r=4）、写（w=2）、执行（x=1）三类权限，分别对应所有者、所属组、其他人。掌握 `chmod` 修改权限（字母法与数字法）、`chown` 修改所有者、`umask` 设定默认权限，理解权限对目录与文件的不同含义。

### 5. 文本查看与处理

掌握 `cat`/`head`/`tail`/`less` 查看文件内容，`grep` 按模式搜索文本，管道符 `|` 组合命令，重定向 `>`/`>>`/`2>`/`&>` 控制输出流向，`/dev/null` 丢弃输出。这是日志排查与数据处理的基础能力。

### 6. vim 编辑器

vim 三种模式（命令/插入/末行）切换是核心。掌握 `i`/`a`/`o` 进入插入、`Esc` 回命令模式、`:wq` 保存退出、`:q!` 强制退出、`dd`/`yy`/`p` 编辑操作、`/` 搜索。vim 是 Linux 下编辑配置文件的标准工具。

### 7. Shell 脚本基础

掌握 shebang `#!/bin/bash`、脚本执行方式、自定义变量与 `export` 环境变量、位置参数 `$1`/`$#`/`$@`/`$?`、`read` 读取输入、`if`/`test`/`[ ]` 条件判断（含文件测试 `-f`/`-d`/`-e`）、`for`/`while` 循环。能编写小型自动化脚本完成批量任务。

### 8. 进程管理

理解进程、PID、PPID 概念及前台/后台/守护进程三类。掌握 `ps aux`/`ps -ef` 查看进程、`top` 实时监控、`kill`/`kill -9`/`killall`/`pkill` 终止进程、`jobs`/`bg`/`fg`/`Ctrl+Z` 管理前后台任务、`nohup` 脱离终端运行。

### 9. 系统服务管理

systemd 是主流初始化系统。掌握 `systemctl` 的 start/stop/restart/status/enable/disable 管理服务与开机自启，`service` 旧式兼容命令，`journalctl` 按服务/时间查看日志，`cron`/`crontab` 定时任务实现周期性自动执行。

### 10. 软件包管理

理解高层与底层包管理的区别。Debian 系用 `apt`（install/update/upgrade/remove/search）配合 `dpkg`，RedHat 系用 `yum`/`dnf` 配合 `rpm`。高层工具自动解决依赖，底层工具操作本地包文件。

### 11. 网络配置基础

掌握 `ifconfig`/`ip addr` 查看网卡、`ping` 测试连通性、`netstat`/`ss -tlnp` 查看端口监听、`curl`/`wget` 发起 HTTP 请求与下载、`ssh`/`scp` 远程登录与文件传输。这是网络服务部署与故障排查的核心能力。

### 12. 文件系统与磁盘

掌握 `df -h` 查看磁盘使用、`du -sh` 统计目录占用、`ln -s` 软链接与 `ln` 硬链接的区别（软链接可跨分区可链目录源删失效，硬链接共享 inode 不可跨分区不可链目录源删不丢失）、`mount`/`umount` 挂载卸载设备、inode 概念及其耗尽问题。

### 学习路线建议

6 个章节构成了一条从"认识系统"到"独立运维"的完整路径：先熟悉系统与文件操作，再掌握权限与用户隔离，接着用文本处理与脚本实现自动化，然后管理运行中的进程与服务，最后处理软件安装、网络与磁盘。建议在每个知识点上多动手实践，结合综合挑战将零散命令串联成完整的运维能力。


---

## 综合挑战

### 挑战场景：为新服务器部署并监控一个 Web 应用

你是一名刚入职的运维工程师，公司分配了一台全新的 Linux 服务器（Ubuntu 系统），要求你在上面部署一个 Web 应用并配置基础监控。整个任务需要综合运用前 6 个章节学到的全部知识，按以下 6 个阶段完成，每个阶段给出具体命令与验收标准。

### 阶段一：系统确认（章节 1）

登录服务器后，先确认系统环境，记录基本信息以便后续配置。

```bash
# 查看系统发行版与版本
cat /etc/os-release

# 查看内核版本
uname -r

# 查看主机名
hostname

# 查看磁盘整体空间，确认有足够容量
df -h
```

验收标准：能口述系统发行版名称、内核版本、主机名，且根分区剩余空间大于 5GB。

### 阶段二：目录与文件准备（章节 2）

创建应用所需的项目目录结构，并准备配置文件。

```bash
# 进入家目录
cd /home/student

# 一次性创建多级项目目录
mkdir -p webapp/{conf,logs,data,backup}

# 查看目录结构确认
ls -R webapp

# 创建初始配置文件
touch webapp/conf/app.conf

# 查找系统中已有的 nginx 配置作为参考
find /etc -name "nginx.conf" 2>/dev/null
```

验收标准：`webapp` 下包含 conf、logs、data、backup 四个子目录，且 `app.conf` 文件存在。

### 阶段三：用户与权限设置（章节 3）

为应用创建专用用户，并将目录所有权与权限设置到位，保证安全。

```bash
# 创建专用系统用户 webuser
sudo useradd -r -m -s /bin/bash webuser

# 设置用户密码
sudo passwd webuser

# 把项目目录所有者改为 webuser
sudo chown -R webuser:webuser /home/student/webapp

# 设置目录权限：所有者可读写执行，其他人只读执行
sudo chmod -R 750 /home/student/webapp

# 确认权限设置
ls -ld /home/student/webapp
```

验收标准：`webuser` 用户创建成功，`webapp` 目录属主为 webuser，权限为 `rwxr-x---`。

### 阶段四：编写部署与监控脚本（章节 4）

用 vim 编写一个 Shell 脚本，统计 Web 日志中的错误并生成报告，体现文本处理与脚本能力。

```bash
# 用 vim 编辑脚本
vim /home/student/webapp/monitor.sh
```

脚本内容如下：

```bash
#!/bin/bash
# Web 应用日志监控脚本
app_dir="/home/student/webapp"
log_file="$app_dir/logs/access.log"
report="$app_dir/logs/error_report.txt"

if [ ! -f "$log_file" ]; then
    echo "日志文件不存在，请先启动应用" | tee -a "$report"
    exit 1
fi

error_count=$(grep -ci "error" "$log_file")
echo "===== 监控报告 =====" > "$report"
echo "生成时间: $(date)" >> "$report"
echo "错误总数: $error_count" >> "$report"
echo "最近 5 条错误:" >> "$report"
grep -i "error" "$log_file" | tail -n 5 >> "$report"
echo "报告已生成: $report"
```

```bash
# 赋予执行权限
chmod +x /home/student/webapp/monitor.sh

# 执行脚本测试
/home/student/webapp/monitor.sh
```

验收标准：脚本可正常执行，当日志存在时生成 `error_report.txt`，当日志不存在时给出提示并以非 0 状态退出。

### 阶段五：安装服务并管理进程（章节 5）

安装 nginx 作为 Web 服务器，启动服务并配置后台监控任务。

```bash
# 更新包列表并安装 nginx
sudo apt update && sudo apt install -y nginx

# 启动 nginx 并设置开机自启
sudo systemctl start nginx
sudo systemctl enable nginx

# 确认服务状态
sudo systemctl status nginx --no-pager

# 查找 nginx 工作进程
ps aux | grep nginx

# 用 nohup 在后台持续运行监控脚本，关闭终端也不退出
nohup /home/student/webapp/monitor.sh > /home/student/webapp/logs/monitor_run.log 2>&1 &

# 查看后台任务
jobs -l
```

验收标准：nginx 服务处于 active（running）状态，`ps` 能查到 nginx 进程，监控脚本在后台运行且 `jobs` 中可见。

### 阶段六：网络验证与磁盘检查（章节 6）

验证 Web 服务可访问，检查网络端口与磁盘占用，确保部署完整。

```bash
# 测试本机 Web 服务响应
curl -I http://localhost

# 查看 80 端口监听情况
sudo ss -tlnp | grep ':80'

# 测试与网关的连通性
ping -c 4 192.168.1.1

# 查看 nginx 日志目录占用空间
sudo du -sh /var/log/nginx

# 查看整体磁盘使用
df -h

# 为监控报告创建软链接便于快速访问
ln -s /home/student/webapp/logs/error_report.txt /home/student/latest_report.txt
```

验收标准：`curl -I` 返回 HTTP 200，`ss` 显示 80 端口被 nginx 监听，`ping` 网关可达，能查看日志目录占用，软链接 `latest_report.txt` 可正确访问到报告内容。

### 挑战总结

本综合挑战将 6 个章节的知识串联成一条完整运维流程：系统确认（章节 1）→ 文件目录操作（章节 2）→ 用户权限（章节 3）→ 文本处理与脚本（章节 4）→ 进程与服务管理（章节 5）→ 软件包与网络磁盘（章节 6）。完成全部阶段后，你应能独立在一台新服务器上完成 Web 应用的部署、监控与基础运维，具备初级 Linux 运维工程师的核心实操能力。
