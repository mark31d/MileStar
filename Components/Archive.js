/* ------------------------------------------------------------------
   ./Components/Archive.js
   • Архив удалённых задач
   • Узкий кастом-scroll (8 px) как в Stories/SavedQuotes —
     показывается только, когда в архиве есть элементы
------------------------------------------------------------------- */
import React, { useRef, useState } from 'react';
import {
  View, Text, Image, ImageBackground,
  TouchableOpacity, Animated, FlatList, StyleSheet,
} from 'react-native';
import { useNavigation }      from '@react-navigation/native';
import { useSafeAreaInsets }  from 'react-native-safe-area-context';
import LinearGradient         from 'react-native-linear-gradient';
import Svg, { Line }          from 'react-native-svg';
import { useArchive }         from './ArchiveContext';

/* ─── assets ─── */
const BG_DARK   = require('../assets/background.png');
const ICO_BACK  = require('../assets/arrow_back.png');
const ICO_CHART = require('../assets/chart.png');

/* ─── colors / sizes ─── */
const BORDER_GRAD = ['#FEF6BA', '#B38028'];
const BORDER      = '#B38028';
const GOLD_50     = '#B3802880';
const DARK        = '#000';
const HEADER_PAD  = 50;
const HEADER_BTN  = 44;
const HEADER_MB   = 20;                         // marginBottom
const BORDER_W    = 1;

/* ─────────────────────────── */
export default function Archive() {
  const navigation            = useNavigation();
  const insets                = useSafeAreaInsets();
  const { archived, restoreTask } = useArchive();

  /* scroll-bar state */
  const [contentH, setContentH]     = useState(1);
  const [containerH, setContainerH] = useState(0);
  const scrollY = useRef(new Animated.Value(0)).current;

  const thumbH = containerH
    ? Math.max((containerH * containerH) / contentH, 40)
    : 0;

  const translateY = scrollY.interpolate({
    inputRange : [0, Math.max(contentH - containerH, 1)],
    outputRange: [0, Math.max(containerH - thumbH, 0)],
    extrapolate: 'clamp',
  });

  /* — bubbles row — */
  const BubbleRow = ({ total }) => (
    <View style={styles.bubbles}>
      {[...Array(total).keys()].map((i) => (
        <React.Fragment key={i}>
          <View
            style={[
              styles.bubble,
              i === total - 1
                ? { backgroundColor:'#fff' }
                : { backgroundColor:GOLD_50 },
            ]}
          >
            <Text style={[
              styles.bubbleTxt,
              i === total - 1 && { color:'#000' },
            ]}>
              {i + 1}
            </Text>
          </View>
          {i < total - 1 && (
            <Svg style={styles.bubbleConnectorSvg}>
              <Line
                x1="0" y1="0" x2="100%" y2="0"
                stroke={BORDER}
                strokeWidth={5}
                strokeDasharray={[4,4]}
              />
            </Svg>
          )}
        </React.Fragment>
      ))}
    </View>
  );

  /* — task card — */
  const renderCard = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.title}</Text>
      {!!item.desc && <Text style={styles.desc}>{item.desc}</Text>}

      <BubbleRow total={item.total ?? 3} />

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => restoreTask(item.id)}
        style={styles.archBtn}
      >
        <Text style={styles.archTxt}>Archived</Text>
      </TouchableOpacity>
    </View>
  );

  /* ─────────── UI ─────────── */
  return (
    <ImageBackground source={BG_DARK} style={styles.root}>
      {/* HEADER */}
      <View style={styles.header}>
        {/* back */}
        <View style={styles.headerBtnWrap}>
          <LinearGradient colors={BORDER_GRAD} style={StyleSheet.absoluteFillObject}/>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10} style={styles.headerInner}>
            <Image source={ICO_BACK} style={styles.navIco}/>
          </TouchableOpacity>
        </View>

        {/* title */}
        <View style={styles.hdrTitleWrap}>
          <LinearGradient colors={BORDER_GRAD} style={StyleSheet.absoluteFillObject}/>
          <View style={styles.hdrTitleInner}>
            <Text style={styles.hdrTitle}>Deleted archive</Text>
          </View>
        </View>

        {/* chart icon (заглушка) */}
        <View style={styles.headerBtnWrap}>
          <LinearGradient colors={BORDER_GRAD} style={StyleSheet.absoluteFillObject}/>
          <TouchableOpacity onPress={() => navigation.navigate('Statistics')} hitSlop={10} style={styles.headerInner}>
            <Image source={ICO_CHART} style={styles.navIco}/>
          </TouchableOpacity>
        </View>
      </View>

      {/* LIST + scroll line (if any cards) */}
      {archived.length ? (
        <View
          style={styles.listContainer}
          onLayout={e => setContainerH(e.nativeEvent.layout.height)}
        >
          <Animated.FlatList
            data={archived}
            keyExtractor={t => t.id}
            renderItem={renderCard}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: insets.bottom + 140 }}
            onScroll={Animated.event(
              [{ nativeEvent:{ contentOffset:{ y:scrollY } } }],
              { useNativeDriver:false }
            )}
            onContentSizeChange={(_, h) => setContentH(h)}
          />

          {/* custom track */}
          <View
            style={[
              styles.scrollTrackWrap,
              { top:0, bottom: insets.bottom + 90 },
            ]}
          >
            <Animated.View
              style={[
                styles.scrollThumb,
                { height:thumbH, transform:[{ translateY }] },
              ]}
            />
          </View>
        </View>
      ) : (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyTxt}>Archive is empty…</Text>
        </View>
      )}
    </ImageBackground>
  );
}

