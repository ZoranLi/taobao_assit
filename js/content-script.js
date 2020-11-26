const BASIC_TIME = 1500; //点击默认基础操作时间
const BASIC_FACTOR = 400;//点击默认随机因子

document.addEventListener('DOMContentLoaded', function () {
    console.log('天天购物插件');
    $(document).ready(function () {

        let parseObj = parseQuery(location.href);
        let did = parseObj.did;
        let did_array = parseObj.did_array;
        if (did && did_array) { //第一个打开的页面还没有存上
            dealDomain();//处理不同域名页面
        } else {
            getLocalStorageValue("TAB_DID").then(resp => {//本地存储的tabId 窗口用于爬取，其他的不做处理
                getCurrentTabId().then(currentTabId => {
                    if (resp['TAB_DID'] === currentTabId) {
                        dealDomain();//处理不同域名页面
                    }
                })
            });
        }
    });
});

function dealDomain() {
    setTimeout(() => {
        if (location.host.includes('www.baidu.com')) {
            // let result = queryErrorDids()
            // alert(JSON.stringify(result))
        }
        if (location.host.includes('login.taobao.com')) {
            //登录
            // $("#fm-login-id").val(USER_NAME)
            // $("#fm-login-password").val(PASSWORD)

            // setTimeout(() => {
            //     $("[class='fm-button fm-submit password-login']").click()
            // }, getRandomFactor())

        } else if (location.host.includes('detail.tmall')) {
            setDidKey();

            getLocalStorageValue("STORAGE_DID").then(resp => {
                if (resp['STORAGE_DID']) {
                    createHintMessage()
                    if ($('.sold-out-tit:contains(此商品已下架)') && $('.sold-out-tit:contains(此商品已下架)').css('display')) {
                        dealErrorDID()
                    } else if ($("#J_LinkBasket:contains(加入超市购物车)") && $("#J_LinkBasket:contains(加入超市购物车)").css('display')
                    ) {//去超市购物车
                        dealErrorDID()
                    } else if ($("#J_LinkBuy:contains(立即购买)")) {
                        dealTM();
                    } else {
                        dealErrorDID()
                    }
                }
            });

        } else if (location.host.includes('buy.tmall')) {

            getLocalStorageValue("STORAGE_DID").then(resp => {
                if (resp['STORAGE_DID']) {
                    createHintMessage()
                    //如果有授权的话
                    // auth-btm
                    closeAuthWindow();
                    let price = getFinallyPrice();
                    if (price) {
                        getData("STORAGE_DID", price)
                    } else {
                        setTimeout(() => {
                            $('#goods_price').text(`该商品对当前设备和账号做限制了`)
                        }, 3000)//8s之后还未获取到，就说明账号被限制了
                    }
                }
            });

        }
        else if (location.host === 'item.taobao.com') {
            setDidKey();

            getLocalStorageValue("STORAGE_DID").then(resp => {
                if (resp['STORAGE_DID']) {
                    createHintMessage()
                    dealTB();
                }
            })
        } else if (location.host === 'buy.taobao.com') {
            setDidKey();

            getLocalStorageValue("STORAGE_DID").then(resp => {
                if (resp['STORAGE_DID']) {
                    createHintMessage()
                    let price = getFinallyPrice();
                    if (price) {
                        getData("STORAGE_DID", price)
                    } else {
                        setTimeout(() => {
                            $('#goods_price').text(`该商品对当前设备和账号做限制了`)

                        }, 3000)//8s之后还未获取到，就说明账号被限制了
                    }

                }
            })
        } else if (location.host === "uland.taobao.com") { //粉丝福利购，领券
            setDidKey();
            createHintMessage();
            setTimeout(() => {
                if ($('div:contains(立即领券)').css('display')) {
                    setTimeout(() => {
                        //立即领券
                        $('div:contains(立即领券)').parent().click()
                    }, getRandomFactor(800))
                } else if ($('.err-tip')[0] && $('.err-tip')[0].innerHTML === '宝贝不见了') {//宝贝不见了
                    dealErrorDID();
                } else {
                    $('.item-img-con').click()
                }
            }, 800)
        } else if (location.host === 's.click.taobao.com') {
            setDidKey();
        }
    }, 1000)
}


