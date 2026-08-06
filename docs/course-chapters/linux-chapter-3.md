## 章节3：文件权限与用户管理

### 章节简介

本章节讲解 Linux 文件权限模型，包括 rwx 权限的含义、数字与符号两种表示方式、chmod 与 chown 命令的使用、umask 默认权限机制，以及用户与组的管理操作，涵盖 useradd、userdel、passwd、usermod、su、sudo 等命令和 /etc/passwd 文件结构。

### 预计学习时间

55 分钟

### 权限概念

Linux 中每个文件和目录都有一组权限属性，决定了谁能读取、修改或执行它。使用 `ls -l` 查看时，第一列共 10 个字符，结构如下：

```
- r w x  r w x  r w x
│ └──┬──┘└──┬──┘└──┬──┘
│   所有者   所属组   其他用户
│   (u)      (g)      (o)
文件类型
```

- 第 1 位：文件类型（`-` 普通文件，`d` 目录，`l` 符号链接）。
- 第 2-4 位：所有者（user，u）权限。
- 第 5-7 位：所属组（group，g）权限。
- 第 8-10 位：其他用户（other，o）权限。

```bash
# 查看文件权限
ls -l /home/student/report.txt
# 输出示例：-rw-r--r-- 1 student student 2048 Aug 5 10:00 report.txt
```

### rwx 对文件的含义

对于普通文件，rwx 的含义如下：

| 权限 | 含义 |
|------|------|
| r（read） | 可以读取文件内容（如 cat、less 查看文件） |
| w（write） | 可以修改文件内容（如编辑、追加） |
| x（execute） | 可以将文件作为程序执行 |

```bash
# 查看文件内容需要 r 权限
cat /home/student/report.txt

# 执行脚本需要 x 权限
/home/student/deploy.sh
```

### rwx 对目录的含义

对于目录，rwx 的含义与文件不同，需要重点辨析：

| 权限 | 含义 |
|------|------|
| r（read） | 可以列出目录内的文件名（如 ls） |
| w（write） | 可以在目录中增删文件或子目录（修改目录项） |
| x（execute） | 可以进入该目录（cd）并访问其中文件的属性 |

目录的 x 权限尤为关键：没有 x 权限即使有 r 权限也无法 `cd` 进入目录，只能看到文件名列表但无法获取文件详细信息。

```bash
# 列出目录内容需要目录的 r 权限
ls /home/student/projects

# 进入目录需要目录的 x 权限
cd /home/student/projects

# 在目录中创建文件需要目录的 w 权限
touch /home/student/projects/new_file.txt
```

### 权限数字表示

权限可以用数字表示，每个权限对应一个数值：

- r = 4
- w = 2
- x = 1

将同一身份（u/g/o）的三个权限值相加，得到一个 0-7 的数字。三组数字组合即为完整权限。常见组合：

| 数字 | 字符 | 含义 |
|------|------|------|
| 7 | rwx | 读+写+执行 |
| 6 | rw- | 读+写 |
| 5 | r-x | 读+执行 |
| 4 | r-- | 只读 |
| 0 | --- | 无权限 |

```bash
# 755 = rwxr-xr-x（所有者全部权限，组和其他用户读+执行）
# 644 = rw-r--r--（所有者读写，组和其他用户只读）
# 700 = rwx------（仅所有者全部权限）
```

### chmod 命令

`chmod`（change mode）用于修改文件或目录的权限，支持两种模式：

**数字模式**：直接使用三位数字设置 u/g/o 的权限。

```bash
# 设置权限为 755
chmod 755 /home/student/deploy.sh

# 设置权限为 644
chmod 644 /home/student/config.ini
```

**符号模式**：使用 `u/g/o/a`（all）、`+/-/=` 和 `r/w/x` 组合修改权限。

```bash
# 为所有者添加执行权限
chmod u+x /home/student/deploy.sh

# 为所有用户添加读权限
chmod a+r /home/student/config.ini

# 移除组用户的写权限
chmod g-w /home/student/config.ini

# 设置其他用户权限为只读
chmod o=r /home/student/config.ini
```

