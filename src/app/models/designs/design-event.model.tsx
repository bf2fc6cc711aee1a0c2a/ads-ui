
export type DesignEventType = "create" | "import" | "update" | "download" | "register";

export interface DesignEvent {

    id: string;
    type: DesignEventType;
    on: Date;
    data: any;

}
