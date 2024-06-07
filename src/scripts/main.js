/**
 * Dummy function for JSDoc
 */
function dummy() {}

document.addEventListener("DOMContentLoaded", function() {
    const dateElement = document.getElementById('date');

    // Function to update the date continuously
    function updateDate() {
        const currentDate = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const formattedDate = currentDate.toLocaleDateString('en-US', options);
        dateElement.textContent = formattedDate;
    }

    // Update the date immediately when the script is run
    updateDate();

    // Update the date every minute??
    setInterval(updateDate, 60000);
});