import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Animated,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { MaterialIcons } from '@expo/vector-icons';
import { parseFoodFromText, saveFoods } from '@/utils/foodStorage';
import { Food } from '@/types/food';

interface FoodPasteViewProps {
  onSuccess: () => void;
}

export function FoodPasteView({ onSuccess }: FoodPasteViewProps) {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [previewFoods, setPreviewFoods] = useState<Food[]>([]);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0.6,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: -50,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      }
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, [fadeAnim, slideAnim]);

  const shakeInput = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePreview = () => {
    if (!content.trim()) {
      shakeInput();
      Alert.alert('Errore', 'Inserisci il contenuto da analizzare');
      return;
    }

    const result = parseFoodFromText(content);
    if (result.success && result.foods) {
      if (result.foods.length === 0) {
        shakeInput();
        Alert.alert('Errore', 'Nessun alimento trovato nel testo');
        return;
      }
      setPreviewFoods(result.foods);
      Keyboard.dismiss();
    } else {
      shakeInput();
      Alert.alert('Errore', result.error || 'Formato non valido');
      setPreviewFoods([]);
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
        setContent('');
        setPreviewFoods([]);
      } else {
        Alert.alert('Errore', result.error || 'Errore durante il salvataggio');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setContent('');
    setPreviewFoods([]);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      style={styles.container}
    >
      <Animated.View
        style={[
          styles.inputContainer,
          { transform: [{ translateX: shakeAnim }] }
        ]}
      >
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            multiline
            placeholder="Incolla qui il testo con gli alimenti..."
            placeholderTextColor="#999"
            value={content}
            onChangeText={setContent}
            textAlignVertical="top"
          />
          {content.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClear}
            >
              <MaterialIcons name="close" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[styles.previewButton, !content && styles.buttonDisabled]}
          onPress={handlePreview}
          disabled={!content}
        >
          <MaterialIcons name="preview" size={24} color="#fff" />
          <ThemedText style={styles.buttonText}>
            {previewFoods.length > 0 ? 'Aggiorna Anteprima' : 'Anteprima'}
          </ThemedText>
        </TouchableOpacity>
      </Animated.View>

      {previewFoods.length > 0 && (
        <Animated.View
          style={[
            styles.previewContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.previewHeader}>
            <ThemedText style={styles.previewTitle}>Anteprima</ThemedText>
            <ThemedText style={styles.previewSubtitle}>
              {previewFoods.length > 3 ? 'Prime 3 voci' : 'Tutte le voci'}
            </ThemedText>
          </View>

          <View style={styles.previewList}>
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
        </Animated.View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inputContainer: {
    gap: 16,
  },
  inputWrapper: {
    position: 'relative',
  },
  input: {
    minHeight: 150,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#333',
    textAlignVertical: 'top',
  },
  clearButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 4,
  },
  previewButton: {
    backgroundColor: '#2196F3',
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
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  previewContainer: {
    flex: 1,
    gap: 16,
    marginTop: 16,
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
  previewList: {
    gap: 12,
  },
  previewItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e0e0e0',
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
});