/**
 * 获取当前tabId
 * @returns {Promise<any>}
 */
async function getCurrentTabId() {
    return new Promise((resolve, reject) => {
        try {

            chrome.extension.sendMessage({type: 'getTabId'}, function (res) {
                // saveObject({"TAB_DID": res.tabId})
                resolve(res.tabId);
            });
        } catch (ex) {
            reject(ex);
        }
    });

}


/**
 * 保存文件
 * @param filename
 * @param text
 */
function saveText(filename, text) {
    var tempElem = document.createElement('a');
    tempElem.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    tempElem.setAttribute('download', filename);
    tempElem.click();
}

/**
 * 保存key value
 * @param obj
 * obj
 * eg.{
 *       "STORAGE_DID": did,
 *       "TAB_DID": did,
 *   }
 */
function saveObject(obj) {
    chrome.storage.local.set(obj, function () {
    });
}


/**
 *上报爆料的did
 */
async function setDidKey() {
    /**
     * @type {{}}
     */
    let parseObj = parseQuery(location.href);
    let parseReferrerObj = parseQuery(document.referrer);
    let did = parseObj.did;
    let did_array = parseObj.did_array;
    if (!did) {
        did = parseReferrerObj.did
    }
    if (!did_array) {
        did_array = parseReferrerObj.did_array
    }

    if (did && did_array) {

        chrome.extension.sendMessage({type: 'getTabId'}, function (res) {
            saveObject({"TAB_DID": res.tabId})
        });

        chrome.storage.local.set({
            "STORAGE_DID": did,
        }, function () {
            console.log('Value is set to' + did);
        });

        const gooodsList = await getLocalStorageValue("STORAGE_GOOODS_LIST");
        if (!(gooodsList && gooodsList.length)) {//如果没有数据
            chrome.runtime.sendMessage({
                    type: "request",
                    url: `http://api.tiantiandr.cn/admin/v1/disclosure/query_sync_goods?did_array=${did_array}`,
                    method: "GET"
                },
                function (res) {

                });
        }
    }
    /*else {
           chrome.storage.local.set({
               "STORAGE_DID": null,
               "STORAGE_GOOODS_LIST": null
           }, function () {
               console.log('Value is set to' + did);
           });
       }*/

    // /**
    //  * 读取本地文件
    //  */
    // $.getJSON(chrome.extension.getURL("goods_list.json"), {}, function (data) {
    //     chrome.storage.local.set({"STORAGE_GOOODS_LIST": JSON.stringify(data)}, function () {
    //         console.log('Value is set to' + did);
    //     });
    // })
}

/**
 * 创建提示信息
 */
