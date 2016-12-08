
// Mustertabelle
var tables = [
  {
    tablename:'Tabellenname',
    columnames:['Spalte 1', 'Spalte 2', 'Spalte 3', ],
    rows:[
      ['Zelle A', 'Zelle B', 'Zelle C'],
      ['Zelle D', 'Zelle E', 'Zelle F'],
      ['Zelle G', 'Zelle H', 'Lange Zelle \nmit Zeilenumbruch']
    ]
  },
  {
    tablename:'Tabelle 2',
    columnames:['Lange Spalte ....................................', 'Spalte 2', 'Spalte 3', ],
    rows:[
      ['Zelle J', 'Zelle K', 'Zelle L'],
      ['Zelle M', 'Zelle N', 'Zelle O'],
      ['Zelle P', 'nächste Zelle leer','']
    ]
  },
  {
    tablename:'Tabelle 3',
    columnames:['Zahlenspalte', 'SQL-Injection', 'Sonderzeichen', '4. Spalte', ],
    rows:[
      [1, 'Select', '$', '8g76(/&G897gH=)(Zf9h98zf)(FZfz)FZU(9sfz8s9fz889f7zE(ZF(/FZz8=()FZ=8fz9(FZS)F(Z98f)(F9f8zF(fifgeuFHBE/'],
      [2, ';Select', '&', '8g76(/&G897gH=)(Zf9h98zf)(FZfz)FZU(9sfz8s9fz889f7zE(ZF(/FZz8=()FZ=8fz9(FZS)F(Z98f)(F9f8zF(fifgeuFHBE/'],
      [3, 'Or','§%/|#+*~', '8g76(/&G897gH=)(Zf9h98zf)(FZfz)FZU(9sfz8s9fz889f7zE(ZF(/FZz8=()FZ=8fz9(FZS)F(Z98f)(F9f8zF(fifgeuFHBE/']
    ]
  }
]



var app = angular.module("sampleApp", ["xeditable"])
app.run(function(editableOptions) {
  editableOptions.theme = 'bs2'; // bootstrap3 theme. Can be also 'bs2', 'default'
});
app.controller('sampleCtrl', function ($scope, $http) {

  $scope.historyLog = true

  $scope.tables = tables.map(function(table){
    //define a html-systax valid id-string
    table.htmlID = table.tablename.replace(/\s+/,'')
    //define additional Rows
    table.newRows = [[],[1,2,3]];
    $(tables[0].rows).each(function(){
      table.newRows[0].push('')
    })
    return table
  })

  $scope.tempdepartmentsData = {};

  $http.get(window.location.pathname, {
    params:{
      cmd: 'read_departments',
      paramJS: [{limit: 10, select: "*"}]
    },
    paramSerializer: '$httpParamSerializerJQLike'
  }).then(function(response){
    $scope.departments = response.data;
  });

  $scope.dept_manager = [];
  $scope.tempdept_managerData = {};

  $('#json-renderer').jsonViewer($scope.tables,{collapsed: true});
  $( document ).ready(function() {
    $( '#nav-'+$scope.tables[0].htmlID ).click()
  });

  // $('#json-renderer').jsonviewerer({a:1,b:{c:['d',1]}});

/*On click button 'create' send the new rows to the server*/
$scope.createRow = function (table){
 var body ={
      cmd : 'create_'+'employees',
      paramJS : table.newRows
    },
    url = '/~daniel/IPMS/create.php'

 log('POST an '+url)
 log(table.newRows)
  $http.post(url, body).then(log,log);
  log(body)

}

/*If there is a value in one of the cells in the last row
then add an empty row*/
$scope.addNewRow = function (table){
  var added = false, row = table.newRows[table.newRows.length -1]
  for (var i = 0; i < row.length; i++) {
    if (!added && (row[i]+'').length > 0) {
      var newLine = []
      added = true
      for (var colums = 0; colums < row.length; colums++) {
        newLine.push('')
      };
      table.newRows.push(newLine)
    }; 
  };
}

/*If cell content changed, protokoll the change*/
$scope.checkCellChange = function (table, row, cell, tblID, rowID, colID){
  // log('input: ');  log(table);   (row);  log(cell);
  // var y = row[0], x = cell, //cleanflag
  origin = $scope.changeHistory[$scope.changeHistory.length-1]
  // log(origin.cell);
  if (cell != origin.cell) {
    // log('Texfield changed from "'+origin.cell+'" to "'+cell+'"')
     $scope.changeHistory[$scope.changeHistory.length-1] = {origin : origin, change : cell}
    log($scope.changeHistory[$scope.changeHistory.length-1])
    $( "#row"+tblID+rowID ).addClass( "fresh" );
    $( "#btnRow"+tblID+rowID ).show();
    log('\ntblID')
    log(tblID)
    log(rowID)
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

/*Todo debug*/
$scope.update = function (){
  //Liste der Änderungen ist hist, result updateOrder
  var hist = $scope.changeHistory, updateOrder = []
  // gehe alle Änderungen durch
  for (var i = 0; i < hist.length; i++) {
    // Nimm Ursprungszeile als Basis
    var tmprow = hist[i].origin.row
    // log('hist: ')
    // log(hist)
    // log('hist['+i+']: '+JSON.stringify(hist[i]))

    // filter alle Änderungen zur aktuellen Basis
    var changesOfThisRow = hist.filter(function(change){
    log('change: '+JSON.stringify(change.origin.row))
    log('hist: '+JSON.stringify(hist[i].origin.row))
    if (hist[i].origin.row && change.origin.row) {};
      return hist[i].origin.row[0] == change.origin.row[0]
    })
    // ändere die Zellen in der Ursprungszeile die sich geändert haben
    for (var j = 0; j < changesOfThisRow.length; j++) {
      for (var k = 0; k < tmprow.length; k++) {
        if(tmprow[k] == changesOfThisRow[j].origin.cell){
          tmprow[k] = changesOfThisRow[j].change
        }
      };
    };  
    // return {Ursprungszeile, Ergebniszeile}
    updateOrder.push({from : hist[i].origin.row, to : tmprow})  
  };
  log('updateOrder:')
  log(updateOrder)
}

});


function log(a){console.log(a)}

// cleanflag
// $scope.replaceNotAlphanumeric = function (str){
//   var str=str+''
//   str=str.replace(/\W/g,'')
//   if (str.length < 1) {str = ''};
//   return str
// }
