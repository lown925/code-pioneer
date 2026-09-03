# 第10章：网络编程、诊断与综合分析

章节简介：把socket和常用诊断工具串成一套分层故障定位方法。
预计学习时间：90 分钟

章节学习目标：
- 理解并能应用socket 的端点概念
- 理解并能应用客户端服务器模型
- 理解并能应用ping 能说明什么、不能说明什么
- 理解并能应用traceroute 看路径
- 理解并能应用nslookup / dig 查 DNS
- 理解并能应用用分层方法定位网络故障

[标题]
本章统一场景

[文本]
本章假设用户反馈“https://api.example.com 打不开”，每课提供一种证据。

---

## 课时 1：socket 的端点概念

课时简介：把应用程序和传输层连接起来。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
程序不能直接“拿TCP来用”而没有端点。Socket是操作系统提供给应用的通信抽象，绑定地址/端口并提供send/recv等接口。

[标题]
先建立一个能看见的模型

[文本]
服务器socket可bind `0.0.0.0:8080`、listen；客户端connect到serverIP:8080；accept后服务器得到一个连接socket，和监听socket职责不同。

[代码 language=text]
Server:
socket → bind :8080 → listen → accept
                                   ↓
                            connected socket
Client:
socket → connect server:8080
[/代码]

[文本]
监听socket负责接新连接，连接socket负责与一个具体客户端传数据。

[示例 title=最小可验证示例]
说明：用最小输入观察本课核心规则。
语言：text

Server:
socket → bind :8080 → listen → accept
                                   ↓
                            connected socket
Client:
socket → connect server:8080
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数字、名称或输入换掉，再独立推导一次。如果还能解释每一步，说明你理解的是规则而不是答案。

[警告 title=常见错误]
把一个listen socket当作“只能服务一个客户端”。accept可以产生多个连接socket。

[标题]
本课小结

[文本]
能解释socket、listen和accept。

### 课时题目

#### 题目 1

题型：SINGLE_CHOICE
题干：服务器 `listen` socket主要负责什么？

难度：EASY
分值：10
知识点：socket
是否用于 Battle：否

选项：
- A. 等待/接收新连接 [正确]
- B. 保存所有网页文件
- C. 做DNS解析
- D. 路由IP包

解析：
监听端点接连接。

#### 题目 2

题型：SINGLE_CHOICE
题干：accept成功后通常得到什么？

难度：MEDIUM
分值：10
知识点：socket
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：场景判断

选项：
- A. 用于与具体客户端通信的新连接socket [正确]
- B. 新的IP网络
- C. 新的网卡
- D. DNS根服务器

解析：
监听与已连接socket分离。

#### 题目 3

题型：SINGLE_CHOICE
题干：为什么同一服务器端口可以并发多个TCP客户端？

难度：HARD
分值：10
知识点：socket并发
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：场景判断

选项：
- A. 监听端口可accept出多个由四元组区分的连接 [正确]
- B. 端口会自动复制成不同数字
- C. IP会变成MAC
- D. 每个客户端重启服务器

解析：
连接由四元组区分。


---

## 课时 2：客户端服务器模型

课时简介：理解谁先监听、谁主动发起连接。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
典型客户端/服务器不是“客户端更弱、服务器更强”，而是角色：服务器在已知地址提供服务并等待，客户端按需主动连接。

[标题]
先建立一个能看见的模型

[文本]
Web服务器监听443；浏览器解析IP后主动connect。连接建立后双方都可以发送数据，角色并不意味着服务器只能发、客户端只能收。

[代码 language=text]
Server: bind/listen :443
                 ↑
Client: connect --+

connected: 双方可send/recv
[/代码]

[文本]
P2P等系统可能让节点同时扮演两种角色，但基本socket流程仍值得掌握。

[示例 title=最小可验证示例]
说明：用最小输入观察本课核心规则。
语言：text

Server: bind/listen :443
                 ↑
Client: connect --+

connected: 双方可send/recv
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数字、名称或输入换掉，再独立推导一次。如果还能解释每一步，说明你理解的是规则而不是答案。

