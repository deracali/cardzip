import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, useWindowDimensions, Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { Octicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';

type CustomTabBarProps = Parameters<NonNullable<React.ComponentProps<typeof Tabs>['tabBar']>>[0];

// Colors strictly matching your reference design
const Colors = {
  bgDark: '#0E1713',       // Dark green container background
  activeGreen: '#00B074',  // Vibrant green rounded capsule
  inactiveText: '#82918B', // Soft gray-green text
  activeText: '#FFFFFF',   // White text & icon
};

/**
 * Custom TabBar Component that replaces Expo Router's default bar
 */
function CustomTabBar({ state, descriptors, navigation }: CustomTabBarProps) {
  const { width } = useWindowDimensions();

  // Dynamic sizing based on screen width
  const scale = (size: number) => (width / 375) * size;
  const isTablet = width > 600;

  const barHeight = scale(isTablet ? 68 : 58);
  const iconSize = scale(isTablet ? 20 : 22);

  // Tab configurations matching route names, icons, and labels
  const tabConfig: Record<string, { label: string; icon: (focused: boolean) => React.ReactNode }> = {
    home: {
      label: 'Home',
      icon: (focused) => (
        <Octicons
          name="home"
          size={iconSize}
          color={focused ? Colors.activeText : Colors.inactiveText}
        />
      ),
    },
    esims: {
      label: 'Numbers',
      icon: (focused) => (
        <MaterialCommunityIcons
          name="sim"
          size={iconSize + scale(2)}
          color={focused ? Colors.activeText : Colors.inactiveText}
        />
      ),
    },
    store: {
      label: 'Store',
      icon: (focused) => (
        <MaterialCommunityIcons
          name="storefront-outline"
          size={iconSize + scale(2)}
          color={focused ? Colors.activeText : Colors.inactiveText}
        />
      ),
    },
    profile: {
      label: 'Profile',
      icon: (focused) => (
        <Feather
          name="user"
          size={iconSize + scale(1)}
          color={focused ? Colors.activeText : Colors.inactiveText}
        />
      ),
    },
  };

  return (
    <View
      style={[
        styles.container,
        {
          height: barHeight,
          bottom: Platform.OS === 'ios' ? scale(28) : scale(16),
          borderRadius: barHeight / 2,
        },
      ]}
    >
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const config = tabConfig[route.name] || {
          label: route.name,
          icon: () => null,
        };

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            activeOpacity={0.85}
            onPress={onPress}
            style={styles.tabCell}
          >
            <View style={[styles.pill, focused && styles.activePill]}>
              {config.icon(focused)}
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                style={[
                  styles.label,
                  { color: focused ? Colors.activeText : Colors.inactiveText },
                  focused && styles.activeLabel,
                ]}
              >
                {config.label}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="esims" />
      <Tabs.Screen name="store" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 20,
    right: 20,
    backgroundColor: Colors.bgDark,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
    // Soft shadow for elevation
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
  },
  tabCell: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pill: {
    width: '92%',
    height: '82%',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    paddingVertical: 4,
    gap: 3,
  },
  activePill: {
    backgroundColor: Colors.activeGreen,
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
  },
  activeLabel: {
    fontWeight: '700',
  },
});