function createHintMessage() {
    let width = "300";
    let height = "200";
    let title = "<font color=red>正在获取价格</font>"
    let iframeHeight = height - 52;
    let marginLeft = 0;
    let marginTop = "0";
    let inntHtml = '';
    inntHtml += '<div id="maskTop" style="width: ' + width + 'px; height: ' + height + 'px; border: #999999 1px solid; background: #fff; color: #333; position: fixed; top: 50%; left: 15px; margin-left: -' + marginLeft + 'px; margin-top: -' + marginTop + 'px; z-index: 999999; filter: progid:DXImageTransform.Microsoft.Shadow(color=#909090,direction=120,strength=4); -moz-box-shadow: 2px 2px 10px #909090; -webkit-box-shadow: 2px 2px 10px #909090; box-shadow: 2px 2px 10px #909090;">'
    inntHtml += '<div id="maskTitle" style="height: 50px;text-align: center; line-height: 50px; font-family: Microsoft Yahei; font-size: 20px; color: #333333; padding-left: 20px; background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAyCAYAAABlG0p9AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAABvSURBVEhL1cq5DcAwDENR7T+sL9lOOoUbkCoCwwKewOJbiGe+31BkwgeDM18YgrPhxuBs4CkS4cQQZMKFwd0R+gzFJaFjcD+EfXgoMuHA4O4Iew/FJWHD4BJhwxDoYcNTIKwY3NGwYggQFgxODEt8xO1/6P+HHxEAAAAASUVORK5CYII=); border-bottom: 1px solid #999999; position: relative;">'
    inntHtml += '' + title + ''
    inntHtml += '<div id="popWinClose" style="width: 28px; height: 28px; cursor: pointer; position: absolute; top: -12px; right: -9px; background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAYAAAByDd+UAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAJeSURBVEhLvZbPq2lRFMf9B4bSTTIxZiBSMlCI9ycoKX+Bod7w/il3YIL4NyhFmYmBKD2Sp0ix3vqes/e529n74t33Op9astevr3PO2tvxvcLtdquzfbAtyAV8IlYX6d+DG7yxvbP9Fr2fglxR8ybavAYX/GD7Jfr8NahFD9HuMZz4U9Q5jEYjqlarFA6HiVPuDD7EkOMGvTjna9xi8/mcstmsJvKVIRc1Kl+K4haIHItut0t+v9/Y+JGhBrUq6M2xT9iBAXGeGQrY/U+miqI3NNhvw4t3EbNuyXeuzG3ood5eaLDfhhfO6JueWbPZtGKFQkGLNRoN2u/3FI/HtRh6SaDBPkusLnzWpMlkaRC7XC5WfLVaUTqddmKVSoVOp5MVG4/HlEql7mph6vRCC4IfYm2Nt7vAzW63o2KxSLVaja7Xq/DatFotrR49JdCCoHNcmfZZPp+n9XotMmxwVVwnVjbD4ZAikYhWj54SaN1dgjtZWiaToe12K7J0JpOJUUyaykuCsFwuR8fjUWR+slgsKBAIGGukqbwsiGdmElwul5RIJIw10lReEsQ0ns9nkaVzOBys226qhak8HRrsM7ktJLPZjDabjVjZYLBKpZJWrw0NfzzcFvj1KtPp1HpmsVjM2iIq/X5fqzdti4cbHycINjUYDAYUCoWcGA4BHAag1+tRMBi8q4VpGx/wl4dHWzKZpHa7TdFoVIuVy2XqdDrGSTUebYAXnh/e3v49AXZ49wcs4YB3rxgStyjApGG8TfsUPsTUaZQ8FZPgFrB585oo4QLvXoTdcIP/9Krv8/0BDUSOirKWU6wAAAAASUVORK5CYII=);"></div>'
    inntHtml += '</div>'
    inntHtml += `<div id="goods_price">正在获取商品价格，获取到价格，上报完毕会自动关闭页面</div>`
    $("body").append(inntHtml);
    $("#popWinClose").click(function () {
        $("#maskTop").hide()
    });
    // chrome.storage.onChanged.addListener(function (changes, namespace) {
    //     for (key in changes) {
    //         var storageChange = changes[key];
    //         console.log('存储键“%s”（位于“%s”命名空间中）已更改。' +
    //             '原来的值为“%s”，新的值为“%s”。',
    //             key,
    //             namespace,
    //             storageChange.oldValue,
    //             storageChange.newValue);
    //     }
    // });
}

/**
 * 获取storage的值
 * @returns {Promise<void>}
 */
