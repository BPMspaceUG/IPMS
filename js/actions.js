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
                    '<td class="bpm-id">' + value.id + '</td>' +
                    '<td class="bpm-host">' + value.host + '</td>' +
                    '<td class="bpm-user">' + value.user + '</td>' +
                    '<td class="bpm-port">' + value.port + '</td>' +
                    '<td><a href="#" class="bpm-load btn btn-info">Load</a></td>' +
                    '<td><a href="modules/ConnCrud.php?id=' + value.id + '" class="bpm-delete btn btn-danger">Delete</a></td>' +
                    '</tr>');
            });
        },
        error: function (jqXHR, exception) {
            console.log(jqXHR);
            console.log(exception);
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

                    //Appending Database and Tables
                    $.each(result, function (key, val) {
                        var tables = val.tables;
                        $('#sqlDatabases').append('<option value="' + val.database + '">' + val.database + '</option>');
                        $('#sqlTables').append('<ul class="bpm-checkboxes" id="' + val.database + '"></ul>');
                        $.each(tables, function (key, value) {
                            $('#' + val.database).append('<li class="bpm-options"><input type="radio" name="' + val.database + '" class=""' +
                                ' value="' + value.table + '">' +
                                '<p class="bpm-db-table">' + value.table + '</p></li>');
                        });
                    });


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
    $('.connection-values').on('click', '.bpm-load', function (event) {
        event.preventDefault();
        var host = $(this).parent().parent().find('.bpm-host').text();
        var port = $(this).parent().parent().find('.bpm-port').text();
        var user = $(this).parent().parent().find('.bpm-user').text();
        $('#sqlServer').val(host);
        $('#sqlPort').val(port);
        $('#username').val(user);
        $('#loadDb').modal('toggle');
    });

    //Revealing tables for selected Database
    $('#sqlDatabases').change(function () {
        var item = $(this);
        $('.bpm-active').removeClass('bpm-active');
        $('#' + item.val()).addClass('bpm-active');
    });

    //Getting Table_Name code for selected table
    $('#create').click(function (event) {
        event.preventDefault();
        var name = $('.bpm-checkboxes.bpm-active input[type="radio"]:checked').val();
        // alert(name);
        $.ajax({
            url: 'modules/GenerateFile.php',
            type: 'GET',
            data: {'fName':name},
            success: function (result) {
                $('#bpm-code').empty();
                $('#bpm-code').text(result);

            }
        });
    });
});