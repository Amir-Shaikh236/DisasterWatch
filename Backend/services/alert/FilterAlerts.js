import { isNewAlert } from "../redis/cacheServices.js";

const RELEVANT_TYPES = {
    earthquake: ['earthquake', 'seismic'],
    flood: ['flood', 'flash flood', 'river flood', 'urban flood'],
    landslide: ['landslide', 'landslip', 'mudslide', 'avalanche'],
    wildfire: ['wildfire', 'forest fire', 'fire']
};

const severityMap = {
    alert: 'critical',
    red: 'critical',
    orange: 'high',
    yellow: 'medium',
    watch: 'medium'
}

function matchType(disasterType) {
    const typeLower = (disasterType || '').toLowerCase();

    for (const [key, values] of Object.entries(RELEVANT_TYPES)) {
        if (values.some(v => typeLower.includes(v))) return key;
    }

    return null;
}

const normalizeAlert = (rawAlert, category) => {
    const rawSeverity = (rawAlert.severity || '').toLowerCase();
    const severity = severityMap[rawSeverity] || 'medium'

    let longitude = 0;
    let latitude = 0;

    if (rawAlert.centroid && typeof rawAlert.centroid === 'string') {
        const parts = rawAlert.centroid.split(',');

        if (parts.length === 2) {
            longitude = parseFloat(parts[0].trim()) || 0;
            latitude = parseFloat(parts[1].trim()) || 0
        }
    }

    const title = rawAlert.area_description
        ? `${rawAlert.disaster_type || 'Alert'}: ${rawAlert.area_description}`
        : rawAlert.disaster_type || 'Disaster Alert';

    return {
        title,
        disasterType: matchType(rawAlert.disaster_type),
        description: rawAlert.warning_message || "No detailed warning message provided.",
        severity: severity,
        confidence: 90,
        location: {
            type: 'Point',
            coordinates: [longitude, latitude],
            address: rawAlert.area_description
        },
        status: 'Active',
        source: 'social_media',
        sourceCount: 1
    }
}

export const FilterAlerts = async (rawAlerts = []) => {
    if (!Array.isArray(rawAlerts) || rawAlerts.length === 0) return [];

    const matchedAlerts = rawAlerts.map(alert => ({
        raw: alert,
        matchedCategory: matchType(alert.disaster_type)
    }))
        .filter(item => item.matchedCategory !== null)
        .map(item => normalizeAlert(item.raw, item.matchedCategory))

    // const deduplicationResult = await Promise.all(
    //     matchedAlerts.map(async (item) => {
    //         const isNew = await isNewAlert(item.raw.identifier);
    //         return {
    //             ...item,
    //             isNew
    //         }
    //     })
    // );

    // const FormattedAlerts = deduplicationResult.filter(item => item.isNew)
    //     .map(item => normalizeAlert(item.raw, item.matchedCategory));

    // return FormattedAlerts;

    return matchedAlerts;
};

