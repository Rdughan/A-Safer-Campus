import AsyncStorage from '@react-native-async-storage/async-storage';

export const storageKeys = {
  TOKEN: 'token',
  USER_DATA: 'userData'
};

export const storage = {
  storeAuthData: async (token, userData) => {
    try {
      await AsyncStorage.multiSet([
        [storageKeys.TOKEN, token],
        [storageKeys.USER_DATA, JSON.stringify(userData)]
      ]);
      return true;
    } catch (error) {
      console.error('Storage error:', error);
      return false;
    }
  },

  clearAuthData: async () => {
    try {
      await AsyncStorage.multiRemove([
        storageKeys.TOKEN,
        storageKeys.USER_DATA
      ]);
      return true;
    } catch (error) {
      console.error('Clear storage error:', error);
      return false;
    }
  },

  getToken: async () => {
    try {
      return await AsyncStorage.getItem(storageKeys.TOKEN);
    } catch (error) {
      console.error('Get token error:', error);
      return null;
    }
  },

  getUserData: async () => {
    try {
      const data = await AsyncStorage.getItem(storageKeys.USER_DATA);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Get user data error:', error);
      return null;
    }
  }
};

export default storage;