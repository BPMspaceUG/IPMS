/************************************************************
                      A N G U L A R     J S
************************************************************/
angular.module('appIPMS', [])
  .controller('IPMSController', function($scope) {
    var todoList = this;
    
    todoList.todos = [
      {text:'learn angular', done:true},
      {text:'build an angular app', done:false}];
 
    todoList.addTodo = function() {
      todoList.todos.push({text:todoList.todoText, done:false});
      todoList.todoText = '';
    };
 
    todoList.remaining = function() {
      var count = 0;
      angular.forEach(todoList.todos, function(todo) {
        count += todo.done ? 0 : 1;
      });
      return count;
    };
 
    todoList.archive = function() {
      var oldTodos = todoList.todos;
      todoList.todos = [];
      angular.forEach(oldTodos, function(todo) {
        if (!todo.done) todoList.todos.push(todo);
      });
    };
  });

  var asdf;
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
                    
                   // console.log(result);
                    asdf = result;
                    console.log(asdf);
                    
                    //Appending Database and Tables
                    $.each(result, function (key, val) {
                        var tables = val.tables;

                        // Databases
                        $('#sqlDatabases').append('<option value="' + val.database + '">' + val.database + '</option>');
                        
                        $('#sqlTables').append('<div class="bpm-checkboxes" id="' + val.database + '"><table class="table"></table></div>');
                        var index = 0;
                        $.each(tables, function (key, value) {
                            $('#' + val.database).append(
                              '<tr><td style="width:200px;">' + value.table_name + '</td>'+
                              '<td><input type="text" class="form-control" value="' + value.table_alias +'"/></td>'+
                              '<td><input type="text" class="form-control data_tblicon" value="' + value.table_icon +'"/></td>'+
                              '</tr>');
                            index += 1; // for identification
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
    
    var tbname = $('.bpm-checkboxes.bpm-active input[type="radio"]:checked').val();
    var dbname = $('#sqlDatabases option:selected').text();
    //var post_data = $('form').serialize() + '&table_name=' + name + '&db_name=' + db_name;
        
    console.log('------------------------------------- Create Button pressed');
    
    // Find database
    var index = -1;
    for (i=0;i<asdf.length;i++){
      if (asdf[i].database == dbname) {
        index = i;
      }
    }
    console.log("Index=" + index);
    
    // rewrite data array
    var n = 0; // TODO: Optimize...
    $('#'+dbname+' .data_tblicon').each(function () {
      // Write changes
      asdf[index].tables[n].table_icon = this.value;
      n += 1;
    });
    console.log(asdf[index]);
    
    var d = {
      host: $('#sqlServer')[0].value,
      port: $('#sqlPort')[0].value,
      user: $('#username')[0].value,
      pwd: $('#sqlPass')[0].value,
      db_name: dbname,
      data: asdf
    }
    
    console.log('------------------------------------- Data Array created');
    console.log(d);
    
    $.ajax({
        url: 'modules/GenerateFile.php',
        type: 'POST',
        data: d,
        success: function (result) {
            console.log('------------------------------------- Script generated');
            console.log(result);
            $('#bpm-code').empty();
            $('#bpm-code').html('<pre></pre>');
            $('#bpm-code pre').text(result);
            //alert("New Files have been Successfully Generated at server");
        }
    });
  });
});