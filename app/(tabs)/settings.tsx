import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { useState } from "react";
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { ACCENTS, AppButton, Card, ScreenTitle, Sheet, useDeenPalette } from "@/components/deenflow/ui";
import { toDateKey } from "@/lib/deenflow/date";
import { useDeenFlow } from "@/lib/deenflow/store";
import type { DeenFlowData, DisplayMode } from "@/lib/deenflow/types";

const DISPLAY_OPTIONS: Array<{ id: DisplayMode; label: string; detail: string }> = [
  { id: "light", label: "Light", detail: "Soft sand background" },
  { id: "dark", label: "Dark", detail: "Comfortable low-light view" },
  { id: "amoled", label: "AMOLED", detail: "True black background" },
];

export default function SettingsScreen() {
  const { data, setPreferences, exportData, importData, applyImportedData, clearData } = useDeenFlow();
  const colors = useDeenPalette();
  const [importPreview, setImportPreview] = useState<DeenFlowData | null>(null);
  const [clearSheet, setClearSheet] = useState(false);

  const changeDisplay = (display: DisplayMode) => setPreferences({ display });
  const exportBackup = async () => {
    try {
      if (Platform.OS === "web") {
        Alert.alert("Export on Android", "Open DeenFlow on Android to create and share a local JSON backup.");
        return;
      }
      const uri = `${FileSystem.documentDirectory}deenflow-backup-${toDateKey()}.json`;
      await FileSystem.writeAsStringAsync(uri, exportData(), { encoding: FileSystem.EncodingType.UTF8 });
      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert("Backup created", "Your backup was created in DeenFlow’s private document storage.");
        return;
      }
      await Sharing.shareAsync(uri, { mimeType: "application/json", dialogTitle: "Export DeenFlow backup" });
    } catch {
      Alert.alert("Could not export", "Please try exporting again.");
    }
  };
  const chooseImport = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: ["application/json", "text/json", "text/plain"], copyToCacheDirectory: true });
      if (result.canceled) return;
      const raw = await FileSystem.readAsStringAsync(result.assets[0].uri, { encoding: FileSystem.EncodingType.UTF8 });
      const reviewed = importData(raw);
      if (!reviewed.valid || !reviewed.preview) {
        Alert.alert("Invalid backup", reviewed.message);
        return;
      }
      setImportPreview(reviewed.preview);
    } catch {
      Alert.alert("Could not read file", "Choose a valid DeenFlow JSON backup and try again.");
    }
  };
  const confirmImport = () => {
    if (!importPreview) return;
    applyImportedData(importPreview);
    setImportPreview(null);
    Alert.alert("Backup restored", "Your local DeenFlow data has been replaced with the reviewed backup.");
  };
  const confirmClear = () => {
    clearData();
    setClearSheet(false);
    Alert.alert("Local data cleared", "Your categories, entries, and adhkar have been reset.");
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenTitle eyebrow="Local & private" title="Settings" />
        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeading}><MaterialIcons name="brightness-6" size={20} color={colors.accent} /><View><Text style={[styles.sectionTitle, { color: colors.text }]}>Display</Text><Text style={[styles.sectionBody, { color: colors.muted }]}>Choose the view that fits your environment.</Text></View></View>
          <View style={styles.displayOptions}>{DISPLAY_OPTIONS.map((option) => <Pressable key={option.id} onPress={() => changeDisplay(option.id)} style={({ pressed }) => [styles.displayOption, { backgroundColor: data.preferences.display === option.id ? `${colors.accent}14` : colors.background, borderColor: data.preferences.display === option.id ? colors.accent : colors.border }, pressed && styles.pressed]}><View style={[styles.radio, { borderColor: data.preferences.display === option.id ? colors.accent : colors.muted }]}>{data.preferences.display === option.id ? <View style={[styles.radioDot, { backgroundColor: colors.accent }]} /> : null}</View><View style={styles.displayCopy}><Text style={[styles.displayLabel, { color: colors.text }]}>{option.label}</Text><Text style={[styles.displayDetail, { color: colors.muted }]}>{option.detail}</Text></View></Pressable>)}</View>
        </Card>
        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeading}><MaterialIcons name="palette" size={20} color={colors.accent} /><View><Text style={[styles.sectionTitle, { color: colors.text }]}>Accent color</Text><Text style={[styles.sectionBody, { color: colors.muted }]}>Balanced for light, dark, and AMOLED displays.</Text></View></View>
          <View style={styles.accentOptions}>{Object.entries(ACCENTS).map(([id, accent]) => <Pressable key={id} onPress={() => setPreferences({ accent: id as keyof typeof ACCENTS })} style={({ pressed }) => [styles.accentOption, { backgroundColor: data.preferences.accent === id ? `${accent.color}1B` : colors.background, borderColor: data.preferences.accent === id ? accent.color : colors.border }, pressed && styles.pressed]}><View style={[styles.accentDot, { backgroundColor: accent.color }]}>{data.preferences.accent === id ? <MaterialIcons name="check" color="#FFFFFF" size={14} /> : null}</View><Text style={[styles.accentLabel, { color: colors.text }]}>{accent.label}</Text></Pressable>)}</View>
        </Card>
        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeading}><MaterialIcons name="backup" size={20} color={colors.accent} /><View><Text style={[styles.sectionTitle, { color: colors.text }]}>Your data</Text><Text style={[styles.sectionBody, { color: colors.muted }]}>Create a portable backup, then review before any restore.</Text></View></View>
          <AppButton label="Export backup" icon="ios-share" onPress={exportBackup} />
          <AppButton label="Import & review" icon="file-open" variant="secondary" onPress={chooseImport} />
        </Card>
        <Card style={[styles.sectionCard, { borderColor: `${colors.error}80` }]}>
          <View style={styles.sectionHeading}><MaterialIcons name="delete-outline" size={20} color={colors.error} /><View><Text style={[styles.sectionTitle, { color: colors.text }]}>Clear local data</Text><Text style={[styles.sectionBody, { color: colors.muted }]}>This removes all local entries and returns to the initial checklist.</Text></View></View>
          <AppButton label="Clear data" icon="delete-outline" variant="danger" onPress={() => setClearSheet(true)} />
        </Card>
        <Text style={[styles.privacy, { color: colors.muted }]}>DeenFlow stores your journal on this device. Export a backup before changing phones or clearing data.</Text>
      </ScrollView>
      <Sheet visible={Boolean(importPreview)} title="Review import" onClose={() => setImportPreview(null)}>
        {importPreview ? <View style={styles.reviewStack}><Text style={[styles.reviewLead, { color: colors.text }]}>This will replace the data currently stored in DeenFlow.</Text><View style={styles.reviewGrid}><ReviewStat label="Categories" value={importPreview.categories.length} /><ReviewStat label="Tasks" value={importPreview.categories.reduce((sum, category) => sum + category.tasks.length, 0)} /><ReviewStat label="Adhkar" value={importPreview.adhkar.length} /><ReviewStat label="Days with entries" value={Object.keys(importPreview.entries).length} /></View><AppButton label="Replace with this backup" icon="check" onPress={confirmImport} /><AppButton label="Cancel" variant="secondary" onPress={() => setImportPreview(null)} /></View> : null}
      </Sheet>
      <Sheet visible={clearSheet} title="Clear local data?" onClose={() => setClearSheet(false)}>
        <View style={styles.reviewStack}><Text style={[styles.reviewLead, { color: colors.text }]}>This permanently removes your recorded tasks, adhkar, rewards, preferences, and custom categories from this device.</Text><Text style={[styles.reviewWarning, { color: colors.error }]}>Export a backup first if you may want to restore this information.</Text><AppButton label="Yes, clear everything" icon="delete-outline" variant="danger" onPress={confirmClear} /><AppButton label="Keep my data" variant="secondary" onPress={() => setClearSheet(false)} /></View>
      </Sheet>
    </ScreenContainer>
  );
}

