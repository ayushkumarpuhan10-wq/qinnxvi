import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { GlassShape, GlassVariant, LiquidGlass } from './LiquidGlass';
import { PriorityLevel, TrainingType } from '../../theme/tokens';
import { ExpoHapticKind } from '../../utils/haptics';

export const GlassButton: React.FC<{
  label: string;
  onPress?: () => void;
  variant?: GlassVariant;
  shape?: GlassShape;
  haptic?: ExpoHapticKind;
  disabled?: boolean;
}> = ({ label, onPress, variant = 'primary', shape = 'pill', haptic = 'medium', disabled }) => (
  <LiquidGlass variant={variant} shape={shape} haptic={haptic} onPress={onPress} disabled={disabled}>
    <View style={styles.buttonRow}>
      <Text style={styles.buttonText}>{label}</Text>
    </View>
  </LiquidGlass>
);

export const GlassIconButton: React.FC<{
  iconName: keyof typeof Ionicons.glyphMap;
  label?: string;
  onPress?: () => void;
  variant?: GlassVariant;
  shape?: GlassShape;
  haptic?: ExpoHapticKind;
}> = ({ iconName, label, onPress, variant = 'cyan', shape, haptic = 'light' }) => (
  <LiquidGlass
    variant={variant}
    shape={shape ?? (label ? 'pill' : 'circle')}
    haptic={haptic}
    onPress={onPress}
  >
    <View style={styles.iconBtnRow}>
      <View style={styles.iconOrb}>
        <Ionicons name={iconName} size={18} color="#FFFFFF" />
      </View>
      {label ? <Text style={styles.buttonText}>{label}</Text> : null}
    </View>
  </LiquidGlass>
);

export const GlassInput: React.FC<{
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  onSubmit?: () => void;
  errorGlow?: boolean;
}> = ({ value, onChangeText, placeholder = 'Text field', onSubmit, errorGlow }) => (
  <LiquidGlass variant="silver" shape="pill" errorGlow={errorGlow}>
    <View style={styles.inputWrap}>
      <View style={styles.inputInner}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="rgba(255,255,255,0.65)"
          onSubmitEditing={onSubmit}
          style={styles.inputField}
          autoCapitalize="characters"
        />
      </View>
      <TouchableOpacity onPress={onSubmit} style={styles.searchBtn}>
        <Ionicons name="search" size={19} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  </LiquidGlass>
);

export const GlassSelect: React.FC<{
  label: string;
  sublabel?: string;
  selected: boolean;
  onToggle: () => void;
  trainingType?: TrainingType;
  priority?: PriorityLevel;
  shape?: GlassShape;
}> = ({ label, sublabel, selected, onToggle, trainingType, priority, shape = 'pill' }) => (
  <LiquidGlass
    variant="goldGreen"
    trainingType={trainingType}
    priority={priority}
    shape={shape}
    haptic={selected ? 'toggleOff' : 'toggleOn'}
    onPress={onToggle}
  >
    <View style={styles.selectRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.buttonText} numberOfLines={1}>{label}</Text>
        {sublabel ? <Text style={styles.sublabel} numberOfLines={1}>{sublabel}</Text> : null}
      </View>
      <View style={[styles.checkBox, selected && styles.checkBoxActive]}>
        <Ionicons name="checkmark" size={18} color={selected ? '#FFFFFF' : 'rgba(255,255,255,0.4)'} />
      </View>
    </View>
  </LiquidGlass>
);

export const GlassSwitch: React.FC<{
  label: string;
  value: boolean;
  onValueChange: (next: boolean) => void;
}> = ({ label, value, onValueChange }) => (
  <LiquidGlass
    variant="primary"
    shape="pill"
    haptic={value ? 'toggleOff' : 'toggleOn'}
    onPress={() => onValueChange(!value)}
  >
    <View style={styles.switchRow}>
      <Text style={styles.buttonText}>{label}</Text>
      <View style={[styles.track, value && styles.trackOn]}>
        <View style={[styles.knob, { alignSelf: value ? 'flex-end' : 'flex-start' }]} />
      </View>
    </View>
  </LiquidGlass>
);

export const GlassProgressRing: React.FC<{
  progress: number;
  valueLabel: string;
  caption: string;
  achieved?: boolean;
}> = ({ progress, valueLabel, caption, achieved }) => {
  const size = 112;
  const stroke = 9;
  const r = (size - stroke * 2) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(1, progress));

  return (
    <LiquidGlass variant={achieved ? 'goldGreen' : 'primary'} shape="card">
      <View style={styles.ringWrap}>
        <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
          <Circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.16)" strokeWidth={stroke} fill="none" />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={achieved ? '#10E88A' : '#38BDF8'}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${c}`}
            strokeDashoffset={`${c * (1 - clamped)}`}
            fill="none"
          />
        </Svg>
        <View style={styles.ringCenter}>
          <Text style={styles.ringValue}>{valueLabel}</Text>
          <Text style={styles.ringCaption}>{caption}</Text>
        </View>
      </View>
    </LiquidGlass>
  );
};

const styles = StyleSheet.create({
  buttonRow: { height: 54, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  buttonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
  sublabel: { color: 'rgba(255,255,255,0.7)', fontSize: 11, marginTop: 2 },
  iconBtnRow: { height: 54, flexDirection: 'row', alignItems: 'center', paddingLeft: 8, paddingRight: 20, gap: 12 },
  iconOrb: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.38)',
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputWrap: { height: 54, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10 },
  inputInner: { flex: 1, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.32)', paddingHorizontal: 14, justifyContent: 'center' },
  inputField: { color: '#FFFFFF', fontSize: 15 },
  searchBtn: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  selectRow: { minHeight: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingVertical: 10, gap: 12 },
  checkBox: { width: 34, height: 34, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center' },
  checkBoxActive: { borderColor: 'rgba(255,255,255,0.65)', backgroundColor: 'rgba(255,255,255,0.22)' },
  switchRow: { height: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 20, paddingRight: 10 },
  track: { width: 64, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.14)', padding: 3, justifyContent: 'center' },
  trackOn: { backgroundColor: '#2563EB' },
  knob: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#FFFFFF' },
  ringWrap: { alignItems: 'center', justifyContent: 'center', padding: 12 },
  ringCenter: { position: 'absolute', alignItems: 'center' },
  ringValue: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  ringCaption: { color: 'rgba(255,255,255,0.7)', fontSize: 10, marginTop: 2 },
});
