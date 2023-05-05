
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

function isValidDate(day, month, year) {
    const daysInMonth = [31, (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30 ,31];
    return day <= daysInMonth[month - 1] && day > 0 && month > 0 && month <= 12 && year > 0;
}

function getDayInYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 366 : 365;
}

function getDayOfWeek(dateString) {
    const delimiter = dateString.includes('/') ? '/' : '-';
    const dateArr = dateString.split(delimiter);
    const month = parseInt(dateArr[1], 10);
    var year;
    var day;

    if (dateArr[0].length > 2) {
        year = parseInt(dateArr[0], 10);
        day = parseInt(dateArr[2], 10);
    } else {
        year = parseInt(dateArr[2], 10);
        day = parseInt(dateArr[0], 10);
    }

    /* Validasi */
    if (!isValidDate(day, month, year)) {
        return "Invalid Date";
    }

    const daysInMonth = [31, (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    const daysOfWeek = ["Friday", "Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];
    
    let dayOfYear = day;
    for (let i = 0; i < month - 1; i++) {
        dayOfYear += daysInMonth[i];
    }

    for (let i = 0; i < year; i++) {
        dayOfYear += getDayInYear(i);
    }

    const dayOfWeekIndex = (dayOfYear) % 7;
    
    return daysOfWeek[dayOfWeekIndex];
}
  
// const dateStr = '5/5/2023';
// const dayOfWeek = getDayOfWeek(dateStr);
// console.log(dayOfWeek);

module.exports = { getDayOfWeek, getTodayDate };