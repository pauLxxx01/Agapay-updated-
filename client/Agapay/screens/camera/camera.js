import { CameraView, useCameraPermissions } from "expo-camera";
import { useState, useRef, useEffect } from "react";
import {
  Button,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import * as MediaLibrary from "expo-media-library";

import { 
  getFullScreenHeight,
  statusBarSize,
} from "../../components/getFullScreen";

const Camera = ({ navigation, route }) => {
  const { name, img, photoUri, ...reminder } = route.params;

  const [facing, setFacing] = useState("back");
  const [flash, setFlash] = useState("off");
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const cameraRef = useRef(null);

  useEffect(() => {
    (async () => {
      if (!permission) {
        await requestPermission();
      }
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        alert("Sorry, we need camera roll permissions to make this work!");
      }
    })();
  }, [permission]);

  if (!permission || !permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: "center" }}>
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({});

      if (photo) {
        await MediaLibrary.saveToLibraryAsync(photo.uri);
        console.log("Image saved to camera roll!");
        const filename = photo.uri.split('/').pop();
        console.log("Filename: ", filename)
      }
      setCapturedPhoto(photo.uri);
      navigation.navigate("Progress", { photoUri: photo.uri, name, img, ...reminder }); // Navigate back and pass photo URI
    }
  };

  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  const toggleFlash = () => {
    setFlash((current) => (current === "off" ? "on" : "off"));
  };

  return (
    <View style={styles.container}>
      {!capturedPhoto ? (
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing={facing}
          flash={flash}
        />
      ) : (
        <View style={styles.previewContainer}>
          <Image source={{ uri: capturedPhoto }} style={styles.previewImage} />
          <View style={styles.overlay}>
            <TouchableOpacity
              style={styles.buttonAction}
              onPress={() => setCapturedPhoto(null)}
            >
              <Icon name="refresh" size={24} color="#fff" />
              <Text style={styles.buttonText}>Re-take</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.buttonAction}
              onPress={() => {
                /* save logic here */
              }}
            >
              <Icon name="save" size={24} color="#fff" />
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {!capturedPhoto && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
            <Icon name="camera" size={60} color="white" />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.flashContainer}>
        <TouchableOpacity onPress={toggleFlash}>
          <Icon
            name={flash === "off" ? "flash-off" : "flash"}
            size={30}
            color="white"
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.flipButton}
          onPress={toggleCameraFacing}
        >
          <Icon name="camera-reverse" size={30} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "flex-end",
    position: "relative",
    alignItems: "center",
  },
  camera: {
    flex: 1,
    width: "100%",
    justifyContent: "flex-end",
  },
  flashContainer: {
    position: "absolute",
    top: statusBarSize(),
    right: 20,
    gap: 22,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 10,
  },
  flipButton: {},
  captureButton: {
    bottom: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  previewContainer: {
    position: "absolute",
    top: "20%",
    left: "50%",
    transform: [{ translateX: -150 }],
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 10,
    borderRadius: 10,
  },
  previewImage: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  overlay: {
    position: "absolute",
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-evenly",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingVertical: 10,
  },
  buttonAction: {
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    marginTop: 5,
  },
});
export default Camera;
