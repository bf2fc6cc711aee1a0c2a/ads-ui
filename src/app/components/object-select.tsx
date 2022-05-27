import React, {FunctionComponent, useEffect, useState} from "react";
import {Select, SelectOption, SelectVariant} from "@patternfly/react-core";
import {SelectOptionObject} from "@patternfly/react-core/src/components/Select/SelectOption";

interface ObjectSelectOptionObject extends SelectOptionObject {
    item: any;
}

/**
 * Properties
 */
export type ObjectSelectProps = {
    value: any;
    items: any[];
    onSelect: (value: any) => void;
    itemToString: (value: any) => string;
};

/**
 * A generic control that makes it easier to create a <Select> from an array of objects.
 */
export const ObjectSelect: FunctionComponent<ObjectSelectProps> = ({value, items, onSelect, itemToString}: ObjectSelectProps) => {
    const [isToggled, setToggled] = useState<boolean>(false);
    const [selectObjects, setSelectObjects] = useState<ObjectSelectOptionObject[]>();
    const [selections, setSelections] = useState<ObjectSelectOptionObject[]>();

    const onSelectInternal = (event: React.MouseEvent | React.ChangeEvent, value: string | SelectOptionObject): void => {
        setToggled(false);
        onSelect((value as ObjectSelectOptionObject).item);
    };

    useEffect(() => {
        setSelectObjects(items.map((item, index) => {
            const soo: ObjectSelectOptionObject = {
                item: item,
                toString: () => {
                    return itemToString(item)
                }
            }
            return soo;
        }));
    }, [items]);

    useEffect(() => {
        const filtered: ObjectSelectOptionObject[]|undefined = selectObjects?.filter(soo => soo.item === value);
        setSelections(filtered);
    }, [value]);

    return (
        <Select variant={SelectVariant.single} onToggle={setToggled} onSelect={onSelectInternal} isOpen={isToggled} selections={selections}>
            {
                selectObjects?.map((soo, index) => <SelectOption key={index} value={soo} />)
            }
        </Select>
    )
};
