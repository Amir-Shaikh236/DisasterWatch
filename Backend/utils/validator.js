import AppError from "./AppError.js";

export const ValidateLocation = (location) => {
    if (!Array.isArray(location.coordinates) || location.coordinates.length !== 2) {
        throw new AppError(400, 'Coordinates must be an array of [Longitude, latitude].');
    }

    const [lng, lat] = location.coordinates.map(Number);

    if (Number.isNaN(lng) || Number.isNaN(lat)) {
        throw new AppError(400, 'Coordinates must contain valid numbers');
    }

    if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
        throw new AppError(400, 'Coordinates out of valid range');
    }

    return { lng, lat };
}

export const ValidateRequiredFields = (fields) => {
    const missingFields = Object.entries(fields)
        .filter(([_, value]) => value === undefined || value === null || value === '')
        .map(([key]) => key);

    if (missingFields.length > 0) {
        throw new AppError(400, `Please proivde: ${missingFields.join(', ')}`);
    }
}

export const convertImages = (images) => {
    if (!Array.isArray(images) || images.length === 0) return [];

    return images.map((image) => ({
        mimeType: image.mimetype,
        base64: image.buffer.toString('base64')
    }));
}