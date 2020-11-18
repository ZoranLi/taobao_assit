document.addEventListener('DOMContentLoaded', function () {
    console.log('天天购物插件');
    $(document).ready(function () {
        setTimeout(() => {
            if (location.host === 'detail.tmall.com') {
                dealTM();
            } else if (location.host === 'buy.tmall.com') {
                getPrice();
                alert(parseQuery(document.referrer).id) // 商品ID)
            }
            else if (location.host === 'item.taobao.com') {
                dealTB();
            } else if (location.host === 'buy.taobao.com') {
                getPrice();
                alert(parseQuery(document.referrer).id) // 商品ID
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
                liElem[0].getElementsByTagName('a')[0].click()
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
                liElem[0].getElementsByTagName('a')[0].click()
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
    // alert($('.label__header').html())
    // alert($('.label__header').parent().children().contents('￥').html())
    alert($('.label__header').parent().children()[1].innerHTML)
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