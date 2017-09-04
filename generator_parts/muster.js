
var app = angular.module("genApp", [])
//--- Controller
app.controller('genCtrl', function ($scope, $http) {
  $scope.tables = []
  $scope.isLoading = true
  $scope.PageLimit = 10 // default = 10
  $scope.selectedTask = []
  $scope.FKTbl = []
  $scope.createNewEntry = false

  $scope.saveEntry = function() {
    // Task is already loaded in memory
    $scope.send('update')
  }
  $scope.editEntry = function(table, row) {
  	$scope.createNewEntry = false
  	$scope.loadRow(table, row)
  }
  $scope.addEntry = function(table_name) {
    t = $scope.getTableByName(table_name)
    // create empty element
    var newRow = {}
    t.columns.forEach(function(col){
      // check if auto_inc
      if (col.EXTRA != 'auto_increment')
        newRow[col.COLUMN_NAME] = ''
    })
    // load into scope
    $scope.loadRow(t, newRow)
    $scope.createNewEntry = true
    // show modal
    $('#modal').modal('show')
  }
  $scope.getColAlias = function(table, col_name) {
  	res = ''
  	table.columns.forEach(function(col){
  		// Compare names
  		if (col.COLUMN_NAME == col_name)
  			res = col.column_alias
  	})
  	if (res == '') return col_name; else return res;
  }
  $scope.getColByName = function(table, col_name) {
    res = null // empty object
    table.columns.forEach(function(col){
      // Compare names
      if (col.COLUMN_NAME == col_name)
        res = col
    })
    if (res === null) return null; else return res;
  }
  $scope.sortCol = function(table, columnname) {
    console.log("Clicked -----------> SORT <-----------")
    table.sqlascdesc = (table.sqlascdesc == "desc") ? "asc" : "desc"
    table.sqlorderby = columnname
    $scope.refresh(table.table_name)
  }
  $scope.getSortIcon = function(table, colname) {
    return "fa fa-arrow";
  }
  $scope.openFK = function(table_name) {
    console.log("-> FK", table_name)
    // Get the table from foreign key
    $scope.FKTbl = $scope.getTableByName(table_name)
    console.log("FK:", $scope.FKTbl)
    $('#myFKModal').modal('show')
  }
  $scope.selectFK = function(row) {
    console.log("Selected FK:", row)
    // Write the new key in the current model
    console.log($scope.selectedTask)
    // 1. Know the right KEY which has to be edited

    // 2. Save the value, like:
    $scope.selectedTask.sqms_language_id.id = row.sqms_language_id
    // 3. Save the substituted value in the model
    $scope.selectedTask.sqms_language_id = row.language
    // Close modal
    $('#myFKModal').modal('hide')
  }
  $scope.getPageination = function(table_name) {
    NrOfButtons = 5
    t = $scope.getTableByName(table_name)
    NrOfPages = $scope.getNrOfPages(t)

    // [x] Case 1: Pages are less then NrOfBtns => display all
    if (NrOfPages <= NrOfButtons) {
      pages = new Array(NrOfPages)
      for (var i=0;i<pages.length;i++)
        pages[i] = i - t.PageIndex
    } else {
      // [x] Case 2: Pages > NrOfBtns display NrOfBtns
      pages = new Array(NrOfButtons)
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
  $scope.loadRow = function(tbl, row) {  	
    $scope.selectedTask = angular.copy(row)
    $scope.selectedTable = tbl
  }
  $scope.gotoPage = function(newIndex, table) {
  	lastPageIndex = Math.ceil(table.count / $scope.PageLimit) - 1
    // Check borders
  	if (newIndex < 0) newIndex = 0 // Lower limit
  	if (newIndex > lastPageIndex) newIndex = lastPageIndex // Upper Limit
    // Set new index
  	table.PageIndex = newIndex
  	$scope.refresh(table.table_name)
  }
  $scope.openSEPopup = function(tbl, row) {
    $scope.loadRow(tbl, row) // select current Row
    $scope.send("getNextStates")
  }
  $scope.gotoState = function(nextstate) {
    // TODO: Optimize ... check on serverside if possible etc.
    res = null
    for (property in $scope.selectedTask) {
      if (property.indexOf('state_id') >= 0)
        res = property
    }
    $scope.selectedTask[res] = nextstate.id
    $scope.send('update')
  }
  $scope.getTableByName = function(tablename) {
    if (typeof tablename != "string") return
    return $scope.tables.find(function(t){
      return t.table_name == tablename;
    })
  }
  $scope.getNrOfPages = function(table) {
    return Math.ceil(table.count / $scope.PageLimit)
  }
  $scope.initTables = function() {
  	console.log("init Tables...")
    // Request data from config file
  	$http({
  		url: window.location.pathname,
  		method: 'POST',
  		data: {cmd: 'init', paramJS: ''}
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
          console.log("Added Table:", t)
        }
      })
      // Refresh each table
      $scope.tables.forEach(function(t){$scope.refresh(t.table_name);})
      // GUI
      $scope.isLoading = false
  	});	
  }
  $scope.countEntries = function(table_name) {  	
    t = $scope.getTableByName(table_name)
    // Get columns from columns
    joins = []
    t.columns.forEach(function(col) {
      if (col.foreignKey.table != "") { // Check if there is a substitute for the column
        col.foreignKey.replace = col.COLUMN_NAME
        joins.push(col.foreignKey)
      }
    })
    $http({
      method: 'POST',
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
      // Counting done
      console.log("Counted entries from [", table_name, "] ...", response)
      t = $scope.getTableByName(table_name)
      t.count = response[0].cnt
    });
  }

  //------------------------------------------------------- Statemachine functions

  $scope.substituteSE = function(tablename, stateID) {
    t = $scope.getTableByName(tablename)
    // Converts stateID -> Statename
    res = stateID
    t.statenames.forEach(function(state){
      if (parseInt(state.id) == parseInt(stateID))
        res = state.name
    })
    return res
  }
  $scope.getStatemachine = function(table_name) {
    t = $scope.getTableByName(table_name)
    // Check if table has a state engine
    if (!t.se_active) return
    console.log("get states from table [", table_name, "]")

  	$http({
  		url: window.location.pathname,
  		method: 'post',
  		data: {
  			cmd: 'getStates',
  			paramJS: {tablename: table_name}
  	}
  	}).success(function(response){
      // Save statemachine at the table
      $scope.getTableByName(table_name).statenames = response
  	})
  }

  //-------------------------------------------------------

  // Refresh Function
  $scope.refresh = function(table_name) {
  	console.log("Started refreshing", table_name)
    t = $scope.getTableByName(table_name)
    // Search-Event(set LIMIT Param to 0)
    if (t.sqlwhere != t.sqlwhere_old)
    	t.PageIndex = 0
    // Get columns from columns
    sel = []
    joins = []
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
  		method: 'POST',
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
      console.log("Refreshed [", table_name, "] ...", response)
      t = $scope.getTableByName(table_name)      
      t.rows = response // Save cells in tablevar
      t.sqlwhere_old = t.sqlwhere
      if (response.length >= $scope.PageLimit)
      	// countrequest if nr of entries >= PageLimit
        $scope.countEntries(table_name)
      else {
      	// Save nr of entries in table
        if (t.PageIndex == 0)
        	t.count = response.length
      }
      // Get the states from table
      $scope.getStatemachine(table_name)
  	})
  }

  // --------------------------
  
  $scope.initTables()

  // --------------------------

  $scope.filterFKeys = function(table, row) {
    var result = {}
    keys = Object.keys(row) // get column names
    for (var i=0;i<keys.length;i++) {
      col = keys[i]
      if ($scope.getColByName(table, col).foreignKey.table == "") {
        result[col] = row[col]
      } else {
        // TODO: Substitue with the new ID
        console.log($scope.selectedTask[col], row[col])
        //if ($scope.selectedTask[col] != row[col])
        //  result[col] = $scope.selectedTask[col].id
      }
    }
    return result
  }

  /* Allround send for changes to DB */
  $scope.send = function(cud, param){
    // TODO: remove this
    // load in memory
    if (param) $scope.loadRow(param.table, param.row)

    console.log("-> Send [", cud, "] Params:", param)
    var body = {cmd: 'cud', paramJS: {}}

    t = $scope.selectedTable
    //console.log("Selected Table:", t)

    // TODO: probably not the best idea to send the primary columns from client
    // better assebmle them on the server side

    // Function which identifies _all_ primary columns
    function getPrimaryColumns(col) {
      var resultset = []
      for (var i = 0; i < col.length-1; i++) {
        if (col[i].COLUMN_KEY.indexOf("PRI") >= 0)
          resultset.push(col[i].COLUMN_NAME)
      }
      return resultset;
    }


    // Assemble data for Create, Update, Delete Functions
  	if (cud == 'create' || cud == 'delete' || cud == 'update'
     || cud == 'getNextStates' || cud == 'getStates') {
     		// Confirmation when deleting
        if (cud == 'delete') {
      		IsSure = confirm("Do you really want to delete this entry?")
      		if (!IsSure) return
        }
  		  // if Sure -> continue
  		  body.paramJS = {
    			row: $scope.selectedTask,
    			primary_col: getPrimaryColumns(t.columns),
    			table: t.table_name
    		}
        // Filter out foreign keys
        if (cud == 'update')
          body.paramJS.row = $scope.filterFKeys(t, body.paramJS.row)

  	} else {
  		// Unknown Command
      console.log('unknown command: ', cud)
      return
    }
    // ------------------- Finally -> Send request
    console.log("### POST", "Command:", cud, "Params:", body.paramJS)
    // Send request to server
    $http({
      url: window.location.pathname,
      method: 'POST',
      data: {
        cmd: cud,
        paramJS: body.paramJS
      }
    }).success(function(response) {
      // Response
      console.log("ResponseData: ", response)
      //-------------------- table data was modified
      if (response != 0 && (cud == 'delete' || cud == 'update' || cud == 'create')) {
        // hide modals
        $('#myModal').modal('hide') // Hide stateModal
        // CREATE - Done
        if (cud == 'create') {
          $('#modal').modal('hide') // Hide create-modal
          // TODO: Maybe jump to entry which was created
        }
        // Refresh table
        $scope.refresh(body.paramJS.table)
      }
      //---------------------- StateEngine (List Transitions)
      else if (cud == 'getNextStates') {
        $scope.getTableByName(body.paramJS.table).nextstates = response
        $('#myModal').modal('show')
      }
      else if (cud == 'getStates') {
      	alert("WTF")
      }
      else {
        alert("An Error occoured while "+cud+" command.")
      }
    })

  }
})
//--- Directives
/*
app.directive('animateOnChange', function($timeout) {
  return function(scope, element, attr) {
    scope.$watch(attr.animateOnChange, function(nv,ov) {
      // TODO: only animate when cmd [update] was sent
      if (nv != ov) {
        element.addClass('changed');
        $timeout(function() {element.removeClass('changed');}, 1500);
      }
    })
  }
})
*/
app.directive('stringToNumber', function() {
  return {
    require: 'ngModel',
    link: function(scope, element, attrs, ngModel) {
      ngModel.$parsers.push(function(value) { return '' + value; })
      ngModel.$formatters.push(function(value) { return parseFloat(value); })
    }
  }
})