/* ─── STYLES ─── */
const styles = StyleSheet.create({
  root:{ flex:1, backgroundColor:DARK },

  /* header */
  header:{ flexDirection:'row', alignItems:'center', paddingTop:HEADER_PAD, paddingHorizontal:20, marginBottom:HEADER_MB },
  headerBtnWrap:{ width:HEADER_BTN, height:HEADER_BTN, borderRadius:HEADER_BTN/2, overflow:'hidden', marginHorizontal:4 },
  headerInner:{ ...StyleSheet.absoluteFillObject, backgroundColor:DARK, top:BORDER_W,left:BORDER_W,right:BORDER_W,bottom:BORDER_W, borderRadius:HEADER_BTN/2-BORDER_W, justifyContent:'center', alignItems:'center' },
  navIco:{ width:28, height:28, tintColor:'#fff' },
  hdrTitleWrap:{ flex:1, height:HEADER_BTN, borderRadius:HEADER_BTN/2, overflow:'hidden', marginHorizontal:8 },
  hdrTitleInner:{ ...StyleSheet.absoluteFillObject, backgroundColor:DARK, top:BORDER_W,left:BORDER_W,right:BORDER_W,bottom:BORDER_W, borderRadius:HEADER_BTN/2-BORDER_W, justifyContent:'center', alignItems:'center' },
  hdrTitle:{ color:'#fff', fontSize:18, fontWeight:'700' },

  /* list & scroll */
  listContainer:{ flex:1 },
  scrollTrackWrap:{
    position:'absolute',
    right:2,
    width:8,
    borderRadius:4,
    backgroundColor:'#B3802880',
    borderWidth:1,
    borderColor:BORDER,
    overflow:'hidden',
  },
  scrollThumb:{ position:'absolute', left:0, width:'100%', backgroundColor:BORDER, borderRadius:4 },

  /* card */
  card:{ borderWidth:1, borderColor:BORDER, borderRadius:12, marginHorizontal:26, marginBottom:26, padding:18 },
  title:{ fontSize:18, color:'#fff', fontWeight:'700', marginBottom:6 },
  desc :{ fontSize:14, lineHeight:20, color:'#fff', marginBottom:16 },

  /* bubbles */
  bubbles:{ flexDirection:'row', alignItems:'center', marginBottom:16, marginHorizontal:4 },
  bubble:{ width:46, height:46, borderRadius:12, justifyContent:'center', alignItems:'center' },
  bubbleTxt:{ fontSize:17, fontWeight:'700', color:'#000' },
  bubbleConnectorSvg:{ flex:1, height:1, marginHorizontal:8 },

  /* archived btn */
  archBtn:{ height:46, borderRadius:10, backgroundColor:'#B38028', justifyContent:'center', alignItems:'center' },
  archTxt:{ color:'#fff', fontSize:16, fontWeight:'700' },

  /* empty */
  emptyWrap:{ flex:1, justifyContent:'center', alignItems:'center' },
  emptyTxt:{ color:'#fff', fontSize:18, opacity:0.7 },
});
