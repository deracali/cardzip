import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NotFoundScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <Text style={styles.code}>404</Text>
        <Text style={styles.title}>Page not found</Text>
        <Text style={styles.description}>The page you’re looking for doesn’t exist or has moved.</Text>
        <Link href="/" style={styles.link}>Return to Cardzip</Link>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0A111F',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  code: {
    color: '#1DB954',
    fontFamily: 'Poppins',
    fontSize: 48,
    fontWeight: '800',
  },
  title: {
    marginTop: 12,
    color: '#FFFFFF',
    fontFamily: 'Poppins',
    fontSize: 22,
    fontWeight: '700',
  },
  description: {
    marginTop: 8,
    color: '#A1ACB9',
    fontFamily: 'Poppins',
    fontSize: 14,
    textAlign: 'center',
  },
  link: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#1DB954',
    color: '#0A111F',
    fontFamily: 'Poppins',
    fontSize: 14,
    fontWeight: '700',
  },
});