import type { SeedCourse, SeedQuestionOption } from '../types';

function option(
  key: string,
  content: string,
  isCorrect: boolean,
): SeedQuestionOption {
  return { key, content, isCorrect };
}

export const JAVASCRIPT_STARTER_COURSE: SeedCourse = {
  version: 'v1',
  key: 'javascript-starter',
  slug: 'javascript-starter',
  title: 'JavaScript 入门示例课',
  summary:
    '用一门可演示、可重复导入的示例课程串起章节阅读、学习进度、章节测验和 Battle 题库。',
  description:
    '这门示例课聚焦 JavaScript 初学者最常见的入门主题：如何运行第一段脚本、变量和字符串、条件判断、函数与数组。内容采用“课程 -> 章节 -> 导入源课时”组织，其中课时是导入模板层的业务抽象，当前数据库会将其编译为章节正文内容块和章节测验题。',
  category: 'FRONTEND',
  language: 'JavaScript',
  difficulty: 'BEGINNER',
  estimatedMinutes: 120,
  targetAudience:
    '适合已经会打开浏览器开发者工具、但还没有系统学过 JavaScript 语法的初学者。',
  learningObjectives: [
    '能在浏览器控制台运行简单的 JavaScript 语句',
    '理解 let、const、字符串模板和基本类型',
    '能读懂基础的 if / else 条件判断',
    '能编写简单函数并用数组保存一组值',
  ],
  status: 'PUBLISHED',
  sortOrder: 100,
  battleSkillCode: 'JAVASCRIPT',
  chapters: [
    {
      key: 'js-getting-started',
      title: '第一章：开始使用 JavaScript',
      summary: '认识脚本运行环境，并掌握变量与字符串这两个最常见的基础概念。',
      estimatedMinutes: 60,
      sortOrder: 1,
      quizTitle: 'JavaScript 入门基础测验',
      quizDescription:
        '检验你是否理解脚本运行环境、变量声明和字符串模板等基础概念。',
      passScorePercent: 70,
      lessons: [
        {
          key: 'first-script-and-console',
          title: '课时 1：第一段脚本与控制台',
          summary: '学会在浏览器控制台运行表达式、查看输出，以及理解脚本的执行位置。',
          estimatedMinutes: 30,
          blocks: [
            {
              key: 'lesson-heading',
              type: 'HEADING',
              text: '先从控制台开始，不急着搭工程',
              level: 2,
            },
            {
              key: 'intro',
              type: 'TEXT',
              text: '对初学者来说，浏览器开发者工具是最直接的练习环境。你在控制台输入一行 JavaScript，回车后立刻就能看到执行结果，这比一开始就配置打包工具更容易建立反馈。',
            },
            {
              key: 'console-example',
              type: 'CODE',
              language: 'javascript',
              code: "console.log('Hello, JavaScript!')",
              caption: 'console.log 会把内容输出到控制台',
            },
            {
              key: 'tip-open-console',
              type: 'TIP',
              title: '练习建议',
              text: '边学边改动示例最有效。不要只看结果，试着自己把字符串、数字和变量名换成别的值，再观察输出变化。',
            },
            {
              key: 'example-script-tag',
              type: 'EXAMPLE',
              title: '脚本也可以写进页面',
              description:
                '当你不在控制台里临时执行，而是希望页面加载时自动运行，就可以把脚本放进 HTML 的 <script> 标签中。',
              language: 'html',
              code: '<script>\n  console.log("Page loaded")\n</script>',
            },
          ],
          questions: [
            {
              key: 'console-log-purpose',
              type: 'SINGLE_CHOICE',
              title: '在浏览器控制台里执行 `console.log("Hi")` 的主要作用是什么？',
              explanation:
                '`console.log` 用于向控制台输出信息，方便观察代码是否执行以及变量当前的值。',
              difficulty: 'EASY',
              score: 10,
              isBattleEnabled: true,
              battlePresentation: 'TEXT_CHOICE',
              stemBlocks: [
                {
                  type: 'TEXT',
                  text: '在浏览器控制台里执行 `console.log("Hi")` 的主要作用是什么？',
                },
              ],
              options: [
                option('print-message', '把信息输出到控制台', true),
                option('create-variable', '创建一个名为 Hi 的变量', false),
                option('open-network', '打开浏览器网络面板', false),
                option('reload-page', '让页面重新加载一次', false),
              ],
              tags: ['topic:console', 'topic:output'],
            },
            {
              key: 'valid-script-location',
              type: 'SINGLE_CHOICE',
              title: '下面哪一项最适合用来描述 `<script>` 标签的作用？',
              explanation:
                '`<script>` 标签用于在页面中嵌入或加载 JavaScript，让脚本在页面生命周期中执行。',
              difficulty: 'EASY',
              score: 10,
              isBattleEnabled: true,
              battlePresentation: 'CODE_PURPOSE',
              stemBlocks: [
                {
                  type: 'CODE',
                  language: 'html',
                  code: '<script>\n  console.log("ready")\n</script>',
                },
                {
                  type: 'TEXT',
                  text: '上面的片段最准确的作用是什么？',
                },
              ],
              programmingLanguage: 'html',
              options: [
                option('embed-js', '在页面中嵌入并执行 JavaScript', true),
                option('define-css', '在页面中定义 CSS 样式', false),
                option('declare-json', '声明一个只能被数据库读取的 JSON 块', false),
                option('create-comment', '创建不会执行的 HTML 注释', false),
              ],
              tags: ['topic:script-tag'],
            },
            {
              key: 'console-output-order',
              type: 'SINGLE_CHOICE',
              title: '下面这段代码执行后，控制台第一行会看到什么？',
              explanation:
                'JavaScript 会按顺序执行语句，因此第一条 `console.log` 先输出 `start`。',
              difficulty: 'MEDIUM',
              score: 10,
              isBattleEnabled: true,
              battlePresentation: 'OUTPUT_PREDICTION',
              programmingLanguage: 'javascript',
              stemBlocks: [
                {
                  type: 'CODE',
                  language: 'javascript',
                  code: "console.log('start')\nconsole.log('end')",
                },
              ],
              options: [
                option('start', 'start', true),
                option('end', 'end', false),
                option('both', 'start end 同时出现在同一行', false),
                option('nothing', '没有任何输出', false),
              ],
              tags: ['topic:execution-order'],
            },
            {
              key: 'comment-syntax',
              type: 'SINGLE_CHOICE',
              title: '下面哪一行是 JavaScript 中的单行注释？',
              explanation:
                '`//` 是 JavaScript 中最常见的单行注释语法，解释器会忽略这部分内容。',
              difficulty: 'MEDIUM',
              score: 10,
              isBattleEnabled: true,
              battlePresentation: 'CODE_SNIPPET_CHOICE',
              programmingLanguage: 'javascript',
              stemBlocks: [
                {
                  type: 'TEXT',
                  text: '下面哪一行是 JavaScript 中的单行注释？',
                },
              ],
              options: [
                option('js-comment', '// 记录一下当前输出', true),
                option('html-comment', '<!-- 记录一下当前输出 -->', false),
                option('css-comment', '/*/* 记录一下当前输出 */', false),
                option('hash-comment', '# 记录一下当前输出', false),
              ],
              tags: ['topic:comment'],
            },
            {
              key: 'semicolon-understanding',
              type: 'SINGLE_CHOICE',
              title: '关于 JavaScript 语句末尾的分号，下面哪项表述更准确？',
              explanation:
                'JavaScript 存在自动插入分号机制，但保持一致的分号风格能减少歧义和团队协作成本。',
              difficulty: 'HARD',
              score: 10,
              isBattleEnabled: true,
              battlePresentation: 'TEXT_CHOICE',
              stemBlocks: [
                {
                  type: 'TEXT',
                  text: '关于 JavaScript 语句末尾的分号，下面哪项表述更准确？',
                },
              ],
              options: [
                option(
                  'semicolon-style',
                  '有些场景可以依赖自动插入分号，但团队里最好保持一致写法',
                  true,
                ),
                option('semicolon-required-everywhere', '每一行都必须手写分号，否则代码完全不能运行', false),
                option('semicolon-never-used', 'JavaScript 里从来不使用分号', false),
                option('semicolon-html-only', '分号只在 HTML 里有意义，JavaScript 不识别', false),
              ],
              tags: ['topic:semicolon', 'topic:style'],
            },
          ],
        },
        {
          key: 'variables-and-strings',
          title: '课时 2：变量、字符串和模板字面量',
          summary: '理解 let 与 const 的角色，知道字符串拼接和模板字面量的差别。',
          estimatedMinutes: 30,
          blocks: [
            {
              key: 'lesson-heading',
              type: 'HEADING',
              text: '先把“值”放进变量，再让代码可复用',
              level: 2,
            },
            {
              key: 'intro',
              type: 'TEXT',
              text: '变量让你给数据起名字。与其在很多地方重复写同一个字符串或数字，不如先把它放进变量，再通过变量名读取。这样代码更容易改，也更容易解释。',
            },
            {
              key: 'const-example',
              type: 'CODE',
              language: 'javascript',
              code: "const userName = 'Ming'\nlet score = 0",
              caption: 'const 常用于不会重新赋值的引用名，let 用于稍后可能变化的值',
            },
            {
              key: 'template-example',
              type: 'EXAMPLE',
              title: '模板字面量更适合插入变量',
              description:
                '当你需要把变量嵌入字符串时，反引号加 `${}` 的写法通常比手动拼接更直观。',
              language: 'javascript',
              code: "const userName = 'Ming'\nconsole.log(`Hello, ${userName}`)",
            },
            {
              key: 'warning-const',
              type: 'WARNING',
              title: '常见误区',
              text: '`const` 不是“值永远不会变化”的意思，而是“这个变量名不能重新指向别的值”。如果它指向的是对象，对象内部属性仍可能被修改。',
            },
          ],
          questions: [
            {
              key: 'const-declaration',
              type: 'SINGLE_CHOICE',
              title: '下面哪一行是合法的常量声明？',
              explanation:
                '`const language = "JavaScript"` 是合法写法：使用 `const` 声明并立即赋值。',
              difficulty: 'EASY',
              score: 10,
              isBattleEnabled: true,
              battlePresentation: 'CODE_SNIPPET_CHOICE',
              programmingLanguage: 'javascript',
              stemBlocks: [
                {
                  type: 'TEXT',
                  text: '下面哪一行是合法的常量声明？',
                },
              ],
              options: [
                option('const-valid', 'const language = "JavaScript"', true),
                option('const-missing-equal', 'const language "JavaScript"', false),
                option('let-without-name', 'let = "JavaScript"', false),
                option('quoted-const', '"const" language = "JavaScript"', false),
              ],
              tags: ['topic:const'],
            },
            {
              key: 'let-reassign',
              type: 'SINGLE_CHOICE',
              title: '如果一个值稍后需要重新赋值，更合适的声明方式通常是哪一个？',
              explanation:
                '`let` 适合表示后续可能变化的值，例如计数器、输入状态和当前选中项。',
              difficulty: 'EASY',
              score: 10,
              isBattleEnabled: true,
              battlePresentation: 'TEXT_CHOICE',
              stemBlocks: [
                {
                  type: 'TEXT',
                  text: '如果一个值稍后需要重新赋值，更合适的声明方式通常是哪一个？',
                },
              ],
              options: [
                option('use-let', '使用 let', true),
                option('use-script', '使用 <script>', false),
                option('use-console', '使用 console.log', false),
                option('use-html', '使用 HTML 注释', false),
              ],
              tags: ['topic:let'],
            },
            {
              key: 'template-literal-output',
              type: 'SINGLE_CHOICE',
              title: '下面代码执行后会输出什么？',
              explanation:
                '模板字面量会把 `${userName}` 替换成变量值，因此输出是 `Hello, Ming!`。',
              difficulty: 'MEDIUM',
              score: 10,
              isBattleEnabled: true,
              battlePresentation: 'OUTPUT_PREDICTION',
              programmingLanguage: 'javascript',
              stemBlocks: [
                {
                  type: 'CODE',
                  language: 'javascript',
                  code: "const userName = 'Ming'\nconsole.log(`Hello, ${userName}!`)",
                },
              ],
              options: [
                option('hello-ming', 'Hello, Ming!', true),
                option('hello-username', 'Hello, userName!', false),
                option('template-raw', 'Hello, ${userName}!', false),
                option('no-output', '没有输出', false),
              ],
              tags: ['topic:template-literal'],
            },
            {
              key: 'string-literal',
              type: 'SINGLE_CHOICE',
              title: '下面哪一个值是字符串？',
              explanation:
                '被引号包裹的内容才是字符串字面量；裸写的数字是数值，不带引号的 true 是布尔值。',
              difficulty: 'MEDIUM',
              score: 10,
              isBattleEnabled: true,
              battlePresentation: 'TEXT_CHOICE',
              stemBlocks: [
                {
                  type: 'TEXT',
                  text: '下面哪一个值是字符串？',
                },
              ],
              options: [
                option('string', '"42"', true),
                option('number', '42', false),
                option('boolean', 'true', false),
                option('nan', 'NaN', false),
              ],
              tags: ['topic:string', 'topic:primitive'],
            },
            {
              key: 'const-reassign-error',
              type: 'SINGLE_CHOICE',
              title: '阅读下面代码，第二行最可能引发什么问题？',
              explanation:
                '`const` 声明的变量名不能重新赋值，因此第二行会因为重新赋值而报错。',
              difficulty: 'HARD',
              score: 10,
              isBattleEnabled: true,
              battlePresentation: 'CODE_READING',
              programmingLanguage: 'javascript',
              stemBlocks: [
                {
                  type: 'CODE',
                  language: 'javascript',
                  code: "const total = 1\ntotal = 2",
                },
              ],
              options: [
                option('const-reassign-error', '因为重新给 const 变量赋值而报错', true),
                option('creates-new-variable', '会自动创建一个新的 total 变量', false),
                option('prints-two', '会在控制台输出 2', false),
                option('becomes-string', 'total 会自动变成字符串 "2"', false),
              ],
              tags: ['topic:const', 'topic:assignment'],
            },
            {
              key: 'console-method-fill',
              type: 'FILL_BLANK',
              title: '填写 `console.___()` 中缺少的方法名，使它能够在控制台输出内容。',
              explanation:
                '`console.log()` 是 JavaScript 中最常用的控制台输出方法，因此空格中应填写 `log`。',
              difficulty: 'EASY',
              score: 10,
              isBattleEnabled: false,
              acceptedAnswers: ['log'],
              stemBlocks: [
                {
                  type: 'CODE',
                  language: 'javascript',
                  code: "console.___('Hello, Code Pioneer')",
                },
              ],
              tags: ['topic:console', 'question-type:fill-blank'],
            },
            {
              key: 'declare-language-code-fill',
              type: 'CODE_FILL',
              title: '补全一行变量声明，把字符串 `JavaScript` 保存到常量 `language` 中。',
              explanation:
                '使用 `const` 声明不会被重新赋值的变量，并通过等号把字符串赋给 `language`。',
              difficulty: 'EASY',
              score: 10,
              isBattleEnabled: true,
              battlePresentation: 'INPUT_CODE_FILL',
              programmingLanguage: 'javascript',
              acceptedAnswers: [
                "const language = 'JavaScript'",
                "const language = 'JavaScript';",
                'const language = "JavaScript"',
                'const language = "JavaScript";',
              ],
              stemBlocks: [
                {
                  type: 'TEXT',
                  text: '请填写完整的一行 JavaScript 代码。',
                },
                {
                  type: 'CODE',
                  language: 'javascript',
                  code: '// 在这里声明常量 language',
                },
              ],
              tags: ['topic:const', 'topic:string', 'question-type:code-fill'],
            },
          ],
        },
      ],
    },
    {
      key: 'js-control-flow-and-functions',
      title: '第二章：流程控制与函数',
      summary: '理解条件判断如何分支执行，并学会用函数和数组组织重复逻辑。',
      estimatedMinutes: 60,
      sortOrder: 2,
      quizTitle: 'JavaScript 流程与函数测验',
      quizDescription:
        '检验你是否理解布尔表达式、条件判断、函数参数和数组基础。',
      passScorePercent: 70,
      lessons: [
        {
          key: 'conditions-and-booleans',
          title: '课时 3：布尔值与条件判断',
          summary: '知道布尔值如何驱动 if / else 分支，并能读懂常见的比较表达式。',
          estimatedMinutes: 30,
          blocks: [
            {
              key: 'lesson-heading',
              type: 'HEADING',
              text: '条件判断的核心，是先得到 true 或 false',
              level: 2,
            },
            {
              key: 'intro',
              type: 'TEXT',
              text: 'if 语句并不神秘，它只是先计算条件表达式。如果结果是 true，就执行一个分支；如果结果是 false，就跳到另一个分支。比较运算符和逻辑运算符正是为了产生这样的布尔结果。',
            },
            {
              key: 'if-example',
              type: 'CODE',
              language: 'javascript',
              code: "const age = 20\nif (age >= 18) {\n  console.log('adult')\n} else {\n  console.log('minor')\n}",
            },
            {
              key: 'tip-read-condition',
              type: 'TIP',
              title: '读条件的小技巧',
              text: '把条件表达式翻译成口语最有帮助，例如 `age >= 18` 就读成“age 是否大于等于 18”。',
            },
            {
              key: 'example-boolean',
              type: 'EXAMPLE',
              title: '布尔值不是字符串',
              description:
                '`true` 和 `false` 是布尔字面量，它们不需要引号。如果加上引号，就会变成字符串。',
              language: 'javascript',
              code: "const enabled = true\nconst label = 'true'",
            },
          ],
          questions: [
            {
              key: 'boolean-result',
              type: 'SINGLE_CHOICE',
              title: '`5 > 3` 这个表达式的结果是什么？',
              explanation:
                '5 确实大于 3，因此比较表达式 `5 > 3` 的结果是布尔值 `true`。',
              difficulty: 'EASY',
              score: 10,
              isBattleEnabled: true,
              battlePresentation: 'TEXT_CHOICE',
              stemBlocks: [
                {
                  type: 'TEXT',
                  text: '`5 > 3` 这个表达式的结果是什么？',
                },
              ],
              options: [
                option('true', 'true', true),
                option('false', 'false', false),
                option('five', '5', false),
                option('three', '3', false),
              ],
              tags: ['topic:boolean', 'topic:comparison'],
            },
            {
              key: 'if-branch-output',
              type: 'SINGLE_CHOICE',
              title: '下面代码执行后会输出什么？',
              explanation:
                '`isMember` 的值是 `false`，因此 if 条件不成立，代码会进入 else 分支。',
              difficulty: 'EASY',
              score: 10,
              isBattleEnabled: true,
              battlePresentation: 'OUTPUT_PREDICTION',
              programmingLanguage: 'javascript',
              stemBlocks: [
                {
                  type: 'CODE',
                  language: 'javascript',
                  code: "const isMember = false\nif (isMember) {\n  console.log('discount')\n} else {\n  console.log('regular')\n}",
                },
              ],
              options: [
                option('regular', 'regular', true),
                option('discount', 'discount', false),
                option('both', 'discount 和 regular 都输出', false),
                option('nothing', '没有输出', false),
              ],
              tags: ['topic:if-else'],
            },
            {
              key: 'strict-equality',
              type: 'SINGLE_CHOICE',
              title: '在入门代码里，下面哪一个运算符最适合用来比较两个值是否相等？',
              explanation:
                '`===` 是严格相等比较，通常更适合初学阶段建立明确的比较习惯。',
              difficulty: 'MEDIUM',
              score: 10,
              isBattleEnabled: true,
              battlePresentation: 'TEXT_CHOICE',
              stemBlocks: [
                {
                  type: 'TEXT',
                  text: '在入门代码里，下面哪一个运算符最适合用来比较两个值是否相等？',
                },
              ],
              options: [
                option('strict-eq', '===', true),
                option('assign', '=', false),
                option('arrow', '=>', false),
                option('plus', '+', false),
              ],
              tags: ['topic:equality'],
            },
            {
              key: 'age-check',
              type: 'SINGLE_CHOICE',
              title: '若 `age` 为 16，下面哪个条件会得到 `true`？',
              explanation:
                '当 age 是 16 时，`age < 18` 为 true，其余选项都不成立。',
              difficulty: 'MEDIUM',
              score: 10,
              isBattleEnabled: true,
              battlePresentation: 'CODE_SNIPPET_CHOICE',
              programmingLanguage: 'javascript',
              stemBlocks: [
                {
                  type: 'TEXT',
                  text: '若 `age` 为 16，下面哪个条件会得到 `true`？',
                },
              ],
              options: [
                option('less-than-18', 'age < 18', true),
                option('greater-than-18', 'age > 18', false),
                option('equal-18', 'age === 18', false),
                option('greater-equal-21', 'age >= 21', false),
              ],
              tags: ['topic:comparison'],
            },
            {
              key: 'logical-and-reading',
              type: 'SINGLE_CHOICE',
              title: '在条件判断里，`isLoggedIn && hasProfile` 更接近下面哪种意思？',
              explanation:
                '`&&` 表示“并且”，两个条件都为 true 时，整个表达式才为 true。',
              difficulty: 'HARD',
              score: 10,
              isBattleEnabled: true,
              battlePresentation: 'CODE_PURPOSE',
              programmingLanguage: 'javascript',
              stemBlocks: [
                {
                  type: 'CODE',
                  language: 'javascript',
                  code: 'if (isLoggedIn && hasProfile) {\n  // ...\n}',
                },
                {
                  type: 'TEXT',
                  text: '这里的条件更接近下面哪种意思？',
                },
              ],
              options: [
                option('both-true', '用户已登录，并且已经拥有个人资料', true),
                option('either-true', '只要已登录或有个人资料其一成立即可', false),
                option('invert-boolean', '把两个变量都变成 false', false),
                option('create-profile', '自动为用户创建个人资料', false),
              ],
              tags: ['topic:logical-and'],
            },
          ],
        },
        {
          key: 'functions-and-arrays',
          title: '课时 4：函数与数组基础',
          summary: '理解函数参数和返回值，知道数组如何保存一组按顺序排列的数据。',
          estimatedMinutes: 30,
          blocks: [
            {
              key: 'lesson-heading',
              type: 'HEADING',
              text: '把重复逻辑放进函数，把同类数据放进数组',
              level: 2,
            },
            {
              key: 'intro',
              type: 'TEXT',
              text: '当你发现同一段逻辑会反复出现，就应该考虑写成函数。函数让一段代码可以被多次调用；数组则让一组相关的数据有序地放在一起，便于遍历和查找。',
            },
            {
              key: 'function-example',
              type: 'CODE',
              language: 'javascript',
              code: 'function greet(name) {\n  return `Hello, ${name}`\n}',
            },
            {
              key: 'array-example',
              type: 'EXAMPLE',
              title: '数组保存一组值',
              description:
                '数组最适合保存同一类、按顺序排列的数据，例如课程标签、待办项和每周学习计划。',
              language: 'javascript',
              code: "const topics = ['variables', 'functions', 'arrays']",
            },
            {
              key: 'tip-return',
              type: 'TIP',
              title: 'return 的作用',
              text: '函数内部使用 return，可以把结果交还给调用者。没有 return 的函数默认返回 undefined。',
            },
          ],
          questions: [
            {
              key: 'function-parameter-name',
              type: 'SINGLE_CHOICE',
              title: '阅读下面代码，`name` 在函数定义里扮演什么角色？',
              explanation:
                '`name` 是函数参数。调用函数时传入的值会绑定到这个参数名上。',
              difficulty: 'EASY',
              score: 10,
              isBattleEnabled: true,
              battlePresentation: 'CODE_READING',
              programmingLanguage: 'javascript',
              stemBlocks: [
                {
                  type: 'CODE',
                  language: 'javascript',
                  code: 'function greet(name) {\n  return `Hello, ${name}`\n}',
                },
              ],
              options: [
                option('parameter', '函数参数', true),
                option('html-attribute', 'HTML 属性', false),
                option('css-selector', 'CSS 选择器', false),
                option('array-index', '数组下标', false),
              ],
              tags: ['topic:function-parameter'],
            },
            {
              key: 'function-call-result',
              type: 'SINGLE_CHOICE',
              title: '下面代码执行后，`result` 的值是什么？',
              explanation:
                '调用 `double(4)` 时，参数 n 为 4，函数返回 `4 * 2`，因此结果是 8。',
              difficulty: 'EASY',
              score: 10,
              isBattleEnabled: true,
              battlePresentation: 'OUTPUT_PREDICTION',
              programmingLanguage: 'javascript',
              stemBlocks: [
                {
                  type: 'CODE',
                  language: 'javascript',
                  code: 'function double(n) {\n  return n * 2\n}\nconst result = double(4)',
                },
              ],
              options: [
                option('eight', '8', true),
                option('four', '4', false),
                option('undefined', 'undefined', false),
                option('string-eight', '"8"', false),
              ],
              tags: ['topic:function-return'],
            },
            {
              key: 'array-literal',
              type: 'SINGLE_CHOICE',
              title: '下面哪一项是 JavaScript 数组字面量？',
              explanation:
                '方括号 `[]` 是数组字面量语法，能够按顺序保存多个值。',
              difficulty: 'MEDIUM',
              score: 10,
              isBattleEnabled: true,
              battlePresentation: 'CODE_SNIPPET_CHOICE',
              programmingLanguage: 'javascript',
              stemBlocks: [
                {
                  type: 'TEXT',
                  text: '下面哪一项是 JavaScript 数组字面量？',
                },
              ],
              options: [
                option('array-literal', "['red', 'green', 'blue']", true),
                option('object-literal', "{ first: 'red', second: 'green' }", false),
                option('function-call', "colors('red', 'green', 'blue')", false),
                option('string-list', "'red, green, blue'", false),
              ],
              tags: ['topic:array'],
            },
            {
              key: 'array-index',
              type: 'SINGLE_CHOICE',
              title: '如果 `const items = ["a", "b", "c"]`，那么 `items[0]` 的结果是什么？',
              explanation:
                '数组下标从 0 开始，因此第一个元素的下标是 0，结果为 `"a"`。',
              difficulty: 'MEDIUM',
              score: 10,
              isBattleEnabled: true,
              battlePresentation: 'OUTPUT_PREDICTION',
              programmingLanguage: 'javascript',
              stemBlocks: [
                {
                  type: 'CODE',
                  language: 'javascript',
                  code: 'const items = ["a", "b", "c"]\nitems[0]',
                },
              ],
              options: [
                option('a', '"a"', true),
                option('b', '"b"', false),
                option('c', '"c"', false),
                option('undefined', 'undefined', false),
              ],
              tags: ['topic:array-index'],
            },
            {
              key: 'return-purpose',
              type: 'SINGLE_CHOICE',
              title: '在函数里写 `return total` 的主要目的是什么？',
              explanation:
                '`return` 用来把函数内部计算出的结果返回给调用者，便于后续继续使用这个值。',
              difficulty: 'HARD',
              score: 10,
              isBattleEnabled: true,
              battlePresentation: 'CODE_PURPOSE',
              programmingLanguage: 'javascript',
              stemBlocks: [
                {
                  type: 'CODE',
                  language: 'javascript',
                  code: 'function sum(a, b) {\n  const total = a + b\n  return total\n}',
                },
                {
                  type: 'TEXT',
                  text: '这里 `return total` 的主要目的是什么？',
                },
              ],
              options: [
                option('give-result-back', '把计算结果返回给调用函数的地方', true),
                option('create-loop', '创建一个新的循环', false),
                option('pause-browser', '让浏览器暂停执行页面', false),
                option('rename-variable', '把 total 改名为 return', false),
              ],
              tags: ['topic:return', 'topic:function'],
            },
            {
              key: 'strict-equality-operator-fill',
              type: 'FILL_BLANK',
              title: 'JavaScript 中用于严格相等比较的运算符是什么？',
              explanation:
                '严格相等运算符是 `===`，它比较值和类型，不会先进行隐式类型转换。',
              difficulty: 'EASY',
              score: 10,
              isBattleEnabled: false,
              acceptedAnswers: ['==='],
              stemBlocks: [
                {
                  type: 'CODE',
                  language: 'javascript',
                  code: 'const same = value ___ 10',
                },
              ],
              tags: ['topic:strict-equality', 'question-type:fill-blank'],
            },
            {
              key: 'function-return-code-fill',
              type: 'CODE_FILL',
              title: '补全函数体中的代码，使 `sum(2, 3)` 返回数字 `5`。',
              explanation:
                '函数需要使用 `return` 把 `a + b` 的计算结果返回给调用者。',
              difficulty: 'MEDIUM',
              score: 10,
              isBattleEnabled: true,
              battlePresentation: 'INPUT_CODE_FILL',
              programmingLanguage: 'javascript',
              acceptedAnswers: ['return a + b', 'return a + b;', 'return a+b', 'return a+b;'],
              stemBlocks: [
                {
                  type: 'CODE',
                  language: 'javascript',
                  code: 'function sum(a, b) {\n  // 在这里填写一行代码\n}',
                },
              ],
              explanationBlocks: [
                {
                  type: 'CODE',
                  language: 'javascript',
                  code: 'function sum(a, b) {\n  return a + b\n}',
                },
              ],
              tags: ['topic:return', 'topic:function', 'question-type:code-fill'],
            },
          ],
        },
      ],
    },
  ],
};
