const menuItems = [
  { toNavigate: "Transaction", name: "history", text: "Transaction" },
  { toNavigate: "Announcement", name: "bullhorn", text: "Announcement" },
  { toNavigate: "UpdateInfo", name: "refresh", text: "Update Information" },
  { toNavigate: "Feedback", name: "star", text: "Feedback" },
  { toNavigate: "About", name: "info-circle", text: "About the application" },
];

const infoCardData = [
  {
    title: "STAY INFORMED",
    source: require("../assets/home-page-icon/stayinformed.png"),
    description:
      "Keep yourself updated on potential hazards or emergencies that could affect your area.",
  },
  {
    title: "PRACTICE DRILLS",
    source: require("../assets/home-page-icon/evacuation.png"),
    description:
      "Familiarize yourself with evacuation routes and practice using them.",
  },
  {
    title: "ALERT OTHERS",
    source: require("../assets/home-page-icon/alertothers.png"),
    description:
      "If you discover a fire, immediately sound the alarm by shouting or activating the nearest fire alarm.",
  },
  {
    title: "ASSIST OTHERS",
    source: require("../assets/home-page-icon/assistothers.png"),
    description:
      "Help others evacuate safely, especially those who may need assistance.",
  },
];

const emergencies = [
  {
    id: "1",
    type: "Fire Emergency",
    img: require("../assets/emergencies/maroon/maroonfire.png"),
    title: "FIRE\nEMERGENCY",
    reminder: {
      text1: "1. Check for safe space to evacuate",
      text2:
        "2. Cover your nose with a damp piece of fabric to avoid suffocation",
      text3: "3. Stay calm and maintain a safe distance from the fire",
      text4: "4. Do Not Panic!",
    },
  },
  {
    id: "2",
    type: "Medical Assistance",
    img: require("../assets/emergencies/maroon/maroonmedical.png"),
    title: "MEDICAL\nASSISTANCE",
    reminder: {
      text1: "1. Perform right first aid to MINIMAL damage",
      text2: "2. Call for help and check responsive",
      text3: "3. Maintain an open airway",
      text4: "4. Do Not Panic!",
    },
  },
  {
    id: "3",
    type: "Utility Failure",
    img: require("../assets/emergencies/maroon/maroonfacility.png"),
    title: "UTILITY\nFAILURE",
    reminder: {
      text1: "1. Avoid touching unfamiliar things",
      text2: "2. Do not try to fix things you are unsure of",
      text3: "3. Get away from the possible hazards",
      text4: "4. Do Not Panic!",
    },
  },
  {
    id: "4",
    type: "Crime & Violence",
    img: require("../assets/emergencies/maroon/maroonviolence.png"),
    title: "CRIME &\nVIOLENCE",
    reminder: {
      text1: "1. Stay Calm and Assess the Situation",
      text2: "2. Remove Yourself from Danger",
      text3: "3. Avoid Drawing Attention",
      text4: "4. Do Not Panic!",
    },
  },
  {
    id: "5",
    type: "Natural Hazard",
    img: require("../assets/emergencies/maroon/maroonnatural.png"),
    title: "NATURAL\nHAZARD",
    reminder: {
      text1: "1. Stay Informed",
      text2: "2. Stay Calm",
      text3: "3. Check the sorroundings and avoid the possible hazards",
      text4: "4. Do Not Panic!",
    },
  },
  {
    id: "6",
    type: "Biological Hazard",
    img: require("../assets/emergencies/maroon/maroonbiological.png"),
    title: "BIOLOGICAL\nHAZARD",
    reminder: {
      text1: "1. Stay Informed",
      text2: "2. Stay Calm",
      text3: "3. Check the sorroundings and avoid the possible hazards",
      text4: "4. Do Not Panic!",
    },
  },
];

const progressReportInformation = [
  {
    id: "1",
    percentage: "10",
    message: "SOS alert has been successfully sent.",
  },
  {
    id: "2",
    percentage: "40",
    message: "SOS alert has been received by the Admin.",
  },
  {
    id: "3",
    percentage: "65",
    message: "Please stand by and admin will call you immediately.",
  },
  {
    id: "4",
    percentage: "85",
    message: "The responder will go there as soon as possible.",
  },
  {
    id: "5",
    percentage: "95",
    message: "Admin will call you again soon",
  },
  {
    id: "6",
    percentage: "100",
    message: "The SOS report has been successfully completed.",
  },
];

const options = [
  { label: "CCMS BUILDING", value: "CCMS BUILDING" },
  { label: "CENG BUILDING", value: "CENG BUILDING" },
  { label: "CAFA BUILDING", value: "CAFA BUILDING" },
  { label: "CIHTM BUILDING", value: "CIHTM BUILDING" },
  { label: "ABM BUILDING", value: "ABM BUILDING" },
  { label: "CE BUILDING", value: "CE BUILDING" },
  { label: "CAS BUILDING", value: "CAS BUILDING" },
  { label: "CBA BUILDING", value: "CBA BUILDING" },
  { label: "CCJC BUILDING", value: "CCJC BUILDING" },
  { label: "CME BUILDING", value: "CME BUILDING" },
  { label: "CNAHS BUILDING", value: "CNAHS BUILDING" },
  { label: "BEd BUILDING", value: "BEd BUILDING" },
  { label: "SHS BUILDING", value: "SHS BUILDING" },
];

export {
  menuItems,
  emergencies,
  infoCardData,
  options,
  progressReportInformation,
};
