import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Line, Path } from "react-native-svg";
import { ScreenContainer } from "@/components/screen-container";
import { Card, Metric, ScreenTitle, useDeenPalette } from "@/components/deenflow/ui";
import { dateDifference, groupedPerformance, performanceInsight, periodRangeLabel, periodSummary, startOfMonth, startOfYear } from "@/lib/deenflow/analytics";
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
  const [trendMode, setTrendMode] = useState<"week" | "month">("week");
  const range = RANGES.find((item) => item.id === rangeId) ?? RANGES[0];
  const summary = useMemo(() => periodSummary(data, range.days), [data, range.days]);
  const insight = useMemo(() => performanceInsight(data), [data]);
  const chartData = rangeId === "year" ? compress(summary.daily, 12) : summary.daily;
  const maxValue = Math.max(...chartData.map((item) => item.completion), 1);
  const grouped = useMemo(() => groupedPerformance(data, trendMode), [data, trendMode]);
  const topPoints = Math.max(...grouped.map((item) => item.points), 1);
  const topRewards = Math.max(...grouped.map((item) => item.rewards), 1);

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
        <Card style={styles.richChartCard}>
          <View style={styles.chartTitleRow}><View><Text style={[styles.chartTitle, { color: colors.text }]}>Rhythm over time</Text><Text style={[styles.chartBody, { color: colors.muted }]}>Compare average completion, points, and investment activity by period.</Text></View><MaterialIcons name="insights" size={22} color={colors.accent} /></View>
          <View style={styles.trendToggle}>{(["week", "month"] as const).map((mode) => <Pressable key={mode} onPress={() => setTrendMode(mode)} style={({ pressed }) => [styles.trendButton, { backgroundColor: trendMode === mode ? `${colors.accent}16` : colors.background, borderColor: trendMode === mode ? colors.accent : colors.border }, pressed && styles.pressed]}><Text style={[styles.trendButtonText, { color: trendMode === mode ? colors.accent : colors.muted }]}>{mode === "week" ? "4 weeks" : "6 months"}</Text></Pressable>)}</View>
          <View style={styles.lineChart}><TrendLine data={grouped.map((item) => item.completion)} color={colors.accent} grid={colors.border} /><View style={styles.lineLabels}>{grouped.map((item) => <Text key={item.label} style={[styles.lineLabel, { color: colors.muted }]}>{item.label}</Text>)}</View></View>
          <View style={styles.legend}><View style={[styles.legendDot, { backgroundColor: colors.accent }]} /><Text style={[styles.legendText, { color: colors.muted }]}>Average checklist completion</Text><Text style={[styles.legendValue, { color: colors.text }]}>{grouped[grouped.length - 1]?.completion ?? 0}% latest</Text></View>
          <View style={styles.activityRows}>{grouped.map((item) => <View key={item.label} style={styles.activityRow}><Text style={[styles.activityLabel, { color: colors.muted }]}>{item.label}</Text><View style={styles.activityBars}><View style={[styles.activityBarTrack, { backgroundColor: colors.background }]}><View style={[styles.activityBar, { width: `${Math.max((item.points / topPoints) * 100, item.points ? 4 : 0)}%`, backgroundColor: colors.accent }]} /></View><View style={[styles.activityBarTrack, { backgroundColor: colors.background }]}><View style={[styles.activityBar, { width: `${Math.max((item.rewards / topRewards) * 100, item.rewards ? 4 : 0)}%`, backgroundColor: `${colors.accent}88` }]} /></View></View><Text style={[styles.activityValues, { color: colors.text }]}>{item.points} · {item.rewards}</Text></View>)}</View>
          <View style={styles.activityLegend}><Text style={[styles.activityLegendText, { color: colors.muted }]}>Top line = checklist points · lower line = reward units</Text></View>
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

