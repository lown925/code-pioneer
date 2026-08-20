export type FormalChapterPlan = {
  number: number;
  title: string;
  slug: string;
};

export type FormalCoursePlan = {
  order: number;
  slug: string;
  title: string;
  professionalDirections: readonly string[];
  interests: readonly string[];
  prerequisites: readonly string[];
  nextCourses: readonly string[];
  chapters: readonly FormalChapterPlan[];
  publishedSeed: boolean;
};

const plannedChapters = (
  courseSlug: string,
  titles: readonly string[],
): readonly FormalChapterPlan[] =>
  titles.map((title, index) => ({
    number: index + 1,
    title,
    slug: `${courseSlug}-chapter-${String(index + 1).padStart(2, '0')}`,
  }));

const fixedChapters = (
  entries: readonly (readonly [slug: string, title: string])[],
): readonly FormalChapterPlan[] =>
  entries.map(([slug, title], index) => ({ number: index + 1, title, slug }));

export const FORMAL_COURSE_PLAN = [
  {
    order: 1,
    slug: 'python-basic',
    title: 'Python 程序设计基础',
    professionalDirections: ['computer', 'software-engineering', 'big-data'],
    interests: ['python', 'software-development', 'data-processing'],
    prerequisites: [],
    nextCourses: ['data-structures-algorithms', 'linux-fundamentals'],
    chapters: fixedChapters([
      ['python-first-experience', 'Python 初体验'],
      ['python-variables-and-basic-types', '变量与基础数据类型'],
      [
        'python-input-conversion-and-formatted-output',
        '输入、类型转换与格式化输出',
      ],
      ['python-operators-and-expressions', '运算符与表达式'],
      ['python-conditional-statements', '条件判断'],
      ['python-loops', '循环'],
      ['python-strings', '字符串'],
      ['python-lists-and-tuples', '列表与元组'],
      ['python-dictionaries-and-sets', '字典与集合'],
      ['python-functions', '函数'],
      ['python-modules-and-standard-library', '模块、包与常用标准库'],
      ['python-file-operations-and-json', '文件操作与 JSON'],
      ['python-exception-handling', '异常处理'],
      ['python-object-oriented-basics', '面向对象基础'],
      ['python-basics-capstone-project', 'Python 基础综合实战'],
    ]),
    publishedSeed: true,
  },
  {
    order: 2,
    slug: 'data-structures-algorithms',
    title: '数据结构与算法基础',
    professionalDirections: ['computer', 'software-engineering', 'big-data'],
    interests: [
      'algorithm',
      'computer-foundations',
      'software-development',
      'backend',
      'data-processing',
    ],
    prerequisites: ['python-basic'],
    nextCourses: [
      'database-sql-fundamentals',
      'java-object-oriented-programming',
      'linux-fundamentals',
    ],
    chapters: fixedChapters([
      ['data-structures-algorithms-introduction', '认识算法与复杂度'],
      ['data-structures-algorithms-arrays', '数组与顺序表'],
      ['data-structures-algorithms-linked-list', '链表'],
      ['data-structures-algorithms-stack', '栈'],
      ['data-structures-algorithms-queue', '队列'],
      ['data-structures-algorithms-string-algorithms', '字符串与基础算法技巧'],
      ['data-structures-algorithms-binary-tree', '树与二叉树'],
      [
        'data-structures-algorithms-tree-traversal-bst',
        '二叉树遍历与二叉搜索树',
      ],
      ['data-structures-algorithms-heap-priority-queue', '堆与优先队列'],
      ['data-structures-algorithms-hash-table', '哈希表'],
      ['data-structures-algorithms-graph-traversal', '图与图的遍历'],
      ['data-structures-algorithms-search-sort', '查找、排序与综合算法训练'],
    ]),
    publishedSeed: true,
  },
  {
    order: 3,
    slug: 'linux-fundamentals',
    title: 'Linux 基础与常用命令',
    professionalDirections: ['computer', 'big-data', 'software-engineering'],
    interests: ['linux', 'system', 'operations', 'backend', 'big-data'],
    prerequisites: ['python-basic'],
    nextCourses: [
      'database-sql-fundamentals',
      'big-data-fundamentals',
      'computer-networks-fundamentals',
    ],
    chapters: plannedChapters('linux-fundamentals', [
      'Linux 与终端入门',
      '文件系统与目录导航',
      '文件与目录操作',
      '文本查看、搜索与处理',
      '用户、用户组与权限',
      '进程与任务管理',
      '软件包与系统服务',
      'Linux 网络基础与常用命令',
      'Shell 基础与脚本',
      'Linux 综合运维实践',
    ]),
    publishedSeed: false,
  },
  {
    order: 4,
    slug: 'database-sql-fundamentals',
    title: '数据库与 SQL 基础',
    professionalDirections: ['computer', 'software-engineering', 'big-data'],
    interests: [
      'database',
      'backend',
      'data-analysis',
      'data-processing',
      'sql',
    ],
    prerequisites: ['python-basic'],
    nextCourses: [
      'software-engineering-project-development',
      'big-data-fundamentals',
    ],
    chapters: plannedChapters('database-sql-fundamentals', [
      '认识数据库与关系模型',
      '表、字段、记录与主键',
      '创建数据库与数据表',
      'SELECT 基础查询',
      'WHERE 条件查询',
      '排序、限制与去重',
      '聚合函数与 GROUP BY',
      '多表查询与 JOIN',
      '子查询',
      'INSERT、UPDATE 与 DELETE',
      '约束、索引与事务',
      '数据库设计综合项目',
    ]),
    publishedSeed: false,
  },
  {
    order: 5,
    slug: 'java-object-oriented-programming',
    title: 'Java 面向对象程序设计',
    professionalDirections: ['software-engineering', 'computer'],
    interests: ['java', 'backend', 'software-development'],
    prerequisites: ['data-structures-algorithms'],
    nextCourses: [
      'database-sql-fundamentals',
      'software-engineering-project-development',
    ],
    chapters: plannedChapters('java-object-oriented-programming', [
      'Java 与程序结构',
      '变量、数据类型与运算符',
      '条件判断与循环',
      '数组与字符串',
      '类与对象',
      '封装',
      '继承',
      '多态',
      '抽象类与接口',
      '集合与泛型',
      '异常与文件处理',
      '面向对象综合项目',
    ]),
    publishedSeed: false,
  },
  {
    order: 6,
    slug: 'computer-networks-fundamentals',
    title: '计算机网络基础',
    professionalDirections: ['computer', 'software-engineering'],
    interests: ['network', 'system', 'backend', 'network-security'],
    prerequisites: ['linux-fundamentals'],
    nextCourses: [],
    chapters: plannedChapters('computer-networks-fundamentals', [
      '认识计算机网络',
      'OSI 与 TCP/IP 模型',
      '数据链路层与以太网',
      'IP 地址与子网',
      'ARP、ICMP 与常用网络工具',
      '路由基础',
      'TCP 与 UDP',
      'DNS',
      'HTTP 与 HTTPS',
      '网络通信与故障排查',
    ]),
    publishedSeed: false,
  },
  {
    order: 7,
    slug: 'computer-architecture-operating-systems',
    title: '计算机组成原理与操作系统基础',
    professionalDirections: ['computer'],
    interests: ['operating-system', 'system', 'computer-foundations'],
    prerequisites: ['data-structures-algorithms'],
    nextCourses: ['computer-networks-fundamentals'],
    chapters: plannedChapters('computer-architecture-operating-systems', [
      '计算机系统整体结构',
      '二进制与数据表示',
      'CPU 与指令执行',
      '存储器层次结构',
      'Cache 基础',
      '输入输出系统',
      '操作系统概述',
      '进程与线程',
      'CPU 调度',
      '并发与同步基础',
      '内存管理',
      '文件系统与综合理解',
    ]),
    publishedSeed: false,
  },
  {
    order: 8,
    slug: 'software-engineering-project-development',
    title: '软件工程与项目开发',
    professionalDirections: ['software-engineering'],
    interests: [
      'software-development',
      'project-development',
      'backend',
      'teamwork',
    ],
    prerequisites: ['data-structures-algorithms', 'database-sql-fundamentals'],
    nextCourses: ['computer-networks-fundamentals'],
    chapters: plannedChapters('software-engineering-project-development', [
      '什么是软件工程',
      '软件生命周期与开发模型',
      '需求分析',
      '用例与 UML 基础',
      '软件设计与分层思想',
      'Git 与团队协作',
      '数据库与接口设计',
      '软件测试',
      '调试、日志、安全与质量',
      '从需求到发布的完整项目实践',
    ]),
    publishedSeed: false,
  },
  {
    order: 9,
    slug: 'big-data-fundamentals',
    title: '大数据技术基础',
    professionalDirections: ['big-data'],
    interests: ['data-processing', 'distributed-computing', 'data-analysis'],
    prerequisites: [
      'python-basic',
      'linux-fundamentals',
      'database-sql-fundamentals',
    ],
    nextCourses: ['spark-data-processing'],
    chapters: plannedChapters('big-data-fundamentals', [
      '什么是大数据',
      '分布式计算基础',
      'Linux 与大数据运行环境',
      'Hadoop 生态系统',
      'HDFS 分布式文件系统',
      'MapReduce 计算模型',
      'YARN 资源调度',
      'Hive 与大数据 SQL',
      'ETL 与数据仓库基础',
      '大数据处理综合案例',
    ]),
    publishedSeed: false,
  },
  {
    order: 10,
    slug: 'spark-data-processing',
    title: 'Spark 数据处理',
    professionalDirections: ['big-data'],
    interests: [
      'spark',
      'data-processing',
      'distributed-computing',
      'data-analysis',
    ],
    prerequisites: ['python-basic', 'big-data-fundamentals'],
    nextCourses: [],
    chapters: plannedChapters('spark-data-processing', [
      'Spark 是什么',
      'Spark 应用与执行模型',
      'RDD 基础',
      'Transformation 与 Action',
      'DataFrame',
      'Spark SQL',
      '数据清洗与转换',
      '聚合、Join 与分组分析',
      '分区、缓存与性能基础',
      'Spark 数据分析综合项目',
    ]),
    publishedSeed: false,
  },
] as const satisfies readonly FormalCoursePlan[];

export const PUBLISHED_FORMAL_COURSE_SLUGS = FORMAL_COURSE_PLAN.filter(
  (course) => course.publishedSeed,
).map((course) => course.slug);
