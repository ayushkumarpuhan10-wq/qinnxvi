import { Pedometer } from 'expo-sensors';

export async function subscribeTodaySteps(onSteps: (steps: number) => void): Promise<() => void> {
  const available = await Pedometer.isAvailableAsync();
  if (!available) return () => {};

  const perm = await Pedometer.requestPermissionsAsync();
  if (!perm.granted) return () => {};

  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const now = new Date();

  try {
    const past = await Pedometer.getStepCountAsync(start, now);
    onSteps(past.steps);
    const sub = Pedometer.watchStepCount((res: { steps: number }) => {
      onSteps(past.steps + res.steps);
    });
    return () => sub.remove();
  } catch {
    return () => {};
  }
}
