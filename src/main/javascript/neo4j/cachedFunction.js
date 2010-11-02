/**
 * Used to wrap a tiny cache around a single function. Currently only works for
 * functions that return their result via callbacks.
 * 
 * This is extremely simplistic, it does not take into account using different
 * parameters and so on, it simply caches the first response the function makes,
 * and then keeps responding with that answer.
 * 
 * @param func
 *            is the function to wrap
 * @param callbackArg
 *            is the position of the callback argument to the wrapped function
 * @param timeout
 *            (optional) is the time in milliseconds before the cache becomes
 *            invalid, default is infinity (-1).
 */
neo4j.cachedFunction = function(func, callbackArg, timeout) {

    var cachedResult = null;
    var cachedResultContext = null;

    var cacheTimeout = timeout || false;

    var isCached = false;

    var waitingList = [];

    return function wrap() {
        var callback = arguments[callbackArg];

        if (isCached)
        {
            callback.apply(cachedResultContext, cachedResult);
        } else
        {
            if (waitingList.length == 0)
            {

                arguments[callbackArg] = function() {
                    cachedResultContext = this;
                    cachedResult = arguments;
                    isCached = true;

                    for ( var i in waitingList)
                    {

                        waitingList[i].apply(cachedResultContext, cachedResult);
                    }

                    waitingList = [];

                    if (cacheTimeout)
                    {
                        setTimeout(function() {
                            isCached = false;
                        }, cacheTimeout);
                    }
                };

                func.apply(this, arguments);

            }

            waitingList.push(callback);

        }
    };
}