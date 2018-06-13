// TODO: Do not use Global variables

// Plugins
var $: any;
// Global variables
var gTables: Array<Table> = []
var gConfig: any;
var gOptions = {
  showWorkflowButton: true,
  showFilter: true,
  smallestTimeUnitMins: true,
  EntriesPerPage: 15
}
// Path for API
var path = window.location.pathname
var pathName = path.substring(0, path.lastIndexOf('/') + 1);
const gURL =  pathName + 'api/'

// Atomic Function for API Calls -> ensures Authorization 
function sendRequest(command: string, params: any, callback): void {
  // use localStorage -> saves Bandwidth and does not expire
  var token = localStorage.token
  // Request (every Request is processed by this function)
  $.ajax({
    method: "POST",
    url: gURL,
    contentType: 'json',
    data: JSON.stringify({
      cmd: command,
      paramJS: params
    }),
    error: function(xhr, status) {
      // Not Authorized
      if (xhr.status == 401) {
        document.location.assign('login.php') // Redirect to Login-Page
      } else if (xhr.status == 403) {
        alert("Sorry! You dont have the rights to do this.");
      }
    }
  }).done(function(response) {
    callback(response)
  });
}

enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC'
}

//==============================================================
// Class: Modal
//==============================================================
class Modal {
  DOM_ID: string;
  heading: string;
  content: string;
  footer: string;
  isBig: boolean;

  constructor(heading: string, content: string, footer: string = '', isBig: boolean = false) {
    this.DOM_ID = 'msgBx'
    // Check if ID exists then add Number -> like 'idStrxxx'
    while ( $("#"+this.DOM_ID).length ) {
      this.DOM_ID  += "X"
    }
    // Set Params
    this.heading = heading
    this.content = content
    this.footer = footer
    this.isBig = isBig

    // Render and add to DOM-Tree
    var sizeType = ''
    if (this.isBig)
      sizeType = ' modal-lg'
    // Result
    var html =  '<div id="'+this.DOM_ID+'" class="modal fade" tabindex="-1" role="dialog">';
    html += '<div class="modal-dialog'+sizeType+'" role="document">';
    html += '<div class="modal-content">';
    html += '<div class="modal-header">';
    html += '  <h5 class="modal-title">'+this.heading+'</h5>';
    html += '  <button type="button" class="close" data-dismiss="modal" aria-label="Close">';
    html += '    <span aria-hidden="true">&times;</span>';
    html += '  </button>';
    html += '</div>';
    html += '<div class="modal-body" style="max-height: 600px; overflow:auto;">';
    html += this.content;
    html += '</div>';
    html += '<div class="modal-footer">';
    html += '  <span class="customfooter">'+this.footer+'</span>';
    html += '  <span class="btn btn-secondary" data-dismiss="modal"><i class="fa fa-times"></i> Close</span>';
    html += '</div>';  // content
    html += '</div>';  // dialog
    html += '</div>';  // footer
    html += '</div>';  // modalWindow
    
    $('body').append(html);

    // Remove from DOM on close
    $('#'+this.DOM_ID).on('hidden.bs.modal', function (e) {
      $(this).remove();
    });
  }
  setFooter(html: string) {
    $('#'+this.DOM_ID+' .customfooter').html(html);
  }
  show(): void {
    $("#"+this.DOM_ID).modal();
    $("#"+this.DOM_ID).modal('show');
  }
}

//==============================================================
// Class: StateMachine
//==============================================================
class StateMachine {
  tablename: string

  constructor(tablename: string){
    this.tablename = tablename
  }

  openSEPopup() {
    var smLinks, smNodes
    var me = this
  
    //console.log("Request [getStates]")
    sendRequest('getStates', {table: me.tablename}, function(r) {
      smNodes = JSON.parse(r)
      //console.log("Request [smGetLinks]")
      sendRequest('smGetLinks', {table: me.tablename}, function(r) {
        smLinks = JSON.parse(r)

        // Finally, when everything was loaded, show Modal
        var M = new Modal('StateMachine', '<div class="statediagram" style="width: 100%; height: 300px;"></div>', '<button class="btn btn-secondary fitsm">Fit</button>', true)
        var MID = M.DOM_ID
        var container =  document.getElementsByClassName('statediagram')[0]

        var nodes = smNodes
        var edges = smLinks
        for (var i=0; i<nodes.length; i++) {
          if (me.isExitNode(nodes[i].id, smLinks)) {
            nodes[i]['color'] = '#c55';
            nodes[i]['shape'] = 'dot';
            nodes[i]['size'] = 10;
          }
          if (nodes[i].entrypoint == 1) {
            // Add EntryPoint Node
            nodes.push({id: 0, color: '#5c5',  shape: 'dot', size: 10});
            edges.push({from: 0, to: nodes[i].id})
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
                "roundness": 1// 0.2
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
            dragNodes:false
            /*dragView: false*/
          }
        };

        var network = new vis.Network(container, data, options);
        M.show()

        $('.fitsm').click(function(){
          network.fit({scale: 1, offset: {x:0,y:0}, animation: {duration: 1000, easingFunction: 'easeInOutQuad'}})
        })


      })
    })
  }
  isExitNode(NodeID: number, links) {
    var res: boolean = true;
    links.forEach(function(e){
      if (e.from == NodeID && e.from != e.to)
        res = false;
    })
    return res
  }

}

