import type { SeedCourse, SeedQuestionOption } from '../types';
import { PYTHON_BASIC_CHAPTER_02 } from './python-basic-chapter-02';
import { PYTHON_BASIC_CHAPTER_03 } from './python-basic-chapter-03';
import { PYTHON_BASIC_CHAPTER_04 } from './python-basic-chapter-04';
import { PYTHON_BASIC_CHAPTER_05 } from './python-basic-chapter-05';
import { PYTHON_BASIC_CHAPTER_06 } from './python-basic-chapter-06';
import { PYTHON_BASIC_CHAPTER_07 } from './python-basic-chapter-07';
import { PYTHON_BASIC_CHAPTER_08 } from './python-basic-chapter-08';
import { PYTHON_BASIC_CHAPTER_09 } from './python-basic-chapter-09';
import { PYTHON_BASIC_CHAPTER_10 } from './python-basic-chapter-10';
import { PYTHON_BASIC_CHAPTER_11 } from './python-basic-chapter-11';
import { PYTHON_BASIC_CHAPTER_12 } from './python-basic-chapter-12';
import { PYTHON_BASIC_CHAPTER_13 } from './python-basic-chapter-13';
import { PYTHON_BASIC_CHAPTER_14 } from './python-basic-chapter-14';
import { PYTHON_BASIC_CHAPTER_15 } from './python-basic-chapter-15';

function option(
  key: string,
  content: string,
  isCorrect: boolean,
): SeedQuestionOption {
  return { key, content, isCorrect };
}

const NORMAL_FILL = {
  trim: true,
  normalizeLineEndings: true,
  caseSensitive: false,
  collapseWhitespace: true,
} as const;

const PYTHON_CODE_FILL = {
  trim: true,
  normalizeLineEndings: true,
  caseSensitive: true,
  collapseWhitespace: false,
} as const;

