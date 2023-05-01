
function getTodayDate() {
    const date = new Date();
    const day = date.toLocaleString('default', { weekday: 'long' });
    const formattedDate = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    return { day, date: formattedDate };
}

function getDayFromDate(dateString) {
    const date = new Date(dateString);
    const day = date.toLocaleString('default', { weekday: 'long' });
    return day;
}
