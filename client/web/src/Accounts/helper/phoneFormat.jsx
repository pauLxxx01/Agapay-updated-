const formatPhilippinePhoneNumber = (phoneNumber) => {
  // Remove non-numeric characters
  const cleanedPhoneNumber = phoneNumber.replace(/\D+/g, "");

  // Check if the phone number has exactly 11 or 12 digits
  if (cleanedPhoneNumber.length !== 11 && cleanedPhoneNumber.length !== 12) {
    return;
  }

  // Check if the phone number starts with "+63" or "0"
  if (cleanedPhoneNumber.startsWith("639")) {
    // Format according to Philippine mobile number standards
    return `+63 ${cleanedPhoneNumber.substring(2, 5)} ${cleanedPhoneNumber.substring(5, 8)} ${cleanedPhoneNumber.substring(8, 12)}`;
  } else if (cleanedPhoneNumber.startsWith("0")) {
    // Format according to Philippine mobile number standards
    return `+63 ${cleanedPhoneNumber.substring(1, 4)} ${cleanedPhoneNumber.substring(4, 7)} ${cleanedPhoneNumber.substring(7, 11)}`;
  } else {
    return;
  }
};

export default formatPhilippinePhoneNumber;