export const PYTHON_BASIC_COURSE: SeedCourse = {
  version: 'v1',
  key: 'python-basic',
  slug: 'python-basic',
  title: 'Python 基础入门',
  summary:
    '面向零基础学习者，通过短知识讲解、可运行示例、常见错误分析和 Battle 精选题掌握 Python 基础语法。',
  description:
    '课程帮助学习者逐步掌握 Python 基础语法，并具备阅读简单程序、判断运行结果和定位基础错误的能力。当前版本导入第一章“Python 初体验”，后续章节继续使用相同稳定课程标识追加。',
  category: 'BACKEND',
  language: 'Python',
  difficulty: 'BEGINNER',
  estimatedMinutes: 720,
  targetAudience:
    '没有编程基础、希望从零开始学习 Python，并通过练习和对战巩固知识的学生。',
  learningObjectives: [
    '能阅读并编写基础 Python 程序',
    '能使用变量、常见数据类型和基础运算符',
    '能完成输入、输出和简单数据处理',
    '能阅读代码并判断程序的运行结果',
    '能识别常见的 Python 基础语法错误',
    '为后续学习条件判断、循环、函数和容器类型建立基础',
  ],
  status: 'PUBLISHED',
  sortOrder: 200,
  retiredChapterIds: [
    '86d43efa-3f4c-4adc-8e17-a718f3d26efe',
    '7d1d410c-44c3-4f23-a54f-17095f503585',
  ],
  chapters: [
    {
      key: 'python-first-experience',
      title: '第一章：Python 初体验',
      summary:
        '认识 Python 程序的基本结构，学习输出、注释、变量、基础数据类型、输入和简单运算，并完成第一个可以与用户交互的小程序。',
      estimatedMinutes: 60,
      sortOrder: 1,
      quizTitle: 'Python 初体验章节测验',
      quizDescription:
        '检验你是否掌握输出、注释、变量、基础数据类型、输入和简单运算。提交后可查看每题答案与解析。',
      passScorePercent: 70,
      lessons: [
        {
          key: 'run-first-python-program',
          title: '课时 1：运行第一段 Python 程序',
          summary:
            '认识 Python 程序，学习使用 print() 输出内容，并理解代码从上到下执行。',
          estimatedMinutes: 10,
          blocks: [
            {
              key: 'chapter-learning-objectives',
              type: 'TIP',
              title: '本章学习目标',
              text: '完成本章后，你将能够：\n\n- 理解 Python 程序按顺序执行的基本特点\n- 使用 print() 输出文字和变量\n- 使用注释说明代码用途\n- 理解变量用于保存和更新数据\n- 区分字符串、整数、浮点数和布尔值\n- 使用 input() 接收用户输入\n- 使用加、减、乘、除完成简单计算\n- 阅读基础代码并判断输出结果',
            },
            {
              key: 'what-is-python',
              type: 'HEADING',
              text: '什么是 Python',
              level: 2,
            },
            {
              key: 'python-introduction',
              type: 'TEXT',
              text: 'Python 是一种编程语言。人可以使用 Python 编写一组明确的指令，让计算机按照顺序完成任务。\n\n在本课程中，你不需要先记住复杂概念。第一步只是让计算机按照你的要求显示一段文字。',
            },
            {
              key: 'first-line-heading',
              type: 'HEADING',
              text: '第一行 Python 代码',
              level: 2,
            },
            {
              key: 'hello-code',
              type: 'CODE',
              language: 'python',
              code: 'print("Hello, Code Pioneer!")',
            },
            {
              key: 'hello-output',
              type: 'TEXT',
              text: '运行这段代码后，程序会显示：',
            },
            {
              key: 'hello-output-code',
              type: 'CODE',
              language: 'text',
              code: 'Hello, Code Pioneer!',
            },
            {
              key: 'print-and-string',
              type: 'TEXT',
              text: 'print() 是 Python 内置的输出函数。括号中的内容会被输出到运行窗口。\n\n字符串需要使用英文单引号或英文双引号包裹。下面两种写法都可以正常运行：',
            },
            {
              key: 'quote-examples',
              type: 'CODE',
              language: 'python',
              code: 'print("Python")\nprint(\'Python\')',
            },
            {
              key: 'remember-print',
              type: 'TIP',
              title: '先理解作用，不急着记术语',
              text: '当前只需要记住：print() 用来输出内容。后续课程会进一步解释“函数”和“字符串”。',
            },
            {
              key: 'execution-order-heading',
              type: 'HEADING',
              text: '程序按顺序执行',
              level: 2,
            },
            {
              key: 'execution-order-code',
              type: 'CODE',
              language: 'python',
              code: 'print("第一行")\nprint("第二行")\nprint("第三行")',
            },
            {
              key: 'execution-order-text',
              type: 'TEXT',
              text: 'Python 默认从上到下逐行执行代码，因此输出顺序也是“第一行、第二行、第三行”。',
            },
            {
              key: 'learning-goal-example',
              type: 'EXAMPLE',
              title: '输出个人学习目标',
              description: '连续使用 print() 输出三行信息。',
              language: 'python',
              code: 'print("课程：Python 基础入门")\nprint("目标：学会阅读简单代码")\nprint("方式：学习、练习、Battle")',
            },
            {
              key: 'english-punctuation-warning',
              type: 'WARNING',
              title: '注意英文符号',
              text: '代码中的括号和引号应使用英文符号。中文引号“ ”不能直接代替英文引号。',
            },
          ],
          questions: [
            {
              key: 'print-code-pioneer-output',
              type: 'SINGLE_CHOICE',
              title:
                '第一次学习 Python 时，我们通常会先写一个“Hello World”程序。下面哪个函数可以在控制台输出内容？',
              explanation:
                'Python 使用 print() 函数向控制台输出内容，这是每位 Python 初学者都会接触到的第一个函数。',
              difficulty: 'EASY',
              score: 10,
              isBattleEnabled: true,
              battlePresentation: 'CODE_PURPOSE',
              programmingLanguage: 'python',
              options: [
                option('plain-output', 'echo("Hello")', false),
                option('quoted-output', 'print("Hello")', true),
                option('print-name', 'output("Hello")', false),
                option('runtime-error', 'show("Hello")', false),
              ],
              tags: ['topic:print', 'topic:output'],
            },
            {
              key: 'print-execution-order',
              type: 'FILL_BLANK',
              title:
                '码站先锋第一次启动时，希望控制台显示“欢迎来到码站先锋”。Python 用于输出内容的函数叫做：__________',
              explanation:
                'print() 是 Python 的标准输出函数，用于把内容显示到控制台。',
              difficulty: 'EASY',
              score: 10,
              isBattleEnabled: false,
              acceptedAnswers: ['print'],
              answerNormalization: NORMAL_FILL,
              tags: ['topic:print', 'topic:output'],
            },
            {
              key: 'print-welcome-code-fill',
              type: 'CODE_FILL',
              title:
                '第一次运行程序时，希望控制台输出“欢迎来到码站先锋”。请补全代码。',
              explanation: '使用 print() 即可输出指定文字。',
              difficulty: 'EASY',
              score: 10,
              isBattleEnabled: true,
              battlePresentation: 'INPUT_CODE_FILL',
              programmingLanguage: 'python',
              acceptedAnswers: [
                'print("欢迎来到码站先锋")',
                "print('欢迎来到码站先锋')",
              ],
              answerNormalization: PYTHON_CODE_FILL,
              stemBlocks: [
                { type: 'CODE', language: 'python', code: '__________' },
              ],
              explanationBlocks: [
                {
                  type: 'CODE',
                  language: 'python',
                  code: 'print("欢迎来到码站先锋")',
                },
              ],
              tags: ['topic:print', 'topic:string', 'topic:output'],
            },
          ],
        },
        {
          key: 'python-comments',
          title: '课时 2：使用注释说明代码',
          summary: '学习单行注释的写法，并理解注释不会作为程序指令执行。',
          estimatedMinutes: 8,
          blocks: [
            {
              key: 'comment-purpose-heading',
              type: 'HEADING',
              text: '注释是写给人看的说明',
              level: 2,
            },
            {
              key: 'comment-purpose',
              type: 'TEXT',
              text: '当代码越来越多时，仅靠代码本身可能很难快速看懂用途。注释可以解释代码在做什么，帮助自己和其他人阅读程序。\n\nPython 使用井号 # 开始单行注释。',
            },
            {
              key: 'comment-code',
              type: 'CODE',
              language: 'python',
              code: '# 输出欢迎语\nprint("欢迎学习 Python")',
            },
            {
              key: 'comment-behavior',
              type: 'TEXT',
              text: '运行上面的程序时，只会输出“欢迎学习 Python”。井号后面的注释不会作为程序指令执行。',
            },
            {
              key: 'comment-example',
              type: 'EXAMPLE',
              title: '为多段代码增加说明',
              description: '注释可以单独占一行，也可以写在代码末尾。',
              language: 'python',
              code: '# 保存课程名称\ncourse = "Python 基础入门"\n\nprint(course)  # 输出课程名称',
            },
            {
              key: 'useful-comment-tip',
              type: 'TIP',
              title: '注释应解释原因或用途',
              text: '好的注释通常说明代码的用途或容易误解的地方，而不是把代码逐字翻译一遍。',
            },
            {
              key: 'commented-code-warning',
              type: 'WARNING',
              title: '不要把重要代码写进注释',
              text: '被 # 注释掉的代码不会执行。如果输出语句前加了 #，程序将不会显示相应内容。',
            },
          ],
          questions: [
            {
              key: 'commented-print-output',
              type: 'SINGLE_CHOICE',
              title:
                '为了方便阅读代码，我们希望给程序添加说明。Python 中使用什么符号表示单行注释？',
              explanation: 'Python 使用 # 编写单行注释，注释不会参与程序运行。',
              difficulty: 'EASY',
              score: 10,
              isBattleEnabled: true,
              battlePresentation: 'CODE_PURPOSE',
              programmingLanguage: 'python',
              options: [
                option('a', '//', false),
                option('b', '#', true),
                option('a-and-b', '<!-- -->', false),
                option('error', '/* */', false),
              ],
              tags: ['topic:comment'],
            },
            {
              key: 'single-line-comment-symbol',
              type: 'CODE_FILL',
              title:
                '下面程序需要输出一句欢迎语。请在第一行补充一条注释：“这是我的第一个 Python 程序”。',
              explanation: '注释用于解释代码，提高代码可读性。',
              difficulty: 'EASY',
              score: 10,
              isBattleEnabled: true,
              battlePresentation: 'INPUT_CODE_FILL',
              programmingLanguage: 'python',
              acceptedAnswers: [
                '# 这是我的第一个 Python 程序',
                '#这是我的第一个 Python 程序',
              ],
              answerNormalization: PYTHON_CODE_FILL,
              stemBlocks: [
                {
                  type: 'CODE',
                  language: 'python',
                  code: '__________\nprint("欢迎来到码站先锋")',
                },
              ],
              explanationBlocks: [
                {
                  type: 'CODE',
                  language: 'python',
                  code: '# 这是我的第一个 Python 程序\nprint("欢迎来到码站先锋")',
                },
              ],
              tags: ['topic:comment'],
            },
          ],
        },
        {
          key: 'python-variables',
          title: '课时 3：用变量保存数据',
          summary: '理解变量的作用，学习赋值、读取变量和重新赋值。',
          estimatedMinutes: 12,
          blocks: [
            {
              key: 'variable-box-heading',
              type: 'HEADING',
              text: '变量像一个带标签的盒子',
              level: 2,
            },
            {
              key: 'variable-box-text',
              type: 'TEXT',
              text: '变量用于保存后续还会使用的数据。可以把变量理解为一个贴有名称标签的盒子：变量名是标签，变量值是盒子中的内容。',
            },
            {
              key: 'variable-name-code',
              type: 'CODE',
              language: 'python',
              code: 'name = "小码"\nprint(name)',
            },
            {
              key: 'assignment-explanation',
              type: 'TEXT',
              text: '第一行把字符串“小码”保存到变量 name 中；第二行读取 name 保存的值并输出，因此结果是“小码”。\n\n等号 = 在这里表示“把右边的值保存到左边的变量中”，不是数学中的“左右相等”。',
            },
            {
              key: 'reassignment-heading',
              type: 'HEADING',
              text: '变量可以重新赋值',
              level: 2,
            },
            {
              key: 'reassignment-code',
              type: 'CODE',
              language: 'python',
              code: 'score = 10\nscore = 20\nprint(score)',
            },
            {
              key: 'reassignment-text',
              type: 'TEXT',
              text: '同一个变量可以被重新赋值。第二次赋值会更新 score 保存的值，所以最终输出 20。',
            },
            {
              key: 'user-info-example',
              type: 'EXAMPLE',
              title: '保存用户信息',
              description: '使用不同变量保存不同类型的信息。',
              language: 'python',
              code: 'nickname = "先锋学员"\nlevel = 1\n\nprint(nickname)\nprint(level)',
            },
            {
              key: 'variable-rules-heading',
              type: 'HEADING',
              text: '变量命名的基础规则',
              level: 2,
            },
            {
              key: 'variable-rules-text',
              type: 'TEXT',
              text: '变量名可以包含英文字母、数字和下划线，但不能以数字开头，也不能使用 Python 关键字。\n\n下面是合法变量名：',
            },
            {
              key: 'valid-variable-names',
              type: 'CODE',
              language: 'python',
              code: 'name = "小码"\nuser_name = "先锋学员"\nscore2 = 80',
            },
            {
              key: 'invalid-variable-intro',
              type: 'TEXT',
              text: '下面的写法不合法：',
            },
            {
              key: 'invalid-variable-names',
              type: 'CODE',
              language: 'python',
              code: '# 不能以数字开头\n2score = 80\n\n# 不能使用减号连接\nuser-name = "小码"',
            },
            {
              key: 'meaningful-name-tip',
              type: 'TIP',
              title: '使用有意义的变量名',
              text: '相比 a、b、x，name、score、course_title 更容易让人理解变量保存的内容。',
            },
          ],
          questions: [
            {
              key: 'reassigned-score-output',
              type: 'SINGLE_CHOICE',
              title:
                'Battle 玩家昵称需要保存下来，方便排行榜显示。下面哪个变量名最适合保存玩家昵称？',
              explanation: '变量名应具有实际含义，并遵循 Python 命名规则。',
              difficulty: 'EASY',
              score: 10,
              isBattleEnabled: true,
              battlePresentation: 'BUG_FIX',
              programmingLanguage: 'python',
              options: [
                option('ten', '123', false),
                option('twenty-five', 'player_name', true),
                option('both', 'print', false),
                option('variable-name', '@', false),
              ],
              tags: ['topic:variable', 'topic:variable-name'],
            },
            {
              key: 'valid-variable-name',
              type: 'SINGLE_CHOICE',
              title: '下面代码用于保存玩家昵称。变量中保存的是什么？',
              explanation: '变量可以保存数据，本题保存的是字符串类型的昵称。',
              difficulty: 'EASY',
              score: 10,
              isBattleEnabled: true,
              battlePresentation: 'CODE_READING',
              programmingLanguage: 'python',
              stemBlocks: [
                {
                  type: 'CODE',
                  language: 'python',
                  code: 'player_name = "新手玩家"',
                },
              ],
              options: [
                option('user-name-valid', '玩家头像', false),
                option('starts-number', '玩家昵称', true),
                option('contains-hyphen', '玩家密码', false),
                option('keyword-class', '玩家积分', false),
              ],
              tags: ['topic:variable', 'topic:string'],
            },
            {
              key: 'updated-name-output',
              type: 'CODE_FILL',
              title:
                'Battle 玩家当前 Rating 为 1000。请补全代码，把 Rating 保存到变量中。',
              explanation: '数字可以直接赋值给变量。',
              difficulty: 'EASY',
              score: 10,
              isBattleEnabled: true,
              battlePresentation: 'INPUT_CODE_FILL',
              programmingLanguage: 'python',
              acceptedAnswers: ['1000'],
              answerNormalization: PYTHON_CODE_FILL,
              stemBlocks: [
                {
                  type: 'CODE',
                  language: 'python',
                  code: 'rating = ________\nprint(rating)',
                },
              ],
              explanationBlocks: [
                {
                  type: 'CODE',
                  language: 'python',
                  code: 'rating = 1000\nprint(rating)',
                },
              ],
              tags: ['topic:variable', 'topic:int', 'topic:assignment'],
            },
            {
              key: 'nickname-assignment-code-fill',
              type: 'SINGLE_CHOICE',
              title: '下面哪个数据属于字符串（String）？',
              explanation: '字符串需要使用引号包裹。',
              difficulty: 'EASY',
              score: 10,
              isBattleEnabled: true,
              battlePresentation: 'CODE_READING',
              programmingLanguage: 'python',
              options: [
                option('user-name-valid', '100', false),
                option('starts-number', '3.14', false),
                option('contains-hyphen', '"Python"', true),
                option('keyword-class', 'True', false),
              ],
              tags: ['topic:string', 'topic:data-type'],
            },
          ],
        },
        {
          key: 'python-basic-types',
          title: '课时 4：认识基础数据类型',
          summary:
            '认识字符串、整数、浮点数和布尔值，并学习使用 type() 查看数据类型。',
          estimatedMinutes: 10,
          blocks: [
            {
              key: 'data-types-heading',
              type: 'HEADING',
              text: '不同数据有不同类型',
              level: 2,
            },
            {
              key: 'data-types-text',
              type: 'TEXT',
              text: '程序处理的数据并不完全相同。姓名属于文字，年龄通常是整数，身高可能带有小数，而“是否完成”只有是或否两种状态。\n\nPython 常见基础数据类型包括：\n\n- str：字符串，用于表示文字\n- int：整数\n- float：浮点数，也就是带小数的数据\n- bool：布尔值，只有 True 和 False',
            },
            {
              key: 'data-types-code',
              type: 'CODE',
              language: 'python',
              code: 'name = "Python 学员"\nage = 18\nheight = 168.5\nis_student = True',
            },
            {
              key: 'data-types-quotes',
              type: 'TEXT',
              text: '字符串需要使用引号包裹。整数和浮点数不能随意加引号，否则它们会变成字符串。',
            },
            {
              key: 'type-function-heading',
              type: 'HEADING',
              text: '使用 type() 查看类型',
              level: 2,
            },
            {
              key: 'type-function-code',
              type: 'CODE',
              language: 'python',
              code: 'age = 18\nprint(type(age))',
            },
            {
              key: 'type-function-text',
              type: 'TEXT',
              text: '程序会显示 age 对应的数据类型。当前阶段不要求记住完整输出格式，只需要理解 type() 可以帮助我们确认变量保存的数据类型。',
            },
            {
              key: 'number-string-example',
              type: 'EXAMPLE',
              title: '同样的字符可能属于不同类型',
              description: '18 和 "18" 看起来相似，但类型不同。',
              language: 'python',
              code: 'number_age = 18\ntext_age = "18"\n\nprint(type(number_age))\nprint(type(text_age))',
            },
            {
              key: 'boolean-case-warning',
              type: 'WARNING',
              title: 'True 和 False 首字母必须大写',
              text: 'Python 中的布尔值写作 True 和 False。写成 true 或 false 会被当作未定义的变量名。',
            },
          ],
          questions: [
            {
              key: 'price-float-type',
              type: 'CODE_FILL',
              title: '程序需要保存用户输入的昵称。请补全代码。',
              explanation: 'input() 用于获取用户输入。',
              difficulty: 'EASY',
              score: 10,
              isBattleEnabled: true,
              battlePresentation: 'INPUT_CODE_FILL',
              programmingLanguage: 'python',
              acceptedAnswers: ['input'],
              answerNormalization: PYTHON_CODE_FILL,
              stemBlocks: [
                {
                  type: 'CODE',
                  language: 'python',
                  code: 'nickname = ________("请输入昵称：")\nprint(nickname)',
                },
              ],
              explanationBlocks: [
                {
                  type: 'CODE',
                  language: 'python',
                  code: 'nickname = input("请输入昵称：")\nprint(nickname)',
                },
              ],
              tags: ['topic:input', 'topic:string'],
            },
            {
              key: 'quoted-age-string',
              type: 'SINGLE_CHOICE',
              title: '下面哪个属于整数（int）？',
              explanation: '整数没有小数部分。',
              difficulty: 'EASY',
              score: 10,
              isBattleEnabled: true,
              battlePresentation: 'CODE_READING',
              programmingLanguage: 'python',
              options: [
                option('integer', '100', true),
                option('string', '100.0', false),
                option('float', '"100"', false),
                option('boolean', 'False', false),
              ],
              tags: ['topic:int', 'topic:data-type'],
            },
            {
              key: 'false-boolean-spelling',
              type: 'FILL_BLANK',
              title: 'Python 获取用户输入时，需要使用：______________',
              explanation: 'input() 返回用户输入内容。',
              difficulty: 'EASY',
              score: 10,
              isBattleEnabled: false,
              acceptedAnswers: ['input'],
              answerNormalization: NORMAL_FILL,
              tags: ['topic:input'],
            },
          ],
        },
        {
          key: 'python-input',
          title: '课时 5：使用 input() 接收输入',
          summary: '学习接收用户输入，并理解 input() 返回字符串。',
          estimatedMinutes: 10,
          blocks: [
            {
              key: 'input-heading',
              type: 'HEADING',
              text: '让程序接收用户输入',
              level: 2,
            },
            {
              key: 'input-introduction',
              type: 'TEXT',
              text: 'print() 负责把内容输出给用户，input() 可以暂停程序并等待用户输入内容。',
            },
            {
              key: 'input-name-code',
              type: 'CODE',
              language: 'python',
              code: 'name = input("请输入你的名字：")\nprint("你好，", name)',
            },
            {
              key: 'input-name-text',
              type: 'TEXT',
              text: '程序先显示提示文字，用户输入名字后，input() 会把输入内容保存到变量 name 中，随后程序输出问候语。',
            },
            {
              key: 'input-string-heading',
              type: 'HEADING',
              text: 'input() 返回字符串',
              level: 2,
            },
            {
              key: 'input-age-code',
              type: 'CODE',
              language: 'python',
              code: 'age = input("请输入年龄：")\nprint(type(age))',
            },
            {
              key: 'input-string-text',
              type: 'TEXT',
              text: '即使用户输入 18，input() 得到的仍然是字符串 "18"，而不是整数 18。\n\n这一区别会影响数学运算。类型转换将在后续章节详细学习。',
            },
            {
              key: 'self-introduction-example',
              type: 'EXAMPLE',
              title: '制作简单自我介绍程序',
              description: '接收昵称和学习目标，再输出组合信息。',
              language: 'python',
              code: 'nickname = input("请输入昵称：")\ngoal = input("请输入学习目标：")\n\nprint("你好，", nickname)\nprint("你的目标是：", goal)',
            },
            {
              key: 'input-number-warning',
              type: 'WARNING',
              title: '输入的数字暂时不能直接参与加法',
              text: 'input() 返回字符串。如果直接把输入结果和整数相加，程序可能报错。后续会学习 int() 和 float() 类型转换。',
            },
          ],
          questions: [
            {
              key: 'input-age-type',
              type: 'SINGLE_CHOICE',
              title:
                'Battle 玩家答对了 6 道题，每题 2 分。计算总分应该使用哪个运算符？',
              explanation: '总分 = 答对题数 × 每题分值。',
              difficulty: 'EASY',
              score: 10,
              isBattleEnabled: true,
              battlePresentation: 'CODE_PURPOSE',
              programmingLanguage: 'python',
              options: [
                option('int', '+', false),
                option('float', '-', false),
                option('str', '*', true),
                option('bool', '/', false),
              ],
              tags: ['topic:multiplication', 'topic:operator'],
            },
            {
              key: 'course-input-code-fill',
              type: 'CODE_FILL',
              title:
                'Battle 每答对一题获得 2 分，玩家答对了 5 道题。请补全代码，计算最终得分。',
              explanation: '总分等于答对题数乘以每题分数。',
              difficulty: 'MEDIUM',
              score: 10,
              isBattleEnabled: true,
              battlePresentation: 'INPUT_CODE_FILL',
              programmingLanguage: 'python',
              acceptedAnswers: [
                'correct * score_per_question',
                'score_per_question * correct',
              ],
              answerNormalization: PYTHON_CODE_FILL,
              stemBlocks: [
                {
                  type: 'CODE',
                  language: 'python',
                  code: 'correct = 5\nscore_per_question = 2\ntotal_score = __________________\nprint(total_score)',
                },
              ],
              explanationBlocks: [
                {
                  type: 'CODE',
                  language: 'python',
                  code: 'correct = 5\nscore_per_question = 2\ntotal_score = correct * score_per_question\nprint(total_score)',
                },
              ],
              tags: ['topic:multiplication', 'topic:variable', 'topic:score'],
            },
          ],
        },
        {
          key: 'python-arithmetic',
          title: '课时 6：完成简单运算',
          summary: '使用变量和基础运算符完成加、减、乘、除。',
          estimatedMinutes: 10,
          blocks: [
            {
              key: 'python-calculation-heading',
              type: 'HEADING',
              text: '使用 Python 计算',
              level: 2,
            },
            {
              key: 'operators-text',
              type: 'TEXT',
              text: 'Python 可以直接完成常见数学运算。本章先学习四个基础运算符：\n\n- + 加法\n- - 减法\n- * 乘法\n- / 除法',
            },
            {
              key: 'operators-code',
              type: 'CODE',
              language: 'python',
              code: 'a = 10\nb = 5\n\nprint(a + b)\nprint(a - b)\nprint(a * b)\nprint(a / b)',
            },
            {
              key: 'division-result',
              type: 'TEXT',
              text: '上面的程序依次输出 15、5、50 和 2.0。\n\n使用 / 进行除法时，即使能够整除，Python 通常也会得到浮点数结果。',
            },
            {
              key: 'save-result-heading',
              type: 'HEADING',
              text: '先计算，再保存结果',
              level: 2,
            },
            {
              key: 'save-result-code',
              type: 'CODE',
              language: 'python',
              code: 'price = 12\ncount = 3\ntotal = price * count\n\nprint(total)',
            },
            {
              key: 'save-result-text',
              type: 'TEXT',
              text: '程序先计算 price * count，再把结果保存到 total 中。变量可以保存计算结果，方便后续继续使用。',
            },
            {
              key: 'battle-score-example',
              type: 'EXAMPLE',
              title: '计算 Battle 得分',
              description: '假设答对 6 题，每题获得 2 分，计算总得分。',
              language: 'python',
              code: 'correct_count = 6\nscore_per_question = 2\ntotal_score = correct_count * score_per_question\n\nprint(total_score)',
            },
            {
              key: 'simple-expression-tip',
              type: 'TIP',
              title: '先关注简单表达式',
              text: '本章只学习 +、-、*、/。整除、取余、幂运算和运算优先级将在后续章节继续学习。',
            },
            {
              key: 'chapter-summary-heading',
              type: 'HEADING',
              text: '你已经完成了第一个 Python 学习闭环',
              level: 2,
            },
            {
              key: 'chapter-summary-text',
              type: 'TEXT',
              text: '本章从第一行 Python 代码开始，学习了输出、注释、变量、基础数据类型、用户输入和简单运算。\n\n现在你已经能够：\n\n- 使用 print() 输出文字和变量\n- 使用 # 编写单行注释\n- 创建变量并更新变量保存的值\n- 区分 str、int、float 和 bool\n- 使用 input() 接收用户输入\n- 使用 +、-、*、/ 完成简单计算\n- 阅读基础代码并判断输出结果\n- 识别变量命名、引号和布尔值大小写等常见错误\n\n下一章将继续学习输入结果的类型转换、更多运算符和表达式，让程序能够真正处理用户输入的数字。',
            },
            {
              key: 'battle-ability-tip',
              type: 'TIP',
              title: '本章 Battle 能力',
              text: '本章 Battle 题重点考察输出预测、变量更新、数据类型、input() 返回值和简单运算，而不是学习态度或无意义常识。',
            },
            {
              key: 'challenge-heading',
              type: 'HEADING',
              text: '第一章综合挑战：制作个人学习名片（不计分）',
              level: 2,
            },
            {
              key: 'challenge-text',
              type: 'TEXT',
              text: '请尝试编写一个程序：\n\n1. 询问用户昵称\n2. 询问用户正在学习的课程\n3. 保存用户当前的 Battle 得分\n4. 输出一张简单学习名片',
            },
            {
              key: 'challenge-output',
              type: 'CODE',
              language: 'text',
              code: '请输入昵称：小码\n请输入课程：Python\n昵称：小码\n课程：Python\nBattle 得分：20',
            },
            {
              key: 'challenge-reference',
              type: 'EXAMPLE',
              title: '个人学习名片参考代码',
              description: '理解每一行的作用后，再尝试修改昵称、课程和得分。',
              language: 'python',
              code: 'nickname = input("请输入昵称：")\ncourse = input("请输入课程：")\nbattle_score = 20\n\nprint("昵称：", nickname)\nprint("课程：", course)\nprint("Battle 得分：", battle_score)',
            },
            {
              key: 'challenge-closing',
              type: 'TEXT',
              text: '如果你能够理解这段程序每一行的作用，就已经掌握了本章的核心内容。',
            },
          ],
          questions: [
            {
              key: 'addition-output',
              type: 'SINGLE_CHOICE',
              title: '下面哪个表达式会输出：Hello Python',
              explanation: 'Python 使用 print() 函数输出字符串。',
              difficulty: 'EASY',
              score: 10,
              isBattleEnabled: true,
              battlePresentation: 'OUTPUT_PREDICTION',
              programmingLanguage: 'python',
              options: [
                option('five', 'print("Hello Python")', true),
                option('eleven', 'echo("Hello Python")', false),
                option('twenty-four', 'show("Hello Python")', false),
                option('expression', 'output("Hello Python")', false),
              ],
              tags: ['topic:print', 'topic:string', 'topic:output'],
            },
            {
              key: 'multiplication-output',
              type: 'FILL_BLANK',
              title:
                'Battle 玩家当前 Rating 为 1000。Rating 属于哪种数据类型？____________',
              explanation: '1000 是整数，因此属于 int。',
              difficulty: 'EASY',
              score: 10,
              isBattleEnabled: false,
              acceptedAnswers: ['int'],
              answerNormalization: NORMAL_FILL,
              tags: ['topic:int', 'topic:data-type', 'topic:rating'],
            },
            {
              key: 'division-float-output',
              type: 'SINGLE_CHOICE',
              title: '阅读下面程序。程序最终输出什么？',
              explanation: 'print(score) 会输出变量中保存的值，而不是变量名。',
              difficulty: 'EASY',
              score: 10,
              isBattleEnabled: true,
              battlePresentation: 'OUTPUT_PREDICTION',
              programmingLanguage: 'python',
              stemBlocks: [
                {
                  type: 'CODE',
                  language: 'python',
                  code: 'score = 80\nprint(score)',
                },
              ],
              options: [
                option('ten', '80', true),
                option('twenty-four', 'score', false),
                option('sixty-four', '"80"', false),
                option('joined-name', '报错', false),
              ],
              tags: ['topic:variable', 'topic:print', 'topic:output'],
            },
            {
              key: 'battle-score-code-fill',
              type: 'CODE_FILL',
              title: '玩家完成 Battle 后，系统需要显示最终得分。请补全代码。',
              explanation:
                '变量名 score 中已经保存了最终得分，直接输出变量即可。',
              difficulty: 'EASY',
              score: 10,
              isBattleEnabled: true,
              battlePresentation: 'INPUT_CODE_FILL',
              programmingLanguage: 'python',
              acceptedAnswers: ['score'],
              answerNormalization: PYTHON_CODE_FILL,
              stemBlocks: [
                {
                  type: 'CODE',
                  language: 'python',
                  code: 'player = "新手玩家"\nscore = 100\nprint("玩家：", player)\nprint("得分：", ________)',
                },
              ],
              explanationBlocks: [
                {
                  type: 'CODE',
                  language: 'python',
                  code: 'player = "新手玩家"\nscore = 100\nprint("玩家：", player)\nprint("得分：", score)',
                },
              ],
              tags: ['topic:print', 'topic:variable', 'topic:score'],
            },
          ],
        },
      ],
    },
    PYTHON_BASIC_CHAPTER_02,
    PYTHON_BASIC_CHAPTER_03,
    PYTHON_BASIC_CHAPTER_04,
    PYTHON_BASIC_CHAPTER_05,
    PYTHON_BASIC_CHAPTER_06,
    PYTHON_BASIC_CHAPTER_07,
    PYTHON_BASIC_CHAPTER_08,
    PYTHON_BASIC_CHAPTER_09,
    PYTHON_BASIC_CHAPTER_10,
    PYTHON_BASIC_CHAPTER_11,
    PYTHON_BASIC_CHAPTER_12,
    PYTHON_BASIC_CHAPTER_13,
    PYTHON_BASIC_CHAPTER_14,
    PYTHON_BASIC_CHAPTER_15,
  ],
};