### chown 命令

`chown`（change owner）用于修改文件或目录的所有者和所属组。语法为 `chown 用户:组 文件`。

```bash
# 修改所有者
chown deployer /home/student/report.txt

# 同时修改所有者和所属组
chown deployer:devteam /home/student/report.txt

# 递归修改目录及其内容的所有者
chown -R deployer:devteam /home/student/projects
```

### umask

`umask` 是权限掩码，决定了新创建文件和目录的默认权限：

- 目录默认权限 = 777 - umask
- 文件默认权限 = 666 - umask

常见 umask 值为 022，则：

- 新建目录权限 = 777 - 022 = 755（rwxr-xr-x）
- 新建文件权限 = 666 - 022 = 644（rw-r--r--）

```bash
# 查看当前 umask 值
umask
# 输出：022

# 临时设置 umask 为 027
umask 027
```

### 用户与组概念

Linux 是多用户操作系统，每个用户有一个唯一的 UID（User ID），每个组有一个唯一的 GID（Group ID）。

- **用户**：系统的使用者，每个用户有自己的家目录和权限范围。
- **组**：用户的集合，方便批量管理权限。一个用户可以属于多个组。
- root 用户的 UID 为 0，拥有系统最高权限。

```bash
# 查看当前用户信息
id
# 输出示例：uid=1000(student) gid=1000(student) groups=1000(student),27(sudo)

# 查看当前用户名
whoami
```

### useradd / userdel / passwd / usermod

用户管理常用命令：

| 命令 | 功能 |
|------|------|
| `useradd` | 创建新用户 |
| `userdel` | 删除用户（`-r` 同时删除家目录） |
| `passwd` | 设置或修改用户密码 |
| `usermod` | 修改用户属性（如加入组、修改家目录） |

```bash
# 创建新用户 deployer
sudo useradd -m deployer

# 为 deployer 设置密码
sudo passwd deployer

# 将 deployer 加入 devteam 组
sudo usermod -aG devteam deployer

# 删除用户及其家目录
sudo userdel -r deployer
```

### su 与 sudo

`su` 和 `sudo` 都与权限切换有关，但机制不同：

- **su**（switch user）：切换到目标用户身份，需要输入目标用户的密码。`su -` 会同时切换环境变量到家目录。
- **sudo**：以其他用户（默认 root）身份执行单条命令，需要输入当前用户自己的密码，且当前用户需在 sudoers 列表中。

```bash
# 切换到 root 用户（需要 root 密码）
su -

# 切换到 deployer 用户
su - deployer

# 以 root 身份执行单条命令（需要当前用户密码）
sudo apt update

# 以 deployer 身份执行命令
sudo -u deployer /home/deployer/deploy.sh
```

### /etc/passwd 文件结构

`/etc/passwd` 存储了系统中所有用户的基本信息，每行一个用户，字段以 `:` 分隔：

```
用户名:密码占位:UID:GID:描述信息:家目录:登录Shell
```

```bash
# 查看 student 用户的信息
grep student /etc/passwd
# 输出示例：student:x:1000:1000:Student:/home/student:/bin/bash
```

以 `student:x:1000:1000:Student:/home/student:/bin/bash` 为例：

| 字段 | 值 | 含义 |
|------|-----|------|
| 用户名 | student | 登录名 |
| 密码占位 | x | 密码存储在 /etc/shadow 中 |
| UID | 1000 | 用户 ID |
| GID | 1000 | 主组 ID |
| 描述 | Student | 用户全名或备注 |
| 家目录 | /home/student | 用户家目录 |
| Shell | /bin/bash | 默认登录 Shell |

### groupadd / groupdel

组管理命令用于创建和删除用户组：

```bash
# 创建新组 devteam
sudo groupadd devteam

# 删除组 devteam
sudo groupdel devteam
```

[示例 title="权限与用户管理综合演示"]

