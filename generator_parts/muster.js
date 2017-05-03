
// for debugging
//console.log('All tables (', tables.length, '):', tables);

var app = angular.module("genApp", ["xeditable"])
app.run(function(editableOptions) {
  editableOptions.theme = 'bs2'; // bootstrap3 theme. Can be also 'bs2', 'default'
});

app.filter('ceil', function() {
    return function(input) {
        return Math.ceil(input);
    };
});

app.controller('genCtrl', function ($scope, $http) {
  $scope.historyLog = false  
  $scope.tables = []
  $scope.debug = window.location.search.match('debug=1')
  $scope.status = "";
  $scope.PageIndex = 0;
  $scope.PageLimit = 10; // default = 10
  $scope.sqlwhere = []

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
  max_number_of_buttons = 2
  number_of_pages = Math.ceil(table.count / $scope.PageLimit)
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
	$scope.PageIndex = 0;
}

$scope.initTables = function() {
	$scope.status = "Initializing...";

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
						// debugging
						console.log("Table '", tbl.table_name, "'", tbl);
						console.log(" - Data:", response);
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
							columnames: keys,
							rows: response,
							count: 0,
							newRows : newRows
						})
		        // Count entries
		        $scope.countEntries(tbl.table_name);
						// open first table in navbar
						 $('#nav-'+$scope.tables[0].table_name).click();
						// TODO: Platzhalter für Scope Texfelder generierung  
					});
					// Save tablenames in scope
					$scope.tablenames = $scope.tables.map(function(tbl){return tbl.table_name})
				}
			)
			$scope.status = "Initializing... done";


		/*********************************************************************/

	});	
}

$scope.countEntries = function(table_name) {
	console.log("counting entries from table", table_name);
	$http({
		url: window.location.pathname,
		method: 'post',
		data: {
			cmd: 'read',
			paramJS: {tablename: table_name, limitStart: 0, limitSize: 1, 
				select: "COUNT(*) AS cnt"
			}
	}
	}).success(function(response){
		// Find table in scope
		act_tbl = $scope.tables.find(
			function(t){return t.table_name == table_name});
		//console.log("Count Response", response)
		act_tbl.count = response[0].cnt;
		//console.log(act_tbl.count);
	});
}

// Refresh Function
$scope.refresh = function(scope_tbl, index) {
	$scope.status = "Refreshing...";
  	console.log($scope.sqlwhere[index]);
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
      		where: $scope.sqlwhere[index]
		}
	}
	}).success(function(response){
		// Find table
		$scope.tables.find(function(tbl){
			return tbl.table_name == scope_tbl.table_name}).rows = response;
   	 	// Count entries
    	$scope.countEntries(scope_tbl.table_name);
	})
	$scope.status = "Refreshing... done";
}

$scope.initTables();

/*
  $('#json-renderer').jsonViewer($scope.tables,{collapsed: true});
*/

