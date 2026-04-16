import { useEffect, useState } from 'react';
import ExpoTuyaSdk from 'expo-tuya-sdk';
import { SafeAreaView, ScrollView, Text, View, StyleSheet } from 'react-native';

export default function App() {
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function initTuya() {
      try {
        await ExpoTuyaSdk.initialize();
        setInitialized(true);
      } catch (e: any) {
        setError(e.message ?? 'Failed to initialize Tuya SDK');
      }
    }

    initTuya();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.container}>
        <Text style={styles.header}>Expo Tuya SDK</Text>
        <View style={styles.group}>
          <Text style={styles.groupHeader}>SDK Status</Text>
          {error ? (
            <Text style={styles.error}>Error: {error}</Text>
          ) : initialized ? (
            <Text style={styles.success}>Tuya SDK initialized</Text>
          ) : (
            <Text>Initializing...</Text>
          )}
        </View>
        <View style={styles.group}>
          <Text style={styles.groupHeader}>isInitialized</Text>
          <Text>{String(ExpoTuyaSdk.isInitialized())}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    fontSize: 30,
    margin: 20,
  },
  groupHeader: {
    fontSize: 20,
    marginBottom: 10,
  },
  group: {
    margin: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
  },
  container: {
    flex: 1,
    backgroundColor: '#eee',
  },
  success: {
    color: 'green',
  },
  error: {
    color: 'red',
  },
});
