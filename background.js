chrome.runtime.onMessage.addListener(function (message, callback) {
    if (message.type === "close") {
        // alert('即将关闭当前页面');
        // alert(JSON.stringify(message))
        console.log(JSON.stringify(message))
        // chrome.tabs.getSelected(null, function (tab) {
        //     chrome.tabs.remove(tab.id);
        // });
    }
});
