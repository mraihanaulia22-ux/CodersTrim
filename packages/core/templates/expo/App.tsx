import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <Text style={styles.iconText}>👋</Text>
        </View>
        <Text style={styles.title}>Hello World!</Text>
        <Text style={styles.subtitle}>
          Welcome to <Text style={styles.appName}>__CT_PROJECT_NAME__</Text>
        </Text>

        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.8}
          onPress={() => setCount((c) => c + 1)}
        >
          <Text style={styles.buttonText}>
            {count === 0 ? 'Tap to test interaction' : `Tapped ${count} ${count === 1 ? 'time' : 'times'}`}
          </Text>
        </TouchableOpacity>

        {/* @CodersTrim-Inject-Components */}
        <View style={styles.hintBox}>
          <Text style={styles.hintText}>Edit App.tsx to start building</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#0f172a',
    borderRadius: 24,
    padding: 32,
    borderWidth: 1,
    borderColor: '#1e293b',
    alignItems: 'center',
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(79, 70, 229, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  iconText: {
    fontSize: 28,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#f8fafc',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 28,
  },
  appName: {
    color: '#f1f5f9',
    fontWeight: '600',
  },
  button: {
    width: '100%',
    backgroundColor: '#4f46e5',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  hintBox: {
    paddingVertical: 8,
  },
  hintText: {
    color: '#64748b',
    fontSize: 12,
  },
});
