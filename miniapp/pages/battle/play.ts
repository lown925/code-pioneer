type PlayPageData = {
  battleId: string;
  isValidBattleId: boolean;
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

Page<PlayPageData>({
  data: {
    battleId: '',
    isValidBattleId: false,
  },

  onLoad(options) {
    const battleId =
      typeof options?.battleId === 'string' ? options.battleId.trim() : '';

    this.setData({
      battleId,
      isValidBattleId: UUID_PATTERN.test(battleId),
    });
  },

  handleBackRoom() {
    if (!this.data.isValidBattleId) {
      wx.switchTab({
        url: '/pages/battle/index',
      });
      return;
    }

    wx.navigateTo({
      url: `/pages/battle/room?battleId=${encodeURIComponent(this.data.battleId)}`,
    });
  },
});
