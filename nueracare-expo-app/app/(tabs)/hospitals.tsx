import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  FlatList,
  Alert,
  Dimensions,
  LayoutAnimation,
  UIManager,
  Linking,
  Modal,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import * as Location from "expo-location";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Heading, Body } from "@/components/common";
import { borderRadius, colors, spacing } from "@/theme/colors";
import {
  Search,
  MapPin,
  Phone,
  ArrowRight,
  Star,
  MessageCircle,
  AlertCircle,
  Ambulance,
  ChevronRight,
  X,
  Filter,
} from "lucide-react-native";

const { width } = Dimensions.get("window");

// Enable LayoutAnimation on Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Types
interface Hospital {
  placeId: string;
  name: string;
  rating: number;
  reviewCount: number;
  address: string;
  phone?: string;
  distance: number;
  latitude: number;
  longitude: number;
  openNow?: boolean;
  opening_hours?: {
    weekday_text: string[];
  };
  photo?: string;
  types: string[];
}

interface LocationCoords {
  latitude: number;
  longitude: number;
}

const SPECIALTIES = [
  "Cardiology",
  "Neurology",
  "Ortho",
  "Pediatrics",
  "Oncology",
  "Gastroenterology",
];

const RATING_FILTERS = [
  { label: "All", value: 0 },
  { label: "4.5+", value: 4.5 },
  { label: "4.0+", value: 4.0 },
  { label: "3.5+", value: 3.5 },
];

