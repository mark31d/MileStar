// ./Components/Dashboard.js
import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, Image, TouchableOpacity,
  Animated, ImageBackground, StyleSheet, Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Line } from 'react-native-svg';
import { useQuotes } from './QuotesContext';

/* assets */
const BG_PATTERN       = require('../assets/background.png');
const ICO_BACK         = require('../assets/arrow_back.png');
const ICO_CHART        = require('../assets/chart.png');
const TABLER_QUOTE     = require('../assets/tabler_quote.png');
const BOOKMARK_OUTLINE = require('../assets/bookmark_outline.png');
const BOOKMARK_FILL    = require('../assets/bookmark_fill.png');
const ICO_EDIT         = require('../assets/edit.png');
const ICO_TRASH        = require('../assets/trash.png');

/* demo quotes */
const QUOTES = [
  { id:'1', text:'The way to get started is to quit talking and begin doing.', author:'Walt Disney' },
  { id:'2', text:'Life is what happens when you’re busy making other plans.', author:'John Lennon' },
  { id:'3', text:'The only limit to our realization of tomorrow is our doubts of today.', author:'Franklin D. Roosevelt' },
  { id:'4', text:'In the end, we will remember not the words of our enemies, but the silence of our friends.', author:'Martin Luther King Jr.' },
  { id:'5', text:'The purpose of our lives is to be happy.', author:'Dalai Lama' },
];

/* constants */
const BORDER_GRAD = ['#FEF6BA', '#B38028'];
const GOLD        = '#B38028';
const GOLD_50     = '#B3802880';
const YELLOW      = '#FEF6BA';
const DARK        = '#000';

const { height }  = Dimensions.get('window');
const HEADER_PAD  = 50;
const HEADER_BTN  = 44;
const HEADER_MB   = 12;
const BORDER_W    = 1;

