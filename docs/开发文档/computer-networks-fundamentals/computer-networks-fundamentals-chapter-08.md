# 第8章：应用层协议与 DNS

章节简介：从DNS解析到HTTP消息和TLS，把“输入网址”后应用层发生的事情串起来。
预计学习时间：90 分钟

章节学习目标：
- 理解并能应用域名与 DNS 层次
- 理解并能应用递归查询与迭代查询直觉
- 理解并能应用DNS 缓存
- 理解并能应用HTTP 请求与响应
- 理解并能应用状态码与常见头
- 理解并能应用HTTPS 建立安全连接的基本思路

[标题]
本章统一场景

[文本]
本章统一使用https://api.example.com/courses作为访问目标。

---

## 课时 1：域名与 DNS 层次

课时简介：理解为什么不把所有域名记录放在一个服务器。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
人更容易记域名，网络转发需要IP。DNS把名称解析成记录，并通过分层命名和分布式权威服务器扩展到全球规模。

[标题]
先建立一个能看见的模型

[文本]
`www.example.com` 可从右向左理解层次：根`.` → 顶级域 `.com` → `example.com` 权威区域 → 主机名 `www`。递归解析器帮客户端完成多步查询并缓存结果。

[代码 language=text]
www.example.com.
      |      |
    host   domain
            ↓
Root → .com → example.com authoritative
[/代码]

[文本]
DNS不只是“A记录域名→IPv4”，还有AAAA、CNAME、MX等多种记录。初学先掌握名称层次和A/AAAA即可。

[示例 title=最小可验证示例]
说明：用最小输入观察本课核心规则。
语言：text

www.example.com.
      |      |
    host   domain
            ↓
Root → .com → example.com authoritative
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数字、名称或输入换掉，再独立推导一次。如果还能解释每一步，说明你理解的是规则而不是答案。

[警告 title=常见错误]
认为域名字符串在路由器之间直接用于IP转发。IP层通常基于解析后的地址。

[标题]
本课小结

[文本]
能解释DNS分层命名。

### 课时题目

#### 题目 1

题型：SINGLE_CHOICE
题干：DNS最基础的作用之一是？

难度：EASY
分值：10
知识点：DNS
是否用于 Battle：否

选项：
- A. 把域名解析为IP等记录 [正确]
- B. 把MAC变成端口
- C. 控制CPU流水线
- D. 保存文件内容

解析：
DNS提供名称解析。

#### 题目 2

题型：SINGLE_CHOICE
题干：在 `www.example.com` 中 `.com` 是什么层次？

难度：MEDIUM
分值：10
知识点：DNS层次
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：场景判断

选项：
- A. 顶级域TLD [正确]
- B. TCP端口
- C. MAC前缀
- D. IP子网掩码

解析：
com是TLD。

#### 题目 3

题型：SINGLE_CHOICE
题干：为什么DNS采用分层分布式体系而不是一台全球服务器？

难度：HARD
分值：10
知识点：DNS架构
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：场景判断

选项：
- A. 便于规模扩展、管理委派和容错 [正确]
- B. 因为IP不能联网
- C. 因为HTTP禁止集中服务器
- D. 因为MAC只有48位

解析：
全球命名需要可扩展管理。


---

## 课时 2：递归查询与迭代查询直觉

课时简介：理解客户端通常只问本地递归解析器一次，但解析器可能继续问多台权威链。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
终端通常把“请帮我找到www.example.com”交给递归resolver。若缓存没有，resolver可能从根开始得到.com服务器提示，再问.com得到example.com权威服务器，最后获得记录。

[标题]
先建立一个能看见的模型

[文本]
客户端→递归解析器是“请给我最终答案”的递归服务直觉；解析器向根/TLD/权威的过程常表现为迭代询问：“你不知道最终答案，就告诉我下一步问谁”。

[代码 language=text]
Client → Resolver: www.example.com?
Resolver → Root: ?      ← ask .com
Resolver → .com: ?      ← ask example authoritative
Resolver → Authoritative: ? ← IP
Resolver → Client: IP
[/代码]

[文本]
现实DNS还有转发、缓存、DNSSEC等细节。这里先掌握角色关系。

[示例 title=最小可验证示例]
说明：用最小输入观察本课核心规则。
语言：text

Client → Resolver: www.example.com?
Resolver → Root: ?      ← ask .com
Resolver → .com: ?      ← ask example authoritative
Resolver → Authoritative: ? ← IP
Resolver → Client: IP
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数字、名称或输入换掉，再独立推导一次。如果还能解释每一步，说明你理解的是规则而不是答案。