//==============================================================
// Class: Table
//==============================================================
class Table {
  Columns: any;
  private Rows: any;
  Filter: string;
  private Filter_Old: string;
  private OrderBy: string;
  PrimaryColumn: string;
  private AscDesc: SortOrder = SortOrder.DESC;
  tablename: string;
  private PageLimit: number;
  private PageIndex: number = 0;
  private actRowCount: number; // Count total
  jQSelector: string = '';
  selectedIDs: number[];
  Form_Create: string;
  SM: StateMachine;
  ReadOnly: boolean;
  lastModifiedRowID: number;
  selOne: boolean;

  constructor(tablename: string, DOMSelector: string, selectableOne: boolean = false, callback: any = function(){}) {
    var data = gConfig[tablename]; // Load data from global config
    this.tablename = tablename;
    this.jQSelector = DOMSelector;
    this.PageIndex = 0;
    this.actRowCount = 0;
    this.Columns = data.columns;
    this.ReadOnly = data.is_read_only;
    this.selOne = selectableOne
    this.PageLimit = gOptions.EntriesPerPage || 10;

    // Get the Primary column name
    var PriCol: string;
    var SortCol: string = ''; // first visible Column
    Object.keys(data.columns).forEach(function(col){
      if (data.columns[col].is_in_menu && SortCol == '')
        SortCol = col
      if (data.columns[col].EXTRA == 'auto_increment')
        PriCol = col
    })
    this.PrimaryColumn = PriCol;
    this.OrderBy = SortCol; // DEFAULT: Sort by first visible Col

    this.Filter = '';
    this.Filter_Old = '';
    this.Form_Create = '';

    var me = this
    me.getFormCreate();
    // Initialize StateMachine for the Table
    if (data.se_active)
      me.SM = new StateMachine(me.tablename);
    else
      me.SM = null;
    // Download data from server
    me.countRows(function(){
      me.loadRows(function(){
        callback();
      });
    })
  }

  //=============  Helper functions

