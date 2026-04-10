module.exports = {
  expo: {
    name: 'BeautlyAI',
    slug: 'beautlyai-customer',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    splash: {
      image: './assets/splash.png',
      backgroundColor: '#FAF7F2',
    },
    ios: {
      bundleIdentifier: 'com.beautlyai.customer',
      supportsTablet: false,
      usesAppleSignIn: true,
    },
    android: {
      package: 'com.beautlyai.customer',
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#C9A96E',
      },
      permissions: ['NOTIFICATIONS', 'CAMERA'],
    },
    plugins: ['expo-notifications', 'expo-secure-store'],
    extra: {
      eas: {
        projectId: 'YOUR_EAS_PROJECT_ID_CUSTOMER',
      },
    },
  },
};