```bash
# 创建部署脚本并设置可执行权限
touch /home/student/deploy.sh
chmod 755 /home/student/deploy.sh

# 创建新用户和组
sudo groupadd devteam
sudo useradd -m -G devteam deployer
sudo passwd deployer

# 将项目目录的所有者改为 deployer
sudo chown -R deployer:devteam /home/student/projects

# 查看修改后的权限
ls -ld /home/student/projects

# 查看 deployer 用户信息
grep deployer /etc/passwd

# 以 deployer 身份执行部署脚本
sudo -u deployer /home/student/deploy.sh
```

[提示 title="数字权限的快速计算"]

数字权限的每一位等于 rwx 各权限值之和。r=4、w=2、x=1，所以 rwx=7、rw-=6、r-x=5、r--=4。记忆时可以理解为"读是4、写是2、执行是1，加起来就是权限数字"。例如 755 就是所有者 rwx(7)、组 r-x(5)、其他 r-x(5)。

[提示 title="umask 计算的注意事项"]

umask 的计算不是简单的数学减法，而是按位相减（权限位与 umask 位取反后做与运算）。对于文件，基础权限是 666（文件默认没有执行权限），所以 umask 为 022 时文件权限为 644。如果 umask 中包含执行位（如 003），计算时需要注意文件基础值 666 中没有 x 位，因此 666 & ~003 = 664 而非 663。

[警告 title="chmod -R 与 chown -R 的递归影响"]

使用 `-R` 选项递归修改权限或所有者时，会影响目录下所有文件和子目录。对于目录和文件混存的情况，递归设置执行权限可能导致普通文件也获得执行权限，存在安全隐患。建议对目录和文件分别设置权限，或使用 `find` 配合 `-type` 精确控制：`find /path -type d -exec chmod 755 {} \;` 对目录设置 755，`find /path -type f -exec chmod 644 {} \;` 对文件设置 644。

### 章节题目

#### 题目 1（SINGLE_CHOICE）

题干：权限数字 755 对应的字符表示是什么？

- A. rwxrwxrwx
- B. rwxr-xr-x
- C. rw-r--r--
- D. rwx--x--x

正确答案：B

解析：数字权限中 r=4、w=2、x=1。755 中第一位 7=4+2+1=rwx（所有者），第二位 5=4+1=r-x（组），第三位 5=4+1=r-x（其他用户），因此 755 对应 rwxr-xr-x。选项 A 是 777，选项 C 是 644，选项 D 是 711。因此选项 B 正确。

是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：text

#### 题目 2（SINGLE_CHOICE）

题干：对于目录而言，x（执行）权限的含义是什么？

- A. 可以执行目录中的脚本文件
- B. 可以进入该目录并访问其中文件的属性信息
- C. 可以删除该目录
- D. 可以修改目录的名称

正确答案：B

解析：目录的 x 权限表示可以进入该目录（cd）并访问其中文件的属性。目录的 r 权限才能列出文件名，w 权限才能在目录中增删文件。目录本身没有"执行脚本"的概念。因此选项 B 正确，这也是目录权限与文件权限的关键区别之一。

是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：text

#### 题目 3（SINGLE_CHOICE）

题干：某系统的 umask 值为 022，在此环境下新建一个普通文件，其默认权限是什么？

- A. 755
- B. 644
- C. 666
- D. 777

正确答案：B

解析：文件的默认基础权限为 666（rw-rw-rw-，文件默认没有执行权限），减去 umask 022 后得到 666 - 022 = 644（rw-r--r--）。目录的默认基础权限为 777，减去 022 后为 755。题目问的是文件，因此答案为 644。因此选项 B 正确。

是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：text

#### 题目 4（SINGLE_CHOICE）

题干：在 `/etc/passwd` 文件中，每一行的第 3 个字段（以 `:` 分隔）表示什么？

- A. 用户名
- B. UID（用户 ID）
- C. GID（组 ID）
- D. 家目录路径

正确答案：B

