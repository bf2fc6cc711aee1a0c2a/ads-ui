export interface DesignContextFile {
    fileName: string;
}

export interface DesignContextUrl {
    url: string;
}

export interface DesignContextRhosr {
    instanceId: string;
    groupId: string;
    artifactId: string;
    version: string;
}


export interface DesignContext {

    type: "create" | "file" | "url" | "rhosr";
    file?: DesignContextFile;
    url?: DesignContextUrl;
    rhosr?: DesignContextRhosr;

}