function ReviewStat({ label, value }: { label: string; value: number }) {
  const colors = useDeenPalette();
  return <View style={[styles.reviewStat, { backgroundColor: colors.background }]}><Text style={[styles.reviewStatValue, { color: colors.text }]}>{value}</Text><Text style={[styles.reviewStatLabel, { color: colors.muted }]}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  content: { padding: 18, paddingBottom: 112, gap: 14 }, sectionCard: { gap: 14 }, sectionHeading: { flexDirection: "row", gap: 10, alignItems: "flex-start" }, sectionTitle: { fontSize: 16, fontWeight: "800" }, sectionBody: { fontSize: 12, lineHeight: 17, marginTop: 3 }, displayOptions: { gap: 8 }, displayOption: { flexDirection: "row", alignItems: "center", gap: 10, padding: 11, borderRadius: 13, borderWidth: 1 }, radio: { width: 19, height: 19, borderRadius: 10, borderWidth: 1.5, alignItems: "center", justifyContent: "center" }, radioDot: { width: 9, height: 9, borderRadius: 5 }, displayCopy: { gap: 2 }, displayLabel: { fontSize: 14, fontWeight: "800" }, displayDetail: { fontSize: 11, lineHeight: 15 }, accentOptions: { flexDirection: "row", flexWrap: "wrap", gap: 8 }, accentOption: { flexDirection: "row", alignItems: "center", gap: 7, borderRadius: 12, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 9 }, accentDot: { width: 20, height: 20, borderRadius: 10, alignItems: "center", justifyContent: "center" }, accentLabel: { fontSize: 12, fontWeight: "800" }, privacy: { textAlign: "center", fontSize: 11, lineHeight: 16, paddingHorizontal: 14 }, reviewStack: { gap: 14 }, reviewLead: { fontSize: 14, lineHeight: 21, fontWeight: "600" }, reviewWarning: { fontSize: 13, lineHeight: 19, fontWeight: "800" }, reviewGrid: { flexDirection: "row", flexWrap: "wrap", gap: 9 }, reviewStat: { width: "47%", padding: 12, borderRadius: 12, gap: 2 }, reviewStatValue: { fontSize: 21, fontWeight: "800" }, reviewStatLabel: { fontSize: 11, fontWeight: "700" }, pressed: { opacity: 0.72, transform: [{ scale: 0.98 }] },
});
