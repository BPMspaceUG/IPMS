$(document).ready(function () {
    $('#connect').click(function (e) {
        // Prevent form submission
        e.preventDefault();
        // Use Ajax to submit form data
        $.ajax({
            url: $('form').attr('action'),
            type: 'POST',
            dataType: 'json',
            data: $('form').serialize(),
            success: function (result) {
                if (result != null) {
                    $('.fa-check').css({
                        display: 'inline-block'
                    });
                    $('.fa-minus-circle').css({
                        display: 'none'
                    });

                    console.log(result);

                } else {
                    $('.fa-minus-circle').css({
                        display: 'inline-block'
                    });
                    $('.fa-check').css({
                        display: 'none'
                    });
                }
            },
            error: function (jqXHR, exception) {
                $('.fa-minus-circle').css({
                    display: 'inline-block'
                });
                $('.fa-check').css({
                    display: 'none'
                });
            }
        });
    });
    // Saving new Values in Table
    $('#save').click(function (e) {
        // Prevent form submission
        e.preventDefault();
        // Use Ajax to submit form data
        $.ajax({
            url: "modules/ConnCrud.php",
            type: 'POST',
            data: $('form').serialize(),
            success: function (result) {
                if (result == 1)
                    alert("Connection has been saved");
                if(result == 0)
                    alert("This Connection already exists");
                else if(result == 404)
                    alert("Please fill all the connection parameters");
            },
            fail: function () {
                alert("There was a Problem connecting to the server, Kindly contact administrator or your developer");
            }
        });
    });
});