

(function ($, undefined) {
    bxlt = {
        version: '0.0.1',
        //为了支持一个页面多个分页控件。控件内部的操作都应该在form内。 
       
        RestService: function (appid, group) {
            var result;
            $.ajax({
                url: "/Service/GetRestServiceByGroup", data: "AppID=" + appid + "&GroupCode=" + group, async: false, success: function (data) {
                    result = data;
                }
            });
            return result;
        },
        MapExtent: function () {
            var result;
            $.ajax({
                url: "/Map/MapExtent", async: false, success: function (data) {
                    result = data;
                }
            });
            console.log("extent" + result);
            return result;
        },
        //普通表格，隔行颜色区分
        grid: function (htmlForm) {
            //this.initPager();
            if (!htmlForm) {
                htmlForm = $("form");
            }
            this.orderGrid(htmlForm);
            $(htmlForm).find(".grid-body tr:odd").addClass("gridrow-alt");
            $(htmlForm).find('.grid-body tr').click(function () {
                $(this).addClass('l-selected').siblings().removeClass('l-selected');
            });
            $(htmlForm).find('.grid-body tr').dblclick(function () {
                $(this).removeClass('l-selected');
            });
        },
        //表头排序功能
        orderGrid: function (form) {
            var lastcolumn;
            if (!form) {
                form = $("form");
            }
            if (!form) {
                throw new Error("必须要指明要操作的html form");
            }
            var orderBy;
            var orderByOrder;
            if ($(form).find("#OrderBy").length == 1) {
                orderBy = $(form).find(orderBy);
            }
            else {
                orderBy = $("<input type='hidden' name='OrderBy' id='OrderBy'/>");
                $(form).append(orderBy);
            }
            if ($(form).find("#orderByOrder").length == 1) {
                orderByOrder = $(form).find(orderByOrder);
            }
            else {
                orderByOrder = $("<input type='hidden' name='orderByOrder' id='orderByOrder'/>");
                $(form).append(orderByOrder);
            }

            $(form).find(".grid-head  .ordercolumn").click(function () {
                if (lastcolumn && lastcolumn != this) {
                    if ($(lastcolumn).next().hasClass("l-grid-hd-cell-sort-asc")) {
                        $(lastcolumn).next().removeClass("l-grid-hd-cell-sort-asc");
                    }
                    if ($(lastcolumn).next().hasClass("l-grid-hd-cell-sort-desc")) {
                        $(lastcolumn).next().removeClass("l-grid-hd-cell-sort-desc");
                    }
                }
                var next = $(this).next("span");
                var fieldName = $(this).data("order");
                $(orderBy).val(fieldName);
                if ($(next).hasClass("l-grid-hd-cell-sort-asc")) {
                    $(next).removeClass("l-grid-hd-cell-sort-asc")
                    $(next).addClass("l-grid-hd-cell-sort-desc");
                    $(orderByOrder).val("desc");

                }
                else if ($(next).hasClass("l-grid-hd-cell-sort-desc")) {
                    $(next).removeClass("l-grid-hd-cell-sort-desc")
                    $(next).addClass("l-grid-hd-cell-sort-asc");
                    $(orderByOrder).val("asc");
                }
                else {
                    $(next).addClass("l-grid-hd-cell-sort-desc");
                    $(orderByOrder).val("desc");
                }
                lastcolumn = this;
                $(form).submit();
            });
        }

    };

    bxlt.dialog = {
        open: function (url, left, top, width, height, title)
        {
            var id = "bx" + new Date().getTime();
            var w = $("<div  class='bxDialog'><div class='bxDialogHeader'><div class='bxDialogTitle'></div><a class='bxDialogClose'>X</a></div><iframe frameborder='0' id=" + id + " ></iframe><div id='bxFoot'></div></div>");
            $(w).css({ position: "absolute", left: left, top: top, width: width, height: height });
            var frame = $(w).find("iframe").attr("src", url);
            $(frame).css({ width: width - 2, height: height - 8 });
            $(document.body).append(w);
            var btnClose = $(w).find(".bxDialogClose").click(function () { 
                $(this).parent().parent().css({ display: "none" });
            });
            if (title) {
                $(w).find(".bxDialogTitle").html(title);
            }
        }
    };

    bxlt.Layout = function () {
        var layout = $(".bxLayout");
        var top = $(layout).find(".Top");
        var left = $(layout).find(".Left");
        var center = $(layout).find(".Center");
        var bottom = $(layout).find(".Bottom");
        var bodyHeight = $(document.body).height();
        var bodyWidth = $(document.body).width();
        var topHeight = top.height();
        var topWidth = top.width();
        var leftHeight = bodyHeight - topHeight;
        left.css({ height: leftHeight });


    };

    bxlt.Layout();

    bxlt.kf = {
        //Html Mvc 表格，分别制定json url数据源，html template ID，
        TemplateGrid: function (url, templateID, htmlId) {

            var form = $("#" + htmlId).parents("form");
            if (!form) {
                throw new Error("找不到需要操作的html form标签");
            }

            var QueryData = function (url, param) {
                $.post(url, param, function (data) {
                    var entityHtml = tmpl(templateID, data.entity);
                    $("#" + htmlId).html(entityHtml);
                    bxlt.grid(form);
                });
            };
            QueryData(url, "");
        },
        TemplateGridWithPager: function (url,data,tmpBody, tmpPagerPanel) {
            //处理默认的名称
            //默认容器的名称为模板名称后添加 panel
            var tabContainer; 
            if (tmpBody == undefined) {
                tmpBody = "tmpl-tbody";
                tabContainer = "#" + "main_tbody";
            }
            else {
                tabContainer = "#" + tmpbody + "panel";
            }

            if (!tmpPagerPanel) {
                tmpPagerPanel = "#pager"
            }

            var form = $(tabContainer).parents("form");
            if (!form) {
                throw new Error("找不到需要操作的html form标签");
            }
            var QueryData = function (url, param) {
                $.post(url, param, function (data) {
                    var entityHtml = tmpl(tmpBody, data.entity);
                    $(tabContainer).html(entityHtml);
                    var itemsCount = data.Pager.TotalItemCount;
                    var pageSize = data.Pager.itemscount;
                    $(tmpPagerPanel).pagination({
                        total: itemsCount, pageSize:pageSize,
                        onSelectPage: function (pageNumber, pageSize) {
                            $(this).pagination('loading');
                            var data = $(this).parents("form").serialize();
                            var url = $(this).parents("form").attr("action");
                            data += "&page=" + pageNumber; 
                            QueryData(url, data);
                            $(this).pagination('loaded');
                        }
                    });
                    bxlt.grid(form); 
                });
            };
            //var data = $(tmpPagerPanel).parents("form").serialize(); 
            QueryData(url, data);
            $("form").submit(function (event) {
                event.preventDefault();
                var data = $(this).serialize();
                var url = $(this).attr("action");
                QueryData(url, data);
            });
        }
    };
  

 

}(jQuery));

 