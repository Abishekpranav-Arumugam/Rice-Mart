// Function to format the date
const formatDate = (date) => {
    return new Date(date).toLocaleDateString(); // Return formatted date
  };
  
  module.exports = { formatDate };
  