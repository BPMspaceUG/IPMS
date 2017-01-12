
// Mustertabelle
var tables = tables

console.log('tables:')
console.log(tables)

var app = angular.module("sampleApp", ["xeditable"])
app.run(function(editableOptions) {
  editableOptions.theme = 'bs2'; // bootstrap3 theme. Can be also 'bs2', 'default'
});

app.controller('sampleCtrl', function ($scope, $http) {
  $scope.historyLog = true  
  $scope.tables = []

  tables.forEach(
      function(tbl) {
          // Request from server
          $http.get(window.location.pathname, {
            params:{
              cmd: 'read',
              paramJS: [{tablename: tbl.table_name, limit: 150, select: "*"}]
            },
            paramSerializer: '$httpParamSerializerJQLike'
          }).then(function(response){ 

            console.log("ResponseData: ", response.data);
            /*
            var rows = []
            response.data.forEach(
              function (X) {
                rows.push( Object.keys(response.data).map(function(key){ return response.data[key] }) )
              }
            )
            */
            
            //define additional Rows
            var newRows = [[]]
            if (response.data.length > 0) {
              Object.keys(response.data[0]).forEach( function(){newRows[newRows.length-1].push('')} )
            }
            
            $scope.tables.push({
              table_name: tbl.table_name,
              table_alias: tbl.table_alias,
              columnames: response.columnames,
              rows: response.data,
              newRows : newRows
            })

            
            // console.log('Table: ', $scope.tables.slice(-1))
            // open first table in navbar
            $('#nav-'+$scope.tables[0].table_name).click();
            // TODO: Platzhalter für Scope Texfelder generierung
            
            
          });
      }
    )

/*
  $('#json-renderer').jsonViewer($scope.tables,{collapsed: true});
*/


/*
Allround send for changes to DB
*/
$scope.send = function (cud, param){

 var body ={cmd : 'cud', paramJS : {}}

  log(cud+':')
  log(param)
  if (cud == 'create') {
    body.paramJS = {row:param.row, table:param.table.table_name}
    post(cud)
  }else if (cud == 'update') {
    // Todo: integriere hier $scope.update bzw. log->change bzw. origin
    body.paramJS = {row:param.row/*as shown on page*/, colum:param.colum/*0-x*/, table:param.table.table_name}
    post(cud)
  }else if (cud == 'delete') {
    body.paramJS = {id:param.colum, table:param.table.table_name}
    post(cud)
  }else{
    log('fail')
  }

  function post(){
    $http.post(window.location.pathname, {
        params:{
          cmd: cud,
          paramJS: body.paramJS
        },
        paramSerializer: '$httpParamSerializerJQLike'
      })
    .then(function(response){ 
      // console.log("ResponseData: ", response.data);
      $scope.lastResponse = response.data
      if (cud == 'delete' && response.data != 'fail') {
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

/*If cell content changed, protokoll the change*/
$scope.checkCellChange = function (table, row, cell, tblID, rowID, colID){

  // var y = row[0], x = cell, //cleanflag
  origin = $scope.changeHistory[$scope.changeHistory.length-1]

  if (cell != origin.cell) {
    // log('Texfield changed from "'+origin.cell+'" to "'+cell+'"')
     $scope.changeHistory[$scope.changeHistory.length-1] = {origin : origin, change : cell, tableID : tblID, rowID : rowID}
    log($scope.changeHistory[$scope.changeHistory.length-1])

    $( "#row"+tblID+rowID ).addClass( "fresh" );
    $( "#btnRow"+tblID+rowID ).show();

  }else{
     $scope.changeHistory.slice(0, -1)
  }

}

/*Protokoll where what changed*/
$scope.changeHistory = [], $scope.changeHistorycounter = 0
$scope.rememberOrigin = function (table, row, cell, rowID, colID){
  $scope.changeHistorycounter ++
  log($scope.changeHistorycounter+'   Row: '+rowID+', Col: '+colID)
  $scope.changeHistory.push({
   table : table,
   row : row,
   cell : cell,
   rowID : rowID,
   colID : colID,
   changeHistorycounter:$scope.changeHistorycounter
 })
}




// $scope.update = function (){
//   //Liste der Änderungen ist hist, result updateOrder
//   var hist =changeHistory= $scope.changeHistory, updateOrder = []
//   // gehe alle Änderungen durch
//   for (var i = 0; i < hist.length; i++) {
//     // Nimm Ursprungszeile als Basis
//     var tmprow = hist[i].origin.row
//     // log('hist: ')
//     // log(hist)
//     // log('hist['+i+']: '+JSON.stringify(hist[i]))

//     // filter alle Änderungen zur aktuellen Basis
//     var changesOfThisRow = hist.filter(function(change){
//     log('change: '+JSON.stringify(change.origin.row))
//     log('hist: '+JSON.stringify(hist[i].origin.row))
//     if (hist[i].origin.row && change.origin.row) {};
//       return hist[i].origin.row[0] == change.origin.row[0]
//     })
//     // ändere die Zellen in der Ursprungszeile die sich geändert haben
//     for (var j = 0; j < changesOfThisRow.length; j++) {
//       for (var k = 0; k < tmprow.length; k++) {
//         if(tmprow[k] == changesOfThisRow[j].origin.cell){
//           tmprow[k] = changesOfThisRow[j].change
//         }
//       };
//     };  
//     // return {Ursprungszeile, Ergebniszeile}
//     updateOrder.push({from : hist[i].origin.row, to : tmprow})  
//   };
//   log('updateOrder:')
//   log(updateOrder)
// }

});


function log(a){console.log(a)}