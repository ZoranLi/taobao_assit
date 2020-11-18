document.addEventListener('DOMContentLoaded', function () {
    console.log('天天购物插件');
    $(document).ready(function () {
        setTimeout(() => {
            if (location.host.includes('detail.tmall')) {
                dealTM();
            } else if (location.host.includes('buy.tmall')) {
                //如果有授权的话
                // auth-btm

                closeAuthWindow();

                let price = getPrice();
                if (!price || price === '0.00') {
                    setInterval(() => {
                        price = getPrice();
                        alert(parseQuery(document.referrer).id) // 商品ID)
                    }, 3000)
                }
            }
            else if (location.host === 'item.taobao.com') {
                dealTB();
            } else if (location.host === 'buy.taobao.com') {
                let price = getPrice();
                if (!price || price === '0.00') {
                    setInterval(() => {
                        price = getPrice();
                        alert(parseQuery(document.referrer).id) // 商品ID
                    })
                }
            }
        }, 1000)
    });
});

/**
 *处理天猫详情
 */
function dealTM() {
    let endSkuIndex;
    $('.tb-sku').children().each(function (i, n) {
        let child = $(n)
        let category = child.find(".tb-metatit").html()
        if (category === '数量') {
            endSkuIndex = i;
        }
    });
    $('.tb-sku').children().each(function (i, n) {
        if (i < endSkuIndex) {
            let liElem = n.getElementsByTagName('li');
            let filterList = [];
            Object.keys(liElem).filter((index) => {
                const g = liElem[index]
                if (g.classList.value !== 'tb-out-of-stock') {
                    filterList.push(g)
                }
            });

            liElem = filterList;

            if (liElem && liElem[0] && liElem[0].textContent.includes('已选中')) {

            } else if (liElem && liElem[0]) {
                let random = Math.round(Math.random() * 8);//模拟用户点击 随机时间
                setTimeout(() => {
                    liElem[0].getElementsByTagName('a')[0].click()
                }, 500 + random * 800)
            }
        }
    });

    setTimeout(() => {
        $('[data-addfastbuy]')[0].click();
    }, 2000)
}


/**
 *处理淘宝详情
 */
function dealTB() {
    let endSkuIndex;
    $('.tb-skin').children().each(function (i, n) {
        let child = $(n)
        let category = child.find(".tb-property-type").html()
        if (category === '数量') {
            endSkuIndex = i;
        }
    });
    $('.tb-skin').children().each(function (i, n) {
        if (i < endSkuIndex) {
            let liElem = n.getElementsByTagName('li');
            let filterList = [];
            Object.keys(liElem).filter((index) => {
                const g = liElem[index]
                if (g.classList.value !== 'tb-out-of-stock') {
                    filterList.push(g)
                }
            });

            liElem = filterList;

            if (liElem && liElem[0] && liElem[0].classList.value.includes('tb-selected')) {

            } else if (liElem && liElem[0]) {
                // liElem[0].getElementsByTagName('a')[0].click()
                let random = Math.round(Math.random() * 8);//模拟用户点击 随机时间
                setTimeout(() => {
                    liElem[0].getElementsByTagName('a')[0].click()
                }, 500 + random * 800)
            }
        }
    });

    setTimeout(() => {
        $('[data-addfastbuy]')[0].click();
    }, 2000)

}

/**
 * 获取淘宝页面价格
 */
function getPrice() {
    let price;
    if (location.host.includes('buy.tmall.hk')) {//如果是天猫Hk $('.label__header:contains(合计)').parent().children()[1]
        price = $('.label__header:contains(合计)').parent().children()[1].innerHTML
    } else {
        price = $('.label__header').parent().children()[1].innerHTML
    }
    alert(price)
    return price
}

/**
 * 格式化queryparams 获取 refer中的ID
 * @param str
 * @returns {{}}
 */
function parseQuery(str) {
    if (typeof str != "string" || str.length == 0) return {};
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
 * 关闭授权
 *
 */
async function closeAuthWindow() {
    await setTimeout(() => {
        // $('.auth-btm').contents('授权').click()
        $('.auth-btm').children()[1].click()
    }, 800)
}