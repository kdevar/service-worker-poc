# Service Worker prefetching and caching

## Local Development

The service worker must be deployed such that it can served from the root of the site

1. get service worker code
```bash
git clone https://github.com/kdevar/service-worker-poc.git
cd service-workers
yarn install
yarn build:local //will deploy code to c:\inetpub\wwwroot
```
2. Open the c# project and find shelveset service-worker-prefetch-cache-impl
3. Use a special version of chrome to run project locally (this only applies to local development).  Service workers can only be served over https with localhost being the exception.  Since the property project is served over http locally and not from "localhost", we have to use a workaround.  Also, make sure you have either chrome 64 or 62 but not 63 for this workaround.
    1. create a folder somewhere for an alternate chrome profile (e.g. c:\profile)
    2. go to Run
    3. chrome --user-data-dir=c:\profile  --unsafely-treat-insecure-origin-as-secure={local-url}

4. Run the property project
5. you should be able see messages prefixed with serviceworker in the chrome console
