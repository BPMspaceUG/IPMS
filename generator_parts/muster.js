function doModal(idStr, heading, content, footer, isBig) {
    if (isBig === void 0) { isBig = false; }
    if (isBig === void 0) {
        isBig = false;
    }
    // Check if ID exists then add Number -> like 'idStrxxx'
    while ($("#" + idStr).length) {
        idStr += "x";
    }
    var sizeType = '';
    if (isBig)
        sizeType = ' modal-lg';
    // Result
    var html = '<div id="' + idStr + '" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="confirm-modal" aria-hidden="true">';
    html += '<div class="modal-dialog' + sizeType + '">';
    html += '<div class="modal-content">';
    html += '<div class="modal-header">';
    html += '<button type="button" class="close" data-dismiss="modal" aria-label="Close">';
    html += '<span aria-hidden="true">&times;</span>';
    html += '</button>';
    html += '<h4>' + heading + '</h4>';
    html += '</div>';
    html += '<div class="modal-body">';
    html += '<span style="display:none;" class="stored_data"></span>';
    html += content;
    html += '</div>';
    html += '<div class="modal-footer">';
    html += footer;
    html += '<span class="btn btn-default" data-dismiss="modal"><i class="fa fa-times"></i> Close</span>';
    html += '</div>'; // content
    html += '</div>'; // dialog
    html += '</div>'; // footer
    html += '</div>'; // modalWindow
    $('body').append(html);
    $("#" + idStr).modal();
    $("#" + idStr).modal('show');
    // Remove from DOM on close
    $('#' + idStr).on('hidden.bs.modal', function (e) {
        $(this).remove();
    });
    // Return ID
    return idStr;
}
// Global variables
var gTables = [];
var gURL = window.location.pathname;
// Plugins
var $;
var Viz;
var Modal = /** @class */ (function () {
    function Modal(heading, content, footer, isBig) {
        if (footer === void 0) { footer = ''; }
        if (isBig === void 0) { isBig = false; }
        this.DOM_ID = 'msgBx';
        // Check if ID exists then add Number -> like 'idStrxxx'
        while ($("#" + this.DOM_ID).length) {
            this.DOM_ID += "X";
        }
        var sizeType = '';
        if (isBig)
            sizeType = ' modal-lg';
        // Result
        var html = '<div id="' + this.DOM_ID + '" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="confirm-modal" aria-hidden="true">';
        html += '<div class="modal-dialog' + sizeType + '">';
        html += '<div class="modal-content">';
        html += '<div class="modal-header">';
        html += '<button type="button" class="close" data-dismiss="modal" aria-label="Close">';
        html += '<span aria-hidden="true">&times;</span>';
        html += '</button>';
        html += '<h4>' + heading + '</h4>';
        html += '</div>';
        html += '<div class="modal-body">';
        // TODO: Remove this and store in object instead
        html += '<span style="display:none;" class="stored_data"></span>';
        html += content;
        html += '</div>';
        html += '<div class="modal-footer">';
        html += footer;
        html += '<span class="btn btn-default" data-dismiss="modal"><i class="fa fa-times"></i> Close</span>';
        html += '</div>'; // content
        html += '</div>'; // dialog
        html += '</div>'; // footer
        html += '</div>'; // modalWindow
        $('body').append(html);
        // Remove from DOM on close
        $('#' + this.DOM_ID).on('hidden.bs.modal', function (e) {
            $(this).remove();
        });
    }
    Modal.prototype.show = function () {
        $("#" + this.DOM_ID).modal();
        $("#" + this.DOM_ID).modal('show');
    };
    return Modal;
}());
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
        $.ajax({
            method: "POST",
            url: gURL,
            contentType: 'json',
            data: JSON.stringify({
                cmd: 'getFormCreate',
                paramJS: { table: this.tablename }
            })
        }).done(function (response) {
            if (response.length > 0)
                me.Form_Create = response;
        });
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
    // Core functions
    Table.prototype.createRow = function (row_data, callback) {
        console.log("Request [create]", row_data);
        // Request
        $.ajax({
            method: "POST",
            url: gURL,
            contentType: 'json',
            data: JSON.stringify({
                cmd: 'create',
                paramJS: {
                    table: this.tablename,
                    row: row_data
                }
            })
        }).done(function (response) {
            callback(response);
        });
    };
    Table.prototype.deleteRow = function (RowID, callback) {
        var data = {};
        data[this.PrimaryColumn] = RowID;
        console.log("Request [delete]", RowID);
        // Request
        $.ajax({
            method: "POST",
            url: gURL,
            contentType: 'json',
            data: JSON.stringify({
                cmd: 'delete',
                paramJS: {
                    table: this.tablename,
                    row: data
                }
            })
        }).done(function (response) {
            callback(response);
        });
    };
    Table.prototype.updateRow = function (RowID, new_data, callback) {
        console.log("Request [update] for ID" + RowID, new_data);
        // Request
        $.ajax({
            method: "POST",
            url: gURL,
            contentType: 'json',
            data: JSON.stringify({
                cmd: 'update',
                paramJS: {
                    table: this.tablename,
                    row: new_data
                }
            })
        }).done(function (response) {
            callback(response);
        });
    };
    Table.prototype.transitRow = function (RowID, TargetStateID, trans_data, callback) {
        if (trans_data === void 0) { trans_data = null; }
        var data = { state_id: 0 };
        if (trans_data)
            data = trans_data;
        data[this.PrimaryColumn] = RowID;
        data.state_id = TargetStateID;
        console.log("Request [transit] for ID" + RowID + " -> " + TargetStateID, trans_data);
        // Request
        $.ajax({
            method: "POST",
            url: gURL,
            contentType: 'json',
            data: JSON.stringify({
                cmd: 'makeTransition',
                paramJS: {
                    table: this.tablename,
                    row: data
                }
            })
        }).done(function (response) {
            callback(response);
        });
    };
    Table.prototype.toggleSort = function (ColumnName) {
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
        // Request
        console.log("Request [count]");
        $.ajax({
            method: "POST",
            url: gURL,
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
        var data = {
            table: this.tablename,
            limitStart: this.PageIndex * this.PageLimit,
            limitSize: this.PageLimit,
            select: '*',
            where: '',
            filter: this.Filter,
            orderby: this.OrderBy,
            ascdesc: this.AscDesc,
            join: joins
        };
        // HTTP Request
        console.log("Request [read] @ Table:", this.tablename);
        // AJAX
        $.ajax({
            method: "POST",
            url: gURL,
            contentType: 'json',
            data: JSON.stringify({
                cmd: 'read',
                paramJS: data
            })
        }).done(function (response) {
            // use "me" instead of "this", because of async functions
            //console.log("Response loadRows (Raw)", response)
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
    Table.prototype.formatCell = function (cellStr) {
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
            pgntn += '<li' + (_this.PageIndex == _this.PageIndex + btnIndex ? ' class="active"' : '') + '><a onclick="' +
                'getTable(\'' + me.tablename + '\').setPageIndex(' + (_this.PageIndex + btnIndex) + ')">' +
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
                '<i class="fa fa-trash" onclick="delRow(\'' + me.tablename + '\', ' + row[me.PrimaryColumn] + ')"></i>' +
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
                        value = me.formatCell(value);
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
// TODO:  Put the folowing functions in the classes, or reduce them
// BUTTON Create
function createEntry(table_name) {
    var htmlForm = getTable(table_name).Form_Create;
    var SaveBtn = '<button class="btn btn-success btnCreateEntry" type="button">Create</button>';
    var M = new Modal('Create Entry', htmlForm, SaveBtn, true);
    var ModalID = M.DOM_ID;
    // save hidden data in modal
    var data = { mid: ModalID, tablename: table_name };
    $('#' + ModalID + ' .stored_data').html(JSON.stringify(data));
    // Bind Buttonclick
    $('#' + ModalID + ' .btnCreateEntry').click(function () {
        // Recover hidden data from modal
        var Xdata = JSON.parse($(this).parent().parent().find('.stored_data').html());
        var tablename = Xdata.tablename;
        var MID = Xdata.mid;
        // Read out all input fields with {key:value}
        var inputs = $('#' + MID + ' :input');
        var data = {};
        inputs.each(function () {
            var e = $(this);
            if (e.attr('name'))
                data[e.attr('name')] = e.val();
        });
        // Only if statemachine active
        if (getTable(tablename).SM)
            data['state_id'] = '%!%PLACE_EP_HERE%!%';
        // RESPONSE
        function created(r) {
            var resp = JSON.parse(r);
            if (resp.element_id > 0) {
                $('#' + MID).modal('hide');
                getTable(tablename).loadRows(".table_x");
            }
            else {
                alert("Element could not be created!");
            }
        }
        // REQUEST
        getTable(tablename).createRow(data, created);
    });
    M.show();
}
// TODO: Function should be >>>setState(this, 13)<<<, for individual buttons
function setState(btn, tablename, RowID, targetStateID) {
    var Xdata = JSON.parse($(btn).parent().parent().find('.stored_data').html());
    //console.log(Xdata)
    var Mid = Xdata.mid;
    var t = getTable(tablename);
    // Read out all input fields with {key:value}
    var inputs = $('#' + Mid + ' :input');
    var data = {};
    inputs.each(function () {
        var e = $(this);
        if (e.attr('name'))
            data[e.attr('name')] = e.val();
    });
    // RESPONSE
    function transitioned(r) {
        if (r.length > 0) {
            // Messages ausgeben
            var msgs = JSON.parse(r);
            //console.log("TransitionResults:", msgs);
            msgs.forEach(function (msg) {
                if (msg.show_message)
                    showResult(msg.message);
            });
            // Close Edit Window
            $('#' + Mid).modal('hide');
            t.loadRows(".table_x");
        }
    }
    // REQUEST
    t.transitRow(RowID, targetStateID, data, transitioned);
}
function renderEditForm(Table, RowID, PrimaryColumn, htmlForm, nextStates) {
    // state Buttons
    var btns = '';
    nextStates.forEach(function (s) {
        var btn = '<button class="btn btn-primary" onclick="setState(this, \''
            + Table.tablename + '\', ' + RowID + ', ' + s.id + ')">' + s.name + '</button>';
        btns += btn;
    });
    // Show Modal
    var EditMID = doModal('msgboxEditEntry', 'Edit Entry', htmlForm, btns, true);
    // save hidden data in modal
    var data = { mid: EditMID, tablename: Table.tablename };
    $('#' + EditMID + ' .stored_data').html(JSON.stringify(data));
    // Load data from row and write to input fields with {key:value}
    var row = Table.getRowByID(RowID);
    var inputs = $('#' + EditMID + ' :input');
    inputs.each(function () {
        var e = $(this);
        var value = row[e.attr('name')];
        // isFK?
        if (Array.isArray(value)) {
            console.log("--> FK", e.attr('name'), value);
            // Special case if name = 'state_id'
            if (e.attr('name') == 'state_id') {
                e.parent().find('.label').text(value[1]);
            }
            else {
                e.parent().find('.fkval').text(value[1]);
            }
            // Save in hidden input
            e.val(value[0]);
        }
        else {
            e.val(value); // Normal
        }
    });
    // Add Primary ID --> TODO: in stored Data
    $('#' + EditMID + ' .modal-body').append('<input type="hidden" name="' + PrimaryColumn + '" value="' + RowID + '">');
}
function modifyRow(table_name, id) {
    // Indicate which row is getting modified
    addClassToDataRow(id, 'warning');
    var t = getTable(table_name);
    // if is in a FK-Modal return selected Row
    // TODO:
    if (t.jQSelector.indexOf("#") >= 0) {
        t.selectedIDs = [];
        t.selectedIDs.push(id);
        return;
    }
    else {
        // Set Form
        if (t.SM) {
            var PrimaryColumn = t.PrimaryColumn;
            var data = {};
            data[PrimaryColumn] = id;
            $.ajax({
                method: "POST",
                url: gURL,
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
                        url: gURL,
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
            // EDIT-Modal WITHOUT StateMachine
            var htmlForm = t.Form_Create;
            var PrimaryColumn = t.PrimaryColumn;
            var btn = '<button class="btn btn-primary" onclick="saveEntry(this)" type="button">Save &amp; Close</button>';
            var M = new Modal('Edit Entry', htmlForm, btn, true);
            var dataxx = { mid: M.DOM_ID, tablename: table_name };
            $('#' + M.DOM_ID + ' .stored_data').html(JSON.stringify(dataxx));
            $('#' + M.DOM_ID + ' .modal-body').append('<input type="hidden" name="' + PrimaryColumn + '" value="' + id + '">');
            // Write all input fields with {key:value}
            var row = t.getRowByID(id);
            var inputs = $('#' + M.DOM_ID + ' :input');
            inputs.each(function () {
                var e = $(this);
                var value = row[e.attr('name')];
                // isFK?
                if (Array.isArray(value)) {
                    console.log("--> FK", e.attr('name'), value);
                    // Special case if name = 'state_id'
                    if (e.attr('name') == 'state_id') {
                        e.parent().find('.label').text(value[1]);
                    }
                    else {
                        e.parent().find('.fkval').text(value[1]);
                    }
                    // Save in hidden input
                    e.val(value[0]);
                }
                else {
                    e.val(value); // Normal
                }
            });
            M.show();
        }
    }
}
// BUTTON SAVE + Close
function saveEntry(x) {
    var Xdata = JSON.parse($(x).parent().parent().find('.stored_data').html());
    var mid = Xdata.mid;
    var t = getTable(Xdata.tablename);
    // Read out all input fields with {key:value}
    var inputs = $('#' + mid + ' :input');
    var data = {};
    inputs.each(function () {
        var e = $(this);
        if (e.attr('name'))
            data[e.attr('name')] = e.val();
    });
    // RESPONSE
    function updated(r) {
        console.log(r);
        if (r.length > 0) {
            if (r != "0") {
                // Success
                $('#' + mid).modal('hide');
                t.loadRows(".table_x");
            }
            else {
                // Fail
                alert("Element could not be updated!");
            }
        }
    }
    // REQUEST
    t.updateRow(data[t.PrimaryColumn], data, updated);
}
function delRow(tablename, id) {
    // Ask 
    var IsSure = confirm("Do you really want to delete this entry?");
    if (!IsSure)
        return;
    // RESPONSE
    function deleted(r) {
        console.log("Deleted Row", r);
        if (r == "1") {
            addClassToDataRow(id, 'danger');
        }
    }
    // REQUEST
    getTable(tablename).deleteRow(id, deleted);
}
function getTable(table_name) {
    var result;
    gTables.forEach(function (t) {
        if (t.tablename === table_name) {
            result = t;
        }
    });
    return result;
}
function changeTab(tab) {
    var table_name = tab.attributes.href.textContent;
    table_name = table_name.replace('#', '');
    var result = getTable(table_name);
    result.loadRows(".table_x");
}
function initTables(callback) {
    // Request
    $.ajax({
        method: "POST",
        url: gURL,
        contentType: 'json',
        data: JSON.stringify({ cmd: 'init', paramJS: '' })
    }).done(function (response) {
        if (response.length > 0) {
            var resp = JSON.parse(response);
            callback(resp);
        }
    });
}
initTables(function (resp) {
    // Init each table
    Object.keys(resp).forEach(function (t) {
        gTables.push(new Table(resp[t].table_name, resp[t].columns, resp[t].se_active));
        // GUI - Add Tabs
        $('.nav-tabs').append('<li><a href="#' + resp[t].table_name +
            '" data-toggle="tab" onclick="changeTab(this)"><i class="' +
            resp[t].table_icon + '"></i>&nbsp;<span class="table_alias">' +
            resp[t].table_alias + '</span>' +
            '</a></li>');
    });
    // First Tab selection
    $('.nav-tabs li:first').addClass('active');
    gTables[0].loadRows(".table_x");
});
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
function openFK(x, fk_table_name, originalKey) {
    var SelectBtn = '<button class="btn btn-warning btnSelectFK" type="button"><i class="fa fa-check"></i> Select</button>';
    // Modal
    var M = new Modal('Select Foreign Key', '<div class="foreignTable"></div>', SelectBtn, true);
    var ModalID = M.DOM_ID; //doModal('msgboxSelectFK', 'Select Foreign Key', , SelectBtn, true)  
    // Load Table
    getTable(fk_table_name).loadRows('#' + ModalID + ' .foreignTable');
    // save hidden data in modal
    var stdata_caller = JSON.parse($(x).parent().parent().parent().parent().find('.stored_data').html());
    var callerMID = stdata_caller.mid;
    var data = { mid: ModalID, tablename: fk_table_name, orgKey: originalKey, fromMID: callerMID, originTable: stdata_caller.tablename };
    $('#' + ModalID + ' .stored_data').html(JSON.stringify(data));
    // Bind Buttonclick
    $('#' + ModalID + ' .btnSelectFK').click(function () {
        // Recover hidden data from modal
        var Xdata = JSON.parse($(this).parent().parent().find('.stored_data').html());
        var tablename = Xdata.tablename;
        var FKMID = Xdata.mid;
        var FKS = getTable(tablename).getSelectedRows();
        var orgKey = Xdata.orgKey;
        var callerMID = Xdata.fromMID;
        // Hide FK Modal
        $('#' + FKMID).modal('hide');
        // Find Edit Entry Modal and set Rows
        var element = $('#' + callerMID + ' input[name=\'' + orgKey + '\'');
        element.val(FKS); // Set value
        // TODO:
        var ForeignRow = getTable(fk_table_name).getRowByID(FKS);
        var col_subst = getTable(Xdata.originTable).Columns[orgKey].foreignKey.col_subst;
        var val_subst = ForeignRow[col_subst];
        console.log("Pick", col_subst);
        console.log("XXX", Xdata);
        element.parent().find('.fkval').text(val_subst); // Set GUI
    });
    M.show();
}
function showResult(content) {
    var ModalID = doModal('msgboxSmFeedback', '<i class="fa fa-random"></i> StateMachine Feedback', content, '');
    console.log("SM Feedback ModalID=", ModalID);
}
function addClassToDataRow(id, classname) {
    $('.datarow').removeClass(classname);
    $('#row-' + id).addClass(classname);
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
        url: gURL,
        contentType: 'json',
        data: JSON.stringify({
            cmd: 'getStates', paramJS: { table: table_name }
        })
    }).done(function (response) {
        smNodes = JSON.parse(response);
        // Get links
        $.ajax({
            method: "POST",
            url: gURL,
            contentType: 'json',
            data: JSON.stringify({
                cmd: 'smGetLinks', paramJS: { table: table_name }
            })
        }).done(function (response) {
            smLinks = JSON.parse(response);
            // Render the StateMachine JSON DATA in DOT Language
            var strSVG = transpileSMtoDOT(smNodes, smLinks);
            //drawTokens(t)
            // Finally, if everything is loading, show Modal
            var MID = doModal('msgboxSM', 'StateMachine', '<div class="statediagram" style="max-height: 600px; overflow: auto;"></div>', '', true);
            console.log("Open Modal SM", MID);
            $("#" + MID + " .statediagram").html(Viz(strSVG));
        });
    });
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
