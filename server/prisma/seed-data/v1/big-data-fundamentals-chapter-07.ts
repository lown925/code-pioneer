import { readSeedDocument } from '../content-source';
import { parsePythonChapterSource } from './python-basic-chapter-03';
const LESSON_KEYS = ['batch-stream-differences','event-time-processing-time','window-computation','watermark-concepts','stateful-computation','realtime-fault-tolerance'] as const;
const QUESTION_KEYS = LESSON_KEYS.flatMap((key) => [`${key}-concept`, `${key}-battle-medium`, `${key}-battle-hard`]) as readonly string[];
export const BIG_DATA_FUNDAMENTALS_CHAPTER_07 = parsePythonChapterSource(readSeedDocument('big-data-fundamentals-chapter-07.md', ['docs','开发文档','big-data-fundamentals']), { chapterNumber: 7, chapterOrdinal: '七', chapterKey: 'big-data-fundamentals-chapter-07', lessonKeys: LESSON_KEYS, questionKeys: QUESTION_KEYS, quizTitle: '大数据技术基础第7章章节测验', quizDescription: '检验本章大数据技术基础知识。提交后可查看每题答案与解析。', passScorePercent: 70, programmingLanguage: 'python', keyPrefix: 'big-data-fundamentals-chapter-07', questionKeyOffset: 108 });
