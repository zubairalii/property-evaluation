import { Link, Stack } from 'expo-router';
import { StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Not found' }} />
      <Text style={styles.title}>This screen does not exist.</Text>
      <Link href="/" style={styles.link}>
        Go home
      </Link>
    </>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 20, fontWeight: '700', padding: 24 },
  link: { paddingHorizontal: 24, color: '#2563EB' },
});
