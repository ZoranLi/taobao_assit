chrome.runtime.onMessage.addListener(function (message, callback, sendResponse) {
    if (message.type === "close") {
        // alert('即将关闭当前页面');
        // chrome.tabs.getSelected(null, function (tab) {
        //     chrome.tabs.remove(tab.id);
        // });
        chrome.tabs.remove(message.tabId);

        let goodsList = JSON.parse(message.gooodsList["STORAGE_GOOODS_LIST"]);
        if (goodsList) {
            let tempIndex = goodsList.findIndex((e) => {
                return e.includes(message.did)
            });
            let index = tempIndex === -1 ? 0 : tempIndex;

            if (index < goodsList.length) {
                setTimeout(() => {
                    chrome.tabs.create({url: goodsList[index + 1]});
                }, 10000)
            }
        }
    }
});

chrome.extension.onMessage.addListener(
    function (message, sender, sendResponse) {
        if (message.type === 'getTabId') {
            sendResponse({tabId: sender.tab.id});
        } else if (message.type === "request") {
            let {url, method, body} = message
            // alert(JSON.stringify(body))
            fetchRemoteData(url, method, body, sendResponse)
        }
    }
);

/**
 * 发请求
 * @param url
 * @param method
 * @param body
 * @param callback
 */
function fetchRemoteData(url, method, body, callback) {
    let that = this
    let xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
            var resp = JSON.stringify(xhr.responseText)
            if (resp.result === 'OK') {
                callback()
            }
        }
    };
    xhr.send(JSON.stringify(body));
}
