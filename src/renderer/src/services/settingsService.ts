export const settingsService = {
  async getTotals() {
    try {
      const [savedResponse, tempResponse] = await Promise.all([
        window.api.getTotalSaved(),
        window.api.getTotalTempCleaned()
      ]);
      
      return {
        saved: savedResponse.success ? savedResponse.data.total || 0 : 0,
        temp: tempResponse.success ? tempResponse.data.total || 0 : 0,
        success: savedResponse.success && tempResponse.success
      };
    } catch (error) {
      console.error('Error in settingsService.getTotals:', error);
      return { saved: 0, temp: 0, success: false };
    }
  },

  async createOriginalBackup() {
    try {
      return await window.api.maxCreateOriginalBackup();
    } catch (error) {
      console.error('Error in settingsService.createOriginalBackup:', error);
      return { success: false, error };
    }
  },

  async resetTotals(resetRam: boolean, resetTemp: boolean) {
    try {
      return await window.api.resetTotals({ resetRam, resetTemp });
    } catch (error) {
      console.error('Error in settingsService.resetTotals:', error);
      return { success: false, error };
    }
  },

  async performFactoryReset() {
    try {
      return await window.api.maxFactoryReset();
    } catch (error) {
      console.error('Error in settingsService.performFactoryReset:', error);
      return { success: false, error };
    }
  },

  async restartAsAdmin() {
    try {
      return await window.api.invoke('restart-as-admin');
    } catch (error) {
      console.error('Error in settingsService.restartAsAdmin:', error);
      return { success: false, error };
    }
  }
};
