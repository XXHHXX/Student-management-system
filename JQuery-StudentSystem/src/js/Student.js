function bindEvent() {
    $('.left-menu').on('click', 'dd', function (e) {
        var id = $(this).attr('data-id');
        $('.content').fadeOut();
        $('.' + id).fadeIn();
        $('.left-menu dd.active').removeClass('active');
        $(this).addClass('active');
    })
}
bindEvent();