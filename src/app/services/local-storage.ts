
function setConfigProperty(propertyName: string, propertyValue: string): void {
    console.info(`[LocalStorageService] Setting config property ${propertyName} to value ${propertyValue}.`);
    localStorage.setItem("apicurio-studio." + propertyName, propertyValue);
}

function getConfigProperty(propertyName: string, defaultValue: string): string {
    console.info(`[LocalStorageService] Getting config property ${propertyName}`);
    const value: string|null = localStorage.getItem("apicurio-studio." + propertyName);
    return value !== null ? value : defaultValue;
}


/**
 * The Local Storage Service interface.
 */
export interface LocalStorageService {
    setConfigProperty(propertyName: string, propertyValue: string): void;
    getConfigProperty(propertyName: string, defaultValue: string): string;
}


/**
 * React hook to get the LocalStorage service.
 */
export const useLocalStorageService: () => LocalStorageService = (): LocalStorageService => {
    return {
        setConfigProperty,
        getConfigProperty
    };
};