解析：`/etc/passwd` 的字段格式为"用户名:密码占位:UID:GID:描述:家目录:Shell"。第 1 个字段是用户名，第 2 个字段是密码占位（x），第 3 个字段是 UID，第 4 个字段是 GID。因此第 3 个字段表示 UID（用户 ID），选项 B 正确。

是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：text

#### 题目 5（SINGLE_CHOICE）

题干：关于 `su` 和 `sudo` 的区别，下列说法正确的是？

- A. su 和 sudo 的功能完全相同，只是名称不同
- B. su 切换到目标用户身份并保持，sudo 以其他用户身份执行单条命令
- C. sudo 会永久切换用户身份直到退出
- D. su 只能执行单条命令然后自动退出

正确答案：B

解析：`su`（switch user）用于切换到目标用户的身份，切换后会保持在该用户下直到执行 exit 退出，需要输入目标用户的密码。`sudo` 用于以其他用户（通常是 root）身份执行单条命令，执行完毕后回到原用户身份，需要输入当前用户自己的密码。因此选项 B 正确。

是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：text

#### 题目 6（FILL_BLANK）

题干：在权限数字表示中，r 的值为 __________，w 的值为 2，x 的值为 1。

acceptedAnswers：
- 4
- 四

判题设置：忽略大小写，去除首尾空格，任一答案匹配即正确。

解析：权限数字表示法中，r（read）=4，w（write）=2，x（execute）=1。将同一身份的权限值相加得到 0-7 的数字。例如 rwx=4+2+1=7，r-x=4+0+1=5，rw-=4+2+0=6。三组数字按所有者、组、其他用户的顺序排列，如 755 表示 rwxr-xr-x。

是否用于 Battle：否
Battle 难度：EASY
Battle 展示类型：text

#### 题目 7（FILL_BLANK）

题干：使用 __________ 命令可以修改文件或目录的权限。

acceptedAnswers：
- chmod
- chmod命令

判题设置：忽略大小写，去除首尾空格，任一答案匹配即正确。

解析：`chmod`（change mode）用于修改文件或目录的权限，支持数字模式（如 `chmod 755 file`）和符号模式（如 `chmod u+x file`）两种方式。数字模式直接设置完整权限，符号模式可以在现有权限基础上增减指定权限。

是否用于 Battle：否
Battle 难度：EASY
Battle 展示类型：text

#### 题目 8（FILL_BLANK）

题干：`chown` 命令用于修改文件的 __________ 和所属组。

acceptedAnswers：
- 所有者
- 属主
- 所有者（owner）
- owner

判题设置：忽略大小写，去除首尾空格，任一答案匹配即正确。

解析：`chown`（change owner）用于修改文件或目录的所有者（属主）和所属组。语法为 `chown 用户:组 文件`，可以只修改所有者（`chown user file`），也可以同时修改所有者和组（`chown user:group file`）。加 `-R` 选项可递归修改目录下所有内容。

是否用于 Battle：否
Battle 难度：EASY
Battle 展示类型：text

#### 题目 9（FILL_BLANK）

题干：在 Linux 系统中，root 用户的 UID 通常是 __________。

acceptedAnswers：
- 0
- 零

判题设置：忽略大小写，去除首尾空格，任一答案匹配即正确。

解析：Linux 系统中 root 用户的 UID 固定为 0，拥有系统最高权限。普通用户的 UID 通常从 1000 开始分配（不同发行版可能不同）。系统用户的 UID 一般在 1-999 之间，用于运行系统服务。可以通过 `id` 命令查看用户的 UID。

是否用于 Battle：否
Battle 难度：EASY
Battle 展示类型：text

#### 题目 10（FILL_BLANK）

题干：新建文件的默认权限由基础值 666 减去 __________ 值得到。

acceptedAnswers：
- umask
- umask值
- 权限掩码
- 掩码

判题设置：忽略大小写，去除首尾空格，任一答案匹配即正确。

