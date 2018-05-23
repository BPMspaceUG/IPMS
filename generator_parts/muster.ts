// Global variables
var gTables: Array<Table> = []

// Path for API
var path = window.location.pathname
var pathName = path.substring(0, path.lastIndexOf('/') + 1);
const gURL =  pathName + 'api/'

// Plugins
var $: any;
var Viz: any;

// Atomic Function for API Calls -> ensures Authorization 
function sendRequest(command: string, params: any, callback): void {
  // TODO: Better use localStorage -> saves Bandwidth and does not expire
  var cookie = document.cookie
  var token = cookie.split('token=')[1]
  // Request (every Request is processed by this function)
  $.ajax({
    method: "POST",
    url: gURL,
    beforeSend: function (xhr) {
      xhr.setRequestHeader('Authorization', 'Bearer '+token);
    },
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
  DOM_ID: string

  constructor(heading: string, content: string, footer: string = '', isBig: boolean = false) {
    this.DOM_ID = 'msgBx'
    // Check if ID exists then add Number -> like 'idStrxxx'
    while ( $("#"+this.DOM_ID).length ) {
      this.DOM_ID  += "X"
    }
    var sizeType = ''
    if (isBig)
      sizeType = ' modal-lg'
    // Result
    var html =  '<div id="'+this.DOM_ID+'" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="confirm-modal" aria-hidden="true">';
    html += '<div class="modal-dialog'+sizeType+'">';
    html += '<div class="modal-content">';
    html += '<div class="modal-header">';
    html += '<button type="button" class="close" data-dismiss="modal" aria-label="Close">';
    html += '<span aria-hidden="true">&times;</span>';
    html += '</button>';
    html += '<h4>'+heading+'</h4>'
    html += '</div>';
    html += '<div class="modal-body" style="max-height: 600px; overflow:auto;">';
    // TODO: Maybe remove this and store in object instead
    html += '<span style="display:none;" class="stored_data"></span>';
    html += content;
    html += '</div>';
    html += '<div class="modal-footer">';
    html += footer;
    html += '<span class="btn btn-default" data-dismiss="modal"><i class="fa fa-times"></i> Close</span>';
    html += '</div>';  // content
    html += '</div>';  // dialog
    html += '</div>';  // footer
    html += '</div>';  // modalWindow
    $('body').append(html);    
    // Remove from DOM on close
    $('#'+this.DOM_ID ).on('hidden.bs.modal', function (e) {
        $(this).remove();
    });
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

  getHTML(): string {
      return "";
  }

  openSEPopup() {
    var smLinks, smNodes
    var me = this
  
    console.log("Request [getStates]")
    sendRequest('getStates', {table: me.tablename}, function(r) {
      smNodes = JSON.parse(r)
      console.log("Request [smGetLinks]")
      sendRequest('smGetLinks', {table: me.tablename}, function(r) {
        smLinks = JSON.parse(r)
        // Render the StateMachine JSON DATA in DOT Language
        var strSVG: string = me.transpileSMtoDOT(smNodes, smLinks)
        //drawTokens(t)
        // Finally, when everything was loaded, show Modal
        var M = new Modal('StateMachine', '<div class="statediagram" style="max-height: 600px; overflow: auto;"></div>', '', true)
        var MID = M.DOM_ID
        $("#"+MID+" .statediagram").html(Viz(strSVG))
        M.show()
      })
    })
  }
  formatLabel(strLabel) {
    var newstr: string = strLabel //.replace(" ", "\n")
    return newstr //strLabel.replace(/(.{10})/g, "$&" + "\n")
  }
  transpileSMtoDOT(smNodes, smLinks): string {
    var strLinks: string = ""
    var strNodes: string = ""
    var strExitNodes: string = ""
    var strEP: string = ""
    var me = this
    // Build Links-String
    smLinks.forEach(function(e){
      if (e.from == e.to) {
        // Loop
        strLinks += "s"+e.from+":e -> s"+e.to+":w [penwidth=0.5];\n";
      }
      else {
        if (me.isExitNode(e.to, smLinks)) {
          // Link to exit
          strLinks += "s"+e.from+":e -> s"+e.to+":w;\n"
        } else {
          // Normal Link
          strLinks += "s"+e.from+":e -> s"+e.to+";\n"
        }
      }
    })
    // Build-Nodes String
    smNodes.forEach(function(e){
      // draw EntryPoint
      if (e.entrypoint == 1) strEP = "start:e -> s"+e.id+":w;\n" // [Start] -> EntryNode
      // Check if is exit node
      var extNd = me.isExitNode(e.id, smLinks) // Set flag
      // Actual State
      var strActState = ""
      if (!extNd) // no Exit Node
        strNodes += 's'+e.id+' [label="'+me.formatLabel(e.name)+'"'+strActState+'];\n'
      else // Exit Node
        strExitNodes += 's'+e.id+' [label="" xlabel="'+me.formatLabel(e.name)+'" rank="sink" shape=doublecircle labeldistance = 1, color=gray20 fixedsize=true fillcolor=gray20 width=0.1 height=0.1 margin = "0,0.8"];\n'
    })
    // Give back vaild DOT String
    var result: string = `
    digraph G {
      # global
      graph [ rankdir=LR, ranksep ="0.7" nodesep=0.5 outputorder=edgesfirst]
      node [fontname="Tahoma" style="filled" penwidth = 1, fillcolor=white, height = 0.5, color=gray20 margin="0.20,0.05", shape=Mrecord, fontsize=8];
      edge [arrowhead="vee" color=gray60, fillcolor=gray60 tailport=e];
      start [label="" rank="source" shape=circle color=gray20 fillcolor=gray20 fixedsize=true width=0.15 height=0.15];
      # links
      `+strEP+`
      `+strLinks+`
      # nodes
      subgraph cluster_0 {
        style=filled;
        rank=same;
        color=white;
        `+strNodes+`
      }
      `+strExitNodes+`
    }`;
    return result
  }
  drawTokens(tbl) {
    var me = this
    // Clear all Tokens from SVG
    $(".token").remove()
    // Add Tokens
    tbl.smNodes.forEach(function(e){
      if (e.NrOfTokens > 0)
        me.drawTokenToNode(e.id, e.NrOfTokens)
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
  drawTokenToNode(state_id, text) {
    // Get Position of Node
    var pos = $("title").filter(function(){
      return $(this).text() === 's'+state_id;
    }).parents(".node")
    // Find Text
    var txt = pos.find("text")
    var x: number = parseFloat(txt.attr("x"))
    var y: number = parseFloat(txt.attr("y"))
    y = y + 19
    // Add Badge
    var existingContent = pos.html()
     //x = x - 5 // (text.toString().length * 3) // center
     text = text.toString()
    var toInsert: string = '<g class="token"><circle class="token_bg" cx="'+x+'" cy="'+y+'" fill="#5599dd" r="8"></circle>'+
      '<text class="token_txt" x="'+(x - (2.5 * text.length))+'" y="'+(y+3.5)+'" fill="white" font-size="8px">'+text+'</text></g>'
    pos.html(existingContent + toInsert)
  }
}

//==============================================================
// Class: Table
//==============================================================
class Table {
  Columns;
  Rows;
  Filter: string;
  Filter_Old: string;
  OrderBy: string;
  PrimaryColumn: string;
  AscDesc: SortOrder = SortOrder.DESC;
  tablename: string;
  PageLimit: number = 10;
  PageIndex: number = 0;
  actRowCount: number; // Count total
  jQSelector: string = '';
  selectedIDs: number[];
  Form_Create: string;
  SM: StateMachine;
  ReadOnly: boolean;
  lastModifiedRowID: number;
  isFK: boolean;

  constructor(isFK: boolean, DOMselector: string, tablename: string, columns: any, hasSM: boolean = false, readonly: boolean = false) {
    this.tablename = tablename;
    this.jQSelector = DOMselector;
    this.PageIndex = 0;
    this.actRowCount = 0;
    this.Columns = columns;
    this.ReadOnly = readonly;
    this.isFK = isFK
    // Get the Primary column name
    var PriCol: string;
    Object.keys(columns).forEach(function(col){
      if (columns[col].EXTRA == 'auto_increment')
        PriCol = col
    })
    this.PrimaryColumn = PriCol;
    this.OrderBy = PriCol; // DEFAULT: Sort that newest element is on top
    this.Filter = '';
    this.Filter_Old = '';
    this.Form_Create = '';
    this.getFormCreate();
    
    if (hasSM)
      this.SM = new StateMachine(this.tablename);
    else
      this.SM = null;
    var me = this
    this.countRows(function(){me.loadRows();})
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
    console.log("Set PageIndex", targetIndex)
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
    var trunc_len: number = 30
    if (typeof cellStr == 'string') {
      // String, and longer than X chars
      if (cellStr.length >= trunc_len)
        return cellStr.substr(0, 30) + "\u2026";
    } else if (Array.isArray(cellStr)) {
      // Foreign Key
      if (cellStr[1] !== null)
        return cellStr[1]
      else
        return '';
    }
    return cellStr
  }
  getHTMLStatusText(t: Table): string {
    if (t.actRowCount > 0)
      return 'Showing Entries '+((t.PageIndex*t.PageLimit)+1)+'-'+
        ((t.PageIndex*t.PageLimit)+t.Rows.length)+' of '+t.actRowCount+' Entries';
    else
      return 'No Entries';
  }
  renderHTML(): void {
    var t = this
    var jQSelector: string = t.jQSelector
    console.log("Render HTML for Table", t.tablename, " @ ", jQSelector)
    
    $(jQSelector).empty() // GUI: Clear entries
  
    var ths: string = ''
    if (!t.ReadOnly) {
      ths = '<th></th>'; // Pre fill with 1 because of selector
    }
    // Data Rows
    Object.keys(t.Columns).forEach(function(col) {
      if (t.Columns[col].is_in_menu) {
        ths += '<th onclick="getTable(\''+t.tablename+'\').toggleSort(\''+col+'\')" class="datatbl_header'+
          (col == t.OrderBy ? ' sorted' : '')+'">'+
          t.Columns[col].column_alias+
          (col == t.OrderBy ? '&nbsp;'+(t.AscDesc == SortOrder.ASC ? '⭣' : (t.AscDesc == SortOrder.DESC ? '⭡' : '') )+'' : '')
          '</th>'
      }
    })
  
    // This is required, otherwise the pagination does not work after searching anymore
    if (!t.Filter) t.Filter = ''; // Set Filter to empty-string
  
    var pgntn = ''
    var PaginationButtons = t.getPaginationButtons()
    // Only Display Buttons, when more than one Button exists
    if (PaginationButtons.length > 1)
      PaginationButtons.forEach(
        btnIndex => {
          pgntn += '<li'+(t.PageIndex == t.PageIndex+btnIndex ? ' class="active"' : '')+'><a onclick="'+
            'getTable(\''+t.tablename+'\').setPageIndex('+(t.PageIndex + btnIndex)+')">'+
            (t.PageIndex + 1 + btnIndex)+
            '</a></li>'
      })
    else
    pgntn += '<li><a style="background-color: #ddd; cursor: default;">&nbsp;</a></li>';
  
    var header: string = '<div class="element">'+
      '<p class="form-inline">'+
      '<input class="form-control filterText" style="max-width: 300px" placeholder="Filter..."'+
      'onkeydown="javascript: if(event.keyCode == 13) getTable(\''+t.tablename+'\').loadRows();">'+
      // Filter Button
      '&nbsp;<button class="btn btn-default" onclick="getTable(\''+t.tablename+'\').loadRows()"><i class="fa fa-search"></i><span class="hidden-xs">&nbsp;Filter</span></button>'+
      // Workflow Button 
      '&nbsp;<button class="btn btn-default" onclick="showSE(\''+t.tablename+'\')"'+(t.SM ? '' : ' disabled')+'>'+
      '<i class="fa fa-random"></i><span class="hidden-xs">&nbsp;Workflow</span></button>';
  
    // No Buttons if ReadOnly
    if (!t.ReadOnly) {
      header +=
        // Create Button
        '&nbsp;<button class="btn btn-success" onclick="createEntry(\''+t.tablename+'\')">'+
        '<i class="fa fa-plus"></i><span class="hidden-xs">&nbsp;Create</span></button>';
    }
    header += '</p><div class="datatbl"><table class="table table-hover tableCont"><thead><tr>'+ths+'</tr></thead><tbody>';
  
    var footer: string = '</tbody></table></div>'+
      '<div class="footer">'+
        '<p class="pull-left">'+t.getHTMLStatusText(t)+'</p>'+
        '<ul class="pagination pull-right">'+pgntn+'</ul>'+
        '<div class="clearfix"></div>'+
      '</div>'+
      '</div>'
  
    var tds: string = '';
  
    // Loop Rows
    if (!t.Rows) return
    t.Rows.forEach(function(row){
      var data_string: string = '';
      // Control column
      if (!t.ReadOnly) {
        data_string = '<td class="controllcoulm">'+
          '<i class="fa fa-pencil"></i>'+
          '<i class="fa fa-trash" onclick="delRow(\''+t.tablename+'\', '+row[t.PrimaryColumn]+')"></i>'+
          '</td>'
      }      
      // Loop Columns
      Object.keys(t.Columns).forEach(function(col) {
        var value = row[col]
        // Check if it is displayed
        if (t.Columns[col].is_in_menu) {
          // Build edit String TODO: optimize with callback
          var modRowStr = ''
          if (!t.ReadOnly) {
            modRowStr = 'modifyRow(\''+t.jQSelector+'\',\''+t.tablename+'\', '+row[t.PrimaryColumn]+')'
          }
          // check Cell-Value
          if (value) {
            // Truncate Cell if Content is too long
            value = t.formatCell(value)
            // Check for statemachine
            if (col == 'state_id' && t.tablename != 'state') {
              data_string += '<td onclick="'+modRowStr+'">'+
              '<span class="label label-state state'+row['state_id'][0]+'">'+value+'</span></td>'
            }
            else
              data_string += '<td onclick="'+modRowStr+'">'+value+'</td>'
          } else {
            data_string += '<td onclick="'+modRowStr+'">&nbsp;</td>' // Add empty cell
          }
        }
      })
      tds += '<tr class="datarow row-'+row[t.PrimaryColumn]+'">'+data_string+'</tr>'
    })
    // GUI
    $(jQSelector).append(header+tds+footer)
    $(jQSelector+' .filterText').focus().val('').val(t.Filter)
    if (t.lastModifiedRowID != 0) {
      addClassToDataRow(jQSelector, t.lastModifiedRowID, 'info')
      t.lastModifiedRowID = 0;
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
  // TODO: Only call this function once at [init] and then only on [create] and [delete] and at [filter]
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
          // Call callback function
          callback()
        }
      }
    })
  }
  loadRows(): void {
    var me: Table = this;

    // Check Filter event -> jmp to page 1
    this.Filter = $(this.jQSelector + " .filterText").val()
    if ((this.Filter != this.Filter_Old) && this.PageIndex != 0)
      this.PageIndex = 0;
    
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
      if (me.Filter) {
        if (me.Filter.length > 0)
          me.Filter_Old = me.Filter
      }
      me.renderHTML()
    })
  }
}



// TODO:  Put the folowing functions in the classes, or reduce them

// BUTTON Create
function createEntry(table_name: string): void {
  var htmlForm = getTable(table_name).Form_Create;
  var SaveBtn = '<button class="btn btn-success btnCreateEntry" type="button">'+
    '<i class="fa fa-plus"></i>&nbsp;Create</button>';
  var M = new Modal('Create Entry', htmlForm, SaveBtn, true)
  var ModalID = M.DOM_ID

  // save hidden data in modal
  var data = {mid: ModalID, tablename: table_name}
  $('#'+ModalID+' .stored_data').html(JSON.stringify(data));

  // Bind Buttonclick
  $('#'+ModalID+' .btnCreateEntry').click(function(){
    // Recover hidden data from modal
    var Xdata = JSON.parse($(this).parent().parent().find('.stored_data').html());
    var tablename: string = Xdata.tablename;
    var MID: string = Xdata.mid;

    // Read out all input fields with {key:value}
    var data = readDataFromForm('#'+MID, tablename)

    // Only if statemachine active,
    // otherwise conflict when creating an entry in tabe 'state'
    /*
    if (getTable(tablename).SM)
      data['state_id'] = '%!%PLACE_EP_HERE%!%';
    */
    // RESPONSE
    function created(r){
      // Remove all Error Messages
      $('#' + MID + ' .modal-body .alert').remove();
      //console.log("Create (RAW):", r)
      try {
        var msgs = JSON.parse(r)
      }
      catch(err) {
        //console.log("Script Error:", r)
        // Show Error        
        $('#' + MID + ' .modal-body').prepend('<div class="alert alert-danger" role="alert">'+
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
            $('#'+MID).modal('hide')
            var t = getTable(tablename)
            t.lastModifiedRowID = msg.element_id
            t.loadRows()
          }
        } else {
          // ElementID has to be 0! otherwise the transscript aborted
          if (msg.element_id == 0) {
            $('#' + MID + ' .modal-body').prepend('<div class="alert alert-danger" role="alert">'+
              '<b>Database Error!</b>&nbsp;'+ msg.errormsg +
              '</div>')
          }
        }
        counter++;
      });
    }
    // REQUEST
    getTable(tablename).createRow(data, created); 
  })

  M.show()
}