  getRowByID(RowID: number): any {
    var result: any = null;
    var me: Table = this;
    this.Rows.forEach(function(row){
      if (row[me.PrimaryColumn] == RowID) {
        result = row
      }
    })
    return result
  }
  toggleSort(ColumnName: string): void {
    this.AscDesc = (this.AscDesc == SortOrder.DESC) ? SortOrder.ASC : SortOrder.DESC
    this.OrderBy = ColumnName
    // Refresh
    this.loadRows()
  }
  getSelectedRows(): number {
    return this.selectedIDs[0]
  }
  buildJoinPart(t: Table) {
    var joins = []
    Object.keys(t.Columns).forEach(function(col) {
      // Check if there is a substitute for the column
      if (t.Columns[col].foreignKey.table != "") {          
        t.Columns[col].foreignKey.replace = col
        joins.push(t.Columns[col].foreignKey)
      }
    })
    return joins
  }
  setPageIndex(targetIndex: number): void {
    console.log("Set PageIndex to", targetIndex)
    var newIndex = targetIndex
    var lastPageIndex = this.getNrOfPages() - 1
    // Check borders
    if (targetIndex < 0) newIndex = 0 // Lower limit
    if (targetIndex > lastPageIndex) newIndex = lastPageIndex // Upper Limit
    // Set new index
    this.PageIndex = newIndex
    // Refresh
    this.loadRows()
  }
  private getNrOfPages(): number {
    return Math.ceil(this.actRowCount / this.PageLimit);
  }
  getPaginationButtons(): number[] {
    const MaxNrOfButtons: number = 5
    var NrOfPages: number = this.getNrOfPages()
    // Pages are less then NrOfBtns => display all
    if (NrOfPages <= MaxNrOfButtons) {
      var pages: number[] = new Array(NrOfPages)
      for (var i: number=0;i<pages.length;i++)
        pages[i] = i - this.PageIndex
    } else {
      // Pages > NrOfBtns display NrOfBtns
      pages = new Array(MaxNrOfButtons)
      // Display start edge
      if (this.PageIndex < Math.floor(pages.length / 2))
        for (var i=0;i<pages.length;i++) pages[i] = i - this.PageIndex
      // Display middle
      else if ((this.PageIndex >= Math.floor(pages.length / 2))
        && (this.PageIndex < (NrOfPages - Math.floor(pages.length / 2))))
        for (var i=0;i<pages.length;i++) pages[i] = -Math.floor(pages.length / 2) + i 
      // Display end edge
      else if (this.PageIndex >= NrOfPages - Math.floor(pages.length / 2)) {
        for (var i=0;i<pages.length;i++) pages[i] = NrOfPages - this.PageIndex + i - pages.length
      }
    }
    return pages
  }
  formatCell(cellStr) {

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

    var trunc_len: number = 30
    if (typeof cellStr == 'string') {
      // String, and longer than X chars
      if (cellStr.length >= trunc_len)
        return escapeHtml(cellStr.substr(0, 30) + "\u2026");
    } else if (Array.isArray(cellStr)) {
      // Foreign Key
      if (cellStr[1] !== null)
        return escapeHtml(cellStr[1])
      else
        return '';
    }
    return escapeHtml(cellStr)
  }
  getHTMLStatusText(): string {
    if (this.actRowCount > 0)
      return 'Showing Entries '+((this.PageIndex * this.PageLimit) + 1)+'-'+
        ((this.PageIndex * this.PageLimit) + this.Rows.length) + ' of '+ this.actRowCount + ' Entries';
    else
      return 'No Entries';
  }
  renderHTML(): void {
    var t = this
    var jQSelector: string = t.jQSelector
    //console.log("Render HTML for Table", t.tablename, " @ ", jQSelector)
    $(jQSelector).empty() // GUI: Clear entries
  

    var ths: string = '<th></th>'; // Pre fill with 1 because of selector

    // Data Rows
    Object.keys(t.Columns).forEach(function(col) {
      if (t.Columns[col].is_in_menu) {
        ths += '<th onclick="getTableByjQSel(\''+jQSelector+'\').toggleSort(\''+col+'\')" class="datatbl_header'+
          (col == t.OrderBy ? ' sorted' : '')+'">'+
          t.Columns[col].column_alias+
          (col == t.OrderBy ? '&nbsp;'+(t.AscDesc == SortOrder.ASC ?
            '<i class="fa fa-sort-asc">' : (t.AscDesc == SortOrder.DESC ?
              '<i class="fa fa-sort-desc">' : '') )+'' : '')
          '</th>'
      }
    })

    var pgntn = ''
    var PaginationButtons = t.getPaginationButtons()
    // Only Display Buttons, when more than one Button exists
    if (PaginationButtons.length > 1)
      PaginationButtons.forEach(
        btnIndex => {
          pgntn += '<li class="page-item'+(t.PageIndex == t.PageIndex+btnIndex ? ' active' : '')+'"><a class="page-link" onclick="'+
            'getTableByjQSel(\''+jQSelector+'\').setPageIndex('+(t.PageIndex + btnIndex)+')">'+
            (t.PageIndex + 1 + btnIndex)+
            '</a></li>'
      })
    else
    pgntn += '';
  
    var header: string = '<div class="element"><div class="row">';

    // Filter
    if (gOptions.showFilter) {
      header += '<div class="input-group col-12 col-sm-6 col-lg-3 mb-3">'    
      header += '  <input type="text" class="form-control filterText" placeholder="Filter..." onkeydown="'+
      'if(event.keyCode == 13) { filterTable(\''+jQSelector+'\'); }">'
      header += '  <div class="input-group-append">'
      header += '    <button class="btn btn-secondary" onclick="if (true) { filterTable(\''+jQSelector+'\'); }" type="button"><i class="fa fa-search"></i></button>'
      header += '  </div>'
      header += '</div>'
    }

    header += '<div class="col-12 col-sm-6 col-lg-9 mb-3">'
    // Workflow Button
    if (t.SM && gOptions.showWorkflowButton) {
      header += '<button class="btn btn-secondary" onclick="showSE(\''+jQSelector+'\')"><i class="fa fa-random"></i>&nbsp;Workflow</button>';
    }
    // Create Button
    if (!t.ReadOnly) {
      header += '&nbsp;<button class="btn btn-success" onclick="createEntry(\''+jQSelector+'\')"><i class="fa fa-plus"></i>&nbsp;Create</button>';
    }
    header += '</div></div>';
    header += '<table class="table table-hover table-sm table-responsive-sm datatbl"><thead><tr>'+ths+'</tr></thead><tbody>';
  
    var footer: string = '</tbody></table>'+
      '<div>'+
        '<p class="pull-left"><small>'+t.getHTMLStatusText()+'</small></p>'+
        '<nav class="pull-right"><ul class="pagination">'+pgntn+'</ul></nav>'+
        '<div class="clearfix"></div>'+
      '</div>'+
      '</div>'
  
    //============================== data

    var tds: string = '';

    // Loop Rows
    if (!t.Rows) return
    t.Rows.forEach(function(row){

      // Build edit String
      var modRowStr = 'modifyRow(\''+jQSelector+'\', '+row[t.PrimaryColumn]+')';
      // Control column
      var data_string: string = '<td class="controllcoulm" onclick="'+modRowStr+'">'
      // Entries are selectable?
      if (t.selOne) {
        data_string += '<i class="fa fa-square-o"></i>';
      } else {
        // Entries are editable
        if (!t.ReadOnly) data_string += '<i class="fa fa-pencil"></i>'
      }
      //data_string += '<!--<i class="fa fa-trash" onclick="delRow(\''+jQSelector+'\', '+row[t.PrimaryColumn]+')"></i>-->';
      data_string += '</td>'

      // Loop Columns
      Object.keys(t.Columns).forEach(function(col) {
        var value = row[col]
        // Check if it is displayed
        if (t.Columns[col].is_in_menu) {
          // check Cell-Value
          if (value) {
            // Truncate Cell if Content is too long
            if (t.Columns[col].DATA_TYPE == 'date') {
              var tmp = new Date(value)
              if(!isNaN(tmp.getTime()))
                value = tmp.toLocaleDateString('de-DE')
              else
                value = ''
            }
            else if(t.Columns[col].DATA_TYPE == 'time') {
              // Remove seconds from TimeString
              if (gOptions.smallestTimeUnitMins) {
                var timeArr = value.split(':');
                timeArr.pop();
                value = timeArr.join(':')
              }
            }
            else if (t.Columns[col].DATA_TYPE == 'datetime') {
              var tmp = new Date(value)
              if(!isNaN(tmp.getTime())) {
                value = tmp.toLocaleString('de-DE')
                // Remove seconds from TimeString
                if (gOptions.smallestTimeUnitMins) {
                  var timeArr = value.split(':');
                  timeArr.pop();
                  value = timeArr.join(':')
                }             
              } else
                value = ''
            }
            else if (t.Columns[col].DATA_TYPE == 'tinyint') {
              value = parseInt(value) !== 0 ? '<i class="fa fa-check text-center"></i>&nbsp;' : ''
            }
            else 
              value = t.formatCell(value)

            // Check for statemachine
            if (col == 'state_id' && t.tablename != 'state') {
              // Modulo 12 --> see in css file (12 colors)
              data_string += '<td><span class="badge label-state state'+(row['state_id'][0] % 12)+'">'+value+'</span></td>'
            }
            else
              data_string += '<td>'+value+'</td>'
          } else {
            // Add empty cell (null)
            data_string += '<td>&nbsp;</td>'
          }
        }
      })
      // Add row to table
      tds += '<tr class="datarow row-'+row[t.PrimaryColumn]+'">'+data_string+'</tr>'
    })
    // GUI
    $(jQSelector).append(header+tds+footer)    
    // Autofocus Filter
    if (t.Filter.length > 0)
    $(jQSelector+' .filterText').focus().val('').val(t.Filter)
    else
      $(jQSelector+' .filterText').val(t.Filter)
    // Mark last modified Row
    if (t.lastModifiedRowID) {
      if (t.lastModifiedRowID != 0) {
        addClassToDataRow(jQSelector, t.lastModifiedRowID, 'table-info')
        t.lastModifiedRowID = 0;
      }
    }
  }
  
