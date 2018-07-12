// TODO: Do not use Global variables
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
// Plugins
var $;
// Global variables
var gTables = [];
var gConfig;
var gOptions = {
    showWorkflowButton: true,
    showFilter: true,
    smallestTimeUnitMins: true,
    showControlColumn: true,
    EntriesPerPage: 15
};
// Path for API
var path = window.location.pathname;
var pathName = path.substring(0, path.lastIndexOf('/') + 1);
var gURL = pathName + 'api/';
// Atomic Function for API Calls -> ensures Authorization 
function sendRequest(command, params, callback) {
    // Request (every Request is processed by this function)
    $.ajax({
        method: "POST",
        url: gURL,
        contentType: 'json',
        data: JSON.stringify({
            cmd: command,
            paramJS: params
        }),
        error: function (xhr, status) {
            // Not Authorized
            if (xhr.status == 401) {
                document.location.assign('login.php'); // Redirect to Login-Page
            }
            else if (xhr.status == 403) {
                alert("Sorry! You dont have the rights to do this.");
            }
        }
    }).done(function (response) {
        callback(response);
    });
}
var SortOrder;
(function (SortOrder) {
    SortOrder["ASC"] = "ASC";
    SortOrder["DESC"] = "DESC";
})(SortOrder || (SortOrder = {}));
//==============================================================
// Class: Modal
//==============================================================
var Modal = /** @class */ (function () {
    function Modal(heading, content, footer, isBig) {
        if (footer === void 0) { footer = ''; }
        if (isBig === void 0) { isBig = false; }
        this.DOM_ID = 'msgBx';
        // Check if ID exists then add Number -> like 'idStrxxx'
        while ($("#" + this.DOM_ID).length) {
            this.DOM_ID += "X";
        }
        // Set Params
        this.heading = heading;
        this.content = content;
        this.footer = footer;
        this.isBig = isBig;
        // Render and add to DOM-Tree
        var sizeType = '';
        if (this.isBig)
            sizeType = ' modal-lg';
        // Result
        var html = '<div id="' + this.DOM_ID + '" class="modal fade" tabindex="-1" role="dialog">';
        html += '<div class="modal-dialog' + sizeType + '" role="document">';
        html += '<div class="modal-content">';
        html += '<div class="modal-header">';
        html += '  <h5 class="modal-title">' + this.heading + '</h5>';
        html += '  <button type="button" class="close" data-dismiss="modal" aria-label="Close">';
        html += '    <span aria-hidden="true">&times;</span>';
        html += '  </button>';
        html += '</div>';
        html += '<div class="modal-body" style="max-height: 600px; overflow:auto;">';
        html += this.content;
        html += '</div>';
        html += '<div class="modal-footer">';
        html += '  <span class="customfooter">' + this.footer + '</span>';
        html += '  <span class="btn btn-secondary" data-dismiss="modal"><i class="fa fa-times"></i> Close</span>';
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
    Modal.prototype.setFooter = function (html) {
        $('#' + this.DOM_ID + ' .customfooter').html(html);
    };
    Modal.prototype.show = function () {
        $("#" + this.DOM_ID).modal();
        $("#" + this.DOM_ID).modal('show');
    };
    return Modal;
}());
//==============================================================
// Class: StateMachine
//==============================================================
var StateMachine = /** @class */ (function () {
    function StateMachine(tablename) {
        this.tablename = tablename;
    }
    StateMachine.prototype.openSEPopup = function () {
        var smLinks, smNodes;
        var me = this;
        sendRequest('getStates', { table: me.tablename }, function (r) {
            smNodes = JSON.parse(r);
            sendRequest('smGetLinks', { table: me.tablename }, function (r) {
                smLinks = JSON.parse(r);
                // Finally, when everything was loaded, show Modal
                var M = new Modal('StateMachine', '<div class="statediagram" style="width: 100%; height: 300px;"></div>', '<button class="btn btn-secondary fitsm">Fit</button>', true);
                var MID = M.DOM_ID;
                var container = document.getElementsByClassName('statediagram')[0];
                var nodes = smNodes;
                var edges = smLinks;
                for (var i = 0; i < nodes.length; i++) {
                    if (me.isExitNode(nodes[i].id, smLinks)) {
                        nodes[i]['color'] = '#c55';
                        nodes[i]['shape'] = 'dot';
                        nodes[i]['size'] = 10;
                    }
                    if (nodes[i].entrypoint == 1) {
                        // Add EntryPoint Node
                        nodes.push({ id: 0, color: '#5c5', shape: 'dot', size: 10 });
                        edges.push({ from: 0, to: nodes[i].id });
                    }
                }
                var data = {
                    nodes: nodes,
                    edges: edges
                };
                var options = {
                    edges: {
                        //smooth: { 'type': 'straightCross', 'forceDirection': 'horizontal'},
                        color: '#3598DC',
                        shadow: true,
                        length: 100,
                        arrows: 'to',
                        arrowStrikethrough: true,
                        dashes: false,
                        smooth: {
                            //'enabled': true,
                            "type": "cubicBezier",
                            "forceDirection": "horizontal",
                            "roundness": 1 // 0.2
                        }
                    },
                    nodes: {
                        shape: 'box',
                        //color: {background: 'white', border: '#333'},
                        margin: 20,
                        heightConstraint: {
                            minimum: 40
                        },
                        widthConstraint: {
                            minimum: 80,
                            maximum: 200
                        },
                        borderWidth: 2,
                        size: 24,
                        color: {
                            border: '#3598DC',
                            background: '#fff'
                        },
                        font: {
                            color: '#888888',
                            size: 16
                        },
                        shapeProperties: {
                            useBorderWithImage: false
                        },
                        scaling: {
                            min: 10,
                            max: 30
                        },
                        fixed: {
                            x: false,
                            y: false
                        }
                    },
                    layout: {
                        hierarchical: {
                            enabled: true,
                            direction: 'LR',
                            nodeSpacing: 150,
                            levelSeparation: 200,
                            sortMethod: 'directed'
                        }
                    },
                    physics: {
                        enabled: false
                    },
                    interaction: {
                        /*zoomView:false,*/
                        dragNodes: false
                        /*dragView: false*/
                    }
                };
                var network = new vis.Network(container, data, options);
                M.show();
                $('.fitsm').click(function () {
                    network.fit({ scale: 1, offset: { x: 0, y: 0 }, animation: { duration: 1000, easingFunction: 'easeInOutQuad' } });
                });
            });
        });
    };
    StateMachine.prototype.isExitNode = function (NodeID, links) {
        var res = true;
        links.forEach(function (e) {
            if (e.from == NodeID && e.from != e.to)
                res = false;
        });
        return res;
    };
    return StateMachine;
}());
//==============================================================
// Class: Table
//==============================================================
var Table = /** @class */ (function () {
    function Table(tablename, DOMSelector, selectableOne, callback, whereFilter, defaultObj) {
        if (selectableOne === void 0) { selectableOne = false; }
        if (callback === void 0) { callback = function () { }; }
        if (whereFilter === void 0) { whereFilter = ''; }
        if (defaultObj === void 0) { defaultObj = {}; }
        this.jQSelector = '';
        this.AscDesc = SortOrder.DESC;
        this.PageIndex = 0;
        this.Where = '';
        this.defaultObject = {}; // Default key:val object for creating
        var data = gConfig[tablename]; // Load data from global config
        this.tablename = tablename;
        this.jQSelector = DOMSelector;
        this.PageIndex = 0;
        this.actRowCount = 0;
        this.Columns = data.columns;
        this.ReadOnly = data.is_read_only;
        this.selOne = selectableOne;
        // GUI Settings
        this.PageLimit = gOptions.EntriesPerPage || 10;
        this.showFilter = gOptions.showFilter;
        this.showControlColumn = gOptions.showControlColumn;
        this.showWorkflowButton = gOptions.showWorkflowButton;
        this.smallestTimeUnitMins = gOptions.smallestTimeUnitMins;
        this.defaultObject = defaultObj;
        this.Where = whereFilter;
        // Get the Primary column name
        var PriCol;
        var SortCol = ''; // first visible Column
        Object.keys(data.columns).forEach(function (col) {
            if (data.columns[col].is_in_menu && SortCol == '')
                SortCol = col;
            if (data.columns[col].EXTRA == 'auto_increment')
                PriCol = col;
        });
        this.PrimaryColumn = PriCol;
        this.OrderBy = SortCol; // DEFAULT: Sort by first visible Col
        this.Filter = '';
        this.Filter_Old = '';
        this.Form_Create = '';
        var me = this;
        me.getFormCreate();
        // Initialize StateMachine for the Table
        if (data.se_active)
            me.SM = new StateMachine(me.tablename);
        else
            me.SM = null;
        // Download data from server
        me.countRows(function () {
            me.loadRows(function () {
                callback();
            });
        });
    }
    //=============  Helper functions
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
    Table.prototype.toggleSort = function (ColumnName) {
        this.AscDesc = (this.AscDesc == SortOrder.DESC) ? SortOrder.ASC : SortOrder.DESC;
        this.OrderBy = ColumnName;
        // Refresh
        this.loadRows();
    };
    Table.prototype.getSelectedRows = function () {
        return this.selectedIDs[0];
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
            else if ((this.PageIndex >= Math.floor(pages.length / 2))
                && (this.PageIndex < (NrOfPages - Math.floor(pages.length / 2))))
                for (var i = 0; i < pages.length; i++)
                    pages[i] = -Math.floor(pages.length / 2) + i;
            else if (this.PageIndex >= NrOfPages - Math.floor(pages.length / 2)) {
                for (var i = 0; i < pages.length; i++)
                    pages[i] = NrOfPages - this.PageIndex + i - pages.length;
            }
        }
        return pages;
    };
    Table.prototype.formatCell = function (cellStr) {
        var entityMap = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
            '/': '&#x2F;',
            '`': '&#x60;',
            '=': '&#x3D;'
        };
        function escapeHtml(string) {
            return String(string).replace(/[&<>"'`=\/]/g, function (s) {
                return entityMap[s];
            });
        }
        var trunc_len = 30;
        if (typeof cellStr == 'string') {
            // String, and longer than X chars
            if (cellStr.length >= trunc_len)
                return escapeHtml(cellStr.substr(0, 30) + "\u2026");
        }
        else if (Array.isArray(cellStr)) {
            // Foreign Key
            if (cellStr[1] !== null)
                return escapeHtml(cellStr[1]);
            else
                return '';
        }
        return escapeHtml(cellStr);
    };
    Table.prototype.getHTMLStatusText = function () {
        if (this.actRowCount > 0)
            return 'Showing Entries ' + ((this.PageIndex * this.PageLimit) + 1) + '-' +
                ((this.PageIndex * this.PageLimit) + this.Rows.length) + ' of ' + this.actRowCount + ' Entries';
        else
            return 'No Entries';
    };
    Table.prototype.renderHTML = function () {
        var t = this;
        var jQSelector = t.jQSelector;
        $(jQSelector).empty(); // GUI: Clear entries
        var ths = '';
        if (t.showControlColumn)
            ths = '<th></th>'; // Pre fill with 1 because of selector
        // Table Headers
        Object.keys(t.Columns).forEach(function (col) {
            if (t.Columns[col].is_in_menu) {
                ths += '<th onclick="getTableByjQSel(\'' + jQSelector + '\').toggleSort(\'' + col + '\')" class="datatbl_header' +
                    (col == t.OrderBy ? ' sorted' : '') + '">' +
                    t.Columns[col].column_alias +
                    (col == t.OrderBy ? '&nbsp;' + (t.AscDesc == SortOrder.ASC ?
                        '<i class="fa fa-sort-asc">' : (t.AscDesc == SortOrder.DESC ?
                        '<i class="fa fa-sort-desc">' : '')) + '' : '');
                '</th>';
            }
        });
        // Pagination
        var pgntn = '';
        var PaginationButtons = t.getPaginationButtons();
        // Only Display Buttons, when more than one Button exists
        if (PaginationButtons.length > 1)
            PaginationButtons.forEach(function (btnIndex) {
                pgntn += '<li class="page-item' + (t.PageIndex == t.PageIndex + btnIndex ? ' active' : '') + '"><a class="page-link" onclick="' +
                    'getTableByjQSel(\'' + jQSelector + '\').setPageIndex(' + (t.PageIndex + btnIndex) + ')">' +
                    (t.PageIndex + 1 + btnIndex) +
                    '</a></li>';
            });
        else
            pgntn += '';
        var header = '<div class="element"><div class="row">';
        // Filter
        if (t.showFilter) {
            header += '<div class="input-group col-12 col-sm-6 col-lg-3 mb-3">';
            header += '  <input type="text" class="form-control filterText" placeholder="Filter..." onkeydown="' +
                'if(event.keyCode == 13) { filterTable(\'' + jQSelector + '\'); }">';
            header += '  <div class="input-group-append">';
            header += '    <button class="btn btn-secondary" onclick="if (true) { filterTable(\'' + jQSelector + '\'); }" type="button"><i class="fa fa-search"></i></button>';
            header += '  </div>';
            header += '</div>';
        }
        header += '<div class="col-12 col-sm-6 col-lg-9 mb-3">';
        // Workflow Button
        if (t.SM && t.showWorkflowButton) {
            header += '<button class="btn btn-secondary" onclick="showSE(\'' + jQSelector + '\')"><i class="fa fa-random"></i>&nbsp;Workflow</button>';
        }
        // Create Button
        if (!t.ReadOnly) {
            header += '<a class="btn btn-success" onclick="createEntry(\'' + jQSelector + '\')"><i class="fa fa-plus"></i>&nbsp;Create</a>';
        }
        header += '</div></div>';
        header += '<div class="tablewrapper"><table class="table table-hover table-sm datatbl"><thead><tr>' + ths + '</tr></thead><tbody>';
        var footer = '</tbody></table></div>' +
            '<div>' +
            '<p class="pull-left"><small>' + t.getHTMLStatusText() + '</small></p>' +
            '<nav class="pull-right"><ul class="pagination">' + pgntn + '</ul></nav>' +
            '<div class="clearfix"></div>' +
            '</div>' +
            '</div>';
        //============================== data
        var tds = '';
        // Loop Rows
        if (!t.Rows)
            return;
        t.Rows.forEach(function (row) {
            // Build edit String
            var modRowStr = 'modifyRow(\'' + jQSelector + '\', ' + row[t.PrimaryColumn] + ')';
            // Control column
            var data_string = '';
            if (t.showControlColumn) {
                data_string = '<td class="controllcoulm" onclick="' + modRowStr + '">';
                // Entries are selectable?
                if (t.selOne) {
                    data_string += '<i class="fa fa-square-o"></i>';
                }
                else {
                    // Entries are editable
                    if (!t.ReadOnly)
                        data_string += '<i class="fa fa-pencil"></i>';
                }
                //data_string += '<!--<i class="fa fa-trash" onclick="delRow(\''+jQSelector+'\', '+row[t.PrimaryColumn]+')"></i>-->';
                data_string += '</td>';
            }
            // Loop Columns
            Object.keys(t.Columns).forEach(function (col) {
                var value = row[col];
                // Check if it is displayed
                if (t.Columns[col].is_in_menu) {
                    // check Cell-Value
                    if (value) {
                        // Truncate Cell if Content is too long
                        if (t.Columns[col].DATA_TYPE == 'date') {
                            var tmp = new Date(value);
                            if (!isNaN(tmp.getTime()))
                                value = tmp.toLocaleDateString('de-DE');
                            else
                                value = '';
                        }
                        else if (t.Columns[col].DATA_TYPE == 'time') {
                            // Remove seconds from TimeString
                            if (t.smallestTimeUnitMins) {
                                var timeArr = value.split(':');
                                timeArr.pop();
                                value = timeArr.join(':');
                            }
                        }
                        else if (t.Columns[col].DATA_TYPE == 'datetime') {
                            var tmp = new Date(value);
                            if (!isNaN(tmp.getTime())) {
                                value = tmp.toLocaleString('de-DE');
                                // Remove seconds from TimeString
                                if (t.smallestTimeUnitMins) {
                                    var timeArr = value.split(':');
                                    timeArr.pop();
                                    value = timeArr.join(':');
                                }
                            }
                            else
                                value = '';
                        }
                        else if (t.Columns[col].DATA_TYPE == 'tinyint') {
                            value = parseInt(value) !== 0 ? '<i class="fa fa-check text-center"></i>&nbsp;' : '';
                        }
                        else
                            value = t.formatCell(value);
                        // Check for statemachine
                        if (col == 'state_id' && t.tablename != 'state') {
                            // Modulo 12 --> see in css file (12 colors)
                            data_string += '<td><span class="badge label-state state' + (row['state_id'][0] % 12) + '">' + value + '</span></td>';
                        }
                        else
                            data_string += '<td>' + value + '</td>';
                    }
                    else {
                        // Add empty cell (null)
                        data_string += '<td>&nbsp;</td>';
                    }
                }
            });
            // Add row to table
            if (t.showControlColumn) {
                // Edit via first column
                tds += '<tr class="datarow row-' + row[t.PrimaryColumn] + '">' + data_string + '</tr>';
            }
            else {
                // Edit via click on full Row
                tds += '<tr class="datarow row-' + row[t.PrimaryColumn] + ' editFullRow" onclick="' + modRowStr + '">' + data_string + '</tr>';
            }
        });
        // GUI
        $(jQSelector).append(header + tds + footer);
        // Autofocus Filter
        if (t.Filter.length > 0)
            $(jQSelector + ' .filterText').focus().val('').val(t.Filter);
        else
            $(jQSelector + ' .filterText').val(t.Filter);
        // Mark last modified Row
        if (t.lastModifiedRowID) {
            if (t.lastModifiedRowID != 0) {
                addClassToDataRow(jQSelector, t.lastModifiedRowID, 'table-info');
                t.lastModifiedRowID = 0;
            }
        }
    };
    //=============  CORE functions
    Table.prototype.getFormCreate = function () {
        var me = this;
        sendRequest('getFormCreate', { table: me.tablename }, function (response) {
            if (response.length > 0)
                me.Form_Create = response;
        });
    };
    Table.prototype.getFormModify = function (data, callback) {
        var me = this;
        sendRequest('getFormData', { table: me.tablename, row: data }, function (response) {
            callback(response);
        });
    };
    Table.prototype.getNextStates = function (data, callback) {
        var me = this;
        sendRequest('getNextStates', { table: me.tablename, row: data }, function (response) {
            callback(response);
        });
    };
    Table.prototype.createRow = function (data, callback) {
        var me = this;
        sendRequest('create', { table: me.tablename, row: data }, function (r) {
            me.countRows(function () {
                callback(r);
            });
        });
    };
    Table.prototype.deleteRow = function (RowID, callback) {
        var me = this;
        var data = {};
        data[this.PrimaryColumn] = RowID;
        sendRequest('delete', { table: this.tablename, row: data }, function (response) {
            me.countRows(function () {
                callback(response);
            });
        });
    };
    Table.prototype.updateRow = function (RowID, new_data, callback) {
        sendRequest('update', { table: this.tablename, row: new_data }, function (response) {
            callback(response);
        });
    };
    Table.prototype.transitRow = function (RowID, TargetStateID, trans_data, callback) {
        if (trans_data === void 0) { trans_data = null; }
        var data = { state_id: 0 };
        if (trans_data)
            data = trans_data;
        // PrimaryColID and TargetStateID are the minimum Parameters which have to be set
        // also RowData can be updated in the client -> has also be transfered to server
        data[this.PrimaryColumn] = RowID;
        data.state_id = TargetStateID;
        sendRequest('makeTransition', { table: this.tablename, row: data }, function (response) {
            callback(response);
        });
    };
    // Call this function only at [init] and then only on [create] and [delete] and at [filter]
    Table.prototype.countRows = function (callback) {
        var me = this;
        var joins = this.buildJoinPart(this);
        var data = {
            table: this.tablename,
            select: '*, COUNT(*) AS cnt',
            where: this.Where,
            filter: this.Filter,
            join: joins
        };
        sendRequest('read', data, function (r) {
            if (r.length > 0) {
                var resp = JSON.parse(r);
                if (resp.length > 0) {
                    me.actRowCount = parseInt(resp[0].cnt);
                    // Callback method
                    callback();
                }
            }
        });
    };
    Table.prototype.loadRows = function (callback) {
        if (callback === void 0) { callback = function () { }; }
        var me = this;
        var FilterEvent = false;
        var joins = this.buildJoinPart(this);
        // Check Filter event -> jmp to page 1
        if (this.Filter != this.Filter_Old) {
            this.PageIndex = 0;
            FilterEvent = true;
        }
        var data = {
            table: this.tablename,
            limitStart: this.PageIndex * this.PageLimit,
            limitSize: this.PageLimit,
            select: '*',
            where: this.Where,
            filter: this.Filter,
            orderby: this.OrderBy,
            ascdesc: this.AscDesc,
            join: joins
        };
        // HTTP Request
        sendRequest('read', data, function (r) {
            // use "me" instead of "this", because of async functions
            var resp = JSON.parse(r);
            me.Rows = resp;
            // Reset Filter Event
            if (FilterEvent) {
                // Count Entries again and then render Table        
                me.countRows(function () {
                    me.renderHTML();
                    me.Filter_Old = me.Filter;
                    callback();
                });
            }
            else {
                // Render Table
                me.renderHTML();
                callback();
            }
        });
    };
    return Table;
}());
// TODO:  Put the folowing functions in the classes, or reduce them
// BUTTON Create
function createEntry(jQSel) {
    var t = getTableByjQSel(jQSel);
    var SaveBtn = '<a class="btn btn-success btnCreateEntry" type="button"><i class="fa fa-plus"></i>&nbsp;Create</a>';
    var M = new Modal('Create Entry', t.Form_Create, SaveBtn, true);
    var ModalID = M.DOM_ID;
    // Update all Labels
    updateLabels(ModalID, t);
    // Update Default values
    writeDataToForm('#' + ModalID, t.defaultObject, jQSel);
    // Save origin Table in all FKeys
    $('#' + ModalID + ' .inputFK').data('origintable', t.tablename);
    // Bind Buttonclick  
    $('#' + ModalID + ' .btnCreateEntry').click(function () {
        // Read out all input fields with {key:value}
        var data = readDataFromForm('#' + ModalID, jQSel);
        // REQUEST
        t.createRow(data, created);
        // RESPONSE
        function created(r) {
            // Remove all Error Messages
            $('#' + ModalID + ' .modal-body .alert').remove();
            try {
                var msgs = JSON.parse(r);
            }
            catch (err) {
                // Show Error        
                $('#' + ModalID + ' .modal-body').prepend('<div class="alert alert-danger" role="alert">' +
                    '<b>Script Error!</b>&nbsp;' + r +
                    '</div>');
                return;
            }
            // Handle Transition Feedback
            var counter = 0; // 0 = trans, 1 = in -- but only at Create!
            msgs.forEach(function (msg) {
                // Show Message
                if (msg.show_message)
                    showResult(msg.message, 'Feedback <small>' + (counter == 0 ? 'Transition-Script' : 'IN-Script') + '</small>');
                // Check
                if (msg.element_id) {
                    if (msg.element_id > 0) {
                        $('#' + ModalID).modal('hide');
                        t.lastModifiedRowID = msg.element_id;
                        t.loadRows();
                    }
                }
                else {
                    // ElementID has to be 0! otherwise the transscript aborted
                    if (msg.element_id == 0) {
                        $('#' + ModalID + ' .modal-body').prepend('<div class="alert alert-danger" role="alert">' +
                            '<b>Database Error!</b>&nbsp;' + msg.errormsg +
                            '</div>');
                    }
                }
                counter++;
            });
        }
    });
    M.show();
}
// TODO: Function should be >>>setState(this, 13)<<<, for individual buttons
function setState(MID, jQSel, RowID, targetStateID) {
    var t = getTableByjQSel(jQSel);
    var data = readDataFromForm('#' + MID, jQSel); // Read out all input fields with {key:value}
    // REQUEST
    t.transitRow(RowID, targetStateID, data, transitioned);
    // RESPONSE
    function transitioned(r) {
        // Remove all Error Messages
        $('#' + MID + ' .modal-body .alert').remove();
        try {
            var msgs = JSON.parse(r);
        }
        catch (err) {
            $('#' + MID + ' .modal-body').prepend('<div class="alert alert-danger" role="alert">' +
                '<b>Script Error!</b>&nbsp;' + r +
                '</div>');
            return;
        }
        // Handle Transition Feedback
        var counter = 0;
        msgs.forEach(function (msg) {
            // Remove all Error Messages
            $('#' + MID + ' .modal-body .alert').remove();
            // Show Message
            if (msg.show_message) {
                var info = "";
                if (counter == 0)
                    info = 'OUT-Script';
                if (counter == 1)
                    info = 'Transition-Script';
                if (counter == 2)
                    info = 'IN-Script';
                showResult(msg.message, 'Feedback <small>' + info + '</small>');
            }
            if (counter >= 2) {
                $('#' + MID).modal('hide'); // Hide only if reached IN-Script
                if (RowID != 0)
                    t.lastModifiedRowID = RowID;
                t.loadRows();
            }
            // Increase Counter
            counter++;
        });
    }
}
function updateLabels(ModalID, t) {
    // Update all Labels
    var labels = $('#' + ModalID + ' label');
    labels.each(function () {
        var label = $(this);
        var colname = label.parent().find('[name]').attr('name');
        if (colname) {
            var aliasCol = gConfig[t.tablename].columns[colname];
            if (aliasCol) {
                label.text(aliasCol.column_alias);
            }
        }
    });
}
function renderEditForm(Table, RowID, htmlForm, nextStates) {
    var row = Table.getRowByID(RowID);
    // Modal
    var M = new Modal('Edit Entry', htmlForm, '', true);
    var EditMID = M.DOM_ID;
    // state Buttons
    var btns = '<div class="btn-group" role="group">';
    var actStateID = row.state_id[0]; // ID
    nextStates.forEach(function (s) {
        var btn_text = s.name;
        if (actStateID == s.id)
            btn_text = '<i class="fa fa-floppy-o"></i> Save';
        var btn = '<button class="btn btn-primary state' + (s.id % 12) + '" onclick="setState(\'' + EditMID + '\', \'' + Table.jQSelector + '\', ' + RowID + ', ' + s.id + ')">' + btn_text + '</button>';
        btns += btn;
    });
    btns += '</div>';
    M.setFooter(btns);
    $('#' + EditMID + ' .label-state').addClass('state' + (actStateID % 12)).text(row.state_id[1]);
    // Update all Labels
    updateLabels(EditMID, Table);
    // Save origin Table in all FKeys
    $('#' + EditMID + ' .inputFK').data('origintable', Table.tablename);
    // Load data from row and write to input fields with {key:value}
    writeDataToForm('#' + EditMID, row, Table.jQSelector);
    // Add PrimaryID in stored Data
    $('#' + EditMID + ' .modal-body').append('<input type="hidden" name="' + Table.PrimaryColumn + '" value="' + RowID + '">');
    M.show();
}
function readDataFromForm(Mid, jQSel) {
    var inputs = $(Mid + ' :input');
    var data = {};
    inputs.each(function () {
        var e = $(this);
        var key = e.attr('name');
        if (key) {
            var column = null;
            try {
                column = getTableByjQSel(jQSel).Columns[key];
            }
            catch (error) {
                column = null; // Column doesnt exist in current Table
            }
            if (column) {
                var DataType = column.DATA_TYPE.toLowerCase();
                //  if empty then value should be NULL
                if (e.val() == '' && (DataType.indexOf('text') < 0 || column.foreignKey.table != '')) {
                    data[key] = null;
                }
                else {
                    // [NO FK]          
                    if (DataType == 'datetime') {
                        // For DATETIME
                        if (e.attr('type') == 'date')
                            data[key] = e.val(); // overwrite
                        else if (e.attr('type') == 'time')
                            data[key] += ' ' + e.val(); // append
                    }
                    else if (DataType == 'tinyint') {
                        // Boolean
                        data[key] = e.prop('checked') ? '1' : '0';
                    }
                    else {
                        data[key] = e.val();
                    }
                }
            }
            else {
                // Virtual Element in FormData
                data[key] = e.val();
            }
        }
    });
    return data;
}
function writeDataToForm(Mid, data, jQSel) {
    var inputs = $(Mid + ' :input');
    inputs.each(function () {
        var e = $(this);
        var col = e.attr('name');
        var value = data[col];
        // isFK?
        if (value) {
            if (Array.isArray(value)) {
                //--- ForeignKey
                if (col == 'state_id') {
                    // Special case if name = 'state_id'
                    var label = e.parent().find('.label');
                    label.addClass('state' + value[0]);
                    label.text(value[1]);
                }
                else {
                    // GUI Foreign Key
                    e.parent().parent().find('.fkval').val(value[1]);
                }
                // Save in hidden input
                e.val(value[0]);
            }
            else {
                //--- Normal
                if (col) {
                    var DataType = getTableByjQSel(jQSel).Columns[col].DATA_TYPE.toLowerCase();
                    if (DataType == 'datetime') {
                        // DateTime -> combine vals
                        if (e.attr('type') == 'date')
                            e.val(value.split(" ")[0]);
                        else if (e.attr('type') == 'time') {
                            // Remove seconds from TimeString
                            if (gOptions.smallestTimeUnitMins) {
                                var timeArr = value.split(':');
                                timeArr.pop();
                                value = timeArr.join(':');
                            }
                            e.val(value.split(" ")[1]);
                        }
                    }
                    else if (DataType == 'time') {
                        // Remove seconds from TimeString
                        if (gOptions.smallestTimeUnitMins) {
                            var timeArr = value.split(':');
                            timeArr.pop();
                            value = timeArr.join(':');
                        }
                        e.val(value);
                    }
                    else if (DataType == 'tinyint') {
                        // Checkbox
                        e.prop('checked', parseInt(value) !== 0); // Boolean
                    }
                    else
                        e.val(value);
                }
            }
        }
    });
}
function modifyRow(jQSel, id) {
    var t = getTableByjQSel(jQSel);
    // ForeignKey
    if (t.selOne) {
        // Select One
        t.selectedIDs = [];
        t.selectedIDs.push(id);
        // If is only 1 select then instant close window
        $(jQSel).parent().parent().find('.btnSelectFK').click();
        return;
    }
    else {
        // Exit if it is a ReadOnly Table
        if (t.ReadOnly)
            return;
        // Indicate which row is getting modified
        addClassToDataRow(jQSel, id, 'table-warning');
        $(jQSel + ' .datarow .controllcoulm').html('<i class="fa fa-pencil"></i>'); // for all
        $(jQSel + ' .row-' + id + ' .controllcoulm').html('<i class="fa fa-arrow-right"></i>');
        // Set Form
        if (t.SM) {
            var PrimaryColumn = t.PrimaryColumn;
            var data = {};
            data[PrimaryColumn] = id;
            t.getFormModify(data, function (r) {
                if (r.length > 0) {
                    var htmlForm = r;
                    t.getNextStates(data, function (re) {
                        if (re.length > 0) {
                            var nextstates = JSON.parse(re);
                            renderEditForm(t, id, htmlForm, nextstates);
                        }
                    });
                }
            });
        }
        else {
            // EDIT-Modal WITHOUT StateMachine
            var M = new Modal('Edit Entry', t.Form_Create, '', true);
            // Save origin Table in all FKeys
            $('#' + M.DOM_ID + ' .inputFK').data('origintable', t.tablename);
            // Save buttons
            var btn = '<div class="btn-group" role="group">';
            btn += '<button class="btn btn-primary" onclick="saveEntry(\'' + M.DOM_ID + '\', \'' + jQSel + '\', false)" type="button"><i class="fa fa-floppy-o"></i> Save</button>';
            btn += '<button class="btn btn-primary" onclick="saveEntry(\'' + M.DOM_ID + '\', \'' + jQSel + '\')" type="button">Save &amp; Close</button>';
            btn += '</div>';
            M.setFooter(btn);
            // Add the Primary RowID
            $('#' + M.DOM_ID + ' .modal-body').append('<input type="hidden" name="' + t.PrimaryColumn + '" value="' + id + '">');
            // Write all input fields with {key:value}
            writeDataToForm('#' + M.DOM_ID, t.getRowByID(id), t.jQSelector);
            M.show();
        }
    }
}
// obsolete?
function filterTable(jQSel) {
    var t = getTableByjQSel(jQSel);
    var filterText = $(jQSel + ' .filterText').val();
    t.Filter = filterText;
    t.loadRows();
}
// BUTTON SAVE + Close
function saveEntry(MID, jQSel, closeModal) {
    if (closeModal === void 0) { closeModal = true; }
    var t = getTableByjQSel(jQSel);
    var data = readDataFromForm('#' + MID, jQSel);
    // REQUEST
    t.updateRow(data[t.PrimaryColumn], data, function (r) {
        if (r.length > 0) {
            if (r != "0") {
                // Success
                if (closeModal)
                    $('#' + MID).modal('hide');
                t.lastModifiedRowID = data[t.PrimaryColumn];
                t.loadRows();
            }
            else {
                // Fail
                alert("Element could not be updated!");
            }
        }
    });
}
function delRow(jQSel, id) {
    // Ask 
    var IsSure = confirm("Do you really want to delete this entry?");
    if (!IsSure)
        return;
    // REQUEST
    var t = getTableByjQSel(jQSel);
    t.deleteRow(id, function (r) {
        if (r == "1") {
            addClassToDataRow(t.jQSelector, id, 'table-danger');
        }
        else {
            // Error when deleting Row
        }
    });
}
function getTableByjQSel(SelStr) {
    var result;
    gTables.forEach(function (t) {
        if (t.jQSelector === SelStr) {
            result = t;
        }
    });
    return result;
}
function openTableInModal(tablename, callback) {
    if (callback === void 0) { callback = function (e) { }; }
    // Modal
    var SelectBtn = '<button class="btn btn-warning btnSelectFK" type="button"><i class="fa fa-check"></i> Select</button>';
    var timestr = (new Date()).getTime();
    var newFKTableClass = 'foreignTable_abcdef' + timestr; // Make dynamic and unique -> if foreignkey from foreignkey (>2 loops)
    var M = new Modal('Select Foreign Key', '<div class="' + newFKTableClass + '"></div>', SelectBtn, true);
    var t = new Table(tablename, '.' + newFKTableClass, true);
    gTables.push(t); // For identification for Search and Filter // TODO: Maybe clean from array after modal is closed
    // Bind Buttonclick
    $('#' + M.DOM_ID + ' .btnSelectFK').click(function () {
        var selectedRowID = t.getSelectedRows(); // TODO: Make Array for multiselect
        var ForeignRow = t.getRowByID(selectedRowID);
        callback(ForeignRow);
        // Hide Modal
        $('#' + M.DOM_ID).modal('hide');
    });
    M.show();
}
// This function is called from FormData
function selectForeignKey(inp) {
    var inp = $(inp).parent().find('input');
    // Extract relevant Variables
    var originTable = inp.data('origintable');
    var originColumn = inp.attr('name');
    var foreignTable = gConfig[originTable].columns[originColumn].foreignKey.table;
    var foreignPrimaryCol = gConfig[originTable].columns[originColumn].foreignKey.col_id;
    var foreignSubstCol = gConfig[originTable].columns[originColumn].foreignKey.col_subst;
    // New Table Instance
    openTableInModal(foreignTable, function (selRows) {
        inp.val(selRows[foreignPrimaryCol]); // Set ID-Value in hidden field
        //console.log(selRows)
        // Set Substituted Column
        if (foreignSubstCol.indexOf('(') >= 0) {
            // TODO: Load the name correctly from SQL Server
            inp.parent().parent().find('.fkval').val("ID: " + selRows[foreignPrimaryCol]);
        }
        else
            inp.parent().parent().find('.fkval').val(selRows[foreignSubstCol]);
        //sendRequest('read', {table: foreignTable, select: foreignSubstCol}, function(r){
        //console.log(r)
        //})
    });
}
// Bootstrap-Helper-Method: Overlay of many Modal windows (newest on top)
$(document).on('show.bs.modal', '.modal', function () {
    //-- Stack modals correctly  
    var zIndex = 2040 + (10 * $('.modal:visible').length);
    $(this).css('z-index', zIndex);
    setTimeout(function () {
        $('.modal-backdrop').not('.modal-stack').css('z-index', zIndex - 1).addClass('modal-stack');
    }, 0);
});
// TODO: obsolete functions?
function showResult(content, title) {
    if (title === void 0) { title = 'StateMachine Feedback'; }
    var M = new Modal(title, content);
    M.show();
}
function addClassToDataRow(jQuerySelector, id, classname) {
    $(jQuerySelector + ' .datarow').removeClass(classname); // Remove class from all other rows
    $(jQuerySelector + ' .row-' + id).addClass(classname);
}
function showSE(jQSel) {
    // TODO: First show the modal and then draw the StateMachine
    getTableByjQSel(jQSel).SM.openSEPopup();
}
//--------------------------------------------------------------------------
// Initialize Tables (call from HTML)
function initTables(callback) {
    if (callback === void 0) { callback = function () { }; }
    return __awaiter(this, void 0, void 0, function () {
        var promises;
        return __generator(this, function (_a) {
            promises = [];
            sendRequest('init', '', function (r) {
                return __awaiter(this, void 0, void 0, function () {
                    var tables;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                gConfig = JSON.parse(r);
                                tables = Object.keys(gConfig);
                                // Init Table Objects
                                tables.map(function (t) {
                                    var p = new Promise(function (resolve) {
                                        // Create a new object and save it in global array
                                        if (gConfig[t].is_in_menu) {
                                            var newT = new Table(t, '.table_' + t, false, function () {
                                                resolve();
                                            });
                                            gTables.push(newT);
                                        }
                                        else
                                            resolve();
                                    });
                                    promises.push(p);
                                });
                                return [4 /*yield*/, Promise.all(promises)];
                            case 1:
                                _a.sent();
                                // First Tab selection
                                $('.nav-tabs .nav-link:first').addClass('active');
                                $('.tab-content .tab-pane:first').addClass('active');
                                callback();
                                return [2 /*return*/];
                        }
                    });
                });
            });
            return [2 /*return*/];
        });
    });
}
