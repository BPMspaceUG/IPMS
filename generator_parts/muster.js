// Global variables
var gTables = [];
// Plugins
var $;
//var angular: any;
var Viz;
var StateMachine = /** @class */ (function () {
    function StateMachine() {
    }
    StateMachine.prototype.getHTML = function () {
        return "";
    };
    return StateMachine;
}());
var SortOrder;
(function (SortOrder) {
    SortOrder["ASC"] = "ASC";
    SortOrder["DESC"] = "DESC";
})(SortOrder || (SortOrder = {}));
var Table = /** @class */ (function () {
    function Table(tablename, columns, hasSM) {
        if (hasSM === void 0) { hasSM = false; }
        this.AscDesc = SortOrder.ASC;
        this.PageLimit = 10;
        this.PageIndex = 0;
        this.jQSelector = '';
        this.tablename = tablename;
        this.PageIndex = 0;
        this.actRowCount = 0;
        this.Columns = columns;
        // Get the Primary column name
        var PriCol;
        Object.keys(columns).forEach(function (col) {
            if (columns[col].EXTRA == 'auto_increment')
                PriCol = col;
        });
        this.PrimaryColumn = PriCol;
        this.Filter = '';
        this.Filter_Old = '';
        this.Form_Create = ''; // TODO: Load from Server
        this.getFormCreate();
        if (hasSM)
            this.SM = new StateMachine();
        else
            this.SM = null;
    }
    Table.prototype.getFormCreate = function () {
        var me = this;
        //console.log("Request FORM-Create.... for Table", this.tablename)
        $.ajax({
            method: "POST",
            url: window.location.pathname,
            contentType: 'json',
            data: JSON.stringify({
                cmd: 'getFormCreate',
                paramJS: { table: this.tablename }
            })
        }).done(function (response) {
            //console.log("Form-Create ['", me.tablename,"'] (Raw):", response)
            if (response.length > 0)
                me.Form_Create = response;
        });
    };
    Table.prototype.getRows = function () {
        return this.Rows;
    };
    Table.prototype.getRowByID = function (RowID) {
        var result = null;
        var me = this;
        this.Rows.forEach(function (row) {
            if (row[me.PrimaryColumn] == RowID) {
                result = row;
            }
        });
        return result;
    };
    Table.prototype.deleteRow = function (RowID) {
        return false;
    };
    Table.prototype.updateRow = function (RowID) {
        return false;
    };
    Table.prototype.toggleSort = function (ColumnName) {
        //console.log("toggle Sort for Column", ColumnName)
        this.AscDesc = (this.AscDesc == SortOrder.DESC) ? SortOrder.ASC : SortOrder.DESC;
        this.OrderBy = ColumnName;
        // Refresh
        this.loadRows(this.jQSelector);
    };
    Table.prototype.getSelectedRows = function () {
        return this.selectedIDs[0];
    };
    Table.prototype.countRows = function (do_render) {
        if (do_render === void 0) { do_render = false; }
        var me = this;
        var joins = this.buildJoinPart(this);
        // HTTP Request
        //console.log("HTTP-Request (Count) @ Table:", this.tablename)
        $.ajax({
            method: "POST",
            url: window.location.pathname,
            contentType: 'json',
            data: JSON.stringify({
                cmd: 'read',
                paramJS: {
                    table: this.tablename,
                    limitStart: this.PageIndex * this.PageLimit,
                    limitSize: this.PageLimit,
                    select: '*, COUNT(*) AS cnt',
                    where: '',
                    filter: this.Filter,
                    orderby: this.OrderBy,
                    ascdesc: this.AscDesc,
                    join: joins
                }
            })
        }).done(function (response) {
            //console.log("Count-Response (Raw):", response)
            if (response.length > 0) {
                var resp = JSON.parse(response);
                if (resp.length > 0) {
                    me.actRowCount = parseInt(resp[0].cnt);
                }
            }
            // Render?
            if (do_render)
                me.renderHTML(me.jQSelector);
        });
    };
    Table.prototype.buildJoinPart = function (t) {
        var joins = [];
        Object.keys(t.Columns).forEach(function (col) {
            // Check if there is a substitute for the column
            if (t.Columns[col].foreignKey.table != "") {
                t.Columns[col].foreignKey.replace = col;
                joins.push(t.Columns[col].foreignKey);
            }
        });
        return joins;
    };
    Table.prototype.loadRows = function (jQSelector) {
        var me = this;
        this.Filter = $(jQSelector + " .filterText").val(); // TODO: Improve, more than one module
        // Check Filter event -> jmp to page 1
        if ((this.Filter != this.Filter_Old) && this.PageIndex != 0)
            this.PageIndex = 0;
        var joins = this.buildJoinPart(this);
        // HTTP Request
        console.log("HTTP-Request (loadRows) @ Table:", this.tablename);
        // AJAX
        $.ajax({
            method: "POST",
            url: window.location.pathname,
            contentType: 'json',
            data: JSON.stringify({
                cmd: 'read',
                paramJS: {
                    table: this.tablename,
                    limitStart: this.PageIndex * this.PageLimit,
                    limitSize: this.PageLimit,
                    select: '*',
                    where: '',
                    filter: this.Filter,
                    orderby: this.OrderBy,
                    ascdesc: this.AscDesc,
                    join: joins
                }
            })
        }).done(function (response) {
            // use "me" instead of "this", because of async functions
            // console.log("Response (Raw)", response)
            var resp = JSON.parse(response);
            me.Rows = resp;
            // Reset Filter Event
            if (me.Filter) {
                if (me.Filter.length > 0)
                    me.Filter_Old = me.Filter;
            }
            // Render HTML
            me.jQSelector = jQSelector; // TODO: Put in constructor, and improve count (not every time)
            //if ((me.Rows.length >= me.PageLimit) && (me.PageIndex == 0))
            me.countRows(true);
            //else {
            //me.actRowCount = me.Rows.length
            //me.renderHTML(jQSelector)
            //}      
        });
    };
    Table.prototype.getPrimaryColumn = function () {
        return this.PrimaryColumn;
    };
    Table.prototype.setPageIndex = function (targetIndex) {
        var newIndex = targetIndex;
        var lastPageIndex = this.getNrOfPages() - 1;
        // Check borders
        if (targetIndex < 0)
            newIndex = 0; // Lower limit
        if (targetIndex > lastPageIndex)
            newIndex = lastPageIndex; // Upper Limit
        // Set new index
        this.PageIndex = newIndex;
        // Refresh
        this.loadRows(this.jQSelector);
    };
    Table.prototype.getNrOfPages = function () {
        return Math.ceil(this.actRowCount / this.PageLimit);
    };
    Table.prototype.getPaginationButtons = function () {
        var MaxNrOfButtons = 5;
        var NrOfPages = this.getNrOfPages();
        // Pages are less then NrOfBtns => display all
        if (NrOfPages <= MaxNrOfButtons) {
            var pages = new Array(NrOfPages);
            for (var i = 0; i < pages.length; i++)
                pages[i] = i - this.PageIndex;
        }
        else {
            // Pages > NrOfBtns display NrOfBtns
            pages = new Array(MaxNrOfButtons);
            // Display start edge
            if (this.PageIndex < Math.floor(pages.length / 2))
                for (var i = 0; i < pages.length; i++)
                    pages[i] = i - this.PageIndex;
            // Display middle
            else if ((this.PageIndex >= Math.floor(pages.length / 2))
                && (this.PageIndex < (NrOfPages - Math.floor(pages.length / 2))))
                for (var i = 0; i < pages.length; i++)
                    pages[i] = -Math.floor(pages.length / 2) + i;
            // Display end edge
            else if (this.PageIndex >= NrOfPages - Math.floor(pages.length / 2)) {
                for (var i = 0; i < pages.length; i++)
                    pages[i] = NrOfPages - this.PageIndex + i - pages.length;
            }
        }
        return pages;
    };
    Table.prototype.getHTMLStatusText = function (obj) {
        if (obj.actRowCount > 0)
            return 'Showing Entries ' + ((obj.PageIndex * obj.PageLimit) + 1) + '-' +
                ((obj.PageIndex * obj.PageLimit) + obj.Rows.length) + ' of ' + obj.actRowCount + ' Entries';
        else
            return '';
    };
    // TODO: Put in LoadRows function
    Table.prototype.renderHTML = function (jQSelector) {
        var _this = this;
        $(jQSelector).empty(); // GUI: Clear entries
        var me = this;
        var ths = '<th></th>'; // Pre fill with 1 because of selector
        Object.keys(me.Columns).forEach(function (col) {
            ths += '<th onclick="getTable(\'' + me.tablename + '\').toggleSort(\'' + col + '\')"' +
                (col == me.OrderBy ? 'class="sorted"' : '') + '>' +
                me.Columns[col].column_alias +
                (col == me.OrderBy ? '&nbsp;<i class="fa fa-caret-' +
                    (me.AscDesc == SortOrder.ASC ? 'up' : (me.AscDesc == SortOrder.DESC ? 'down' : '')) + '"></i>' : '');
            '</th>';
        });
        if (!me.Filter)
            me.Filter = ''; // Set Filter to empty-string
        var pgntn = '';
        this.getPaginationButtons().forEach(function (btnIndex) {
            pgntn += '<li' + (_this.PageIndex == _this.PageIndex + btnIndex ? ' class="active"' : '') + '><a onclick="setPage(\'' +
                me.tablename + '\', ' + (_this.PageIndex + btnIndex) + ')">' +
                (_this.PageIndex + 1 + btnIndex) +
                '</a></li>';
        });
        var header = '<div class="element">' +
            '<p class="form-inline">' +
            '<input class="form-control filterText" style="max-width: 300px" placeholder="Filter..."' +
            'onkeydown="javascript: if(event.keyCode == 13) getTable(\'' + me.tablename + '\').loadRows(\'' + jQSelector + '\');">' +
            // Filter Button
            '&nbsp;<button class="btn btn-default" onclick="getTable(\'' + me.tablename + '\').loadRows(\'' + jQSelector + '\')">' +
            '<i class="fa fa-search"></i> Filter</button>' +
            // Workflow Button 
            '&nbsp;<button class="btn btn-default" onclick="openSEPopup(\'' + me.tablename + '\')"' + (me.SM ? '' : ' disabled') + '>' +
            '<i class="fa fa-random"></i> Workflow</button>' +
            // Create Button
            '&nbsp;<button class="btn btn-success" onclick="createEntry(\'' + me.tablename + '\')">' +
            '<i class="fa fa-plus"></i> Create</button>' +
            '</p>' +
            '<div class="datatbl"><table class="table table-hover tableCont"><thead><tr>' + ths + '</tr></thead><tbody>';
        var footer = '</tbody></table></div>' +
            '<div class="footer">' +
            '<p class="pull-left">' + me.getHTMLStatusText(me) + '</p>' +
            '<ul class="pagination pull-right">' + pgntn + '</ul>' +
            '<div class="clearfix"></div>' +
            '</div>' +
            '</div>';
        var tds = '';
        // Loop Rows
        if (!me.Rows)
            return;
        me.Rows.forEach(function (row) {
            var data_string = '<td class="controllcoulm">' +
                '<i class="fa fa-pencil"></i>' +
                '<i class="fa fa-trash" onclick="deleteRow(\'' + me.tablename + '\', ' + row[me.PrimaryColumn] + ')"></i>' +
                '</td>';
            // Loop Columns
            Object.keys(me.Columns).forEach(function (col) {
                var value = row[col];
                // Check if it is displayed
                if (me.Columns[col].is_in_menu) {
                    // Build edit String TODO: optimize with callback
                    var modRowStr = 'modifyRow(\'' + me.tablename + '\', ' + row[me.PrimaryColumn] + ')';
                    if (value) {
                        // Truncate Cell if Content is too long
                        value = formatCell(value);
                        // Check for statemachine
                        if (col == 'state_id' && me.tablename != 'state')
                            data_string += '<td onclick="' + modRowStr + '">' +
                                '<span class="label label-state state' + row['state_id'][0] + '">' + value + '</span></td>';
                        else
                            data_string += '<td onclick="' + modRowStr + '">' + value + '</td>';
                    }
                    else {
                        data_string += '<td onclick="' + modRowStr + '">&nbsp;</td>'; // Add empty cell
                    }
                }
            });
            tds += '<tr class="datarow" id="row-' + row[me.PrimaryColumn] + '">' + data_string + '</tr>';
        });
        // GUI
        $(jQSelector).append(header + tds + footer);
        $(jQSelector + ' .filterText').focus().val('').val(me.Filter);
    };
    return Table;
}());
function createEntry(table_name) {
    $('#modalCreateEntry .modal-title b').text(table_name); // Set title
    // Set Form
    var htmlForm = getTable(table_name).Form_Create;
    $('#modalCreateEntry .create_form').html(htmlForm);
    // Show Modal
    $('#modalCreateEntry').modal('show');
}
function setState(tablename, RowID, targetStateID) {
    var t = getTable(tablename);
    var PrimaryColumn = t.getPrimaryColumn();
    var data = { state_id: 0 };
    data[PrimaryColumn] = RowID;
    data.state_id = targetStateID;
    $.ajax({
        method: "POST",
        url: window.location.pathname,
        contentType: 'json',
        data: JSON.stringify({
            cmd: 'makeTransition',
            paramJS: {
                table: tablename,
                row: data
            }
        })
    }).done(function (response) {
        //console.log("RAW:", response)
        if (response.length > 0) {
            // Messages ausgeben
            var msgs = JSON.parse(response);
            //console.log(msgs);
            msgs.forEach(function (msg) {
                if (msg.show_message)
                    showResult(msg.message);
            });
            // Close Edit Window
            $('#modalEditEntry').modal('hide');
            getTable(tablename).loadRows(".table_x");
        }
    });
}
function renderEditForm(Table, RowID, PrimaryColumn, htmlForm, nextStates) {
    $('#modalEditEntry .edit_form').html(htmlForm);
    $('#modalEditEntry .edit_form').append('<input style="display:none;" type="text" name="' + PrimaryColumn + '" value="' + RowID + '">');
    // Write all input fields with {key:value}
    var row = Table.getRowByID(RowID);
    var inputs = $('#modalEditEntry :input');
    inputs.each(function () {
        var e = $(this);
        var value = row[e.attr('name')];
        if (Array.isArray(value)) {
            // FK
            e.val(value[1]);
            // Save ID hidden
            $('#modalEditEntry .edit_form').append('<input style="display:none;" type="text" name="' + e.attr('name') + '" value="' + value[0] + '">');
        }
        else
            e.val(value);
    });
    // Next states buttons
    $('#modalEditEntry .footer_btns').empty();
    nextStates.forEach(function (s) {
        //console.log(s)
        var btn = '<button class="btn btn-primary" onclick="setState(\''
            + Table.tablename + '\', ' + RowID + ', ' + s.id + ')">' + s.name + '</button>';
        $('#modalEditEntry .footer_btns').append(btn);
    });
    // Show Modal
    $('#modalEditEntry').modal('show');
}
function modifyRow(table_name, id) {
    // Indicate which row is getting modified
    addClassToDataRow(id, 'warning');
    var t = getTable(table_name);
    // if is in a FK-Modal return selected Row
    if (t.jQSelector.indexOf("#") >= 0) {
        t.selectedIDs = [];
        t.selectedIDs.push(id);
        return;
    }
    else {
        // open edit modal
        $('#modalEditEntry .modal-title b').text(table_name); // Set title
        // Set Form
        if (t.SM) {
            var PrimaryColumn = t.getPrimaryColumn();
            var data = {};
            data[PrimaryColumn] = id;
            $.ajax({
                method: "POST",
                url: window.location.pathname,
                contentType: 'json',
                data: JSON.stringify({
                    cmd: 'getFormData',
                    paramJS: {
                        table: t.tablename,
                        row: data
                    }
                })
            }).done(function (response) {
                //console.log("Form-Create ['", me.tablename,"'] (Raw):", response)
                if (response.length > 0) {
                    var htmlForm = response;
                    // NEXT STATES
                    $.ajax({
                        method: "POST",
                        url: window.location.pathname,
                        contentType: 'json',
                        data: JSON.stringify({
                            cmd: 'getNextStates',
                            paramJS: {
                                table: t.tablename,
                                row: data
                            }
                        })
                    }).done(function (response) {
                        if (response.length > 0) {
                            var nextstates = JSON.parse(response);
                            renderEditForm(t, id, PrimaryColumn, htmlForm, nextstates);
                        }
                    });
                }
            });
        }
        else {
            var htmlForm = t.Form_Create;
            var PrimaryColumn = t.getPrimaryColumn();
            $('#modalEditEntry .edit_form').html(htmlForm);
            $('#modalEditEntry .edit_form').append('<input style="display:none;" type="text" name="' + PrimaryColumn + '" value="' + id + '">');
            // Write all input fields with {key:value}
            var row = t.getRowByID(id);
            var inputs = $('#modalEditEntry :input');
            inputs.each(function () {
                var e = $(this);
                e.val(row[e.attr('name')]);
            });
            // Buttons
            $('#modalEditEntry .footer_btns').empty();
            var btn = '<button class="btn btn-primary" onclick="saveEntry()" type="button">Save &amp; Close</button>';
            $('#modalEditEntry .footer_btns').append(btn);
            // Show Modal
            $('#modalEditEntry').modal('show');
        }
    }
}
// BUTTON SAVE + Close
function saveEntry() {
    var tablename = $('#modalEditEntry .modal-title b').text();
    // Read out all input fields with {key:value}
    var inputs = $('#modalEditEntry :input');
    var data = {};
    inputs.each(function () {
        var e = $(this);
        data[e.attr('name')] = e.val();
    });
    console.log("Request UPDATE", data);
    // Request
    $.ajax({
        method: "POST",
        url: window.location.pathname,
        contentType: 'json',
        data: JSON.stringify({
            cmd: 'update',
            paramJS: {
                table: tablename,
                row: data
            }
        })
    }).done(function (response) {
        console.log("Update", response);
        if (response.length > 0) {
            $('#modalEditEntry').modal('hide');
            getTable(tablename).loadRows(".table_x");
        }
        else {
            //alert("Element could not be updated!")
        }
    });
}
// BUTTON Create
$('#btnCreateEntry').click(function () {
    var tablename = $('#modalCreateEntry .modal-title b').text();
    // Read out all input fields with {key:value}
    var inputs = $('#modalCreateEntry :input');
    var data = {};
    inputs.each(function () {
        var e = $(this);
        data[e.attr('name')] = e.val();
    });
    //data['state_id'] = '%!%PLACE_EP_HERE%!%';
    //console.log("CREATE REQUEST", data)
    // Request
    $.ajax({
        method: "POST",
        url: window.location.pathname,
        contentType: 'json',
        data: JSON.stringify({
            cmd: 'create',
            paramJS: {
                table: tablename,
                row: data
            }
        })
    }).done(function (response) {
        console.log("Create", response);
        var resp = JSON.parse(response);
        if (resp.element_id > 0) {
            $('#modalCreateEntry').modal('hide');
            getTable(tablename).loadRows(".table_x");
        }
        else {
            alert("Element could not be created!");
        }
    });
});
function getTable(table_name) {
    var result;
    gTables.forEach(function (t) {
        if (t.tablename === table_name) {
            result = t;
        }
    });
    return result;
}
/************************** ANGULAR START *************************/
var app = angular.module("genApp", []);
//--- Controller
app.controller('genCtrl', function ($scope, $http, $filter) {
    /*
    // Variables
    $scope.tables = []
    $scope.isLoading = true
    $scope.selectedRow = {} // TODO: Remove
    $scope.FKTbl = [] // TODO: Remove
    $scope.pendingState = false
    $scope.FKactKey = ''
  
    // TODO: Remove this function
    // THIS Functions are obsolete!!!
    $scope.getTableByName = function(table_name) {
      if (typeof table_name != "string") return
      return $scope.tables[table_name]
    }
    $scope.getRowByID = function(RowID){
      var t: Table = getTable($scope.selectedTable.table_name)
      return t.getRowByID(RowID)
    }
    $scope.parseDate = function(date_string) {
      return new Date(date_string)
    }
    $scope.openFK = function(key) {
      // TODO: save key
      $scope.FKactKey = key
      var fk_table_name = $scope.selectedTable.columns[key].foreignKey.table
      // Get the table from foreign key
      getTable(fk_table_name).loadRows("#foreignTable")
      // Show Modal
      $('#myFKModal').modal('show')
    }
    */
    $scope.changeTab = function (table_name) {
        var result = getTable(table_name);
        result.loadRows(".table_x");
    };
    /*
    $scope.saveEntry = function() {
      // Task is already loaded in memory
      $scope.send($scope.selectedTable.table_name, 'update')
    }
    /*
    $scope.convertAllDatesToUTC = function(table, row) {
      for (var key in row) {
        if (row.hasOwnProperty(key)) {
          if (table.columns[key]) {
            // Load the Database string into JS-Object
            if (table.columns[key].DATA_TYPE == 'date'
            || table.columns[key].DATA_TYPE == 'datetime') {
              //console.log("Convert1: ", row[key])
              if (row[key]) {
                  //console.log("Convert2: ", row[key])
                var starttime = new Date(row[key]);
                var isotime = new Date((new Date(starttime)).toISOString() );
                var fixedtime = new Date(isotime.getTime()-(starttime.getTimezoneOffset()*60000));
                var formatedMysqlString = fixedtime.toISOString().slice(0, 19).replace('T', ' ');
                row[key] = formatedMysqlString//new Date(row[key]).toISOString();
              }
            }
          }
        }
      }
      return row
    }
    $scope.convertDateTimeStrToDate = function(datestring) {
      if (!datestring) return null
      if (datestring == "") return null
      if(datestring == '0000-00-00 00:00:00') return null
      return new Date(datestring)
    }
    $scope.editEntry = function(table, row) {
      // Load the row
      //$scope.loadRow(table, row)
      // Check if there is a Date field
      /*
      for (var key in $scope.selectedRow) {
        if (row.hasOwnProperty(key)) {
          if (table.columns[key]) {
            // Load the Database string into JS-Object
            if (table.columns[key].DATA_TYPE == 'date'
            || table.columns[key].DATA_TYPE == 'datetime') {
              // Convert Date + Time to Object
              $scope.selectedRow[key] = $scope.convertDateTimeStrToDate($scope.selectedRow[key])
            }
          }
        }
      }
      // TODO: Remove and get the Form for each state at Init
      $scope.send(table.table_name, "getFormData")
      $scope.hideSmBtns = true
    }
  
    $scope.gotoState = function(nextstate) {
      $scope.selectedTable.hideSmBtns = true
      $scope.selectedRow['state_id'] = nextstate.id // set next stateID
      $scope.send($scope.selectedTable.table_name, 'makeTransition')
    }
  */
    // TODO: Also change this function
    $scope.initTables = function () {
        console.log("Loading configuration...");
        // Request data from config file
        $http({
            url: window.location.pathname,
            method: 'post',
            data: {
                cmd: 'init',
                paramJS: ''
            }
        }).success(function (resp) {
            // Init each table
            Object.keys(resp).forEach(function (t) {
                gTables.push(new Table(resp[t].table_name, resp[t].columns, resp[t].se_active));
            });
            // save in tables var
            $scope.tables = resp;
            //console.log("Config loaded.", resp)
            // GUI
            $scope.isLoading = false;
            // First Tab selection
            var res = Object.keys(resp).filter(function (t) { return resp[t].is_in_menu; });
            var first_tbl_name = res[0];
            //$scope.selectedTable = $scope.tables[first_tbl_name] //$scope.getTableByName()
            $('#' + first_tbl_name).tab('show');
            var result = getTable(first_tbl_name);
            result.loadRows(".table_x");
        });
    };
    //------------------------------------------------------- Statemachine functions
    $scope.initTables();
    //============================================== Basic Send Method
    /*
      $scope.send = function(tablename, command, param) {
    
        // if params are given load params
        if (param) $scope.loadRow(param.table, param.row)
        var body = {cmd: 'cud', paramJS: {}} // Skeleton
        var t = $scope.getTableByName(tablename)
    
        //------------------- Assemble Data (Check for valid commands, useful on client?)
        if (command == 'create' || command == 'delete' ||	command == 'update' ||
        command == 'getFormData' || command == 'getFormCreate' ||
        command == 'getNextStates' ||	command == 'getStates' ||
        command == 'makeTransition') {
    
          $scope.pendingState = true
    
          // Confirmation when deleting // TODO: Outsource this
          if (command == 'delete') {
            var IsSure = confirm("Do you really want to delete this entry?")
            if (!IsSure) return
          }
    
          // Prepare Data
          body.paramJS = {row : $scope.selectedRow, table : t.table_name}
          // Special preprations ATTENTION! Client Side
          body.paramJS.row = prepareRow(body.paramJS.row)
          // TODO: Improve
          /*
          if (command == 'create') {
            if (t.se_active) body.paramJS.row.state_id = '%!%PLACE_EP_HERE%!%';
          }
    
        }
        // ------------------- Send request
        console.log("===> POST --- CMD:", command, "--- params=", body.paramJS)
    
        // Request
        $http({
          url: window.location.pathname,
          method: 'post',
          data: {
            cmd: command,
            paramJS: body.paramJS
          }
        }).success(function(response) {
          // Response
          console.log("<= ResponseData: ", response)
          $scope.pendingState = false
    
          //-------------------- table data was modified
          if (response != 0 && (command == 'delete' || command == 'update' || command == 'create')) {
            
            // Created
                    if (command == 'create') {
                if (response.show_message) {
                showResult(response.message)
              }
              // Hide create-modal
              if (response.element_id) {
                $('#modalCreate').modal('hide')
              }
              else if (!response.element_id || response.element_id <= 0) {
                alert("Error: New entry could not be created.")
              }
            }
            var result: Table = getTable(t.table_name)
            result.loadRows(".table_x")
            // TODO: Wait... Imrove not with wait func LeL
            //console.log("Success:", $scope.selectedRow[result.PrimaryColumn])
            setTimeout(function(){
              addClassToDataRow($scope.selectedRow[result.PrimaryColumn], 'success')
            }, 1000)
          }
          else if (command == 'getFormData') {
            if (response != "1") {
                $scope.send(t.table_name, "getNextStates") // get next States
                t.form_data = response
            }
            $('#modalEdit').modal('show')
          }
          else if (command == 'getFormCreate') {
            // Save in scope
            t.CreateForm = response
            t.form_data = response
          }
          //---------------------- StateEngine (List Transitions)
          else if (command == 'getNextStates') {
            // Save next States
            t.nextstates = response
            t.hideSmBtns = false
          }
          else if (command == 'makeTransition') {
    
            $('#modalEdit').modal('hide') // Close modal
            var result: Table = getTable(t.table_name)
            result.loadRows(".table_x")
            console.log("Success:", $scope.selectedRow[result.PrimaryColumn])
            setTimeout(function(){
              addClassToDataRow($scope.selectedRow[result.PrimaryColumn], 'success')
            }, 1000)
    
            // Show messages
            var rsp = response
            for (var i=0; i<rsp.length; i++) {
              // Message
              if (rsp[i].show_message) {
                showResult(rsp[i].message)
              }
            }
          }
          else {
            // Error from server
            alert("Error at ["+command+"] command.\nThe server returned:\n" + response)
          }
        })
      }*/
});
/************************** ANGULAR END *************************/
// Every time a modal is shown, if it has an autofocus element, focus on it.
/*
$('#myFKModal').on('shown.bs.modal', function() { $(this).find('[autofocus]').focus() });
$('#modalCreate').on('shown.bs.modal', function() { $(this).find('[autofocus]').first().focus() });
$('#modalEdit').on('shown.bs.modal', function() { $(this).find('[autofocus]').first().focus() });
*/
// Overlay of many Modal windows
$(document).on('show.bs.modal', '.modal', function () {
    var zIndex = 1040 + (10 * $('.modal:visible').length);
    $(this).css('z-index', zIndex);
    setTimeout(function () {
        $('.modal-backdrop').not('.modal-stack').css('z-index', zIndex - 1).addClass('modal-stack');
    }, 0);
});
// TODO: UNUSED
function prepareRow(row) {
    console.log("prepareRow", row);
    var r = {};
    Object.keys(row).forEach(function (key) {
        if (row.hasOwnProperty(key)) {
            if (Array.isArray(row[key]))
                r[key] = row[key][0];
            else
                r[key] = row[key];
        }
    });
    return r;
}
function setPage(tablename, newIndex) {
    getTable(tablename).setPageIndex(newIndex);
}
function formatCell(cellStr) {
    var trunc_len = 30;
    if (typeof cellStr == 'string') {
        // String, and longer than X chars
        if (cellStr.length >= trunc_len)
            return cellStr.substr(0, 30) + "\u2026";
    }
    else if (Array.isArray(cellStr)) {
        // Foreign Key
        return cellStr[1];
    }
    return cellStr;
}
function showResult(content) {
    //console.log("Open modal from Script...")
    $(".sm_result").html(content);
    $('#modalResult').modal('show');
}
function addClassToDataRow(id, classname) {
    $('.datarow').removeClass(classname);
    $('#row-' + id).addClass(classname);
}
/*
function test() {
  // Get scope - TODO: Remove
  var scope = angular.element(document.getElementById("webapp")).scope()
  var FKeyCol = scope.FKactKey
  var fk_table_name = scope.selectedTable.columns[FKeyCol].foreignKey.table
  var FKS = getTable(fk_table_name).getSelectedRows();
  //console.log(fk_table_name, FKeyCol, FKS)
  scope.selectedRow[FKeyCol] = FKS;
  $('#myFKModal').modal('hide');
  //console.log("XYX",scope.selectedRow)
}*/
// TODO: OPTIMZE!!
// TODO: Make a callback function
function deleteRow(tablename, id) {
    var data = {};
    var PrimaryColumn;
    PrimaryColumn = getTable(tablename).getPrimaryColumn();
    data[PrimaryColumn] = id;
    var IsSure = confirm("Do you really want to delete this entry?");
    if (!IsSure)
        return;
    // Request
    $.ajax({
        method: "POST",
        url: window.location.pathname,
        contentType: 'json',
        data: JSON.stringify({
            cmd: 'delete',
            paramJS: {
                table: tablename,
                row: data
            }
        })
    }).done(function (response) {
        console.log("Deleted...", response);
        if (response == "1")
            addClassToDataRow(id, 'danger');
    });
}
//--------------------- Drawing Functions for StateMachine Render
// TODO: Put in TS-Class
function openSEPopup(table_name) {
    var t = getTable(table_name);
    if (!t)
        return;
    var smLinks, smNodes;
    // Get nodes
    $.ajax({
        method: "POST",
        url: window.location.pathname,
        contentType: 'json',
        data: JSON.stringify({
            cmd: 'getStates', paramJS: { table: table_name }
        })
    }).done(function (response) {
        smNodes = JSON.parse(response);
        // Get links
        $.ajax({
            method: "POST",
            url: window.location.pathname,
            contentType: 'json',
            data: JSON.stringify({
                cmd: 'smGetLinks', paramJS: { table: table_name }
            })
        }).done(function (response) {
            smLinks = JSON.parse(response);
            // Render the StateMachine as SVG
            var strSVG = transpileSMtoDOT(smNodes, smLinks);
            renderDOTtoSVG(strSVG);
            //drawTokens(t)
            // Finally, if everything is loading, show Modal
            $('#modalStateMachine').modal('show');
        });
    });
}
function renderDOTtoSVG(strHTML) {
    document.getElementById("statediagram").innerHTML = Viz(strHTML);
}
function transpileSMtoDOT(smNodes, smLinks) {
    var strLinks = "";
    var strLabels = "";
    var strEP = "";
    // Build Links-String
    smLinks.forEach(function (e) {
        if (e.from == e.to)
            strLinks += "s" + e.from + " -> s" + e.to + ";\n";
        else
            strLinks += "s" + e.from + " -> s" + e.to + ";\n";
    });
    // Build-Nodes String
    smNodes.forEach(function (e) {
        // draw EntryPoint
        if (e.entrypoint == 1)
            strEP = "start->s" + e.id + ";\n"; // [Start] -> EntryNode
        // Check if is exit node
        var extNd = isExitNode(e.id, smLinks); // Set flag
        // Actual State
        var strActState = "";
        if (!extNd) // no Exit Node
            strLabels += 's' + e.id + ' [label="' + formatLabel(e.name) + '"' + strActState + '];\n';
        else // Exit Node
            strLabels += 's' + e.id + ' [label="\n\n\n' + formatLabel(e.name) +
                '" shape=doublecircle color=gray20 fillcolor=gray20 fixedsize=true width=0.1 height=0.1];\n';
    });
    // Give back vaild DOT String
    var result = "\n  digraph G {\n    # global\n    rankdir=LR; outputorder=edgesfirst; pad=0.5; splines=line;\n    node [style=\"rounded, filled\" fillcolor=gray95 color=gray20 fontcolor=gray20 fontname=\"Helvetica-bold\" shape=record fontsize=8];\n    edge [fontsize=10 color=gray70 arrowhead=open];\n    start [label=\"\" shape=circle color=gray20 fillcolor=gray20 width=0.15 height=0.15];\n    # links\n    " + strEP + "\n    " + strLinks + "\n    # nodes\n    " + strLabels + "\n  }";
    //console.log(result)
    return result;
}
function drawTokens(tbl) {
    // Clear all Tokens from SVG
    $(".token").remove();
    // Add Tokens
    tbl.smNodes.forEach(function (e) {
        if (e.NrOfTokens > 0)
            drawTokenToNode(e.id, e.NrOfTokens);
    });
}
function isExitNode(NodeID, links) {
    var res = true;
    links.forEach(function (e) {
        if (e.from == NodeID && e.from != e.to)
            res = false;
    });
    return res;
}
function formatLabel(strLabel) {
    var newstr = strLabel; //.replace(" ", "\n")
    return newstr; //strLabel.replace(/(.{10})/g, "$&" + "\n")
}
function drawTokenToNode(state_id, text) {
    // Get Position of Node
    var pos = $("title").filter(function () {
        return $(this).text() === 's' + state_id;
    }).parents(".node");
    // Find Text
    var txt = pos.find("text");
    var x = parseFloat(txt.attr("x"));
    var y = parseFloat(txt.attr("y"));
    y = y + 19;
    // Add Badge
    var existingContent = pos.html();
    //x = x - 5 // (text.toString().length * 3) // center
    text = text.toString();
    var toInsert = '<g class="token"><circle class="token_bg" cx="' + x + '" cy="' + y + '" fill="#5599dd" r="8"></circle>' +
        '<text class="token_txt" x="' + (x - (2.5 * text.length)) + '" y="' + (y + 3.5) + '" fill="white" font-size="8px">' + text + '</text></g>';
    pos.html(existingContent + toInsert);
}
