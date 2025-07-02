// ./Components/Stories.js
import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  ImageBackground,
  TouchableOpacity,
  Animated,
  FlatList,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { useStories } from './StoriesContext';
const { width } = Dimensions.get('window');

/* ─── картинки ─── */
const BG_DARK   = require('../assets/background.png');
const COVER     = require('../assets/story_cover.png');
const ICO_TIME  = require('../assets/timer_icon.png');
const ICO_BACK  = require('../assets/arrow_back.png');
const ICO_CHART = require('../assets/chart.png');
const BORDER_WIDTH   = 1;
/* ─── данные ─── */

const stories = [
    {
      id: '1',
      title: 'The Power of Micro-Planning',
      time: '3-4 minutes',
      text:
  ` 1. The Power of Micro-Planning
  
  Feeling overwhelmed by big goals? You’re not alone. The secret to turning dreams into results lies in breaking them down. Micro-planning is the practice of turning a large objective into a series of small, clear, and manageable steps. Instead of focusing on the finish line, you focus on the next step — and then the next.
  
  This method keeps you moving, builds momentum, and reduces stress. It also gives you quick wins, which fuel motivation and help you feel in control. Whether your goal is launching a project or running a marathon, micro-planning turns "someday" into "today."
  
  Action Tip: Start each morning by writing down 3 small actions you can complete today. Keep it realistic. Progress compounds.`,
    },
    {
      id: '2',
      title: 'Time Blocking: Structure Equals Freedom',
      time: '4-5 minutes',
      text:
  ` 2. Time Blocking: Structure Equals Freedom
  
  Time blocking isn’t about rigid schedules — it’s about designing your day with intention. Instead of reacting to interruptions or endless task lists, time blocking gives you space to focus on one thing at a time. You allocate chunks of time to specific types of tasks: deep work, admin, breaks, even rest.
  
  This technique minimizes distractions, helps with energy management, and reduces decision fatigue. It’s also one of the few productivity tools that actually creates a sense of freedom — because it gives your time direction.
  
  Action Tip: Try blocking off 90 minutes for your most important task tomorrow. Protect that time like a meeting — because it is one.`,
    },
    {
      id: '3',
      title: 'Why Most To-Do Lists Fail',
      time: '2-3 minutes',
      text:
  ` 3. Why Most To-Do Lists Fail
  
  We all love to-do lists — until they become never-ending reminders of what we didn’t finish. The problem? Most lists are too long, lack prioritization, and mix different kinds of tasks (urgent vs. important).
  
  To fix this, structure your list based on outcomes. Use categories like “Do Now,” “Schedule,” “Delegate,” and “Ignore.” This is known as the Eisenhower Matrix, and it’s a game changer. You’ll stop reacting and start executing.
  
  Action Tip: Choose one high-impact task each day and make it non-negotiable. That’s your true priority. The rest is secondary.`,
    },
    {
      id: '4',
      title: 'Reflect to Improve: Weekly Reviews That Work',
      time: '3-4 minutes',
      text:
  ` 4. Reflect to Improve: Weekly Reviews That Work
  
  What if you treated each week like a mini-experiment? Weekly reviews allow you to pause, reflect, and reset. It’s a space to celebrate wins, learn from setbacks, and realign your goals with reality.
  
  A consistent weekly review can uncover patterns, improve your planning, and even reduce burnout. The best part? It only takes 15–20 minutes.
  
  Action Tip: Each week, ask yourself:
  • What went well?
  • What didn’t?
  • What did I learn?
  • What’s my top focus for next week?
  
  Write your answers down. Growth begins with awareness.`,
    },
  ];


const BORDER_GRAD    = ['#FEF6BA', '#B38028'];
const DARK           = '#000';
const HEADER_HEIGHT  = 50 + 44 + 26; // paddingTop + header btn + marginBottom
const TAB_BAR_HEIGHT = 68 + 8;

