import React, { useEffect, useState } from "react";
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
  Button,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import axios from "axios";
import { useSocket } from "../../context/socketContext";
const { width, height } = Dimensions.get("window");

const Announcement = ({ navigation }) => {
  const { socket } = useSocket();

  console.log(socket.connected);
  const [announcements, setAnnouncements] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredAnnouncements, setFilteredAnnouncements] = useState([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);

  const [pinnedId, setPinnedId] = useState(null); // Tracks the pinned announcement's ID

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get("/get-announcement");

        // Sorting the announcements
        const sortedAnnouncements = sortAnnouncements(data.announcements);

        console.log(sortedAnnouncements);

        // Filtering out announcements where isHidden is false
        const visibleAnnouncements = sortedAnnouncements.filter(
          (announcement) => !announcement.isHidden
        );

        // Set announcements in state
        setAnnouncements(visibleAnnouncements);
        setFilteredAnnouncements(visibleAnnouncements);
      } catch (error) {
        console.error("Error fetching announcements:", error);
      }
    };
    fetchData();

    // Real-time updates for hide-status
    socket.on("hide-status", (updatedAnnouncement) => {
      setAnnouncements((prev) => {
        // Map through existing announcements to update the one that matches the _id
        const updatedAnnouncements = prev.map((a) =>
          a._id === updatedAnnouncement._id
            ? { ...a, isHidden: updatedAnnouncement.isHidden }
            : a
        );

        // Ensure not appending the updatedAnnouncement if it already exists in the list
        const isAlreadyPresent = updatedAnnouncements.some(
          (a) => a._id === updatedAnnouncement._id
        );

        if (!isAlreadyPresent) {
          updatedAnnouncements.push(updatedAnnouncement);
        }

        return updatedAnnouncements;
      });
    });

    socket.on("announcement", (data) => {
      // Check if the announcement already exists
      setAnnouncements((prev) => {
        const existingAnnouncement = prev.find((a) => a._id === data._id);
        if (existingAnnouncement) {
          // Update the existing announcement
          return prev.map((a) =>
            a._id === data._id ? { ...a, isHidden: data.isHidden } : a
          );
        } else {
          // Append the new announcement
          return [...prev, data];
        }
      });
      console.log("Announcement received:", data);
    });

    return () => {
      socket.off("hide-status");
      socket.off("announcemnt");
    };
  }, [socket]);

  useEffect(() => {
    // Filter announcements to only show those that are not hidden
    const visibleAnnouncements = announcements.filter(
      (announcement) => !announcement.isHidden
    );
    setFilteredAnnouncements(visibleAnnouncements);
  }, [announcements]);

  // useEffect(() => {
  //   socket.on("hide-status", (updatedAnnouncement) => {
  //     setAnnouncements((prev) =>
  //       prev.map((a) =>
  //         a._id === updatedAnnouncement._id
  //           ? { ...a, isHidden: updatedAnnouncement.isHidden }
  //           : a
  //       )
  //     );
  //   });

  //   return () => {
  //     socket.off("hide-status");
  //   };
  // }, []);

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
      const { data } = await axios.put(
        `/announcement/toggle-hide/${selectedAnnouncement._id}`
      );
      console.log(
        `Announcement toggle data: ${data.announcement._id}, isHidden: ${data.announcement.isHidden}`
      );

      // Real-time updates for hide-status
      socket.on("hide-status", (updatedAnnouncement) => {
        setAnnouncements((prev) => {
          //matches the _id
          const updatedAnnouncements = prev.map((a) =>
            a._id === updatedAnnouncement._id
              ? { ...a, isHidden: updatedAnnouncement.isHidden }
              : a
          );
          // Ensure not appending the updatedAnnouncement if it already exists in the list
          const isAlreadyPresent = updatedAnnouncements.some(
            (a) => a._id === updatedAnnouncement._id
          );

          if (!isAlreadyPresent) {
            updatedAnnouncements.push(updatedAnnouncement);
          }
          return updatedAnnouncements;
        });
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
        <Text style={styles.departmentText}>{item.department}</Text>
        <View style={styles.titleRow}>
          <Text style={styles.titleText}>{item.title}</Text>
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
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
      />

      {/* Modals */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTopic}>
              {selectedAnnouncement && selectedAnnouncement.topic}
            </Text>
            <Text style={styles.modalDepartment}>
              {selectedAnnouncement && selectedAnnouncement.department}
            </Text>
            <Text style={styles.modalDate}>
              When:{" "}
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
              Duration: {selectedAnnouncement && selectedAnnouncement.duration}
            </Text>
            <Text style={styles.modalMessage}>
              {selectedAnnouncement && selectedAnnouncement.description}
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
                  {" "}
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
    paddingLeft: width * 0.05,
  },
  searchInput: {
    flex: 1,
    borderRadius: 10,
  },
  listContent: {
    padding: width * 0.05,
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
    height: "100%",
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
    color: "#F7B32D",
    position: "absolute",
    top: height * -0.08,
    left: width * 0.6,
    backgroundColor: "maroon",
    borderRadius: 100,
    padding: 4,
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
  },
  modalDate: {
    fontSize: width * 0.045,
    marginBottom: height * 0.01,
  },
  modalDepartment: {
    marginBottom: height * 0.03,
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
    padding: height * 0.01,
    backgroundColor: "#800000",
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
    marginVertical: height * 0.004,
  },
  modalButtonTextBottom: {
    color: "#fff",
    textAlign: "center",
    fontSize: width * 0.045,
    fontWeight: "bold",
    width: "100%",
  },
});
export default Announcement;
