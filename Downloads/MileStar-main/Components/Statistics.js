/* ------------------------------------------------------------------
   ./Components/Statistics.js
   • «Milestones» считается прямо из данных, а не из контекста-счётчика
------------------------------------------------------------------- */
import React, { useMemo } from 'react';
import {
  View, Text, Image, ImageBackground, StyleSheet, TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient     from 'react-native-linear-gradient';
import Svg, { Circle, Defs, LinearGradient as SvgGrad, Stop } from 'react-native-svg';

/* assets */
const BG_DARK  = require('../assets/background.png');
const ICO_BACK = require('../assets/arrow_back.png');
const ICO_CHRT = require('../assets/chart.png');

/* contexts */
import { useTasks }   from './TasksContext';
import { useArchive } from './ArchiveContext';
import { useStories } from './StoriesContext';

/* constants */
const BORDER_GRAD   = ['#FEF6BA', '#B38028'];
const BORDER        = '#B38028';
const BORDER_CLR    = '#FEF6BA';
const DARK          = '#000';
const HEADER_BTN    = 44;
const BORDER_W      = 1;
const DONUT_SIZE    = 100;
const DONUT_STROKE  = 6;

/* donut helper */
const Donut = ({ pct }) => {
  const R = (DONUT_SIZE - DONUT_STROKE) / 2;
  const C = 2 * Math.PI * R;
  return (
    <Svg width={DONUT_SIZE} height={DONUT_SIZE} viewBox={`0 0 ${DONUT_SIZE} ${DONUT_SIZE}`}>
      <Defs>
        <SvgGrad id="donutGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor="#FEF6BA" />
          <Stop offset="100%" stopColor="#B38028" />
        </SvgGrad>
      </Defs>
      <Circle cx={DONUT_SIZE/2} cy={DONUT_SIZE/2} r={R} stroke="#666" strokeWidth={DONUT_STROKE} fill="transparent" />
      <Circle
        cx={DONUT_SIZE/2}
        cy={DONUT_SIZE/2}
        r={R}
        stroke="url(#donutGrad)"
        strokeWidth={DONUT_STROKE}
        strokeDasharray={`${C},${C}`}
        strokeDashoffset={C - (C * pct) / 100}
        strokeLinecap={pct === 100 ? 'butt' : 'round'}
        fill="transparent"
      />
    </Svg>
  );
};

export default function Statistics() {
  const navigation = useNavigation();
  const { tasks }    = useTasks();
  const { archived } = useArchive();
  const { readCount }= useStories();

  /* сколько задач завершено / % выполнено */
  const { endedTasks, percent } = useMemo(() => {
    const endedActive = tasks.filter(t => t.done && t.done.every(Boolean)).length;
    const endedTotal  = endedActive + archived.length;
    const totalTasks  = tasks.length + archived.length;
    return {
      endedTasks: endedTotal,
      percent   : totalTasks ? Math.round((endedTotal / totalTasks) * 100) : 0,
    };
  }, [tasks, archived]);

  /* ——— главный фикс ———
     считаем Milestones по факту:
       • sum(done==true) в активных задачах
       • archived[i].completed   (сохраняется в TaskScreen)
  */
  const milesCount = useMemo(() => {
    const active = tasks.reduce(
      (sum, t) => sum + (t.done ? t.done.filter(Boolean).length : 0),
      0,
    );
    const arch   = archived.reduce(
      (sum, a) => sum + (a.completed ?? 0),
      0,
    );
    return active + arch;
  }, [tasks, archived]);

  /* плитки */
  const tiles = useMemo(() => ([
    { id:'ended', label:'Ended Tasks',    pct:100,            count: endedTasks.toString() },
    { id:'pct',   label:'% of completed', pct:percent,        count:`${percent}%` },
    { id:'mile',  label:'Milestones',     pct:milesCount?100:0,count: milesCount.toString() },
    { id:'read',  label:'Read stories',   pct:readCount?100:0, count: readCount.toString() },
  ]), [endedTasks, percent, milesCount, readCount]);

  /* UI */
  return (
    <ImageBackground source={BG_DARK} style={{ flex:1 }}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerBtnWrap}>
          <LinearGradient colors={BORDER_GRAD} style={StyleSheet.absoluteFillObject}/>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10} style={styles.headerInner}>
            <Image source={ICO_BACK} style={styles.ico}/>
          </TouchableOpacity>
        </View>

        <View style={styles.hdrTitleWrap}>
          <LinearGradient colors={BORDER_GRAD} style={StyleSheet.absoluteFillObject}/>
          <View style={styles.hdrTitleInner}><Text style={styles.hTitle}>Statistics</Text></View>
        </View>

        <View style={styles.chartWrap}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10} style={styles.chartInner}>
            <Image source={ICO_CHRT} style={styles.ico}/>
          </TouchableOpacity>
        </View>
      </View>

      {/* GRID 2×2 */}
      <View style={styles.grid}>
        {tiles.map(t => (
          <View key={t.id} style={styles.cell}>
            <View style={styles.donutWrapper}>
              <Donut pct={t.pct} />
              <View style={styles.countOverlay}><Text style={styles.countText}>{t.count}</Text></View>
            </View>
            <Text style={styles.label}>{t.label}</Text>
          </View>
        ))}
      </View>
    </ImageBackground>
  );
}

