$('#search').keyup(function(event){
  if($(this).val() == ''){
    $('.wrap-info').html('');
  }
  else{
    var q = $(this).val();
    $.ajax({
      method: "POST",
      url: '/search?q='+q,
      data: {name: q},
      success: function(data){
        $('.wrap-info').html(data)
      }
    })
  }
});
// $('.msgbox').hide()
var toUser;
// $(document).on('click', '.info' ,function(){
//   toUser = $(this).find('.username').text();
//   $('.msgbox').show()
// });
