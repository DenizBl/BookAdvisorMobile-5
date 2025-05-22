import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ActivityIndicator, Image, ScrollView, TouchableOpacity } from 'react-native';
import { googleBooksService } from '../services/googleBooksService';
import colors from '../constants/colors';
import SubmitButton from './SubmitButton';

const AIBookRecommendation = () => {
  const [mood, setMood] = useState('');
  const [loading, setLoading] = useState(false);
  const [books, setBooks] = useState([]);
  const [error, setError] = useState('');

  const fetchSearchQueryFromGemini = async (userInput) => {
    try {
      console.log('Kullanıcı girişi analiz ediliyor:', userInput);
      
      // Cümle analizi için kategoriler
      const categories = {
        'duygu': {
          'mutlu': ['mutlu', 'sevinçli', 'neşeli', 'keyifli', 'pozitif', 'güzel'],
          'üzgün': ['üzgün', 'hüzünlü', 'depresif', 'mutsuz', 'kederli', 'ağlamak'],
          'kızgın': ['kızgın', 'sinirli', 'öfkeli', 'kızmak', 'sinirlenmek'],
          'stresli': ['stres', 'stresli', 'gergin', 'endişeli', 'kaygılı', 'panik'],
          'yorgun': ['yorgun', 'bitkin', 'uykusuz', 'tükenmiş', 'enerjisiz'],
          'sakin': ['sakin', 'rahat', 'huzurlu', 'dingin', 'yavaş'],
          'romantik': ['romantik', 'aşk', 'sevgi', 'tutku']
        },
        'tür': {
          'macera': ['macera', 'serüven', 'aksiyon', 'heyecan', 'keşif', 'yolculuk'],
          'bilim': ['bilim', 'bilimsel', 'teknoloji', 'uzay', 'keşif', 'araştırma'],
          'fantastik': ['fantastik', 'büyü', 'sihir', 'ejderha', 'elf', 'fantezi', 'mitoloji'],
          'korku': ['korku', 'gerilim', 'ürpertici', 'dehşet', 'korkutucu', 'paranormal'],
          'tarih': ['tarih', 'tarihi', 'savaş', 'antik', 'imparatorluk', 'geçmiş'],
          'felsefe': ['felsefe', 'düşünce', 'varoluş', 'anlam', 'hayatın anlamı'],
          'motivasyon': ['motivasyon', 'kişisel gelişim', 'başarı', 'kendini geliştirme', 'ilham']
        },
        'durum': {
          'yağmurlu': ['yağmur', 'yağmurlu', 'ıslanmak', 'yağış'],
          'sıcak': ['sıcak', 'yaz', 'bunaltıcı', 'kavurucu', 'güneşli'],
          'soğuk': ['soğuk', 'kış', 'kar', 'buz', 'dondurucu'],
          'gece': ['gece', 'uyku', 'yatmadan', 'uyumadan', 'karanlık'],
          'yalnız': ['yalnız', 'yalnızlık', 'tek başına', 'izole']
        }
      };
      
      // Türkçe metni küçük harfe çevir ve boşlukları temizle
      const cleanInput = userInput.toLowerCase().trim();
      
      // Cümleyi eşleştirme skoru hesapla
      let matchedCategories = {};
      let totalMatchScore = 0;
      
      // Her kategoriden en iyi eşleşmeleri bul
      Object.entries(categories).forEach(([categoryType, categoryItems]) => {
        let bestMatchInCategory = { name: null, score: 0 };
        
        Object.entries(categoryItems).forEach(([name, keywords]) => {
          let score = 0;
          keywords.forEach(keyword => {
            if (cleanInput.includes(keyword)) {
              // Tam eşleşmelere daha yüksek puan
              score += keyword.length;
            }
          });
          
          if (score > bestMatchInCategory.score) {
            bestMatchInCategory = { name, score };
          }
        });
        
        if (bestMatchInCategory.score > 0) {
          matchedCategories[categoryType] = bestMatchInCategory.name;
          totalMatchScore += bestMatchInCategory.score;
        }
      });
      
      console.log('Eşleşen kategoriler:', matchedCategories);
      
      // Arama terimi oluştur
      let searchTerms = [];
      
      // Duygu varsa ekle
      if (matchedCategories.duygu) {
        const emotionMap = {
          'mutlu': 'happy feel good',
          'üzgün': 'comforting emotional sad',
          'kızgın': 'anger management',
          'stresli': 'stress relief mindfulness',
          'yorgun': 'relaxing easy read',
          'sakin': 'calming peaceful',
          'romantik': 'romance love story'
        };
        searchTerms.push(emotionMap[matchedCategories.duygu]);
      }
      
      // Tür varsa ekle
      if (matchedCategories.tür) {
        const genreMap = {
          'macera': 'adventure action',
          'bilim': 'science popular science',
          'fantastik': 'fantasy magical fiction',
          'korku': 'horror thriller',
          'tarih': 'historical history',
          'felsefe': 'philosophy meaning of life',
          'motivasyon': 'self help motivational'
        };
        searchTerms.push(genreMap[matchedCategories.tür]);
      }
      
      // Durum varsa ekle
      if (matchedCategories.durum) {
        const situationMap = {
          'yağmurlu': 'cozy rainy day',
          'sıcak': 'summer beach read',
          'soğuk': 'winter cozy',
          'gece': 'bedtime reading',
          'yalnız': 'solitude loneliness'
        };
        searchTerms.push(situationMap[matchedCategories.durum]);
      }
      
      // Hiç kategori eşleşmediyse, basit çeviri yap
      if (searchTerms.length === 0) {
        // Basit çeviri
        console.log('Kategori eşleşmedi, basit çeviri yapılıyor');
        const simpleTranslation = cleanInput
          .replace(/mutlu/g, 'happy')
          .replace(/üzgün/g, 'sad')
          .replace(/heyecanlı/g, 'exciting')
          .replace(/romantik/g, 'romantic')
          .replace(/macera/g, 'adventure')
          .replace(/bilim/g, 'science')
          .replace(/tarih/g, 'history')
          .replace(/stresli/g, 'stress')
          .replace(/rahat/g, 'comfort')
          .replace(/endişeli/g, 'anxiety')
          .replace(/nostaljik/g, 'nostalgia')
          .replace(/meraklı/g, 'curious')
          .replace(/yorgun/g, 'tired')
          .replace(/sıkılmış/g, 'bored')
          .replace(/kızgın/g, 'angry')
          .replace(/yalnız/g, 'lonely')
          + ' books';

        return simpleTranslation;
      }
      
      // Arama terimlerini birleştir ve "books" ekle
      const finalSearchTerm = searchTerms.join(' ') + ' books';
      console.log('Oluşturulan arama terimi:', finalSearchTerm);
      return finalSearchTerm;
    } catch (error) {
      console.error('Hata:', error);
      return 'popular books'; // En basit fallback
    }
  };

  const handleSubmit = async () => {
    if (!mood.trim()) {
      setError('Lütfen ruh halinizi veya istediğiniz kitap türünü yazın.');
      return;
    }

    setLoading(true);
    setBooks([]);
    setError('');

    try {
      const searchTerm = await fetchSearchQueryFromGemini(mood);
      console.log('Oluşturulan arama terimi:', searchTerm);

      // Rastgele sonuçlar için options parametresi eklendi
      const result = await googleBooksService.searchBooks(searchTerm, {
        random: true, // Rastgele sonuçlar için
        maxResults: 30, // Daha fazla sonuç
        orderBy: Math.random() > 0.5 ? 'relevance' : 'newest', // Rastgele sıralama
        startIndex: Math.floor(Math.random() * 20) // Rastgele başlangıç indeksi
      });

      if (result && result.length > 0) {
        // Sonuçları karıştır ve en fazla 15 kitap göster
        const shuffledResults = result
          .sort(() => 0.5 - Math.random())
          .slice(0, 15);
        
        setBooks(shuffledResults);
      } else {
        setError('Bu kriterle ilgili kitap bulunamadı. Lütfen başka bir duygu durumu deneyin.');
      }
    } catch (err) {
      console.error('Hata:', err);
      setError('Üzgünüz, şu anda kitap önerileri getirilemiyor. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const getBookCover = (info) => {
    if (info.imageLinks && info.imageLinks.thumbnail) {
      const secureUrl = info.imageLinks.thumbnail.replace('http://', 'https://');
      return secureUrl;
    }
    return null;
  };

  const MoodButton = ({ title }) => (
    <TouchableOpacity
      style={styles.moodButton}
      onPress={() => setMood(prev => prev ? prev + ', ' + title.toLowerCase() : title.toLowerCase())}
    >
      <Text style={styles.moodButtonText}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.formContainer}>
        <Text style={styles.label}>Bugün Ne Okuyalım?</Text>
        <TextInput
          style={styles.input}
          value={mood}
          onChangeText={setMood}
          placeholder="Şu anki ruh halinizi veya ne hissettiğinizi yazın:"
          placeholderTextColor="#9CA3AF"
          multiline
          numberOfLines={3}
        />

        <View style={styles.moodButtonsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.moodButtonsScroll}>
            <MoodButton title="Mutlu" />
            <MoodButton title="Üzgün" />
            <MoodButton title="Stresli" />
            <MoodButton title="Heyecanlı" />
            <MoodButton title="Rahat" />
            <MoodButton title="Endişeli" />
            <MoodButton title="Romantik" />
            <MoodButton title="Nostaljik" />
            <MoodButton title="Meraklı" />
            <MoodButton title="Yorgun" />
          </ScrollView>
        </View>

        <SubmitButton
          title={loading ? "Kitaplar Aranıyor..." : "Kitap Önerisi Al"}
          onPress={handleSubmit}
          disabled={loading || !mood.trim()}
          color={colors.primary}
          style={styles.submitButton}
        />
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Hata:</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Kitaplar aranıyor...</Text>
        </View>
      ) : null}

      {books.length > 0 && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>Size Özel Kitap Önerileri</Text>
          
          {books
            .filter(book => {
              const info = book.volumeInfo;
              return !!getBookCover(info);
            })
            .map(book => {
              const info = book.volumeInfo;
              const coverUrl = getBookCover(info);
              
              return (
                <View key={book.id} style={styles.bookCard}>
                  <View style={styles.bookCoverContainer}>
                    <Image 
                      source={{ uri: coverUrl }} 
                      style={styles.bookCover} 
                      resizeMode="cover"
                    />
                  </View>
                  <View style={styles.bookInfo}>
                    <Text style={styles.bookTitle}>{info.title}</Text>
                    <Text style={styles.bookAuthor}>
                      {info.authors ? info.authors.join(', ') : 'Yazar bilgisi yok'}
                    </Text>
                    <Text style={styles.bookDescription} numberOfLines={3}>
                      {info.description ? info.description : 'Açıklama mevcut değil'}
                    </Text>
                  </View>
                </View>
              );
            })
          }
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: 16,
    paddingTop: 0,
  },
  formContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    color: colors.text,
    backgroundColor: colors.nearlyWhite,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  moodButtonsContainer: {
    marginVertical: 16,
  },
  moodButtonsScroll: {
    paddingVertical: 8,
  },
  moodButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  moodButtonText: {
    color: colors.white,
    fontWeight: '500',
  },
  submitButton: {
    marginTop: 16,
    borderRadius: 8,
    paddingVertical: 12,
    width: '100%',
  },
  errorContainer: {
    backgroundColor: '#FECACA',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#B91C1C',
    marginBottom: 4,
  },
  errorText: {
    color: '#B91C1C',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  loadingText: {
    marginLeft: 12,
    fontSize: 16,
    color: colors.text,
  },
  resultsContainer: {
    marginTop: 8,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  bookCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  bookCoverContainer: {
    width: 90,
    height: 130,
    marginRight: 12,
  },
  bookCover: {
    width: '100%',
    height: '100%',
    borderRadius: 6,
  },
  bookInfo: {
    flex: 1,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  bookAuthor: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  bookDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
  },
});

export default AIBookRecommendation; 