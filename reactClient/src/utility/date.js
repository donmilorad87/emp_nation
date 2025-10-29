export function getFormattedDate() {
    const now = new Date();

    const year = now.getFullYear(); // Get the full year (e.g., 2024)
    const month = (now.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-based, add 1 and pad
    const day = now.getDate().toString().padStart(2, '0'); // Pad day to 2 digits

    return `${year}/${month}/${day}`;
}

export const convertTo12HourFormat = (timeString) => {
    // Split the time string into components
    const [hours, minutes, seconds] = timeString.split(':');

    // Create a Date object with the current date and the specified time
    const date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));
    date.setSeconds(parseInt(seconds, 10));

    // Use Intl.DateTimeFormat to format the date to a 12-hour format
    const options = { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true };
    const formatter = new Intl.DateTimeFormat('en-US', options);

    return formatter.format(date);
}

export const getTimeNow = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const timeString = `${hours}:${minutes}:${seconds}`;
    return (
        <span> {`${hours}:${minutes}`} </span>
    )
}