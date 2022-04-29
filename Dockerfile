FROM quay.io/app-sre/ubi8-nodejs-16 as builder

COPY --chown=1001:0 / .

# Run a production build
RUN npm install \
    && npm run prebuild \
    && npm run build \
    && npm dedupe

# ---------------------------------------------------------------------------- #

FROM quay.io/app-sre/ubi8-nginx-118

COPY --from=builder --chown=1001:0 /opt/app-root/src/dist/ .

EXPOSE 8080

# Run script uses standard ways to run the application
CMD /usr/libexec/s2i/run