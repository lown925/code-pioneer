import { readSeedDocument } from '../content-source';
import { parsePythonChapterSource } from './python-basic-chapter-03';
const LESSON_KEYS = ['missing-value-processing','duplicate-data-processing','field-type-conversion','string-cleaning','outlier-processing','data-quality-validation'] as const;
const QUESTION_KEYS = LESSON_KEYS.flatMap((key) => [`${key}-concept`, `${key}-battle-medium`, `${key}-battle-hard`]) as readonly string[];
export const SPARK_DATA_PROCESSING_CHAPTER_09 = parsePythonChapterSource(readSeedDocument('spark-data-processing-chapter-09.md', ['docs','开发文档','spark-data-processing']), { chapterNumber: 9, chapterOrdinal: '九', chapterKey: 'spark-data-processing-chapter-09', lessonKeys: LESSON_KEYS, questionKeys: QUESTION_KEYS, quizTitle: 'Spark 数据处理第9章章节测验', quizDescription: '检验本章 Spark 数据处理知识。提交后可查看每题答案与解析。', passScorePercent: 70, programmingLanguage: 'scala', keyPrefix: 'spark-data-processing-chapter-09', questionKeyOffset: 144 });
