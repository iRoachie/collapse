import React, { useState, useRef, useEffect } from 'react';
import {
  Animated,
  LayoutChangeEvent,
  StyleProp,
  ViewStyle,
  StyleSheet,
  Easing,
} from 'react-native';

export interface CollapsibleProps {
  align?: 'top' | 'center' | 'bottom';
  collapsed: boolean;
  enablePointerEvents?: boolean;
  duration?: number;
  collapsedHeight?: number;
  easing?: (value: number) => number;
  style?: StyleProp<ViewStyle>;
  children: React.ReactElement | React.ReactElement[];
  onAnimationEnd?(): void;
}

const Collapsible: React.FC<CollapsibleProps> = ({
  align = 'top',
  collapsed = false,
  duration = 300,
  collapsedHeight = 0,
  enablePointerEvents = false,
  easing = Easing.out(Easing.cubic),
  children,
  style,
  onAnimationEnd,
}) => {
  const contentHeight = useRef(0);
  const [measured, setMeasured] = useState(false);
  const [collapseHeight] = useState(new Animated.Value(0));

  useEffect(() => {
    if (measured) {
      Animated.timing(collapseHeight, {
        toValue: collapsed ? collapsedHeight : contentHeight.current,
        duration,
        easing,
      }).start(onAnimationEnd);
    }
  }, [collapsed]);

  const measureChildren = (event: LayoutChangeEvent) => {
    if (!measured) {
      contentHeight.current = event.nativeEvent.layout.height;
      collapseHeight.setValue(
        collapsed ? collapsedHeight : contentHeight.current
      );
      setMeasured(true);
    }
  };

  const alignStyles = () => {
    switch (align) {
      case 'top':
        return {};
      case 'center':
        return {
          transform: [
            {
              translateY: collapseHeight.interpolate({
                inputRange: [0, contentHeight.current],
                outputRange: [contentHeight.current / -2, 0],
              }),
            },
          ],
        };
      case 'bottom':
        return {
          transform: [
            {
              translateY: collapseHeight.interpolate({
                inputRange: [0, contentHeight.current],
                outputRange: [-contentHeight.current, 0],
              }),
            },
          ],
        };
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          height: measured ? collapseHeight : 'auto',
        },
        style,
      ]}
      accessibilityStates={[collapsed ? 'collapsed' : 'expanded']}
      pointerEvents={!enablePointerEvents && collapsed ? 'none' : 'auto'}
    >
      <Animated.View
        style={[
          alignStyles(),
          {
            position: measured ? 'relative' : 'absolute',
          },
        ]}
        onLayout={measureChildren}
      >
        {children}
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
});

export default Collapsible;
