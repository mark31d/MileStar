/* ------------------------------------------------------------------
   ./Components/Settings.js
   • Единая «золотая» шапка (кнопки-кружки + капсула)
   • Узкий кастом-скролл справа; появляется только
     если контента реально больше, чем высота экрана
------------------------------------------------------------------- */
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, Image, ImageBackground,
  StyleSheet, TouchableOpacity, Switch,
  Share, Linking, Platform, Alert, Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage       from '@react-native-async-storage/async-storage';
import LinearGradient     from 'react-native-linear-gradient';

/* ── assets ── */
const BG_DARK  = require('../assets/background.png');
const ICO_BACK = require('../assets/arrow_back.png');
const ICO_CHRT = require('../assets/chart.png');

/* ── storage key ── */
const KEY_NOTIF = '@mileStar_notifications';

/* ── colors / sizes ── */
const BORDER_GRAD = ['#FEF6BA', '#B38028'];
const BORDER      = '#B38028';
const DARK        = '#000';
const BORDER_W    = 1;

/* ───────────────────────────────────────────────────────────── */
export default function Settings() {
  const navigation   = useNavigation();
  const insets       = useSafeAreaInsets();
  const [enabled, setEnabled] = useState(true);

  /* --- scroll helper --- */
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

  /* --- load switch state --- */
  useEffect(() => {
    AsyncStorage.getItem(KEY_NOTIF).then(v => {
      if (v !== null) setEnabled(v === 'on');
    });
  }, []);

  const toggleSwitch = () => {
    const next = !enabled;
    setEnabled(next);
    AsyncStorage.setItem(KEY_NOTIF, next ? 'on' : 'off');
  };

  const restartApp = () =>
    Platform.OS === 'android'
      ? require('react-native').DevSettings.reload()
      : Alert.alert('Restart','Close and restart the application?',[
          { text:'Cancel', style:'cancel' },
          { text:'Restart', onPress:() => require('react-native').DevSettings.reload() },
        ]);

  const shareApp = () =>
    Share.share({
      title  : 'MileStar – milestone tracker',
      message: 'Focus, plan and win with MileStar!\nDownload:\n• iOS – https://apps.apple.com/app/idXXXXXXXX\n• Android – https://play.google.com/store/apps/details?id=XXXX',
    }).catch(()=>{});

  const rateApp = () => {
    const url = Platform.select({
      ios    : 'itms-apps://itunes.apple.com/app/idXXXXXXXX?action=write-review',
      android: 'market://details?id=XXXX',
    });
    Linking.openURL(url).catch(()=>Alert.alert('Store not available'));
  };

  /* ─────────── UI ─────────── */
  return (
    <ImageBackground source={BG_DARK} style={{ flex:1 }}>
      {/* HEADER */}
      <View style={styles.header}>
        {/* back */}
        <View style={styles.headerBtnWrap}>
          <LinearGradient colors={BORDER_GRAD} style={StyleSheet.absoluteFillObject}/>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10} style={styles.headerInner}>
            <Image source={ICO_BACK} style={styles.ico}/>
          </TouchableOpacity>
        </View>

        {/* title */}
        <View style={styles.hdrTitleWrap}>
          <LinearGradient colors={BORDER_GRAD} style={StyleSheet.absoluteFillObject}/>
          <View style={styles.hdrTitleInner}>
            <Text style={styles.hTitle}>Settings</Text>
          </View>
        </View>

        {/* chart-заглушка */}
        <View style={styles.headerBtnWrap}>
          <LinearGradient colors={BORDER_GRAD} style={StyleSheet.absoluteFillObject}/>
          <TouchableOpacity  onPress={() => navigation.navigate('Statistics')}  hitSlop={10} style={styles.headerInner}>
            <Image source={ICO_CHRT} style={styles.ico}/>
          </TouchableOpacity>
        </View>
      </View>

      {/* BODY + кастом-scroll */}
      <View
        style={styles.scrollWrap}
        onLayout={e => setContainerH(e.nativeEvent.layout.height)}
      >
        <Animated.ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal:22, paddingBottom:insets.bottom + 40 }}
          onScroll={Animated.event(
            [{ nativeEvent:{ contentOffset:{ y:scrollY } } }],
            { useNativeDriver:false }
          )}
          onContentSizeChange={(_, h) => setContentH(h)}
        >
          {/* notifications switch */}
          <View style={styles.switchRow}>
            <Text style={styles.swLabel}>Notifications</Text>
            <Switch
              value={enabled}
              onValueChange={toggleSwitch}
              trackColor={{ false:'#666', true:'#4cd964' }}
              thumbColor="#fff"
            />
          </View>

          {/* white buttons */}
          <WhiteButton label="Restart app" onPress={restartApp}/>
          <WhiteButton label="Share app"   onPress={shareApp}/>
          <WhiteButton label="Rate app"    onPress={rateApp}/>
        </Animated.ScrollView>

        {/* scroll-track: показываем только, если действительно есть скролл */}
        {contentH > containerH + 1 && (
          <View style={[
            styles.scrollTrackWrap,
            { top:0, bottom:insets.bottom + 10 },
          ]}>
            <Animated.View
              style={[
                styles.scrollThumb,
                { height: thumbHeight, transform:[{ translateY }] },
              ]}
            />
          </View>
        )}
      </View>
    </ImageBackground>
  );
}

/* ── helper white button ── */
const WhiteButton = ({ label, onPress }) => (
  <TouchableOpacity style={styles.btn} activeOpacity={0.8} onPress={onPress}>
    <Text style={styles.btnTxt}>{label}</Text>
  </TouchableOpacity>
);

/* ── styles ── */
const styles = StyleSheet.create({
  /* header */
  header:{ flexDirection:'row', alignItems:'center', paddingTop:50, paddingHorizontal:20, marginBottom:30 },
  headerBtnWrap:{ width:44, height:44, borderRadius:22, overflow:'hidden', marginHorizontal:4 },
  headerInner:{ ...StyleSheet.absoluteFillObject, backgroundColor:DARK, top:BORDER_W,left:BORDER_W,right:BORDER_W,bottom:BORDER_W, borderRadius:22-BORDER_W, justifyContent:'center', alignItems:'center' },
  ico:{ width:24, height:24, tintColor:'#fff' },
  hdrTitleWrap:{ flex:1, height:44, borderRadius:22, overflow:'hidden', marginHorizontal:8 },
  hdrTitleInner:{ ...StyleSheet.absoluteFillObject, backgroundColor:DARK, top:BORDER_W,left:BORDER_W,right:BORDER_W,bottom:BORDER_W, borderRadius:22-BORDER_W, justifyContent:'center', alignItems:'center' },
  hTitle:{ color:'#fff', fontSize:18, fontWeight:'700' },

  /* scroll */
  scrollWrap:{ flex:1 },
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

  /* switch row */
  switchRow:{
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center',
    backgroundColor:'#fff',      // ← белый фон
    borderRadius:8,
    paddingHorizontal:16,
    height:48,
    marginBottom:18,
  },
  swLabel:{ color:'#2B1130', fontSize:16 }, 

  /* white buttons */
  btn:{ height:56, borderRadius:8, backgroundColor:'#fff', justifyContent:'center', alignItems:'center', marginBottom:18 },
  btnTxt:{ fontSize:18, fontWeight:'600', color:'#2B1130' },
});
