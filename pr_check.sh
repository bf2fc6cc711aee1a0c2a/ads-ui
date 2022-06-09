#!/bin/bash

# Inspired by https://disconnected.systems/blog/another-bash-strict-mode/
set -eEu -o pipefail
trap 's=$?; echo "[ERROR] [$(date +"%T")] on $0:$LINENO"; exit $s' ERR


COMPONENT="ads-ui"
BUILD_COMMAND="docker build -f ./build/Dockerfile -t="${COMPONENT}" --rm ."



function log() {
    echo "[$1] [$(date +"%T")] - ${2}"
}

function step() {
    log "STEP" "$1"
}

function display_usage() {
    cat <<EOT

###########################################################################################

 This script gets triggered by the automated CI/CD jobs of AppSRE. It builds and tests 
 '${COMPONENT}' whenever a pull request is raised.


 Usage: $0 [options]
 Example: $0

 options include:

 -h, --help        This help message

#############################################################################################


EOT
}


function build_project() {
    echo "#######################################################################################################"
    echo " Build Command: ${BUILD_COMMAND}"
    echo "#######################################################################################################"
    # AppSRE environments doesn't have the required depencies for building this project
    # Installing the required dependencies is a tedious task since it's a shared instance
    # Hence, using the multistage docker build to build and test the project.
    ${BUILD_COMMAND}

}

function main() { 

    # Parse command line arguments
    while [ $# -gt 0 ]
    do
        arg="$1"

        case $arg in
          -h|--help)
            shift
            display_usage
            exit 0
            ;;
          *)
            echo "Unknown argument: $1"
            display_usage
            exit 1
            ;;
        esac
        shift
    done

    if [[ ! -d ./.git ]]; then
      echo "error: the $0 script must be executed from the project root"
      exit 1
    fi

    step "Build Project: ${COMPONENT}"
    build_project

}

main $*
