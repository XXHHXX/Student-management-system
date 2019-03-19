var tableData = [];
var curPage = 1;//默认当前页
var pageSize = 10; //每页展示条数
var searchWord = '';
var flag = true;
// 封装ajax请求函数
function transferData(url, data, callback) {
    $.ajax({
        url: 'http://api.duyiedu.com' + url,
        type: 'GEt',
        dataType: 'json',
        data: {
            appkey: 'dongmeiqi_1547441744650',
            ...data
        },
        success: function (res) {
            callback(res);
        },
        error: function (res) {
            console.log('error');
        }
    });
}


// 事件绑定函数
function bindEvent() {
    //左侧菜单栏
    $('.left-menu').on('click', 'dd', function (e) {
        var id = $(this).attr('data-id');
        if (id == 'student-list') {
            getTableData();
        }


        $('.content').fadeOut();
        $('.' + id).fadeIn();
        $('.left-menu dd.active').removeClass('active');
        $(this).addClass('active');
    });
    // 新增学生信息界面提交按钮
    $('.addStudentForm .btn.submit').on('click', function (e) {
        e.preventDefault();
        var data = getFormData($('.addStudentForm').eq(1));
        // console.log(data);
        transferData('/api/student/addStudent', data, function (res) {
            console.log(res);
            if (res.status == 'success') {
                alert('新增成功');
                $('.addStudentForm')[1].reset();//清空表单数据
                $('.left-menu dd[data-id=student-list]').trigger('click');//回到学生列表界面
            }
        });
    });
    //编辑学生信息
    $('#model-addBtn').on('click', function (e) {
        e.preventDefault();
        var data = getFormData($('.addStudentForm').eq(0));
        transferData('/api/student/updateStudent', data, function (res) {
            if (res.status == 'success') {
                alert('修改成功');
                $('.addStudentForm')[0].reset();
                $('.model').slideUp();
                $('.left-menu dd[data-id=student-list]').trigger('click');
            }
        });
    });
    //关键字搜索
    $('.search-submit').on('click', function (e) {
        var value = $('#search-word').val();
        searchWord = value;
        flag = true;
        if (value) {
            getSearchData();
        } else {
            getTableData();
        }
    })
}
// 获取搜索数据
function getSearchData() {
    if (flag) {
        curPage = 1;
        flag = false;
    }
    transferData('/api/student/searchStudent', {
        sex: -1,
        search: searchWord,
        page: curPage,
        size: pageSize
    }, function (res) {
        if (res.status == 'success') {
            var data = res.data.searchList;
            var allPage = Math.ceil(res.data.cont / 10);
            renderTable(data);
            $('#turn-page').turnPage({
                curPage: curPage,
                allPage: allPage,
                changePage: (page) => {
                    curPage = page;
                    getSearchData();
                }
            });
        }
    });
}

// 获取表单数据
function getFormData(dom) {
    var data = dom.serializeArray();
    // console.log(data);
    var result = {};
    data.forEach(function (ele, index) {
        result[ele.name] = ele.value;
    });
    return result;
}
// 获取学生列表数据
function getTableData() {
    transferData('/api/student/findByPage', {
        page: curPage,
        size: pageSize
    }, function (res) {
        if (res.status == 'success') {
            var data = res.data.findByPage;
            tableData = data;//保存到全局
            var allPage = Math.ceil(res.data.cont / pageSize);//计算总页数
            $('#turn-page').turnPage({
                curPage: curPage,
                allPage: allPage,
                changePage: (page) => {
                    curPage = page;//改变当前页的时候赋值
                    getTableData(curPage);
                }
            });
            renderTable(data);//渲染表格数据
        }
    });
}
// 渲染表格数据
function renderTable(data) {
    var str = '';
    data.forEach(function (ele, index) {
        str += '<tr>\
                    <td>' + ele.sNo + '</td>\
                    <td>' + ele.name + '</td>\
                    <td>' + (ele.sex ? '女' : '男') + '</td>\
                    <td>' + ele.email + '</td>\
                    <td>' + (new Date().getFullYear() - ele.birth) + '</td>\
                    <td>' + ele.phone + '</td>\
                    <td>' + ele.address + '</td>\
                    <td>\
                        <button class="btn add" data-index=' + index + '>编辑</button>\
                        <button class="btn del" data-index=' + index + '>删除</button>\
                    </td>\
                </tr>';
    });
    $('.student-list table tbody').html(str);
    bindTableEvent();
}
//编辑和删除按钮
function bindTableEvent() {
    $('.btn.add').on('click', function () {
        $('.model.show').slideDown();
        var index = $(this).attr('data-index');
        renderAddForm(tableData[index]);
    });
    $('.model.show .model-content').on('click', function (e) {
        e.stopPropagation();
    })
    $('.model.show').on('click', function () {
        $('.model.show').slideUp();
    });
    $('.btn.del').on('click', function () {
        var index = $(this).attr('data-index');
        var isDel = window.confirm('确认删除？');
        if (isDel) {
            transferData('/api/student/delBySno', {
                sNo: tableData[index].sNo
            }, function (e) {
                alert('删除成功');
                $('.left-menu dd[data-id=student-list]').trigger('click');
            });
        }
    });
}
//表单回填
function renderAddForm(data) {
    var $addForm = $('.addStudentForm')[0];
    for (prop in data) {
        console.log(prop)
        if ($addForm[prop]) {
            $addForm[prop].value = data[prop];
        }
    }
}


// 页面初始化
(function () {
    bindEvent();
    $('.left-menu dd[data-id=student-list]').trigger('click');
})();