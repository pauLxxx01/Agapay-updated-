//for modal

export const emergencyType = [
  { type: "Fire", key: "fire", label: "Fire Emergency" },
  { type: "Natural", key: "natural", label: "Natural Hazard" },
  { type: "Biological", key: "biological", label: "Biological Hazard" },
  { type: "Medical", key: "medical", label: "Medical Assistance" },
  { type: "Facility", key: "facility", label: "Facility Failure" },
  { type: "Crime", key: "crime", label: "Crime & Violence" },
];

export const headerTableCompleted = [
  {
    id: 0,
    KEY: "number",
    Label: "#",
  },
  {
    id: 1,
    KEY: "name",
    Label: "NAME",
  },
  {
    id: 2,
    KEY: "account_id",
    Label: "USER ID",
  },
  {
    id: 3,
    KEY: "department",
    Label: "DEPARTMENT",
  },
  {
    id: 4,
    KEY: "emergency",
    Label: "EMERGENCY",
  },
  {
    id: 5,
    KEY: "createdAt",
    Label: "DATE",
  },
  {
    id: 6,
    KEY: "respond",
    Label: "STATUS",
  },
];
export const headerTableModal = [
  {
    id: 1,
    KEY: "name",
    Label: "NAME",
  },
  {
    id: 2,
    KEY: "account_id",
    Label: "USER ID",
  },
  {
    id: 3,
    KEY: "department",
    Label: "DEPARTMENT",
  },
  {
    id: 4,
    KEY: "createdAt",
    Label: "DATE",
  },
  {
    id: 5,
    KEY: "respond",
    Label: "STATUS",
  },
];

export const headerTableReport = [
  {
    id: 1,
    KEY: "NAME",
    Label: "NAME",
  },
  {
    id: 2,
    KEY: "ID",
    Label: "USER ID",
  },
  {
    id: 3,
    KEY: "DEPARTMENT",
    Label: "DEPARTMENT",
  },
  {
    id: 4,
    KEY: "PARENTSNUM",
    Label: "PARENT'S NUMBER",
  },

  {
    id: 6,
    KEY: "RESPONSE",
    Label: "RESPONSE DATE",
  },
];

export const headerTableGeneral = [
  { KEY: "number", Label: "#" },
  {
    KEY: "name",
    Label: "NAME",
  },
  {
    KEY: "account_id",
    Label: "USER ID",
  },
  {
    KEY: "department",
    Label: "DEPARTMENT",
  },
  {
    KEY: "emergency",
    Label: "EMERGENCY",
  },
  {
    KEY: "createdAt",
    Label: "DATE",
  },
  {
    KEY: "respond",
    Label: "STATUS",
  },
  {
    KEY: "action",
    Label: "ACTION",
  },
];

export const headerTableAnnounce = [
  {
    id: 1,
    KEY: "title",
    Label: "TITLE",
  },
  {
    id: 2,
    KEY: "Topic",
    Label: "TOPIC",
  },
  {
    id: 3,
    KEY: "createdAt",
    Label: "ANNOUNCE CREATED",
  },
  {
    id: 4,
    KEY: "Action",
    Label: "ACTION",
  },
];

//responder - register
export const responsibilities = [
  {
    title: " Information & Communications Technology Department",
    description: "<Link for department>",
  },
  {
    title: "Health and Safety Office",
    description: "<Link for department>",
  },
  {
    title: "Admission Office",
    description: "<Link for department>",
  },
  {
    title: "Community Relations Department",
    description: "<Link for department>",
  },
  {
    title: "Corporate Planning and Development Office",
    description: "<Link for department>",
  },
  {
    title: "Data Protection Office",
    description: "<Link for department>",
  },
  {
    title: "General Services Department",
    description: "<Link for department>",
  },
  {
    title: "Medical and Dental Services",
    description: "<Link for department>",
  },
  {
    title: "Human Resource Department",
    description: "<Link for department>",
  },
];

export const responderTable = [
  {
    id: 0,
    KEY: "number",
    Label: "#",
  },
  {
    id: 1,
    KEY: "name",
    Label: "NAME",
  },
  {
    id: 2,
    KEY: "account_id",
    Label: "Account ID",
  },
  {
    id: 3,
    KEY: "university_office",
    Label: "University Office",
  },
  {
    id: 4,
    KEY: "emergency_role",
    Label: "Emergency Role",
  },
 
];

export const accountsHeaderTable = [
  { id: 1, KEY: "number", Label: "#" },
  {
    id: 2,
    KEY: "name",
    Label: "NAME",
  },
  {
    id: 3,
    KEY: "account_id",
    Label: "USER ID",
  },
  {
    id: 4,
    KEY: "department",
    Label: "DEPARTMENT",
  },

  {
    id: 5,
    KEY: "degree",
    Label: "COURSE",
  },
 
];

export const announcementHeaderTable = [
  { id: 1, KEY: "number", Label: "#" },
  {
    id: 2,
    KEY: "title",
    Label: "TITLE",

  },
  {
    id: 3,
    KEY: "topic",
    Label: "TOPIC",
  },
  {
    id: 4,
    KEY: "date",
    Label: "DATE",
  },
  {
    id: 5,
    KEY: "action",
    Label: "ACTION",
  }
]