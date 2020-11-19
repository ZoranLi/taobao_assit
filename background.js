chrome.runtime.onMessage.addListener(function (message, callback) {
    if (message.type === "close") {
        // alert('即将关闭当前页面');
        chrome.tabs.getSelected(null, function (tab) {
            chrome.tabs.remove(tab.id);
        });
    } else if (message.type === "request") {
        let {url, method, body} = message
        fetchRemoteData(url, method, body)
    }
});

/**
 * 发请求
 * @param url
 * @param method
 * @param body
 */
function fetchRemoteData(url, method, body) {
    let xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            var resp = JSON.stringify(xhr.responseText)
            chrome.tabs.getSelected(null, function (tab) {
                chrome.tabs.remove(tab.id);
            });
        }
    };
    xhr.send(JSON.stringify(body));
}
