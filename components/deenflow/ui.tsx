import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View, type StyleProp, type TextInputProps, type ViewStyle } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { getWeekDays } from "@/lib/deenflow/date";
import { useDeenFlow } from "@/lib/deenflow/store";
import type { AccentName } from "@/lib/deenflow/types";

export const ACCENTS: Record<AccentName, { label: string; color: string }> = {
  forest: { label: "Forest", color: "#166534" },
  ocean: { label: "Ocean", color: "#0F766E" },
  indigo: { label: "Indigo", color: "#4F46E5" },
  plum: { label: "Plum", color: "#9D174D" },
};

export function useDeenPalette() {
  const colors = useColors();
  const { data } = useDeenFlow();
  return { ...colors, accent: ACCENTS[data.preferences.accent].color };
}

export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const colors = useDeenPalette();
  return <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }, style]}>{children}</View>;
}

export function ScreenTitle({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: React.ReactNode }) {
  const colors = useDeenPalette();
  return (
    <View style={styles.titleRow}>
      <View style={styles.titleCopy}>
        {eyebrow ? <Text style={[styles.eyebrow, { color: colors.accent }]}>{eyebrow.toUpperCase()}</Text> : null}
        <Text style={[styles.screenTitle, { color: colors.text }]}>{title}</Text>
      </View>
      {action}
    </View>
  );
}

