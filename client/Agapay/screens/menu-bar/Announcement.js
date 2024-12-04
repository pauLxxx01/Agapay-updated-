import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  Dimensions,
  SafeAreaView,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

const { width, height } = Dimensions.get("window");

const initialAnnouncements = [
  {
    id: "1",
    title: "Earthquake Drill",
    department: "Health and Safety Office",
    date: "May 9 2024",
    pinned: false,
  },
  {
    id: "2",
    title: "Fire Drill",
    department: "Health and Safety Office",
    date: "March 3 2024",
    pinned: false,
  },
];

const details = [
  {
    id: "1",
    topic: "Earthquake Drill Announcement:",
    date: "May 12, 2024",
    duration: "1:00 PM - 4:00 PM",
    message:
      "Attention all AGAPAY users, In preparation for ensuring our community safety during seismic events, we are conducting an Earthquake Drill on May 12, 2024, between 1:00 PM and 4:00 PM. This drill is crucial for practicing emergency response procedures and enhancing our readiness for real-life earthquake scenarios",
  },
  {
    id: "2",
    topic: "Fire Drill Announcement:",
    date: "March 3, 2024",
    duration: "10:00 AM - 11:00 AM",
    message:
      "Attention all AGAPAY users, A fire drill will be conducted on March 3, 2024, from 10:00 AM to 11:00 AM. This drill is an important part of ensuring the safety of our community. Please cooperate and participate in the drill by following the instructions of our safety personnel. The drill will include evacuation procedures and familiarization with emergency exits.",
  },
];