export default function HospitalsScreen() {
  const insets = useSafeAreaInsets();
  const [location, setLocation] = useState<LocationCoords | null>(null);
  const [selectedCity, setSelectedCity] = useState("Hyderabad");
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [filteredHospitals, setFilteredHospitals] = useState<Hospital[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingHospitals, setLoadingHospitals] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [hospitalDetailsVisible, setHospitalDetailsVisible] = useState(false);
  const [showCitySelector, setShowCitySelector] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [minRating, setMinRating] = useState(0);

  const MAJOR_CITIES = [
    "Use my location",
    "Hyderabad",
    "Bangalore",
    "Chennai",
    "Mumbai",
    "Delhi",
    "Pune",
  ];

  // Get user location on mount
  useEffect(() => {
    requestLocationPermission();
  }, []);

  // Fetch hospitals when location or city changes
  useEffect(() => {
    if (location || selectedCity) {
      fetchHospitals();
    }
  }, [selectedCity, location]);

  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (trimmed.length < 2) {
      filterHospitals(hospitals, "", selectedSpecialty, minRating);
      return;
    }

    const timeout = setTimeout(() => {
      searchHospitals(trimmed);
    }, 400);

    return () => clearTimeout(timeout);
  }, [searchQuery, selectedSpecialty, minRating, location, selectedCity]);

  const requestLocationPermission = async (): Promise<LocationCoords | null> => {
    setLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const userLocation = await Location.getCurrentPositionAsync({});
        const coords = {
          latitude: userLocation.coords.latitude,
          longitude: userLocation.coords.longitude,
        };
        setLocation(coords);
        setSelectedCity("Current Location");
        console.log("📍 Got user location:", coords);
        return coords;
      } else {
        // Fallback: use city coordinates
        console.log("⚠️ Location permission denied, using city coordinates");
      }
    } catch (err) {
      console.error("❌ Location error:", err);
      // Don't set error - just use fallback
    } finally {
      setLoadingLocation(false);
    }
    return null;
  };

  const fetchHospitals = async () => {
    setLoadingHospitals(true);
    setError(null);
    try {
      // Get coordinates for the city if no GPS location
      let coords = location;
      if (!coords) {
        if (selectedCity === "Current Location") {
          coords = await requestLocationPermission();
        }
        if (!coords) {
          coords = getCityCoordinates(selectedCity);
        }
      }

      if (!coords) {
        setError("Cannot determine location");
        setLoadingHospitals(false);
        return;
      }

      // Debug: Log the API URL
      const apiUrl = process.env.EXPO_PUBLIC_API_URL;
      console.log("🔍 API URL:", apiUrl);
      
      if (!apiUrl) {
        throw new Error("EXPO_PUBLIC_API_URL is not configured in .env.local");
      }

      const url = `${apiUrl}/api/hospitals/nearby?latitude=${coords.latitude}&longitude=${coords.longitude}&radius=5000&limit=10&min_rating=${minRating}`;
      console.log("📡 Fetching from:", url);

      // Fetch from backend which uses Google Places API
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("📊 Response status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("📛 Response error:", errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log(`📍 Fetched ${data.hospitals?.length || 0} hospitals`);
      
      if (data.hospitals && Array.isArray(data.hospitals)) {
        setHospitals(data.hospitals);
        filterHospitals(data.hospitals, searchQuery, selectedSpecialty, minRating);
      } else {
        throw new Error("Invalid response format: missing hospitals array");
      }
    } catch (err) {
      console.error("❌ Error fetching hospitals:", err);
      setError(err instanceof Error ? err.message : "Failed to load hospitals");
      // Load demo hospitals as fallback
      loadDemoHospitals();
    } finally {
      setLoadingHospitals(false);
    }
  };

  const searchHospitals = async (query: string) => {
    setLoadingHospitals(true);
    setError(null);
    try {
      let coords = location;
      if (!coords) {
        if (selectedCity === "Current Location") {
          coords = await requestLocationPermission();
        }
        if (!coords) {
          coords = getCityCoordinates(selectedCity);
        }
      }

      if (!coords) {
        setError("Cannot determine location");
        setLoadingHospitals(false);
        return;
      }

      const apiUrl = process.env.EXPO_PUBLIC_API_URL;
      if (!apiUrl) {
        throw new Error("EXPO_PUBLIC_API_URL is not configured in .env.local");
      }

      const url = `${apiUrl}/api/hospitals/search?query=${encodeURIComponent(query)}&latitude=${coords.latitude}&longitude=${coords.longitude}&radius=5000&limit=10&min_rating=${minRating}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to search hospitals");
      }

      const data = await response.json();
      setHospitals(data.hospitals);
      filterHospitals(data.hospitals, query, selectedSpecialty, minRating);
    } catch (err) {
      console.error("❌ Error searching hospitals:", err);
      setError(err instanceof Error ? err.message : "Failed to search hospitals");
    } finally {
      setLoadingHospitals(false);
    }
  };

  const filterHospitals = (
    hospitalsList: Hospital[],
    query: string,
    specialty: string | null,
    minRatingValue: number
  ) => {
    let filtered = [...hospitalsList].filter((h) =>
      h.types?.some((t) => t.toLowerCase() === "hospital")
    );

    if (query.trim()) {
      filtered = filtered.filter(
        (h) =>
          h.name.toLowerCase().includes(query.toLowerCase()) ||
          h.address.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (specialty) {
      // Filter by specialty - check if hospital types include the specialty
      const specialtyLower = specialty.toLowerCase();
      filtered = filtered.filter((h) =>
        h.types.some(
          (type) =>
            type.toLowerCase().includes(specialtyLower) ||
            h.name.toLowerCase().includes(specialtyLower)
        )
      );
    }

    if (minRatingValue > 0) {
      filtered = filtered.filter((h) => (h.rating || 0) >= minRatingValue);
    }

    filtered.sort((a, b) => a.distance - b.distance);
    setFilteredHospitals(filtered);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      filterHospitals(hospitals, "", selectedSpecialty, minRating);
    }
  };

  const handleSpecialtyFilter = (specialty: string) => {
    const newSpecialty = selectedSpecialty === specialty ? null : specialty;
    setSelectedSpecialty(newSpecialty);
    filterHospitals(hospitals, searchQuery, newSpecialty, minRating);
  };

  const handleRatingFilter = (rating: number) => {
    setMinRating(rating);
    filterHospitals(hospitals, searchQuery, selectedSpecialty, rating);
  };

  const handleCall = async (hospital: Hospital) => {
    let phone = hospital.phone;
    try {
      if (!phone) {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL;
        if (!apiUrl) {
          throw new Error("EXPO_PUBLIC_API_URL is not configured in .env.local");
        }
        const url = `${apiUrl}/api/hospitals/details?place_id=${hospital.placeId}`;
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          phone = data.phone || phone;
        }
      }
    } catch (err) {
      console.error("❌ Error fetching phone:", err);
    }

    if (!phone) {
      Alert.alert("Phone number not available");
      return;
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL(`tel:${phone}`);
  };

  const handleDirections = (hospital: Hospital) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${hospital.latitude},${hospital.longitude}`;
    Linking.openURL(mapsUrl);
  };

  const handleEmergency = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const emergencyUrl = `https://www.google.com/maps/search/hospitals+near+me`;
    Linking.openURL(emergencyUrl);
  };

  const getCityCoordinates = (
    city: string
  ): LocationCoords | null => {
    const cityCoords: { [key: string]: LocationCoords } = {
      Hyderabad: { latitude: 17.3850, longitude: 78.4867 },
      Bangalore: { latitude: 12.9716, longitude: 77.5946 },
      Chennai: { latitude: 13.0827, longitude: 80.2707 },
      Mumbai: { latitude: 19.0760, longitude: 72.8777 },
      Delhi: { latitude: 28.7041, longitude: 77.1025 },
      Pune: { latitude: 18.5204, longitude: 73.8567 },
    };
    return cityCoords[city] || null;
  };

  const loadDemoHospitals = () => {
    const demoHospitals: Hospital[] = [
      {
        placeId: "demo1",
        name: "Care Hospitals",
        rating: 4.7,
        reviewCount: 7500,
        address: "Banjara Hills, Hyderabad",
        phone: "040-6666-6666",
        distance: 2.3,
        latitude: 17.36,
        longitude: 78.47,
        openNow: true,
        types: ["hospital"],
      },
      {
        placeId: "demo2",
        name: "Apollo Hospital",
        rating: 4.8,
        reviewCount: 6200,
        address: "Jubilee Hills, Hyderabad",
        phone: "040-2333-3333",
        distance: 3.1,
        latitude: 17.35,
        longitude: 78.49,
        openNow: true,
        types: ["hospital"],
      },
      {
        placeId: "demo3",
        name: "Yashoda Hospital",
        rating: 4.6,
        reviewCount: 8100,
        address: "Somajiguda, Hyderabad",
        phone: "040-2313-1313",
        distance: 3.8,
        latitude: 17.37,
        longitude: 78.46,
        openNow: true,
        types: ["hospital"],
      },
    ];
    setHospitals(demoHospitals);
    filterHospitals(demoHospitals, searchQuery, selectedSpecialty, minRating);
  };

  const topHospitals = useMemo(() => {
    return hospitals
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 5);
  }, [hospitals]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 8 }]}
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
      >
        <Text style={styles.pageTitle}>Hospitals Nearby</Text>

        {/* Location Selector */}
        <TouchableOpacity
          style={styles.locationPill}
          onPress={() => setShowCitySelector(true)}
        >
          <MapPin size={18} color="#2EC4B6" strokeWidth={2} />
          <Text style={styles.locationText}>{selectedCity}</Text>
          <ChevronRight size={18} color="#9CA3AF" strokeWidth={2} />
        </TouchableOpacity>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Search size={20} color="#9CA3AF" strokeWidth={1.5} />
          <TextInput
            placeholder="Search hospitals or specialties"
            value={searchQuery}
            onChangeText={handleSearch}
            style={styles.searchInput}
            placeholderTextColor="#9CA3AF"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => handleSearch("")}>
              <X size={20} color="#9CA3AF" strokeWidth={2} />
            </TouchableOpacity>
          ) : (
            <Filter size={20} color="#9CA3AF" strokeWidth={1.5} />
          )}
        </View>

        {/* Top Hospitals */}
        {topHospitals.length > 0 && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Top Hospitals</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>See all</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={topHospitals}
              keyExtractor={(item) => item.placeId}
              horizontal
              showsHorizontalScrollIndicator={false}
              scrollEventThrottle={16}
              contentContainerStyle={{ paddingHorizontal: 0 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.topHospitalCard}
                  onPress={() => {
                    setSelectedHospital(item);
                    setHospitalDetailsVisible(true);
                  }}
                >
                  <View style={styles.topCardBadge}>
                    <Text style={styles.topCardBadgeText}>Top Rated</Text>
                  </View>

                  <View style={styles.topCardContent}>
                    <Text style={styles.topCardName} numberOfLines={2}>
                      {item.name}
                    </Text>

                    <View style={styles.ratingContainer}>
                      <View style={styles.ratingStars}>
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            color={i < Math.floor(item.rating) ? "#FFD700" : "#E5E7EB"}
                            fill={i < Math.floor(item.rating) ? "#FFD700" : "none"}
                            strokeWidth={1.5}
                          />
                        ))}
                      </View>
                      <Text style={styles.topCardRating}>
                        {item.rating.toFixed(1)}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        {/* Specialty Filters */}
        <View style={styles.specialtyContainer}>
          <FlatList
            data={SPECIALTIES}
            keyExtractor={(item) => item}
            horizontal
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
            contentContainerStyle={styles.specialtyList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.specialtyChip,
                  selectedSpecialty === item && styles.specialtyChipActive,
                ]}
                onPress={() => handleSpecialtyFilter(item)}
              >
                <Text
                  style={[
                    styles.specialtyChipText,
                    selectedSpecialty === item &&
                      styles.specialtyChipTextActive,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Rating Filters */}
        <View style={styles.ratingFilterContainer}>
          <FlatList
            data={RATING_FILTERS}
            keyExtractor={(item) => item.label}
            horizontal
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
            contentContainerStyle={styles.ratingFilterList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.ratingChip,
                  minRating === item.value && styles.ratingChipActive,
                ]}
                onPress={() => handleRatingFilter(item.value)}
              >
                <Text
                  style={[
                    styles.ratingChipText,
                    minRating === item.value && styles.ratingChipTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Hospital List */}
        {loadingHospitals ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1E88E5" />
            <Text style={styles.loadingText}>Finding hospitals near you...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <AlertCircle size={40} color="#E63946" strokeWidth={1.5} />
            <Text style={styles.errorTitle}>Couldn't load hospitals</Text>
            <Text style={styles.errorSubtext}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={fetchHospitals}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : filteredHospitals.length > 0 ? (
          <View style={styles.hospitalsList}>
            {filteredHospitals.map((hospital) => (
              <HospitalCard
                key={hospital.placeId}
                hospital={hospital}
                onPress={() => {
                  setSelectedHospital(hospital);
                  setHospitalDetailsVisible(true);
                }}
                onCall={handleCall}
                onDirections={handleDirections}
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <AlertCircle size={40} color="#9CA3AF" strokeWidth={1.5} />
            <Text style={styles.emptyText}>No hospitals found</Text>
            <Text style={styles.emptySubtext}>
              Try adjusting your search or location
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Emergency CTA */}
      <TouchableOpacity
        style={styles.emergencyButton}
        onPress={handleEmergency}
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={["#FF6B6B", "#E63946"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.emergencyGradient}
        >
          <Ambulance size={20} color="#FFFFFF" strokeWidth={2} />
          <Text style={styles.emergencyText}>Emergency Near Me</Text>
          <ChevronRight size={18} color="#FFFFFF" strokeWidth={2} />
        </LinearGradient>
      </TouchableOpacity>

      {/* City Selector Modal */}
      <Modal
        visible={showCitySelector}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCitySelector(false)}
      >
        <View style={styles.citySelectorOverlay}>
          <BlurView intensity={90} tint="dark" style={styles.blurContainer}>
            <TouchableOpacity
              style={styles.backdrop}
              activeOpacity={1}
              onPress={() => setShowCitySelector(false)}
            />
          </BlurView>

          <View style={styles.citySelectorContent}>
            <View style={styles.citySelectorHeader}>
              <Text style={styles.citySelectorTitle}>Select City</Text>
              <TouchableOpacity onPress={() => setShowCitySelector(false)}>
                <X size={24} color="#1F2937" strokeWidth={2} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={MAJOR_CITIES}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.cityOption,
                    (selectedCity === item || (item === "Use my location" && selectedCity === "Current Location")) &&
                      styles.cityOptionActive,
                  ]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    if (item === "Use my location") {
                      requestLocationPermission();
                      setShowCitySelector(false);
                      return;
                    }
                    setSelectedCity(item);
                    setLocation(null);
                    setShowCitySelector(false);
                  }}
                >
                  <MapPin
                    size={20}
                    color={
                      selectedCity === item || (item === "Use my location" && selectedCity === "Current Location")
                        ? "#1E88E5"
                        : "#9CA3AF"
                    }
                    strokeWidth={1.5}
                  />
                  <Text
                    style={[
                      styles.cityOptionText,
                      (selectedCity === item || (item === "Use my location" && selectedCity === "Current Location")) &&
                        styles.cityOptionTextActive,
                    ]}
                  >
                    {item === "Use my location" ? "Use my current location" : item}
                  </Text>
                  {(selectedCity === item || (item === "Use my location" && selectedCity === "Current Location")) && (
                    <View style={styles.cityCheckmark}>
                      <Text style={styles.checkmarkText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Hospital Details Modal */}
      <Modal
        visible={hospitalDetailsVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setHospitalDetailsVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <BlurView intensity={90} tint="dark" style={styles.blurContainer}>
            <TouchableOpacity
              style={styles.backdrop}
              activeOpacity={1}
              onPress={() => setHospitalDetailsVisible(false)}
            />
          </BlurView>

          {selectedHospital && (
            <View style={styles.hospitalDetailsContent}>
              <View style={styles.detailsHeader}>
                <View>
                  <Text style={styles.detailsName}>{selectedHospital.name}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setHospitalDetailsVisible(false)}
                >
                  <X size={24} color="#1F2937" strokeWidth={2} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Rating and Distance */}
                <View style={styles.detailsMetrics}>
                  <View style={styles.metricItem}>
                    <View style={styles.ratingStars}>
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          color={
                            i < Math.floor(selectedHospital.rating)
                              ? "#FFD700"
                              : "#E5E7EB"
                          }
                          fill={
                            i < Math.floor(selectedHospital.rating)
                              ? "#FFD700"
                              : "none"
                          }
                          strokeWidth={1.5}
                        />
                      ))}
                    </View>
                    <Text style={styles.metricText}>
                      {selectedHospital.rating.toFixed(1)} ({selectedHospital.reviewCount} reviews)
                    </Text>
                  </View>

                  <View style={styles.metricItem}>
                    <MapPin size={18} color="#2EC4B6" strokeWidth={2} />
                    <Text style={styles.metricText}>
                      {selectedHospital.distance.toFixed(1)} km away
                    </Text>
                  </View>
                </View>

                {/* Address */}
                <View style={styles.detailsSection}>
                  <Text style={styles.detailsLabel}>Address</Text>
                  <Text style={styles.detailsValue}>
                    {selectedHospital.address}
                  </Text>
                </View>

                {/* Phone */}
                {selectedHospital.phone && (
                  <View style={styles.detailsSection}>
                    <Text style={styles.detailsLabel}>Phone</Text>
                    <Text style={styles.detailsValue}>
                      {selectedHospital.phone}
                    </Text>
                  </View>
                )}

                {/* Status */}
                <View style={styles.detailsSection}>
                  <Text style={styles.detailsLabel}>Status</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: selectedHospital.openNow
                          ? "#D1FAE5"
                          : "#FEE2E2",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusBadgeText,
                        {
                          color: selectedHospital.openNow ? "#047857" : "#DC2626",
                        },
                      ]}
                    >
                      {selectedHospital.openNow ? "Open Now" : "Currently Closed"}
                    </Text>
                  </View>
                </View>
              </ScrollView>

              {/* Action Buttons */}
              <View style={styles.detailsActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => {
                    handleCall(selectedHospital);
                    setHospitalDetailsVisible(false);
                  }}
                >
                  <Phone size={20} color="#1E88E5" strokeWidth={2} />
                  <Text style={styles.actionButtonText}>Call</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => {
                    handleDirections(selectedHospital);
                    setHospitalDetailsVisible(false);
                  }}
                >
                  <ArrowRight size={20} color="#2EC4B6" strokeWidth={2} />
                  <Text style={styles.actionButtonText}>Directions</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </Modal>
      </View>
    </SafeAreaView>
  );
}

