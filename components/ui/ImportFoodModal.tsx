import { Modal, StyleSheet, View, TouchableOpacity, TextInput, Dimensions, Platform } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { MaterialIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useState } from 'react';
import * as FileSystem from 'expo-file-system';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

interface ImportFoodModalProps {
  visible: boolean;
  onClose: () => void;
  onImport: (content: string) => void;
}

export function ImportFoodModal({ visible, onClose, onImport }: ImportFoodModalProps) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);

  const handleFilePick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync();

      if (!result.canceled) {
        const file = result.assets[0];
        setFileName(file.name);
        
        // Leggi il contenuto del file
        const content = await FileSystem.readAsStringAsync(file.uri);
        setFileContent(content);
        
        console.log('Contenuto del file:', content);
      }
    } catch (error) {
      console.error('Errore durante la selezione del file:', error);
    }
  };

  const handleImport = () => {
    if (fileContent) {
      onImport(fileContent);
      setFileName(null);
      setFileContent(null);
      onClose();
    }
  };

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

          <View style={styles.content}>
            <View style={styles.importOptions}>
              <TouchableOpacity
                style={[styles.optionCard, styles.fileCard]}
                onPress={handleFilePick}
                activeOpacity={0.8}
              >
                <View style={[styles.optionIcon, { backgroundColor: '#e8f5e9' }]}>
                  <MaterialIcons name="upload-file" size={32} color="#4CAF50" />
                </View>
                <View style={styles.optionContent}>
                  <ThemedText style={styles.optionTitle}>
                    Inserisci File
                  </ThemedText>
                  <ThemedText style={styles.optionDescription}>
                    Carica un file di testo con gli alimenti
                  </ThemedText>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.optionCard, styles.pasteCard]}
                onPress={() => {
                  // TODO: Implementare l'incolla contenuto
                  console.log('Incolla contenuto');
                }}
                activeOpacity={0.8}
              >
                <View style={[styles.optionIcon, { backgroundColor: '#e3f2fd' }]}>
                  <MaterialIcons name="content-paste" size={32} color="#2196F3" />
                </View>
                <View style={styles.optionContent}>
                  <ThemedText style={styles.optionTitle}>
                    Incolla Contenuto
                  </ThemedText>
                  <ThemedText style={styles.optionDescription}>
                    Incolla il testo degli alimenti qui
                  </ThemedText>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.optionCard, styles.manualCard]}
                onPress={() => {
                  // TODO: Implementare l'aggiunta manuale
                  console.log('Aggiunta manuale');
                }}
                activeOpacity={0.8}
              >
                <View style={[styles.optionIcon, { backgroundColor: '#fff3e0' }]}>
                  <MaterialIcons name="edit" size={32} color="#FF9800" />
                </View>
                <View style={styles.optionContent}>
                  <ThemedText style={styles.optionTitle}>
                    Aggiunta Manuale
                  </ThemedText>
                  <ThemedText style={styles.optionDescription}>
                    Inserisci gli alimenti uno alla volta
                  </ThemedText>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </BlurView>
    </Modal>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
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
