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
  ScrollView,
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
  const scrollViewRef = useRef<ScrollView>(null);

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

  const handlePreview = () => {
    if (!content.trim()) {
      Alert.alert('Errore', 'Inserisci il contenuto da analizzare');
      return;
    }

    const result = parseFoodFromText(content);
    if (result.success && result.foods) {
      setPreviewFoods(result.foods);
    } else {
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
          `Salvati ${previewFoods.length} alimenti`,
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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      style={styles.container}
    >
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            multiline
            placeholder="Incolla qui il testo con gli alimenti..."
            placeholderTextColor="#999"
            value={content}
            onChangeText={setContent}
            textAlignVertical="top"
            onFocus={() => {
              setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
              }, 100);
            }}
          />
          <TouchableOpacity
            style={[styles.previewButton, !content && styles.buttonDisabled]}
            onPress={handlePreview}
            disabled={!content}
          >
            <MaterialIcons name="preview" size={24} color="#fff" />
            <ThemedText style={styles.buttonText}>Anteprima</ThemedText>
          </TouchableOpacity>
        </View>

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
              <ThemedText style={styles.previewTitle}>
                Anteprima ({previewFoods.length} alimenti)
              </ThemedText>
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
                    <ThemedText style={styles.buttonText}>Salva</ThemedText>
                  </>
                )}
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
          </Animated.View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  inputContainer: {
    gap: 12,
    marginBottom: 16,
  },
  input: {
    height: 150,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#333',
    textAlignVertical: 'top',
  },
  previewButton: {
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
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
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  previewList: {
    gap: 8,
  },
  previewItem: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  foodName: {
    fontSize: 14,
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
  },
});