/*
Allround send for changes to DB
*/
$scope.send = function (cud, param){
  console.log(param.x)
  console.log("Send-Function called, Params:", param);

  var body = {cmd : 'cud', paramJS : {}};
  // unused: columName = Object.keys(param.table.columnsX[0])[param.colum];

  // Function which identifies _all_ primary columns
  function getPrimaryColumns(col) {
    var resultset = [];
    for (var i = 0; i < col.length-1; i++) {
      if (col[i].COLUMN_KEY.indexOf("PRI") >= 0) {
        // Column is primary column
        resultset.push(col[i].COLUMN_NAME);
      }
    }
    console.log("---- Primary Columns:", resultset);
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
  if (cud == 'create') {
    body.paramJS = {
      row: param.row,
      table: param.table.table_name,
      primary_col: param.table.primary_col
    }
    post(cud);
  }
  else if (cud == 'update') {
    var row = $scope.changeHistory.reverse()
    row.find(function(entry){if (entry.origin && (entry.rowID == param.x[0]) ){return entry.postRow} })    
    // relevant data
    body.paramJS = {
      row: convertCols(param.row),
      primary_col: getPrimaryColumns(param.table.columnsX),
      table: param.table.table_name
    }
    post(cud)
  }
  else if (cud == 'delete') {
  	// Confirmation
  	IsSure = confirm("Do you really want to delete this entry?");
  	if (!IsSure) return
  	// if Sure -> continue
    body.paramJS = {
      id:param.colum,
      row:param.row,
      table:param.table.table_name,
      primary_col: getPrimaryColumns(param.table.columnsX)
    }
    post(cud)
  } else {
    console.log('unknown command (not CRUD)')
  }


  function post(){    
    $http({
      url:window.location.pathname,
      method:'post',
      data: {
        cmd: cud,
        paramJS: body.paramJS
      }
    }).success(function(response){
      // Debugging
      console.log("ResponseData: ", response);
      $scope.lastResponse = response;

      // GUI Notifications for user feedback
      //-------------------- Entry Deleted
      if (cud == 'delete' && response != 0) {
        // delete from page
      	act_tbl = $scope.tables.find(
        	function(tbl){return tbl.table_name == param.table.table_name});
        //act_tbl.rows.splice(/*row-index*/param.colum, 1);
        $scope.refresh(act_tbl);
      }
      //-------------------- Entry Updated
      else if (cud == 'update' && response != 0) {
        // worked

        // TODO: There could be a better solution, here the row is stored in the client in a history
        // but what if there are more changes and it gets corrupted? better the server sends back the
        // table and the primary column content -> so then the data intergrity is garanteed

        var tblID = param.x[1];
        var rowID = param.x[0];
        // remove class fresh and update button
        $("#row"+tblID+rowID).removeClass("fresh");
        $("#btnRow"+tblID+rowID ).hide();
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
        console.log("-> Focus new Row...")
        $(".nRws").first().focus();
        // TODO: Only works at the first table
        
      	// Refresh current table
      	$scope.refresh(act_tbl);
      }
    })
  }

}

/*Protokoll where what changed*/
$scope.changeHistory = [], $scope.changeHistorycounter = 0
$scope.rememberOrigin = function (table, cols, row, cell, rowID, colID){
  $scope.changeHistorycounter ++
  console.log('\n-rO: table: '+table + ', cols:' + cols + ', row:' + row + ', cell:' + cell + ', rowID:' + rowID + ', colID:' + colID)
  console.log($scope.changeHistorycounter+' '+table+' Row: '+rowID+', Col: '+colID+' - '+cols[colID])
  $scope.changeHistory.push({
   table : table,
   row : row,
   cell : cell,
   rowID : rowID,
   colID : colID,
   colname : cols[colID],
   changeHistorycounter:$scope.changeHistorycounter
 })
}

/*If cell content changed, protokoll the change*/
$scope.checkCellChange = function (table, row, cell, tblID, rowID, colID){

  console.log('#cCC: table: ' + table + ', row: ' + row +
    ', cell: ' +  cell + ', tblID: ' + tblID +
    ', rowID: ' + rowID + ', colID: ' + colID);

  // var y = row[0], x = cell, //cleanflag
  origin = $scope.changeHistory[$scope.changeHistory.length-1]

  if (cell != origin.cell) {
    // log('Texfield changed from "'+origin.cell+'" to "'+cell+'"')
    var postRow = row, keys = Object.keys(row)
    postRow[keys[colID]] = cell
    
    $scope.changeHistory[$scope.changeHistory.length-1] = {
      origin : origin,
      change : cell,
      tableID : tblID,
      rowID : rowID,
      postRow:postRow
    }
    console.log('\n$scope.changeHistory['+($scope.changeHistory.length-1)+']:');
    console.log($scope.changeHistory[$scope.changeHistory.length-1])

    $( "#row"+tblID+rowID ).addClass( "fresh" );
    $( "#btnRow"+tblID+rowID ).show();
  }
  else {
     $scope.changeHistory.slice(0, -1)
  }
}

});