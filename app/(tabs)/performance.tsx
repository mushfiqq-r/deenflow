import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { Card, Metric, ScreenTitle, useDeenPalette } from "@/components/deenflow/ui";
import { dateDifference, performanceInsight, periodRangeLabel, periodSummary, startOfMonth, startOfYear } from "@/lib/deenflow/analytics";
import { useDeenFlow } from "@/lib/deenflow/store";

const RANGES = [
  { id: "week", label: "Weekly", days: 7 },
  { id: "month", label: "Monthly", days: dateDifference(startOfMonth()) },
  { id: "year", label: "Yearly", days: dateDifference(startOfYear()) },
] as const;

export default function PerformanceScreen() {
  const { data } = useDeenFlow();
  const colors = useDeenPalette();
  const [rangeId, setRangeId] = useState<(typeof RANGES)[number]["id"]>("week");
  const range = RANGES.find((item) => item.id === rangeId) ?? RANGES[0];
  const summary = useMemo(() => periodSummary(data, range.days), [data, range.days]);
  const insight = useMemo(() => performanceInsight(data), [data]);
  const chartData = rangeId === "year" ? compress(summary.daily, 12) : summary.daily;
  const maxValue = Math.max(...chartData.map((item) => item.completion), 1);

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenTitle eyebrow="Patterns, not pressure" title="Performance" />
        <View style={styles.rangeControl}>{RANGES.map((item) => <Pressable key={item.id} accessibilityRole="button" accessibilityState={{ selected: rangeId === item.id }} onPress={() => setRangeId(item.id)} style={({ pressed }) => [styles.rangeButton, { backgroundColor: rangeId === item.id ? colors.accent : colors.surface, borderColor: rangeId === item.id ? colors.accent : colors.border }, pressed && styles.pressed]}><Text style={[styles.rangeText, { color: rangeId === item.id ? "#FFFFFF" : colors.text }]}>{item.label}</Text></Pressable>)}</View>
        <Text style={[styles.rangeNote, { color: colors.muted }]}>{periodRangeLabel(range.days)} · personal activity stored on this device</Text>
        <View style={styles.metricsGrid}><Metric label="Average completion" value={`${summary.completion}%`} note="of checklist tasks" icon="check-circle" /><Metric label="Active days" value={`${summary.activeDays}`} note={`out of ${range.days}`} icon="event-available" /><Metric label="Checklist points" value={`${summary.points}`} note="earned in period" icon="stars" /><Metric label="Investment rewards" value={`${summary.rewards}`} note="total reward units" icon="auto-awesome" /></View>
        <Card style={styles.chartCard}>
          <View style={styles.chartTitleRow}><View><Text style={[styles.chartTitle, { color: colors.text }]}>Completion trend</Text><Text style={[styles.chartBody, { color: colors.muted }]}>Daily percentage of your configured checklist completed.</Text></View><MaterialIcons name="trending-up" size={22} color={colors.accent} /></View>
          <View style={styles.chart}>{chartData.map((item, index) => {
            const height = item.completion === 0 ? 5 : Math.max(14, (item.completion / maxValue) * 120);
            const label = rangeId === "year" ? `${index + 1}` : item.date.slice(8);
            return <View key={`${item.date}-${index}`} style={styles.barWrap}><View style={[styles.bar, { height, backgroundColor: item.completion > 0 ? colors.accent : colors.border }]} /><Text style={[styles.barLabel, { color: colors.muted }]}>{label}</Text></View>;
          })}</View>
        </Card>
        <Card style={[styles.insightCard, { backgroundColor: `${colors.accent}13`, borderColor: `${colors.accent}50` }]}>
          <View style={styles.insightHeading}><View style={[styles.insightIcon, { backgroundColor: `${colors.accent}22` }]}><MaterialIcons name="lightbulb-outline" size={21} color={colors.accent} /></View><Text style={[styles.insightTitle, { color: colors.text }]}>Personal insight</Text></View>
          <Text style={[styles.insightBody, { color: colors.muted }]}>{insight}</Text>
        </Card>
        <Card style={styles.explainer}><Text style={[styles.explainerTitle, { color: colors.text }]}>How the analysis works</Text><Text style={[styles.explainerBody, { color: colors.muted }]}>DeenFlow compares your last seven days with the seven days before them, checks active-day consistency, and reflects only the checklist and dhikr entries you recorded. It never sends your activity off your device.</Text></Card>
      </ScrollView>
    </ScreenContainer>
  );
}

function compress<T extends { completion: number; date: string; points: number; rewards: number }>(items: T[], buckets: number): T[] {
  if (items.length <= buckets) return items;
  const size = Math.ceil(items.length / buckets);
  return Array.from({ length: buckets }, (_, index) => {
    const chunk = items.slice(index * size, (index + 1) * size);
    if (!chunk.length) return null;
    return { ...chunk[chunk.length - 1], completion: Math.round(chunk.reduce((sum, item) => sum + item.completion, 0) / chunk.length) };
  }).filter((item): item is T => Boolean(item));
}

const styles = StyleSheet.create({
  content: { padding: 18, paddingBottom: 112, gap: 14 }, rangeControl: { flexDirection: "row", gap: 8 }, rangeButton: { flex: 1, minHeight: 41, borderRadius: 12, borderWidth: 1, alignItems: "center", justifyContent: "center" }, rangeText: { fontSize: 13, fontWeight: "800" }, rangeNote: { fontSize: 12, lineHeight: 17, fontWeight: "600" }, metricsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 }, chartCard: { gap: 15 }, chartTitleRow: { flexDirection: "row", justifyContent: "space-between", gap: 12 }, chartTitle: { fontSize: 17, fontWeight: "800" }, chartBody: { fontSize: 12, lineHeight: 17, marginTop: 4, maxWidth: 240 }, chart: { height: 150, flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", gap: 4, paddingTop: 10 }, barWrap: { flex: 1, height: "100%", alignItems: "center", justifyContent: "flex-end", gap: 5 }, bar: { width: "72%", borderTopLeftRadius: 5, borderTopRightRadius: 5 }, barLabel: { fontSize: 9, fontWeight: "700" }, insightCard: { gap: 10 }, insightHeading: { flexDirection: "row", alignItems: "center", gap: 9 }, insightIcon: { width: 38, height: 38, borderRadius: 13, alignItems: "center", justifyContent: "center" }, insightTitle: { fontSize: 16, fontWeight: "800" }, insightBody: { fontSize: 14, lineHeight: 21 }, explainer: { gap: 6 }, explainerTitle: { fontSize: 14, fontWeight: "800" }, explainerBody: { fontSize: 12, lineHeight: 18 }, pressed: { opacity: 0.72, transform: [{ scale: 0.98 }] },
});
