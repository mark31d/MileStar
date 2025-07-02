/* ------------------------------------------------------------------
   ./Components/TaskScreen.js
   • Первый milestone золотой, остальные белые (границы/чек-боксы)
   • Блоки текста ВСЕГДА тёмные (#000)
   • Milestones-счётчик ↑/↓ на каждый чекбокс + «добивка» при Task Done
------------------------------------------------------------------- */
import React, { useState } from 'react';
import {
  View, Text, Image, ScrollView, TouchableOpacity, StyleSheet,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import LinearGradient               from 'react-native-linear-gradient';
import AsyncStorage                 from '@react-native-async-storage/async-storage';
import { useArchive }               from './ArchiveContext';
import { useMilestones }            from './MilestonesContext';

/* assets */
const ICO_BACK  = require('../assets/arrow_back.png');
const ICO_CHART = require('../assets/chart.png');
const ICO_CHECK = require('../assets/check.png');

/* constants */
const GOLD        = '#B38028';
const GOLD_50     = '#B3802880';
const DARK        = '#000';
const BORDER_GRAD = ['#FEF6BA', GOLD];
const HEADER_PAD  = 50;
const HEADER_BTN  = 44;
const BORDER_W    = 1;

export default function TaskScreen() {
  /* ─── hooks / ctx ─── */
  const navigation      = useNavigation();
  const { params = {} } = useRoute();
  const task            = params.task;

  const { archiveTask }          = useArchive();
  const { add: addMile, remove } = useMilestones();

  /* ─── helpers ─── */
  const normalize = (arr = []) =>
    task.milestones.map((_, idx) => arr[idx] ?? false);

  /* ─── state ─── */
  const [done, setDone] = useState(normalize(task.done));

  const allDone    = done.every(Boolean);
  const currentIdx = done.findIndex(v => !v);

  /* ─── handlers ─── */
  const toggle = (i) =>
    setDone(prev => {
      const prevFull = normalize(prev);
      const next     = prevFull.map((v, idx) => (idx === i ? !v : v));

      if (!prevFull[i] && next[i]) addMile();     // чек ☑
      if ( prevFull[i] && !next[i]) remove();     // сняли галку

      /* persist */
      AsyncStorage.getItem('tasks').then(raw => {
        const arr = JSON.parse(raw ?? '[]');
        const upd = arr.map(t => (t.id === task.id ? { ...t, done: next } : t));
        AsyncStorage.setItem('tasks', JSON.stringify(upd));
      });

      return next;
    });

  const handleAction = async () => {
    const completedNow = done.filter(Boolean).length;

    /* Если нажали «Task Done», а какие-то этапы ещё не «кликнуты» —
       считаем их выполненными и добавляем в статистику вручную */
    if (allDone) {
      const missing = task.milestones.length - completedNow;
      for (let k = 0; k < missing; k++) addMile();   // «добивка» счётчика

      archiveTask({
        id        : task.id,
        title     : task.title,
        desc      : task.desc,
        total     : task.milestones.length,
        completed : task.milestones.length,
      });

      /* убираем из активных задач */
      const raw = await AsyncStorage.getItem('tasks');
      const arr = raw ? JSON.parse(raw) : [];
      await AsyncStorage.setItem('tasks', JSON.stringify(arr.filter(t => t.id !== task.id)));
    }

    navigation.goBack();
  };

  /* ─── UI ─── */
  return (
    <View style={styles.root}>
      {/* HEADER */}
      <View style={styles.header}>
        {/** back */}
        <View style={styles.hBtnWrap}>
          <LinearGradient colors={BORDER_GRAD} style={StyleSheet.absoluteFillObject}/>
          <TouchableOpacity onPress={handleAction} hitSlop={10} style={styles.hInner}>
            <Image source={ICO_BACK} style={styles.hIco}/>
          </TouchableOpacity>
        </View>

        {/** title */}
        <View style={styles.hTitleWrap}>
          <LinearGradient colors={BORDER_GRAD} style={StyleSheet.absoluteFillObject}/>
          <View style={styles.hTitleInner}>
            <Text style={styles.hTitle}>Task</Text>
          </View>
        </View>

        {/** static chart icon */}
        <View style={styles.hBtnWrap}>
          <LinearGradient colors={BORDER_GRAD} style={StyleSheet.absoluteFillObject}/>
          <View style={styles.hInner}>
            <Image source={ICO_CHART} style={styles.hIco}/>
          </View>
        </View>
      </View>

      {/* BODY */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>
        <Text style={styles.title}>{task.title}</Text>
        <Text style={styles.date}>
          {new Date(task.date).toLocaleDateString('en-US', { month:'long', day:'numeric', year:'numeric' })}
        </Text>
        {!!task.desc && <Text style={styles.desc}>{task.desc}</Text>}

        <Text style={styles.section}>Milestones</Text>

        {task.milestones.map((m, i) => {
          const isDone    = done[i];
          const isCurrent = !isDone && i === currentIdx;

          /* colours */
          const BORDER_CLR = isCurrent ? GOLD : isDone ? GOLD_50 : '#FFFFFF';
          const CHK_STYLE  = isDone
            ? { backgroundColor: GOLD_50 }
            : isCurrent
            ? { backgroundColor: GOLD }
            : { backgroundColor:'#fff', borderWidth:1, borderColor:GOLD };
          const CHK_TINT   = isDone || isCurrent ? '#fff' : GOLD;

          return (
            <View key={i} style={styles.msRow}>
              {/* text block (always dark bg) */}
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => toggle(i)}
                style={[styles.msBox, { borderColor: BORDER_CLR }]}
              >
                <Text style={[
                  styles.msTxt,
                  { color: isDone ? '#666' : '#fff' },
                  (isDone || isCurrent) && { fontWeight: '700' },
                ]}>
                  {m}
                </Text>
              </TouchableOpacity>

              {/* checkbox */}
              <TouchableOpacity activeOpacity={0.9} onPress={() => toggle(i)} style={[styles.chkBase, CHK_STYLE]}>
                <Image source={ICO_CHECK} style={[styles.chkIco, { tintColor: CHK_TINT }]}/>
              </TouchableOpacity>
            </View>
          );
        })}

        {/* ACTION BUTTON */}
        <TouchableOpacity activeOpacity={0.85} onPress={handleAction}>
          <View style={styles.actionBtn}>
            <Text style={styles.actionTxt}>{allDone ? 'Task Done' : 'Close'}</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

/* ─── STYLES ─── */
const styles = StyleSheet.create({
  root:{ flex:1, backgroundColor:DARK },

  /* header */
  header:{ flexDirection:'row', alignItems:'center', paddingTop:HEADER_PAD, paddingHorizontal:20, marginBottom:20 },
  hBtnWrap:{ width:HEADER_BTN, height:HEADER_BTN, borderRadius:HEADER_BTN/2, overflow:'hidden', marginHorizontal:4 },
  hInner:{ ...StyleSheet.absoluteFillObject, backgroundColor:DARK, top:BORDER_W,left:BORDER_W,right:BORDER_W,bottom:BORDER_W, borderRadius:HEADER_BTN/2-BORDER_W, justifyContent:'center', alignItems:'center' },
  hIco:{ width:28, height:28, tintColor:'#fff' },
  hTitleWrap:{ flex:1, height:HEADER_BTN, borderRadius:HEADER_BTN/2, overflow:'hidden', marginHorizontal:8 },
  hTitleInner:{ ...StyleSheet.absoluteFillObject, backgroundColor:DARK, top:BORDER_W,left:BORDER_W,right:BORDER_W,bottom:BORDER_W, borderRadius:HEADER_BTN/2-BORDER_W, justifyContent:'center', alignItems:'center' },
  hTitle:{ color:'#fff', fontSize:20, fontWeight:'700' },

  /* meta */
  title:{ color:'#fff', fontSize:20, fontWeight:'700', marginHorizontal:24, marginBottom:6 },
  date :{ color:'#fff', marginHorizontal:24, marginBottom:8 },
  desc :{ color:'#fff', marginHorizontal:24, marginBottom:20, lineHeight:20 },

  section:{ color:'#fff', fontSize:18, marginLeft:24, marginBottom:10 },

  /* milestones row */
  msRow:{ flexDirection:'row', alignItems:'center', marginHorizontal:24, marginBottom:14 },
  msBox:{ flex:1, borderWidth:1, borderRadius:10, padding:14, marginRight:12, backgroundColor:DARK },
  msTxt:{ fontSize:16 },

  chkBase:{ width:48, height:48, borderRadius:10, justifyContent:'center', alignItems:'center' },
  chkIco :{ width:22, height:22 },

  /* action */
  actionBtn:{ height:50, borderRadius:18, backgroundColor:'#fff', justifyContent:'center', alignItems:'center', marginHorizontal:24, marginTop:30 },
  actionTxt:{ color:'#000', fontSize:20, fontWeight:'700' },
});
