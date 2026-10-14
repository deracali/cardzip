const staticConfig = require('./app.json');

module.exports = ({ config }) => ({
  ...config,
  ...staticConfig.expo,
  scheme: 'cardzip',
  plugins: [
    ...staticConfig.expo.plugins.filter(
      (plugin) => !(Array.isArray(plugin) && plugin[0] === '@react-native-google-signin/google-signin'),
    ),
    [
      '@react-native-google-signin/google-signin',
      {
        iosUrlScheme: process.env.EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME
          || 'com.googleusercontent.apps.REPLACE_WITH_REVERSED_IOS_CLIENT_ID',
      },
    ],
  ],
});
