import { readSeedDocument } from '../content-source';
import { parsePythonChapterSource } from './python-basic-chapter-03';

const LESSON_KEYS = ['software-engineering-goals','software-lifecycle','project-roles-and-collaboration','requirements-to-delivery','quality-cost-schedule','project-risks-and-technical-debt'] as const;
const QUESTION_KEYS = LESSON_KEYS.flatMap((key) => [`${key}-concept`, `${key}-battle-medium`, `${key}-battle-hard`]) as readonly string[];
export const SOFTWARE_ENGINEERING_PROJECT_DEVELOPMENT_CHAPTER_01 = parsePythonChapterSource(readSeedDocument('software-engineering-project-development-chapter-01.md', ['docs','开发文档','software-engineering-project-development']), { chapterNumber: 1, chapterOrdinal: '一', chapterKey: 'software-engineering-project-development-chapter-01', lessonKeys: LESSON_KEYS, questionKeys: QUESTION_KEYS, quizTitle: '软件工程与项目开发第1章章节测验', quizDescription: '检验本章软件工程与项目开发知识。提交后可查看每题答案与解析。', passScorePercent: 70, programmingLanguage: 'text', keyPrefix: 'software-engineering-project-development-chapter-01', questionKeyOffset: 0 });
