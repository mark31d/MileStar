/* ------------------------------------------------------------------
   ./Components/TaskEditor.js
   • «Save» неактивна, пока любой из полей Title / Description / Milestones пустой
------------------------------------------------------------------- */
import React, { useState, useMemo } from 'react';
import {
  View, Text, Image, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Platform, Modal,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage   from '@react-native-async-storage/async-storage';

/* ─── assets ─── */
const ICO_BACK  = require('../assets/arrow_back.png');
const ICO_CHART = require('../assets/chart.png');
const ICO_CAL   = require('../assets/calendar.png');
const ICO_TRASH = require('../assets/trash.png');

/* ─── helpers ─── */
const dateLabel = (d) =>
  d.toLocaleDateString('en-US', { month:'long', day:'numeric', year:'numeric' });

/* ─── constants ─── */
const BORDER_GRAD = ['#FEF6BA', '#B38028'];
const BORDER      = '#B38028';
const DARK        = '#000';
const HEADER_BTN  = 44;
const BORDER_W    = 1;

export default function TaskEditor() {
  const navigation      = useNavigation();
  const { params = {} } = useRoute();
  const editing         = !!params.task;

  /* ─── state ─── */
  const [title, setTitle]       = useState(params.task?.title ?? '');
  const [desc , setDesc]        = useState(params.task?.desc  ?? '');
  const [date , setDate]        = useState(params.task?.date ? new Date(params.task.date) : new Date());
  const [showPicker, setShowPicker] = useState(false);

  /* milestones */
  const [pack, setPack] = useState(params.task?.milestones?.length ?? 3);
  const defaultMs = Array(pack).fill('').map((_, i) => params.task?.milestones?.[i] ?? '');
  const [milestones, setMilestones] = useState(defaultMs);

  /* размер пакета */
  const setPackSize = (cnt) => {
    setPack(cnt);
    setMilestones((old) => {
      const copy = [...old];
      if (cnt > copy.length) while (copy.length < cnt) copy.push('');
      else copy.length = cnt;
      return copy;
    });
  };

  /* удаляем milestone */
  const removeMs = (i) =>
    setMilestones((old) => old.filter((_, idx) => idx !== i));

  /* --- VALIDATION: всё ли заполнено? --- */
  const isValid = useMemo(() =>
    title.trim() !== '' &&
    desc.trim()  !== '' &&
    milestones.every((m) => m.trim() !== ''),
  [title, desc, milestones]);

  /* save */
  const saveTask = async () => {
    if (!isValid) return;
    const payload = {
      id   : params.task?.id ?? Date.now().toString(),
      title, desc,
      date : date.toISOString(),
      milestones,
    };
    const raw  = await AsyncStorage.getItem('tasks');
    const list = raw ? JSON.parse(raw) : [];
    const next = editing
      ? list.map((t) => (t.id === payload.id ? payload : t))
      : [...list, payload];
    await AsyncStorage.setItem('tasks', JSON.stringify(next));
    navigation.goBack();
  };

  /* ─── UI ─── */
  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerBtnWrap}>
          <LinearGradient colors={BORDER_GRAD} style={StyleSheet.absoluteFillObject}/>
          <TouchableOpacity hitSlop={10} onPress={() => navigation.goBack()} style={styles.headerInner}>
            <Image source={ICO_BACK} style={styles.navIco}/>
          </TouchableOpacity>
        </View>

        <View style={styles.headerTitleWrap}>
          <LinearGradient colors={BORDER_GRAD} style={StyleSheet.absoluteFillObject}/>
          <View style={styles.headerTitleInner}>
            <Text style={styles.hdrTitle}>{editing ? 'Task edit' : 'New task'}</Text>
          </View>
        </View>

        <View style={styles.headerBtnWrap}>
          <LinearGradient colors={BORDER_GRAD} style={StyleSheet.absoluteFillObject}/>
          <TouchableOpacity hitSlop={10} onPress={() => navigation.navigate('Statistics')}  style={styles.headerInner}>
            <Image source={ICO_CHART} style={styles.navIco}/>
          </TouchableOpacity >
        </View>
      </View>

      {/* Body */}
      <ScrollView style={{ flex:1 }} contentContainerStyle={{ paddingBottom:140 }} showsVerticalScrollIndicator={false}>
        <Text style={styles.section}>Details</Text>

        <TextInput
          placeholder="Title"
          placeholderTextColor="#666"
          value={title}
          onChangeText={setTitle}
          style={styles.input}
        />

        <TouchableOpacity style={styles.input} activeOpacity={0.85} onPress={() => setShowPicker(true)}>
          <Text style={styles.dateTxt}>{dateLabel(date)}</Text>
          <Image source={ICO_CAL} style={styles.calIco}/>
        </TouchableOpacity>

        <TextInput
          placeholder="Description of task"
          placeholderTextColor="#666"
          value={desc}
          onChangeText={setDesc}
          multiline
          style={[styles.input,{ height:110, textAlignVertical:'top' }]}
        />

        <Text style={styles.section}>Milestones</Text>

        {/* switcher */}
        <View style={styles.swOuter}>
          {[1,3,5].map((n) => {
            const active = pack === n;
            return (
              <TouchableOpacity
                key={n}
                onPress={() => setPackSize(n)}
                style={[styles.swBtn, active && styles.swBtnActive]}
              >
                <Text style={[styles.swTxt, active && styles.swTxtActive]}>
                  {n} {n===1?'milestone':'milestones'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {milestones.map((txt, i) => (
          <View key={i} style={styles.msRow}>
            <TextInput
              placeholder={`Milestone ${i+1}`}
              placeholderTextColor="#666"
              value={txt}
              onChangeText={(t) =>
                setMilestones((old) => old.map((m, idx) => idx===i ? t : m))
              }
              style={[styles.input, { flex:1, marginRight:12 }]}
            />
            {pack>1 && (
              <TouchableOpacity onPress={() => removeMs(i)}>
                <LinearGradient colors={BORDER_GRAD} style={styles.trashBtn}>
                  <Image source={ICO_TRASH} style={styles.trashIco}/>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        ))}

        {/* save button */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={saveTask}
          disabled={!isValid}
          style={{ opacity:isValid ? 1 : 0.4 }}
        >
          <LinearGradient colors={BORDER_GRAD} style={styles.saveBtn}>
            <Text style={styles.saveTxt}>{editing ? 'Save and close' : 'Save'}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>

      {/* date picker modal */}
      {showPicker && (
        <Modal transparent animationType="fade">
          <TouchableOpacity style={styles.pickerBg} activeOpacity={1} onPress={()=>setShowPicker(false)}>
            <DateTimePicker
              value={date}
              mode="date"
              display={Platform.OS==='ios' ? 'spinner':'default'}
              onChange={(_, d) => {
                if (d) setDate(d);
                if (Platform.OS!=='ios') setShowPicker(false);
              }}
              textColor="#fff"
              style={styles.datePicker}
            />
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
}

/* ─── styles ─── */
const styles = StyleSheet.create({
  root:{ flex:1, backgroundColor:DARK },

  /* header */
  header:{ flexDirection:'row', alignItems:'center', paddingTop:10, paddingHorizontal:20, marginBottom:20 },
  headerBtnWrap:{ width:HEADER_BTN, height:HEADER_BTN, borderRadius:HEADER_BTN/2, overflow:'hidden', marginHorizontal:4 },
  headerInner:{ ...StyleSheet.absoluteFillObject, backgroundColor:DARK, top:BORDER_W,left:BORDER_W,right:BORDER_W,bottom:BORDER_W, borderRadius:HEADER_BTN/2-BORDER_W, justifyContent:'center', alignItems:'center' },
  navIco:{ width:28, height:28, tintColor:'#fff' },
  headerTitleWrap:{ flex:1, height:HEADER_BTN, borderRadius:HEADER_BTN/2, overflow:'hidden', marginHorizontal:8 },
  headerTitleInner:{ ...StyleSheet.absoluteFillObject, backgroundColor:DARK, top:BORDER_W,left:BORDER_W,right:BORDER_W,bottom:BORDER_W, borderRadius:HEADER_BTN/2-BORDER_W, justifyContent:'center', alignItems:'center' },
  hdrTitle:{ color:'#fff', fontSize:18, fontWeight:'700' },

  /* body */
  section:{ color:'#fff', fontSize:18, marginLeft:24, marginBottom:6 },

  input:{ borderWidth:1, borderColor:BORDER, borderRadius:10, paddingHorizontal:14, paddingVertical:10, fontSize:16, color:'#fff', marginHorizontal:24, marginBottom:16 },
  dateTxt:{ color:'#fff', fontSize:16 },
  calIco:{ position:'absolute', right:14, top:12, width:22, height:22, tintColor:'#fff' },

  /* switcher */
  swOuter:{ flexDirection:'row', marginHorizontal:24, marginBottom:24, borderWidth:1, borderColor:BORDER, borderRadius:40, overflow:'hidden' },
  swBtn:{ flex:1, paddingVertical:10, alignItems:'center', justifyContent:'center', backgroundColor:DARK },
  swBtnActive:{ backgroundColor:'#B38028' , borderRadius:20,  },
  swTxt:{ color:'#666', fontSize:14 },
  swTxtActive:{ color:'#fff', fontWeight:'700' },

  /* milestone rows */
  msRow:{ flexDirection:'row', alignItems:'center', marginBottom:12 },
  trashBtn:{ width:48, height:48, borderRadius:12, justifyContent:'center', alignItems:'center' },
  trashIco:{ width:22, height:22 },

  /* save */
  saveBtn:{ height:60, borderRadius:10, justifyContent:'center', alignItems:'center', marginHorizontal:24, marginTop:20 },
  saveTxt:{ fontSize:20, color:'#000', fontWeight:'700' },

  /* date-picker */
  pickerBg:{ flex:1, justifyContent:'center', backgroundColor:'#0008' },
  datePicker:{ alignSelf:'center', backgroundColor:'#222', borderRadius:14 },
});