export function DateStrip({ selected, onSelect }: { selected: string; onSelect: (date: string) => void }) {
  const colors = useDeenPalette();
  const days = getWeekDays(selected);
  return (
    <FlatList
      data={days}
      horizontal
      showsHorizontalScrollIndicator={false}
      keyExtractor={(item) => item.key}
      contentContainerStyle={styles.dateStrip}
      renderItem={({ item }) => {
        const active = item.key === selected;
        return (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Select ${item.key}`}
            onPress={() => onSelect(item.key)}
            style={({ pressed }) => [styles.dateButton, { backgroundColor: active ? colors.accent : colors.surface, borderColor: active ? colors.accent : colors.border }, pressed && styles.pressed]}
          >
            <Text style={[styles.dateDay, { color: active ? "#FFFFFF" : colors.muted }]}>{item.day}</Text>
            <Text style={[styles.dateNumber, { color: active ? "#FFFFFF" : colors.text }]}>{item.date}</Text>
            {item.isToday && !active ? <View style={[styles.todayDot, { backgroundColor: colors.accent }]} /> : null}
          </Pressable>
        );
      }}
    />
  );
}

export function IconButton({ icon, onPress, label, tone = "plain" }: { icon: keyof typeof MaterialIcons.glyphMap; onPress: () => void; label: string; tone?: "plain" | "accent" | "danger" }) {
  const colors = useDeenPalette();
  const background = tone === "accent" ? colors.accent : tone === "danger" ? colors.error : colors.surface;
  const color = tone === "plain" ? colors.text : "#FFFFFF";
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={({ pressed }) => [styles.iconButton, { backgroundColor: background, borderColor: tone === "plain" ? colors.border : background }, pressed && styles.pressed]}>
      <MaterialIcons name={icon} size={20} color={color} />
    </Pressable>
  );
}

export function AppButton({ label, onPress, icon, variant = "primary", disabled = false }: { label: string; onPress: () => void; icon?: keyof typeof MaterialIcons.glyphMap; variant?: "primary" | "secondary" | "danger"; disabled?: boolean }) {
  const colors = useDeenPalette();
  const background = variant === "primary" ? colors.accent : variant === "danger" ? colors.error : colors.surface;
  const color = variant === "secondary" ? colors.text : "#FFFFFF";
  return (
    <Pressable disabled={disabled} accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.appButton, { backgroundColor: background, borderColor: variant === "secondary" ? colors.border : background, opacity: disabled ? 0.45 : 1 }, pressed && !disabled && styles.pressed]}>
      {icon ? <MaterialIcons name={icon} size={18} color={color} /> : null}
      <Text style={[styles.appButtonText, { color }]}>{label}</Text>
    </Pressable>
  );
}

export function NumberControl({ value, onChange, step = 1, compact = false, label }: { value: number; onChange: (next: number) => void; step?: number; compact?: boolean; label?: string }) {
  const colors = useDeenPalette();
  return (
    <View style={[styles.numberControl, compact && styles.numberControlCompact, { borderColor: colors.border, backgroundColor: colors.surface }]}>
      <Pressable accessibilityRole="button" accessibilityLabel={`Decrease ${label ?? "count"}`} onPress={() => onChange(Math.max(0, value - step))} style={({ pressed }) => [styles.counterAction, pressed && styles.pressed]}>
        <MaterialIcons name="remove" size={18} color={colors.muted} />
      </Pressable>
      <Text style={[styles.counterValue, { color: colors.text }]}>{value}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel={`Increase ${label ?? "count"}`} onPress={() => onChange(value + step)} style={({ pressed }) => [styles.counterAction, pressed && styles.pressed]}>
        <MaterialIcons name="add" size={18} color={colors.accent} />
      </Pressable>
    </View>
  );
}

export function InputField({ label, multiline, ...props }: TextInputProps & { label: string; multiline?: boolean }) {
  const colors = useDeenPalette();
  return (
    <View style={styles.fieldWrap}>
      <Text style={[styles.fieldLabel, { color: colors.text }]}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.muted}
        multiline={multiline}
        style={[styles.fieldInput, multiline && styles.fieldInputMultiline, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
        {...props}
      />
    </View>
  );
}

export function Sheet({ visible, title, onClose, children }: { visible: boolean; title: string; onClose: () => void; children: React.ReactNode }) {
  const colors = useDeenPalette();
  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={[styles.sheet, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.sheetHeader}>
            <Text style={[styles.sheetTitle, { color: colors.text }]}>{title}</Text>
            <IconButton icon="close" onPress={onClose} label="Close" />
          </View>
          {children}
        </View>
      </View>
    </Modal>
  );
}

export function Metric({ label, value, note, icon }: { label: string; value: string; note?: string; icon?: keyof typeof MaterialIcons.glyphMap }) {
  const colors = useDeenPalette();
  return (
    <View style={[styles.metric, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.metricHeading}>
        {icon ? <MaterialIcons name={icon} size={15} color={colors.accent} /> : null}
        <Text numberOfLines={1} style={[styles.metricLabel, { color: colors.muted }]}>{label}</Text>
      </View>
      <Text numberOfLines={1} style={[styles.metricValue, { color: colors.text }]}>{value}</Text>
      {note ? <Text numberOfLines={1} style={[styles.metricNote, { color: colors.muted }]}>{note}</Text> : null}
    </View>
  );
}

export const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 18, padding: 16 },
  titleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  titleCopy: { flex: 1, gap: 2 },
  eyebrow: { fontSize: 11, fontWeight: "800", letterSpacing: 1.2 },
  screenTitle: { fontSize: 28, lineHeight: 34, fontWeight: "700" },
  dateStrip: { gap: 8, paddingVertical: 4 },
  dateButton: { width: 48, height: 64, alignItems: "center", justifyContent: "center", borderWidth: 1, borderRadius: 15, gap: 2 },
  dateDay: { fontSize: 11, fontWeight: "700" },
  dateNumber: { fontSize: 17, fontWeight: "800" },
  todayDot: { width: 4, height: 4, borderRadius: 2, marginTop: 1 },
  iconButton: { width: 38, height: 38, borderRadius: 12, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  appButton: { minHeight: 46, borderRadius: 14, paddingHorizontal: 16, borderWidth: 1, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8 },
  appButtonText: { fontSize: 15, lineHeight: 19, fontWeight: "800" },
  pressed: { opacity: 0.72, transform: [{ scale: 0.98 }] },
  numberControl: { borderRadius: 12, borderWidth: 1, minWidth: 106, height: 38, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  numberControlCompact: { minWidth: 98, height: 34 },
  counterAction: { height: "100%", width: 34, alignItems: "center", justifyContent: "center" },
  counterValue: { minWidth: 26, textAlign: "center", fontSize: 14, fontWeight: "800" },
  fieldWrap: { gap: 7 },
  fieldLabel: { fontSize: 13, fontWeight: "800" },
  fieldInput: { height: 47, borderWidth: 1, borderRadius: 12, paddingHorizontal: 13, fontSize: 15, lineHeight: 20 },
  fieldInputMultiline: { minHeight: 86, height: 86, paddingTop: 12, textAlignVertical: "top" },
  modalBackdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.36)" },
  sheet: { maxHeight: "88%", borderTopLeftRadius: 26, borderTopRightRadius: 26, borderWidth: 1, padding: 18, gap: 18 },
  sheetHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sheetTitle: { fontSize: 20, fontWeight: "800" },
  metric: { flex: 1, minWidth: 0, borderRadius: 16, borderWidth: 1, padding: 13, gap: 5 },
  metricHeading: { flexDirection: "row", alignItems: "center", gap: 5 },
  metricLabel: { flex: 1, fontSize: 11, fontWeight: "700" },
  metricValue: { fontSize: 22, lineHeight: 28, fontWeight: "800" },
  metricNote: { fontSize: 11, lineHeight: 15 },
});
