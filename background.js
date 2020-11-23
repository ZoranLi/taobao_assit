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

            if (index === goodsList.length - 1) { // 爬到最后一条清数据
                chrome.storage.local.set({"STORAGE_GOOODS_LIST": null}, function () {
                });
            }

            if (index < goodsList.length) {
                setTimeout(() => {
                    let url = goodsList[index + 1];
                    if (url) {
                        chrome.tabs.create({url: url});
                    }
                }, 1500)
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
                deleteList(body.did);
                callback(resp)
            } else {
                chrome.storage.local.set({"STORAGE_GOOODS_LIST": JSON.parse(resp)}, function () {
                });
            }
        }
    };
    xhr.send(JSON.stringify(body));
}


async function deleteList(did){
    const gooodsList = await getLocalStorageValue("STORAGE_GOOODS_LIST");
    //上报完成就删掉本地list
    let tempIndex = goodsList.findIndex((e) => {
        return e.includes(did)
    });
    gooodsList.splice(tempIndex, 1);
    chrome.storage.local.set({"STORAGE_GOOODS_LIST": gooodsList}, function () {
    });
}

/**
 * 获取storage的值
 * @param key
 * @returns {Promise<any>}
 */
async function getLocalStorageValue(key) {
    return new Promise((resolve, reject) => {
        try {
            chrome.storage.local.get(key, function (value) {
                resolve(value);
            })
        }
        catch (ex) {
            reject(ex);
        }
    });
}
