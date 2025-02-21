import { Modal, StyleSheet, View, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { MaterialIcons } from '@expo/vector-icons';
import { useState, useRef } from 'react';
import { BlurView } from 'expo-blur';
import { FoodManagerView } from './FoodManagerView';
import { FoodImportView } from './FoodImportView';
import { FoodPasteView } from './FoodPasteView';

interface ImportFoodModalProps {
  visible: boolean;
  onClose: () => void;
}

type Tab = 'import' | 'paste' | 'manage';

interface TabItem {
  key: Tab;
  title: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  color: string;
}

const tabs: TabItem[] = [
  { key: 'import', title: 'File', icon: 'upload-file', color: '#006C51' },
  { key: 'paste', title: 'Incolla', icon: 'content-paste', color: '#2196F3' },
  { key: 'manage', title: 'Gestione', icon: 'edit', color: '#FF9800' }
];

export function ImportFoodModal({ visible, onClose }: ImportFoodModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>('import');
  const [isManagerVisible, setIsManagerVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const handleTabChange = (tab: Tab) => {
    if (tab === activeTab) return;

    // Slide out current content
    Animated.timing(slideAnim, {
      toValue: -400,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setActiveTab(tab);
      slideAnim.setValue(400);
      
      // Slide in new content
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
      }).start();
    });
  };

  const renderContent = () => (
    <Animated.View
      style={[
        styles.contentContainer,
        { transform: [{ translateX: slideAnim }] }
      ]}
    >
      {activeTab === 'import' && (
        <FoodImportView onSuccess={onClose} />
      )}
      {activeTab === 'paste' && (
        <FoodPasteView onSuccess={onClose} />
      )}
      {activeTab === 'manage' && (
        <View style={styles.manageContainer}>
          <ThemedText style={styles.manageTitle}>
            Gestione degli alimenti
          </ThemedText>
          <ThemedText style={styles.manageDescription}>
            Aggiungi, modifica o elimina gli alimenti manualmente
          </ThemedText>
          <TouchableOpacity
            style={styles.manageButton}
            onPress={() => setIsManagerVisible(true)}
          >
            <MaterialIcons name="settings" size={24} color="#fff" />
            <ThemedText style={styles.buttonText}>
              Apri Gestione
            </ThemedText>
          </TouchableOpacity>
        </View>
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
            <View style={styles.headerContent}>
              <MaterialIcons name="add-circle" size={24} color="#4CAF50" />
              <ThemedText style={styles.title}>Aggiungi Alimenti</ThemedText>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Tabs */}
          <View style={styles.tabs}>
            {tabs.map(tab => (
              <TouchableOpacity
                key={tab.key}
                style={[
                  styles.tab,
                  activeTab === tab.key && styles.activeTab,
                  activeTab === tab.key && { borderBottomColor: tab.color }
                ]}
                onPress={() => handleTabChange(tab.key)}
              >
                <MaterialIcons
                  name={tab.icon}
                  size={24}
                  color={activeTab === tab.key ? tab.color : '#666'}
                />
                <ThemedText
                  style={[
                    styles.tabText,
                    activeTab === tab.key && styles.activeTabText,
                    activeTab === tab.key && { color: tab.color }
                  ]}
                >
                  {tab.title}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>

          {/* Content */}
          {renderContent()}
        </View>
      </BlurView>

      <FoodManagerView
        visible={isManagerVisible}
        onClose={() => setIsManagerVisible(false)}
      />
    </Modal>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    width: '100%',
  },
  tabs: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    fontWeight: '600',
  },
  manageContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  manageTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  manageDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  manageButton: {
    backgroundColor: '#FF9800',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    gap: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  modalContainer: {
    width: width,
    height: height * 0.7,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 24,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    alignItems: 'center',
  },
  modalHandle: {
    width: 36,
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    marginTop: 12,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginTop: 4,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f1f1f',
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
  },
  content: {
    flex: 1,
    width: '100%',
  },
  importOptions: {
    flex: 1,
    padding: 20,
    gap: 16,
  },
  optionCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
  },
  fileCard: {
    borderColor: '#4CAF50',
    borderWidth: 1,
  },
  pasteCard: {
    borderColor: '#2196F3',
    borderWidth: 1,
  },
  manualCard: {
    borderColor: '#FF9800',
    borderWidth: 1,
  },
  optionIcon: {
    width: 60,
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionContent: {
    flex: 1,
    gap: 6,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f1f1f',
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});