[警告 title=常见错误]
把根DNS理解为保存所有网站最终IP。根通常主要告诉你TLD服务器在哪里。

[标题]
本课小结

[文本]
能按角色描述一次缓存miss解析。

### 课时题目

#### 题目 4

题型：SINGLE_CHOICE
题干：普通客户端通常首先询问谁？

难度：EASY
分值：10
知识点：DNS查询
是否用于 Battle：否

选项：
- A. 配置的递归DNS解析器 [正确]
- B. 所有根服务器同时
- C. 目标网站的MAC
- D. 交换机

解析：
stub resolver依赖递归resolver。

#### 题目 5

题型：SINGLE_CHOICE
题干：根DNS最典型返回什么方向的信息？

难度：MEDIUM
分值：10
知识点：DNS迭代
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：场景判断

选项：
- A. 相应顶级域服务器的委派信息 [正确]
- B. 网页HTML
- C. TCP连接
- D. 本地ARP表

解析：
根指导下一层。

#### 题目 6

题型：CODE_FILL
题干：补全链路。

难度：HARD
分值：10
知识点：DNS查询
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码：
```text
Root → TLD → ____ authoritative
```

可接受答案：
```text
domain
```

```text
域名区域
```

```text
example.com
```

判题设置：
- 区分大小写：否
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
迭代查询逐层到权威区。

标准完整代码：
```text
Root → TLD → domain authoritative
```


---

## 课时 3：DNS 缓存

课时简介：理解为什么第二次访问常不用重新走完整解析链。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
域名记录带TTL。递归解析器和客户端可在TTL有效期内复用结果，减少延迟和权威服务器负载。

[标题]
先建立一个能看见的模型

[文本]
第一次查example.com得到203.0.113.20、TTL=300s；2分钟后再查可直接用缓存；超过TTL后需要重新验证/查询。修改DNS记录后，旧缓存可能在TTL期间继续存在。

[代码 language=text]
A example.com = 203.0.113.20
TTL=300s

0s: 查询并缓存
120s: cache hit
>300s: 缓存到期，重新查询
[/代码]

[文本]
DNS TTL不是IP包的TTL，它们名字相同但层和含义不同：DNS TTL控制缓存寿命，IP TTL限制路由跳数。

[示例 title=最小可验证示例]
说明：用最小输入观察本课核心规则。
语言：text

A example.com = 203.0.113.20
TTL=300s

0s: 查询并缓存
120s: cache hit
>300s: 缓存到期，重新查询
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数字、名称或输入换掉，再独立推导一次。如果还能解释每一步，说明你理解的是规则而不是答案。

[警告 title=常见错误]
把“改了DNS记录但有些用户仍访问旧IP”立刻归因于服务器故障，忽略缓存传播时间。

[标题]
本课小结

[文本]
能区分DNS TTL与IP TTL。

### 课时题目

#### 题目 7

题型：SINGLE_CHOICE
题干：DNS记录TTL主要控制什么？

难度：EASY
分值：10
知识点：DNS缓存
是否用于 Battle：否

选项：
- A. 缓存可使用多久 [正确]
- B. IP包可经过多少路由器
- C. TCP连接窗口
- D. MAC表端口

解析：
DNS缓存寿命。

#### 题目 8

题型：SINGLE_CHOICE
题干：修改DNS记录后部分用户短时间仍看到旧地址，可能因为什么？

难度：MEDIUM
分值：10
知识点：DNS缓存
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：故障分析

选项：
- A. 旧缓存TTL尚未过期 [正确]
- B. CPU不支持域名
- C. 交换机锁死
- D. HTTP方法错误

解析：
缓存尚有效。

#### 题目 9

题型：SINGLE_CHOICE
题干：DNS TTL和IP TTL有什么关系？

难度：HARD
分值：10
知识点：TTL辨析
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：场景判断

选项：
- A. 只是同名缩写，含义和层次不同 [正确]
- B. 完全相同
- C. 都表示毫秒
- D. 都控制端口

解析：
一个缓存寿命，一个跳数限制。


---

## 课时 4：HTTP 请求与响应

课时简介：理解浏览器真正发送的是结构化应用层消息。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
TCP/TLS连接建立后，浏览器通过HTTP请求资源。请求包含方法、路径、头部和可选body；服务器返回状态码、头部和body。

[标题]
先建立一个能看见的模型

