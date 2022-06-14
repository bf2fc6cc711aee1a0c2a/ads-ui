#!/usr/bin/env bash
#
# Copyright RedHat.
# License: MIT License see the file LICENSE

# Inspired by https://disconnected.systems/blog/another-bash-strict-mode/
set -eEu -o pipefail
trap 's=$?; echo "[ERROR] [$(date +"%T")] on $0:$LINENO"; exit $s' ERR

APP_NAME="ads-ui-build"
DEPLOYMENT_REPOSITORY="https://github.com/RedHatInsights/${APP_NAME}.git"

CONTAINER_ENGINE=${CONTAINER_ENGINE:-"docker"}
VERSION="$(git log --pretty=format:'%h' -n 1)"
IMAGE_REPOSITORY=${IMAGE_REPOSITORY:-"${APP_NAME//-build}"} # strip '-build' from ${APP_NAME}
IMAGE_TAG=${IMAGE_TAG:-${VERSION}}
IMAGE="${IMAGE_REPOSITORY}:${IMAGE_TAG}"


function log() {
    echo "[$1] [$(date +"%T")] - ${2}"
}

function step() {
    log "STEP" "$1"
}

if [[ ! -d ./.git ]]; then
    echo "error: the build_deploy.sh script must be executed from the project root"
    exit 1
fi




TOOLS_IMAGE=${TOOLS_IMAGE:-"quay.io/app-sre/mk-ci-tools:latest"}
TOOLS_HOME=$(mktemp -d)

function run() {
    ${CONTAINER_ENGINE} run \
        -u ${UID} \
        -v ${TOOLS_HOME}:/thome:z \
        -e HOME=/thome \
        -v ${PWD}:/workspace:z \
        -w /workspace \
        ${TOOLS_IMAGE} \
        $@
}

# Log in to the image registry:

if [ -z "${NACHOBOT_TOKEN}" ]; then
    echo "The nachobot token hasn't been provided."
    echo "Make sure to set the NACHOBOT_TOKEN environment variable."
    exit 1
fi

step "Build the image"
${CONTAINER_ENGINE} build -t ${IMAGE} -f ./build/dockerfile .

step "Push the client files"
CID=$(${CONTAINER_ENGINE} create ${IMAGE})
${CONTAINER_ENGINE} cp ${CID}:/opt/app-root/src/dist .
${CONTAINER_ENGINE} rm ${CID}

run /opt/tools/scripts/push_to_insights.sh \
    --nachobot-token "${NACHOBOT_TOKEN}" \
    --version "${VERSION}" \
    --repository "${DEPLOYMENT_REPOSITORY}" \
    --app-name "${APP_NAME}"

