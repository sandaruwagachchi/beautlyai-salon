module.exports = {
  expo: {
    name: 'BeautlyAI Business',
    slug: 'beautlyai-business',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    splash: {
      image: './assets/splash.png',
      backgroundColor: '#1C1A17',
    },
    ios: {
      bundleIdentifier: 'com.beautlyai.business',
      supportsTablet: true,
    },
    android: {
      package: 'com.beautlyai.business',
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#2C2A27',
      },
      permissions: [
        'NOTIFICATIONS',
        'CAMERA',
        'READ_EXTERNAL_STORAGE',
        'WRITE_EXTERNAL_STORAGE'
      ],
    },
    plugins: ['expo-notifications', 'expo-secure-store', 'expo-camera'],
    extra: {
      eas: {
        projectId: 'YOUR_EAS_PROJECT_ID_BUSINESS',
      },
    },
  },
};
