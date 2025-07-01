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

// градиент для бордера и FAB
const BORDER_GRAD = ['#FEF6BA', '#B38028'];
const DARK        = '#000';

// иконки
const ICONS = {
  Dashboard: require('../assets/book.png'),
  Saved:     require('../assets/book_mark.png'),
  AddDummy:  require('../assets/plus.png'),
  Archive:   require('../assets/archive.png'),
  Settings:  require('../assets/gear.png'),
};

// размеры
const BAR  = 68;  // высота капсулы
const PLUS = 84;  // диаметр FAB
const ICON = 26;  // размер иконок

export default function CustomTabBar({ state, navigation }) {
  const inset = useSafeAreaInsets();
  const route = state.routes[state.index];
  const isOnDashboard = route.name === 'Dashboard';

  // навигация по табам: Dashboard → Stories, остальные — как обычно
  const go = (name) => {
    if (name === 'Dashboard') {
      navigation.navigate('Stories');
    } else if (route.name !== name) {
      navigation.navigate(name);
    }
  };

  return (
    <View style={[styles.wrap, { paddingBottom: inset.bottom + 8 }]}>
      {/* Градиентная рамка */}
      <LinearGradient
        colors={BORDER_GRAD}
        start={{ x: 0.5, y: 0 }}
        end={{   x: 0.5, y: 1 }}
        style={styles.border}
      >
        {/* Внутренняя чёрная капсула */}
        <View style={styles.bar}>
          {['Dashboard', 'Saved'].map((n) => (
            <TabBtn
              key={n}
              icon={ICONS[n]}
              active={!isOnDashboard && route.name === n}
              onPress={() => go(n)}
            />
          ))}

          {/* Пробел под FAB */}
          <View style={{ width: PLUS }} />

          {['Archive', 'Settings'].map((n) => (
            <TabBtn
              key={n}
              icon={ICONS[n]}
              active={!isOnDashboard && route.name === n}
              onPress={() => go(n)}
            />
          ))}
        </View>
      </LinearGradient>

      {/* FAB «+» по центру капсулы */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => {
          if (!isOnDashboard) {
            navigation.navigate('Dashboard');
          } else {
            navigation.navigate('TaskEditor');
          }
        }}
        style={styles.plusWrap}
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

const styles = StyleSheet.create({
  wrap: {
    position:   'absolute',
    left:       0,
    right:      0,
    bottom:     0,
    alignItems: 'center',
  },

  border: {
    width:        width - 24,
    height:       BAR,
    borderRadius: BAR / 2,
    padding:      0.9,           // толщина градиентного бордера
  },

  bar: {
    flex:              1,
    backgroundColor:   DARK,
    borderRadius:      BAR / 2,
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    paddingHorizontal: 18,
    width:             347,
    marginVertical:    2,
    top:               -1,
  },

  btn:  { paddingHorizontal: 12 },
  icon: { width: ICON, height: ICON, resizeMode: 'contain' },

  plusWrap: {
    position:  'absolute',
    bottom:    (BAR - PLUS) / 2 + 8, // поднимает FAB над капсулой на 8px
    alignSelf: 'center',
    zIndex:    5,
  },

  plus: {
    width:        PLUS,
    height:       PLUS,
    borderRadius: PLUS / 2,
    justifyContent:'center',
    alignItems:   'center',
    shadowColor:  '#000',
  },

  plusIcon: {
    width:      40,
    height:     40,
    tintColor:  '#fff',
    resizeMode: 'contain',
  },
});