// Hospital Card Component
const HospitalCard = ({
  hospital,
  onPress,
  onCall,
  onDirections,
}: {
  hospital: Hospital;
  onPress: () => void;
  onCall: (hospital: Hospital) => void;
  onDirections: (hospital: Hospital) => void;
}) => {
  return (
    <TouchableOpacity style={styles.hospitalCard} onPress={onPress}>
      {/* Hospital Info */}
      <View style={styles.hospitalCardContent}>
        <View>
          <Text style={styles.hospitalName} numberOfLines={2}>
            {hospital.name}
          </Text>

          {/* Rating and Reviews */}
          <View style={styles.hospitalRating}>
            <View style={styles.ratingStars}>
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  color={i < Math.floor(hospital.rating) ? "#FFD700" : "#E5E7EB"}
                  fill={i < Math.floor(hospital.rating) ? "#FFD700" : "none"}
                  strokeWidth={1.5}
                />
              ))}
            </View>
            <Text style={styles.ratingText}>
              {hospital.rating.toFixed(1)}
            </Text>
            <Text style={styles.reviewCount}>
              ({hospital.reviewCount.toLocaleString()})
            </Text>
          </View>

          {/* Distance */}
          <View style={styles.distanceContainer}>
            <MapPin size={16} color="#2EC4B6" strokeWidth={2} />
            <Text style={styles.distanceText}>
              {hospital.distance.toFixed(1)} km • {hospital.address}
            </Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.cardActionButton}
          onPress={() => onCall(hospital)}
        >
          <Phone size={18} color="#1E88E5" strokeWidth={2} />
          <Text style={styles.cardActionText}>Call</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cardActionButton}
          onPress={() => onDirections(hospital)}
        >
          <ArrowRight size={18} color="#2EC4B6" strokeWidth={2} />
          <Text style={styles.cardActionText}>Directions</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#D9F0ED",
  },
  container: {
    flex: 1,
    backgroundColor: "#D9F0ED",
    width: "100%",
  },
  scrollView: {
    flex: 1,
    width: "100%",
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
    paddingHorizontal: 12,
  },

  // Header
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingTop: 50,
    paddingBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: "rgba(217, 240, 237, 0.85)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(46, 196, 182, 0.1)",
    width: "100%",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1F2937",
    letterSpacing: -0.5,
  },
  searchIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(46, 196, 182, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },

  // Location Pill
  locationPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 20,
    marginBottom: 16,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: "rgba(46, 196, 182, 0.2)",
  },
  locationText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
  },

  // Search Bar
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 26,
    marginBottom: 24,
    marginHorizontal: 0,
    borderWidth: 1,
    borderColor: "rgba(46, 196, 182, 0.2)",
    width: "100%",
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    color: "#1F2937",
  },

  // Sections
  sectionContainer: {
    marginBottom: 24,
    width: "100%",
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 12,
    marginHorizontal: 4,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E88E5",
  },

  // Top Hospitals Carousel
  topHospitalCard: {
    width: 170,
    marginRight: 10,
    marginLeft: 4,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(46, 196, 182, 0.15)",
    shadowColor: "#2EC4B6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  topCardBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "rgba(46, 196, 182, 0.2)",
    borderRadius: 8,
    marginBottom: 10,
  },
  topCardBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#0D9488",
    letterSpacing: 0.5,
  },
  topCardContent: {
    gap: 8,
  },
  topCardName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1F2937",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  ratingStars: {
    flexDirection: "row",
    gap: 2,
  },
  topCardRating: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1F2937",
  },

  // Specialty Filters
  specialtyContainer: {
    marginBottom: 24,
    marginHorizontal: -4,
  },
  specialtyList: {
    gap: 8,
    paddingHorizontal: 4,
  },
  specialtyChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(46, 196, 182, 0.15)",
  },
  specialtyChipActive: {
    backgroundColor: "#1E88E5",
    borderColor: "#1E88E5",
  },
  specialtyChipText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  specialtyChipTextActive: {
    color: "#FFFFFF",
  },

  // Rating Filters
  ratingFilterContainer: {
    marginBottom: 20,
    marginHorizontal: -4,
  },
  ratingFilterList: {
    gap: 8,
    paddingHorizontal: 4,
  },
  ratingChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(46, 196, 182, 0.15)",
  },
  ratingChipActive: {
    backgroundColor: "#0EA5E9",
    borderColor: "#0EA5E9",
  },
  ratingChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
  },
  ratingChipTextActive: {
    color: "#FFFFFF",
  },

  // Hospital List
  hospitalsList: {
    gap: 12,
  },
  // Hospital Card
  hospitalCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 24,
    padding: 14,
    marginHorizontal: 0,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(46, 196, 182, 0.15)",
    shadowColor: "#2EC4B6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  hospitalCardContent: {
    marginBottom: 12,
  },
  hospitalName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
  },
  hospitalRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
  reviewCount: {
    fontSize: 13,
    fontWeight: "400",
    color: "#6B7280",
  },
  distanceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  distanceText: {
    fontSize: 13,
    fontWeight: "400",
    color: "#6B7280",
  },
  cardActions: {
    flexDirection: "row",
    gap: 10,
  },
  cardActionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    backgroundColor: "rgba(30, 136, 229, 0.08)",
    borderRadius: 12,
  },
  cardActionText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1E88E5",
  },

  // Loading & Empty States
  loadingContainer: {
    paddingVertical: 60,
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
  },
  errorContainer: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: "center",
    gap: 12,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  errorSubtext: {
    fontSize: 14,
    fontWeight: "400",
    color: "#6B7280",
    textAlign: "center",
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#E63946",
    borderRadius: 12,
    marginTop: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  emptyState: {
    paddingVertical: 60,
    alignItems: "center",
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  emptySubtext: {
    fontSize: 14,
    fontWeight: "400",
    color: "#6B7280",
    textAlign: "center",
  },

  // Emergency Button
  emergencyButton: {
    position: "absolute",
    bottom: 20,
    left: 12,
    right: 12,
    height: 56,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#E63946",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    width: "auto",
  },
  emergencyGradient: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  emergencyText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },

  // City Selector Modal
  citySelectorOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 998,
  },
  citySelectorContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: "75%",
    paddingBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 15,
    zIndex: 999,
  },
  citySelectorHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  citySelectorTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },
  cityOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F9F9F9",
  },
  cityOptionActive: {
    backgroundColor: "rgba(30, 136, 229, 0.05)",
  },
  cityOptionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    color: "#6B7280",
  },
  cityOptionTextActive: {
    color: "#1E88E5",
    fontWeight: "600",
  },
  cityCheckmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#1E88E5",
    alignItems: "center",
    justifyContent: "center",
  },
  checkmarkText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  // Hospital Details Modal
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 998,
  },
  blurContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  hospitalDetailsContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: "80%",
    paddingBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 15,
    zIndex: 999,
  },
  detailsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  detailsName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },
  detailsMetrics: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
    backgroundColor: "rgba(46, 196, 182, 0.08)",
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
  },
  metricItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  metricText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1F2937",
  },
  detailsSection: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  detailsLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#9CA3AF",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  detailsValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1F2937",
    lineHeight: 20,
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 13,
    fontWeight: "600",
  },
  detailsActions: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    backgroundColor: "rgba(30, 136, 229, 0.08)",
    borderRadius: 12,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E88E5",
  },
});
