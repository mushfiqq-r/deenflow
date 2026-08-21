import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useMemo, useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { AppButton, Card, DateStrip, IconButton, InputField, Metric, NumberControl, ScreenTitle, Sheet, useDeenPalette } from "@/components/deenflow/ui";
import { completionForDate, taskMaximum, taskPointsForDate } from "@/lib/deenflow/analytics";
import { readableDate, toDateKey } from "@/lib/deenflow/date";
import { useDeenFlow } from "@/lib/deenflow/store";
import type { ChecklistTask } from "@/lib/deenflow/types";

type ListRow = { type: "task"; task: ChecklistTask; categoryId: string; categoryTitle: string };

export default function ChecklistScreen() {
  const { data, isReady, setTaskCount, addTask, updateTask, addCategory } = useDeenFlow();
  const colors = useDeenPalette();
  const [selectedDate, setSelectedDate] = useState(toDateKey());
  const [taskSheet, setTaskSheet] = useState<{ mode: "add" | "edit"; categoryId?: string; task?: ChecklistTask } | null>(null);
  const [categorySheet, setCategorySheet] = useState(false);
  const [taskName, setTaskName] = useState("");
  const [taskPoints, setTaskPoints] = useState("1");
  const [categoryName, setCategoryName] = useState("");

  const completion = completionForDate(data, selectedDate);
  const dailyMax = taskMaximum(data.categories, false);
  const dailyPoints = taskPointsForDate(data, selectedDate);
  const list = useMemo<ListRow[]>(() => data.categories.flatMap((category) => category.tasks.map((task) => ({ type: "task", task, categoryId: category.id, categoryTitle: category.title }))), [data.categories]);

  const openTaskSheet = (categoryId: string, task?: ChecklistTask) => {
    setTaskName(task?.title ?? "");
    setTaskPoints(String(task?.points ?? 1));
    setTaskSheet({ mode: task ? "edit" : "add", categoryId, task });
  };
  const saveTask = () => {
    const points = Math.max(0, Number(taskPoints) || 0);
    if (!taskSheet || !taskName.trim()) return;
    if (taskSheet.mode === "edit" && taskSheet.task) updateTask(taskSheet.task.id, { title: taskName.trim(), points });
    if (taskSheet.mode === "add" && taskSheet.categoryId) addTask(taskSheet.categoryId, { title: taskName.trim(), points });
    setTaskSheet(null);
  };
  const saveCategory = () => {
    if (!categoryName.trim()) return;
    addCategory(categoryName.trim());
    setCategoryName("");
    setCategorySheet(false);
  };

  if (!isReady) return <ScreenContainer className="items-center justify-center"><Text style={{ color: colors.muted }}>Loading your private journal…</Text></ScreenContainer>;

  return (
    <ScreenContainer>
      <FlatList
        data={list}
        keyExtractor={(item) => item.task.id}
        contentContainerStyle={screenStyles.listContent}
        ListHeaderComponent={
          <View style={screenStyles.headerStack}>
            <ScreenTitle eyebrow="Daily intention" title="Checklist" action={<IconButton icon="add" label="Add category" onPress={() => setCategorySheet(true)} tone="accent" />} />
            <DateStrip selected={selectedDate} onSelect={setSelectedDate} />
            <Text style={[screenStyles.dateNote, { color: colors.muted }]}>{readableDate(selectedDate)}</Text>
            <Card style={screenStyles.progressCard}>
              <View style={screenStyles.progressTop}>
                <View style={[screenStyles.progressRing, { borderColor: colors.accent }]}><Text style={[screenStyles.progressPercent, { color: colors.text }]}>{completion.percent}%</Text><Text style={[screenStyles.progressLabel, { color: colors.muted }]}>complete</Text></View>
                <View style={screenStyles.progressCopy}><Text style={[screenStyles.progressTitle, { color: colors.text }]}>Make this day count</Text><Text style={[screenStyles.progressBody, { color: colors.muted }]}>{completion.completed} of {completion.total} intentions marked.</Text><View style={[screenStyles.progressTrack, { backgroundColor: colors.background }]}><View style={[screenStyles.progressFill, { backgroundColor: colors.accent, width: `${completion.percent}%` }]} /></View></View>
              </View>
              <View style={screenStyles.metricRow}><Metric label="Points today" value={`${dailyPoints}`} note={`of ${dailyMax} daily`} icon="stars" /><Metric label="Categories" value={`${data.categories.length}`} note="customizable" icon="folder-open" /></View>
            </Card>
            <Text style={[screenStyles.sectionHint, { color: colors.muted }]}>Tap a circle to complete once. Use ± for repeatable or partial entries.</Text>
          </View>
        }
        renderItem={({ item, index }) => {
          const previous = list[index - 1];
          const showHeader = !previous || previous.categoryId !== item.categoryId;
          const count = data.entries[selectedDate]?.tasks[item.task.id] ?? 0;
          return (
            <View style={screenStyles.rowWrap}>
              {showHeader ? <View style={screenStyles.categoryHeader}><Text style={[screenStyles.categoryTitle, { color: colors.text }]}>{item.categoryTitle}</Text><Pressable onPress={() => openTaskSheet(item.categoryId)} style={({ pressed }) => [screenStyles.textAction, pressed && screenStyles.pressed]}><Text style={[screenStyles.textActionLabel, { color: colors.accent }]}>Add task</Text></Pressable></View> : null}
              <Card style={screenStyles.taskCard}>
                <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: count > 0 }} accessibilityLabel={`Mark ${item.task.title} complete`} onPress={() => setTaskCount(item.task.id, selectedDate, count > 0 ? 0 : 1)} style={({ pressed }) => [screenStyles.checkButton, { backgroundColor: count > 0 ? colors.accent : colors.background, borderColor: count > 0 ? colors.accent : colors.border }, pressed && screenStyles.pressed]}>
                  {count > 0 ? <MaterialIcons name="check" size={17} color="#FFFFFF" /> : null}
                </Pressable>
                <View style={screenStyles.taskCopy}><Text style={[screenStyles.taskTitle, { color: colors.text }]}>{item.task.title}</Text><Text style={[screenStyles.taskMeta, { color: colors.muted }]}>{item.task.points} point{item.task.points === 1 ? "" : "s"}{item.task.weekly ? " · weekly" : ""}</Text></View>
                <NumberControl compact value={count} onChange={(next) => setTaskCount(item.task.id, selectedDate, next)} label={item.task.title} />
                <Pressable accessibilityRole="button" accessibilityLabel={`Edit ${item.task.title}`} onPress={() => openTaskSheet(item.categoryId, item.task)} style={({ pressed }) => [screenStyles.editButton, pressed && screenStyles.pressed]}><MaterialIcons name="edit" size={17} color={colors.muted} /></Pressable>
              </Card>
            </View>
          );
        }}
        ListFooterComponent={<View style={screenStyles.footerSpace}><AppButton label="Add a new category" variant="secondary" icon="add" onPress={() => setCategorySheet(true)} /></View>}
      />

      <Sheet visible={Boolean(taskSheet)} title={taskSheet?.mode === "edit" ? "Edit task" : "Add task"} onClose={() => setTaskSheet(null)}>
        <InputField label="Task name" value={taskName} onChangeText={setTaskName} placeholder="e.g. Read a page of Qur’an" returnKeyType="done" />
        <InputField label="Points" value={taskPoints} onChangeText={setTaskPoints} keyboardType="number-pad" placeholder="1" />
        <AppButton label={taskSheet?.mode === "edit" ? "Save changes" : "Add task"} icon="check" onPress={saveTask} disabled={!taskName.trim()} />
      </Sheet>
      <Sheet visible={categorySheet} title="New category" onClose={() => setCategorySheet(false)}>
        <InputField label="Category name" value={categoryName} onChangeText={setCategoryName} placeholder="e.g. Family & service" returnKeyType="done" />
        <AppButton label="Create category" icon="folder" onPress={saveCategory} disabled={!categoryName.trim()} />
      </Sheet>
    </ScreenContainer>
  );
}

