# API Designer UI
This repository represents the main UI components for Red Hat OpenShift API Designer, which
is a managed service located at console.redhat.com.

# Build and run (local)
To run the app locally, do the following:

```bash
$ npm install
$ npm run start:dev
```

Then open your browser (if it doesn't automatically open) to:

http://localhost:9009/

# Build and run (docker)
To run a production build using docker:

```bash
$ npm install
$ npm run prebuild
$ npm run build
$ docker build -t="apicurio/api-designer-ads" --rm .
$ docker run -it -p 9009:80 apicurio/api-designer-ads
```

Then open your browser to:

http://localhost:9009/

