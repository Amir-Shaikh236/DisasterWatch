import axios from "axios";
import { getToken } from "../../meta/getToken";

const PAGE_ID = process.env.INSTAGRAM_PAGE_ID
const GRAPH_API_VERSION = "v26.0";

export const PostToIG = async (imageUrl, caption) => {
    try {

        const PAGE_ACCESS_TOKEN = await getToken();

        const responseContainer = await axios.post(`https://graph.facebook.com/${GRAPH_API_VERSION}/${PAGE_ID}/media`,
            {
                image_url: imageUrl,
                caption: caption,
                access_token: PAGE_ACCESS_TOKEN
            }
        );

        const creationId = responseContainer.data.id;

        const response = await axios.post(`https://graph.facebook.com/${GRAPH_API_VERSION}/${PAGE_ID}/media_publish`,
            {
                creation_id: creationId,
                access_token: PAGE_ACCESS_TOKEN
            }
        );

        return {
            id: response.data.id,
            raw: response.data
        }

    } catch (error) {
        console.error('Failed Posting to Instagram: ', error.response?.data || error.message);
        throw error;

    }
}