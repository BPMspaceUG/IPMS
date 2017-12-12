var app = angular.module("genApp", [])
//--- Controller
app.controller('genCtrl', function ($scope, $http) {
  // Variables
  $scope.tables = []
  $scope.isLoading = true
  $scope.PageLimit = 10 // default = 10
  $scope.selectedRow = []
  $scope.FKTbl = []

  $scope.getColAlias = function(table, col_name) {
  	var res = ''
  	table.columns.forEach(function(col){
  		// Compare names
  		if (col.COLUMN_NAME == col_name)
  			res = col.column_alias
  	})
  	if (res == '') return col_name; else return res;
  }
  $scope.getColByName = function(table, col_name) {
    var res = null // empty object
    table.columns.forEach(function(col){
      // Compare names
      if (col.COLUMN_NAME == col_name)
        res = col
    })
    if (res === null) return null; else return res;
  }
  $scope.sortCol = function(table, columnname) {
    table.sqlascdesc = (table.sqlascdesc == "desc") ? "asc" : "desc"
    table.sqlorderby = columnname
    $scope.refresh(table.table_name)
  }
  $scope.openFK = function(key) {
    var table_name = $scope.getColByName($scope.selectedTable, key).foreignKey.table
    // Get the table from foreign key
    $scope.FKTbl = $scope.getTableByName(table_name)
    $scope.FKActCol = key
    // Show Modal
    $('#myFKModal').modal('show')
  }
  $scope.substituteFKColsWithIDs = function(row) {
    var col = $scope.getColByName($scope.selectedTable, $scope.FKActCol).foreignKey.col_id
    $scope.selectedRow[$scope.FKActCol+"________newID"] = row[col]
    var substcol = $scope.getColByName($scope.selectedTable, $scope.FKActCol).foreignKey.col_subst
    var keys = Object.keys($scope.selectedRow)
    for (var i=0;i<keys.length;i++) {
      if (keys[i] == $scope.FKActCol)
        $scope.selectedRow[$scope.FKActCol] = row[substcol]
    }
  }
  $scope.selectFK = function(row) {
    // Save the value, like (special trick with .id)
    /*
    var col = $scope.getColByName($scope.selectedTable, $scope.FKActCol).foreignKey.col_id
    $scope.selectedRow[$scope.FKActCol+"________newID"] = row[col]
    // Save the substituted value in the model
    // Get the foreign column
    // Substitute
    var substcol = $scope.getColByName($scope.selectedTable, $scope.FKActCol).foreignKey.col_subst
    var keys = Object.keys($scope.selectedRow)
    for (var i=0;i<keys.length;i++) {
      // check columns
      if (keys[i] == $scope.FKActCol) {
        // subsitute column
        $scope.selectedRow[$scope.FKActCol] = row[substcol]
      }
    }
    */
    $scope.substituteFKColsWithIDs(row)
    // Close modal
    $('#myFKModal').modal('hide')
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
    if (table)
      return Math.ceil(table.count / $scope.PageLimit)
  }

  $scope.loadRow = function(tbl, row) {
    $scope.selectedRow = angular.copy(row)
    $scope.selectedTable = tbl
  }
  $scope.saveEntry = function() {
    // Task is already loaded in memory
    $scope.send('update')
  }
  $scope.editEntry = function(table, row) {
  	console.log("[Edit] Button clicked")
    $scope.loadRow(table, row)
    $scope.send("getFormData")
    $scope.hideSmBtns = true
  }
  $scope.deleteEntry = function(table, row) {
    console.log("[Delete] Button clicked")
    $scope.loadRow(table, row)
    $scope.send('delete')
  }
  $scope.addEntry = function(table_name) {
  	console.log("[Create] Button clicked")
    var t = $scope.getTableByName(table_name)
    // create an empty element
    var newRow = {}
    t.columns.forEach(function(col){
      // check if not auto_inc
      if (col.EXTRA != 'auto_increment')
      	newRow[col.COLUMN_NAME] = ''   
    })
    $scope.loadRow(t, newRow)
    $scope.send("getFormCreate")
  }
  $scope.gotoState = function(nextstate) {
    $scope.selectedTable.hideSmBtns = true
    $scope.selectedRow['state_id'] = nextstate.id
    $scope.send('makeTransition')
  }
  $scope.getTableByName = function(table_name) {
    if (typeof table_name != "string") return
    return $scope.tables.find(function(t){
      return t.table_name == table_name;
    })
  }
  $scope.initTables = function() {
    // Request data from config file
  	$http({
  		url: window.location.pathname,
  		method: 'post',
  		data: {
        cmd: 'init',
        paramJS: ''
      }
  	}).success(function(resp){
      // Init each table
  		resp.forEach(function(t){
        // If table is in menu
        if (t.is_in_menu) {
          // Add where, sqlwhere, order
          t.sqlwhere = ''
          t.sqlwhere_old = ''
          t.sqlorderby = ''
          t.sqlascdesc = ''
          t.nextstates = []
          t.statenames = []
          t.PageIndex = 0
          // Push into angular scope
          $scope.tables.push(t)
        }
      })
      // Refresh each table
      $scope.tables.forEach(function(t){
        console.log("Init Table", t)
        $scope.refresh(t.table_name)
      })
      // GUI
      $scope.isLoading = false
      // Auto click first tab
      var tbls = $scope.tables.sort()
      var first_tbl_name = tbls[0].table_name
      $scope.selectedTable = $scope.getTableByName(first_tbl_name)
      $('#'+first_tbl_name).tab('show')
  	});	
  }
  $scope.countEntries = function(table_name) {  	
    var t = $scope.getTableByName(table_name)
    // Get columns from columns
    var joins = []
    t.columns.forEach(function(col) {
      if (col.foreignKey.table != "") { // Check if there is a substitute for the column
        col.foreignKey.replace = col.COLUMN_NAME
        joins.push(col.foreignKey)
      }
    })
    // Request
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
      t.count = response[0].cnt
    });
  }

  //------------------------------------------------------- Statemachine functions

  $scope.substituteSE = function(tablename, stateID) {
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
    // Request
  	$http({
  		url: window.location.pathname,
  		method: 'post',
  		data: {
  			cmd: 'getStates',
  			paramJS: {table: table_name}
  	}
  	}).success(function(response){
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
  	return strLabel.replace(/(.{10})/g, "$&" + "\n")
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
     		strLabels += 's'+e.id+' [label="\n\n\n\n'+e.name+'" shape=doublecircle color=gray20 fillcolor=gray20 width=0.15 height=0.15];\n'
    })
    // Render SVG
    document.getElementById("statediagram").innerHTML = Viz(`
    digraph G {
      # global
      rankdir=LR; outputorder=edgesfirst; pad=0.5;
      node [style="filled, rounded" color=gray20 fontcolor=gray20 fontname="Helvetica-bold" shape=box fixedsize=true fontsize=9 fillcolor=white width=0.9 height=0.4];
      edge [fontsize=10 color=gray80 arrowhead=vee];
      start [label="\n\n\nStart" shape=circle color=gray20 fillcolor=gray20 width=0.15 height=0.15];
      # links
      `+strEP+`
      `+strLinks+`
      # nodes
      `+strLabels+`
    }`);
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
    t.columns.forEach(function(col) {
      // TODO: -> better on server side
      if (col.foreignKey.table != "") { // Check if there is a substitute for the column
        col.foreignKey.replace = col.COLUMN_NAME
        joins.push(col.foreignKey)
      } else 
        sel.push("a."+col.COLUMN_NAME)
    })
    str_sel = sel.join(",")

  	// Request from server
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
        if (t.PageIndex == 0) t.count = response.length
      }
      // Get the states from table
      // TODO: ...? obsolete? maybe only refresh at init, then alsway getNextstates
      $scope.getStatemachine(table_name)
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
      tmpCol = $scope.getColByName(table, col)
      if (tmpCol) {
        if (tmpCol.foreignKey.table == "") {
          // No Foreign-Key present
          result[col] = row[col]
        } else {
        	// Foreign-Key present -> Exchange ID
          newID = $scope.selectedRow[col+"________newID"]
          if (newID)
            result[col] = newID // Only set when exists            
          //else
            //result[col] = row[col]
          // Remove object key
          delete $scope.selectedRow[col+"________newID"]
        }
      }
    }
    return result
  }

  //============================================== Basic Send Method

  $scope.send = function(cud, param) {

    if (param) $scope.loadRow(param.table, param.row)
    var body = {cmd: 'cud', paramJS: {}}
    var t = $scope.selectedTable

    //------------------- Assemble Data
  	if (cud == 'create' || cud == 'delete' ||	cud == 'update' ||
  			cud == 'getFormData' || cud == 'getFormCreate' ||
  			cud == 'getNextStates' ||	cud == 'getStates' ||	cud == 'makeTransition') {

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
          //console.log(body.paramJS.row)
          //$scope.substituteFKColsWithIDs(body.paramJS.row)
          body.paramJS.row = $scope.filterFKeys(t, body.paramJS.row)
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
      var table = $scope.getTableByName(body.paramJS.table)

      //-------------------- table data was modified
      if (response != 0 && (cud == 'delete' || cud == 'update' || cud == 'create')) {  
        // Created
				if (cud == 'create') {
          console.log("New Element with ID", response, "created.")
          $('#modalCreate').modal('hide') // Hide create-modal
          // TODO: Maybe jump to entry which was created
        }
        $scope.refresh(body.paramJS.table)
      }
      else if (cud == 'getFormData') {
        $scope.send("getNextStates") // get next States
        table.form_data = response
        $('#modalEdit').modal('show')
      }
      else if (cud == 'getFormCreate') {
        table.form_data = response
        $('#modalCreate').modal('show')
      }
      //---------------------- StateEngine (List Transitions)
      else if (cud == 'getNextStates') {
      	// Save next States
        table.nextstates = response
        $scope.selectedTable.hideSmBtns = false
      }
      else if (cud == 'makeTransition') {      	
        // Show Transition Message
        // TODO: Make possible HTML Formated Message -> Small modal
        if (response.show_message)
          alert(response.message)
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