[警告 title=常见错误]
认为“服务器”就是一台特殊硬件。普通电脑进程也可以作为服务器监听端口。

[标题]
本课小结

[文本]
能解释客户端/服务器角色。

### 课时题目

#### 题目 4

题型：SINGLE_CHOICE
题干：典型TCP服务器开始工作前通常先做什么？

难度：EASY
分值：10
知识点：客户端服务器
是否用于 Battle：否

选项：
- A. bind/listen等待连接 [正确]
- B. 主动connect每个未知客户端
- C. 删除端口
- D. 查询ARP所有互联网主机

解析：
服务器监听服务端点。

#### 题目 5

题型：SINGLE_CHOICE
题干：连接建立后数据方向如何？

难度：MEDIUM
分值：10
知识点：TCP连接
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：场景判断

选项：
- A. 双方都可发送和接收 [正确]
- B. 只允许服务器到客户端
- C. 只允许客户端到服务器
- D. 由MAC奇偶决定

解析：
TCP是全双工。

#### 题目 6

题型：CODE_FILL
题干：补全。

难度：HARD
分值：10
知识点：socket编程
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码：
```text
Server: bind → ____ → accept
```

可接受答案：
```text
listen
```

判题设置：
- 区分大小写：否
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
典型监听流程。

标准完整代码：
```text
Server: bind → listen → accept
```


---

## 课时 3：ping 能说明什么、不能说明什么

课时简介：避免把“ping不通=网站挂了”或“ping通=一切正常”。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
ping通常使用ICMP Echo测试到目标IP的基本可达性和往返时间。但网络/主机可能禁ICMP；即使ping通，TCP端口或HTTP应用仍可能失败。

[标题]
先建立一个能看见的模型

[文本]
ping 203.0.113.20成功：说明某种IP路径和ICMP响应可用。接着访问443失败：应继续检查端口、防火墙、TLS或应用。ping失败也不能单独证明目标完全不可达。

[代码 language=text]
ping OK  ≠  HTTP OK
ping FAIL ≠  一定主机宕机

它只是诊断链中的一层证据
[/代码]

[文本]
诊断工具返回的是证据，不是绝对结论。要和其他工具组合。

[示例 title=最小可验证示例]
说明：用最小输入观察本课核心规则。
语言：text

ping OK  ≠  HTTP OK
ping FAIL ≠  一定主机宕机

它只是诊断链中的一层证据
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数字、名称或输入换掉，再独立推导一次。如果还能解释每一步，说明你理解的是规则而不是答案。

[警告 title=常见错误]
把ping当作“测试网页”的命令。它不发送HTTP请求。

[标题]
本课小结

[文本]
能正确解释ping结果边界。

### 课时题目

#### 题目 7

题型：SINGLE_CHOICE
题干：ping成功最直接说明什么？

难度：EASY
分值：10
知识点：ping
是否用于 Battle：否

选项：
- A. 目标IP路径上的ICMP Echo交互可达 [正确]
- B. 目标443一定开放
- C. 网站登录一定正常
- D. DNS一定正常

解析：
ping是ICMP级证据。

#### 题目 8

题型：SINGLE_CHOICE
题干：ping失败能否直接证明服务器宕机？

难度：MEDIUM
分值：10
知识点：ping边界
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：场景判断

选项：
- A. 不能 [正确]
- B. 一定能
- C. 只有HTTPS能证明
- D. 取决于MAC长度

解析：
ICMP可能被过滤。

#### 题目 9

题型：SINGLE_CHOICE
题干：ping通但浏览器打不开HTTPS，下一步更合理检查什么？

难度：HARD
分值：10
知识点：分层诊断
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：场景判断

选项：
- A. TCP 443、TLS和HTTP服务 [正确]
- B. 重新计算页表
- C. 改变CPU流水线
- D. 只重复ping无限次

解析：
要向更高层诊断。


---

## 课时 4：traceroute 看路径

课时简介：利用TTL逐步发现路径上的路由节点。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
当目标可达但某段路径延迟/丢包异常，traceroute帮助观察中间跳。它发送TTL从1开始递增的探测，收到每跳Time Exceeded等响应。

