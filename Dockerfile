FROM registry.access.redhat.com/ubi8/nginx-118

USER root

# Grant write permission to group
RUN chmod -R g+w /opt/app-root/src /usr/local/bin/

USER 1001

# Copy configuration scripts
COPY --chown=1001:0 build/configs/notify-gchat.sh /usr/local/bin/notify-gchat.sh

# Copy dist files
COPY --chown=1001:0 dist/ .

EXPOSE 8080

# Run script uses standard ways to run the application
CMD /usr/libexec/s2i/run
