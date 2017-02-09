
// Mustertabelle
var tables = tables

console.log('tables:')
console.log(tables)

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
        url:window.location.pathname,
        method:'post',
        data:{
          cmd: 'read',
          paramJS: {tablename: tbl.table_name, limit: 150, select: "*"}
        }
      }).success(function(response){
        console.log("Response: ", response);
        
        //define additional Rows
        var newRows = [[]]
        if (response.length > 0) {
          Object.keys(response[0]).forEach( function(){newRows[newRows.length-1].push('')} )
        }

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
          //primary_col: tbl.primary_col,
          rows: response,
          newRows : newRows
        })
        
        console.log('Table: ', $scope.tables.slice(-1))
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
  log(param.x)
  console.log("Send-Function called, Params:", param);

 var body ={cmd : 'cud', paramJS : {}},
 columName = Object.keys(param.table.rows[0])[param.colum]

  function getPrimaryColumns(columns) {
    var resultset = [];
    console.log("SWAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAG", columns);
    for (var i = 0; i < columns.length-1; i++) {
      if (columns[i].COLUMN_KEY.indexOf("PRI") >= 0) {
        // Column is primary column
        resultset.push(columns[i].COLUMN_NAME);
      }
    }
    console.log("SHEEEEEEEEEEEEEEEEEEEEEEEEEEEESHHHHH", resultset);
    return resultset;
  }

  log('\n'+cud+':')
  if (cud == 'create') {
    body.paramJS = {row:param.row, table:param.table.table_name, primary_col: param.table.primary_col}
    log('table: '+param.table.table_name); log('row: '+JSON.stringify(param.row))
    post(cud)
  } else if (cud == 'update') {
    var row = $scope.changeHistory.reverse()
    row.find(function(entry){if (entry.origin && (entry.rowID == param.x[0]) ){return entry.postRow} })
    body.paramJS = {row:param.row/*as shown on page*/, primary_col: param.table.primary_col/*0-x*/, table:param.table.table_name}
    log('table: '+param.table.table_name);
    log('row: '+JSON.stringify(row) );
    log('primary_col: '+JSON.stringify(param.table.primary_col) )
    console.log(param);
    post(cud)
  } else if (cud == 'delete') {
    console.log("------------Here------->", param.table);
    body.paramJS = {
      id:param.colum,
      row:param.row,
      table:param.table.table_name,
      primary_col: getPrimaryColumns(param.table.columnsX)}
    log('table: '+param.table.table_name );
    log('colum: '+JSON.stringify(param.colum) )
    console.log(body);
    post(cud)
  } else{
    log('fail')
  }

  function post(){    
    $http({
      url:window.location.pathname,
      method:'post',
      data:{
        cmd: cud,
        paramJS: body.paramJS
      }
    }).success(function(response){
      
      // Debugging
      console.log("ResponseData: ", response);
      $scope.lastResponse = response
      
      if (cud == 'delete' && response != 0) {
        // delete from page
        $scope.tables
        .find(function(tbl){return tbl.table_name == param.table.table_name})
        .rows.splice(/*row-index*/param.colum, 1)
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
  log('\n-rO: table: '+table + ', cols:' + cols + ', row:' + row + ', cell:' + cell + ', rowID:' + rowID + ', colID:' + colID)
  log($scope.changeHistorycounter+' '+table+' Row: '+rowID+', Col: '+colID+' - '+cols[colID])
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
  log('#cCC: table: ' + table + ', row: ' + row + ', cell: ' +  cell + ', tblID: ' + tblID + ', rowID: ' + rowID + ', colID: ' + colID)
  // var y = row[0], x = cell, //cleanflag
  origin = $scope.changeHistory[$scope.changeHistory.length-1]

  if (cell != origin.cell) {
    // log('Texfield changed from "'+origin.cell+'" to "'+cell+'"')
    var postRow = row, keys = Object.keys(row)
    postRow[keys[colID]] = cell
    
    $scope.changeHistory[$scope.changeHistory.length-1] = {origin : origin, change : cell, tableID : tblID, rowID : rowID, postRow:postRow}
    log('\n$scope.changeHistory['+($scope.changeHistory.length-1)+']:');    log($scope.changeHistory[$scope.changeHistory.length-1])

    $( "#row"+tblID+rowID ).addClass( "fresh" );
    $( "#btnRow"+tblID+rowID ).show();

  }else{
     $scope.changeHistory.slice(0, -1)
  }

}



});


function log(a){console.log(a)}