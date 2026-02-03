import { useMemo, useState, useEffect } from "react";
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { useUser, useClerk } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import {
  AlertTriangle,
  BadgeCheck,
  HeartPulse,
  Languages,
  Phone,
  Ruler,
  ShieldCheck,
  UserRound,
  LogOut,
} from "lucide-react-native";
import { getUserProfile, updateUserProfile, UserHealthProfile } from "@/services/sanity";

const ACCENT = "#00BFA5";

function GlassCard({ children, style }: { children: React.ReactNode; style?: any }) {
  return (
    <View style={[styles.glassCard, style]}>
      <BlurView intensity={60} tint="light" style={styles.blurContainer}>
        <View style={styles.glassContent}>{children}</View>
      </BlurView>
    </View>
  );
}

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default function ProfileScreen() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserHealthProfile | null>(null);
  const [highContrast, setHighContrast] = useState(false);
  const [largeText, setLargeText] = useState(true);

  useEffect(() => {
    loadUserProfile();
  }, [user?.id]);

  const loadUserProfile = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const data = await getUserProfile(user.id);
      if (data) {
        setProfile(data);
        setHighContrast(data.highContrast || false);
        setLargeText(data.largeTextMode || true);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleHighContrastToggle = async (value: boolean) => {
    setHighContrast(value);
    if (user?.id && profile) {
      try {
        await updateUserProfile(user.id, { highContrast: value });
      } catch (error) {
        console.error("Error updating profile:", error);
      }
    }
  };

  const handleLargeTextToggle = async (value: boolean) => {
    setLargeText(value);
    if (user?.id && profile) {
      try {
        await updateUserProfile(user.id, { largeTextMode: value });
      } catch (error) {
        console.error("Error updating profile:", error);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      router.replace("/(auth)/login");
    } catch (error) {
      console.error("Error signing out:", error);
      alert("Failed to sign out");
    }
  };

  const displayName = useMemo(() => {
    return profile?.firstName || user?.firstName || "User";
  }, [profile?.firstName, user?.firstName]);

  const verifiedId = useMemo(() => {
    if (!user?.id) return "Verified Health ID";
    return `Verified Health ID: ${user.id.slice(0, 8).toUpperCase()}`;
  }, [user?.id]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={ACCENT} />
      </View>
    );
  }

  return (
    <LinearGradient
      colors={["#EAFBF8", "#F7FEFD", "#FFFFFF"]}
      style={styles.container}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatarGlow}>
              {user?.imageUrl ? (
                <Image
                  source={{ uri: user.imageUrl }}
                  style={styles.avatar}
                  accessibilityLabel={`${displayName} profile photo`}
                />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarInitials}>{getInitials(displayName)}</Text>
                </View>
              )}
            </View>
          </View>
          <View style={styles.headerMeta}>
            <Text style={styles.name}>{displayName}</Text>
            <View style={styles.verifiedRow}>
              <BadgeCheck size={14} color={ACCENT} />
              <Text style={styles.verifiedText}>{verifiedId}</Text>
            </View>
          </View>
        </View>

        <LinearGradient
          colors={["#F27A7A", "#E05B5B"]}
          style={styles.sosCard}
        >
          <View style={styles.sosHeader}>
            <View style={styles.sosIconWrap}>
              <AlertTriangle size={18} color="#FFFFFF" />
            </View>
            <Text style={styles.sosTitle}>High-Contrast Caution Card</Text>
          </View>
          <View style={styles.sosBody}>
            <Text style={styles.sosLabel}>SOS Emergency Profile</Text>
            <Text style={styles.sosSubtext}>
              One-tap access: Blood Group & Allergies for paramedics
            </Text>
            <View style={styles.sosActionRow}>
              <Phone size={16} color="#FFFFFF" />
              <Text style={styles.sosActionText}>Call Emergency</Text>
            </View>
          </View>
        </LinearGradient>

        {profile && (
          <>
            <GlassCard>
              <Text style={styles.sectionTitle}>Health Identity</Text>
              <View style={styles.grid}>
                <View style={styles.gridTile}>
                  <HeartPulse size={16} color={ACCENT} />
                  <Text style={styles.gridLabel}>Blood Group</Text>
                  <Text style={styles.gridValue}>{profile.bloodGroup || "—"}</Text>
                </View>
                <View style={styles.gridTile}>
                  <UserRound size={16} color={ACCENT} />
                  <Text style={styles.gridLabel}>Age</Text>
                  <Text style={styles.gridValue}>{profile.age || "—"}</Text>
                </View>
                <View style={styles.gridTile}>
                  <Ruler size={16} color={ACCENT} />
                  <Text style={styles.gridLabel}>Height</Text>
                  <Text style={styles.gridValue}>{profile.height ? `${profile.height} cm` : "—"}</Text>
                </View>
                <View style={styles.gridTile}>
                  <HeartPulse size={16} color={ACCENT} />
                  <Text style={styles.gridLabel}>Weight</Text>
                  <Text style={styles.gridValue}>{profile.weight ? `${profile.weight} kg` : "—"}</Text>
                </View>
              </View>
              {profile.chronicDiseases && (
                <View style={styles.chronicSection}>
                  <Text style={styles.chronicLabel}>Chronic Conditions</Text>
                  <Text style={styles.chronicValue}>{profile.chronicDiseases}</Text>
                </View>
              )}
            </GlassCard>

            <GlassCard>
              <Text style={styles.sectionTitle}>Caregiver Connectivity</Text>
              <View style={styles.rowBetween}>
                <Text style={styles.bodyText}>Linked Caregiver</Text>
                <Text style={styles.bodyValue}>{profile.caregiverName || "Not set"}</Text>
              </View>
              {profile.caregiverPhone && (
                <View style={styles.rowBetween}>
                  <Text style={styles.caption}>Contact</Text>
                  <Text style={styles.bodyValue}>{profile.caregiverPhone}</Text>
                </View>
              )}
              <View style={styles.rowBetween}>
                <Text style={styles.caption}>Alert on Missed</Text>
                <View style={styles.badgeActive}>
                  <Text style={styles.badgeText}>Active</Text>
                </View>
              </View>
            </GlassCard>
          </>
        )}

        <GlassCard>
          <Text style={styles.sectionTitle}>Accessibility Suite</Text>
          <View style={styles.switchRow}>
            <View style={styles.switchLabelRow}>
              <ShieldCheck size={16} color={ACCENT} />
              <Text style={styles.bodyText}>High Contrast</Text>
            </View>
            <Switch
              value={highContrast}
              onValueChange={handleHighContrastToggle}
              trackColor={{ false: "#D1D5DB", true: "#BFF3EC" }}
              thumbColor={highContrast ? ACCENT : "#FFFFFF"}
            />
          </View>
          <View style={styles.switchRow}>
            <View style={styles.switchLabelRow}>
              <ShieldCheck size={16} color={ACCENT} />
              <Text style={styles.bodyText}>Large Text Mode</Text>
            </View>
            <Switch
              value={largeText}
              onValueChange={handleLargeTextToggle}
              trackColor={{ false: "#D1D5DB", true: "#BFF3EC" }}
              thumbColor={largeText ? ACCENT : "#FFFFFF"}
            />
          </View>
        </GlassCard>

        <TouchableOpacity
          style={styles.logoutCardButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <GlassCard style={styles.logoutCard}>
            <View style={styles.logoutContent}>
              <LogOut size={20} color="#E15555" />
              <Text style={styles.logoutText}>Log Out</Text>
            </View>
          </GlassCard>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    padding: 20,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: 120,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  avatarWrap: {
    marginRight: 14,
  },
  avatarGlow: {
    width: 78,
    height: 78,
    borderRadius: 39,
    padding: 3,
    backgroundColor: "#E7FBF7",
    borderWidth: 2,
    borderColor: ACCENT,
    shadowColor: ACCENT,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 36,
  },
  avatarFallback: {
    flex: 1,
    borderRadius: 36,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitials: {
    fontSize: 20,
    fontWeight: "600",
    color: ACCENT,
    fontFamily: "Inter",
  },
  headerMeta: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
    fontFamily: "Inter",
  },
  verifiedRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 6,
  },
  verifiedText: {
    fontSize: 12,
    color: "#4B5563",
    fontFamily: "Inter",
  },
  sosCard: {
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    shadowColor: "#E15555",
    shadowOpacity: 0.3,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  sosHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  sosIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  sosTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    fontFamily: "Inter",
  },
  sosBody: {
    gap: 6,
  },
  sosLabel: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "Inter",
  },
  sosSubtext: {
    color: "rgba(255, 255, 255, 0.85)",
    fontSize: 12,
    lineHeight: 18,
    fontFamily: "Inter",
  },
  sosActionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 6,
  },
  sosActionText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    fontFamily: "Inter",
  },
  glassCard: {
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    marginBottom: 16,
    shadowColor: "#0F172A",
    shadowOpacity: 0.05,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
    overflow: "hidden",
  },
  blurContainer: {
    borderRadius: 22,
  },
  glassContent: {
    padding: 16,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 12,
    fontFamily: "Inter",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  gridTile: {
    width: "48%",
    padding: 12,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderWidth: 1,
    borderColor: "#E5F7F4",
    gap: 6,
    alignItems: "center",
  },
  gridLabel: {
    fontSize: 11,
    color: "#6B7280",
    fontFamily: "Inter",
  },
  gridValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
    fontFamily: "Inter",
  },
  chronicSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  chronicLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontFamily: "Inter",
  },
  chronicValue: {
    fontSize: 13,
    color: "#0F172A",
    fontWeight: "500",
    marginTop: 4,
    fontFamily: "Inter",
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  bodyText: {
    fontSize: 13,
    color: "#0F172A",
    fontFamily: "Inter",
  },
  bodyValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0F172A",
    fontFamily: "Inter",
  },
  caption: {
    fontSize: 12,
    color: "#6B7280",
    fontFamily: "Inter",
  },
  badgeActive: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#E0F7F3",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: ACCENT,
    fontFamily: "Inter",
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  switchLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logoutCardButton: {
    marginTop: 8,
  },
  logoutCard: {
    alignItems: "center",
    backgroundColor: "rgba(240, 90, 90, 0.1)",
    borderColor: "rgba(240, 90, 90, 0.2)",
    borderWidth: 1,
  },
  logoutContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#E15555",
    fontFamily: "Inter",
  },
});