export default function Stories() {
  const navigation = useNavigation();
  const inset      = useSafeAreaInsets();
  const scrollY    = useRef(new Animated.Value(0)).current;
  const [contentH, setContentH]     = useState(1);
  const [containerH, setContainerH] = useState(0);
  const { markRead } = useStories();   
  // thumb height
  const thumbHeight = containerH
    ? Math.max((containerH * containerH) / contentH, 40)
    : 0;

  // thumb position
  const translateY = scrollY.interpolate({
    inputRange: [0, Math.max(contentH - containerH, 1)],
    outputRange: [0, Math.max(containerH - thumbHeight, 0)],
    extrapolate: 'clamp',
  });

  const renderCard = ({ item }) => (
    <View style={styles.cardWrap}>
      <Image source={COVER} style={styles.cover} />
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <View style={styles.timeRow}>
          <Image source={ICO_TIME} style={styles.timeIco} />
          <Text style={styles.timeTxt}>{item.time}</Text>
        </View>
        <TouchableOpacity
          style={styles.readBtn}
          activeOpacity={0.85}
          onPress={() => {
                     markRead();                                    // +1 в AsyncStorage и в контексте
                     navigation.navigate('StoryReader', { story: item });
                   }}
        >
          <Text style={styles.readTxt}>Read now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ImageBackground source={BG_DARK} style={styles.root}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerBtnWrap}>
          <LinearGradient
            colors={BORDER_GRAD}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.headerGradient}
          />
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12} style={styles.headerInner}>
            <Image source={ICO_BACK} style={styles.navIco} />
          </TouchableOpacity>
        </View>

        <View style={styles.headerTitleWrap}>
          <LinearGradient colors={BORDER_GRAD} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.headerGradient}/>
          <View style={styles.headerTitleInner}>
            <Text style={styles.hdrTitle}>Inspire Stories</Text>
          </View>
        </View>

        <View style={styles.headerBtnWrap}>
          <LinearGradient
            colors={BORDER_GRAD}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.headerGradient}
          />
          <TouchableOpacity onPress={() => navigation.navigate('Statistics')} hitSlop={12} style={styles.headerInner}>
            <Image source={ICO_CHART} style={styles.navIco} />
          </TouchableOpacity>
        </View>
      </View>

      {/* LIST + SCROLL TRACK */}
      <View
        style={styles.listContainer}
        onLayout={e => setContainerH(e.nativeEvent.layout.height)}
      >
        <Animated.FlatList
          data={stories}
          keyExtractor={i => i.id}
          renderItem={renderCard}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: inset.bottom + TAB_BAR_HEIGHT + 20,
          }}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          onContentSizeChange={(_, h) => setContentH(h)}
        />

        <View
          style={[
            styles.scrollTrackWrap,
            {
              top: HEADER_HEIGHT - 120,                           // extend up
              bottom: inset.bottom + TAB_BAR_HEIGHT - 1,        // extend down
            },
          ]}
        >
          <Animated.View
            style={[
              styles.scrollThumb,
              {
                height: thumbHeight,
                transform: [{ translateY }],
              },
            ]}
          />
        </View>
      </View>
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
    marginBottom: 26,
  },
  headerBtnWrap: {
    width: 44, height: 44, borderRadius: 22,
    overflow: 'hidden', marginHorizontal: 4,
  },
  headerTitleWrap: {
    flex: 1, height: 44, borderRadius: 22,
    overflow: 'hidden', marginHorizontal: 8,
  },
  headerGradient: StyleSheet.absoluteFillObject,
  headerInner: {
    position: 'absolute',
    top: BORDER_WIDTH, bottom: BORDER_WIDTH,
    left: BORDER_WIDTH, right: BORDER_WIDTH,
    backgroundColor: DARK,
    borderRadius: 22 - BORDER_WIDTH,
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitleInner: {
    position: 'absolute',
    top: BORDER_WIDTH, bottom: BORDER_WIDTH,
    left: BORDER_WIDTH, right: BORDER_WIDTH,
    backgroundColor: DARK,
    borderRadius: 22 - BORDER_WIDTH,
    justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: 16,
  },
  navIco: { width: 24, height: 24, tintColor: '#fff' },
  hdrTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },

  listContainer: { flex: 1 },

  scrollTrackWrap: {
    
    position: 'absolute',
    right: 4,            // смещено левее
    width: 12,
    borderRadius: 6,
    backgroundColor: '#B3802880',
    borderWidth: 1,
 
    overflow: 'hidden',
  },
  scrollThumb: {
    position: 'absolute',
    left: 0,
    width: '100%',
    backgroundColor: '#B38028', // ярко-золотой
    borderRadius: 6,
  },

  cardWrap: {
    borderWidth: 1,
    borderColor: BORDER_GRAD[1],
    borderRadius: 12,
    marginHorizontal: 26,
    marginBottom: 26,
    overflow: 'hidden',
    backgroundColor: DARK,
  },
  cover: { width: '100%', height: width * 0.58 },

  cardBody: { padding: 18 },
  cardTitle: { fontSize: 18, color: '#fff', marginBottom: 6 },

  timeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  timeIco: { width: 14, height: 14, marginRight: 6, tintColor: BORDER_GRAD[1] },
  timeTxt: { fontSize: 14, color: '#aaa' },

  readBtn: {
    alignSelf: 'flex-start',
    backgroundColor: BORDER_GRAD[1],
    borderRadius: 24,
    paddingVertical: 8,
    paddingHorizontal: 24,
  },
  readTxt: { color: '#fff', fontWeight: '700' },
});
