$(document).ready(function() {

    $('#options').click(function() {
        $('#interface').show();
    });

    $('#go').click(function() {
      console.log("click");
              $('#interface').hide();
    });

});