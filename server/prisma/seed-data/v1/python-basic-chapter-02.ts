import type { SeedChapter, SeedQuestionOption } from '../types';

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

const STRICT_FILL = {
  trim: true,
  normalizeLineEndings: true,
  caseSensitive: true,
  collapseWhitespace: false,
} as const;

const PYTHON_CODE_FILL = STRICT_FILL;

export const PYTHON_BASIC_CHAPTER_02: SeedChapter = {
  key: 'python-variables-and-basic-types',
  title: '第二章：变量与基础数据类型',
  summary:
    '进一步理解变量的作用，学习变量命名、重新赋值，以及整数、浮点数、字符串和布尔值四种基础数据类型。',
  estimatedMinutes: 60,
  sortOrder: 2,
  quizTitle: '变量与基础数据类型章节测验',
  quizDescription:
    '检验你是否掌握变量赋值、重新赋值、命名规则、基础数据类型和 type()。提交后可查看每题答案与解析。',
  passScorePercent: 70,
  lessons: [
    {
      key: 'variables-store-data',
      title: '课时 1：变量用于保存数据',
      summary: '理解变量的基本作用，学习赋值和读取变量。',
      estimatedMinutes: 10,
      blocks: [
        {
          key: 'labeled-box-heading',
          type: 'HEADING',
          text: '变量像一个带标签的盒子',
          level: 2,
        },
        {
          key: 'variable-purpose-text',
          type: 'TEXT',
          text: '程序经常需要保存数据，例如课程名称、当前分数或是否在线。变量就是用于保存这些数据的名称。变量名像盒子的标签，变量值像盒子中的内容。',
        },
        {
          key: 'nickname-code',
          type: 'CODE',
          language: 'python',
          code: 'nickname = "小码"\nprint(nickname)',
        },
        {
          key: 'assignment-text',
          type: 'TEXT',
          text: '第一行把字符串“小码”保存到变量 nickname 中，第二行读取 nickname 当前保存的值并输出。等号 = 在这里表示赋值，即把右侧的数据保存到左侧变量中。',
        },
        {
          key: 'course-name-example',
          type: 'EXAMPLE',
          title: '保存课程名称',
          description: '把课程名称保存到变量中，再输出变量。',
          language: 'python',
          code: 'course_name = "Python 基础入门"\nprint(course_name)',
        },
        {
          key: 'meaningful-variable-tip',
          type: 'TIP',
          title: '变量名应表达用途',
          text: 'nickname 比 a 更容易理解，course_name 比 x 更能说明数据用途。',
        },
      ],
      questions: [
        {
          key: 'save-course-name',
          type: 'SINGLE_CHOICE',
          title: '学习页面需要保存当前课程名称。下面哪段代码最合适？',
          explanation:
            '赋值语句应把变量名写在等号左侧，把数据写在右侧，因此 A 正确。B 的赋值方向错误；C 会覆盖内置函数名 print；D 中的减号会被当作运算符。',
          difficulty: 'EASY',
          score: 10,
          isBattleEnabled: true,
          battlePresentation: 'CODE_PURPOSE',
          programmingLanguage: 'python',
          options: [
            option('course-name', 'course_name = "Python 基础入门"', true),
            option('reversed', '"Python 基础入门" = course_name', false),
            option('overwrite-print', 'print = "Python 基础入门"', false),
            option('hyphen-name', 'course-name = "Python 基础入门"', false),
          ],
          tags: ['topic:variable', 'topic:assignment', 'topic:string'],
        },
        {
          key: 'chapter-title-value',
          type: 'FILL_BLANK',
          title:
            '课程页面需要保存章节标题“变量与基础数据类型”。请补全变量保存的数据。',
          explanation:
            '章节标题属于文本，应使用英文单引号或双引号包裹，保存为字符串。',
          difficulty: 'EASY',
          score: 10,
          isBattleEnabled: false,
          acceptedAnswers: ['"变量与基础数据类型"', "'变量与基础数据类型'"],
          answerNormalization: STRICT_FILL,
          stemBlocks: [
            {
              type: 'CODE',
              language: 'python',
              code: 'chapter_title = ______',
            },
          ],
          tags: ['topic:variable', 'topic:string', 'topic:assignment'],
        },
        {
          key: 'course-name-code-fill',
          type: 'CODE_FILL',
          title:
            '学习页面需要显示当前课程名称。请补全代码，将“Python 基础入门”保存到变量 course_name，并输出该变量。',
          explanation:
            '课程名称是文本，因此应使用引号包裹并保存为字符串。print(course_name) 会输出变量保存的内容。',
          difficulty: 'EASY',
          score: 10,
          isBattleEnabled: true,
          battlePresentation: 'INPUT_CODE_FILL',
          programmingLanguage: 'python',
          acceptedAnswers: ['"Python 基础入门"', "'Python 基础入门'"],
          answerNormalization: PYTHON_CODE_FILL,
          stemBlocks: [
            {
              type: 'CODE',
              language: 'python',
              code: 'course_name = __________\nprint(course_name)',
            },
          ],
          explanationBlocks: [
            {
              type: 'CODE',
              language: 'python',
              code: 'course_name = "Python 基础入门"\nprint(course_name)',
            },
          ],
          tags: [
            'topic:variable',
            'topic:assignment',
            'topic:print',
            'topic:string',
          ],
        },
      ],
    },
    {
      key: 'variable-reassignment',
      title: '课时 2：变量可以重新赋值',
      summary: '学习更新变量值，并理解程序使用变量当前保存的数据。',
      estimatedMinutes: 10,
      blocks: [
        {
          key: 'reassignment-heading',
          type: 'HEADING',
          text: '变量中的数据可以更新',
          level: 2,
        },
        {
          key: 'reassignment-scenario',
          type: 'TEXT',
          text: '程序运行过程中，数据可能发生变化。例如玩家完成一场对局后，积分可能增加；用户切换课程后，当前课程名称也会变化。',
        },
        {
          key: 'rating-reassignment-code',
          type: 'CODE',
          language: 'python',
          code: 'rating = 1000\nrating = 1020\nprint(rating)',
        },
        {
          key: 'rating-reassignment-text',
          type: 'TEXT',
          text: 'rating 先保存 1000，随后被更新为 1020。print(rating) 输出变量当前保存的最终值，因此结果是 1020。',
        },
        {
          key: 'progress-example',
          type: 'EXAMPLE',
          title: '更新章节进度',
          description: '变量 progress 先保存旧进度，再更新为新进度。',
          language: 'python',
          code: 'progress = 20\nprogress = 40\nprint(progress)',
        },
        {
          key: 'current-value-warning',
          type: 'WARNING',
          title: '变量只保存当前值',
          text: '普通变量重新赋值后，后续读取的是新值，不会同时输出旧值和新值。',
        },
      ],
      questions: [
        {
          key: 'progress-reassignment-output',
          type: 'SINGLE_CHOICE',
          title: '课程进度更新后，下面程序会输出什么？',
          explanation:
            'progress 第二次被赋值为 50，旧值 25 被替换，因此最终输出 50。',
          difficulty: 'EASY',
          score: 10,
          isBattleEnabled: true,
          battlePresentation: 'OUTPUT_PREDICTION',
          programmingLanguage: 'python',
          stemBlocks: [
            {
              type: 'CODE',
              language: 'python',
              code: 'progress = 25\nprogress = 50\nprint(progress)',
            },
          ],
          options: [
            option('old-value', '25', false),
            option('new-value', '50', true),
            option('both-values', '25 和 50', false),
            option('variable-name', 'progress', false),
          ],
          tags: ['topic:variable', 'topic:reassignment', 'topic:output'],
        },
        {
          key: 'status-final-output',
          type: 'FILL_BLANK',
          title: '阅读代码，填写最终输出结果。',
          explanation:
            'status 最后一次被赋值为“已完成”，因此 print(status) 输出“已完成”。',
          difficulty: 'EASY',
          score: 10,
          isBattleEnabled: false,
          acceptedAnswers: ['已完成'],
          answerNormalization: NORMAL_FILL,
          stemBlocks: [
            {
              type: 'CODE',
              language: 'python',
              code: 'status = "学习中"\nstatus = "已完成"\nprint(status)\n\n输出：______',
            },
          ],
          tags: ['topic:variable', 'topic:reassignment', 'topic:string'],
        },
        {
          key: 'rating-reassignment-code-fill',
          type: 'CODE_FILL',
          title:
            '玩家当前积分为 1000，完成对局后积分更新为 1025。请补全代码，使程序最终输出 1025。',
          explanation:
            '第二次赋值会更新 rating 当前保存的数据。把 1025 赋给 rating 后，print(rating) 输出 1025。',
          difficulty: 'MEDIUM',
          score: 10,
          isBattleEnabled: true,
          battlePresentation: 'INPUT_CODE_FILL',
          programmingLanguage: 'python',
          acceptedAnswers: ['1025'],
          answerNormalization: PYTHON_CODE_FILL,
          stemBlocks: [
            {
              type: 'CODE',
              language: 'python',
              code: 'rating = 1000\nrating = ______\nprint(rating)',
            },
          ],
          explanationBlocks: [
            {
              type: 'CODE',
              language: 'python',
              code: 'rating = 1000\nrating = 1025\nprint(rating)',
            },
          ],
          tags: ['topic:variable', 'topic:reassignment', 'topic:print'],
        },
      ],
    },
    {
      key: 'variable-naming-rules',
      title: '课时 3：变量命名规则',
      summary: '学习合法变量名、常见错误和有意义的命名方式。',
      estimatedMinutes: 10,
      blocks: [
        {
          key: 'naming-rules-heading',
          type: 'HEADING',
          text: '变量名不能随意书写',
          level: 2,
        },
        {
          key: 'naming-rules-text',
          type: 'TEXT',
          text: '变量名可以包含英文字母、数字和下划线，但不能以数字开头，也不能包含减号、空格等特殊符号。',
        },
        {
          key: 'valid-variable-names-code',
          type: 'CODE',
          language: 'python',
          code: 'player_name = "小码"\nscore2 = 80\ncourse_title = "Python"',
        },
        {
          key: 'invalid-variable-intro',
          type: 'TEXT',
          text: '下面的写法不合法：',
        },
        {
          key: 'invalid-variable-names-code',
          type: 'CODE',
          language: 'python',
          code: '2score = 80\nplayer-name = "小码"\ncourse title = "Python"',
        },
        {
          key: 'keywords-heading',
          type: 'HEADING',
          text: '不要使用 Python 关键字',
          level: 2,
        },
        {
          key: 'keywords-text',
          type: 'TEXT',
          text: 'class、if、for 等词在 Python 中具有特殊作用，不能直接作为普通变量名。',
        },
        {
          key: 'snake-case-tip',
          type: 'TIP',
          title: '推荐命名风格',
          text: 'Python 常用小写字母和下划线组成变量名，例如 player_name、battle_score、course_title。',
        },
      ],
      questions: [
        {
          key: 'valid-chapter-number-name',
          type: 'SINGLE_CHOICE',
          title: '系统需要保存当前章节编号。下面哪个变量名可以正常使用？',
          explanation:
            'chapter_number 由字母和下划线组成，符合规则。其他选项分别存在数字开头、减号或空格问题。',
          difficulty: 'MEDIUM',
          score: 10,
          isBattleEnabled: true,
          battlePresentation: 'BUG_FIX',
          programmingLanguage: 'python',
          options: [
            option('snake-case', 'chapter_number', true),
            option('starts-number', '2chapter', false),
            option('hyphen', 'chapter-number', false),
            option('space', 'chapter number', false),
          ],
          tags: ['topic:variable-name', 'topic:snake-case'],
        },
        {
          key: 'clear-score-variable-name',
          type: 'FILL_BLANK',
          title:
            '为了保存玩家总得分，请写出一个清晰、符合 Python 命名习惯的变量名。',
          explanation:
            '变量名应表达实际用途。以上名称都能清楚说明变量保存的是得分。',
          difficulty: 'MEDIUM',
          score: 10,
          isBattleEnabled: false,
          acceptedAnswers: ['total_score', 'battle_score', 'player_score'],
          answerNormalization: STRICT_FILL,
          tags: ['topic:variable-name', 'topic:snake-case'],
        },
      ],
    },
    {
      key: 'integer-and-float',
      title: '课时 4：整数与浮点数',
      summary: '认识 int 和 float，并区分整数与带小数的数据。',
      estimatedMinutes: 10,
      blocks: [
        {
          key: 'integer-heading',
          type: 'HEADING',
          text: '整数 int',
          level: 2,
        },
        {
          key: 'integer-text',
          type: 'TEXT',
          text: '没有小数部分的数字属于整数 int，例如题目数量、章节编号和玩家积分。',
        },
        {
          key: 'integer-code',
          type: 'CODE',
          language: 'python',
          code: 'question_count = 20\nchapter_number = 2\nrating = 1000',
        },
        {
          key: 'float-heading',
          type: 'HEADING',
          text: '浮点数 float',
          level: 2,
        },
        {
          key: 'float-text',
          type: 'TEXT',
          text: '带小数部分的数字属于浮点数 float，例如正确率、平均分和课程时长。',
        },
        {
          key: 'float-code',
          type: 'CODE',
          language: 'python',
          code: 'accuracy = 87.5\naverage_score = 76.25\nstudy_hours = 1.5',
        },
        {
          key: 'quotes-change-type-warning',
          type: 'WARNING',
          title: '引号会改变类型',
          text: '1000 是整数，而 "1000" 是字符串。是否使用引号会影响数据类型。',
        },
      ],
      questions: [
        {
          key: 'accuracy-type',
          type: 'SINGLE_CHOICE',
          title: '系统需要保存一场对局的正确率 87.5。下面哪种类型最合适？',
          explanation: '87.5 包含小数部分，应使用 float。',
          difficulty: 'EASY',
          score: 10,
          isBattleEnabled: true,
          battlePresentation: 'CODE_PURPOSE',
          programmingLanguage: 'python',
          options: [
            option('int', 'int', false),
            option('float', 'float', true),
            option('bool', 'bool', false),
            option('str', 'str', false),
          ],
          tags: ['topic:float', 'topic:data-type'],
        },
        {
          key: 'integer-variable',
          type: 'SINGLE_CHOICE',
          title: '下面哪个变量保存的是整数，而不是字符串或浮点数？',
          explanation: '100 没有引号也没有小数点，因此是整数 int。',
          difficulty: 'MEDIUM',
          score: 10,
          isBattleEnabled: true,
          battlePresentation: 'CODE_READING',
          programmingLanguage: 'python',
          options: [
            option('integer', 'score = 100', true),
            option('string', 'score = "100"', false),
            option('float', 'score = 100.0', false),
            option('bool', 'score = True', false),
          ],
          tags: ['topic:int', 'topic:str', 'topic:float'],
        },
        {
          key: 'study-hours-code-fill',
          type: 'CODE_FILL',
          title:
            '课程页面需要保存预计学习时间 1.5 小时。请补全代码并输出该值。',
          explanation: '1.5 带有小数部分，应直接以浮点数形式保存，不需要引号。',
          difficulty: 'EASY',
          score: 10,
          isBattleEnabled: true,
          battlePresentation: 'INPUT_CODE_FILL',
          programmingLanguage: 'python',
          acceptedAnswers: ['1.5'],
          answerNormalization: PYTHON_CODE_FILL,
          stemBlocks: [
            {
              type: 'CODE',
              language: 'python',
              code: 'study_hours = ______\nprint(study_hours)',
            },
          ],
          explanationBlocks: [
            {
              type: 'CODE',
              language: 'python',
              code: 'study_hours = 1.5\nprint(study_hours)',
            },
          ],
          tags: ['topic:float', 'topic:variable', 'topic:print'],
        },
      ],
    },
    {
      key: 'string-and-boolean',
      title: '课时 5：字符串与布尔值',
      summary: '认识 str 和 bool，并理解文本与真假状态的区别。',
      estimatedMinutes: 10,
      blocks: [
        {
          key: 'string-heading',
          type: 'HEADING',
          text: '字符串 str',
          level: 2,
        },
        {
          key: 'string-text',
          type: 'TEXT',
          text: '字符串用于保存文字内容，需要使用英文单引号或双引号包裹。',
        },
        {
          key: 'string-code',
          type: 'CODE',
          language: 'python',
          code: 'nickname = "小码"\ncourse_name = "Python 基础入门"\nroom_code = "A7K9Q2"',
        },
        {
          key: 'boolean-heading',
          type: 'HEADING',
          text: '布尔值 bool',
          level: 2,
        },
        {
          key: 'boolean-text',
          type: 'TEXT',
          text: '布尔值用于表示真假状态，只有 True 和 False 两个值。',
        },
        {
          key: 'boolean-code',
          type: 'CODE',
          language: 'python',
          code: 'is_online = True\nbattle_finished = False',
        },
        {
          key: 'boolean-quotes-warning',
          type: 'WARNING',
          title: '布尔值不要加引号',
          text: 'True 是布尔值，而 "True" 是字符串。两者含义不同。',
        },
      ],
      questions: [
        {
          key: 'battle-finished-value',
          type: 'SINGLE_CHOICE',
          title: '系统需要记录“对局是否已经结束”。下面哪种写法最合适？',
          explanation:
            '“是否结束”只有真或假两种状态，适合使用 bool。False 表示尚未结束。',
          difficulty: 'EASY',
          score: 10,
          isBattleEnabled: true,
          battlePresentation: 'CODE_PURPOSE',
          programmingLanguage: 'python',
          options: [
            option('boolean', 'battle_finished = False', true),
            option('string-false', 'battle_finished = "False"', false),
            option('float-zero', 'battle_finished = 0.0', false),
            option('string-status', 'battle_finished = "未结束"', false),
          ],
          tags: ['topic:bool', 'topic:false'],
        },
        {
          key: 'online-boolean-value',
          type: 'FILL_BLANK',
          title: '用户当前处于在线状态。请填写合适的 Python 布尔值。',
          explanation:
            '在线状态为真，因此应填写 Python 布尔值 True。首字母必须大写，也不能添加引号。',
          difficulty: 'EASY',
          score: 10,
          isBattleEnabled: false,
          acceptedAnswers: ['True'],
          answerNormalization: STRICT_FILL,
          stemBlocks: [
            {
              type: 'CODE',
              language: 'python',
              code: 'is_online = ______',
            },
          ],
          tags: ['topic:bool', 'topic:true'],
        },
        {
          key: 'room-full-code-fill',
          type: 'CODE_FILL',
          title:
            '好友房当前还没有满员。请补全代码，将房间满员状态保存为布尔值并输出。',
          explanation:
            '房间没有满员，因此该状态为假，应使用布尔值 False。不能写成 "False"，否则会变成字符串。',
          difficulty: 'EASY',
          score: 10,
          isBattleEnabled: true,
          battlePresentation: 'INPUT_CODE_FILL',
          programmingLanguage: 'python',
          acceptedAnswers: ['False'],
          answerNormalization: PYTHON_CODE_FILL,
          stemBlocks: [
            {
              type: 'CODE',
              language: 'python',
              code: 'is_full = ______\nprint(is_full)',
            },
          ],
          explanationBlocks: [
            {
              type: 'CODE',
              language: 'python',
              code: 'is_full = False\nprint(is_full)',
            },
          ],
          tags: ['topic:bool', 'topic:false', 'topic:print'],
        },
      ],
    },
    {
      key: 'inspect-types-with-type',
      title: '课时 6：使用 type() 查看数据类型',
      summary: '学习使用 type() 检查变量保存的数据类型。',
      estimatedMinutes: 10,
      blocks: [
        {
          key: 'inspect-type-heading',
          type: 'HEADING',
          text: '为什么要查看数据类型',
          level: 2,
        },
        {
          key: 'inspect-type-text',
          type: 'TEXT',
          text: '当程序出现计算或拼接错误时，确认数据类型通常能帮助定位问题。Python 使用 type() 查看一个值或变量的数据类型。',
        },
        {
          key: 'rating-type-code',
          type: 'CODE',
          language: 'python',
          code: 'rating = 1000\nprint(type(rating))',
        },
        {
          key: 'nickname-type-code',
          type: 'CODE',
          language: 'python',
          code: 'nickname = "小码"\nprint(type(nickname))',
        },
        {
          key: 'type-debug-tip',
          type: 'TIP',
          title: 'type() 适合调试',
          text: '不确定变量类型时，可以临时使用 print(type(variable)) 检查。',
        },
        {
          key: 'chapter-summary-heading',
          type: 'HEADING',
          text: '你已经能够正确保存不同类型的数据',
          level: 2,
        },
        {
          key: 'chapter-summary-text',
          type: 'TEXT',
          text: '本章学习了变量保存和更新数据的方式，以及四种常见基础数据类型：\n\n- int：整数\n- float：浮点数\n- str：字符串\n- bool：布尔值\n\n你还学习了合法变量名、重新赋值和 type() 类型检查。\n\n下一章将学习 input()、类型转换和格式化输出，让程序能够把用户输入的文字转换成可计算的数据。',
        },
        {
          key: 'profile-card-heading',
          type: 'HEADING',
          text: '第二章综合挑战：制作玩家资料卡（不计分）',
          level: 2,
        },
        {
          key: 'profile-card-text',
          type: 'TEXT',
          text: '请创建四个变量，分别保存玩家昵称、当前 Rating、对局正确率和是否在线，然后依次输出这些变量及其数据类型。',
        },
        {
          key: 'profile-card-code',
          type: 'CODE',
          language: 'python',
          code: 'nickname = "新手玩家"\nrating = 1000\naccuracy = 82.5\nis_online = True\n\nprint(nickname, type(nickname))\nprint(rating, type(rating))\nprint(accuracy, type(accuracy))\nprint(is_online, type(is_online))',
        },
        {
          key: 'profile-card-closing',
          type: 'TEXT',
          text: '尝试修改其中一个变量的值，并再次运行程序，观察输出结果是否随之变化。',
        },
      ],
      questions: [
        {
          key: 'course-name-type',
          type: 'SINGLE_CHOICE',
          title: '下面程序中的 course_name 属于什么类型？',
          explanation: 'course_name 的值被引号包裹，因此是字符串 str。',
          difficulty: 'EASY',
          score: 10,
          isBattleEnabled: true,
          battlePresentation: 'CODE_READING',
          programmingLanguage: 'python',
          stemBlocks: [
            {
              type: 'CODE',
              language: 'python',
              code: 'course_name = "Python 基础入门"\nprint(type(course_name))',
            },
          ],
          options: [
            option('int', 'int', false),
            option('float', 'float', false),
            option('str', 'str', true),
            option('bool', 'bool', false),
          ],
          tags: ['topic:type', 'topic:str'],
        },
        {
          key: 'type-function-name',
          type: 'FILL_BLANK',
          title: 'Python 中用于查看变量数据类型的内置函数是 ______。',
          explanation: 'type() 用于查看值或变量的数据类型。',
          difficulty: 'EASY',
          score: 10,
          isBattleEnabled: false,
          acceptedAnswers: ['type', 'type()'],
          answerNormalization: STRICT_FILL,
          tags: ['topic:type'],
        },
        {
          key: 'inspect-progress-type',
          type: 'CODE_FILL',
          title:
            '调试学习进度程序时，需要查看 progress 的数据类型。请补全代码，使程序输出 progress 的类型信息。',
          explanation:
            'type(progress) 会返回变量 progress 当前保存的数据类型，再由 print() 输出该类型信息。',
          difficulty: 'MEDIUM',
          score: 10,
          isBattleEnabled: true,
          battlePresentation: 'INPUT_CODE_FILL',
          programmingLanguage: 'python',
          acceptedAnswers: ['type(progress)'],
          answerNormalization: PYTHON_CODE_FILL,
          stemBlocks: [
            {
              type: 'CODE',
              language: 'python',
              code: 'progress = 75\nprint(____________)',
            },
          ],
          explanationBlocks: [
            {
              type: 'CODE',
              language: 'python',
              code: 'progress = 75\nprint(type(progress))',
            },
          ],
          tags: ['topic:type', 'topic:print', 'topic:variable'],
        },
        {
          key: 'dynamic-type-after-reassignment',
          type: 'SINGLE_CHOICE',
          title: '阅读代码，下面哪项描述正确？',
          explanation:
            'Python 允许同一个变量重新保存不同类型的数据。第二次赋值后，value 当前保存字符串 "Python"，因此最终类型是 str。',
          difficulty: 'MEDIUM',
          score: 10,
          isBattleEnabled: true,
          battlePresentation: 'CODE_READING',
          programmingLanguage: 'python',
          stemBlocks: [
            {
              type: 'CODE',
              language: 'python',
              code: 'value = 100\nvalue = "Python"\nprint(type(value))',
            },
          ],
          options: [
            option('int', 'value 最终是 int', false),
            option('str', 'value 最终是 str', true),
            option('error', '第二次赋值一定报错', false),
            option('both', 'value 同时是 int 和 str', false),
          ],
          tags: ['topic:dynamic-type', 'topic:reassignment', 'topic:type'],
        },
      ],
    },
  ],
};
