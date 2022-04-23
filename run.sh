#!/bin/sh

if [ "x$DOCKER_CMD" = "x" ]
then
  DOCKER_CMD=docker
fi

$DOCKER_CMD run -it -p 9009:80 apicurio/api-designer-ads
