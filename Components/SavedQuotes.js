/* ------------------------------------------------------------------
   ./Components/SavedQuotes.js
   • Отображает сохранённые цитаты
   • Кастомная вертикальная scroll-линиЯ (золотой трек + бегунок)
------------------------------------------------------------------- */
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
import { useQuotes } from './QuotesContext';

/* ─── assets ─── */
const BG_DARK   = require('../assets/background.png');
const ICO_BACK  = require('../assets/arrow_back.png');
const ICO_CHART = require('../assets/chart.png');
const ICO_DONE  = require('../assets/bookmark_fill.png');
const ICO_EMPTY = require('../assets/bookmark_outline.png');
const ICO_QUOTE = require('../assets/tabler_quote.png');

/* ─── colors / sizes ─── */
const BORDER_GRAD = ['#FEF6BA', '#B38028'];
const BORDER      = '#B38028';
const DARK        = '#000';
const BORDER_W    = 1;

const HEADER_PAD   = 50;
const HEADER_BTN_H = 44;
const HEADER_MB    = 20;
const HEADER_TOTAL = HEADER_PAD + HEADER_BTN_H + HEADER_MB;  // 114

/* — helpers — */
function GradientCircle({ children, onPress }) {
  return (
    <View style={styles.headerBtnWrap}>
      <LinearGradient colors={[BORDER, '#FEF6BA']} start={{ x:0.5, y:0 }} end={{ x:0.5, y:1 }} style={StyleSheet.absoluteFillObject}/>
      <TouchableOpacity onPress={onPress} hitSlop={10} style={styles.headerInner}>
        {children}
      </TouchableOpacity>
    </View>
  );
}
function BookmarkBtn({ saved, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} hitSlop={10}>
      <Image source={saved ? ICO_DONE : ICO_EMPTY} style={{ width:34, height:34 }}/>
    </TouchableOpacity>
  );
}

/* ───────────────────────────────────────────────────────────── */
export default function SavedQuotes() {
  const navigation          = useNavigation();
  const insets              = useSafeAreaInsets();
  const { quotes, removeQuote } = useQuotes();

  /* scroll-bar calculations */
  const [contentH, setContentH]     = useState(1);
  const [containerH, setContainerH] = useState(0);
  const scrollY = useRef(new Animated.Value(0)).current;

  const thumbHeight = containerH
    ? Math.max((containerH * containerH) / contentH, 40)
    : 0;

  const translateY = scrollY.interpolate({
    inputRange : [0, Math.max(contentH - containerH, 1)],
    outputRange: [0, Math.max(containerH - thumbHeight, 0)],
    extrapolate: 'clamp',
  });

  /* -------- render quote card -------- */
  const renderCard = ({ item }) => (
    <View style={styles.card}>
      <Image source={ICO_QUOTE} style={styles.quoteIco}/>
      <Text style={styles.quoteTxt}>"{item.text}"</Text>
      <Text style={styles.author}>— {item.author}</Text>
      <View style={styles.bookmark}>
        <BookmarkBtn saved onPress={() => removeQuote(item.id)}/>
      </View>
    </View>
  );

  /* ─────────── UI ─────────── */
  return (
    <ImageBackground source={BG_DARK} style={styles.root}>
      {/* HEADER */}
      <View style={styles.header}>
        <GradientCircle onPress={() => navigation.goBack()}>
          <Image source={ICO_BACK} style={styles.navIco}/>
        </GradientCircle>

        <View style={styles.hdrTitleWrap}>
          <LinearGradient colors={[BORDER, '#FEF6BA']} start={{ x:0.5, y:1 }} end={{ x:0.5, y:0 }} style={styles.hdrTitleGrad}/>
          <View style={styles.hdrTitleInner}>
            <Text style={styles.hdrTitle}>Saved Quotes</Text>
          </View>
        </View>

        <GradientCircle onPress={() => navigation.navigate('Statistics')}>
          <Image source={ICO_CHART} style={styles.navIco}/>
        </GradientCircle>
      </View>

      {/* LIST + SCROLL-TRACK */}
      {quotes.length > 0 ? (
        <View
          style={styles.listContainer}
          onLayout={e => setContainerH(e.nativeEvent.layout.height)}
        >
          <Animated.FlatList
            data={quotes}
            keyExtractor={q => q.id}
            renderItem={renderCard}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
            onScroll={Animated.event(
              [{ nativeEvent:{ contentOffset:{ y:scrollY } } }],
              { useNativeDriver:false }
            )}
            onContentSizeChange={(_, h) => setContentH(h)}
          />

          {/* scroll track */}
          <View
            style={[
              styles.scrollTrackWrap,
              { top: HEADER_TOTAL - 120, bottom: insets.bottom + 90 },
            ]}
          >
            <Animated.View
              style={[
                styles.scrollThumb,
                { height: thumbHeight, transform:[{ translateY }] },
              ]}
            />
          </View>
        </View>
      ) : (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyTxt}>No quotes saved yet…</Text>
        </View>
      )}
    </ImageBackground>
  );
}

/* ─── STYLES ─── */
const styles = StyleSheet.create({
  root:{ flex:1 },

  /* HEADER */
  header:{
    flexDirection:'row',
    alignItems:'center',
    paddingTop:HEADER_PAD,
    paddingHorizontal:20,
    marginBottom:HEADER_MB,
  },
  headerBtnWrap:{ width:44, height:44, borderRadius:22, overflow:'hidden', marginHorizontal:4 },
  headerInner:{
    ...StyleSheet.absoluteFillObject,
    backgroundColor:DARK,
    top:BORDER_W,left:BORDER_W,right:BORDER_W,bottom:BORDER_W,
    borderRadius:22 - BORDER_W,
    justifyContent:'center', alignItems:'center',
  },
  navIco:{ width:24, height:24, tintColor:'#fff' },

  hdrTitleWrap:{ flex:1, marginHorizontal:20, borderRadius:28, overflow:'hidden', padding:BORDER_W },
  hdrTitleGrad:{ ...StyleSheet.absoluteFillObject },
  hdrTitleInner:{
    flex:1, backgroundColor:DARK, borderRadius:28 - BORDER_W,
    justifyContent:'center', alignItems:'center',
  },
  hdrTitle:{ color:'#fff', fontSize:18, fontWeight:'700' },

  /* list container & scroll line */
  listContainer:{ flex:1 },
  scrollTrackWrap:{
    position:'absolute',
    right:4,
    width:12,
    borderRadius:6,
    backgroundColor:'#B3802880',
    borderWidth:1,
    borderColor:BORDER,
    overflow:'hidden',
  },
  scrollThumb:{
    position:'absolute',
    left:0,
    width:'100%',
    backgroundColor:BORDER,
    borderRadius:6,
  },

  /* CARD */
  card:{
    borderWidth:1,
    borderColor:BORDER,
    borderRadius:12,
    marginHorizontal:26,
    marginBottom:26,
    padding:18,
    position:'relative',
  },
  quoteIco:{ width:28, height:28, marginBottom:8, tintColor:BORDER },
  quoteTxt:{ fontSize:16, lineHeight:22, color:'#fff', marginBottom:14, fontFamily:'Prompt-SemiBoldItalic' },
  author:{ fontSize:16, color:'#fff', fontFamily:'ProstoOne-Regular' },
  bookmark:{ position:'absolute', right:14, bottom:14 },

  /* EMPTY */
  emptyWrap:{ flex:1, justifyContent:'center', alignItems:'center' },
  emptyTxt:{ color:'#fff', fontSize:18, opacity:0.7 },
});
