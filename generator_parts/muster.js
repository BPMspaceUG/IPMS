
// Mustertabelle
var tables = tables

// for debugging
console.log('All tables (', tables.length, '):', tables);

var app = angular.module("sampleApp", ["xeditable"])
app.run(function(editableOptions) {
  editableOptions.theme = 'bs2'; // bootstrap3 theme. Can be also 'bs2', 'default'
});

app.controller('sampleCtrl', function ($scope, $http) {
  $scope.historyLog = false  
  $scope.tables = []
  $scope.debug = window.location.search.match('debug=1')

  tables.forEach(
    function(tbl) {
      
      // no need for previous deselectet tables
      if(!tbl.is_in_menu){return}

      // Request from server
      $http({
        url: window.location.pathname, // use same page for reading out data
        method: 'post',
        data: {
          cmd: 'read',
          paramJS: {tablename: tbl.table_name, limit: 150, select: "*"}
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
          newRows : newRows
        })

        // open first table in navbar
        $('#nav-'+$scope.tables[0].table_name).click();
        // TODO: Platzhalter für Scope Texfelder generierung  
      })
    }
  )
  $scope.tablenames = $scope.tables.map(function(tbl){return tbl.table_name})

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

  // Assemble data for Create, Update, Delete Functions
  if (cud == 'create') {
    body.paramJS = {
      row: param.row,
      table: param.table.table_name,
      primary_col: param.table.primary_col
    }
    console.log("CREATE:", body);
    post(cud);
  }
  else if (cud == 'update') {
    var row = $scope.changeHistory.reverse()
    row.find(function(entry){if (entry.origin && (entry.rowID == param.x[0]) ){return entry.postRow} })
    // relevant data
    body.paramJS = {
      row: param.row/*as shown on page*/,
      primary_col: getPrimaryColumns(param.table.columnsX), //param.table.primary_col/*0-x*/,
      table: param.table.table_name
    }
    console.log("UPDATE:", body);
    post(cud)
  }
  else if (cud == 'delete') {
    body.paramJS = {
      id:param.colum,
      row:param.row,
      table:param.table.table_name,
      primary_col: getPrimaryColumns(param.table.columnsX)
    }
    console.log("DELETE:", body);
    post(cud)
  } else{
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
      if (cud == 'delete' && response != 0) {
        // delete from page
        $scope.tables
        .find(function(tbl){return tbl.table_name == param.table.table_name})
        .rows.splice(/*row-index*/param.colum, 1)
      }
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
    })
  }

}



/*If there is a value in one of the cells in the last row
then add an empty row*/
// cleanflag -> hat nicht mehr funktioniert, zweck fraglich
// $scope.addNewRow = function (table){
//   var added = false, row = table.newRows[table.newRows.length -1]
//   for (var i = 0; i < row.length; i++) {
//     if (!added && (row[i]+'').length > 0) {
//       var newLine = []
//       added = true
//       for (var colums = 0; colums < row.length; colums++) {
//         newLine.push('')
//       };
//       table.newRows.push(newLine)
//     }; 
//   };
// }

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