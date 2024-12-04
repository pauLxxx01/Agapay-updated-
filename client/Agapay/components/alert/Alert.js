
import { Alert } from "react-native";

export const createTwoButtonAlert = (title, message, navigation, location) => {
  const handleCancel = () => console.log("Cancel Pressed");
  const handleOk = () => navigation.navigate(location);

  Alert.alert(title, message, [
    {
      text: "Cancel",
      onPress: handleCancel,
      style: "cancel",
    },
    {
      text: "OK",
      onPress: handleOk,
    },
  ]);
};


