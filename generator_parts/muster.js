
var app = angular.module("genApp", [])
//--- Controller
app.controller('genCtrl', function ($scope, $http) {
  $scope.tables = []
  $scope.isLoading = true
  $scope.PageLimit = 10 // default = 10  

  $scope.sortCol = function(table, columnname, index) {
    console.log("Click-----------> SORT")
    
    // TODO: Make sorting by table and not globally
    //$scope.sqlascdesc = []
    /*
    $scope.sqlorderby[index] = columnname
    $scope.sqlascdesc[index] = ($scope.sqlascdesc[index] == "desc") ? "asc" : "desc"
    $scope.refresh(table, index)
    */
  }
  $scope.loadRow = function(tbl, row) {
    $scope.selectedTask = angular.copy(row)
    $scope.selectedTable = tbl
  }
  $scope.saveTask = function() {
    console.log("Ok button clicked...")
    $scope.send('update')
  }
  $scope.gotoPage = function(new_page_index, table) {
  	// TODO: PageIndex for every table
  	indx_first_page = 0
  	indx_last_page = Math.ceil(table.count / $scope.PageLimit) - 1
  	new_page = new_page_index
    // Check borders
  	if (new_page < indx_first_page) new_page = indx_first_page
  	if (new_page > indx_last_page) new_page = indx_last_page
    // Set new index
  	table.PageIndex = new_page
  	console.log("-> Goto Page clicked!", table.table_name, "Count:", table.count)
  	$scope.refresh(table.table_name)
  }
  $scope.range = function(n) {
    n = Math.ceil(n)
    if (n == NaN) return
    return new Array(n)
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
    return $scope.tables.find(function(t){ return t.table_name == tablename; })
  }
  $scope.getNrOfPages = function(table) {
    return Math.ceil(table.count / $scope.PageLimit)
  }
  $scope.initTables = function() {
  	console.log("init Tables...")
    // Request data from config file
  	$http({
  		url: window.location.pathname,
  		method: 'post',
  		data: {cmd: 'init', paramJS: ''}
  	}).success(function(resp){
      // Init each table
  		resp.forEach(function(t){
        // If table is in menu
        if (t.is_in_menu) {
          // Add where, sqlwhere, order
          t.sqlwhere = ''
          t.sqlorderby = ''
          t.sqlascdesc = ''
          t.nextstates = []
          t.statenames = []
          t.PageIndex = 0
          // Add the first row for adding new data
          var newRows = [[]]
          // Create new rows by columns
          Object.keys(t.columns).forEach(function(){newRows[newRows.length-1].push('')})
          t.newRows = newRows
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
    //console.log("Started counting from", table_name)
    t = $scope.getTableByName(table_name)
    $http({
      method: 'POST',
      url: window.location.pathname,
      data: {
        cmd: 'read',
        paramJS: {
          select: "COUNT(*) AS cnt",
          tablename: t.table_name,
          limitStart: 0, limitSize: 1,
          where: t.sqlwhere,
          orderby: t.sqlorderby,
          ascdesc: t.sqlascdesc
        }
      }
    }).success(function(response){
        console.log("Counted entries from [", table_name, "] ...", response[0].cnt)
        $scope.getTableByName(table_name).count = response[0].cnt
    });
  }
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
  // Statemachine
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
  // Refresh Function
  $scope.refresh = function(table_name) {

  	console.log("Started refreshing", table_name)
    t = $scope.getTableByName(table_name)
    pI = t.PageIndex
    // When there is text in the searchbar
    searchterm = t.sqlwhere
    if (searchterm && searchterm.length > 0)
        t.PageIndex = 0; // jump to page 1 when searching    

  	// Request from server
  	$http({
  		url: window.location.pathname, // use same page for reading out data
  		method: 'post',
  		data: {
  		cmd: 'read',
  		paramJS: {
  			tablename: t.table_name,
  			limitStart: pI * $scope.PageLimit,
  			limitSize: $scope.PageLimit,
  			select: "*",
        where: t.sqlwhere,
        orderby: t.sqlorderby,
        ascdesc: t.sqlascdesc
  		}
  	}
  	}).success(function(response){
      //console.log("Refreshed [", table_name, "] ...", response)
      $scope.getTableByName(table_name).rows = response // Save cells in tablevar
      if (response.length >= $scope.PageLimit)
        $scope.countEntries(table_name) // countrequest if nr of entries >= PageLimit
      else {
        if (pI == 0) $scope.getTableByName(table_name).count = response.length // Save nr of entries in table
      }
      // Get the states from table
      $scope.getStatemachine(table_name)
  	})
  }

  $scope.initTables()

  /*
  Allround send for changes to DB
  */
  $scope.send = function(cud, param){
    //console.log(param.x)
    console.log("-> Send # CUD=", cud, "Params:", param)
    var body = {cmd: 'cud', paramJS: {}}

    // TODO: remove this
    // load in memory
    if (param) $scope.loadRow(param.table, param.row)

    // TODO: probably not the best idea to send the primary columns from client
    // better assebmle them on the server side

    // Function which identifies _all_ primary columns
    function getPrimaryColumns(col) {
      var resultset = [];
      for (var i = 0; i < col.length-1; i++) {
        if (col[i].COLUMN_KEY.indexOf("PRI") >= 0) {
          // Column is primary column
          resultset.push(col[i].COLUMN_NAME);
        }
      }
      return resultset;
    }

    function convertCols(inputObj) {
      var key, keys = Object.keys(inputObj);
      var n = keys.length;
      var newobj={}
      while (n--) {
        key = keys[n];
        newobj[key.toLowerCase()] = inputObj[key];
      }
      return newobj;
    }

    // Assemble data for Create, Update, Delete Functions
  	if (cud == 'create' || cud == 'delete' || cud == 'update'
     || cud == 'getNextStates' || cud == 'getStates') {
      	//console.log($scope.selectedTable)
      	//console.log($scope.selectedTask)
     		// Confirmation when deleting
        if (cud == 'delete') {
      		IsSure = confirm("Do you really want to delete this entry?")
      		if (!IsSure) return
        }
  		  // if Sure -> continue
  		  body.paramJS = {
    			row: convertCols($scope.selectedTask),
    			primary_col: getPrimaryColumns($scope.selectedTable.columns),
    			table: $scope.selectedTable.table_name
    		}
  	} else {
  		// Unknown Command
      console.log('unknown command: ', cud)
      return
    }
    post()

    //========================================

    function post(){

      console.log("POST-Request", "Command:", cud, "Params:", body.paramJS)
      t = $scope.selectedTable

      $http({
        url: window.location.pathname,
        method: 'POST',
        data: {
          cmd: cud,
          paramJS: body.paramJS
        }
      }).success(function(response){
        console.log("ResponseData: ", response);
        //-------------------- Entry Deleted
        if (response != 0 && (cud == 'delete' || cud == 'update')) {
          $('#myModal').modal('hide') // Hide stateModal
          $scope.refresh(t.table_name) // Refresh current table
        }
        //-------------------- Entry Created
        else if (cud == 'create' && response != 0) {
          console.log("-> New Entry was created")
        	// Find current table & Clear all entry fields        	
          for (var x=0;x<t.newRows.length;x++) {
            for (var y=0;y<t.newRows[x].length;y++) {
              t.newRows[x][y] = ''
            }
          }
          // Set focus on first element after adding, usability issues
          $(".nRws").first().focus()
        	// Refresh current table
        	$scope.refresh(act_tbl.table_name)
        }
        //---------------------- StateEngine (List Transitions)
        else if (cud == 'getNextStates') {
          $scope.nextstates = response
          $('#myModal').modal('show')
        }
        else if (cud == 'getStates') {
        	alert("WTF")
        }
      })
    }
  }
})
//--- Directive
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