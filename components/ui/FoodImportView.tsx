import { useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Animated } from 'react-native';
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
  const shakeAnimation = useRef(new Animated.Value(0)).current;

  const shakeUploadArea = () => {
    Animated.sequence([
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

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
          shakeUploadArea();
          return;
        }

        if (parseResult.foods && parseResult.foods.length === 0) {
          Alert.alert('Attenzione', 'Nessun alimento trovato nel file');
          setFileName(null);
          shakeUploadArea();
          return;
        }

        setPreviewFoods(parseResult.foods || []);
      }
    } catch (error) {
      Alert.alert('Errore', 'Errore durante la lettura del file');
      console.error('Error picking file:', error);
      shakeUploadArea();
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
          `Importati ${previewFoods.length} alimenti`,
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
        <Animated.View
          style={[
            styles.uploadArea,
            { transform: [{ translateX: shakeAnimation }] }
          ]}
        >
          <TouchableOpacity
            style={styles.uploadContent}
            onPress={handleFilePick}
            disabled={isLoading}
          >
            <View style={styles.uploadIcon}>
              <MaterialIcons name="cloud-upload" size={40} color="#006C51" />
            </View>
            <ThemedText style={styles.uploadTitle}>
              Seleziona un file
            </ThemedText>
            <View style={styles.supportedFormats}>
              <View style={styles.formatBadge}>
                <MaterialIcons name="description" size={16} color="#666" />
                <ThemedText style={styles.formatText}>.txt</ThemedText>
              </View>
              <View style={styles.formatBadge}>
                <MaterialIcons name="code" size={16} color="#666" />
                <ThemedText style={styles.formatText}>.json</ThemedText>
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>
      ) : (
        <View style={styles.previewContainer}>
          <View style={styles.fileInfo}>
            <View style={styles.fileDetails}>
              <View style={styles.fileIconContainer}>
                <MaterialIcons name="description" size={24} color="#006C51" />
              </View>
              <View style={styles.fileData}>
                <ThemedText style={styles.fileName} numberOfLines={1}>
                  {fileName}
                </ThemedText>
                <ThemedText style={styles.foodCount}>
                  {previewFoods.length} {previewFoods.length === 1 ? 'alimento trovato' : 'alimenti trovati'}
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
              <ThemedText style={styles.changeText}>Cambia</ThemedText>
            </TouchableOpacity>
          </View>

          <View style={styles.previewList}>
            <View style={styles.previewHeader}>
              <ThemedText style={styles.previewTitle}>Anteprima</ThemedText>
              <ThemedText style={styles.previewSubtitle}>
                {previewFoods.length > 3 ? 'Prime 3 voci' : 'Tutte le voci'}
              </ThemedText>
            </View>
            {previewFoods.slice(0, 3).map((food, index) => (
              <View key={food.id} style={styles.previewItem}>
                <View style={styles.previewItemLeft}>
                  <ThemedText style={styles.previewIndex}>{index + 1}</ThemedText>
                  <View>
                    <ThemedText style={styles.foodName}>{food.name}</ThemedText>
                    <ThemedText style={styles.foodDetails}>
                      Score: {food.score} • Unità: {food.defaultUnit}
                    </ThemedText>
                  </View>
                </View>
                {food.nutritionPer100g && (
                  <ThemedText style={styles.nutritionInfo}>
                    {food.nutritionPer100g.calories}kcal
                  </ThemedText>
                )}
              </View>
            ))}
            {previewFoods.length > 3 && (
              <ThemedText style={styles.moreItems}>
                ...e altri {previewFoods.length - 3} alimenti
              </ThemedText>
            )}

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
                    Importa {previewFoods.length} {previewFoods.length === 1 ? 'Alimento' : 'Alimenti'}
                  </ThemedText>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  uploadArea: {
    flex: 1,
    minHeight: 200,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    borderRadius: 16,
    backgroundColor: '#F8F9FA',
  },
  uploadContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  supportedFormats: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  formatBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    gap: 4,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  formatText: {
    fontSize: 14,
    color: '#666',
  },
  previewContainer: {
    flex: 1,
    gap: 16,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  fileDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  fileIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fileData: {
    gap: 4,
    flex: 1,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 8,
  },
  changeText: {
    fontSize: 14,
    color: '#2196F3',
  },
  previewList: {
    flex: 1,
    gap: 12,
  },
  previewHeader: {
    gap: 4,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  previewSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  previewItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  previewItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  previewIndex: {
    fontSize: 14,
    color: '#666',
    width: 24,
    textAlign: 'center',
  },
  foodName: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  foodDetails: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  nutritionInfo: {
    fontSize: 14,
    color: '#006C51',
    fontWeight: '500',
  },
  moreItems: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  saveButton: {
    backgroundColor: '#006C51',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
