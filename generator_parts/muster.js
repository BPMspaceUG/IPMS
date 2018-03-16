/************************** ANGULAR START *************************/ 
var app = angular.module("genApp", [])
//--- Controller
app.controller('genCtrl', function ($scope, $http, $filter) {
  // Variables
  $scope.tables = []
  $scope.isLoading = true
  $scope.PageLimit = 15 // default = 10
  $scope.selectedRow = {}
  $scope.FKTbl = []
  $scope.pendingState = false
  $scope.actStateID = 0


  // TODO: Remove this function
  // THIS Functions are obsolete!!!
  $scope.getTableByName = function(table_name) {    
    if (typeof table_name != "string") return
    return $scope.tables[table_name]
  }


  $scope.parseDate = function(date_string) {
  	return new Date(date_string)
  }
  $scope.sortCol = function(table, columnname) {
    table.sqlascdesc = (table.sqlascdesc == "desc") ? "asc" : "desc"
    table.sqlorderby = columnname
    $scope.refresh(table.table_name)
  }
  $scope.openFK = function(key) {    
    var table_name = $scope.selectedTable.columns[key].foreignKey.table
    // Get the table from foreign key
    $scope.FKTbl = $scope.getTableByName(table_name)
    $scope.FKActCol = key
    // Show Modal
    $('#myFKModal').modal('show')
  }
  $scope.substituteFKColsWithIDs = function(row) {
		var col = $scope.selectedTable.columns[$scope.FKActCol].foreignKey.col_id
		//console.log(col)
    $scope.selectedRow[$scope.FKActCol+"________newID"] = row[col]
    var substcol = $scope.selectedTable.columns[$scope.FKActCol].foreignKey.col_subst
    var keys = Object.keys($scope.selectedRow)
    for (var i=0;i<keys.length;i++) {
      if (keys[i] == $scope.FKActCol)
        $scope.selectedRow[$scope.FKActCol] = row[substcol]
    }

  }
  $scope.selectFK = function(row) {
    $scope.substituteFKColsWithIDs(row)    
    $('#myFKModal').modal('hide') // Close modal when selected
  }
  $scope.getPageination = function(table_name) {
    var MaxNrOfButtons = 5
    var t = $scope.getTableByName(table_name)
    if (!t) return
    NrOfPages = $scope.getNrOfPages(t)
    // [x] Case 1: Pages are less then NrOfBtns => display all
    if (NrOfPages <= MaxNrOfButtons) {
      pages = new Array(NrOfPages)
      for (var i=0;i<pages.length;i++)
        pages[i] = i - t.PageIndex
    } else {
      // [x] Case 2: Pages > NrOfBtns display NrOfBtns
      pages = new Array(MaxNrOfButtons)
      // [x] Case 2.1 -> Display start edge
      if (t.PageIndex < Math.floor(pages.length / 2))
        for (var i=0;i<pages.length;i++) pages[i] = i - t.PageIndex
      // [x] Case 2.2 -> Display middle
      else if ((t.PageIndex >= Math.floor(pages.length / 2))
        && (t.PageIndex < (NrOfPages - Math.floor(pages.length / 2))))
        for (var i=0;i<pages.length;i++) pages[i] = -Math.floor(pages.length / 2) + i 
      // [x] Case 2.3 -> Display end edge
      else if (t.PageIndex >= NrOfPages - Math.floor(pages.length / 2)) {
        for (var i=0;i<pages.length;i++) pages[i] = NrOfPages - t.PageIndex + i - pages.length
      }
    }
    return pages
  }
  $scope.gotoPage = function(newIndex, table) {
  	var lastPageIndex = Math.ceil(table.count / $scope.PageLimit) - 1
    // Check borders
  	if (newIndex < 0) newIndex = 0 // Lower limit
  	if (newIndex > lastPageIndex) newIndex = lastPageIndex // Upper Limit
    // Set new index
  	table.PageIndex = newIndex
  	$scope.refresh(table.table_name)
  }
  $scope.getNrOfPages = function(table) {
    if (table) return Math.ceil(table.count / $scope.PageLimit)
  }
  $scope.changeTab = function(table_name) {
    $scope.selectedTable = $scope.getTableByName(table_name)
    /* Automatically set focus to search
    $(".searchfield").focus() */
  }
  $scope.loadRow = function(tbl, row) {
    $scope.selectedRow = angular.copy(row)
    $scope.selectedTable = tbl
  }
  $scope.saveEntry = function() {
    // Task is already loaded in memory
    $scope.send('update')
  }
  

  $scope.convertAllDatesToUTC = function(table, row) {
    for (var key in row) {
      if (row.hasOwnProperty(key)) {
        if (table.columns[key]) {
          // Load the Database string into JS-Object
          if (table.columns[key].DATA_TYPE == 'date' 
          || table.columns[key].DATA_TYPE == 'datetime') {
            if (row[key]) {
              if (row[key].length > 0) {
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
    $scope.loadRow(table, row)
  	// Check if there is a Date field
    for (var key in $scope.selectedRow) {
      if (row.hasOwnProperty(key)) {
        //console.log(key + " -> " + row[key]);
        if (table.columns[key]) {
          // Load the Database string into JS-Object
          if (table.columns[key].DATA_TYPE == 'date'
          || table.columns[key].DATA_TYPE == 'datetime') {

            $scope.selectedRow[key] = $scope.convertDateTimeStrToDate($scope.selectedRow[key])
          }
        }
      }
    }
    // TODO: Remove and get at Init
    $scope.send("getFormData")
    $scope.hideSmBtns = true
  }
  $scope.deleteEntry = function(table, row) {
    $scope.loadRow(table, row)
    $scope.send('delete')
  }
  $scope.addEntry = function(table_name) {
  	console.log("[Create] Button clicked")
    var t = $scope.getTableByName(table_name)
  	console.log(t)
    // create an empty element
    var newRow = {}    
    Object.keys(t.columns).forEach(function(col){
      newRow[col] = ''
		})
    // load empty Element
    $scope.loadRow(t, newRow)
    // if there is a create form loaded then open dialog
    if (Object.keys(t.CreateForm).length > 0) {
      t.form_data = t.CreateForm
      console.log("Show create window")
      $('#modalCreate').modal('show')
    }
  }
  $scope.getRowCSS = function(row) {
    if (angular.equals(row, $scope.selectedRow) && $scope.pendingState) {
      return "info"
    }
    return ""
  }
  $scope.gotoState = function(nextstate) {
    $scope.selectedTable.hideSmBtns = true
    $scope.actStateID = $scope.selectedRow['state_id'] // save actual stateID
    $scope.selectedRow['state_id'] = nextstate.id // set next stateID
    $scope.send('makeTransition')
  }



  // TODO: Also change this function
  $scope.initTables = function() {

    console.log("Loading configuration...")

    // Request data from config file
  	$http({
  		url: window.location.pathname,
  		method: 'post',
  		data: {
        cmd: 'init',
        paramJS: ''
      }
  	}).success(function(resp){

      console.log("Config loaded.", resp)

      // Init each table
  		Object.keys(resp).forEach(function(t){
        //console.log(resp[t])
        // If table is in menu
        if (resp[t]) { //.is_in_menu) {
          // Add where, sqlwhere, order
          resp[t].sqlwhere = ''
          resp[t].sqlwhere_old = ''
          resp[t].sqlorderby = ''
          resp[t].sqlascdesc = ''
          resp[t].nextstates = []
          resp[t].statenames = []
          resp[t].PageIndex = 0
          resp[t].CreateForm = {}
          // OLD: $scope.tables.push(resp[t])
        }
      })
      // save in tables var
      $scope.tables = resp
      console.log($scope.tables)

      // Refresh each table
      Object.keys($scope.tables).forEach(function(tbl_name){
        // Refresh Table
        $scope.refresh(tbl_name)
        // Load Create Form
        $scope.selectedTable = $scope.getTableByName(tbl_name)
        $scope.send("getFormCreate")
        // Load StateMachine
        $scope.getStatemachine(tbl_name)
      })

      // GUI
      $scope.isLoading = false

      // Auto click first tab
      var res = Object.keys($scope.tables).filter(function(t){
        return $scope.tables[t].is_in_menu
      })
      var first_tbl_name = res[0]
      $scope.selectedTable = $scope.getTableByName(first_tbl_name)
      $('#'+first_tbl_name).tab('show')
  	});	
  }
  $scope.countEntries = function(table_name) {  	
    var t = $scope.getTableByName(table_name)
    // Get FKs from columns
    // TODO: Improve
    var joins = []
    Object.keys(t.columns).forEach(function(col) {
      if (t.columns[col].foreignKey.table != "") { // Check if there is a substitute for the column
        t.columns[col].foreignKey.replace = t.columns[col].COLUMN_NAME
        joins.push(t.columns[col].foreignKey)
      }
    })
    // Request
    console.log("Counting entries...")
    $http({
      method: 'post',
      url: window.location.pathname,
      data: {
        cmd: 'read',
        paramJS: {
          select: "COUNT(*) AS cnt",
          tablename: t.table_name,
          limitStart: 0,
          limitSize: 1,
          where: t.sqlwhere,
          orderby: t.sqlorderby,
          ascdesc: t.sqlascdesc,
          join: joins
        }
      }
    }).success(function(response){
    	//console.log(response)
    	if (response.length > 0)
      	t.count = response[0].cnt
    });
  }

  //------------------------------------------------------- Statemachine functions

  // TODO: Remove this function and use ForeignKeys (Problem: function filterFK)
  $scope.substituteSE = function(tablename, stateID) {
    //console.log("===> ", tablename, "---", stateID)
    t = $scope.getTableByName(tablename)
    if (!t.se_active) return
    // Converts stateID -> Statename
    res = stateID
    t.statenames.forEach(function(state){
      if (parseInt(state.id) == parseInt(stateID))
        res = state.name
    })
    return res
  }
  $scope.getStatemachine = function(table_name) {
    var t = $scope.getTableByName(table_name)
    if (!t.se_active) return
    console.log("HTTP: get Statemachine")
    // Request
  	$http({
  		url: window.location.pathname,
  		method: 'post',
  		data: {
  			cmd: 'getStates',
  			paramJS: {table: table_name}
  	}
  	}).success(function(response) {
      t.statenames = response
  	})
  }
  function isExitNode(NodeID, links) {
  	var res = true;
  	links.forEach(function(e){
  		if (e.from == NodeID && e.from != e.to)
  			res = false;
    })
    return res
  }
  function formatLabel(strLabel) {
  	// insert \n every X char
  	newstr = strLabel.replace(" ", "\n")
  	return newstr //strLabel.replace(/(.{10})/g, "$&" + "\n")
  }
  $scope.drawProcess = function(tbl) {
    var strLinks = ""
    var strLabels = ""
    var strEP = ""
    // Links
    tbl.smLinks.forEach(function(e){strLinks += "s"+e.from+"->s"+e.to+";\n"})
    // Nodes
    tbl.smNodes.forEach(function(e){
      // draw EntryPoint
      if (e.entrypoint == 1) strEP = "start->s"+e.id+";\n" // [Start] -> EntryNode
      // Check if is exit node
      extNd = isExitNode(e.id, tbl.smLinks) // Set flag
      // Actual State
      strActState = ""
      if (!extNd) // no Exit Node
      	strLabels += 's'+e.id+' [label="'+formatLabel(e.name)+'"'+strActState+'];\n'
     	else // Exit Node
     		strLabels += 's'+e.id+' [label="\n\n\n\n'+formatLabel(e.name)+'" shape=doublecircle color=gray20 fillcolor=gray20 width=0.15 height=0.15];\n'
    })
    // Render SVG
    document.getElementById("statediagram").innerHTML = Viz(`
    digraph G {
      # global
      rankdir=LR; outputorder=edgesfirst; pad=0.5; splines=ortho; nodesep=0.75;
      node [style="filled, rounded" color=gray20 fontcolor=gray20 fontname="Helvetica-bold" shape=box fixedsize=true fontsize=9 fillcolor=white width=0.9 height=0.4];
      edge [fontsize=10 color=gray80 arrowhead=open];
      start [label="\n\n\nStart" shape=circle color=gray20 fillcolor=gray20 width=0.15 height=0.15];
      # links
      `+strEP+`
      `+strLinks+`
      # nodes
      `+strLabels+`
    }`);
    // Draw Tokens
    drawTokens(tbl)
  }
  $scope.openSEPopup = function(table_name) {
  	var t = $scope.getTableByName(table_name)
  	// if no statemachine exists, exit
    if (!t.se_active) return
  	// Request STATES
    $http({url: window.location.pathname, method: 'post',
      data: {cmd: 'getStates', paramJS: {table: t.table_name}}
    }).success(function(response){
      t.smNodes = response
      // Request LINKS
      $http({url: window.location.pathname, method: 'post',
        data: {cmd: 'smGetLinks', paramJS: {table: t.table_name}}
      }).success(function(response){
        t.smLinks = response
        $scope.drawProcess(t)
        // Finally, if everything is loading, show Modal
        $('#modalStateMachine').modal('show')
      })
    })    
  }
  //-------------------------------------------------------

  // Refresh Function
  $scope.refresh = function(table_name) {

    var t = $scope.getTableByName(table_name)
    // Search-Event (set LIMIT Param to 0)
    if (t.sqlwhere != t.sqlwhere_old)
    	t.PageIndex = 0
    // Get columns from columns
    var sel = []
    var joins = []

    Object.keys(t.columns).forEach(function(col) {
      // TODO: -> better on server side
      if (t.columns[col].foreignKey.table != "") {
      // Check if there is a substitute for the column
        t.columns[col].foreignKey.replace = col
        joins.push(t.columns[col].foreignKey)
      } else 
        sel.push("a."+col)
    })
    str_sel = sel.join(",")

  	// Request from server
  	console.log("HTTP Refresh ", table_name)

  	$http({
  		url: window.location.pathname,
  		method: 'post',
  		data: {
    		cmd: 'read',
    		paramJS: {
    			tablename: t.table_name,
    			limitStart: t.PageIndex * $scope.PageLimit,
    			limitSize: $scope.PageLimit,
    			select: str_sel,
          where: t.sqlwhere,
          orderby: t.sqlorderby,
         	ascdesc: t.sqlascdesc,
          join: joins
    		}
  	  }
  	}).success(function(response){

      t.rows = response // Save cells in tablevar

      t.sqlwhere_old = t.sqlwhere
      // Refresh Counter (changes when delete or create happens) => countrequest if nr of entries >= PageLimit
      if (response.length >= $scope.PageLimit)
        $scope.countEntries(table_name)
      else {
        if (t.PageIndex == 0)
        	t.count = response.length
      }
      // Get the states from table
      // TODO: ...? obsolete? maybe only refresh at init, then always getNextstates
      //$scope.getStatemachine(table_name)
  	})
  }

  // --------------------------
  
  $scope.initTables()

  // --------------------------

  $scope.filterFKeys = function(table, row) {
    var result = {}
    var keys = Object.keys(row) // get column names
    for (var i=0;i<keys.length;i++) {
      var col = keys[i]
      // if they have no foreign key --> just add to result
      tmpCol = table.columns[col]
      if (tmpCol) {
        if (tmpCol.foreignKey.table == "") {
          // No Foreign-Key present
          result[col] = row[col]
        } else {
        	// Foreign-Key present -> Exchange ID
          newID = $scope.selectedRow[col+"________newID"]
          if (newID)
            result[col] = newID // Only set when exists            
        }
      }
    }
    return result
  }

  //============================================== Basic Send Method

  $scope.send = function(cud, param) {

  	// if params are given load params
    if (param) $scope.loadRow(param.table, param.row)

    var body = {cmd: 'cud', paramJS: {}}
    //TODO: Give as parameter
    var t = $scope.selectedTable

    //------------------- Assemble Data
  	if (cud == 'create' || cud == 'delete' ||	cud == 'update' ||
  			cud == 'getFormData' || cud == 'getFormCreate' ||
  			cud == 'getNextStates' ||	cud == 'getStates' ||	cud == 'makeTransition') {

        $scope.pendingState = true

     		// Confirmation when deleting
        if (cud == 'delete') {
      		IsSure = confirm("Do you really want to delete this entry?")
      		if (!IsSure) return
        }
        // Prepare Data
  		  body.paramJS = {
    			row : $scope.selectedRow,
    			table : t.table_name
    		}
        // Filter out foreign keys
        if (cud == 'update' || cud == 'makeTransition') {
          // Filter foreign keys
          body.paramJS.row = $scope.filterFKeys(t, body.paramJS.row)
          body.paramJS.row = $scope.convertAllDatesToUTC(t, body.paramJS.row)
        }
        // Check if state_machine at create
        if (cud == 'create') {
          // StateEngine for entrypoints
          // TODO: Optimize, or even better: remove column completely
          // Also select an Entrypoint if there are more than 1
          // also possible for different processes for each element
          if (t.se_active) body.paramJS.row.state_id = '%!%PLACE_EP_HERE%!%';
          // check Foreign keys
          body.paramJS.row = $scope.filterFKeys(t, body.paramJS.row)
          body.paramJS.row = $scope.convertAllDatesToUTC(t, body.paramJS.row)
        }
    }

    // ------------------- Send request
    console.log("===> POST ---", cud, "--- params=", body.paramJS)
    // Request
    $http({
      url: window.location.pathname,
      method: 'post',
      data: {
      	cmd: cud,
      	paramJS: body.paramJS
      }
    }).success(function(response) {
      // Response
      console.log("<= ResponseData: ", response)
      $scope.pendingState = false
      var table = $scope.getTableByName(body.paramJS.table)
      //-------------------- table data was modified
      if (response != 0 && (cud == 'delete' || cud == 'update' || cud == 'create')) {  
        // Created
				if (cud == 'create') {
          //console.log("New Element with ID", response, "created.")
          //console.log(response)
          // TODO: Make possible HTML Formated Message -> Small modal
        	if (response.show_message)
          	alert(response.message)
          // Hide create-modal
          if (response.element_id)
          	$('#modalCreate').modal('hide')
          // TODO: Maybe jump to entry which was created
        }
        $scope.refresh(body.paramJS.table)
      }
      else if (cud == 'getFormData') {
      	if (response != "1") {
        	$scope.send("getNextStates") // get next States
        	table.form_data = response
        }
        $('#modalEdit').modal('show')
      }
      else if (cud == 'getFormCreate') {
        table.CreateForm = response
        table.form_data = response
        //$('#modalCreate').modal('show')
      }
      //---------------------- StateEngine (List Transitions)
      else if (cud == 'getNextStates') {
      	// Save next States
        table.nextstates = response
        $scope.selectedTable.hideSmBtns = false
      }
      else if (cud == 'makeTransition') {
        var rsp = response
        for (var i=0; i<rsp.length; i++) {
          // Message
          if (rsp[i].show_message)
            alert(rsp[i].message)
          // Set Back to orig. State
          if (!rsp[i].allow_transition)
            $scope.selectedRow['state_id'] = $scope.actStateID;
        }
        // Refresh Table
       	$scope.refresh(body.paramJS.table)
       	$scope.send("getFormData")
      }
      else {
        // Error from server
        alert("Error at ["+cud+"] command.\nThe server returned:\n" + response)
      }
    })
  }
})
app.directive('stringToNumber', function() {
  return {
    require: 'ngModel',
    link: function(scope, element, attrs, ngModel) {
      ngModel.$parsers.push(function(value) { return '' + value; })
      ngModel.$formatters.push(function(value) { return parseFloat(value); })
    }
  }
})
app.filter('orderObjectBy', function() {
  return function(items, field, reverse) {
    var filtered = [];
    angular.forEach(items, function(item) {
      filtered.push(item);
    });
    filtered.sort(function (a, b) {
      return (a[field] > b[field] ? 1 : -1);
    });
    if(reverse) filtered.reverse();
    return filtered;
  }
})

app.filter('convertDate', function($filter) {
  return function (dateString, format) {
    if(dateString === '0000-00-00') return ""
    return $filter('date')(dateString, format.toString())
  }
})
app.filter('convertDateTime', function($filter) {
  return function (dateString, format) {
    if (!dateString) return ""
    if (dateString == "") return ""
    if(dateString == '0000-00-00 00:00:00') return ""
    return $filter('date')(new Date(dateString), format.toString())
  }
})


/************************** ANGULAR END *************************/ 

// Every time a modal is shown, if it has an autofocus element, focus on it.
$('#myFKModal').on('shown.bs.modal', function() { $(this).find('[autofocus]').focus() });
$('#modalCreate').on('shown.bs.modal', function() { $(this).find('[autofocus]').first().focus() });
$('#modalEdit').on('shown.bs.modal', function() { $(this).find('[autofocus]').first().focus() });



function drawTokens(tbl) {
  // Clear all Tokens
  $(".token").remove()
  // Add Tokens
  tbl.smNodes.forEach(function(e){
  	if (e.NrOfTokens > 0)
  		drawTokenToNode(e.id, e.NrOfTokens)
  })
}
 
function drawTokenToNode(state_id, text) {
	// Get Position of Node
	var pos = $("title").filter(function(){
		return $(this).text() === 's'+state_id;
	}).parents(".node")
	// Find Text
	txt = pos.find("text")
	var x = parseFloat(txt.attr("x"))
	var y = parseFloat(txt.attr("y"))
	y = y + 19
	// Add Badge
  var existingContent = pos.html()
 	//x = x - 5 // (text.toString().length * 3) // center
 	text = text.toString()
  var toInsert = '<g class="token"><circle class="token_bg" cx="'+x+'" cy="'+y+'" fill="#5599dd" r="8"></circle>'+
  	'<text class="token_txt" x="'+(x - (2.5 * text.length))+'" y="'+(y+3.5)+'" fill="white" font-size="8px">'+text+'</text></g>'
  pos.html(existingContent + toInsert)
}