[标题]
先建立一个能看见的模型

[文本]
TTL=1在第一路由器过期→得到R1；TTL=2在R2过期→得到R2；逐步增加直到目标。某跳显示`*`不一定表示后续不可达，也可能是不响应探测。

[代码 language=text]
TTL1 → R1 → Time Exceeded
TTL2 → R1 → R2 → Time Exceeded
TTL3 → R1 → R2 → R3 ...
[/代码]

[文本]
互联网路径可能不对称、负载均衡，traceroute只是观测结果，不应把每一行当作永久固定拓扑。

[示例 title=最小可验证示例]
说明：用最小输入观察本课核心规则。
语言：text

TTL1 → R1 → Time Exceeded
TTL2 → R1 → R2 → Time Exceeded
TTL3 → R1 → R2 → R3 ...
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数字、名称或输入换掉，再独立推导一次。如果还能解释每一步，说明你理解的是规则而不是答案。

[警告 title=常见错误]
看到中间一跳`*`就断定那台路由器坏了。它可能只是过滤响应。

[标题]
本课小结

[文本]
能解释traceroute与TTL的关系。

### 课时题目

#### 题目 10

题型：SINGLE_CHOICE
题干：traceroute逐跳发现路由器利用了哪个IP字段？

难度：EASY
分值：10
知识点：traceroute
是否用于 Battle：否

选项：
- A. TTL [正确]
- B. TCP窗口
- C. MAC FCS
- D. HTTP Host

解析：
TTL每跳递减。

#### 题目 11

题型：SINGLE_CHOICE
题干：某一跳显示 `*` 是否一定表示路径在此中断？

难度：MEDIUM
分值：10
知识点：traceroute
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：场景判断

选项：
- A. 不一定 [正确]
- B. 一定
- C. 表示DNS成功
- D. 表示端口443开放

解析：
节点可能不响应探测。

#### 题目 12

题型：CODE_FILL
题干：补全。

难度：HARD
分值：10
知识点：TTL
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码：
```text
TTL=1 通常在第 ____ 个路由器过期
```

可接受答案：
```text
1
```

```text
一个
```

```text
第一
```

判题设置：
- 区分大小写：否
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
第一跳转发时减到0。

标准完整代码：
```text
TTL=1 通常在第 1 个路由器过期
```


---

## 课时 5：nslookup / dig 查 DNS

课时简介：把“域名问题”和“IP网络问题”分开。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
浏览器报无法解析域名时，先用DNS工具直接查询记录，比反复ping域名更清楚。

[标题]
先建立一个能看见的模型

[文本]
`dig api.example.com A` 可看到解析器返回的A记录、TTL、响应状态等。若DNS失败但直接访问已知IP可达，问题更可能在名称解析链。

[代码 language=text]
$ dig api.example.com A
;; status: NOERROR
api.example.com. 300 IN A 203.0.113.20
[/代码]

[文本]
NXDOMAIN表示域名不存在/权威否定；SERVFAIL可能是解析器或DNSSEC/上游问题等。诊断时记录实际响应码。

[示例 title=最小可验证示例]
说明：用最小输入观察本课核心规则。
语言：text

$ dig api.example.com A
;; status: NOERROR
api.example.com. 300 IN A 203.0.113.20
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数字、名称或输入换掉，再独立推导一次。如果还能解释每一步，说明你理解的是规则而不是答案。

[警告 title=常见错误]
把DNS查询工具当作端口扫描。它只解决名称解析，不证明Web服务可用。

[标题]
本课小结

[文本]
能用DNS工具验证解析结果。

### 课时题目

#### 题目 13

题型：SINGLE_CHOICE
题干：dig/nslookup最直接测试什么？

难度：EASY
分值：10
知识点：DNS诊断
是否用于 Battle：否

选项：
- A. DNS名称解析 [正确]
- B. TCP拥塞窗口
- C. 以太网FCS
- D. 磁盘I/O

解析：
DNS查询工具。

#### 题目 14

题型：SINGLE_CHOICE
题干：DNS解析成功后是否证明HTTP服务一定正常？

难度：MEDIUM
分值：10
知识点：分层诊断
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：场景判断

