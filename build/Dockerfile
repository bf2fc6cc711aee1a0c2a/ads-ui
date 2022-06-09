#
# Copyright RedHat.
# License: MIT License see the file LICENSE
#

FROM registry.access.redhat.com/ubi8/nodejs-16:latest as builder


COPY --chown=1001:0 / .

# install all deps, and build client/server
RUN npm install -q \
    && npm run build
    
# clear deps, and only install prod deps - needed as server build does not bundle them/node provided functions
RUN rm -rf /node_modules \ 
    && npm install -q --only=production \
    && npm dedupe

# ---------------------------------------------------------------------------- #

FROM registry.access.redhat.com/ubi8/nginx-118:latest

# copy required built output to image
COPY --from=builder --chown=root:root /opt/app-root/src/LICENSE ./
COPY --from=builder --chown=root:root /opt/app-root/src/dist ./dist
COPY --from=builder --chown=root:root /opt/app-root/src/node_modules ./node_modules