  //=============  CORE functions

  getFormCreate(): void {
    var me: Table = this;
    console.log("Request [getFormCreate]")
    sendRequest('getFormCreate', {table: me.tablename}, function(response) {
      if (response.length > 0)
        me.Form_Create = response;
    })
  }
  getFormModify(data: any, callback): void {
    var me: Table = this;
    console.log("Request [getFormData]")
    sendRequest('getFormData', {table: me.tablename, row: data}, function(response) {
      callback(response)
    })
  }
  getNextStates(data: any, callback): void {
    var me: Table = this;
    console.log("Request [getNextStates]")
    sendRequest('getNextStates', {table: me.tablename, row: data}, function(response) {
      callback(response)
    })
  }
  createRow(data: any, callback): void {
    var me = this;
    console.log("Request [create]", data)
    sendRequest('create', {table: me.tablename, row: data}, function(r){
      me.countRows(function(){
        callback(r)
      })
    })
  }
  deleteRow(RowID: number, callback): void {
    var me = this;
    var data = {}
    data[this.PrimaryColumn] = RowID
    console.log("Request [delete]", RowID)
    sendRequest('delete', {table: this.tablename, row: data}, function(response) {
      me.countRows(function(){
        callback(response)
      })
    })
  }
  updateRow(RowID: number, new_data: any, callback): void {
    console.log("Request [update] for ID", RowID, new_data)
    sendRequest('update', {table: this.tablename, row: new_data}, function(response) {
      callback(response)
    })
  }
  transitRow(RowID: number, TargetStateID: number, trans_data: any = null, callback) {
    var data = {state_id: 0}
    if (trans_data) data = trans_data
    // PrimaryColID and TargetStateID are the minimum Parameters which have to be set
    // also RowData can be updated in the client -> has also be transfered to server
    data[this.PrimaryColumn] = RowID
    data.state_id = TargetStateID
    console.log("Request [transit] for ID", RowID + " -> " + TargetStateID, trans_data)
    sendRequest('makeTransition', {table: this.tablename, row: data}, function(response) {
      callback(response)
    })
  }
  // Call this function only at [init] and then only on [create] and [delete] and at [filter]
  countRows(callback): void {
    var me: Table = this;
    var joins = this.buildJoinPart(this);
    var data = {
      table: this.tablename,
      select: '*, COUNT(*) AS cnt',
      filter: this.Filter,
      join: joins
    }
    console.log("Request [count] for Table", me.tablename)
    sendRequest('read', data, function(r){
      if (r.length > 0) {
        var resp = JSON.parse(r);
        if (resp.length > 0) {
          me.actRowCount = parseInt(resp[0].cnt);
          // Callback method
          callback()
        }
      }
    })
  }
  loadRows(callback: any = function(){}): void {
    var me: Table = this;
    var FilterEvent: boolean = false;

    // Check Filter event -> jmp to page 1
    if (this.Filter != this.Filter_Old) {
      this.PageIndex = 0;
      FilterEvent = true;
    }
    
    var joins = this.buildJoinPart(this);
    var data = {
      table: this.tablename,
      limitStart: this.PageIndex * this.PageLimit,
      limitSize: this.PageLimit,
      select: '*',
      where: '', //a.state_id = 1',
      filter: this.Filter,
      orderby: this.OrderBy,
      ascdesc: this.AscDesc,
      join: joins
    }
    // HTTP Request
    console.log("Request [read] @ Table:", this.tablename)
    sendRequest('read', data, function(r){
      // use "me" instead of "this", because of async functions
      var resp = JSON.parse(r);
      me.Rows = resp
      // Reset Filter Event
      if (FilterEvent) {
        // Count Entries again and then render Table        
        me.countRows(function(){
          me.renderHTML()
          me.Filter_Old = me.Filter
          callback()
        })
      } else {
        // Render Table
        me.renderHTML()
        callback()
      }      
    })
  }
}