const Announcement = ({ navigation }) => {
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredAnnouncements, setFilteredAnnouncements] =
    useState(initialAnnouncements);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const sortAnnouncements = (announcements) => {
    return announcements.sort(
      (a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0)
    );
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query === "") {
      setFilteredAnnouncements(announcements);
    } else {
      const filtered = announcements.filter((item) =>
        item.title.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredAnnouncements(filtered);
    }
  };

  const handlePress = (item) => {
    setSelectedAnnouncement(item);
    const detail = details.find((detail) => detail.id === item.id);
    setSelectedDetail(detail);
    setModalVisible(true);
  };

  const openMenu = (item) => {
    setSelectedAnnouncement(item);
    setMenuVisible(true);
  };

  const handleDelete = () => {
    const updatedAnnouncements = announcements.filter(
      (a) => a.id !== selectedAnnouncement.id
    );
    const sortedAnnouncements = sortAnnouncements(updatedAnnouncements);
    setAnnouncements(sortedAnnouncements);
    setFilteredAnnouncements(sortedAnnouncements);
    setMenuVisible(false);
  };

  const handlePin = () => {
    let updatedAnnouncements = announcements.map((a) =>
      a.id === selectedAnnouncement.id ? { ...a, pinned: !a.pinned } : a
    );

    if (selectedAnnouncement.pinned === false) {
      updatedAnnouncements = updatedAnnouncements.map((a) =>
        a.id !== selectedAnnouncement.id ? { ...a, pinned: false } : a
      );
    }

    const sortedAnnouncements = sortAnnouncements(updatedAnnouncements);
    setAnnouncements(sortedAnnouncements);
    setFilteredAnnouncements(sortedAnnouncements);
    setMenuVisible(false);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.announcementCard}
      onPress={() => handlePress(item)}
    >
      <View style={styles.flag} />
      <View style={styles.announcementContent}>
        <Text style={styles.departmentText}>{item.department}</Text>
        <View style={styles.titleRow}>
          <Text style={styles.titleText}>{item.title}</Text>
          {item.pinned && (
            <Icon
              name="push-pin"
              size={20}
              color="#800000"
              style={styles.pinIcon}
            />
          )}
        </View>
        <Text style={styles.dateText}>{item.date}</Text>
      </View>
      <TouchableOpacity onPress={() => openMenu(item)}>
        <Icon name="more-vert" size={24} color="#800000" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerIcons}>
          {!searchVisible && (
            <TouchableOpacity
              onPress={() => {
                setSearchVisible(true);
              }}
            >
              <Icon name="search" size={24} color="#800000" />
            </TouchableOpacity>
          )}
          {searchVisible && (
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search"
                value={searchQuery}
                onChangeText={handleSearch}
              />
              <TouchableOpacity
                onPress={() => {
                  setFilteredAnnouncements(announcements);
                  setSearchQuery("");
                  setSearchVisible(false);
                }}
              >
                <Icon name="close" size={24} color="#800000" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      <FlatList
        data={filteredAnnouncements}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
      />

      {/* Modals */}
      <Modal visible={modalVisible} transparent animationType="">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTopic}>
              {selectedDetail && selectedDetail.topic}
            </Text>
            <Text style={styles.modalDate}>
              Date: {selectedDetail && selectedDetail.date}
            </Text>
            <Text style={styles.modalDuration}>
              Duration: {selectedDetail && selectedDetail.duration}
            </Text>
            <Text style={styles.modalMessage}>
              {selectedDetail && selectedDetail.message}
            </Text>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={menuVisible} transparent animationType="">
        <View style={styles.modalContainerBottom}>
          <View style={styles.modalContentBottom}>
            <TouchableOpacity
              onPress={handleDelete}
              style={styles.modalButtonBottom}
            >
              <Text style={styles.modalButtonTextBottom}>Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handlePin}
              style={styles.modalButtonBottom}
            >
              <Text style={styles.modalButtonTextBottom}>
                {selectedAnnouncement?.pinned ? "Unpin" : "Pin"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setMenuVisible(false)}
              style={styles.modalButtonBottom}
            >
              <Text style={styles.modalButtonTextBottom}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: width * 0.04,
    height: height * 0.12,
  },
  headerText: {
    fontSize: width * 0.05,
    fontWeight: "bold",
    color: "#800000",
  },
  headerIcons: {
    flexDirection: "row",
    backgroundColor: "#F0F0F0",
    padding: 8,
    borderRadius: 50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F0F0",
    borderRadius: 10,
    paddingLeft: 10,
  },
  searchInput: {
    flex: 1,
    borderRadius: 10,
  },
  listContent: {
    padding: width * 0.04,
  },
  announcementCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#F6F6F6",
    borderRadius: 10,
    marginVertical: height * 0.01,
    padding: width * 0.04,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  flag: {
    width: width * 0.04,
    height: height * 0.05,
    backgroundColor: "#800000",
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    marginRight: width * 0.04,
  },
  announcementContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  departmentText: {
    color: "#444",
    fontSize: width * 0.045,
  },
  titleText: {
    fontSize: width * 0.05,
    fontWeight: "bold",
    color: "#000",
    marginRight: width * 0.02,
  },
  dateText: {
    fontSize: width * 0.04,
    color: "#888",
    marginTop: height * 0.005,
  },
  pinIcon: {
    marginLeft: width * 0.02,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: width * 0.05,
    borderRadius: 10,
    width: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  modalTopic: {
    fontSize: width * 0.06,
    fontWeight: "bold",
    marginBottom: height * 0.02,
  },
  modalDate: {
    fontSize: width * 0.045,
    marginBottom: height * 0.01,
  },
  modalDuration: {
    fontSize: width * 0.045,
    marginBottom: height * 0.02,
  },
  modalMessage: {
    fontSize: width * 0.045,
    marginBottom: height * 0.02,
  },
  closeButton: {
    paddingVertical: height * 0.015,
    paddingHorizontal: width * 0.1,
    backgroundColor: "#800000",
    borderRadius: 20,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#fff",
    fontSize: width * 0.045,
  },
  modalButton: {
    flex: 1,
    paddingVertical: height * 0.01,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 10,
  },
  modalButtonText: {
    fontSize: width * 0.045,
    marginBottom: height * 0.03,
    textAlign: "center",
  },
  modalContainerBottom: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  modalContentBottom: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
  },
  modalButtonBottom: {
    width: "95%",
    paddingVertical: height * 0.01,
    backgroundColor: "#800000",
    borderRadius: 10,
    alignItems: "center",
    marginVertical: height * 0.004,
    width: "70%",
  },
  modalButtonTextBottom: {
    color: "#fff",
    fontSize: width * 0.045,
    fontWeight: "bold",
  },
});
export default Announcement;