export default function Dashboard() {
  const nav        = useNavigation();
  const focused    = useIsFocused();
  const insets     = useSafeAreaInsets();
  const { addQuote, removeQuote, quotes:saved } = useQuotes();

  const [quote, setQuote]   = useState({ id:'', text:'', author:'' });
  const [tasks, setTasks]   = useState([]);
  const [mark,  setMark]    = useState(false);

  /* load */
  useEffect(() => {
    if (!focused) return;
    (async () => {
      setQuote(QUOTES[Math.floor(Math.random()*QUOTES.length)]);
      const raw = await AsyncStorage.getItem('tasks');
      setTasks(raw ? JSON.parse(raw) : []);
    })();
  }, [focused]);

  /* bookmark flag */
  useEffect(() => {
    setMark(saved.some(q => q.id === quote.id));
  }, [quote, saved]);

  const toggleBookmark = () =>
    mark ? removeQuote(quote.id) : addQuote(quote);

  const delTask = async (id) => {
    const next = tasks.filter(t => t.id !== id);
    await AsyncStorage.setItem('tasks', JSON.stringify(next));
    setTasks(next);
  };

  /* custom scroll thumb */
  const [contH, setContH] = useState(1);
  const [wrapH, setWrapH] = useState(0);
  const y = useRef(new Animated.Value(0)).current;

  const thumbH = wrapH ? Math.max((wrapH*wrapH)/contH, 40) : 0;
  const ty     = y.interpolate({
    inputRange : [0, Math.max(contH-wrapH,1)],
    outputRange: [0, Math.max(wrapH-thumbH,0)],
    extrapolate: 'clamp',
  });

  return (
    <ImageBackground source={BG_PATTERN} style={styles.root} imageStyle={{ opacity:0.15 }}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.hBtnWrap}>
          <LinearGradient colors={BORDER_GRAD} style={StyleSheet.absoluteFillObject}/>
          <TouchableOpacity
   hitSlop={10}
   style={styles.hInner}
   onPress={() => {
     if (nav.canGoBack()) {
       nav.goBack();
     } else {
      
     }
   }}
 >
            <Image source={ICO_BACK} style={styles.hIco}/>
          </TouchableOpacity>
        </View>

        <View style={styles.hTitleWrap}>
          <LinearGradient colors={BORDER_GRAD} style={StyleSheet.absoluteFillObject}/>
          <View style={styles.hTitleInner}>
            <Text style={styles.hTitle}>Your Goals</Text>
          </View>
        </View>

        <View style={styles.hBtnWrap}>
          <LinearGradient colors={BORDER_GRAD} style={StyleSheet.absoluteFillObject}/>
          <TouchableOpacity onPress={()=>nav.navigate('Statistics')} style={styles.hInner} hitSlop={10}>
            <Image source={ICO_CHART} style={styles.hIco}/>
          </TouchableOpacity>
        </View>
      </View>

      {/* BODY */}
      <View style={styles.scrollWrap} onLayout={e=>setWrapH(e.nativeEvent.layout.height)}>
        <Animated.ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal:24, paddingBottom:insets.bottom+140 }}
          onScroll={Animated.event([{ nativeEvent:{ contentOffset:{ y } } }], { useNativeDriver:false })}
          onContentSizeChange={(_,h)=>setContH(h)}
        >
          {/* QUOTE */}
          <View style={styles.quoteCard}>
            <View style={styles.quoteInnerRow}>
              <Image source={TABLER_QUOTE} style={styles.quoteIcon}/>
              <View style={styles.quoteTxtWrap}>
                <Text style={styles.quoteTxt}>“{quote.text}”</Text>
                <Text style={styles.quoteAuth}>— {quote.author}</Text>
              </View>
              <TouchableOpacity onPress={toggleBookmark} style={styles.bookBtn}>
                <Image source={mark?BOOKMARK_FILL:BOOKMARK_OUTLINE} style={styles.bookIco}/>
              </TouchableOpacity>
            </View>
          </View>

          {/* TASKS */}
          <View style={styles.tasksBox}>
            {tasks.length===0 ? (
              <View style={styles.emptyBox}>
                <Text style={styles.plus}>＋</Text>
                <Text style={styles.emptyTxt}>
                  There are no tasks here right now{'\n'}
                  Tap “＋” to add the new one
                </Text>
              </View>
            ) : tasks.map((t, idx)=>{
              const cur = t.done?.findIndex(v=>!v) ?? 0;
              return (
                <View key={t.id} style={[styles.card, idx<tasks.length-1 && styles.cardSep]}>
                  <Text style={styles.cTitle}>{t.title}</Text>
                  {!!t.desc && <Text style={styles.cDesc}>{t.desc}</Text>}

                  {/* bubbles */}
                  <View style={styles.bubbles}>
                    {t.milestones.map((_,j)=>{
                      const done = t.done?.[j];
                      const curB = !done && j===cur;
                      const bg  = done ? GOLD_50 : curB ? '#FFF' : YELLOW;
                      return (
                        <React.Fragment key={j}>
                          <View style={[styles.bubble,{backgroundColor:bg}]}>
                            <Text style={styles.bTxt}>{j+1}</Text>
                          </View>
                          {j < t.milestones.length-1 && (
                            <Svg style={styles.conn} viewBox="0 0 100 1" preserveAspectRatio="none">
                              <Line
                                x1="0" y1="0.5" x2="100" y2="0.5"
                                stroke={GOLD}
                                strokeWidth={2}
                                strokeDasharray={[2,4]}
                                strokeDashoffset={2}      // ← смещение влево
                              />
                            </Svg>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </View>

                  {/* actions */}
                  <View style={styles.row}>
                    <TouchableOpacity style={styles.openBtn} activeOpacity={0.85}
                      onPress={()=>nav.navigate('TaskScreen',{task:t})}>
                      <LinearGradient colors={BORDER_GRAD} start={{x:0,y:0}} end={{x:1,y:1}} style={styles.openBg}>
                        <Text style={styles.openTxt}>Open task</Text>
                      </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity activeOpacity={0.85} onPress={()=>nav.navigate('TaskEditor',{task:t})}>
                      <LinearGradient colors={BORDER_GRAD} style={styles.iconBtn}>
                        <Image source={ICO_EDIT} style={styles.iconIco}/>
                      </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity activeOpacity={0.85} onPress={()=>delTask(t.id)}>
                      <LinearGradient colors={BORDER_GRAD} style={styles.iconBtn}>
                        <Image source={ICO_TRASH} style={styles.iconIco}/>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        </Animated.ScrollView>

        {/* custom thumb */}
        {tasks.length>0 && (
          <View style={[styles.track,{top:0,bottom:insets.bottom+90}]}>
            <Animated.View style={[styles.thumb,{height:thumbH,transform:[{translateY:ty}]}]}/>
          </View>
        )}
      </View>
    </ImageBackground>
  );
}

/* styles */
const styles = StyleSheet.create({
  root:{ flex:1, backgroundColor:DARK },

  /* header */
  header:{ flexDirection:'row', alignItems:'center', paddingTop:HEADER_PAD, paddingHorizontal:20, marginBottom:HEADER_MB },
  hBtnWrap:{ width:HEADER_BTN, height:HEADER_BTN, borderRadius:HEADER_BTN/2, overflow:'hidden', marginHorizontal:4 },
  hInner:{ ...StyleSheet.absoluteFillObject, backgroundColor:DARK, top:BORDER_W,left:BORDER_W,right:BORDER_W,bottom:BORDER_W, borderRadius:HEADER_BTN/2-BORDER_W, justifyContent:'center', alignItems:'center' },
  hIco:{ width:28, height:28, tintColor:'#fff' },
  hTitleWrap:{ flex:1, height:HEADER_BTN, borderRadius:HEADER_BTN/2, overflow:'hidden', marginHorizontal:8 },
  hTitleInner:{ ...StyleSheet.absoluteFillObject, backgroundColor:DARK, top:BORDER_W,left:BORDER_W,right:BORDER_W,bottom:BORDER_W, borderRadius:HEADER_BTN/2-BORDER_W, justifyContent:'center', alignItems:'center' },
  hTitle:{ color:'#fff', fontSize:20, fontWeight:'700' },

  scrollWrap:{ flex:1 },

  track:{ position:'absolute', right:2, width:8, borderRadius:4, backgroundColor:'#B3802880', borderWidth:1, borderColor:GOLD, overflow:'hidden' },
  thumb:{ position:'absolute', left:0, width:'100%', backgroundColor:GOLD, borderRadius:4 },

  /* quote */
  quoteCard:{ marginBottom:20 },
  quoteInnerRow:{ position:'relative', flexDirection:'row', alignItems:'flex-start', borderWidth:1, borderColor:GOLD, borderRadius:16, backgroundColor:DARK, paddingHorizontal:16, paddingTop:40, paddingBottom:24, minHeight:120 },
  quoteIcon:{ position:'absolute', top:12, left:16, width:24, height:24, tintColor:GOLD },
  quoteTxtWrap:{ flex:1, marginTop:4 },
  quoteTxt:{ color:'#fff', fontSize:16, fontFamily:'Prompt-SemiBoldItalic', lineHeight:22 },
  quoteAuth:{ color:'#fff', fontSize:14, marginTop:6, fontFamily:'ProstoOne-Regular' },
  bookBtn:{ position:'absolute', right:14, bottom:14 },
  bookIco:{ width:34, height:34 },

  /* tasks */
  tasksBox:{ marginBottom:20, borderWidth:1, borderColor:GOLD, borderRadius:16, backgroundColor:DARK, overflow:'hidden', paddingVertical:24, minHeight:height*0.45 },
  emptyBox:{ paddingVertical:40, alignItems:'center', justifyContent:'center' },
  plus:{ fontSize:60, color:'#fff', marginBottom:14 },
  emptyTxt:{ color:'#fff', textAlign:'center', lineHeight:22 },

  card:{ padding:16 },
  cardSep:{ borderBottomWidth:1, borderStyle:'dashed', borderColor:GOLD },
  cTitle:{ color:'#fff', fontSize:18, fontWeight:'700', marginBottom:4 },
  cDesc:{ color:'#fff', fontSize:14, marginBottom:10 },

  /* bubbles */
  bubbles:{ flexDirection:'row', alignItems:'center', marginBottom:14, marginHorizontal:10 },
  bubble:{ width:46, height:46, borderRadius:12, justifyContent:'center', alignItems:'center' },
  bTxt:{ fontSize:17, fontWeight:'700', color:'#000' },
  conn:{
    flexGrow:1,
    flexShrink:1,
    minWidth:16,
    height:2,
    alignSelf:'center',
    marginHorizontal:-2.5,     

  },

  /* buttons */
  row:{ flexDirection:'row', alignItems:'center' },
  openBtn:{ flex:1 },
  openBg:{ height:46, borderRadius:8, justifyContent:'center', alignItems:'center' },
  openTxt:{ fontSize:16, fontWeight:'700', color:'#fff' },
  iconBtn:{ width:46, height:46, borderRadius:8, marginLeft:10, justifyContent:'center', alignItems:'center' },
  iconIco:{ width:22, height:22, tintColor:'#fff' },
});