import type {
  CourseListData,
  CourseListItem,
  CourseSelectionResponse,
} from '../../types/course';
import { getAuthStateSummary, redirectToLogin } from '../../utils/auth';
import { formatDifficulty, formatMinutes } from '../../utils/course';
import { request } from '../../utils/request';

type CourseCard = CourseListItem & {
  difficultyText: string;
  estimatedMinutesText: string;
  categoryText: string;
  languageText: string;
  coverText: string;
  coverFailed: boolean;
  isSelectionUpdating: boolean;
  selectionButtonText: string;
};

type CategoryFilter = {
  value: string;
  label: string;
};

const CATEGORY_LABELS: Record<string, string> = {
  ALL: '全部',
  FRONTEND: '前端',
  BACKEND: '后端',
  DATABASE: '数据库',
  GENERAL: '通用基础',
};

let allCourses: CourseCard[] = [];
let isPageActive = false;
let loadSerial = 0;
const selectionRequests = new Set<string>();

Page({
  data: {
    state: 'loading',
    errorMessage: '',
    courses: [] as CourseCard[],
    total: 0,
    selectedCategory: 'ALL',
    categoryFilters: [
      { value: 'ALL', label: '全部' },
    ] as CategoryFilter[],
  },

  onLoad() {
    isPageActive = true;
    void this.loadCourses();
  },

  onUnload() {
    isPageActive = false;
    loadSerial += 1;
    selectionRequests.clear();
  },

  onPullDownRefresh() {
    void this.loadCourses(true);
  },

  async loadCourses(fromPullDown = false) {
    const currentSerial = ++loadSerial;
    this.setData({ state: 'loading', errorMessage: '' });

    try {
      const result = await request<CourseListData>({
        url: '/courses',
        data: { page: 1, pageSize: 100 },
        authMode: 'auto',
      });

      if (!isPageActive || currentSerial !== loadSerial) {
        return;
      }

      allCourses = result.items.map((course) => this.mapCourse(course));
      const categories = [...new Set(allCourses.map((course) => course.category))];

      this.setData({
        categoryFilters: [
          { value: 'ALL', label: '全部' },
          ...categories.map((value) => ({
            value,
            label: CATEGORY_LABELS[value] ?? value,
          })),
        ],
        total: result.pagination.total,
      });
      this.applyFilter(this.data.selectedCategory);
    } catch {
      if (!isPageActive || currentSerial !== loadSerial) {
        return;
      }

      this.setData({
        state: 'error',
        errorMessage: '课程列表加载失败，请稍后重试。',
        courses: [],
      });
    } finally {
      if (fromPullDown) {
        wx.stopPullDownRefresh();
      }
    }
  },

  mapCourse(course: CourseListItem): CourseCard {
    return {
      ...course,
      difficultyText: formatDifficulty(course.difficulty),
      estimatedMinutesText: formatMinutes(course.estimatedMinutes),
      categoryText: CATEGORY_LABELS[course.category] ?? course.category,
      languageText: course.language?.trim() || '综合课程',
      coverText: (course.title.trim() || '课程').slice(0, 2),
      coverFailed: false,
      isSelectionUpdating: false,
      selectionButtonText: course.isSelected ? '已选择' : '选择该课程',
    };
  },

  handleRetry() {
    void this.loadCourses();
  },

  handleCategoryTap(
    event: WechatMiniprogram.BaseEvent<{ category?: string }>,
  ) {
    const category = event.currentTarget.dataset.category;

    if (!category) {
      return;
    }

    this.applyFilter(category);
  },

  applyFilter(category: string) {
    const courses =
      category === 'ALL'
        ? allCourses
        : allCourses.filter((course) => course.category === category);

    this.setData({
      selectedCategory: category,
      courses,
      state: courses.length > 0 ? 'success' : 'empty',
    });
  },

  openCourseDetail(
    event: WechatMiniprogram.BaseEvent<{ courseId?: string }>,
  ) {
    const courseId = event.currentTarget.dataset.courseId;

    if (!courseId) {
      return;
    }

    wx.navigateTo({
      url: `/pages/course/detail?courseId=${encodeURIComponent(courseId)}`,
    });
  },

  handleCoverError(
    event: WechatMiniprogram.BaseEvent<{ courseId?: string }>,
  ) {
    const courseId = event.currentTarget.dataset.courseId;

    if (!courseId) {
      return;
    }

    this.updateCourse(courseId, { coverFailed: true });
  },

  async handleSelectionTap(
    event: WechatMiniprogram.BaseEvent<{ courseId?: string }>,
  ) {
    const courseId = event.currentTarget.dataset.courseId;
    const course = allCourses.find((item) => item.id === courseId);

    if (!courseId || !course || selectionRequests.has(courseId)) {
      return;
    }

    if (!getAuthStateSummary().isAuthenticated) {
      redirectToLogin('/pages/course/list?mode=select');
      return;
    }

    if (course.isSelected) {
      const confirmed = await this.confirmDeselection();

      if (!confirmed || !isPageActive) {
        return;
      }
    }

    selectionRequests.add(courseId);
    this.updateCourse(courseId, {
      isSelectionUpdating: true,
      selectionButtonText: course.isSelected ? '取消中...' : '选择中...',
    });

    try {
      const result = await request<CourseSelectionResponse>({
        url: `/courses/${encodeURIComponent(courseId)}/selection`,
        method: course.isSelected ? 'DELETE' : 'POST',
        authMode: 'required',
      });

      if (!isPageActive) {
        return;
      }

      this.updateCourse(courseId, {
        isSelected: result.selected,
        isSelectionUpdating: false,
        selectionButtonText: result.selected ? '已选择' : '选择该课程',
      });

      wx.showToast({
        title: result.selected ? '课程已选择' : '已取消选择',
        icon: 'success',
      });
    } catch {
      if (!isPageActive) {
        return;
      }

      this.updateCourse(courseId, {
        isSelectionUpdating: false,
        selectionButtonText: course.isSelected ? '已选择' : '选择该课程',
      });
      wx.showToast({
        title: course.isSelected
          ? '取消失败，请稍后重试'
          : '选择失败，请稍后重试',
        icon: 'none',
      });
    } finally {
      selectionRequests.delete(courseId);
    }
  },

  confirmDeselection() {
    return new Promise<boolean>((resolve) => {
      wx.showModal({
        title: '取消选择课程',
        content: '课程会从学习页移除，但已有学习进度和测验记录会保留。',
        confirmText: '取消选择',
        cancelText: '继续学习',
        success: (result) => resolve(result.confirm),
        fail: () => resolve(false),
      });
    });
  },

  updateCourse(courseId: string, patch: Partial<CourseCard>) {
    allCourses = allCourses.map((course) =>
      course.id === courseId ? { ...course, ...patch } : course,
    );
    this.applyFilter(this.data.selectedCategory);
  },
});