选项：
- A. 不能 [正确]
- B. 能
- C. 只有A记录时能
- D. 只有/24时能

解析：
还需检查连接和应用。

#### 题目 15

题型：SINGLE_CHOICE
题干：域名访问失败但直接访问服务器IP可达，优先怀疑什么方向？

难度：HARD
分值：10
知识点：DNS故障
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：场景判断

选项：
- A. DNS解析/名称配置 [正确]
- B. 物理网线一定断
- C. CPU补码错误
- D. 文件系统inode

解析：
IP可达说明低层路径存在。


---

## 课时 6：用分层方法定位网络故障

课时简介：形成一套不乱猜的排错顺序。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
“网页打不开”可能从网卡未连、IP配置错、无路由、DNS失败、端口未监听、TLS证书错到HTTP500。按层检查能快速缩小范围。

[标题]
先建立一个能看见的模型

[文本]
示例顺序：1本机链路/IP配置；2能否到网关；3能否到目标IP/路由；4DNS解析；5TCP端口；6TLS；7HTTP状态和应用日志。每一步用证据决定下一步。

[代码 language=text]
Link/IP → Gateway → Route/IP → DNS → TCP port → TLS → HTTP/App
[/代码]

[文本]
顺序不是绝对死板，但原则是先确认依赖的下层。比如DNS服务器本身也需要IP可达。

[示例 title=最小可验证示例]
说明：用最小输入观察本课核心规则。
语言：text

Link/IP → Gateway → Route/IP → DNS → TCP port → TLS → HTTP/App
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数字、名称或输入换掉，再独立推导一次。如果还能解释每一步，说明你理解的是规则而不是答案。

[警告 title=常见错误]
遇到任何问题先清DNS缓存、重装网卡、重启服务器，缺少证据会制造更多变量。

[标题]
本课小结

[文本]
能给“网页打不开”列出分层排错计划。

### 课时题目

#### 题目 16

题型：SINGLE_CHOICE
题干：完全没有本机IP地址时，最先应检查哪层？

难度：EASY
分值：10
知识点：网络诊断
是否用于 Battle：否

选项：
- A. 链路/本机网络配置 [正确]
- B. HTTP状态码
- C. TLS证书
- D. 服务器业务逻辑

解析：
先解决基础接入。

#### 题目 17

题型：SINGLE_CHOICE
题干：DNS正常、目标IP可达，但443连接被拒绝，下一步更接近？

难度：MEDIUM
分值：10
知识点：分层诊断
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：场景判断

选项：
- A. 检查服务器端口监听/防火墙 [正确]
- B. 重新划分本地子网必定解决
- C. 修改DNS A记录
- D. 只检查物理层

解析：
问题已缩到传输/服务。

#### 题目 18

题型：CODE_FILL
题干：补全排错链。

难度：HARD
分值：10
知识点：故障诊断
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码：
```text
IP可达 → DNS正常 → 检查 TCP ____ → TLS → HTTP
```

可接受答案：
```text
端口
```

```text
port
```

判题设置：
- 区分大小写：否
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
逐层向上。

标准完整代码：
```text
IP可达 → DNS正常 → 检查 TCP 端口 → TLS → HTTP
```


---

## 第10章总结

[标题]
这一章真正学会了什么

[文本]
你现在不仅知道协议，也能用ping、traceroute、dig和端口/TLS/HTTP检查把故障逐层缩小。

现在你应该能够：

- 能解释socket、listen和accept。
- 能解释客户端/服务器角色。
- 能正确解释ping结果边界。
- 能解释traceroute与TTL的关系。
- 能用DNS工具验证解析结果。
- 能给“网页打不开”列出分层排错计划。

[提示 title=复习方式]
不要只重新看定义。盖住答案，用本章统一场景重新推一遍数据、代码或状态变化；能自己推出结果，才算掌握。

---

## 第10章综合挑战（不计分）

[标题]
写一份“网页打不开”诊断记录

[文本]
自行设计4种故障：DNS错误、默认网关错误、443未监听、证书过期。对每种写出第一条异常证据、下一步工具和最终定位。
