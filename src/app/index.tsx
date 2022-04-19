import React, { useEffect } from "react";
import { Config, ConfigContext, BasenameContext } from "@rhoas/app-services-ui-shared";

import "@app/app.css";

import "@patternfly/react-core/dist/styles/base.css";
import "@patternfly/patternfly/patternfly.css";
import "@patternfly/patternfly/utilities/Accessibility/accessibility.css";
import "@patternfly/patternfly/utilities/Sizing/sizing.css";
import "@patternfly/patternfly/utilities/Spacing/spacing.css";
import "@patternfly/patternfly/utilities/Display/display.css";
import "@patternfly/patternfly/utilities/Flex/flex.css";
import {HomePage} from "@app/pages";

declare const __BASE_PATH__: string;

const App: React.FunctionComponent = () => {
 return (
     <ConfigContext.Provider
         value={
             {
                 srs: {
                     apiBasePath: __BASE_PATH__,
                 },
             } as Config
         }
     >
         <BasenameContext.Provider value={{ getBasename: () => "" }}>
             <HomePage />
         </BasenameContext.Provider>
     </ConfigContext.Provider>
 );
}

export default App;