[文本]
最小HTTP/1.1示意：`GET /courses HTTP/1.1`，Host指定主机；服务器返回 `HTTP/1.1 200 OK` 和JSON/HTML内容。

[代码 language=text]
GET /courses HTTP/1.1
Host: api.example.com
Accept: application/json

←
HTTP/1.1 200 OK
Content-Type: application/json

[{...}]
[/代码]

[文本]
HTTP关心资源和表示，不负责自己保证包可靠到达；传统HTTP常依赖TCP，HTTP/3则运行在QUIC之上。

[示例 title=最小可验证示例]
说明：用最小输入观察本课核心规则。
语言：text

GET /courses HTTP/1.1
Host: api.example.com
Accept: application/json

←
HTTP/1.1 200 OK
Content-Type: application/json

[{...}]
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数字、名称或输入换掉，再独立推导一次。如果还能解释每一步，说明你理解的是规则而不是答案。

[警告 title=常见错误]
把HTTP状态码当成TCP错误码。HTTP 404可以在TCP连接完全正常时返回。

[标题]
本课小结

[文本]
能读懂简单HTTP请求/响应结构。

### 课时题目

#### 题目 10

题型：SINGLE_CHOICE
题干：HTTP GET 的路径 `/courses` 主要位于哪一层语义？

难度：EASY
分值：10
知识点：HTTP
是否用于 Battle：否

选项：
- A. 应用层 [正确]
- B. 链路层
- C. 物理层
- D. ARP

解析：
HTTP是应用协议。

#### 题目 11

题型：SINGLE_CHOICE
题干：服务器返回404说明什么更直接？

难度：MEDIUM
分值：10
知识点：HTTP状态码
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：场景判断

选项：
- A. HTTP层没有找到对应资源/路由语义 [正确]
- B. TCP握手一定失败
- C. IP一定不可达
- D. 网线一定断了

解析：
404是应用层响应。

#### 题目 12

题型：CODE_FILL
题干：补全常见成功状态。

难度：HARD
分值：10
知识点：HTTP
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码：
```text
HTTP/1.1 ____ OK
```

可接受答案：
```text
200
```

判题设置：
- 区分大小写：否
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
200表示成功响应。

标准完整代码：
```text
HTTP/1.1 200 OK
```


---

## 课时 5：状态码与常见头

课时简介：用类别而不是死背全部数字。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
状态码首位大致分组：2xx成功、3xx重定向、4xx客户端请求问题、5xx服务器处理错误。头部提供内容类型、缓存、认证等元信息。

[标题]
先建立一个能看见的模型

[文本]
200 OK成功；301/302重定向；400请求格式/参数问题；401需要认证；404资源不存在；500服务器内部错误。Content-Type告诉客户端body如何解释。

[代码 language=text]
200 OK
301 Moved Permanently
400 Bad Request
401 Unauthorized
404 Not Found
500 Internal Server Error
[/代码]

[文本]
状态码不是“错误严重度排名”。404不一定比400严重；它们表达不同语义。

[示例 title=最小可验证示例]
说明：用最小输入观察本课核心规则。
语言：text

200 OK
301 Moved Permanently
400 Bad Request
401 Unauthorized
404 Not Found
500 Internal Server Error
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数字、名称或输入换掉，再独立推导一次。如果还能解释每一步，说明你理解的是规则而不是答案。

[警告 title=常见错误]
把401理解为“服务器坏了”。401属于客户端未通过认证语义。

[标题]
本课小结

[文本]
能根据2xx/4xx/5xx定位问题层次。

### 课时题目

#### 题目 13

题型：SINGLE_CHOICE
题干：HTTP 5xx通常表示哪一类问题？

难度：EASY
分值：10
知识点：HTTP状态码
是否用于 Battle：否

选项：
- A. 服务器处理侧错误 [正确]
- B. 客户端地址一定非法
- C. 物理网线断
- D. DNS缓存命中

解析：
5xx server error。

#### 题目 14

题型：SINGLE_CHOICE
题干：Content-Type 的作用是什么？

难度：MEDIUM
分值：10
知识点：HTTP头
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：场景判断

选项：
- A. 说明响应/请求body的媒体类型 [正确]
- B. 指定IP路由
- C. 指定MAC地址
- D. 设置TCP序号

解析：
应用层内容解释。

#### 题目 15

题型：SINGLE_CHOICE
题干：能正常收到HTTP 500说明底层TCP/IP是否一定坏了？

