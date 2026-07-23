type CourseProgressPageData = {
  courseId: string;
};

Page<CourseProgressPageData>({
  data: {
    courseId: '',
  },

  onLoad(query) {
    this.setData({
      courseId:
        typeof query.courseId === 'string' ? query.courseId.trim() : '',
    });
  },

  handleBack() {
    wx.navigateBack({
      delta: 1,
    });
  },
});
