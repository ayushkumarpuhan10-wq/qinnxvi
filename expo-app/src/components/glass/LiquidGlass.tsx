import React from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import {
  GLASS_PRESETS,
  PRIORITY_TOKENS,
  PriorityLevel,
  TYPE_TOKENS,
  TrainingType,
} from '../../theme/tokens';
import { ExpoHapticKind, triggerExpoHaptic } from '../../utils/haptics';

export type GlassVariant = keyof typeof GLASS_PRESETS;
export type GlassShape =
  | 'pill'
  | 'card'
  | 'circle'
  | 'square'
  | 'squircle'
  | 'diamond'
  | 'arch'
  | 'bevel';

interface LiquidGlassProps {
  children: React.ReactNode;
  variant?: GlassVariant;
  trainingType?: TrainingType;
  priority?: PriorityLevel;
  shape?: GlassShape;
  haptic?: ExpoHapticKind;
  pressHaptic?: ExpoHapticKind;
  onPress?: () => void;
  disabled?: boolean;
  errorGlow?: boolean;
  style?: ViewStyle;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function getShapeRadii(shape: GlassShape): ViewStyle {
  switch (shape) {
    case 'pill':
    case 'circle':
      return { borderRadius: 999 };
    case 'square':
      return { borderRadius: 18 };
    case 'squircle':
      return { borderRadius: 32 };
    case 'diamond':
      return { borderRadius: 18 };
    case 'arch':
      return {
        borderTopLeftRadius: 38,
        borderTopRightRadius: 38,
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
      };
    case 'bevel':
      return {
        borderTopLeftRadius: 28,
        borderBottomRightRadius: 28,
        borderTopRightRadius: 10,
        borderBottomLeftRadius: 10,
      };
    case 'card':
    default:
      return { borderRadius: 24 };
  }
}

export const LiquidGlass: React.FC<LiquidGlassProps> = ({
  children,
  variant = 'primary',
  trainingType,
  priority,
  shape = 'pill',
  haptic = 'tap',
  pressHaptic = 'tick',
  onPress,
  disabled = false,
  errorGlow = false,
  style,
}) => {
  const scale = useSharedValue(1);
  const preset = GLASS_PRESETS[variant];
  const typeToken = trainingType ? TYPE_TOKENS[trainingType] : null;
  const priorityToken = priority ? PRIORITY_TOKENS[priority] : null;

  const colors = typeToken ? typeToken.tint : preset.colors;
  const glowColor = errorGlow
    ? '#FF2A4D'
    : priorityToken
      ? priorityToken.color
      : typeToken
        ? typeToken.glow
        : preset.shadowColor;

  const radiiStyle = getShapeRadii(shape);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      ...(shape === 'diamond' ? [{ rotate: '45deg' }] : []),
    ],
  }));

  const shapeBoxStyle: ViewStyle =
    shape === 'circle' || shape === 'square' || shape === 'diamond'
      ? { aspectRatio: 1, justifyContent: 'center', alignItems: 'center' }
      : {};

  const body = (
    <View
      style={[
        styles.outerShadow,
        shapeBoxStyle,
        radiiStyle,
        {
          shadowColor: glowColor,
          opacity: disabled ? 0.45 : 1,
        },
        shape === 'diamond' && !onPress && { transform: [{ rotate: '45deg' }] },
        priorityToken && {
          borderWidth: 1.5,
          borderColor: priorityToken.color,
        },
        errorGlow && {
          borderWidth: 2,
          borderColor: '#FF2A4D',
        },
        style,
      ]}
    >
      <View style={[styles.innerClip, radiiStyle]}>
        <BlurView intensity={48} tint="dark" style={StyleSheet.absoluteFill} />
        <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
        <LinearGradient
          colors={['rgba(255,255,255,0.46)', 'rgba(255,255,255,0.08)', 'transparent']}
          style={[styles.topSpecular, radiiStyle]}
        />
        <LinearGradient colors={['transparent', glowColor + 'B0']} style={styles.bottomGlow} />
        <View style={[styles.rimBorder, radiiStyle]} />
        <View style={[styles.content, shape === 'diamond' && { transform: [{ rotate: '-45deg' }] }]}>
          {children}
        </View>
      </View>
    </View>
  );

  if (!onPress) return body;

  return (
    <AnimatedPressable
      disabled={disabled}
      onPress={() => {
        triggerExpoHaptic(haptic);
        onPress();
      }}
      onPressIn={() => {
        triggerExpoHaptic(pressHaptic);
        scale.value = withSpring(0.94, { damping: 16, stiffness: 420 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 16, stiffness: 420 });
      }}
      style={animStyle}
    >
      {body}
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  outerShadow: {
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.52,
    shadowRadius: 18,
    elevation: 12,
  },
  innerClip: {
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
  },
  topSpecular: {
    position: 'absolute',
    top: 2,
    left: 8,
    right: 8,
    height: '44%',
  },
  bottomGlow: {
    position: 'absolute',
    bottom: 0,
    left: 12,
    right: 12,
    height: 9,
    opacity: 0.9,
  },
  rimBorder: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1.2,
    borderColor: 'rgba(255,255,255,0.42)',
  },
  content: {
    zIndex: 2,
  },
});