// TODO: Function should be >>>setState(this, 13)<<<, for individual buttons
function setState(btn, tablename: string, RowID: number, targetStateID: number): void {
  var Xdata = JSON.parse($(btn).parent().parent().find('.stored_data').html());
  var Mid = Xdata.mid
  var t = getTable(tablename)

  // Read out all input fields with {key:value}
  var data = readDataFromForm('#'+Mid, tablename)

  // REQUEST
  t.transitRow(RowID, targetStateID, data, transitioned)
  // RESPONSE
  function transitioned(r) {
    // Remove all Error Messages
    $('#' + Mid + ' .modal-body .alert').remove();
    try {
      var msgs = JSON.parse(r)
    }
    catch(err) {
      console.log("Error:", r)
      $('#' + Mid + ' .modal-body').prepend('<div class="alert alert-danger" role="alert">'+
      '<b>Script Error!</b>&nbsp;'+ r +
      '</div>')
      return
    }
    // Handle Transition Feedback
    console.log("TransScript:", msgs)
    var counter = 0;
    msgs.forEach(msg => {
      // Remove all Error Messages
      $('#' + Mid + ' .modal-body .alert').remove();

      // Show Message
      if (msg.show_message) {
        var info = ""
        if (counter == 0) info = 'OUT-Script'
        if (counter == 1) info = 'Transition-Script'
        if (counter == 2) info = 'IN-Script'
        showResult(msg.message, 'Feedback <small>'+info+'</small>')
      }

      // Check
      /*if (msg) {
        if (msg > 0) {*/
          $('#'+Mid).modal('hide')
          t.lastModifiedRowID = msg.element_id
          t.loadRows()
      /*  }
      } else {
        // ElementID has to be 0! otherwise the transscript aborted
        if (msg.element_id == 0) {
          $('#' + Mid + ' .modal-body').prepend('<div class="alert alert-danger" role="alert">'+
            '<b>Database Error!</b>&nbsp;'+ msg.errormsg +
            '</div>')
        }
      }*/
    counter++;
  });

/*
    if (r.length > 0) {
      // Messages ausgeben
      var msgs = JSON.parse(r); // TODO: Try..catch
      msgs.forEach(msg => {
        if (msg.show_message)
          showResult(msg.message)
      });
      // Close Edit Window
      $('#'+Mid).modal('hide')
      t.lastModifiedRowID = RowID
      t.loadRows()
    */
  }
}


