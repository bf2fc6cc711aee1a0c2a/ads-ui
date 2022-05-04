import React from "react";

import "@app/app.css";

import "@patternfly/react-core/dist/styles/base.css";
import "@patternfly/patternfly/patternfly.css";
import "@patternfly/patternfly/utilities/Accessibility/accessibility.css";
import "@patternfly/patternfly/utilities/Sizing/sizing.css";
import "@patternfly/patternfly/utilities/Spacing/spacing.css";
import "@patternfly/patternfly/utilities/Display/display.css";
import "@patternfly/patternfly/utilities/Flex/flex.css";
import {Bullseye, EmptyState, Title, EmptyStateVariant, EmptyStateBody } from "@patternfly/react-core";

const App: React.FunctionComponent = () => {
 return (
     <Bullseye>
         <EmptyState variant={EmptyStateVariant.xs}>
             <Title headingLevel="h4" size="md">
                 Nothing to see here!
             </Title>
             <EmptyStateBody>
                 <p>
                     <span>The <em>ads-ui</em> project cannot be run alone, it must be run simultaneously with</span>
                     <span> </span>
                     <span><a href="https://github.com/Apicurio/api-designer-poc" target="_blank">api-designer-poc</a>.</span>
                     <span> </span>
                     <span>Please refer to the <em>README.md</em> file there.</span>
                 </p>
             </EmptyStateBody>
         </EmptyState>
     </Bullseye>
 );
}

export default App;
