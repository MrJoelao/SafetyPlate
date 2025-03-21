import { Modal, StyleSheet, View, TouchableOpacity, Dimensions, Animated, ScrollView, Pressable } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { MaterialIcons } from '@expo/vector-icons';
import { useState, useRef, useEffect } from 'react';
import { BlurView } from 'expo-blur';
import { InlineFoodManager } from './InlineFoodManager';
import { FoodImportView } from './FoodImportView';
import { FoodPasteView } from './FoodPasteView';

interface ImportFoodModalProps {
  visible: boolean;
  onClose: () => void;
}

type Tab = 'manage' | 'import';

interface TabItem {
  key: Tab;
  title: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  color: string;
}

const tabs: TabItem[] = [
  { key: 'manage', title: 'Lista Alimenti', icon: 'restaurant-menu', color: '#006C51' },
  { key: 'import', title: 'Importa', icon: 'upload-file', color: '#2196F3' }
];

const { width, height } = Dimensions.get('window');

export function ImportFoodModal({ visible, onClose }: ImportFoodModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>('manage');
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  const indicatorAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(indicatorAnim, {
        toValue: activeTab === 'manage' ? 0 : 1,
        useNativeDriver: true,
        friction: 28,
        tension: 220,
        velocity: 3,
      }),
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.98,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 18,
          tension: 180,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [activeTab]);

  const handleTabChange = (tab: Tab) => {
    if (tab === activeTab) return;

    Animated.timing(slideAnim, {
      toValue: tab === 'manage' ? 400 : -400,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setActiveTab(tab);
      slideAnim.setValue(tab === 'manage' ? -400 : 400);
      
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        friction: 24,
        tension: 180,
      }).start();

      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    });
  };

  const indicatorTranslate = indicatorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [2, width * 0.425 - 2]
  });

  const renderContent = () => (
    <Animated.View
      style={[
        styles.contentContainer,
        { transform: [{ translateX: slideAnim }, { scale: scaleAnim }] }
      ]}
    >
      {activeTab === 'import' ? (
        <ScrollView
          ref={scrollViewRef}
          style={styles.importScrollView}
          contentContainerStyle={styles.importScrollContent}
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          <View style={styles.importContainer}>
            <View style={styles.importSections}>
              <View style={styles.importSection}>
                <View style={styles.sectionHeader}>
                  <MaterialIcons name="upload-file" size={24} color="#006C51" />
                  <ThemedText style={styles.sectionTitle}>Importa da File</ThemedText>
                </View>
                <View style={styles.sectionContent}>
                  <FoodImportView onSuccess={onClose} />
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.importSection}>
                <View style={styles.sectionHeader}>
                  <MaterialIcons name="content-paste" size={24} color="#2196F3" />
                  <ThemedText style={styles.sectionTitle}>Importa da Testo</ThemedText>
                </View>
                <View style={styles.sectionContent}>
                  <FoodPasteView onSuccess={onClose} />
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      ) : (
        <InlineFoodManager />
      )}
    </Animated.View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <BlurView intensity={20} style={styles.backdrop}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHandle} />
          
          <View style={styles.header}>
            <TouchableOpacity 
              onPress={onClose} 
              style={styles.closeButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Segment Control */}
          <View style={styles.segmentContainer}>
            <Animated.View style={[styles.segmentControl, { transform: [{ scale: scaleAnim }] }]}>
              <Animated.View 
                style={[
                  styles.segmentIndicator,
                  { transform: [{ translateX: indicatorTranslate }] }
                ]} 
              />
              {tabs.map(tab => (
                <Pressable
                  key={tab.key}
                  style={({ pressed }) => [
                    styles.segment,
                    pressed && styles.segmentPressed,
                    activeTab === tab.key && styles.activeSegment
                  ]}
                  onPress={() => handleTabChange(tab.key)}
                >
                  <MaterialIcons
                    name={tab.icon}
                    size={20}
                    color={activeTab === tab.key ? tab.color : '#666'}
                    style={[styles.segmentIcon, activeTab === tab.key && styles.activeIcon]}
                  />
                  <ThemedText
                    style={[
                      styles.segmentText,
                      activeTab === tab.key && { color: tab.color }
                    ]}
                  >
                    {tab.title}
                  </ThemedText>
                </Pressable>
              ))}
            </Animated.View>
          </View>

          {/* Content */}
          {renderContent()}
        </View>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    width: '100%',
    marginTop: 4,
  },
  importScrollView: {
    flex: 1,
  },
  importScrollContent: {
    flexGrow: 1,
  },
  importContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 32,
  },
  importSections: {
    flex: 1,
    gap: 32,
  },
  importSection: {
    flex: 1,
    gap: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f1f1f',
  },
  sectionContent: {
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 16,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  modalContainer: {
    width: width,
    height: height,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 24,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
  },
  modalHandle: {
    width: 32,
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    marginTop: 8,
    alignSelf: 'center',
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 12,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  segmentContainer: {
    paddingBottom: 12,
    alignItems: 'center',
  },
  segmentControl: {
    flexDirection: 'row',
    backgroundColor: '#F5F7FA',
    borderRadius: 16,
    padding: 2,
    position: 'relative',
    height: 48,
    width: width * 0.85,
    borderWidth: 1,
    borderColor: '#E4E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  segmentIndicator: {
    position: 'absolute',
    width: '49.5%',
    height: 44,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  segment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    zIndex: 1,
    height: '100%',
  },
  segmentPressed: {
    opacity: 0.7,
  },
  activeSegment: {
    backgroundColor: 'transparent',
  },
  segmentIcon: {
    opacity: 0.8,
    marginTop: -1,
  },
  activeIcon: {
    opacity: 1,
    transform: [{ scale: 1.1 }],
  },
  segmentText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
    marginTop: -1,
  },
});
