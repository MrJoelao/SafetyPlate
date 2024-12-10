import { StyleSheet, View, SafeAreaView, Dimensions, Platform, StatusBar } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';

const { width, height } = Dimensions.get('window');
const STATUSBAR_HEIGHT = StatusBar.currentHeight || 0;

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <ThemedText style={[styles.title, { color: '#000' }]}>Dashboard</ThemedText>
        </View>
        
        <View style={styles.content}>
          <ThemedText style={{ color: '#000' }}>Working in progress...</ThemedText>
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingHorizontal: width * 0.05,
    paddingTop: Platform.OS === 'ios' ? height * 0.06 : STATUSBAR_HEIGHT + height * 0.04,
    paddingBottom: height * 0.02,
    backgroundColor: '#fff',
    marginBottom: height * 0.01,
  },
  title: {
    fontSize: Math.min(32, width * 0.08),
    fontWeight: 'bold',
    lineHeight: 40,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 
