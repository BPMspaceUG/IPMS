
var app = angular.module("genApp", ["xeditable"])

app.run(function(editableOptions) {
  editableOptions.theme = 'bs2'; // bootstrap3 theme. Can be also 'bs2', 'default'
});

app.filter('ceil', function() {
    return function(input) {return Math.ceil(input)}
});

app.controller('genCtrl', function ($scope, $http) {
  $scope.tables = []
  $scope.PageIndex = 0;
  $scope.PageLimit = 10; // default = 10
  $scope.sqlwhere = []  
  $scope.sqlorderby = []
  $scope.sqlascdesc = []
  $scope.nextstates = []
  $scope.statenames = []


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

  	tables = null;
  	$http({
  		url: window.location.pathname, // use same page for reading out data
  		method: 'post',
  		data: {cmd: 'init', paramJS: ''}
  	}).success(function(resp){

  		tables = resp;

  		/*********************************************************************/

  		tables.forEach(
			function(tbl) {
				// no need for previous deselectet tables
				if(!tbl.is_in_menu){return}

				// TODO: Only this line
				//$scope.refresh(tbl)


				// Request from server
				// Read content
				$http({
					url: window.location.pathname, // use same page for reading out data
					method: 'post',
					data: {
					cmd: 'read',
					paramJS: {
						tablename: tbl.table_name,
						limitStart: $scope.PageIndex * $scope.PageLimit,
						limitSize: $scope.PageLimit,
						select: "*"
					}
				}
				}).success(function(response){
					//define additional Rows
					var newRows = [[]]
					// Create new rows by columns
					Object.keys(tbl.columns).forEach(
						function(){newRows[newRows.length-1].push('')}
					);
					//define colum headers
					var keys = ['names']
					if(response[0] && typeof response[0] == 'object'){
						keys = Object.keys(response[0])
					}
					$scope.tables.push({
						table_name: tbl.table_name,
						table_alias: tbl.table_alias,
						table_icon: tbl.table_icon,
						columnsX: tbl.columns,
        		is_read_only: tbl.is_read_only,
        		SE_enabled: (tbl.se_active),
						columnames: keys,
						rows: response,
						count: 0,
						newRows : newRows
					})
          // Count entries
          $scope.getStatemachine(tbl.table_name)
          $scope.countEntries(tbl.table_name)
					// open first table in navbar
					$('.tab').first().click()
				});
				// Save tablenames in scope
				$scope.tablenames = $scope.tables.map(function(tbl){return tbl.table_name})
			}
		)

  		/*********************************************************************/

  	});	
  }

  $scope.countEntries = function(table_name) {
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
          limitSize: 1
        }
      }
    }).then(function successCallback(response) {
        //console.log(response[0])
        // Find table in scope
        if (response.length > 0) {
          act_tbl = $scope.tables.find(function(t){return t.table_name == table_name})
          act_tbl.count = response[0].cnt
        }
      }, function errorCallback(response) {
        alert("Error")
        console.log(response)
      });
  }

  $scope.subState = function(stateID) {
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
  	console.log("get states from table", table_name);
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
  		console.log("States:", response)
  		$scope.statenames = response // save data in scope
  		//console.log("Saved in scope!")
  		//act_tbl.count = response[0].cnt;
  	})
  }
  // Refresh Function
  $scope.refresh = function(scope_tbl, index) {
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
      	$scope.countEntries(scope_tbl.table_name)
  		// Add data to Frontend and get additional information
  		$scope.tables.find(function(tbl){return tbl.table_name == scope_tbl.table_name}).rows = response;
  	})
  }




  $scope.initTables();

  /*
  Allround send for changes to DB
  */
  $scope.send = function(cud, param){
    //console.log(param.x)
    console.log("-> Send # CUD=", cud, "Params:", param)

    var body = {cmd: 'cud', paramJS: {}}

    // TODO: remove this
    // load in memory
    if (param)
    	$scope.loadRow(param.table, param.row)


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
      //console.log("---- Primary Columns:", resultset);
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
	if (cud == 'create' || cud == 'delete' || cud == 'update' || cud == 'getNextStates' || cud == 'getStates') {
    	console.log($scope.selectedTable)
    	console.log($scope.selectedTask)
   		// Confirmation when deleting
      	if (cud == 'delete') {
    		IsSure = confirm("Do you really want to delete this entry?");
    		if (!IsSure) return
      	}
		// if Sure -> continue
		body.paramJS = {
			row: convertCols($scope.selectedTask),
			primary_col: getPrimaryColumns($scope.selectedTable.columnsX),
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
        url:window.location.pathname,
        method:'post',
        data: {
          cmd: cud,
          paramJS: body.paramJS
        }
      }).success(function(response){
        console.log("ResponseData: ", response);
        $scope.lastResponse = response;

        // GUI Notifications for user feedback
        //-------------------- Entry Deleted
        if (response != 0 && (cud == 'delete' || cud == 'update')) {
          // if state was updated then
          $('#myModal').modal('hide')
          // Refresh current table
          /*act_tbl = $scope.tables.find(function(t){
            return t.table_name == param.table.table_name})*/
          $scope.refresh($scope.selectedTable)
        }
        //-------------------- Entry Created
        else if (cud == 'create' && response != 0) {
          console.log("-> Entry was created");


        	// Find current table
        	act_tbl = $scope.tables.find(function(t){return t.table_name == param.table.table_name});

          // Clear all entry fields
          for (var x=0;x<act_tbl.newRows.length;x++) {
            for (var y=0;y<act_tbl.newRows[x].length;y++) {
              act_tbl.newRows[x][y] = '';            
            }
          }
          // Set focus on first element after adding, usability issues
          $(".nRws").first().focus();



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
// TODO: only animate when cmd [update] was sent
app.directive('animateOnChange', function($timeout) {
  return function(scope, element, attr) {
    scope.$watch(attr.animateOnChange, function(nv,ov) {
      if (nv!=ov) {
        element.addClass('changed');
        $timeout(function() {
          element.removeClass('changed');
        }, 1000); // Could be enhanced to take duration as a parameter
      }
    });
  };
});