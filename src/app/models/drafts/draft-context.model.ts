export interface DraftContextFile {
    fileName: string;
}

export interface DraftContextUrl {
    url: string;
}

export interface DraftContextRhosr {
    instanceId: string;
    group: string;
    artifactId: string;
    version: string;
}


export interface DraftContext {

    type: "create" | "file" | "url" | "rhosr";
    file?: DraftContextFile;
    url?: DraftContextUrl;
    rhosr?: DraftContextRhosr;

}