function renderEditForm(Table: Table, RowID: number, PrimaryColumn: string, htmlForm: string, nextStates) {
  var row = Table.getRowByID(RowID)
  // state Buttons
  var btns = ''
  var actStateID = row.state_id[0] // ID
  nextStates.forEach(function(s){
    var btn_text = s.name
    if (actStateID == s.id)
      btn_text = '<i class="fa fa-floppy-o"></i> Save'
    var btn = '<button class="btn btn-primary" onclick="setState(this, \''
      +Table.tablename+'\', '+RowID+', '+s.id+')">'+btn_text+'</button>';

    btns += btn;
  })
  // Modal
  var M = new Modal('Edit Entry', htmlForm, btns, true)
  var EditMID = M.DOM_ID
  
  // save hidden data in modal
  var data = {mid: EditMID, tablename: Table.tablename}
  $('#'+EditMID+' .stored_data').html(JSON.stringify(data));

  // Load data from row and write to input fields with {key:value}
  writeDataToForm('#'+EditMID, row, Table.tablename)

  // Add PrimaryID in stored Data
  $('#'+EditMID+' .modal-body').append('<input type="hidden" name="'+PrimaryColumn+'" value="'+RowID+'">')
  M.show()
}

function readDataFromForm(jQSel: string, tablename: string): any {
  var inputs = $(jQSel+' :input')
  var data = {}
  inputs.each(function(){
    var e = $(this);
    var key = e.attr('name')
    if (key) {

      var column = null
      try {
        column = getTable(tablename).Columns[key]
      } catch (error) {
        // Column doesnt exist in current Table
        column = null
      }
      
      if (column) {
        if (e.val() == '' && column.foreignKey.table != '') {
          // if empty and FK then value should be NULL
          data[key] = null
        } else {
          var DataType = column.DATA_TYPE.toLowerCase()

          if (DataType == 'datetime') {
            // For DATETIME
            if (e.attr('type') == 'date')
              data[key] = e.val() // overwrite
            else if (e.attr('type') == 'time')
              data[key] += ' '+e.val() // append
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
function writeDataToForm(jQSel: string, data: any, tablename: string): void {
  var inputs = $(jQSel+' :input')
  inputs.each(function(){
    var e = $(this);
    var col = e.attr('name')
    var value = data[col]
    // isFK?
    if (Array.isArray(value)) {
      //--- ForeignKey
      if (col == 'state_id') {
        // Special case if name = 'state_id'
        var label = e.parent().find('.label');
        label.addClass('state'+value[0])
        label.text(value[1]);
      } else {
        // GUI Foreign Key
        e.parent().find('.fkval').text(value[1]);
      }
      // Save in hidden input
      e.val(value[0])
    }
    else {
      //--- Normal
      if (col) {
        //console.log("---------------", col, tablename)
        var DataType = getTable(tablename).Columns[col].DATA_TYPE.toLowerCase()
        if (DataType == 'datetime') {
          if (e.attr('type') == 'date')
            e.val(value.split(" ")[0])
          else if (e.attr('type') == 'time')
            e.val(value.split(" ")[1])
        }
        else
          e.val(value)
      }
    }
  })
}

// TODO: Find Table by jQSel
function modifyRow(jQSel: string, table_name: string, id: number) {
  var t: Table = getTable(table_name);
  // Indicate which row is getting modified
  addClassToDataRow(jQSel, id, 'warning')

  // if is in a FK-Modal return selected Row
  // TODO: not the best solution...
  //console.log("modifyRow [",jQSel,"]", table_name)
  if (jQSel.indexOf('foreignTable') > 0) {
    //console.log("FK selection took place", t)
    // ForeignKey
    t.selectedIDs = []
    t.selectedIDs.push(id)
    // If is only 1 select then instant close window
    $(jQSel).parent().parent().find('.btnSelectFK').click();
    return
  }
  else {
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
              renderEditForm(t, id, PrimaryColumn, htmlForm, nextstates);
            }
          })
        }
      })

    } else {

      // EDIT-Modal WITHOUT StateMachine
      var htmlForm: string = t.Form_Create;
      var PrimaryColumn: string = t.PrimaryColumn;
      // Save buttons
      var btn: string = '<button class="btn btn-primary" onclick="saveEntry(this, false)" type="button">Save</button>';
      btn += '<button class="btn btn-primary" onclick="saveEntry(this)" type="button">Save &amp; Close</button>';
      // Modal
      var M: Modal = new Modal('Edit Entry', htmlForm, btn, true)
      var dataxx  = {mid: M.DOM_ID, tablename: table_name}
      $('#'+M.DOM_ID+' .stored_data').html(JSON.stringify(dataxx));
      $('#'+M.DOM_ID+' .modal-body').append('<input type="hidden" name="'+PrimaryColumn+'" value="'+id+'">')
      
      // Write all input fields with {key:value}
      writeDataToForm('#'+M.DOM_ID, t.getRowByID(id), table_name)
      M.show()
    }
  }
}
// BUTTON SAVE + Close
function saveEntry(x, closeModal: boolean = true){
  var Xdata = JSON.parse($(x).parent().parent().find('.stored_data').html());
  var mid = Xdata.mid;
  var t: Table = getTable(Xdata.tablename);
  // Read out all input fields with {key:value}
  var inputs = $('#'+mid+' :input')
  var data = {}
  inputs.each(function(){
    var e = $(this);
    if (e.attr('name'))
      data[e.attr('name')] = e.val()
  })
  // REQUEST
  t.updateRow(data[t.PrimaryColumn], data, updated)
  // RESPONSE
  function updated(r){
    //console.log(r)
    if (r.length > 0) {
      if (r != "0") {
        // Success
        if (closeModal)
          $('#'+mid).modal('hide')
        t.lastModifiedRowID = data[t.PrimaryColumn]
        t.loadRows()
      } else {
        // Fail
        alert("Element could not be updated!")
      }
    }
  }
}

