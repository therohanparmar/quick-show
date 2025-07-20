const isoTimeFormat = (dateTime) => {
    const date = new Date(
        new Date(dateTime).getTime() - (5.5 * 60 * 60 * 1000)
    );
    const localTime = date.toLocaleTimeString(
        'en-US',
        {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
            timeZone: 'Asia/Kolkata'
        }
    );
    return localTime;
}

export default isoTimeFormat;