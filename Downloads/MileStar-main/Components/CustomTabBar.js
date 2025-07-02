// ./Components/CustomTabBar.js
import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

const BORDER_GRAD = ['#FEF6BA', '#B38028'];
const DARK        = '#000';

const ICONS = {
  Dashboard: require('../assets/book.png'),
  Saved:     require('../assets/book_mark.png'),
  AddDummy:  require('../assets/plus.png'),
  Archive:   require('../assets/archive.png'),
  Settings:  require('../assets/gear.png'),
};

const BAR  = 68;   // высота капсулы
const PLUS = 84;   // диаметр FAB
const ICON = 26;   // размер иконок

export default function CustomTabBar({ state, navigation }) {
  const inset = useSafeAreaInsets();
  const { routes, index } = state;
  const current = routes[index].name;
  const isOnDashboard = current === 'Dashboard';

  const go = (name) => {
    if (name === 'Dashboard') navigation.navigate('Stories');
    else if (current !== name) navigation.navigate(name);
  };

  /* ↓ вычисляем выравнивание FAB в рантайме */
  const fabBottom = (BAR - PLUS) / 2 + inset.bottom + 8; // 8 px — тот же отступ, что у обёртки

  return (
    <View style={[styles.wrap, { paddingBottom: inset.bottom + 8 }]}>
      {/* Градиентная рамка */}
      <LinearGradient
        colors={BORDER_GRAD}
        start={{ x: 0.5, y: 0 }}
        end={{   x: 0.5, y: 1 }}
        style={styles.border}
      >
        {/* Чёрная капсула: margin = толщине бордера */}
        <View style={styles.bar}>
          {['Dashboard', 'Saved'].map((n) => (
            <TabBtn
              key={n}
              icon={ICONS[n]}
              active={!isOnDashboard && current === n}
              onPress={() => go(n)}
            />
          ))}

          {/* место под FAB */}
          <View style={{ width: PLUS }} />

          {['Archive', 'Settings'].map((n) => (
            <TabBtn
              key={n}
              icon={ICONS[n]}
              active={!isOnDashboard && current === n}
              onPress={() => go(n)}
            />
          ))}
        </View>
      </LinearGradient>

      {/* FAB */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => {
          if (!isOnDashboard) navigation.navigate('Dashboard');
          else                navigation.navigate('TaskEditor');
        }}
        style={[styles.plusWrap, { bottom: fabBottom }]}
      >
        <LinearGradient
          colors={BORDER_GRAD}
          start={{ x: 0.5, y: 0 }}
          end={{   x: 0.5, y: 1 }}
          style={styles.plus}
        >
          <Image source={ICONS.AddDummy} style={styles.plusIcon} />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

function TabBtn({ icon, active, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.btn} activeOpacity={0.8}>
      <Image
        source={icon}
        style={[styles.icon, { tintColor: active ? '#B38028' : '#FFFFFF' }]}
      />
    </TouchableOpacity>
  );
}

const BORDER_W = 1.5;          // видимая толщина рамки

const styles = StyleSheet.create({
  wrap:{
    position:'absolute',
    left:0,
    right:0,
    bottom:0,
    alignItems:'center',
  },

  /* внешняя «капсула» с градиентом */
  border:{
    width: width - 24,
    height: BAR,
    borderRadius: BAR / 2,
  },

  /* внутренняя чёрная капсула: margin = BORDER_W вместо padding */
  bar:{
    flex:1,
    margin:BORDER_W,
    borderRadius:(BAR - BORDER_W*2) / 2,
    backgroundColor:DARK,
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'space-between',
    paddingHorizontal:18,
    gap:12,
  },

  btn:{ paddingHorizontal:12 },
  icon:{ width:ICON, height:ICON, resizeMode:'contain' },

  plusWrap:{ position:'absolute', alignSelf:'center', zIndex:5 },

  plus:{
    width:PLUS,
    height:PLUS,
    borderRadius:PLUS / 2,
    justifyContent:'center',
    alignItems:'center',
  },

  plusIcon:{ width:40, height:40, tintColor:'#fff', resizeMode:'contain' },
});
