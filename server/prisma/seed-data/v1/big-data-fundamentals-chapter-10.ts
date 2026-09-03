import { readSeedDocument } from '../content-source';
import { parsePythonChapterSource } from './python-basic-chapter-03';
const LESSON_KEYS = ['business-data-requirements','data-sources-collection','storage-model-design','offline-realtime-compute','data-quality-monitoring','integrated-data-pipeline'] as const;
const QUESTION_KEYS = LESSON_KEYS.flatMap((key) => [`${key}-concept`, `${key}-battle-medium`, `${key}-battle-hard`]) as readonly string[];
export const BIG_DATA_FUNDAMENTALS_CHAPTER_10 = parsePythonChapterSource(readSeedDocument('big-data-fundamentals-chapter-10.md', ['docs','开发文档','big-data-fundamentals']), { chapterNumber: 10, chapterOrdinal: '十', chapterKey: 'big-data-fundamentals-chapter-10', lessonKeys: LESSON_KEYS, questionKeys: QUESTION_KEYS, quizTitle: '大数据技术基础第10章章节测验', quizDescription: '检验本章大数据技术基础知识。提交后可查看每题答案与解析。', passScorePercent: 70, programmingLanguage: 'text', keyPrefix: 'big-data-fundamentals-chapter-10', questionKeyOffset: 162 });
