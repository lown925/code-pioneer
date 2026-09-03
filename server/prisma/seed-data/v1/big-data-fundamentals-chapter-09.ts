import { readSeedDocument } from '../content-source';
import { parsePythonChapterSource } from './python-basic-chapter-03';
const LESSON_KEYS = ['cluster-resource-model','task-scheduling','parallelism','data-locality','monitoring-performance-metrics','capacity-cost-planning'] as const;
const QUESTION_KEYS = LESSON_KEYS.flatMap((key) => [`${key}-concept`, `${key}-battle-medium`, `${key}-battle-hard`]) as readonly string[];
export const BIG_DATA_FUNDAMENTALS_CHAPTER_09 = parsePythonChapterSource(readSeedDocument('big-data-fundamentals-chapter-09.md', ['docs','开发文档','big-data-fundamentals']), { chapterNumber: 9, chapterOrdinal: '九', chapterKey: 'big-data-fundamentals-chapter-09', lessonKeys: LESSON_KEYS, questionKeys: QUESTION_KEYS, quizTitle: '大数据技术基础第9章章节测验', quizDescription: '检验本章大数据技术基础知识。提交后可查看每题答案与解析。', passScorePercent: 70, programmingLanguage: 'text', keyPrefix: 'big-data-fundamentals-chapter-09', questionKeyOffset: 144 });
