import {createOptions, httpGet} from "@app/utils";

async function fetchUrlContent(url: string): Promise<string> {
    console.info("[UrlService] Fetching content from a URL: ", url);

    let endpoint: string = url;
    const options: any = createOptions({
        "Accept": "*"
    });
    options.maxContentLength = "5242880"; // TODO 5MB hard-coded, make this configurable?
    options.responseType = "text";
    options.transformResponse = (data: any) => data;
    return httpGet<string>(endpoint, options);
}


/**
 * The URL Service interface.
 */
export interface UrlService {
    fetchUrlContent(url: string): Promise<string>;
}


/**
 * React hook to get the URL service.
 */
export const useUrlService: () => UrlService = (): UrlService => {
    return {
        fetchUrlContent
    };
};