/* styles */
const styles = StyleSheet.create({
  header:{ flexDirection:'row', alignItems:'center', paddingTop:50, paddingHorizontal:20, marginBottom:30 },
  headerBtnWrap:{ width:HEADER_BTN, height:HEADER_BTN, overflow:'hidden', borderRadius:HEADER_BTN/2, marginHorizontal:4 },
  headerInner:{ ...StyleSheet.absoluteFillObject, backgroundColor:DARK, top:BORDER_W,left:BORDER_W,right:BORDER_W,bottom:BORDER_W, borderRadius:HEADER_BTN/2-BORDER_W, justifyContent:'center', alignItems:'center' },
  ico:{ width:24, height:24 },

  hdrTitleWrap:{ flex:1, height:HEADER_BTN, borderRadius:HEADER_BTN/2, overflow:'hidden', marginHorizontal:8 },
  hdrTitleInner:{ ...StyleSheet.absoluteFillObject, backgroundColor:DARK, top:BORDER_W,left:BORDER_W,right:BORDER_W,bottom:BORDER_W, borderRadius:HEADER_BTN/2-BORDER_W, justifyContent:'center', alignItems:'center' },
  hTitle:{ color:'#fff', fontSize:18, fontWeight:'700' },

  chartWrap:{ width:HEADER_BTN, height:HEADER_BTN, borderRadius:HEADER_BTN/2, borderWidth:1, borderColor:BORDER_CLR, overflow:'hidden', marginHorizontal:4 },
  chartInner:{ ...StyleSheet.absoluteFillObject, backgroundColor:BORDER, borderRadius:HEADER_BTN/2-1, justifyContent:'center', alignItems:'center' },

  grid:{ flexDirection:'row', flexWrap:'wrap', justifyContent:'space-evenly' },
  cell:{ width:'45%', aspectRatio:1, borderWidth:1, borderColor:BORDER, borderRadius:12, marginBottom:24, paddingVertical:10, alignItems:'center' },

  donutWrapper:{ width:DONUT_SIZE, height:DONUT_SIZE, justifyContent:'center', alignItems:'center' },
  countOverlay:{ position:'absolute', top:0,left:0,right:0,bottom:0, justifyContent:'center', alignItems:'center' },
  countText:{ fontSize:22, fontWeight:'700', color:'#fff' },

  label:{ marginTop:8, color:'#fff', fontSize:14, textAlign:'center' },
});
