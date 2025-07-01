import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ImageBackground , onDone} from 'react-native';


/* — картинки — */
const SPLASH1 = require('../assets/splash_first.png');   // «рассыпанные» звёзды
const SPLASH2 = require('../assets/LogoScreen.png');    // логотип MileStar

export default function Loader() {
  

  /* анимируем прозрачность двух слоёв */
  const op1 = useRef(new Animated.Value(0)).current;   // первый экран
  const op2 = useRef(new Animated.Value(0)).current;   // второй экран

  useEffect(() => {
    /* хронометраж (мс)
       ┌─ fade-in #1  :  0-600
       ├─ hold   #1   : 600-1600  (1 000 мс полный показ)
       ├─ crossfade   : 1600-2200 (плавный переход 600 мс)
       ├─ hold   #2   : 2200-3200 (1 000 мс полный показ)
       └─ navigate    :   3200    */
    Animated.sequence([
      Animated.timing(op1, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.delay(1000),                                  // HOLD 1
      Animated.parallel([
        Animated.timing(op1, { toValue: 0, duration: 600, useNativeDriver: true }),
        Animated.timing(op2, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
      Animated.delay(1000),                                  // HOLD 2
    ]).start(onDone); 
  }, []);

  return (
    <View style={styles.root}>
      <Animated.View style={[styles.layer, { opacity: op1 }]}>
        <ImageBackground source={SPLASH1} style={styles.img} />
      </Animated.View>

      <Animated.View style={[styles.layer, { opacity: op2 }]}>
        <ImageBackground source={SPLASH2} style={styles.img} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root:  { flex: 1, backgroundColor: '#000' },
  layer: { ...StyleSheet.absoluteFillObject },
  img:   { flex: 1, resizeMode: 'contain' , },
});
