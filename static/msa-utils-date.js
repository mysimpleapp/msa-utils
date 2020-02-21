const Min = 60 * 1000
const Hour = 60 * Min
const Day = 24 * Hour
const Month = 30 * Day
const Year = 365 * Day

export function prettyFormatDate(d) {
    const diff = new Date() - d
    if (diff < Min) {
        return "just now"
    } else if (diff < Hour) {
        const m = Math.floor(diff / Min)
        return `${m}m ago`
    } else if (diff < Day) {
        const h = Math.floor(diff / Hour)
        return `${h}h ago`
    } else if (diff < Month) {
        const d = Math.floor(diff / Day)
        return `${d} day(s) ago`
    } else if (diff < Year) {
        const m = Math.floor(diff / Month)
        return `${m} month(s) ago`
    } else {
        const y = Math.floor(diff / Year)
        return `${y} year(s) ago`
    }
}