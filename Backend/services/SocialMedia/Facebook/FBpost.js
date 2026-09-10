import axios from "axios";

const PAGE_ID = process.env.FACEBOOK_PAGE_ID
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN
const GRAPH_API_VERSION = "v26.0";

export const PostToFB = async (imageUrl, caption) => {
    try {
        const response = await axios.post(`https://graph.facebook.com/${GRAPH_API_VERSION}/${PAGE_ID}/photos`,
            {
                url: imageUrl,
                caption: caption,
                access_token: PAGE_ACCESS_TOKEN
            }
        );

        return {
            id: response.data.post_id || response.data.id,
            raw: response.data
        }

    } catch (error) {
        console.error('Failed Posting to Facebook: ', error.response?.data || error.message);
        throw error;

    }
}