$(document).ready(function () {
    //Loading data for display on page load
    $.ajax({
        url: 'modules/ConnCrud.php',
        type: 'GET',
        dataType: 'json',
        data: '',
        success: function (data) {
            $.each(data, function (index, value) {
                $('.connection-values').append('<tr>' +
                    '<td class="bpm-id">' + value.id   + '</td>' +
                    '<td class="bpm-host">' + value.host + '</td>' +
                    '<td class="bpm-user">' + value.user + '</td>' +
                    '<td class="bpm-port">' + value.port + '</td>' +
                    '<td><a href="#" class="bpm-load btn btn-info">Load</a></td>' +
                    '<td><a href="modules/ConnCrud.php?id='+value.id+'" class="bpm-delete btn btn-danger">Delete</a></td>' +
                    '</tr>');
            });
        }
    });

//Sending Connection
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
    // Saving new connections in database
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
                if (result == 0)
                    alert("This Connection already exists");
                else if (result == 404)
                    alert("Please fill all the connection parameters");
            },
            fail: function () {
                alert("There was a Problem connecting to the server, Kindly contact administrator or your developer");
            }
        });
    });

    //Connection Load Action
    $('.bpm-load' ).click(function (e) {
        e.preventDefault();
        var id = $(this, '.connection-values.bpm-id');
        alert(id);
    });
});