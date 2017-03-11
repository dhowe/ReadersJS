$(document).ready(function() {

    $('#options').click(function() {
        $('#interface').show();
    });

    $('#go').click(function() {
      console.log("click");
      $('#interface').hide();
    });
    
    //hide interface when clicking elsewhere
    $('body').click(function(event) {
        if (event.pageX > 520 || event.pageY > 524) {
          $("#interface").hide();
        }
    });
    
});