
var app = angular.module("genApp", [])

app.filter('ceil', function() {
  return function(input) {return Math.ceil(input)}
})

app.controller('genCtrl', function ($scope, $http) {
  $scope.tables = []
  $scope.PageIndex = 0;
  $scope.PageLimit = 10; // default = 10
  $scope.sqlwhere = []  
  $scope.sqlorderby = []
  $scope.sqlascdesc = []
  $scope.nextstates = []
  $scope.statenames = []
  $scope.isLoading = true

  $scope.sortCol = function(table, columnname, index) {
    console.log("Click-----------> SORT")

    // TODO: Make sorting by table and not globally
    //$scope.sqlascdesc = []

    $scope.sqlorderby[index] = columnname
    $scope.sqlascdesc[index] = ($scope.sqlascdesc[index] == "desc") ? "asc" : "desc"
    $scope.refresh(table, index)
  }
  $scope.changeRow = function(table, row, operation) {
  	// TODO: this will be the function for everything when a row is changed
  	//       so for the funtions [update, statemachine, delete]

  	// 1.Step -> Copy row in memory
  	//loadRow(table, row)

  	// 2.Step -> change the row and request additional information from server

  	// 3.Step -> execute if allowed

  	// 4.Step -> give feedback to the userinterface
  }
  $scope.loadRow = function(tbl, row) {
    $scope.selectedTask = angular.copy(row)
    $scope.selectedTable = tbl
  }
  $scope.saveTask = function() {
    console.log("Ok button clicked...")
    $scope.send('update')
  }
  $scope.gotoPage = function(new_page_index, table, index) {
  	// TODO: PageIndex for every table
  	first_page = 0
  	last_page = Math.ceil(table.count / $scope.PageLimit) - 1
  	new_page = new_page_index

  	if (new_page < first_page) return
  	if (new_page > last_page) return
  	$scope.PageIndex = new_page
  	console.log("Goto Page clicked!", table.table_name, "Count:", table.count)
  	$scope.refresh(table, index)
  }

  $scope.getPages = function(table, page_index, page_limit) {
    if (!table.count) return
    console.log("gettin pages...", table.count)
  	// TODO: Optimize
    max_number_of_buttons = 2
    number_of_pages = Math.ceil(table.count / $scope.PageLimit)
    if (number_of_pages <= 0) return
    page_array = new Array(number_of_pages-1)
    for (var i=0;i<number_of_pages;i++) page_array[i] = i

    // create array container
    if (number_of_pages < max_number_of_buttons)
      btns = page_array
    else {
      // More Pages than max displayed buttons -> sub array
      btns_next = page_array.slice(page_index, page_index+max_number_of_buttons+1)
      if (page_index <= max_number_of_buttons)
        btns_before = page_array.slice(0, page_index)
      else
        btns_before = page_array.slice(page_index-max_number_of_buttons, page_index)
      // concat
      btns = btns_before.concat(btns_next)
    }
    // output
    return btns
  }
  $scope.changeTab = function() {
    // start at index 0 -> Feature: Maybe save and restore
  	$scope.PageIndex = 0;
  }  
  $scope.openSEPopup = function(tbl, row) {
    $scope.loadRow(tbl, row) // select current Row
    $scope.send("getNextStates")
  }
  $scope.gotoState = function(nextstate) {
    // TODO: Optimize ... check on serverside if possible etc.
    res = null;
    for (property in $scope.selectedTask) {
      if (property.indexOf('state_id') >= 0)
        res = property
    }
    $scope.selectedTask[res] = nextstate.id
    $scope.send('update')
  }
  //$scope.clickFirstTab(tab, index) {if (index == 0)	tab.click()}


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
      $scope.tables.forEach(function(t){
        $scope.refresh(t)
      })
      // GUI
      $scope.isLoading = false
      $scope.changeTab()
  	});	
  }
  $scope.countEntries = function(table_name, index) {
  	console.log("counting entries from table", table_name);

    $http({
      method: 'POST',
      url: window.location.pathname,
      data: {
        cmd: 'read',
        paramJS: {
          select: "COUNT(*) AS cnt",
          tablename: table_name,
          limitStart: 0,
          limitSize: 1,
          where: $scope.sqlwhere[index],
          orderby: $scope.sqlorderby[index],
          ascdesc: $scope.sqlascdesc[index]
        }
      }
    }).success(function(response){
        console.log("response", response[0])
        // Find table in scope
        if (response.length > 0) {
          act_tbl = $scope.tables.find(function(t){return t.table_name == table_name})
          act_tbl.count = response[0].cnt
        }
    });
  }

  $scope.substituteSE = function(stateID) {
    // Converts stateID -> Statename
    res = stateID
    $scope.statenames.forEach(function(state){
      if (parseInt(state.id) == parseInt(stateID))
        res = state.name
    })
    return res
  }
  // Statemachine
  $scope.getStatemachine = function(table_name) {
    // TODO: Check if table has even a state engine!
    console.log("get states from table", table_name)
  	$http({
  		url: window.location.pathname,
  		method: 'post',
  		data: {
  			cmd: 'getStates',
  			paramJS: {tablename: table_name}
  	}
  	}).success(function(response){
  		// Find table in scope
  		act_tbl = $scope.tables.find(function(t){return t.table_name == table_name})
  		//console.log("States:", response)
  		$scope.statenames = response // save data in scope
  		//act_tbl.count = response[0].cnt;
  	})
  }
  // Refresh Function
  $scope.refresh = function(scope_tbl, index) {
    // TODO: Remove index!
  	console.log("Refreshing...")
  	// Request from server
  	$http({
  		url: window.location.pathname, // use same page for reading out data
  		method: 'post',
  		data: {
  		cmd: 'read',
  		paramJS: {
  			tablename: scope_tbl.table_name,
  			limitStart: $scope.PageIndex * $scope.PageLimit,
  			limitSize: $scope.PageLimit,
  			select: "*",
        where: $scope.sqlwhere[index],
        orderby: $scope.sqlorderby[index],
        ascdesc: $scope.sqlascdesc[index]
  		}
  	}
  	}).success(function(response){
      	$scope.getStatemachine(scope_tbl.table_name)
      	$scope.countEntries(scope_tbl.table_name, index)
  		// Add data to Frontend and get additional information
  		$scope.tables.find(function(tbl){return tbl.table_name == scope_tbl.table_name}).rows = response;
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
      		IsSure = confirm("Do you really want to delete this entry?");
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
          $scope.refresh($scope.selectedTable) // Refresh current table
        }
        //-------------------- Entry Created
        else if (cud == 'create' && response != 0) {
          console.log("-> New Entry was created")
        	// Find current table & Clear all entry fields
        	act_tbl = $scope.selectedTable
          for (var x=0;x<act_tbl.newRows.length;x++) {
            for (var y=0;y<act_tbl.newRows[x].length;y++) {
              act_tbl.newRows[x][y] = ''
            }
          }
          // Set focus on first element after adding, usability issues
          $(".nRws").first().focus()
        	// Refresh current table
        	$scope.refresh($scope.selectedTable)
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
// Update animation
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