const screenStyles = StyleSheet.create({
  listContent: { padding: 18, paddingBottom: 112, gap: 10 },
  headerStack: { gap: 14, paddingBottom: 10 },
  dateNote: { fontSize: 13, lineHeight: 18, fontWeight: "600" },
  progressCard: { gap: 15 },
  progressTop: { flexDirection: "row", gap: 16, alignItems: "center" },
  progressRing: { width: 80, height: 80, borderRadius: 40, borderWidth: 6, alignItems: "center", justifyContent: "center" },
  progressPercent: { fontSize: 19, fontWeight: "800" }, progressLabel: { fontSize: 10, fontWeight: "700" },
  progressCopy: { flex: 1, gap: 5 }, progressTitle: { fontSize: 17, fontWeight: "800" }, progressBody: { fontSize: 13, lineHeight: 18 },
  progressTrack: { height: 6, borderRadius: 3, overflow: "hidden", marginTop: 4 }, progressFill: { height: "100%", borderRadius: 3 },
  metricRow: { flexDirection: "row", gap: 10 }, sectionHint: { fontSize: 12, lineHeight: 17, paddingHorizontal: 3 },
  rowWrap: { gap: 8 }, categoryHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 12, marginBottom: 2, paddingHorizontal: 2 },
  categoryTitle: { fontSize: 16, fontWeight: "800" }, textAction: { padding: 5 }, textActionLabel: { fontSize: 12, fontWeight: "800" },
  taskCard: { padding: 12, flexDirection: "row", alignItems: "center", gap: 10 }, checkButton: { width: 31, height: 31, borderRadius: 11, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  taskCopy: { flex: 1, minWidth: 0, gap: 3 }, taskTitle: { fontSize: 14, lineHeight: 19, fontWeight: "700" }, taskMeta: { fontSize: 11, lineHeight: 15, fontWeight: "600" }, editButton: { width: 25, height: 32, justifyContent: "center", alignItems: "center" },
  footerSpace: { paddingTop: 18 }, pressed: { opacity: 0.72, transform: [{ scale: 0.98 }] },
});
