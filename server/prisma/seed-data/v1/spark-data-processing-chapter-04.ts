import { readSeedDocument } from '../content-source';
import { parsePythonChapterSource } from './python-basic-chapter-03';
const LESSON_KEYS = ['dataframe-schema','create-dataframe','select-filter','group-by-aggregation','dataframe-join','spark-sql'] as const;
const QUESTION_KEYS = LESSON_KEYS.flatMap((key) => [`${key}-concept`, `${key}-battle-medium`, `${key}-battle-hard`]) as readonly string[];
export const SPARK_DATA_PROCESSING_CHAPTER_04 = parsePythonChapterSource(readSeedDocument('spark-data-processing-chapter-04.md', ['docs','开发文档','spark-data-processing']), { chapterNumber: 4, chapterOrdinal: '四', chapterKey: 'spark-data-processing-chapter-04', lessonKeys: LESSON_KEYS, questionKeys: QUESTION_KEYS, quizTitle: 'Spark 数据处理第4章章节测验', quizDescription: '检验本章 Spark 数据处理知识。提交后可查看每题答案与解析。', passScorePercent: 70, programmingLanguage: 'scala', keyPrefix: 'spark-data-processing-chapter-04', questionKeyOffset: 54 });
