// ./Components/StoryReader.js
import React from 'react';
import {
  View,
  Text,
  Image,
  ImageBackground,
  ScrollView,
  TouchableOpacity,
  Share,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

/* ─── картинки ─── */
const BG_DARK   = require('../assets/background.png');
const ICO_BACK  = require('../assets/arrow_back.png');
const ICO_CHART = require('../assets/chart.png');
const ICO_TIME  = require('../assets/timer_icon.png');

/* цвета и ширина рамки */
const BORDER_GRAD   = ['#FEF6BA', '#B38028'];
const DARK          = '#000';
const BORDER_WIDTH  = 1;   // толщина градиентного бордера

export default function StoryReader() {
  const navigation      = useNavigation();
  const { params = {} } = useRoute();
  const story           = params.story ?? {};

  const shareIt = () =>
    Share.share({
      title  : story.title,
      message: story.text || 'Great article from MileStar!',
    });

  return (
    <ImageBackground source={BG_DARK} style={styles.root}>
      {/* HEADER */}
      <View style={styles.header}>
        {/* BACK */}
        <View style={styles.headerBtnWrap}>
          <LinearGradient
            colors={BORDER_GRAD}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.headerGradient}
          />
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            hitSlop={12}
            style={styles.headerInner}
          >
            <Image source={ICO_BACK} style={styles.navIco} />
          </TouchableOpacity>
        </View>

        {/* TITLE */}
        <View style={styles.headerTitleWrap}>
          <LinearGradient
            colors={BORDER_GRAD}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.headerGradient}
          />
          <View style={styles.headerTitleInner}>
            <Text style={styles.hdrTitle}>Reading Story</Text>
          </View>
        </View>

        {/* CHART */}
        <View style={styles.headerBtnWrap}>
          <LinearGradient
            colors={BORDER_GRAD}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.headerGradient}
          />
          <TouchableOpacity   onPress={() => navigation.navigate('Statistics')} hitSlop={12} style={styles.headerInner}>
            <Image source={ICO_CHART} style={styles.navIco} />
          </TouchableOpacity>
        </View>
      </View>

      {/* CONTENT */}
      <ScrollView showsVerticalScrollIndicator={false}>
        <Image
          source={require('../assets/story_cover.png')}
          style={styles.cover}
          resizeMode="cover"
        />

        <View style={styles.pad}>
          <Text style={styles.title}>{story.title}</Text>

          <View style={styles.timeRow}>
            <Image source={ICO_TIME} style={styles.timeIco} />
            <Text style={styles.timeTxt}>{story.time}</Text>
          </View>

          <Text style={styles.body}>{story.text}</Text>
        </View>

        {/* BOTTOM BUTTONS */}
        <View style={styles.bottomRow}>
          <LinearGradient
            colors={BORDER_GRAD}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.bottomBtn, { flex: 1.05 }]}
          >
            <TouchableOpacity
              style={styles.btnInner}
              activeOpacity={0.85}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.bottomTxt}>Close</Text>
            </TouchableOpacity>
          </LinearGradient>

          <LinearGradient
            colors={BORDER_GRAD}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.bottomBtn, { flex: 1 }]}
          >
            <TouchableOpacity
              style={styles.btnInner}
              activeOpacity={0.85}
              onPress={shareIt}
            >
              <Text style={styles.bottomTxt}>Share</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  /* HEADER */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    marginBottom: 22,
  },
  headerBtnWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    marginHorizontal: 4,
  },
  headerTitleWrap: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    marginHorizontal: 8,
  },
  // общий стиль для всех градиентов
  headerGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  // внутренняя чёрная часть, «врезанная» внутрь на BORDER_WIDTH
  headerInner: {
    position: 'absolute',
    top: BORDER_WIDTH,
    bottom: BORDER_WIDTH,
    left: BORDER_WIDTH,
    right: BORDER_WIDTH,
    backgroundColor: DARK,
    borderRadius: 22 - BORDER_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // для заголовка дополнительно центрируем текст
  headerTitleInner: {
    position: 'absolute',
    top: BORDER_WIDTH,
    bottom: BORDER_WIDTH,
    left: BORDER_WIDTH,
    right: BORDER_WIDTH,
    backgroundColor: DARK,
    borderRadius: 22 - BORDER_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },

  navIco: {
    width: 24,
    height: 24,
    tintColor: '#fff',
  },
  hdrTitle: {
    color: '#fff',
    fontSize: 18,
   
  },

  /* COVER */
  cover: {
    width: '100%',
    height: width * 0.58,
    marginBottom: 16,
  },

  pad: {
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  title: {
    fontSize: 22,
    color: '#fff',
    fontFamily: 'ProstoOne-Regular',
    marginBottom: 8,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  timeIco: {
    width: 14,
    height: 14,
    marginRight: 6,
    tintColor: BORDER_GRAD[1],
  },
  timeTxt: {
    fontSize: 14,
    color: '#aaa',
    fontFamily: 'ProstoOne-Regular',
  },
  body: {
    fontSize: 16,
    lineHeight: 22,
    color: '#fff',
    fontFamily: 'ProstoOne-Regular',
  },

  /* BOTTOM */
  bottomRow: {
    position: 'absolute',
    bottom: 30,
    left: 24,
    right: 24,
    flexDirection: 'row',
  },
  bottomBtn: {
    marginHorizontal: 4,
    borderRadius: 10,
    overflow: 'hidden',
    ...Platform.select({ ios: {}, android: {} }),
  },
  btnInner: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
  },
  bottomTxt: {
    color: '#000',
    fontSize: 18,

  },
});
