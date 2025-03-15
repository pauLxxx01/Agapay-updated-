import React, { useContext, useEffect, useState } from "react";
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
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import axios from "axios";
import { useSocket } from "../../context/socketContext";
import { AuthContext } from "../../context/authContext";

const { width, height } = Dimensions.get("window");

const Announcement = ({ navigation }) => {
  const { socket } = useSocket();
  const [state] = useContext(AuthContext);
  const [announcements, setAnnouncements] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredAnnouncements, setFilteredAnnouncements] = useState([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const [pinnedId, setPinnedId] = useState(null); // Tracks the pinned announcement's ID

  const userId = state.user._id;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post("/announcement/user", userId);

        const sortedAnnouncements = sortAnnouncements(
          response.data.announcements
        );
        const visibleAnnouncements = sortedAnnouncements.filter(
          (announcement) =>
            !announcement.isHidden && !announcement.hiddenBy.includes(userId)
        );

        setAnnouncements(visibleAnnouncements);
      } catch (error) {
        console.error("Error fetching announcements:", error);
      }
    };
    fetchData();

    socket.on("announcement", (data) => {
      setAnnouncements((prev) => {
        const existingAnnouncement = prev.find((a) => a._id === data._id);
        if (existingAnnouncement) {
          return prev.map((a) => (a._id === data._id ? { ...a, ...data } : a));
        } else {
          return [...prev, data];
        }
      });
      console.log("Announcement received:", data);
    });

    socket.on("hide-status", (updatedAnnouncement) => {
      setAnnouncements((prev) => {
        if (updatedAnnouncement.hiddenBy.includes(userId)) {
          return prev.filter((a) => a._id !== updatedAnnouncement._id);
        }
        return prev;
      });
    });

    return () => {
      socket.off("hide-status");
      socket.off("announcement");
    };
  }, [socket, userId]);

  const sortAnnouncements = (announcements) => {
    return announcements.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.createdAt) - new Date(a.createdAt); // Most recent first
    });
  };

  const toggleHide = async () => {
    if (!selectedAnnouncement) return;

    try {
      await axios.put(`/announcement/toggle-hide/${selectedAnnouncement._id}`, {
        userId,
      });
      setConfirmDeleteVisible(false);
      setMenuVisible(false);
    } catch (error) {
      console.error("Error toggling hide status:", error);
      Alert.alert("Error", "Failed to toggle announcement visibility.");
      setConfirmDeleteVisible(false);
      setMenuVisible(false);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (!query) {
      setFilteredAnnouncements(announcements);
    } else {
      const filtered = announcements.filter(
        (announcement) =>
          announcement.title.toLowerCase().includes(query.toLowerCase()) ||
          announcement.department.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredAnnouncements(filtered);
    }
  };

  const handlePin = () => {
    const newPinnedId =
      selectedAnnouncement._id === pinnedId ? null : selectedAnnouncement._id;
    setPinnedId(newPinnedId);

    const updatedAnnouncements = announcements.map((announce) => ({
      ...announce,
      pinned: announce._id === newPinnedId,
    }));
    const sortedAnnouncements = sortAnnouncements(updatedAnnouncements);
    setAnnouncements(sortedAnnouncements);
    setFilteredAnnouncements(sortedAnnouncements);
    setMenuVisible(false);
  };

  const openMenu = (item) => {
    setSelectedAnnouncement(item);
    setMenuVisible(true);
  };

  const buttonAlert = () => {
    Alert.alert("Delete Confirmation", "Are you sure you want to delete? ", [
      {
        text: "Cancel",
        onPress: () => setConfirmDeleteVisible(false),
        style: "cancel",
      },
      { text: "Delete", onPress: () => toggleHide() },
    ]);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.announcementCard}
      onPress={() => {
        setSelectedAnnouncement(item);
        setModalVisible(true);
      }}
    >
      <View style={styles.flag} />
      <View style={styles.announcementContent}>
      <Text style={styles.titleText}>{item.title}</Text>
       
        <View style={styles.titleRow}>
        <Text style={styles.departmentText}>{item.department}</Text>
          {item._id === pinnedId && (
            <Icon name="push-pin" size={20} style={styles.pinIcon} />
          )}
        </View>
        <Text style={styles.dateText}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
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
              <Icon name="search" size={18} color="#800000" />
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
                <Icon name="close" size={18} color="#800000" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      <FlatList
        data={
          filteredAnnouncements.length > 0
            ? filteredAnnouncements
            : announcements
        }
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
      />

      {/* Modals */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentContainer} >
            <View style={styles.modalContent}>
              <Text style={styles.modalTopic}>
                {selectedAnnouncement && selectedAnnouncement.topic}
              </Text>

              <Text style={styles.modalDate}>
                {selectedAnnouncement &&
                  new Date(selectedAnnouncement.date).toLocaleDateString(
                    undefined,
                    {
                      weekday: "long", // e.g., "Monday"
                      year: "numeric", // e.g., "2024"
                      month: "long", // e.g., "December"
                      day: "numeric", // e.g., "7"
                    }
                  )}
              </Text>

              <Text style={styles.modalDuration}>
                {selectedAnnouncement && selectedAnnouncement.duration}
              </Text>
              <Text style={styles.modalDepartment}>
                {selectedAnnouncement && selectedAnnouncement.department}
              </Text>
              <ScrollView>
              <Text style={styles.modalMessage}>
                {selectedAnnouncement && selectedAnnouncement.description}
              </Text>
              </ScrollView>
             
            </View>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>


      {/* <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalContentContainer}  contentContainerStyle={styles.centeredContent}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTopic}>
                {selectedAnnouncement && selectedAnnouncement.topic}
              </Text>

              <Text style={styles.modalDate}>
                {selectedAnnouncement &&
                  new Date(selectedAnnouncement.date).toLocaleDateString(
                    undefined,
                    {
                      weekday: "long", // e.g., "Monday"
                      year: "numeric", // e.g., "2024"
                      month: "long", // e.g., "December"
                      day: "numeric", // e.g., "7"
                    }
                  )}
              </Text>

              <Text style={styles.modalDuration}>
                {selectedAnnouncement && selectedAnnouncement.duration}
              </Text>
              <Text style={styles.modalDepartment}>
                {selectedAnnouncement && selectedAnnouncement.department}
              </Text>
              <Text style={styles.modalMessage}>
                {selectedAnnouncement && selectedAnnouncement.description}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal> */}
      <Modal visible={menuVisible} transparent animationType="fade">
        <View style={styles.modalContainerBottom}>
          <View style={styles.modalContentBottom}>
            <TouchableOpacity
              style={styles.modalButtonBottom}
              onPress={buttonAlert}
            >
              <Text style={styles.modalButtonTextBottom}>Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handlePin}
              style={styles.modalButtonBottom}
            >
              {selectedAnnouncement && (
                <Text style={styles.modalButtonTextBottom}>
                  {selectedAnnouncement._id === pinnedId ? "Unpin" : "Pin"}
                </Text>
              )}
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
  modalOverlay: {
display: "flex",
height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContentContainer: {
    padding: 12  ,
    height: "60%",
    justifyContent: "center",
    alignItems: "center",
  },

  modalContent: {
    
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 15,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTopic: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#666",
  },
  modalDepartment: {
    fontSize: 16,
    color: "#666",
    marginBottom: 4,
    fontWeight: "bold",
  },
  modalDate: {
    fontSize: 12,
    color: "#666",
  },
  modalDuration: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  modalMessage: {
    fontSize: 15,
    color: "#666",
  },
  closeButton: {
    backgroundColor: "#dc3545",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
    alignSelf: "flex-end",
    elevation: 2,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",

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
    paddingLeft: width * 0.05,
  },
  searchInput: {
    borderBottomWidth: 1,
    borderBottomColor: "#800000",
    height: 40,
    marginRight: 10,
    flex: 1,
  },
  announcementCard: {
    flexDirection: "row",
    padding: 15,
    marginBottom: 5,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    alignItems: "center",
  },
  flag: {
    width: 5,
    height: "100%",
    backgroundColor: "#800000",
  },
  announcementContent: {
    flex: 1,
    marginLeft: 15,
  },
  departmentText: {
    color: "#555",
    fontSize: 12,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  titleText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  dateText: {
    color: "#aaa",
    fontSize: 12,
  },
  pinIcon: {
    color: "#800000",
  },
  listContent: {
    padding: width * 0.05,
  },

  modalContainerBottom: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  modalContentBottom: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    padding: 20,
  },
  modalButtonBottom: {
    paddingVertical: 15,
    alignItems: "center",
  },
  modalButtonTextBottom: {
    fontSize: 16,
    color: "#800000",
  },
});

export default Announcement;
