var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
// Enums
var SortOrder;
(function (SortOrder) {
    SortOrder["ASC"] = "ASC";
    SortOrder["DESC"] = "DESC";
})(SortOrder || (SortOrder = {}));
var SelectType;
(function (SelectType) {
    SelectType[SelectType["NoSelect"] = 0] = "NoSelect";
    SelectType[SelectType["Single"] = 1] = "Single";
    SelectType[SelectType["Multi"] = 2] = "Multi";
})(SelectType || (SelectType = {}));
// TODO: Do not use Global variables
// Global variables
var gTables = [];
var gConfig;
var gOptions = {
    showWorkflowButton: true,
    showFilter: true,
    smallestTimeUnitMins: true,
    showCreateButton: true,
    showControlColumn: true,
    EntriesPerPage: 15
};
// Path for API
var path = window.location.pathname;
var pathName = path.substring(0, path.lastIndexOf('/') + 1);
var gURL = pathName + 'api.php';
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
function getTableByjQSel(SelStr) {
    var result;
    gTables.forEach(function (t) {
        if (t.getDOMSelector() === SelStr) {
            result = t;
        }
    });
    return result;
}
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
        // Add generated HTML to DOM
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
    Modal.prototype.getDOMID = function () {
        return this.DOM_ID;
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
                var MID = M.getDOMID();
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
                $('.fitsm').click(function (e) {
                    e.preventDefault();
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
// Class: RawTable
//==============================================================
var RawTable = /** @class */ (function () {
    function RawTable(tablename) {
        this.AscDesc = SortOrder.DESC;
        this.PageIndex = 0;
        this.Where = '';
        this.tablename = tablename;
        this.actRowCount = 0;
    }
    RawTable.prototype.buildJoinPart = function () {
        var joins = [];
        var me = this;
        Object.keys(me.Columns).forEach(function (col) {
            // Check if there is a substitute for the column
            if (me.Columns[col].foreignKey.table != "") {
                me.Columns[col].foreignKey.replace = col;
                joins.push(me.Columns[col].foreignKey);
            }
        });
        return joins;
    };
    RawTable.prototype.getNextStates = function (data, callback) {
        sendRequest('getNextStates', { table: this.tablename, row: data }, function (response) {
            callback(response);
        });
    };
    RawTable.prototype.createRow = function (data, callback) {
        var me = this;
        sendRequest('create', { table: this.tablename, row: data }, function (r) {
            me.countRows(function () {
                callback(r);
            });
        });
    };
    RawTable.prototype.deleteRow = function (RowID, callback) {
        var me = this;
        var data = {};
        data[this.PrimaryColumn] = RowID;
        sendRequest('delete', { table: this.tablename, row: data }, function (response) {
            me.countRows(function () {
                callback(response);
            });
        });
    };
    RawTable.prototype.updateRow = function (RowID, new_data, callback) {
        // TODO: Use RowID
        sendRequest('update', { table: this.tablename, row: new_data }, function (response) {
            callback(response);
        });
    };
    RawTable.prototype.transitRow = function (RowID, TargetStateID, trans_data, callback) {
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
    RawTable.prototype.countRows = function (callback) {
        var me = this;
        var joins = this.buildJoinPart();
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
    RawTable.prototype.loadRows = function (callback) {
        if (callback === void 0) { callback = function () { }; }
        var me = this;
        var joins = me.buildJoinPart();
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
            if (me.Filter.length > 0) {
                // Count Entries again and then render Table        
                me.countRows(function () {
                    //me.renderHTML() // TODO: Put in the callback
                    callback();
                });
            }
            else {
                // Render Table
                //me.renderHTML() // TODO: Put in the callback
                callback();
            }
        });
    };
    RawTable.prototype.getNrOfRows = function () {
        return this.actRowCount;
    };
    return RawTable;
}());
//==============================================================
// Class: Table
//==============================================================
var Table = /** @class */ (function (_super) {
    __extends(Table, _super);
    function Table(tablename, DOMSelector, SelType, callback, whereFilter, defaultObj) {
        if (SelType === void 0) { SelType = SelectType.NoSelect; }
        if (callback === void 0) { callback = function () { }; }
        if (whereFilter === void 0) { whereFilter = ''; }
        if (defaultObj === void 0) { defaultObj = {}; }
        var _this = _super.call(this, tablename) || this;
        _this.jQSelector = '';
        _this.maxCellLength = 30;
        _this.defaultValues = {}; // Default key:val object for creating
        var me = _this;
        var data = gConfig[tablename]; // Load data from global config    
        _this.jQSelector = DOMSelector;
        _this.PageIndex = 0;
        _this.Columns = data.columns;
        _this.ReadOnly = data.is_read_only;
        _this.selType = SelType;
        _this.maxCellLength = 30;
        _this.PageLimit = gOptions.EntriesPerPage || 10;
        _this.showFilter = gOptions.showFilter;
        _this.showControlColumn = gOptions.showControlColumn;
        _this.showWorkflowButton = gOptions.showWorkflowButton;
        _this.smallestTimeUnitMins = gOptions.smallestTimeUnitMins;
        _this.defaultValues = defaultObj;
        _this.Where = whereFilter;
        _this.selectedIDs = []; // empty array
        _this.tablename = tablename;
        _this.Filter = '';
        // Get the Primary column name
        var PriCol;
        var SortCol = ''; // first visible Column
        Object.keys(data.columns).forEach(function (col) {
            if (data.columns[col].is_in_menu && SortCol == '')
                SortCol = col;
            if (data.columns[col].EXTRA == 'auto_increment')
                PriCol = col;
        });
        _this.PrimaryColumn = PriCol;
        _this.OrderBy = SortCol; // DEFAULT: Sort by first visible Col
        _this.Form_Create = '';
        // Get Create-Form and save in Object
        sendRequest('getFormCreate', { table: tablename }, function (resp) {
            if (resp.length > 0)
                me.Form_Create = resp;
        });
        // Initialize StateMachine for the Table
        if (data.se_active)
            me.SM = new StateMachine(tablename);
        else
            me.SM = null;
        // Download data from server    
        me.countRows(function () {
            me.loadRows(function () {
                callback();
            });
        });
        return _this;
    }
    //=============  Helper functions
    Table.prototype.getDOMSelector = function () {
        return this.jQSelector;
    };
    Table.prototype.addClassToDataRow = function (id, classname) {
        $(this.jQSelector + ' .datarow').removeClass(classname); // Remove class from all other rows
        $(this.jQSelector + ' .row-' + id).addClass(classname);
    };
    // TODO: this should be class - internal possible  
    Table.prototype.setLastModifiedID = function (RowID) {
        this.lastModifiedRowID = RowID;
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
    Table.prototype.getSelectedRows = function () {
        return this.selectedIDs;
    };
    Table.prototype.setSelectedRows = function (selRows) {
        var me = this;
        this.selectedIDs = selRows;
        this.loadRows(function () { me.renderHTML(); });
    };
    Table.prototype.toggleSort = function (ColumnName) {
        var me = this;
        this.AscDesc = (this.AscDesc == SortOrder.DESC) ? SortOrder.ASC : SortOrder.DESC;
        this.OrderBy = ColumnName;
        // Refresh
        this.loadRows(function () { me.renderHTML(); });
    };
    Table.prototype.setPageIndex = function (targetIndex) {
        var me = this;
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
        this.loadRows(function () { me.renderHTML(); });
    };
    Table.prototype.getNrOfPages = function () {
        return Math.ceil(this.getNrOfRows() / this.PageLimit);
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
    Table.prototype.formatCell = function (cellContent) {
        // string -> escaped string
        function escapeHtml(string) {
            var entityMap = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '/': '&#x2F;', '`': '&#x60;', '=': '&#x3D;' };
            return String(string).replace(/[&<>"'`=\/]/g, function (s) {
                return entityMap[s];
            });
        }
        // check cell type
        if (typeof cellContent == 'string') {
            // String, and longer than X chars
            if (cellContent.length > this.maxCellLength)
                return escapeHtml(cellContent.substr(0, 30) + "\u2026");
        }
        else if (Array.isArray(cellContent)) {
            // Foreign Key
            if (cellContent[1] !== null)
                return escapeHtml(cellContent[1]);
            else
                return '';
        }
        // Cell is no String and no Array
        return escapeHtml(cellContent);
    };
    Table.prototype.getHTMLStatusText = function () {
        if (this.getNrOfRows() > 0 && this.Rows.length > 0)
            return 'Showing Entries ' + ((this.PageIndex * this.PageLimit) + 1) + '-' +
                ((this.PageIndex * this.PageLimit) + this.Rows.length) + ' of ' + this.getNrOfRows() + ' Entries';
        else
            return 'No Entries';
    };
    Table.prototype.renderHTML = function () {
        var t = this;
        $(t.jQSelector).empty(); // GUI: Clear entries
        var ths = '';
        if (t.showControlColumn)
            ths = '<th></th>'; // Pre fill with 1 because of selector
        // Table Headers
        Object.keys(t.Columns).forEach(function (col) {
            if (t.Columns[col].is_in_menu) {
                ths += '<th data-colname="' + col + '" class="datatbl_header' + (col == t.OrderBy ? ' sorted' : '') + '">' +
                    t.Columns[col].column_alias + (col == t.OrderBy ? '&nbsp;' + (t.AscDesc == SortOrder.ASC ?
                    '<i class="fa fa-sort-asc">' : (t.AscDesc == SortOrder.DESC ?
                    '<i class="fa fa-sort-desc">' : '')) + '' : '') + '</th>';
            }
        });
        // Pagination
        var pgntn = '';
        var PaginationButtons = t.getPaginationButtons();
        // Only Display Buttons, when more than one Button exists
        if (PaginationButtons.length > 1)
            PaginationButtons.forEach(function (btnIndex) {
                pgntn += '<li class="page-item' + (t.PageIndex == t.PageIndex + btnIndex ? ' active' : '') + '">' +
                    '<a class="page-link" data-pageindex="' + (t.PageIndex + btnIndex) + '">' + (t.PageIndex + 1 + btnIndex) + '</a></li>';
            });
        else
            pgntn += '';
        // ---- Header
        var header = '<div class="element"><div class="row">';
        // Filter
        if (t.showFilter) {
            header += '<div class="input-group col-12 col-sm-6 col-lg-3 mb-3">';
            header += '  <input type="text" class="form-control filterText" placeholder="Filter...">';
            header += '  <div class="input-group-append">';
            header += '    <button class="btn btn-secondary btnFilter" type="button"><i class="fa fa-search"></i></button>';
            header += '  </div>';
            header += '</div>';
        }
        header += '<div class="col-12 col-sm-6 col-lg-9 mb-3">';
        // Workflow Button
        if (t.SM && t.showWorkflowButton) {
            header += '<button class="btn btn-secondary btnShowWorkflow"><i class="fa fa-random"></i>&nbsp;Workflow</button>';
        }
        // Create Button
        if (!t.ReadOnly) {
            header += '<button class="btn btn-success btnCreateEntry"><i class="fa fa-plus"></i>&nbsp;Create</button>';
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
            var data_string = '';
            // If a Control Column is set then Add one before each row
            if (t.showControlColumn) {
                data_string = '<td class="controllcoulm modRow" data-rowid="' + row[t.PrimaryColumn] + '">';
                // Entries are selectable?
                if (t.selType == SelectType.Single || t.selType == SelectType.Multi) {
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
                tds += '<tr class="datarow row-' + row[t.PrimaryColumn] + ' editFullRow modRow" data-rowid="' + row[t.PrimaryColumn] + '">' + data_string + '</tr>';
            }
        });
        // GUI
        $(t.jQSelector).append(header + tds + footer);
        //---------------- Bind Events
        // Filter-Button clicked
        $(t.jQSelector + ' .btnFilter').off('click').on('click', function (e) {
            e.preventDefault();
            t.PageIndex = 0; // jump to first page
            t.Filter = $(t.jQSelector + ' .filterText').val();
            t.loadRows(function () { t.renderHTML(); });
        });
        // hitting Return on searchbar at Filter
        $(t.jQSelector + ' .filterText').off('keydown').on('keydown', function (e) {
            if (e.keyCode == 13) {
                e.preventDefault();
                t.PageIndex = 0; // jump to first page
                t.Filter = $(t.jQSelector + ' .filterText').val();
                t.loadRows(function () { t.renderHTML(); });
            }
        });
        // Show Workflow Button clicked
        $(t.jQSelector + ' .btnShowWorkflow').off('click').on('click', function (e) {
            e.preventDefault();
            t.SM.openSEPopup();
        });
        // Show Workflow Button clicked
        $(t.jQSelector + ' .btnCreateEntry').off('click').on('click', function (e) {
            e.preventDefault();
            t.createEntry();
        });
        // Edit Row
        $(t.jQSelector + ' .modRow').off('click').on('click', function (e) {
            e.preventDefault();
            var RowID = $(this).data('rowid');
            t.modifyRow(RowID);
        });
        // Table-Header - Sort
        $(t.jQSelector + ' .datatbl_header').off('click').on('click', function (e) {
            e.preventDefault();
            var colname = $(this).data('colname');
            t.toggleSort(colname);
        });
        // Pagination Button
        $(t.jQSelector + ' .page-link').off('click').on('click', function (e) {
            e.preventDefault();
            var newPageIndex = $(this).data('pageindex');
            t.setPageIndex(newPageIndex);
        });
        //-------------------------------
        // Autofocus Filter    
        if (t.Filter.length > 0)
            $(t.jQSelector + ' .filterText').focus().val('').val(t.Filter);
        else
            $(t.jQSelector + ' .filterText').val(t.Filter);
        // Mark last modified Row
        if (t.lastModifiedRowID) {
            if (t.lastModifiedRowID != 0) {
                t.addClassToDataRow(t.lastModifiedRowID, 'table-info');
                t.lastModifiedRowID = 0;
            }
        }
        // Mark Elements which are in Array of SelectedIDs
        if (t.selectedIDs) {
            if (t.selectedIDs.length > 0) {
                t.selectedIDs.forEach(function (selRowID) {
                    if (t.showControlColumn)
                        $(t.jQSelector + ' .row-' + selRowID + ' td:first').html('<i class="fa fa-check-square-o"></i>');
                    $(t.jQSelector + ' .row-' + selRowID).addClass('table-success');
                });
            }
        }
    };
    Table.prototype.getFormCreate = function () {
        return this.Form_Create;
    };
    Table.prototype.getFormModify = function (data, callback) {
        var me = this;
        sendRequest('getFormData', { table: me.tablename, row: data }, function (response) {
            callback(response);
        });
    };
    //=====================================================  CORE functions (TODO: Make an object)
    //------------------------------------------------------- GUI Functions
    Table.prototype.readDataFromForm = function (Mid) {
        var me = this;
        var data = {};
        var inputs = $(Mid + ' :input');
        inputs.each(function () {
            var e = $(this);
            var key = e.attr('name');
            if (key) {
                var column = null;
                try {
                    column = me.Columns[key];
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
    };
    Table.prototype.writeDataToForm = function (Mid, data) {
        var me = this;
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
                        var DataType = me.Columns[col].DATA_TYPE.toLowerCase();
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
    };
    Table.prototype.renderEditForm = function (RowID, htmlForm, nextStates) {
        var t = this;
        var row = t.getRowByID(RowID);
        // Modal
        var M = new Modal('Edit Entry', htmlForm, '', true);
        var EditMID = M.getDOMID();
        // state Buttons
        var btns = '<div class="btn-group" role="group">';
        var actStateID = row.state_id[0]; // ID
        // TODO: Order Save Button at first
        nextStates.forEach(function (s) {
            var btn_text = s.name;
            if (actStateID == s.id)
                btn_text = '<i class="fa fa-floppy-o"></i> Save';
            var btn = '<button class="btn btn-primary state' + (s.id % 12) + '" onclick="setState(\'' + EditMID + '\', \'' + t.jQSelector + '\', ' + RowID + ', ' + s.id + ')">' + btn_text + '</button>';
            btns += btn;
        });
        btns += '</div>';
        M.setFooter(btns);
        $('#' + EditMID + ' .label-state').addClass('state' + (actStateID % 12)).text(row.state_id[1]);
        // Update all Labels
        this.updateLabels(EditMID);
        // Save origin Table in all FKeys
        $('#' + EditMID + ' .inputFK').data('origintable', t.tablename);
        // Load data from row and write to input fields with {key:value}
        t.writeDataToForm('#' + EditMID, row);
        // Add PrimaryID in stored Data
        $('#' + EditMID + ' .modal-body').append('<input type="hidden" name="' + t.PrimaryColumn + '" value="' + RowID + '">');
        M.show();
    };
    Table.prototype.modifyRow = function (id) {
        var me = this;
        // ForeignKey
        if (this.selType == SelectType.Single) {
            // Select One
            this.selectedIDs = [];
            this.selectedIDs.push(id);
            this.loadRows(function () { me.renderHTML(); });
            // If is only 1 select then instant close window
            //$(this.jQSelector).parent().parent().find('.btnSelectFK').click();
            return;
        }
        else if (this.selType == SelectType.Multi) {
            // TODO !!!!!!!
            // Check if already exists in array -> then remove
            var pos = this.selectedIDs.indexOf(id);
            if (pos >= 0) {
                // Remove from List and reindex array
                this.selectedIDs.splice(pos, 1);
            }
            else {
                // Add to List
                this.selectedIDs.push(id);
            }
            this.loadRows(function () { me.renderHTML(); });
            // If is only 1 select then instant close window
            //$(this.jQSelector).parent().parent().find('.btnSelectFK').click();
            return;
        }
        else {
            // Exit if it is a ReadOnly Table
            if (this.ReadOnly)
                return;
            // Indicate which row is getting modified
            this.addClassToDataRow(id, 'table-warning');
            $(this.jQSelector + ' .datarow .controllcoulm').html('<i class="fa fa-pencil"></i>'); // for all
            $(this.jQSelector + ' .row-' + id + ' .controllcoulm').html('<i class="fa fa-arrow-right"></i>');
            // Set Form
            if (this.SM) {
                var PrimaryColumn = this.PrimaryColumn;
                var data = {};
                data[PrimaryColumn] = id;
                me.getFormModify(data, function (r) {
                    if (r.length > 0) {
                        var htmlForm = r;
                        me.getNextStates(data, function (re) {
                            if (re.length > 0) {
                                var nextstates = JSON.parse(re);
                                me.renderEditForm(id, htmlForm, nextstates);
                            }
                        });
                    }
                });
            }
            else {
                // EDIT-Modal WITHOUT StateMachine
                var M = new Modal('Edit Entry', this.Form_Create, '', true);
                // Save origin Table in all FKeys
                $('#' + M.getDOMID() + ' .inputFK').data('origintable', this.tablename);
                // Save buttons
                var btn = '<div class="btn-group" role="group">';
                btn += '<button class="btn btn-primary btnSave" type="button"><i class="fa fa-floppy-o"></i> Save</button>';
                btn += '<button class="btn btn-primary btnSaveAndClose" type="button">Save &amp; Close</button>';
                btn += '</div>';
                M.setFooter(btn);
                // Bind functions to Save Buttons
                $('#' + M.getDOMID() + ' .btnSave').click(function (e) {
                    e.preventDefault();
                    me.saveEntry(M.getDOMID(), false);
                });
                $('#' + M.getDOMID() + ' .btnSaveAndClose').click(function (e) {
                    e.preventDefault();
                    me.saveEntry(M.getDOMID());
                });
                // Add the Primary RowID
                $('#' + M.getDOMID() + ' .modal-body').append('<input type="hidden" name="' + this.PrimaryColumn + '" value="' + id + '">');
                // Write all input fields with {key:value}
                this.writeDataToForm('#' + M.getDOMID(), this.getRowByID(id));
                M.show();
            }
        }
    };
    Table.prototype.saveEntry = function (MID, closeModal) {
        if (closeModal === void 0) { closeModal = true; }
        var t = this;
        var data = t.readDataFromForm('#' + MID);
        // REQUEST
        t.updateRow(data[t.PrimaryColumn], data, function (r) {
            if (r.length > 0) {
                if (r != "0") {
                    // Success
                    if (closeModal)
                        $('#' + MID).modal('hide');
                    t.lastModifiedRowID = data[t.PrimaryColumn];
                    t.loadRows(function () { t.renderHTML(); });
                }
                else {
                    // Fail
                    alert("Element could not be updated!");
                }
            }
        });
    };
    Table.prototype.updateLabels = function (ModalID) {
        var me = this;
        var labels = $('#' + ModalID + ' label');
        // Update all Labels
        labels.each(function () {
            var label = $(this);
            var colname = label.parent().find('[name]').attr('name');
            if (colname) {
                var aliasCol = gConfig[me.tablename].columns[colname];
                if (aliasCol) {
                    label.text(aliasCol.column_alias);
                }
            }
        });
    };
    Table.prototype.createEntry = function () {
        var me = this;
        var SaveBtn = '<button class="btn btn-success btnCreateEntry" type="button"><i class="fa fa-plus"></i>&nbsp;Create</button>';
        var M = new Modal('Create Entry', me.Form_Create, SaveBtn, true);
        var ModalID = M.getDOMID();
        this.updateLabels(ModalID); // Update all Labels  
        this.writeDataToForm('#' + ModalID, me.defaultValues); // Update Default values
        // Save origin Table in all FKeys
        $('#' + ModalID + ' .inputFK').data('origintable', me.tablename);
        // Bind Buttonclick
        $('#' + ModalID + ' .btnCreateEntry').click(function (e) {
            e.preventDefault();
            // Read out all input fields with {key:value}
            var data = me.readDataFromForm('#' + ModalID);
            // REQUEST
            me.createRow(data, created);
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
                    if (msg.show_message) {
                        var resM = new Modal('Feedback <small>' + (counter == 0 ? 'Transition-Script' : 'IN-Script') + '</small>', msg.message);
                        resM.show();
                    }
                    // Check
                    if (msg.element_id) {
                        if (msg.element_id > 0) {
                            $('#' + ModalID).modal('hide');
                            me.lastModifiedRowID = msg.element_id;
                            me.loadRows(function () { me.renderHTML(); });
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
    };
    return Table;
}(RawTable));
// TODO: Function should be >>>setState(this, 13)<<<, for individual buttons
function setState(MID, jQSel, RowID, targetStateID) {
    var t = getTableByjQSel(jQSel);
    var data = t.readDataFromForm('#' + MID); // Read out all input fields with {key:value}
    // REQUEST
    t.transitRow(RowID, targetStateID, data, function (r) {
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
            // Show Messages
            if (msg.show_message) {
                var info = "";
                if (counter == 0)
                    info = 'OUT-Script';
                if (counter == 1)
                    info = 'Transition-Script';
                if (counter == 2)
                    info = 'IN-Script';
                // Show Result Messages
                var resM = new Modal('Feedback <small>' + info + '</small>', msg.message);
                resM.show();
            }
            // Check if Transition was successful
            if (counter >= 2) {
                $('#' + MID).modal('hide'); // Hide only if reached IN-Script
                if (RowID != 0)
                    t.setLastModifiedID(RowID);
                t.loadRows(function () { t.renderHTML(); });
            }
            // Increase Counter for Modals
            counter++;
        });
    });
}
function openTableInModal(tablename, previousSelRows, callback) {
    if (previousSelRows === void 0) { previousSelRows = []; }
    if (callback === void 0) { callback = function (e) { }; }
    // Modal
    var SelectBtn = '<button class="btn btn-warning btnSelectFK" type="button"><i class="fa fa-check"></i> Select</button>';
    var timestr = (new Date()).getTime();
    var newFKTableClass = 'foreignTable_abcdef' + timestr; // Make dynamic and unique -> if foreignkey from foreignkey (>2 loops)
    var M = new Modal('Select Foreign Key', '<div class="' + newFKTableClass + '"></div>', SelectBtn, true);
    var t = new Table(tablename, '.' + newFKTableClass, SelectType.Single);
    t.setSelectedRows(previousSelRows);
    gTables.push(t); // For identification for Search and Filter // TODO: Maybe clean from array after modal is closed
    // Bind Buttonclick
    $('#' + M.getDOMID() + ' .btnSelectFK').click(function (e) {
        e.preventDefault();
        //var selectedRowID = t.getSelectedRows(); // TODO: Make Array for multiselect
        //var ForeignRow = t.getRowByID(selectedRowID[0]);
        callback(t);
        // Hide Modal
        $('#' + M.getDOMID()).modal('hide');
    });
    M.show();
}
// This function is called from FormData
function selectForeignKey(inp) {
    inp = $(inp).parent().find('input');
    // Extract relevant Variables
    var originTable = inp.data('origintable');
    var originColumn = inp.attr('name');
    var foreignTable = gConfig[originTable].columns[originColumn].foreignKey.table;
    var foreignPrimaryCol = gConfig[originTable].columns[originColumn].foreignKey.col_id;
    var foreignSubstCol = gConfig[originTable].columns[originColumn].foreignKey.col_subst;
    var prevSelRow = [inp.val()];
    // New Table Instance
    openTableInModal(foreignTable, prevSelRow, function (forKeyTable) {
        var selRows = forKeyTable.getSelectedRows();
        var singleSelRow = selRows[0];
        /*
        console.log(forKeyTable);
        console.log(selRows);
        console.log(singleSelRow);
        */
        inp.val(singleSelRow); // Set ID-Value in hidden field
        // Set Substituted Column
        if (foreignSubstCol.indexOf('(') >= 0) {
            // TODO: Load the name correctly from SQL Server
            inp.parent().parent().find('.fkval').val("ID: " + singleSelRow);
        }
        else
            inp.parent().parent().find('.fkval').val(singleSelRow);
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
$(document).on('hidden.bs.modal', '.modal', function () {
    $('.modal:visible').length && $(document.body).addClass('modal-open');
});
// TODO: obsolete functions?
// unused:
function delRow(jQSel, id) {
    // Ask 
    var IsSure = confirm("Do you really want to delete this entry?");
    if (!IsSure)
        return;
    // REQUEST
    var t = getTableByjQSel(jQSel);
    t.deleteRow(id, function (r) {
        if (r == "1") {
            //console.log("Deleted ROW!!!!");
            //addClassToDataRow(t.jQSelector, id, 'table-danger')
        }
        else {
            // Error when deleting Row
        }
    });
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
                                            var newT = new Table(t, '.table_' + t, SelectType.NoSelect, function () {
                                                newT.renderHTML();
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
