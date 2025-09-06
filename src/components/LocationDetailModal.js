import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Dimensions,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

const { width, height } = Dimensions.get("window");

const LocationDetailModal = ({
  visible,
  onClose,
  locationData,
  incidents = [],
  onIncidentPress,
}) => {
  if (!locationData) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getIncidentTypeLabel = (type) => {
    const labels = {
      snake_bite: "Snake Bite",
      fire_attack: "Fire Attack",
      pickpocketing: "Pickpocketing",
      theft: "Theft",
      assault: "Assault",
      harassment: "Harassment",
      vandalism: "Vandalism",
      medical: "Medical Emergency",
      other: "Other",
    };
    return labels[type] || type;
  };

  const getIncidentIcon = (type) => {
    const icons = {
      snake_bite: "medical",
      fire_attack: "flame",
      pickpocketing: "hand-left",
      theft: "bag-handle",
      assault: "warning",
      harassment: "person-remove",
      vandalism: "construct",
      medical: "medical",
      other: "help-circle",
    };
    return icons[type] || "help-circle";
  };

  const getStatusColor = (status) => {
    const colors = {
      reported: "#FF9800",
      investigating: "#2196F3",
      resolved: "#4CAF50",
      closed: "#9E9E9E",
    };
    return colors[status] || "#FF9800";
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Location Details</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent}>
            {/* Location Info */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                <Icon name="location" size={16} color="#239DD6" /> Location
                Information
              </Text>
              <View style={styles.locationInfo}>
                <Text style={styles.locationText}>
                  {locationData.location_description ||
                    "Location not specified"}
                </Text>
                <Text style={styles.coordinatesText}>
                  {locationData.latitude?.toFixed(6)},{" "}
                  {locationData.longitude?.toFixed(6)}
                </Text>
              </View>
            </View>

            {/* Incident Summary */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                <Icon name="alert-circle" size={16} color="#239DD6" /> Incident
                Summary
              </Text>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryText}>
                  {incidents.length} incident{incidents.length !== 1 ? "s" : ""}{" "}
                  reported at this location
                </Text>
                <Text style={styles.summarySubtext}>
                  Last reported:{" "}
                  {incidents.length > 0
                    ? formatDate(incidents[0].reported_at)
                    : "No incidents"}
                </Text>
              </View>
            </View>

            {/* Recent Incidents */}
            {incidents.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  <Icon name="list" size={16} color="#239DD6" /> Recent
                  Incidents
                </Text>
                {incidents.slice(0, 5).map((incident, index) => (
                  <TouchableOpacity
                    key={incident.id || index}
                    style={styles.incidentCard}
                    onPress={() => onIncidentPress && onIncidentPress(incident)}
                  >
                    <View style={styles.incidentHeader}>
                      <View style={styles.incidentTypeContainer}>
                        <Icon
                          name={getIncidentIcon(incident.incident_type)}
                          size={16}
                          color="#239DD6"
                        />
                        <Text style={styles.incidentType}>
                          {getIncidentTypeLabel(incident.incident_type)}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.statusBadge,
                          { backgroundColor: getStatusColor(incident.status) },
                        ]}
                      >
                        <Text style={styles.statusText}>{incident.status}</Text>
                      </View>
                    </View>

                    <Text style={styles.incidentDescription} numberOfLines={2}>
                      {incident.description || "No description provided"}
                    </Text>

                    <View style={styles.incidentFooter}>
                      <Text style={styles.incidentDate}>
                        {formatDate(incident.reported_at)}
                      </Text>
                      {incident.assigned_to && (
                        <Text style={styles.assignedText}>
                          Assigned to: {incident.assigned_to}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}

                {incidents.length > 5 && (
                  <Text style={styles.moreText}>
                    +{incidents.length - 5} more incidents at this location
                  </Text>
                )}
              </View>
            )}

            {/* Safety Tips */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                <Icon name="shield-checkmark" size={16} color="#239DD6" />{" "}
                Safety Tips
              </Text>
              <View style={styles.safetyTips}>
                <Text style={styles.safetyTip}>
                  • Stay alert and aware of your surroundings
                </Text>
                <Text style={styles.safetyTip}>
                  • Report suspicious activities immediately
                </Text>
                <Text style={styles.safetyTip}>
                  • Use well-lit paths, especially at night
                </Text>
                <Text style={styles.safetyTip}>
                  • Keep emergency contacts readily available
                </Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.8,
    minHeight: height * 0.4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "Montserrat-Bold",
    color: "#333",
  },
  closeButton: {
    padding: 5,
  },
  scrollContent: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Montserrat-Bold",
    color: "#333",
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  locationInfo: {
    backgroundColor: "#F8F9FA",
    padding: 15,
    borderRadius: 10,
  },
  locationText: {
    fontSize: 14,
    fontFamily: "Montserrat-Regular",
    color: "#333",
    marginBottom: 5,
  },
  coordinatesText: {
    fontSize: 12,
    fontFamily: "Montserrat-Regular",
    color: "#666",
  },
  summaryCard: {
    backgroundColor: "#E3F2FD",
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#239DD6",
  },
  summaryText: {
    fontSize: 14,
    fontFamily: "Montserrat-Bold",
    color: "#333",
  },
  summarySubtext: {
    fontSize: 12,
    fontFamily: "Montserrat-Regular",
    color: "#666",
    marginTop: 5,
  },
  incidentCard: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  incidentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  incidentTypeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  incidentType: {
    fontSize: 14,
    fontFamily: "Montserrat-Bold",
    color: "#333",
    marginLeft: 5,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontFamily: "Montserrat-Bold",
    color: "white",
    textTransform: "uppercase",
  },
  incidentDescription: {
    fontSize: 13,
    fontFamily: "Montserrat-Regular",
    color: "#666",
    marginBottom: 8,
  },
  incidentFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  incidentDate: {
    fontSize: 11,
    fontFamily: "Montserrat-Regular",
    color: "#999",
  },
  assignedText: {
    fontSize: 11,
    fontFamily: "Montserrat-Regular",
    color: "#239DD6",
  },
  moreText: {
    fontSize: 12,
    fontFamily: "Montserrat-Regular",
    color: "#239DD6",
    textAlign: "center",
    fontStyle: "italic",
  },
  safetyTips: {
    backgroundColor: "#F0F8FF",
    padding: 15,
    borderRadius: 10,
  },
  safetyTip: {
    fontSize: 13,
    fontFamily: "Montserrat-Regular",
    color: "#333",
    marginBottom: 5,
  },
});

export default LocationDetailModal;
