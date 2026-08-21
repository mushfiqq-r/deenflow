import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { AppButton, Card, DateStrip, IconButton, InputField, Metric, ScreenTitle, Sheet, useDeenPalette } from "@/components/deenflow/ui";
import { rewardForAdhkar, rewardTotals } from "@/lib/deenflow/analytics";
import { readableDate, toDateKey } from "@/lib/deenflow/date";
import { useDeenFlow } from "@/lib/deenflow/store";

const UNITS = ["Trees", "Blessings", "Treasures", "Slave-Freeing", "Quran Completion", "Custom"];

export default function InvestmentScreen() {
  const { data, isReady, addAdhkar } = useDeenFlow();
  const colors = useDeenPalette();
  const [selectedDate, setSelectedDate] = useState(toDateKey());
  const [newSheet, setNewSheet] = useState(false);
  const [dhikr, setDhikr] = useState("");
  const [meaning, setMeaning] = useState("");
  const [blessings, setBlessings] = useState("");
  const [target, setTarget] = useState("100");
  const [reward, setReward] = useState("1");
  const [unit, setUnit] = useState("Trees");
  const [customUnit, setCustomUnit] = useState("");
  const totals = rewardTotals(data);
  const dayTotals = rewardTotals(data, selectedDate);

  const saveAdhkar = () => {
    const finalUnit = unit === "Custom" ? customUnit.trim() : unit;
    if (!dhikr.trim() || !finalUnit) return;
    addAdhkar({ dhikr: dhikr.trim(), meaning: meaning.trim(), blessings: blessings.trim(), target: Math.max(1, Number(target) || 1), rewardValue: Math.max(0, Number(reward) || 0), rewardUnit: finalUnit });
    setDhikr(""); setMeaning(""); setBlessings(""); setTarget("100"); setReward("1"); setUnit("Trees"); setCustomUnit(""); setNewSheet(false);
  };

  if (!isReady) return <ScreenContainer className="items-center justify-center"><Text style={{ color: colors.muted }}>Loading your investments…</Text></ScreenContainer>;

  return (
    <ScreenContainer>
      <FlatList
        data={data.adhkar}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={<View style={styles.headerStack}>
          <ScreenTitle eyebrow="Every repetition compounds" title="Investment" action={<IconButton icon="add" label="Add new dhikr" onPress={() => setNewSheet(true)} tone="accent" />} />
          <DateStrip selected={selectedDate} onSelect={setSelectedDate} />
          <Text style={[styles.dateNote, { color: colors.muted }]}>{readableDate(selectedDate)} · overall reward overview</Text>
          <Card style={styles.overviewCard}>
            <View style={styles.overviewHeading}><View><Text style={[styles.overviewTitle, { color: colors.text }]}>Your rewards</Text><Text style={[styles.overviewBody, { color: colors.muted }]}>Every recorded remembrance is counted locally.</Text></View><MaterialIcons name="auto-awesome" size={24} color={colors.accent} /></View>
            {totals.length ? <View style={styles.rewardsGrid}>{totals.slice(0, 4).map((item) => <Metric key={item.unit} label={item.unit} value={`${item.value}`} note="all time" icon="redeem" />)}</View> : <View style={[styles.emptyOverview, { backgroundColor: colors.background }]}><Text style={[styles.emptyText, { color: colors.muted }]}>Create a dhikr to start building your personal reward overview.</Text></View>}
          </Card>
          {dayTotals.length ? <Text style={[styles.todayRewards, { color: colors.accent }]}>Today: {dayTotals.map((item) => `${item.value} ${item.unit}`).join(" · ")}</Text> : null}
          <View style={styles.sectionRow}><Text style={[styles.sectionTitle, { color: colors.text }]}>Your adhkar</Text><Text style={[styles.sectionHint, { color: colors.muted }]}>Tap to record</Text></View>
        </View>}
        ListEmptyComponent={<Card style={styles.emptyList}><MaterialIcons name="auto-awesome" size={28} color={colors.accent} /><Text style={[styles.emptyTitle, { color: colors.text }]}>Build your first investment</Text><Text style={[styles.emptyText, { color: colors.muted }]}>Add a dhikr with its meaning, target, and the reward unit that is meaningful to you.</Text><AppButton label="Add new dhikr" icon="add" onPress={() => setNewSheet(true)} /></Card>}
        renderItem={({ item }) => {
          const count = data.entries[selectedDate]?.adhkar[item.id] ?? 0;
          const earned = rewardForAdhkar(item, count);
          return <Pressable accessibilityRole="button" accessibilityLabel={`Open ${item.dhikr}`} onPress={() => router.push({ pathname: "/adhkar/[id]", params: { id: item.id, date: selectedDate } })} style={({ pressed }) => [pressed && styles.pressed]}><Card style={styles.dhikrCard}><View style={[styles.dhikrIcon, { backgroundColor: `${colors.accent}18` }]}><MaterialIcons name="favorite-border" size={21} color={colors.accent} /></View><View style={styles.dhikrCopy}><Text style={[styles.dhikrTitle, { color: colors.text }]} numberOfLines={1}>{item.dhikr}</Text><Text style={[styles.dhikrMeta, { color: colors.muted }]} numberOfLines={1}>{count}/{item.target} today · {item.rewardValue} {item.rewardUnit} each</Text></View><View style={styles.dhikrEarned}><Text style={[styles.earnedValue, { color: colors.text }]}>{earned}</Text><Text style={[styles.earnedLabel, { color: colors.muted }]}>{item.rewardUnit}</Text></View><MaterialIcons name="chevron-right" size={21} color={colors.muted} /></Card></Pressable>;
        }}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListFooterComponent={<View style={styles.footer}><AppButton label="Add new dhikr" variant="secondary" icon="add" onPress={() => setNewSheet(true)} /></View>}
      />
      <Sheet visible={newSheet} title="Create rewarding dhikr" onClose={() => setNewSheet(false)}>
        <FlatList data={[]} renderItem={null} ListHeaderComponent={<View style={styles.formStack}>
          <InputField label="Dhikr" value={dhikr} onChangeText={setDhikr} placeholder="e.g. SubhanAllah" />
          <InputField label="Meaning of the alfaaz" value={meaning} onChangeText={setMeaning} multiline placeholder="A concise meaning in your own words" />
          <InputField label="Blessings of this dhikr" value={blessings} onChangeText={setBlessings} multiline placeholder="What this remembrance cultivates" />
          <View style={styles.twoFields}><View style={styles.fieldFlex}><InputField label="Target per session" value={target} onChangeText={setTarget} keyboardType="number-pad" /></View><View style={styles.fieldFlex}><InputField label="Reward each time" value={reward} onChangeText={setReward} keyboardType="number-pad" /></View></View>
          <Text style={[styles.unitLabel, { color: colors.text }]}>Reward unit</Text>
          <View style={styles.unitChoices}>{UNITS.map((item) => <Pressable key={item} onPress={() => setUnit(item)} style={({ pressed }) => [styles.unitChoice, { backgroundColor: unit === item ? colors.accent : colors.background, borderColor: unit === item ? colors.accent : colors.border }, pressed && styles.pressed]}><Text style={[styles.unitChoiceText, { color: unit === item ? "#FFFFFF" : colors.text }]}>{item}</Text></Pressable>)}</View>
          {unit === "Custom" ? <InputField label="Custom reward unit" value={customUnit} onChangeText={setCustomUnit} placeholder="e.g. Good deeds" /> : null}
          <AppButton label="Save dhikr" icon="check" onPress={saveAdhkar} disabled={!dhikr.trim() || (unit === "Custom" && !customUnit.trim())} />
        </View>} />
      </Sheet>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  listContent: { padding: 18, paddingBottom: 112 }, headerStack: { gap: 14, paddingBottom: 14 }, dateNote: { fontSize: 13, lineHeight: 18, fontWeight: "600" },
  overviewCard: { gap: 14 }, overviewHeading: { flexDirection: "row", justifyContent: "space-between", gap: 14 }, overviewTitle: { fontSize: 17, fontWeight: "800" }, overviewBody: { fontSize: 12, lineHeight: 17, marginTop: 3 }, rewardsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 9 }, emptyOverview: { padding: 13, borderRadius: 12 }, emptyText: { fontSize: 13, lineHeight: 19, textAlign: "center" },
  todayRewards: { fontSize: 12, fontWeight: "800", lineHeight: 17 }, sectionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 4 }, sectionTitle: { fontSize: 17, fontWeight: "800" }, sectionHint: { fontSize: 12, fontWeight: "600" },
  emptyList: { alignItems: "center", gap: 10, padding: 24 }, emptyTitle: { fontSize: 17, fontWeight: "800" }, dhikrCard: { padding: 13, flexDirection: "row", alignItems: "center", gap: 11 }, dhikrIcon: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center" }, dhikrCopy: { flex: 1, minWidth: 0, gap: 3 }, dhikrTitle: { fontSize: 15, fontWeight: "800" }, dhikrMeta: { fontSize: 11, lineHeight: 15, fontWeight: "600" }, dhikrEarned: { alignItems: "flex-end", maxWidth: 78 }, earnedValue: { fontSize: 16, fontWeight: "800" }, earnedLabel: { fontSize: 10, fontWeight: "600" }, footer: { paddingTop: 18 }, pressed: { opacity: 0.72, transform: [{ scale: 0.98 }] },
  formStack: { gap: 14, paddingBottom: 8 }, twoFields: { flexDirection: "row", gap: 10 }, fieldFlex: { flex: 1 }, unitLabel: { fontSize: 13, fontWeight: "800" }, unitChoices: { flexDirection: "row", flexWrap: "wrap", gap: 8 }, unitChoice: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 11, paddingVertical: 9 }, unitChoiceText: { fontSize: 12, fontWeight: "800" },
});
