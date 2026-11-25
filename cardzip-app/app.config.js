const staticConfig = require('./app.json');
const photoLibraryPermissions = [
  'android.permission.READ_MEDIA_IMAGES',
  'android.permission.READ_MEDIA_VIDEO',
  'android.permission.READ_MEDIA_VISUAL_USER_SELECTED',
];
const googleServicesFile = process.env.GOOGLE_SERVICES_JSON
  || staticConfig.expo.android.googleServicesFile;
const googleIosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID
  || '240181996106-hq090lea6irglo43qb287s6htlmo9it3.apps.googleusercontent.com';
const googleIosClientIdMatch = googleIosClientId.match(/^([A-Za-z0-9-]+)\.apps\.googleusercontent\.com$/);

if (!googleIosClientIdMatch) {
  throw new Error('EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID must be a Google iOS OAuth client ID.');
}

module.exports = ({ config }) => ({
  ...config,
  ...staticConfig.expo,
  android: {
    ...staticConfig.expo.android,
    googleServicesFile,
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
        iosUrlScheme: `com.googleusercontent.apps.${googleIosClientIdMatch[1]}`,
      },
    ],
  ],
});
