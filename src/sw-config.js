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
    timeToLiveInSeconds: 600,
    enabled: true,
    debug: true,
    maxEntries: 100,
    cacheName: "ppw-master"     
}

export {config};