// TODO:  Put the folowing functions in the classes, or reduce them

// BUTTON Create
function createEntry(jQSel: string): void {
  var t = getTableByjQSel(jQSel)
  var SaveBtn = '<button class="btn btn-success btnCreateEntry" type="button"><i class="fa fa-plus"></i>&nbsp;Create</button>';
  var M = new Modal('Create Entry', t.Form_Create, SaveBtn, true)
  var ModalID = M.DOM_ID

  // Save origin Table in all FKeys
  //console.log("Set data ", t.tablename);
  $('#'+ModalID+' .inputFK').data('origintable', t.tablename);
  // Bind Buttonclick
  $('#'+ModalID+' .btnCreateEntry').click(function(){
    // Read out all input fields with {key:value}
    var data = readDataFromForm('#'+ModalID, jQSel)
    // REQUEST
    t.createRow(data, created);
    // RESPONSE
    function created(r){
      // Remove all Error Messages
      $('#' + ModalID + ' .modal-body .alert').remove();
      try {
        var msgs = JSON.parse(r)
      }
      catch(err) {
        // Show Error        
        $('#' + ModalID + ' .modal-body').prepend('<div class="alert alert-danger" role="alert">'+
        '<b>Script Error!</b>&nbsp;'+ r +
        '</div>')
        return
      }
      // Handle Transition Feedback
      console.log("TransScript:", msgs)
      var counter = 0; // 0 = trans, 1 = in -- but only at Create!
      msgs.forEach(msg => {
        // Show Message
        if (msg.show_message)
          showResult(msg.message, 'Feedback <small>'+(counter == 0 ? 'Transition-Script' : 'IN-Script')+'</small>')
        // Check
        if (msg.element_id) {
          if (msg.element_id > 0) {
            $('#'+ModalID).modal('hide')
            t.lastModifiedRowID = msg.element_id
            t.loadRows()
          }
        } else {
          // ElementID has to be 0! otherwise the transscript aborted
          if (msg.element_id == 0) {
            $('#' + ModalID + ' .modal-body').prepend('<div class="alert alert-danger" role="alert">'+
              '<b>Database Error!</b>&nbsp;'+ msg.errormsg +
              '</div>')
          }
        }
        counter++;
      });
    }
  })
  M.show()
}
// TODO: Function should be >>>setState(this, 13)<<<, for individual buttons
function setState(MID: string, jQSel: string, RowID: number, targetStateID: number): void {
  var t = getTableByjQSel(jQSel);
  var data = readDataFromForm('#'+MID, jQSel); // Read out all input fields with {key:value}
  // REQUEST
  t.transitRow(RowID, targetStateID, data, transitioned)
  // RESPONSE
  function transitioned(r) {
    // Remove all Error Messages
    $('#' + MID + ' .modal-body .alert').remove();
    try {
      var msgs = JSON.parse(r)
    }
    catch(err) {
      console.log("Error:", r)
      $('#' + MID + ' .modal-body').prepend('<div class="alert alert-danger" role="alert">'+
      '<b>Script Error!</b>&nbsp;'+ r +
      '</div>')
      return
    }
    // Handle Transition Feedback
    console.log("Script-Results:", msgs)
    var counter = 0;
    msgs.forEach(msg => {
      // Remove all Error Messages
      $('#' + MID + ' .modal-body .alert').remove();

      // Show Message
      if (msg.show_message) {
        var info = ""
        if (counter == 0) info = 'OUT-Script'
        if (counter == 1) info = 'Transition-Script'
        if (counter == 2) info = 'IN-Script'
        showResult(msg.message, 'Feedback <small>'+info+'</small>')
      }

      if (counter >= 2) {
        $('#'+MID).modal('hide') // Hide only if reached IN-Script
        if (RowID != 0)
          t.lastModifiedRowID = RowID
        t.loadRows()
      }

      counter++;
    });
  }
}
function renderEditForm(Table: Table, RowID: number, htmlForm: string, nextStates: any) {
  var row = Table.getRowByID(RowID)
  // Modal
  var M = new Modal('Edit Entry', htmlForm, '', true)
  var EditMID = M.DOM_ID

  // state Buttons
  var btns = '<div class="btn-group" role="group">'
  var actStateID = row.state_id[0] // ID
  nextStates.forEach(function(s){
    var btn_text = s.name
    if (actStateID == s.id)
      btn_text = '<i class="fa fa-floppy-o"></i> Save'
    var btn = '<button class="btn btn-primary state'+(s.id % 12)+'" onclick="setState(\''+EditMID+'\', \''+Table.jQSelector+'\', '+RowID+', '+s.id+')">'+btn_text+'</button>';
    btns += btn;
  })
  btns += '</div>';
  M.setFooter(btns);

  // Save origin Table in all FKeys
  $('#'+M.DOM_ID+' .inputFK').data('origintable',Table.tablename);
  // Load data from row and write to input fields with {key:value}
  writeDataToForm('#'+EditMID, row, Table.jQSelector)
  // Add PrimaryID in stored Data
  $('#'+EditMID+' .modal-body').append('<input type="hidden" name="'+Table.PrimaryColumn+'" value="'+RowID+'">')
  M.show()
}
function readDataFromForm(Mid: string, jQSel: string): any {
  var inputs = $(Mid+' :input')
  var data = {}

  inputs.each(function(){
    var e = $(this);
    var key = e.attr('name')
    if (key) {
      var column = null
      try {
        column = getTableByjQSel(jQSel).Columns[key]
      } catch (error) {        
        column = null // Column doesnt exist in current Table
      }

      if (column) {
        var DataType = column.DATA_TYPE.toLowerCase()
        //  if empty then value should be NULL
        if (e.val() == '' && (DataType.indexOf('text') < 0 || column.foreignKey.table != '')) {
          data[key] = null
        } else {
          // [NO FK]          
          if (DataType == 'datetime') {
            // For DATETIME
            if (e.attr('type') == 'date')
              data[key] = e.val() // overwrite
            else if (e.attr('type') == 'time')
              data[key] += ' '+e.val() // append
          }
          else if (DataType == 'tinyint') {
            // Boolean
            data[key] = e.prop('checked') ? '1' : '0';
          }
          else {
            data[key] = e.val()
          }
        }
      } else {
        // Virtual Element in FormData
        data[key] = e.val()
      }
    }
  })
  return data
}
function writeDataToForm(Mid: string, data: any, jQSel: string): void {
  var inputs = $(Mid+' :input')
  inputs.each(function(){
    var e = $(this);
    var col = e.attr('name')
    var value = data[col]

    // isFK?
    if (value) {
      if (Array.isArray(value)) {
        //--- ForeignKey
        if (col == 'state_id') {
          // Special case if name = 'state_id'
          var label = e.parent().find('.label');
          label.addClass('state'+value[0])
          label.text(value[1]);
        } else {
          // GUI Foreign Key
          e.parent().parent().find('.fkval').text(value[1]);
        }
        // Save in hidden input
        e.val(value[0])
      }
      else {
        //--- Normal
        if (col) {
          var DataType = getTableByjQSel(jQSel).Columns[col].DATA_TYPE.toLowerCase()

          if (DataType == 'datetime') {
            // DateTime -> combine vals
            if (e.attr('type') == 'date')
              e.val(value.split(" ")[0])
            else if (e.attr('type') == 'time') {
              // Remove seconds from TimeString
              if (gOptions.smallestTimeUnitMins) {
                var timeArr = value.split(':');
                timeArr.pop();
                value = timeArr.join(':')
              }
              e.val(value.split(" ")[1])
            }
          }
          else if (DataType == 'time') {
            // Remove seconds from TimeString
            if (gOptions.smallestTimeUnitMins) {
              var timeArr = value.split(':');
              timeArr.pop();
              value = timeArr.join(':')
            }
            e.val(value)
          }
          else if (DataType == 'tinyint') {
            // Checkbox
            e.prop('checked', parseInt(value) !== 0); // Boolean
          } else
            e.val(value)
        }
      }
    }
  })
}
function modifyRow(jQSel: string, id: number) { 
  var t: Table = getTableByjQSel(jQSel);

  // ForeignKey
  if (t.selOne) {
    // Select One
    t.selectedIDs = []
    t.selectedIDs.push(id)
    // If is only 1 select then instant close window
    $(jQSel).parent().parent().find('.btnSelectFK').click();
    return
  }
  else {
    // Exit if it is a ReadOnly Table
    if (t.ReadOnly) return
    // Indicate which row is getting modified
    addClassToDataRow(jQSel, id, 'table-warning')
    $(jQSel+' .datarow .controllcoulm').html('<i class="fa fa-pencil"></i>'); // for all
    $(jQSel+' .row-'+id+' .controllcoulm').html('<i class="fa fa-arrow-right"></i>');
    // Set Form
    if (t.SM) {
      var PrimaryColumn: string = t.PrimaryColumn;
      var data = {}
      data[PrimaryColumn] = id
      
      t.getFormModify(data, function(r){
        if (r.length > 0) {
          var htmlForm = r;
          t.getNextStates(data, function(re){
            if (re.length > 0) {
              var nextstates = JSON.parse(re);
              renderEditForm(t, id, htmlForm, nextstates);
            }
          })
        }
      })

    } else {

      // EDIT-Modal WITHOUT StateMachine
      var M: Modal = new Modal('Edit Entry', t.Form_Create, '', true)
      // Save origin Table in all FKeys
      $('#'+M.DOM_ID+' .inputFK').data('origintable', t.tablename);
      // Save buttons
      var btn: string = '<div class="btn-group" role="group">'
      btn += '<button class="btn btn-primary" onclick="saveEntry(\''+M.DOM_ID+'\', \''+jQSel+'\', false)" type="button"><i class="fa fa-floppy-o"></i> Save</button>';
      btn += '<button class="btn btn-primary" onclick="saveEntry(\''+M.DOM_ID+'\', \''+jQSel+'\')" type="button">Save &amp; Close</button>';
      btn += '</div>'
      M.setFooter(btn);
      // Add the Primary RowID
      $('#'+M.DOM_ID+' .modal-body').append('<input type="hidden" name="'+t.PrimaryColumn+'" value="'+id+'">')
      // Write all input fields with {key:value}
      writeDataToForm('#'+M.DOM_ID, t.getRowByID(id), t.jQSelector)
      M.show()
    }
  }
}
function filterTable(jQSel: string) {
  var t: Table = getTableByjQSel(jQSel);
  var filterText = $(jQSel + ' .filterText').val();
  console.log('Filter Table ', t.tablename, ' with ', filterText)
  t.Filter = filterText
  t.loadRows()
}
// BUTTON SAVE + Close
function saveEntry(MID: string, jQSel: string, closeModal: boolean = true){
  var t: Table = getTableByjQSel(jQSel)
  var data = readDataFromForm('#'+MID, jQSel)
  // REQUEST
  t.updateRow(data[t.PrimaryColumn], data, function(r){
    if (r.length > 0) {
      if (r != "0") {
        // Success
        if (closeModal) $('#'+MID).modal('hide')
        t.lastModifiedRowID = data[t.PrimaryColumn]
        t.loadRows()
      } else {
        // Fail
        alert("Element could not be updated!")
      }
    }
  })
}
function delRow(jQSel: string, id: number) {
  // Ask 
  var IsSure = confirm("Do you really want to delete this entry?")
  if (!IsSure) return
  // REQUEST
  var t = getTableByjQSel(jQSel)
  t.deleteRow(id, function(r) {
    if (r == "1") {
      //console.log("Deleted Row", r)
      addClassToDataRow(t.jQSelector, id, 'table-danger')
    } else {
      console.log("Could not delete Row", r)
    }
  })
}
function getTableByjQSel(SelStr: string): Table {
  var result: Table;
  gTables.forEach(function(t){ if (t.jQSelector === SelStr) {
    result = t
  }})
  return result
}
function openTableInModal(tablename: string, callback = function(e){}) {
  // Modal
  var SelectBtn = '<button class="btn btn-warning btnSelectFK" type="button"><i class="fa fa-check"></i> Select</button>';
  var timestr = (new Date()).getTime()
  var newFKTableClass = 'foreignTable_abcdef'+timestr; // Make dynamic and unique -> if foreignkey from foreignkey (>2 loops)
  var M = new Modal('Select Foreign Key', '<div class="'+newFKTableClass+'"></div>', SelectBtn, true)
  var t = new Table(tablename, '.'+newFKTableClass, true);
  gTables.push(t) // For identification for Search and Filter // TODO: Maybe clean from array after modal is closed
  
  // Bind Buttonclick
  $('#'+M.DOM_ID+' .btnSelectFK').click(function(){
    var selectedRowID = t.getSelectedRows(); // TODO: Make Array for multiselect
    var ForeignRow = t.getRowByID(selectedRowID);
    callback(ForeignRow);
    // Hide Modal
    $('#'+M.DOM_ID).modal('hide');
  })
  M.show()
}
// This function is called from FormData
function selectForeignKey(inp){
  var inp = $(inp).parent().find('input');
  // Extract relevant Variables
  var originTable = inp.data('origintable');
  var originColumn = inp.attr('name');
  var foreignTable = gConfig[originTable].columns[originColumn].foreignKey.table
  var foreignPrimaryCol = gConfig[originTable].columns[originColumn].foreignKey.col_id
  var foreignSubstCol = gConfig[originTable].columns[originColumn].foreignKey.col_subst
  // New Table Instance
  openTableInModal(foreignTable, function(selRows){
    inp.val(selRows[foreignPrimaryCol]); // Set ID-Value in hidden field
    inp.parent().parent().find('.fkval').text(selRows[foreignSubstCol]) // Set Substituted Column
  })
}


