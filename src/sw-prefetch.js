import {config} from './sw-config';
import {fetchAndCache} from './sw-helper';

function prefetchResources(message) {
    if(config.prefetchEnabled){
        return Promise.all(
            config.prefetchUrls.map(urls => {
                let url = urls.replace("{id}", message.data.propertyId);
                let request = new Request(url, { credentials: 'include' });
                return caches.match(request).then(matched => {
                    if (!matched) {
                        return fetchAndCache({request});
                    }
                });
            })
        );    
    }
}

export {
    prefetchResources
}