解析：umask（用户文件创建掩码）决定了新文件和目录的默认权限。文件的基础权限为 666，目录的基础权限为 777，分别减去 umask 值得到实际默认权限。例如 umask 为 022 时，新文件权限为 666-022=644，新目录权限为 777-022=755。可以使用 `umask` 命令查看和设置。

是否用于 Battle：否
Battle 难度：EASY
Battle 展示类型：text

#### 题目 11（CODE_FILL）

考查点：使用 chmod 数字模式设置文件权限为 755。

题目代码：

```bash
# 将 /home/student/deploy.sh 的权限设置为 755
chmod __________ /home/student/deploy.sh
```

标准答案：755

完整代码：

```bash
# 将 /home/student/deploy.sh 的权限设置为 755
chmod 755 /home/student/deploy.sh
```

解析：`chmod` 的数字模式中，755 表示所有者 rwx（7=4+2+1）、组 r-x（5=4+1）、其他用户 r-x（5=4+1）。这是脚本文件常用的权限设置，所有者可读写执行，其他用户可读和执行但不能修改。

是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：code

#### 题目 12（CODE_FILL）

考查点：使用 chown 命令同时修改文件的所有者和所属组。

题目代码：

```bash
# 将 /home/student/report.txt 的属主改为 deployer，属组改为 devteam
chown __________:devteam /home/student/report.txt
```

标准答案：deployer

完整代码：

```bash
# 将 /home/student/report.txt 的属主改为 deployer，属组改为 devteam
chown deployer:devteam /home/student/report.txt
```

解析：`chown` 命令使用 `用户:组` 的格式同时修改所有者和所属组。`chown deployer:devteam file` 将文件的所有者设为 deployer、所属组设为 devteam。冒号前是用户名，冒号后是组名。如果只写 `chown deployer file` 则只修改所有者不修改组。

是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：code

#### 题目 13（CODE_FILL）

考查点：使用 useradd 命令创建新用户。

题目代码：

```bash
# 创建新用户 deployer 并自动创建家目录
sudo useradd -m __________
```

标准答案：deployer

完整代码：

```bash
# 创建新用户 deployer 并自动创建家目录
sudo useradd -m deployer
```

解析：`useradd` 命令用于创建新用户，`-m` 选项表示同时创建用户的家目录。`useradd -m deployer` 会创建用户 deployer 并在 /home/deployer 创建家目录。创建用户后还需要使用 `passwd` 命令设置密码才能登录。由于创建用户需要 root 权限，前面加了 sudo。

是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：code

#### 题目 14（CODE_FILL）

考查点：使用 chmod 符号模式为所有用户添加执行权限。

题目代码：

```bash
# 为所有用户添加 deploy.sh 的执行权限
chmod __________ /home/student/deploy.sh
```

标准答案：a+x

完整代码：

```bash
# 为所有用户添加 deploy.sh 的执行权限
chmod a+x /home/student/deploy.sh
```

解析：`chmod` 的符号模式中，`a` 表示所有用户（all，等价于 ugo），`+` 表示添加权限，`x` 表示执行权限。`chmod a+x` 为所有用户添加执行权限。也可以简写为 `chmod +x`，效果相同。与之相对，`a-x` 表示移除所有用户的执行权限。

是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：code

#### 题目 15（CODE_FILL）

考查点：使用 passwd 命令为指定用户设置密码。

题目代码：

```bash
# 为用户 deployer 设置登录密码
sudo __________ deployer
```

标准答案：passwd

完整代码：

```bash
# 为用户 deployer 设置登录密码
sudo passwd deployer
```

解析：`passwd` 命令用于设置或修改用户密码。`passwd deployer` 会提示输入 deployer 用户的新密码。普通用户只能修改自己的密码（直接输入 `passwd` 不带用户名），修改其他用户的密码需要 root 权限，因此使用 `sudo passwd deployer`。设置密码后用户才能通过密码登录系统。

是否用于 Battle：是
Battle 难度：EASY
Battle 展示类型：code

---