function delRow(tablename: string, id: number) {
  // Ask 
  var IsSure = confirm("Do you really want to delete this entry?")
  if (!IsSure) return
  // REQUEST
  getTable(tablename).deleteRow(id, deleted)
  // RESPONSE
  function deleted(r) {
    console.log("Deleted Row", r)
    if (r == "1") {      
      addClassToDataRow(getTable(tablename).jQSelector, id, 'danger')
    }
  }
}

function getTable(table_name: string): Table {
  var result: Table;
  gTables.forEach(function(t){ if (t.tablename === table_name) {
    result = t
  }})
  return result
}



/*====================================================================
    I N I T I A L I Z E       T A B L E S
====================================================================*/
// TODO: Put in index-html file
sendRequest('init', '', function(r){
  if (r.length > 0) {
    var data = JSON.parse(r)
    // Init Table Objects
    Object.keys(data).forEach(function(t){
      // Create a new object and save it in global array
      var newT = new Table(false, '.table_'+data[t].table_name, data[t].table_name, data[t].columns, data[t].se_active, data[t].is_read_only)
      gTables.push(newT)
    })
    // First Tab selection
    $('.nav-tabs li:first').addClass('active')
    $('.tab-content .tab-pane:first').addClass('active')
  }
})



// Overlay of many Modal windows (newest on top)
$(document).on('show.bs.modal', '.modal', function () {
  var zIndex = 1040 + (10 * $('.modal:visible').length);
  $(this).css('z-index', zIndex);
  setTimeout(function() {
      $('.modal-backdrop').not('.modal-stack').css('z-index', zIndex - 1).addClass('modal-stack');
  }, 0);
});
// Autofocus first input
/*
$(document).on('shown.bs.modal', '.modal', function () {
  //console.log("focus first element...");
  $(this).find('input[type=text],textarea,select').filter(':visible:first').focus();
});
*/