function TrendLine({ data, color, grid }: { data: number[]; color: string; grid: string }) {
  const width = 320;
  const height = 100;
  const padding = 10;
  const max = Math.max(...data, 1);
  const step = data.length > 1 ? (width - padding * 2) / (data.length - 1) : 0;
  const coordinates = data.map((value, index) => ({ x: padding + step * index, y: height - padding - ((value / max) * (height - padding * 2)) }));
  const path = coordinates.map((point, index) => `${index === 0 ? "M" : "L"}${point.x} ${point.y}`).join(" ");
  return <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}><Line x1={padding} x2={width - padding} y1={height - padding} y2={height - padding} stroke={grid} strokeWidth={1} /><Line x1={padding} x2={width - padding} y1={height / 2} y2={height / 2} stroke={grid} strokeWidth={1} strokeDasharray="4 5" /><Path d={path} fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />{coordinates.map((point, index) => <Circle key={index} cx={point.x} cy={point.y} r={4} fill={color} />)}</Svg>;
}

const styles = StyleSheet.create({
  content: { padding: 18, paddingBottom: 112, gap: 14 }, rangeControl: { flexDirection: "row", gap: 8 }, rangeButton: { flex: 1, minHeight: 41, borderRadius: 12, borderWidth: 1, alignItems: "center", justifyContent: "center" }, rangeText: { fontSize: 13, fontWeight: "800" }, rangeNote: { fontSize: 12, lineHeight: 17, fontWeight: "600" }, metricsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 }, chartCard: { gap: 15 }, richChartCard: { gap: 14 }, chartTitleRow: { flexDirection: "row", justifyContent: "space-between", gap: 12 }, chartTitle: { fontSize: 17, fontWeight: "800" }, chartBody: { fontSize: 12, lineHeight: 17, marginTop: 4, maxWidth: 240 }, chart: { height: 150, flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", gap: 4, paddingTop: 10 }, barWrap: { flex: 1, height: "100%", alignItems: "center", justifyContent: "flex-end", gap: 5 }, bar: { width: "72%", borderTopLeftRadius: 5, borderTopRightRadius: 5 }, barLabel: { fontSize: 9, fontWeight: "700" }, trendToggle: { flexDirection: "row", gap: 8 }, trendButton: { flex: 1, height: 37, borderWidth: 1, borderRadius: 11, alignItems: "center", justifyContent: "center" }, trendButtonText: { fontSize: 12, fontWeight: "800" }, lineChart: { gap: 4 }, lineLabels: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 4 }, lineLabel: { fontSize: 10, fontWeight: "700" }, legend: { flexDirection: "row", alignItems: "center", gap: 7 }, legendDot: { width: 8, height: 8, borderRadius: 4 }, legendText: { fontSize: 11, fontWeight: "600", flex: 1 }, legendValue: { fontSize: 11, fontWeight: "800" }, activityRows: { gap: 9 }, activityRow: { flexDirection: "row", alignItems: "center", gap: 8 }, activityLabel: { width: 28, fontSize: 10, fontWeight: "800" }, activityBars: { flex: 1, gap: 3 }, activityBarTrack: { height: 5, borderRadius: 3, overflow: "hidden" }, activityBar: { height: "100%", borderRadius: 3 }, activityValues: { width: 45, textAlign: "right", fontSize: 10, fontWeight: "800" }, activityLegend: { alignItems: "center" }, activityLegendText: { fontSize: 10, fontWeight: "600" }, insightCard: { gap: 10 }, insightHeading: { flexDirection: "row", alignItems: "center", gap: 9 }, insightIcon: { width: 38, height: 38, borderRadius: 13, alignItems: "center", justifyContent: "center" }, insightTitle: { fontSize: 16, fontWeight: "800" }, insightBody: { fontSize: 14, lineHeight: 21 }, explainer: { gap: 6 }, explainerTitle: { fontSize: 14, fontWeight: "800" }, explainerBody: { fontSize: 12, lineHeight: 18 }, pressed: { opacity: 0.72, transform: [{ scale: 0.98 }] },
});
