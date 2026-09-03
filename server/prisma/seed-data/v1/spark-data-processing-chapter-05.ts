import { readSeedDocument } from '../content-source';
import { parsePythonChapterSource } from './python-basic-chapter-03';
const LESSON_KEYS = ['csv-read-write','json-read-write','parquet-columnar-storage','schema-inference-explicit-schema','partitioned-write','data-source-strategies'] as const;
const QUESTION_KEYS = LESSON_KEYS.flatMap((key) => [`${key}-concept`, `${key}-battle-medium`, `${key}-battle-hard`]) as readonly string[];
export const SPARK_DATA_PROCESSING_CHAPTER_05 = parsePythonChapterSource(readSeedDocument('spark-data-processing-chapter-05.md', ['docs','开发文档','spark-data-processing']), { chapterNumber: 5, chapterOrdinal: '五', chapterKey: 'spark-data-processing-chapter-05', lessonKeys: LESSON_KEYS, questionKeys: QUESTION_KEYS, quizTitle: 'Spark 数据处理第5章章节测验', quizDescription: '检验本章 Spark 数据处理知识。提交后可查看每题答案与解析。', passScorePercent: 70, programmingLanguage: 'scala', keyPrefix: 'spark-data-processing-chapter-05', questionKeyOffset: 72 });
