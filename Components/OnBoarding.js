// ./Components/OnBoarding.js
import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

/* ─── данные для слайдов ─────────────────────────── */
const SLIDES = [
  {
    key: 's1',
    title: 'Welcome to MileStar',
    body:
      'Turn your dreams into achievable milestones. ' +
      'Start your journey with purpose and structure.',
  },
  {
    key: 's2',
    title: 'Set Goals that Matter',
    body:
      'Define personal, professional, or health goals. ' +
      'Categorize them and stay clear on your mission.',
  },
  {
    key: 's3',
    title: 'Actionable Steps &\nProgress Tracking',
    body:
      'Break your goals into tasks, set deadlines, and track your progress ' +
      'with visual stats and graphs.',
  },
  {
    key: 's4',
    title: 'Stay Focused & Reflect',
    body:
      'Get daily inspiration, reflect on your growth, and stay committed ' +
      'through ups and downs.',
  },
];

/* ─── ассеты ─── */
const LOGO_BANNER = require('../assets/splash_logo.png');

/* кастомный шрифт (без расширения) */
const FONT_PROMPT = 'Prompt-SemiBoldItalic';

/* ────────────────────────────────────────────────── */
export default function OnBoarding() {
  const navigation     = useNavigation();
  const listRef        = useRef(null);
  const [slideIndex, setSlideIndex] = useState(0);

  /* ——— переход к следующему / завершение ——— */
  const nextSlide = () => {
    if (slideIndex < SLIDES.length - 1) {
      listRef.current?.scrollToIndex({ index: slideIndex + 1 });
    } else {
      finish();                                          // последний слайд
    }
  };

  /* ——— пропускаем всё онбординг + открываем редактор задачи ——— */
  const finish = () => {
    navigation.reset({
      index: 1,
      routes: [
        { name: 'MainTabs' },        // монтируем табы
       
      ],
    });
  };

  /* ——— UI ——— */
  return (
    <View style={styles.root}>
      <FlatList
        ref={listRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.key}
        onMomentumScrollEnd={(e) =>
          setSlideIndex(Math.round(e.nativeEvent.contentOffset.x / width))
        }
        renderItem={({ item }) => (
          <View style={styles.page}>
            {/* верхняя половина: логотип */}
            <Image
              source={LOGO_BANNER}
              style={styles.banner}
              resizeMode="contain"
            />

            {/* текст + кнопки */}
            <View style={styles.block}>
              <Text style={styles.h1}>{item.title}</Text>
              <Text style={styles.body}>{item.body}</Text>

              {/* Next / Get started */}
              <TouchableOpacity activeOpacity={0.85} onPress={nextSlide}>
                <LinearGradient
                  colors={['#FEF6BA', '#B38028']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.nextBtn}
                >
                  <Text style={styles.nextTxt}>
                    {slideIndex < SLIDES.length - 1 ? 'Next' : 'Get Started'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* Skip — только если это не последний экран */}
              {slideIndex < SLIDES.length - 1 && (
                <TouchableOpacity onPress={finish}>
                  <Text style={styles.skip}>Skip</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      />
    </View>
  );
}

/* ─── стили ─── */
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },

  page: { width, height },

  banner: {
    marginTop:30,
    width,
    height: height * 0.46,           // примерно верхняя половина
  },

  block: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },

  h1: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 14,
  },

  body: {
    fontSize: 16,
    lineHeight: 22,
    color: '#fff',
    marginBottom: 32,
  },

  nextBtn: {
    height: 54,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 26,
  },

  nextTxt: {
    fontFamily: FONT_PROMPT,
    fontSize: 18,
    color: '#000',
  },

  skip: {
    textAlign: 'center',
    color: '#fff',
    fontSize: 18,
    fontFamily: FONT_PROMPT,
  },
});
