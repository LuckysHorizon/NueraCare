import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Platform,
} from "react-native";
import { colors, spacing } from "@/theme/colors";

interface CatalogCardProps {
  title: string;
  description?: string;
  selected?: boolean;
  onPress: () => void;
  accessibilityLabel?: string;
}

export function CatalogCard({
  title,
  description,
  selected = false,
  onPress,
  accessibilityLabel,
}: CatalogCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[styles.card, selected && styles.cardSelected]}
      accessible
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={accessibilityLabel || title}
    >
      <Text style={[styles.cardTitle, selected && styles.cardTitleSelected]}>
        {title}
      </Text>
      {description ? (
        <Text style={styles.cardDescription}>{description}</Text>
      ) : null}
    </TouchableOpacity>
  );
}

interface ToggleTileProps {
  title: string;
  subtitle?: string;
  selected?: boolean;
  onPress: () => void;
  accessibilityLabel?: string;
}

export function ToggleTile({
  title,
  subtitle,
  selected = false,
  onPress,
  accessibilityLabel,
}: ToggleTileProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[styles.tile, selected && styles.tileSelected]}
      accessible
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={accessibilityLabel || title}
    >
      <View style={styles.tileIndicator}>
        <View
          style={[
            styles.tileDot,
            selected ? styles.tileDotActive : styles.tileDotInactive,
          ]}
        />
      </View>
      <View style={styles.tileTextWrap}>
        <Text style={[styles.tileTitle, selected && styles.tileTitleSelected]}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.tileSubtitle}>{subtitle}</Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

interface CatalogChipProps {
  label: string;
  selected?: boolean;
  onPress: () => void;
  accessibilityLabel?: string;
}

export function CatalogChip({
  label,
  selected = false,
  onPress,
  accessibilityLabel,
}: CatalogChipProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[styles.chip, selected && styles.chipSelected]}
      accessible
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={accessibilityLabel || label}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

interface OptionalNoteInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  helperText: string;
  accessibilityLabel?: string;
}

export function OptionalNoteInput({
  value,
  onChangeText,
  placeholder,
  helperText,
  accessibilityLabel,
}: OptionalNoteInputProps) {
  return (
    <View style={styles.noteWrap}>
      <Text style={styles.noteHelper}>{helperText}</Text>
      <TextInput
        style={styles.noteInput}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.gray400}
        multiline
        numberOfLines={3}
        textAlignVertical="top"
        accessible
        accessibilityLabel={accessibilityLabel || placeholder}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.lg,
    borderRadius: 18,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray200,
    shadowColor: "#0F172A",
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  cardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary50,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.gray900,
  },
  cardTitleSelected: {
    color: colors.primary,
  },
  cardDescription: {
    marginTop: spacing.xs,
    color: colors.gray600,
    fontSize: 13,
    lineHeight: 18,
  },
  tile: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: 16,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  tileSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary50,
  },
  tileIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.gray300,
    backgroundColor: colors.white,
  },
  tileDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  tileDotActive: {
    backgroundColor: colors.primary,
  },
  tileDotInactive: {
    backgroundColor: "transparent",
  },
  tileTextWrap: {
    flex: 1,
  },
  tileTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.gray900,
  },
  tileTitleSelected: {
    color: colors.primary,
  },
  tileSubtitle: {
    marginTop: spacing.xs,
    color: colors.gray600,
    fontSize: 12,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 8 : 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.gray200,
    backgroundColor: colors.white,
  },
  chipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary50,
  },
  chipText: {
    fontSize: 13,
    color: colors.gray700,
    fontWeight: "500",
  },
  chipTextSelected: {
    color: colors.primary,
    fontWeight: "600",
  },
  noteWrap: {
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.gray200,
    backgroundColor: colors.gray50,
  },
  noteHelper: {
    color: colors.gray600,
    fontSize: 12,
    marginBottom: spacing.sm,
  },
  noteInput: {
    minHeight: 88,
    borderRadius: 12,
    backgroundColor: colors.white,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray200,
    fontSize: 14,
    color: colors.gray800,
  },
});
