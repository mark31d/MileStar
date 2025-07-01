import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { StatusBar, Platform } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';

/* экраны */
import Loader       from './Components/Loader';
import OnBoarding   from './Components/OnBoarding';
import Dashboard    from './Components/Dashboard';
import SavedQuotes  from './Components/SavedQuotes';
import Archive      from './Components/Archive';
import Stories      from './Components/Stories';
import Settings     from './Components/Settings';
import TaskEditor   from './Components/TaskEditor';
import Statistics   from './Components/Statistics';
import CustomTabs   from './Components/CustomTabBar';
import StoryReader from './Components/StoryReader';
import TaskScreen from './Components/TaskScreen';
/* провайдеры */
import { TasksProvider }    from './Components/TasksContext';
import { ArchiveProvider }  from './Components/ArchiveContext';
import { QuotesProvider }   from './Components/QuotesContext';
import { StoriesProvider }  from './Components/StoriesContext';
import { MilestonesProvider } from './Components/MilestonesContext';
const Stack = createStackNavigator();
const Tab   = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabs {...props} />}
    >
      <Tab.Screen name="Dashboard" component={Dashboard} />
      <Tab.Screen name="Saved" component={SavedQuotes} />
      {/* Скрытый таб для Stories — экран внутри, но без кнопки */}
      <Tab.Screen 
        name="Stories" 
        component={Stories} 
        options={{ tabBarButton: () => null }} 
      />
      {/* Заглушка для центрального FAB */}
      <Tab.Screen 
        name="AddDummy" 
        component={() => null}  
        options={{ tabBarButton: () => null }} 
      />
      <Tab.Screen name="Archive" component={Archive} />
      <Tab.Screen name="Settings" component={Settings} />
      <Tab.Screen name="TaskScreen" component={TaskScreen} />
    </Tab.Navigator>
  );
}

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#000',
    card: '#000',
  },
};

export default function App() {
  const [booted, setBooted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setBooted(true), 3300);
    return () => clearTimeout(t);
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
       <StoriesProvider>
      <QuotesProvider>
        <StoriesProvider>
          <TasksProvider>
            <ArchiveProvider>
              <NavigationContainer theme={navTheme}>
                <Stack.Navigator screenOptions={{ headerShown: false }}>
                  {!booted ? (
                    <Stack.Screen
                      name="Loader"
                      children={() => <Loader onDone={() => setBooted(true)} />}
                    />
                  ) : (
                    <>
                      <Stack.Screen
                        name="OnBoarding"
                        component={OnBoarding}
                      />
                      <Stack.Screen
                        name="MainTabs"
                        component={MainTabs}
                      />
                      <Stack.Screen
                        name="TaskEditor"
                        component={TaskEditor}
                        options={{
                          presentation:
                            Platform.OS === 'ios' ? 'modal' : 'card',
                        }}
                      />
                      <Stack.Screen
                        name="Statistics"
                        component={Statistics}
                      />
                   <Stack.Screen
                        name="StoryReader"
                        component={StoryReader}
                      />
                    </>
                  )}
                </Stack.Navigator>
              </NavigationContainer>
            </ArchiveProvider>
          </TasksProvider>
        </StoriesProvider>
      </QuotesProvider>
      </StoriesProvider>
    </SafeAreaProvider>
  );
}