async function getData(storage_key, price) {
    //将获取到的价格显示到提示框里边
    $('#goods_price').html(`当前商品价格<font style="font-size: 32px;color: RED;">${price}</font>，<br>正在上报价格，上报完毕之后会自动关闭`)
    const result = await getLocalStorageValue(storage_key);
    setTimeout(() => {
        chrome.runtime.sendMessage({
                type: "request",
                url: 'http://api.tiantiandr.cn/admin/v1/disclosure/create_expand',
                body: {
                    "did": result["STORAGE_DID"],
                    "e_type": 0,
                    "e_name": "capture_price",
                    "e_value": price
                },
                method: "POST"
            },
            function (res) {
                $('#goods_price').text(`上报完毕`)
                var tabId;
                chrome.extension.sendMessage({type: 'getTabId'}, function (res) {
                    tabId = res.tabId;
                    chrome.runtime.sendMessage({
                        type: "close",
                        did: result["STORAGE_DID"],
                        tabId,
                    });
                });
            });
    }, 200)

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

/**
 *处理天猫详情
 */
function dealTM() {
    let endSkuIndex;
    let skuContianer = $('.tb-sku');

    //数量之前都是规格，看数量位置是第几个
    skuContianer.children().each(function (i, n) {
        let child = $(n)
        let category = child.find(".tb-metatit").html()
        if (category === '数量') {
            endSkuIndex = i;
        }
    });

    if (endSkuIndex) {
        isTMSkuClickFinished(skuContianer, endSkuIndex)
    }
    //去购买之前再检查一遍 规格有没有漏掉的
    if ($('[data-addfastbuy]')[0] && $('[data-addfastbuy]')[0].classList.value === "noPost") {//当前地区不支持配送
        dealErrorDID()
    } else {
        if ($("#J_LinkBasket:contains(加入超市购物车)") && $("#J_LinkBasket:contains(加入超市购物车)").css('display')) {//去超市购物车
            $("#J_LinkBasket")[0].click();
        } else {
            setTimeout(() => {
                $('[data-addfastbuy]')[0].click();
                // TODO 检查天猫未登录状态 并登录
                /*
                 setInterval(()=>{
                     if($("[class='fm-button fm-submit password-login']")){
                         // $("#fm-login-id").val(USER_NAME)
                         document.getElementById("fm-login-id").value= USER_NAME
                         document.getElementById("fm-login-password").value= PASSWORD
                         // $("#fm-login-password").val(PASSWORD)
                         setTimeout(() => {
                             $("[class='fm-button fm-submit password-login']").click()
                         }, getRandomFactor())
                     }
                 },500)*/
            }, getRandomFactor(800))
        }


    }


}

/**
 * 上报 出错的did
 * @returns {Promise<void>}
 */
async function dealErrorDID() {
    const result = await getLocalStorageValue("STORAGE_DID");
    // saveErrorDid(result["STORAGE_DID"])
    // TODO 上报error的爆料
    chrome.extension.sendMessage({type: 'getTabId'}, function (res) {//关闭当前页面 抓取下一个
        tabId = res.tabId;
        chrome.runtime.sendMessage({
            type: "close",
            did: result["STORAGE_DID"],
            tabId
        });
    });
}


/**
 * 本地保存失败的did
 * @param did
 * @returns {Promise<void>}
 */
async function saveErrorDid(did) {
    let errorDids = await getLocalStorageValue("STORAGE_ERROR_DIDS")["STORAGE_ERROR_DIDS"];
    if (!errorDids) {
        errorDids = []
    }
    errorDids.push(did)
    chrome.storage.local.set({"STORAGE_ERROR_DIDS": errorDids}, function () {
    });
}

/**
 * 查询本地保存的错误did
 * @returns {Promise<any|Array>}
 */
async function queryErrorDids() {
    return await getLocalStorageValue("STORAGE_ERROR_DIDS") || [];
}


function delay(time) {
    return new Promise(function (resolve, reject) {
        setTimeout(function () {
            resolve('');
        }, getRandomFactor(time));
    });
}

/**
 * 天猫sku是否都选完了
 * @param element
 */
function isTMSkuClickFinished(element, endSkuIndex) {
    element.children().each(function (i, n) {
        if (i < endSkuIndex) {
            let liElem = n.getElementsByTagName('li');
            liElem = filterSaleOut(liElem);
            if (liElem && liElem[0] && liElem[0].textContent.includes('已选中')) {

            } else if (liElem && liElem[0]) {
                delay(getRandomFactor()).then(function () {
                    liElem[0].getElementsByTagName('a')[0].click()
                    return delay(getRandomFactor()); //
                }).then(function () {
                    if ($(".ensureText")[0]) {
                        let demo = window.getComputedStyle($(".ensureText")[0], null);
                        if (demo.display !== 'none') {
                            setTimeout(() => {
                                $('[data-addfastbuy]')[0].click();
                            }, getRandomFactor())
                        }
                    }
                    return delay(getRandomFactor()); //
                }).then(function () {
                    isTMSkuClickFinished(element, endSkuIndex)
                    return delay(getRandomFactor()); //
                });
            }
        }
    });
}

/**
 * 过滤掉没有库存的 规格
 */
function filterSaleOut(liElem) {
    let filterList = [];
    Object.keys(liElem).filter((index) => {
        const g = liElem[index]
        if (g.classList.value !== 'tb-out-of-stock') {
            filterList.push(g)
        }
    });
    return filterList
}

/**
 * 延时等待函数
 * @param time
 * @returns {Promise<any>}
 */
function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

/**
 *处理淘宝详情
 */
function dealTB() {
    let endSkuIndex;
    let skuContainer = $('.tb-skin')

    skuContainer.children().each(function (i, n) {
        let child = $(n)
        let category = child.find(".tb-property-type").html()
        if (category === '数量') {
            endSkuIndex = i;
        }
    });

    isTBSkuClickFinished(skuContainer, endSkuIndex)

    setTimeout(() => {
        $('[data-addfastbuy]')[0].click();
    }, getRandomFactor())
}

/**
 * 模拟随机点击事件
 * @param time
 * @param factor 随机因子 默认400ms
 * @returns {number}
 */
function getRandomFactor(time = BASIC_TIME, factor = BASIC_FACTOR) {
    let random = Math.round(Math.random() * 8);//模拟用户点击 随机时间
    return time + random * factor;
}


/**
 * 淘宝sku是否都选完了
 * @param element
 */
function isTBSkuClickFinished(element, endSkuIndex) {
    element.children().each(function (i, n) {
        if (i < endSkuIndex) {
            let liElem = n.getElementsByTagName('li');
            liElem = filterSaleOut(liElem);
            if (liElem && liElem[0] && liElem[0].classList.value.includes('tb-selected')) {

            } else if (liElem && liElem[0]) {


                liElem[0].getElementsByTagName('a')[0].click()

                let demo = window.getComputedStyle($('.tb-sure')[0], null);
                if (demo.display !== 'none') {
                    setTimeout(() => {
                        $(".tb-sure-continue").getElementsByTagName('a')[0].click()
                    }, getRandomFactor())
                }

                setTimeout(() => {
                    isTBSkuClickFinished(element, endSkuIndex)
                }, getRandomFactor())
            }
        }
    });
}


function getFinallyPrice() {
    if ($('.label__header:contains(合计)') && $('.label__header:contains(合计)').parent() && $('.label__header:contains(合计)').parent().children()[1]) {
        let price = $('.label__header:contains(合计)').parent().children()[1].innerHTML;
        if (!price || price === '0.00') {
            setTimeout(() => {
                getFinallyPrice()//500毫秒之后再次获取
            }, 200)
        } else {
            return price
        }
    } else {
        setTimeout(() => {
            getFinallyPrice()//500毫秒之后再次获取
        }, 200)
    }
}

/**
 * 格式化queryparams 获取 refer中的ID
 * @param str
 * @returns {{}}
 */
function parseQuery(str) {
    if (typeof str != "string" || str.length == 0) return {};
    if (str.includes('?')) {
        str = str.split('?')[1]
    }
    var s = str.split("&");
    var s_length = s.length;
    var bit, query = {}, first, second;
    for (var i = 0; i < s_length; i++) {
        bit = s[i].split("=");
        first = decodeURIComponent(bit[0]);
        if (first.length == 0) continue;
        second = decodeURIComponent(bit[1]);
        if (typeof query[first] == "undefined") query[first] = second;
        else if (query[first] instanceof Array) query[first].push(second);
        else query[first] = [query[first], second];
    }
    return query;
}

/**
 * 天猫hk点击授权
 */
async function closeAuthWindow() {
    if ($('.auth-btm') && $('.auth-btm').children() && $('.auth-btm').children()[1]) {
        await setTimeout(() => {
            // $('.auth-btm').contents('授权').click()
            $('.auth-btm').children()[1].click()
        }, getRandomFactor())
    }
}