难度：HARD
分值：10
知识点：分层诊断
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：场景判断

选项：
- A. 不一定，连接可能完全正常，错误在服务器应用处理 [正确]
- B. 一定坏了
- C. HTTP500等于IP不可达
- D. 500由交换机生成

解析：
应用层错误可在网络正常时发生。


---

## 课时 6：HTTPS 建立安全连接的基本思路

课时简介：理解HTTPS不是“HTTP换一个端口”这么简单。
预计学习时间：12-18 分钟

### 正文

[标题]
为什么现在需要它

[文本]
普通HTTP内容可能被路径上的节点读取或篡改。HTTPS通常在HTTP与传输之间使用TLS，提供加密、完整性和服务器身份验证。

[标题]
先建立一个能看见的模型

[文本]
简化流程：先获得服务器IP并建立传输连接；TLS握手中服务器提供证书和公钥相关信息，客户端验证域名/信任链，双方协商会话密钥；之后HTTP内容用对称加密保护。

[代码 language=text]
DNS → IP
TCP/QUIC connection
  ↓
TLS handshake: certificate + key agreement
  ↓
Encrypted HTTP data
[/代码]

[文本]
TLS不等于“服务器绝对可信”。证书主要证明你连接的端点持有对应私钥且名称/信任链符合规则，不保证网站业务内容本身善意。

[示例 title=最小可验证示例]
说明：用最小输入观察本课核心规则。
语言：text

DNS → IP
TCP/QUIC connection
  ↓
TLS handshake: certificate + key agreement
  ↓
Encrypted HTTP data
[/示例]

[提示 title=判断自己是不是真的理解]
把示例中的数字、名称或输入换掉，再独立推导一次。如果还能解释每一步，说明你理解的是规则而不是答案。

[警告 title=常见错误]
把HTTPS说成“用服务器公钥直接加密整个大文件”。现代TLS通常通过握手建立高效对称会话密钥。

[标题]
本课小结

[文本]
能解释HTTPS提供的三类核心保护。

### 课时题目

#### 题目 16

题型：SINGLE_CHOICE
题干：HTTPS/TLS主要提供哪些保护？

难度：EASY
分值：10
知识点：HTTPS
是否用于 Battle：否

选项：
- A. 加密、完整性、身份认证 [正确]
- B. 自动提高物理带宽
- C. 自动修复服务器Bug
- D. 替代DNS

解析：
TLS保护通信。

#### 题目 17

题型：SINGLE_CHOICE
题干：为什么数据阶段常使用对称加密？

难度：MEDIUM
分值：10
知识点：TLS
是否用于 Battle：是
Battle 难度：MEDIUM
Battle 展示类型：场景判断

选项：
- A. 效率高，适合大量数据 [正确]
- B. 因为不需要任何密钥
- C. 因为证书就是对称密钥
- D. 因为TCP禁止非对称

解析：
握手协商会话密钥后用高效对称算法。

#### 题目 18

题型：CODE_FILL
题干：补全。

难度：HARD
分值：10
知识点：HTTPS
是否用于 Battle：是
Battle 难度：HARD
Battle 展示类型：代码填空

题目代码：
```text
HTTPS = HTTP over ____
```

可接受答案：
```text
TLS
```

判题设置：
- 区分大小写：否
- 忽略首尾空格：是
- 保留代码内部空格：是
- 统一 Windows 和 Unix 换行：是

解析：
常见HTTPS使用TLS保护HTTP。

标准完整代码：
```text
HTTPS = HTTP over TLS
```


---

## 第8章总结

[标题]
这一章真正学会了什么

[文本]
你已经能区分DNS解析、HTTP语义和TLS安全职责，也能从状态码判断“网络通但应用失败”的情况。

现在你应该能够：

- 能解释DNS分层命名。
- 能按角色描述一次缓存miss解析。
- 能区分DNS TTL与IP TTL。
- 能读懂简单HTTP请求/响应结构。
- 能根据2xx/4xx/5xx定位问题层次。
- 能解释HTTPS提供的三类核心保护。

[提示 title=复习方式]
不要只重新看定义。盖住答案，用本章统一场景重新推一遍数据、代码或状态变化；能自己推出结果，才算掌握。

---

## 第8章综合挑战（不计分）

[标题]
追踪一个HTTPS API请求

[文本]
从DNS缓存miss开始，画到收到HTTP 200 JSON为止；再分别假设DNS超时、TCP拒绝、TLS证书错误、HTTP500，指出每个故障在哪一层。
