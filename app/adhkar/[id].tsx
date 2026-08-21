import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { Card, DateStrip, IconButton, Metric, NumberControl, ScreenTitle, useDeenPalette } from "@/components/deenflow/ui";
import { rewardForAdhkar } from "@/lib/deenflow/analytics";
import { readableDate, toDateKey } from "@/lib/deenflow/date";
import { useDeenFlow } from "@/lib/deenflow/store";

export default function AdhkarDetailScreen() {
  const params = useLocalSearchParams<{ id: string; date?: string }>();
  const { data, setAdhkarCount } = useDeenFlow();
  const colors = useDeenPalette();
  const [selectedDate, setSelectedDate] = useState(params.date ?? toDateKey());
  const adhkar = data.adhkar.find((item) => item.id === params.id);
  if (!adhkar) return <ScreenContainer className="items-center justify-center gap-4"><Text style={{ color: colors.muted }}>This dhikr is not available.</Text><Pressable onPress={() => router.back()}><Text style={{ color: colors.accent }}>Go back</Text></Pressable></ScreenContainer>;
  const count = data.entries[selectedDate]?.adhkar[adhkar.id] ?? 0;
  const reward = rewardForAdhkar(adhkar, count);
  const progress = Math.min(100, Math.round((count / adhkar.target) * 100));
  const setCount = (value: number) => setAdhkarCount(adhkar.id, selectedDate, value);
  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topRow}><IconButton icon="arrow-back" label="Back" onPress={() => router.back()} /><Text style={[styles.topLabel, { color: colors.muted }]}>ADHKAR DETAIL</Text><View style={{ width: 38 }} /></View>
        <ScreenTitle title={adhkar.dhikr} />
        <DateStrip selected={selectedDate} onSelect={setSelectedDate} />
        <Text style={[styles.dateNote, { color: colors.muted }]}>{readableDate(selectedDate)}</Text>
        <Card style={styles.contextCard}><View style={styles.contextRow}><MaterialIcons name="translate" size={18} color={colors.accent} /><Text style={[styles.contextTitle, { color: colors.text }]}>Meaning of the alfaaz</Text></View><Text style={[styles.contextBody, { color: colors.muted }]}>{adhkar.meaning || "Add the meaning when editing this dhikr."}</Text><View style={styles.contextRow}><MaterialIcons name="favorite" size={18} color={colors.accent} /><Text style={[styles.contextTitle, { color: colors.text }]}>Blessings</Text></View><Text style={[styles.contextBody, { color: colors.muted }]}>{adhkar.blessings || "Add a reminder of the blessings this dhikr cultivates."}</Text></Card>
        <Pressable accessibilityRole="button" accessibilityLabel="Record one repetition" onPress={() => setCount(count + 1)} style={({ pressed }) => [styles.tapArea, { backgroundColor: `${colors.accent}16`, borderColor: colors.accent }, pressed && styles.pressed]}>
          <MaterialIcons name="touch-app" size={32} color={colors.accent} /><Text style={[styles.tapNumber, { color: colors.text }]}>{count}</Text><Text style={[styles.tapTitle, { color: colors.text }]}>Tap to record</Text><Text style={[styles.tapBody, { color: colors.muted }]}>One tap adds one repetition</Text>
        </Pressable>
        <View style={styles.controlRow}><Text style={[styles.manualLabel, { color: colors.text }]}>Manual input</Text><NumberControl value={count} onChange={setCount} step={1} label="repetitions" /></View>
        <Card style={styles.rewardCard}><View style={styles.metricRow}><Metric label="Progress" value={`${count}/${adhkar.target}`} note={`${progress}% of target`} icon="track-changes" /><Metric label={adhkar.rewardUnit} value={`${reward}`} note={`${adhkar.rewardValue} per repetition`} icon="redeem" /></View><View style={[styles.progressTrack, { backgroundColor: colors.background }]}><View style={[styles.progressFill, { backgroundColor: colors.accent, width: `${progress}%` }]} /></View></Card>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { padding: 18, paddingBottom: 46, gap: 15 }, topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, topLabel: { fontSize: 11, fontWeight: "800", letterSpacing: 1 }, dateNote: { fontSize: 13, fontWeight: "600" }, contextCard: { gap: 7 }, contextRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 3 }, contextTitle: { fontSize: 14, fontWeight: "800" }, contextBody: { fontSize: 13, lineHeight: 19, marginBottom: 8 }, tapArea: { borderWidth: 1, borderRadius: 24, alignItems: "center", justifyContent: "center", minHeight: 220, gap: 6 }, tapNumber: { fontSize: 52, lineHeight: 60, fontWeight: "800" }, tapTitle: { fontSize: 18, fontWeight: "800" }, tapBody: { fontSize: 12, fontWeight: "600" }, controlRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 3 }, manualLabel: { fontSize: 14, fontWeight: "800" }, rewardCard: { gap: 14 }, metricRow: { flexDirection: "row", gap: 10 }, progressTrack: { height: 7, borderRadius: 4, overflow: "hidden" }, progressFill: { height: "100%", borderRadius: 4 }, pressed: { opacity: 0.72, transform: [{ scale: 0.98 }] },
});
