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
        html += '<div class="modal-body" style="max-height: 600px; overflow:auto;">';
        // TODO: Maybe remove this and store in object instead
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
// TODO:
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
    function Table(isFK, DOMselector, tablename, columns, hasSM, readonly) {
        if (hasSM === void 0) { hasSM = false; }
        if (readonly === void 0) { readonly = false; }
        this.AscDesc = SortOrder.DESC;
        this.PageLimit = 10;
        this.PageIndex = 0;
        this.jQSelector = '';
        this.tablename = tablename;
        this.jQSelector = DOMselector;
        this.PageIndex = 0;
        this.actRowCount = 0;
        this.Columns = columns;
        this.ReadOnly = readonly;
        this.isFK = isFK;
        // Get the Primary column name
        var PriCol;
        Object.keys(columns).forEach(function (col) {
            if (columns[col].EXTRA == 'auto_increment')
                PriCol = col;
        });
        this.PrimaryColumn = PriCol;
        this.OrderBy = PriCol; // DEFAULT: Sort that newest element is on top
        this.Filter = '';
        this.Filter_Old = '';
        this.Form_Create = '';
        this.getFormCreate();
        if (hasSM)
            this.SM = new StateMachine();
        else
            this.SM = null;
        var me = this;
        this.countRows(function () { me.loadRows(); });
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
        var me = this;
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
            me.countRows(function () {
                callback(response);
            });
        });
    };
    Table.prototype.deleteRow = function (RowID, callback) {
        var me = this;
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
            me.countRows(function () {
                callback(response);
            });
        });
    };
    Table.prototype.updateRow = function (RowID, new_data, callback) {
        console.log("Request [update] for ID", RowID, new_data);
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
        console.log("Request [transit] for ID", RowID + " -> " + TargetStateID, trans_data);
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
        this.loadRows();
    };
    Table.prototype.getSelectedRows = function () {
        return this.selectedIDs[0];
    };
    // TODO: Only call this function once at [init] and then only on [create] and [delete] and at [filter]
    Table.prototype.countRows = function (callback) {
        var me = this;
        var joins = this.buildJoinPart(this);
        // Request
        console.log("Request [count] for Table", me.tablename);
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
                    // Call callback function
                    callback();
                }
            }
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
    Table.prototype.loadRows = function () {
        var me = this;
        // Check Filter event -> jmp to page 1
        this.Filter = $(this.jQSelector + " .filterText").val();
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
            var resp = JSON.parse(response);
            me.Rows = resp;
            // Reset Filter Event
            if (me.Filter) {
                if (me.Filter.length > 0)
                    me.Filter_Old = me.Filter;
            }
            me.renderHTML();
        });
    };
    Table.prototype.setPageIndex = function (targetIndex) {
        console.log("Set PageIndex", targetIndex);
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
        this.loadRows();
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
            if (cellStr[1] !== null)
                return cellStr[1];
            else
                return '';
        }
        return cellStr;
    };
    Table.prototype.getHTMLStatusText = function (t) {
        if (t.actRowCount > 0)
            return 'Showing Entries ' + ((t.PageIndex * t.PageLimit) + 1) + '-' +
                ((t.PageIndex * t.PageLimit) + t.Rows.length) + ' of ' + t.actRowCount + ' Entries';
        else
            return 'No Entries';
    };
    Table.prototype.renderHTML = function () {
        var t = this;
        var jQSelector = t.jQSelector;
        console.log("Render HTML for Table", t.tablename, " @ ", jQSelector);
        $(jQSelector).empty(); // GUI: Clear entries
        var ths = '';
        if (!t.ReadOnly) {
            ths = '<th></th>'; // Pre fill with 1 because of selector
        }
        // Data Rows
        Object.keys(t.Columns).forEach(function (col) {
            if (t.Columns[col].is_in_menu) {
                ths += '<th onclick="getTable(\'' + t.tablename + '\').toggleSort(\'' + col + '\')" class="datatbl_header' +
                    (col == t.OrderBy ? ' sorted' : '') + '">' +
                    t.Columns[col].column_alias +
                    (col == t.OrderBy ? '&nbsp;' + (t.AscDesc == SortOrder.ASC ? '⭣' : (t.AscDesc == SortOrder.DESC ? '⭡' : '')) + '' : '');
                '</th>';
            }
        });
        // This is required, otherwise the pagination does not work after searching anymore
        if (!t.Filter)
            t.Filter = ''; // Set Filter to empty-string
        var pgntn = '';
        t.getPaginationButtons().forEach(function (btnIndex) {
            pgntn += '<li' + (t.PageIndex == t.PageIndex + btnIndex ? ' class="active"' : '') + '><a onclick="' +
                'getTable(\'' + t.tablename + '\').setPageIndex(' + (t.PageIndex + btnIndex) + ')">' +
                (t.PageIndex + 1 + btnIndex) +
                '</a></li>';
        });
        var header = '<div class="element">' +
            '<p class="form-inline">' +
            '<input class="form-control filterText" style="max-width: 300px" placeholder="Filter..."' +
            'onkeydown="javascript: if(event.keyCode == 13) getTable(\'' + t.tablename + '\').loadRows();">' +
            // Filter Button
            '&nbsp;<button class="btn btn-default" onclick="getTable(\'' + t.tablename + '\').loadRows()"><i class="fa fa-search"></i> Filter</button>' +
            // Workflow Button 
            '&nbsp;<button class="btn btn-default" onclick="openSEPopup(\'' + t.tablename + '\')"' + (t.SM ? '' : ' disabled') + '>' +
            '<i class="fa fa-random"></i> Workflow</button>';
        // No Buttons if ReadOnly
        if (!t.ReadOnly) {
            header +=
                // Create Button
                '&nbsp;<button class="btn btn-success" onclick="createEntry(\'' + t.tablename + '\')">' +
                    '<i class="fa fa-plus"></i> Create</button>';
        }
        header += '</p><div class="datatbl"><table class="table table-hover tableCont"><thead><tr>' + ths + '</tr></thead><tbody>';
        var footer = '</tbody></table></div>' +
            '<div class="footer">' +
            '<p class="pull-left">' + t.getHTMLStatusText(t) + '</p>' +
            '<ul class="pagination pull-right">' + pgntn + '</ul>' +
            '<div class="clearfix"></div>' +
            '</div>' +
            '</div>';
        var tds = '';
        // Loop Rows
        if (!t.Rows)
            return;
        t.Rows.forEach(function (row) {
            var data_string = '';
            // Control column
            if (!t.ReadOnly) {
                data_string = '<td class="controllcoulm">' +
                    '<i class="fa fa-pencil"></i>' +
                    '<i class="fa fa-trash" onclick="delRow(\'' + t.tablename + '\', ' + row[t.PrimaryColumn] + ')"></i>' +
                    '</td>';
            }
            // Loop Columns
            Object.keys(t.Columns).forEach(function (col) {
                var value = row[col];
                // Check if it is displayed
                if (t.Columns[col].is_in_menu) {
                    // Build edit String TODO: optimize with callback
                    var modRowStr = '';
                    if (!t.ReadOnly) {
                        modRowStr = 'modifyRow(\'' + t.jQSelector + '\',\'' + t.tablename + '\', ' + row[t.PrimaryColumn] + ')';
                    }
                    // check Cell-Value
                    if (value) {
                        // Truncate Cell if Content is too long
                        value = t.formatCell(value);
                        // Check for statemachine
                        if (col == 'state_id' && t.tablename != 'state') {
                            data_string += '<td onclick="' + modRowStr + '">' +
                                '<span class="label label-state state' + row['state_id'][0] + '">' + value + '</span></td>';
                        }
                        else
                            data_string += '<td onclick="' + modRowStr + '">' + value + '</td>';
                    }
                    else {
                        data_string += '<td onclick="' + modRowStr + '">&nbsp;</td>'; // Add empty cell
                    }
                }
            });
            tds += '<tr class="datarow row-' + row[t.PrimaryColumn] + '">' + data_string + '</tr>';
        });
        // GUI
        $(jQSelector).append(header + tds + footer);
        $(jQSelector + ' .filterText').focus().val('').val(t.Filter);
        if (t.lastModifiedRowID != 0) {
            //console.log("--------->", t.lastModifiedRowID)
            addClassToDataRow(jQSelector, t.lastModifiedRowID, 'info');
            t.lastModifiedRowID = 0;
        }
    };
    return Table;
}());
// TODO:  Put the folowing functions in the classes, or reduce them
// BUTTON Create
function createEntry(table_name) {
    var htmlForm = getTable(table_name).Form_Create;
    var SaveBtn = '<button class="btn btn-success btnCreateEntry" type="button"><i class="fa fa-plus"></i> Create</button>';
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
        // TODO: Check Dry!!
        // Read out all input fields with {key:value}
        var inputs = $('#' + MID + ' :input');
        var data = {};
        inputs.each(function () {
            var e = $(this);
            var key = e.attr('name');
            if (key) {
                // Set all ForeignKeys to null, if empty and FK
                if (e.val() == '' && getTable(tablename).Columns[key].foreignKey.table != '') {
                    data[key] = null;
                }
                else
                    data[key] = e.val();
            }
        });
        // Only if statemachine active,
        // otherwise conflict when creating an entry in tabe 'state'
        if (getTable(tablename).SM)
            data['state_id'] = '%!%PLACE_EP_HERE%!%';
        // RESPONSE
        function created(r) {
            console.log("Create (RAW):", r);
            try {
                var msgs = JSON.parse(r);
            }
            catch (err) {
                console.log("Error:", r);
                return;
            }
            // Handle Transition Feedback
            console.log("TransScript:", msgs);
            msgs.forEach(function (msg) {
                // Show Message
                if (msg.show_message)
                    showResult(msg.message);
                // Check
                if (msg.element_id) {
                    if (msg.element_id > 0) {
                        $('#' + MID).modal('hide');
                        var t = getTable(tablename);
                        t.lastModifiedRowID = msg.element_id;
                        t.loadRows();
                    }
                    else {
                        alert("Element could not be created!");
                    }
                }
            });
        }
        // REQUEST
        getTable(tablename).createRow(data, created);
    });
    M.show();
}
// TODO: Function should be >>>setState(this, 13)<<<, for individual buttons
function setState(btn, tablename, RowID, targetStateID) {
    var Xdata = JSON.parse($(btn).parent().parent().find('.stored_data').html());
    var Mid = Xdata.mid;
    var t = getTable(tablename);
    // Read out all input fields with {key:value}
    // TODO: Check Dry!!
    // Read out all input fields with {key:value}
    var inputs = $('#' + Mid + ' :input');
    var data = {};
    inputs.each(function () {
        var e = $(this);
        var key = e.attr('name');
        if (key) {
            // Set all ForeignKeys to null, if empty and FK
            if (e.val() == '' && getTable(tablename).Columns[key].foreignKey.table != '') {
                data[key] = null;
            }
            else
                data[key] = e.val();
        }
    });
    // RESPONSE
    function transitioned(r) {
        console.log("Transition Feedback (RAW):", r);
        if (r.length > 0) {
            // Messages ausgeben
            var msgs = JSON.parse(r); // TODO: Try..catch
            msgs.forEach(function (msg) {
                if (msg.show_message)
                    showResult(msg.message);
            });
            // Close Edit Window
            $('#' + Mid).modal('hide');
            //console.log("xxx", RowID)
            t.lastModifiedRowID = RowID;
            t.loadRows();
        }
    }
    // REQUEST
    t.transitRow(RowID, targetStateID, data, transitioned);
}
function renderEditForm(Table, RowID, PrimaryColumn, htmlForm, nextStates) {
    var row = Table.getRowByID(RowID);
    // state Buttons
    var btns = '';
    var actStateID = row.state_id[0]; // ID
    nextStates.forEach(function (s) {
        var btn_text = s.name;
        if (actStateID == s.id)
            btn_text = '<i class="fa fa-floppy-o"></i> Save';
        var btn = '<button class="btn btn-primary" onclick="setState(this, \''
            + Table.tablename + '\', ' + RowID + ', ' + s.id + ')">' + btn_text + '</button>';
        btns += btn;
    });
    // Modal
    var M = new Modal('Edit Entry', htmlForm, btns, true);
    var EditMID = M.DOM_ID;
    // save hidden data in modal
    var data = { mid: EditMID, tablename: Table.tablename };
    $('#' + EditMID + ' .stored_data').html(JSON.stringify(data));
    // Load data from row and write to input fields with {key:value}
    //--------------------------------- DRY!
    var inputs = $('#' + EditMID + ' :input');
    inputs.each(function () {
        var e = $(this);
        var value = row[e.attr('name')];
        // isFK?
        if (Array.isArray(value)) {
            //console.log("--> FK", e.attr('name'), value)
            // Special case if name = 'state_id'
            if (e.attr('name') == 'state_id') {
                var label = e.parent().find('.label');
                label.addClass('state' + value[0]);
                label.text(value[1]);
            }
            else {
                // GUI Foreign Key
                e.parent().find('.fkval').text(value[1]);
            }
            // Save in hidden input
            e.val(value[0]);
        }
        else {
            e.val(value); // Normal
        }
    });
    //--------------------------------- /DRY!
    // Add Primary ID --> TODO: in stored Data
    $('#' + EditMID + ' .modal-body').append('<input type="hidden" name="' + PrimaryColumn + '" value="' + RowID + '">');
    M.show();
}
// TODO: Find Table by jQSel
function modifyRow(jQSel, table_name, id) {
    var t = getTable(table_name);
    // Indicate which row is getting modified
    addClassToDataRow(jQSel, id, 'warning');
    // if is in a FK-Modal return selected Row
    // TODO: not the best solution...
    //console.log("modifyRow [",jQSel,"]", table_name)
    if (jQSel.indexOf('foreignTable') > 0) {
        //console.log("FK selection took place", t)
        // ForeignKey
        t.selectedIDs = [];
        t.selectedIDs.push(id);
        // If is only 1 select then instant close window
        $(jQSel).parent().parent().find('.btnSelectFK').click();
        return;
    }
    else {
        // Set Form
        if (t.SM) {
            var PrimaryColumn = t.PrimaryColumn;
            var data = {};
            data[PrimaryColumn] = id;
            console.log("Request [getFormData for Table", t.tablename);
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
                console.log("Request [getNextStates]");
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
            // Save buttons
            var btn = '<button class="btn btn-primary" onclick="saveEntry(this, false)" type="button">Save</button>';
            btn += '<button class="btn btn-primary" onclick="saveEntry(this)" type="button">Save &amp; Close</button>';
            // Modal
            var M = new Modal('Edit Entry', htmlForm, btn, true);
            var dataxx = { mid: M.DOM_ID, tablename: table_name };
            $('#' + M.DOM_ID + ' .stored_data').html(JSON.stringify(dataxx));
            $('#' + M.DOM_ID + ' .modal-body').append('<input type="hidden" name="' + PrimaryColumn + '" value="' + id + '">');
            //--------------------------------- DRY!
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
                        var label = e.parent().find('.label');
                        label.text(value[1]);
                        label.addClass('state' + value[0]);
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
            //--------------------------------- /DRY!
            M.show();
        }
    }
}
// BUTTON SAVE + Close
function saveEntry(x, closeModal) {
    if (closeModal === void 0) { closeModal = true; }
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
        //console.log(r)
        if (r.length > 0) {
            if (r != "0") {
                // Success
                if (closeModal)
                    $('#' + mid).modal('hide');
                t.lastModifiedRowID = data[t.PrimaryColumn];
                t.loadRows();
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
            addClassToDataRow(getTable(tablename).jQSelector, id, 'danger');
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
// TODO: Put in class TableManager
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
initTables(function (data) {
    // Init each table
    Object.keys(data).forEach(function (t) {
        var newT = new Table(false, '.table_' + data[t].table_name, data[t].table_name, data[t].columns, data[t].se_active, data[t].is_read_only);
        gTables.push(newT);
        // GUI
        if (data[t].is_in_menu) {
            // GUI - Add Tabs
            $('.nav-tabs').append('<li><a href="#' + newT.tablename +
                '" data-toggle="tab"><i class="' +
                data[t].table_icon + '"></i>&nbsp;<span class="table_alias">' +
                data[t].table_alias + '</span>' +
                '</a></li>');
            // Add Tab panes too
            $('.tab-content').append('<div role="tabpanel" class="tab-pane' + (gTables.length == 1 ? ' active' : '') + '" id="' + newT.tablename + '">' +
                '<div class="table_' + newT.tablename + '"></div>' +
                '</div>');
        }
    });
    // First Tab selection
    $('.nav-tabs li:first').addClass('active');
});
// Overlay of many Modal windows (newest on top)
$(document).on('show.bs.modal', '.modal', function () {
    var zIndex = 1040 + (10 * $('.modal:visible').length);
    $(this).css('z-index', zIndex);
    setTimeout(function () {
        $('.modal-backdrop').not('.modal-stack').css('z-index', zIndex - 1).addClass('modal-stack');
    }, 0);
});
// Autofocus first input
$(document).on('shown.bs.modal', '.modal', function () {
    //console.log("focus first element...");
    $(this).find('input[type=text],textarea,select').filter(':visible:first').focus();
});
function openFK(x, fk_table_name, originalKey) {
    var SelectBtn = '<button class="btn btn-warning btnSelectFK" type="button"><i class="fa fa-check"></i> Select</button>';
    // Modal
    var M = new Modal('Select Foreign Key', '<div class="foreignTable"></div>', SelectBtn, true);
    var ModalID = M.DOM_ID;
    // Load Table
    var t = getTable(fk_table_name);
    var DOMsel = '#' + ModalID + ' .foreignTable';
    var t = new Table(true, DOMsel, fk_table_name, getTable(fk_table_name).Columns, (getTable(fk_table_name).SM !== null), false);
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
        element.val(FKS); // Set value in hidden field
        var ForeignRow = getTable(fk_table_name).getRowByID(FKS);
        var col_subst = getTable(Xdata.originTable).Columns[orgKey].foreignKey.col_subst;
        var val_subst = ForeignRow[col_subst];
        element.parent().find('.fkval').text(val_subst); // Set GUI
    });
    M.show();
}
function showResult(content) {
    var M = new Modal('StateMachine Feedback', content);
    M.show();
}
function addClassToDataRow(jQuerySelector, id, classname) {
    $(jQuerySelector + ' .datarow').removeClass(classname);
    $(jQuerySelector + ' .row-' + id).addClass(classname);
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
            var M = new Modal('StateMachine', '<div class="statediagram" style="max-height: 600px; overflow: auto;"></div>', '', true);
            var MID = M.DOM_ID;
            //console.log("Open Modal SM", MID)
            $("#" + MID + " .statediagram").html(Viz(strSVG));
            M.show();
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
