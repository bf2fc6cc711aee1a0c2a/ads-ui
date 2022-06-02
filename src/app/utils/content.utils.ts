import YAML from "yaml";


/**
 * Returns true if the given content is JSON formatted.
 * @param content the content to check
 */
export function isJson(content: string): boolean {
    try {
        JSON.parse(content);
        return true;
    } catch (e) {
        return false;
    }
}
export function parseJson(content: string): any {
    return JSON.parse(content);
}


/**
 * Returns true if the given content is YAML formatted.
 * @param content the content to check
 */
export function isYaml(content: string): boolean {
    try {
        YAML.parse(content);
        return true;
    } catch (e) {
        return false;
    }
}
export function parseYaml(content: string): any {
    return YAML.parse(content);
}

/**
 * Returns true if the given content is XML formatted.
 * @param content the content to check
 */
export function isXml(content: string): boolean {
    try {
        const xmlParser: DOMParser = new DOMParser();
        const dom: Document = xmlParser.parseFromString(content, "application/xml");
        const isParseError: boolean = dom.getElementsByTagName("parsererror").length !== 0;
        return !isParseError;
    } catch (e) {
        return false;
    }
}
