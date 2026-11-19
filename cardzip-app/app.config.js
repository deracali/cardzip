const staticConfig = require('./app.json');
const photoLibraryPermissions = [
  'android.permission.READ_MEDIA_IMAGES',
  'android.permission.READ_MEDIA_VIDEO',
  'android.permission.READ_MEDIA_VISUAL_USER_SELECTED',
];

module.exports = ({ config }) => ({
  ...config,
  ...staticConfig.expo,
  android: {
    ...staticConfig.expo.android,
    blockedPermissions: [...new Set([
      ...(staticConfig.expo.android.blockedPermissions || []),
      ...photoLibraryPermissions,
    ])],
  },
  scheme: 'cardzip',
  plugins: [
    ...staticConfig.expo.plugins.filter(
      (plugin) => !(Array.isArray(plugin) && plugin[0] === '@react-native-google-signin/google-signin'),
    ),
    'expo-image',
    'expo-apple-authentication',
    'expo-web-browser',
    'expo-sharing',
    [
      '@react-native-google-signin/google-signin',
      {
        iosUrlScheme: process.env.EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME
          || 'com.googleusercontent.apps.REPLACE_WITH_REVERSED_IOS_CLIENT_ID',
      },
    ],
  ],
});