// Bootstrap-Helper-Method: Overlay of many Modal windows (newest on top)
$(document).on('show.bs.modal', '.modal', function () {
  //-- Autofocus first input in modal
  //$(this).find('input[type=text],textarea,select').filter(':visible:first').focus();
  //-- Stack modals correctly  
  var zIndex = 2040 + (10 * $('.modal:visible').length);
  $(this).css('z-index', zIndex);
  setTimeout(function() {
      $('.modal-backdrop').not('.modal-stack').css('z-index', zIndex - 1).addClass('modal-stack');
  }, 0);
});
// TODO: obsolete functions?
function showResult(content: string, title: string = 'StateMachine Feedback'): void {
  var M = new Modal(title, content)
  M.show()
}
function addClassToDataRow(jQuerySelector: string, id: number, classname: string) {
  $(jQuerySelector+' .datarow').removeClass(classname); // Remove class from all other rows
  $(jQuerySelector+' .row-'+id).addClass(classname);
}
function showSE(jQSel) {
  // TODO: First show the modal and then draw the StateMachine
  getTableByjQSel(jQSel).SM.openSEPopup();
}
//--------------------------------------------------------------------------
// Initialize Tables (call from HTML)

async function initTables(callback: any = function(){}) {
  var promises = []
  sendRequest('init', '', async function(r){    
    gConfig = JSON.parse(r);
    var tables = Object.keys(gConfig);
    // Init Table Objects
    tables.map(function(t){
      var p = new Promise(function(resolve){
        // Create a new object and save it in global array
        if (gConfig[t].is_in_menu) {
          var newT = new Table(t, '.table_'+t, false, function(){
            resolve();
          })
          gTables.push(newT)
        } else resolve();
      })
      promises.push(p);
    })
    await Promise.all(promises);
    // First Tab selection
    $('.nav-tabs .nav-link:first').addClass('active')
    $('.tab-content .tab-pane:first').addClass('active')
    callback()
  })

  
}