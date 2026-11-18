import * as Haptics from 'expo-haptics';
import { Platform, Vibration } from 'react-native';

export type ExpoHapticKind =
  | 'tap'
  | 'selection'
  | 'tabSnap'
  | 'tick'
  | 'light'
  | 'medium'
  | 'heavy'
  | 'double'
  | 'pulse'
  | 'toggleOn'
  | 'toggleOff'
  | 'success'
  | 'celebrate'
  | 'rankReveal'
  | 'error';

let expoHapticsEnabled = true;

export function setExpoHapticsEnabled(enabled: boolean) {
  expoHapticsEnabled = enabled;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function triggerExpoHaptic(kind: ExpoHapticKind = 'light', enabled?: boolean) {
  const isEnabled = enabled ?? expoHapticsEnabled;
  if (!isEnabled) return;
  try {
    switch (kind) {
      case 'tap':
      case 'selection':
      case 'tabSnap':
        await Haptics.selectionAsync();
        break;
      case 'tick':
      case 'light':
      case 'toggleOff':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case 'medium':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case 'heavy':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
      case 'toggleOn':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        await sleep(45);
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case 'double':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        await sleep(65);
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case 'pulse':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        await sleep(85);
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
      case 'success':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case 'celebrate':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        await sleep(110);
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        if (Platform.OS === 'android') Vibration.vibrate([0, 26, 45, 48]);
        break;
      case 'rankReveal':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        await sleep(65);
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        await sleep(65);
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        await sleep(95);
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        if (Platform.OS === 'android') Vibration.vibrate([0, 20, 40, 30, 40, 48, 65]);
        break;
      case 'error':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        await sleep(80);
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
    }
  } catch {
    // Ignore on simulators
  }
}
