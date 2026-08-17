export function formatDate(date) {
    if (!date) return "N/A";
    const parsedDate = new Date(date)

    if (Number.isNaN(parsedDate.getTime())) return "Invalid Date";

    return parsedDate.toLocaleDateString("en-In", {
        day: "2-digit",
        month: 'short',
        year: 'numeric'
    });
}

export const formatDisasterType = (type) => {
    if (!type) return "Unknown";
    return type.charAt(0).toUpperCase() + type.slice(1);
};

