var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
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
class LiteEvent {
    constructor() {
        this.handlers = [];
    }
    on(handler) {
        this.handlers.push(handler);
    }
    off(handler) {
        this.handlers = this.handlers.filter(h => h !== handler);
    }
    trigger(data) {
        this.handlers.slice(0).forEach(h => h(data));
    }
    expose() {
        return this;
    }
}
//==============================================================
// Class: Database
//==============================================================
class DB {
    static init(APIUrl, callback = function () { }, GlobalTableOptions = {
        showWorkflowButton: true, showFilter: true, smallestTimeUnitMins: true, showCreateButton: true, showControlColumn: true, EntriesPerPage: 15
    }) {
        return __awaiter(this, void 0, void 0, function* () {
            this.API_URL = APIUrl;
            this.GlobalTableOptions = GlobalTableOptions;
            let me = this;
            let promises = [];
            // Load Config from Server
            me.request('init', '', function (r) {
                return __awaiter(this, void 0, void 0, function* () {
                    me.ConfigurationData = JSON.parse(r);
                    // Init Table Objects
                    let tables = Object.keys(me.Config);
                    tables.map(function (t) {
                        var p = new Promise(function (resolve) {
                            // Create a new object and save it in global array
                            if (me.Config[t].is_in_menu) {
                                var newT = new Table(t, '.table_' + t, SelectType.NoSelect, function () {
                                    newT.renderHTML();
                                    resolve();
                                });
                                me.Tables.push(newT);
                            }
                            else
                                resolve();
                        });
                        promises.push(p);
                    });
                    yield Promise.all(promises);
                    callback();
                });
            });
        });
    }
    // TODO: Improve Error handling (goto login.php etc.)
    static request(command, params, callback) {
        let me = this;
        // Request (every Request is processed by this function)
        $.ajax({
            method: "POST",
            url: me.API_URL,
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
    static getTable(SelStr) {
        var result;
        this.Tables.forEach(function (t) {
            if (t.getDOMSelector() === SelStr) {
                result = t;
            }
        });
        return result;
    }
    static addTable(newTable) {
        this.Tables.push(newTable);
    }
    static get Config() {
        return this.ConfigurationData;
    }
    static get Options() {
        return this.GlobalTableOptions;
    }
}
DB.Tables = [];
//==============================================================
// Class: Modal
//==============================================================
class Modal {
    constructor(heading, content, footer = '', isBig = false) {
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
        let sizeType = '';
        if (this.isBig)
            sizeType = ' modal-lg';
        // Result
        let html = '<div id="' + this.DOM_ID + '" class="modal fade" tabindex="-1" role="dialog">';
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
    setFooter(html) {
        $('#' + this.DOM_ID + ' .customfooter').html(html);
    }
    show() {
        $("#" + this.DOM_ID).modal();
        $("#" + this.DOM_ID).modal('show');
    }
    getDOMID() {
        return this.DOM_ID;
    }
}
//==============================================================
// Class: StateMachine
//==============================================================
class StateMachine {
    constructor(tablename) {
        this.tablename = tablename;
    }
    openSEPopup() {
        var smLinks, smNodes;
        var me = this;
        DB.request('getStates', { table: me.tablename }, function (r) {
            smNodes = JSON.parse(r);
            DB.request('smGetLinks', { table: me.tablename }, function (r) {
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
                            size: 16,
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
    }
    isExitNode(NodeID, links) {
        var res = true;
        links.forEach(function (e) {
            if (e.from == NodeID && e.from != e.to)
                res = false;
        });
        return res;
    }
}
//==============================================================
// Class: RawTable
//==============================================================
class RawTable {
    constructor(tablename) {
        this.AscDesc = SortOrder.DESC;
        this.PageIndex = 0;
        this.Where = '';
        this.tablename = tablename;
        this.actRowCount = 0;
    }
    buildJoinPart() {
        let joins = [];
        let me = this;
        Object.keys(me.Columns).forEach(function (col) {
            // Check if there is a substitute for the column
            if (me.Columns[col].foreignKey.table != "") {
                me.Columns[col].foreignKey.replace = col;
                joins.push(me.Columns[col].foreignKey);
            }
        });
        return joins;
    }
    getNextStates(data, callback) {
        DB.request('getNextStates', { table: this.tablename, row: data }, function (response) {
            callback(response);
        });
    }
    createRow(data, callback) {
        let me = this;
        DB.request('create', { table: this.tablename, row: data }, function (r) {
            me.countRows(function () {
                callback(r);
            });
        });
    }
    deleteRow(RowID, callback) {
        let me = this;
        let data = {};
        data[this.PrimaryColumn] = RowID;
        DB.request('delete', { table: this.tablename, row: data }, function (response) {
            me.countRows(function () {
                callback(response);
            });
        });
    }
    updateRow(RowID, new_data, callback) {
        // TODO: Use RowID
        DB.request('update', { table: this.tablename, row: new_data }, function (response) {
            callback(response);
        });
    }
    transitRow(RowID, TargetStateID, trans_data = null, callback) {
        let data = { state_id: 0 };
        if (trans_data)
            data = trans_data;
        // PrimaryColID and TargetStateID are the minimum Parameters which have to be set
        // also RowData can be updated in the client -> has also be transfered to server
        data[this.PrimaryColumn] = RowID;
        data.state_id = TargetStateID;
        DB.request('makeTransition', { table: this.tablename, row: data }, function (response) {
            callback(response);
        });
    }
    // Call this function only at [init] and then only on [create] and [delete] and at [filter]
    countRows(callback) {
        let me = this;
        let joins = this.buildJoinPart();
        let data = {
            table: this.tablename,
            select: '*, COUNT(*) AS cnt',
            where: this.Where,
            filter: this.Filter,
            join: joins
        };
        DB.request('read', data, function (r) {
            if (r.length > 0) {
                let resp = JSON.parse(r);
                if (resp.length > 0) {
                    me.actRowCount = parseInt(resp[0].cnt);
                    // Callback method
                    callback();
                }
            }
        });
    }
    loadRows(callback = function () { }) {
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
        DB.request('read', data, function (r) {
            // use "me" instead of "this", because of async functions
            var resp = JSON.parse(r);
            me.Rows = resp;
            callback();
            /*
            // Reset Filter Event
            if (me.Filter.length > 0) {
              // Count Entries again and then render Table
              me.countRows(function(){
                
              })
            } else {
              // Render Table
              callback()
            }
            */
        });
    }
    getNrOfRows() {
        return this.actRowCount;
    }
}
//==============================================================
// Class: Table
//==============================================================
class Table extends RawTable {
    constructor(tablename, DOMSelector, SelType = SelectType.NoSelect, callback = function () { }, whereFilter = '', defaultObj = {}) {
        super(tablename);
        this.jQSelector = '';
        this.maxCellLength = 30;
        this.defaultValues = {}; // Default key:val object for creating
        this.onSelectionChanged = new LiteEvent();
        let me = this;
        let data = DB.Config[tablename]; // Load data from global config    
        this.jQSelector = DOMSelector;
        this.PageIndex = 0;
        this.Columns = data.columns;
        this.ReadOnly = data.is_read_only;
        this.selType = SelType;
        this.maxCellLength = 30;
        this.PageLimit = DB.Options.EntriesPerPage || 10;
        this.showFilter = DB.Options.showFilter;
        this.showControlColumn = DB.Options.showControlColumn;
        this.showWorkflowButton = DB.Options.showWorkflowButton;
        this.smallestTimeUnitMins = DB.Options.smallestTimeUnitMins;
        this.defaultValues = defaultObj;
        this.Where = whereFilter;
        this.selectedIDs = []; // empty array
        this.tablename = tablename;
        this.Filter = '';
        // Get the Primary column name
        let PriCol;
        let SortCol = ''; // first visible Column
        Object.keys(data.columns).forEach(function (col) {
            if (data.columns[col].is_in_menu && SortCol == '')
                SortCol = col;
            if (data.columns[col].EXTRA == 'auto_increment')
                PriCol = col;
        });
        this.PrimaryColumn = PriCol;
        this.OrderBy = SortCol; // DEFAULT: Sort by first visible Col
        this.Form_Create = '';
        // Get Create-Form and save in Object
        DB.request('getFormCreate', { table: tablename }, function (resp) {
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
    }
    addClassToDataRow(id, classname) {
        $(this.jQSelector + ' .datarow').removeClass(classname); // Remove class from all other rows
        $(this.jQSelector + ' .row-' + id).addClass(classname);
    }
    toggleSort(ColumnName) {
        let me = this;
        this.AscDesc = (this.AscDesc == SortOrder.DESC) ? SortOrder.ASC : SortOrder.DESC;
        this.OrderBy = ColumnName;
        // Refresh
        this.loadRows(function () { me.renderHTML(); });
    }
    setPageIndex(targetIndex) {
        let me = this;
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
    }
    getNrOfPages() {
        return Math.ceil(this.getNrOfRows() / this.PageLimit);
    }
    getPaginationButtons() {
        const MaxNrOfButtons = 5;
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
    }
    formatCell(cellContent) {
        // string -> escaped string
        function escapeHtml(string) {
            let entityMap = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '/': '&#x2F;', '`': '&#x60;', '=': '&#x3D;' };
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
    }
    getHTMLStatusText() {
        if (this.getNrOfRows() > 0 && this.Rows.length > 0)
            return 'Showing Entries ' + ((this.PageIndex * this.PageLimit) + 1) + '-' +
                ((this.PageIndex * this.PageLimit) + this.Rows.length) + ' of ' + this.getNrOfRows() + ' Entries';
        else
            return 'No Entries';
    }
    // TODO: Param: [RowID, callback]
    getFormModify(data, callback) {
        var me = this;
        DB.request('getFormData', { table: me.tablename, row: data }, function (response) {
            callback(response);
        });
    }
    readDataFromForm(Mid) {
        let me = this;
        let data = {};
        let inputs = $(Mid + ' :input');
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
    }
    writeDataToForm(Mid, data) {
        let me = this;
        let inputs = $(Mid + ' :input');
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
                                if (DB.Options.smallestTimeUnitMins) {
                                    var timeArr = value.split(':');
                                    timeArr.pop();
                                    value = timeArr.join(':');
                                }
                                e.val(value.split(" ")[1]);
                            }
                        }
                        else if (DataType == 'time') {
                            // Remove seconds from TimeString
                            if (DB.Options.smallestTimeUnitMins) {
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
    renderEditForm(RowID, htmlForm, nextStates) {
        let t = this;
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
            var btn = '<button class="btn btn-primary btnState state' + (s.id % 12) + '" data-rowid="' + RowID + '" data-targetstate="' + s.id + '">' + btn_text + '</button>';
            // onclick="setState(\''+EditMID+'\', \''+t.jQSelector+'\', '+RowID+', '+s.id+')"
            //xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
            btns += btn;
        });
        btns += '</div>';
        M.setFooter(btns);
        // Bind function to StateButtons
        $('#' + EditMID + ' .btnState').click(function (e) {
            e.preventDefault();
            let RowID = $(this).data('rowid');
            let TargetStateID = $(this).data('targetstate');
            t.setState(EditMID, RowID, TargetStateID);
            //me.saveEntry(M.getDOMID(), false)
        });
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
    }
    modifyRow(id) {
        let me = this;
        // ForeignKey
        if (this.selType == SelectType.Single) {
            // < SINGLE SELECT >
            this.selectedIDs = [];
            this.selectedIDs.push(id);
            this.renderHTML();
            this.onSelectionChanged.trigger();
            return;
        }
        else if (this.selType == SelectType.Multi) {
            // < MULTI SELECT >
            // Check if already exists in array -> then remove
            let pos = this.selectedIDs.indexOf(id);
            if (pos >= 0) {
                // Remove from List and reindex array
                this.selectedIDs.splice(pos, 1);
            }
            else {
                // Add to List
                this.selectedIDs.push(id);
            }
            this.renderHTML();
            this.onSelectionChanged.trigger();
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
                // With StateMachine
                let PrimaryColumn = this.PrimaryColumn;
                let data = {};
                data[PrimaryColumn] = id;
                // Get Forms
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
    }
    saveEntry(MID, closeModal = true) {
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
    }
    updateLabels(ModalID) {
        let me = this;
        let labels = $('#' + ModalID + ' label');
        // Update all Labels
        labels.each(function () {
            let label = $(this);
            let colname = label.parent().find('[name]').attr('name');
            if (colname) {
                let aliasCol = DB.Config[me.tablename].columns[colname];
                if (aliasCol) {
                    label.text(aliasCol.column_alias);
                }
            }
        });
    }
    createEntry() {
        let me = this;
        let SaveBtn = '<button class="btn btn-success btnCreateEntry" type="button"><i class="fa fa-plus"></i>&nbsp;Create</button>';
        let M = new Modal('Create Entry', me.Form_Create, SaveBtn, true);
        let ModalID = M.getDOMID();
        this.updateLabels(ModalID); // Update all Labels  
        this.writeDataToForm('#' + ModalID, me.defaultValues); // Update Default values
        // Save origin Table in all FKeys
        $('#' + ModalID + ' .inputFK').data('origintable', me.tablename);
        // Bind Buttonclick
        $('#' + ModalID + ' .btnCreateEntry').click(function (e) {
            e.preventDefault();
            // Read out all input fields with {key:value}
            let data = me.readDataFromForm('#' + ModalID);
            me.createRow(data, function (r) {
                let msgs = [];
                // Remove all Error Messages
                $('#' + ModalID + ' .modal-body .alert').remove();
                try {
                    msgs = JSON.parse(r);
                }
                catch (err) {
                    // Show Error        
                    $('#' + ModalID + ' .modal-body').prepend('<div class="alert alert-danger" role="alert">' +
                        '<b>Script Error!</b>&nbsp;' + r +
                        '</div>');
                    return;
                }
                // Handle Transition Feedback
                let counter = 0; // 0 = trans, 1 = in -- but only at Create!
                msgs.forEach(msg => {
                    // Show Message
                    if (msg.show_message) {
                        let resM = new Modal('Feedback <small>' + (counter == 0 ? 'Transition-Script' : 'IN-Script') + '</small>', msg.message);
                        resM.show();
                    }
                    // Check
                    if (msg.element_id) {
                        if (msg.element_id > 0) {
                            $('#' + ModalID).modal('hide');
                            me.lastModifiedRowID = msg.element_id;
                            // load rows and render Table
                            me.countRows(function () {
                                me.loadRows(function () {
                                    me.renderHTML();
                                });
                            });
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
            });
        });
        M.show();
    }
    setState(MID, RowID, targetStateID) {
        // Remove all Error Messages
        $('#' + MID + ' .modal-body .alert').remove();
        let t = this;
        let data = t.readDataFromForm('#' + MID); // Read out all input fields with {key:value}
        // Set a loading icon or indicator
        $('#' + MID + ' .modal-body').prepend('<div class="text-center text-primary mb-3 loadingtext">' +
            '<h2><i class="fa fa-spinner fa-pulse"></i> Loading...</h2></div>');
        $('#' + MID + ' :input').prop("disabled", true);
        // REQUEST
        t.transitRow(RowID, targetStateID, data, function (r) {
            // When a response came back
            $('#' + MID + ' .loadingtext').remove();
            $('#' + MID + ' :input').prop("disabled", false);
            // Try to parse result messages
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
            let counter = 0;
            msgs.forEach(msg => {
                // Remove all Error Messages
                $('#' + MID + ' .modal-body .alert').remove();
                // Show Messages
                if (msg.show_message) {
                    let info = "";
                    if (counter == 0)
                        info = 'OUT-Script';
                    if (counter == 1)
                        info = 'Transition-Script';
                    if (counter == 2)
                        info = 'IN-Script';
                    // Show Result Messages
                    let resM = new Modal('Feedback <small>' + info + '</small>', msg.message);
                    resM.show();
                }
                // Check if Transition was successful
                if (counter >= 2) {
                    $('#' + MID).modal('hide'); // Hide only if reached IN-Script
                    if (RowID != 0)
                        t.lastModifiedRowID = RowID;
                    t.loadRows(function () { t.renderHTML(); });
                }
                // Increase Counter for Modals
                counter++;
            });
        });
    }
    getRowByID(RowID) {
        var result = null;
        var me = this;
        this.Rows.forEach(function (row) {
            if (row[me.PrimaryColumn] == RowID) {
                result = row;
            }
        });
        return result;
    }
    getSelectedRows() {
        return this.selectedIDs;
    }
    setSelectedRows(selRows) {
        let me = this;
        this.selectedIDs = selRows;
        //this.loadRows(function(){
        me.renderHTML();
        //});
    }
    get SelectionHasChanged() {
        return this.onSelectionChanged.expose();
    }
    getDOMSelector() {
        return this.jQSelector;
    }
    renderHTML() {
        let t = this;
        $(t.jQSelector).empty(); // GUI: Clear entries
        let ths = '';
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
        let pgntn = '';
        let PaginationButtons = t.getPaginationButtons();
        // Only Display Buttons, when more than one Button exists
        if (PaginationButtons.length > 1)
            PaginationButtons.forEach(btnIndex => {
                pgntn += '<li class="page-item' + (t.PageIndex == t.PageIndex + btnIndex ? ' active' : '') + '">' +
                    '<a class="page-link" data-pageindex="' + (t.PageIndex + btnIndex) + '">' + (t.PageIndex + 1 + btnIndex) + '</a></li>';
            });
        else
            pgntn += '';
        // ---- Header
        let header = '<div class="element"><div class="row">';
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
        let footer = '</tbody></table></div>' +
            '<div>' +
            '<p class="pull-left"><small>' + t.getHTMLStatusText() + '</small></p>' +
            '<nav class="pull-right"><ul class="pagination">' + pgntn + '</ul></nav>' +
            '<div class="clearfix"></div>' +
            '</div>' +
            '</div>';
        //============================== data
        let tds = '';
        // Loop Rows
        if (!t.Rows)
            return;
        t.Rows.forEach(function (row) {
            let data_string = '';
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
            t.countRows(function () {
                t.loadRows(function () {
                    t.renderHTML();
                });
            });
        });
        // hitting Return on searchbar at Filter
        $(t.jQSelector + ' .filterText').off('keydown').on('keydown', function (e) {
            if (e.keyCode == 13) {
                e.preventDefault();
                t.PageIndex = 0; // jump to first page
                t.Filter = $(t.jQSelector + ' .filterText').val();
                t.countRows(function () {
                    t.loadRows(function () {
                        t.renderHTML();
                    });
                });
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
            let RowID = $(this).data('rowid');
            t.modifyRow(RowID);
        });
        // Table-Header - Sort
        $(t.jQSelector + ' .datatbl_header').off('click').on('click', function (e) {
            e.preventDefault();
            let colname = $(this).data('colname');
            t.toggleSort(colname);
        });
        // Pagination Button
        $(t.jQSelector + ' .page-link').off('click').on('click', function (e) {
            e.preventDefault();
            let newPageIndex = $(this).data('pageindex');
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
                t.selectedIDs.forEach(selRowID => {
                    if (t.showControlColumn)
                        $(t.jQSelector + ' .row-' + selRowID + ' td:first').html('<i class="fa fa-check-square-o"></i>');
                    $(t.jQSelector + ' .row-' + selRowID).addClass('table-success');
                });
            }
        }
    }
}
function openTableInModal(tablename, previousSelRows = [], callback = function (e) { }) {
    // Modal
    var SelectBtn = '<button class="btn btn-warning btnSelectFK" type="button"><i class="fa fa-check"></i> Select</button>';
    var timestr = (new Date()).getTime();
    var newFKTableClass = 'foreignTable_abcdef' + timestr; // Make dynamic and unique -> if foreignkey from foreignkey (>2 loops)
    var M = new Modal('Select Foreign Key', '<div class="' + newFKTableClass + '"></div>', SelectBtn, true);
    var t = new Table(tablename, '.' + newFKTableClass, SelectType.Single);
    t.setSelectedRows(previousSelRows);
    DB.addTable(t); // For identification for Search and Filter // TODO: Maybe clean from array after modal is closed  
    // Bind Buttonclick (Select)
    $('#' + M.getDOMID() + ' .btnSelectFK').click(function (e) {
        e.preventDefault();
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
    var foreignTable = DB.Config[originTable].columns[originColumn].foreignKey.table;
    var foreignPrimaryCol = DB.Config[originTable].columns[originColumn].foreignKey.col_id;
    var foreignSubstCol = DB.Config[originTable].columns[originColumn].foreignKey.col_subst;
    var prevSelRow = [inp.val()];
    // New Table Instance
    openTableInModal(foreignTable, prevSelRow, function (forKeyTable) {
        let selRows = forKeyTable.getSelectedRows();
        let singleSelRow = selRows[0];
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
//-------------------------------------------
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
