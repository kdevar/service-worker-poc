const config = {    
    excludeMatcher: [
        /^.*\.(?!jpg$|png|js|css|less|png|gif|html|htm$)[^.]+$/gi
    ],
    prefetchEnabled: true,
    prefetchUrls: [
        '/pds/properties/{id}/forSaleList',
        '/pds/properties/{id}/contactsDetails',
        '/pds/properties/{id}/saleComparables',
        '/pds/properties/{id}/stackingPlan',
        '/pds/properties/{id}/saleCompList'
    ],
    timeToLiveInSeconds: 1200,    
    debug: true,
    maxEntries: 120,
    cacheName: "ppw-master"     
}

function getconfig(){
    return config;
}

export {config, getconfig};