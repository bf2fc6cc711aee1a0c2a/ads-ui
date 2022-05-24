/**
 * Downloads the given content to the filesystem using the given content type and
 * file name.
 * @param content
 * @param contentType
 * @param filename
 */
async function downloadToFS(content: string, contentType: string, filename: string): Promise<void> {
    console.info("[DownloadService] Downloading a design.");
    const _w: any = window;

    if (_w.chrome !== undefined) {
        // Chrome version
        let link = document.createElement('a');
        let blob = new Blob([content], { type: contentType });
        link.href = _w.URL.createObjectURL(blob);
        link.download = filename;
        link.click();
    } else if (_w.navigator !== undefined && _w.navigator.msSaveBlob !== undefined) {
        // IE version
        let blob = new Blob([content], { type: contentType });
        _w.navigator.msSaveBlob(blob, filename);
    } else {
        // Firefox version
        let file = new File([content], filename, { type: 'application/force-download' });
        _w.open(URL.createObjectURL(file));
    }
}


/**
 * The Download Service interface.
 */
export interface DownloadService {
    downloadToFS(content: string, contentType: string, filename: string): Promise<void>;
}


/**
 * React hook to get the Download service.
 */
export const useDownloadService: () => DownloadService = (): DownloadService => {
    return {
        downloadToFS
    };
};
