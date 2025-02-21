import { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { MaterialIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { parseFoodFromText, saveFoods } from '@/utils/foodStorage';
import { Food } from '@/types/food';

interface FoodImportViewProps {
  onSuccess: () => void;
}

export function FoodImportView({ onSuccess }: FoodImportViewProps) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [previewFoods, setPreviewFoods] = useState<Food[]>([]);

  const handleFilePick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/plain', 'application/json'],
      });

      if (!result.canceled) {
        setIsLoading(true);
        const file = result.assets[0];
        setFileName(file.name);
        
        const content = await FileSystem.readAsStringAsync(file.uri);
        const parseResult = parseFoodFromText(content);
        
        if (!parseResult.success) {
          Alert.alert('Errore', parseResult.error || 'Errore durante la lettura del file');
          setFileName(null);
          return;
        }

        setPreviewFoods(parseResult.foods || []);
      }
    } catch (error) {
      Alert.alert('Errore', 'Errore durante la lettura del file');
      console.error('Error picking file:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (previewFoods.length === 0) {
      Alert.alert('Errore', 'Nessun alimento da salvare');
      return;
    }

    try {
      setIsLoading(true);
      const result = await saveFoods(previewFoods);
      if (result.success) {
        Alert.alert(
          'Successo',
          `Salvati ${previewFoods.length} alimenti`,
          [{ text: 'OK', onPress: onSuccess }]
        );
        setFileName(null);
        setPreviewFoods([]);
      } else {
        Alert.alert('Errore', result.error || 'Errore durante il salvataggio');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {!fileName ? (
        <TouchableOpacity
          style={styles.uploadArea}
          onPress={handleFilePick}
          disabled={isLoading}
        >
          <View style={styles.uploadContent}>
            <View style={styles.uploadIcon}>
              <MaterialIcons name="upload-file" size={40} color="#006C51" />
            </View>
            <ThemedText style={styles.uploadTitle}>
              Seleziona un file
            </ThemedText>
            <ThemedText style={styles.uploadDescription}>
              Supporta file TXT e JSON
            </ThemedText>
            <TouchableOpacity
              style={styles.browseButton}
              onPress={handleFilePick}
              disabled={isLoading}
            >
              <MaterialIcons name="folder-open" size={24} color="#fff" />
              <ThemedText style={styles.buttonText}>Sfoglia</ThemedText>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      ) : (
        <View style={styles.previewContainer}>
          <View style={styles.fileInfo}>
            <View style={styles.fileDetails}>
              <MaterialIcons name="description" size={24} color="#006C51" />
              <View>
                <ThemedText style={styles.fileName}>{fileName}</ThemedText>
                <ThemedText style={styles.foodCount}>
                  {previewFoods.length} alimenti trovati
                </ThemedText>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.changeButton}
              onPress={() => {
                setFileName(null);
                setPreviewFoods([]);
              }}
            >
              <MaterialIcons name="change-circle" size={24} color="#2196F3" />
            </TouchableOpacity>
          </View>

          <View style={styles.previewList}>
            {previewFoods.slice(0, 3).map((food, index) => (
              <View key={food.id} style={styles.previewItem}>
                <ThemedText style={styles.foodName}>{food.name}</ThemedText>
                <ThemedText style={styles.foodScore}>
                  Score: {food.score}
                </ThemedText>
              </View>
            ))}
            {previewFoods.length > 3 && (
              <ThemedText style={styles.moreItems}>
                ...e altri {previewFoods.length - 3} alimenti
              </ThemedText>
            )}
          </View>

          <TouchableOpacity
            style={[styles.saveButton, isLoading && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <MaterialIcons name="save" size={24} color="#fff" />
                <ThemedText style={styles.buttonText}>
                  Importa Alimenti
                </ThemedText>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  uploadArea: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  uploadContent: {
    alignItems: 'center',
    gap: 12,
    padding: 24,
  },
  uploadIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  uploadTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  uploadDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  browseButton: {
    backgroundColor: '#006C51',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  previewContainer: {
    flex: 1,
    gap: 16,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 12,
  },
  fileDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  foodCount: {
    fontSize: 14,
    color: '#666',
  },
  changeButton: {
    padding: 8,
  },
  previewList: {
    flex: 1,
    gap: 8,
  },
  previewItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  foodName: {
    fontSize: 16,
    color: '#333',
  },
  foodScore: {
    fontSize: 14,
    color: '#666',
  },
  moreItems: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 8,
  },
  saveButton: {
    backgroundColor: '#006C51',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
