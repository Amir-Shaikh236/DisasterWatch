import MetaToken from "../../models/MetaToken";
import AppError from "../../utils/AppError";

let cachedToken = null;
let cacheExpiry = 0

export async function getToken() {
    const now = new Date.now();
    if (cachedToken && cacheExpiry > now) return cachedToken;

    const tokenDoc = await MetaToken.findOne({ platform: 'meta_page' });
    if (!tokenDoc) throw new AppError(404, 'Meta Token Not Found in DB - running initial setup..');

    cachedToken = tokenDoc.accessToken;
    cacheExpiry = now + 5 * 60 * 1000

    return cachedToken;
}

