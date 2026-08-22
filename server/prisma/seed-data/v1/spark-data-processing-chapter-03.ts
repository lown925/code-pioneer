import { readSeedDocument } from '../content-source';
import { parsePythonChapterSource } from './python-basic-chapter-03';
const LESSON_KEYS = ['pair-rdd','reduce-by-key','group-by-key','aggregate-by-key','rdd-join','partitioner-data-distribution'] as const;
const QUESTION_KEYS = LESSON_KEYS.flatMap((key) => [`${key}-concept`, `${key}-battle-medium`, `${key}-battle-hard`]) as readonly string[];
export const SPARK_DATA_PROCESSING_CHAPTER_03 = parsePythonChapterSource(readSeedDocument('spark-data-processing-chapter-03.md', ['docs','开发文档','spark-data-processing']), { chapterNumber: 3, chapterOrdinal: '三', chapterKey: 'spark-data-processing-chapter-03', lessonKeys: LESSON_KEYS, questionKeys: QUESTION_KEYS, quizTitle: 'Spark 数据处理第3章章节测验', quizDescription: '检验本章 Spark 数据处理知识。提交后可查看每题答案与解析。', passScorePercent: 70, programmingLanguage: 'python', keyPrefix: 'spark-data-processing-chapter-03', questionKeyOffset: 36 });