function showSE(tablename) {
  var t = getTable(tablename);
  t.SM.openSEPopup();
}
function openFK(x, fk_table_name, originalKey) {
  var SelectBtn = '<button class="btn btn-warning btnSelectFK" type="button"><i class="fa fa-check"></i> Select</button>';
  // Modal
  var M = new Modal('Select Foreign Key', '<div class="foreignTable"></div>', SelectBtn, true)
  var ModalID = M.DOM_ID
  // Load Table
  var t = getTable(fk_table_name)
  var DOMsel = '#'+ModalID+' .foreignTable'
  var t = new Table(true, DOMsel, fk_table_name, getTable(fk_table_name).Columns, (getTable(fk_table_name).SM !== null), false)
  // save hidden data in modal
  var stdata_caller = JSON.parse($(x).parent().parent().parent().parent().find('.stored_data').html());
  var callerMID = stdata_caller.mid;
  var data = {mid: ModalID, tablename: fk_table_name, orgKey: originalKey, fromMID: callerMID, originTable: stdata_caller.tablename}
  $('#'+ModalID+' .stored_data').html(JSON.stringify(data));

  // Bind Buttonclick
  $('#'+ModalID+' .btnSelectFK').click(function(){
    // Recover hidden data from modal
    var Xdata = JSON.parse($(this).parent().parent().find('.stored_data').html());
    var tablename: string = Xdata.tablename;
    var FKMID: string = Xdata.mid;
    var FKS = getTable(tablename).getSelectedRows();
    var orgKey = Xdata.orgKey
    var callerMID = Xdata.fromMID
    // Hide FK Modal
    $('#'+FKMID).modal('hide');

    // Find Edit Entry Modal and set Rows
    var element = $('#'+callerMID+' input[name=\''+orgKey+'\'');
    element.val(FKS); // Set value in hidden field
    var ForeignRow = getTable(fk_table_name).getRowByID(FKS)
    var col_subst = getTable(Xdata.originTable).Columns[orgKey].foreignKey.col_subst
    var val_subst = ForeignRow[col_subst]
    element.parent().find('.fkval').text(val_subst); // Set GUI
  })
  M.show()  
}
function showResult(content: string, title: string = 'StateMachine Feedback'): void {
  var M = new Modal(title, content)
  M.show()
}
function addClassToDataRow(jQuerySelector: string, id: number, classname: string) {
  $(jQuerySelector+' .datarow').removeClass(classname);
  $(jQuerySelector+' .row-'+id).addClass(classname);
}